import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import {
  mapProfileToUser,
  mapSession,
  mapCreditTransaction,
  mapProfileToMentor,
  PROFILE_SELECT,
} from '@/lib/mappers';
import type {
  DbCreditTransaction,
  DbSession,
  MatchSuggestion,
  ProfileWithRelations,
} from '@/types';

/**
 * GET /api/dashboard
 * Oturum açmış kullanıcının dashboard verileri.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
  }

  const [profileRes, sessionsRes, creditsRes, notifsRes, mentorsRes] = await Promise.all([
    supabase.from('profiles').select(PROFILE_SELECT).eq('user_id', user.id).single(),
    supabase
      .from('sessions')
      .select('*, mentor:profiles!sessions_mentor_id_fkey(full_name, initials)')
      .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
      .in('status', ['pending', 'confirmed'])
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at')
      .limit(5),
    supabase
      .from('credit_transactions')
      .select('*, counterparty:profiles!credit_transactions_counterparty_id_fkey(full_name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('profiles')
      .select(`
        user_id, full_name, title, initials, rating, review_count,
        accepts_swap, profile_color, location, response_time,
        user_categories ( categories ( name ) ),
        user_skills ( skills ( skill_name ), can_teach )
      `)
      .in('role', ['mentor', 'both'])
      .eq('is_active', true)
      .neq('user_id', user.id)
      .order('rating', { ascending: false })
      .limit(5),
  ]);

  if (profileRes.error) {
    return NextResponse.json({ error: profileRes.error.message }, { status: 500 });
  }

  const profileData = profileRes.data as unknown as ProfileWithRelations;
  const currentUser = mapProfileToUser(profileData);
  const interests = profileData.learning_interests || [];

  const matchSuggestions: MatchSuggestion[] = (
    (mentorsRes.data || []) as unknown as ProfileWithRelations[]
  )
    .slice(0, 3)
    .map((m, i) => {
      const mentor = mapProfileToMentor(m);
      const shared = mentor.skills.filter((s) =>
        interests.some(
          (interest) =>
            interest.toLowerCase().includes(s.toLowerCase()) ||
            s.toLowerCase().includes(interest.toLowerCase())
        )
      );
      return {
        id: i + 1,
        mentor,
        matchScore: Math.min(95, 70 + Math.floor(Number(m.rating) * 5) + shared.length * 3),
        reason: shared.length
          ? `${shared[0]} ilginize uygun mentor`
          : `${mentor.title} alanında deneyimli mentor`,
        sharedInterests: shared.slice(0, 2),
        canSwap: mentor.acceptsSwap,
      };
    });

  return NextResponse.json({
    user: currentUser,
    upcomingLessons: ((sessionsRes.data || []) as DbSession[]).map((s) =>
      mapSession(s, s.mentor ?? null)
    ),
    creditHistory: ((creditsRes.data || []) as DbCreditTransaction[]).map((tx) =>
      mapCreditTransaction(tx, tx.counterparty ?? null)
    ),
    notifications: (notifsRes.data || []).map(
      (n: { notification_id: string; type: string; body: string; created_at: string; is_read: boolean }) => ({
        id: n.notification_id,
        type: n.type,
        text: n.body,
        time: n.created_at,
        read: n.is_read,
      })
    ),
    matchSuggestions,
  });
}

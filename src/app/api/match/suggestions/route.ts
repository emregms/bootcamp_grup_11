import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { mapProfileToMentor, MENTOR_SELECT } from '@/lib/mappers';
import type { DbSwapGroup, MatchSuggestion, ProfileWithRelations, SwapGroup } from '@/types';

/**
 * GET /api/match/suggestions
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let interests = ['Machine Learning', 'UI/UX Design', 'Gitar'];

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('learning_interests')
      .eq('user_id', user.id)
      .single();
    if (profile?.learning_interests?.length) {
      interests = profile.learning_interests;
    }
  }

  const { data: mentors, error } = await supabase
    .from('profiles')
    .select(MENTOR_SELECT)
    .in('role', ['mentor', 'both'])
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .limit(8);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const suggestions: MatchSuggestion[] = ((mentors || []) as unknown as ProfileWithRelations[])
    .map((m, i) => {
      const mentor = mapProfileToMentor(m);
      const shared = mentor.skills.filter((s) =>
        interests.some(
          (interest) =>
            interest.toLowerCase().includes(s.toLowerCase()) ||
            s.toLowerCase().includes(interest.toLowerCase()) ||
            mentor.categories.some((c) => c.toLowerCase().includes(interest.toLowerCase()))
        )
      );
      return {
        id: i + 1,
        mentor,
        matchScore: Math.min(
          98,
          65 + Math.floor(Number(m.rating) * 6) + shared.length * 4 + (m.top_mentor ? 5 : 0)
        ),
        reason: shared.length
          ? `${shared[0]} öğrenme ilginizle yüksek uyum`
          : `${mentor.categories[0] || 'Beceri'} alanında deneyimli mentor`,
        sharedInterests: shared.slice(0, 2).length
          ? shared.slice(0, 2)
          : mentor.categories.slice(0, 1),
        canSwap: mentor.acceptsSwap,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  const { data: swapGroups } = await supabase
    .from('swap_groups')
    .select('*')
    .eq('is_active', true)
    .order('next_session_at');

  const groupsWithCounts: SwapGroup[] = await Promise.all(
    ((swapGroups || []) as DbSwapGroup[]).map(async (g) => {
      const { count } = await supabase
        .from('swap_group_participants')
        .select('*', { count: 'exact', head: true })
        .eq('swap_group_id', g.swap_group_id);
      return {
        id: g.swap_group_id,
        name: g.name,
        description: g.description,
        participants: count || 0,
        maxParticipants: g.max_participants,
        duration: g.duration_minutes,
        nextSession: g.next_session_at,
        skills: g.skills || [],
        active: g.is_active,
      };
    })
  );

  return NextResponse.json({ suggestions, swapGroups: groupsWithCounts });
}

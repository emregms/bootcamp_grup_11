import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { mapProfileToMentor, mapCategory, MENTOR_SELECT } from '@/lib/mappers';
import type { DbCategory, PlatformStats, ProfileWithRelations } from '@/types';

/**
 * GET /api/stats — Platform istatistikleri + ana sayfa verileri
 */
export async function GET() {
  const supabase = await createClient();

  const [profilesCount, lessonsCount, sessionsCount, mentorsCount, categoriesRes, topMentorsRes] =
    await Promise.all([
      supabase.from('profiles').select('user_id', { count: 'exact', head: true }),
      supabase
        .from('lessons')
        .select('lesson_id', { count: 'exact', head: true })
        .eq('is_published', true),
      supabase
        .from('sessions')
        .select('session_id', { count: 'exact', head: true })
        .eq('payment_type', 'swap'),
      supabase
        .from('profiles')
        .select('user_id', { count: 'exact', head: true })
        .in('role', ['mentor', 'both']),
      supabase.from('categories').select('*').eq('is_active', true).order('name'),
      supabase
        .from('profiles')
        .select(MENTOR_SELECT)
        .in('role', ['mentor', 'both'])
        .eq('top_mentor', true)
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(4),
    ]);

  const categories = await Promise.all(
    ((categoriesRes.data || []) as DbCategory[]).map(async (cat) => {
      const { count } = await supabase
        .from('user_categories')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.category_id);
      return mapCategory(cat, count || 0);
    })
  );

  const stats: PlatformStats = {
    totalUsers: profilesCount.count || 0,
    totalLessons: lessonsCount.count || 0,
    totalSwaps: sessionsCount.count || 0,
    totalMentors: mentorsCount.count || 0,
    averageRating: 4.8,
    countriesReached: 12,
  };

  return NextResponse.json({
    stats,
    categories,
    featuredMentors: ((topMentorsRes.data || []) as unknown as ProfileWithRelations[]).map(
      mapProfileToMentor
    ),
  });
}

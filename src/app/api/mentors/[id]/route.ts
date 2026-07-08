import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { mapProfileToMentor, mapLesson, mapReview, MENTOR_SELECT } from '@/lib/mappers';
import type { DbLesson, DbReview, ProfileWithRelations } from '@/types';

/**
 * GET /api/mentors/[id]
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/mentors/[id]'>
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(MENTOR_SELECT)
    .eq('user_id', id)
    .single();

  if (error || !profile) {
    return NextResponse.json({ error: 'Mentor bulunamadı' }, { status: 404 });
  }

  const [lessonsRes, reviewsRes] = await Promise.all([
    supabase
      .from('lessons')
      .select('*')
      .eq('mentor_id', id)
      .eq('is_published', true)
      .order('rating', { ascending: false }),
    supabase
      .from('reviews')
      .select('*, reviewer:profiles!reviews_reviewer_id_fkey(full_name, initials)')
      .eq('mentor_id', id)
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  return NextResponse.json({
    mentor: mapProfileToMentor(profile as unknown as ProfileWithRelations),
    lessons: ((lessonsRes.data || []) as DbLesson[]).map((l) => mapLesson(l)),
    reviews: ((reviewsRes.data || []) as DbReview[]).map(mapReview),
  });
}

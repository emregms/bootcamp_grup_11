import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { mapLesson, mapProfileToMentor, mapReview, MENTOR_SELECT } from '@/lib/mappers';
import type { DbLesson, DbReview, ProfileWithRelations } from '@/types';

/**
 * GET /api/lessons/[id]
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/lessons/[id]'>
) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: lesson, error } = await supabase
    .from('lessons')
    .select(`
      *,
      mentor:profiles!lessons_mentor_id_fkey(${MENTOR_SELECT.replace(/\n/g, ' ')})
    `)
    .eq('lesson_id', id)
    .single();

  if (error || !lesson) {
    return NextResponse.json({ error: 'Ders bulunamadı' }, { status: 404 });
  }

  const lessonData = lesson as unknown as DbLesson & { mentor?: ProfileWithRelations | null };

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviews_reviewer_id_fkey(full_name, initials)')
    .eq('lesson_id', id)
    .order('created_at', { ascending: false })
    .limit(10);

  return NextResponse.json({
    lesson: mapLesson(lessonData, lessonData.mentor ?? null),
    mentor: lessonData.mentor ? mapProfileToMentor(lessonData.mentor) : null,
    reviews: ((reviews || []) as DbReview[]).map(mapReview),
  });
}

import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { mapLesson, MENTOR_SELECT } from '@/lib/mappers';
import { getCategoryStockImage } from '@/lib/stock-images';
import type { DbLesson, ProfileWithRelations } from '@/types';

interface CreateLessonBody {
  title: string;
  description?: string;
  category_name: string;
  duration_minutes?: number;
  price_credits?: number;
  swap_credits?: number;
  level?: string;
  cover_image_url?: string;
  tags?: string[];
  accepts_swap?: boolean;
}

/**
 * GET /api/lessons
 * POST /api/lessons — Yeni hizmet/ders oluştur
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mentorId = searchParams.get('mentorId');
  const category = searchParams.get('category');
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

  const supabase = await createClient();

  let query = supabase
    .from('lessons')
    .select(`
      *,
      mentor:profiles!lessons_mentor_id_fkey(${MENTOR_SELECT.replace(/\n/g, ' ')})
    `)
    .eq('is_published', true)
    .order('rating', { ascending: false })
    .limit(limit);

  if (mentorId) query = query.eq('mentor_id', mentorId);
  if (category) query = query.ilike('category_name', `%${category}%`);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const lessons = (
    (data || []) as unknown as (DbLesson & { mentor?: ProfileWithRelations | null })[]
  ).map((l) => mapLesson(l, l.mentor ?? null));

  return NextResponse.json({ lessons, count: lessons.length });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
  }

  const body = (await request.json()) as CreateLessonBody;

  if (!body.title?.trim() || !body.category_name?.trim()) {
    return NextResponse.json({ error: 'Başlık ve kategori zorunlu' }, { status: 400 });
  }

  const categoryName = body.category_name.trim();
  const coverUrl = body.cover_image_url?.trim() || getCategoryStockImage(categoryName);

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      mentor_id: user.id,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      category_name: categoryName,
      duration_minutes: body.duration_minutes ?? 60,
      price_credits: body.price_credits ?? 100,
      swap_credits: body.swap_credits ?? 2,
      accepts_swap: body.accepts_swap ?? true,
      level: body.level ?? 'Başlangıç',
      cover_image_url: coverUrl,
      tags: body.tags ?? [],
      is_published: true,
    })
    .select(`
      *,
      mentor:profiles!lessons_mentor_id_fkey(${MENTOR_SELECT.replace(/\n/g, ' ')})
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = data as unknown as DbLesson & { mentor?: ProfileWithRelations | null };
  return NextResponse.json({ lesson: mapLesson(row, row.mentor ?? null) }, { status: 201 });
}

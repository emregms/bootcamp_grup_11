import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { mapProfileToMentor, MENTOR_SELECT } from '@/lib/mappers';
import type { ProfileWithRelations } from '@/types';

/**
 * GET /api/mentors
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const acceptsSwap = searchParams.get('acceptsSwap');
  const limit = Math.min(Number(searchParams.get('limit')) || 50, 50);

  const supabase = await createClient();

  let query = supabase
    .from('profiles')
    .select(MENTOR_SELECT)
    .in('role', ['mentor', 'both'])
    .eq('is_active', true)
    .order('rating', { ascending: false })
    .limit(limit);

  if (acceptsSwap === 'true') {
    query = query.eq('accepts_swap', true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let mentors = ((data || []) as unknown as ProfileWithRelations[]).map(mapProfileToMentor);

  if (category) {
    mentors = mentors.filter((m) =>
      m.categories.some((c) => c.toLowerCase().includes(category.toLowerCase()))
    );
  }

  return NextResponse.json({ mentors, count: mentors.length });
}

import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { mapCategory } from '@/lib/mappers';
import type { DbCategory } from '@/types';

/**
 * GET /api/categories
 */
export async function GET() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const result = await Promise.all(
    ((categories || []) as DbCategory[]).map(async (cat) => {
      const { count } = await supabase
        .from('user_categories')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', cat.category_id);
      return mapCategory(cat, count || 0);
    })
  );

  return NextResponse.json({ categories: result });
}

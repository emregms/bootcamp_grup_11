import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { mapNotification } from '@/lib/mappers';
import type { DbNotification } from '@/types';

/**
 * GET /api/notifications
 * PATCH /api/notifications — tümünü okundu işaretle
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ notifications: [] });
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    notifications: ((data || []) as DbNotification[]).map(mapNotification),
  });
}

export async function PATCH() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
  }

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  return NextResponse.json({ success: true });
}

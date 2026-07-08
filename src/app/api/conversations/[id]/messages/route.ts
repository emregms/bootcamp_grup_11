import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { mapMessage } from '@/lib/mappers';
import type { DbMessage } from '@/types';

interface SendMessageBody {
  body: string;
}

/**
 * GET /api/conversations/[id]/messages
 * POST /api/conversations/[id]/messages
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/conversations/[id]/messages'>
) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    messages: ((data || []) as DbMessage[]).map((m) => mapMessage(m, user.id)),
  });
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/conversations/[id]/messages'>
) {
  const { id } = await ctx.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
  }

  const { body } = (await request.json()) as SendMessageBody;

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: id,
      sender_id: user.id,
      body,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: mapMessage(data as DbMessage, user.id) });
}

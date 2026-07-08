import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { mapConversation } from '@/lib/mappers';
import type { DbConversationParticipant, DbMessage } from '@/types';

interface CreateConversationBody {
  participantId: string;
}

/**
 * GET /api/conversations
 * POST /api/conversations — yeni konuşma başlat
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
  }

  const { data: participations, error } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const convIds = (participations || []).map(
    (p: { conversation_id: string }) => p.conversation_id
  );
  if (!convIds.length) {
    return NextResponse.json({ conversations: [] });
  }

  const conversations = await Promise.all(
    convIds.map(async (convId: string) => {
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select(
          'user_id, profile:profiles!conversation_participants_user_id_fkey(user_id, full_name, initials)'
        )
        .eq('conversation_id', convId);

      const { data: lastMessage } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: false })
        .limit(1);

      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', convId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      return mapConversation(
        {
          conversation_id: convId,
          participants: (
            (participants || []) as unknown as DbConversationParticipant[]
          ).map((p) => ({
            user_id: p.user_id,
            profile: p.profile,
          })),
          last_message: (lastMessage || []) as DbMessage[],
          unread_count: unreadCount || 0,
        },
        user.id
      );
    })
  );

  return NextResponse.json({ conversations });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
  }

  const { participantId } = (await request.json()) as CreateConversationBody;

  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .insert({ type: 'direct' })
    .select()
    .single();

  if (convError) {
    return NextResponse.json({ error: convError.message }, { status: 500 });
  }

  await supabase.from('conversation_participants').insert([
    { conversation_id: conv.conversation_id, user_id: user.id },
    { conversation_id: conv.conversation_id, user_id: participantId },
  ]);

  return NextResponse.json({ conversationId: conv.conversation_id });
}

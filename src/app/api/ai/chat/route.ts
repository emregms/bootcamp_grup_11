import { NextResponse, type NextRequest } from 'next/server';
import { chatWithAssistant } from '@/lib/gemini';
import type { AiChatMessage } from '@/types';

interface ChatRequestBody {
  messages: AiChatMessage[];
}

/**
 * POST /api/ai/chat
 * SkillBridge AI asistan (Gemini)
 */
export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as ChatRequestBody;

    if (!messages?.length) {
      return NextResponse.json({ error: 'Mesaj gerekli' }, { status: 400 });
    }

    const { reply, source } = await chatWithAssistant(messages);

    return NextResponse.json({
      reply,
      poweredBy: source,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI yanıt hatası';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

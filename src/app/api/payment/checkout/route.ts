import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import type { DbLesson } from '@/types';

interface CheckoutRequestBody {
  lessonId: string;
  amount: number;
  method?: string;
}

/**
 * POST /api/payment/checkout
 * GET /api/payment/checkout
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
    }

    const { lessonId, amount, method = 'card' } = (await request.json()) as CheckoutRequestBody;

    const { data: lesson } = await supabase
      .from('lessons')
      .select('*, mentor:profiles!lessons_mentor_id_fkey(full_name)')
      .eq('lesson_id', lessonId)
      .single();

    if (!lesson) {
      return NextResponse.json({ error: 'Ders bulunamadı' }, { status: 404 });
    }

    const lessonData = lesson as DbLesson & { mentor?: { full_name: string } | null };
    const transactionId = `SB-TXN-${Date.now()}`;
    const commission = Math.round(amount * 0.05);
    const total = amount + commission;
    const scheduledAt =
      lessonData.next_session_at || new Date(Date.now() + 7 * 86400000).toISOString();

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        lesson_id: lessonId,
        mentor_id: lessonData.mentor_id,
        mentee_id: user.id,
        title: lessonData.title,
        scheduled_at: scheduledAt,
        duration_minutes: lessonData.duration_minutes,
        payment_type: 'paid',
        status: 'confirmed',
        credits_amount: 0,
        meet_link: `https://meet.google.com/sb-${transactionId.slice(-8)}`,
        notes: `Havuz: ${transactionId} | Tutar: ₺${total} | Yöntem: ${method}`,
      })
      .select()
      .single();

    if (sessionError && !sessionError.message.includes('duplicate')) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    await supabase.from('lesson_enrollments').upsert(
      {
        lesson_id: lessonId,
        mentee_id: user.id,
        payment_type: 'paid',
        status: 'confirmed',
        credits_reserved: 0,
      },
      { onConflict: 'lesson_id,mentee_id' }
    );

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'lesson',
      body: `₺${total} ödemeniz havuzda güvende. "${lessonData.title}" dersi onaylandı.`,
    });

    return NextResponse.json({
      success: true,
      transactionId,
      amount: total,
      commission,
      status: 'escrow',
      session,
      mentorName: lessonData.mentor?.full_name || 'Mentor',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ödeme hatası';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get('lesson');

  if (!lessonId) {
    return NextResponse.json({ error: 'lesson parametresi gerekli' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { data: lesson } = await supabase
      .from('lessons')
      .select('*, mentor:profiles!lessons_mentor_id_fkey(full_name)')
      .eq('lesson_id', lessonId)
      .single();

    if (!lesson) {
      return NextResponse.json({ error: 'Ders bulunamadı' }, { status: 404 });
    }

    const lessonData = lesson as DbLesson & { mentor?: { full_name: string } | null };
    const amount = lessonData.price_credits;
    const commission = Math.round(amount * 0.05);

    return NextResponse.json({
      lesson: {
        id: lessonData.lesson_id,
        title: lessonData.title,
        mentor: lessonData.mentor?.full_name,
        duration: lessonData.duration_minutes,
        date: lessonData.next_session_at,
        amount,
        commission,
        total: amount + commission,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Ödeme bilgisi alınamadı';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

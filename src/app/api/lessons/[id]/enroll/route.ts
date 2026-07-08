import { createClient, createServiceClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import type { DbLesson, SessionPaymentType } from '@/types';

interface EnrollRequestBody {
  paymentType?: SessionPaymentType;
}

/**
 * POST /api/lessons/[id]/enroll
 * Derse kayıt — takas veya ücretli
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/lessons/[id]/enroll'>
) {
  const { id: lessonId } = await ctx.params;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
    }

    const { paymentType = 'swap' } = (await request.json()) as EnrollRequestBody;

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('lesson_id', lessonId)
      .single();

    if (lessonError || !lesson) {
      return NextResponse.json({ error: 'Ders bulunamadı' }, { status: 404 });
    }

    const lessonData = lesson as DbLesson;
    const creditsNeeded = paymentType === 'swap' ? lessonData.swap_credits : 0;

    if (paymentType === 'swap') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('credit_balance')
        .eq('user_id', user.id)
        .single();

      if ((profile?.credit_balance || 0) < creditsNeeded) {
        return NextResponse.json({ error: 'Yetersiz kredi bakiyesi' }, { status: 400 });
      }
    }

    const { data: enrollment, error: enrollError } = await supabase
      .from('lesson_enrollments')
      .insert({
        lesson_id: lessonId,
        mentee_id: user.id,
        payment_type: paymentType,
        status: paymentType === 'paid' ? 'pending' : 'confirmed',
        credits_reserved: creditsNeeded,
      })
      .select()
      .single();

    if (enrollError) {
      if (enrollError.code === '23505') {
        return NextResponse.json({ error: 'Bu derse zaten kayıtlısınız' }, { status: 409 });
      }
      return NextResponse.json({ error: enrollError.message }, { status: 500 });
    }

    const scheduledAt =
      lessonData.next_session_at || new Date(Date.now() + 7 * 86400000).toISOString();

    const { data: session } = await supabase
      .from('sessions')
      .insert({
        lesson_id: lessonId,
        mentor_id: lessonData.mentor_id,
        mentee_id: user.id,
        title: lessonData.title,
        scheduled_at: scheduledAt,
        duration_minutes: lessonData.duration_minutes,
        payment_type: paymentType,
        status: paymentType === 'paid' ? 'pending' : 'confirmed',
        credits_amount: creditsNeeded,
        meet_link:
          paymentType !== 'paid'
            ? `https://meet.google.com/sb-${lessonId.slice(0, 8)}`
            : null,
      })
      .select()
      .single();

    if (paymentType === 'swap' && creditsNeeded > 0) {
      const rpcParams = {
        p_user_id: user.id,
        p_type: 'spent',
        p_amount: creditsNeeded,
        p_description: `Ders kaydı: ${lessonData.title}`,
        p_counterparty_id: lessonData.mentor_id,
        p_session_id: session?.session_id || null,
      };

      try {
        const service = createServiceClient();
        await service.rpc('apply_credit_transaction', rpcParams);
      } catch {
        await supabase.rpc('apply_credit_transaction', rpcParams);
      }
    }

    await supabase.from('notifications').insert([
      {
        user_id: user.id,
        type: 'lesson',
        body: `"${lessonData.title}" dersine kaydoldunuz.`,
      },
      {
        user_id: lessonData.mentor_id,
        type: 'lesson',
        body: `Yeni öğrenci dersinize kayıt oldu: ${lessonData.title}`,
      },
    ]);

    return NextResponse.json({
      success: true,
      enrollment,
      session,
      redirectUrl: paymentType === 'paid' ? `/payment?lesson=${lessonId}` : '/dashboard',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Kayıt hatası';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

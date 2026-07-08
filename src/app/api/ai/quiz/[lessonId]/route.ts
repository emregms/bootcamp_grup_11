import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { generateQuizQuestions } from '@/lib/gemini';
import type { DbCertificate, DbLesson, DbQuizQuestion, QuizQuestion } from '@/types';

const FALLBACK_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Etkili öğrenme için en iyi yaklaşım hangisidir?',
    options: ['Sadece video izlemek', 'Pratik yaparak uygulamak', 'Sadece okumak', 'Kopyalamak'],
    correct: 1,
    explanation: 'Aktif pratik öğrenmeyi pekiştirir.',
  },
  {
    id: 2,
    question: 'SkillBridge takas modelinde ders vermek size ne kazandırır?',
    options: ['Para', 'Kredi', 'Sadece rozet', 'Hiçbir şey'],
    correct: 1,
    explanation: 'Verdiğiniz ders karşılığında kredi kazanırsınız.',
  },
  {
    id: 3,
    question: 'Mentorluk seansında en önemli unsur nedir?',
    options: ['Süre uzunluğu', 'Karşılıklı iletişim ve geri bildirim', 'Sadece teori', 'Sertifika'],
    correct: 1,
    explanation: 'Etkileşimli iletişim öğrenmeyi hızlandırır.',
  },
];

/**
 * GET /api/ai/quiz/[lessonId] — Quiz sorularını getir (DB veya Gemini)
 */
export async function GET(
  _request: NextRequest,
  ctx: RouteContext<'/api/ai/quiz/[lessonId]'>
) {
  const { lessonId } = await ctx.params;

  try {
    const supabase = await createClient();

    const { data: dbQuestions } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('lesson_id', lessonId)
      .limit(10);

    if (dbQuestions?.length) {
      return NextResponse.json({
        questions: (dbQuestions as DbQuizQuestion[]).map((q) => ({
          id: q.question_id,
          question: q.question,
          options: q.options,
          correct: q.correct_index,
          explanation: q.explanation,
        })),
        source: 'database',
      });
    }

    const { data: lesson } = await supabase
      .from('lessons')
      .select('title, category_name')
      .eq('lesson_id', lessonId)
      .single();

    const title = lesson?.title || 'Genel Beceri';
    const category = lesson?.category_name || 'Eğitim';

    const questions = await generateQuizQuestions(title, category, 5);

    return NextResponse.json({ questions, source: 'gemini', lessonTitle: title });
  } catch {
    return NextResponse.json({
      questions: FALLBACK_QUESTIONS,
      source: 'fallback',
      lessonTitle: 'Sertifika Sınavı',
    });
  }
}

interface CompleteQuizBody {
  score: number;
  answers?: unknown[];
  lessonTitle?: string;
}

/**
 * POST /api/ai/quiz/[lessonId] — Quiz tamamla, sertifika oluştur
 */
export async function POST(
  request: NextRequest,
  ctx: RouteContext<'/api/ai/quiz/[lessonId]'>
) {
  const { lessonId } = await ctx.params;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
    }

    const { score, answers, lessonTitle } = (await request.json()) as CompleteQuizBody;

    const { data: lesson } = await supabase
      .from('lessons')
      .select('*, mentor:profiles!lessons_mentor_id_fkey(full_name)')
      .eq('lesson_id', lessonId)
      .single();

    await supabase.from('quiz_attempts').insert({
      user_id: user.id,
      lesson_id: lessonId,
      score,
      answers: answers || [],
    });

    let certificate: DbCertificate | null = null;
    const lessonData = lesson as DbLesson | null;

    if (score >= 70 && lessonData) {
      const credentialId = `SB-CERT-${Date.now()}`;
      const { data: cert } = await supabase
        .from('certificates')
        .insert({
          user_id: user.id,
          issuer_id: lessonData.mentor_id,
          title: `${lessonData.title} Sertifikası`,
          category_name: lessonData.category_name,
          score,
          credential_id: credentialId,
          skills: lessonData.tags || [],
          color: '#6C5CE7',
        })
        .select()
        .single();

      certificate = cert as DbCertificate;

      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'certificate',
        body: `🎓 "${lessonData.title}" sertifikanız hazır!`,
      });

      await supabase.from('user_badges').upsert(
        { user_id: user.id, badge_id: 1 },
        { onConflict: 'user_id,badge_id', ignoreDuplicates: true }
      );
    }

    return NextResponse.json({
      success: true,
      passed: score >= 70,
      score,
      certificate,
      lessonTitle: lessonTitle || lessonData?.title,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Quiz tamamlanamadı';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

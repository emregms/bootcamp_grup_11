import { explainQuizAnswer, isGeminiConfigured } from '@/lib/gemini';
import { NextResponse, type NextRequest } from 'next/server';
import type { QuizQuestion } from '@/types';

interface QuizFeedbackBody {
  question: QuizQuestion;
  selectedIndex: number;
  isCorrect: boolean;
}

/**
 * POST /api/ai/quiz/[lessonId]/feedback
 */
export async function POST(request: NextRequest) {
  try {
    const { question, selectedIndex, isCorrect } =
      (await request.json()) as QuizFeedbackBody;
    const userAnswer = question.options[selectedIndex];

    if (isGeminiConfigured()) {
      const feedback = await explainQuizAnswer(question, userAnswer, isCorrect);
      return NextResponse.json({ feedback });
    }

    const feedback = isCorrect
      ? `✅ Doğru! ${question.explanation}`
      : `❌ Yanlış. Doğru cevap: "${question.options[question.correct]}". ${question.explanation}`;

    return NextResponse.json({ feedback });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Geri bildirim hatası';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

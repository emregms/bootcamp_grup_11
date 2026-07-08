import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import type { AiChatMessage, QuizQuestion } from '@/types/models';
import type { DbGeminiQuizQuestion } from '@/types/database';

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your-'));
}

function getModel(systemInstruction: string): GenerativeModel | null {
  if (!isGeminiConfigured() || !process.env.GEMINI_API_KEY) return null;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({
    model: DEFAULT_MODEL,
    systemInstruction,
  });
}

const PLATFORM_ASSISTANT_PROMPT = `Sen SkillBridge platformunun Türkçe konuşan AI asistanısın.
SkillBridge, C2C mentorluk ve beceri takası platformudur.

Platform özellikleri:
- Keşfet (/explore): Mentorları bul
- Eşleşme (/match): AI ile mentor eşleştirme ve takas grupları
- Dashboard (/dashboard): Kredi, dersler, bildirimler
- Chat (/chat): Mentorlarla mesajlaşma
- Takas: Kredi ile ders al/ver, para harcamadan beceri takası
- Sertifikalar (/certificates): Ders sonrası quiz ile sertifika
- Quiz: AI destekli chat quiz ile değerlendirme
- Ödeme (/payment): Havuz sistemi ile güvenli ödeme

Kurallar:
- Kısa, net, samimi Türkçe yanıt ver (max 3-4 cümle)
- Platform navigasyonunda yardımcı ol, link öner
- Demo giriş: demo@skillbridge.com / Demo123!
- Bilmediğin teknik detaylarda "Destek ekibimize ulaşın" de
- Asla uydurma fiyat veya garanti verme`;

const QUIZ_GENERATOR_PROMPT = `Sen eğitim değerlendirme uzmanısın. Verilen ders konusu için Türkçe çoktan seçmeli sorular üret.
Yanıtı YALNIZCA geçerli JSON array olarak ver, başka metin ekleme.
Format:
[
  {
    "question": "soru metni",
    "options": ["A şıkkı", "B şıkkı", "C şıkkı", "D şıkkı"],
    "correct": 0,
    "explanation": "kısa açıklama"
  }
]
correct: 0-3 arası doğru şık indeksi.`;

type GeminiHistoryRole = 'user' | 'model';
type GeminiHistoryEntry = { role: GeminiHistoryRole; parts: [{ text: string }] };

/** Gemini geçmişi user ile başlamalı ve user/model dönüşümlü olmalı. */
function buildGeminiHistory(messages: AiChatMessage[]): GeminiHistoryEntry[] {
  const mapped: GeminiHistoryEntry[] = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  // Karşılama bot mesajı vb. — baştaki model mesajlarını at
  let start = 0;
  while (start < mapped.length && mapped[start].role === 'model') {
    start += 1;
  }

  const trimmed = mapped.slice(start);
  const normalized: GeminiHistoryEntry[] = [];

  for (const entry of trimmed) {
    const prev = normalized[normalized.length - 1];
    if (prev && prev.role === entry.role) {
      // Ardışık aynı rol — metinleri birleştir
      prev.parts[0].text = `${prev.parts[0].text}\n${entry.parts[0].text}`;
    } else {
      normalized.push({ ...entry, parts: [{ text: entry.parts[0].text }] });
    }
  }

  return normalized;
}

export interface AiAssistantResult {
  reply: string;
  source: 'gemini' | 'fallback';
}

export async function chatWithAssistant(messages: AiChatMessage[]): Promise<AiAssistantResult> {
  const model = getModel(PLATFORM_ASSISTANT_PROMPT);
  if (!model) {
    return { reply: getFallbackChatResponse(messages), source: 'fallback' };
  }

  try {
    const history = buildGeminiHistory(messages);
    const lastMessage = messages[messages.length - 1]?.content || '';

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    return { reply: result.response.text(), source: 'gemini' };
  } catch (err) {
    console.warn('[Gemini] chat fallback:', err instanceof Error ? err.message : err);
    return { reply: getFallbackChatResponse(messages), source: 'fallback' };
  }
}

export async function generateQuizQuestions(
  lessonTitle: string,
  category: string,
  count = 5
): Promise<QuizQuestion[]> {
  const model = getModel(QUIZ_GENERATOR_PROMPT);
  if (!model) {
    return getFallbackQuizQuestions(lessonTitle, count);
  }

  try {
    const prompt = `"${lessonTitle}" (${category}) konusu için ${count} adet orta zorlukta çoktan seçmeli soru üret.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text) as DbGeminiQuizQuestion[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, count).map(normalizeQuestion);
      }
    } catch {
      // JSON parse fallback
    }
  } catch (err) {
    console.warn('[Gemini] quiz fallback:', err instanceof Error ? err.message : err);
  }

  return getFallbackQuizQuestions(lessonTitle, count);
}

export async function explainQuizAnswer(
  question: QuizQuestion,
  userAnswer: string,
  isCorrect: boolean
): Promise<string> {
  const model = getModel('Kısa Türkçe quiz geri bildirimi ver. 1-2 cümle.');
  if (!model) {
    return isCorrect
      ? `✅ Doğru! ${question.explanation}`
      : `❌ Yanlış. Doğru cevap: "${question.options[question.correct]}". ${question.explanation}`;
  }

  try {
    const prompt = `Soru: ${question.question}
Kullanıcı cevabı: ${userAnswer}
Doğru mu: ${isCorrect ? 'Evet' : 'Hayır'}
Doğru cevap: ${question.options[question.correct]}
Kısa geri bildirim yaz (emoji ile başla).`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    console.warn('[Gemini] feedback fallback:', err instanceof Error ? err.message : err);
    return isCorrect
      ? `✅ Doğru! ${question.explanation}`
      : `❌ Yanlış. Doğru cevap: "${question.options[question.correct]}". ${question.explanation}`;
  }
}

function normalizeQuestion(q: DbGeminiQuizQuestion, index: number): QuizQuestion {
  return {
    id: index + 1,
    question: q.question,
    options: q.options.slice(0, 4),
    correct: Math.min(Math.max(Number(q.correct) || 0, 0), 3),
    explanation: q.explanation || '',
  };
}

function getFallbackChatResponse(messages: AiChatMessage[]): string {
  const last = (messages[messages.length - 1]?.content || '').toLowerCase();

  if (last.includes('takas') || last.includes('kredi')) {
    return "Takas sistemiyle ders vererek kredi kazanırsınız, bu kredilerle başka dersler alabilirsiniz. Dashboard'dan kredi bakiyenizi görebilirsiniz. 💰";
  }
  if (last.includes('mentor') || last.includes('keşfet')) {
    return 'Keşfet sayfasından (/explore) alanında uzman mentorları filtreleyebilirsiniz. Eşleşme sayfası AI önerileri de sunar! 🔍';
  }
  if (last.includes('sertifika') || last.includes('quiz')) {
    return 'Ders tamamlandıktan sonra quiz sayfasından AI destekli sınavı geçerek sertifika alabilirsiniz. Geçer puan: 70. 📜';
  }
  if (last.includes('giriş') || last.includes('kayıt')) {
    return 'Demo hesap: demo@skillbridge.com / Demo123! Auth sayfasından giriş yapabilirsiniz. 🔐';
  }
  return 'Merhaba! SkillBridge asistanıyım. Mentor bulma, takas, kredi, sertifika veya ödeme hakkında sorabilirsiniz. 😊';
}

function getFallbackQuizQuestions(lessonTitle: string, count: number): QuizQuestion[] {
  const base: QuizQuestion[] = [
    {
      id: 1,
      question: `${lessonTitle} konusunda temel kavramları öğrenmek neden önemlidir?`,
      options: ['Sadece sertifika için', 'Pratik beceri ve kariyer gelişimi için', 'Zorunlu değil', 'Sadece teorik bilgi'],
      correct: 1,
      explanation: 'Temel kavramlar pratik uygulama ve kariyer için gereklidir.',
    },
    {
      id: 2,
      question: 'SkillBridge takas modelinde ders vermek size ne kazandırır?',
      options: ['Para', 'Kredi', 'Rozet only', 'Hiçbir şey'],
      correct: 1,
      explanation: 'Verdiğiniz ders karşılığında kredi kazanırsınız.',
    },
    {
      id: 3,
      question: 'Etkili öğrenme için en iyi yaklaşım hangisidir?',
      options: ['Sadece video izlemek', 'Pratik yaparak uygulamak', 'Sadece okumak', 'Kopyalamak'],
      correct: 1,
      explanation: 'Aktif pratik öğrenmeyi pekiştirir.',
    },
  ];
  return base.slice(0, count);
}

import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';
import type { AiChatMessage, QuizQuestion } from '@/types/models';
import type { DbGeminiQuizQuestion } from '@/types/database';
import { getGeminiModel, isGeminiConfigured, isGeminiFallbackForced } from '@/lib/env';

/** 429 kota hatası sonrası Gemini'yi geçici atla (ms) */
let quotaBlockedUntil = 0;

function isQuotaBlocked(): boolean {
  return Date.now() < quotaBlockedUntil;
}

function markQuotaBlocked(err: unknown): void {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('429') || msg.includes('quota') || msg.includes('Quota exceeded')) {
    quotaBlockedUntil = Date.now() + 10 * 60 * 1000; // 10 dk
  }
}

function shouldSkipGemini(): boolean {
  return isGeminiFallbackForced() || isQuotaBlocked() || !isGeminiConfigured();
}

function getModel(systemInstruction: string): GenerativeModel | null {
  if (shouldSkipGemini() || !process.env.GEMINI_API_KEY) return null;

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({
    model: getGeminiModel(),
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

function buildGeminiHistory(messages: AiChatMessage[]): GeminiHistoryEntry[] {
  const mapped: GeminiHistoryEntry[] = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  let start = 0;
  while (start < mapped.length && mapped[start].role === 'model') {
    start += 1;
  }

  const trimmed = mapped.slice(start);
  const normalized: GeminiHistoryEntry[] = [];

  for (const entry of trimmed) {
    const prev = normalized[normalized.length - 1];
    if (prev && prev.role === entry.role) {
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
  if (shouldSkipGemini()) {
    return { reply: getFallbackChatResponse(messages), source: 'fallback' };
  }

  const model = getModel(PLATFORM_ASSISTANT_PROMPT);
  if (!model) {
    return { reply: getFallbackChatResponse(messages), source: 'fallback' };
  }

  try {
    const history = buildGeminiHistory(messages);
    const lastMessage = messages[messages.length - 1]?.content || '';

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text()?.trim();
    if (!text) {
      return { reply: getFallbackChatResponse(messages), source: 'fallback' };
    }
    return { reply: text, source: 'gemini' };
  } catch (err) {
    markQuotaBlocked(err);
    if (!isGeminiFallbackForced()) {
      console.warn('[Gemini] chat fallback:', err instanceof Error ? err.message.slice(0, 120) : err);
    }
    return { reply: getFallbackChatResponse(messages), source: 'fallback' };
  }
}

export async function generateQuizQuestions(
  lessonTitle: string,
  category: string,
  count = 5
): Promise<QuizQuestion[]> {
  if (shouldSkipGemini()) {
    return getFallbackQuizQuestions(lessonTitle, count);
  }

  const model = getModel(QUIZ_GENERATOR_PROMPT);
  if (!model) {
    return getFallbackQuizQuestions(lessonTitle, count);
  }

  try {
    const prompt = `"${lessonTitle}" (${category}) konusu için ${count} adet orta zorlukta çoktan seçmeli sorular üret.`;
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
    markQuotaBlocked(err);
    console.warn('[Gemini] quiz fallback:', err instanceof Error ? err.message.slice(0, 80) : err);
  }

  return getFallbackQuizQuestions(lessonTitle, count);
}

export async function explainQuizAnswer(
  question: QuizQuestion,
  userAnswer: string,
  isCorrect: boolean
): Promise<string> {
  if (shouldSkipGemini()) {
    return isCorrect
      ? `✅ Doğru! ${question.explanation}`
      : `❌ Yanlış. Doğru cevap: "${question.options[question.correct]}". ${question.explanation}`;
  }

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
    markQuotaBlocked(err);
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

/** Demo mod — kota yokken bile anlamlı Türkçe yanıtlar */
function getFallbackChatResponse(messages: AiChatMessage[]): string {
  const last = (messages[messages.length - 1]?.content || '').toLowerCase().trim();
  const prevUser = [...messages]
    .reverse()
    .find((m) => m.role === 'user' && m.content !== messages[messages.length - 1]?.content);
  const prevTopic = prevUser?.content.toLowerCase() || '';

  const rules: { keys: string[]; reply: string }[] = [
    {
      keys: ['fiyat', 'ücret', 'ucret', 'ne kadar', 'kaç para', 'maliyet', 'bedel', 'pahalı', 'ucuz'],
      reply: 'Ders fiyatları mentora göre değişir; Keşfet sayfasında her hizmetin kredi/ücret bilgisi görünür. Takas ile para ödemeden ders alabilirsin. Ödeme detayları için /payment sayfasına bak. 💳',
    },
    {
      keys: ['takas', 'swap', 'kredi kazan', 'kredi harca'],
      reply: 'Takas sistemiyle ders vererek kredi kazanırsın, bu kredilerle başka mentorlardan ders alırsın. Dashboard → kredi bakiyeni görebilirsin. Keşfet sayfasında "Takas" filtresini kullan! 💰',
    },
    {
      keys: ['kredi', 'bakiye', 'kaç kredi'],
      reply: 'Krediler SkillBridge para birimidir. Ders vererek kazanır, ders alarak harcarsın. Takas ile para ödemeden beceri değişimi yapabilirsin. Panelinden bakiyeni takip et.',
    },
    {
      keys: ['mentor', 'keşfet', 'explore', 'uzman bul'],
      reply: 'Keşfet (/explore) sayfasından kategori, beceri ve puana göre mentor filtreleyebilirsin. Eşleşme (/match) sayfası AI önerileri ve takas grupları sunar. 🔍',
    },
    {
      keys: ['eşleş', 'match', 'öneri'],
      reply: 'Eşleşme sayfasında AI senin becerilerine göre mentor önerir. Takas gruplarına katılarak 15 dakikalık hızlı beceri oturumlarına dahil olabilirsin.',
    },
    {
      keys: ['sertifika', 'certificate'],
      reply: 'Ders tamamladıktan sonra quiz sayfasından sınavı geçerek sertifika alırsın. Geçer puan 70. Sertifikaların /certificates sayfasında listelenir. 📜',
    },
    {
      keys: ['quiz', 'sınav', 'test'],
      reply: 'Quiz sayfasında AI destekli sorular cevaplarsın. Her ders için ayrı quiz vardır. 70+ puan sertifika için yeterli.',
    },
    {
      keys: ['giriş', 'kayıt', 'login', 'şifre', 'demo'],
      reply: 'Demo hesap: demo@skillbridge.com / Demo123! → /auth sayfasından giriş yap. Deniz Yılmaz profili ile tüm özellikleri test edebilirsin. 🔐',
    },
    {
      keys: ['ödeme', 'payment', 'havuz'],
      reply: 'Ödeme sayfasında kredi kartı veya havuz sistemi ile güvenli ödeme yapılır. Takas tercih edersen kredi ile ders alabilirsin. /payment',
    },
    {
      keys: ['mesaj', 'chat', 'konuş'],
      reply: 'Mentorlarla /chat sayfasından mesajlaşabilirsin. Demo hesapta Elif Yılmaz ile örnek sohbet mevcut.',
    },
    {
      keys: ['ders', 'hizmet', 'kurs', 'eğitim'],
      reply: 'Her mentor farklı ders/hizmet sunar. Mentor profilinden ders detayına gidip kayıt olabilirsin. Ayarlar → Hizmetlerim ile kendi hizmetini de ekleyebilirsin.',
    },
    {
      keys: ['panel', 'dashboard'],
      reply: 'Dashboard\'da yaklaşan dersler, kredi geçmişi, bildirimler ve eşleşme önerileri var. Giriş yaptıktan sonra /dashboard adresine git.',
    },
    {
      keys: ['react', 'python', 'yazılım', 'kod', 'program'],
      reply: 'Yazılım kategorisinde React, Python, Next.js gibi dersler var. Keşfet → "Yazılım Geliştirme" filtresini dene. Elif Yılmaz React konusunda top mentor!',
    },
    {
      keys: ['merhaba', 'selam', 'hey', 'naber'],
      reply: 'Merhaba! 👋 SkillBridge asistanıyım. Mentor bulma, takas, kredi, sertifika veya ödeme hakkında sorabilirsin. Nasıl yardımcı olayım?',
    },
    {
      keys: ['teşekkür', 'sağol', 'eyv'],
      reply: 'Rica ederim! Başka sorun olursa buradayım. İyi öğrenmeler! 🚀',
    },
    {
      keys: ['nasıl çalış', 'nedir', 'skillbridge'],
      reply: 'SkillBridge, becerilerini paylaşıp yeni beceriler kazandığın C2C mentorluk platformudur. Mentor bul → ders al/ver → kredi kazan → takas yap → sertifika al!',
    },
  ];

  const matchRules = (text: string): string | null => {
    for (const rule of rules) {
      if (rule.keys.some((k) => text.includes(k))) return rule.reply;
    }
    return null;
  };

  // Yalnızca son mesaja göre eşleştir — önceki konu yeni soruyu ezmesin
  const direct = matchRules(last);
  if (direct) return direct;

  // Kısa devam soruları: "peki ya fiyat?", "daha detay" gibi
  const isFollowUp =
    last.length < 40 &&
    /^(peki|peki ya|o zaman|devam|anlat|daha|bu|onun|bunun|nasıl oluyor)/.test(last);
  if (isFollowUp && prevTopic) {
    const contextual = matchRules(prevTopic);
    if (contextual) return contextual;
  }

  if (last.includes('?') || last.includes('nasıl') || last.includes('nerede') || /\bne\b/.test(last)) {
    return 'Bu soruyu tam yanıtlayamıyorum (demo mod). Takas, fiyat, mentor, kredi, sertifika veya demo giriş hakkında sorabilirsin. 🤔';
  }

  return 'SkillBridge asistanıyım (demo mod)! Takas, fiyat, mentor bulma, kredi, sertifika veya demo giriş hakkında sorabilirsin. 😊';
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

// Re-export for API route
export { isGeminiConfigured };

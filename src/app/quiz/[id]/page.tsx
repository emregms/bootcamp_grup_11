'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bot, Send, CheckCircle2, XCircle, Award, ArrowRight, RotateCcw, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api/client';
import type { QuizQuestion, ChatHistoryMessage } from '@/types/models';
import { quizQuestions as mockQuestions } from '@/data/mock';
import styles from './page.module.css';

interface QuizPageProps {
  params: Promise<{ id: string }>;
}

export default function QuizPage({ params }: QuizPageProps) {
  const { id: lessonId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [lessonTitle, setLessonTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [chatHistory, setChatHistory] = useState<ChatHistoryMessage[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/auth?redirect=/quiz/${lessonId}`);
      return;
    }

    apiGet(`/api/ai/quiz/${lessonId}`)
      .then((data) => {
        const res = data as { questions?: QuizQuestion[]; lessonTitle?: string };
        const qs = res.questions?.length ? res.questions : (mockQuestions as unknown as QuizQuestion[]);
        setQuestions(qs);
        setLessonTitle(res.lessonTitle || 'Sertifika Sınavı');
        setChatHistory([{
          type: 'bot',
          text: `Merhaba! 🎓 ${res.lessonTitle || 'Sertifika'} sınavına hoş geldiniz. ${qs.length} soru var. Geçer puan: 70. Başlayalım!`,
        }]);
      })
      .catch(() => {
        setQuestions(mockQuestions as unknown as QuizQuestion[]);
        setLessonTitle('Sertifika Sınavı');
        setChatHistory([{ type: 'bot', text: 'Merhaba! 🎓 Sertifika sınavına hoş geldiniz. Başlayalım!' }]);
      })
      .finally(() => setLoading(false));
  }, [user, authLoading, lessonId, router]);

  if (authLoading || loading || !questions.length) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const question = questions[currentQ];

  const handleSelect = (optIndex: number) => {
    if (answered) return;
    setSelected(optIndex);
  };

  const handleSubmit = async () => {
    if (selected === null) return;
    setAnswered(true);

    const isCorrect = selected === question.correct;
    if (isCorrect) setScore((prev) => prev + 1);

    setChatHistory((prev) => [
      ...prev,
      { type: 'user', text: question.options[selected] },
    ]);

    try {
      const { feedback } = await apiPost(`/api/ai/quiz/${lessonId}/feedback`, {
        question,
        selectedIndex: selected,
        isCorrect,
      }) as { feedback: string };
      setChatHistory((prev) => [...prev, { type: 'bot', text: feedback, correct: isCorrect }]);
    } catch {
      setChatHistory((prev) => [...prev, {
        type: 'bot',
        text: isCorrect ? `✅ Doğru! ${question.explanation}` : `❌ Yanlış. Doğru: "${question.options[question.correct]}"`,
        correct: isCorrect,
      }]);
    }
  };

  const handleNext = async () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setSelected(null);
      setAnswered(false);
      setChatHistory((prev) => [...prev, { type: 'bot', text: `Soru ${currentQ + 2}/${questions.length} geliyor...` }]);
    } else {
      setSubmitting(true);
      const totalScore = Math.round(((score + (selected === question.correct ? 1 : 0)) / questions.length) * 100);
      setFinalScore(totalScore);
      setFinished(true);

      try {
        const result = await apiPost(`/api/ai/quiz/${lessonId}`, {
          score: totalScore,
          answers: questions.map((q, i) => ({ questionId: q.id, index: i })),
          lessonTitle,
        }) as { passed?: boolean };

        setChatHistory((prev) => [...prev, {
          type: 'bot',
          text: result.passed
            ? `🏆 Tebrikler! Puanınız: ${totalScore}/100. Sertifikanız oluşturuldu!`
            : `📚 Puanınız: ${totalScore}/100. Geçer puan 70. Tekrar deneyebilirsiniz.`,
        }]);
      } catch {
        setChatHistory((prev) => [...prev, {
          type: 'bot',
          text: `🏆 Sınav tamamlandı! Puanınız: ${totalScore}/100.`,
        }]);
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className={styles.page}>
      <div className={`container ${styles.container}`}>
        <div className={styles.progress}>
          <div className={styles.progressInfo}>
            <span>{lessonTitle} — Soru {Math.min(currentQ + 1, questions.length)}/{questions.length}</span>
            <span>{score} doğru</span>
          </div>
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              animate={{ width: `${((currentQ + (answered ? 1 : 0)) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className={styles.chatArea}>
          {chatHistory.map((msg, i) => (
            <motion.div
              key={i}
              className={`${styles.message} ${msg.type === 'user' ? styles.userMsg : styles.botMsg}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {msg.type === 'bot' && <div className={styles.botAvatar}><Bot size={16} /></div>}
              <div className={`${styles.bubble} ${msg.type === 'user' ? styles.userBubble : styles.botBubble}`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </div>

        {!finished ? (
          <div className={styles.questionArea}>
            <h3>{question.question}</h3>
            <div className={styles.options}>
              {question.options.map((opt, i) => (
                <button
                  key={i}
                  className={`${styles.option} ${selected === i ? styles.optionSelected : ''} ${answered && i === question.correct ? styles.optionCorrect : ''} ${answered && selected === i && i !== question.correct ? styles.optionWrong : ''}`}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                >
                  <span className={styles.optionIndex}>{String.fromCharCode(65 + i)}</span>
                  <span>{opt}</span>
                  {answered && i === question.correct && <CheckCircle2 size={16} className={styles.checkIcon} />}
                  {answered && selected === i && i !== question.correct && <XCircle size={16} className={styles.wrongIcon} />}
                </button>
              ))}
            </div>
            <div className={styles.questionActions}>
              {!answered ? (
                <button className="btn btn-primary" onClick={handleSubmit} disabled={selected === null}>
                  <Send size={16} /> Cevapla
                </button>
              ) : (
                <button className="btn btn-gradient" onClick={handleNext} disabled={submitting}>
                  {submitting ? 'Kaydediliyor...' : currentQ < questions.length - 1 ? 'Sonraki Soru' : 'Sınavı Bitir'}
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <motion.div className={styles.result} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className={styles.resultIcon}>{finalScore >= 70 ? '🏆' : '📚'}</div>
            <h2>{finalScore >= 70 ? 'Tebrikler!' : 'Tekrar Dene'}</h2>
            <p className={styles.resultScore}>Puanınız: <strong>{finalScore}/100</strong></p>
            <p className={styles.resultDesc}>
              {finalScore >= 70
                ? 'Sertifikanız oluşturuldu. Sertifikalar sayfasından görüntüleyebilirsiniz.'
                : 'Geçer puan 70\'tir. Daha fazla çalışıp tekrar deneyebilirsiniz.'}
            </p>
            <div className={styles.resultActions}>
              {finalScore >= 70 ? (
                <Link href="/certificates" className="btn btn-gradient"><Award size={16} /> Sertifikayı Gör</Link>
              ) : (
                <button className="btn btn-primary" onClick={() => window.location.reload()}><RotateCcw size={16} /> Tekrar Dene</button>
              )}
              <Link href="/dashboard" className="btn btn-secondary">Panele Dön</Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

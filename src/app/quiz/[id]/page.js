'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, Send, CheckCircle2, XCircle, Clock, Award, ArrowRight, RotateCcw } from 'lucide-react';
import { quizQuestions } from '@/data/mock';
import styles from './page.module.css';

export default function QuizPage({ params }) {
  const { id } = use(params);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { type: 'bot', text: 'Merhaba! 🎓 React Developer Sertifika Sınavına hoş geldiniz. Hazır olduğunuzda başlayalım. İlk soru geliyor...' }
  ]);

  const question = quizQuestions[currentQ];

  const handleSelect = (optIndex) => {
    if (answered) return;
    setSelected(optIndex);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    setAnswered(true);

    const isCorrect = selected === question.correct;
    if (isCorrect) setScore(prev => prev + 1);

    setChatHistory(prev => [
      ...prev,
      { type: 'user', text: question.options[selected] },
      {
        type: 'bot',
        text: isCorrect
          ? `✅ Doğru! ${question.explanation}`
          : `❌ Yanlış. Doğru cevap: "${question.options[question.correct]}". ${question.explanation}`,
        correct: isCorrect
      }
    ]);
  };

  const handleNext = () => {
    if (currentQ < quizQuestions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setSelected(null);
      setAnswered(false);
      setChatHistory(prev => [
        ...prev,
        { type: 'bot', text: `Soru ${currentQ + 2}/${quizQuestions.length} geliyor...` }
      ]);
    } else {
      setFinished(true);
      const finalScore = Math.round(((score + (selected === question.correct ? 1 : 0)) / quizQuestions.length) * 100);
      setChatHistory(prev => [
        ...prev,
        { type: 'bot', text: `🏆 Sınav tamamlandı! Puanınız: ${finalScore}/100. ${finalScore >= 70 ? 'Tebrikler, sertifikayı kazandınız! 🎉' : 'Maalesef geçer puanı alamadınız. Tekrar deneyebilirsiniz.'}` }
      ]);
    }
  };

  const finalScore = Math.round((score / quizQuestions.length) * 100);

  return (
    <div className={styles.page}>
      <div className={`container ${styles.container}`}>
        {/* Progress */}
        <div className={styles.progress}>
          <div className={styles.progressInfo}>
            <span>Soru {Math.min(currentQ + 1, quizQuestions.length)}/{quizQuestions.length}</span>
            <span>{score} doğru</span>
          </div>
          <div className={styles.progressBar}>
            <motion.div
              className={styles.progressFill}
              animate={{ width: `${((currentQ + (answered ? 1 : 0)) / quizQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Chat Area */}
        <div className={styles.chatArea}>
          {chatHistory.map((msg, i) => (
            <motion.div
              key={i}
              className={`${styles.message} ${msg.type === 'user' ? styles.userMsg : styles.botMsg}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {msg.type === 'bot' && (
                <div className={styles.botAvatar}><Bot size={16} /></div>
              )}
              <div className={`${styles.bubble} ${msg.type === 'user' ? styles.userBubble : styles.botBubble}`}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Question / Result */}
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
                <button className="btn btn-gradient" onClick={handleNext}>
                  {currentQ < quizQuestions.length - 1 ? 'Sonraki Soru' : 'Sınavı Bitir'}
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <motion.div className={styles.result} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className={styles.resultIcon}>
              {finalScore >= 70 ? '🏆' : '📚'}
            </div>
            <h2>{finalScore >= 70 ? 'Tebrikler!' : 'Tekrar Dene'}</h2>
            <p className={styles.resultScore}>Puanınız: <strong>{finalScore}/100</strong></p>
            <p className={styles.resultDesc}>
              {finalScore >= 70
                ? 'Sertifikanız hazırlanıyor. Sertifikalar sayfasından indirebilirsiniz.'
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

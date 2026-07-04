'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import styles from './ChatbotWidget.module.css';

const botResponses = [
  'Merhaba! 👋 SkillBridge\'e hoş geldiniz. Size nasıl yardımcı olabilirim?',
  'Keşfet sayfasından binlerce mentoru inceleyebilirsiniz. Hangi alanla ilgileniyorsunuz?',
  'Takas sistemiyle ilgili bilgi almak ister misiniz? Verdiğiniz ders kadar ders alma hakkı kazanırsınız!',
  'Sertifika almak için bir dersi tamamlamanız ve quiz\'den geçmeniz gerekiyor. Detaylar için Sertifikalar sayfasını ziyaret edin.',
  'Eşleşme algoritması ilgi alanlarınıza göre size en uygun mentorları önerir. Eşleşme sayfasını deneyin!',
  'Kredi sistemi hakkında: Her verdiğiniz ders için kredi kazanırsınız. Bu kredileri başka derslere erişmek için kullanabilirsiniz.',
];

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Merhaba! 👋 Ben SkillBridge asistanıyım. Size nasıl yardımcı olabilirim?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: randomResponse }]);
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className={styles.fab}
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="AI Asistan"
          >
            <Bot size={24} />
            <span className={styles.fabPulse} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.window}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <div className={styles.botAvatar}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4>AI Asistan</h4>
                  <span className={styles.status}>
                    <span className={styles.statusDot} />
                    Çevrimiçi
                  </span>
                </div>
              </div>
              <button
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
                aria-label="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className={styles.messages}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`${styles.message} ${msg.type === 'user' ? styles.userMsg : styles.botMsg}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {msg.type === 'bot' && (
                    <div className={styles.msgAvatar}>
                      <Bot size={14} />
                    </div>
                  )}
                  <div className={`${styles.bubble} ${msg.type === 'user' ? styles.userBubble : styles.botBubble}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className={styles.inputArea}>
              <input
                type="text"
                placeholder="Bir soru sorun..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className={styles.input}
              />
              <button
                className={styles.sendBtn}
                onClick={handleSend}
                disabled={!input.trim()}
                aria-label="Gönder"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

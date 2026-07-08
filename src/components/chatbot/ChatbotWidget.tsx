'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { apiPost } from '@/lib/api/client';
import styles from './ChatbotWidget.module.css';

interface WidgetMessage {
  id: number;
  type: 'bot' | 'user';
  text: string;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<WidgetMessage[]>([
    { id: 1, type: 'bot', text: 'Merhaba! 👋 Ben SkillBridge AI asistanıyım. Mentor bulma, takas, kredi, sertifika veya ödeme hakkında sorabilirsiniz.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const userMsg: WidgetMessage = { id: Date.now(), type: 'user', text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Karşılama mesajını API geçmişine dahil etme (Gemini user ile başlamalı)
      const dialog = [...messages, userMsg].filter((m, i) => !(i === 0 && m.type === 'bot'));
      const history = dialog.map((m) => ({
        role: m.type === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));

      const { reply } = await apiPost('/api/ai/chat', { messages: history }) as { reply: string };
      setMessages((prev) => [...prev, { id: Date.now() + 1, type: 'bot', text: reply }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: 'Şu an yanıt veremiyorum. Keşfet sayfasından mentorlara göz atabilir veya demo@skillbridge.com ile giriş yapabilirsiniz.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.window}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className={styles.header}>
              <div className={styles.headerInfo}>
                <div className={styles.botAvatar}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4>AI Asistan</h4>
                  <span className={styles.status}>
                    <span className={styles.statusDot} />
                    Gemini · Çevrimiçi
                  </span>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Kapat">
                <X size={18} />
              </button>
            </div>

            <div className={styles.messages}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`${styles.message} ${msg.type === 'user' ? styles.userMsg : styles.botMsg}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {msg.type === 'bot' && (
                    <div className={styles.msgAvatar}><Bot size={14} /></div>
                  )}
                  <div className={`${styles.bubble} ${msg.type === 'user' ? styles.userBubble : styles.botBubble}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className={`${styles.message} ${styles.botMsg}`}>
                  <div className={styles.msgAvatar}><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /></div>
                  <div className={`${styles.bubble} ${styles.botBubble}`}>Düşünüyorum...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
              <input
                type="text"
                placeholder="Bir soru sorun..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className={styles.input}
                disabled={loading}
              />
              <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim() || loading} aria-label="Gönder">
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

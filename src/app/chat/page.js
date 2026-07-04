'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Send, Paperclip, Phone, Video, MoreVertical,
  Check, CheckCheck, Image, Smile, Clock
} from 'lucide-react';
import { conversations, chatMessages, mentors } from '@/data/mock';
import styles from './page.module.css';

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(conversations[0]);
  const [messages, setMessages] = useState(chatMessages);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: Date.now(),
      conversationId: activeChat.id,
      senderId: 'me',
      text: input,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter(c =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.chatLayout}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>Mesajlar</h2>
          </div>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Kişi ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.conversationList}>
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                className={`${styles.conversationItem} ${activeChat.id === conv.id ? styles.active : ''}`}
                onClick={() => setActiveChat(conv)}
              >
                <div className={styles.convAvatar}>
                  {conv.participantInitials}
                  {conv.online && <span className={styles.onlineDot} />}
                </div>
                <div className={styles.convInfo}>
                  <div className={styles.convTop}>
                    <h4>{conv.participantName}</h4>
                    <span className={styles.convTime}>{formatTime(conv.lastMessageTime)}</span>
                  </div>
                  <p className={styles.convPreview}>{conv.lastMessage}</p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className={styles.unreadBadge}>{conv.unreadCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className={styles.chatWindow}>
          {/* Chat Header */}
          <div className={styles.chatHeader}>
            <div className={styles.chatUserInfo}>
              <div className={styles.chatAvatar}>
                {activeChat.participantInitials}
                {activeChat.online && <span className={styles.onlineDot} />}
              </div>
              <div>
                <h3>{activeChat.participantName}</h3>
                <span className={styles.chatStatus}>
                  {activeChat.online ? 'Çevrimiçi' : 'Son görülme: bugün'}
                </span>
              </div>
            </div>
            <div className={styles.chatActions}>
              <button className={styles.chatActionBtn}><Phone size={18} /></button>
              <button className={styles.chatActionBtn}><Video size={18} /></button>
              <button className={styles.chatActionBtn}><MoreVertical size={18} /></button>
            </div>
          </div>

          {/* Messages */}
          <div className={styles.messagesArea}>
            <div className={styles.dateLabel}>
              <span>Bugün</span>
            </div>
            {messages
              .filter(m => m.conversationId === activeChat.id)
              .map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`${styles.message} ${msg.senderId === 'me' ? styles.sent : styles.received}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className={styles.bubble}>
                    <p>{msg.text}</p>
                    <div className={styles.msgMeta}>
                      <span className={styles.msgTime}>{formatTime(msg.timestamp)}</span>
                      {msg.senderId === 'me' && (
                        msg.read ? <CheckCheck size={14} className={styles.readIcon} /> : <Check size={14} />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={styles.inputArea}>
            <button className={styles.attachBtn}><Paperclip size={18} /></button>
            <button className={styles.attachBtn}><Image size={18} /></button>
            <input
              type="text"
              placeholder="Mesaj yazın..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={styles.msgInput}
            />
            <button className={styles.attachBtn}><Smile size={18} /></button>
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={!input.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

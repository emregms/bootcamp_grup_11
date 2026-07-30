'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search, Send, Check, CheckCheck, Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api/client';
import type { Conversation, ChatMessage } from '@/types/models';
import { conversations as mockConversationsRaw, chatMessages as mockMessagesRaw } from '@/data/mock';

/** Mock data uses numeric ids; API uses string ids. */
type UiConversation = Omit<Conversation, 'id'> & { id: string | number };
type UiChatMessage = Omit<ChatMessage, 'id' | 'conversationId'> & {
  id: string | number;
  conversationId?: string | number;
};

const mockConversations = mockConversationsRaw as unknown as UiConversation[];
const mockMessages = mockMessagesRaw as unknown as UiChatMessage[];
import styles from './page.module.css';

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<UiConversation[]>([]);
  const [activeChat, setActiveChat] = useState<UiConversation | null>(null);
  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth?redirect=/chat');
      return;
    }

    apiGet('/api/conversations')
      .then((data) => {
        const res = data as { conversations?: UiConversation[] };
        const convs = res.conversations?.length ? res.conversations : mockConversations;
        setConversations(convs);
        if (convs.length) setActiveChat(convs[0]);
      })
      .catch(() => {
        setConversations(mockConversations);
        setActiveChat(mockConversations[0]);
      })
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!activeChat) return;

    const convId = activeChat.id;
    if (typeof convId === 'number') {
      setMessages(mockMessages.filter((m) => m.conversationId === convId));
      return;
    }

    apiGet(`/api/conversations/${convId}/messages`)
      .then((data) => {
        const res = data as { messages?: UiChatMessage[] };
        setMessages(res.messages || []);
      })
      .catch(() => setMessages(mockMessages));
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeChat) return;

    const text = input.trim();
    setInput('');

    if (typeof activeChat.id === 'number') {
      setMessages((prev) => [...prev, {
        id: Date.now(),
        conversationId: activeChat.id,
        senderId: 'me',
        text,
        timestamp: new Date().toISOString(),
        read: false,
      }]);
      return;
    }

    try {
      const { message } = await apiPost(`/api/conversations/${activeChat.id}/messages`, { body: text }) as { message: UiChatMessage };
      setMessages((prev) => [...prev, message]);
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now(),
        senderId: 'me',
        text,
        timestamp: new Date().toISOString(),
        read: false,
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter((c) =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.chatLayout}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>Mesajlar</h2>
          </div>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.convList}>
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                className={`${styles.convItem} ${activeChat?.id === conv.id ? styles.convActive : ''}`}
                onClick={() => setActiveChat(conv)}
              >
                <div className={styles.convAvatar}>{conv.participantInitials}</div>
                <div className={styles.convInfo}>
                  <div className={styles.convTop}>
                    <span className={styles.convName}>{conv.participantName}</span>
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

        <div className={styles.chatMain}>
          {activeChat ? (
            <>
              <div className={styles.chatHeader}>
                <div className={styles.chatHeaderUser}>
                  <div className={styles.headerAvatar}>{activeChat.participantInitials}</div>
                  <div>
                    <h3>{activeChat.participantName}</h3>
                    <span className={styles.onlineStatus}>{activeChat.online ? 'Çevrimiçi' : 'Son görülme: yakın'}</span>
                  </div>
                </div>
              </div>

              <div className={styles.messagesArea}>
                {messages.map((msg) => {
                  const isMe = msg.senderId === 'me';
                  return (
                    <motion.div
                      key={msg.id}
                      className={`${styles.message} ${isMe ? styles.messageSent : styles.messageReceived}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className={styles.messageBubble}>
                        <p>{msg.text}</p>
                        <span className={styles.messageTime}>
                          {formatTime(msg.timestamp)}
                          {isMe && (msg.read ? <CheckCheck size={12} /> : <Check size={12} />)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className={styles.inputArea}>
                <input
                  type="text"
                  placeholder="Mesajınızı yazın..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim()}>
                  <Send size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className={styles.noChat}>
              <p>Bir konuşma seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

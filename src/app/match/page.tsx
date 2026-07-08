'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, Repeat, Star, Users, ArrowRight,
  Clock, MessageSquare, CheckCircle2, Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api/client';
import type { MatchSuggestion, SwapGroup } from '@/types/models';
import { matchSuggestions as mockSuggestions, swapGroups as mockGroups } from '@/data/mock';
import styles from './page.module.css';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

type MatchTab = 'suggestions' | 'groups';

export default function MatchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<MatchTab>('suggestions');
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [swapGroups, setSwapGroups] = useState<SwapGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    apiGet('/api/match/suggestions')
      .then((data) => {
        const res = data as { suggestions?: MatchSuggestion[]; swapGroups?: SwapGroup[] };
        setSuggestions(res.suggestions?.length ? res.suggestions : (mockSuggestions as unknown as MatchSuggestion[]));
        setSwapGroups(res.swapGroups?.length ? res.swapGroups : (mockGroups as unknown as SwapGroup[]));
      })
      .catch(() => {
        setSuggestions(mockSuggestions as unknown as MatchSuggestion[]);
        setSwapGroups(mockGroups as unknown as SwapGroup[]);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleJoinGroup(groupId: string) {
    if (!user) {
      router.push('/auth?redirect=/match');
      return;
    }
    setJoining(groupId);
    try {
      const result = await apiPost('/api/match/join', { groupId }) as { groupName: string };
      setToast(`"${result.groupName}" grubuna katıldınız!`);
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Katılım başarısız');
    } finally {
      setJoining(null);
    }
  }

  if (loading) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <motion.div className={styles.header} initial="hidden" animate="visible" variants={fadeUp}>
          {toast && <p style={{ background: 'rgba(0,206,201,0.15)', padding: '8px 16px', borderRadius: '8px', marginBottom: '12px' }}>{toast}</p>}
          <div className={styles.headerIcon}>
            <Sparkles size={32} />
          </div>
          <h1>AI <span className="text-gradient">Eşleştirme</span></h1>
          <p>Yapay zeka algoritması ile beceri profilini analiz ediyor ve sana en uygun mentor/takas ortaklarını buluyor</p>
        </motion.div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'suggestions' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
            <Sparkles size={16} /> Öneriler
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'groups' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            <Users size={16} /> Takas Grupları
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'suggestions' ? (
            <motion.div key="suggestions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.suggestionsGrid}>
              {suggestions.map((match, i) => (
                <motion.div key={match.id} className={styles.suggestionCard} variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: i * 0.05 }}>
                  <div className={styles.cardTop}>
                    <div className={styles.matchScore}>
                      <TrendingUp size={16} />
                      <span>%{match.matchScore}</span>
                      <small>Uyum</small>
                    </div>
                    {match.canSwap && <span className="badge badge-secondary"><Repeat size={10} /> Takas</span>}
                  </div>

                  <div className={styles.mentorRow}>
                    <div className={styles.mentorAvatar} style={{ background: `linear-gradient(135deg, ${match.mentor.color}, ${match.mentor.color}88)` }}>
                      {match.mentor.initials}
                    </div>
                    <div>
                      <h3>{match.mentor.name}</h3>
                      <p>{match.mentor.title}</p>
                      <div className={styles.mentorMeta}>
                        <span><Star size={12} fill="var(--warning)" color="var(--warning)" /> {match.mentor.rating}</span>
                        {match.mentor.verified && <CheckCircle2 size={12} style={{ color: 'var(--info)' }} />}
                      </div>
                    </div>
                  </div>

                  <p className={styles.reason}>{match.reason}</p>

                  <div className={styles.sharedTags}>
                    {(match.sharedInterests || []).map((tag) => (
                      <span key={tag} className={styles.sharedTag}>{tag}</span>
                    ))}
                  </div>

                  <div className={styles.cardActions}>
                    <Link href={`/mentor/${match.mentor.id}`} className="btn btn-secondary btn-sm">
                      Profili Gör
                    </Link>
                    <Link href="/chat" className="btn btn-gradient btn-sm">
                      <MessageSquare size={14} /> Mesaj
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key="groups" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.groupsGrid}>
              {swapGroups.map((group, i) => (
                <motion.div key={group.id} className={`${styles.groupCard} ${!group.active ? styles.groupInactive : ''}`} variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: i * 0.05 }}>
                  <div className={styles.groupHeader}>
                    <h3>{group.name}</h3>
                    {group.active ? (
                      <span className="badge badge-success">Aktif</span>
                    ) : (
                      <span className="badge badge-warning">Dolu</span>
                    )}
                  </div>
                  <p className={styles.groupDesc}>{group.description}</p>
                  <div className={styles.groupSkills}>
                    {group.skills.map((s) => <span key={s} className={styles.skillChip}>{s}</span>)}
                  </div>
                  <div className={styles.groupMeta}>
                    <span><Users size={14} /> {group.participants}/{group.maxParticipants}</span>
                    <span><Clock size={14} /> {group.duration} dk</span>
                  </div>
                  {group.active && group.nextSession && (
                    <button className="btn btn-gradient w-full" onClick={() => handleJoinGroup(group.id)} disabled={joining === group.id}>
                      {joining === group.id ? 'Katılınıyor...' : 'Gruba Katıl'} <ArrowRight size={14} />
                    </button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

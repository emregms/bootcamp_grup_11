'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, Repeat, Star, Users, ArrowRight,
  Clock, MessageSquare, CheckCircle2, Loader2, Zap, Radio,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api/client';
import type { MatchSuggestion, SwapGroup } from '@/types/models';
import {
  matchSuggestions as mockSuggestions,
  swapGroups as mockGroups,
  liveActivity,
  mentors,
} from '@/data/mock';
import styles from './page.module.css';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

type MatchTab = 'suggestions' | 'groups';
type Phase = 'scanning' | 'results';

const SCAN_MESSAGES = [
  'Profil analiz ediliyor...',
  '142 profil taranıyor...',
  'Beceri uyumu hesaplanıyor...',
  'AI eşleştirme modeli çalışıyor...',
  'En iyi eşleşmeler belirleniyor...',
  'Sonuçlar hazırlanıyor...',
];

const ORBIT_AVATARS = [
  { initials: 'EY', color: '#6C5CE7' },
  { initials: 'AK', color: '#00CEC9' },
  { initials: 'ZD', color: '#FD79A8' },
  { initials: 'HE', color: '#0984E3' },
  { initials: 'İŞ', color: '#55EFC4' },
];

export default function MatchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('scanning');
  const [activeTab, setActiveTab] = useState<MatchTab>('suggestions');
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [swapGroups, setSwapGroups] = useState<SwapGroup[]>([]);
  const [joining, setJoining] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  // Scanning animation state
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessageIndex, setScanMessageIndex] = useState(0);
  const [profilesScanned, setProfilesScanned] = useState(0);

  // Load data
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
      });
  }, []);

  // Scanning animation
  useEffect(() => {
    if (phase !== 'scanning') return;

    const totalDuration = 3500;
    const steps = 60;
    const interval = totalDuration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min((step / steps) * 100, 100);
      setScanProgress(progress);
      setProfilesScanned(Math.floor((progress / 100) * 142));

      // Update scan message
      const msgIndex = Math.min(
        Math.floor((progress / 100) * SCAN_MESSAGES.length),
        SCAN_MESSAGES.length - 1
      );
      setScanMessageIndex(msgIndex);

      if (step >= steps) {
        clearInterval(timer);
        setTimeout(() => setPhase('results'), 400);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [phase]);

  const handleJoinGroup = useCallback(async (groupId: string) => {
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
  }, [user, router]);

  // Score circle helper
  const getScoreOffset = (score: number) => {
    const circumference = 157; // 2 * π * 25
    return circumference - (score / 100) * circumference;
  };

  // ── Scanning Phase ───────────────────────────────────
  if (phase === 'scanning') {
    return (
      <div className={styles.page}>
        <div className={styles.scanningContainer}>
          <div className={styles.radarWrapper}>
            {/* Pulse Rings */}
            <div className={`${styles.radarRing} ${styles.radarRing1}`} />
            <div className={`${styles.radarRing} ${styles.radarRing2}`} />
            <div className={`${styles.radarRing} ${styles.radarRing3}`} />

            {/* Radar Sweep Line */}
            <div className={styles.radarSweep} />

            {/* Center Icon */}
            <div className={styles.radarCenter}>
              <Sparkles size={32} />
            </div>

            {/* Orbiting Avatars */}
            {ORBIT_AVATARS.map((av, i) => (
              <div
                key={i}
                className={styles.orbitAvatar}
                style={{ background: av.color }}
              >
                {av.initials}
              </div>
            ))}
          </div>

          <div className={styles.scanText}>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              AI <span className="text-gradient">Eşleştirme</span> Motoru
            </motion.h2>

            <motion.p
              className={styles.scanStatus}
              key={scanMessageIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {SCAN_MESSAGES[scanMessageIndex]}
            </motion.p>

            <div className={styles.scanProgress}>
              <div
                className={styles.scanProgressBar}
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            <span className={styles.scanCount}>
              {profilesScanned.toLocaleString('tr-TR')} / 142 profil tarandı
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Results Phase ────────────────────────────────────
  return (
    <div className={styles.page}>
      <div className="container">
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: 'rgba(0,206,201,0.15)',
                padding: '10px 20px',
                borderRadius: '12px',
                marginBottom: '16px',
                textAlign: 'center',
                border: '1px solid rgba(0,206,201,0.2)',
              }}
            >
              {toast}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          className={styles.header}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <div className={styles.headerIcon}>
            <Sparkles size={32} />
          </div>
          <h1>AI <span className="text-gradient">Eşleştirme</span> Sonuçları</h1>
          <p>Yapay zeka algoritması profilini analiz etti ve sana en uygun eşleşmeleri buldu</p>
        </motion.div>

        {/* Result Stats */}
        <motion.div
          className={styles.resultStats}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.resultStat}>
            <div className={styles.resultStatDot} />
            <span><strong>42</strong> aktif ders şu an devam ediyor</span>
          </div>
          <div className={styles.resultStat}>
            <Zap size={14} style={{ color: 'var(--warning)' }} />
            <span>Son 24 saatte <strong>12</strong> yeni eşleşme</span>
          </div>
          <div className={styles.resultStat}>
            <Users size={14} style={{ color: 'var(--primary-light)' }} />
            <span><strong>56</strong> kişi şu an çevrimiçi</span>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'suggestions' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
            <Sparkles size={16} /> Öneriler ({suggestions.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'groups' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('groups')}
          >
            <Users size={16} /> Takas Grupları ({swapGroups.length})
          </button>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'suggestions' ? (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.suggestionsGrid}
            >
              {/* SVG Gradient Definition for score circles */}
              <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6C5CE7" />
                    <stop offset="100%" stopColor="#00CEC9" />
                  </linearGradient>
                </defs>
              </svg>

              {suggestions.map((match, i) => (
                <motion.div
                  key={match.id}
                  className={styles.suggestionCard}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={styles.cardTop}>
                    {/* Score Circle */}
                    <div className={styles.scoreCircle}>
                      <svg className={styles.scoreCircleSvg} viewBox="0 0 56 56">
                        <circle className={styles.scoreCircleBg} cx="28" cy="28" r="25" />
                        <circle
                          className={styles.scoreCircleFill}
                          cx="28"
                          cy="28"
                          r="25"
                          style={{
                            strokeDashoffset: getScoreOffset(match.matchScore),
                            animationDelay: `${i * 0.15}s`,
                          }}
                        />
                      </svg>
                      <div className={styles.scoreLabel}>
                        <span>%{match.matchScore}</span>
                        <small>Uyum</small>
                      </div>
                    </div>

                    {/* Online / Swap badges */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                      {i < 3 && (
                        <span className={styles.onlineBadge}>
                          <span className={styles.resultStatDot} style={{ width: 6, height: 6 }} />
                          Çevrimiçi
                        </span>
                      )}
                      {match.canSwap && <span className="badge badge-secondary"><Repeat size={10} /> Takas</span>}
                    </div>
                  </div>

                  <div className={styles.mentorRow}>
                    <div
                      className={styles.mentorAvatar}
                      style={{ background: `linear-gradient(135deg, ${match.mentor.color}, ${match.mentor.color}88)` }}
                    >
                      {match.mentor.initials}
                    </div>
                    <div>
                      <h3>{match.mentor.name}</h3>
                      <p>{match.mentor.title}</p>
                      <div className={styles.mentorMeta}>
                        <span>
                          <Star size={12} fill="var(--warning)" color="var(--warning)" />
                          {match.mentor.rating}
                        </span>
                        <span>
                          <Users size={12} />
                          {match.mentor.students}
                        </span>
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
            <motion.div
              key="groups"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.groupsGrid}
            >
              {swapGroups.map((group, i) => (
                <motion.div
                  key={group.id}
                  className={`${styles.groupCard} ${!group.active ? styles.groupInactive : ''}`}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: i * 0.08 }}
                >
                  <div className={styles.groupHeader}>
                    <h3>{group.name}</h3>
                    {group.active ? (
                      <span className="badge badge-success">
                        <span className={styles.resultStatDot} style={{ width: 6, height: 6 }} />
                        Aktif
                      </span>
                    ) : (
                      <span className="badge badge-warning">Dolu</span>
                    )}
                  </div>
                  <p className={styles.groupDesc}>{group.description}</p>

                  <div className={styles.groupSkills}>
                    {group.skills.map((s) => <span key={s} className={styles.skillChip}>{s}</span>)}
                  </div>

                  {/* Participant Progress Bar */}
                  <div className={styles.groupParticipantBar}>
                    <div
                      className={styles.groupParticipantFill}
                      style={{ width: `${(group.participants / group.maxParticipants) * 100}%` }}
                    />
                  </div>

                  <div className={styles.groupMeta}>
                    <span><Users size={14} /> {group.participants}/{group.maxParticipants} katılımcı</span>
                    <span><Clock size={14} /> {group.duration} dk</span>
                  </div>

                  {group.active && group.nextSession && (
                    <button
                      className="btn btn-gradient w-full"
                      onClick={() => handleJoinGroup(String(group.id))}
                      disabled={joining === String(group.id)}
                    >
                      {joining === String(group.id) ? 'Katılınıyor...' : 'Gruba Katıl'}
                      <ArrowRight size={14} />
                    </button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Live Activity Ticker ──────────────────────── */}
        <div className={styles.tickerSection}>
          <div className={styles.tickerHeader}>
            <Radio size={14} style={{ color: 'var(--success)' }} />
            <span>Canlı Platform Aktivitesi</span>
          </div>
          <div className={styles.tickerTrack}>
            {/* Duplicate for seamless scroll */}
            {[...liveActivity, ...liveActivity].map((item, i) => (
              <div key={`${item.id}-${i}`} className={styles.tickerItem}>
                <span className={styles.tickerEmoji}>{item.emoji}</span>
                <span>{item.text}</span>
                <span className={styles.tickerTime}>· {item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

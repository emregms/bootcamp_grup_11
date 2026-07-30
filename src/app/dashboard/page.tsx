'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Coins, BookOpen, Award, TrendingUp, Calendar, Clock,
  ArrowUpRight, ArrowDownLeft, Star, MessageSquare,
  ChevronRight, Repeat, Sparkles, Video, Gift, Zap, Loader2,
  Radio,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api/client';
import type {
  UserProfile, Session, CreditTransaction, MatchSuggestion,
} from '@/types/models';
import {
  currentUser as mockUser,
  creditHistory as mockCredits,
  upcomingLessons as mockLessons,
  matchSuggestions as mockMatches,
  liveActivity,
} from '@/data/mock';
import styles from './page.module.css';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

interface DashboardData {
  user: UserProfile;
  upcomingLessons: Session[];
  creditHistory: CreditTransaction[];
  matchSuggestions: MatchSuggestion[];
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth?redirect=/dashboard');
      return;
    }

    apiGet('/api/dashboard')
      .then((res) => setData(res as DashboardData))
      .catch(() => setData({
        user: mockUser as unknown as UserProfile,
        upcomingLessons: mockLessons as unknown as Session[],
        creditHistory: mockCredits as unknown as CreditTransaction[],
        matchSuggestions: mockMatches as unknown as MatchSuggestion[],
      }))
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading || !data) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const { user: currentUser, upcomingLessons, creditHistory, matchSuggestions } = data;

  return (
    <div className={styles.page}>
      <div className="container">
        <motion.div className={styles.welcomeSection} initial="hidden" animate="visible" variants={stagger}>
          <motion.div className={styles.welcomeText} variants={fadeUp}>
            <h1>Hoş Geldin, <span className="text-gradient">{currentUser.name.split(' ')[0]}</span>! 👋</h1>
            <p>İşte platform aktivitelerinin özeti</p>
          </motion.div>
          <motion.div className={styles.welcomeActions} variants={fadeUp}>
            <div className={styles.matchBtnWrap}>
              <Link href="/match" className="btn btn-gradient">
                <Sparkles size={16} /> Eşleşme Bul
              </Link>
              <span className={styles.newBadge}>3 yeni</span>
            </div>
            <Link href="/explore" className="btn btn-secondary">
              Mentorları Keşfet
            </Link>
          </motion.div>
        </motion.div>

        {/* Live Activity Banner */}
        <motion.div
          className={styles.liveBanner}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Radio size={14} className={styles.liveDot} />
          <span className={styles.liveBannerText}>
            <strong>42</strong> aktif ders şu an devam ediyor · Son 1 saatte <strong>5</strong> yeni eşleşme · <strong>56</strong> kişi çevrimiçi
          </span>
        </motion.div>

        <motion.div className={styles.statsGrid} initial="hidden" animate="visible" variants={stagger}>
          {[
            { icon: Coins, label: 'Toplam Kredi', value: currentUser.credits, change: '+4', color: 'var(--secondary)', bg: 'rgba(0,206,201,0.1)' },
            { icon: BookOpen, label: 'Tamamlanan Ders', value: currentUser.lessonsCompleted, change: '+2', color: 'var(--primary-light)', bg: 'rgba(108,92,231,0.1)' },
            { icon: Award, label: 'Verilen Ders', value: currentUser.lessonsGiven, change: '+1', color: 'var(--accent)', bg: 'rgba(253,121,168,0.1)' },
            { icon: Star, label: 'Ortalama Puan', value: currentUser.rating, change: '↑', color: 'var(--warning)', bg: 'rgba(253,203,110,0.1)' },
          ].map((stat, i) => (
            <motion.div key={i} className={styles.statCard} variants={fadeUp}>
              <div className={styles.statIcon} style={{ background: stat.bg, color: stat.color }}>
                <stat.icon size={22} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>{stat.label}</span>
                <div className={styles.statRow}>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statChange} style={{ color: stat.color }}>{stat.change}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className={styles.mainGrid}>
          <div className={styles.leftCol}>
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2><Calendar size={20} /> Yaklaşan Dersler</h2>
              </div>
              <div className={styles.lessonList}>
                {upcomingLessons.length ? upcomingLessons.map((lesson) => (
                  <div key={lesson.id} className={styles.lessonItem}>
                    <div className={styles.lessonAvatar}>{lesson.mentorInitials}</div>
                    <div className={styles.lessonInfo}>
                      <h4>{lesson.title}</h4>
                      <span className={styles.lessonMentor}>{lesson.mentor}</span>
                      <div className={styles.lessonMeta}>
                        <span><Calendar size={12} /> {new Date(lesson.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        <span><Clock size={12} /> {lesson.duration} dk</span>
                        <span className={`badge ${lesson.type === 'swap' ? 'badge-secondary' : 'badge-primary'}`}>
                          {lesson.type === 'swap' ? '🔄 Takas' : '💳 Ücretli'}
                        </span>
                      </div>
                    </div>
                    <div className={styles.lessonActions}>
                      {lesson.meetLink ? (
                        <a href={lesson.meetLink} target="_blank" rel="noopener" className="btn btn-primary btn-sm">
                          <Video size={14} /> Katıl
                        </a>
                      ) : (
                        <span className={`badge ${lesson.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                          {lesson.status === 'confirmed' ? 'Onaylandı' : 'Beklemede'}
                        </span>
                      )}
                    </div>
                  </div>
                )) : (
                  <p style={{ color: 'var(--text-muted)', padding: '1rem' }}>Yaklaşan ders yok.</p>
                )}
              </div>
            </div>

            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2><Coins size={20} /> Kredi Geçmişi</h2>
                <div className={styles.creditSummary}>
                  <span style={{ color: 'var(--success)' }}>+{currentUser.totalEarned}</span>
                  <span style={{ color: 'var(--error)' }}>-{currentUser.totalSpent}</span>
                </div>
              </div>
              <div className={styles.creditList}>
                {creditHistory.map((item) => (
                  <div key={item.id} className={styles.creditItem}>
                    <div className={`${styles.creditIcon} ${item.type === 'earned' ? styles.creditEarned : item.type === 'bonus' ? styles.creditBonus : styles.creditSpent}`}>
                      {item.type === 'earned' ? <ArrowDownLeft size={16} /> :
                       item.type === 'bonus' ? <Gift size={16} /> :
                       <ArrowUpRight size={16} />}
                    </div>
                    <div className={styles.creditInfo}>
                      <span className={styles.creditDesc}>{item.description}</span>
                      <span className={styles.creditWith}>{item.with} · {new Date(item.date).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <span className={`${styles.creditAmount} ${item.type === 'spent' ? styles.negative : ''}`}>
                      {item.type === 'spent' ? '-' : '+'}{item.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.rightCol}>
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h2><Sparkles size={20} /> AI Eşleşme Önerileri</h2>
              </div>
              <div className={styles.matchList}>
                {matchSuggestions.map((match) => (
                  <Link key={match.id} href={`/mentor/${match.mentor.id}`} className={styles.matchCard}>
                    <div className={styles.matchTop}>
                      <div className={styles.matchAvatar} style={{ background: `linear-gradient(135deg, ${match.mentor.color}, ${match.mentor.color}88)` }}>
                        {match.mentor.initials}
                      </div>
                      <div className={styles.matchInfo}>
                        <h4>{match.mentor.name}</h4>
                        <span>{match.mentor.title}</span>
                      </div>
                      <div className={styles.matchScore}>
                        <TrendingUp size={14} />
                        %{match.matchScore}
                      </div>
                    </div>
                    <p className={styles.matchReason}>{match.reason}</p>
                    {match.canSwap && (
                      <span className="badge badge-secondary"><Repeat size={10} /> Takas Uygun</span>
                    )}
                  </Link>
                ))}
              </div>
              <Link href="/match" className={`btn btn-ghost w-full ${styles.matchAllBtn}`}>
                Tüm Eşleşmeleri Gör <ChevronRight size={14} />
              </Link>
            </div>

            <div className={styles.sectionCard}>
              <h2 style={{ marginBottom: 'var(--space-md)', fontSize: 'var(--font-size-lg)' }}>Hızlı İşlemler</h2>
              <div className={styles.quickActions}>
                {[
                  { icon: BookOpen, label: 'Ders Oluştur', href: '/settings', color: 'var(--primary)' },
                  { icon: MessageSquare, label: 'Mesajlar', href: '/chat', color: 'var(--secondary)' },
                  { icon: Award, label: 'Sertifikalarım', href: '/certificates', color: 'var(--accent)' },
                  { icon: Zap, label: 'Hızlı Takas', href: '/match', color: 'var(--warning)' },
                ].map((action, i) => (
                  <Link key={i} href={action.href} className={styles.quickAction}>
                    <div className={styles.quickIcon} style={{ color: action.color, background: `${action.color}15` }}>
                      <action.icon size={20} />
                    </div>
                    <span>{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

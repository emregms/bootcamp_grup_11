'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, Repeat, Star, Users, ArrowRight,
  Clock, Zap, Filter, ChevronRight, MessageSquare, CheckCircle2
} from 'lucide-react';
import { matchSuggestions, mentors, swapGroups, currentUser } from '@/data/mock';
import styles from './page.module.css';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function MatchPage() {
  const [activeTab, setActiveTab] = useState('suggestions');

  const allSuggestions = [
    ...matchSuggestions,
    { id: 4, mentor: mentors[6], matchScore: 78, reason: 'Dil öğrenme ilginize uygun İngilizce eğitmeni', sharedInterests: ['Dil'], canSwap: true },
    { id: 5, mentor: mentors[7], matchScore: 72, reason: 'Fotoğrafçılık alanında yaratıcı beceriler kazanabilirsin', sharedInterests: ['Fotoğrafçılık'], canSwap: true },
  ];

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <motion.div className={styles.header} initial="hidden" animate="visible" variants={fadeUp}>
          <div className={styles.headerIcon}>
            <Sparkles size={32} />
          </div>
          <h1>AI <span className="text-gradient">Eşleştirme</span></h1>
          <p>Yapay zeka algoritması ile beceri profilini analiz ediyor ve sana en uygun mentor/takas ortaklarını buluyor</p>
        </motion.div>

        {/* Tabs */}
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

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <motion.div className={styles.matchGrid} initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
            {allSuggestions.map((match) => (
              <motion.div key={match.id} variants={fadeUp}>
                <div className={styles.matchCard}>
                  <div className={styles.matchScoreBadge}>
                    <TrendingUp size={14} />
                    %{match.matchScore} Uyum
                  </div>

                  <div className={styles.matchProfile}>
                    <div className={styles.matchAvatar} style={{ background: `linear-gradient(135deg, ${match.mentor.color}, ${match.mentor.color}88)` }}>
                      {match.mentor.initials}
                    </div>
                    <h3>{match.mentor.name}</h3>
                    <p className={styles.matchTitle}>{match.mentor.title}</p>

                    <div className={styles.matchRating}>
                      <Star size={14} fill="var(--warning)" color="var(--warning)" />
                      <span>{match.mentor.rating}</span>
                      <span className={styles.ratingCount}>({match.mentor.reviewCount})</span>
                    </div>
                  </div>

                  <div className={styles.matchReason}>
                    <Sparkles size={14} />
                    <span>{match.reason}</span>
                  </div>

                  <div className={styles.matchSkills}>
                    {match.mentor.skills.slice(0, 4).map(skill => (
                      <span key={skill} className={styles.skillTag}>{skill}</span>
                    ))}
                  </div>

                  <div className={styles.matchActions}>
                    <Link href={`/mentor/${match.mentor.id}`} className="btn btn-primary btn-sm">
                      Profili Gör <ArrowRight size={14} />
                    </Link>
                    <Link href="/chat" className="btn btn-ghost btn-sm">
                      <MessageSquare size={14} /> Mesaj
                    </Link>
                  </div>

                  {match.canSwap && (
                    <div className={styles.swapLabel}>
                      <Repeat size={12} /> Takas Uygun
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Swap Groups Tab */}
        {activeTab === 'groups' && (
          <motion.div className={styles.groupsGrid} initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
            {swapGroups.map((group) => (
              <motion.div key={group.id} className={styles.groupCard} variants={fadeUp}>
                <div className={styles.groupHeader}>
                  <h3>{group.name}</h3>
                  <span className={`badge ${group.active ? 'badge-success' : 'badge-warning'}`}>
                    {group.active ? 'Aktif' : 'Planlanan'}
                  </span>
                </div>
                <p className={styles.groupDesc}>{group.description}</p>

                <div className={styles.groupMeta}>
                  <span><Users size={14} /> {group.participants}/{group.maxParticipants} katılımcı</span>
                  <span><Clock size={14} /> {group.duration} dakika</span>
                </div>

                <div className={styles.groupSkills}>
                  {group.skills.map(skill => (
                    <span key={skill} className={styles.skillTag}>{skill}</span>
                  ))}
                </div>

                <div className={styles.groupFooter}>
                  <span className={styles.nextSession}>
                    Sonraki: {new Date(group.nextSession).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button className="btn btn-primary btn-sm">
                    Katıl <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Create Group CTA */}
            <motion.div className={styles.createGroupCard} variants={fadeUp}>
              <Zap size={32} />
              <h3>Kendi Grubunu Oluştur</h3>
              <p>15 dakikalık hızlı takas grubu kur ve toplulukla buluş</p>
              <button className="btn btn-gradient">Grup Oluştur</button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

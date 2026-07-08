'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Award, Download, Share2, Star, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet } from '@/lib/api/client';
import type { Certificate, Badge } from '@/types/models';
import { certificates as mockCerts, badges as mockBadges } from '@/data/mock';
import styles from './page.module.css';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

type CertTab = 'certificates' | 'badges';

export default function CertificatesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CertTab>('certificates');
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth?redirect=/certificates');
      return;
    }

    apiGet('/api/certificates')
      .then((data) => {
        const res = data as { certificates?: Certificate[]; badges?: Badge[] };
        setCertificates(res.certificates?.length ? res.certificates : (mockCerts as unknown as Certificate[]));
        setBadges(res.badges?.length ? res.badges : (mockBadges as unknown as Badge[]));
      })
      .catch(() => {
        setCertificates(mockCerts as unknown as Certificate[]);
        setBadges(mockBadges as unknown as Badge[]);
      })
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) {
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
          <h1>Sertifikalar & <span className="text-gradient">Rozetler</span></h1>
          <p>Kazandığın sertifikalar ve rozetlerin ile başarılarını göster</p>
        </motion.div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === 'certificates' ? styles.tabActive : ''}`} onClick={() => setActiveTab('certificates')}>
            <Award size={16} /> Sertifikalar ({certificates.length})
          </button>
          <button className={`${styles.tab} ${activeTab === 'badges' ? styles.tabActive : ''}`} onClick={() => setActiveTab('badges')}>
            <Star size={16} /> Rozetler ({badges.filter((b) => b.earned).length}/{badges.length})
          </button>
        </div>

        {activeTab === 'certificates' && (
          <motion.div className={styles.certGrid} initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
            {certificates.map((cert) => (
              <motion.div key={cert.id} className={styles.certCard} variants={fadeUp}>
                <div className={styles.certBorder} style={{ background: `linear-gradient(135deg, ${cert.color}, ${cert.color}66)` }} />
                <div className={styles.certContent}>
                  <div className={styles.certIcon} style={{ color: cert.color, background: `${cert.color}15` }}>
                    <Award size={28} />
                  </div>
                  <h3>{cert.title}</h3>
                  <p className={styles.certIssuer}>{cert.issuer} tarafından</p>
                  <div className={styles.certMeta}>
                    <span>{cert.category}</span>
                    <span>Skor: {cert.score}%</span>
                  </div>
                  <div className={styles.certSkills}>
                    {cert.skills.map((s) => <span key={s} className={styles.skillTag}>{s}</span>)}
                  </div>
                  <div className={styles.certActions}>
                    <button className="btn btn-ghost btn-sm"><Download size={14} /> İndir</button>
                    <button className="btn btn-ghost btn-sm"><Share2 size={14} /> Paylaş</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'badges' && (
          <motion.div className={styles.badgeGrid} initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>
            {badges.map((badge) => (
              <motion.div key={badge.id} className={`${styles.badgeCard} ${!badge.earned ? styles.badgeLocked : ''}`} variants={fadeUp}>
                <div className={styles.badgeIcon}>{badge.earned ? badge.icon : <Lock size={24} />}</div>
                <h4>{badge.name}</h4>
                <p>{badge.description}</p>
                {badge.earned && badge.date && (
                  <span className={styles.badgeDate}>
                    <CheckCircle2 size={12} /> {new Date(badge.date).toLocaleDateString('tr-TR')}
                  </span>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

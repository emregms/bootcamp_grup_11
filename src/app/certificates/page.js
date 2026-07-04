'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Share2, ExternalLink, Calendar, Star, CheckCircle2, Lock } from 'lucide-react';
import { certificates, badges } from '@/data/mock';
import styles from './page.module.css';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function CertificatesPage() {
  const [activeTab, setActiveTab] = useState('certificates');

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
            <Star size={16} /> Rozetler ({badges.filter(b => b.earned).length}/{badges.length})
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
                  <p className={styles.certCategory}>{cert.category}</p>

                  <div className={styles.certMeta}>
                    <span><Calendar size={13} /> {new Date(cert.date).toLocaleDateString('tr-TR')}</span>
                    <span>Eğitmen: {cert.issuer}</span>
                  </div>

                  <div className={styles.certScore}>
                    <div className={styles.scoreBar}>
                      <motion.div
                        className={styles.scoreFill}
                        style={{ background: cert.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${cert.score}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                    <span>Puan: {cert.score}/100</span>
                  </div>

                  <div className={styles.certSkills}>
                    {cert.skills.map(s => <span key={s} className={styles.skillTag}>{s}</span>)}
                  </div>

                  <div className={styles.certId}>ID: {cert.credentialId}</div>

                  <div className={styles.certActions}>
                    <button className="btn btn-primary btn-sm"><Download size={14} /> İndir</button>
                    <button className="btn btn-ghost btn-sm"><Share2 size={14} /> Paylaş</button>
                    <button className="btn btn-ghost btn-sm"><ExternalLink size={14} /> Doğrula</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'badges' && (
          <motion.div className={styles.badgeGrid} initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}>
            {badges.map((badge) => (
              <motion.div
                key={badge.id}
                className={`${styles.badgeCard} ${!badge.earned ? styles.badgeLocked : ''}`}
                variants={fadeUp}
              >
                <div className={styles.badgeIcon}>{badge.icon}</div>
                <h4>{badge.name}</h4>
                <p>{badge.description}</p>
                {badge.earned ? (
                  <span className={styles.badgeDate}>
                    <CheckCircle2 size={12} /> {new Date(badge.date).toLocaleDateString('tr-TR')}
                  </span>
                ) : (
                  <span className={styles.badgeLock}><Lock size={12} /> Kilitli</span>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

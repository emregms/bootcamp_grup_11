'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Zap, Users, Award, BookOpen, Repeat,
  Star, ChevronRight, Play, Shield, Clock, TrendingUp,
  CheckCircle2, Sparkles, Globe, MessageSquare
} from 'lucide-react';
import { mentors, categories, testimonials, platformStats } from '@/data/mock';
import styles from './page.module.css';

/* ── Animation Variants ──────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

/* ── Animated Section Wrapper ────────────────────────── */
function AnimatedSection({ children, className }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={stagger}
    >
      {children}
    </motion.section>
  );
}

/* ── Stat Counter ────────────────────────────────────── */
function StatCounter({ value, label, icon: Icon }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <motion.div ref={ref} className={styles.statItem} variants={fadeUp}>
      <div className={styles.statIcon}><Icon size={24} /></div>
      <motion.span
        className={styles.statValue}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {value}
      </motion.span>
      <span className={styles.statLabel}>{label}</span>
    </motion.div>
  );
}

/* ── Main Page ───────────────────────────────────────── */
export default function HomePage() {
  const featuredMentors = mentors.filter(m => m.topMentor).slice(0, 4);

  return (
    <>
      {/* ═══ HERO SECTION ═══ */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />
          <div className={styles.heroOrb3} />
          <div className={styles.heroGrid} />
        </div>

        <div className={`container ${styles.heroContent}`}>
          <motion.div
            className={styles.heroText}
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp} className={styles.heroBadge}>
              <Sparkles size={14} />
              <span>Türkiye&apos;nin #1 Beceri Takası Platformu</span>
            </motion.div>

            <motion.h1 variants={fadeUp}>
              Becerilerini <span className="text-gradient">Paylaş</span>,{' '}
              Yenilerini <span className="text-gradient">Kazan</span>
            </motion.h1>

            <motion.p variants={fadeUp} className={styles.heroDesc}>
              Para harcamadan yeni beceriler öğren. Bildiklerini öğret, kredi kazan ve
              binlerce mentordan ücretsiz ders al. Karşılıklı fayda modeli ile
              herkes kazanır.
            </motion.p>

            <motion.div variants={fadeUp} className={styles.heroCtas}>
              <Link href="/explore" className="btn btn-gradient btn-lg">
                Mentorları Keşfet
                <ArrowRight size={18} />
              </Link>
              <Link href="/auth" className="btn btn-secondary btn-lg">
                <Play size={18} />
                Nasıl Çalışır?
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className={styles.heroTrust}>
              <div className={styles.avatarStack}>
                {['EY', 'AK', 'ZD', 'CY'].map((initials, i) => (
                  <div key={i} className={styles.stackAvatar} style={{ zIndex: 4 - i }}>
                    {initials}
                  </div>
                ))}
              </div>
              <p>
                <strong>15.000+</strong> kullanıcı aktif olarak beceri takası yapıyor
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.heroVisual}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className={styles.heroCard}>
              <div className={styles.heroCardHeader}>
                <div className={styles.heroCardDots}>
                  <span /><span /><span />
                </div>
                <span>Eşleşme Bulundu!</span>
              </div>
              <div className={styles.heroCardBody}>
                <div className={styles.matchPair}>
                  <div className={styles.matchUser}>
                    <div className={styles.matchAvatar} style={{ background: 'var(--gradient-hero)' }}>EG</div>
                    <span>Sen</span>
                    <small>React, JS</small>
                  </div>
                  <div className={styles.matchArrows}>
                    <Repeat size={24} />
                  </div>
                  <div className={styles.matchUser}>
                    <div className={styles.matchAvatar} style={{ background: 'var(--gradient-accent)' }}>ZD</div>
                    <span>Zeynep</span>
                    <small>Figma, UX</small>
                  </div>
                </div>
                <div className={styles.matchInfo}>
                  <div className={styles.matchScore}>
                    <TrendingUp size={16} />
                    <span>%95 Uyum</span>
                  </div>
                  <button className="btn btn-primary btn-sm">Takası Başlat</button>
                </div>
              </div>
            </div>

            <motion.div
              className={styles.floatingBadge1}
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Award size={18} />
              <span>Sertifika Kazanıldı!</span>
            </motion.div>

            <motion.div
              className={styles.floatingBadge2}
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 3.5, repeat: Infinity }}
            >
              <Star size={16} fill="var(--warning)" />
              <span>4.9 ★</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <AnimatedSection className={styles.statsSection}>
        <div className={`container ${styles.statsGrid}`}>
          <StatCounter value="15.000+" label="Aktif Kullanıcı" icon={Users} />
          <StatCounter value="8.700+" label="Tamamlanan Ders" icon={BookOpen} />
          <StatCounter value="3.200+" label="Başarılı Takas" icon={Repeat} />
          <StatCounter value="4.8" label="Ortalama Puan" icon={Star} />
        </div>
      </AnimatedSection>

      {/* ═══ HOW IT WORKS ═══ */}
      <AnimatedSection className={`section ${styles.howSection}`} id="how-it-works">
        <div className="container">
          <motion.div variants={fadeUp} className="section-header">
            <h2>Nasıl <span className="text-gradient">Çalışır</span>?</h2>
            <p>3 basit adımda yeni beceriler kazanmaya başla</p>
          </motion.div>

          <div className={styles.howGrid}>
            {[
              {
                step: '01',
                icon: Users,
                title: 'Profilini Oluştur',
                desc: 'Becerilerini ve öğrenmek istediğin alanları belirle. AI eşleşme algoritması seni doğru kişilerle buluştursun.',
                color: '#6C5CE7',
              },
              {
                step: '02',
                icon: Repeat,
                title: 'Eşleş & Takas Yap',
                desc: 'Bildiğin konuyu öğret, kredi kazan. Kazandığın kredilerle istediğin dersi al. Veya doğrudan ödeme yap.',
                color: '#00CEC9',
              },
              {
                step: '03',
                icon: Award,
                title: 'Sertifika Kazan',
                desc: 'Dersleri tamamla, AI quiz\'den geç ve sertifikanı al. Rozet koleksiyonunu büyüt, profilini güçlendir.',
                color: '#FD79A8',
              },
            ].map((item, i) => (
              <motion.div key={i} className={styles.howCard} variants={fadeUp}>
                <div className={styles.howStep} style={{ color: item.color }}>{item.step}</div>
                <div className={styles.howIconWrap} style={{ background: `${item.color}15`, color: item.color }}>
                  <item.icon size={28} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                {i < 2 && <div className={styles.howConnector}><ChevronRight size={20} /></div>}
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ═══ CATEGORIES ═══ */}
      <AnimatedSection className={`section ${styles.categoriesSection}`}>
        <div className="container">
          <motion.div variants={fadeUp} className="section-header">
            <h2>Popüler <span className="text-gradient">Kategoriler</span></h2>
            <p>Her alanda uzman mentorlarla buluş, becerilerini geliştir</p>
          </motion.div>

          <motion.div className={styles.categoryGrid} variants={stagger}>
            {categories.map((cat) => (
              <motion.div key={cat.id} variants={scaleIn}>
                <Link href={`/explore?category=${cat.id}`} className={styles.categoryCard}>
                  <div className={styles.categoryIcon} style={{ background: `${cat.color}15` }}>
                    <span>{cat.icon}</span>
                  </div>
                  <h4>{cat.name}</h4>
                  <span className={styles.categoryCount}>{cat.count} mentor</span>
                  <div className={styles.categoryArrow} style={{ color: cat.color }}>
                    <ArrowRight size={16} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══ FEATURED MENTORS ═══ */}
      <AnimatedSection className={`section ${styles.mentorsSection}`}>
        <div className="container">
          <motion.div variants={fadeUp} className={styles.mentorsSectionHeader}>
            <div>
              <h2>Öne Çıkan <span className="text-gradient">Mentorlar</span></h2>
              <p>En yüksek puanlı ve en çok tercih edilen mentorlarımız</p>
            </div>
            <Link href="/explore" className="btn btn-secondary">
              Tümünü Gör
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.div className={styles.mentorGrid} variants={stagger}>
            {featuredMentors.map((mentor) => (
              <motion.div key={mentor.id} variants={fadeUp}>
                <Link href={`/mentor/${mentor.id}`} className={styles.mentorCard}>
                  <div className={styles.mentorCardTop}>
                    <div className={styles.mentorAvatar} style={{ background: `linear-gradient(135deg, ${mentor.color}, ${mentor.color}88)` }}>
                      {mentor.initials}
                    </div>
                    {mentor.verified && (
                      <div className={styles.verifiedBadge}>
                        <CheckCircle2 size={14} />
                      </div>
                    )}
                    {mentor.acceptsSwap && (
                      <div className={`badge badge-secondary ${styles.swapBadge}`}>
                        <Repeat size={10} />
                        Takas
                      </div>
                    )}
                  </div>

                  <div className={styles.mentorInfo}>
                    <h4>{mentor.name}</h4>
                    <p className={styles.mentorTitle}>{mentor.title}</p>

                    <div className={styles.mentorSkills}>
                      {mentor.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className={styles.skillTag}>{skill}</span>
                      ))}
                      {mentor.skills.length > 3 && (
                        <span className={styles.skillMore}>+{mentor.skills.length - 3}</span>
                      )}
                    </div>

                    <div className={styles.mentorStats}>
                      <div className={styles.mentorRating}>
                        <Star size={14} fill="var(--warning)" color="var(--warning)" />
                        <span>{mentor.rating}</span>
                        <span className={styles.reviewCount}>({mentor.reviewCount})</span>
                      </div>
                      <div className={styles.mentorStudents}>
                        <Users size={14} />
                        <span>{mentor.students}</span>
                      </div>
                    </div>

                    <div className={styles.mentorPrice}>
                      <span className={styles.priceAmount}>₺{mentor.hourlyRate}</span>
                      <span className={styles.priceUnit}>/saat</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══ SWAP FEATURE ═══ */}
      <AnimatedSection className={`section ${styles.swapSection}`}>
        <div className="container">
          <div className={styles.swapContent}>
            <motion.div className={styles.swapText} variants={fadeUp}>
              <div className={styles.swapBadgeLabel}>
                <Zap size={14} />
                Fark Yaratan Özellik
              </div>
              <h2>Para Harcamadan <span className="text-gradient">Öğren</span></h2>
              <p className={styles.swapDesc}>
                SkillBridge&apos;in benzersiz takas modeli ile para harcamadan yeni beceriler kazanabilirsin.
                Verdiğin eğitim kadar kredi kazan, bu kredilerle yeni eğitimler al.
              </p>

              <div className={styles.swapFeatures}>
                {[
                  { icon: Repeat, text: 'Verdiğin ders = Kazandığın kredi' },
                  { icon: Shield, text: 'Güvenli havuz ödeme sistemi' },
                  { icon: Clock, text: '15 dakikalık hızlı takas grupları' },
                  { icon: Globe, text: 'Her alanda takas imkanı' },
                ].map((f, i) => (
                  <div key={i} className={styles.swapFeature}>
                    <div className={styles.swapFeatureIcon}>
                      <f.icon size={18} />
                    </div>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>

              <Link href="/match" className="btn btn-gradient btn-lg">
                Takas Eşini Bul
                <ArrowRight size={18} />
              </Link>
            </motion.div>

            <motion.div className={styles.swapVisual} variants={fadeUp}>
              <div className={styles.creditFlow}>
                <div className={styles.creditFlowCard}>
                  <div className={styles.creditFlowIcon} style={{ background: 'rgba(108, 92, 231, 0.15)', color: 'var(--primary)' }}>
                    <BookOpen size={24} />
                  </div>
                  <h4>Ders Ver</h4>
                  <p>Bildiğin konuyu öğret</p>
                </div>
                <div className={styles.creditFlowArrow}>
                  <motion.div
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight size={20} />
                  </motion.div>
                </div>
                <div className={styles.creditFlowCard}>
                  <div className={styles.creditFlowIcon} style={{ background: 'rgba(0, 206, 201, 0.15)', color: 'var(--secondary)' }}>
                    <Zap size={24} />
                  </div>
                  <h4>Kredi Kazan</h4>
                  <p>Her ders = kredi</p>
                </div>
                <div className={styles.creditFlowArrow}>
                  <motion.div
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  >
                    <ArrowRight size={20} />
                  </motion.div>
                </div>
                <div className={styles.creditFlowCard}>
                  <div className={styles.creditFlowIcon} style={{ background: 'rgba(253, 121, 168, 0.15)', color: 'var(--accent)' }}>
                    <Award size={24} />
                  </div>
                  <h4>Ders Al</h4>
                  <p>Kredilerle öğren</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* ═══ TESTIMONIALS ═══ */}
      <AnimatedSection className={`section ${styles.testimonialSection}`}>
        <div className="container">
          <motion.div variants={fadeUp} className="section-header">
            <h2>Kullanıcılarımız <span className="text-gradient">Ne Diyor</span>?</h2>
            <p>Binlerce kullanıcının SkillBridge deneyimi</p>
          </motion.div>

          <motion.div className={styles.testimonialGrid} variants={stagger}>
            {testimonials.map((t) => (
              <motion.div key={t.id} className={styles.testimonialCard} variants={fadeUp}>
                <div className={styles.testimonialStars}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} fill="var(--warning)" color="var(--warning)" />
                  ))}
                </div>
                <p className={styles.testimonialText}>&quot;{t.text}&quot;</p>
                <div className={styles.testimonialUser}>
                  <div className={styles.testimonialAvatar}>{t.initials}</div>
                  <div>
                    <h5>{t.name}</h5>
                    <span>{t.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══ CTA SECTION ═══ */}
      <section className={`section ${styles.ctaSection}`}>
        <div className="container">
          <motion.div
            className={styles.ctaCard}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.ctaOrb1} />
            <div className={styles.ctaOrb2} />
            <h2>Hemen Başla, <span className="text-gradient">Ücretsiz</span></h2>
            <p>Kayıt ol, profilini oluştur ve ilk dersine bugün başla. Hoş geldin bonusu olarak 10 kredi hediye!</p>
            <div className={styles.ctaButtons}>
              <Link href="/auth" className="btn btn-gradient btn-lg">
                Ücretsiz Kaydol
                <ArrowRight size={18} />
              </Link>
              <Link href="/explore" className="btn btn-ghost btn-lg">
                Mentorları İncele
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}

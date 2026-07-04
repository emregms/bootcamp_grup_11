'use client';

import { use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Clock, Users, Star, Calendar, MapPin, Video, Repeat,
  BookOpen, CheckCircle2, ArrowRight, Shield, Award, MessageSquare
} from 'lucide-react';
import { lessons, mentors, reviews } from '@/data/mock';
import styles from './page.module.css';

export default function LessonDetailPage({ params }) {
  const { id } = use(params);
  const lesson = lessons.find(l => l.id === parseInt(id)) || lessons[0];
  const mentor = mentors.find(m => m.id === lesson.mentorId);

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.grid}>
          {/* Main */}
          <motion.div className={styles.main} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className={styles.breadcrumb}>
              <Link href="/explore">Keşfet</Link> / <Link href={`/mentor/${mentor.id}`}>{mentor.name}</Link> / <span>{lesson.title}</span>
            </div>

            <h1>{lesson.title}</h1>

            <div className={styles.metaRow}>
              <span className={`badge badge-primary`}>{lesson.level}</span>
              <span className={`badge badge-secondary`}>{lesson.category}</span>
              <span className={styles.metaItem}><Star size={14} fill="var(--warning)" color="var(--warning)" /> {lesson.rating}</span>
              <span className={styles.metaItem}><Users size={14} /> {lesson.enrolledCount} öğrenci</span>
              <span className={styles.metaItem}><Clock size={14} /> {lesson.duration} dk</span>
            </div>

            <div className={styles.section}>
              <h2>Ders Hakkında</h2>
              <p className={styles.description}>{lesson.description}</p>
            </div>

            <div className={styles.section}>
              <h2>Neler Öğreneceksin?</h2>
              <div className={styles.learningList}>
                {['Temel kavramlar ve ileri seviye teknikler', 'Gerçek dünya projeleriyle pratik deneyim', 'Best practice ve performans optimizasyonu', 'Sertifika alma ve portfolio oluşturma'].map((item, i) => (
                  <div key={i} className={styles.learningItem}>
                    <CheckCircle2 size={18} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h2>Etiketler</h2>
              <div className={styles.tags}>
                {lesson.tags.map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
              </div>
            </div>

            {/* Mentor Info */}
            <div className={styles.section}>
              <h2>Eğitmen</h2>
              <Link href={`/mentor/${mentor.id}`} className={styles.mentorCard}>
                <div className={styles.mentorAvatar} style={{ background: `linear-gradient(135deg, ${mentor.color}, ${mentor.color}88)` }}>
                  {mentor.initials}
                </div>
                <div>
                  <h3>{mentor.name} {mentor.verified && <CheckCircle2 size={14} style={{ color: 'var(--info)' }} />}</h3>
                  <p>{mentor.title}</p>
                  <div className={styles.mentorStats}>
                    <span><Star size={12} fill="var(--warning)" color="var(--warning)" /> {mentor.rating}</span>
                    <span><Users size={12} /> {mentor.students} öğrenci</span>
                    <span><BookOpen size={12} /> {mentor.lessonsGiven} ders</span>
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div className={styles.sidebar} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className={styles.enrollCard}>
              <div className={styles.priceRow}>
                <span className={styles.price}>₺{lesson.price}</span>
                {lesson.acceptsSwap && (
                  <span className={styles.swapPrice}><Repeat size={14} /> {lesson.swapCredits} kredi</span>
                )}
              </div>

              <button className="btn btn-gradient btn-lg w-full">
                Derse Katıl <ArrowRight size={16} />
              </button>

              {lesson.acceptsSwap && (
                <button className="btn btn-secondary w-full">
                  <Repeat size={16} /> Kredi ile Katıl
                </button>
              )}

              <div className={styles.enrollInfo}>
                <div className={styles.infoItem}><Calendar size={16} /> Sonraki: {new Date(lesson.nextSession).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div>
                <div className={styles.infoItem}><Clock size={16} /> {lesson.duration} dakika</div>
                <div className={styles.infoItem}><Users size={16} /> Max {lesson.maxStudents} kişi</div>
                <div className={styles.infoItem}><Video size={16} /> Google Meet ile canlı</div>
                <div className={styles.infoItem}><Award size={16} /> Sertifika dahil</div>
                <div className={styles.infoItem}><Shield size={16} /> Güvenli ödeme</div>
              </div>

              <Link href="/chat" className="btn btn-ghost w-full">
                <MessageSquare size={16} /> Mentora Sor
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

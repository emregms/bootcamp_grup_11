'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Clock, Users, Star, Calendar, Video, Repeat,
  BookOpen, CheckCircle2, ArrowRight, Shield, Award, MessageSquare, Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api/client';
import type { Lesson, Mentor } from '@/types/models';
import { lessons as mockLessons, mentors as mockMentors } from '@/data/mock';
import LessonCover from '@/components/ui/LessonCover';
import AvatarImage from '@/components/ui/AvatarImage';
import styles from './page.module.css';

interface LessonDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function LessonDetailPage({ params }: LessonDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiGet(`/api/lessons/${id}`)
      .then((data) => {
        const res = data as { lesson: Lesson; mentor: Mentor };
        setLesson(res.lesson);
        setMentor(res.mentor);
      })
      .catch(() => {
        const lessons = mockLessons as unknown as Lesson[];
        const mentors = mockMentors as unknown as Mentor[];
        const mock = lessons.find((l) => String(l.id) === String(id)) || lessons[0];
        setLesson(mock);
        setMentor(mentors.find((m) => m.id === mock.mentorId) || mentors[0]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleEnroll(paymentType: 'paid' | 'swap') {
    if (!user) {
      router.push(`/auth?redirect=/lesson/${id}`);
      return;
    }
    setEnrolling(true);
    setMessage('');
    try {
      const result = await apiPost(`/api/lessons/${id}/enroll`, { paymentType }) as { redirectUrl?: string };
      setMessage('Kayıt başarılı! Yönlendiriliyorsunuz...');
      setTimeout(() => router.push(result.redirectUrl || '/dashboard'), 1200);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setEnrolling(false);
    }
  }

  if (loading || !lesson || !mentor) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.grid}>
          <motion.div className={styles.main} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className={styles.breadcrumb}>
              <Link href="/explore">Keşfet</Link> / <Link href={`/mentor/${mentor.id}`}>{mentor.name}</Link> / <span>{lesson.title}</span>
            </div>

            <LessonCover
              src={lesson.coverImage}
              category={lesson.category}
              title={lesson.title}
              height={280}
              className={styles.heroCover}
            />

            <h1>{lesson.title}</h1>

            <div className={styles.metaRow}>
              <span className="badge badge-primary">{lesson.level}</span>
              <span className="badge badge-secondary">{lesson.category}</span>
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
                {(lesson.tags || []).map((tag) => <span key={tag} className={styles.tag}>{tag}</span>)}
              </div>
            </div>

            <div className={styles.section}>
              <h2>Eğitmen</h2>
              <Link href={`/mentor/${mentor.id}`} className={styles.mentorCard}>
                <AvatarImage
                  src={mentor.avatar}
                  name={mentor.name}
                  initials={mentor.initials}
                  color={mentor.color}
                  size="lg"
                />
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

          <motion.div className={styles.sidebar} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className={styles.enrollCard}>
              <div className={styles.priceRow}>
                <span className={styles.price}>₺{lesson.price}</span>
                {lesson.acceptsSwap && (
                  <span className={styles.swapPrice}><Repeat size={14} /> {lesson.swapCredits} kredi</span>
                )}
              </div>

              {message && <p style={{ fontSize: '14px', color: 'var(--success)', marginBottom: '8px' }}>{message}</p>}

              <button className="btn btn-gradient btn-lg w-full" onClick={() => handleEnroll('paid')} disabled={enrolling}>
                {enrolling ? 'İşleniyor...' : 'Derse Katıl'} <ArrowRight size={16} />
              </button>

              {lesson.acceptsSwap && (
                <button className="btn btn-secondary w-full" onClick={() => handleEnroll('swap')} disabled={enrolling}>
                  <Repeat size={16} /> Kredi ile Katıl ({lesson.swapCredits} kredi)
                </button>
              )}

              <Link href={`/quiz/${id}`} className="btn btn-ghost w-full" style={{ marginTop: '8px' }}>
                <Award size={16} /> Sertifika Quiz&apos;i
              </Link>

              <div className={styles.enrollInfo}>
                {lesson.nextSession && (
                  <div className={styles.infoItem}><Calendar size={16} /> Sonraki: {new Date(lesson.nextSession).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div>
                )}
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

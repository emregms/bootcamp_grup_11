'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Star, Users, BookOpen, Clock, MapPin, Globe, Repeat, CheckCircle2,
  MessageSquare, Calendar, Award, Loader2,
} from 'lucide-react';
import { mentors as mockMentors, lessons as mockLessons, reviews as mockReviews } from '@/data/mock';
import { apiGet } from '@/lib/api/client';
import type { Mentor, Lesson, Review } from '@/types/models';
import AvatarImage from '@/components/ui/AvatarImage';
import LessonCover from '@/components/ui/LessonCover';
import styles from './page.module.css';

interface MentorProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function MentorProfilePage({ params }: MentorProfilePageProps) {
  const { id } = use(params);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [mentorLessons, setMentorLessons] = useState<Lesson[]>([]);
  const [mentorReviews, setMentorReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet(`/api/mentors/${id}`)
      .then((data) => {
        const res = data as { mentor: Mentor; lessons?: Lesson[]; reviews?: Review[] };
        setMentor(res.mentor);
        setMentorLessons(res.lessons || []);
        setMentorReviews(res.reviews || []);
      })
      .catch(() => {
        const mock = (mockMentors as unknown as Mentor[]).find((m) => String(m.id) === String(id)) || (mockMentors as unknown as Mentor[])[0];
        setMentor(mock);
        setMentorLessons((mockLessons as unknown as Lesson[]).filter((l) => String(l.mentorId) === String(mock.id)));
        setMentorReviews((mockReviews as unknown as Review[]).filter((r) => r.mentorId === mock.id));
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !mentor) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerBg} style={{ background: `linear-gradient(135deg, ${mentor.color}33, ${mentor.color}11)` }}>
        <div className={`container ${styles.headerContent}`}>
          <motion.div className={styles.avatarSection} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className={styles.avatarWrap}>
              <AvatarImage
                src={mentor.avatar}
                name={mentor.name}
                initials={mentor.initials}
                color={mentor.color}
                size="xl"
              />
              {mentor.verified && (
                <div className={styles.verifiedMark}><CheckCircle2 size={20} /></div>
              )}
            </div>
          </motion.div>

          <motion.div className={styles.profileInfo} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className={styles.nameRow}>
              <h1>{mentor.name}</h1>
              {mentor.topMentor && <span className="badge badge-warning">⭐ Top Mentor</span>}
              {mentor.acceptsSwap && <span className="badge badge-secondary"><Repeat size={10} /> Takas Kabul</span>}
            </div>
            <p className={styles.title}>{mentor.title}</p>
            <p className={styles.bio}>{mentor.bio}</p>

            <div className={styles.metaRow}>
              <span><MapPin size={14} /> {mentor.location}</span>
              <span><Globe size={14} /> {(mentor.languages || []).join(', ')}</span>
              <span><Clock size={14} /> Yanıt: {mentor.responseTime}</span>
              <span><Calendar size={14} /> Üye: {new Date(mentor.joinDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}</span>
            </div>
          </motion.div>

          <motion.div className={styles.actionPanel} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className={styles.priceCard}>
              <div className={styles.priceTop}>
                <span className={styles.priceAmount}>₺{mentor.hourlyRate}</span>
                <span className={styles.priceUnit}>/saat</span>
              </div>
              {mentor.acceptsSwap && (
                <div className={styles.swapPrice}>
                  <Repeat size={14} />
                  veya kredi ile takas
                </div>
              )}
              <Link href="/chat" className="btn btn-gradient w-full">
                <MessageSquare size={16} /> Mesaj Gönder
              </Link>
              <Link href={`/lesson/${mentorLessons[0]?.id || ''}`} className="btn btn-secondary w-full">
                <Calendar size={16} /> Ders Planla
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className={styles.statsBar}>
        <div className="container">
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <Star size={18} fill="var(--warning)" color="var(--warning)" />
              <span className={styles.statValue}>{mentor.rating}</span>
              <span className={styles.statLabel}>({mentor.reviewCount} değerlendirme)</span>
            </div>
            <div className={styles.statItem}>
              <Users size={18} />
              <span className={styles.statValue}>{mentor.students}</span>
              <span className={styles.statLabel}>Öğrenci</span>
            </div>
            <div className={styles.statItem}>
              <BookOpen size={18} />
              <span className={styles.statValue}>{mentor.lessonsGiven}</span>
              <span className={styles.statLabel}>Ders</span>
            </div>
            <div className={styles.statItem}>
              <Award size={18} />
              <span className={styles.statValue}>{mentor.credits}</span>
              <span className={styles.statLabel}>Kredi</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`container ${styles.contentGrid}`}>
        <div className={styles.mainContent}>
          <section className={styles.section}>
            <h2>Yetkinlikler</h2>
            <div className={styles.skillsGrid}>
              {mentor.skills.map((skill) => (
                <span key={skill} className={styles.skillChip}>{skill}</span>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Dersler</h2>
            <div className={styles.lessonsList}>
              {mentorLessons.length > 0 ? mentorLessons.map((lesson) => (
                <Link key={lesson.id} href={`/lesson/${lesson.id}`} className={styles.lessonCard}>
                  <LessonCover src={lesson.coverImage} category={lesson.category} title={lesson.title} height={120} className={styles.lessonCover} />
                  <div className={styles.lessonInfo}>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.description}</p>
                    <div className={styles.lessonMeta}>
                      <span className="badge badge-primary">{lesson.level}</span>
                      <span><Clock size={13} /> {lesson.duration} dk</span>
                      <span><Users size={13} /> {lesson.enrolledCount}/{lesson.maxStudents}</span>
                    </div>
                  </div>
                  <div className={styles.lessonPrice}>
                    <span className={styles.lpAmount}>₺{lesson.price}</span>
                    {lesson.acceptsSwap && (
                      <span className={styles.lpSwap}>{lesson.swapCredits} kredi</span>
                    )}
                  </div>
                </Link>
              )) : (
                <p className={styles.empty}>Henüz ders eklenmemiş.</p>
              )}
            </div>
          </section>

          <section className={styles.section}>
            <h2>Değerlendirmeler</h2>
            <div className={styles.reviewsList}>
              {mentorReviews.length > 0 ? mentorReviews.map((review) => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewUser}>
                      <div className={styles.reviewAvatar}>{review.userInitials}</div>
                      <div>
                        <h4>{review.userName}</h4>
                        <span className={styles.reviewDate}>{new Date(review.date).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                    <div className={styles.reviewStars}>
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} size={14} fill="var(--warning)" color="var(--warning)" />
                      ))}
                    </div>
                  </div>
                  <p className={styles.reviewText}>{review.comment}</p>
                  {review.lessonTitle && <span className={styles.reviewLesson}>{review.lessonTitle}</span>}
                </div>
              )) : (
                <p className={styles.empty}>Henüz değerlendirme yok.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

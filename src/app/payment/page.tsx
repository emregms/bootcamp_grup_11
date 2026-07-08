'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield, ArrowRight, CreditCard, Lock, CheckCircle2,
  Repeat, Loader2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api/client';
import styles from './page.module.css';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

interface LessonCheckout {
  title: string;
  mentor: string;
  duration: number;
  date?: string;
  amount: number;
  commission: number;
  total: number;
}

interface PaymentResult {
  transactionId?: string;
  amount?: number;
}

type PayMethod = 'card' | 'credit';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const lessonId = searchParams.get('lesson');

  const [step, setStep] = useState(1);
  const [lesson, setLesson] = useState<LessonCheckout | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [payMethod, setPayMethod] = useState<PayMethod>('card');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/auth?redirect=/payment${lessonId ? `?lesson=${lessonId}` : ''}`);
      return;
    }

    const fallback: LessonCheckout = {
      title: 'React ile Modern Web Uygulamaları',
      mentor: 'Elif Yılmaz',
      duration: 60,
      date: new Date().toISOString(),
      amount: 200,
      commission: 10,
      total: 210,
    };

    if (lessonId) {
      apiGet(`/api/payment/checkout?lesson=${lessonId}`)
        .then((data) => {
          const res = data as { lesson?: LessonCheckout };
          setLesson(res.lesson ?? fallback);
        })
        .catch(() => setLesson(fallback))
        .finally(() => setLoading(false));
    } else {
      setLesson(fallback);
      setLoading(false);
    }
  }, [lessonId, user, authLoading, router]);

  async function handlePayment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!lesson) return;
    setProcessing(true);
    try {
      const data = await apiPost('/api/payment/checkout', {
        lessonId: lessonId || 'demo',
        amount: lesson.amount,
        method: payMethod,
      }) as PaymentResult;
      setResult(data);
      setStep(3);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ödeme başarısız');
    } finally {
      setProcessing(false);
    }
  }

  if (authLoading || loading || !lesson) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={`container ${styles.container}`}>
        <motion.div className={styles.header} initial="hidden" animate="visible" variants={fadeUp}>
          <Shield size={32} className={styles.headerIcon} />
          <h1>Güvenli <span className="text-gradient">Ödeme</span></h1>
          <p>Havuz sistemi ile paranız eğitim tamamlanana kadar güvende</p>
        </motion.div>

        <div className={styles.steps}>
          {['Ders Bilgisi', 'Ödeme', 'Onay'].map((s, i) => (
            <div key={i} className={`${styles.step} ${step > i ? styles.stepDone : ''} ${step === i + 1 ? styles.stepActive : ''}`}>
              <div className={styles.stepCircle}>
                {step > i + 1 ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className={styles.content}>
          {step === 1 && (
            <motion.div className={styles.card} initial="hidden" animate="visible" variants={fadeUp}>
              <h2>Ders Özeti</h2>
              <div className={styles.lessonSummary}>
                <div className={styles.lessonRow}><span>Ders</span><strong>{lesson.title}</strong></div>
                <div className={styles.lessonRow}><span>Eğitmen</span><strong>{lesson.mentor}</strong></div>
                <div className={styles.lessonRow}><span>Süre</span><strong>{lesson.duration} dakika</strong></div>
                {lesson.date && (
                  <div className={styles.lessonRow}>
                    <span>Tarih</span>
                    <strong>{new Date(lesson.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong>
                  </div>
                )}
                <div className={styles.lessonRow}><span>Format</span><strong>Google Meet (Online)</strong></div>
              </div>

              <div className={styles.escrowInfo}>
                <Shield size={20} />
                <div>
                  <h4>Havuz Sistemi ile Güvenli Ödeme</h4>
                  <p>Ödemeniz havuzda tutulur. Eğitim tamamlanıp onaylandığında eğitmene aktarılır.</p>
                </div>
              </div>

              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}><span>Ders Ücreti</span><span>₺{lesson.amount}</span></div>
                <div className={styles.priceRow}><span>Platform Komisyonu (%5)</span><span>₺{lesson.commission}</span></div>
                <div className={`${styles.priceRow} ${styles.totalRow}`}><span>Toplam</span><strong>₺{lesson.total}</strong></div>
              </div>

              <button className="btn btn-gradient btn-lg w-full" onClick={() => setStep(2)}>
                Ödemeye Geç <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div className={styles.card} initial="hidden" animate="visible" variants={fadeUp}>
              <h2>Ödeme Bilgileri</h2>

              <div className={styles.paymentMethods}>
                <button type="button" className={`${styles.methodBtn} ${payMethod === 'card' ? styles.methodActive : ''}`} onClick={() => setPayMethod('card')}>
                  <CreditCard size={18} /> Kredi Kartı
                </button>
                <button type="button" className={`${styles.methodBtn} ${payMethod === 'credit' ? styles.methodActive : ''}`} onClick={() => setPayMethod('credit')}>
                  <Repeat size={18} /> Kredi ile Öde
                </button>
              </div>

              <form className={styles.form} onSubmit={handlePayment}>
                {payMethod === 'card' && (
                  <>
                    <div className={styles.formGroup}>
                      <label>Kart Üzerindeki İsim</label>
                      <input type="text" placeholder="Ad Soyad" className="input" defaultValue="Deniz Yılmaz" required />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Kart Numarası</label>
                      <div className={styles.cardInput}>
                        <CreditCard size={18} />
                        <input type="text" placeholder="4242 4242 4242 4242" className="input" defaultValue="4242 4242 4242 4242" required />
                        <Lock size={16} className={styles.lockIcon} />
                      </div>
                    </div>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label>Son Kullanma</label>
                        <input type="text" placeholder="MM/YY" className="input" defaultValue="12/28" required />
                      </div>
                      <div className={styles.formGroup}>
                        <label>CVV</label>
                        <input type="text" placeholder="123" className="input" defaultValue="123" required />
                      </div>
                    </div>
                  </>
                )}

                <div className={styles.securityNote}>
                  <Lock size={14} />
                  <span>Demo ödeme — gerçek kart bilgisi işlenmez</span>
                </div>

                <div className={styles.formActions}>
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>Geri</button>
                  <button type="submit" className="btn btn-gradient btn-lg" disabled={processing}>
                    {processing ? 'İşleniyor...' : `₺${lesson.total} Öde`} <Lock size={14} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div className={`${styles.card} ${styles.confirmCard}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className={styles.confirmIcon}><CheckCircle2 size={48} /></div>
              <h2>Ödeme Başarılı!</h2>
              <p className={styles.confirmDesc}>
                Ödemeniz havuz hesabına alınmıştır. Eğitim tamamlanıp onaylandıktan sonra eğitmene aktarılacaktır.
              </p>

              <div className={styles.confirmDetails}>
                <div className={styles.confirmRow}><span>İşlem No</span><strong>{result?.transactionId || '#SB-TXN'}</strong></div>
                <div className={styles.confirmRow}><span>Tutar</span><strong>₺{result?.amount || lesson.total}</strong></div>
                <div className={styles.confirmRow}><span>Durum</span><span className="badge badge-warning">Havuzda</span></div>
              </div>

              <Link href="/dashboard" className="btn btn-gradient btn-lg">
                Panele Dön
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <PaymentContent />
    </Suspense>
  );
}

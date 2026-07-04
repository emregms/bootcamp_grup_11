'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, ArrowRight, CreditCard, Lock, CheckCircle2,
  Clock, User, Repeat, ChevronDown, AlertCircle
} from 'lucide-react';
import styles from './page.module.css';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function PaymentPage() {
  const [step, setStep] = useState(1);

  return (
    <div className={styles.page}>
      <div className={`container ${styles.container}`}>
        <motion.div className={styles.header} initial="hidden" animate="visible" variants={fadeUp}>
          <Shield size={32} className={styles.headerIcon} />
          <h1>Güvenli <span className="text-gradient">Ödeme</span></h1>
          <p>Havuz sistemi ile paranız eğitim tamamlanana kadar güvende</p>
        </motion.div>

        {/* Steps */}
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
          {/* Step 1: Lesson Info */}
          {step === 1 && (
            <motion.div className={styles.card} initial="hidden" animate="visible" variants={fadeUp}>
              <h2>Ders Özeti</h2>
              <div className={styles.lessonSummary}>
                <div className={styles.lessonRow}>
                  <span>Ders</span><strong>React ile Modern Web Uygulamaları</strong>
                </div>
                <div className={styles.lessonRow}>
                  <span>Eğitmen</span><strong>Elif Yılmaz</strong>
                </div>
                <div className={styles.lessonRow}>
                  <span>Süre</span><strong>60 dakika</strong>
                </div>
                <div className={styles.lessonRow}>
                  <span>Tarih</span><strong>3 Temmuz 2026, 14:00</strong>
                </div>
                <div className={styles.lessonRow}>
                  <span>Format</span><strong>Google Meet (Online)</strong>
                </div>
              </div>

              <div className={styles.escrowInfo}>
                <Shield size={20} />
                <div>
                  <h4>Havuz Sistemi ile Güvenli Ödeme</h4>
                  <p>Ödemeniz havuzda tutulur. Eğitim tamamlanıp onaylandığında eğitmene aktarılır.</p>
                </div>
              </div>

              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}><span>Ders Ücreti</span><span>₺200</span></div>
                <div className={styles.priceRow}><span>Platform Komisyonu (%5)</span><span>₺10</span></div>
                <div className={`${styles.priceRow} ${styles.totalRow}`}><span>Toplam</span><strong>₺210</strong></div>
              </div>

              <button className="btn btn-gradient btn-lg w-full" onClick={() => setStep(2)}>
                Ödemeye Geç <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {/* Step 2: Payment Form */}
          {step === 2 && (
            <motion.div className={styles.card} initial="hidden" animate="visible" variants={fadeUp}>
              <h2>Ödeme Bilgileri</h2>

              <div className={styles.paymentMethods}>
                <button className={`${styles.methodBtn} ${styles.methodActive}`}>
                  <CreditCard size={18} /> Kredi Kartı
                </button>
                <button className={styles.methodBtn}>
                  <Repeat size={18} /> Kredi ile Öde
                </button>
              </div>

              <form className={styles.form} onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                <div className={styles.formGroup}>
                  <label>Kart Üzerindeki İsim</label>
                  <input type="text" placeholder="Ad Soyad" className="input" defaultValue="Emre Gümüş" />
                </div>
                <div className={styles.formGroup}>
                  <label>Kart Numarası</label>
                  <div className={styles.cardInput}>
                    <CreditCard size={18} />
                    <input type="text" placeholder="1234 5678 9012 3456" className="input" defaultValue="4242 4242 4242 4242" />
                    <Lock size={16} className={styles.lockIcon} />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Son Kullanma</label>
                    <input type="text" placeholder="MM/YY" className="input" defaultValue="12/28" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>CVV</label>
                    <input type="text" placeholder="123" className="input" defaultValue="***" />
                  </div>
                </div>

                <div className={styles.securityNote}>
                  <Lock size={14} />
                  <span>256-bit SSL şifreleme ile korunan güvenli bağlantı</span>
                </div>

                <div className={styles.formActions}>
                  <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>Geri</button>
                  <button type="submit" className="btn btn-gradient btn-lg">
                    ₺210 Öde <Lock size={14} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <motion.div className={`${styles.card} ${styles.confirmCard}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className={styles.confirmIcon}>
                <CheckCircle2 size={48} />
              </div>
              <h2>Ödeme Başarılı!</h2>
              <p className={styles.confirmDesc}>
                Ödemeniz havuz hesabına alınmıştır. Eğitim tamamlanıp onaylandıktan sonra eğitmene aktarılacaktır.
              </p>

              <div className={styles.confirmDetails}>
                <div className={styles.confirmRow}><span>İşlem No</span><strong>#SB-TXN-2026-0847</strong></div>
                <div className={styles.confirmRow}><span>Tutar</span><strong>₺210</strong></div>
                <div className={styles.confirmRow}><span>Durum</span><span className="badge badge-warning">Havuzda</span></div>
              </div>

              <div className={styles.escrowFlow}>
                {['Ödeme Alındı', 'Ders Tamamlandı', 'Onay Bekleniyor', 'Eğitmene Aktarım'].map((s, i) => (
                  <div key={i} className={`${styles.flowStep} ${i === 0 ? styles.flowActive : ''}`}>
                    <div className={styles.flowDot} />
                    <span>{s}</span>
                  </div>
                ))}
              </div>

              <button className="btn btn-gradient btn-lg" onClick={() => setStep(1)}>
                Panele Dön
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

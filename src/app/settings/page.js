'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Lock, Globe, Bell, Shield, Camera,
  MapPin, Briefcase, Save, BookOpen, Eye, Trash2
} from 'lucide-react';
import { currentUser } from '@/data/mock';
import styles from './page.module.css';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'account', label: 'Hesap', icon: Lock },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'privacy', label: 'Gizlilik', icon: Shield },
  ];

  return (
    <div className={styles.page}>
      <div className="container">
        <motion.h1 initial="hidden" animate="visible" variants={fadeUp}>
          <span className="text-gradient">Ayarlar</span>
        </motion.h1>

        <div className={styles.layout}>
          {/* Sidebar Tabs */}
          <div className={styles.tabList}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`${styles.tabItem} ${activeTab === tab.id ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className={styles.content}>
            {activeTab === 'profile' && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                <div className={styles.section}>
                  <h2>Profil Bilgileri</h2>

                  <div className={styles.avatarSection}>
                    <div className={styles.avatar}>
                      <span>{currentUser.initials}</span>
                    </div>
                    <button className="btn btn-secondary btn-sm"><Camera size={14} /> Fotoğraf Değiştir</button>
                  </div>

                  <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label><User size={14} /> Ad Soyad</label>
                        <input type="text" className="input" defaultValue={currentUser.name} />
                      </div>
                      <div className={styles.formGroup}>
                        <label><Mail size={14} /> E-posta</label>
                        <input type="email" className="input" defaultValue={currentUser.email} />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label><Briefcase size={14} /> Ünvan</label>
                      <input type="text" className="input" defaultValue={currentUser.title} />
                    </div>

                    <div className={styles.formGroup}>
                      <label><BookOpen size={14} /> Biyografi</label>
                      <textarea className={`input ${styles.textarea}`} defaultValue={currentUser.bio} rows={4} />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label><MapPin size={14} /> Konum</label>
                        <input type="text" className="input" defaultValue={currentUser.location} />
                      </div>
                      <div className={styles.formGroup}>
                        <label><Globe size={14} /> Diller</label>
                        <input type="text" className="input" defaultValue={currentUser.languages.join(', ')} />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Beceriler</label>
                      <div className={styles.skillsInput}>
                        {currentUser.skills.map(skill => (
                          <span key={skill} className={styles.skillChip}>{skill} ×</span>
                        ))}
                        <input type="text" placeholder="Yeni beceri ekle..." className={styles.inlineInput} />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Öğrenmek İstediğim Alanlar</label>
                      <div className={styles.skillsInput}>
                        {currentUser.learningInterests.map(interest => (
                          <span key={interest} className={`${styles.skillChip} ${styles.interestChip}`}>{interest} ×</span>
                        ))}
                        <input type="text" placeholder="İlgi alanı ekle..." className={styles.inlineInput} />
                      </div>
                    </div>

                    <div className={styles.formActions}>
                      <button type="submit" className="btn btn-gradient"><Save size={16} /> Kaydet</button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'account' && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                <div className={styles.section}>
                  <h2>Hesap Güvenliği</h2>
                  <div className={styles.settingItem}>
                    <div>
                      <h4>Şifre Değiştir</h4>
                      <p>Son değişiklik: 3 ay önce</p>
                    </div>
                    <button className="btn btn-secondary btn-sm">Değiştir</button>
                  </div>
                  <div className={styles.settingItem}>
                    <div>
                      <h4>İki Faktörlü Doğrulama</h4>
                      <p>Ekstra güvenlik katmanı ekleyin</p>
                    </div>
                    <button className="btn btn-secondary btn-sm">Etkinleştir</button>
                  </div>
                  <div className={styles.settingItem}>
                    <div>
                      <h4>Bağlı Hesaplar</h4>
                      <p>Google, GitHub</p>
                    </div>
                    <button className="btn btn-ghost btn-sm">Yönet</button>
                  </div>
                </div>
                <div className={`${styles.section} ${styles.dangerZone}`}>
                  <h2>Tehlikeli Bölge</h2>
                  <div className={styles.settingItem}>
                    <div>
                      <h4>Hesabı Sil</h4>
                      <p>Bu işlem geri alınamaz</p>
                    </div>
                    <button className={`btn btn-sm ${styles.dangerBtn}`}><Trash2 size={14} /> Sil</button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                <div className={styles.section}>
                  <h2>Bildirim Tercihleri</h2>
                  {[
                    { label: 'Yeni mesajlar', desc: 'Birisi size mesaj gönderdiğinde', on: true },
                    { label: 'Ders hatırlatmaları', desc: 'Yaklaşan dersler için bildirim', on: true },
                    { label: 'Eşleşme önerileri', desc: 'AI yeni bir eşleşme bulduğunda', on: true },
                    { label: 'Kredi bildirimleri', desc: 'Kredi kazandığınızda veya harcadığınızda', on: false },
                    { label: 'Pazarlama e-postaları', desc: 'Platform güncellemeleri ve kampanyalar', on: false },
                  ].map((item, i) => (
                    <div key={i} className={styles.settingItem}>
                      <div>
                        <h4>{item.label}</h4>
                        <p>{item.desc}</p>
                      </div>
                      <label className={styles.switch}>
                        <input type="checkbox" defaultChecked={item.on} />
                        <span className={styles.slider} />
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                <div className={styles.section}>
                  <h2>Gizlilik Ayarları</h2>
                  {[
                    { label: 'Profili herkese açık', desc: 'Profiliniz arama sonuçlarında görünür', on: true },
                    { label: 'Çevrimiçi durumu göster', desc: 'Diğer kullanıcılar çevrimiçi olduğunuzu görebilir', on: true },
                    { label: 'Öğrenme geçmişi', desc: 'Tamamladığınız dersler profilinizde görünür', on: false },
                  ].map((item, i) => (
                    <div key={i} className={styles.settingItem}>
                      <div>
                        <h4>{item.label}</h4>
                        <p>{item.desc}</p>
                      </div>
                      <label className={styles.switch}>
                        <input type="checkbox" defaultChecked={item.on} />
                        <span className={styles.slider} />
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

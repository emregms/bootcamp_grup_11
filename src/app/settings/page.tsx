'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User, Mail, Lock, Globe, Bell, Shield, Camera,
  MapPin, Briefcase, Save, BookOpen, Trash2, Loader2, Plus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiPatch } from '@/lib/api/client';
import type { UserProfile } from '@/types/models';
import { currentUser as mockUser } from '@/data/mock';
import AvatarImage from '@/components/ui/AvatarImage';
import CreateLessonForm from '@/components/lessons/CreateLessonForm';
import styles from './page.module.css';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

type SettingsTab = 'profile' | 'services' | 'account' | 'notifications' | 'privacy';

interface TabItem {
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
}

export default function SettingsPage() {
  const { profile, user, loading: authLoading, refresh } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const currentUser: UserProfile = profile || (mockUser as unknown as UserProfile);

  if (authLoading) {
    return (
      <div className={styles.page} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!user) {
    router.push('/auth?redirect=/settings');
    return null;
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const form = e.currentTarget;
    try {
      await apiPatch('/api/profile/me', {
        full_name: (form.elements.namedItem('full_name') as HTMLInputElement).value,
        title: (form.elements.namedItem('title') as HTMLInputElement).value,
        bio: (form.elements.namedItem('bio') as HTMLTextAreaElement).value,
        location: (form.elements.namedItem('location') as HTMLInputElement).value,
        languages: (form.elements.namedItem('languages') as HTMLInputElement).value.split(',').map((s) => s.trim()).filter(Boolean),
      });
      await refresh();
      setMessage('Profil güncellendi!');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Kayıt başarısız');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    setUploadingAvatar(true);
    setMessage('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('bucket', 'avatars');
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || 'Yükleme başarısız');
      await apiPatch('/api/profile/me', { avatar_url: data.url });
      await refresh();
      setMessage('Profil fotoğrafı güncellendi!');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Fotoğraf yüklenemedi');
    } finally {
      setUploadingAvatar(false);
    }
  }

  const tabs: TabItem[] = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'services', label: 'Hizmetlerim', icon: Plus },
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

          <div className={styles.content}>
            {activeTab === 'profile' && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                <div className={styles.section}>
                  <h2>Profil Bilgileri</h2>

                  <div className={styles.avatarSection}>
                    <AvatarImage
                      src={currentUser.avatar}
                      name={currentUser.name}
                      initials={currentUser.initials}
                      color={currentUser.color}
                      size="xl"
                    />
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAvatarUpload(file);
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? <Loader2 size={14} className="spin" /> : <Camera size={14} />}
                      Fotoğraf Değiştir
                    </button>
                  </div>

                  <form className={styles.form} onSubmit={handleSave}>
                    {message && <p style={{ color: 'var(--success)', marginBottom: '1rem' }}>{message}</p>}
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label><User size={14} /> Ad Soyad</label>
                        <input type="text" name="full_name" className="input" defaultValue={currentUser.name} />
                      </div>
                      <div className={styles.formGroup}>
                        <label><Mail size={14} /> E-posta</label>
                        <input type="email" className="input" defaultValue={currentUser.email} disabled />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label><Briefcase size={14} /> Ünvan</label>
                      <input type="text" name="title" className="input" defaultValue={currentUser.title ?? ''} />
                    </div>

                    <div className={styles.formGroup}>
                      <label><BookOpen size={14} /> Biyografi</label>
                      <textarea name="bio" className={`input ${styles.textarea}`} defaultValue={currentUser.bio ?? ''} rows={4} />
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label><MapPin size={14} /> Konum</label>
                        <input type="text" name="location" className="input" defaultValue={currentUser.location ?? ''} />
                      </div>
                      <div className={styles.formGroup}>
                        <label><Globe size={14} /> Diller</label>
                        <input type="text" name="languages" className="input" defaultValue={(currentUser.languages || []).join(', ')} />
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
                      <button type="submit" className="btn btn-gradient" disabled={saving}>
                        <Save size={16} /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'services' && (
              <motion.div initial="hidden" animate="visible" variants={fadeUp}>
                <div className={styles.section}>
                  <CreateLessonForm />
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

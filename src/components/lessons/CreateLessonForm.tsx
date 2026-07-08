'use client';

import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { apiPost } from '@/lib/api/client';
import { getCategoryStockImage } from '@/lib/stock-images';
import ImagePicker from '@/components/ui/ImagePicker';
import type { Lesson } from '@/types/models';
import styles from './CreateLessonForm.module.css';

const CATEGORIES = [
  'Yazılım Geliştirme',
  'Tasarım & UX',
  'Veri Bilimi & AI',
  'Dijital Pazarlama',
  'Müzik & Ses',
  'Fotoğrafçılık',
  'Dil Eğitimi',
  'İş & Finans',
  'Kişisel Gelişim',
  'Spor & Sağlık',
];

interface CreateLessonFormProps {
  onCreated?: (lesson: Lesson) => void;
}

export default function CreateLessonForm({ onCreated }: CreateLessonFormProps) {
  const [coverUrl, setCoverUrl] = useState(getCategoryStockImage('Yazılım Geliştirme'));
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    const form = e.currentTarget;

    try {
      const tagsRaw = (form.elements.namedItem('tags') as HTMLInputElement).value;
      const result = await apiPost<{ lesson: Lesson }>('/api/lessons', {
        title: (form.elements.namedItem('title') as HTMLInputElement).value,
        description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
        category_name: category,
        duration_minutes: Number((form.elements.namedItem('duration') as HTMLInputElement).value),
        price_credits: Number((form.elements.namedItem('price') as HTMLInputElement).value),
        swap_credits: Number((form.elements.namedItem('swapCredits') as HTMLInputElement).value),
        level: (form.elements.namedItem('level') as HTMLSelectElement).value,
        cover_image_url: coverUrl,
        tags: tagsRaw.split(',').map((t) => t.trim()).filter(Boolean),
        accepts_swap: (form.elements.namedItem('accepts_swap') as HTMLInputElement).checked,
      });
      setMessage('Hizmetiniz yayınlandı!');
      form.reset();
      setCoverUrl(getCategoryStockImage(category));
      onCreated?.(result.lesson);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Oluşturulamadı');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h3><Plus size={18} /> Yeni Hizmet Oluştur</h3>
      <p className={styles.sub}>Mentorluk hizmetinizi görsel ile birlikte yayınlayın</p>

      {message && <p className={styles.success}>{message}</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.formGroup}>
        <label>Hizmet Başlığı</label>
        <input name="title" className="input" placeholder="Örn: React ile Modern Web Uygulamaları" required />
      </div>

      <div className={styles.formGroup}>
        <label>Açıklama</label>
        <textarea name="description" className={`input ${styles.textarea}`} rows={3} placeholder="Hizmetinizi kısaca tanıtın..." required />
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label>Kategori</label>
          <select
            name="category"
            className="input"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setCoverUrl(getCategoryStockImage(e.target.value));
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Seviye</label>
          <select name="level" className="input" defaultValue="Orta">
            <option>Başlangıç</option>
            <option>Orta</option>
            <option>İleri</option>
          </select>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label>Süre (dk)</label>
          <input name="duration" type="number" className="input" defaultValue={60} min={15} required />
        </div>
        <div className={styles.formGroup}>
          <label>Kredi Fiyatı</label>
          <input name="price" type="number" className="input" defaultValue={200} min={0} required />
        </div>
        <div className={styles.formGroup}>
          <label>Takas Kredisi</label>
          <input name="swapCredits" type="number" className="input" defaultValue={4} min={0} required />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Etiketler (virgülle)</label>
        <input name="tags" className="input" placeholder="React, JavaScript, Web" />
      </div>

      <label className={styles.checkbox}>
        <input type="checkbox" name="accepts_swap" defaultChecked />
        Takas kabul ediyorum
      </label>

      <ImagePicker value={coverUrl} onChange={setCoverUrl} bucket="lesson-covers" />

      <button type="submit" className="btn btn-gradient" disabled={loading}>
        {loading ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
        {loading ? 'Yayınlanıyor...' : 'Hizmeti Yayınla'}
      </button>
    </form>
  );
}

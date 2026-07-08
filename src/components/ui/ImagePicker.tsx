'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, Check, Loader2 } from 'lucide-react';
import { LESSON_STOCK_COVERS } from '@/lib/stock-images';
import styles from './ImagePicker.module.css';

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: 'lesson-covers' | 'avatars';
  label?: string;
}

export default function ImagePicker({
  value,
  onChange,
  bucket = 'lesson-covers',
  label = 'Kapak Görseli',
}: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleUpload(file: File) {
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('bucket', bucket);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || 'Yükleme başarısız');
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Yükleme hatası');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={styles.picker}>
      <label className={styles.label}>{label}</label>

      {value && (
        <div className={styles.preview}>
          <Image src={value} alt="Seçili görsel" fill className={styles.previewImg} unoptimized />
        </div>
      )}

      <p className={styles.hint}>Stok görsel seçin veya kendi görselinizi yükleyin</p>

      <div className={styles.grid}>
        {LESSON_STOCK_COVERS.map((item) => (
          <button
            key={item.url}
            type="button"
            className={`${styles.stockBtn} ${value === item.url ? styles.selected : ''}`}
            onClick={() => onChange(item.url)}
            title={item.label}
          >
            <Image src={item.url} alt={item.label} fill className={styles.stockImg} unoptimized />
            {value === item.url && <span className={styles.check}><Check size={14} /></span>}
          </button>
        ))}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className={styles.hiddenInput}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />

      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
        {uploading ? 'Yükleniyor...' : 'Bilgisayardan Yükle'}
      </button>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

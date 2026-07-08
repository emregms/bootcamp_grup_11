'use client';

import { useState } from 'react';
import Image from 'next/image';
import { resolveLessonCover, getCategoryStockImage } from '@/lib/stock-images';
import styles from './LessonCover.module.css';

interface LessonCoverProps {
  src?: string | null;
  category: string;
  title: string;
  height?: number;
  className?: string;
}

export default function LessonCover({
  src,
  category,
  title,
  height = 180,
  className = '',
}: LessonCoverProps) {
  const primary = resolveLessonCover(src, category);
  const [imageUrl, setImageUrl] = useState(primary);

  return (
    <div className={`${styles.cover} ${className}`} style={{ height }}>
      <Image
        src={imageUrl}
        alt={title}
        fill
        className={styles.img}
        sizes="(max-width: 768px) 100vw, 400px"
        unoptimized
        onError={() => setImageUrl(getCategoryStockImage(category))}
      />
      <div className={styles.overlay} />
      <span className={styles.category}>{category}</span>
    </div>
  );
}

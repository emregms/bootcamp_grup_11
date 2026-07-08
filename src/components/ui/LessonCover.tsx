'use client';

import Image from 'next/image';
import { resolveLessonCover } from '@/lib/stock-images';
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
  const imageUrl = resolveLessonCover(src, category);

  return (
    <div className={`${styles.cover} ${className}`} style={{ height }}>
      <Image
        src={imageUrl}
        alt={title}
        fill
        className={styles.img}
        sizes="(max-width: 768px) 100vw, 400px"
        unoptimized
      />
      <div className={styles.overlay} />
      <span className={styles.category}>{category}</span>
    </div>
  );
}

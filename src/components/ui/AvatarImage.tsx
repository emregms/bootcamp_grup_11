'use client';

import Image from 'next/image';
import { resolveAvatar } from '@/lib/stock-images';
import styles from './AvatarImage.module.css';

interface AvatarImageProps {
  src?: string | null;
  name: string;
  initials: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  stockIndex?: number;
}

const sizeMap = { sm: 36, md: 48, lg: 72, xl: 120 };

export default function AvatarImage({
  src,
  name,
  initials,
  color = '#6C5CE7',
  size = 'md',
  className = '',
  stockIndex = 0,
}: AvatarImageProps) {
  const px = sizeMap[size];
  const resolved = resolveAvatar(src, stockIndex);

  if (resolved) {
    return (
      <div
        className={`${styles.wrapper} ${styles[size]} ${className}`}
        style={{ width: px, height: px, minWidth: px }}
      >
        <Image
          src={resolved}
          alt={name}
          width={px}
          height={px}
          className={styles.img}
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={`${styles.wrapper} ${styles.fallback} ${styles[size]} ${className}`}
      style={{ width: px, height: px, minWidth: px, background: `linear-gradient(135deg, ${color}, ${color}88)` }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

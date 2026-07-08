'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getCategoryStockImage } from '@/lib/stock-images';
import styles from './CategoryImage.module.css';

interface CategoryImageProps {
  name: string;
  imageUrl?: string | null;
}

export default function CategoryImage({ name, imageUrl }: CategoryImageProps) {
  const fallback = getCategoryStockImage(name);
  const [src, setSrc] = useState(imageUrl || fallback);

  return (
    <Image
      src={src}
      alt={name}
      fill
      className={styles.image}
      unoptimized
      onError={() => {
        if (src !== fallback) setSrc(fallback);
      }}
    />
  );
}

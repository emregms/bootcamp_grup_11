/**
 * Stok görseller — Unsplash (ücretsiz, hotlink destekli)
 * Kategori, mentor ve hizmet kapak görselleri
 */

const U = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const CATEGORY_STOCK_IMAGES: Record<string, string> = {
  'Yazılım Geliştirme': U('photo-1461749280684-dccba630e2f6'),
  'Tasarım & UX': U('photo-1561070791-2526d30994b5'),
  'Veri Bilimi & AI': U('photo-1555949963-aa79dcee981c'),
  'Dijital Pazarlama': U('photo-1460925895917-afdab827c52f'),
  'Müzik & Ses': U('photo-1511379938543-c1f69419868d'),
  'Fotoğrafçılık': U('photo-1452587925148-ce544e77e70e'),
  'Dil Eğitimi': U('photo-1546410531-bb4ca7796e27'),
  'İş & Finans': U('photo-1554224155-6726b3ff858f'),
  'Kişisel Gelişim': U('photo-1507003211169-0a1dd7228f2d'),
  'Spor & Sağlık': U('photo-1571019614242-c5c5dee9f50e'),
  'Yemek & Mutfak': U('photo-1556910103-1c02745aae4d'),
  'El Sanatları': U('photo-1452860600638-524486df92f5'),
};

export const MENTOR_STOCK_AVATARS = [
  U('photo-1494790108377-be9c29b29330', 400),
  U('photo-1507003211169-0a1dd7228f2d', 400),
  U('photo-1438761681033-6461ffad8d80', 400),
  U('photo-1472099645785-5658abf4ff4e', 400),
  U('photo-1544005313-94ddf0286df2', 400),
  U('photo-1534528741775-53994a69daeb', 400),
  U('photo-1500648767791-00dcc994a43e', 400),
  U('photo-1517841905240-472988babdf9', 400),
  U('photo-1539571696357-5a19293217fa', 400),
  U('photo-1580489944761-15a19d654956', 400),
  U('photo-1573496359142-b8d87734a5a2', 400),
  U('photo-1560250097-0b93528c311a', 400),
];

/** Hizmet oluştururken seçilebilecek stok kapak galerisi */
export const LESSON_STOCK_COVERS = [
  { label: 'Kodlama', url: U('photo-1461749280684-dccba630e2f6') },
  { label: 'Tasarım', url: U('photo-1561070791-2526d30994b5') },
  { label: 'Veri Bilimi', url: U('photo-1555949963-aa79dcee981c') },
  { label: 'Pazarlama', url: U('photo-1460925895917-afdab827c52f') },
  { label: 'Müzik', url: U('photo-1511379938543-c1f69419868d') },
  { label: 'Fotoğraf', url: U('photo-1452587925148-ce544e77e70e') },
  { label: 'Dil', url: U('photo-1546410531-bb4ca7796e27') },
  { label: 'Finans', url: U('photo-1554224155-6726b3ff858f') },
  { label: 'Koçluk', url: U('photo-1522202176988-66273c2fd55f') },
  { label: 'Fitness', url: U('photo-1571019614242-c5c5dee9f50e') },
  { label: 'Mutfak', url: U('photo-1556910103-1c02745aae4d') },
  { label: 'Online Ders', url: U('photo-1524178232363-1fb2b075b655') },
];

const DEFAULT_COVER = U('photo-1524178232363-1fb2b075b655');

export function getCategoryStockImage(category: string): string {
  return CATEGORY_STOCK_IMAGES[category] ?? DEFAULT_COVER;
}

export function getMentorStockAvatar(index: number): string {
  return MENTOR_STOCK_AVATARS[index % MENTOR_STOCK_AVATARS.length];
}

export function getLessonStockCover(category: string, seed = 0): string {
  const covers = LESSON_STOCK_COVERS.filter((c) =>
    CATEGORY_STOCK_IMAGES[category]?.includes(c.url.split('photo-')[1]?.split('?')[0] ?? '')
  );
  if (covers.length > 0) {
    return covers[seed % covers.length].url;
  }
  return getCategoryStockImage(category);
}

/** coverImage yoksa kategori stok görseline düş */
export function resolveLessonCover(coverImage: string | null | undefined, category: string): string {
  return coverImage || getCategoryStockImage(category);
}

export function resolveAvatar(avatar: string | null | undefined, fallbackIndex = 0): string | null {
  return avatar || getMentorStockAvatar(fallbackIndex);
}

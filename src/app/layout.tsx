import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';
import { AuthProvider } from '@/contexts/AuthContext';
import { appConfig } from '@/lib/env';

const siteUrl = appConfig.url;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'SkillBridge — C2C Mentorluk ve Beceri Takası Platformu',
  description:
    'Becerilerini paylaş, yenilerini kazan. Eğitim verenler ile alanları buluşturan, para harcamadan beceri takası yapabilme özelliğiyle fark yaratan mentorluk platformu.',
  keywords: 'mentorluk, beceri takası, eğitim, online ders, mentor, menti, skill exchange',
  applicationName: 'SkillBridge',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: siteUrl,
    siteName: 'SkillBridge',
    title: 'SkillBridge — C2C Mentorluk ve Beceri Takası Platformu',
    description:
      'Becerilerini paylaş, yenilerini kazan. Para harcamadan beceri takası yap, mentor bul, sertifika al.',
    images: [
      {
        url: '/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'SkillBridge — C2C Mentorluk ve Beceri Takası Platformu',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillBridge — C2C Mentorluk ve Beceri Takası Platformu',
    description:
      'Becerilerini paylaş, yenilerini kazan. Para harcamadan beceri takası yap, mentor bul, sertifika al.',
    images: ['/opengraph-image.png'],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ paddingTop: 'var(--navbar-height)' }}>
            {children}
          </main>
          <Footer />
          <ChatbotWidget />
        </AuthProvider>
      </body>
    </html>
  );
}

import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata: Metadata = {
  title: 'SkillBridge — C2C Mentorluk ve Beceri Takası Platformu',
  description: 'Becerilerini paylaş, yenilerini kazan. Eğitim verenler ile alanları buluşturan, para harcamadan beceri takası yapabilme özelliğiyle fark yaratan mentorluk platformu.',
  keywords: 'mentorluk, beceri takası, eğitim, online ders, mentor, menti, skill exchange',
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

import Link from 'next/link';
import { Zap, Globe, Hash, Link2, Camera, Mail, MapPin, Phone } from 'lucide-react';
import styles from './Footer.module.css';

const footerLinks = {
  platform: [
    { label: 'Keşfet', href: '/explore' },
    { label: 'Nasıl Çalışır?', href: '/#how-it-works' },
    { label: 'Eşleşme', href: '/match' },
    { label: 'Fiyatlandırma', href: '/#pricing' },
  ],
  resources: [
    { label: 'Yardım Merkezi', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Topluluk', href: '#' },
    { label: 'API Dokümantasyonu', href: '#' },
  ],
  legal: [
    { label: 'Gizlilik Politikası', href: '#' },
    { label: 'Kullanım Koşulları', href: '#' },
    { label: 'KVKK', href: '#' },
    { label: 'Çerez Politikası', href: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand Column */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <Zap size={18} />
              </div>
              <span className={styles.logoText}>
                Skill<span className={styles.logoAccent}>Bridge</span>
              </span>
            </Link>
            <p className={styles.brandDesc}>
              Becerilerini paylaş, yenilerini kazan. Türkiye&apos;nin en büyük C2C mentorluk ve beceri takası platformu.
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.socialLink} aria-label="Twitter"><Hash size={18} /></a>
              <a href="#" className={styles.socialLink} aria-label="LinkedIn"><Link2 size={18} /></a>
              <a href="#" className={styles.socialLink} aria-label="Instagram"><Camera size={18} /></a>
              <a href="#" className={styles.socialLink} aria-label="GitHub"><Globe size={18} /></a>
            </div>
          </div>

          {/* Links Columns */}
          <div className={styles.linkGroup}>
            <h4>Platform</h4>
            <ul>
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h4>Kaynaklar</h4>
            <ul>
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h4>Yasal</h4>
            <ul>
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Bar */}
        <div className={styles.contactBar}>
          <div className={styles.contactItem}>
            <Mail size={16} />
            <span>info@skillbridge.com.tr</span>
          </div>
          <div className={styles.contactItem}>
            <Phone size={16} />
            <span>+90 (212) 555 0123</span>
          </div>
          <div className={styles.contactItem}>
            <MapPin size={16} />
            <span>İstanbul, Türkiye</span>
          </div>
        </div>

        {/* Bottom */}
        <div className={styles.bottom}>
          <p>&copy; 2026 SkillBridge. Tüm hakları saklıdır.</p>
          <p className={styles.madeWith}>
            💜 ile yapıldı
          </p>
        </div>
      </div>
    </footer>
  );
}

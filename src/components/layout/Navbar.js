'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Bell, Menu, X, Coins, MessageSquare,
  Home, Compass, LayoutDashboard, Users, Award,
  Settings, LogIn, Zap
} from 'lucide-react';
import { currentUser, notifications } from '@/data/mock';
import styles from './Navbar.module.css';

const navLinks = [
  { href: '/', label: 'Ana Sayfa', icon: Home },
  { href: '/explore', label: 'Keşfet', icon: Compass },
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/match', label: 'Eşleşme', icon: Users },
  { href: '/chat', label: 'Mesajlar', icon: MessageSquare },
  { href: '/certificates', label: 'Sertifikalar', icon: Award },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const unreadMessages = 3;

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.container}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Zap size={22} />
            </div>
            <span className={styles.logoText}>
              Skill<span className={styles.logoAccent}>Bridge</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className={styles.navLinks}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                  {link.href === '/chat' && unreadMessages > 0 && (
                    <span className={styles.unreadDot} />
                  )}
                  {isActive && (
                    <motion.div
                      className={styles.activeIndicator}
                      layoutId="activeNav"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className={styles.actions}>
            {/* Credits */}
            <Link href="/dashboard" className={styles.creditBadge}>
              <Coins size={16} />
              <span>{currentUser.credits}</span>
            </Link>

            {/* Notifications */}
            <div className={styles.notifWrapper}>
              <button
                className={styles.iconBtn}
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Bildirimler"
              >
                <Bell size={20} />
                {unreadNotifs > 0 && (
                  <span className={styles.notifBadge}>{unreadNotifs}</span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    className={styles.notifDropdown}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={styles.notifHeader}>
                      <h4>Bildirimler</h4>
                      <button className={styles.markRead}>Tümünü Oku</button>
                    </div>
                    <div className={styles.notifList}>
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`${styles.notifItem} ${!n.read ? styles.unread : ''}`}
                        >
                          <p>{n.text}</p>
                          <span className={styles.notifTime}>{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Avatar */}
            <Link href="/settings" className={styles.userAvatar}>
              <span>{currentUser.initials}</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className={styles.mobileToggle}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menü"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className={styles.mobileMenu}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className={styles.mobileUser}>
                <div className={styles.mobileAvatar}>
                  <span>{currentUser.initials}</span>
                </div>
                <div>
                  <p className={styles.mobileUserName}>{currentUser.name}</p>
                  <p className={styles.mobileUserCredits}>
                    <Coins size={14} /> {currentUser.credits} Kredi
                  </p>
                </div>
              </div>

              <div className={styles.mobileLinks}>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ''}`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <Icon size={20} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
                <Link
                  href="/settings"
                  className={styles.mobileLink}
                  onClick={() => setMobileOpen(false)}
                >
                  <Settings size={20} />
                  <span>Ayarlar</span>
                </Link>
              </div>

              <div className={styles.mobileFooter}>
                <Link
                  href="/auth"
                  className={`btn btn-gradient ${styles.mobileLoginBtn}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <LogIn size={18} />
                  Giriş Yap
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

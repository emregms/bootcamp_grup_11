'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Menu, X, Coins, MessageSquare,
  Home, Compass, LayoutDashboard, Users, Award,
  Settings, LogIn, Zap, LogOut,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPatch } from '@/lib/api/client';
import type { Notification, UserProfile } from '@/types/models';
import { notifications as mockNotifications } from '@/data/mock';
import styles from './Navbar.module.css';

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navLinks: NavLink[] = [
  { href: '/', label: 'Ana Sayfa', icon: Home },
  { href: '/explore', label: 'Keşfet', icon: Compass },
  { href: '/dashboard', label: 'Panel', icon: LayoutDashboard },
  { href: '/match', label: 'Eşleşme', icon: Users },
  { href: '/chat', label: 'Mesajlar', icon: MessageSquare },
  { href: '/certificates', label: 'Sertifikalar', icon: Award },
];

type DisplayUser = Pick<UserProfile, 'name' | 'initials' | 'credits'>;

export default function Navbar() {
  const pathname = usePathname();
  const { profile, user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications as unknown as Notification[]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      apiGet('/api/notifications')
        .then((data) => {
          const res = data as { notifications?: Notification[] };
          if (res.notifications?.length) setNotifications(res.notifications);
        })
        .catch(() => {});
    }
  }, [user]);

  const displayUser: DisplayUser = profile
    ? { name: profile.name, initials: profile.initials, credits: profile.credits }
    : { name: 'Misafir', initials: 'M', credits: 0 };
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    try {
      await apiPatch('/api/notifications', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  }

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Zap size={22} />
            </div>
            <span className={styles.logoText}>
              Skill<span className={styles.logoAccent}>Bridge</span>
            </span>
          </Link>

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

          <div className={styles.actions}>
            {user ? (
              <>
                <Link href="/dashboard" className={styles.creditBadge}>
                  <Coins size={16} />
                  <span>{displayUser.credits ?? 0}</span>
                </Link>

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
                          <button className={styles.markRead} onClick={markAllRead}>Tümünü Oku</button>
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

                <Link href="/settings" className={styles.userAvatar}>
                  <span>{displayUser.initials}</span>
                </Link>
              </>
            ) : (
              <Link href="/auth" className="btn btn-gradient btn-sm">
                <LogIn size={16} /> Giriş Yap
              </Link>
            )}

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
                  <span>{displayUser.initials}</span>
                </div>
                <div>
                  <p className={styles.mobileUserName}>{displayUser.name}</p>
                  {user && (
                    <p className={styles.mobileUserCredits}>
                      <Coins size={14} /> {displayUser.credits ?? 0} Kredi
                    </p>
                  )}
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
                {user && (
                  <Link href="/settings" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>
                    <Settings size={20} />
                    <span>Ayarlar</span>
                  </Link>
                )}
              </div>

              <div className={styles.mobileFooter}>
                {user ? (
                  <button className={`btn btn-secondary ${styles.mobileLoginBtn}`} onClick={() => { signOut(); setMobileOpen(false); }}>
                    <LogOut size={18} /> Çıkış Yap
                  </button>
                ) : (
                  <Link href="/auth" className={`btn btn-gradient ${styles.mobileLoginBtn}`} onClick={() => setMobileOpen(false)}>
                    <LogIn size={18} /> Giriş Yap
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

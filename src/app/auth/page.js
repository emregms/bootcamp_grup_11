'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Globe, Monitor } from 'lucide-react';
import styles from './page.module.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
      </div>

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.cardHeader}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}><Zap size={20} /></div>
            <span>Skill<span className="text-gradient">Bridge</span></span>
          </Link>
          <h1>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</h1>
          <p>{isLogin ? 'Hesabınıza giriş yaparak devam edin' : 'Yeni bir hesap oluşturun ve beceri takasına başlayın'}</p>
        </div>

        {/* Social Auth */}
        <div className={styles.socialButtons}>
          <button className={styles.socialBtn}>
            <Monitor size={18} />
            Google ile {isLogin ? 'Giriş' : 'Kayıt'}
          </button>
          <button className={styles.socialBtn}>
            <Globe size={18} />
            GitHub ile {isLogin ? 'Giriş' : 'Kayıt'}
          </button>
        </div>

        <div className={styles.divider}>
          <span>veya</span>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <User size={18} className={styles.inputIcon} />
              <input type="text" placeholder="Ad Soyad" className={styles.input} />
            </div>
          )}

          <div className={styles.inputGroup}>
            <Mail size={18} className={styles.inputIcon} />
            <input type="email" placeholder="E-posta adresi" className={styles.input} />
          </div>

          <div className={styles.inputGroup}>
            <Lock size={18} className={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Şifre"
              className={styles.input}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {isLogin && (
            <div className={styles.formOptions}>
              <label className={styles.remember}>
                <input type="checkbox" /> Beni Hatırla
              </label>
              <a href="#" className={styles.forgot}>Şifremi Unuttum</a>
            </div>
          )}

          {!isLogin && (
            <label className={styles.terms}>
              <input type="checkbox" />
              <span><a href="#">Kullanım koşullarını</a> ve <a href="#">gizlilik politikasını</a> kabul ediyorum</span>
            </label>
          )}

          <button type="submit" className="btn btn-gradient btn-lg w-full">
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className={styles.switchAuth}>
          {isLogin ? 'Hesabınız yok mu? ' : 'Zaten hesabınız var mı? '}
          <button onClick={() => setIsLogin(!isLogin)} className={styles.switchBtn}>
            {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

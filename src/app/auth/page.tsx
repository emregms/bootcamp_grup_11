'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Globe, Monitor, AlertCircle } from 'lucide-react';
import { signIn, signUp, signInWithOAuth } from '@/lib/auth/actions';
import styles from './page.module.css';

type OAuthProvider = 'google' | 'github';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) setError('Giriş başarısız. Tekrar deneyin.');
  }, []);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError('');
    try {
      const action = isLogin ? signIn : signUp;
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch {
      // redirect throws — başarılı giriş
    }
  }

  async function handleOAuth(provider: OAuthProvider) {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithOAuth(provider);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch {
      // redirect
    }
  }

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

        <div style={{
          background: 'rgba(108,92,231,0.1)',
          border: '1px solid rgba(108,92,231,0.3)',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px',
          fontSize: '13px',
          lineHeight: 1.5,
        }}>
          <strong>🎯 Demo Hesap (Yarışma):</strong><br />
          demo@skillbridge.com / Demo123!<br />
          <small style={{ opacity: 0.8 }}>Kullanıcı: Deniz Yılmaz</small>
        </div>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,118,117,0.1)', border: '1px solid rgba(255,118,117,0.3)',
            borderRadius: '8px', padding: '10px 14px', marginBottom: '16px',
            color: 'var(--error)', fontSize: '14px',
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className={styles.socialButtons}>
          <button type="button" className={styles.socialBtn} onClick={() => handleOAuth('google')} disabled={loading}>
            <Monitor size={18} />
            Google ile {isLogin ? 'Giriş' : 'Kayıt'}
          </button>
          <button type="button" className={styles.socialBtn} onClick={() => handleOAuth('github')} disabled={loading}>
            <Globe size={18} />
            GitHub ile {isLogin ? 'Giriş' : 'Kayıt'}
          </button>
        </div>

        <div className={styles.divider}>
          <span>veya</span>
        </div>

        <form className={styles.form} action={handleSubmit}>
          {!isLogin && (
            <div className={styles.inputGroup}>
              <User size={18} className={styles.inputIcon} />
              <input type="text" name="fullName" placeholder="Ad Soyad" className={styles.input} required />
            </div>
          )}

          <div className={styles.inputGroup}>
            <Mail size={18} className={styles.inputIcon} />
            <input type="email" name="email" placeholder="E-posta adresi" className={styles.input} required />
          </div>

          <div className={styles.inputGroup}>
            <Lock size={18} className={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Şifre"
              className={styles.input}
              required
              minLength={6}
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
              <input type="checkbox" required />
              <span><a href="#">Kullanım koşullarını</a> ve <a href="#">gizlilik politikasını</a> kabul ediyorum</span>
            </label>
          )}

          <button type="submit" className="btn btn-gradient btn-lg w-full" disabled={loading}>
            {loading ? 'Yükleniyor...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className={styles.switchAuth}>
          {isLogin ? 'Hesabınız yok mu? ' : 'Zaten hesabınız var mı? '}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className={styles.switchBtn}>
            {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

# SkillBridge — Kurulum Rehberi (Yarışma Demo)

## 1. Supabase Hesabı

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**
2. Proje adı: `skillbridge` (veya istediğiniz)
3. Database password kaydedin
4. Region: **Frankfurt** (Türkiye'ye en yakın)

## 2. Ortam Değişkenleri

```bash
npm run setup
# veya: cp env/.env.local.example .env.local
```

`.env.local` dosyasını düzenleyin:

| Değişken | Nereden |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dashboard → API → `anon` `public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Dashboard → API → `service_role` (gizli!) |

## 3. Veritabanı Migration

**Seçenek A — Supabase CLI (önerilen):**
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
npm run db:push
```

**Seçenek B — SQL Editor:**
Dashboard → SQL Editor → `supabase/migrations/` dosyalarını **sırayla** çalıştırın.

## 4. Demo Veriyi Yükle

```bash
npm run db:seed
```

Bu komut oluşturur:
- **13 demo kullanıcı** (1 ana demo + 12 mentor)
- **8 ders**, **3 yaklaşan seans**
- **Kredi geçmişi**, **bildirimler**, **sertifikalar**, **rozetler**
- **Mesajlaşma** (Elif ↔ Deniz konuşması)
- **Takas grupları**

## 5. Uygulamayı Başlat

```bash
npm install
npm run dev
```

Tarayıcı: [http://localhost:3000](http://localhost:3000)

## 🎯 Demo Giriş (Jüri İçin)

| Alan | Değer |
|------|-------|
| E-posta | `demo@skillbridge.com` |
| Şifre | `Demo123!` |
| Demo kullanıcı | Deniz Yılmaz (kurgusal profil) |

Tüm mentor hesapları: `elif@demo.skillbridge.com`, `ahmet@demo.skillbridge.com` vb. — aynı şifre.

## Auth Ayarları (Supabase Dashboard)

Authentication → URL Configuration:
- Site URL: `https://skillbridge.hegg.tr`
- Redirect URLs:
  - `https://skillbridge.hegg.tr/auth/callback`
  - `http://localhost:3000/auth/callback` (yerel geliştirme)

Email confirmation: **kapalı** (demo için)
Authentication → Providers → Email → Confirm email: OFF

## Gemini AI

1. [Google AI Studio](https://aistudio.google.com/apikey) → API key oluştur
2. `.env.local` → `GEMINI_API_KEY=...` yapıştır
3. Chatbot ve quiz Gemini ile çalışır; key yoksa fallback mod devreye girer

## Sorun Giderme

| Sorun | Çözüm |
|-------|-------|
| `/api/health` 503 | `.env.local` key'leri kontrol edin |
| Giriş yapılamıyor | `npm run db:seed` çalıştırın |
| Mentor listesi boş | Migration + seed uygulayın |
| OAuth çalışmıyor | Google/GitHub provider'ı Dashboard'dan açın |

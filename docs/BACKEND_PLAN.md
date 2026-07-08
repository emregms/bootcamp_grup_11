# SkillBridge — Backend Yazılım Planı

> C2C Mentorluk ve Beceri Takası Platformu  
> Sprint 2 hedefi: Mock veriden Supabase + Next.js API'ye geçiş

---

## 1. Mimari Özet

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 16 (App Router)                  │
├─────────────────────────────────────────────────────────────┤
│  src/app/          │  UI sayfaları (client + server)        │
│  src/components/   │  Reusable UI                           │
│  src/lib/          │  Supabase client, servisler, utils     │
│  src/app/api/      │  Route Handlers (REST)                 │
├─────────────────────────────────────────────────────────────┤
│                     Supabase                                 │
│  Auth (JWT)  │  PostgreSQL  │  Realtime  │  Storage        │
└─────────────────────────────────────────────────────────────┘
```

**Backend = Supabase (BaaS) + Next.js Route Handlers**

Ayrı bir Node/Express sunucusu yok. İş mantığı:
- Basit CRUD → doğrudan Supabase client (RLS korumalı)
- Karmaşık işlemler (kredi transferi, eşleşme) → `src/app/api/` Route Handlers + service role (gerekirse)

---

## 2. Veritabanı Katmanı (Tamamlandı ✓)

Migration dosyaları `supabase/migrations/` altında:

| Migration | İçerik |
|-----------|--------|
| `120000` | Extension, enum tipleri |
| `120100` | `profiles` + auth trigger |
| `120200` | `categories`, `skills`, `user_skills` |
| `120300` | `lessons`, `sessions`, `swap_groups` |
| `120400` | `credit_transactions`, `reviews` |
| `120500` | `conversations`, `messages` |
| `120600` | `certificates`, `badges`, `notifications`, `quiz_*` |
| `120700` | RLS politikaları + Realtime |
| `120800` | Seed data (kategoriler, beceriler, rozetler) |

### Uygulama

```bash
# Cloud Supabase
supabase link --project-ref YOUR_REF
supabase db push

# veya SQL Editor'de migration dosyalarını sırayla çalıştır
```

---

## 3. Backend Modülleri ve Öncelik Sırası

### Faz 1 — Temel Altyapı (Sprint 2, Hafta 1) ← ŞİMDİ

| # | Modül | Dosya / Konum | Durum |
|---|-------|---------------|-------|
| 1 | Supabase client (browser) | `src/lib/supabase/client.js` | ✓ |
| 2 | Supabase client (server) | `src/lib/supabase/server.js` | ✓ |
| 3 | Auth middleware | `src/middleware.js` | ✓ |
| 4 | Env şablonları | `env/.env.local.example` | ✓ |
| 5 | Auth: kayıt / giriş | `src/app/auth/` + `src/lib/auth/` | Planlandı |
| 6 | Profil CRUD | `src/lib/services/profiles.js` | Planlandı |

### Faz 2 — MVP Veri Akışı (Sprint 2, Hafta 2)

| # | Modül | API / Servis | Mock → DB |
|---|-------|--------------|-----------|
| 7 | Mentor listesi | `GET /api/mentors` | `mentors[]` |
| 8 | Ders listesi | `GET /api/lessons` | `lessons[]` |
| 9 | Kategori keşfet | `GET /api/categories` | `categories[]` |
| 10 | Dashboard özeti | `GET /api/dashboard` | `currentUser`, `creditHistory` |
| 11 | Kredi geçmişi | `GET /api/credits` | `creditHistory[]` |

### Faz 3 — Etkileşim (Sprint 2-3)

| # | Modül | Açıklama |
|---|-------|----------|
| 12 | Seans oluşturma | Takas/ücretli ders rezervasyonu |
| 13 | Kredi transferi | Seans tamamlanınca otomatik kredi hareketi (DB function) |
| 14 | Mesajlaşma | Supabase Realtime ile chat |
| 15 | Bildirimler | Realtime + in-app notification listesi |
| 16 | Değerlendirme | Seans sonrası review + rating güncelleme |

### Faz 4 — Gelişmiş (Sprint 3+)

| # | Modül | Açıklama |
|---|-------|----------|
| 17 | Akıllı eşleşme | `user_skills` + `learning_interests` skor algoritması |
| 18 | Google Meet link | Seans oluşturulunca otomatik meet URL |
| 19 | Chat Quiz (AI) | OpenAI API + `quiz_attempts` |
| 20 | Sertifika üretimi | Quiz geçince `certificates` insert |
| 21 | Ödeme havuzu | Stripe entegrasyonu (ücretli dersler) |
| 22 | Chatbot | Platform navigasyon asistanı |

---

## 4. API Route Tasarımı

```
/api/auth/callback          POST   OAuth callback
/api/profiles/[id]          GET    Profil detay
/api/profiles/me            GET    Oturum açmış kullanıcı
/api/profiles/me            PATCH  Profil güncelle

/api/mentors                GET    ?category=&skill=&swap=
/api/lessons                GET    ?mentorId=&category=
/api/lessons                POST   Yeni ders (mentor)
/api/lessons/[id]/enroll    POST   Derse kayıt

/api/sessions               GET    Kullanıcının seansları
/api/sessions               POST   Seans oluştur
/api/sessions/[id]/complete POST   Seans tamamla + kredi transferi

/api/credits                GET    Kredi geçmişi
/api/reviews                POST   Değerlendirme yaz

/api/conversations          GET    Konuşma listesi
/api/conversations/[id]/messages  GET/POST

/api/match/suggestions      GET    Eşleşme önerileri
/api/notifications          GET    Bildirimler
```

---

## 5. Servis Katmanı Yapısı

```
src/lib/
├── supabase/
│   ├── client.js          # Browser client
│   ├── server.js          # Server Component / Route Handler
│   └── middleware.js      # Session yenileme
├── auth/
│   ├── actions.js         # signUp, signIn, signOut (Server Actions)
│   └── session.js         # getSession helper
├── services/
│   ├── profiles.js
│   ├── lessons.js
│   ├── sessions.js
│   ├── credits.js
│   ├── messaging.js
│   └── matching.js
└── env.js                 # Ortam değişkeni doğrulama
```

---

## 6. Auth Akışı

```
Kayıt (email/password veya OAuth)
    → Supabase Auth (auth.users)
    → Trigger: profiles satırı oluştur (100 kredi bonus)
    → credit_transactions: "Hoş geldin bonusu" (+10)

Giriş
    → Supabase session cookie
    → middleware: session refresh
    → Korumalı sayfalar: /dashboard, /chat, /settings
```

OAuth sağlayıcılar (Supabase Dashboard'dan açılır):
- Google
- GitHub

---

## 7. Kredi Mekanizması (İş Kuralları)

| Olay | İşlem |
|------|-------|
| Yeni kayıt | +100 başlangıç bakiyesi (profil default) |
| Hoş geldin bonusu | +10 (credit_transactions) |
| Ders verme (tamamlanan seans) | Mentor: +swap_credits |
| Ders alma (takas) | Mentee: -swap_credits |
| Seans iptali (24s öncesi) | Tam iade |
| Seans iptali (geç) | Kısmi ceza (gelecek sprint) |

> Kredi transferi **PostgreSQL function** ile atomik yapılmalı (race condition önleme).

---

## 8. Eşleşme Algoritması (Basit MVP)

```javascript
score = (
  skillOverlap * 0.4 +        // öğrenmek istediği ↔ mentor'un öğretebildiği
  categoryMatch * 0.3 +       // kategori uyumu
  acceptsSwap * 0.2 +         // takas uygunluğu
  ratingNormalized * 0.1      // mentor puanı
)
```

Veri kaynağı: `user_skills`, `profiles.learning_interests`, `user_categories`

---

## 9. Realtime Kullanımı

| Tablo | Kullanım |
|-------|----------|
| `messages` | Chat anlık mesaj |
| `notifications` | Anlık bildirim badge |
| `sessions` | Seans durumu güncellemesi (opsiyonel) |

---

## 10. Güvenlik Kontrol Listesi

- [x] RLS tüm tablolarda aktif
- [x] Service role key yalnızca server-side
- [ ] Rate limiting (API routes)
- [ ] Input validation (Zod)
- [ ] CORS / auth callback URL whitelist
- [ ] Storage bucket policies (avatar upload)

---

## 11. Ekip Görev Dağılımı Önerisi

| Kişi / Rol | Sorumluluk |
|------------|------------|
| Backend lead | Migration, RLS, API routes, kredi logic |
| Auth & profil | Auth sayfası + Supabase Auth entegrasyonu |
| Mentor/Ders | explore, mentor, lesson sayfalarını DB'ye bağlama |
| Chat & Realtime | messaging servisi + chat UI |
| Eşleşme | matching algoritması + match sayfası |

---

## 12. Sonraki Adımlar (Hemen Yapılacaklar)

1. **Supabase projesi oluştur** → Dashboard'da yeni proje
2. **Migration'ları uygula** → `supabase db push` veya SQL Editor
3. **`.env.local` doldur** → `cp env/.env.local.example .env.local`
4. **`npm install`** → Supabase paketleri kuruldu
5. **Auth entegrasyonu** → `src/app/auth/page.js` formunu Supabase'e bağla
6. **İlk API route** → `GET /api/mentors` ile explore sayfasını canlı veriye geçir

---

## 13. Komutlar

```bash
# Bağımlılıklar
npm install

# Local Supabase
supabase start
supabase db push
supabase status

# Geliştirme
npm run dev

# Migration oluşturma (ileride)
supabase migration new migration_name
```

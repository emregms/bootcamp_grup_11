# Sprint 3 Günlük Scrum Toplantı Notları

Bu belgede, Grup 11'in Sprint 3 sürecinde gerçekleştirdiği toplantıların detayları, gündemleri ve alınan kararlar yer almaktadır.

---

## 📊 Sprint Metrikleri & Puanlama

* **Hedeflenen Toplam Puan:** 35 Story Point (SP)
* **Tamamlanan Puan:** 30 Story Point (SP)
* **Tamamlanma Oranı:** %85.7

---

## 📅 21 Temmuz 2026 | Backend API, Auth Düzeltmeleri ve TypeScript Migrasyon Toplantısı

**Katılımcılar:** Tüm Ekip (6 Kişi)

**Süre:** 55 Dakika

**Odak Noktası:** Mock veriden Supabase + Next.js API'ye geçiş, Auth/login oturum hatasının çözümü ve TypeScript dönüşümü.

### 📋 Ekip Durum Güncellemeleri (Status Updates)

**Backend & Full-Stack Sorumlusu:**

- **Ne yapıldı?:** 21 adet REST API endpoint'i tamamlandı. Supabase `handle_new_user` trigger'ının sorunsuz çalıştığı doğrulandı. 12 migration dosyası ile profiles, lessons, messaging, certificates, quiz ve RLS politikaları uygulandı. Demo seed script ile 13 kullanıcı ve 8 ders yüklendi.
- **Ne yapılacak?:** Login sonrası RLS politikalarının `auth.uid()` kontrollerinin gözden geçirilmesi, explore ve mentor sayfalarının canlı API'ye geçirilmesi.
- **Engelleyici (Blocker):** Yok.

**Frontend Geliştirme Ekibi:**

- **Ne yapıldı?:** Tüm `src/` dizini TypeScript'e taşındı. Docker ve Coolify deploy konfigürasyonu hazırlandı. Ortam değişkenleri `env/.env.local.example` şablonu ile standartlaştırıldı.
- **Ne yapılacak?:** Next.js `@supabase/ssr` middleware yapılandırmasında çerez (cookie) yönetiminin düzeltilmesi ve login akışındaki yönlendirme hatasının çözülmesi.
- **Engelleyici (Blocker):** Yok.

### 🎯 Alınan Kararlar & Teknik Notlar

- **Giriş (Login) Problemi Tespiti:** Kullanıcı kayıt olduğunda veri tabanına yazılıyor ancak giriş yapmaya çalıştığında Next.js App Router oturum token'ını okuyamadığı için tarayıcıda yetkisiz kullanıcı durumuna düşüyor. Middleware katmanında çerez senkronizasyonunun düzeltilmesine karar verildi. (Puan: 5 SP)
- **Hibrit Veri Modeli:** API hata durumunda mock fallback kullanılacak şekilde kararlaştırıldı.
- **AI Altyapısı Geçişi:** OpenAI yerine **Google Gemini** (`gemini-2.0-flash-lite`) modeline geçiş onaylandı.
- **Puanlama (Planning Poker):** Kalan tüm backlog işleri puanlandı ve bu sprintte 35 SP işin üstlenilmesi kararlaştırıldı.

---

## 📅 30 Temmuz 2026 | ML Eşleşme Algoritması, Mesajlaşma ve Sertifikasyon Toplantısı

**Katılımcılar:** Tüm Ekip (6 Kişi)

**Süre:** 60 Dakika

**Odak Noktası:** SkillBridgeMatcher ML algoritması, match/chat UI yenileme, AI quiz/sertifika akışı.

### 📋 Ekip Durum Güncellemeleri (Status Updates)

**Backend & Full-Stack Sorumlusu:**

- **Ne yapıldı?:** `pgvector` fonksiyonları güncellendi. Cosine Similarity hesaplayan PostgreSQL fonksiyonu yazıldı. Eşleşme skor algoritması ve takas grupları API'ye bağlandı. Mesajlaşma REST API ile Supabase'e entegre edildi. AI Quiz modülü Gemini ile soru üretimi yapıyor; %70+ skorda otomatik sertifika oluşturuluyor.
- **Ne yapılacak?:** Supabase Realtime mesajlaşma aboneliği, quiz ve sertifika tablolarının veri doğrulaması.
- **Engelleyici (Blocker):** Yok.

**Frontend Geliştirme Ekibi:**

- **Ne yapıldı?:** Eşleşme sayfasına AI tarama animasyonu ve takas grubu kartları eklendi. Dashboard'a canlı aktivite banner'ı ve eşleşme badge'i entegre edildi. Chat UI bileşenleri yenilendi.
- **Ne yapılacak?:** Sprint 3 ekran görüntülerinin README'ye eklenmesi.
- **Engelleyici (Blocker):** Yok.

### 🎯 Alınan Kararlar & Teknik Notlar

- **ML Model Geliştirmesi (SkillBridgeMatcher):** Basit kategori eşleşmesi yerine vektörel semantik arama algoritmasına geçildi. Mentor arayan kullanıcılara ilgi alanlarına en yakın sonuçlar yüzde oranlarıyla sunulacak. (Puan: 8 SP)
- **Sertifikasyon:** Başarıyla tamamlanan dersler sonrasında dinamik sertifika üreten `/certificates` rotasının arayüzü ve backend bağları kuruldu. (Puan: 5 SP)
- **Canlı Önizleme:** Platform `https://skillbridge.hegg.tr/` adresinde tüm temel modüller test edilebilir durumda.
- **Demo Hesabı:** Jüri sunumu için `demo@skillbridge.com` / `Demo123!` demo kullanıcısı seed script ile oluşturuldu.

---

## 🗄️ Sprint 3 Kapsamında Tamamlanan Backend Modülleri

| Modül | API / Konum | Durum |
|-------|-------------|-------|
| Auth (email + OAuth) | `src/lib/auth/`, `/auth/callback` | ✓ |
| Mentor & Ders listesi | `/api/mentors`, `/api/lessons` | ✓ |
| Dashboard özeti | `/api/dashboard` | ✓ |
| Eşleşme önerileri (SkillBridgeMatcher) | `/api/match/suggestions`, `/api/match/join` | ✓ |
| Mesajlaşma | `/api/conversations`, `/api/conversations/[id]/messages` | ✓ |
| Bildirimler | `/api/notifications` | ✓ |
| AI Chatbot | `/api/ai/chat` (Gemini) | ✓ |
| AI Quiz & Sertifika | `/api/ai/quiz/[lessonId]` | ✓ |
| Ödeme havuzu | `/api/payment/checkout` | ✓ (simülasyon) |
| Görsel yükleme | `/api/upload` (Supabase Storage) | ✓ |

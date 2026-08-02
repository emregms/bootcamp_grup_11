# Sprint 3 Günlük Scrum Toplantı Notları

Bu döküman, C2C Mentorship platformunun 3. ve final Sprint sürecinde gerçekleştirilen detaylı toplantı notlarını, teknik hata analizlerini ve Story Point metriklerini içermektedir.

---

## 📊 Sprint Metrikleri & Puanlama
* **Hedeflenen Toplam Puan:** 35 Story Point (SP)
* **Tamamlanan Puan:** 30 Story Point (SP)
* **Tamamlanma Oranı:** %85.7

---

## 📅 21 Temmuz 2026 | Sprint 2 Eksikleri & Auth / Giriş Hata Analiz Toplantısı

* **Katılımcılar:** Tüm Ekip (5 Kişi)
* **Süre:** 55 Dakika
* **Odak Noktası:** Auth login bug'ının çözümü ve Sprint 3 eforunun puanlanması.

### 📋 Ekip Durum Güncellemeleri (Status Updates)
* **Veritabanı & Backend Sorumlusu (Sen):**
    * *Ne yapıldı?:* Supabase tarafındaki `handle_new_user` trigger'ının sorunsuz çalıştığı doğrulandı. Kayıt olunduğunda verilerin `public.users` tablosuna tıkır tıkır düştüğü teyit edildi.
    * *Ne yapılacak?:* Login sonrası RLS politikalarının oturum açmış kullanıcıyı doğrulaması için `auth.uid()` kontollerinin gözden geçirilmesi.
* **Frontend Ekibi:**
    * *Ne yapıldı?:* Kayıt ol ve Giriş yap arayüz tasarımları tamamlandı.
    * *Ne yapılacak?:* Next.js `@supabase/ssr` middleware yapılandırmasında çerez (cookie) yönetiminin bellenmesi ve login akışındaki yönlendirme hatasının çözülmesi.

### 🎯 Alınan Kararlar & Teknik Notlar
1. **Giriş (Login) Problemi Tespiti:** Kullanıcı kayıt olduğunda veri tabanına yazılıyor ancak giriş yapmaya çalıştığında Next.js App Router oturum token'ını okuyamadığı için tarayıcıda yetkisiz kullanıcı durumuna düşüyor. Middleware katmanında çerez senkronizasyonunun düzeltilmesine karar verildi. (Puan: 5 SP)
2. **Puanlama (Planning Poker):** Kalan tüm backlog işleri puanlandı ve bu sprintte 35 SP işin üstlenilmesi kararlaştırıldı.

---

## 📅 28 Temmuz 2026 | ML / Yapay Zeka Modeli Geliştirme & Sertifikasyon Toplantısı

* **Katılımcılar:** Tüm Ekip (5 Kişi)
* **Süre:** 60 Dakika
* **Odak Noktası:** ML eşleşme algoritmasının optimizasyonu ve sertifika modülü.

### 📋 Ekip Durum Güncellemeleri (Status Updates)
* **Veritabanı & Backend Sorumlusu (Sen):**
    * *Ne yapıldı?:* `pgvector` fonksiyonları güncellendi. Kullanıcı biyografileri ve beceri setleri üzerinden Cosine Similarity hesaplayan PostgreSQL fonksiyonu yazıldı.
    * *Ne yapılacak?:* Quiz ve sertifika tablolarının veri doğrulamasını yapmak.
* **Full-Stack & ML Ekibi:**
    * *Ne yapıldı?:* OpenAI `text-embedding-3-small` modeli Next.js API rotalarına entegre edildi. Kullanıcıların arama yaparken doğal dilde ("Bana Python öğretecek mentor bul") arama yapabilmesi sağlandı.

### 🎯 Alınan Kararlar & Teknik Notlar
1. **ML Model Geliştirmesi:** Basit kategori eşleşmesi yerine, vektörel semantik arama algoritmasına geçildi. Mentor arayan kullanıcılara ilgi alanlarına en yakın sonuçlar yüzde oranlarıyla sunulacak. (Puan: 8 SP)
2. **Sertifikasyon:** Başarıyla tamamlanan dersler sonrasında dinamik PDF sertifika üreten `/certificates` rotasının arayüzü ve backend bağları kuruldu. (Puan: 5 SP)

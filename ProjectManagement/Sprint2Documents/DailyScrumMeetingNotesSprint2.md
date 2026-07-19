Sprint 2 Günlük Scrum Toplantı Notları

📅 7 Temmuz 2026 | Sprint 1 Değerlendirme & Supabase Ortak Altyapı Toplantısı
Katılımcılar: Tüm Ekip (5 Kişi)

Süre: 50 Dakika

Odak Noktası: Geçmiş sprint çıktılarının kontrolü ve veritabanı erişimlerinin ortaklaştırılması.

📋 Ekip Durum Güncellemeleri (Status Updates)
Veritabanı & Backend Sorumlusu (Sen):

Ne yapıldı?: Supabase üzerinde users, skills, sessions ve transactions tabloları eksiksiz oluşturuldu. Veri güvenliği için Row Level Security (RLS) politikaları manuel olarak aktif edildi. Yeni kayıt olan kullanıcılara otomatik olarak 100 hoş geldin kredisi tanımlayan PostgreSQL tetikleyicisi (Trigger) başarıyla yazıldı ve test edildi. skills tablosuna frontend ekibinin arama testlerinde kullanabilmesi için 12 adet master ders verisi yüklendi.

Ne yapılacak?: pgvector eklentisinin aktif edilmesi ve profil metinlerini vektöre dönüştürecek altyapının araştırılması.

Engelleyici (Blocker): Yok.

Frontend Geliştirme Ekibi:

Ne yapıldı?: Next.js 16 projesinde Supabase Auth SSR kütüphane kurulumları tamamlandı. Giriş yap ve Kayıt ol sayfalarının temel UI tasarımları hazırlandı.

Ne yapılacak?: Backend'den gelen API anahtarlarının .env.local dosyasına entegre edilmesi ve kullanıcı arayüzü (Dashboard) prototipinin son haline getirilmesi.

Engelleyici (Blocker): Ortak veritabanı erişim yetkilerinin tanımlanması bekleniyordu.

🎯 Alınan Kararlar & Teknik Notlar
Ortak Çalışma Alanı: Tüm ekibin aynı veritabanı üzerinde test yapabilmesi için Supabase üzerinde ortak bir organizasyon hesabı kuruldu ve tüm ekibe erişim yetkisi tanımlandı.

Rebranding (İsim Değişikliği): Projenin ilk başta belirlenen geçici isminin değiştirilmesi, kurumsal kimliğe uygun yeni bir isim ve logo arayışına girilmesi kararlaştırıldı.

📅 14 Temmuz 2026 | Canlıya Geçiş (Production) & Yapay Zeka Entegrasyon Toplantısı
Katılımcılar: Tüm Ekip (5 Kişi)

Süre: 60 Dakika

Odak Noktası: Projenin internete açılması ve temel yapay zeka özelliklerinin aktifleştirilmesi.

📋 Ekip Durum Güncellemeleri (Status Updates)
Veritabanı & Backend Sorumlusu (Sen):

Ne yapıldı?: Supabase production veritabanı ortamı canlıya taşınma süreci için hazırlandı. Kredi havuzu mantığının veri tabanı tarafındaki kilit mekanizmaları simüle edildi.

Ne yapılacak?: Vektörel arama için SQL tabanlı cosine similarity fonksiyonlarının yazılması.

Engelleyici (Blocker): Yok.

Frontend & Full-Stack Ekibi:

Ne yapıldı?: Proje Vercel üzerine başarıyla deploy edilerek canlı ortama (Production) taşındı. Örnek kullanıcı paneli (Dashboard) ekibin test edebileceği şekilde yayına alındı. Vercel AI SDK entegrasyonu tamamlandı.

Ne yapılacak?: Dashboard testlerinden gelen UI/UX revizyon listesindeki eksikliklerin giderilmesi.

Engelleyici (Blocker): Yok.

🎯 Alınan Kararlar & Teknik Notlar
Temel AI Chat Aktif Edildi: OpenAI (gpt-4o-mini) ve Vercel AI SDK kullanılarak platform içerisindeki temel düzey yapay zeka sohbet robotu (AI Chatbot) başarıyla devreye sokuldu. Sistem canlı ortamda ilk yanıtlarını başarıyla verdi.

Dashboard Revizyonu: Canlıda deneyimlenen örnek dashboard üzerinde kullanıcı deneyimini iyileştirmek adına buton yerleşimleri ve menü yapısında ufak değişiklikler yapılması için bir revizyon listesi oluşturuldu.

Gelecek Hedef: Önümüzdeki günlerde sadece chat değil, nokta atışı mentor bulmayı sağlayacak akıllı eşleşme (pgvector) altyapısına odaklanılacak.

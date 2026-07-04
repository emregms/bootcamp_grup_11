# 🚀 Bootcamp Proje 2026

Modern ve interaktif bir **Eğitim, Mentorluk ve Eşleşme** platformu. Next.js 16'nın sunduğu App Router yapısıyla geliştirilmiş olan bu proje; öğrencilerin mentorlarla eşleştiği, derslere katıldığı, test çözüp sertifika alabildiği kapsamlı bir ekosistem sunar.

## ✨ Öne Çıkan Özellikler

- **🧑‍🏫 Mentor & Öğrenci Eşleşmesi:** Akıllı algoritmalarla (veya platform üzerinden) size en uygun mentorla eşleşme sistemi.
- **📚 Eğitim ve Dersler (Lessons):** Video ve içerik destekli yapılandırılmış eğitim modülleri.
- **📝 Sınavlar ve Quizler:** Öğrendiklerinizi pekiştirmeniz ve değerlendirmeniz için anlık sınav (quiz) sistemi.
- **💬 Gerçek Zamanlı Sohbet (Chat):** Öğrenci ve mentor arasında kesintisiz iletişim.
- **📜 Sertifikasyon:** Kursu ve testleri başarıyla tamamlayanlara özel dijital sertifikalar.
- **💳 Ödeme Sistemi Entegrasyonu:** Güvenli ve kolay ödeme (Payment) altyapısı.
- **📈 Kapsamlı Dashboard:** Kullanıcıların ilerlemelerini takip edebileceği kullanıcı paneli.
- **⚙️ Profil & Ayarlar (Settings):** Tamamen özelleştirilebilir kullanıcı profilleri.

## 🛠️ Kullanılan Teknolojiler

- **[Next.js 16](https://nextjs.org/):** React tabanlı güçlü ve performanslı modern web framework'ü.
- **[React 19](https://react.dev/):** Yeni nesil bileşen (component) mimarisi.
- **[Framer Motion](https://www.framer.com/motion/):** Akıcı, etkileşimli ve modern arayüz animasyonları.
- **[Lucide React](https://lucide.dev/):** Hafif ve ölçeklenebilir ikon kütüphanesi.
- **CSS Modules & Vanilla CSS:** Bileşen bazlı (component-scoped) stil mimarisi.

## 📸 Ekran Görüntüleri

Aşağıda projenin temel sayfalarından ekran görüntülerini bulabilirsiniz:

| Ana Sayfa | Kullanıcı Paneli (Dashboard) |
| :---: | :---: |
| ![Ana Sayfa](public/home.png) | ![Dashboard](public/dashboard.png) |

| Keşfet (Explore) | Mentor (Mentor) |
| :---: | :---: |
| ![Keşfet](public/explore.png) | ![Mentor](public/mentor.png) |

## 📂 Proje Yapısı

| Klasör / Dosya | Açıklama |
| :--- | :--- |
| **`src/app/`** | Next.js App Router (Ana sayfalar ve Layout) |
| ├── `auth/` | Giriş ve Kayıt (Login/Register) |
| ├── `certificates/` | Sertifika görüntüleme ve yönetimi |
| ├── `chat/` | Sohbet ve mesajlaşma arayüzü |
| ├── `dashboard/` | Kullanıcı paneli |
| ├── `explore/` | Yeni eğitimler ve mentorlar keşfetme |
| ├── `lesson/` | Ders içerikleri ve videoları |
| ├── `match/` | Eşleşme sistemi ekranları |
| ├── `mentor/` | Mentor profilleri ve listesi |
| ├── `payment/` | Ödeme adımları |
| ├── `quiz/` | Testler ve sınavlar |
| └── `settings/` | Kullanıcı hesap ayarları |
| **`src/components/`** | Tekrar kullanılabilir (reusable) UI bileşenleri |
| **`src/data/`** | Mock veriler, sabit değişkenler vb. |

## 🚀 Kurulum & Çalıştırma

Projeyi yerel ortamınızda (local) çalıştırmak için aşağıdaki adımları izleyin:

1. **Projeyi Klonlayın:**
   \`\`\`bash
   git clone https://github.com/emregms/bootcamp_grup_11.git
   cd bootcamp_grup_11
   \`\`\`

2. **Bağımlılıkları Yükleyin:**
   \`\`\`bash
   npm install
   \`\`\`

3. **Geliştirme Sunucusunu Başlatın:**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Tarayıcıda Görüntüleyin:**
   [http://localhost:3000](http://localhost:3000) adresine giderek platformu deneyimleyebilirsiniz.

## 🤝 Katkıda Bulunma (Contributing)

Bu bir Bootcamp proje repodur. Geliştirmeler \`main\` branch'i üzerinden veya ilgili özellik branch'lerinden (feature branches) yapılmaktadır. Katkıda bulunmak için Pull Request oluşturabilirsiniz.

---
*Bu proje Bootcamp Grup 11 ekibi tarafından tasarlanmış ve geliştirilmektedir.*

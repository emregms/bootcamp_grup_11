-- SkillBridge — Seed data (kategoriler, beceriler, rozetler)
-- Geliştirme ortamı için temel referans verileri
--
-- NOT: Demo giriş kullanıcıları (demo@skillbridge.com vb.) bu migration'da YOKTUR.
-- Auth kullanıcıları service role ile oluşturulur: npm run db:seed

INSERT INTO public.categories (name, icon, color) VALUES
  ('Yazılım Geliştirme', '💻', '#6C5CE7'),
  ('Tasarım & UX', '🎨', '#FD79A8'),
  ('Veri Bilimi & AI', '🤖', '#00CEC9'),
  ('Dijital Pazarlama', '📈', '#FDCB6E'),
  ('Müzik & Ses', '🎵', '#E17055'),
  ('Fotoğrafçılık', '📸', '#74B9FF'),
  ('Dil Eğitimi', '🌍', '#55EFC4'),
  ('İş & Finans', '💼', '#A29BFE'),
  ('Kişisel Gelişim', '🧠', '#FF7675'),
  ('Spor & Sağlık', '🏃', '#00B894'),
  ('Yemek & Mutfak', '🍳', '#E84393'),
  ('El Sanatları', '🎭', '#D63031')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.skills (skill_name, category_name, type) VALUES
  ('React', 'Yazılım Geliştirme', 'technical'),
  ('Next.js', 'Yazılım Geliştirme', 'technical'),
  ('TypeScript', 'Yazılım Geliştirme', 'technical'),
  ('Node.js', 'Yazılım Geliştirme', 'technical'),
  ('Python', 'Veri Bilimi & AI', 'technical'),
  ('TensorFlow', 'Veri Bilimi & AI', 'technical'),
  ('Figma', 'Tasarım & UX', 'technical'),
  ('UI Design', 'Tasarım & UX', 'technical'),
  ('Google Ads', 'Dijital Pazarlama', 'technical'),
  ('SEO', 'Dijital Pazarlama', 'technical'),
  ('Gitar', 'Müzik & Ses', 'academic'),
  ('İngilizce', 'Dil Eğitimi', 'academic'),
  ('Yaşam Koçluğu', 'Kişisel Gelişim', 'soft_skill'),
  ('Zaman Yönetimi', 'Kişisel Gelişim', 'soft_skill')
ON CONFLICT (skill_name) DO NOTHING;

-- category_id eşleştirmesi
UPDATE public.skills s
SET category_id = c.category_id
FROM public.categories c
WHERE s.category_name = c.name
  AND s.category_id IS NULL;

INSERT INTO public.badges (name, icon, description, criteria) VALUES
  ('İlk Ders', '🎯', 'İlk dersini tamamla', '{"lessons_completed": 1}'),
  ('Takas Ustası', '🔄', '10 başarılı takas yap', '{"successful_swaps": 10}'),
  ('Mentor Yıldızı', '⭐', '4.8+ ortalama puan al', '{"min_rating": 4.8}'),
  ('Topluluk Lideri', '👑', '100+ öğrenciye ulaş', '{"students_taught": 100}'),
  ('Seri Öğrenci', '🔥', '30 gün üst üste ders al', '{"streak_days": 30}'),
  ('Çok Yönlü', '🌈', '5 farklı kategoride ders al', '{"categories_learned": 5}'),
  ('Hızlı Yanıt', '⚡', 'Ortalama yanıt süresi 1 saat altı', '{"max_response_hours": 1}'),
  ('Mükemmeliyetçi', '💎', 'Quiz''den 95+ puan al', '{"min_quiz_score": 95}')
ON CONFLICT (name) DO NOTHING;

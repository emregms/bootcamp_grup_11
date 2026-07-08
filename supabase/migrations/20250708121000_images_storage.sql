-- SkillBridge — Hizmet kapak görselleri + Supabase Storage

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT;

ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Kategori stok görselleri (Unsplash)
UPDATE public.categories SET image_url = CASE name
  WHEN 'Yazılım Geliştirme' THEN 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80'
  WHEN 'Tasarım & UX' THEN 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80'
  WHEN 'Veri Bilimi & AI' THEN 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80'
  WHEN 'Dijital Pazarlama' THEN 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
  WHEN 'Müzik & Ses' THEN 'https://images.unsplash.com/photo-1511379938543-c1f69419868d?auto=format&fit=crop&w=800&q=80'
  WHEN 'Fotoğrafçılık' THEN 'https://images.unsplash.com/photo-1452587925148-ce544e77e70e?auto=format&fit=crop&w=800&q=80'
  WHEN 'Dil Eğitimi' THEN 'https://images.unsplash.com/photo-1546410531-bb4ca7796e27?auto=format&fit=crop&w=800&q=80'
  WHEN 'İş & Finans' THEN 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80'
  WHEN 'Kişisel Gelişim' THEN 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
  WHEN 'Spor & Sağlık' THEN 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50e?auto=format&fit=crop&w=800&q=80'
  WHEN 'Yemek & Mutfak' THEN 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80'
  WHEN 'El Sanatları' THEN 'https://images.unsplash.com/photo-1452860600638-524486df92f5?auto=format&fit=crop&w=800&q=80'
  ELSE image_url
END
WHERE image_url IS NULL;

-- Storage bucket'ları
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('lesson-covers', 'lesson-covers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Herkes public görselleri okuyabilir
CREATE POLICY "Public avatar read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Public lesson cover read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'lesson-covers');

-- Kullanıcı kendi klasörüne yükleyebilir
CREATE POLICY "Users upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users upload own lesson cover"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'lesson-covers'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own lesson cover"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'lesson-covers'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

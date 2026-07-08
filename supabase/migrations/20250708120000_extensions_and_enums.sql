-- SkillBridge — Temel extension ve enum tipleri
-- Supabase PostgreSQL migration #1

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Kullanıcı rolü
CREATE TYPE public.user_role AS ENUM ('mentor', 'mentee', 'both');

-- Beceri tipi
CREATE TYPE public.skill_type AS ENUM ('technical', 'academic', 'soft_skill');

-- Seans durumu
CREATE TYPE public.session_status AS ENUM (
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show'
);

-- Seans ödeme/takas tipi
CREATE TYPE public.session_payment_type AS ENUM ('swap', 'paid', 'free');

-- Ders formatı
CREATE TYPE public.lesson_format AS ENUM ('online', 'in_person', 'hybrid');

-- Ders seviyesi
CREATE TYPE public.lesson_level AS ENUM ('Başlangıç', 'Orta', 'İleri');

-- Kredi işlem tipi
CREATE TYPE public.credit_transaction_type AS ENUM ('earned', 'spent', 'bonus', 'refund', 'adjustment');

-- Bildirim tipi
CREATE TYPE public.notification_type AS ENUM (
  'lesson',
  'swap',
  'message',
  'badge',
  'credit',
  'certificate',
  'system'
);

-- Mesajlaşma katılımcı rolü
CREATE TYPE public.conversation_type AS ENUM ('direct', 'swap_group');

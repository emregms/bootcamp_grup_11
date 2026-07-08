-- SkillBridge — Kullanıcı profilleri (auth.users ile entegre)

CREATE TABLE public.profiles (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  bio TEXT,
  title TEXT,
  avatar_url TEXT,
  initials TEXT GENERATED ALWAYS AS (
    UPPER(
      COALESCE(
        LEFT(SPLIT_PART(full_name, ' ', 1), 1) ||
        LEFT(SPLIT_PART(full_name, ' ', 2), 1),
        LEFT(full_name, 2)
      )
    )
  ) STORED,
  role public.user_role NOT NULL DEFAULT 'both',
  credit_balance INTEGER NOT NULL DEFAULT 100 CHECK (credit_balance >= 0),
  total_credits_earned INTEGER NOT NULL DEFAULT 0,
  total_credits_spent INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER NOT NULL DEFAULT 0,
  lessons_completed INTEGER NOT NULL DEFAULT 0,
  lessons_given INTEGER NOT NULL DEFAULT 0,
  hourly_rate INTEGER,
  accepts_swap BOOLEAN NOT NULL DEFAULT true,
  location TEXT,
  languages TEXT[] NOT NULL DEFAULT '{}',
  learning_interests TEXT[] NOT NULL DEFAULT '{}',
  verified BOOLEAN NOT NULL DEFAULT false,
  top_mentor BOOLEAN NOT NULL DEFAULT false,
  response_time TEXT,
  profile_color TEXT DEFAULT '#6C5CE7',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_profiles_role ON public.profiles (role);
CREATE INDEX idx_profiles_rating ON public.profiles (rating DESC);
CREATE INDEX idx_profiles_accepts_swap ON public.profiles (accepts_swap) WHERE accepts_swap = true;

-- auth.users kaydı oluşturulduğunda profil satırı ekle
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'both')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

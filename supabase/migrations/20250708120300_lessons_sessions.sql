-- SkillBridge — Dersler, kayıtlar ve mentorluk seansları

CREATE TABLE public.lessons (
  lesson_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.profiles (user_id) ON DELETE RESTRICT,
  category_id BIGINT REFERENCES public.categories (category_id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category_name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
  price_credits INTEGER NOT NULL DEFAULT 0 CHECK (price_credits >= 0),
  swap_credits INTEGER NOT NULL DEFAULT 0 CHECK (swap_credits >= 0),
  accepts_swap BOOLEAN NOT NULL DEFAULT true,
  level public.lesson_level NOT NULL DEFAULT 'Başlangıç',
  format public.lesson_format NOT NULL DEFAULT 'online',
  max_students INTEGER NOT NULL DEFAULT 1 CHECK (max_students > 0),
  enrolled_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  tags TEXT[] NOT NULL DEFAULT '{}',
  next_session_at TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_lessons_mentor_id ON public.lessons (mentor_id);
CREATE INDEX idx_lessons_category_id ON public.lessons (category_id);
CREATE INDEX idx_lessons_next_session ON public.lessons (next_session_at) WHERE is_published = true;

CREATE TRIGGER lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.lesson_enrollments (
  enrollment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons (lesson_id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  payment_type public.session_payment_type NOT NULL DEFAULT 'swap',
  status public.session_status NOT NULL DEFAULT 'pending',
  credits_reserved INTEGER NOT NULL DEFAULT 0,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE (lesson_id, mentee_id)
);

CREATE INDEX idx_lesson_enrollments_mentee ON public.lesson_enrollments (mentee_id);

CREATE TABLE public.sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons (lesson_id) ON DELETE SET NULL,
  mentor_id UUID NOT NULL REFERENCES public.profiles (user_id) ON DELETE RESTRICT,
  mentee_id UUID NOT NULL REFERENCES public.profiles (user_id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
  payment_type public.session_payment_type NOT NULL DEFAULT 'swap',
  status public.session_status NOT NULL DEFAULT 'pending',
  credits_amount INTEGER NOT NULL DEFAULT 0 CHECK (credits_amount >= 0),
  meet_link TEXT,
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  CHECK (mentor_id <> mentee_id)
);

CREATE INDEX idx_sessions_mentor ON public.sessions (mentor_id, scheduled_at);
CREATE INDEX idx_sessions_mentee ON public.sessions (mentee_id, scheduled_at);
CREATE INDEX idx_sessions_status ON public.sessions (status);

CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Mikro takas grupları (15 dk hızlı oturumlar)
CREATE TABLE public.swap_groups (
  swap_group_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  host_id UUID REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  max_participants INTEGER NOT NULL DEFAULT 8 CHECK (max_participants > 1),
  duration_minutes INTEGER NOT NULL DEFAULT 15 CHECK (duration_minutes > 0),
  skills TEXT[] NOT NULL DEFAULT '{}',
  next_session_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE public.swap_group_participants (
  swap_group_id UUID NOT NULL REFERENCES public.swap_groups (swap_group_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (swap_group_id, user_id)
);

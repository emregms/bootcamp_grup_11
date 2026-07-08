-- SkillBridge — Kredi işlemleri ve değerlendirmeler

CREATE TABLE public.credit_transactions (
  transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  counterparty_id UUID REFERENCES public.profiles (user_id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.sessions (session_id) ON DELETE SET NULL,
  type public.credit_transaction_type NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0),
  balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_credit_transactions_user ON public.credit_transactions (user_id, created_at DESC);

CREATE TABLE public.reviews (
  review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.sessions (session_id) ON DELETE SET NULL,
  mentor_id UUID NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles (user_id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons (lesson_id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  lesson_title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE (session_id, reviewer_id)
);

CREATE INDEX idx_reviews_mentor ON public.reviews (mentor_id, created_at DESC);

-- Mentor rating güncelleme
CREATE OR REPLACE FUNCTION public.refresh_mentor_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles p
  SET
    rating = COALESCE((
      SELECT ROUND(AVG(r.rating)::numeric, 2)
      FROM public.reviews r
      WHERE r.mentor_id = COALESCE(NEW.mentor_id, OLD.mentor_id)
    ), 0),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews r
      WHERE r.mentor_id = COALESCE(NEW.mentor_id, OLD.mentor_id)
    )
  WHERE p.user_id = COALESCE(NEW.mentor_id, OLD.mentor_id);

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER reviews_refresh_mentor_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.refresh_mentor_rating();

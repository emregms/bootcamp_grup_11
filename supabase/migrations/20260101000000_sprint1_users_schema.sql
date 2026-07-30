-- 1. USERS TABLOSU (Kullanıcı profilleri ve kredi dengesi)
CREATE TABLE public.users (
    user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    bio TEXT,
    role TEXT CHECK (role IN ('mentor', 'mentee', 'both')),
    credit_balance INTEGER DEFAULT 100 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);


-- 4. TRIGGER FUNCTION (auth.users eklendiğinde public.users tetiklensin)
CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (user_id, email, full_name, role, credit_balance)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'both'),
    100 -- 100 hoş geldin kredisi
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_for_users
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_registration();

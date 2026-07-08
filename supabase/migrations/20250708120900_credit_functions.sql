-- SkillBridge — Kredi transferi ve hoş geldin bonusu (atomik işlemler)

CREATE OR REPLACE FUNCTION public.apply_credit_transaction(
  p_user_id UUID,
  p_type public.credit_transaction_type,
  p_amount INTEGER,
  p_description TEXT,
  p_counterparty_id UUID DEFAULT NULL,
  p_session_id UUID DEFAULT NULL
)
RETURNS public.credit_transactions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_row public.credit_transactions;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  SELECT credit_balance INTO v_current_balance
  FROM public.profiles
  WHERE user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  IF p_type IN ('spent') THEN
    v_new_balance := v_current_balance - p_amount;
    IF v_new_balance < 0 THEN
      RAISE EXCEPTION 'Insufficient credit balance';
    END IF;
    UPDATE public.profiles
    SET
      credit_balance = v_new_balance,
      total_credits_spent = total_credits_spent + p_amount
    WHERE user_id = p_user_id;
  ELSE
    v_new_balance := v_current_balance + p_amount;
    UPDATE public.profiles
    SET
      credit_balance = v_new_balance,
      total_credits_earned = total_credits_earned + p_amount
    WHERE user_id = p_user_id;
  END IF;

  INSERT INTO public.credit_transactions (
    user_id, counterparty_id, session_id, type, amount, balance_after, description
  )
  VALUES (
    p_user_id, p_counterparty_id, p_session_id, p_type, p_amount, v_new_balance, p_description
  )
  RETURNING * INTO v_row;

  RETURN v_row;
END;
$$;

-- Yeni kullanıcıya hoş geldin bonusu
CREATE OR REPLACE FUNCTION public.grant_welcome_bonus()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.apply_credit_transaction(
    NEW.user_id,
    'bonus',
    10,
    'Hoş geldin bonusu',
    NULL,
    NULL
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_welcome_bonus
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_welcome_bonus();

-- Seans tamamlama: mentee'den düş, mentor'a ekle
CREATE OR REPLACE FUNCTION public.complete_swap_session(p_session_id UUID)
RETURNS public.sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session public.sessions;
BEGIN
  SELECT * INTO v_session
  FROM public.sessions
  WHERE session_id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Session not found';
  END IF;

  IF v_session.status = 'completed' THEN
    RETURN v_session;
  END IF;

  IF v_session.payment_type <> 'swap' THEN
    RAISE EXCEPTION 'Only swap sessions can use this function';
  END IF;

  PERFORM public.apply_credit_transaction(
    v_session.mentee_id,
    'spent',
    v_session.credits_amount,
    'Takas dersi: ' || v_session.title,
    v_session.mentor_id,
    p_session_id
  );

  PERFORM public.apply_credit_transaction(
    v_session.mentor_id,
    'earned',
    v_session.credits_amount,
    'Ders verme: ' || v_session.title,
    v_session.mentee_id,
    p_session_id
  );

  UPDATE public.sessions
  SET
    status = 'completed',
    completed_at = TIMEZONE('utc', NOW())
  WHERE session_id = p_session_id
  RETURNING * INTO v_session;

  UPDATE public.profiles
  SET lessons_completed = lessons_completed + 1
  WHERE user_id = v_session.mentee_id;

  UPDATE public.profiles
  SET lessons_given = lessons_given + 1
  WHERE user_id = v_session.mentor_id;

  RETURN v_session;
END;
$$;

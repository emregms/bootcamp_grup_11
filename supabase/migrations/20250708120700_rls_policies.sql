-- SkillBridge — Row Level Security (RLS) politikaları

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_group_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (is_active = true);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CATEGORIES & SKILLS (herkes okuyabilir)
CREATE POLICY "categories_select_all"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "skills_select_all"
  ON public.skills FOR SELECT
  USING (true);

-- USER SKILLS / CATEGORIES
CREATE POLICY "user_skills_select_public"
  ON public.user_skills FOR SELECT
  USING (true);

CREATE POLICY "user_skills_manage_own"
  ON public.user_skills FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_categories_select_public"
  ON public.user_categories FOR SELECT
  USING (true);

CREATE POLICY "user_categories_manage_own"
  ON public.user_categories FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- LESSONS
CREATE POLICY "lessons_select_published"
  ON public.lessons FOR SELECT
  USING (is_published = true OR auth.uid() = mentor_id);

CREATE POLICY "lessons_insert_own"
  ON public.lessons FOR INSERT
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "lessons_update_own"
  ON public.lessons FOR UPDATE
  USING (auth.uid() = mentor_id)
  WITH CHECK (auth.uid() = mentor_id);

CREATE POLICY "lessons_delete_own"
  ON public.lessons FOR DELETE
  USING (auth.uid() = mentor_id);

-- LESSON ENROLLMENTS
CREATE POLICY "enrollments_select_involved"
  ON public.lesson_enrollments FOR SELECT
  USING (
    auth.uid() = mentee_id
    OR auth.uid() IN (
      SELECT l.mentor_id FROM public.lessons l WHERE l.lesson_id = lesson_enrollments.lesson_id
    )
  );

CREATE POLICY "enrollments_insert_own"
  ON public.lesson_enrollments FOR INSERT
  WITH CHECK (auth.uid() = mentee_id);

-- SESSIONS
CREATE POLICY "sessions_select_involved"
  ON public.sessions FOR SELECT
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "sessions_insert_participant"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "sessions_update_involved"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

-- SWAP GROUPS
CREATE POLICY "swap_groups_select_active"
  ON public.swap_groups FOR SELECT
  USING (is_active = true OR auth.uid() = host_id);

CREATE POLICY "swap_groups_insert_host"
  ON public.swap_groups FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "swap_group_participants_select"
  ON public.swap_group_participants FOR SELECT
  USING (true);

CREATE POLICY "swap_group_participants_manage_own"
  ON public.swap_group_participants FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CREDIT TRANSACTIONS
CREATE POLICY "credit_transactions_select_own"
  ON public.credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- REVIEWS
CREATE POLICY "reviews_select_all"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "reviews_insert_own"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- CONVERSATIONS & MESSAGES
CREATE POLICY "conversations_select_participant"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversations.conversation_id
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "conversation_participants_select_own"
  ON public.conversation_participants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "messages_select_participant"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert_participant"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = messages.conversation_id
        AND cp.user_id = auth.uid()
    )
  );

-- CERTIFICATES
CREATE POLICY "certificates_select_own_or_public"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = issuer_id);

-- BADGES
CREATE POLICY "badges_select_all"
  ON public.badges FOR SELECT
  USING (true);

CREATE POLICY "user_badges_select_all"
  ON public.user_badges FOR SELECT
  USING (true);

-- NOTIFICATIONS
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- QUIZ
CREATE POLICY "quiz_questions_select_all"
  ON public.quiz_questions FOR SELECT
  USING (true);

CREATE POLICY "quiz_attempts_select_own"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "quiz_attempts_insert_own"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Realtime: mesajlar ve bildirimler için publication (Supabase Dashboard'dan da açılabilir)
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

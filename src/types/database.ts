// ================================================================
// SkillBridge — Supabase satır tipleri (migration şemasına uygun)
// ================================================================

import type { LessonFormat, LessonLevel, NotificationType, SessionPaymentType, SessionStatus, UserRole } from './models';

export interface DbProfile {
  user_id: string;
  email: string;
  full_name: string;
  bio: string | null;
  title: string | null;
  avatar_url: string | null;
  initials?: string;
  role: UserRole;
  credit_balance: number;
  total_credits_earned: number;
  total_credits_spent: number;
  rating: number;
  review_count: number;
  lessons_completed: number;
  lessons_given: number;
  hourly_rate: number | null;
  accepts_swap: boolean;
  location: string | null;
  languages: string[] | null;
  learning_interests: string[] | null;
  verified: boolean;
  top_mentor: boolean;
  response_time: string | null;
  profile_color: string | null;
  created_at: string;
  user_categories?: DbUserCategoryJoin[];
  user_skills?: DbUserSkillJoin[];
}

export interface DbUserCategoryJoin {
  categories: { name: string } | null;
}

export interface DbUserSkillJoin {
  can_teach: boolean;
  wants_to_learn?: boolean;
  skills: { skill_name: string } | null;
}

export interface DbLesson {
  lesson_id: string;
  mentor_id: string;
  title: string;
  description: string | null;
  category_name: string;
  duration_minutes: number;
  price_credits: number;
  swap_credits: number;
  accepts_swap: boolean;
  level: LessonLevel | string;
  rating: number;
  enrolled_count: number;
  max_students: number;
  tags: string[] | null;
  next_session_at: string | null;
  format: LessonFormat | string;
  is_published?: boolean;
  cover_image_url?: string | null;
  mentor?: DbProfile;
}

export interface DbReview {
  review_id: string;
  mentor_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  lesson_title: string | null;
  created_at: string;
  reviewer?: Pick<DbProfile, 'full_name' | 'initials'>;
  profiles?: Pick<DbProfile, 'full_name' | 'initials'>;
}

export interface DbSession {
  session_id: string;
  lesson_id: string | null;
  mentor_id: string;
  mentee_id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  payment_type: SessionPaymentType;
  status: SessionStatus;
  credits_amount: number;
  meet_link: string | null;
  mentor?: Pick<DbProfile, 'full_name' | 'initials'>;
}

export interface DbCreditTransaction {
  transaction_id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
  counterparty?: Pick<DbProfile, 'full_name'>;
}

export interface DbNotification {
  notification_id: string;
  type: NotificationType;
  body: string;
  created_at: string;
  is_read: boolean;
}

export interface DbCertificate {
  certificate_id: string;
  user_id: string;
  issuer_id: string;
  title: string;
  category_name: string;
  score: number | null;
  credential_id: string;
  skills: string[] | null;
  color: string | null;
  issued_at: string;
  issuer?: Pick<DbProfile, 'full_name'>;
  issuer_name?: string;
}

export interface DbCategory {
  category_id: number;
  name: string;
  icon: string | null;
  color: string | null;
  image_url?: string | null;
}

export interface DbMessage {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface DbConversationParticipant {
  user_id: string;
  profile?: Pick<DbProfile, 'user_id' | 'full_name' | 'initials'>;
  profiles?: Pick<DbProfile, 'user_id' | 'full_name' | 'initials'>;
}

export interface DbConversationRaw {
  conversation_id: string;
  participants?: DbConversationParticipant[];
  last_message?: DbMessage | DbMessage[];
  unread_count?: number;
  updated_at?: string;
}

export interface DbSwapGroup {
  swap_group_id: string;
  name: string;
  description: string | null;
  max_participants: number;
  duration_minutes: number;
  skills: string[] | null;
  next_session_at: string | null;
  is_active: boolean;
}

export interface DbBadge {
  badge_id: number;
  name: string;
  icon: string;
  description: string;
}

export interface DbQuizQuestion {
  question_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
}

export interface DbGeminiQuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export interface ProfileWithRelations extends DbProfile {
  user_categories?: DbUserCategoryJoin[];
  user_skills?: DbUserSkillJoin[];
}

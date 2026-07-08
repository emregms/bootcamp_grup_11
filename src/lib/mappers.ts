import type {
  Badge,
  Category,
  Certificate,
  ChatMessage,
  Conversation,
  CreditTransaction,
  Lesson,
  Mentor,
  Notification,
  Review,
  Session,
  UserProfile,
} from '@/types/models';
import { getCategoryStockImage } from '@/lib/stock-images';
import type {
  DbCategory,
  DbCertificate,
  DbConversationRaw,
  DbCreditTransaction,
  DbLesson,
  DbMessage,
  DbNotification,
  DbProfile,
  DbReview,
  DbSession,
  ProfileWithRelations,
} from '@/types/database';

export function mapProfileToMentor(profile: ProfileWithRelations): Mentor {
  const categories = (profile.user_categories || [])
    .map((uc) => uc.categories?.name)
    .filter((name): name is string => Boolean(name));

  const skills = (profile.user_skills || [])
    .filter((us) => us.can_teach !== false)
    .map((us) => us.skills?.skill_name)
    .filter((name): name is string => Boolean(name));

  return {
    id: profile.user_id,
    name: profile.full_name,
    avatar: profile.avatar_url,
    initials: profile.initials ?? profile.full_name.slice(0, 2).toUpperCase(),
    title: profile.title,
    bio: profile.bio,
    rating: Number(profile.rating) || 0,
    reviewCount: profile.review_count || 0,
    students: Math.max((profile.lessons_given || 0) * 4, profile.lessons_given || 0),
    lessonsGiven: profile.lessons_given || 0,
    credits: profile.credit_balance || 0,
    hourlyRate: profile.hourly_rate || 0,
    acceptsSwap: profile.accepts_swap ?? true,
    categories,
    skills,
    languages: profile.languages || [],
    location: profile.location,
    verified: profile.verified ?? false,
    topMentor: profile.top_mentor ?? false,
    responseTime: profile.response_time || '< 4 saat',
    joinDate: profile.created_at,
    color: profile.profile_color || '#6C5CE7',
  };
}

export function mapProfileToUser(profile: ProfileWithRelations): UserProfile {
  return {
    id: profile.user_id,
    name: profile.full_name,
    initials: profile.initials ?? profile.full_name.slice(0, 2).toUpperCase(),
    email: profile.email,
    title: profile.title,
    bio: profile.bio,
    credits: profile.credit_balance || 0,
    totalEarned: profile.total_credits_earned || 0,
    totalSpent: profile.total_credits_spent || 0,
    rating: Number(profile.rating) || 0,
    reviewCount: profile.review_count || 0,
    lessonsCompleted: profile.lessons_completed || 0,
    lessonsGiven: profile.lessons_given || 0,
    memberSince: profile.created_at,
    skills: (profile.user_skills || [])
      .filter((us) => us.can_teach)
      .map((us) => us.skills?.skill_name)
      .filter((name): name is string => Boolean(name)),
    learningInterests: profile.learning_interests || [],
    location: profile.location,
    languages: profile.languages || [],
    color: profile.profile_color || '#6C5CE7',
    avatar: profile.avatar_url ?? null,
  };
}

export function mapLesson(lesson: DbLesson, mentor: ProfileWithRelations | null = null): Lesson {
  return {
    id: lesson.lesson_id,
    mentorId: lesson.mentor_id,
    title: lesson.title,
    description: lesson.description,
    category: lesson.category_name,
    duration: lesson.duration_minutes,
    price: lesson.price_credits,
    swapCredits: lesson.swap_credits,
    acceptsSwap: lesson.accepts_swap,
    level: lesson.level,
    rating: Number(lesson.rating) || 0,
    enrolledCount: lesson.enrolled_count || 0,
    maxStudents: lesson.max_students || 1,
    tags: lesson.tags || [],
    nextSession: lesson.next_session_at,
    format: lesson.format || 'online',
    coverImage: lesson.cover_image_url ?? null,
    mentor: mentor ? mapProfileToMentor(mentor) : null,
  };
}

export function mapReview(review: DbReview): Review {
  const reviewer = review.reviewer || review.profiles;
  return {
    id: review.review_id,
    mentorId: review.mentor_id,
    userName: reviewer?.full_name || 'Anonim',
    userInitials: reviewer?.initials || '??',
    rating: review.rating,
    comment: review.comment,
    date: review.created_at,
    lessonTitle: review.lesson_title,
  };
}

export function mapSession(
  session: DbSession,
  mentorProfile: Pick<DbProfile, 'full_name' | 'initials'> | null = null
): Session {
  const mentor = mentorProfile || session.mentor;
  return {
    id: session.session_id,
    title: session.title,
    mentor: mentor?.full_name || 'Mentor',
    mentorInitials: mentor?.initials || '??',
    mentorId: session.mentor_id,
    date: session.scheduled_at,
    duration: session.duration_minutes,
    type: session.payment_type,
    status: session.status,
    meetLink: session.meet_link,
  };
}

export function mapCreditTransaction(
  tx: DbCreditTransaction,
  counterparty: Pick<DbProfile, 'full_name'> | null = null
): CreditTransaction {
  return {
    id: tx.transaction_id,
    type: tx.type,
    amount: tx.amount,
    description: tx.description,
    date: tx.created_at,
    with: counterparty?.full_name || 'Sistem',
  };
}

export function mapNotification(n: DbNotification): Notification {
  return {
    id: n.notification_id,
    type: n.type,
    text: n.body,
    time: formatRelativeTime(n.created_at),
    read: n.is_read,
  };
}

export function mapCertificate(cert: DbCertificate): Certificate {
  return {
    id: cert.certificate_id,
    title: cert.title,
    issuer: cert.issuer?.full_name || cert.issuer_name || 'Mentor',
    issuerId: cert.issuer_id,
    date: cert.issued_at,
    category: cert.category_name,
    score: cert.score,
    credentialId: cert.credential_id,
    skills: cert.skills || [],
    color: cert.color || '#6C5CE7',
  };
}

export function mapConversation(conv: DbConversationRaw, currentUserId: string): Conversation {
  const other = (conv.participants || []).find((p) => p.user_id !== currentUserId);
  const profile = other?.profile || other?.profiles;
  const lastMsg = Array.isArray(conv.last_message) ? conv.last_message[0] : conv.last_message;

  return {
    id: conv.conversation_id,
    participantId: profile?.user_id,
    participantName: profile?.full_name || 'Kullanıcı',
    participantInitials: profile?.initials || '??',
    lastMessage: lastMsg?.body || '',
    lastMessageTime: lastMsg?.created_at || conv.updated_at || '',
    unreadCount: conv.unread_count || 0,
    online: false,
  };
}

export function mapMessage(msg: DbMessage, currentUserId: string): ChatMessage {
  return {
    id: msg.message_id,
    conversationId: msg.conversation_id,
    senderId: msg.sender_id === currentUserId ? 'me' : msg.sender_id,
    text: msg.body,
    timestamp: msg.created_at,
    read: msg.is_read,
  };
}

export function mapCategory(cat: DbCategory, mentorCount = 0): Category {
  return {
    id: cat.category_id,
    name: cat.name,
    icon: cat.icon,
    color: cat.color,
    count: mentorCount,
    imageUrl: getCategoryStockImage(cat.name),
  };
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Az önce';
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

export const MENTOR_SELECT = `
  user_id, full_name, title, bio, initials, avatar_url, rating, review_count,
  lessons_given, credit_balance, hourly_rate, accepts_swap, location,
  languages, verified, top_mentor, response_time, profile_color, created_at,
  user_categories ( categories ( name ) ),
  user_skills ( skills ( skill_name ), can_teach )
`;

export const PROFILE_SELECT = `
  user_id, email, full_name, title, bio, initials, avatar_url, role,
  credit_balance, total_credits_earned, total_credits_spent,
  rating, review_count, lessons_completed, lessons_given,
  hourly_rate, accepts_swap, location, languages, learning_interests,
  verified, top_mentor, response_time, profile_color, created_at,
  user_skills ( skills ( skill_name ), can_teach, wants_to_learn )
`;

export type { Badge };

// ================================================================
// SkillBridge — Domain & UI modelleri
// ================================================================

export type UserRole = 'mentor' | 'mentee' | 'both';

export type SessionPaymentType = 'swap' | 'paid' | 'free';
export type SessionStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type CreditTransactionType = 'earned' | 'spent' | 'bonus' | 'refund' | 'adjustment';
export type NotificationType = 'lesson' | 'swap' | 'message' | 'badge' | 'credit' | 'certificate' | 'system';
export type LessonLevel = 'Başlangıç' | 'Orta' | 'İleri';
export type LessonFormat = 'online' | 'in_person' | 'hybrid';

export interface Mentor {
  id: string;
  name: string;
  avatar: string | null;
  initials: string;
  title: string | null;
  bio: string | null;
  rating: number;
  reviewCount: number;
  students: number;
  lessonsGiven: number;
  credits: number;
  hourlyRate: number;
  acceptsSwap: boolean;
  categories: string[];
  skills: string[];
  languages: string[];
  location: string | null;
  verified: boolean;
  topMentor: boolean;
  responseTime: string;
  joinDate: string;
  color: string;
}

export interface UserProfile {
  id: string;
  name: string;
  initials: string;
  email: string;
  title: string | null;
  bio: string | null;
  credits: number;
  totalEarned: number;
  totalSpent: number;
  rating: number;
  reviewCount: number;
  lessonsCompleted: number;
  lessonsGiven: number;
  memberSince: string;
  skills: string[];
  learningInterests: string[];
  location: string | null;
  languages: string[];
  color: string;
  avatar: string | null;
}

export interface Lesson {
  id: string;
  mentorId: string;
  title: string;
  description: string | null;
  category: string;
  duration: number;
  price: number;
  swapCredits: number;
  acceptsSwap: boolean;
  level: LessonLevel | string;
  rating: number;
  enrolledCount: number;
  maxStudents: number;
  tags: string[];
  nextSession: string | null;
  format: LessonFormat | string;
  coverImage: string | null;
  mentor?: Mentor | null;
}

export interface Review {
  id: string;
  mentorId: string;
  userName: string;
  userInitials: string;
  rating: number;
  comment: string | null;
  date: string;
  lessonTitle: string | null;
}

export interface Session {
  id: string;
  title: string;
  mentor: string;
  mentorInitials: string;
  mentorId: string;
  date: string;
  duration: number;
  type: SessionPaymentType | string;
  status: SessionStatus | string;
  meetLink: string | null;
}

export interface CreditTransaction {
  id: string;
  type: CreditTransactionType | string;
  amount: number;
  description: string;
  date: string;
  with: string;
}

export interface Notification {
  id: string;
  type: NotificationType | string;
  text: string;
  time: string;
  read: boolean;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issuerId: string;
  date: string;
  category: string;
  score: number | null;
  credentialId: string;
  skills: string[];
  color: string;
}

export interface Badge {
  id: number;
  name: string;
  icon: string;
  description: string;
  earned: boolean;
  date: string | null;
}

export interface Category {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  count: number;
  imageUrl?: string | null;
}

export interface Conversation {
  id: string;
  participantId?: string;
  participantName: string;
  participantInitials: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
}

export interface ChatMessage {
  id: string | number;
  conversationId?: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface MatchSuggestion {
  id: number;
  mentor: Mentor;
  matchScore: number;
  reason: string;
  sharedInterests: string[];
  canSwap: boolean;
}

export interface SwapGroup {
  id: string;
  name: string;
  description: string | null;
  participants: number;
  maxParticipants: number;
  duration: number;
  nextSession: string | null;
  skills: string[];
  active: boolean;
}

export interface QuizQuestion {
  id: string | number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface PlatformStats {
  totalUsers: number;
  totalLessons: number;
  totalSwaps: number;
  totalMentors: number;
  averageRating: number;
  countriesReached: number;
}

export interface Testimonial {
  id: number;
  name: string;
  initials: string;
  role: string;
  text: string;
  rating: number;
}

export interface ChatHistoryMessage {
  type: 'bot' | 'user';
  text: string;
  correct?: boolean;
}

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

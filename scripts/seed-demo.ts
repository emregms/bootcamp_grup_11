#!/usr/bin/env node
/**
 * SkillBridge demo verisi seed scripti.
 * Service role key ile auth kullanıcıları ve ilişkili verileri oluşturur.
 *
 * Kullanım:
 *   cp env/.env.local.example .env.local   # key'leri doldur
 *   npm run db:seed
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { getCategoryStockImage, getLessonStockCover, getMentorStockAvatar } from '../src/lib/stock-images';

interface SeedUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  title?: string;
  bio?: string;
  credit_balance?: number;
  total_credits_earned?: number;
  total_credits_spent?: number;
  rating?: number;
  review_count?: number;
  lessons_completed?: number;
  lessons_given?: number;
  hourly_rate?: number | null;
  accepts_swap?: boolean;
  location?: string;
  languages?: string[];
  learning_interests?: string[];
  verified?: boolean;
  top_mentor?: boolean;
  response_time?: string;
  profile_color?: string;
  is_demo_user?: boolean;
  categories?: string[];
  skills?: string[];
}

interface SeedLesson {
  id: string;
  mentor_id: string;
  title: string;
  description: string;
  category_name: string;
  duration_minutes: number;
  price_credits: number;
  swap_credits: number;
  level: string;
  rating: number;
  enrolled_count: number;
  max_students: number;
  tags: string[];
  cover_image_url?: string;
}

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local bulunamadı. Önce: cp env/.env.local.example .env.local');
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line: string) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  });
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey || url.includes('YOUR_PROJECT')) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY .env.local içinde tanımlı olmalı.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const DEMO_PASSWORD = 'Demo123!';

/** Seed sırasında e-posta → gerçek auth UUID eşlemesi */
const authIdsByEmail = new Map<string, string>();

function resolvedUserId(email: string, fallback: string): string {
  return authIdsByEmail.get(email) ?? fallback;
}

const USERS: SeedUser[] = [
  { id: '10000000-0000-0000-0000-000000000001', email: 'demo@skillbridge.com', full_name: 'Deniz Yılmaz', role: 'both', title: 'Yazılım Geliştirici', bio: 'Full-stack geliştirici ve sürekli öğrenen. Beceri takası ile yeni alanlar keşfediyor.', credit_balance: 124, total_credits_earned: 156, total_credits_spent: 132, rating: 4.7, review_count: 23, lessons_completed: 18, lessons_given: 12, hourly_rate: null, accepts_swap: true, location: 'İstanbul', languages: ['Türkçe', 'İngilizce'], learning_interests: ['Machine Learning', 'UI/UX Design', 'Gitar'], verified: true, profile_color: '#6C5CE7', is_demo_user: true },
  { id: '10000000-0000-0000-0000-000000000002', email: 'elif@demo.skillbridge.com', full_name: 'Elif Yılmaz', role: 'mentor', title: 'Senior Frontend Developer', bio: 'React ve Next.js konusunda 8 yıllık deneyim.', credit_balance: 450, rating: 4.9, review_count: 127, lessons_given: 89, hourly_rate: 200, accepts_swap: true, location: 'İstanbul', languages: ['Türkçe', 'İngilizce'], verified: true, top_mentor: true, response_time: '< 1 saat', profile_color: '#6C5CE7', categories: ['Yazılım Geliştirme', 'Tasarım & UX'], skills: ['React', 'Next.js', 'TypeScript', 'CSS', 'Figma', 'Node.js'] },
  { id: '10000000-0000-0000-0000-000000000003', email: 'ahmet@demo.skillbridge.com', full_name: 'Ahmet Kara', role: 'mentor', title: 'Data Scientist & ML Engineer', bio: 'Makine öğrenmesi ve derin öğrenme alanında uzman.', credit_balance: 380, rating: 4.8, review_count: 93, lessons_given: 67, hourly_rate: 250, accepts_swap: true, location: 'Ankara', languages: ['Türkçe', 'İngilizce', 'Almanca'], verified: true, top_mentor: true, response_time: '< 2 saat', profile_color: '#00CEC9', categories: ['Veri Bilimi & AI', 'Yazılım Geliştirme'], skills: ['Python', 'TensorFlow', 'PyTorch', 'SQL', 'Pandas'] },
  { id: '10000000-0000-0000-0000-000000000004', email: 'zeynep@demo.skillbridge.com', full_name: 'Zeynep Demir', role: 'mentor', title: 'UI/UX Designer', bio: 'Kullanıcı deneyimi tasarımında 6 yıl.', credit_balance: 320, rating: 4.9, review_count: 78, lessons_given: 54, hourly_rate: 180, accepts_swap: true, location: 'İzmir', languages: ['Türkçe', 'İngilizce'], verified: true, response_time: '< 3 saat', profile_color: '#FD79A8', categories: ['Tasarım & UX'], skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping'] },
  { id: '10000000-0000-0000-0000-000000000005', email: 'mehmet@demo.skillbridge.com', full_name: 'Mehmet Öz', role: 'mentor', title: 'Full Stack Developer', bio: 'Node.js ve React ile full-stack uygulama geliştirme.', credit_balance: 290, rating: 4.7, review_count: 64, lessons_given: 45, hourly_rate: 220, accepts_swap: false, location: 'İstanbul', languages: ['Türkçe'], verified: true, response_time: '< 4 saat', profile_color: '#A29BFE', categories: ['Yazılım Geliştirme'], skills: ['Node.js', 'React', 'PostgreSQL', 'Docker', 'AWS'] },
  { id: '10000000-0000-0000-0000-000000000006', email: 'selin@demo.skillbridge.com', full_name: 'Selin Arslan', role: 'mentor', title: 'Dijital Pazarlama Uzmanı', bio: 'Google Ads, SEO ve sosyal medya yönetimi.', credit_balance: 410, rating: 4.8, review_count: 112, lessons_given: 78, hourly_rate: 150, accepts_swap: true, location: 'Antalya', languages: ['Türkçe', 'İngilizce'], verified: true, top_mentor: true, response_time: '< 1 saat', profile_color: '#FDCB6E', categories: ['Dijital Pazarlama'], skills: ['Google Ads', 'SEO', 'Social Media', 'Analytics'] },
  { id: '10000000-0000-0000-0000-000000000007', email: 'can@demo.skillbridge.com', full_name: 'Can Yücel', role: 'mentor', title: 'Gitar & Müzik Teorisi Eğitmeni', bio: '10 yıllık müzik eğitmenliği deneyimi.', credit_balance: 520, rating: 4.9, review_count: 156, lessons_given: 134, hourly_rate: 120, accepts_swap: true, location: 'İstanbul', languages: ['Türkçe'], verified: true, top_mentor: true, response_time: '< 2 saat', profile_color: '#E17055', categories: ['Müzik & Ses'], skills: ['Gitar', 'Piyano', 'Müzik Teorisi'] },
  { id: '10000000-0000-0000-0000-000000000008', email: 'deniz@demo.skillbridge.com', full_name: 'Deniz Aydın', role: 'mentor', title: 'İngilizce & Almanca Eğitmeni', bio: 'CELTA sertifikalı dil eğitmeni.', credit_balance: 350, rating: 4.7, review_count: 89, lessons_given: 67, hourly_rate: 130, accepts_swap: true, location: 'Ankara', languages: ['Türkçe', 'İngilizce', 'Almanca'], verified: true, response_time: '< 3 saat', profile_color: '#55EFC4', categories: ['Dil Eğitimi'], skills: ['İngilizce', 'Almanca', 'IELTS Hazırlık'] },
  { id: '10000000-0000-0000-0000-000000000009', email: 'berk@demo.skillbridge.com', full_name: 'Berk Koç', role: 'mentor', title: 'Profesyonel Fotoğrafçı', bio: 'Doğa ve portre fotoğrafçılığında ödüllü.', credit_balance: 240, rating: 4.6, review_count: 54, lessons_given: 38, hourly_rate: 160, accepts_swap: true, location: 'İstanbul', languages: ['Türkçe', 'İngilizce'], verified: false, response_time: '< 6 saat', profile_color: '#74B9FF', categories: ['Fotoğrafçılık'], skills: ['Portre', 'Doğa', 'Lightroom', 'Photoshop'] },
  { id: '10000000-0000-0000-0000-000000000010', email: 'ayse@demo.skillbridge.com', full_name: 'Ayşe Güner', role: 'mentor', title: 'Finansal Danışman', bio: 'Kişisel finans ve yatırım stratejileri.', credit_balance: 340, rating: 4.8, review_count: 67, lessons_given: 56, hourly_rate: 280, accepts_swap: false, location: 'İstanbul', languages: ['Türkçe', 'İngilizce'], verified: true, response_time: '< 4 saat', profile_color: '#A29BFE', categories: ['İş & Finans'], skills: ['Yatırım', 'Borsa', 'Kişisel Finans'] },
  { id: '10000000-0000-0000-0000-000000000011', email: 'oguz@demo.skillbridge.com', full_name: 'Oğuz Şahin', role: 'mentor', title: 'Yaşam Koçu', bio: 'ICF akredite yaşam koçu.', credit_balance: 680, rating: 4.9, review_count: 203, lessons_given: 189, hourly_rate: 170, accepts_swap: true, location: 'Bursa', languages: ['Türkçe'], verified: true, top_mentor: true, response_time: '< 1 saat', profile_color: '#FF7675', categories: ['Kişisel Gelişim'], skills: ['Yaşam Koçluğu', 'Stres Yönetimi', 'Zaman Yönetimi'] },
  { id: '10000000-0000-0000-0000-000000000012', email: 'meryem@demo.skillbridge.com', full_name: 'Meryem Aktaş', role: 'mentor', title: 'Fitness & Beslenme Uzmanı', bio: 'Kişiye özel antrenman programları.', credit_balance: 210, rating: 4.7, review_count: 45, lessons_given: 34, hourly_rate: 140, accepts_swap: true, location: 'İzmir', languages: ['Türkçe'], verified: true, response_time: '< 5 saat', profile_color: '#00B894', categories: ['Spor & Sağlık'], skills: ['Fitness', 'Beslenme', 'Yoga'] },
  { id: '10000000-0000-0000-0000-000000000013', email: 'emre.c@demo.skillbridge.com', full_name: 'Emre Çelik', role: 'mentor', title: 'Mobil Uygulama Geliştirici', bio: 'Flutter ve React Native uzmanı.', credit_balance: 310, rating: 4.8, review_count: 71, lessons_given: 42, hourly_rate: 230, accepts_swap: true, location: 'Ankara', languages: ['Türkçe', 'İngilizce'], verified: true, response_time: '< 3 saat', profile_color: '#6C5CE7', categories: ['Yazılım Geliştirme'], skills: ['Flutter', 'React Native', 'Dart', 'Firebase'] },
];

const LESSONS: SeedLesson[] = [
  { id: '20000000-0000-0000-0000-000000000001', mentor_id: '10000000-0000-0000-0000-000000000002', title: 'React ile Modern Web Uygulamaları', description: 'React Hooks, Context API, Redux ve performans optimizasyonu.', category_name: 'Yazılım Geliştirme', duration_minutes: 60, price_credits: 200, swap_credits: 4, level: 'Orta', rating: 4.9, enrolled_count: 45, max_students: 5, tags: ['React', 'JavaScript', 'Web'] },
  { id: '20000000-0000-0000-0000-000000000002', mentor_id: '10000000-0000-0000-0000-000000000002', title: 'Next.js ile Full Stack Geliştirme', description: 'App Router, Server Components, API Routes.', category_name: 'Yazılım Geliştirme', duration_minutes: 90, price_credits: 300, swap_credits: 6, level: 'İleri', rating: 4.8, enrolled_count: 32, max_students: 4, tags: ['Next.js', 'React'] },
  { id: '20000000-0000-0000-0000-000000000003', mentor_id: '10000000-0000-0000-0000-000000000003', title: 'Python ile Veri Analizi', description: 'Pandas, NumPy ve Matplotlib ile veri analizi.', category_name: 'Veri Bilimi & AI', duration_minutes: 75, price_credits: 250, swap_credits: 5, level: 'Başlangıç', rating: 4.8, enrolled_count: 67, max_students: 8, tags: ['Python', 'Pandas'] },
  { id: '20000000-0000-0000-0000-000000000004', mentor_id: '10000000-0000-0000-0000-000000000004', title: 'Figma ile UI Tasarımı', description: 'Auto Layout, Components, Design Systems.', category_name: 'Tasarım & UX', duration_minutes: 60, price_credits: 180, swap_credits: 3, level: 'Başlangıç', rating: 4.9, enrolled_count: 54, max_students: 6, tags: ['Figma', 'UI Design'] },
  { id: '20000000-0000-0000-0000-000000000005', mentor_id: '10000000-0000-0000-0000-000000000006', title: 'Google Ads Masterclass', description: 'Kampanya yönetimi ve bütçe optimizasyonu.', category_name: 'Dijital Pazarlama', duration_minutes: 45, price_credits: 150, swap_credits: 3, level: 'Orta', rating: 4.7, enrolled_count: 89, max_students: 10, tags: ['Google Ads', 'SEM'] },
  { id: '20000000-0000-0000-0000-000000000006', mentor_id: '10000000-0000-0000-0000-000000000007', title: 'Akustik Gitar Başlangıç', description: 'Sıfırdan gitar çalmayı öğrenin.', category_name: 'Müzik & Ses', duration_minutes: 45, price_credits: 120, swap_credits: 2, level: 'Başlangıç', rating: 4.9, enrolled_count: 134, max_students: 3, tags: ['Gitar', 'Müzik'] },
  { id: '20000000-0000-0000-0000-000000000007', mentor_id: '10000000-0000-0000-0000-000000000008', title: 'İngilizce Konuşma Pratiği', description: 'Günlük konuşma ve iş İngilizcesi.', category_name: 'Dil Eğitimi', duration_minutes: 30, price_credits: 100, swap_credits: 2, level: 'Orta', rating: 4.7, enrolled_count: 98, max_students: 1, tags: ['İngilizce', 'Speaking'] },
  { id: '20000000-0000-0000-0000-000000000008', mentor_id: '10000000-0000-0000-0000-000000000011', title: 'Kişisel Verimlilik ve Hedef Yönetimi', description: 'Zaman yönetimi ve alışkanlık oluşturma.', category_name: 'Kişisel Gelişim', duration_minutes: 60, price_credits: 170, swap_credits: 3, level: 'Başlangıç', rating: 4.9, enrolled_count: 156, max_students: 8, tags: ['Verimlilik', 'Hedef'] },
];

async function resolveAuthUserId(user: SeedUser): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    user_id: user.id,
    email: user.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: user.full_name, role: user.role },
  } as Parameters<typeof supabase.auth.admin.createUser>[0] & { user_id: string });

  if (!error && data?.user?.id) {
    return data.user.id;
  }

  if (error?.message.includes('already been registered')) {
    const { data: listed, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (listError) throw new Error(`${user.email}: ${listError.message}`);
    const existing = listed.users.find((u) => u.email === user.email);
    if (existing) return existing.id;
  }

  if (error) throw new Error(`${user.email}: ${error.message}`);
  return user.id;
}

async function updateProfile(user: SeedUser, avatarIndex: number) {
  const { error } = await supabase.from('profiles').update({
    full_name: user.full_name,
    title: user.title,
    bio: user.bio,
    role: user.role,
    avatar_url: getMentorStockAvatar(avatarIndex),
    credit_balance: user.credit_balance ?? 100,
    total_credits_earned: user.total_credits_earned ?? 0,
    total_credits_spent: user.total_credits_spent ?? 0,
    rating: user.rating ?? 0,
    review_count: user.review_count ?? 0,
    lessons_completed: user.lessons_completed ?? 0,
    lessons_given: user.lessons_given ?? 0,
    hourly_rate: user.hourly_rate,
    accepts_swap: user.accepts_swap ?? true,
    location: user.location,
    languages: user.languages || [],
    learning_interests: user.learning_interests || [],
    verified: user.verified ?? false,
    top_mentor: user.top_mentor ?? false,
    response_time: user.response_time,
    profile_color: user.profile_color || '#6C5CE7',
  }).eq('user_id', user.id);
  if (error) throw new Error(`Profile ${user.email}: ${error.message}`);
}

async function linkSkillsAndCategories(user: SeedUser) {
  if (!user.skills?.length && !user.categories?.length) return;

  if (user.categories?.length) {
    const { data: cats } = await supabase.from('categories').select('category_id, name').in('name', user.categories);
    if (cats?.length) {
      await supabase.from('user_categories').upsert(
        cats.map((c) => ({ user_id: user.id, category_id: c.category_id })),
        { onConflict: 'user_id,category_id' }
      );
    }
  }

  if (user.skills?.length) {
    const { data: skills } = await supabase.from('skills').select('skill_id, skill_name').in('skill_name', user.skills);
    if (skills?.length) {
      await supabase.from('user_skills').upsert(
        skills.map((s) => ({ user_id: user.id, skill_id: s.skill_id, can_teach: true, proficiency_level: 4 })),
        { onConflict: 'user_id,skill_id' }
      );
    }
  }
}

async function seedDemoUserSkills(demoId: string) {
  const skillNames = ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'];
  const { data: skills } = await supabase.from('skills').select('skill_id, skill_name');
  const existing = skills?.map((s) => s.skill_name) || [];

  for (const name of skillNames) {
    if (!existing.includes(name)) {
      await supabase.from('skills').insert({ skill_name: name, category_name: 'Yazılım Geliştirme', type: 'technical' });
    }
  }

  const { data: allSkills } = await supabase.from('skills').select('skill_id, skill_name').in('skill_name', skillNames);
  if (allSkills?.length) {
    await supabase.from('user_skills').upsert(
      allSkills.map((s) => ({ user_id: demoId, skill_id: s.skill_id, can_teach: true, wants_to_learn: false, proficiency_level: 4 })),
      { onConflict: 'user_id,skill_id' }
    );
  }
}

async function seedLessons() {
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  for (let i = 0; i < LESSONS.length; i++) {
    const l = LESSONS[i];
    const sessionDate = new Date(nextWeek);
    sessionDate.setDate(sessionDate.getDate() + i);

    await supabase.from('lessons').upsert({
      lesson_id: l.id,
      mentor_id: l.mentor_id,
      title: l.title,
      description: l.description,
      category_name: l.category_name,
      duration_minutes: l.duration_minutes,
      price_credits: l.price_credits,
      swap_credits: l.swap_credits,
      accepts_swap: true,
      level: l.level,
      rating: l.rating,
      enrolled_count: l.enrolled_count,
      max_students: l.max_students,
      tags: l.tags,
      cover_image_url: l.cover_image_url ?? getLessonStockCover(l.category_name, i),
      next_session_at: sessionDate.toISOString(),
      is_published: true,
    }, { onConflict: 'lesson_id' });
  }
}

async function seedSessions(demoId: string) {
  const sessions = [
    { session_id: '30000000-0000-0000-0000-000000000001', lesson_id: '20000000-0000-0000-0000-000000000001', mentor_id: '10000000-0000-0000-0000-000000000002', title: 'React ile Modern Web Uygulamaları', days: 3, duration: 60, payment_type: 'swap', status: 'confirmed', credits: 4, meet_link: 'https://meet.google.com/abc-defg-hij' },
    { session_id: '30000000-0000-0000-0000-000000000002', lesson_id: '20000000-0000-0000-0000-000000000003', mentor_id: '10000000-0000-0000-0000-000000000003', title: 'Python ile Veri Analizi', days: 5, duration: 75, payment_type: 'paid', status: 'pending', credits: 5, meet_link: null },
    { session_id: '30000000-0000-0000-0000-000000000003', lesson_id: '20000000-0000-0000-0000-000000000007', mentor_id: '10000000-0000-0000-0000-000000000008', title: 'İngilizce Konuşma Pratiği', days: 7, duration: 30, payment_type: 'swap', status: 'confirmed', credits: 2, meet_link: 'https://meet.google.com/xyz-uvwx-yz' },
  ];

  for (const s of sessions) {
    const scheduled = new Date();
    scheduled.setDate(scheduled.getDate() + s.days);
    await supabase.from('sessions').upsert({
      session_id: s.session_id,
      lesson_id: s.lesson_id,
      mentor_id: s.mentor_id,
      mentee_id: demoId,
      title: s.title,
      scheduled_at: scheduled.toISOString(),
      duration_minutes: s.duration,
      payment_type: s.payment_type,
      status: s.status,
      credits_amount: s.credits,
      meet_link: s.meet_link,
    }, { onConflict: 'session_id' });
  }
}

async function seedReviews(demoId: string) {
  const reviews = [
    { mentor_id: resolvedUserId('elif@demo.skillbridge.com', '10000000-0000-0000-0000-000000000002'), reviewer_id: demoId, rating: 5, comment: 'Elif hoca ile React eğitimi mükemmeldi. Kesinlikle tavsiye ederim!', lesson_title: 'React ile Modern Web Uygulamaları' },
    { mentor_id: resolvedUserId('can@demo.skillbridge.com', '10000000-0000-0000-0000-000000000007'), reviewer_id: demoId, rating: 5, comment: '3 ayda gitar çalmaya başladım. İnanılmaz bir eğitimci!', lesson_title: 'Akustik Gitar Başlangıç' },
    { mentor_id: resolvedUserId('oguz@demo.skillbridge.com', '10000000-0000-0000-0000-000000000011'), reviewer_id: demoId, rating: 5, comment: 'Hedef belirleme konusunda inanılmaz bir bakış açısı kazandım.', lesson_title: 'Kişisel Verimlilik' },
  ];

  for (const r of reviews) {
    await supabase.from('reviews').upsert(r, { onConflict: 'review_id', ignoreDuplicates: true });
  }
}

async function seedCredits(demoId: string) {
  const txs = [
    { type: 'earned', amount: 4, description: 'React dersi verme', balance_after: 128 },
    { type: 'spent', amount: 3, description: 'Figma dersi alma', balance_after: 124 },
    { type: 'bonus', amount: 10, description: 'Hoş geldin bonusu', balance_after: 134 },
  ];

  for (const tx of txs) {
    await supabase.from('credit_transactions').insert({ user_id: demoId, ...tx });
  }
}

async function seedNotifications(demoId: string) {
  const notifs = [
    { type: 'lesson', body: 'Yarınki React dersine 1 gün kaldı!', is_read: false },
    { type: 'swap', body: 'Elif Yılmaz takas teklifinizi kabul etti', is_read: false },
    { type: 'badge', body: '🔄 Takas Ustası rozetini kazandın!', is_read: true },
    { type: 'message', body: 'Ahmet Kara size yeni bir mesaj gönderdi', is_read: true },
    { type: 'credit', body: '+4 kredi kazandın (React dersi)', is_read: true },
  ];

  for (const n of notifs) {
    await supabase.from('notifications').insert({ user_id: demoId, ...n });
  }
}

async function seedCertificates(demoId: string) {
  const certs = [
    { user_id: demoId, issuer_id: resolvedUserId('elif@demo.skillbridge.com', '10000000-0000-0000-0000-000000000002'), title: 'React Developer Sertifikası', category_name: 'Yazılım Geliştirme', score: 92, credential_id: 'SB-CERT-2026-001', skills: ['React', 'Hooks'], color: '#6C5CE7' },
    { user_id: demoId, issuer_id: resolvedUserId('ahmet@demo.skillbridge.com', '10000000-0000-0000-0000-000000000003'), title: 'Veri Analizi Temelleri', category_name: 'Veri Bilimi & AI', score: 88, credential_id: 'SB-CERT-2026-002', skills: ['Python', 'Pandas'], color: '#00CEC9' },
    { user_id: demoId, issuer_id: resolvedUserId('can@demo.skillbridge.com', '10000000-0000-0000-0000-000000000007'), title: 'Akustik Gitar — Seviye 1', category_name: 'Müzik & Ses', score: 95, credential_id: 'SB-CERT-2026-003', skills: ['Akorlar', 'Ritim'], color: '#E17055' },
  ];

  for (const c of certs) {
    await supabase.from('certificates').upsert(c, { onConflict: 'credential_id' });
  }
}

async function seedBadges(demoId: string) {
  const badgeNames = ['İlk Ders', 'Takas Ustası', 'Mentor Yıldızı', 'Çok Yönlü', 'Hızlı Yanıt'];
  const { data: badges } = await supabase.from('badges').select('badge_id, name').in('name', badgeNames);
  if (badges?.length) {
    await supabase.from('user_badges').upsert(
      badges.map((b) => ({ user_id: demoId, badge_id: b.badge_id })),
      { onConflict: 'user_id,badge_id' }
    );
  }
}

async function seedChat(demoId: string) {
  const elifId = resolvedUserId('elif@demo.skillbridge.com', '10000000-0000-0000-0000-000000000002');
  const convId = '40000000-0000-0000-0000-000000000001';

  await supabase.from('conversations').upsert({ conversation_id: convId, type: 'direct' }, { onConflict: 'conversation_id' });
  await supabase.from('conversation_participants').upsert([
    { conversation_id: convId, user_id: demoId },
    { conversation_id: convId, user_id: elifId },
  ], { onConflict: 'conversation_id,user_id' });

  const messages = [
    { conversation_id: convId, sender_id: demoId, body: 'Merhaba Elif hanım, React dersinize katılmak istiyorum. Takas ile mümkün mü?' },
    { conversation_id: convId, sender_id: elifId, body: 'Merhaba! Tabii ki, takas ile de ders verebilirim. Hangi alanda becerileriniz var?' },
    { conversation_id: convId, sender_id: demoId, body: 'SEO ve dijital pazarlama alanında 5 yıllık deneyimim var.' },
    { conversation_id: convId, sender_id: elifId, body: 'Harika! 4 kredi karşılığında React dersine başlayabiliriz. Ne dersiniz? 😊' },
    { conversation_id: convId, sender_id: demoId, body: 'Süper olur! Haftaya Pazartesi uygun musunuz?' },
  ];

  for (const m of messages) {
    await supabase.from('messages').insert(m);
  }
}

async function seedSwapGroups() {
  const groups = [
    { swap_group_id: '50000000-0000-0000-0000-000000000001', name: 'Web Dev ↔ Tasarım', description: 'Web geliştirme ve tasarım becerilerini takas edin', max_participants: 12, duration_minutes: 15, skills: ['React', 'Figma', 'CSS'], is_active: true },
    { swap_group_id: '50000000-0000-0000-0000-000000000002', name: 'Dil Pratiği Çemberi', description: 'Farklı dillerde konuşma pratiği', max_participants: 8, duration_minutes: 15, skills: ['İngilizce', 'Almanca'], is_active: true },
  ];

  for (const g of groups) {
    const nextSession = new Date();
    nextSession.setDate(nextSession.getDate() + 2);
    await supabase.from('swap_groups').upsert({ ...g, next_session_at: nextSession.toISOString() }, { onConflict: 'swap_group_id' });
  }
}

async function main() {
  console.log('🌱 SkillBridge demo verisi yükleniyor...\n');

  for (const [index, user] of USERS.entries()) {
    process.stdout.write(`  👤 ${user.full_name}... `);
    const authId = await resolveAuthUserId(user);
    authIdsByEmail.set(user.email, authId);
    const resolvedUser = { ...user, id: authId };
    await updateProfile(resolvedUser, index);
    await linkSkillsAndCategories(resolvedUser);
    console.log('✓');
  }

  const demoId = authIdsByEmail.get('demo@skillbridge.com');
  if (!demoId) {
    throw new Error('Demo kullanıcı oluşturulamadı (demo@skillbridge.com)');
  }

  console.log('\n  📚 Dersler...');
  await seedLessons();
  console.log('  ✓');

  console.log('  📅 Seanslar...');
  await seedSessions(demoId);
  console.log('  ✓');

  console.log('  ⭐ Değerlendirmeler...');
  await seedReviews(demoId);
  console.log('  ✓');

  console.log('  🪙 Kredi geçmişi...');
  await seedCredits(demoId);
  console.log('  ✓');

  console.log('  🔔 Bildirimler...');
  await seedNotifications(demoId);
  console.log('  ✓');

  console.log('  📜 Sertifikalar...');
  await seedCertificates(demoId);
  console.log('  ✓');

  console.log('  🏅 Rozetler...');
  await seedBadges(demoId);
  console.log('  ✓');

  console.log('  💬 Mesajlar...');
  await seedChat(demoId);
  console.log('  ✓');

  console.log('  🔄 Takas grupları...');
  await seedSwapGroups();
  console.log('  ✓');

  console.log('  🛠 Demo kullanıcı becerileri...');
  await seedDemoUserSkills(demoId);
  console.log('  ✓');

  console.log('\n✅ Demo verisi başarıyla yüklendi!');
  console.log('\n📋 Demo Giriş Bilgileri (Yarışma jürisi için):');
  console.log('   E-posta: demo@skillbridge.com');
  console.log(`   Şifre:   ${DEMO_PASSWORD}`);
  console.log('\n   Tüm demo hesaplar aynı şifreyi kullanır (@demo.skillbridge.com)');
}

main().catch((err) => {
  console.error('\n❌ Seed hatası:', err.message);
  process.exit(1);
});

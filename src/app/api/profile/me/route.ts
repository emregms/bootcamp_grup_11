import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { mapProfileToUser, PROFILE_SELECT } from '@/lib/mappers';
import type { ProfileWithRelations } from '@/types';

const ALLOWED_PROFILE_FIELDS = [
  'full_name',
  'title',
  'bio',
  'location',
  'languages',
  'learning_interests',
  'accepts_swap',
  'hourly_rate',
  'avatar_url',
] as const;

type ProfileUpdateKey = (typeof ALLOWED_PROFILE_FIELDS)[number];
type ProfileUpdateBody = Partial<Pick<ProfileWithRelations, ProfileUpdateKey>>;

/**
 * GET /api/profile/me — Oturum açmış kullanıcı profili
 * PATCH /api/profile/me — Profil güncelle
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('user_id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    user: mapProfileToUser(data as unknown as ProfileWithRelations),
  });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
  }

  const body = (await request.json()) as ProfileUpdateBody;
  const updates: Partial<Record<ProfileUpdateKey, ProfileWithRelations[ProfileUpdateKey]>> = {};

  for (const key of ALLOWED_PROFILE_FIELDS) {
    if (body[key] !== undefined) {
      updates[key] = body[key] as ProfileWithRelations[typeof key];
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select(PROFILE_SELECT)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    user: mapProfileToUser(data as unknown as ProfileWithRelations),
  });
}

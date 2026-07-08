import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { mapCertificate } from '@/lib/mappers';
import type { Badge, DbBadge, DbCertificate } from '@/types';

/**
 * GET /api/certificates — kullanıcının sertifikaları ve rozetleri
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
  }

  const [certsRes, badgesRes, userBadgesRes] = await Promise.all([
    supabase
      .from('certificates')
      .select('*, issuer:profiles!certificates_issuer_id_fkey(full_name)')
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false }),
    supabase.from('badges').select('*').order('badge_id'),
    supabase
      .from('user_badges')
      .select('badge_id, earned_at')
      .eq('user_id', user.id),
  ]);

  const earnedBadgeIds = new Set(
    (userBadgesRes.data || []).map((ub: { badge_id: number }) => ub.badge_id)
  );
  const earnedDates = Object.fromEntries(
    (userBadgesRes.data || []).map((ub: { badge_id: number; earned_at: string }) => [
      ub.badge_id,
      ub.earned_at,
    ])
  );

  const certificates = ((certsRes.data || []) as (DbCertificate & {
    issuer?: { full_name: string } | null;
  })[]).map((c) => mapCertificate({ ...c, issuer_name: c.issuer?.full_name }));

  const badges: Badge[] = ((badgesRes.data || []) as DbBadge[]).map((b) => ({
    id: b.badge_id,
    name: b.name,
    icon: b.icon,
    description: b.description,
    earned: earnedBadgeIds.has(b.badge_id),
    date: earnedDates[b.badge_id] || null,
  }));

  return NextResponse.json({ certificates, badges });
}

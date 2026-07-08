import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import type { DbSwapGroup } from '@/types';

interface JoinGroupBody {
  groupId: string;
}

/**
 * POST /api/match/join — Takas grubuna katıl
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
    }

    const { groupId } = (await request.json()) as JoinGroupBody;

    const { data: group } = await supabase
      .from('swap_groups')
      .select('*')
      .eq('swap_group_id', groupId)
      .single();

    if (!group) {
      return NextResponse.json({ error: 'Grup bulunamadı' }, { status: 404 });
    }

    const groupData = group as DbSwapGroup;

    const { count } = await supabase
      .from('swap_group_participants')
      .select('*', { count: 'exact', head: true })
      .eq('swap_group_id', groupId);

    if ((count ?? 0) >= groupData.max_participants) {
      return NextResponse.json({ error: 'Grup dolu' }, { status: 400 });
    }

    await supabase.from('swap_group_participants').upsert(
      {
        swap_group_id: groupId,
        user_id: user.id,
      },
      { onConflict: 'swap_group_id,user_id' }
    );

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'swap',
      body: `"${groupData.name}" takas grubuna katıldınız!`,
    });

    return NextResponse.json({ success: true, groupName: groupData.name });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Katılım hatası';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

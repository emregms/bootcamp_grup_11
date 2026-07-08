import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

const ALLOWED_BUCKETS = ['avatars', 'lesson-covers'] as const;
const MAX_SIZE = 10 * 1024 * 1024;

/**
 * POST /api/upload — Görsel yükle (avatars | lesson-covers)
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Oturum gerekli' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const bucket = (formData.get('bucket') as string) || 'lesson-covers';

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Dosya gerekli' }, { status: 400 });
    }

    if (!ALLOWED_BUCKETS.includes(bucket as (typeof ALLOWED_BUCKETS)[number])) {
      return NextResponse.json({ error: 'Geçersiz bucket' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Dosya 10MB sınırını aşıyor' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Yalnızca görsel dosyaları kabul edilir' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user.id}/${Date.now()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({ url: urlData.publicUrl, path });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Yükleme hatası';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

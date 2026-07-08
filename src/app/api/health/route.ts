import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Supabase bağlantı durumunu kontrol eder.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('categories').select('category_id').limit(1);

    if (error) {
      return NextResponse.json(
        { status: 'degraded', message: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      service: 'SkillBridge API',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Supabase yapılandırması eksik';
    return NextResponse.json(
      {
        status: 'error',
        message,
        hint: 'env/.env.local.example dosyasını .env.local olarak kopyalayın',
      },
      { status: 503 }
    );
  }
}

import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from '@/lib/env';

export async function createClient(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase yapılandırması eksik. env/.env.local.example dosyasına bakın.');
  }

  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Parameters<(typeof cookieStore)['set']>[2] }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // middleware session refresh'i halleder
        }
      },
    },
  });
}

export function createServiceClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY tanımlı değil.');
  }

  return createSupabaseClient(getSupabaseUrl(), serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from '@/lib/env';

let client: SupabaseClient | null = null;

export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (client) return client;

  client = createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
  return client;
}

/**
 * Ortam değişkeni yardımcıları.
 */

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL tanımlı değil. env/.env.local.example dosyasına bakın.');
  }
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı değil. env/.env.local.example dosyasına bakın.');
  }
  return key;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('YOUR_PROJECT') &&
    !key.includes('your-') &&
    !key.includes('eyJ...your')
  );
}

export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'SkillBridge',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://skillbridge.hegg.tr',
  authRedirectUrl: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URL || 'https://skillbridge.hegg.tr/auth/callback',
} as const;

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || 'gemini-2.0-flash-lite';
}

export function isGeminiConfigured(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(key && !key.includes('your-') && key !== '');
}

/** true ise Gemini API çağrılmaz — yarışma/demo için anında yanıt */
export function isGeminiFallbackForced(): boolean {
  return process.env.GEMINI_USE_FALLBACK === 'true';
}

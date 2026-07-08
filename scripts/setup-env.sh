#!/bin/bash
# SkillBridge ortam kurulum scripti
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"
EXAMPLE="$ROOT/env/.env.local.example"

echo "🚀 SkillBridge ortam kurulumu"
echo ""

if [ -f "$ENV_FILE" ]; then
  echo "⚠️  .env.local zaten mevcut — üzerine yazılmadı."
else
  cp "$EXAMPLE" "$ENV_FILE"
  echo "✅ .env.local oluşturuldu"
fi

echo ""
echo "📋 Yapmanız gerekenler:"
echo "  1. Supabase Dashboard → https://supabase.com/dashboard"
echo "  2. Yeni proje oluşturun"
echo "  3. Settings → API → URL ve anon key'i .env.local'e yapıştırın"
echo "  4. service_role key'i de .env.local'e ekleyin (seed için)"
echo ""
echo "  5. Migration'ları uygulayın:"
echo "     supabase link --project-ref YOUR_REF"
echo "     npm run db:push"
echo ""
echo "  6. Demo veriyi yükleyin:"
echo "     npm run db:seed"
echo ""
echo "  7. Uygulamayı başlatın:"
echo "     npm run dev"
echo ""
echo "🎯 Demo giriş: demo@skillbridge.com / Demo123!"

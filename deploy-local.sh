#!/bin/bash
set -e

PROD_DIR="../servitur-prod"
PREVIEW_PORT=4173

echo "🔄 Merging testing → main (fast-forward)..."
cd "$PROD_DIR"
git merge --ff-only testing

echo "📥 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🔨 Building..."
pnpm build

echo "🔄 Reiniciando preview server..."
lsof -ti:"$PREVIEW_PORT" | xargs kill -9 2>/dev/null || true
pnpm preview &
sleep 2

echo ""
echo "✅ Deploy local listo → http://localhost:${PREVIEW_PORT}/servitur-app/"

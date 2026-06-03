#!/usr/bin/env bash
set -euo pipefail

npm install -g corepack@latest
corepack enable
corepack prepare pnpm@9.15.0 --activate

pnpm install --frozen-lockfile
pnpm db:generate

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Running database migrations..."
  pnpm db:migrate:deploy
else
  echo "Skipping migrations: DATABASE_URL is not set (add it in Render Environment before deploy)."
fi

pnpm --filter @productpath/api build

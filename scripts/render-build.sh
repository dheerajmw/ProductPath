#!/usr/bin/env bash
set -euo pipefail

npm install -g corepack@latest
corepack enable
corepack prepare pnpm@9.15.0 --activate

# Render sets NODE_ENV=production; devDependencies (prisma, turbo) are required at build time
NODE_ENV=development pnpm install --frozen-lockfile

pnpm run db:generate

db_url="$(printf '%s' "${DATABASE_URL:-}" | tr -d '[:space:]')"
if [ -n "$db_url" ] && [[ "$db_url" == postgresql://* || "$db_url" == postgres://* ]]; then
  echo "Running database migrations..."
  pnpm db:migrate:deploy
else
  echo "Skipping migrations: DATABASE_URL is not set or invalid (add Neon URL in Render Environment, then redeploy)."
fi

pnpm run build:api

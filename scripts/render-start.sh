#!/usr/bin/env bash
set -euo pipefail

npm install -g corepack@latest
corepack enable
corepack prepare pnpm@9.15.0 --activate

# Prefer direct/non-pooling URL for migrate (Neon); fall back to DATABASE_URL
migrate_url="$(printf '%s' "${DATABASE_URL_NON_POOLING:-${POSTGRES_URL_NON_POOLING:-${DATABASE_URL:-}}}" | tr -d '[:space:]')"

if [ -n "$migrate_url" ] && [[ "$migrate_url" == postgresql://* || "$migrate_url" == postgres://* ]]; then
  echo "Running database migrations at startup..."
  DATABASE_URL="$migrate_url" pnpm db:migrate:deploy || {
    echo "WARNING: migrate deploy failed — API will still start. Check DATABASE_URL / use non-pooling URL."
  }
else
  echo "Skipping migrations: set DATABASE_URL (or DATABASE_URL_NON_POOLING) in Render Environment."
fi

exec pnpm --filter @productpath/api start

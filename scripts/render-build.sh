#!/usr/bin/env bash
set -euo pipefail

npm install -g corepack@latest
corepack enable
corepack prepare pnpm@9.15.0 --activate

# Render sets NODE_ENV=production; devDependencies (prisma, turbo) are required at build time
NODE_ENV=development pnpm install --frozen-lockfile

pnpm run db:generate

# Migrations run at service start (scripts/render-start.sh), not during build — avoids exit 1
# when DATABASE_URL is unset during Blueprint deploy or when Neon blocks pooler during build.
pnpm run build:api

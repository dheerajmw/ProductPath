#!/usr/bin/env bash
set -euo pipefail

npm install -g corepack@latest
corepack enable
corepack prepare pnpm@9.15.0 --activate

# Render sets NODE_ENV=production; Next needs TypeScript and types at build time
NODE_ENV=development pnpm install --frozen-lockfile

NODE_ENV=production pnpm --filter @productpath/web... run build

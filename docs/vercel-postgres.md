# Vercel Postgres (database only)

Use **Vercel Postgres** (Neon) as your only managed database. ProductPath still needs **`apps/api`** running somewhere with `DATABASE_URL` — the Next.js app on Vercel never talks to Postgres directly.

```text
┌─────────────────────┐     HTTPS      ┌─────────────────────┐
│  Vercel (apps/web)  │ ─────────────► │  API host           │
│  NEXT_PUBLIC_API_URL│                │  DATABASE_URL ──────┼──► Vercel Postgres
└─────────────────────┘                └─────────────────────┘
```

| Component | Where it lives |
|-----------|----------------|
| **Database** | Vercel Postgres (this guide) |
| **Frontend** | Vercel — [vercel-deploy.md](./vercel-deploy.md) |
| **API** | Not on Vercel by default — local dev, or Render/Railway/Fly (free tiers) using the **same** `DATABASE_URL` |

---

## 1. Create Vercel Postgres

1. Open your **ProductPath** project on [vercel.com](https://vercel.com).
2. Go to **Storage** → **Create Database** → **Postgres** (or **Browse Storage** → **Neon** / **Vercel Postgres**).
3. Choose a region close to your users → **Create**.
4. **Connect** the database to your **web** project when prompted.

Vercel injects env vars into the project (names may vary slightly):

| Variable | Use |
|----------|-----|
| `POSTGRES_URL` | Pooled connection — good for **runtime** (`DATABASE_URL` on API) |
| `POSTGRES_URL_NON_POOLING` | Direct connection — use for **migrations** |
| `POSTGRES_PRISMA_URL` | Often set for Prisma — can use as `DATABASE_URL` if provided |

**Do not** add `POSTGRES_*` or `DATABASE_URL` to **NEXT_PUBLIC_** variables (secrets must stay server-side only).

---

## 2. Run migrations against Vercel Postgres

From your machine (repo root), using the **non-pooling** URL from Vercel → **Storage** → your DB → **`.env.local` tab** or **Connect**:

```bash
cd ProductPath

# One-off: migrate using direct URL (recommended for Prisma migrate)
export DATABASE_URL="postgresql://..."   # paste POSTGRES_URL_NON_POOLING

pnpm db:generate
pnpm exec prisma migrate deploy --schema=packages/database/prisma/schema.prisma
```

Or add to a local file (never commit):

```bash
# env.vercel.postgres or .env.vercel.postgres (gitignored) — copy from Vercel Storage UI
# Must be DATABASE_URL (not POSTGRES_URL_NON_POOLING) and wrap in quotes if URL contains &
DATABASE_URL="<paste POSTGRES_URL_NON_POOLING here>"
```

```bash
set -a && source env.vercel.postgres && set +a
pnpm db:migrate:deploy
pnpm db:seed
```

`db:seed` creates the admin user and PM demo content — run once per new database.

---

## 3. Point the API at Vercel Postgres

### Option A — Local API + cloud DB (simplest)

Keep running the API on your laptop; data lives in Vercel Postgres.

**`.env`** (local API):

```env
DATABASE_URL="<POSTGRES_URL from Vercel — pooled URL is fine for dev>"
API_URL="http://localhost:4000"
WEB_APP_URL="http://localhost:3000"
CORS_ORIGINS="http://localhost:3000,http://localhost:3001,https://YOUR-VERCEL-APP.vercel.app"
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

```bash
pnpm dev
```

Your **Vercel frontend** cannot use `localhost:4000` for real users — only you on the same machine. For a public demo, use Option B.

### Option B — Public API + Vercel Postgres (production)

Deploy **`apps/api`** to any Node host (Render, Railway, Fly, etc.) and set:

```env
DATABASE_URL=<same POSTGRES_URL as Vercel Storage>
API_URL=https://your-api.onrender.com
WEB_APP_URL=https://your-app.vercel.app
CORS_ORIGINS=https://your-app.vercel.app
SESSION_SECRET=<long random string>
NODE_ENV=production
```

On **Vercel (web project)**:

```env
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
```

Redeploy web + API after changing env vars.

---

## 4. Vercel env checklist (web project)

| Variable | Set on Vercel web? | Notes |
|----------|-------------------|--------|
| `POSTGRES_*` | Auto (Storage) | Used if you add serverless/API on Vercel later |
| `NEXT_PUBLIC_API_URL` | **Yes** | Public API URL |
| `DATABASE_URL` | **No** (not on web) | Only on **API** host |

Connecting Storage to the project does **not** make the Next.js app use the DB automatically — only `apps/api` uses Prisma.

---

## 5. Verify database

```bash
# With DATABASE_URL set to Vercel Postgres
pnpm exec prisma studio --schema=packages/database/prisma/schema.prisma
```

Or hit API health after `pnpm dev`:

```text
GET http://localhost:4000/health
```

---

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| Migration fails with pool / timeout | Use `POSTGRES_URL_NON_POOLING` for `migrate deploy` |
| `Can't reach database` | Allow your IP in Neon/Vercel DB settings; check URL has no extra quotes |
| Login works locally, not on Vercel | `NEXT_PUBLIC_API_URL` must be public API, not `localhost` |
| Empty app after migrate | Run `pnpm db:seed` |
| SSL errors | Neon URLs usually include `?sslmode=require` — copy URL exactly from Vercel |

---

## What “Vercel Postgres only” means here

- **Yes:** Postgres hosted by Vercel/Neon; no Docker Postgres required in production.
- **No:** Full stack is not only Vercel — you still need an **API process** unless you refactor `apps/api` to serverless.

Minimum production stack with this guide:

1. **Vercel Postgres** — data  
2. **Vercel** — `apps/web`  
3. **One small API host** — `apps/api` + `DATABASE_URL`

See also: [vercel-deploy.md](./vercel-deploy.md), [FEATURES.md](./FEATURES.md).

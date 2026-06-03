# Production: Vercel web + Vercel Postgres + public API

Signup/login on **https://your-app.vercel.app** only work when the browser can reach a **public API**. Localhost works because `NEXT_PUBLIC_API_URL=http://localhost:4000` runs on your machine. Vercel cannot use localhost.

```text
Browser (Vercel)  --POST /auth/signup-->  API (Render/Railway)  -->  Vercel Postgres
         NEXT_PUBLIC_API_URL              DATABASE_URL
```

---

## Step 1 — Database (done if you ran migrate/seed)

Vercel **Storage → Postgres** with migrations applied. See [vercel-postgres.md](./vercel-postgres.md).

---

## Step 2 — Deploy API on Render (free)

1. Push this repo to GitHub.
2. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Blueprint** → connect **ProductPath** repo (uses `render.yaml`).  
   **When prompted, fill every `sync: false` field** (see [render-setup.md](./render-setup.md)).  
   If Blueprint shows errors, use **Manual Web Service** in [render-setup.md](./render-setup.md),  
   **or** manual settings:

| Setting | Value |
|---------|--------|
| **Root Directory** | *(leave empty — repo root)* |
| **Build Command** | `corepack enable && pnpm install --frozen-lockfile && pnpm db:generate && pnpm --filter @productpath/api build` |
| **Start Command** | `pnpm --filter @productpath/api start` |
| **Health check path** | `/health` |

3. **Environment variables** on Render:

| Variable | Value |
|----------|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Pooled `POSTGRES_URL` from Vercel Storage (same as local `.env`) |
| `SESSION_SECRET` | Long random string (Render can generate) |
| `API_URL` | `https://productpath-api.onrender.com` *(your Render URL, no trailing slash)* |
| `WEB_APP_URL` | `https://YOUR-APP.vercel.app` |
| `CORS_ORIGINS` | `https://YOUR-APP.vercel.app` *(add preview URLs if needed, comma-separated)* |
| `ADMIN_APP_URL` | `https://YOUR-APP.vercel.app` or admin URL |

4. **Deploy** and wait until **Live**.
5. Test: open `https://YOUR-API.onrender.com/health` → should return JSON OK.

**Free tier:** service sleeps after idle; first request may take ~30s.

---

## Step 3 — Configure Vercel (web)

**Project → Settings → Environment Variables** (Production + Preview):

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-API.onrender.com` *(same as Render `API_URL`)* |

**Do not** set `NEXT_PUBLIC_API_URL` to `http://localhost:4000` for Production.

**Redeploy** the Vercel project (Deployments → Redeploy).

---

## Step 4 — Verify signup

1. Open `https://YOUR-APP.vercel.app/signup`
2. Create an account
3. If it fails, open browser **DevTools → Network** → `signup` request:
   - **URL** should be `https://YOUR-API.onrender.com/auth/signup`, not localhost
   - **Status** 201 = success; 500 = check Render logs (`DATABASE_URL`); CORS error = fix `CORS_ORIGINS`

---

## Checklist

| Check | |
|-------|---|
| Render `/health` works | |
| `DATABASE_URL` on Render (not only `POSTGRES_URL`) | |
| `CORS_ORIGINS` includes exact Vercel URL (https, no trailing slash) | |
| `NEXT_PUBLIC_API_URL` on Vercel = Render URL | |
| Vercel redeployed after env change | |

---

## Optional: keep using local API for dev only

Local `.env`:

```env
DATABASE_URL="..."          # Neon pooled URL
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

Run `pnpm dev` — web + API on laptop, DB in Neon.

---

## Why Vercel alone is not enough

| Component | Vercel hosts? |
|-----------|----------------|
| `apps/web` | Yes |
| Vercel Postgres | Yes (Storage) |
| `apps/api` (Express) | **No** — use Render/Railway/Fly |

See also: [vercel-deploy.md](./vercel-deploy.md), [vercel-postgres.md](./vercel-postgres.md).

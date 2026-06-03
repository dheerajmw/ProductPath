# Render setup (Blueprint or manual)

If Render shows **“There are some errors above”** before deploy, use this checklist.

---

## A. Blueprint (`render.yaml`) — fill the prompted fields

When you apply the Blueprint, Render asks for every variable with `sync: false`. **You must fill all of them** or deploy is blocked.

| Variable | What to enter |
|----------|----------------|
| `DATABASE_URL` | Pooled Neon URL from Vercel Storage (`POSTGRES_URL` in Vercel → Storage → Connect). Must be quoted if it contains `&`. |
| `API_URL` | Your Render service URL after first deploy, e.g. `https://productpath-api.onrender.com` — or use a placeholder and update after deploy |
| `WEB_APP_URL` | Your Vercel site, e.g. `https://your-app.vercel.app` |
| `CORS_ORIGINS` | Same as `WEB_APP_URL` (exact `https://`, no trailing slash) |

`SESSION_SECRET` is auto-generated (`generateValue: true`).

**Tip:** If you don’t know `API_URL` yet, use the name Render will assign: `https://productpath-api.onrender.com` (must match the service `name` in `render.yaml`).

### Common Blueprint errors

| Error / symptom | Fix |
|-----------------|-----|
| Errors above, empty fields | Fill **every** `sync: false` field in the Blueprint form |
| `plan: free` not allowed | Add a payment method to Render (Hobby plan), or change `plan: starter` in `render.yaml` |
| Blueprint not found | Use branch **`main`**, repo root, file `render.yaml` |
| Build fails on pnpm | Use latest `render.yaml` (corepack + multiline `buildCommand`) |

---

## B. Manual Web Service (no Blueprint)

If Blueprint keeps failing:

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**
2. Connect **dheerajmw/ProductPath**, branch **main**
3. Settings:

| Field | Value |
|-------|--------|
| **Name** | `productpath-api` |
| **Root Directory** | *(leave empty)* |
| **Runtime** | Node |
| **Build Command** | See below |
| **Start Command** | `pnpm --filter @productpath/api start` |
| **Health Check Path** | `/health` |

**Build Command** (paste as one block):

```bash
npm install -g corepack@latest
corepack enable
pnpm install --frozen-lockfile
pnpm db:generate
pnpm --filter @productpath/api build
```

**Pre-deploy command** (optional, Settings → Pre-deploy):

```bash
pnpm db:migrate:deploy
```

4. **Environment** variables:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Neon pooled URL from Vercel |
| `SESSION_SECRET` | Generate random string |
| `API_URL` | `https://productpath-api.onrender.com` (your Render URL) |
| `WEB_APP_URL` | `https://YOUR-APP.vercel.app` |
| `CORS_ORIGINS` | `https://YOUR-APP.vercel.app` |

5. **Create Web Service** → wait until **Live**
6. Open `https://YOUR-API.onrender.com/health`

---

## C. Vercel (after API is live)

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | Same as Render `API_URL` |

Redeploy Vercel.

See [vercel-production.md](./vercel-production.md).

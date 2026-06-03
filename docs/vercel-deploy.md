# Deploy ProductPath frontend on Vercel

This deploys **`apps/web`** — the same Next.js UI you see at http://localhost:3000 when you run `pnpm dev`.

The API is **not** deployed by Vercel with this setup. Auth and data require a hosted `apps/api`. The database **can** be [Vercel Postgres](./vercel-postgres.md) (Neon); the API still runs elsewhere (e.g. [Render](./vercel-production.md)).

**Signup works locally but not on Vercel?** → [vercel-production.md](./vercel-production.md) (deploy API + set `NEXT_PUBLIC_API_URL`).

## Prerequisites

- GitHub repo: [dheerajmw/ProductPath](https://github.com/dheerajmw/ProductPath)
- (Recommended) A public API URL for production

## One-time Vercel setup

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New… → Project** → import **ProductPath**.
3. Configure the project:

   | Setting | Value |
   |---------|--------|
   | **Framework Preset** | Next.js |
   | **Root Directory** | `apps/web` |
   | **Include source files outside of the Root Directory** | **Enabled** (required for `@productpath/ui`) |

4. **Environment variables** (Production, Preview, Development):

   | Name | Example |
   |------|---------|
   | `NEXT_PUBLIC_API_URL` | `https://your-api.onrender.com` |

   Use your real API base URL (no trailing slash). For UI-only preview without an API, builds still succeed; login/API calls will fail until the API is live.

5. **Deploy**.

Vercel reads `apps/web/vercel.json` for install/build commands that run from the monorepo root via `pnpm` + Turbo.

## After deploy

1. Copy your Vercel URL (e.g. `https://productpath.vercel.app`).
2. On the **API** host, set:
   - `CORS_ORIGINS` — include your Vercel URL (and preview URLs if needed)
   - `WEB_APP_URL` — your Vercel URL (for email links)
3. Redeploy or restart the API so cookies/CORS match your frontend origin.

### Cookie note

The app uses `credentials: "include"` and an httpOnly session cookie from the API. The API must:

- Use HTTPS in production
- Set `SameSite` / `Secure` appropriately for cross-origin if API and web are on different domains
- List the Vercel origin in `CORS_ORIGINS`

## Local production build (sanity check)

```bash
cd ProductPath
pnpm install
NEXT_PUBLIC_API_URL=http://localhost:4000 pnpm --filter @productpath/web build
```

## CLI deploy (optional)

```bash
npm i -g vercel
cd apps/web
vercel link
vercel env add NEXT_PUBLIC_API_URL
vercel --prod
```

## Files

| File | Purpose |
|------|---------|
| `apps/web/vercel.json` | Monorepo install/build commands |
| `apps/web/.env.example` | Env var template for Vercel dashboard |
| `apps/web/next.config.ts` | `outputFileTracingRoot` for workspace packages |
| `.vercelignore` | Smaller uploads (excludes API, admin, stitch assets) |
| `.npmrc` | pnpm settings for CI/Vercel |

## Troubleshooting

### Landing on “Admin console” login (wrong app)

If you see a simple card titled **Admin console** and copy about operations/configuration, Vercel is building **`apps/admin`**, not the candidate web app.

| What you should see at `/` | App | Root Directory |
|----------------------------|-----|----------------|
| Marketing hero, “Parallel journeys”, glass UI | `apps/web` | **`apps/web`** |
| Redirect to `/login` → “Admin console” | `apps/admin` | `apps/admin` (wrong for public site) |

**Fix:**

1. Vercel → your project → **Settings** → **General**
2. **Root Directory** → **Edit** → set to **`apps/web`** (not `apps/admin`, not empty, not `apps`)
3. Enable **Include source files outside of the Root Directory**
4. **Redeploy** (Deployments → … → Redeploy)

Check the browser tab title: **ProductPath** = web; **ProductPath Admin** = admin.

If you created two Vercel projects, open the one whose root is `apps/web`.

### Other issues

| Issue | Fix |
|-------|-----|
| `Cannot find module '@productpath/ui'` | Enable **Include source files outside of the Root Directory**; Root Directory = `apps/web` |
| Build works, login fails | Set `NEXT_PUBLIC_API_URL`; deploy API; fix `CORS_ORIGINS`; on API set `WEB_APP_URL` + `API_URL` (enables `SameSite=None` cookies cross-domain) |
| “Invalid email or password” but password is correct | Re-signup after fix, or use lowercase email; recruiter signups before this fix may have mixed-case emails (login now matches case-insensitively) |
| “Cannot reach the API…” | API not running or wrong `NEXT_PUBLIC_API_URL` on Vercel |
| 404 on client routes | Next.js App Router — ensure Framework = Next.js, not static export |

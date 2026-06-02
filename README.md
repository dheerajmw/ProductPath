# ProductPath

Skill-first talent network for product professionals. See [docs/problemStatenment.md](./docs/problemStatenment.md) and [docs/implementationPlan.md](./docs/implementationPlan.md).

## Phase 5 (Verification) — implemented

- **Backend:** state machine (D-09, D-10, D-11), discovery settings, public profile, expiry job
- **Web:** `/profile`, dashboard badge + re-verification banners
- **UI:** `VerificationBadge` component
- **Docs:** [docs/phase5/](docs/phase5/README.md)

## Phase 4 (Proof of work) — implemented

- **Backend:** project templates, submissions, local uploads, reviewer queue, rubric reviews (D-14)
- **Web:** `/projects`, `/projects/[templateSlug]`, `/projects/submissions/[id]`
- **Admin:** `/reviews`, `/content/project-templates`
- **Docs:** [docs/phase4/](docs/phase4/README.md)
- **Seed:** 3 PM project templates (teardown, PRD, feature proposal)

## Phase 3 (Skill development) — implemented

- **Backend:** recommendations from gaps, skill→module mappings, development snapshots
- **Web:** `/gaps`, dashboard widget, `/projects` stub (P3-03)
- **Admin:** `/content/skill-mappings`
- **Docs:** [docs/phase3/](docs/phase3/README.md)

## Phase 2 (Assessment) — implemented

- **Backend:** timed attempts, scoring, retakes (D-04), learning gate (D-05), gaps (D-09)
- **Web:** `/assessments`, `/assessments/[attemptId]`, `/assessments/results/[id]`, `/assessments/gaps`
- **Admin:** `/content/questions`
- **Docs:** [docs/phase2/](docs/phase2/README.md)
- **Seed:** PM readiness assessment (11 questions, 5 skills)

## Phase 1 (Learning) — implemented

- **Backend:** role selection (D-01 archive), roadmap/modules/resources, progress, D-13 completion rules
- **Web:** `/onboarding/role`, `/learn`, `/learn/[moduleId]`, `/settings/role`
- **Admin:** `/content/roadmaps` — view roadmaps and modules
- **Seed:** Product Management roadmap (3 modules) via `pnpm db:seed`
- **Docs:** [docs/phase1/](docs/phase1/README.md)

## Phase 0 / Wave 0 (Foundation) — implemented

- **Monorepo:** `apps/api`, `apps/web`, `apps/admin`, `packages/database`, `packages/shared`, `packages/ui`
- **Auth:** signup, email verification (dev: link in API logs), login, logout, sessions (httpOnly cookie)
- **Data:** PostgreSQL + Prisma (`User`, `CandidateProfile`, `RecruiterProfile`, `Role`, `AuditLog`, `FeatureFlag`, `AppConfig`)
- **Admin:** RBAC (`ADMIN` role), dashboard, audit logs, feature flags
- **Cross-cutting:** rate limits, Zod validation, HTML sanitization helpers, privacy export/delete stubs, structured logging
- **CI:** GitHub Actions (migrate, seed, test, build)
- **Docs:** [docs/phase0/](docs/phase0/README.md)

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for Postgres + Redis)

## Quick start

```bash
# 1. Install
pnpm install

# 2. Environment
cp .env.example .env

# 3. Start databases
docker compose up -d

# 4. Database setup
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 5. Run all apps
pnpm dev
```

| Service | URL |
|---------|-----|
| Web (candidates) | http://localhost:3000 |
| Admin | http://localhost:3001 |
| API | http://localhost:4000 |
| API health | http://localhost:4000/health |

### Default admin (after seed)

- Email: `admin@productpath.local`
- Password: `changeme-admin` (override via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`)

### Email verification (local)

After signup, open the API terminal log for:

```text
[dev] Email verification link for you@example.com: http://localhost:3000/verify-email?token=...
```

## Streamlit portal (Community Cloud)

A lightweight **Streamlit** app documents the platform and can health-check a deployed API.

| File | Purpose |
|------|---------|
| `streamlit_app.py` | Main entry for [Streamlit Cloud](https://share.streamlit.io) |
| `requirements.txt` | Python deps |
| `.streamlit/config.toml` | Dark theme |

**Deploy:** connect repo [dheerajmw/ProductPath](https://github.com/dheerajmw/ProductPath), main file `streamlit_app.py`. See [docs/streamlit-deploy.md](./docs/streamlit-deploy.md).

```bash
pip install -r requirements.txt
streamlit run streamlit_app.py
```

The full candidate/admin UI remains the Next.js apps below—not Streamlit.

## Project structure

```
apps/
  api/       Express REST API
  web/       Next.js candidate app
  admin/     Next.js admin console
packages/
  database/  Prisma schema & client
  shared/    Zod schemas, constants, sanitize
  ui/        Shared React components
docs/        Product & architecture docs
  phase0/    Foundation (Wave 0)
  phase1/    Learning
  phase2/    Assessment
  phase3/    Skill development
  phase4/    Proof of work
  phase5/    Verification
  phase6/    Talent marketplace
  phase7/    Community feed
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run api + web + admin in parallel |
| `pnpm build` | Production build all packages |
| `pnpm test` | Run unit tests |
| `pnpm db:seed` | Seed roles, config, admin user |

## MVP status

Phases 0–7 are implemented for the Product Management pilot path. See the [MVP launch checklist](./docs/implementationPlan.md#mvp-launch-checklist) before production.

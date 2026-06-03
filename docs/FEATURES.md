# ProductPath — Features & capabilities

Skill-first talent network for product professionals. Phases **0–7** are implemented; seeded content is strongest for the **Product Management** pilot path.

See also: [problem statement](./problemStatenment.md), [phasewise architecture](./phasewiseArchitecture.md), [implementation plan](./implementationPlan.md).

---

## What it is

Candidates **learn → assess → submit proof-of-work → earn verification → opt into discovery**. Recruiters search verified talent and send **interest requests**. Admins manage content, reviews, recruiters, and moderation.

Hiring signal is designed to reflect **demonstrated skills**, not pedigree alone.

---

## Applications & roles

| Role | App | URL (local) | Purpose |
|------|-----|-------------|---------|
| **Candidate** | `apps/web` | http://localhost:3000 | Learning, assessments, projects, profile, opportunities, community |
| **Recruiter** | `apps/web` (`/recruiter/*`) | same | Signup, search, candidate detail, interest requests |
| **Admin** | `apps/admin` | http://localhost:3001 | Content, reviews, recruiter approval, moderation, flags |
| **API** | `apps/api` | http://localhost:4000 | Auth, business logic, database |

---

## Candidate features (`apps/web`)

### Auth & account (Phase 0)

- Signup, login, logout (httpOnly session cookie `pp_session`)
- Email verification (optional Resend; dev links in API logs / UI)
- Resend verification, change email
- Post-login routing: recruiter → `/recruiter/search`; no role → `/onboarding/role`; else `/dashboard`
- Settings: `/settings/account`, `/settings/role`, `/settings/discovery`

### Learning (Phase 1)

- Choose product **role**; archive prior path when switching roles (D-01)
- **Roadmap** with modules and resources
- Module pages: complete resources, module completion rules (D-13)
- Routes: `/onboarding/role`, `/learn`, `/learn/[moduleId]`
- **Seed:** PM roadmap (3 modules); other roles may have less content

### Assessments (Phase 2)

- Assessment hub, **timed attempts**, save answers, submit
- Server-side scoring and results; retake rules (D-04)
- Learning **gate** before starting assessment (D-05)
- Skill **gaps** from results: `/gaps` (and `/assessments/gaps` redirect)
- Routes: `/assessments`, `/assessments/[attemptId]`, `/assessments/results/[attemptId]`
- **Seed:** PM readiness assessment (~11 questions, 5 skills)

### Skill development (Phase 3)

- Recommendations from assessment gaps (skill → module mappings)
- Refresh recommendations; skill-development summary on dashboard
- Route: `/gaps`

### Proof of work (Phase 4)

- Project **templates**, start submission by slug
- Draft, upload files (local `UPLOAD_DIR` in dev), submit, **resubmit** after feedback
- Routes: `/projects`, `/projects/[templateSlug]`, `/projects/submissions/[id]`
- **Seed:** 3 PM templates (teardown, PRD, feature proposal)

### Verification (Phase 5)

- Verification **state machine** (e.g. Learning → Emerging → Interview ready → Verified professional)
- Profile checklist and **VerificationBadge**; expiry banners on dashboard
- **Public profile** API for shareable candidate view
- Discovery eligibility tied to verification (D-06, D-09–D-11)
- Route: `/profile`

### Talent marketplace (Phase 6)

- **Discovery** opt-in only when interview-ready (`/settings/discovery`)
- **Opportunities** inbox: accept/decline recruiter interest requests
- Route: `/opportunities`
- Recruiters only see discoverable, verified, fresh candidates (D-08)

### Community (Phase 7)

- Feed, posts, comments, likes (rate limited)
- Post thread, **report** content
- Sanitized writes; escaped reads; project-share posts show verification labels
- Routes: `/community`, `/community/posts/[id]`

### Marketing UI

- Public landing (`/`), role-based login (product professional vs hiring partner)
- ProductPath OS glass/dark theme; command-center dashboard

---

## Recruiter features (`apps/web`)

| Feature | Route / notes |
|---------|----------------|
| Recruiter signup & onboarding | `/recruiter/onboarding` |
| Search verified talent | `/recruiter/search` (403 if recruiter not admin-verified) |
| Candidate detail | `/recruiter/candidates/[id]` |
| Interest requests | API + candidate `/opportunities` |
| Login | Same `/login` as candidates; routed to recruiter search after auth |

---

## Admin features (`apps/admin`)

| Area | Route | Capability |
|------|-------|------------|
| Auth | `/login` | Admin role only (`platformRole: ADMIN`) |
| Dashboard | `/dashboard` | Ops overview |
| Roadmaps | `/content/roadmaps`, `/content/roadmaps/[id]` | Roadmap / module / resource management |
| Questions | `/content/questions` | Assessment question bank |
| Skill mappings | `/content/skill-mappings` | Gap → module mappings |
| Project templates | `/content/project-templates` | Proof-of-work templates |
| Reviews | `/reviews` | Reviewer queue, rubric reviews |
| Recruiters | `/recruiters` | Approve pending recruiter accounts |
| Moderation | `/moderation` | Reports queue, hide posts |
| System (API) | — | Feature flags, audit logs, app config |

Default admin after seed: `admin@productpath.local` / `changeme-admin` (override in `.env`).

---

## API surface (summary)

| Namespace | Examples |
|-----------|----------|
| `/auth/*` | signup, login, logout, verify-email, me |
| `/roles` | List product roles |
| `/candidates/*` | role, roadmap, progress, gaps, recommendations, verification, submissions, discovery, interests |
| `/modules/*` | module detail, resource toggle, complete |
| `/assessments/*`, `/attempts/*` | hub, start attempt, answers, submit, result |
| `/projects/*` | templates, submissions, uploads |
| `/reviews/*`, `/reviewer/*` | review queue (admin/reviewer) |
| `/recruiters/*`, `/interest-requests/*` | recruiter signup, talent search, interests |
| `/feed`, `/posts/*` | community feed, posts, comments, likes, reports |
| `/admin/*` | dashboard, audit, flags, recruiters, moderation, content CRUD |
| `/privacy/*` | export, delete-request stubs |
| `/health`, `/metrics` | ops |

Full contracts: `docs/phase*/api-contract.md`.

---

## Platform & engineering

- **Monorepo:** pnpm + Turbo — `apps/api`, `apps/web`, `apps/admin`, `packages/database`, `packages/shared`, `packages/ui`
- **Data:** PostgreSQL, Prisma migrations, phase seeds
- **Security:** bcrypt, session cookies, Helmet, CORS, rate limits (`RATE_LIMIT_DISABLED` for local dev)
- **Validation:** Zod in `packages/shared` (client + server)
- **Jobs:** verification evaluate/expire, interest expiry (inline in dev)
- **CI:** GitHub Actions — migrate, seed, test, build

---

## Deployment (optional)

| Target | Hosts |
|--------|--------|
| Local `pnpm dev` | Full stack (web + admin + API) |
| [Vercel](../docs/vercel-deploy.md) | `apps/web` frontend — needs public API + `NEXT_PUBLIC_API_URL` |
| [Vercel Postgres](../docs/vercel-postgres.md) | Managed DB (Neon) — API uses `DATABASE_URL`; not wired to Next.js directly |
| [Streamlit](../docs/streamlit-deploy.md) | Python docs/demo portal — **not** the product UI |

---

## MVP limits

- **Code:** Phases 0–7 implemented.
- **Content:** Richest seeds for **Product Management**; expand other roles via admin + seeds.
- **Production:** See [implementation plan MVP checklist](./implementationPlan.md) (email, object storage, hosted API, etc.).
- **Frontend-only deploy:** Login and data require a deployed API and correct CORS / cookie settings.

---

## Web route index

```
/                          Landing
/signup, /login            Auth
/verify-email/*            Email verification
/dashboard                 Command center
/onboarding/role           Role selection
/learn, /learn/[moduleId]  Learning
/assessments/*             Assessments
/gaps                      Skill gaps & recommendations
/projects/*                Proof of work
/profile                   Verification checklist
/opportunities             Recruiter interest inbox
/community/*               Community feed
/settings/*                Account, role, discovery
/recruiter/*               Recruiter flows
```

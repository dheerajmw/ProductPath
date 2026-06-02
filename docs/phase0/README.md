# Phase 0 — Foundation (Wave 0)

Phase-specific documentation for ProductPath. Canonical architecture: [phasewiseArchitecture.md](../phasewiseArchitecture.md). Build tracker: [implementationPlan.md](../implementationPlan.md#wave-0-foundation-all-phases-).

## Objective

Shared platform every later phase depends on: monorepo, backend API, candidate and admin frontends, auth, and cross-cutting security.

## Deliverables

| Layer | Location | Status |
|-------|----------|--------|
| Monorepo | pnpm workspaces + Turborepo | ✅ |
| Database | migration `20250602000000_init` | ✅ |
| Seed | `packages/database/prisma/seed.ts` (roles, policy, admin) | ✅ |
| API | `apps/api` — Express 5, auth, admin, privacy stubs | ✅ |
| Web | `apps/web` — landing, auth, dashboard | ✅ |
| Admin | `apps/admin` — login, dashboard, flags, audit | ✅ |
| Infra | `docker-compose.yml`, `.github/workflows/ci.yml` | ✅ |

## API reference

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/auth/signup` | Public |
| POST | `/auth/login` | Public |
| POST | `/auth/logout` | Session |
| POST | `/auth/verify-email` | Public |
| POST | `/auth/resend-verification` | Public |
| GET | `/auth/me` | Session |
| POST | `/auth/change-email` | Session |
| GET | `/roles` | Public |
| GET | `/health` | Public |
| GET | `/feature-flags` | Public |
| GET | `/admin/dashboard` | Admin |
| GET | `/admin/audit-logs` | Admin |
| GET/PATCH | `/admin/feature-flags/:key` | Admin |
| GET | `/privacy/export` | Session |
| POST | `/privacy/delete-request` | Session |

See [api-contract.md](./api-contract.md).

## Core entities

- `User`, `Session`, `EmailVerificationToken`
- `CandidateProfile`, `RecruiterProfile` (stub)
- `Role`, `AuditLog`, `FeatureFlag`, `AppConfig`

## Candidate flow

1. Sign up at `/signup`.
2. Verify email (dev: link in API logs) at `/verify-email`.
3. Log in → `/dashboard`.
4. Admin uses `apps/admin` with seeded `ADMIN` user.

## Local setup

```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Default admin after seed: `admin@productpath.local` / `changeme-admin`.

## Related

- [API contract](./api-contract.md)
- [Edge cases](../edgeCases.md) — X-* auth and platform rows

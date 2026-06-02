# Phase 1 — Learning Foundation

Phase-specific documentation for ProductPath. Canonical architecture: [phasewiseArchitecture.md](../phasewiseArchitecture.md). Build tracker: [implementationPlan.md](../implementationPlan.md#phase-1-learning-foundation-).

## Objective

Help candidates pick a product role, follow a structured roadmap, and track module progress before assessments.

## Deliverables

| Layer | Location | Status |
|-------|----------|--------|
| Database | migration `20250602120000_phase1_learning` | ✅ |
| Seed | `packages/database/prisma/seed-learning.ts` | ✅ |
| API | `apps/api` — `learning.service.ts`, candidate + admin content routes | ✅ |
| Web | `apps/web` — `/onboarding/role`, `/learn`, `/learn/[moduleId]` | ✅ |
| Admin | `apps/admin` — `/content/roadmaps`, `/content/roadmaps/[id]` | ✅ |

## API reference

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/candidates/me/role` | Candidate |
| GET | `/candidates/me/roadmap` | Candidate |
| GET | `/candidates/me/progress` | Candidate |
| GET | `/modules/:id` | Candidate |
| POST | `/modules/:id/resources/:resourceId/toggle` | Candidate |
| POST | `/modules/:id/complete` | Candidate |
| GET/POST/PATCH | `/admin/content/roadmaps`, `modules`, `resources` | Admin |

See [api-contract.md](./api-contract.md).

## Policies applied

| ID | Rule |
|----|------|
| D-01 | Role switch archives prior role progress; active role only for downstream phases |
| D-12 | Single active role in MVP |
| D-13 | Module complete when all **required** resources are done |

## Candidate flow

1. After login, select role at `/onboarding/role` (or change via `/settings/role` → onboarding).
2. Open `/learn` for roadmap overview and progress %.
3. Open a module → complete required resources → mark module complete.
4. Progress feeds learning gate in Phase 2 (D-05).

## Pilot content

**Product Management** roadmap (3 modules): intro-to-pm, user-research-basics, roadmapping.

## Local setup

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Feature flag: `phase1_learning` (enabled in seed).

## Related

- [API contract](./api-contract.md)
- [Edge cases](../edgeCases.md) — P1-* rows

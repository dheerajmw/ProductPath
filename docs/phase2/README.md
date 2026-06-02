# Phase 2 — Skill Assessment

Phase-specific documentation for ProductPath. Canonical architecture: [phasewiseArchitecture.md](../phasewiseArchitecture.md). Build tracker: [implementationPlan.md](../implementationPlan.md#phase-2-skill-assessment).

## Objective

Measure hiring readiness and surface skill gaps via timed, server-scored assessments.

## Deliverables

| Layer | Location | Status |
|-------|----------|--------|
| Database | `packages/database/prisma` migration `20250602140000_phase2_assessment` | ✅ |
| Seed | `packages/database/prisma/seed-assessment.ts` | ✅ |
| API | `apps/api` — `assessment.service.ts`, routes | ✅ |
| Web | `apps/web` — `/assessments/*` | ✅ |
| Admin | `apps/admin` — `/content/questions` | ✅ |

## API reference

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/assessments/hub` | Candidate |
| POST | `/assessments/:id/attempts` | Candidate |
| GET | `/attempts/:id` | Candidate |
| PUT | `/attempts/:id/answers` | Candidate |
| POST | `/attempts/:id/submit` | Candidate |
| GET | `/candidates/me/assessments/results` | Candidate |
| GET | `/candidates/me/gaps` | Candidate |
| GET/POST/PATCH | `/admin/content/questions` | Admin |
| GET | `/admin/content/assessments` | Admin |

## Policies applied

| ID | Rule |
|----|------|
| D-04 | Max 3 attempts; 7-day cooldown after submitted attempt |
| D-05 | Block start if learning progress &lt; 25%; warn if &lt; 50% |
| D-09 | Pass: overall ≥ 70%, each skill ≥ 50% |
| D-02 | Latest passing attempt used downstream (Phase 5) |

## Candidate flow

1. Open `/assessments` (hub).
2. Start attempt → server sets `expiresAt` from `durationMinutes`.
3. Answer questions; autosave via `PUT /attempts/:id/answers`.
4. Submit → per-skill scores + overall + gaps at `/assessments/results/[attemptId]`.
5. View gaps at `/gaps` (or `/assessments/gaps` redirect).

## Local setup

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Pilot content: **Product Management** readiness assessment (seeded).

## Related

- [API contract detail](./api-contract.md)
- [Edge cases](../edgeCases.md) — P2-* rows

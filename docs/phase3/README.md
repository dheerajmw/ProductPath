# Phase 3 — Skill Development

Phase-specific documentation for ProductPath. Canonical architecture: [phasewiseArchitecture.md](../phasewiseArchitecture.md). Build tracker: [implementationPlan.md](../implementationPlan.md#phase-3-skill-development).

## Objective

Close assessment skill gaps with recommended learning modules and track development progress until retake.

## Deliverables

| Layer | Location | Status |
|-------|----------|--------|
| Database | migration `20250602160000_phase3_recommendations` | ✅ |
| Seed | `seed-recommendations.ts` (PM skill→module map) | ✅ |
| API | `recommendation.service.ts`, candidate + admin routes | ✅ |
| Web | `/gaps`, `/projects` (stub), dashboard widget | ✅ |
| Admin | `/content/skill-mappings` | ✅ |

## API reference

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/candidates/me/recommendations` | Candidate |
| POST | `/candidates/me/recommendations/refresh` | Candidate |
| GET | `/candidates/me/skill-development` | Candidate |
| GET | `/candidates/me/gaps` | Candidate (Phase 2) |
| GET | `/admin/content/skill-mappings` | Admin |
| PUT | `/admin/content/skill-mappings` | Admin |

See [api-contract.md](./api-contract.md).

## Policies & edge cases

| ID | Rule |
|----|------|
| P3-01 | Deleted modules filtered from recommendations |
| P3-02 | Gaps update only on assessment retake, not module completion |
| P3-03 | Projects hub reachable with warning when gaps remain |
| P3-06 | Recommendations scoped to active role roadmap |
| P3-07 | Snapshots refresh on assessment submit and on read |

## Candidate flow

1. Complete assessment (Phase 2) → recommendations generated automatically.
2. Open `/gaps` → see gaps + recommended modules with links to `/learn/[moduleId]`.
3. Complete modules → progress tracked; gaps unchanged until retake.
4. Optional: `/projects` stub with skip warning (Phase 4 hub).

## Local setup

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Pilot: **Product Management** skill→module mappings (seeded).

## Related

- [API contract](./api-contract.md)
- [Edge cases](../edgeCases.md) — P3-* rows

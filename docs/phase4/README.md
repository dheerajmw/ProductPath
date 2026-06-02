# Phase 4 — Proof of Work

Phase-specific documentation for ProductPath. Canonical architecture: [phasewiseArchitecture.md](../phasewiseArchitecture.md). Build tracker: [implementationPlan.md](../implementationPlan.md#phase-4-proof-of-work).

## Objective

Let candidates submit role-scoped projects, enter a reviewer queue, and receive rubric-based approval or actionable rejection feedback.

## Deliverables

| Layer | Location | Status |
|-------|----------|--------|
| Database | migration `20250602180000_phase4_projects` | ✅ |
| Seed | `seed-projects.ts` (3 PM templates) | ✅ |
| Storage | `apps/api/src/lib/storage.ts` (local disk + scan stub) | ✅ |
| API | `project.service.ts`, `review.service.ts`, routes | ✅ |
| Web | `/projects`, `/projects/[slug]`, `/projects/submissions/[id]` | ✅ |
| Admin | `/reviews`, `/content/project-templates` | ✅ |

## API reference

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/projects/templates` | Candidate |
| GET | `/projects/templates/:slug` | Candidate |
| POST | `/projects/submissions` | Candidate |
| PUT | `/projects/submissions/:id` | Candidate |
| POST | `/projects/submissions/:id/submit` | Candidate |
| POST | `/projects/submissions/:id/upload` | Candidate (multipart) |
| POST | `/projects/submissions/:id/resubmit` | Candidate |
| GET | `/candidates/me/submissions` | Candidate |
| GET | `/reviewer/queue` | Admin / Reviewer |
| GET | `/reviewer/submissions/:id` | Admin / Reviewer |
| POST | `/reviews` | Admin / Reviewer |
| POST | `/reviews/:submissionId/reverse` | Admin |
| GET/POST | `/admin/content/project-templates` | Admin |

See [api-contract.md](./api-contract.md).

## Policies applied

| ID | Rule |
|----|------|
| D-14 | Max 3 submission versions; rejection feedback ≥ 100 characters |
| P4-09 | Locked while `UNDER_REVIEW` |
| P4-12 | All required rubric fields before approve/reject |
| P4-13 | Admin can reverse approval (audit logged) |

## Candidate flow

1. Open `/projects` → pick a template.
2. Create draft → add narrative, URLs, file uploads.
3. Submit for review → status `UNDER_REVIEW`.
4. If rejected → read feedback → **Resubmit** creates v2 (up to 3 versions).

## Reviewer flow

1. Admin logs in → `/reviews`.
2. Select queue item → score rubric → approve or reject.
3. Candidate sees feedback on submission page.

## Local setup

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Uploads stored under `./uploads` (see `UPLOAD_DIR` in `.env`).

## Related

- [API contract](./api-contract.md)
- [Edge cases](../edgeCases.md) — P4-* rows

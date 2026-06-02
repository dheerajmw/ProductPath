# Phase 7 — Community

Phase-specific documentation for ProductPath. Canonical architecture: [phasewiseArchitecture.md](../phasewiseArchitecture.md). Build tracker: [implementationPlan.md](../implementationPlan.md#phase-7-community).

## Objective

Product professionals share signal via a moderated feed: posts, threaded comments, likes, and reports.

## Deliverables

| Layer | Location | Status |
|-------|----------|--------|
| Database | migration `20250603000000_phase7_community` | ✅ |
| API | `community.service.ts`, `moderation.service.ts`, routes | ✅ |
| Web | `/community`, `/community/posts/[id]` | ✅ |
| Admin | `/moderation` report queue | ✅ |
| Shared | `sanitizeText` / `escapeHtml` on write/read | ✅ |

## Content safety

- All post/comment bodies sanitized on write (`sanitizeText`) and escaped on API read (`escapeHtml`).
- Project share posts include **verified** vs **not verified** labels (P7-05) based on `ProjectSubmission.status`.
- Reports enter admin queue; **hide post** sets `Post.status = HIDDEN` and resolves the report.

## API reference

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/feed?cursor=&limit=` | Any authenticated user |
| POST | `/posts` | Authenticated (rate limited) |
| GET | `/posts/:id` | Authenticated |
| POST | `/posts/:id/comments` | Authenticated |
| POST | `/posts/:id/like` | Authenticated (rate limited) |
| POST | `/reports` | Authenticated |
| GET | `/admin/moderation/reports` | Admin |
| PATCH | `/admin/moderation/reports/:id` | Admin |

See [api-contract.md](./api-contract.md).

## Local setup

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Community feed: http://localhost:3000/community  
Moderation: http://localhost:3001/moderation

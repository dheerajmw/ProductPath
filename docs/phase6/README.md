# Phase 6 — Talent marketplace

Phase-specific documentation for ProductPath. Canonical architecture: [phasewiseArchitecture.md](../phasewiseArchitecture.md). Build tracker: [implementationPlan.md](../implementationPlan.md#phase-6-talent-marketplace).

## Objective

Connect verified recruiters with interview-ready candidates who opt into discovery, using an interest-request flow with contact reveal on accept.

## Deliverables

| Layer | Location | Status |
|-------|----------|--------|
| Database | migration `20250602220000_phase6_marketplace` | ✅ |
| API | `marketplace`, `recruiter`, `interest` services + routes | ✅ |
| Jobs | `interest.expire` inline in dev (hourly with verification poll) | ✅ |
| Web | discovery, opportunities, recruiter flows | ✅ |
| Admin | `/recruiters` verification queue | ✅ |

## Gates

- **D-08:** Talent search only returns `interview_ready` / `verified_professional` candidates with `discoverable: true` and fresh verification.
- **D-06:** Lapsed verification clears discoverability on next evaluation.
- Unverified recruiters receive `403 RECRUITER_NOT_VERIFIED` on search and interest send.

## Discovery (opt-in)

Candidates enable discovery at `PATCH /candidates/me/discovery` only when interview ready. Verification evaluation no longer auto-enables discovery; it only forces `discoverable: false` when no longer eligible.

## API reference

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/recruiters/signup` | Public |
| GET | `/recruiters/me` | Recruiter |
| GET | `/recruiters/talent` | Verified recruiter |
| GET | `/recruiters/candidates/:id` | Verified recruiter |
| POST | `/interest-requests` | Verified recruiter (rate limited) |
| PATCH | `/interest-requests/:id` | Candidate |
| GET | `/candidates/me/interests` | Candidate |
| GET | `/recruiters/me/interests` | Verified recruiter |
| GET/PATCH | `/candidates/me/discovery` | Candidate |
| GET | `/admin/recruiters/pending` | Admin |
| POST | `/admin/recruiters/:userId/verify` | Admin |

See [api-contract.md](./api-contract.md).

## Local setup

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Recruiter signup: http://localhost:3000/recruiter/onboarding  
Admin approve: http://localhost:3001/recruiters

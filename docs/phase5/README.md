# Phase 5 — Verification

Phase-specific documentation for ProductPath. Canonical architecture: [phasewiseArchitecture.md](../phasewiseArchitecture.md). Build tracker: [implementationPlan.md](../implementationPlan.md#phase-5-verification).

## Objective

Establish trusted, portable proof of capability via a verification state machine tied to assessments and approved projects.

## Deliverables

| Layer | Location | Status |
|-------|----------|--------|
| Database | migration `20250602200000_phase5_verification` | ✅ |
| API | `verification.service.ts`, routes, marketplace middleware | ✅ |
| Jobs | `lib/jobs.ts` inline expiry in dev (hourly poll) | ✅ |
| Web | `/profile`, dashboard badge + expiry banners | ✅ |
| UI | `VerificationBadge` in `packages/ui` | ✅ |

## Verification states

| State | Entry (MVP) |
|-------|-------------|
| `LEARNING` | Default |
| `EMERGING_TALENT` | D-11: ≥1 module completed **or** any assessment attempt |
| `INTERVIEW_READY` | D-09: fresh passing assessment + ≥1 approved project |
| `VERIFIED_PROFESSIONAL` | D-10: interview ready + (≥2 approved projects **or** overall ≥85%) |

## API reference

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/candidates/me/verification` | Candidate |
| POST | `/candidates/me/verification/refresh` | Candidate |
| GET | `/candidates/:id/public` | Public |
| POST | `/internal/verification/evaluate` | `X-Internal-Secret` |
| POST | `/internal/verification/expire` | `X-Internal-Secret` |

See [api-contract.md](./api-contract.md).

## Hooks

- Assessment submit → `evaluateVerification`
- Project approve/reject reversal → `evaluateVerification`
- `CandidateDiscoverySettings.discoverable` set when interview ready (D-08 prep)

## Local setup

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Related

- [API contract](./api-contract.md)
- [Edge cases](../edgeCases.md) — P5-* rows

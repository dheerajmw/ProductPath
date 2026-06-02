# Phase 5 — API contract

## GET `/candidates/me/verification`

Recomputes verification from current facts (assessment, projects, learning).

**Response 200**

```json
{
  "state": "EMERGING_TALENT",
  "stateLabel": "Emerging talent",
  "role": { "id", "slug", "name" },
  "grantedAt": "2026-06-02T12:00:00.000Z",
  "expiresAt": "2026-11-29T12:00:00.000Z",
  "daysUntilExpiry": 120,
  "expiringSoon": false,
  "expired": false,
  "policyVersion": 1,
  "discoverable": false,
  "checklist": [
    { "key": "assessment_pass", "label": "...", "met": true, "detail": "..." }
  ],
  "badges": {
    "emergingTalent": true,
    "interviewReady": false,
    "verifiedProfessional": false
  }
}
```

## GET `/candidates/:userId/public`

Public profile (no email). Server-rendered badge metadata for trust.

```json
{
  "profile": {
    "id": "…",
    "displayName": "Alex",
    "role": { "slug": "product-management", "name": "Product Management" },
    "verification": {
      "state": "INTERVIEW_READY",
      "stateLabel": "Interview ready",
      "validUntil": "2026-11-29T12:00:00.000Z",
      "interviewReady": true,
      "verifiedProfessional": false,
      "discoverable": true
    }
  }
}
```

## POST `/internal/verification/evaluate`

Header: `X-Internal-Secret: <INTERNAL_API_SECRET>`

Body: `{ "userId": "…" }`

## POST `/internal/verification/expire`

Runs expiry job for all records past `expiresAt`. Same auth header.

## Marketplace middleware

`requireInterviewReady` — use on Phase 6 recruiter routes. Errors: `INTERVIEW_READY_REQUIRED`, `NOT_DISCOVERABLE`.

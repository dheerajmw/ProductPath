# Phase 6 API contract

Base URL: `http://localhost:4000` (development).

## Recruiter signup

`POST /recruiters/signup`

Body: `{ email, password, company, companyDomain? }`

- Creates `RECRUITER` user + profile.
- Auto-verifies when email domain matches `companyDomain`.
- Sends email verification token (same as candidates).

## Talent search

`GET /recruiters/talent?roleSlug=&q=`

Requires verified recruiter session.

Response:

```json
{
  "candidates": [
    {
      "id": "userId",
      "displayName": "Alex",
      "role": { "slug": "product-manager", "name": "Product Manager" },
      "verificationState": "INTERVIEW_READY",
      "validUntil": "2025-12-01T00:00:00.000Z",
      "overallScore": 78,
      "approvedProjects": 1
    }
  ],
  "total": 1
}
```

## Interest flow

`POST /interest-requests` — `{ candidateId, message }` (min 20 chars). Rate limit: 20/hour.

`PATCH /interest-requests/:id` — `{ action: "accept" | "decline" }` (candidate only).

On accept, creates `Connection` and returns both parties' contact emails.

Interest `PENDING` requests expire after 30 days (`INTEREST_PENDING_DAYS`).

## Discovery settings

`GET /candidates/me/discovery`

`PATCH /candidates/me/discovery` — `{ discoverable: boolean }`

Errors: `NOT_INTERVIEW_READY` when enabling without interview ready state.

## Admin

`GET /admin/recruiters/pending`  
`POST /admin/recruiters/:userId/verify`

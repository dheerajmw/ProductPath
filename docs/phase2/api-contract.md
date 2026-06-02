# Phase 2 — API contract

## GET `/assessments/hub`

**Response**

```json
{
  "assessment": { "id", "title", "description", "durationMinutes", "version" },
  "role": { "id", "slug", "name" },
  "learningGate": {
    "progressPercent": 33,
    "warn": true,
    "blocked": false,
    "warnThreshold": 50,
    "blockThreshold": 25
  },
  "retake": {
    "attemptsUsed": 1,
    "maxAttempts": 3,
    "cooldownEndsAt": "2026-06-09T12:00:00.000Z",
    "canStart": true
  },
  "latestResult": { "id", "overallScore", "passed", "createdAt" } | null
}
```

## POST `/assessments/:id/attempts`

Starts attempt. Errors: `LEARNING_GATE_BLOCKED`, `RETAKE_COOLDOWN`, `MAX_ATTEMPTS_REACHED`, `ACTIVE_ATTEMPT_EXISTS`.

## GET `/attempts/:id`

Returns attempt state (timer server-side). Expires in-progress attempts past `expiresAt`.

```json
{
  "attempt": { "id", "status", "startedAt", "expiresAt", "secondsRemaining", "currentQuestionIndex" },
  "questions": [{ "id", "prompt", "options", "sortOrder", "answered": true, "selectedIndex": 0 }],
  "assessment": { "title", "durationMinutes" }
}
```

## PUT `/attempts/:id/answers`

Body: `{ "questionId": "...", "selectedIndex": 0, "currentQuestionIndex": 2 }`

## POST `/attempts/:id/submit`

Scores attempt; returns result + gaps summary.

## GET `/candidates/me/gaps`

```json
{
  "gaps": [{ "skillId", "skillName", "score", "floor", "gap" }],
  "overallScore": 65,
  "passed": false,
  "latestResultId": "..."
}
```

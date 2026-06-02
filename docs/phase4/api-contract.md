# Phase 4 — API contract

## GET `/projects/templates`

Returns published templates for the candidate’s **active role**.

```json
{
  "templates": [
    {
      "id": "…",
      "slug": "product-teardown",
      "title": "Product Teardown",
      "latestSubmission": { "id": "…", "status": "DRAFT", "version": 1 }
    }
  ]
}
```

## POST `/projects/submissions`

```json
{ "templateId": "…", "title": "…", "narrative": "…", "artifactUrls": [{ "type": "URL", "name": "…", "url": "https://…" }] }
```

Errors: `WRONG_ROLE_TEMPLATE`, `MAX_VERSIONS_REACHED`, `DRAFT_EXISTS`, `IN_REVIEW`, `ALREADY_APPROVED`.

## PUT `/projects/submissions/:id`

Only when `status === DRAFT`. Error: `SUBMISSION_LOCKED`.

## POST `/projects/submissions/:id/submit`

Moves to `UNDER_REVIEW`, sets `lockedAt`. Error: `EMPTY_SUBMISSION`.

## POST `/projects/submissions/:id/upload`

`multipart/form-data` field `file`. Max 10MB; allowed extensions in `packages/shared` (`ALLOWED_UPLOAD_EXTENSIONS`).

## POST `/projects/submissions/:id/resubmit`

After `REJECTED`, creates new draft with `version + 1` and `parentId`.

## POST `/reviews`

```json
{
  "submissionId": "…",
  "decision": "APPROVED" | "REJECTED",
  "feedback": "…",
  "rubricScores": { "problem_framing": 4, "solution_quality": 3 }
}
```

Errors: `RUBRIC_INCOMPLETE`, `FEEDBACK_TOO_SHORT` (rejections).

## POST `/reviews/:submissionId/reverse` (Admin)

```json
{ "reason": "Approved in error — needs revision" }
```

Sets submission to `REJECTED` and logs `REVERSED` review.

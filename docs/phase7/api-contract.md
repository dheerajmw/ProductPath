# Phase 7 API contract

Base URL: `http://localhost:4000` (development). All endpoints require a session cookie unless noted.

## Feed

`GET /feed?cursor={createdAt|postId}&limit=20`

Response:

```json
{
  "posts": [
    {
      "id": "…",
      "type": "TEXT",
      "body": "Escaped HTML body",
      "author": { "id": "…", "displayName": "Alex" },
      "projectShare": null,
      "likeCount": 2,
      "commentCount": 1,
      "likedByViewer": false,
      "createdAt": "2026-06-02T12:00:00.000Z"
    }
  ],
  "nextCursor": "2026-06-02T12:00:00.000Z|cuid"
}
```

## Create post

`POST /posts`

```json
{
  "type": "TEXT",
  "body": "Shared a discovery roadmap tip…"
}
```

Project share:

```json
{
  "type": "PROJECT_SHARE",
  "body": "Sharing my PRD project for feedback",
  "projectSubmissionId": "submissionId"
}
```

`projectShare` in responses:

```json
{
  "submissionId": "…",
  "title": "PM case study",
  "status": "APPROVED",
  "verified": true,
  "label": "Verified proof of work"
}
```

## Comments

`POST /posts/:id/comments` — `{ "body": "…", "parentId?": "…" }`

Max thread depth: **2** (top-level + one level of replies).

## Like toggle

`POST /posts/:id/like` → `{ "liked": true, "likeCount": 3 }`

## Report

`POST /reports`

```json
{
  "targetType": "POST",
  "targetId": "postId",
  "reason": "Harassment in post body…"
}
```

## Moderation (admin)

`GET /admin/moderation/reports?status=PENDING`

`PATCH /admin/moderation/reports/:id`

```json
{ "action": "hide_post", "note": "Policy violation" }
```

Actions: `hide_post` | `dismiss`

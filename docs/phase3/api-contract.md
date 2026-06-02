# Phase 3 API contract

Base URL: `http://localhost:4000` (local). All candidate routes require session cookie `pp_session` and `CANDIDATE` role.

## GET `/candidates/me/recommendations`

Returns gaps from the latest assessment plus module recommendations per gap skill.

**Response 200**

```json
{
  "sourceAttemptId": "…",
  "latestResultId": "…",
  "overallScore": 62,
  "passed": false,
  "gaps": [{ "skillId": "…", "skillName": "…", "score": 40, "floor": 50, "gap": 10 }],
  "recommendations": [
    {
      "skillId": "…",
      "skillName": "User Thinking",
      "skillSlug": "user-thinking",
      "score": 40,
      "floor": 50,
      "gap": 10,
      "modules": [
        {
          "id": "…",
          "slug": "user-research-basics",
          "title": "User Research Basics",
          "description": "…",
          "status": "IN_PROGRESS",
          "completed": false
        }
      ],
      "emptyContent": false
    }
  ],
  "retakeNote": "Completing recommended modules helps you learn…"
}
```

**Errors**

| Code | HTTP | Meaning |
|------|------|---------|
| `NO_RESULTS` | 404 | No assessment completed |
| `NO_ACTIVE_ROLE` | 400 | Role not selected |

## POST `/candidates/me/recommendations/refresh`

Regenerates recommendations from the latest assessment result (e.g. after retake). Returns same shape as GET recommendations.

## GET `/candidates/me/skill-development`

Progress snapshots per gap skill.

**Response 200**

```json
{
  "summary": {
    "openGaps": 2,
    "inProgress": 1,
    "modulesCompleted": 0,
    "hasAssessment": true,
    "overallScore": 62,
    "passed": false
  },
  "skills": [
    {
      "skillId": "…",
      "skillName": "User Thinking",
      "skillSlug": "user-thinking",
      "status": "IN_PROGRESS",
      "recommendedCompleted": 0,
      "recommendedTotal": 1,
      "sourceAttemptId": "…",
      "updatedAt": "2026-06-02T12:00:00.000Z"
    }
  ]
}
```

## Admin: skill mappings

### GET `/admin/content/skill-mappings?skillId=optional`

### PUT `/admin/content/skill-mappings`

```json
{
  "mappings": [
    { "skillId": "…", "moduleId": "…", "priority": 0 }
  ]
}
```

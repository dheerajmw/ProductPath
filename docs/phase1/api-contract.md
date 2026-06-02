# Phase 1 — API contract

Base URL: `http://localhost:4000`. Candidate routes require session + `CANDIDATE` role (or appropriate platform role).

## POST `/candidates/me/role`

Body: `{ "roleId": "...", "confirmArchive?": true }`

Selects active product role. Switching roles requires `confirmArchive: true` when prior progress exists (**D-01**).

**Response:** `{ "role": { id, slug, name, ... } }`

Errors: `NO_ACTIVE_ROLE`, `ARCHIVE_CONFIRMATION_REQUIRED`.

## GET `/candidates/me/roadmap`

Roadmap for **active role** only (**P3-06** / role scoping).

**Response:**

```json
{
  "roadmap": { "id", "title", "description", "version" },
  "role": { "id", "slug", "name" },
  "modules": [
    {
      "id", "slug", "title", "description", "sortOrder",
      "status": "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED",
      "prerequisitesMet": true,
      "locked": false,
      "requiredResourcesTotal": 2,
      "requiredResourcesCompleted": 1,
      "prerequisites": [{ "id", "title" }]
    }
  ],
  "progress": {
    "completedModules": 1,
    "totalModules": 3,
    "percent": 33,
    "label": "Emerging",
    "hiringReadiness": false
  }
}
```

`hiringReadiness` is always `false` from learning alone (**P1-13**).

## GET `/candidates/me/progress`

**Response:** `{ "progress": { completedModules, totalModules, percent, label, hiringReadiness } }`

## GET `/modules/:id`

Module detail, resources, prerequisite state, `canComplete`.

**Response:**

```json
{
  "module": { "id", "slug", "title", "locked", "prerequisitesMet", "status" },
  "resources": [
    { "id", "title", "type", "url", "content", "required", "completed" }
  ],
  "canComplete": false,
  "prerequisites": [{ "id", "title" }]
}
```

## POST `/modules/:id/resources/:resourceId/toggle`

Body: `{ "completed": true | false }`

Updates checklist; returns updated module payload.

## POST `/modules/:id/complete`

Marks module **COMPLETED** when all required resources are done (**D-13**).

Errors: `PREREQUISITES_NOT_MET`, `REQUIRED_RESOURCES_INCOMPLETE`, `MODULE_LOCKED`.

## Admin content

### GET `/admin/content/roadmaps`

### POST `/admin/content/roadmaps`

Body: `{ roleId, title, description?, published? }`

### GET `/admin/content/roadmaps/:id`

Includes modules, resources, prerequisites.

### POST `/admin/content/modules`

Body: `{ roadmapId, slug, title, description?, sortOrder?, prerequisiteIds? }`

### PATCH `/admin/content/modules/:id`

### POST `/admin/content/resources`

Body: `{ moduleId, title, type, url?, content?, required?, sortOrder? }`

### PATCH `/admin/content/resources/:id`

All admin routes require `ADMIN` session.

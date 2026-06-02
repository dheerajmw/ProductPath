# Phase 0 — API contract

Base URL: `http://localhost:4000` (local). Session auth uses httpOnly cookie `pp_session` (`credentials: 'include'` on frontends).

## POST `/auth/signup`

Body: `{ "email", "password", "displayName?" }`

**Response 201:** `{ "user", "message" }` — verification email sent (dev: logged to API console).

## POST `/auth/login`

Body: `{ "email", "password" }`

**Response 200:** Sets `pp_session` cookie; `{ "user": { id, email, platformRole, emailVerified, candidateProfile?, ... } }`.

## POST `/auth/logout`

Requires session. Clears cookie; `{ "ok": true }`.

## POST `/auth/verify-email`

Body: `{ "token" }`

**Response 200:** Sets session cookie; `{ "user" }`.

## POST `/auth/resend-verification`

Body: `{ "email" }`

## GET `/auth/me`

Requires session.

## POST `/auth/change-email`

Requires session. Body: `{ "newEmail", "password" }`.

## GET `/roles`

**Response:** `{ "roles": [{ "id", "slug", "name", "description", "sortOrder" }] }` — five product roles.

## GET `/health`

**Response:** `{ "status": "ok", "database": "connected" | "disconnected" }`

## GET `/feature-flags`

**Response:** `{ "flags": [{ "key", "enabled" }] }`

## GET `/admin/dashboard`

Requires `ADMIN` role.

**Response:** `{ "stats": { users, candidates, recruiters, roles, auditCount }, "environment" }`

## GET `/admin/audit-logs?limit=20`

Requires `ADMIN`.

## GET `/admin/feature-flags`

## PATCH `/admin/feature-flags/:key`

Body: `{ "enabled": boolean }`

## GET `/privacy/export`

Requires session. Stub export payload for GDPR hook.

## POST `/privacy/delete-request`

Requires session. Stub delete-request acknowledgment.

## Errors

JSON shape: `{ "error": string, "code?": string, "details?": object }`

Common auth codes: `INVALID_CREDENTIALS`, `EMAIL_NOT_VERIFIED`, `EMAIL_ALREADY_EXISTS`.

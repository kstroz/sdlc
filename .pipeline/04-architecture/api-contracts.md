---
id: API-CONTRACTS-001
created: 2026-05-08
version: 1
---

# API contracts

> Note: this branch has no Stage 03 UX artifacts (out of scope per the brief — see PRD Out of scope). Endpoints reference logical screens by name using the `Screen:` marker, which the validator accepts in lieu of S-NN IDs. When Stage 03 is delivered, screen names should be replaced with concrete S-NN identifiers.

## POST /auth/sign-in
- **Endpoint ID**: API-01
- **Purpose**: Exchange username and password for a session token used on every subsequent request.
- **Source screens**: Screen: Sign-in (FR-001)
- **Auth**: None
- **Request**:
  - Headers: `Content-Type: application/json`
  - Path/query params: None
  - Body schema:
    ```json
    { "username": "string", "password": "string" }
    ```
- **Response 2xx**:
  - Status: 200
  - Body schema:
    ```json
    { "userId": "uuid", "displayName": "string", "sessionToken": "string", "expiresAt": "iso8601" }
    ```
- **Response errors**:
  - 4xx: 401 — invalid credentials. Sign-in screen renders an inline error (FR-002).
  - 5xx: 503 — backend unavailable. Sign-in screen offers Retry.
- **Idempotency**: No — multiple sign-ins are valid; each issues a fresh token.
- **Rate limit**: 10/min/ip to limit credential stuffing.

## GET /tasks/today
- **Endpoint ID**: API-02
- **Purpose**: Return the calling user's tasks scheduled for today, grouped server-side by building, used by Today screen and as the source for the local cache (FR-004).
- **Source screens**: Screen: Today (FR-004), Screen: Task detail (FR-006 derives from same payload)
- **Auth**: Bearer — session token in `Authorization: Bearer <token>`
- **Request**:
  - Headers: `Authorization`
  - Path/query params: `?date=YYYY-MM-DD` (optional; defaults to server today in user's timezone)
  - Body schema: None
- **Response 2xx**:
  - Status: 200
  - Body schema:
    ```json
    {
      "groups": [
        { "building": { "id": "uuid", "name": "string", "streetAddress": "string", "city": "string", "latitude": "number?", "longitude": "number?" },
          "tasks": [ { "id": "uuid", "title": "string", "description": "string?", "managerNotes": "string?", "priority": "string", "status": "string", "dueAt": "iso8601?" } ]
        }
      ]
    }
    ```
- **Response errors**:
  - 4xx: 401 — invalid or expired token. Client routes to Sign-in.
  - 5xx: 504 — upstream timeout. Client falls back to local cache.
- **Idempotency**: Yes (read-only).
- **Rate limit**: 60/min/user.

## POST /tasks/{id}/complete
- **Endpoint ID**: API-03
- **Purpose**: Record a task completion; replay-safe with an idempotency key (FR-008, ADR-003).
- **Source screens**: Screen: Task detail (FR-008)
- **Auth**: Bearer
- **Request**:
  - Headers: `Authorization`, `Idempotency-Key: <uuid>`, `Content-Type: application/json`
  - Path/query params: `id` — the task UUID
  - Body schema:
    ```json
    { "completedAt": "iso8601", "note": "string?" }
    ```
- **Response 2xx**:
  - Status: 200
  - Body schema:
    ```json
    { "id": "uuid", "status": "done", "completedAt": "iso8601", "completedByUserId": "uuid" }
    ```
- **Response errors**:
  - 4xx: 409 — task already in a terminal status. Client treats as success (idempotent dedup).
  - 4xx: 401 — invalid or expired token.
  - 5xx: 503 — backend unavailable. Client retains the queued action for retry (FR-014).
- **Idempotency**: Yes (key: `Idempotency-Key` header).
- **Rate limit**: 120/min/user.

## POST /tasks/{id}/block
- **Endpoint ID**: API-04
- **Purpose**: Record that a task could not be completed, with one of the preset reasons (FR-010).
- **Source screens**: Screen: Task detail (FR-010)
- **Auth**: Bearer
- **Request**:
  - Headers: `Authorization`, `Idempotency-Key: <uuid>`, `Content-Type: application/json`
  - Path/query params: `id` — the task UUID
  - Body schema:
    ```json
    { "reason": "needs_parts|tenant_absent|needs_specialist", "note": "string?", "blockedAt": "iso8601" }
    ```
- **Response 2xx**:
  - Status: 200
  - Body schema:
    ```json
    { "id": "uuid", "status": "blocked", "blockReason": "string" }
    ```
- **Response errors**:
  - 4xx: 422 — invalid reason value.
  - 4xx: 409 — task already in a terminal status. Client dedup.
  - 5xx: 503 — retain in queue for retry.
- **Idempotency**: Yes (key: `Idempotency-Key`).
- **Rate limit**: 120/min/user.

## POST /photos
- **Endpoint ID**: API-05
- **Purpose**: Upload a single photo binary as multipart/form-data and link it to a task (FR-009).
- **Source screens**: Screen: Task detail / Completion sheet (FR-009)
- **Auth**: Bearer
- **Request**:
  - Headers: `Authorization`, `Idempotency-Key: <uuid>`, `Content-Type: multipart/form-data`
  - Path/query params: None
  - Body schema:
    ```json
    { "taskId": "uuid (form field)", "capturedAt": "iso8601 (form field)", "file": "binary (form field)" }
    ```
- **Response 2xx**:
  - Status: 201
  - Body schema:
    ```json
    { "id": "uuid", "remoteUrl": "string", "taskId": "uuid" }
    ```
- **Response errors**:
  - 4xx: 413 — file too large (limit 15 MB). Client downscales and retries.
  - 4xx: 415 — unsupported content type. Client warns user.
  - 5xx: 503 — retain in queue for retry; subject to wifi-only policy (FR-015).
- **Idempotency**: Yes (key: `Idempotency-Key`).
- **Rate limit**: 30/min/user.

## POST /devices/register
- **Endpoint ID**: API-06
- **Purpose**: Register the device for push notifications (FR-016).
- **Source screens**: Screen: Today (background call after sign-in)
- **Auth**: Bearer
- **Request**:
  - Headers: `Authorization`, `Content-Type: application/json`
  - Path/query params: None
  - Body schema:
    ```json
    { "platform": "ios|android", "pushToken": "string", "appVersion": "string" }
    ```
- **Response 2xx**:
  - Status: 204
  - Body schema: None
- **Response errors**:
  - 4xx: 401 — invalid token.
  - 5xx: 503 — backend unavailable; client retries on next foreground.
- **Idempotency**: Yes — same pushToken upserts the registration.
- **Rate limit**: 10/min/user.

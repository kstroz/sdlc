---
id: ARCH-001
created: 2026-05-08
version: 1
---

# Architecture overview

A high-level map of the system, the responsibilities of each component, and the non-obvious decisions that shape them. Each non-obvious decision links to its ADR.

## Components

### Mobile app (technician-facing)
React Native + Expo client running on iOS and Android (ADR-001). Three logical layers:

- **Domain** (`src/domain/**`): pure functions over Tasks, Photos, Buildings, Outbox. No IO. Tests run without sandbox.
- **Use-cases** (`src/use-cases/**`): orchestrate domain calls and platform calls via interfaces. Examples: `signIn`, `loadToday`, `completeTask`, `attachPhoto`, `processOutbox`.
- **Platform** (`src/platform/**`): WatermelonDB adapter, file system adapter, HTTP client, push registration, OS bridges. Implements interfaces declared by use-cases.

This separation is enforced by the Stage 05 `pure-function-policy` and `applying-architecture-principles` skills.

### Local store
WatermelonDB (SQLite-backed) for relational data (ADR-002). Photo binaries on the filesystem via expo-file-system (ADR-004). Outbox table inside the same SQLite database carries queued offline actions with idempotency keys (ADR-003).

### Sync worker
Runs in the mobile app. On connectivity change or app foreground, drains the Outbox in FIFO order, sending each action to the backend with its idempotency key. Failures are retried with exponential backoff up to 5 attempts; permanent failures are surfaced in the UI (FR-014).

### Backend (existing)
Hosted in GitLab; this branch adds the endpoints listed in api-contracts.md. The backend owns:
- Authentication (`POST /auth/sign-in`)
- Task list per user per day (`GET /tasks/today`)
- Task completion and block actions (`POST /tasks/{id}/complete`, `/block`)
- Photo upload (`POST /photos`)
- Push device registration (`POST /devices/register`)
- ePrzeglądy forwarding worker (asynchronous; see ADR-005)

### ePrzeglądy (external)
Third-party central inspection-management system. The mobile app does not communicate with ePrzeglądy directly; the backend forwards completion records via a separate worker (ADR-005).

### Push provider (external)
Apple Push Notification Service (APNs) and Firebase Cloud Messaging (FCM) for delivering urgent-task notifications (FR-016). The backend holds provider credentials.

### Object storage
Existing S3-compatible bucket holds synced photos. The backend writes; the mobile app does not access object storage directly.

### Observability
Sentry on mobile and backend for crashes and performance traces; Pino structured logs on the backend.

## How components connect

```
[Mobile app] ── HTTPS (REST) ──▶ [Backend]
                                    │
                                    ├─▶ [Postgres] (task and user data)
                                    ├─▶ [S3 bucket] (photo binaries)
                                    ├─▶ [Forwarding worker] ──▶ [ePrzeglądy]
                                    └─▶ [Push provider] ──▶ [Mobile app]

[Mobile app] ──▶ [Sentry]
[Backend]    ──▶ [Sentry]
```

All mobile-to-backend calls carry a session bearer token (from sign-in) and, for write actions, an idempotency key (UUID generated client-side at the moment of local commit).

## Key decisions and their non-obvious consequences

- **Mobile is single source of truth between sync windows.** A technician's "mark done" is committed locally before the network call. The backend converges on the next successful sync. ADR-003 keeps this safe via idempotency keys; the alternative (last-write-wins) was rejected.
- **Backend mediates ePrzeglądy.** ePrzeglądy outage cannot block a technician. ADR-005.
- **Photos are filesystem, metadata is DB.** Two-system bookkeeping that requires care during cleanup. ADR-004.
- **Outbox is durable, not in-memory.** A killed app on next launch resumes sync from disk. ADR-003.
- **OTA updates over the air.** Critical bug fixes can ship without app-store review (cosmetic and JS-only changes; native changes still require a build). ADR-001.

## What this architecture does not solve

- **Manager / admin UI** — out of scope per PRD; the backend has the data but no UI is built here.
- **Resident-facing flows** — tenants do not interact with this app at all.
- **Scheduled task generation** — recurring task creation is a backend concern, out of scope of this branch.
- **Multi-region resilience** — pilot is single-region; geo-distribution decisions deferred to GA.

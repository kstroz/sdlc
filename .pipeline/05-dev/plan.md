---
id: PLAN-001
jira: BAJ-100
created: 2026-05-08
version: 1
---

# Plan — Field maintenance app for offline task execution

## Scope summary

This branch implements the technician mobile app: epics E-01 (auth), E-02 (today list and detail), E-03 (completion + photo + block), E-04 (offline + sync + push), and the backend forwarding leg of E-05 (ePrzeglądy). It delivers stories US-001 through US-013. It defers the manager web panel, the gas inspection protocol form, and tenant-facing flows (see PRD Out of scope).

## Tasks

### T-001 — Authentication and session persistence
- **Stories**: US-001, US-002
- **Files touched**: `src/domain/auth/`, `src/use-cases/signIn.ts`, `src/use-cases/restoreSession.ts`, `src/platform/http/authClient.ts`, `src/platform/storage/sessionStore.ts`, `src/screens/SignInScreen.tsx`
- **Acceptance**: Given valid credentials, when the user signs in, then the Today screen renders with their tasks; sessions persist across cold starts up to expiry.
- **Detail**: `tasks/T-001.md`

### T-002 — Today screen with building grouping
- **Stories**: US-003
- **Files touched**: `src/domain/tasks/groupByBuilding.ts`, `src/use-cases/loadToday.ts`, `src/platform/http/tasksClient.ts`, `src/screens/TodayScreen.tsx`, `src/components/BuildingGroup.tsx`, `src/components/TaskCard.tsx`
- **Acceptance**: Given tasks span 3 buildings, when Today renders, then 3 building groups appear with the correct tasks under each, sorted as defined by the grouping rule.
- **Detail**: `tasks/T-002.md`

### T-003 — Task detail screen with map deep link
- **Stories**: US-004, US-005
- **Files touched**: `src/use-cases/loadTaskDetail.ts`, `src/screens/TaskDetailScreen.tsx`, `src/platform/maps/openInMapsApp.ts`
- **Acceptance**: Given the user taps a task, when the detail screen opens, then title, description, manager notes, building address, and a "Show on map" button are visible; tapping the button opens the device map app.
- **Detail**: `tasks/T-003.md`

### T-004 — Local offline store and cache layer
- **Stories**: US-009
- **Files touched**: `src/platform/db/schema.ts`, `src/platform/db/database.ts`, `src/platform/db/models/Task.ts`, `src/platform/db/models/Building.ts`, `src/platform/db/models/User.ts`, `src/use-cases/cache/syncFromServer.ts`
- **Acceptance**: Given the device is offline and the cache has been populated, when the user opens Today or Task detail, then data renders from the local store without any network call.
- **Detail**: `tasks/T-004.md`

### T-005 — Mark done with photo, offline-capable
- **Stories**: US-006, US-007, US-009
- **Files touched**: `src/domain/tasks/completion.ts`, `src/use-cases/completeTask.ts`, `src/platform/db/models/Photo.ts`, `src/platform/db/models/OutboxAction.ts`, `src/platform/files/photoStore.ts`, `src/screens/CompletionSheet.tsx`
- **Acceptance**: Given the device is offline, when the user taps Mark done, attaches a photo, and confirms, then the task UI updates to "done — pending sync", a Photo row exists with a local file path, and an OutboxAction is queued in the same transaction.
- **Detail**: `tasks/T-005.md`

### T-006 — Block task with preset reason
- **Stories**: US-008
- **Files touched**: `src/domain/tasks/blocking.ts`, `src/use-cases/blockTask.ts`, `src/screens/BlockSheet.tsx`
- **Acceptance**: Given the user taps Cannot complete and selects "needs parts", when they confirm, then the task status is blocked with reason="needs_parts" and an OutboxAction is queued.
- **Detail**: `tasks/T-006.md`

### T-007 — Outbox sync worker with retry and FIFO ordering
- **Stories**: US-010
- **Files touched**: `src/domain/sync/idempotencyKey.ts`, `src/use-cases/processOutbox.ts`, `src/platform/network/connectivity.ts`, `src/platform/http/syncClient.ts`
- **Acceptance**: Given 3 queued actions and connectivity returns, when 60 seconds pass, then all 3 actions are sent in FIFO order; given an action fails twice, when sync runs again, then it is retried; after 5 failures it is marked permanently failed and surfaced.
- **Detail**: `tasks/T-007.md`

### T-008 — Wifi-only media policy
- **Stories**: US-011
- **Files touched**: `src/domain/sync/mediaPolicy.ts`, `src/use-cases/processOutbox.ts`, `src/screens/SettingsScreen.tsx`, `src/platform/network/networkType.ts`
- **Acceptance**: Given the wifi-only setting is on and the device is on cellular, when sync runs, then non-media actions sync but photo uploads remain queued and a banner explains why.
- **Detail**: `tasks/T-008.md`

### T-009 — Push notifications for urgent tasks
- **Stories**: US-012
- **Files touched**: `src/use-cases/registerForPush.ts`, `src/use-cases/handlePushTap.ts`, `src/platform/push/pushClient.ts`, `App.tsx` (push handler wiring)
- **Acceptance**: Given the app is in background and a new urgent task is assigned server-side, when the push arrives, then the OS surfaces a notification; tapping it opens the app on the task detail for that task.
- **Detail**: `tasks/T-009.md`

### T-010 — Backend ePrzeglądy forwarding worker
- **Stories**: US-013
- **Files touched**: `backend/src/workers/eprzegladyForwarder.ts`, `backend/src/clients/eprzegladyClient.ts`, `backend/src/queue/forwardingQueue.ts`
- **Acceptance**: Given a task completion is persisted on the backend, when the forwarder runs, then ePrzeglądy receives the completion record within 1 hour; given ePrzeglądy is unavailable, then the technician's app is unaffected and the forward is retried server-side.
- **Detail**: `tasks/T-010.md`

## Out-of-plan

- Manager and admin web panel (separate spec, separate ticket).
- Gas inspection protocol form (deferred — Marek's domain only, not MVP).
- Resident-facing features.
- Reactive task creation by technician.
- Multi-region resilience and geo-distribution.
- Photo retention/cleanup automation (NFR-05 will be a separate task once MVP ships).

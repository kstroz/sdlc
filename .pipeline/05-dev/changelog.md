---
id: CHANGELOG-001
jira: BAJ-100
created: 2026-05-08
version: 1
range: cf80fccb0994787210fff84941e2f053041a6b20..a4faac3d74eeac434a8b5c602808591d655a597f
---

# Changelog — Field maintenance app for offline task execution

## Tickets
- BAJ-100 — implement technician mobile app stages 05.0–05.7
  - US: US-001, US-002, US-003, US-004, US-005, US-006, US-007, US-008, US-009, US-010, US-011, US-012, US-013

## Architecture changes
- ADR-002 amended (version 1 → 2): in-memory database swap for the test pass; the WatermelonDB-shaped Database interface is preserved so production swap is factory-only.
- ADR-006 added: Expo SDK 54 supersedes ADR-001's SDK 51 line. The rest of ADR-001 (React Native + Expo, OTA updates, etc.) remains in force.

## Code summary
- Files added: 249
- Files modified: 15
- Files removed: 0
- Lines added: 30647
- Lines removed: 266
- New modules:
  - `app/src/domain/` — pure domain layer (auth, tasks, sync) with sibling unit tests
  - `app/src/use-cases/` — orchestration layer (signIn, restoreSession, loadToday, loadTaskDetail, completeTask, blockTask, processOutbox, registerForPush, handlePushTap, cache/syncFromServer)
  - `app/src/platform/` — IO adapters (db, http, files, network, push, storage, maps, clock, randomId)
  - `app/src/screens/` — RN screens (SignIn, Today, TaskDetail, CompletionSheet, BlockSheet, Settings)
  - `app/src/components/` — RN components (BuildingGroup, TaskCard)
  - `app/src/app/` — DI root (AppRoot, useAppDeps)
  - `app/src/types/` — shared types and Result<T,E>
  - `app/tests/contracts/` — contract tests (4 endpoints) with _fakeFetch helper
  - `app/e2e/` — E2E test stubs (9 Maestro-shaped yaml files)
  - `backend/` — Express+axios scaffold for the ePrzeglądy forwarding worker

## Test changes
- Unit tests added: 27
- E2E tests added: 9 (stubs only; runner not yet wired)
- Contract tests added: 4
- New test files:
  - `app/src/types/index.test.ts`
  - `app/src/domain/auth/credentials.test.ts`
  - `app/src/domain/sync/backoff.test.ts`
  - `app/src/domain/sync/idempotencyKey.test.ts`
  - `app/src/domain/sync/mediaPolicy.test.ts`
  - `app/src/domain/tasks/blocking.test.ts`
  - `app/src/domain/tasks/completion.test.ts`
  - `app/src/domain/tasks/groupByBuilding.test.ts`
  - `app/src/platform/db/database.test.ts`
  - `app/src/platform/files/photoStore.test.ts`
  - `app/src/platform/maps/openInMapsApp.test.ts`
  - `app/src/platform/network/connectivity.test.ts`
  - `app/src/platform/network/networkType.test.ts`
  - `app/src/platform/push/pushClient.test.ts`
  - `app/src/platform/storage/settings.test.ts`
  - `app/src/use-cases/blockTask.test.ts`
  - `app/src/use-cases/cache/syncFromServer.test.ts`
  - `app/src/use-cases/completeTask.test.ts`
  - `app/src/use-cases/handlePushTap.test.ts`
  - `app/src/use-cases/loadTaskDetail.test.ts`
  - `app/src/use-cases/loadToday.test.ts`
  - `app/src/use-cases/processOutbox.test.ts`
  - `app/src/use-cases/registerForPush.test.ts`
  - `app/src/use-cases/restoreSession.test.ts`
  - `app/src/use-cases/signIn.test.ts`
  - `app/src/app/AppRoot.test.tsx`
  - `app/src/domain/auth/credentials.test.ts`
  - `app/tests/contracts/auth-sign-in.contract.test.ts` — covers US-001
  - `app/tests/contracts/tasks-today.contract.test.ts` — covers US-003
  - `app/tests/contracts/tasks-complete.contract.test.ts` — covers US-006
  - `app/tests/contracts/tasks-block.contract.test.ts` — covers US-008
  - `app/e2e/US-001-sign-in.e2e.yaml` — covers US-001 + US-002
  - `app/e2e/US-003-today-grouped.e2e.yaml` — covers US-003
  - `app/e2e/US-004-task-detail.e2e.yaml` — covers US-004 + US-005
  - `app/e2e/US-006-mark-done-with-photo.e2e.yaml` — covers US-006 + US-007
  - `app/e2e/US-008-block-task.e2e.yaml` — covers US-008
  - `app/e2e/US-009-offline-completion.e2e.yaml` — covers US-009
  - `app/e2e/US-010-sync-queued.e2e.yaml` — covers US-010
  - `app/e2e/US-011-wifi-only-media.e2e.yaml` — covers US-011
  - `app/e2e/US-012-urgent-push.e2e.yaml` — covers US-012
  - `backend/src/clients/eprzegladyClient.test.ts`
  - `backend/src/queue/forwardingQueue.test.ts`
  - `backend/src/workers/eprzegladyForwarder.test.ts`

---
id: TESTS-001
jira: BAJ-100
created: 2026-05-08
version: 1
---

# Tests Plan — Field maintenance app for offline task execution

## E2E coverage

- US-001 → `e2e/US-001-sign-in.e2e.yaml`
- US-002 → covered alongside US-001 in `e2e/US-001-sign-in.e2e.yaml`
- US-003 → `e2e/US-003-today-grouped.e2e.yaml`
- US-004 → `e2e/US-004-task-detail.e2e.yaml`
- US-005 → covered alongside US-004 in `e2e/US-004-task-detail.e2e.yaml`
- US-006 → `e2e/US-006-mark-done-with-photo.e2e.yaml`
- US-007 → covered alongside US-006 in `e2e/US-006-mark-done-with-photo.e2e.yaml`
- US-008 → `e2e/US-008-block-task.e2e.yaml`
- US-009 → `e2e/US-009-offline-completion.e2e.yaml`
- US-010 → `e2e/US-010-sync-queued.e2e.yaml`
- US-011 → `e2e/US-011-wifi-only-media.e2e.yaml`
- US-012 → `e2e/US-012-urgent-push.e2e.yaml`
- US-013 → out-of-scope (backend-only; covered by backend integration tests in BAJ-100-backend follow-up)

## Unit coverage

- US-001 → `app/src/domain/auth/credentials.ts` ↔ `app/src/domain/auth/credentials.test.ts`
- US-002 → no pure function added (session persistence is platform-only)
- US-003 → `app/src/domain/tasks/groupByBuilding.ts` ↔ `app/src/domain/tasks/groupByBuilding.test.ts`
- US-006 → `app/src/domain/tasks/completion.ts` ↔ `app/src/domain/tasks/completion.test.ts`
- US-008 → `app/src/domain/tasks/blocking.ts` ↔ `app/src/domain/tasks/blocking.test.ts`
- US-010 → `app/src/domain/sync/idempotencyKey.ts` ↔ `app/src/domain/sync/idempotencyKey.test.ts`
- US-011 → `app/src/domain/sync/mediaPolicy.ts` ↔ `app/src/domain/sync/mediaPolicy.test.ts`

## Contract coverage

- `04-architecture/api-contracts.md#api-01-post-auth-sign-in` ↔ `app/tests/contracts/auth-sign-in.contract.test.ts`
- `04-architecture/api-contracts.md#api-02-get-tasks-today` ↔ `app/tests/contracts/tasks-today.contract.test.ts`
- `04-architecture/api-contracts.md#api-03-post-tasks-id-complete` ↔ `app/tests/contracts/tasks-complete.contract.test.ts`
- `04-architecture/api-contracts.md#api-04-post-tasks-id-block` ↔ `app/tests/contracts/tasks-block.contract.test.ts`

## Out-of-scope

- US-013 (ePrzeglądy forwarding) — backend-only, no client surface; tracked in BAJ-100-backend.
- Photo upload contract test (`POST /photos`) — multipart binary; deferred to BAJ-100-photo-perf.
- Push registration contract test — relies on APNs/FCM sandbox; deferred to BAJ-100-push-infra.

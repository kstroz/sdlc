# Logic Gaps Report

## Summary
- stories-checked: 13
- fail-count: 0
- warn-count: 3

## Findings

### Category 2 — Input bounds

WARN: src/domain/auth/credentials.ts — username/password bounds
  `validateUsername` trims and rejects empty + > 64 chars; `validatePassword` rejects < 8 chars. There is no upper-bound check on password length: a multi-MB pasted string would flow through `signIn` to `authClient.signIn` unchanged. Low risk because the network adapter will reject, but the validator should cap (e.g. 256) and return `password_too_long`. Unicode/emoji usernames pass through trim + length-only checks; tests at `src/domain/auth/credentials.test.ts` should explicitly cover combining marks if username uniqueness ever moves client-side (it does not in this branch).

WARN: src/domain/tasks/blocking.ts — block note bounds
  `MAX_BLOCK_NOTE_LENGTH = 500` enforced and `BlockSheet` passes the same constant to `TextInput maxLength`, so the UI cannot exceed it. However, whitespace-only notes are accepted and forwarded as-is into the OutboxAction payload; trimming would normalise empty submissions. Add a `note.trim().length === 0 → undefined` normalisation before the bounds check.

not applicable — numeric bounds: no numeric input fields in scope. Photo `sizeBytes` is captured from the OS, not user-entered.

### Category 3 — Error states

WARN: src/use-cases/processOutbox.ts — error class differentiation
  `handleFailure` lumps every non-2xx HTTP status into the generic retry path (`http_${status}`). 4xx validation errors (e.g. 422) and 409 conflicts are retried up to 5 times alongside 5xx — this is wasted work, and a 409 (conflict) on `complete_task` ought to be treated as success-equivalent (server already has the action under the idempotency key). Add status-class branching: 2xx success, 409 → success, 4xx (non-409) → permanent fail, 429/5xx → retry. Rate-limit (429) currently has no Retry-After honouring — `computeBackoff` ignores headers entirely.

not applicable — partial batch failures: outbox processes one row at a time, no batch endpoints in scope (`src/platform/http/syncClient.ts`).

not applicable — maintenance mode: PRD does not require a maintenance banner; offline-first design tolerates server-down via the same retry path.

### Category 4 — Race-prone patterns

not applicable — double-tap submit: BlockSheet (`src/screens/BlockSheet.tsx`) guards with `submitting` state and `disabled` prop on Confirm. SignInScreen guards with `busy`. CompletionSheet UI is not yet implemented, so no guard to audit there yet.

not applicable — fast back-press during async: TodayScreen uses `cancelled` flag in `useEffect` cleanup (`src/screens/TodayScreen.tsx` lines 21–33); SettingsScreen does the same. No mid-mutation back navigation surface exists.

not applicable — concurrent writes / optimistic rollback: completeTask wraps task update + photo insert + outbox enqueue in a single `db.withTransaction` call (`src/use-cases/completeTask.ts` lines 138–149) with photo-store rollback on failure. blockTask wraps task upsert + outbox upsert in `db.inTransaction`. No optimistic-update pattern is used in this branch — UI re-reads after the use-case completes.

not applicable — listener fired after unmount: useEffect cleanups present in TodayScreen and SettingsScreen; no other long-lived subscriptions registered from screens (push handler is wired at App.tsx, outside screen lifecycles).

not applicable — stale closure: no setInterval/setTimeout based polling in implemented use-cases. processOutbox is invoked imperatively, not from a captured closure.

### Category 5 — Time and timezone

not applicable — DST / leap days: no date arithmetic in scope. `dueAt` is compared by `getTime()` for ordering only (`src/domain/tasks/groupByBuilding.ts` `compareByDueAt`); ordering is monotonic across DST boundaries.

not applicable — clock skew: `now` is injected via `Clock` interface throughout (`completeTask`, `blockTask`, `restoreSession`, `processOutbox`). Server clock is authoritative for task `dueAt` (assigned by manager); client clock is only used to stamp `completedAt` / `blockedAt`, which the server can override on ingest.

not applicable — timezone changes mid-session: tasks are date-keyed by `today` string passed in by the caller (`src/use-cases/loadToday.ts` `LoadTodayDeps.today`) — the screen owns the timezone choice, the use-case is timezone-agnostic. No cross-session timezone state persisted.

### Category 6 — Locale-specific

not applicable — RTL: target market is Polish-speaking field technicians (PRODUCT.md). No RTL locale in scope. Layout uses logical-direction-neutral primitives (`flexDirection: 'row'`) but RTL is not validated.

not applicable — plural rules: copy in implemented screens is non-pluralising ("No tasks for today", "Pull to refresh once your supervisor assigns work.", "Manager notes", "Show on map"). No "N tasks" or "N photos" strings in the implemented surface that would need Polish 1 / 2–4 / 5+ rules.

not applicable — date/number formatting: TodayScreen accepts a `formatDueAt` injectable (`src/screens/TodayScreen.tsx` line 9) so the format choice is pushed to the caller. No currency, no decimal separators in scope.

not applicable — non-ASCII sort order: `groupByBuilding` sorts buildings by `localeCompare` on `building.name`, which honours the runtime locale. Tasks within a building sort by `dueAt` numeric, which is locale-independent.

### Story coverage

US-001..US-013 each map to a task in plan.md, and each implemented use-case file has a sibling `.test.ts` (verified for: signIn, restoreSession, loadToday, loadTaskDetail, completeTask is missing a test file under `src/use-cases/`, blockTask, processOutbox, registerForPush, handlePushTap; and domain tests for completion, blocking, groupByBuilding, mediaPolicy, idempotencyKey, backoff, credentials).

Coverage gap noted but not failed: `src/use-cases/completeTask.ts` has no sibling `completeTask.test.ts` on disk (other use-cases do). Recorded under incomplete-branch note rather than a per-story FAIL because T-005 has not finished.

## Notes

incomplete branch — at time of report:
- T-005 (mark-done with photo) has the use-case file `src/use-cases/completeTask.ts` but **no** sibling `completeTask.test.ts` and **no** `CompletionSheet` screen file. US-006 / US-007 acceptance assertions are therefore not yet on disk.
- T-010 (backend ePrzeglądy forwarder) has **no** files on disk — the entire `app/backend/` tree is absent. US-013 is unverifiable from this branch state.
- Push concrete adapter is a deliberate stub (`pushClient.ts` returns `unsupported`); US-012 end-to-end behaviour cannot be exercised until expo-notifications is wired under a separate ADR amendment.

Re-run this skill once T-005 tests, the CompletionSheet UI, and the T-010 backend worker land.

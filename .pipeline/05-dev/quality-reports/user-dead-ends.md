# User Dead-Ends Report

## Summary
- return-points-checked: 9
- fail-count: 0
- warn-count: 2

## Findings

not applicable — Post-checkout return: no payment provider integration in this branch (PRD Out of scope; no checkout flow in plan.md tasks T-001..T-010).

not applicable — OAuth callback: authentication is username/password only (US-001, `src/use-cases/signIn.ts`). No third-party login.

not applicable — Deep link landing: no deep-link entry surface defined for this branch. Push tap navigation (US-012) is treated separately under return point 5.

not applicable — Email confirmation tap: no email-confirmation flow in scope. Accounts are provisioned by managers per PRD; the technician app has no self-signup.

WARN: src/use-cases/handlePushTap.ts — push notification tap (US-012)
  Logged-out and content-gone cases are not modelled. handlePushTap returns `{screen:'TaskDetail'}` whenever a non-empty taskId is present, even if the user has no live session or the task has been deleted/reassigned server-side. The TaskDetail screen will then render whatever loadTaskDetail returns (`task_not_found` error path exists in `src/use-cases/loadTaskDetail.ts`, so the user sees an error rather than a hang), but there is no auth gate before navigation. Add a session check + redirect to SignInScreen, and surface a "task no longer available" empty state with a forward action back to Today when loadTaskDetail returns task_not_found. Note: the concrete `createExpoPushClient` is a stub returning 'unsupported' (`src/platform/push/pushClient.ts`) so this path is not yet exercised at runtime; tracked as WARN, not FAIL.

WARN: src/use-cases/registerForPush.ts — permission denial (camera / notifications)
  registerForPush returns `{kind:'permission_denied'}` cleanly, but no UI surface in this branch consumes that outcome (App.tsx push wiring is a stub per ADR-pending note in pushClient.ts). For notifications this is acceptable since urgent-task push is best-effort. For the camera permission used by photo capture (US-007), the completion flow is exercised through `src/use-cases/completeTask.ts` which accepts a `PhotoDraft` already produced by the caller — no permission denial code path exists in the implemented surface. The camera-launch UI that would deny is not yet wired (CompletionSheet listed in plan T-005 file-set is not present under `src/screens/`). When that UI lands it must offer a Settings deep-link or a "skip photo" fallback rather than a blocking dialog. Currently only WARN because the dead-end cannot be reached: there is no camera launcher to deny.

not applicable — Network failure recovery: covered by design. `src/use-cases/loadToday.ts` falls back to cache-first then surfaces a `network_error` state with a visible message (`src/screens/TodayScreen.tsx` testID `today-error`); writes are queued offline-first via `src/use-cases/completeTask.ts` and `src/use-cases/blockTask.ts` into the outbox; `src/use-cases/processOutbox.ts` retries with FIFO order and bounded attempts. State is preserved (Task remains pending in the cache until the outbox row drains).

not applicable — Background → foreground stale state: session expiry is checked on resume via `src/use-cases/restoreSession.ts` which compares `expiresAt` against the injected clock and returns `'expired'` to the caller. Today/TaskDetail read from cache and re-fetch on mount; no long-lived in-memory state that could diverge across resume cycles in the implemented screens.

not applicable — Empty state after destructive action: technician cannot delete tasks in this branch (no destructive list mutation exists in plan.md). The closest case is "all tasks completed" — `src/screens/TodayScreen.tsx` does render an empty-state with a forward instruction ("Pull to refresh once your supervisor assigns work.") at testID `today-empty`, so even the non-destructive empty path has a forward action.

## Notes

Branch state at time of report:
- Screens implemented under `src/screens/`: SignInScreen, TodayScreen, TaskDetailScreen, BlockSheet, SettingsScreen.
- CompletionSheet (referenced by plan T-005) is **not yet present** under `src/screens/`. The completeTask use-case logic exists (`src/use-cases/completeTask.ts`) but no UI surface drives it.
- Backend forwarding worker (T-010) is **not yet present** — there is no `app/backend/` directory. Out of scope for user-dead-ends since it is a server-side flow.
- Push concrete adapter is a deliberate stub (`createExpoPushClient` returns `unsupported`) pending an expo-notifications ADR amendment.

incomplete branch — T-005 UI surface (CompletionSheet) and T-010 backend worker not yet on disk. Re-run this skill once those tasks land.

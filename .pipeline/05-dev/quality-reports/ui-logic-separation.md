# UI/Logic Separation Report

## Summary
- files-scanned: 78
- fail-count: 0
- warn-count: 1

## Findings

WARN: src/domain/sync/idempotencyKey.ts:1 — domain imports platform module paths
  `import type { Clock } from '@/src/platform/clock'` and `import type { RandomId } from '@/src/platform/randomId'`. These are type-only imports of pure interfaces (`Clock` and `RandomId` are interface declarations with no runtime IO), which erase at compile time, so no IO leaks into the domain layer. The function correctly receives both as injected deps. Strict reading of the layer rule still prefers the interfaces to be declared in the domain package (or a shared `@/src/types` barrel) so domain imports stay within `domain/**`. Recommend either re-homing `Clock` / `RandomId` interfaces into domain, or amending ADR to permit type-only imports of platform interface declarations.

## Notes

- View files scanned (`src/screens/*.tsx`, `src/components/*.tsx`): `TodayScreen`, `TaskDetailScreen`, `SignInScreen`, `SettingsScreen`, `BlockSheet`, `TaskCard`, `BuildingGroup`. None contain business logic beyond null/loading guards and event dispatch:
  - `TodayScreen` calls `loadToday(deps)` use-case in `useEffect`, branches only on `loading | error | ready` UI state, and renders.
  - `TaskDetailScreen` formats a status label via a static `Record` and dispatches `mapsOpener.open(...)` (a platform interface passed in as a prop).
  - `SignInScreen` calls `signIn(...)` use-case and routes the `Result` to UI state.
  - `SettingsScreen` reads/writes a single setting via the injected `Settings` interface.
  - `BlockSheet` collects radio + note input and forwards to the `blockTask` callback prop. Domain `BLOCK_REASONS` and `MAX_BLOCK_NOTE_LENGTH` are imported as data constants for rendering, not as logic.
  - `TaskCard` and `BuildingGroup` are pure render components.
- Domain files scanned (`src/domain/**`): no banned globals (`Date.now`, `new Date()`, `Math.random`, `crypto.randomUUID`, `process.env`, `fetch`, `setTimeout`, `setInterval`, `fs`, `localStorage`, `AsyncStorage`) appear under `src/domain/**`. The clock and randomness are injected via `Clock` / `RandomId` interfaces and `() => new Date(completedAt.getTime())` in `markComplete` operates only on injected input.
- Use-case files scanned (`src/use-cases/**`): each file exports exactly one entry function (`signIn`, `restoreSession`, `loadToday`, `loadTaskDetail`, `blockTaskUseCase`, `completeTask`, `processOutbox`, `syncFromServer`, `registerForPush`, `handlePushTap`). No `switch` on a domain enum encoding business logic was found in any use-case; domain enums are switched on inside `domain/**` (e.g. `blocking.ts`, `completion.ts`).
- Branch state at scan time: T-001..T-009 implementation appears complete; if further impl tasks land, re-run after impl agents finish.

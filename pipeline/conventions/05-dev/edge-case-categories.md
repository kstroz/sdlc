# Edge-Case Categories (Stage 05.5)

Categories the impl-loop must walk through for every task before the quality sub-stage. The output is recorded in `quality-reports/user-dead-ends.md` and `quality-reports/logic-gaps.md` (covering, respectively, the user-flow categories and the data/state categories).

## Categories

### 1. User dead-ends (resume points)
Every flow that exits the app, loses focus, or hands off to a system surface MUST have a defined return point and a state recovery rule.

- **Post-checkout return** — user comes back from payment provider; what does the app show if (a) success, (b) cancel, (c) timeout, (d) duplicate webhook?
- **OAuth callback** — third-party login redirects back; success, error, user-cancelled, expired state token.
- **Deep link landing** — user opens a URL while logged out, while content is gated, while content is deleted.
- **Email confirmation tap** — link opened on a different device, expired link, already-confirmed token.
- **Push notification tap** — content gone, user logged out, content gated by paywall, app version too old.
- **Permission denial** — user denies mic/camera/notifications; the flow MUST offer a recovery (Settings deep-link or fallback path), not a dead-end screen.
- **Network failure recovery** — request fails mid-flow; retry, offline cache, queued action, or graceful abort with state preserved.
- **Background → foreground stale state** — app resumed after minutes/hours; cached data is stale, token expired, server state diverged.
- **Empty state after destructive action** — user deletes the last item in a list, leaves the last channel, removes the last payment method; the empty state MUST have a forward action.

### 2. Input bounds
Min/max length, empty, whitespace-only, zero, negative, very large numbers, Unicode (emoji, RTL, combining marks), trimmed vs untrimmed equality.

### 3. Error states
Server 4xx vs 5xx, validation errors, partial failures (some items in a batch failed), conflict (409), rate-limit (429), maintenance.

### 4. Race-prone patterns
Double-tap submit, fast back-press during async, concurrent writes, optimistic update + server rollback, listener fired after unmount, stale closure capturing old state.

### 5. Time and timezone
Daylight-saving boundaries, leap seconds/days, user device clock skew, server clock authoritative cases, timezone changes mid-session, `now` injected vs read directly.

### 6. Locale-specific
Right-to-left layout, plural rules (Polish: 1 / 2-4 / 5+), date/number formatting, currency symbols and decimal separators, sort order for non-ASCII strings.

## Rules

- Each task's `T-NNN.md` "Definition of done" includes the line `Edge-case categories reviewed`.
- Categories 1 (User dead-ends) is reported in `quality-reports/user-dead-ends.md`. Each finding: file:line, category, description, severity (`FAIL:` for missing recovery path, `WARN:` for partial coverage).
- Categories 2–6 are reported in `quality-reports/logic-gaps.md` with the same line shape.
- A category that genuinely does not apply to a task is recorded with the literal `not applicable — <reason>` rather than skipped.

## Validation rules

The validator (`check-quality-thresholds.sh`) FAILS the merge gate if:

1. `quality-reports/user-dead-ends.md` does not exist.
2. `quality-reports/logic-gaps.md` does not exist.
3. Either file contains a line starting with `FAIL:`.

## Why

- **Dead-end category list is concrete** because "think about edge cases" is not actionable. Nine named return points cover the failure modes that produce most field complaints.
- **Two reports rather than one** keeps user-flow concerns (review by product/UX) separate from data/state concerns (review by engineering).
- **Not-applicable rule** prevents categories from being silently skipped to make the report shorter.

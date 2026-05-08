---
name: detecting-user-dead-ends
description: Use at Stage 05.4 to walk every user flow exit point and verify each has a defined return path and state recovery rule; produces the user-dead-ends quality report
---

# Detecting User Dead-Ends

**Announce at start:** "I'm using the detecting-user-dead-ends skill to check for missing recovery paths in user flows."

## What to read first

`pipeline/conventions/05-dev/edge-case-categories.md` — Category 1 (User dead-ends) defines the nine named return points to check.

Also read:
- `.pipeline/03-ux/ux-flows.md` — the flows that must not have dead ends (if Stage 03 artifacts exist)
- `.pipeline/05-dev/plan.md` — which US-NNN stories are in scope for this branch
- `.pipeline/02-spec/stories/US-NNN-*.md` — story acceptance criteria for context

## Nine return points to check

Walk through all screens/components in scope and check each of the following. A return point is a FAIL if there is no defined recovery path; a WARN if recovery exists but is incomplete.

1. **Post-checkout return** — success, cancel, timeout, duplicate webhook
2. **OAuth callback** — success, error, user-cancelled, expired state token
3. **Deep link landing** — logged out, content gated, content deleted
4. **Email confirmation tap** — different device, expired link, already-confirmed token
5. **Push notification tap** — content gone, logged out, content gated, app version too old
6. **Permission denial** — mic/camera/notifications denied; must offer Settings deep-link or fallback, not dead-end
7. **Network failure recovery** — mid-flow request fails; retry, offline cache, queued action, or graceful abort with state preserved
8. **Background → foreground stale state** — cached data stale, token expired, server state diverged
9. **Empty state after destructive action** — last item deleted; empty state must have a forward action

For each point that is genuinely not applicable to this branch's scope, record `not applicable — <reason>` explicitly. Do not skip.

## What to produce

`.pipeline/05-dev/quality-reports/user-dead-ends.md`

Required structure:

```markdown
# User Dead-Ends Report

## Summary
- return-points-checked: 9
- fail-count: <N>
- warn-count: <N>

## Findings

FAIL: src/screens/PaymentReturnScreen.tsx — post-checkout return
  Timeout case (>30s) has no recovery path. Screen freezes. Add timeout handler
  that returns user to cart with error message.

WARN: src/screens/TaskDetailScreen.tsx — background/foreground stale state
  Token expiry not handled on resume. Add expiry check in useEffect on focus.

not applicable — OAuth callback: no third-party login in this branch.
not applicable — Email confirmation tap: handled in a prior branch (BAJ-099).
```

## Validate

```bash
bash pipeline/validators/check-quality-thresholds.sh .pipeline/05-dev/quality-reports
```

Fix every FAIL. Re-run until exit 0.

---
name: detecting-logic-gaps
description: Use at Stage 05.4 to verify every story (US-NNN) has a covering test and every acceptance criterion has an assertion; produces the logic-gaps quality report
---

# Detecting Logic Gaps

**Announce at start:** "I'm using the detecting-logic-gaps skill to check for uncovered stories and missing assertions."

## What to read first

1. `pipeline/conventions/05-dev/edge-case-categories.md` — Categories 2–6 (input bounds, error states, race-prone patterns, time/timezone, locale-specific)
2. `.pipeline/02-spec/stories/US-NNN-*.md` — every story to verify coverage
3. `.pipeline/05-dev/tests-plan.md` — the test map to cross-reference
4. `.pipeline/05-dev/plan.md` — which stories are in scope for this branch

## What to check

### Story coverage gaps (hard check)

For every US-NNN in `plan.md`, verify:
- At least one test (unit, contract, or E2E) names this story or covers its acceptance criteria from the story file in `02-spec/stories/`
- The test file actually exists on disk

A story with no covering test → **FAIL**.

### Acceptance criterion gaps (hard check)

For every Given/when/then bullet in each story (`02-spec/stories/US-NNN-*.md`) and each task (`05-dev/tasks/T-NNN.md`), verify:
- A test assertion covers the scenario
- The assertion is specific — not just "it renders" but "it renders with the correct overdue count"

A criterion with no matching assertion → **FAIL**.

### Edge-case categories 2–6

Walk through the code for each category below. A gap is a **FAIL** if recovery/handling is completely absent; **WARN** if partially covered.

**Category 2 — Input bounds:** min/max length, empty, whitespace-only, zero, negative, very large numbers, Unicode (emoji, RTL, combining marks).

**Category 3 — Error states:** server 4xx vs 5xx, validation errors, partial batch failures, conflict (409), rate-limit (429), maintenance mode.

**Category 4 — Race-prone patterns:** double-tap submit, fast back-press during async, concurrent writes, optimistic update + server rollback, listener fired after unmount, stale closure.

**Category 5 — Time and timezone:** DST boundaries, leap days, device clock skew, timezone changes mid-session, `now` injected vs read directly.

**Category 6 — Locale-specific:** RTL layout, plural rules (e.g. Polish: 1 / 2–4 / 5+), date/number formatting, currency separators, non-ASCII sort order.

For categories that genuinely do not apply, record `not applicable — <reason>` explicitly.

## What to produce

`.pipeline/05-dev/quality-reports/logic-gaps.md`

Required structure:

```markdown
# Logic Gaps Report

## Summary
- stories-checked: <N>
- fail-count: <N>
- warn-count: <N>

## Findings

FAIL: US-012 — no covering test found.
  plan.md maps US-012 to T-004 but tests-plan.md has no unit or E2E entry for it.

FAIL: T-003 acceptance criterion 2 — "when task is overdue, badge shows red" — no assertion found.

WARN: Category 4 (race-prone) — double-tap submit on TaskCompleteButton not guarded.
  Add debounce or disabled-during-submit state.

not applicable — Category 5 (time/timezone): no date arithmetic in this branch.
```

## Validate

```bash
bash pipeline/validators/check-quality-thresholds.sh .pipeline/05-dev/quality-reports
```

Fix every FAIL. Re-run until exit 0.

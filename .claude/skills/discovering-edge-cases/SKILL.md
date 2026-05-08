---
name: discovering-edge-cases
description: Use at Stage 05.5 after implementation to systematically walk all six edge-case categories for every task and append any new findings to the quality reports
---

# Discovering Edge Cases

**Announce at start:** "I'm using the discovering-edge-cases skill for a final edge-case sweep."

## What to read first

`pipeline/conventions/05-dev/edge-case-categories.md` — all six categories with concrete examples.

## When to use

After 05.4 quality gate reports are written, run this skill as a final sweep. It re-reads implementation code with the edge-case lens and appends any findings not already captured in:
- `.pipeline/05-dev/quality-reports/user-dead-ends.md`
- `.pipeline/05-dev/quality-reports/logic-gaps.md`

## Procedure

For each task in `plan.md` (in order):

1. Read the task file `tasks/T-NNN.md` and its acceptance criteria
2. Read every source file listed under "Files touched"
3. Walk all six categories:

### Category 1 — User dead-ends
Already covered by `detecting-user-dead-ends`. Only add new findings not in the existing report.

### Category 2 — Input bounds
Test each user-visible input field and API parameter for:
- Empty / null / undefined
- Whitespace-only strings
- Maximum length exceeded
- Zero and negative numbers where numeric
- Very large numbers (overflow risk)
- Unicode: emoji, RTL characters, combining marks

### Category 3 — Error states
Verify handlers exist for:
- 4xx client errors (especially 401, 403, 404, 409, 422, 429)
- 5xx server errors (generic and timeout)
- Partial failures in batch operations
- Maintenance/503 with retry-after

### Category 4 — Race-prone patterns
Look for:
- Buttons that can be tapped twice before async completes
- Back-press during async operations that leaves orphaned state
- Optimistic UI that doesn't roll back on server rejection
- Event listeners not cleaned up on unmount
- Stale closures capturing old state in async callbacks

### Category 5 — Time and timezone
Look for:
- `Date.now()` or `new Date()` in domain code (should be injected)
- DST boundary assumptions (e.g. "add 24h" instead of "add 1 calendar day")
- Leap day date arithmetic
- User device clock vs server clock authority

### Category 6 — Locale-specific
Look for:
- Hard-coded LTR layout assumptions in components
- Plural strings without locale-aware rules
- `toLocaleString` or `Intl` missing where needed
- Currency/decimal separator hard-coded

## Output

Append new findings to the existing quality reports. Do not rewrite the reports — only add. Format findings identically to the existing entries (FAIL/WARN/not-applicable with file:line).

After appending, re-run validation:

```bash
bash pipeline/validators/check-quality-thresholds.sh .pipeline/05-dev/quality-reports
```

Fix every FAIL. Re-run until exit 0.

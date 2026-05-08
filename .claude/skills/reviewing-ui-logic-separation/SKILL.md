---
name: reviewing-ui-logic-separation
description: Use at Stage 05.4 to detect business logic in view components and IO in the domain layer, producing the ui-logic-separation quality report
---

# Reviewing UI/Logic Separation

**Announce at start:** "I'm using the reviewing-ui-logic-separation skill to produce the UI/logic separation quality report."

## What to read first

1. `pipeline/conventions/05-dev/pure-function-policy.md` — the three-layer architecture and import rules
2. `pipeline/conventions/05-dev/architecture-principles.md` — SOLID-D and Facade rules

## Scope

Scan every file created or modified on this branch. Focus on:
- View/screen files: `**/screens/**`, `**/components/**`, `**/views/**`, `**/ui/**`
- Domain files: `**/domain/**`
- Use-case files: `**/use-cases/**`, `**/orchestration/**`

## What to look for

### Business logic in view components (FAIL)

A view file should only: render data, dispatch events/callbacks, and format for display.

Flag as FAIL if a view file contains:
- Conditional logic based on domain state (beyond simple null/loading guards)
- Data transformations that belong in the domain (price calculations, validation rules, date arithmetic)
- Direct calls to platform APIs (fetch, DB, storage) — use-cases must mediate
- Branching on user roles that encodes access rules (access rules belong in domain or use-cases)

### IO in domain layer (FAIL)

Flag as FAIL if a `**/domain/**` file contains:
- Any banned global (see `pure-function-policy.md` banlist)
- Import from platform/infra/adapters
- Network or storage call of any kind

### Use-case bloat (WARN)

Flag as WARN if a use-case contains:
- A `switch` or multi-branch `if` on a domain enum that encodes business logic
- More than one exported entry function

## What to produce

`.pipeline/05-dev/quality-reports/ui-logic-separation.md`

Required structure:

```markdown
# UI/Logic Separation Report

## Summary
- files-scanned: <N>
- fail-count: <N>
- warn-count: <N>

## Findings

FAIL: src/screens/TaskDetailScreen.tsx:88 — business logic in view
  `calculateOverdueDays()` called inline in render. Move to domain/tasks/overdue.ts.

WARN: src/use-cases/completeTask.ts:1 — multiple exports
  Exports `completeTask` and `reopenTask`. Split into separate use-case files.
```

If there are no findings, write:

```markdown
## Findings
None.
```

## Validate

```bash
bash pipeline/validators/check-quality-thresholds.sh .pipeline/05-dev/quality-reports
```

Fix every FAIL. Re-run until exit 0.

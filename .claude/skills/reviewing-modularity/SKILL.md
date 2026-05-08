---
name: reviewing-modularity
description: Use at Stage 05.4 to scan all changed files against modularity thresholds and produce the modularity quality report that gates the merge
---

# Reviewing Modularity

**Announce at start:** "I'm using the reviewing-modularity skill to produce the modularity quality report."

## What to read first

`pipeline/conventions/05-dev/modularity-thresholds.md` — the exact thresholds for soft-warn and hard-fail.

## Scope

Scan every file created or modified on this branch (use `git diff --name-only <base>..HEAD` to get the list). Skip files declared in `.modularityignore` at the repo root.

## Thresholds

| Metric | Soft-warn | Hard-fail |
|---|---|---|
| File length (LOC) | > 200 | > 300 |
| Class length (lines) | > 150 | > 200 |
| Function length (lines) | > 20 | > 30 |
| Cyclomatic complexity | > 7 | > 10 |
| Parameter count | > 3 | > 4 |
| Nesting depth | > 2 | > 3 |

LOC = non-blank, non-comment lines. Test files are exempt from function-length limits but not from parameter count or nesting depth.

## What to produce

`.pipeline/05-dev/quality-reports/modularity.md`

Required structure:

```markdown
# Modularity Report

## Summary
- files-scanned: <N>
- warn-count: <N>
- fail-count: <N>

## Findings

FAIL: src/path/to/file.ts:42 — function `processTask` — 38 lines (hard-fail > 30)
WARN: src/path/to/other.ts:10 — class `TaskService` — 160 lines (soft-warn > 150)
```

If there are no findings, write:

```markdown
## Findings
None.
```

## Allowed exceptions

A deliberate exception requires:
1. An ADR amendment (via `amending-adrs-during-development`) with a sunset condition
2. An inline comment at the top of the offending function/class:
   ```typescript
   // modularity-exempt: ADR-NNN
   ```

Exempt offenders are still listed in the report with `EXEMPT:` prefix instead of `FAIL:` or `WARN:`.

## Validate

```bash
bash pipeline/validators/check-quality-thresholds.sh .pipeline/05-dev/quality-reports
```

Fix every FAIL finding (or document an exemption). Re-run until exit 0.

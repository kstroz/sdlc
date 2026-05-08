# Modularity Thresholds (Stage 05)

Concrete size and complexity caps that the modularity report (`05-dev/quality-reports/modularity.md`) checks against. Two enforcement levels: **soft-warn** annotates the report; **hard-fail** blocks the merge gate.

## Thresholds

| Metric | Soft-warn at | Hard-fail at | Rationale |
|---|---|---|---|
| File length (lines) | > 200 | > 300 | Files over 300 lines hide multiple responsibilities. 200 is the early-warning. |
| Class length (lines) | > 150 | > 200 | A 200-line class almost always violates SOLID-S. |
| Function length (lines) | > 20 | > 30 | Beyond 30 lines, branches stop fitting on one screen and unit tests stop being focused. |
| Cyclomatic complexity (per function) | > 7 | > 10 | 10 is the McCabe ceiling beyond which defect rate climbs sharply. |
| Parameter count (per function) | > 3 | > 4 | Past 4 params, callers pass options bags badly. Use a typed object. |
| Nesting depth (per function) | > 2 | > 3 | Three nested ifs/loops is the comprehension limit; four guarantees a bug. |

Lines = non-blank, non-comment lines (LOC), measured by the language's standard counter (e.g. `cloc`, `tokei`, `eslint complexity` for cyclomatic).

## Rules

- The modularity report lists every offender with file:line, metric, observed value, threshold, level (`WARN:` or `FAIL:`).
- A single `FAIL:` line in any quality report blocks the merge gate (see `quality-gate-criteria.md`).
- Soft warnings accumulate into a per-feature score that is surfaced in code review but does not block merge.
- Auto-generated files (declared in `.modularityignore` at the repo root) are excluded from both warn and fail.

## Allowed exceptions

- Test files are exempt from function-length limits but NOT from parameter count or nesting.
- Configuration objects (pure data exports) are exempt from file-length limits.
- A deliberate exception MUST be recorded as an ADR amendment with a sunset condition; an inline `// modularity-exempt: ADR-NNN` comment is required at the offender's top.

## Validation rules

The validator (`check-quality-thresholds.sh`) FAILS the merge gate if `quality-reports/modularity.md`:

1. Does not exist.
2. Contains any line starting with `FAIL:`.
3. Does not contain a `## Summary` section with the totals (`files-scanned`, `warn-count`, `fail-count`).

## Why

- **Two-level thresholds** turn modularity from an opinion ("this file is too long") into a checked metric. Disagreement happens at threshold-set time, not per-PR.
- **Numbers come from defect-rate research, not taste.** McCabe 10 and the 30-line function rule have been replicated for decades.
- **Recorded exceptions** keep the door open for the rare legitimate case (parser tables, generated code) without weakening the rule for new code.

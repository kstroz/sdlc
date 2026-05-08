# Plan Template (Stage 05.1)

Defines the required structure of `05-dev/plan.md`. The plan decomposes a feature into tasks before any code is written. The plan gate (`_approval-plan.json`) blocks sub-stages 05.2–05.8 until approved.

Stories (`US-NNN`) come from `.pipeline/02-spec/stories/`. Each task references the stories it delivers; the story file is the source of truth for acceptance criteria.

## Required structure

```markdown
---
id: PLAN-001
jira: <TICKET-ID>                 # source ticket, e.g. BAJ-123
created: YYYY-MM-DD
version: 1
---

# Plan — <Ticket title>

## Scope summary
<2–4 sentences. WHICH epics (E-NN) and WHICH stories (US-NNN) this branch implements,
and WHICH it explicitly defers. Reference IDs only — no prose restatement.>

## Tasks

### T-001 — <Short label>
- **Stories**: US-NNN[, US-NNN]
- **Files touched**: `path/to/file.ts`, `path/to/dir/`
- **Acceptance**: <one-line testable outcome>
- **Detail**: `tasks/T-001.md`

### T-002 — <Short label>
- **Stories**: US-NNN
- **Files touched**: `path/to/file.ts`
- **Acceptance**: <one-line testable outcome>
- **Detail**: `tasks/T-002.md`

## Out-of-plan
<Bullet list of items from spec/UX/architecture that this branch will NOT touch.
Forces explicit boundary-drawing before tests-first starts.>

- ...
- ...
```

At least one task is required. Task IDs are zero-padded (`T-001`, `T-042`). Every task in `plan.md` must have a matching detail file under `tasks/` (validated by `check-plan.sh`).

## Validation rules

The validator FAILS the gate if:

1. **Frontmatter** missing or missing any of `id`, `jira`, `created`, `version`.
2. **Scope summary** section absent.
3. **Tasks** section has fewer than one `### T-NNN` heading.
4. **Task ID** does not match `T-[0-9]{3}`.
5. **Stories** field absent or does not reference at least one `US-NNN` ID.
6. **Files touched** field absent (use the literal `none — non-code task` if genuinely no files change).
7. **Acceptance** field absent.
8. **Detail link** points to a `tasks/T-NNN.md` that does not exist on disk.
9. **Out-of-plan** section absent. If genuinely none, write the literal `None.`.

## Why

- **US-NNN linkage per task** keeps the plan derivable from the spec. A task without a story is speculative work.
- **Files touched up front** lets reviewers spot collisions across tasks before implementation.
- **One detail file per task** keeps `plan.md` readable while pushing per-task detail to a stable location for the impl-loop.
- **Out-of-plan section** kills mid-sprint scope creep by making deferrals explicit before the gate.

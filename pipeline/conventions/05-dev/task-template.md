# Task Template (Stage 05.1–05.3)

Defines one task file inside `05-dev/tasks/T-NNN.md`. Task files are the working surface for the impl-loop: the assignee updates `Status` as they progress and ticks the definition-of-done before review.

## Required structure

```markdown
---
id: T-001
jira: <TICKET-ID>
created: YYYY-MM-DD
version: 1
---

# T-001 — <Short label>

## Status
<one of: planned | in-progress | blocked | done>

## Requirements
- FR-NNN
- FR-NNN

## Journeys
- J-NN (step N)

## Acceptance
<Given/When/Then bullets, one per acceptance condition. Mirrors the FR
acceptance criteria but scoped to this task.>

- Given <precondition>, when <action>, then <observable result>.

## Test plan
<Which tests cover this task. Reference paths under the repo's test root.
At least one entry required. Use `tests-plan.md` IDs if applicable.>

- Unit: `path/to/module.test.ts` — covers <function>
- E2E: `path/to/journey.e2e.yaml` — covers J-NN step N

## Files touched
- `path/to/file.ts` — <one-line reason>
- `path/to/dir/` — <one-line reason>

## Definition of done
- [ ] All tests in "Test plan" exist and pass
- [ ] No new lint or type errors
- [ ] Modularity thresholds respected (`modularity-thresholds.md`)
- [ ] Pure functions live in `**/domain/**` (`pure-function-policy.md`)
- [ ] Edge-case categories reviewed (`edge-case-categories.md`)
- [ ] ADR amendment drafted if architecture changed
```

## Validation rules

The validator FAILS the gate if:

1. **Frontmatter** missing or missing any of `id`, `jira`, `created`, `version`.
2. **Status** value is not one of `planned`, `in-progress`, `blocked`, `done`.
3. **Requirements** section absent or contains no `FR-NNN` reference.
4. **Journeys** section absent or contains no `J-NN` reference.
5. **Acceptance** section has fewer than one bullet, or any bullet missing `Given`, `when`, `then`.
6. **Test plan** section is empty (zero bullets). At minimum one test must be named.
7. **Files touched** section absent (literal `none — non-code task` allowed).
8. **Definition of done** checklist missing one or more of the six required items above.

## Why

- **Status enum is closed** — free-form status strings ("almost done", "WIP-ish") defeat dashboards. Four values cover every real state.
- **Test plan non-empty before impl** is the lever the tests-first sub-stage pulls on. Empty test plan means no failing test exists, which means tests-first is a fiction.
- **Definition-of-done as checklist** turns the merge gate from a vibe check into a count.

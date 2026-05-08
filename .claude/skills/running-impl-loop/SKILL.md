---
name: running-impl-loop
description: Use during Stage 05.3–05.8 to autonomously implement one task at a time, run validators after each, and output MERGE-READY when check-merge-readiness.sh exits 0
---

# Running the Implementation Loop

**Announce at start:** "I'm using the running-impl-loop skill. Reading PROGRESS.md to determine current state."

## How this skill is used

This skill is designed to be driven by `/ralph-loop`:

```
/ralph-loop "Apply skill: running-impl-loop" --completion-promise "MERGE-READY" --max-iterations 50
```

Each iteration: read state → do one unit of work → validate → update state → if done output `<promise>MERGE-READY</promise>`.

## On every iteration — read state first

1. Read `.claude/PROGRESS.md` (create it if missing — see Initialisation below)
2. Determine current phase from `## Current phase` section
3. Continue from where the previous iteration left off

## Initialisation (first iteration only)

If `.claude/PROGRESS.md` does not exist:

```markdown
# Stage 05 Progress

## Current phase
05.2-tests-plan

## Tasks
<!-- populated from plan.md after 05.1 approval -->

## Quality reports
- [ ] modularity.md
- [ ] ui-logic-separation.md
- [ ] user-dead-ends.md
- [ ] logic-gaps.md

## Merge readiness
- [ ] check-merge-readiness.sh passing
```

Then read `.pipeline/05-dev/plan.md` and populate the `## Tasks` section with one checkbox per `T-NNN`.

**Prerequisite check**: if `_approval-plan.json` is missing, stop and tell the user that plan approval is required before the loop can start. Do not output the completion promise.

## Phase logic

### Phase: `05.2-tests-plan`

If `.pipeline/05-dev/tests-plan.md` does not exist:
- Apply skill `mapping-tests-to-stories`
- Run `bash pipeline/validators/check-coverage-mapping.sh .pipeline/05-dev/tests-plan.md .pipeline/05-dev/plan.md`
- Fix failures, re-run until exit 0
- Update `## Current phase` → `05.3-impl`

### Phase: `05.3-impl`

Find the first unchecked `- [ ] T-NNN` in `## Tasks`.

For that task:
1. Read `.pipeline/05-dev/tasks/T-NNN.md`
2. Apply skill `enforcing-pure-function-policy` (pre-check on proposed files)
3. Apply skill `test-driven-development` — write failing tests first
4. Implement the feature to make tests pass
5. Apply skill `applying-architecture-principles` — flag and fix any violations
6. Apply skill `enforcing-pure-function-policy` — post-check
7. Run `bash pipeline/validators/check-quality-thresholds.sh .pipeline/05-dev/quality-reports` (if reports exist)
8. Update task status to `done` in `T-NNN.md`
9. Mark `- [x] T-NNN` in PROGRESS.md

If no unchecked tasks remain → update `## Current phase` → `05.4-quality`

### Phase: `05.4-quality`

Run the four quality gate skills in order. After each one, check that the report file exists and contains no `FAIL:` line before proceeding.

1. Apply skill `reviewing-modularity` → `.pipeline/05-dev/quality-reports/modularity.md`
2. Apply skill `reviewing-ui-logic-separation` → `.pipeline/05-dev/quality-reports/ui-logic-separation.md`
3. Apply skill `detecting-user-dead-ends` → `.pipeline/05-dev/quality-reports/user-dead-ends.md`
4. Apply skill `detecting-logic-gaps` → `.pipeline/05-dev/quality-reports/logic-gaps.md`
5. Apply skill `discovering-edge-cases` → appends to existing reports
6. Check all four report boxes in PROGRESS.md
7. Update `## Current phase` → `05.8-changelog`

### Phase: `05.8-changelog`

Apply skill `generating-changelog` → `.pipeline/05-dev/changelog.md`

Run:
```bash
bash pipeline/validators/check-merge-readiness.sh .pipeline/05-dev
```

If exit 0:
- Update `## Merge readiness` checkbox
- Output: `<promise>MERGE-READY</promise>`

If exit non-0:
- Fix every reported failure
- Re-run validator
- Do not output the promise until exit 0

## Debugging failures

If a validator fails and the cause is unclear, apply skill `systematic-debugging` before attempting a fix.

## Session continuity

PROGRESS.md is the single source of truth. If a session ends mid-loop, the next `/ralph-loop` invocation resumes from the last recorded phase and task automatically.

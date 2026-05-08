---
name: breaking-down-feature-into-tasks
description: Use at Stage 05.1 to decompose a feature into an ordered implementation plan with per-task detail files, before any code is written
---

# Breaking Down a Feature Into Tasks

**Announce at start:** "I'm using the breaking-down-feature-into-tasks skill to generate the implementation plan."

## What to read first

Read these files before writing anything:

1. `pipeline/conventions/05-dev/plan-template.md` — required structure for `plan.md`
2. `pipeline/conventions/05-dev/task-template.md` — required structure for each `T-NNN.md`
3. `pipeline/conventions/_global/writing-style.md`
4. `pipeline/conventions/_global/markdown-rules.md`

## Source material

Read all of the following. Stop and tell the user if any are missing:

- `.pipeline/02-spec/prd.md` — epics table and NFRs
- `.pipeline/02-spec/stories/US-NNN-*.md` — every story file (each carries its own acceptance criteria, priority, source)
- `.pipeline/04-architecture/tech-stack.md` — stack constraints
- `.pipeline/04-architecture/data-model.md` — entity boundaries
- `.pipeline/04-architecture/api-contracts.md` — interface boundaries

If Stage 02 or Stage 04 artifacts are missing, stop and tell the user to run those stages first.

## What to produce

### 1. `.pipeline/05-dev/plan.md`

Follow `plan-template.md` exactly. Requirements per task:

- `Stories`: at least one `US-NNN` ID, drawn from `.pipeline/02-spec/stories/`
- `Files touched`: concrete paths (not "TBD"). Use `none — non-code task` only if genuinely true.
- `Acceptance`: one-line testable outcome
- `Detail`: link to `tasks/T-NNN.md` that will exist after step 2

Order tasks so each one has its dependencies satisfied by prior tasks. Smaller tasks (S complexity) before larger ones when possible. Group stories that share files into the same task.

### 2. `.pipeline/05-dev/tasks/T-NNN.md` — one file per task

Follow `task-template.md` exactly. Set `Status: planned`. The acceptance bullets mirror the Given/when/then bullets from the referenced stories. The test plan must name at least one concrete test file path (placeholder path is acceptable at this stage).

## Validate

After writing all files, run:

```bash
bash pipeline/validators/check-plan.sh .pipeline/05-dev/plan.md
```

Fix every reported failure. Re-run until exit 0.

## Gate

Present `plan.md` to the user. **Stop here.** Sub-stages 05.2–05.8 are blocked until the user approves the plan. When the user approves, commit `_approval-plan.json`:

```json
{ "decision": "approved", "approver": "<name>", "date": "<YYYY-MM-DD>" }
```

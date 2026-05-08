# Stage 05 — Development

Read all files under `pipeline/conventions/05-dev/` before starting.

## What to read as source material

1. `.pipeline/02-spec/prd.md` — epics index and NFRs (required).
2. `.pipeline/02-spec/stories/` — individual US-NNN story files (required).
   Load only the story currently being implemented — not all stories at once.
3. `.pipeline/04-architecture/` — tech stack, data model, API contracts (required).
4. `PRODUCT.md` — personas for acceptance criteria context.

If stage 02 or 04 artifacts are missing, tell the user to run the earlier stages first and stop.

---

## Sub-stage 05.1 — Plan

Apply skill `breaking-down-feature-into-tasks`.

This produces `.pipeline/05-dev/plan.md` and `.pipeline/05-dev/tasks/T-NNN.md` files.
Validator: `bash pipeline/validators/check-plan.sh .pipeline/05-dev/plan.md`

**Gate: stop here and present the plan for user approval before continuing.**
Once approved, commit `_approval-plan.json`:
```json
{ "decision": "approved", "approver": "<name>", "date": "<YYYY-MM-DD>" }
```

---

## Sub-stages 05.2–05.8 — Autonomous implementation loop

After plan approval, start the autonomous loop:

```
/ralph-loop "Apply skill: running-impl-loop" --completion-promise "MERGE-READY" --max-iterations 50
```

The loop handles sub-stages in order:

| Sub-stage | What happens |
|---|---|
| 05.2 Tests plan | `mapping-tests-to-stories` → `tests-plan.md` |
| 05.3 Impl loop | Per task: TDD → implement → architecture check → pure function check |
| 05.4 Quality gate | `reviewing-modularity`, `reviewing-ui-logic-separation`, `detecting-user-dead-ends`, `detecting-logic-gaps`, `discovering-edge-cases` |
| 05.8 Changelog | `generating-changelog` → `changelog.md` → `check-merge-readiness.sh` |

The loop outputs `<promise>MERGE-READY</promise>` only when `check-merge-readiness.sh` exits 0.

Progress is tracked in `.claude/PROGRESS.md` — if a session ends mid-loop, restart with the same `/ralph-loop` command and it resumes from where it left off.

To cancel the loop at any time: `/cancel-ralph`

---

## After merge-ready

Run `/review-pr` for the human gate review before merge approval.

Prerequisites for developers:
- `bash` in PATH (Git Bash on Windows: https://git-scm.com)
- `jq` installed (`brew install jq` / `choco install jq` / `apt install jq`)
- `perl` installed (included with Git for Windows, macOS, most Linux distros)

---
name: running-pipeline-gate
description: Use when a pipeline stage has produced its artifacts and the next sub-stage is blocked until a human commits an approval JSON to the branch
---

# Running a Pipeline Gate

**Announce at start:** "I'm using the running-pipeline-gate skill to drive the approval handoff."

## Overview

Every stage in the pipeline ends at a gate. A gate is a JSON file (`_approval.json`, `_approval-plan.json`, or `_approval-merge.json`) committed to the feature branch by a human reviewer who is **not** the author of the stage. The agent that produced the stage MUST NOT write its own approval. This skill is the cross-cutting handoff procedure for stages 01–04 (Phase 1) and the two Phase 2 gates at 05.1 (plan) and 05.8 (merge).

## When to use

Trigger this skill the moment a stage's validator exits 0 and there are artifacts on disk awaiting human sign-off. Do not start the next sub-stage until the gate is passed.

## What to read first

1. `pipeline/conventions/_global/traceability.md` — how upstream IDs and links are checked across stages
2. `pipeline/approvers.yaml` — the role/count requirement for the current stage and the email-to-role map
3. The stage's own convention file under `pipeline/conventions/<stage>/` — to know which artifacts must exist

## Procedure

### 1. Verify the stage's validator passes

Run the matching validator from `pipeline/validators/` (e.g. `check-spec.sh`, `check-arch.sh`, `check-plan.sh`, `check-merge-readiness.sh`). Fix every failure and re-run until exit 0. A red validator is a hard stop — do not present artifacts for review.

### 2. Summarise the artifacts for the reviewer

Post a short summary to the user listing:
- The stage and sub-stage just completed
- Each artifact path under `.pipeline/<stage>/` produced or changed
- Validator command that exited 0
- The expected approval filename and which role (per `approvers.yaml`) must sign

### 3. Wait for the user to commit the approval JSON

**Stop here.** Do not loop, do not poll the filesystem aggressively, and do not begin the next sub-stage. The user will commit the JSON to the branch when a qualified reviewer signs off.

### 4. Verify the approval JSON

Once the user signals the approval is committed, read the file and check:
- `decision` is `"approved"` (anything else, including `"changes-requested"`, blocks the gate)
- `approver` resolves via `pipeline/approvers.yaml` to a role required for this stage
- `approver` is **not** the author of the stage commits (`git log` against the stage paths)
- `date` is present and ISO `YYYY-MM-DD`

If any check fails, report the specific failure and stop.

### 5. Confirm the gate is passed

Tell the user the gate is green and name the next sub-stage that may now start. Do not auto-start it unless the user explicitly says to proceed.

## Approval JSON shape

File location is alongside the stage's artifacts (e.g. `.pipeline/02-spec/_approval.json`, `.pipeline/05-dev/_approval-plan.json`, `.pipeline/05-dev/_approval-merge.json`).

```json
{
  "decision": "approved",
  "approver": "pm@example.com",
  "date": "2026-05-08",
  "notes": "PRD epics align with idea; NFRs cover performance and a11y."
}
```

`notes` is optional. `decision` MUST be `"approved"` for the gate to pass.

## Why these gates exist

The validators check shape and traceability — they cannot judge whether the artifact says the right thing. Gates force a second human, in a role distinct from the author, to read the artifact and accept responsibility for it before downstream work proceeds. Without the committed JSON the chain of custody between stages is broken and `check-traceability.sh` cannot prove a stage was reviewed. Self-approval defeats the purpose; the validator enforces author/approver disjointness against `git log`.

# Approval JSON files

Stage 05 has two human gates. Each gate is a small JSON file committed to the
feature branch. The validator `pipeline/validators/check-merge-readiness.sh`
greps the files for `"decision": "approved"` and aggregates the result with the
quality reports, changelog, and coverage mapping.

## Where they live

On a feature branch, both files sit inside the stage 05 working directory:

- `.pipeline/05-dev/_approval-plan.json` — written after stage `05.1` (plan
  gate), before the autonomous implementation loop starts.
- `.pipeline/05-dev/_approval-merge.json` — written after stage `05.8`
  (changelog), before the branch is allowed to merge.

Templates for both files live next to this README:

- `pipeline/conventions/_global/approval-plan-template.json`
- `pipeline/conventions/_global/approval-merge-template.json`

## Required fields (validator-checked)

The validator only enforces one field literally: `decision` must equal
`approved`. The other valid values are `rejected` and `needs-changes`; both
fail the gate. The remaining fields are required by convention so the gate has
an audit trail:

| Field   | Type        | Notes                                              |
|---------|-------------|----------------------------------------------------|
| decision | string     | `approved` \| `rejected` \| `needs-changes`        |
| approver | string     | Reviewer email or handle. Must NOT be the author.  |
| date    | ISO date    | `YYYY-MM-DD` of the approval.                      |
| branch  | string     | Feature branch the approval applies to.            |
| comments | string    | Free-text rationale; required for non-`approved`. |

Plan gate adds `plan_id` (e.g. `PLAN-NNN`).
Merge gate adds `merge_id` (e.g. `CHANGELOG-NNN`) and
`quality_reports_acked` (boolean) confirming the reviewer read the four
quality reports under `.pipeline/05-dev/quality-reports/`.

## The author cannot self-approve

The agent or human who produced the stage MUST NOT write the approval JSON for
that stage. CI cross-references `approver` against `git log --format=%ae` for
the branch (see `pipeline/approvers.yaml` for role hints) and rejects the gate
if they match.

## Slash command pathway

A future `/approve-plan` and `/approve-merge` slash command will collect the
fields above interactively, validate them against `approvers.yaml`, and commit
the JSON. Until then (TODO), the reviewer copies the matching template, fills
the fields, and commits manually.

## Validator

```bash
bash pipeline/validators/check-merge-readiness.sh .pipeline/05-dev
```

Exit 0 means both approvals are present and approved, the changelog mentions
the ticket, the four quality reports pass, and coverage mapping holds.

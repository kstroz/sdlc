<!--
  PR template for the SDLC pipeline. Tied to the merge gate defined in
  pipeline/conventions/05-dev/quality-gate-criteria.md. Tick every box that
  applies; an unticked box on the Pipeline artifacts or CI sections is a
  hard-fail and the reviewer will block the merge.
-->

## Summary

<!-- 1-3 sentences. What does this PR deliver? Reference the plan task IDs it covers. -->
- Ticket: `BAJ-___`
- Plan tasks covered: `T-___`, `T-___`
- One-line outcome:

## Stories delivered

<!-- Bullet every US-NNN from .pipeline/02-spec/stories/ that this PR fully implements. -->
- `US-___` — <story title>
- `US-___` — <story title>

## Pipeline artifacts

- [ ] `.pipeline/05-dev/plan.md` exists and `_approval-plan.json` has `decision: approved`
- [ ] `.pipeline/05-dev/tests-plan.md` covers every story declared in `plan.md`
- [ ] `.pipeline/05-dev/tasks/T-NNN.md` exists for every task with `status: done`
- [ ] `.pipeline/05-dev/quality-reports/modularity.md` present, zero `FAIL:` lines
- [ ] `.pipeline/05-dev/quality-reports/ui-logic-separation.md` present, zero `FAIL:` lines
- [ ] `.pipeline/05-dev/quality-reports/user-dead-ends.md` present, zero `FAIL:` lines
- [ ] `.pipeline/05-dev/quality-reports/logic-gaps.md` present, zero `FAIL:` lines
- [ ] `.pipeline/05-dev/changelog.md` mentions the ticket ID
- [ ] `_approval-merge.json` with `decision: approved` (added by reviewer, not author)

## Validators

<!-- Run each command from the repo root. Tick the box and paste the exit code. -->

- [ ] `bash pipeline/validators/check-product.sh PRODUCT.md` — exit `___`
- [ ] `bash pipeline/validators/check-idea.sh .pipeline/01-idea/idea.md` — exit `___`
- [ ] `bash pipeline/validators/check-spec.sh .pipeline/02-spec` — exit `___`
- [ ] `bash pipeline/validators/check-arch.sh .pipeline/04-architecture` — exit `___`

- [ ] `bash pipeline/validators/check-plan.sh .pipeline/05-dev/plan.md` — exit `___`
- [ ] `bash pipeline/validators/check-coverage-mapping.sh .pipeline/05-dev/tests-plan.md .pipeline/05-dev/plan.md` — exit `___`
- [ ] `bash pipeline/validators/check-tests-first.sh .pipeline/05-dev .` — exit `___`
- [ ] `bash pipeline/validators/check-quality-thresholds.sh .pipeline/05-dev/quality-reports` — exit `___`
- [ ] `bash pipeline/validators/check-merge-readiness.sh .pipeline/05-dev` — exit `___`
- [ ] `bash pipeline/validators/check-traceability.sh .pipeline` — exit `___`

## CI

<!-- All must be green on the head commit. CI runs from .github/workflows/dev-pipeline.yml. -->

- [ ] Lint — no errors (warnings allowed)
- [ ] Typecheck — exit 0
- [ ] Unit tests — all green
- [ ] Dependency audit — no `HIGH` or `CRITICAL` (waivers must be in `_security-exceptions.json`)
- [ ] E2E — green, or `N/A` because this PR introduces no new `J-NN` journey

## ADR amendments

<!-- Only fill in if architecture changed. Otherwise: "None." -->
- `ADR-___` — <amended | added> — <one-line reason>

## How a reviewer can verify

```bash
git fetch origin <this-branch> && git checkout <this-branch>
bash pipeline/validators/check-merge-readiness.sh .pipeline/05-dev
echo "exit=$?"   # must be 0
```

The reviewer should also spot-check one `quality-reports/*.md` file for `FAIL:` lines and confirm `_approval-plan.json.decision == "approved"` before adding `_approval-merge.json`.

---

<sub>Most of this PR should have been produced by the impl-loop's `running-impl-loop` skill driven via `/ralph-loop`. Any sections you edited by hand after the loop emitted `MERGE-READY` must be flagged in the **Summary** above so the reviewer knows what to scrutinize.</sub>

# Stage 05 — Development

Read all files under `pipeline/conventions/05-dev/` before starting.

## What to read as source material

1. `.pipeline/02-spec/prd.md` — epics index and NFRs (required).
2. `.pipeline/02-spec/stories/` — individual US-NNN story files (required).
   Load only the story currently being implemented — not all stories at once.
3. `.pipeline/04-architecture/` — tech stack, data model, API contracts (required).
4. `PRODUCT.md` — personas for acceptance criteria context.

If stage 02 or 04 artifacts are missing, tell the user to run the earlier stages first and stop.

## Sub-stages — work through these in order

### 05.1 — Plan (`plan.md`)

Generate `.pipeline/05-dev/plan.md` following `pipeline/conventions/05-dev/plan-template.md`.

Break the PRD epics into an ordered implementation plan. Each plan item maps to one epic
(E-NN) and lists: implementation order rationale, dependencies on other plan items,
estimated complexity (S / M / L), and the stories (US-NNN) it delivers.

Run `pipeline/validators/check-plan.sh .pipeline/05-dev/plan.md`. Fix failures.
**Stop here and present the plan for approval before continuing.**

### 05.2 — Tests plan (`tests-plan.md`)

Generate `.pipeline/05-dev/tests-plan.md` following `pipeline/conventions/05-dev/tests-plan-template.md`.

Map every US-NNN story acceptance criteria to a test case. For each test case: type
(unit | integration | e2e), the story it covers, the Given/when/then scenario, and
the file path where the test will live (can be a placeholder path at this stage).

Run `pipeline/validators/check-tests-first.sh .pipeline/05-dev .` once test files exist.

### 05.3 — Implementation loop

For each plan item, in order:
1. Read `pipeline/conventions/05-dev/architecture-principles.md` (KISS, SOLID, Facade).
2. Read `pipeline/conventions/05-dev/pure-function-policy.md`.
3. Implement the stories. Write tests before or alongside implementation code.
4. After each item, run `pipeline/validators/check-quality-thresholds.sh .pipeline/05-dev/quality-reports`.

### 05.4 — Quality gate

Run the quality checks from `pipeline/conventions/05-dev/quality-gate-criteria.md`:
- Modularity review (`reviewing-modularity`)
- UI/logic separation review (`reviewing-ui-logic-separation`)
- Edge case discovery (`discovering-edge-cases`) using `pipeline/conventions/05-dev/edge-case-categories.md`
- Dead-end detection (`detecting-user-dead-ends`)

Write reports to `.pipeline/05-dev/quality-reports/`.

### 05.5 — Changelog

Generate a changelog entry following `pipeline/conventions/05-dev/changelog-format.md`.
Update or create `CHANGELOG.md` at the repo root.

## After all sub-stages

Run:

```bash
bash pipeline/validators/check-merge-readiness.sh .pipeline/05-dev
```

Fix every failure. Present the summary to the user for merge approval.

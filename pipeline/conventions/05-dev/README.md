# Stage 05 — Development

Conventions for the Development stage. Stage 05 is a per-feature mini-pipeline that runs after the architecture gate (stage 04) and ends at merge to the trunk. It extends `<branch>/.pipeline/` with a `05-dev/` subdirectory.

The mini-pipeline has eight sub-stages:

1. **Plan** — `plan.md` + `tasks/T-NNN.md`
2. **Tests-first** — `tests-plan.md`, failing tests committed before implementation
3. **Impl-loop** — implementation per task, status tracked in `T-NNN.md`
4. **Quality** — modularity, UI/logic separation, dead-end, logic-gap reports under `quality-reports/`
5. **Edge-cases** — categories from `edge-case-categories.md`, expanded into per-task scenarios
6. **Security** — dependency audit, secret scan, threat-model deltas
7. **Review** — code review summary, AI + human approvals
8. **ADR-amend + Changelog** — ADR amendments, generated `changelog.md`

Two explicit gates:

- `_approval-plan.json` between sub-stage 05.1 (Plan) and 05.2 (Tests-first).
- `_approval-merge.json` after sub-stage 05.8 (ADR-amend + Changelog) and before merge.

## Templates

| File | Artifact it governs | Identifier prefix |
|---|---|---|
| `plan-template.md` | `05-dev/plan.md` | `T-NNN` (tasks) |
| `task-template.md` | `05-dev/tasks/T-NNN.md` | `T-NNN` |
| `tests-plan-template.md` | `05-dev/tests-plan.md` | (none) |
| `architecture-principles.md` | implementation rules (KISS/SOLID/Facade) | (none) |
| `pure-function-policy.md` | layer boundaries (domain / use-cases / platform) | (none) |
| `modularity-thresholds.md` | file/class/function size + complexity caps | (none) |
| `quality-gate-criteria.md` | hard-fail vs soft-warn rules at the merge gate | (none) |
| `edge-case-categories.md` | required edge-case categories per task | (none) |
| `changelog-format.md` | `05-dev/changelog.md` shape | (none) |

## Required artifacts at the merge gate

Stage 05 passes when all the following exist under `<branch>/.pipeline/05-dev/` and conform to their templates:

1. `plan.md`
2. `tasks/T-NNN.md` (one per task in `plan.md`)
3. `tests-plan.md`
4. `quality-reports/modularity.md`
5. `quality-reports/ui-logic-separation.md`
6. `quality-reports/user-dead-ends.md`
7. `quality-reports/logic-gaps.md`
8. `changelog.md`
9. `_approval-plan.json` (decision: approved)
10. `_approval-merge.json` (decision: approved)

## Validators

- `pipeline/validators/check-plan.sh` — plan.md structure + task linkage
- `pipeline/validators/check-tests-first.sh` — git history shows test commits precede impl commits
- `pipeline/validators/check-coverage-mapping.sh` — every J-NN mapped to an E2E test path
- `pipeline/validators/check-quality-thresholds.sh` — all four quality reports exist and contain no FAIL lines
- `pipeline/validators/check-merge-readiness.sh` — both approval files signed off; all the above pass

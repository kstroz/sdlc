# Quality Gate Criteria (Stage 05.4–05.7)

Defines what blocks the merge gate (hard-fail) and what is advisory (soft-warn). Used by the GHA reference workflow, the AI quality gate, and the human reviewer.

## Hard-fail (blocks merge)

The merge gate denies approval if any of the following holds:

1. **Type errors** — typecheck step exits non-zero.
2. **Lint errors** — lint step reports any error (warnings are soft).
3. **Failing tests** — any unit, contract, or E2E test fails on CI.
4. **Coverage drop** — line coverage on the changed packages drops more than 1.0 percentage point vs the trunk baseline.
5. **Missing E2E for new J-NN** — `check-coverage-mapping.sh` reports an unmapped journey introduced or modified by this branch.
6. **Security high-severity** — `npm audit --audit-level=high` (or platform equivalent) reports any HIGH or CRITICAL vulnerability not listed in `_security-exceptions.json` with an active waiver.
7. **Modularity FAIL** — `quality-reports/modularity.md` contains any line starting with `FAIL:`.
8. **UI/logic separation FAIL** — `quality-reports/ui-logic-separation.md` contains any line starting with `FAIL:` (business logic in view components, IO in domain, etc.).
9. **User dead-end FAIL** — `quality-reports/user-dead-ends.md` contains any line starting with `FAIL:` (a dead-end without a recovery path).
10. **Logic-gap FAIL** — `quality-reports/logic-gaps.md` contains any line starting with `FAIL:` (an FR with no covering test, an acceptance criterion without an assertion).
11. **Missing approvals** — `_approval-plan.json` or `_approval-merge.json` absent or `decision != approved`.
12. **Missing changelog** — `changelog.md` does not mention the current ticket ID.

## Soft-warn (advisory; does not block)

These are surfaced in review but do not deny merge:

- Modularity warnings (lines starting with `WARN:`).
- AI-flagged style issues (naming, redundant comments, dead branches by inspection).
- Coverage drop within 1.0 percentage point.
- Soft-warn entries in any quality report.
- Dependency audit MEDIUM or LOW.

## Resolution paths

- A hard-fail is resolved by fixing the underlying issue and re-running CI. Waivers are not allowed except for security findings (case 6) recorded in `_security-exceptions.json` with reviewer signoff.
- A soft-warn is resolved by either fixing the issue or annotating the offender (`// modularity-exempt: ADR-NNN`).

## Validation rules

The validator (`check-merge-readiness.sh`) FAILS the merge gate if any rule under "Hard-fail" is true. It does not introspect lint/typecheck/test outputs directly — those run in CI; the validator only checks the artifacts under `05-dev/` (approvals, quality reports, changelog) and the cross-references handled by `check-coverage-mapping.sh`.

## Why

- **Closed list of hard-fails** prevents reviewer drift. Anything not on this list is advisory by definition.
- **Coverage tolerance of 1.0 pp** acknowledges measurement noise without giving up on the trend.
- **Security waivers via file** keeps audit trails. Verbal approval of a CVE is not approval.
- **Soft-warn separate** preserves the signal of "this is going to bite us" without making CI red on day one of a new rule.

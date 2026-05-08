---
name: mapping-tests-to-stories
description: Use at Stage 05.2 to produce the tests-plan before any implementation code is written; maps every story (US-NNN) and pure function to a concrete test file path
---

# Mapping Tests to Stories

**Announce at start:** "I'm using the mapping-tests-to-stories skill to generate the tests plan."

**Prerequisite:** `_approval-plan.json` must exist and contain `"decision": "approved"`. Stop and tell the user if it is missing.

## What to read first

1. `pipeline/conventions/05-dev/tests-plan-template.md` — required structure
2. `pipeline/conventions/05-dev/pure-function-policy.md` — which functions require unit tests
3. `.pipeline/05-dev/plan.md` — the approved task list with US-NNN references
4. `.pipeline/02-spec/stories/US-NNN-*.md` — every story this branch delivers (acceptance criteria are here)
5. `.pipeline/04-architecture/api-contracts.md` — contracts requiring contract tests

## What to produce

`.pipeline/05-dev/tests-plan.md` following `tests-plan-template.md` exactly.

### E2E coverage section

One bullet per US-NNN that this branch delivers (collected from `plan.md`). Every story is either:
- mapped to a concrete E2E test file path (`e2e/US-NNN-<slug>.e2e.yaml`), or
- explicitly marked `out-of-scope` with a reason and a tracking ticket ID

Do not omit any story declared in `plan.md`. A missing story is a validator failure.

### Unit coverage section

One bullet per US-NNN that introduces or changes a pure function in `**/domain/**`. Map each story to:
- the domain module file: `src/domain/<module>/<function>.ts`
- the sibling test file: `src/domain/<module>/<function>.test.ts`

If a story touches only platform/infra code with no domain logic, write `US-NNN → no pure function added`.

### Contract coverage section

One bullet per API contract in `04-architecture/api-contracts.md` that this branch implements or changes. Map to a contract test file. Write `None on this branch.` if no API surface changes.

### Out-of-scope section

Explicit list of coverage gaps with reason and tracking ticket. Write `None.` if none.

## Rules

- This file is committed **before** any implementation file. The `check-tests-first.sh` validator enforces git history order.
- Test file paths at this stage may be placeholders — they will be created during 05.3. The validator checks they exist *after* 05.3.

## Validate

```bash
bash pipeline/validators/check-coverage-mapping.sh .pipeline/05-dev/tests-plan.md .pipeline/05-dev/plan.md
```

Fix every failure. Re-run until exit 0.

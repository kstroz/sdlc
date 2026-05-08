# Tests Plan Template (Stage 05.2)

Defines the required structure of `05-dev/tests-plan.md`. The tests plan is committed before any implementation code. Every J-NN from `02-spec/user-journeys.md` MUST appear in the E2E coverage section; every pure function in the domain layer MUST have a matching unit test.

## Required structure

```markdown
---
id: TESTS-001
jira: <TICKET-ID>
created: YYYY-MM-DD
version: 1
---

# Tests Plan — <Ticket title>

## E2E coverage
<One bullet per J-NN journey in 02-spec/user-journeys.md that this branch
touches. Each line maps the journey to a single test file path. Use
`out-of-scope` if the branch does not exercise that journey end-to-end.>

- J-01 → `e2e/journeys/J-01-checkout.e2e.yaml`
- J-02 → `e2e/journeys/J-02-resume.e2e.yaml`
- J-03 → out-of-scope (no UI surface on this branch)

## Unit coverage
<One bullet per FR-NNN that adds or changes a pure function. Maps the FR
to the module/function under test and the matching `*.test.*` file.>

- FR-001 → `src/domain/pricing/applyDiscount.ts` ↔ `src/domain/pricing/applyDiscount.test.ts`
- FR-002 → `src/domain/cart/total.ts` ↔ `src/domain/cart/total.test.ts`

## Contract coverage
<One bullet per API contract (from 04-architecture) that this branch
implements or changes. Maps the contract path to a contract test.>

- `04-architecture/api-contracts/checkout.openapi.yaml` ↔ `tests/contracts/checkout.contract.test.ts`

## Out-of-scope
<Coverage gaps the branch knowingly leaves to a follow-up. Each line: what
is uncovered + why + ticket where it will be picked up.>

- J-04 step 3 (push notification tap) — requires APNs sandbox setup, tracked in BAJ-9999
```

## Validation rules

The validator (`check-coverage-mapping.sh`) FAILS the gate if:

1. **Frontmatter** missing or missing any of `id`, `jira`, `created`, `version`.
2. **E2E coverage** section absent.
3. Any `J-NN` ID present in `02-spec/user-journeys.md` is absent from the E2E section.
4. **Unit coverage** section absent.
5. Any pure function file under `**/domain/**` introduced or modified on the branch lacks a matching `*.test.*` sibling.
6. **Contract coverage** section absent (literal `None on this branch.` allowed if no API surface changes).
7. **Out-of-scope** section absent (literal `None.` allowed).

## Why

- **J-NN → E2E file mapping** is the only mechanical check that proves user journeys are protected. Without it, "we have E2E tests" is unverifiable.
- **Unit coverage tied to pure functions** keeps unit tests where they pay off. Tests on impure orchestration code are flaky and slow; the policy pushes coverage into the domain layer.
- **Contract coverage** prevents silent drift between the OpenAPI/GraphQL schema in stage 04 and the runtime in stage 05.
- **Out-of-scope explicit** turns "we'll add the test later" into a tracked ticket, not a verbal promise.

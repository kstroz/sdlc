# Tests Plan Template (Stage 05.2)

Defines the required structure of `05-dev/tests-plan.md`. The tests plan is committed before any implementation code. Every `US-NNN` story this branch delivers MUST appear in the E2E coverage section; every pure function in the domain layer MUST have a matching unit test.

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
<One bullet per US-NNN story this branch delivers (from plan.md). Each line maps
the story to a single test file path. Use `out-of-scope` if the branch does not
exercise that story end-to-end.>

- US-001 → `e2e/US-001-sign-in.e2e.yaml`
- US-009 → `e2e/US-009-offline-completion.e2e.yaml`
- US-013 → out-of-scope (backend-only, no UI surface on this branch)

## Unit coverage
<One bullet per US-NNN that adds or changes a pure function. Maps the story
to the module/function under test and the matching `*.test.*` file.>

- US-008 → `src/domain/tasks/completion.ts` ↔ `src/domain/tasks/completion.test.ts`
- US-010 → `src/domain/sync/idempotencyKey.ts` ↔ `src/domain/sync/idempotencyKey.test.ts`

## Contract coverage
<One bullet per API contract (from 04-architecture) that this branch
implements or changes. Maps the contract path to a contract test.>

- `04-architecture/api-contracts.md#api-03-post-tasks-id-complete` ↔ `tests/contracts/complete.contract.test.ts`

## Out-of-scope
<Coverage gaps the branch knowingly leaves to a follow-up. Each line: what
is uncovered + why + ticket where it will be picked up.>

- US-011 (push notifications) — requires APNs sandbox setup, tracked in BAJ-9999
```

## Validation rules

The validator (`check-coverage-mapping.sh`) FAILS the gate if:

1. **Frontmatter** missing or missing any of `id`, `jira`, `created`, `version`.
2. **E2E coverage** section absent.
3. Any `US-NNN` story declared in `plan.md` is absent from the E2E section.
4. **Unit coverage** section absent.
5. Any pure function file under `**/domain/**` introduced or modified on the branch lacks a matching `*.test.*` sibling.
6. **Contract coverage** section absent (literal `None on this branch.` allowed if no API surface changes).
7. **Out-of-scope** section absent (literal `None.` allowed).

## Why

- **US-NNN → E2E file mapping** is the only mechanical check that proves user-visible behaviour is protected. Without it, "we have E2E tests" is unverifiable.
- **Unit coverage tied to pure functions** keeps unit tests where they pay off. Tests on impure orchestration code are flaky and slow; the policy pushes coverage into the domain layer.
- **Contract coverage** prevents silent drift between the OpenAPI/GraphQL schema in stage 04 and the runtime in stage 05.
- **Out-of-scope explicit** turns "we'll add the test later" into a tracked ticket, not a verbal promise.

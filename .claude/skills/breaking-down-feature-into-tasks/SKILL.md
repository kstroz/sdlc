---
name: breaking-down-feature-into-tasks
description: Use at Stage 05.1 to decompose a feature into an ordered implementation plan with per-task detail files, before any code is written
---

# Breaking Down a Feature Into Tasks

**Announce at start:** "I'm using the breaking-down-feature-into-tasks skill to generate the implementation plan."

## What to read first

Read these files before writing anything:

1. `pipeline/conventions/05-dev/plan-template.md` — required structure for `plan.md`
2. `pipeline/conventions/05-dev/task-template.md` — required structure for each `T-NNN.md`
3. `pipeline/conventions/_global/writing-style.md`
4. `pipeline/conventions/_global/markdown-rules.md`

## Source material

Read all of the following. Stop and tell the user if any are missing:

- `.pipeline/02-spec/prd.md` — epics table and NFRs
- `.pipeline/02-spec/stories/US-NNN-*.md` — every story file (each carries its own acceptance criteria, priority, source)
- `.pipeline/04-architecture/tech-stack.md` — stack constraints
- `.pipeline/04-architecture/data-model.md` — entity boundaries
- `.pipeline/04-architecture/api-contracts.md` — interface boundaries

If Stage 02 or Stage 04 artifacts are missing, stop and tell the user to run those stages first.

## What to produce

### 1. `.pipeline/05-dev/plan.md`

Follow `plan-template.md` exactly. Requirements per task:

- `Stories`: at least one `US-NNN` ID, drawn from `.pipeline/02-spec/stories/`
- `Files touched`: concrete paths (not "TBD"). Use `none — non-code task` only if genuinely true.
- `Acceptance`: one-line testable outcome
- `Detail`: link to `tasks/T-NNN.md` that will exist after step 2

Order tasks so each one has its dependencies satisfied by prior tasks. Smaller tasks (S complexity) before larger ones when possible. Group stories that share files into the same task.

### 2. `.pipeline/05-dev/tasks/T-NNN.md` — one file per task

Follow `task-template.md` exactly. Set `Status: planned`. The acceptance bullets mirror the Given/when/then bullets from the referenced stories. The test plan must name at least one concrete test file path (placeholder path is acceptable at this stage).

## Validate

After writing all files, run:

```bash
bash pipeline/validators/check-plan.sh .pipeline/05-dev/plan.md
```

Fix every reported failure. Re-run until exit 0.

## Example output

Derive the example by walking the stories: cluster stories that touch the same files into one task, then order tasks so each task's prerequisites (schemas, endpoints, modules) are produced by an earlier task. Below, US-001 and US-002 share the user table and auth module so they fold into T-002; US-003 and US-004 both consume the session middleware T-002 introduces, so they land in T-003; T-001 sets up the migration runner that T-002 depends on.

`.pipeline/05-dev/plan.md`:

````markdown
---
id: PLAN-001
jira: BAJ-417
created: 2026-05-08
version: 1
---

# Plan — Email/password authentication

## Scope summary
Implements E-02 (Account access) via US-001..US-004 on the `auth` branch. Defers
password reset (US-005) and SSO (US-006) to a later branch. NFR-03 (bcrypt cost ≥ 12)
and NFR-07 (session TTL 24h) are honoured by T-002 and T-003.

## Tasks

### T-001 — Migration runner and users table
- **Stories**: US-001
- **Files touched**: `db/migrate.ts`, `db/migrations/0001_users.sql`
- **Acceptance**: `pnpm db:migrate` creates `users` table with unique `email` index.
- **Detail**: `tasks/T-001.md`

### T-002 — Signup and login endpoints
- **Stories**: US-001, US-002
- **Files touched**: `src/auth/signup.ts`, `src/auth/login.ts`, `src/auth/hash.ts`
- **Acceptance**: `POST /signup` and `POST /login` return 200 with a session cookie for valid credentials, 401 otherwise.
- **Detail**: `tasks/T-002.md`

### T-003 — Session middleware and logout
- **Stories**: US-003, US-004
- **Files touched**: `src/auth/session.ts`, `src/auth/logout.ts`, `src/server.ts`
- **Acceptance**: Requests with a valid session cookie reach protected routes; `POST /logout` invalidates the cookie.
- **Detail**: `tasks/T-003.md`

## Out-of-plan
- Password reset flow (US-005)
- SSO providers (US-006)
- Rate limiting on auth endpoints
````

`.pipeline/05-dev/tasks/T-001.md`:

````markdown
---
id: T-001
jira: BAJ-417
created: 2026-05-08
version: 1
---

# T-001 — Migration runner and users table

## Status
planned

## Stories
- US-001

## Acceptance
- Given an empty database, when `pnpm db:migrate` runs, then a `users` table exists with columns `id`, `email`, `password_hash`, `created_at`.
- Given the migration has run once, when it runs again, then it is a no-op and exits 0.
- Given two rows with the same `email`, when insert is attempted, then the unique index rejects the second insert.

## Test plan
- Unit: `db/migrate.test.ts` — covers idempotent re-run
- Integration: `tests/db/users-schema.test.ts` — covers unique email constraint

## Files touched
- `db/migrate.ts` — minimal forward-only migration runner
- `db/migrations/0001_users.sql` — initial users table and unique index

## Definition of done
- [ ] All tests in "Test plan" exist and pass
- [ ] No new lint or type errors
- [ ] Modularity thresholds respected (`modularity-thresholds.md`)
- [ ] Pure functions live in `**/domain/**` (`pure-function-policy.md`)
- [ ] Edge-case categories reviewed (`edge-case-categories.md`)
- [ ] ADR amendment drafted if architecture changed
````

## Gate

Present `plan.md` to the user. **Stop here.** Sub-stages 05.2–05.8 are blocked until the user approves the plan. When the user approves, commit `_approval-plan.json`:

```json
{ "decision": "approved", "approver": "<name>", "date": "<YYYY-MM-DD>" }
```

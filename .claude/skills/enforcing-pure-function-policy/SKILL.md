---
name: enforcing-pure-function-policy
description: Use during Stage 05.2 and 05.3 to verify that domain, use-case, and platform layers respect the import direction and purity rules before and after implementation
---

# Enforcing Pure Function Policy

**Announce at start:** "I'm using the enforcing-pure-function-policy skill to check layer boundaries."

## What to read first

`pipeline/conventions/05-dev/pure-function-policy.md` — the three-layer rules and the banned-global list.

## Scope

Run this skill:

1. **Before implementation** of each task — as a pre-check on the proposed file structure
2. **After implementation** of each task — as a post-check before marking the task done

## Checks to perform

For every file touched by the current task:

### Domain layer (`**/domain/**`)

Check for violations:

- Imports from `use-cases/**`, `platform/**`, `infra/**`, or `adapters/**` → **FAIL**
- Imports from any third-party SDK that performs IO → **FAIL**
- Direct use of banned globals: `Date.now`, `Math.random`, `crypto.randomUUID`, `process.env`, `fetch`, `XMLHttpRequest`, `setTimeout`, `setInterval`, `fs`, `path`, `os`, `localStorage`, `AsyncStorage` → **FAIL**
- Missing sibling `*.test.*` file for any `.ts`/`.tsx` file → **FAIL**

If clock or randomness is needed, the function must accept `now: () => Date` or `randomId: () => string` as an injected parameter.

### Use-cases layer (`**/use-cases/**` or `**/orchestration/**`)

- Imports a concrete platform class (not interface) → **FAIL**
- Contains a `switch` or `if-else` on a domain enum that encodes business logic → **FAIL** (move to domain)
- More than one entry function exported from a single use-case file → **FAIL**

### Platform layer (`**/platform/**`, `**/infra/**`, `**/adapters/**`)

- Contains business rule computation (price, discount, validation logic) → **FAIL**
- Must implement an interface declared by use-cases — if no interface exists, flag as **WARN**

## Output format

Report each finding inline as a review comment before continuing:

```
FAIL [pure-function-policy / domain-import] src/domain/tasks/taskValidator.ts:3
  Imports from platform/db.ts — domain must not import platform code.

FAIL [pure-function-policy / banned-global] src/domain/scheduling/nextDue.ts:12
  Uses Date.now() directly. Accept `now: () => Date` as parameter instead.

WARN [pure-function-policy / missing-interface] src/platform/supabase/taskRepo.ts
  No use-case interface found for this adapter. Define one before 05.4.
```

Fix all FAIL findings before proceeding. WARN findings must be resolved before the merge gate.

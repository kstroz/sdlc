# Architecture Principles (Stage 05)

Operational rules for KISS, SOLID, and Facade as applied during the impl-loop. The reviewer (AI or human) flags violations against this file by name; "this feels over-engineered" is not a valid review comment.

## Rules

### KISS — Keep It Straightforward
- Pick the smallest construct that meets the acceptance criteria. A function beats a class; a class beats a service.
- No abstractions for hypothetical second use cases. Wait for the second caller, then extract.
- No configuration knobs without a current consumer.

### SOLID
- **S**ingle responsibility: a module/class has one reason to change. Two reasons → split.
- **O**pen-closed: extend by adding a new module, not by editing a switch in a shared one.
- **L**iskov: a subtype satisfies the supertype's contract for every input the supertype accepts. No `throw` in subtype methods that the parent does not declare.
- **I**nterface segregation: a consumer imports a narrow interface, not a god type. If a caller uses 2 of 12 methods, define a 2-method interface.
- **D**ependency inversion: domain depends on interfaces, not concrete IO. See `pure-function-policy.md`.

### Facade
- Cross-layer entry points expose one function or one class. Internals stay package-private.
- A use-case orchestrates calls; it does not re-export every collaborator. If callers reach past the facade, the facade is wrong.

## When to apply

- **Before starting a task**: re-read this file when the task touches a new module boundary.
- **In code review**: flag violations by section name (`KISS-rule-2`, `SOLID-S`, `Facade`).
- **In ADR amendments**: if a deliberate exception is taken, record it in the ADR with the trigger condition for revisiting.

## Anti-patterns

```pseudo
// BAD — speculative generality (KISS-rule-2)
class PricingStrategyFactory {
  create(name: string): PricingStrategy { ... }   // single caller, single strategy
}

// GOOD
function applyDiscount(price: Money, code: string): Money { ... }
```

```pseudo
// BAD — single-responsibility violation (SOLID-S)
class UserService {
  signUp(...) { ... }
  sendInvoice(...) { ... }
  resizeAvatar(...) { ... }
}

// GOOD — three modules: auth, billing, media
```

```pseudo
// BAD — leaky facade
export { CartRepo, PricingService, TaxClient } from './checkout'

// GOOD
export { checkout } from './checkout'   // single entry; collaborators stay internal
```

```pseudo
// BAD — interface bloat (SOLID-I)
interface Db { query, insert, update, delete, migrate, backup, restore, ... }
function listOrders(db: Db) { return db.query(...) }

// GOOD
interface OrderQueries { listOrders(): Order[] }
function listOrders(db: OrderQueries) { return db.listOrders() }
```

## How AI/reviewer flags violations

A violation comment MUST cite (a) the rule name from this file and (b) the file:line. Example:

> `Facade` violation in `src/checkout/index.ts:12` — re-exports `CartRepo`. Move it back to internal and route callers through `checkout()`.

Comments without a rule citation are not actionable and should be reopened by the author.

## Why

- **Named rules** make reviews cheap. Authors learn the catalogue once and stop relitigating.
- **Concrete bad-vs-good blocks** beat philosophy. Engineers ship code, not essays.
- **ADR-recorded exceptions** keep the principles alive: every break is dated, justified, and revisitable.

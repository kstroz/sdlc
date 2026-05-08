---
name: applying-architecture-principles
description: Use at the start of each implementation task in Stage 05.3 and during code review to flag KISS, SOLID, and Facade violations by rule name and file:line
---

# Applying Architecture Principles

**Announce at start:** "I'm using the applying-architecture-principles skill to review this implementation against the project's architecture rules."

## What to read first

1. `pipeline/conventions/05-dev/architecture-principles.md` — the full KISS, SOLID, Facade ruleset with examples
2. `pipeline/conventions/05-dev/pure-function-policy.md` — layer import rules (complements SOLID-D)
3. The current task file (`.pipeline/05-dev/tasks/T-NNN.md`) for scope and acceptance criteria

## When to apply

- **Before starting a task**: re-read `architecture-principles.md` when the task touches a new module boundary
- **After implementing a task**: review all new and modified files before marking the task done
- **In code review**: flag any violation found during the `pr-review-toolkit:review-pr` flow

## Review procedure

For each file created or modified by the task:

### KISS checks

- Is there an abstraction (factory, strategy, registry) with only one current caller? → **KISS-rule-2 violation**
- Is there a configuration knob with no current consumer? → **KISS-rule-3 violation**
- Could a function replace a class here? → flag as **KISS-rule-1** suggestion

### SOLID checks

- **S**: Does this module/class have more than one reason to change? → **SOLID-S violation**
- **O**: Is a shared module being edited to add a new case (switch, if-chain) instead of adding a new module? → **SOLID-O violation**
- **L**: Does a subtype throw on inputs the supertype accepts? → **SOLID-L violation**
- **I**: Does a consumer import more interface members than it uses? → **SOLID-I violation**
- **D**: Does domain or use-case code depend on a concrete platform class? → **SOLID-D violation** (also a pure-function-policy FAIL)

### Facade checks

- Does an index/barrel file re-export internal collaborators that callers should not reach directly? → **Facade violation**
- Do callers import past the module's entry point to reach internal files? → **Facade violation**

## Output format

Every finding MUST cite (a) the rule name from `architecture-principles.md` and (b) the file:line. No rule citation = not actionable.

```
SOLID-S violation in src/services/UserService.ts:1
  signUp, sendInvoice, and resizeAvatar in one class — three reasons to change.
  Split into auth/, billing/, media/ modules.

KISS-rule-2 violation in src/pricing/PricingStrategyFactory.ts:1
  Single caller, single strategy. Replace factory with a plain function.

Facade violation in src/checkout/index.ts:3
  Re-exports CartRepo and PricingService. Move back to internal;
  route callers through checkout() only.

KISS-rule-3 violation in src/config/featureFlags.ts:14
  enableExperimentalFeatures flag is false at every call site. Delete the knob.

SOLID-O violation in src/notifications/dispatch.ts:42
  switch on NotificationKind grows with each new channel. Add a new
  channel module and dispatch via a registry instead.

SOLID-I violation in src/reports/monthly.ts:7
  Imports 12 methods from DbClient but only calls query and count.
  Define a 2-method ReportQueries interface and depend on that.
```

## ADR amendment trigger

If a deliberate exception to these principles is taken, it MUST be recorded as an ADR amendment via the `amending-adrs-during-development` skill. Add an inline comment at the offender:

```typescript
// architecture-exempt: ADR-004 — generator table exceeds 30-line limit, reviewed 2026-05-08
```

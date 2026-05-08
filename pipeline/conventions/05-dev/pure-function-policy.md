# Pure Function Policy (Stage 05)

Defines the three-layer architecture every implementation in stage 05 follows. The validator and reviewers enforce the import direction and the purity of the domain layer.

## Layers

| Layer | Path convention | Purity | Allowed dependencies |
|---|---|---|---|
| Domain | `**/domain/**` | Pure only | Other `domain/**` modules |
| Use-cases | `**/use-cases/**` (or `**/orchestration/**`) | Impure but isolated | `domain/**`, platform interfaces (not implementations) |
| Platform | `**/platform/**`, `**/infra/**`, `**/adapters/**` | Impure | Anything; concrete IO lives here |

## Rules

### Domain layer
- MUST NOT import from `use-cases/**`, `platform/**`, `infra/**`, `adapters/**`, or any third-party SDK that performs IO (HTTP, DB, filesystem, sockets).
- MUST NOT call `Date.now()`, `Math.random()`, `crypto.randomUUID()`, `process.env`, `fetch`, `fs.*`, or platform globals.
- If clock or randomness is needed, the function takes a `now: () => Date` or `randomId: () => string` parameter.
- Every file under `domain/**` has a sibling `*.test.*` file. The unit test runs without a sandbox: no fs, no network, no fakes other than injected deps.

### Use-cases layer
- MAY orchestrate domain calls and platform calls. MUST depend on platform via interface, not concrete class.
- MUST NOT contain branching business logic that belongs in the domain. If the use-case has a `switch` on a domain enum, that switch belongs in `domain/**`.
- One use-case = one entry function. No god services.

### Platform layer
- The only place where `fetch`, DB drivers, `fs`, env vars, timers, push SDKs, and platform globals are imported.
- Implements interfaces declared by use-cases.
- No business rules. If a platform adapter computes a price, it is the wrong layer.

## Validation rules

The reviewer (and the AI quality gate) FAILS the merge gate if:

1. Any file under `**/domain/**` imports from `**/platform/**`, `**/infra/**`, `**/adapters/**`, or `**/use-cases/**`.
2. Any file under `**/domain/**` references a banned global: `Date.now`, `Math.random`, `crypto.randomUUID`, `process.env`, `fetch`, `XMLHttpRequest`, `setTimeout`, `setInterval`, `fs`, `path`, `os`, `localStorage`, `AsyncStorage`.
3. Any pure file under `**/domain/**` lacks a sibling `*.test.*`.
4. Any use-case file imports a concrete platform class instead of its interface.

## Why

- **Pure domain layer** is the only part of the codebase that can be tested fast and deterministically. Push the rules here and unit tests stop being flaky.
- **Banlist over guidelines** removes ambiguity. "Avoid side effects in domain" is rhetoric; "no `Date.now` in `domain/**`" is a grep.
- **Use-cases as interface consumers** is what makes the platform swappable (web ↔ mobile ↔ tests).
- **Sibling test file requirement** is the cheapest way to enforce coverage where it matters without a coverage tool.

# App Code Conventions (Stage 05.3)

Read this file before writing any code under `app/`. The implementation loop and the quality validators enforce every rule below. If a rule blocks you, stop and amend the relevant ADR — do not work around it.

Stack: React Native + Expo (managed workflow), TypeScript, Jest (`jest-expo`), `expo lint`, `tsc --noEmit`.

---

## 1. Layer structure

The app is split into three layers under `src/`. Imports flow **inward only**: platform → use-cases → domain. Domain knows nothing about the outside world; use-cases orchestrate; platform owns IO.

```
src/
├── domain/      pure functions, value objects, business rules. No IO.
├── use-cases/   orchestration. Calls domain + platform interfaces.
└── platform/    IO adapters: fetch, storage, expo-* SDKs, navigation.
```

Import direction rule (validator-enforced):

- `domain/**` may import only from `domain/**`.
- `use-cases/**` may import from `domain/**` and from platform **interfaces** (not concrete classes).
- `platform/**` may import anything; it is the only place concrete IO lives.

A `use-cases` file that imports a concrete class from `platform/**` is a hard-fail. Declare the interface inside the use-case package and let the platform module implement it.

---

## 2. Banned globals in `domain/**`

The validator greps for these tokens under `src/domain/**`. A match is a hard-fail.

- `Date.now`, `new Date()` with no argument
- `Math.random`, `crypto.randomUUID`
- `process.env`
- `fetch`, `XMLHttpRequest`
- `setTimeout`, `setInterval`
- `fs`, `path`, `os`
- `localStorage`, `AsyncStorage`

If a domain function needs the clock or randomness, **inject it**:

```ts
// src/domain/session/expire.ts
export function isExpired(token: Token, now: () => Date): boolean {
  return token.expiresAt.getTime() <= now().getTime();
}
```

```ts
// src/domain/cart/new-line.ts
export function newLine(sku: Sku, qty: number, randomId: () => string): CartLine {
  return { id: randomId(), sku, qty };
}
```

The use-case wires `() => new Date()` or `() => crypto.randomUUID()` at the call site.

---

## 3. Sibling test file rule

Every `.ts` file under `src/domain/**` has a `*.test.ts` next to it. No exceptions for "trivial" modules.

```
src/domain/pricing/
├── apply-discount.ts
└── apply-discount.test.ts
```

Tests run with no sandbox, no fakes other than the deps the function asks for. If a domain test needs `jest.mock`, the function under test is impure and belongs in `use-cases/**`.

---

## 4. File size and complexity caps

Hard-fail thresholds (validator blocks merge):

| Metric | Hard-fail |
|---|---|
| File length | > 300 LOC |
| Function length | > 30 LOC |
| Cyclomatic complexity | > 10 |
| Parameter count | > 4 |
| Nesting depth | > 3 |

Soft-warn (annotated, non-blocking) at 200 LOC files / 20 LOC functions / complexity 7 / 3 params / nesting 2.

LOC = non-blank, non-comment lines. Test files are exempt from function-length only — params and nesting still apply. If you genuinely need an exception, add an ADR amendment and an inline `// modularity-exempt: ADR-NNN` comment at the top.

---

## 5. Naming

- Files: `kebab-case.ts` for components, modules, hooks (`apply-discount.ts`, `cart-screen.tsx`).
- Functions and variables: `camelCase` (`applyDiscount`, `cartTotal`).
- Types, interfaces, React components: `PascalCase` (`type CartLine`, `function CartScreen()`).
- Tests: `*.test.ts` / `*.test.tsx`. Never `*.spec.ts`.
- Constants that are config: `SCREAMING_SNAKE_CASE` only when truly global; prefer typed config objects.

---

## 6. Imports

- Absolute imports via the `@/` alias (configured in `tsconfig.json`) are allowed and preferred for cross-module imports.
- Within a module, use relative imports (`./helpers`).
- **Never reach past a module's entry point.** Import `@/use-cases/checkout`, not `@/use-cases/checkout/internal/tax-calc`.
- Module facades (`index.ts`) export the public surface only. No re-exports of internals — if a caller needs it, route through the facade function.

```ts
// BAD
import { TaxCalculator } from '@/use-cases/checkout/internal/tax-calc';

// GOOD
import { checkout } from '@/use-cases/checkout';
```

---

## 7. TDD rule

Write the test first. Watch it fail. Then write the minimum code to make it pass.

1. Create `foo.test.ts` with the failing assertion.
2. Run `npm test -- foo.test` — confirm red.
3. Implement `foo.ts` to the smallest extent that turns it green.
4. Refactor only after green.

A commit that adds implementation without a corresponding test in the same diff (for `domain/**` and `use-cases/**`) is rejected at review.

---

## 8. Dependencies

- Framework versions (`expo`, `react`, `react-native`, `expo-router`, etc.) are **pinned exactly** as `create-expo-app` produced them. Do not upgrade ad-hoc.
- Adding any new runtime dependency that crosses a layer (state manager, networking client, persistence, navigation) requires an ADR amendment under `.pipeline/04-architecture/adr/`.
- Pure utility libs (date math, validation) may be added without an ADR if they live behind a domain or platform module and the package is < 50 KB minified.
- Never add a dep that duplicates one already present (e.g. don't add `axios` — `fetch` is already in platform).

---

## 9. Comments policy

- Comments explain **why**, never **what**. The code shows what.
- No multi-paragraph docstrings. One or two lines max above a function, only when the why is non-obvious.
- No `// TODO`, `// FIXME`, or `// XXX` left in changed files at task-done time. If it's worth keeping, file a ticket and reference its ID.
- Banned: redundant section banners (`// ===== HELPERS =====`), commented-out code, change-log comments (`// updated 2026-04-12 by ...`).

```ts
// BAD
// This function takes a price and a discount code and returns a price.
function applyDiscount(price: Money, code: string): Money { ... }

// GOOD
// Discount precedence is fixed-amount > percent; see ADR-007.
function applyDiscount(price: Money, code: string): Money { ... }
```

---

## 10. What to run before declaring a task done

All three commands must exit `0`:

```sh
npm test
npm run lint
npm run typecheck
```

- No skipped tests (`it.skip`, `xit`, `describe.skip`).
- No `// TODO` / `// FIXME` left in any file you touched.
- New `domain/**` files have sibling `*.test.ts`.
- The modularity report shows zero `FAIL:` lines.

---

## Code pattern examples

Three paired good-vs-bad snippets covering the rules most often violated above.

### Example 1 — Inject the clock into domain functions

```ts
// BAD — src/domain/session/expire.ts
export function isExpired(token: Token): boolean {
  return token.expiresAt.getTime() <= Date.now();
}
```

```ts
// GOOD — src/domain/session/expire.ts
export function isExpired(token: Token, now: () => Date): boolean {
  return token.expiresAt.getTime() <= now().getTime();
}
```

The good version is testable without `jest.useFakeTimers` — the test passes a stub `now`.

### Example 2 — Domain logic stays in the domain layer

```ts
// BAD — src/use-cases/checkout/checkout.ts
export async function checkout(cart: Cart, tier: Tier, repo: CartRepo) {
  let price = cart.subtotal;
  switch (tier) {
    case 'free': break;
    case 'pro': price = price * 0.9; break;
    case 'enterprise': price = price * 0.75; break;
  }
  await repo.save({ ...cart, total: price });
}
```

```ts
// GOOD — src/domain/pricing/tier-discount.ts
export function applyTierDiscount(price: Money, tier: Tier): Money {
  switch (tier) {
    case 'free': return price;
    case 'pro': return price * 0.9;
    case 'enterprise': return price * 0.75;
  }
}

// GOOD — src/use-cases/checkout/checkout.ts
export async function checkout(cart: Cart, tier: Tier, repo: CartRepo) {
  await repo.save({ ...cart, total: applyTierDiscount(cart.subtotal, tier) });
}
```

The switch on a domain enum belongs in `domain/**`; the use-case just orchestrates.

### Example 3 — Facade exposes one entry, not its collaborators

```ts
// BAD — src/use-cases/checkout/index.ts
export { CartRepo } from './cart-repo';
export { PricingService } from './pricing-service';
export { TaxClient } from './tax-client';
export { checkout } from './checkout';
```

```ts
// GOOD — src/use-cases/checkout/index.ts
export { checkout } from './checkout';
```

Callers route through `checkout()`; collaborators stay package-private and swappable.

---

## Before marking a task done — checklist

1. `npm test` exits 0; no `.skip` / `xit` in changed files.
2. `npm run lint` exits 0.
3. `npm run typecheck` exits 0.
4. Every new `src/domain/**` file has a sibling `*.test.ts`.
5. No banned globals under `src/domain/**`; injected `now` / `randomId` where needed.
6. No `// TODO` or `// FIXME` left in changed files; no internal re-exports leaked through facades.

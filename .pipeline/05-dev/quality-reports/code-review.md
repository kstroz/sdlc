---
stage: 05.7
diff-range: trunk...HEAD
agents-dispatched: [synthetic-aggregator]
generated: 2026-05-08
---

# Code Review — Stage 05.7

## FAIL

None.

## WARN
- [synthetic-aggregator] app/src/platform/http/tasksClient.ts:51 — type design / error handling: response body is cast to `RawPayload` with no runtime schema validation; a malformed server response will throw deep inside `.map()` rather than at the boundary. Consider a parse step (zod or hand-rolled guards) before `toBuilding`/`toTask`.
- [synthetic-aggregator] app/src/platform/http/devicesClient.ts:33 — error handling: `throw new Error(`devices/register failed: ${res.status}`)` discards the response body and produces an untyped error; callers cannot distinguish 401 from 503 without parsing the message string. Prefer a discriminated union return type consistent with `AuthClient.signIn`.
- [synthetic-aggregator] app/src/use-cases/processOutbox.ts:91 — code quality: `=== 'retried' ? 'retried' : 'permanentlyFailed'` collapses a typed enum into itself via string compare; rename the helper to return `RowOutcome` directly so the call site does not need the ternary. Minor — readability only.
- [synthetic-aggregator] app/src/use-cases/loadToday.ts:31 — simplification opportunity: cache-first read short-circuits before any TTL check; on a populated cache the network is never consulted. Acceptable per US-009 offline-first stance but worth a one-line comment pointing at the story so the why is explicit.
- [synthetic-aggregator] app/src/platform/storage/sessionStore.ts:7 — comment: the file lacks any marker that this is a dev-only adapter; readers landing here from the `SessionStore` interface have no in-source pointer to the ADR-002 amendment. Add a single `// dev-only; production swap per ADR-002 amendment` line.

## Notes
- [synthetic-aggregator] app/src/use-cases/completeTask.ts:99 — error handling and rollback shape are good: best-effort photo cleanup on transaction failure preserves the original error (matches the SOLID-D / silent-failure-hunter heuristic — original cause re-thrown, not swallowed).
- [synthetic-aggregator] app/src/types/result.ts:1 — `Result<T, E>` is uniformly applied across use-cases (signIn, blockTask, completeTask, loadToday); error variants are discriminated unions with `kind`. Type design is consistent.
- [synthetic-aggregator] app/src/domain/** — banned-globals rule (CLAUDE.md §2) holds across the diff: clock and randomId are injected; no `Date.now()`, `Math.random`, or `fetch` in domain.
- [synthetic-aggregator] test coverage: every `src/domain/**` and `src/use-cases/**` file has a sibling `*.test.ts` (CLAUDE.md §3 sibling-test rule). Stub branch — coverage is breadth, not depth, of the integration paths; deferred deeper integration tests track with T-010 backend integration.
- [synthetic-aggregator] file-size and complexity caps (CLAUDE.md §4): no file in the diff exceeds 300 LOC; longest reviewed file is `completeTask.ts` at ~160 LOC.

## Clean
- [synthetic-aggregator] app/src/use-cases/blockTask.ts — clean: domain delegation, transactional persistence, typed error envelope.
- [synthetic-aggregator] app/src/use-cases/signIn.ts — clean: validation → auth → session store, no IO leak into domain, error union discriminated.
- [synthetic-aggregator] app/src/types/index.ts — clean: domain DTOs match data-model.md fields with appropriate nullability; no leakage of platform types.
- [synthetic-aggregator] app/src/platform/http/syncClient.ts — clean: header construction, idempotency-key plumbing, and method/path resolution are straightforward and testable.

# Security Review Report

## Summary
- endpoints-reviewed: 6
- pii-fields-reviewed: 6
- fail-count: 0
- warn-count: 4

## Findings

WARN: app/src/use-cases/signIn.ts:37 — AuthN/AuthZ not enforced server-side on this branch (item 1, item 2). The mobile client posts credentials and Bearer tokens to the documented endpoints in api-contracts.md (POST /auth/sign-in, GET /tasks/today, POST /tasks/{id}/complete, POST /tasks/{id}/block, POST /photos, POST /devices/register), but enforcement lives behind T-010 backend integration. Deferred to backend integration; reference ADR-005 (mediation lives on the backend).
WARN: app/src/platform/storage/sessionStore.ts:7 — secret handling: `createInMemorySessionStore` keeps the session token in a `Map` for the lifetime of the JS VM only (item 3). Production requires SecureStore swap, see ADR-002 amendment (in-memory store satisfies the same `SessionStore` interface; the production swap replaces the factory only).
WARN: app/src/platform/http/authClient.ts:21 — TLS posture is whatever `fetch` defaults to; certificate pinning is not configured on this branch (item 4). Deferred to backend integration; reference ADR-005. The Expo managed runtime defaults to HTTPS-only (no `cleartextTraffic` regression observed in app config).
WARN: app/src/platform/http/tasksClient.ts:51 — request bodies are not schema-validated before mapping (`raw.buildings.map(toBuilding)` trusts the shape) (item 5). Deferred to backend integration; the stub responses come from the in-memory test harness, so no untrusted input flows through this branch yet.

not applicable — item 2 IDOR scoping (no real backend on this branch; all reads/writes terminate in the in-memory `Database`/`Collection` adapters that are user-scoped by construction in tests).
not applicable — item 6/M9 binary protections (no native binary shipped on this branch; Expo managed workflow, no production build).
not applicable — item 6/M2 supply chain audit on this branch (no new runtime dependencies added; ADR-002 amendment defers the WatermelonDB install).
not applicable — item 7 dependency CVEs (`npm audit` requires the production install that ADR-002 amendment defers; no runtime deps were added on this branch).
not applicable — item 8 PII at-rest encryption and retention (User.username, User.displayName, User.sessionToken, Task.managerNotes, Building.streetAddress, Building.city are listed in data-model.md but no real PII flows through this branch; the in-memory store is dev-only and is replaced by the WatermelonDB SQLite store per ADR-002 amendment, which is where retention and at-rest encryption are owned).
not applicable — item 8 logs leaking PII (audited use-cases/* and platform/* on the diff: no `console.log`, no logger writes the username, sessionToken, or managerNotes; error envelopes carry `cause: unknown` opaquely without stringification).

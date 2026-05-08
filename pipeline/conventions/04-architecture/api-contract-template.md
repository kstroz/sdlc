# API Contract Template (Stage 04)

Defines the structure of `04-architecture/api-contracts.md`. Skills generating this artifact MUST produce a file matching this template exactly. The validator `pipeline/validators/check-arch.sh` enforces it before the gate.

## Required structure

`api-contracts.md` opens with frontmatter, then one entry per endpoint. Endpoint order follows the order screens introduce them.

```markdown
---
id: API-CONTRACTS-001
created: YYYY-MM-DD
version: 1
---

# API contracts

## <METHOD> <path>
- **Endpoint ID**: API-NN
- **Purpose**: <One sentence. The user-visible action this endpoint enables.>
- **Source screens**: S-NN — <interaction>, S-NN — <interaction>
- **Auth**: None | Bearer | Session | Service-to-service — <scope or role required>
- **Request**:
  - Headers: <list, or `None`>
  - Path/query params: <list, or `None`>
  - Body schema:
    ```json
    { "field": "type" }
    ```
- **Response 2xx**:
  - Status: 200 | 201 | 204
  - Body schema:
    ```json
    { "field": "type" }
    ```
- **Response errors** (≥ 1 required):
  - 4xx: <code> — <when it fires, which screen state consumes it>
  - 5xx: <code> — <when it fires, fallback behaviour>
- **Idempotency**: Yes (key: `<header>`) | No — <one-line rationale>
- **Rate limit**: <e.g. `60/min/user`, or `None`>
```

Path uses kebab-case. Body schemas use JSON with type names (not values) — full JSON Schema is out of scope for this stage.

## Validation rules

The validator FAILS the gate if any endpoint:

1. **Source screens missing** — every endpoint must reference at least one `S-NN` ID. Endpoints with no UI consumer are CRUD-by-default and must be cut.
2. **Auth field missing**. `None` is a valid value but must be stated.
3. **Response errors** lists fewer than 1 entry. Every endpoint declares at least one 4xx/5xx case.
4. **Method line** does not match `## (GET|POST|PUT|PATCH|DELETE) /<path>`.
5. **Idempotency** field absent. POST and PATCH without an idempotency answer block the gate.

## Why

- **Source screens enforced** is the single biggest defence against speculative APIs. If no screen calls it, do not document it.
- **Errors mandatory** because every error path is a UX decision. The screen author must know what state to render before the endpoint is implemented.
- **Idempotency surfaced early** prevents duplicate-payment bugs that only appear in production.
- **Rate limit at design time** stops the post-hoc retrofit that always lands the day before launch.

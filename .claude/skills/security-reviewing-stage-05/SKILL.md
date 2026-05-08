---
name: security-reviewing-stage-05
description: Use at Stage 05.6 after the impl-loop completes to audit the branch's code and artifacts for security defects and produce the security quality report that gates the merge
---

# Security Reviewing Stage 05

**Announce at start:** "I'm using the security-reviewing-stage-05 skill to produce the security quality report."

## Overview

Stage 05.6 is a dedicated security pass over the work produced by 05.3 (impl-loop). The global `security-review` plugin is generic; this skill is the project-specific driver that targets the artifacts and diff actually produced on this branch and writes the report shape consumed by `check-quality-thresholds.sh`.

## When to use

Run once, after 05.3 (impl-loop) reports green and before 05.7 (merge readiness). Re-run after any code change that touches an endpoint, a secret, a dependency, or PII storage.

## What to read first

1. `.pipeline/04-architecture/api-contracts.md` — every endpoint that must be checked for AuthN/AuthZ, input validation, transport.
2. `.pipeline/04-architecture/data-model.md` — fields classified as PII, retention rules, encryption-at-rest expectations.
3. `.pipeline/04-architecture/adr/` — ADRs touching auth, crypto, transport, dependencies, secret storage.
4. `git diff --name-only <base>..HEAD` and `git diff <base>..HEAD` — the actual code under review. Do not audit unchanged code.
5. `package.json` / lockfile and any platform manifest changed on the branch.

## Threat checklist

Walk every item. Each finding is one line; a category that does not apply gets one `not applicable — <reason>` line.

1. **AuthN at every endpoint** — for each endpoint in `api-contracts.md`, confirm an auth requirement is enforced server-side (not just documented). Unauthenticated endpoints must be explicitly listed as public in the contract.
2. **AuthZ at every endpoint** — object-level and field-level checks. Confirm tenant/user scoping on read, write, and delete. IDOR by parameter substitution is the default failure mode to look for.
3. **Secret handling on the device** — no secrets in source, in `.env` committed to the branch, in logs, or in client bundles. On-device secrets use the platform secure store per the relevant ADR.
4. **Transport security / TLS** — every outbound call uses HTTPS; certificate pinning state matches the ADR; no `allowArbitraryLoads` / `cleartextTraffic` regressions.
5. **Deserialisation in any new endpoint** — schema-validate all request bodies before use. No reflective construction from user input. No `eval`, no dynamic `require`, no prototype-pollution sinks.
6. **OWASP Mobile Top 10 mapped to the three-layer architecture** — for each of M1–M10, name the layer (`platform` / `domain` / `view`) where the mitigation lives in this branch and confirm the mitigation is present. The platform layer carries M1 (credentials), M2 (supply chain), M3 (auth), M5 (crypto), M9 (binary). Domain carries M4 (input/output validation) and M8 (security misconfiguration). View carries M7 (insufficient input validation at edge) and M10 (extraneous functionality).
7. **Dependency CVEs** — run `npm audit --audit-level=high` (and platform equivalents). Every HIGH or CRITICAL is a `FAIL:` unless waived in `_security-exceptions.json`.
8. **PII handling per GDPR** — for every field marked PII in `data-model.md`: lawful basis recorded, retention bounded, deletion path exists, transport encrypted, at-rest encryption matches the ADR, logs do not leak the field.

## What to produce

`.pipeline/05-dev/quality-reports/security-review.md`

Required structure:

```markdown
# Security Review Report

## Summary
- endpoints-reviewed: <N>
- pii-fields-reviewed: <N>
- fail-count: <N>
- warn-count: <N>

## Findings

FAIL: src/api/orders.ts:88 — endpoint POST /orders missing AuthZ on tenant_id (item 2)
WARN: src/lib/http.ts:14 — TLS pinning disabled in dev build only (item 4)
not applicable — item 6/M9 binary protections (web-only branch, no native binary)
```

If there are no findings, write:

```markdown
## Findings
None.
```

## Example output

```markdown
# Security Review Report

## Summary
- endpoints-reviewed: 6
- pii-fields-reviewed: 4
- fail-count: 2
- warn-count: 1

## Findings

FAIL: src/api/tasks.ts:142 — endpoint POST /tasks/{id}/complete missing AuthZ on tenant_id; any authenticated user can complete another tenant's task (item 2)
FAIL: src/middleware/auth.ts:67 — PII field `email` written to error log on 401 response, leaking address on every failed login (item 8)
WARN: src/lib/http-client.ts:23 — TLS pinning disabled in dev build via `__DEV__` guard; verify build pipeline cannot ship this flag to production (item 4)
not applicable — item 6/M9 binary protections (web-only branch, no native binary shipped)
not applicable — item 5 deserialisation sinks (no new endpoints accept request bodies on this branch; only GET endpoints added)
```

If the branch is clean, the `## Findings` block contains the single line `None.` and `fail-count` / `warn-count` are both `0`.

## Validate

The report lives in `.pipeline/05-dev/quality-reports/` and is therefore picked up by:

```bash
bash pipeline/validators/check-quality-thresholds.sh .pipeline/05-dev/quality-reports
```

`FAIL:` lines block the merge gate per `quality-gate-criteria.md`. Fix every FAIL (or record a waiver in `_security-exceptions.json` per criterion 6) and re-run until exit 0.

## Why this exists

- **Per-project, not generic.** The global `security-review` plugin does not know about `api-contracts.md`, the three-layer architecture, or our PII classification — those are where this codebase actually fails.
- **Report shape matches the gate.** `FAIL:` / `WARN:` / `not applicable` lines plug straight into `check-quality-thresholds.sh` with no translation step.
- **Closed checklist.** A bounded list of threats is auditable; "think about security" is not.
- **Diff-scoped.** Auditing unchanged code on every branch wastes the review budget; the threats live in what 05.3 just changed.

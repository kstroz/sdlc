# NFR Categories (Stage 02)

Lists the non-functional requirement categories that `02-spec/non-functional-requirements.md` must address. Each category demands measurable targets — vague NFRs are worse than missing ones because they create the illusion of coverage.

## Required structure

`non-functional-requirements.md` opens with frontmatter and contains one `## ` section per category below, in this order. Each section has bullets for the listed dimensions, each bullet a number with units.

```markdown
---
id: NFR-001
created: YYYY-MM-DD
version: 1
---

# Non-Functional Requirements

## Performance
- <dimension>: <target with units and timeframe>
...
```

## Categories and required dimensions

| Category | Required dimensions | Example measurable target |
|---|---|---|
| Performance | startup time, screen-to-screen latency, action-to-feedback latency | App cold start ≤ 2.0s p95 on iPhone 12 |
| Security | authentication, data-at-rest, data-in-transit, secret handling | All API traffic over TLS 1.3; no secrets in source |
| Accessibility | WCAG level, screen-reader coverage, dynamic-type support, contrast | WCAG 2.2 AA on all primary screens |
| Observability | error reporting, logging, metrics, alerts | Sentry crash-free sessions ≥ 99.5% (7-day) |
| Scalability | concurrent users, request volume, data volume | Sustains 10k DAU at < 200ms p95 API latency |
| Reliability | uptime, recovery time, data-loss tolerance | API uptime ≥ 99.9% monthly; RPO ≤ 5 min |
| Privacy | data minimisation, consent, retention, deletion | User data deletion completes within 30 days of request |
| Localization | supported languages, RTL, currency/date formats | UI in PL + EN at launch; date formats follow user locale |

## Validation rules

The validator FAILS the gate if:

1. **Frontmatter** missing at top of `non-functional-requirements.md`.
2. **Any of the eight categories** absent as a `## ` heading (literal heading text).
3. **Any bullet** under a category lacks a numeric value. The validator counts digits per bullet.

## Why

- **Eight categories cover what stage 04 will be asked at architecture review.** Missing any one of them produces a predictable late-stage rework: a privacy policy bolted on after the data model is set, an accessibility pass squeezed into the last sprint.
- **Numeric targets** are non-negotiable. "Fast" cannot be tested; "≤ 200ms p95" can. The validator enforces numbers, not language.
- **Order is fixed** so reviewers can scan multiple specs side by side without hunting for sections.
- **Localization is included by default** because adding it later usually means rewriting screens, not translating strings.

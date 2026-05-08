# Stack Preferences Template (Stage 01 input)

Defines the optional file `.pipeline/01-idea/_inputs/stack-preferences.md`. The forker drops this file when they have an opinion on the technology choice **before** Stage 04 runs. The Stage 04 architecture skill reads it and weighs the preferences against the NFRs in the trade-off matrix.

This file is **input**, not an artifact. There is no validator. The architect at Stage 04 may overrule any preference if the NFRs do not support it (and must record the override in an ADR).

## When to drop this file

- The team has standardised on a stack and does not want the architect to re-evaluate from scratch.
- A constraint exists outside the spec (existing license, hiring profile, security audit) that the brief did not capture.
- A previous branch already chose the stack and we want continuity.

If none of the above is true, leave this file out — Stage 04 will choose freely from a balanced shortlist.

## Required structure

```markdown
---
id: STACK-PREF-001
created: YYYY-MM-DD
version: 1
---

# Stack preferences

## Mobile
- preferred: <e.g. React Native + Expo, Flutter, native iOS Swift, native Android Kotlin, Capacitor>
- alternatives acceptable: <comma-list, or `none`>
- reason: <one-line constraint or preference>
- override allowed: <yes | no — `no` means architect MUST use the preferred or escalate>

## Backend
- preferred: <e.g. Node.js + Express, Python + FastAPI, Go + chi, Java + Spring, "reuse existing">
- alternatives acceptable: <list>
- reason: <…>
- override allowed: <yes | no>

## Data
- preferred: <e.g. Postgres + Watermelon on device, Postgres + Realm, MongoDB Atlas, SQLite-only>
- alternatives acceptable: <list>
- reason: <…>
- override allowed: <yes | no>

## Infra
- preferred: <e.g. EAS Build + Vercel, AWS, GitHub Actions + Fly.io, Docker on bare-metal>
- alternatives acceptable: <list>
- reason: <…>
- override allowed: <yes | no>

## Observability
- preferred: <e.g. Sentry, Datadog, self-hosted ELK, OpenTelemetry + Grafana>
- alternatives acceptable: <list>
- reason: <…>
- override allowed: <yes | no>
```

A layer that is `Not applicable` per `idea.md` Platforms section can be omitted from this file (e.g. omit Backend if `backend: no`).

## How Stage 04 consumes this file

When `selecting-tech-stack` runs, it reads:

1. `.pipeline/02-spec/prd.md` — NFRs (the hard constraints).
2. `.pipeline/01-idea/idea.md` — Platforms section (which layers are in play).
3. `.pipeline/01-idea/_inputs/stack-preferences.md` — this file, if present.

For each layer:
- If preferences exist with `override allowed: no`, the architect uses the preferred choice and skips the trade-off matrix unless the NFRs make it impossible — in that case, escalate via `requesting-customer-input`.
- If preferences exist with `override allowed: yes`, the architect lists the preferred choice as the first alternative in the trade-off matrix and weights NFR fit normally. The chosen option may be the preferred one or a different one with documented reasoning.
- If no preferences exist for a layer, the architect picks from a balanced shortlist and records all reasoning in the ADR.

## Why this exists

- **Forker has knowledge the brief does not capture.** Hiring profile, license fit, prior commitments — the architect cannot derive these from a transcript. A structured preferences file lets that knowledge enter the pipeline without polluting the spec.
- **Override flag is honest.** Many "preferences" are actually requirements; this template forces the forker to say so.
- **Optional, not required.** A truly greenfield project should leave this file out and trust the architect to evaluate.

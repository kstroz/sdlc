# ADR Template (Stage 04)

Defines the structure of one ADR file at `04-architecture/adr/ADR-NNN-<slug>.md`. Format follows the [adr.github.io](https://adr.github.io/) Nygard short form, extended with NFR links. The validator `pipeline/validators/check-arch.sh` enforces it before the gate.

## Required structure

```markdown
---
id: ADR-NNN
title: <Short imperative — e.g. "Use Postgres for primary store">
status: proposed | accepted | superseded
created: YYYY-MM-DD
supersedes: ADR-NNN | None
superseded-by: ADR-NNN | None
related-nfrs: NFR-NN, NFR-NN
---

# ADR-NNN — <Title>

## Context
<2–6 sentences. Forces, constraints, NFRs in play. State the problem before the decision. No solution language here.>

## Decision
<1–3 sentences. The choice, in active voice. "We use X." Not "We will probably consider X.">

## Consequences
**Positive**
- <bullet — concrete benefit, traceable to an NFR or constraint>
- ...

**Negative**
- <bullet — concrete cost, what we are giving up, what new risk we accept>
- ...

## Alternatives Considered
- **<Alternative 1>** — <one paragraph. Why it was rejected. Reference an NFR or constraint.>
- **<Alternative 2>** — <one paragraph. Why it was rejected. Reference an NFR or constraint.>
```

Filename: `ADR-NNN-<kebab-slug>.md`, where `NNN` is zero-padded and unique. Slug derives from the title, lowercase, dashes, no stopwords.

## Validation rules

The validator FAILS the gate if any ADR file:

1. **Frontmatter** missing `id`, `title`, `status`, `created`, `related-nfrs`.
2. **Status** is not one of `proposed`, `accepted`, `superseded`.
3. **Required H2 sections** missing: `Context`, `Decision`, `Consequences`, `Alternatives Considered`.
4. **Consequences** lacks both a `**Positive**` and a `**Negative**` block. One-sided ADRs are rejected.
5. **Alternatives Considered** has fewer than 2 bullets. A decision with one alternative is not a decision; it is a default.
6. **Superseded** ADRs without a `superseded-by` field, or vice versa.

## Why

- **Both consequences mandatory** — the most common ADR failure is listing only the upside. An honest negative section is the artifact's main value to future maintainers.
- **Two alternatives minimum** forces real comparison. "We chose X because reasons" is not an architectural decision; it is an opinion.
- **NFR link** ties the decision to the spec stage and makes the ADR auditable. If no NFR maps, the decision is premature.
- **Append-only files** mean an ADR is never edited after acceptance — it is superseded by a new one. This preserves the history of how the system reasoned over time.

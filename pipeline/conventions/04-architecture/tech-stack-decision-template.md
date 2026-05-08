# Tech Stack Decision Template (Stage 04)

Defines the structure of `04-architecture/tech-stack.md`. Skills generating this artifact MUST produce a file matching this template exactly. The validator `pipeline/validators/check-arch.sh` enforces it before the gate.

## Required structure

`tech-stack.md` opens with frontmatter, then one entry per layer. All five layers are mandatory; an empty layer must be filled with `Not applicable — <one-line reason>` and still list its decision.

```markdown
---
id: TECH-STACK-001
created: YYYY-MM-DD
version: 1
---

# Tech stack

## Mobile
- **Choice**: <e.g. React Native 0.74>
- **ADR**: [ADR-NNN](./adr/ADR-NNN-<slug>.md)
- **Alternatives evaluated** (≥ 2):
  - <Alt 1> — <one-line reason rejected>
  - <Alt 2> — <one-line reason rejected>
- **Trade-off matrix**:
  | Criterion (NFR) | Chosen | <Alt 1> | <Alt 2> |
  |---|---|---|---|
  | NFR-NN: cold start ≤ 2s | ✅ | ⚠️ | ❌ |
  | NFR-NN: dev velocity | ✅ | ✅ | ⚠️ |
- **Constraints accepted**: <bullet list of what this choice forces on us>

## Backend
<same structure>

## Data
<same structure — primary store + cache + analytics if applicable>

## Infra
<same structure — runtime, CI, deploy target>

## Observability
<same structure — logs, metrics, traces, error reporting>
```

Use `✅` for "satisfies", `⚠️` for "partial", `❌` for "fails". Every criterion row in the matrix MUST reference an NFR ID.

## Validation rules

The validator FAILS the gate if:

1. **Any of the five layers missing**: `## Mobile`, `## Backend`, `## Data`, `## Infra`, `## Observability`.
2. **Choice line absent** in any layer.
3. **ADR link missing** — every layer's chosen tech must link to an `ADR-NNN` file in `./adr/`.
4. **Fewer than 2 alternatives** listed in any layer.
5. **Trade-off matrix** absent or with no criterion row referencing an `NFR-NN` ID.
6. **Constraints accepted** absent. The literal `None` is allowed.

## Why

- **All five layers required** — the common failure is to document the chosen language and call it a stack. Skipping observability or infra at this stage is how production goes dark on day one.
- **NFR-anchored matrix** stops the "we picked X because we like X" decision. Each row maps a tech property to a measured requirement.
- **ADR per choice** keeps `tech-stack.md` short and the reasoning audit-trailed. If a tech is replaced, only one ADR is superseded — the matrix cell flips.
- **Constraints accepted** forces the team to write down what the choice costs. A stack without a cost section was not actually evaluated.

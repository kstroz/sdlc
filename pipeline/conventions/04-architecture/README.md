# Stage 04 — Architecture

Conventions for the architecture stage. Stage 04 is the last pre-development stage. It consumes stage 02 outputs (glossary, personas, journeys, requirements, NFRs) and stage 03 outputs (screens, ux-flows) and produces four artifacts that feed code scaffolding:

- `architecture.md` — high-level system overview written by the ADR skill.
- `tech-stack.md` — chosen technology per layer with trade-offs and ADR links.
- `data-model.md` — entities, fields, relationships, traced to glossary terms and journeys.
- `api-contracts.md` — endpoints, schemas, errors, traced to screens.
- `adr/ADR-NNN-<slug>.md` — one file per decision.

The validator `pipeline/validators/check-arch.sh` enforces these conventions before the gate.

## Templates

| File | Defines |
|---|---|
| `data-model-template.md` | Required structure of an entity entry in `data-model.md`. |
| `api-contract-template.md` | Required structure of an endpoint entry in `api-contracts.md`. |
| `adr-template.md` | Required structure of a single `ADR-NNN-<slug>.md` file. |
| `tech-stack-decision-template.md` | Required structure of a layer entry in `tech-stack.md`. |

## Authoring order

1. Generate `tech-stack.md` via the `selecting-tech-stack` skill. Each chosen tech triggers an ADR.
2. Generate `data-model.md` via the `deriving-data-model` skill (reads glossary + journeys + screens).
3. Generate `api-contracts.md` via the `deriving-api-contracts` skill (reads screens + ux-flows + data-model).
4. Generate `architecture.md` plus one `adr/ADR-NNN-<slug>.md` per decision via the `writing-architecture-decision-records` skill.
5. Run `pipeline/validators/check-arch.sh <path-to-04-architecture/>` until it passes.

## Why four artifacts plus ADRs

Each downstream consumer reads a different subset. Code scaffolding reads `data-model.md` for schema generation. The API gateway reads `api-contracts.md` for stub generation. CI and ops read `tech-stack.md` for runtime selection. ADRs are kept as small, append-only files because architectural decisions are revisited individually, not as a single document — superseding one ADR must not require rewriting the others.

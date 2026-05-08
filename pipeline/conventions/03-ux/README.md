# Stage 03 — UX Design

Conventions for the UX stage. Stage 03 consumes stage 02 outputs (personas, journeys, glossary, requirements) and produces four artifacts that feed stage 04 (architecture):

- `screens.md` — every screen the product needs, identified `S-NN`.
- `ux-flows.md` — transitions between screens, mapped to journey IDs.
- `interactions.md` — micro-interactions and required states per screen.
- `design-tokens.md` — semantic tokens for color, type, spacing, radius, shadow, motion.

The validator `pipeline/validators/check-ux.sh` enforces these conventions before the gate.

## Templates

| File | Defines |
|---|---|
| `screen-template.md` | Required structure of a single `S-NN` screen entry in `screens.md`. |
| `flow-notation.md` | Text notation used in `ux-flows.md` (no diagrams required). |
| `required-states.md` | Five mandatory states every screen must document in `interactions.md`. |
| `design-tokens-schema.md` | Required categories and per-category structure of `design-tokens.md`. |

## Authoring order

1. Generate `screens.md` and `ux-flows.md` together via the `mapping-journeys-to-screens` skill.
2. Generate `interactions.md` via the `documenting-interactions` skill.
3. Generate `design-tokens.md` via the `defining-design-tokens` skill.
4. Run `pipeline/validators/check-ux.sh <path-to-03-ux/>` until it passes.

## Why four artifacts and not one

Each downstream consumer reads a different subset. Stage 04 data modelling reads `screens.md` to derive entities. API contract design reads `ux-flows.md` to derive endpoints and error paths. The mobile build reads `design-tokens.md` for theme code-gen. Splitting keeps each artifact small enough to regenerate when one input changes.

# Traceability

Defines the required upstream links every artifact type must declare. Without these links, downstream artifacts drift from user value and the pipeline produces features no real user asked for.

## Rules

Every artifact MUST link to its upstream sources using the anchor format defined in `cross-references.md`. The link MUST appear inline within the artifact entry or in a dedicated `## Sources` / `Source:` field.

### Required upstream links

| Artifact | Where it lives | MUST link to | Minimum |
|---|---|---|---|
| Persona (`P-NN`) | `PRODUCT.md` | `_inputs/` source with line reference | ≥ 1 verbatim quote |
| Epic (`E-NN`) | `prd.md` | Idea (`I-NN`) via Overview section | 1 |
| User story (`US-NNN`) | `prd.md` | Persona (`P-NN`) in statement + `_inputs/` source | 1 persona + 1 source |
| NFR row | `prd.md` | `_inputs/` source with line reference | ≥ 1 |
| Screen (`S-NN`) | `screens.md` | User story (`US-NNN`) | ≥ 1 |
| Data-model entity | `data-model.md` | Glossary term (`PRODUCT.md#<term>`) and user story (`US-NNN`) | 1 glossary + ≥ 1 story |
| API endpoint | `api-contracts.md` | Screen (`S-NN`) that calls it | ≥ 1 |
| ADR (`ADR-NNN`) | `adr/` | NFR row ID or named constraint from `prd.md` | ≥ 1 |

### Notes

- An artifact MAY link to more than the minimum — extra links are encouraged.
- A link counts only if the target ID exists in the same branch's `.pipeline/` or in `PRODUCT.md`. Dangling links fail the traceability validator.
- The idea (`I-01`) sits at the root and has no upstream — its `## Sources` section traces to `_inputs/` files directly.
- `PRODUCT.md` personas are product-level and not re-declared per feature. Reference them by `P-NN` ID from any per-feature artifact.

## Why

- Stories without a named persona have no accountable user. The link forces the author to commit to who benefits.
- Stories without a source line are invented requirements. The `_inputs/` reference keeps the PRD grounded in real client evidence.
- Screens without story links are designer-driven scope creep. Every screen must serve at least one acceptance criterion.
- API endpoints without a calling screen reveal speculative backend work. The link kills dead-code-by-design before it is built.
- ADRs without an NFR or constraint are opinions, not decisions. The link forces the trade-off to be measurable.

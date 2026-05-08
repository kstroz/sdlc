# Traceability

Defines the required upstream links every artifact type must declare. Without these links, downstream artifacts drift from user value and the pipeline produces features no real user asked for.

## Rules

Every artifact MUST link to its upstream sources using the anchor format defined in `cross-references.md`. The link MUST appear in a section named `## Upstream` (or inline within the artifact entry, for table-style artifacts like FR lists).

### Required upstream links

| Artifact | Stage | MUST link to | Minimum |
|---|---|---|---|
| Persona (`P-NN`) | 02 | JTBD entries (`JTBD-NN`) | ≥ 1 |
| User journey (`J-NN`) | 02 | Persona entries (`P-NN`) | ≥ 1 |
| Functional requirement (`FR-NNN`) | 02 | User journey entries (`J-NN`) | ≥ 1 |
| Non-functional requirement (`NFR-NNN`) | 02 | Idea (`I-NN`) or constraint section | ≥ 1 |
| Screen (`S-NN`) | 03 | User journey step (`J-NN` heading) | ≥ 1 |
| Data-model entity | 04 | Glossary term (`glossary.md#<term>`) and journey (`J-NN`) | 1 glossary + ≥ 1 journey |
| API endpoint | 04 | Screen (`S-NN`) that calls it | ≥ 1 |
| ADR (`ADR-NNN`) | 04 | NFR (`NFR-NNN`) or named constraint | ≥ 1 |

### Notes

- An artifact MAY link to more than the minimum — extra links are encouraged.
- A link counts only if the target ID exists in the same branch's `.pipeline/`. Dangling links fail the traceability validator.
- The idea (`I-01`) sits at the root and has no upstream — its `## Sources` section serves the same purpose against external inputs.

## Why

- Personas without JTBDs become demographic decoration. Forcing the link makes every persona answer "what does this person hire the product to do?".
- FRs without journeys produce a feature pile that nobody walks through end-to-end. Each FR must serve a step a real persona takes.
- Screens without journey steps are designer-driven art, not product. The link makes the design defensible.
- API endpoints without a calling screen reveal dead code paths before they get built.
- ADRs without an NFR or constraint are opinions, not decisions. The link forces the trade-off to be measurable.

The traceability validator (`pipeline/validators/check-traceability.sh`) walks the `.pipeline/` directory, parses these links, and fails the gate if any required link is missing or dangling.

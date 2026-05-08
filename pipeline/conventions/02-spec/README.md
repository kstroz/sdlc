# Stage 02 — Specification (PRD)

Conventions for the Specification stage. Stage 02 transforms the idea from stage 01 and
research from client interviews into a PRD that product, design, and engineering can act on.

Personas and glossary are **product-level artifacts** that live in `PRODUCT.md` at the repo
root — they are created once via `/generate-product` and referenced by ID (`P-NN`) from
the PRD. Do not redefine personas or glossary terms inside the PRD.

## Template

| File | Artifact it governs |
|---|---|
| `prd-template.md` | `.pipeline/02-spec/prd.md` — epics, user stories, NFRs, out-of-scope |

## Required artifact at the gate

Stage 02 passes when `.pipeline/02-spec/prd.md` exists and conforms to `prd-template.md`.
`pipeline/validators/check-spec.sh` enforces this before the gate.

## Inputs directory

Source material (transcripts, research notes, support tickets) lives in
`.pipeline/02-spec/_inputs/`. Every user story must trace to a line in a file there
or in `.pipeline/01-idea/_inputs/`.

## ID scheme

- `E-NN` — epics (e.g. `E-01`, `E-02`)
- `US-NNN` — user stories, numbered globally across all epics (e.g. `US-001`, `US-042`)
- `NFR-NN` — non-functional requirements in the NFR table
- `P-NN` — personas, referenced from `PRODUCT.md` (not defined here)

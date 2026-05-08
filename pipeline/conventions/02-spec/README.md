# Stage 02 — Specification

Conventions for the Specification stage. Stage 02 produces two types of artifact:

- **`prd.md`** — feature brief: problem overview, epics index, NFRs, out-of-scope.
- **`stories/US-NNN-<slug>.md`** — one file per user story, with statement, acceptance criteria, and source reference. Maps 1:1 to a Jira ticket.

Personas and glossary are **product-level** — they live in `PRODUCT.md` at the repo root,
created once via `/generate-product`. Reference personas by `P-NN` ID from stories.

## Templates

| File | Artifact |
|---|---|
| `prd-template.md` | `.pipeline/02-spec/prd.md` |
| `story-template.md` | `.pipeline/02-spec/stories/US-NNN-<slug>.md` |

## Required artifacts at the gate

`pipeline/validators/check-spec.sh` enforces:

1. `prd.md` exists and conforms to `prd-template.md`.
2. `stories/` directory exists with at least one `US-NNN-*.md` file.
3. Every `US-NNN` referenced in the prd.md epics table has a matching story file.
4. Every story file conforms to `story-template.md`.

## ID scheme

- `E-NN` — epics, defined in `prd.md` (e.g. `E-01`, `E-02`)
- `US-NNN` — stories, one file each (e.g. `US-001`, `US-042`)
- `NFR-NN` — non-functional requirements in the prd.md NFR table
- `P-NN` — personas, referenced from `PRODUCT.md`

## Inputs directory

Source material lives in `.pipeline/02-spec/_inputs/`. Every story `## Source` field
must trace to a line in a file there or in `.pipeline/01-idea/_inputs/`.

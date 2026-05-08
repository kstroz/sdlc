# Cross-references

Defines how artifacts link to each other across stages. Validators and downstream skills rely on these IDs to detect missing or broken links.

## Rules

- **ID prefixes** are fixed across all artifacts:
  - `I-NN` — ideas (stage 01), in `.pipeline/01-idea/idea.md`
  - `P-NN` — personas (product-level), in `PRODUCT.md` at repo root
  - `E-NN` — epics (stage 02), in `.pipeline/02-spec/prd.md` epics table
  - `US-NNN` — user stories (stage 02), one file each in `.pipeline/02-spec/stories/`
  - `NFR-NN` — non-functional requirements (stage 02), in `.pipeline/02-spec/prd.md` NFR table
  - `S-NN` — screens (stage 03), in `.pipeline/03-ux/screens.md`
  - `ADR-NNN` — architecture decisions (stage 04), in `.pipeline/04-architecture/adr/`
- **IDs are stable.** Once assigned, an ID does not change even if the artifact is renamed or rewritten. New version, same ID.
- **IDs are unique within their type** across the whole branch's `.pipeline/` directory.
- **Anchor format** for cross-stage links: relative path + section anchor.
  - `[US-003](.pipeline/02-spec/prd.md#us-003)` — link from a screen to a story.
  - `[S-02](.pipeline/03-ux/screens.md#s-02)` — link from an API contract to a screen.
  - `[P-01](PRODUCT.md#p-01)` — link from the PRD to a persona.
- **Anchor target** is the H2/H3/H4 heading containing the ID. Each entry MUST start its heading with the ID, e.g. `#### US-003 — Offline task completion`. The anchor is then `#us-003`.
- **Forward references are forbidden.** A stage-02 artifact MUST NOT link to a stage-04 ADR. Links flow from later stages back to earlier ones.
- **External links** (Jira, Confluence, Figma) are allowed but do NOT count as traceability links — only `.pipeline/` paths satisfy the traceability validator.

## Why

- Stable IDs make `git diff` reviews trivial: a renamed story is still the same story.
- Relative paths with section anchors mean links survive repo moves and render in any markdown viewer (GitLab MR, IDE, GitHub mirror).
- Forward references would create cycles in the dependency graph and break the gate ordering.
- The fixed prefix set means a regex (`US-\d{3}`, `E-\d{2}`) finds every reference of a given type — used by `check-traceability.sh` and the gate-comment generator.

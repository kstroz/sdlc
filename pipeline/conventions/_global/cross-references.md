# Cross-references

Defines how artifacts link to each other across stages. Validators and downstream skills rely on these IDs to detect missing or broken links.

## Rules

- **ID prefixes** are fixed across all artifacts:
  - `I-NN` — ideas (stage 01)
  - `P-NN` — personas (stage 02)
  - `JTBD-NN` — jobs-to-be-done (stage 02)
  - `J-NN` — user journeys (stage 02)
  - `FR-NNN` — functional requirements (stage 02)
  - `NFR-NNN` — non-functional requirements (stage 02)
  - `S-NN` — screens (stage 03)
  - `ADR-NNN` — architecture decisions (stage 04)
- **IDs are stable.** Once assigned, an ID does not change even if the artifact is renamed or rewritten. New version, same ID.
- **IDs are unique within their type** across the whole branch's `.pipeline/` directory.
- **Anchor format** for cross-stage links: relative path + section anchor.
  - `[J-03](../03-ux/user-journeys.md#j-03)` — link from a screen to a journey.
  - `[FR-014](../02-spec/functional-requirements.md#fr-014)` — link from an ADR to an FR.
- **Anchor target** is the H2/H3 heading containing the ID. Each entry MUST start its heading with the ID, e.g. `### J-03 — Bedtime audio playback`. The anchor is then `#j-03`.
- **Forward references are forbidden.** A stage-02 artifact MUST NOT link to a stage-04 ADR. Links flow from later stages back to earlier ones.
- **External links** (Jira, Confluence, Figma) are allowed but do NOT count as traceability links — only `.pipeline/` paths satisfy the traceability validator.

## Why

- Stable IDs make `git diff` reviews trivial: a renamed FR is still the same FR.
- Relative paths with section anchors mean links survive repo moves and render in any markdown viewer (GitLab MR, IDE, GitHub mirror).
- Forward references would create cycles in the dependency graph and break the gate ordering — stage 02 cannot depend on stage 04 because stage 04 does not exist yet when stage 02 is approved.
- The fixed prefix set means a regex (`I-\d{2}`, `FR-\d{3}`) finds every reference of a given type — used by `check-traceability.sh` and the gate-comment generator.

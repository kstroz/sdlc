# Global conventions

Rules applied across every stage. Skills consume these in addition to their stage-specific conventions.

## Files

- `writing-style.md` — tone, language (English), terseness, banned phrases.
- `cross-references.md` — ID prefixes (`I-NN`, `P-NN`, `JTBD-NN`, `J-NN`, `FR-NNN`, `NFR-NNN`, `S-NN`, `ADR-NNN`) and the anchor format for cross-stage links.
- `traceability.md` — required upstream links per artifact type. Enforced by `pipeline/validators/check-traceability.sh`.
- `markdown-rules.md` — frontmatter requirements, heading hierarchy, code-block style, bullet character, no inline HTML.

Stage-specific conventions live in `pipeline/conventions/<stage>/` and reference these files rather than duplicating them.

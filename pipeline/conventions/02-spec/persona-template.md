# Persona Template (Stage 02)

Defines one persona inside `02-spec/personas.md`. Personas are evidence-based user archetypes derived from research in `_inputs/`. They are not marketing avatars. The validator `pipeline/validators/check-spec.sh` enforces structure and the JTBD link.

## Required structure

`personas.md` opens with frontmatter, then lists personas in priority order. Each persona uses this block:

```markdown
---
id: PERSONAS-001
created: YYYY-MM-DD
version: 1
---

# Personas

## P-01 — <Name>
- **Role**: <occupation or relationship to product, e.g. "Parent of child aged 3–7">
- **Context**: <2–3 sentences describing the situation in which they meet the product>
- **Goals**: <bullet list, each goal links to a JTBD: e.g. "Quick bedtime routine — JTBD-02">
  - ...
- **Frustrations**: <bullet list of current pains, each with a `_inputs/` source>
  - ...
- **Tech literacy**: Low | Medium | High — <one-line justification>
- **Quote**: <verbatim line from `_inputs/<file>.md:L<line>` in italics. No paraphrasing.>
- **JTBD links**: JTBD-NN, JTBD-NN
```

At least one persona is required. There is no upper bound, but more than five is a smell — collapse near-duplicates.

## Validation rules

The validator FAILS the gate if:

1. **Frontmatter** missing at top of `personas.md`.
2. **Persona ID** does not match the regex `P-[0-9]{2}`.
3. **JTBD links** field absent or empty. Every persona links to ≥ 1 JTBD.
4. **Quote** field missing the `_inputs/<file>.md:L<line>` source reference. The text between the source and the next field must be a verbatim line from that file.
5. **Tech literacy** value is not one of `Low`, `Medium`, `High`.
6. **Goals** has fewer than 1 bullet, or any goal bullet without a `JTBD-` reference.

## Why

- **Verbatim quote with source** is the single most effective check against invented personas. If you cannot find a real sentence from a real person, the persona is fiction and the spec is built on fiction.
- **JTBD link enforced** wires personas to the same outcome model journeys and requirements use. A persona with no JTBD has no purpose in the document.
- **Tech literacy** is a constraint on UX; surfacing it here saves a round-trip to stage 03.
- **Frustrations sourced** stops the common failure of listing generic pains ("hates ads") that nobody actually voiced in research.

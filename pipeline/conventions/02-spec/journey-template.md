# Journey Template (Stage 02)

Defines one user journey inside `02-spec/user-journeys.md`. A journey describes the sequence of steps a persona takes to accomplish a JTBD. It is the bridge between specification and UX: stage 03 turns each step into a screen.

## Required structure

```markdown
---
id: JOURNEYS-001
created: YYYY-MM-DD
version: 1
---

# User Journeys

## J-01 — <Short label>
- **Persona**: P-NN
- **JTBD**: JTBD-NN
- **Trigger**: <what makes the persona start the journey, sourced if non-obvious>
- **Steps**:
  1. <Action> — touchpoint: `<screen-or-surface placeholder, e.g. TBD-by-stage-03>`
  2. <Action> — touchpoint: `<placeholder>`
  3. <Action> — touchpoint: `<placeholder>`
- **Success state**: <observable outcome for the persona — links to JTBD outcome metric>
- **Alternate paths**:
  - <Error or branch> → <recovery step>
  - <Error or branch> → <recovery step>
```

At least one journey is required. There is no upper bound — long journeys split into shorter ones with cross-references.

## Validation rules

The validator FAILS the gate if:

1. **Frontmatter** missing at top of `user-journeys.md`.
2. **Journey ID** does not match `J-[0-9]{2}`.
3. **Persona** field absent or does not reference a `P-NN` ID.
4. **JTBD** field absent or does not reference a `JTBD-NN` ID.
5. **Steps** has fewer than 3 numbered items.
6. **Steps** contains an item without a `touchpoint:` annotation. Use the literal `TBD-by-stage-03` if unknown.
7. **Success state** absent.
8. **Alternate paths** absent. If genuinely none exist write the literal `None known.`.

## Why

- **Persona + JTBD link mandatory** — a journey divorced from either is just a flow diagram. The traceability from persona → JTBD → journey → requirement is the spine of the spec.
- **Touchpoint placeholder per step** lets stage 03 (UX) fill in real screen names without restructuring. The placeholder makes coverage gaps visible: every step must land somewhere.
- **Three-step minimum** is a smell test. A journey of one step is a click; a journey of two steps is a transition. Real jobs take at least three.
- **Alternate paths required** forces error thinking before stage 03 designs happy-path screens that fail in the field.

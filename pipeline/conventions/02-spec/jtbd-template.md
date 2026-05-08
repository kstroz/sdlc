# Jobs-To-Be-Done Template (Stage 02)

Defines one JTBD entry inside `02-spec/jobs-to-be-done.md`. A JTBD captures the outcome a user hires the product for, independent of solution. Personas, journeys, and requirements all link back to JTBDs, so JTBD wording is load-bearing.

## Required structure

```markdown
---
id: JTBD-001
created: YYYY-MM-DD
version: 1
---

# Jobs To Be Done

## JTBD-01 — <Short label>
- **Statement**: When <situation>, I want to <motivation>, so that <outcome>.
- **Outcome metric**: <observable signal that the job is done — e.g. "child falls asleep within 20 minutes">
- **Evidence**: `_inputs/<file>.md:L<line>` <pull-quote>
- **Linked personas**: P-NN, P-NN
```

At least one JTBD is required. The statement must use the exact connectors `When`, `I want to`, `so that` — they are checked verbatim by the validator.

## Validation rules

The validator FAILS the gate if:

1. **Frontmatter** missing at top of `jobs-to-be-done.md`.
2. **JTBD ID** does not match `JTBD-[0-9]{2,3}`.
3. **Statement** missing any of the three connectors `When`, `I want to`, `so that` (case-sensitive).
4. **Outcome metric** absent or phrased as a feature ("user can press button"). It must describe an observable change in the user's world.
5. **Evidence** missing `_inputs/<file>.md:L<line>` reference.
6. **Linked personas** absent — every JTBD must connect to ≥ 1 persona.

## Why

- **Three-part statement** is the canonical JTBD form. Skipping any part collapses the outcome ("so that") into the motivation ("I want to") and the spec loses the falsifiability that stage 01 worked to establish.
- **Observable outcome metric** is what makes a JTBD testable post-launch. "User feels in control" is not observable; "user resumes the same track within 5 seconds of reopening the app" is.
- **Evidence required** prevents the team from declaring outcomes the users never asked for.
- **Persona link required** keeps personas and JTBDs synchronised — a JTBD with no persona is unattributed; a persona with no JTBD has no job.

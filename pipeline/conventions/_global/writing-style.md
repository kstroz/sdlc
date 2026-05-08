# Writing style

Applies to every artifact in the pipeline.

## Language
- English. No code-switching to Polish or other languages inside artifacts. Domain terms in the source language stay in `glossary.md` as quotes; the artifact prose itself stays English.

## Tone
- Direct, declarative. Subject-verb-object.
- Active voice. ("The user opens the screen", not "The screen is opened by the user".)
- No marketing adjectives. Banlist: revolutionary, seamless, intuitive, robust, scalable (without a number), best-in-class, game-changing, world-class, cutting-edge.
- No hedging. Replace "we should probably consider" with "we will" or delete.

## Length
- Sections aim for the minimum sentences that convey the information. A 2-line section beats a 10-line section if both are complete.
- One idea per paragraph.

## Numbers
- Always with units. `100ms`, not `100`.
- Always with comparator. `≥ 99.5%`, not `99.5%`.
- Always with timeframe when behavioural. `30-day retention ≥ 25%`, not `retention ≥ 25%`.

## Forbidden constructs
- "etc." — list it or do not.
- "TBD", "TODO" — open the section or remove it. The pipeline does not allow placeholder artifacts past the gate.
- "We will probably need to consider…" — decide or push the decision to the next stage.

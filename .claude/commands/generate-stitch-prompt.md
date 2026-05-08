# Generate Stitch prompt

Produces a Google Stitch-ready UI description for every screen derived from the PRD.
Run this before `/stage-03`. The output is a prompt the user pastes into Stitch to
generate visual mockups. Stitch exports then go into `.pipeline/03-ux/_inputs/` so
`/stage-03` can read them as visual reference.

## What to read first

1. `.pipeline/02-spec/prd.md` — epics index and NFRs (required).
2. `.pipeline/02-spec/stories/` — all US-NNN story files, acceptance criteria (required).
   If either is missing, run `/stage-02` first and stop.
3. `PRODUCT.md` — personas for user context and NFRs for accessibility constraints.

## What to produce

Print a single Stitch prompt block. Do NOT write any files — the user copies this output
into Stitch manually.

Structure the output as follows:

```
## App context
<2–3 sentences: what the app is, who uses it, primary use environment.>

## Design system — Material Design 3
<Specify the M3 colour scheme: primary, secondary, tertiary, surface, error roles
with hex values derived from the product domain. Specify the type scale roles used
per surface (Display/Headline/Title/Body/Label). List the M3 components used across
the app (TopAppBar, NavigationBar, Card, FilledButton, Chip, Snackbar, etc.).
Note shape tokens (ExtraSmall/Small/Medium/Large/ExtraLarge) and their dp values.>

## Screens

### Screen N — <Screen name>
**User**: <persona role>
**Goal**: <one sentence>
**M3 components**:
- <exact M3 component name> — <one-line description>
**States to show**: <comma list — only those that apply>
**Critical UX rules**:
- <constraint traced to an acceptance criterion or NFR>

Repeat per screen. Order by natural user flow.
```

## Rules

- Use exact Material Design 3 component names: FilledButton not "primary button",
  TopAppBar (Small) not "header", FilterChip not "tag", Snackbar not "toast".
- Colour roles must follow M3 conventions: primary, onPrimary, primaryContainer,
  onPrimaryContainer, secondary, surface, onSurface, error, onError, outline.
- Every touch target ≥ 56dp (NFR-04 gloved use). State this explicitly per CTA.
- Offline is a first-class state, not an error — use an informational Snackbar or
  Banner, not an error colour.
- No invented design decisions — every constraint must trace to a story or NFR.
- Keep each screen description under 150 words.

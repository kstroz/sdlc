# Flow Notation (Stage 03)

Defines the text notation for `03-ux/ux-flows.md`. No diagrams required — the file is plain markdown so it diffs cleanly and feeds code-gen later.

## Required structure

```markdown
# UX Flows

## F-NN — <Flow name> (journey: J-NN)

<One sentence stating the user goal this flow serves. Must reference the same J-NN that
stage 02 assigned to the journey. One flow can map to one journey only.>

### Happy path

[S-01:Home] --tap on "Add"--> [S-02:AddMeal] --submit valid form--> [S-03:Confirmation]

### Branches

- **Empty state**: [S-02:AddMeal] --no items in catalog--> [S-02:AddMeal#empty]
- **Validation error**: [S-02:AddMeal] --invalid form--> [S-02:AddMeal#error]
- **Network error**: [S-02:AddMeal] --submit fails--> [S-02:AddMeal#error]
- **Auth required**: [S-02:AddMeal] --not logged in--> [S-10:Login] --success--> [S-02:AddMeal]
```

Notation rules:

- Each transition is one line: `[<source>] --<trigger>--> [<target>]`.
- `<source>` and `<target>` are `S-NN:ScreenName` (name copied from `screens.md` heading).
- `<trigger>` is the user action or system event in plain English. No quotes around the trigger; quote literal UI labels inside the trigger text.
- State suffixes use `#` — `#empty`, `#error`, `#loading`, `#success`. They map to the states declared in `interactions.md`.
- Branches list every non-happy-path transition. Each branch starts with a bold name from {`Empty state`, `Validation error`, `Network error`, `Auth required`, `Permission denied`, `Offline`} or a domain-specific one.

## Validation rules

The validator FAILS the gate if:

1. Any `## F-NN` heading lacks `(journey: J-NN)`.
2. A `J-NN` referenced does not exist in `02-spec/journeys.md` (cross-stage check, soft-warn only).
3. Any `S-NN` used in a transition does not appear as a heading in `screens.md`.
4. A flow has no `### Happy path` section.
5. A `### Branches` section exists with zero bullets — either remove the heading or fill it.

## Why these rules

- **Text over diagrams** — Mermaid and Figma exports rot. A markdown file diffs cleanly in MR review and survives a designer leaving the team.
- **One flow, one journey** — splitting a journey across multiple flows hides which screen sequence the user actually walks. Stage 02 already decomposed journeys; stage 03 inherits that decomposition.
- **Explicit branches** — the #1 cause of post-launch bug reports is "what happens when the network drops on screen X". Listing every error/empty branch in the flow itself surfaces the gap before code is written.
- **Trigger text matches UI label** — when QA reads `tap on "Add"`, the button's accessible label and the test selector should also read "Add". Drift here breaks E2E tests months later.

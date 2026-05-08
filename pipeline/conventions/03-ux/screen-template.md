# Screen Template (Stage 03)

Defines the required structure of one screen entry inside `03-ux/screens.md`. Every screen is a top-level H2 section. The validator `pipeline/validators/check-ux.sh` enforces it.

## Required structure

```markdown
## S-NN — <Screen name in domain language>

- **Role**: <one sentence describing the user-facing purpose. No solution language,
  no implementation detail. Example: "Lets a parent pick a bedtime track for the child.">
- **Source journey steps**: <comma-separated list of journey-step IDs from stage 02,
  e.g. J-01.2, J-03.1. At least one is required — a screen with no journey link is dead UI.>
- **Components**: <bullet list of named components with one-line responsibility each.
  No styling, no layout, no design language. Names must come from `02-spec/glossary.md`
  when a domain term exists. Example: "TrackList — renders the album's tracks in order.">
  - ...
  - ...
- **Required states**: see `required-states.md`. Per-screen detail lives in `interactions.md`.
- **Navigation**:
  - **Entry points**: <which screens or external triggers lead here. List as `S-NN` IDs
    or external sources like "deep link", "push notification".>
  - **Exit points**: <which screens or terminal events follow. List as `S-NN` IDs or
    "system back", "modal dismiss", "logout".>
```

Repeat the block per screen. Order screens by `S-NN` ascending.

## Validation rules

The validator FAILS the gate if:

1. Any screen heading omits the `S-NN —` prefix or duplicates an ID.
2. Any screen lacks the bold-keyed lines `Role`, `Source journey steps`, `Components`, `Required states`, `Navigation`.
3. `Source journey steps` is empty or contains no `J-NN` reference.
4. `Components` has fewer than 1 bullet item.
5. `Navigation` is missing either `Entry points` or `Exit points`.
6. A `S-NN` referenced in `ux-flows.md` does not exist in `screens.md`.

## Why these rules

- **Journey-step traceability** — a screen that no journey step needs is either premature scope or a sign that stage 02 is incomplete. The pipeline rejects it either way.
- **Components without styling** — stage 03 is product UX, not visual design. Mixing layout decisions in here makes screens.md churn every time the designer iterates.
- **Glossary-driven naming** — `Posiłki` not `MealsScreen`, `Bajka` not `StoryEntity`. The user-facing name in screens.md is the same name the user sees in the app, so QA scripts and journeys stay readable.
- **Explicit navigation lists** — every entry/exit must be enumerated. "Standard back" is not a navigation contract; either it returns to a specific `S-NN` or it terminates the flow.

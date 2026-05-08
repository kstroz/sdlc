# Required Screen States (Stage 03)

Every screen in `screens.md` MUST document the five required states in `interactions.md`. Optional states are encouraged but not gated. The validator `check-ux.sh` enforces presence of the required five.

## Required structure

For each `S-NN` heading in `interactions.md`, the following five state lines MUST appear, each as a bold-keyed bullet with a one-line description:

```markdown
## S-NN — <Screen name>

States:
- **Default**: <what the user sees when data loaded normally and no interaction is in flight.>
- **Loading**: <skeleton, spinner, progressive reveal — name the visual treatment, not the spinner asset.>
- **Empty**: <user has no data yet. Describe the empty content, the call-to-action, and where it leads.>
- **Error**: <network/validation/permission failure. Describe the message surface and recovery action.>
- **Disabled**: <screen or its primary action is non-interactive. Describe why (e.g. "form invalid", "offline read-only") and how the user is informed.>
```

## Optional states (recommend when applicable)

- **Success / Confirmation** — terminal state after a write, e.g. "meal saved". Include if the flow has a write side-effect.
- **Partial-data** — some data loaded, some still pending. Include if the screen aggregates multiple sources.
- **Offline** — separate from generic Error. Include if the screen has cached read-mode behaviour.

If you include an optional state, follow the same one-line bullet format.

## Validation rules

The validator FAILS the gate if, for any `S-NN` listed in `screens.md`:

1. The screen has no entry in `interactions.md`.
2. Any of `Default`, `Loading`, `Empty`, `Error`, `Disabled` is missing as a bold-keyed bullet under that screen.
3. A required state bullet is empty (just the bold key, no description).

## Why these rules

- **Empty + Error are the #1 source of QA escalations.** Designers and PMs gravitate to the happy path; the gaps surface in production. Forcing both into the artifact catches them in stage 03, not after release.
- **Disabled is forgotten more often than it is documented.** A button greyed out without an explanation is an accessibility defect. Naming the disabled condition in the artifact forces the team to choose: explain it, or remove the disabled state entirely.
- **One-line descriptions, not paragraphs.** This file is read alongside `screens.md` during reviews; long descriptions push reviewers to skim.
- **Optional states are listed by name, not freeform.** Three named optionals cover ~95% of additional states; anything else is usually a hidden screen and should become its own `S-NN`.

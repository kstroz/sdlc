---
name: requesting-customer-input
description: Use during stages 01-04 when an artifact cannot be produced without filling in a missing or contradictory fact from the source material — pause and ask, do not invent
---

# Requesting Customer Input

**Announce at start:** "I'm using the requesting-customer-input skill to pause this stage and surface a blocking question."

## Overview

Stages 01-04 turn raw client input (briefs, transcripts, notes) into specifications. The agent must never paper over genuine ambiguity by guessing. When the source material is silent or self-contradictory on a fact required by the artifact's convention, the correct behaviour is to stop, write the question down, surface it to the user, and wait. Inventing a plausible answer pollutes every downstream stage and breaks traceability.

## When to use

Trigger this skill when the source material does not let you fill a required field honestly. Concrete examples:

1. The brief for stage 01 names "the device" but never says whether it is a wearable, a kiosk, a mobile app, or a desktop tool — and the idea convention requires a device class.
2. Two stage-01 transcripts contradict each other on a hard requirement (e.g. one says "must work offline", another says "always online with live sync").
3. A persona referenced in `PRODUCT.md` has no defined primary goal, and a stage-02 story's user-statement cannot be written without it.
4. A stage-03 screen needs a state for "payment failed", but no source material describes what the user should see or do — and you cannot derive it from existing screens or NFRs.
5. A stage-04 ADR requires a non-functional constraint (e.g. expected concurrent users) that appears nowhere in `prd.md` and was not discussed in any transcript.

## When NOT to use

Do not ask the user for things you can derive from upstream artifacts or convention rules. Specifically, do not ask when:

- The answer is already in `.pipeline/<earlier-stage>/` — read it.
- The answer is in `PRODUCT.md` (personas, glossary, product principles) — read it.
- The convention file specifies a default — apply it.
- The question is a stylistic preference the writing-style or markdown-rules conventions already settle.
- You merely want validation of a choice you could justify from the source material. Make the choice, cite the source, move on.

If you can answer the question yourself by re-reading the brief, transcripts, `PRODUCT.md`, and the relevant convention, you must do so before invoking this skill.

## Procedure

1. **Capture the question precisely.** Write it as a single sentence with no jargon. State exactly which field, in which artifact, in which stage, cannot be filled. If the ambiguity is a contradiction, name both conflicting sources.
2. **Write it to `.pipeline/<stage>/_open-questions.md` as a checklist item.** Create the file if it does not exist. Use the question format below. Each question is one unchecked checkbox; resolved questions are checked off with the resolution recorded inline.
3. **Report the question to the user.** Surface the same text you wrote to `_open-questions.md` directly in the chat, plus the absolute path to the file. Make clear that the stage is paused.
4. **STOP this stage's work until the user resolves it.** Do not proceed to the next artifact, do not run the validator, do not write `_approval.json`. Wait for the user's answer. Once answered, record the resolution in `_open-questions.md` (check the box, append the answer and date), then resume from the point you paused.

## Question format

Each entry in `_open-questions.md` follows this template:

```markdown
- [ ] **Q-NN: <one-sentence question>**
  - **Blocks:** <stage>/<artifact> — <which field or section>
  - **Why it blocks:** <one sentence; why no honest default exists>
  - **Options (if known):** A) <option>; B) <option>; C) <option>
  - **Source conflict (if any):** "<quote A>" (transcript-1, l.42) vs. "<quote B>" (brief, p.3)
  - **Once answered, agent will:** <concrete next action — which artifact will be written or amended>
  - **Resolution:** _(filled in by agent after the user replies; format: `<answer> — YYYY-MM-DD`)_
```

`Q-NN` is a per-branch counter starting at `Q-01`, never reused across resolved questions.

## Examples

Good question (specific, blocking, lists options, names the source conflict):

> Q-03: Is the target device class for this product a wearable, a phone app, or a kiosk?
> Blocks: 01-idea/idea.md — `device-class` frontmatter field.
> Why it blocks: the convention requires one of {wearable, mobile, desktop, kiosk, web} and the brief only says "the device".
> Options: A) wearable; B) mobile app; C) kiosk.
> Once answered, agent will: set `device-class:` and re-run check-idea.sh.

Bad question (derivable, vague, or asks for permission rather than a fact):

> "Should I write the PRD now?" — derivable from the pipeline state, not a customer fact.
> "What should the app look like?" — too vague; refine to a specific blocking field, or do not ask.
> "Can I assume users have internet?" — if the brief is silent and an NFR depends on it, ask precisely: "Is offline operation a hard requirement, a nice-to-have, or out of scope?"

## Why this exists

The pipeline's value is traceability: every downstream artifact cites an upstream ID, and every upstream claim cites the source material. An invented answer at stage 01 silently propagates through stages 02-05 and cannot be detected by the validators, which only check structural integrity. Customer ambiguity is the one thing the agent cannot resolve alone, so the only safe behaviour is to make the ambiguity visible, named, and blocking — exactly the role of `_open-questions.md`. Pausing is cheap; a wrong assumption discovered at stage 05 is not.

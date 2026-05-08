---
name: amending-adrs-during-development
description: Use during Stage 05.3–05.5 whenever implementation diverges from an architectural decision recorded in an ADR; adds a versioned amendment to the ADR file
---

# Amending ADRs During Development

**Announce at start:** "I'm using the amending-adrs-during-development skill to record an architecture deviation."

## When to trigger

Trigger this skill whenever:
- Implementation requires a different approach than what an ADR specifies
- A new architectural decision is made that is not covered by any existing ADR
- A deliberate exception to `architecture-principles.md` or `modularity-thresholds.md` is taken

Do not skip this step and fix the code silently. Unrecorded deviations are the most common source of architectural drift.

## What to read first

All existing ADR files under `.pipeline/04-architecture/adr/` to understand current decisions and avoid duplicating or contradicting them.

## Procedure

### Amending an existing ADR

1. Open the relevant `.pipeline/04-architecture/adr/ADR-NNN-<slug>.md`
2. Increment `version` in the frontmatter by 1
3. Append an `## Amendment — <YYYY-MM-DD>` section at the bottom of the file:

```markdown
## Amendment — 2026-05-08

**Trigger:** [one sentence: what implementation decision prompted this amendment]

**Original decision:** [quote or summarise the original decision being changed]

**Revised decision:** [the new approach]

**Reason:** [why the original approach didn't work or needs to change]

**Sunset condition:** [when this exception should be revisited, e.g. "revisit when offline sync is implemented in BAJ-200"]
```

4. Add an inline comment in the source code at the point of exception:
   ```typescript
   // architecture-exempt: ADR-NNN — <one-line reason>
   // modularity-exempt: ADR-NNN   (if a modularity threshold is exceeded)
   ```

### Writing a new ADR

If no existing ADR covers the decision, create a new file:
`.pipeline/04-architecture/adr/ADR-NNN-<slug>.md`

Use the template at `pipeline/conventions/04-architecture/adr-template.md`.

Set `status: accepted` and record the context, decision, consequences, and a sunset condition where relevant.

## Output

After writing or amending, confirm the file was saved and show the user the amended/new section. The `generating-changelog` skill will pick up ADR amendments automatically via frontmatter `version` comparison.

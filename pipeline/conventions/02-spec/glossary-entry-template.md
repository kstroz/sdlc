# Glossary Entry Template (Stage 02)

Defines one entry inside `02-spec/glossary.md`. The glossary is the canonical domain dictionary for the project; downstream stages quote it verbatim. The validator `pipeline/validators/check-spec.sh` enforces frontmatter and the file's existence.

## Required structure

`glossary.md` opens with frontmatter, then lists entries alphabetically. Each entry uses this block:

```markdown
---
id: GLOSSARY-001
created: YYYY-MM-DD
version: 1
---

# Glossary

## <Term>
- **Definition**: <One sentence. Domain meaning, not dictionary meaning.>
- **Source**: `_inputs/<file>.md:L<line>` <short pull-quote in italics>
- **Synonyms**: <comma list, or "None">
- **Conflicts with**: <other glossary term that risks confusion, or "None">
- **Propagation**: <where this term appears downstream — e.g. "personas.md (P-01 goals), user-journeys.md (J-02 step 3)">
```

A term with no synonyms and no conflicts still keeps the lines, with the literal value `None`. Empty fields are not allowed.

## Validation rules

The validator FAILS the gate if:

1. **Frontmatter** missing `id`, `created`, or `version` at the top of `glossary.md`.
2. **Entry header** uses any heading level other than `## ` (single space, no trailing punctuation).
3. **Definition line** missing or longer than two sentences.
4. **Source line** missing the `_inputs/<file>.md:L<line>` reference. A bare URL is not a source.
5. **Synonyms** or **Conflicts with** field absent. Use the literal `None` when not applicable.
6. **Propagation** absent. New entries with no downstream usage yet must say `Pending` and be revisited at the gate.

## Why

- **Domain meaning, not dictionary meaning** — "Track" in this codebase means a single playable audio file, not a song in the music-industry sense. The dictionary definition would mislead a new contributor.
- **Source line with line number** makes terms auditable. A reviewer can confirm we did not invent vocabulary.
- **Conflicts with** prevents silent drift between near-synonyms ("episode" vs "track") that confuse spec authors three months later.
- **Propagation** is the cheapest cross-reference index we have. It lets the architect see, before they design a schema, which artifacts will need updating if the term changes.

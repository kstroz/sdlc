# Generate PRODUCT.md

One-time command. Run once per product, not per feature. Reads all research transcripts
and briefs and produces `PRODUCT.md` at the repo root.

## What to read first

1. `pipeline/conventions/product-template.md` — required structure
2. `pipeline/conventions/_global/writing-style.md` — English prose, no hedging
3. `pipeline/conventions/_global/markdown-rules.md` — frontmatter, heading hierarchy

## What to read as source material

Read every file under any `_inputs/` directory found in `.pipeline/`. If no `_inputs/`
files exist, tell the user to drop research transcripts or briefs there first and stop.

## What to produce

Generate `PRODUCT.md` at the repo root following `product-template.md` exactly.

Required sections:

**Frontmatter** — `id: PRODUCT-001`, `created: <today>`, `version: 1`. No `jira` field.

**## Target segment** — 2–3 sentences on who the product is built for at population level.
Not individuals. Include domain, context of use, and geography if relevant.

**## Personas** — one `### P-NN` block per distinct user archetype found in the research.
Maximum 5. Collapse near-duplicates. Each persona requires:
- `Role`, `Context` (2–3 sentences), `Goals` (bullet list), `Frustrations` (bullet list with source refs)
- `Tech literacy`: Low | Medium | High with one-line justification
- `Quote`: verbatim sentence from the transcript, format `"<quote>" — _inputs/<file>.md:L<line>`

Translate all content to English. Keep original-language terms only in the Glossary.

**## Glossary** — one `### <Term>` block per domain-specific term found in the transcripts.
Order alphabetically. Each entry requires `Definition`, `Source` (`_inputs/<file>.md:L<line>`),
`Synonyms` (or `None`), `Used in` (or `Pending`).

## After writing

Run:

```bash
bash pipeline/validators/check-product.sh PRODUCT.md
```

Fix every failure. Re-run until the validator exits 0, then show the user the result.

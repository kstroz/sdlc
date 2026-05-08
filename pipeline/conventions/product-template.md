# PRODUCT.md Template

Defines the required structure of `PRODUCT.md` at the repo root. This file is created
once per product (not per feature) via the `/generate-product` command and updated as
research accumulates. It is the shared context that all per-feature PRDs reference for
persona IDs and domain terms.

## Required structure

```markdown
---
id: PRODUCT-001
created: YYYY-MM-DD
version: 1
---

# <Product name>

## Target segment
<2–3 sentences describing who the product is built for at the population level.
Not individual personas — those follow below. Includes domain, geography, context of use.>

## Personas

### P-01 — <Name>
- **Role**: <occupation or relationship to the product>
- **Context**: <2–3 sentences: situation in which they meet the product>
- **Goals**: <bullet list — what they are trying to accomplish>
  - ...
- **Frustrations**: <bullet list — current pains, each with a source reference>
  - ...
- **Tech literacy**: Low | Medium | High — <one-line justification>
- **Quote**: "<verbatim sentence from _inputs/<file>.md:L<line>>"

Repeat block per persona. Maximum 5 personas — collapse near-duplicates.

## Glossary

### <Term>
- **Definition**: <one sentence — domain meaning, not dictionary meaning>
- **Source**: `_inputs/<file>.md:L<line>` — *<pull-quote>*
- **Synonyms**: <comma list or None>
- **Used in**: <which artifacts reference this term>

Repeat block per term. Order alphabetically.
```

## Validation rules

`check-product.sh` FAILS if:

1. Frontmatter missing `id`, `created`, or `version`.
2. `## Target segment` section absent.
3. `## Personas` section absent or contains no `### P-NN` headings.
4. Any persona missing `Role`, `Context`, `Goals`, `Frustrations`, `Tech literacy`, or `Quote`.
5. Any persona `Quote` missing the `_inputs/<file>.md:L<line>` source reference.
6. `## Glossary` section absent or contains no `### <Term>` entries.
7. Any glossary entry missing `Definition` or `Source`.

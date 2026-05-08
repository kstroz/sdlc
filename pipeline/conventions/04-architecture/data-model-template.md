# Data Model Template (Stage 04)

Defines the structure of `04-architecture/data-model.md`. Skills generating this artifact MUST produce a file matching this template exactly. The validator `pipeline/validators/check-arch.sh` enforces it before the gate.

## Required structure

`data-model.md` opens with frontmatter, then one entry per entity. Entity order follows the order entities are introduced by user stories.

```markdown
---
id: DATA-MODEL-001
created: YYYY-MM-DD
version: 1
---

# Data model

## <EntityName>
- **Glossary**: [<Term>](../../../PRODUCT.md#<term-anchor>)
- **Purpose**: <One sentence. WHY the entity exists in the system.>
- **Source story**: US-NNN — <short reason this story introduces the entity>
- **Fields**:
  | Name | Type | Constraints | Nullable |
  |---|---|---|---|
  | id | UUID | primary key | no |
  | <field> | <type> | <constraint> | yes/no |
- **Relationships**:
  - one-to-many → <OtherEntity> (cardinality: 1..N, owning side: <this/other>)
  - many-to-many → <OtherEntity> (cardinality: M..N, join: <JoinEntity>)
- **Indexes**: <list of fields with rationale, or `None`>
- **Lifecycle**: <created when …, deleted when …, or `Permanent`>
```

Entity names use PascalCase and MUST match the casing of the glossary term they link to (modulo PascalCase normalisation). Fields use camelCase.

## Validation rules

The validator FAILS the gate if any entity:

1. **Glossary link missing** — every entity must link to a glossary entry via `[<Term>](../../../PRODUCT.md#...)`.
2. **Source story missing** — every entity must reference a `US-NNN` ID. Entities without a story are speculative and must be cut.
3. **Fields table missing** or fewer than 1 field row beyond the header. An entity with no fields is not an entity.
4. **Relationships** section absent. Use the literal `None` when the entity is standalone.
5. **Cardinality missing** on any relationship line — `one-to-many` alone is not enough; specify `1..N` or `0..N` and the owning side.
6. **Lifecycle** absent.

## Why

- **Glossary link** prevents shadow vocabulary. If the entity is not in PRODUCT.md Glossary, either the glossary is incomplete or the entity is invented — both block the gate.
- **Source story** kills CRUD-by-default modelling. Every entity earns its place by appearing in a real user story.
- **Cardinality required** stops the silent drift between "loose link" and "join table" that costs a migration later.
- **Lifecycle** forces the team to think about deletion before the schema is frozen — GDPR and account-deletion paths depend on it.

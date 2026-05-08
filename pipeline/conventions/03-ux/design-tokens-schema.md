# Design Tokens Schema (Stage 03)

Defines the required structure of `03-ux/design-tokens.md`. The file must be machine-parseable so stage 04 can code-gen a theme module from it.

## Required structure

`design-tokens.md` contains six H2 sections, one per category, in this order:

1. `## Color`
2. `## Typography`
3. `## Spacing`
4. `## Radius`
5. `## Shadow`
6. `## Motion`

Each category contains one or more tables. Every token row has three columns: `Name | Value | Use`.

```markdown
## Color

### Raw palette
| Name | Value | Use |
|---|---|---|
| palette.blue.500 | #3B82F6 | base brand blue |

### Semantic
| Name | Value | Use |
|---|---|---|
| color.action.primary | palette.blue.500 | primary CTA background |
| color.text.default   | palette.gray.900 | body text on light surface |

## Typography
| Name | Value | Use |
|---|---|---|
| font.family.sans   | "Inter, system-ui, sans-serif" | default UI |
| font.size.body     | 16px / 1.5 line-height         | body copy |
| font.weight.bold   | 700                            | headings, emphasis |

## Spacing
| Name | Value | Use |
|---|---|---|
| space.1 | 4px  | tight inline gap |
| space.2 | 8px  | element padding |
| space.4 | 16px | section gutter |

## Radius
| Name | Value | Use |
|---|---|---|
| radius.sm | 4px  | inputs |
| radius.md | 8px  | cards |

## Shadow
| Name | Value | Use |
|---|---|---|
| shadow.sm | 0 1px 2px rgba(0,0,0,0.08) | resting card |

## Motion
| Name | Value | Use |
|---|---|---|
| motion.duration.fast    | 120ms                       | hover, press |
| motion.duration.medium  | 240ms                       | screen transitions |
| motion.easing.standard  | cubic-bezier(0.2, 0, 0, 1)  | default easing |
```

## Validation rules

The validator FAILS the gate if:

1. Any of the six required H2 categories is missing.
2. `## Color` does not contain both a `### Raw palette` and a `### Semantic` subsection.
3. Any semantic color row's `Value` does not reference an existing `palette.*` name.
4. Any token row is missing the `Use` column or has an empty `Use` cell.
5. Token names do not follow `category.subcategory.variant` dot notation.

## Why these rules

- **Semantic-on-raw separation** — semantic names (`color.action.primary`) survive a brand refresh; raw palette values (`#3B82F6`) do not. Mixing them produces theme code that breaks every time marketing tweaks the palette.
- **Use column is mandatory** — a token without an intended use becomes a magic value. Six months later nobody knows whether `color.text.muted` is for captions, placeholders, or disabled labels.
- **Six categories, fixed order** — code-gen scripts in stage 04 parse this file by H2 heading. Adding a seventh category or re-ordering breaks the generator. Extend by adding subcategories inside the existing six.
- **Dot notation** — portable to CSS variables (`--color-action-primary`), JS modules (`tokens.color.action.primary`), and design-tool plugins. Other naming schemes do not survive all three.

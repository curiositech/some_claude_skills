---
name: design-system-documenter
description: Creates comprehensive documentation for design systems - token tables, usage guidelines, component examples, and accessibility notes. Use after generating tokens to create developer-friendly
  docs.
allowed-tools: Read,Write,Glob
metadata:
  category: Documentation
  pairs-with:
  - skill: design-system-generator
    reason: Document tokens after generation
  - skill: docs-architect
    reason: Integrate into broader documentation
  tags:
  - design-system
  - documentation
  - tokens
  - styleguide
---

# Design System Documenter

Transform raw design tokens into developer-friendly documentation with usage examples, accessibility notes, and implementation guidelines.

## Quick Start

**Minimal example - document a token file:**

```markdown
Input: Generated tokens.json or CSS variables file
Output: Complete documentation with:
- Token reference tables
- Usage examples in code
- Accessibility annotations
- Do/Don't examples
```

**Key principle**: Documentation should answer "when do I use this?" not just "what is this?".

## Core Mission

Bridge the gap between generated tokens and developer adoption by creating documentation that:
1. Explains *when* to use each token (not just what it is)
2. Shows real code examples for common scenarios
3. Highlights accessibility considerations
4. Prevents misuse with anti-pattern examples

## When to Use

✅ Use when:
- Just generated design tokens and need docs
- Team struggles with "which token do I use?"
- Onboarding new developers to design system
- Creating a public design system site

❌ Do NOT use when:
- Need to generate tokens (use design-system-generator first)
- Need component code (use component-template-generator)
- Documenting non-design-system code (use docs-architect)

## Documentation Structure

### 1. Token Reference Tables

For each token category, generate tables with:

| Token | Value | Usage | Accessibility |
|-------|-------|-------|---------------|
| `--color-primary` | #FF5252 | CTAs, links, emphasis | ✅ 4.5:1 on white |
| `--color-border` | #000000 | All borders, dividers | — |

### 2. Usage Guidelines

```markdown
## Color Tokens

### Primary Colors
Use primary colors for:
- Call-to-action buttons
- Interactive links
- Important highlights

Do NOT use for:
- Body text
- Background fills (too saturated)
- Disabled states

### Code Example
```css
.button-primary {
  background: var(--color-primary);
  color: var(--color-text-on-primary);
  border: var(--border-width) solid var(--color-border);
}
```
```

### 3. Visual Examples

Include visual swatches and demonstrations:

```markdown
## Shadow Tokens

| Name | Preview | CSS Value |
|------|---------|-----------|
| shadow-sm | [2px offset visual] | `2px 2px 0 0 #000` |
| shadow-md | [4px offset visual] | `4px 4px 0 0 #000` |
| shadow-lg | [6px offset visual] | `6px 6px 0 0 #000` |

### Interaction States
- **Default**: `shadow-md`
- **Hover**: `shadow-lg` + translate(-2px, -2px)
- **Active**: `shadow-sm` + translate(2px, 2px)
```

### 4. Accessibility Section

```markdown
## Accessibility

### Color Contrast
| Combination | Ratio | WCAG Level |
|-------------|-------|------------|
| Primary on White | 4.8:1 | ✅ AA |
| Primary on Cream | 4.2:1 | ⚠️ AA Large only |
| Text on Primary | 8.2:1 | ✅ AAA |

### Motion
All animations respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```
```

### 5. Do/Don't Examples

```markdown
## Common Mistakes

### ❌ Don't: Use shadow-lg on small elements
Small elements with large shadows look unbalanced.

### ✅ Do: Scale shadow with element size
- Small buttons: shadow-sm
- Cards: shadow-md
- Modals: shadow-lg

### ❌ Don't: Mix border styles
Inconsistent borders break visual rhythm.

### ✅ Do: Use consistent border tokens
Always use `--border-width` (3px) for neobrutalist consistency.
```

## Output Formats

### Markdown (Default)
Complete `.md` file for docs sites:
- Docusaurus/VitePress compatible
- Includes frontmatter for navigation
- Code blocks with syntax highlighting

### MDX (React docs)
Same as Markdown plus:
- Interactive color swatches
- Live code examples
- Token preview components

### Storybook
Documentation stories:
- Token showcase pages
- Interactive controls
- Design token addon integration

## Documentation Workflow

```
1. design-system-generator → tokens.json / tokens.css
2. design-system-documenter → tokens-docs.md
3. Review and customize
4. Publish to docs site
```

## Template: Token Documentation Page

```markdown
---
title: Design Tokens
description: Complete reference for [Project] design tokens
---

# Design Tokens

Generated from [trend-name] design trend.

## Quick Reference

| Category | Tokens | Description |
|----------|--------|-------------|
| Colors | 12 | Primary, neutral, semantic |
| Typography | 8 | Fonts, sizes, weights |
| Spacing | 15 | 0-24 scale |
| Shadows | 5 | Size and state variants |

## Colors

### Primary Palette
[Token table with hex, usage, accessibility]

### Neutral Palette
[Token table]

### Semantic Colors
[Token table for success, warning, error, info]

## Typography

### Font Families
[Token table with font stacks and usage]

### Font Sizes
[Scale table with px/rem values]

## Spacing

### Spacing Scale
[0-24 scale with rem values]

## Shadows

### Shadow Variants
[Visual examples with code]

## Usage Examples

### Button Component
[Complete code example using tokens]

### Card Component
[Complete code example using tokens]

## Accessibility

### Contrast Ratios
[All color combinations with WCAG levels]

### Motion Preferences
[Reduced motion handling]

## Migration Guide

### From Arbitrary Values
[Before/after examples]
```

## See Also

### References
- `references/documentation-templates.md` - Docusaurus, VitePress, Storybook, README templates
- `references/design-system-references.md` - **NEW**: Real-world design system references
  - Enterprise: Elastic UI, Red Hat PatternFly, Morningstar
  - Accessibility-first: Ariakit, Radix UI
  - Modern: HeroUI, shadcn/ui, Neobrutalism.dev
  - Framework-agnostic: Web Awesome, Shoelace
  - Award-winning sites from Awwwards for inspiration
  - Framer template categories (2900+ business, 1700+ creative)

### Related Skills
- design-system-generator - Generate tokens first (24 trends, 31 styles)
- component-template-generator - Create component code from tokens

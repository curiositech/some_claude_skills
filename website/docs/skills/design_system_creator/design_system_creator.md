---
sidebar_label: Design System Creator
sidebar_position: 1
---

# 🎨 Design System Creator

Builds comprehensive design systems and design bibles with production-ready CSS. Expert in design tokens, component libraries, CSS architecture. Use for design system creation, token architecture, component documentation, style guide generation. Activate on "design system", "design tokens", "CSS architecture", "component library", "style guide", "design bible". NOT for typography deep-dives (use typography-expert), color theory mathematics (use color-theory-palette-harmony-expert), brand identity strategy (use web-design-expert), or actual UI implementation (use web-design-expert or native-app-designer).

---

## Allowed Tools

```
Read, Write, Edit, Glob, mcp__magic__21st_magic_component_builder, mcp__magic__21st_magic_component_refiner, mcp__stability-ai__stability-ai-generate-image, mcp__firecrawl__firecrawl_search
```

## Tags

`design-system` `tokens` `components` `css` `style-guide`

## 🤝 Pairs Great With

- **[Typography Expert](/docs/skills/typography_expert)**: Typography decisions for the system
- **[Color Theory Palette Harmony Expert](/docs/skills/color_theory_palette_harmony_expert)**: Color token architecture

## References

- [Component Documentation Template](./references/component-documentation)
- [CSS Organization Patterns](./references/css-organization)
- [Design Token Architecture](./references/token-architecture)

# Design System Creator

Design systems architect and CSS expert specializing in creating comprehensive, scalable design bibles.

## When to Use This Skill

✅ **Use for:**
- Creating design tokens from scratch (colors, spacing, typography scales)
- Building CSS custom property architectures
- Documenting component libraries with usage guidelines
- Creating design bibles and style guides
- Establishing naming conventions (BEM, OOCSS, SMACSS)
- Auditing existing CSS for design system extraction
- Theming and dark mode token systems
- Multi-brand/white-label token structures

❌ **Do NOT use for:**
- Typography selection and pairing → **typography-expert**
- Color theory and palette generation → **color-theory-palette-harmony-expert**
- Brand identity and visual direction → **web-design-expert**
- Actual component implementation → **web-design-expert** or **native-app-designer**
- Icon design → **web-design-expert**
- Motion design principles → **native-app-designer**

## Three-Tier Token Architecture

The foundation of scalable design systems:

```css
:root {
  /* 1. PRIMITIVE - Raw values */
  --color-blue-500: #3b82f6;
  --space-4: 1rem;

  /* 2. SEMANTIC - Purpose-driven */
  --color-primary: var(--color-blue-500);
  --space-component-padding: var(--space-4);

  /* 3. COMPONENT - Specific usage */
  --button-bg: var(--color-primary);
  --button-padding: var(--space-component-padding);
}
```

→ See `references/token-architecture.md` for dark mode, multi-brand, and complete examples.

## Design Bible Structure

### 1. Foundation
- Brand Identity, Design Principles
- Color System, Typography Scale
- Spacing Scale, Grid System

### 2. Components
For each component document:
- Purpose, Anatomy, Variants
- States (default, hover, active, disabled, focus)
- Responsive behavior
- Accessibility (ARIA, keyboard, screen readers)
- Code examples

### 3. Patterns
- Page Layouts, Navigation
- Forms, Data Display
- Feedback (alerts, toasts, modals)

### 4. Guidelines
- Writing (voice, tone)
- Imagery, Motion, Accessibility

→ See `references/component-documentation.md` for templates.

## CSS Organization (ITCSS)

```
styles/
├── 0-settings/     # Tokens, custom properties
├── 1-tools/        # Mixins, functions
├── 2-generic/      # Reset, normalize
├── 3-elements/     # Typography, forms (unclassed)
├── 4-objects/      # Layout patterns
├── 5-components/   # UI components
├── 6-utilities/    # Helpers, overrides
└── main.css        # Import all
```

→ See `references/css-organization.md` for BEM naming and full structure.

## Anti-Patterns to Avoid

### 1. Token Explosion
**What it looks like**: 500+ tokens with overlapping purposes
**Why it's wrong**: Defeats constraints; developers can't choose
**Fix**: Limit to 6-8 spacing tokens. If you need more, fix the scale.

### 2. Missing Semantic Layer
**What it looks like**: Components reference primitives directly
**Why it's wrong**: Can't theme, can't change brand without touching every component
**Fix**: Three-tier tokens: Primitive → Semantic → Component

### 3. Documentation Drift
**What it looks like**: Design bible says one thing, CSS does another
**Why it's wrong**: Developers stop trusting documentation
**Fix**: Generate docs from CSS comments, or use Storybook

### 4. Utility Class Overload
**What it looks like**: `class="p-4 m-2 bg-blue-500 text-white..."`
**Why it's wrong**: HTML unreadable, design intent lost
**Fix**: Use utilities sparingly; most styles in semantic component classes

### 5. Breaking the Scale
**What it looks like**: `padding: 13px;` (why 13?)
**Why it's wrong**: Every exception erodes the system
**Fix**: If the scale doesn't work, fix the scale

### 6. No Version Control
**What it looks like**: "Which button is correct?"
**Why it's wrong**: Multiple sources of truth
**Fix**: Single source of truth with version numbers, deprecation warnings

## Working Process

1. **Audit**: Review existing patterns and inconsistencies
2. **Define**: Establish tokens and foundational system
3. **Build**: Create component library with documentation
4. **Document**: Write comprehensive design bible
5. **Test**: Validate accessibility and responsiveness
6. **Deliver**: Package with examples and starter templates

## MCP Integrations

| MCP | Purpose |
|-----|---------|
| **21st.dev** | Scaffold components quickly with modern patterns |
| **Storybook** | Extract existing component structure (when available) |
| **Figma** | Sync design tokens from Figma variables (when available) |
| **Stability AI** | Generate placeholder images for documentation |
| **Firecrawl** | Research design system best practices |

## Output Deliverables

- **Design Bible Document**: Complete markdown/HTML with visual examples
- **CSS Codebase**: Well-commented, modular, production-ready
- **Component Library**: Interactive examples with all variants
- **Quick Start Guide**: Getting started, customization, common recipes

## References

→ `references/token-architecture.md` - Three-tier tokens, dark mode, multi-brand
→ `references/css-organization.md` - ITCSS, BEM, component file structure
→ `references/component-documentation.md` - Doc templates, quick reference cards

## Integrates With

- **typography-expert** - Typography scale and font selection
- **color-theory-palette-harmony-expert** - Color palette generation
- **web-design-expert** - Brand identity and visual direction
- **adhd-design-expert** - ADHD-friendly design tokens

---

*Remember: A design system is a living product that serves products.*

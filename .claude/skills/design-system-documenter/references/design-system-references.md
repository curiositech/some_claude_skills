# Design System References

Real-world design systems from Component Gallery (95 systems, 2680 examples).
Use for documentation best practices and pattern references.

## Featured Design Systems

### Enterprise-Grade

| System | Tech Stack | Strengths | URL |
|--------|------------|-----------|-----|
| Elastic UI | React, CSS-in-JS | Data-heavy, enterprise dashboards | https://eui.elastic.co/ |
| Red Hat PatternFly | Web Components | Enterprise Linux, accessibility | https://ux.redhat.com/ |
| Morningstar | Vue | Financial data, charting | https://design.morningstar.com/systems/product |
| Sainsbury's | React, Sass | Retail, comprehensive | https://design-systems.sainsburys.co.uk/ |

### Accessibility-First

| System | Tech Stack | Strengths | URL |
|--------|------------|-----------|-----|
| Ariakit | React | Accessibility primitives | https://ariakit.org/ |
| Radix UI | React | Unstyled, accessible | https://radix-ui.com/ |

### Modern/Tailwind-Native

| System | Tech Stack | Strengths | URL |
|--------|------------|-----------|-----|
| HeroUI | React, Tailwind | Beautiful defaults | https://www.heroui.com/ |
| shadcn/ui | React, Tailwind | Copy-paste components | https://ui.shadcn.com/ |
| Neobrutalism.dev | React, Tailwind, shadcn | Neobrutalist variant | https://www.neobrutalism.dev/ |

### Framework-Agnostic

| System | Tech Stack | Strengths | URL |
|--------|------------|-----------|-----|
| Web Awesome | Web Components | Works everywhere | https://webawesome.com/ |
| Shoelace | Web Components | Modern primitives | https://shoelace.style/ |

## Documentation Patterns

### Elastic UI Documentation Structure

Best for: Enterprise systems, data-heavy components

```
Overview
├── Getting Started
├── Installation
├── Theming
└── Accessibility

Components
├── Layout
│   ├── Grid
│   ├── Flex
│   └── Spacer
├── Display
│   ├── Avatar
│   ├── Badge
│   └── Card
├── Forms
│   ├── Button
│   ├── Input
│   └── Select
└── Data Display
    ├── Table
    ├── List
    └── Tree

Patterns
├── Dashboard Layouts
├── Form Patterns
└── Data Loading

Utilities
├── Colors
├── Sizing
└── Animation
```

### shadcn/ui Documentation Structure

Best for: Modern component libraries, developer-focused

```
Introduction
├── Installation
├── Configuration
├── Dark Mode
└── Typography

Components (alphabetical)
├── Accordion
├── Alert
├── Avatar
├── Badge
...
└── Tooltip

Themes
├── Default
├── New York
└── Creating Themes

Examples
├── Dashboard
├── Cards
├── Authentication
└── Forms
```

## Award-Winning Sites for Reference

From Awwwards UI Design category (crawled 2026-01-31):

| Site | Specialty | Notable For |
|------|-----------|-------------|
| Snowflake Studio | Agency | Clean transitions |
| Hemi Network | Web3 | Gradient mastery |
| Gielly Green | E-commerce | Elegant product display |
| Voku.Studio | Portfolio | Typography excellence |
| Jesko Jets | Luxury | Scroll storytelling |
| Chromia | Blockchain | Data visualization |

### What Award-Winners Do Well

**Typography**
- Custom fonts or striking pairings
- Generous line-height for readability
- Scale contrast between headlines and body

**Animation**
- Scroll-driven reveals (not random movement)
- Micro-interactions on hover/focus
- Page transitions that feel intentional

**Color**
- Limited palettes (3-5 colors max)
- Strategic use of accent color
- Consistent application across states

## Framer Template Categories

Template marketplace data for understanding market segments:

| Category | Count | Price Range |
|----------|-------|-------------|
| Business | 2,900 | Free - $79 |
| Creative | 1,700 | Free - $79 |
| Style | 2,300 | Free - $49 |
| Free | 1,400 | Free |
| Community | 213 | Varies |

### Popular Template Patterns

**Business Templates**
- Hero with CTA and social proof
- Feature grid (3-4 columns)
- Testimonial carousel
- Pricing table
- FAQ accordion
- Newsletter signup footer

**Creative Templates**
- Full-screen hero with video/animation
- Project grid (masonry or bento)
- About with team photos
- Process/timeline visualization
- Contact form

## Documentation Best Practices

### From Elastic UI

**Do:**
- Show component in all states (default, hover, focus, disabled, error)
- Include "When to use" and "When not to use" sections
- Provide copy-paste code snippets
- Document all props with types and defaults
- Show responsive behavior

**Avoid:**
- Documenting internal implementation details
- Showing every possible prop combination
- Using placeholder text that doesn't represent real usage

### From shadcn/ui

**Do:**
- Lead with a visual example
- Show installation command prominently
- Include multiple usage examples
- Document customization via className/variants
- Link to related components

**Avoid:**
- Hiding the code behind tabs initially
- Over-explaining obvious props
- Documenting CSS classes instead of semantic usage

### From Ariakit

**Do:**
- Lead with accessibility requirements
- Show keyboard navigation patterns
- Document ARIA attributes and their effects
- Include screen reader testing notes
- Provide focus management examples

**Avoid:**
- Assuming visual-only usage
- Ignoring reduced-motion preferences
- Using color alone to convey state

## Component Gallery Statistics

Reference counts when documenting coverage:

| Component Type | Systems Implementing | Examples |
|----------------|---------------------|----------|
| Carousel | High | 60+ |
| Tree view | Medium | 40+ |
| Popover | High | 70+ |
| Rating | Medium | 35+ |
| Accordion | High | 80+ |
| Quote | Low | 20+ |
| Pagination | High | 75+ |
| Tabs | High | 90+ |

Use these stats to:
- Prioritize documentation (high-count = common need)
- Reference established patterns (link to similar implementations)
- Identify gaps (low-count = opportunity for innovation)

## Documentation Deliverables Checklist

When documenting a design system:

### Tokens Documentation
- [ ] Color palette with hex values and usage
- [ ] Typography scale with font stacks
- [ ] Spacing scale with rem/px values
- [ ] Shadow definitions
- [ ] Border radius values
- [ ] Animation timing/easing
- [ ] Breakpoint definitions

### Component Documentation
- [ ] Visual preview of all variants
- [ ] Props table with types
- [ ] Usage examples (code + preview)
- [ ] Accessibility notes
- [ ] Keyboard navigation
- [ ] Mobile considerations
- [ ] Related components

### Pattern Documentation
- [ ] When to use pattern
- [ ] Layout requirements
- [ ] Component composition
- [ ] Responsive behavior
- [ ] Edge cases

### Getting Started
- [ ] Installation (npm/yarn/pnpm)
- [ ] Configuration (tailwind.config, etc.)
- [ ] First component example
- [ ] Theming setup
- [ ] Dark mode setup

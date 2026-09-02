# Changelog

## v1.0.0 (2026-09-01)

### Added
- **SKILL.md**: Core Swiss Modern web design skill with complete design system
  - Four Pillars mindmap diagram (Grid, Typography, Color, Space)
  - Full light and dark mode color palettes with CSS variables
  - 12-column grid system with column span utilities
  - Perfect Fourth (1.333) type scale with fluid responsive sizing
  - 8px-based spacing scale
  - Component patterns: buttons, cards, navigation, form elements
  - 7 anti-patterns with Novice/Reality/Instead format
  - Quick decision tree for element styling
  - Complete CSS variables template with dark mode support
  - Quick test checklist (pass/fail)
  - Accessibility section with reduced-motion and focus states
  - Style comparison table (vs Neobrutalism, Glassmorphism, Minimalism)
  - Font pairing table with 5 personality-matched stacks

- **references/component-library.md**: 800+ lines of production-ready CSS
  - Complete CSS variable system (colors, typography, spacing, shadows, motion)
  - Typography classes (display through caption, overline, monospace)
  - Buttons (5 variants × 4 sizes + icon variant)
  - Cards (base, interactive, elevated, ghost, metric, feature)
  - Tables (standard, compact, borderless)
  - Badges and tags (neutral + 4 semantic colors + dot variant)
  - Modals with overlay and animations
  - Form elements (input, textarea, select, checkbox, radio)
  - Alerts/notices (info, success, warning, danger)
  - Dividers (subtle, strong, section, labeled)
  - Navigation (breadcrumbs, tabs, pagination)
  - Tooltips, skeleton loading, avatars, code blocks
  - Utility classes (flex, text alignment, truncation, screen-reader)

- **references/grid-system.md**: Müller-Brockmann grid theory for CSS
  - Historical context and rationale
  - 12-column grid implementation with column span utilities
  - Asymmetric vs symmetric layout guidance
  - Responsive grid collapse (4 → 8 → 12 columns)
  - 8px baseline grid with line-height alignment
  - CSS Subgrid patterns for nested alignment
  - Common layout patterns (docs, feature grid, hero, pricing)
  - Grid visualization debug tool
  - Content width guidelines table
  - 3 grid-specific anti-patterns

- **references/typography-guide.md**: Deep typography reference
  - Swiss type philosophy (6 principles)
  - 3-tier font selection guide (free, alternative, premium)
  - Font feature settings (Inter, Geist, tabular numbers)
  - 3 type scale systems (Perfect Fourth, Major Third, Minor Third)
  - Letter-spacing rules (negative for headlines, positive for labels)
  - Line height reference table
  - Fluid responsive typography with clamp()
  - Monospace pairing guide (5 matched pairs)
  - Variable font loading strategy with performance budget
  - 3 typography anti-patterns

- **references/page-templates.md**: Complete page layouts
  - SaaS landing page (hero, social proof, features, testimonial, CTA, footer)
  - Dashboard layout (header, sidebar, metrics, content)
  - Documentation layout (3-column: sidebar, content, TOC)
  - Pricing page (toggle, 3-tier cards, FAQ)
  - About/team page (asymmetric offset hero, values grid, team grid)
  - Blog/article layout (prose styling, blockquotes, figures)
  - Full CSS for each layout with responsive breakpoints

- **references/dark-mode.md**: Dark mode implementation guide
  - Philosophy and principles
  - Near-black background rationale (no pure #000000)
  - Text color hierarchy (no pure #ffffff for body)
  - Opacity-based surface depth system
  - Complete dark mode token set
  - WCAG contrast ratio verification table
  - Theme toggle implementation (vanilla JS + React)
  - SSR flash prevention script
  - Component-specific dark mode adjustments
  - Reference sites with exact hex values (Linear, Vercel, Raycast, Cursor, Mercury)
  - 3 dark-mode anti-patterns

### Design Decisions
- Chose Perfect Fourth (1.333) as default scale — balances hierarchy visibility with practical step sizes
- Inter as primary font recommendation — free, variable, screen-optimized, closest to Swiss tradition
- 8px base grid — industry standard (Material, Carbon), mathematically clean
- One accent color philosophy — aligned with original Swiss restraint
- Dark mode tokens use Zinc scale (slightly cool) — matches Linear/Vercel convention
- Separate light/dark semantic values rather than filter inversion — more control, better results

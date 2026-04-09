# Design: Next.js + Win31 Design System Migration

**Date:** 2026-03-09
**Status:** Approved
**Author:** Erich Owens + Claude

## Summary

Migrate someclaudeskills.com from Docusaurus 3.x to Next.js 15 with a proper three-tier design token system, Radix UI primitives, Tailwind v4, and a full Windows 3.1 Program Manager desktop metaphor. Four switchable themes (Classic, CRT Phosphor, Inverted, Cyberpunk Neon). Skill documentation renders inside draggable MDI windows via a unified/remark/rehype pipeline.

## Motivation

The current site has:
- ~4,000 lines of raw CSS across 4 global files + 25 CSS modules
- 288 `!important` overrides fighting Docusaurus's Infima framework
- Two competing design languages (Infima + Win31 custom properties)
- No headless UI primitives (accessibility gaps)
- No Tailwind (verbose hand-written CSS)
- No design token hierarchy (flat `--win31-*` variables)

## Architecture

### Stack

| Layer | Technology | Replaces |
|-------|-----------|----------|
| Framework | Next.js 15 (App Router) | Docusaurus 3.9 |
| Styling | Tailwind v4 | 4,000 lines raw CSS |
| Primitives | Radix UI | Hand-rolled modals/dropdowns |
| Variants | class-variance-authority + tailwind-merge + clsx | String concatenation |
| Themes | next-themes | `[data-theme]` CSS |
| Markdown | unified + remark + rehype | Docusaurus MDX |
| Win31 Components | Forked from most-professional-photo-plans | Current win31/ directory |

### Three-Tier Design Tokens

**Tier 1 — Primitives** (raw values, never used directly in components):
```css
--color-navy-500: #000080;
--color-gray-300: #c0c0c0;
--color-gray-500: #808080;
--color-white: #ffffff;
--color-black: #000000;
--color-teal-500: #008080;
--color-lime-400: #00ff00;
--color-yellow-400: #ffd700;
--color-magenta-400: #ff00ff;
--color-cyan-400: #00ffff;
--color-red-500: #ff0000;
--font-size-2xs: 0.625rem;  /* 10px */
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--space-0: 0;
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--radius-none: 0;
```

**Tier 2 — Semantic** (role-based, theme-switched):
```css
/* Surfaces */
--color-surface: var(--color-gray-300);
--color-surface-inset: var(--color-white);
--color-surface-raised: var(--color-gray-300);
--color-desktop: var(--color-teal-500);

/* Title bars */
--color-titlebar-active: var(--color-navy-500);
--color-titlebar-inactive: var(--color-gray-500);
--color-titlebar-text: var(--color-white);

/* Borders (beveled 3D effect) */
--color-border-raised-light: var(--color-white);
--color-border-raised-dark: var(--color-black);
--color-border-inset-light: var(--color-gray-500);
--color-border-inset-dark: var(--color-white);

/* Text */
--color-text-primary: var(--color-black);
--color-text-secondary: var(--color-gray-500);
--color-text-link: var(--color-navy-500);
--color-text-accent: var(--color-teal-500);

/* Typography */
--font-family-display: 'Press Start 2P', cursive;
--font-family-window: 'VT323', monospace;
--font-family-system: 'IBM Plex Mono', monospace;
--font-family-body: 'Courier Prime', monospace;
--font-family-code: 'IBM Plex Mono', monospace;
```

**Tier 3 — Component** (scoped):
```css
--win31-button-bg: var(--color-surface);
--win31-button-text: var(--color-text-primary);
--win31-window-border: 2px;
--win31-titlebar-height: 18px;
```

### Four Themes

Theme switching remaps Tier 2 semantic tokens. Components never change.

**Classic (Light)**
- Default Win31: gray chrome, navy titlebars, teal desktop
- `--color-surface: #c0c0c0`, `--color-desktop: #008080`

**CRT Phosphor (Dark)**
- Near-black background, amber/green phosphor text
- Scanline CSS overlay, text-shadow glow
- `--color-surface: #0a0a0a`, `--color-text-primary: #33ff33`
- `--color-desktop: #000000`, `--color-titlebar-active: #003300`

**Inverted (Dark)**
- Same beveled chrome but dark backgrounds
- `--color-surface: #2a2a2a`, `--color-border-raised-light: #444`
- `--color-titlebar-active: #4466aa`, `--color-desktop: #1a1a2e`

**Cyberpunk Neon (Dark)**
- Hot pink, electric cyan, lime accents
- Purple/navy backgrounds, neon glow borders
- `--color-surface: #1a0a2e`, `--color-text-accent: #ff00ff`
- `--color-titlebar-active: #6600cc`, `--color-desktop: #0d001a`

### Component Library

Forked from `~/coding/most-professional-photo-plans/components/Win31*.tsx`:

| Component | Source | Enhancement |
|-----------|--------|-------------|
| Win31Window | photo-plans (397 LOC) | Add Radix focus trap, CVA variants |
| Win31MDIWindow | photo-plans (181 LOC) | Constraint to desktop bounds |
| Win31Dialog | photo-plans (349 LOC) | Wrap with Radix Dialog for a11y |
| Win31Button | photo-plans (58 LOC) | CVA variants: default/primary/danger/ghost |
| Win31Menu | photo-plans (233 LOC) | Wrap with Radix DropdownMenu |
| Win31Panel | photo-plans (25 LOC) | CVA: inset/outset/flat |
| Win31Scrollbar | photo-plans (250 LOC) | Theme-aware colors |
| Win31StatusBar | photo-plans (53 LOC) | Taskbar with minimized windows |
| Win31GroupBox | photo-plans (39 LOC) | Category headers |
| Win31Background | photo-plans (55 LOC) | Desktop pattern per theme |
| Win31Select | new | Radix Select with Win31 chrome |
| Win31Tooltip | new | Radix Tooltip with Win31 styling |
| Win31Taskbar | new | Start menu + minimized window icons |
| Win31ProgramGroup | new | Folder of skill icons |

### Markdown Rendering Pipeline

From `~/coding/workgroup-ai/apps/marketing/`:

```
SKILL.md
  -> remark-parse (markdown AST)
  -> remark-frontmatter (extract metadata)
  -> remark-gfm (tables, strikethrough, autolinks)
  -> remark-rehype (convert to HTML AST)
  -> rehype-slug (heading anchors)
  -> rehype-highlight (syntax highlighting)
  -> rehype-react (render to React components)
  -> Rendered inside Win31Window with DOMPurify sanitization
```

Win31-styled typography classes applied to rendered markdown:
- `h1` -> VT323, 48px, navy, border-bottom
- `h2` -> VT323, 36px, teal
- `h3` -> IBM Plex Mono, 18px, uppercase
- `code` -> IBM Plex Mono on dark, beveled border
- `blockquote` -> Inset beveled panel
- `a` -> Navy, underline, teal on hover

### Page Structure

```
/                     -> Win31 Desktop (Program Manager with skill groups)
/skills/[id]          -> Deep link, opens skill window on desktop
/bundles              -> Bundle program groups
/bundles/[id]         -> Deep link, opens bundle detail
/changelog            -> WHATSNEW.TXT window
/artifacts            -> Artifact gallery window
/artifacts/[type]/[id] -> Artifact detail window
```

URL syncs with open windows. Browser back/forward = window open/close.

### Migration Path

1. Scaffold Next.js 15 + Tailwind v4 in `website-next/`
2. Port Win31 components, add Radix + CVA
3. Build token system + 4 themes
4. Build remark/rehype pipeline
5. Port content (skills, bundles, artifacts, changelog)
6. Desktop metaphor (Program Manager, taskbar, window manager state)
7. Search, analytics, SEO (meta tags, sitemap)
8. Cut over: move `website-next/` to `website/`, update deployment

### Key Decisions

- **No SSG for skill pages** — skills render client-side inside windows. Static generation for SEO via `generateMetadata` on `/skills/[id]` route.
- **Window state in URL** — `?open=skill-1,skill-2&active=skill-1` preserves open windows across refresh.
- **Audio optional** — Win31 sounds (from photo-plans AudioEngine) disabled by default, toggle in settings.
- **Responsive** — Desktop metaphor on >=1024px. Below that, stack windows as full-width cards.
- **Markdown safety** — Use rehype-react to render markdown as React components (no raw HTML injection). All user-facing content sanitized via DOMPurify as defense-in-depth.

### What We Keep

- All skill markdown content (SKILL.md files)
- Hero images
- Bundle YAML definitions
- Artifact JSON + content
- Changelog JSON
- Analytics (Plausible)
- GitHub Pages deployment

### What We Drop

- Docusaurus framework
- Infima CSS
- All 4,000 lines of hand-written CSS
- CSS Modules (replaced by Tailwind)
- Current win31/ components (replaced by photo-plans fork)

# Next.js + Win31 Design System Migration -- Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate someclaudeskills.com from Docusaurus to Next.js 15 with Tailwind v4, Radix UI, three-tier tokens, four themes, and a full Win31 Program Manager desktop metaphor.

**Architecture:** Next.js 15 App Router with `website-next/` scaffold alongside existing Docusaurus. Win31 components forked from `~/coding/most-professional-photo-plans`. Markdown pipeline from `~/coding/workgroup-ai`. Parallel development -- old site stays live until cutover.

**Tech Stack:** Next.js 15.5, Tailwind v4, Radix UI, class-variance-authority, tailwind-merge, clsx, next-themes, react-markdown, remark-gfm, DOMPurify, mermaid

**Reference Design Doc:** `docs/plans/2026-03-09-nextjs-design-system-migration.md`

---

## Phase 1: Scaffold and Token Foundation

### Task 1: Scaffold Next.js 15 project

**Files:**
- Create: `website-next/` (entire Next.js scaffold)

**Step 1: Create Next.js app**

```bash
cd /Users/erichowens/coding/some_claude_skills
npx create-next-app@latest website-next \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --no-import-alias \
  --turbopack
```

Accept defaults. This gives us Next.js 15 + Tailwind v4 + App Router.

**Step 2: Install core dependencies**

```bash
cd website-next
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
  @radix-ui/react-tooltip @radix-ui/react-select @radix-ui/react-separator \
  @radix-ui/react-switch @radix-ui/react-slot \
  class-variance-authority tailwind-merge clsx \
  next-themes \
  react-markdown remark-gfm \
  dompurify lucide-react
npm install -D @types/dompurify
```

**Step 3: Verify it runs**

```bash
PORT=$(port-daddy claim someclaudeskills:next:dev -q) npm run dev
```

Open `http://localhost:PORT` -- should show default Next.js page.

**Step 4: Commit**

```bash
git add website-next/
git commit -m "feat: scaffold Next.js 15 + Tailwind v4 + Radix UI"
```

---

### Task 2: Three-tier design token system

**Files:**
- Create: `website-next/src/styles/tokens/primitives.css`
- Create: `website-next/src/styles/tokens/semantic.css`
- Create: `website-next/src/styles/tokens/components.css`
- Create: `website-next/src/styles/themes/classic.css`
- Create: `website-next/src/styles/themes/crt.css`
- Create: `website-next/src/styles/themes/inverted.css`
- Create: `website-next/src/styles/themes/cyberpunk.css`
- Modify: `website-next/src/app/globals.css`

**Step 1: Write primitives.css**

```css
/* Tier 1: Raw values -- never used directly in components */
:root {
  /* Grays */
  --color-white: #ffffff;
  --color-gray-100: #f5f5f5;
  --color-gray-200: #dfdfdf;
  --color-gray-300: #c0c0c0;
  --color-gray-400: #a0a0a0;
  --color-gray-500: #808080;
  --color-gray-600: #606060;
  --color-gray-700: #404040;
  --color-gray-800: #2a2a2a;
  --color-gray-900: #1a1a1a;
  --color-black: #000000;

  /* Brand */
  --color-navy-400: #4466aa;
  --color-navy-500: #000080;
  --color-navy-600: #000060;
  --color-teal-400: #20b2aa;
  --color-teal-500: #008080;
  --color-teal-600: #006060;

  /* Accents */
  --color-lime-400: #00ff00;
  --color-lime-500: #33ff33;
  --color-yellow-400: #ffd700;
  --color-yellow-500: #ffff00;
  --color-red-400: #dc143c;
  --color-red-500: #ff0000;
  --color-magenta-400: #ff00ff;
  --color-cyan-400: #00ffff;
  --color-purple-500: #6600cc;
  --color-purple-900: #1a0a2e;
  --color-amber-400: #ffbf00;
  --color-green-phosphor: #33ff33;
  --color-amber-phosphor: #ffbf00;

  /* Typography scale */
  --font-size-2xs: 0.625rem;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 2rem;
  --font-size-4xl: 3rem;

  /* Spacing scale */
  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 0.125rem;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;

  /* Font families */
  --font-display-raw: 'Press Start 2P', cursive;
  --font-window-raw: 'VT323', monospace;
  --font-system-raw: 'IBM Plex Mono', monospace;
  --font-body-raw: 'Courier Prime', 'Courier New', monospace;
  --font-code-raw: 'IBM Plex Mono', 'Courier New', monospace;
}
```

**Step 2: Write semantic.css (Classic theme as default)**

```css
/* Tier 2: Role-based aliases -- theme-switched */
:root, [data-theme="classic"] {
  /* Surfaces */
  --color-surface: var(--color-gray-300);
  --color-surface-inset: var(--color-white);
  --color-surface-raised: var(--color-gray-300);
  --color-surface-overlay: rgba(0, 0, 0, 0.4);
  --color-desktop: var(--color-teal-500);

  /* Title bars */
  --color-titlebar-active: var(--color-navy-500);
  --color-titlebar-inactive: var(--color-gray-500);
  --color-titlebar-text: var(--color-white);

  /* Borders (beveled 3D) */
  --color-border-raised-light: var(--color-white);
  --color-border-raised-dark: var(--color-black);
  --color-border-inset-light: var(--color-gray-500);
  --color-border-inset-dark: var(--color-white);
  --color-border-outer: var(--color-black);

  /* Text */
  --color-text-primary: var(--color-black);
  --color-text-secondary: var(--color-gray-500);
  --color-text-muted: var(--color-gray-400);
  --color-text-link: var(--color-navy-500);
  --color-text-accent: var(--color-teal-500);
  --color-text-on-titlebar: var(--color-white);
  --color-text-code: var(--color-navy-500);

  /* Code blocks */
  --color-code-bg: var(--color-gray-900);
  --color-code-text: #e0e0e0;

  /* Status colors */
  --color-success: var(--color-lime-400);
  --color-warning: var(--color-yellow-400);
  --color-error: var(--color-red-400);
  --color-info: var(--color-teal-400);

  /* Typography */
  --font-display: var(--font-display-raw);
  --font-window: var(--font-window-raw);
  --font-system: var(--font-system-raw);
  --font-body: var(--font-body-raw);
  --font-code: var(--font-code-raw);

  /* Effects */
  --effect-scanlines: none;
  --effect-glow: none;
  --effect-text-shadow: none;
}
```

**Step 3: Write theme files**

Create `themes/crt.css`:
```css
[data-theme="crt"] {
  --color-surface: #0a0a0a;
  --color-surface-inset: #050505;
  --color-surface-raised: #111111;
  --color-desktop: var(--color-black);
  --color-titlebar-active: #003300;
  --color-titlebar-inactive: #1a1a1a;
  --color-border-raised-light: #333333;
  --color-border-raised-dark: #000000;
  --color-border-inset-light: #1a1a1a;
  --color-border-inset-dark: #333333;
  --color-text-primary: var(--color-green-phosphor);
  --color-text-secondary: #22aa22;
  --color-text-link: var(--color-green-phosphor);
  --color-text-accent: var(--color-amber-phosphor);
  --color-code-bg: #000000;
  --color-code-text: var(--color-green-phosphor);
  --effect-scanlines: repeating-linear-gradient(
    0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px
  );
  --effect-glow: 0 0 8px rgba(51, 255, 51, 0.3);
  --effect-text-shadow: 0 0 6px rgba(51, 255, 51, 0.5);
}
```

Create `themes/inverted.css`:
```css
[data-theme="inverted"] {
  --color-surface: var(--color-gray-800);
  --color-surface-inset: var(--color-gray-900);
  --color-surface-raised: var(--color-gray-700);
  --color-desktop: #1a1a2e;
  --color-titlebar-active: var(--color-navy-400);
  --color-titlebar-inactive: var(--color-gray-600);
  --color-border-raised-light: var(--color-gray-600);
  --color-border-raised-dark: var(--color-black);
  --color-border-inset-light: var(--color-gray-900);
  --color-border-inset-dark: var(--color-gray-600);
  --color-text-primary: var(--color-gray-200);
  --color-text-secondary: var(--color-gray-400);
  --color-text-link: var(--color-teal-400);
  --color-text-accent: var(--color-navy-400);
  --color-code-bg: var(--color-black);
  --color-code-text: var(--color-gray-200);
}
```

Create `themes/cyberpunk.css`:
```css
[data-theme="cyberpunk"] {
  --color-surface: var(--color-purple-900);
  --color-surface-inset: #0d001a;
  --color-surface-raised: #2a1045;
  --color-desktop: #0d001a;
  --color-titlebar-active: var(--color-purple-500);
  --color-titlebar-inactive: #330066;
  --color-titlebar-text: var(--color-cyan-400);
  --color-border-raised-light: var(--color-magenta-400);
  --color-border-raised-dark: #330033;
  --color-border-inset-light: #220022;
  --color-border-inset-dark: var(--color-magenta-400);
  --color-text-primary: var(--color-cyan-400);
  --color-text-secondary: #aa44ff;
  --color-text-link: var(--color-magenta-400);
  --color-text-accent: var(--color-lime-400);
  --color-code-bg: #0d001a;
  --color-code-text: var(--color-lime-400);
  --effect-glow: 0 0 12px rgba(255, 0, 255, 0.3);
  --effect-text-shadow: 0 0 8px rgba(0, 255, 255, 0.4);
}
```

**Step 4: Write components.css (Tier 3)**

```css
/* Tier 3: Component-scoped tokens */
:root {
  --win31-border-width: 2px;
  --win31-titlebar-height: 18px;
  --win31-button-min-width: 75px;
  --win31-button-padding: 5px 14px;
  --win31-scrollbar-width: 16px;
  --win31-icon-size: 32px;
  --win31-icon-size-lg: 48px;
  --win31-desktop-padding: 20px;
  --win31-window-min-width: 200px;
  --win31-window-min-height: 150px;
}
```

**Step 5: Wire into globals.css**

Replace the default `globals.css` with imports plus Tailwind:
```css
@import url('https://fonts.googleapis.com/css2?family=VT323&family=Courier+Prime:wght@400;700&family=IBM+Plex+Mono:wght@400;500;600;700&family=Press+Start+2P&display=swap');
@import './styles/tokens/primitives.css';
@import './styles/tokens/semantic.css';
@import './styles/tokens/components.css';
@import './styles/themes/crt.css';
@import './styles/themes/inverted.css';
@import './styles/themes/cyberpunk.css';
@import "tailwindcss";
```

**Step 6: Verify tokens load**

Create a temp test page that reads from token variables. If teal desktop, gray panel, and pixel font render, tokens work.

**Step 7: Commit**

```bash
git add website-next/
git commit -m "feat: three-tier design token system with 4 themes"
```

---

### Task 3: Theme provider + switcher

**Files:**
- Create: `website-next/src/components/providers/ThemeProvider.tsx`
- Create: `website-next/src/components/ui/ThemeSwitcher.tsx`
- Modify: `website-next/src/app/layout.tsx`

**Step 1: Create ThemeProvider** wrapping next-themes with `attribute="data-theme"`, `defaultTheme="classic"`, `themes=["classic", "crt", "inverted", "cyberpunk"]`.

**Step 2: Create ThemeSwitcher** -- buttons for each theme with Win31 beveled styling. Active theme gets pressed (inset) border.

**Step 3: Wire into layout.tsx** -- wrap children with ThemeProvider.

**Step 4: Test** -- click each theme, verify desktop color and text change.

**Step 5: Commit**

```bash
git add website-next/
git commit -m "feat: theme provider with 4 switchable themes"
```

---

## Phase 2: Win31 Component Library

### Task 4: Fork Win31 primitives from most-professional-photo-plans

**Files:**
- Create: `website-next/src/components/win31/Win31Panel.tsx`
- Create: `website-next/src/components/win31/Win31Button.tsx`
- Create: `website-next/src/components/win31/Win31GroupBox.tsx`
- Create: `website-next/src/components/win31/Win31StatusBar.tsx`
- Create: `website-next/src/components/win31/Win31Background.tsx`
- Create: `website-next/src/components/win31/index.ts`

**Source:** `~/coding/most-professional-photo-plans/components/Win31*.tsx`

**Step 1: Copy and adapt each component**

For every component:
- Replace hardcoded hex colors with semantic token references
  - `bg-[#c0c0c0]` becomes `bg-[var(--color-surface)]`
  - `border-[#ffffff]` becomes `border-[var(--color-border-raised-light)]`
  - `border-[#000000]` becomes `border-[var(--color-border-raised-dark)]`
  - `bg-[#000080]` becomes `bg-[var(--color-titlebar-active)]`
  - `bg-[#808080]` becomes `bg-[var(--color-titlebar-inactive)]`
- Add CVA variants where applicable (Win31Button gets default/primary/danger/ghost + sm/md/lg, Win31Panel gets raised/inset/flat)
- Remove audio engine dependency (make optional via prop)

**Step 2: Create barrel export index.ts**

**Step 3: Commit**

```bash
git add website-next/src/components/win31/
git commit -m "feat: fork Win31 primitive components with CVA + tokens"
```

---

### Task 5: Win31Window + MDI Window (draggable)

**Files:**
- Create: `website-next/src/components/win31/Win31Window.tsx`
- Create: `website-next/src/components/win31/Win31MDIWindow.tsx`
- Create: `website-next/src/components/win31/Win31Scrollbar.tsx`

**Source:** `~/coding/most-professional-photo-plans/components/` (397 + 181 + 250 LOC)

Same token substitution. Keep: dragging, resizing, minimize/maximize/close, z-index management.

**Step 1-3:** Fork, adapt tokens, remove audio dependency

**Step 4:** Test -- window renders, drags, theme-switches titlebar

**Step 5: Commit**

```bash
git add website-next/src/components/win31/
git commit -m "feat: Win31Window + MDIWindow with drag/resize/themes"
```

---

### Task 6: Win31Dialog + Win31Menu with Radix primitives

**Files:**
- Create: `website-next/src/components/win31/Win31Dialog.tsx`
- Create: `website-next/src/components/win31/Win31Menu.tsx`
- Create: `website-next/src/components/win31/Win31Tooltip.tsx`
- Create: `website-next/src/components/win31/Win31Select.tsx`

Wrap Radix primitives (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-tooltip`, `@radix-ui/react-select`) with Win31 chrome styling. This gives us keyboard navigation, focus trapping, and screen reader support from Radix, with the Win31 visual layer on top.

**Step 1-4:** Build each wrapped component

**Step 5: Commit**

```bash
git add website-next/src/components/win31/
git commit -m "feat: Win31 Dialog/Menu/Tooltip/Select backed by Radix"
```

---

## Phase 3: Markdown Rendering Pipeline

### Task 7: Unified remark/rehype markdown processor

**Files:**
- Create: `website-next/src/lib/markdown.ts`
- Create: `website-next/src/components/win31/Win31Prose.tsx`

**Step 1: Install markdown deps**

```bash
cd website-next
npm install unified remark-parse remark-frontmatter remark-rehype \
  rehype-slug rehype-highlight rehype-stringify rehype-react
```

**Step 2: Write markdown processor** (`src/lib/markdown.ts`)

Pipeline: `remark-parse` -> `remark-frontmatter` -> `remark-gfm` -> `remark-rehype` -> `rehype-slug` -> `rehype-highlight` -> `rehype-react`

Use `rehype-react` to render directly to React components (avoids raw HTML injection entirely). Map HTML elements to themed React components:
- `h1` maps to a component with VT323 font + navy color + border-bottom
- `code` maps to a component with IBM Plex Mono + beveled border
- `blockquote` maps to a Win31Panel variant="inset"
- `a` maps to Next.js Link for internal, regular anchor for external

Reference implementation: `~/coding/workgroup-ai/apps/marketing/src/app/skills/[skillId]/SkillDossierClient.tsx`

**Step 3: Write Win31Prose component** -- styled wrapper that uses rehype-react output

**Step 4: Test** with a real SKILL.md file

**Step 5: Commit**

```bash
git add website-next/src/lib/ website-next/src/components/win31/Win31Prose.tsx
git commit -m "feat: remark/rehype markdown pipeline + Win31Prose"
```

---

## Phase 4: Data Layer

### Task 8: Skill data loader

**Files:**
- Create: `website-next/src/lib/skills.ts`
- Create: `website-next/src/types/skill.ts`

**Step 1:** Define Skill type interface

**Step 2:** Write skill loader that reads from `../../.claude/skills/*/SKILL.md`, extracts frontmatter, returns typed array

**Step 3:** Copy static assets (hero images, downloads)

**Step 4: Commit**

```bash
git add website-next/
git commit -m "feat: skill data loader + types"
```

---

## Phase 5: Desktop Metaphor

### Task 9: Window manager state (Zustand)

**Files:**
- Create: `website-next/src/state/windowManager.ts`

Install Zustand. Build window manager store with:
- `windows: WindowState[]` -- open windows with position, size, z-index
- `openWindow`, `closeWindow`, `focusWindow`, `minimizeWindow`, `maximizeWindow`, `restoreWindow`, `moveWindow`, `resizeWindow`

```bash
npm install zustand
git commit -m "feat: Zustand window manager store"
```

---

### Task 10: Desktop shell (Program Manager layout)

**Files:**
- Create: `website-next/src/components/desktop/Desktop.tsx`
- Create: `website-next/src/components/desktop/Taskbar.tsx`
- Create: `website-next/src/components/desktop/ProgramGroup.tsx`
- Create: `website-next/src/components/desktop/SkillIcon.tsx`
- Create: `website-next/src/components/desktop/SkillWindow.tsx`
- Modify: `website-next/src/app/page.tsx`

**Desktop.tsx** -- full-viewport container with themed background. Renders ProgramGroups (icon grids by category), Win31MDIWindows for open skills, Taskbar at bottom.

**ProgramGroup** -- Win31GroupBox containing SkillIcon components per category.

**SkillIcon** -- 32x32 hero image + skill name. Click opens SkillWindow.

**SkillWindow** -- Win31MDIWindow that loads skill markdown via API, renders via Win31Prose.

**Taskbar** -- bottom bar with Start button (dropdown), minimized window buttons, ThemeSwitcher, clock.

**page.tsx** -- loads all skills server-side, passes to Desktop client component.

```bash
git commit -m "feat: Program Manager desktop shell with taskbar"
```

---

### Task 11: Skill detail route (SEO deep links)

**Files:**
- Create: `website-next/src/app/skills/[id]/page.tsx`
- Create: `website-next/src/app/api/skills/[id]/route.ts`

Dynamic route with `generateStaticParams` + `generateMetadata` for SEO. Page renders Desktop with pre-opened window for the skill. API route returns rendered HTML for client-side window opening.

```bash
git commit -m "feat: skill deep link routes with SEO metadata"
```

---

## Phase 6: Content Migration

### Task 12: Port static assets + data files

Copy hero images, downloads, changelog.json, artifact data, bundle YAMLs.

```bash
git commit -m "feat: port static assets and data files"
```

---

### Task 13: Port remaining pages (changelog, artifacts, bundles)

Create routes for `/changelog`, `/artifacts`, `/artifacts/[type]/[id]`, `/bundles`. Each renders content inside a Win31Window on the Desktop.

```bash
git commit -m "feat: port changelog, artifacts, bundles pages"
```

---

## Phase 7: Polish and Cutover

### Task 14: Search + analytics

Client-side fuzzy search via Fuse.js. Plausible analytics script in layout.

```bash
git commit -m "feat: fuzzy search + Plausible analytics"
```

---

### Task 15: Responsive mobile fallback

Desktop metaphor >= 1024px. Below: stack windows as full-width cards, Taskbar becomes fixed bottom nav.

```bash
git commit -m "feat: responsive mobile fallback layout"
```

---

### Task 16: Production build + deployment config

Configure `output: "export"` in next.config.ts. GitHub Pages workflow. Verify `npm run build` produces static site.

```bash
git commit -m "feat: production build + GitHub Pages deployment"
```

---

### Task 17: Cutover

1. Verify all pages render
2. Move `website-next/` to `website/`
3. Update root scripts
4. Push to main
5. Verify live site

---

## Parallelization Guide

```
Stream A (Foundation):  Task 1 -> Task 2 -> Task 3
Stream B (Components):  (after Task 2) Task 4 -> Task 5 -> Task 6
Stream C (Content):     (after Task 2) Task 7 -> Task 8
Stream D (Desktop):     (after Task 5 + 8) Task 9 -> Task 10 -> Task 11
Stream E (Migration):   (after Task 8) Task 12 -> Task 13
Stream F (Polish):      (after Task 10) Task 14 -> Task 15 -> Task 16 -> Task 17
```

Critical path: A -> B -> D -> F (Tasks 1-2-3 -> 4-5 -> 9-10-11 -> 14-15-16-17)

## Task Dependency Graph

```
Task 1 (scaffold) -> everything
Task 2 (tokens) -> Tasks 3, 4, 7
Task 3 (themes) -> Task 10
Task 4 (primitives) -> Task 5
Task 5 (window) -> Tasks 6, 10
Task 7 (markdown) -> Task 8
Task 8 (data) -> Tasks 10, 11, 12, 13
Task 9 (state) -> Task 10
Task 10 (desktop) -> Tasks 11, 13, 14, 15
```

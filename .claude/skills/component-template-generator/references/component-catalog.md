# Component Catalog Reference

Component counts from 21st.dev community library (1400+ total components).

## Marketing Blocks

Use these counts to understand available pattern variety:

| Category | Count | Example Use Cases |
|----------|-------|-------------------|
| Heroes | 73 | Landing pages, above-the-fold |
| Features | 36 | Product showcases, benefits |
| Calls to Action | 34 | Conversion points, upgrades |
| Backgrounds | 33 | Section backdrops, ambient effects |
| Scroll Areas | 24 | Infinite scroll, galleries |
| Pricing Sections | 17 | SaaS pricing, tiers |
| Clients | 16 | Logo walls, social proof |
| Shaders | 15 | WebGL effects, hero backgrounds |
| Testimonials | 15 | Social proof, reviews |
| Footers | 14 | Site footer layouts |
| Borders | 12 | Decorative dividers |
| Navigation Menus | 11 | Headers, navbars |
| Announcements | 10 | Banners, alerts |
| Videos | 9 | Hero video, backgrounds |
| Docks | 6 | macOS-style docks |
| Comparisons | 6 | Before/after, feature tables |
| Maps | 2 | Location displays |

### Text & Typography Components

| Category | Count | Notes |
|----------|-------|-------|
| Texts | 58 | Animated text, reveals, typing effects |
| Hooks | 31 | Animation hooks, scroll triggers |
| Images | 26 | Image galleries, zoom effects |

## UI Components

Core interactive components for application UIs:

| Category | Count | Variants Available |
|----------|-------|-------------------|
| Buttons | 130 | Primary, secondary, ghost, icon, loading, gradient |
| Inputs | 102 | Text, search, password, OTP, validation states |
| Cards | 79 | Product, profile, feature, pricing, interactive |
| Selects | 62 | Single, multi, searchable, grouped |
| Sliders | 45 | Range, volume, progress, stepped |
| Accordions | 40 | Single, multi, animated, nested |
| Tabs | 38 | Horizontal, vertical, animated, icon |
| Dialogs/Modals | 37 | Alert, confirmation, form, full-screen |
| Calendars | 34 | Date picker, range, inline |
| AI Chats | 30 | Bubble, assistant, streaming |
| Tables | 30 | Sortable, paginated, expandable |
| Tooltips | 28 | Hover, click, rich content |
| Badges | 25 | Status, count, notification |
| Dropdowns | 25 | Menu, select, action |
| Alerts | 23 | Info, warning, error, success |
| Popovers | 23 | Hover, click, nested |
| Forms | 23 | Login, signup, contact, multi-step |
| Radio Groups | 22 | Cards, buttons, list |
| Text Areas | 22 | Auto-resize, character count |
| Spinner/Loaders | 21 | Circular, bar, skeleton |
| Paginations | 20 | Numbered, infinite, load more |
| Checkboxes | 19 | Standard, card, indeterminate |
| Menus | 18 | Context, action, nested |
| Numbers | 18 | Counter, input, stepper |
| Avatars | 17 | Image, initials, status, group |
| Links | 13 | Animated, underline, external |
| Date Pickers | 12 | Calendar, range, time |
| Toggles | 12 | Switch, segmented, icon |
| Icons | 10 | Animated, interactive |
| Sidebars | 10 | Collapsible, floating, navigation |
| File Uploads | 7 | Drag-drop, preview, progress |
| Tags | 6 | Removable, input, colored |
| Notifications | 5 | Toast, banner, badge |
| Sign Ins | 4 | Social, magic link, password |
| Sign Ups | 4 | Multi-step, social |
| File Trees | 2 | Expandable, selectable |
| Toasts | 2 | Success, error, action |
| Empty States | 1 | No data, first-time |

## Featured Components

High-quality implementations from known sources:

| Component | Author | Trend |
|-----------|--------|-------|
| Glowing Effect | Aceternity UI | glassmorphism |
| Spline Scene | Serafim | 3d-immersive |
| Display Cards | Prism UI | neobrutalism |
| Timeline | Aceternity UI | motion-design |
| Glassmorphism Trust Hero | EaseMize UI | glassmorphism |
| Flow Gradient HeroSection | Hardik Kashiyani | vibrant-colors |
| Isometric Wave Grid Background | EaseMize UI | 3d-immersive |
| Hero Dithering Card | shadway | neobrutalism |

## Component Selection by Trend

### Neobrutalism Components
Best fits: Buttons (bold shadows), Cards (thick borders), Inputs (stark contrast)
Avoid: Glassmorphism effects, soft shadows, gradients

### Glassmorphism Components
Best fits: Cards (backdrop-blur), Modals (frosted glass), Navigation (translucent)
Avoid: Hard shadows, thick borders

### Terminal Aesthetic
Best fits: Inputs (monospace), Cards (bordered), Buttons (text-only)
Avoid: Gradients, rounded corners, images

### Web3/Crypto
Best fits: Buttons (gradient glow), Cards (dark + neon), Pricing (tier comparison)
Avoid: Light themes, muted colors

### Swiss Minimalist
Best fits: Cards (grid-based), Typography (scale-driven), Layout (whitespace)
Avoid: Decoration, shadows, heavy borders

## Mapping to Design System Generator

When generating a design system, use component counts to prioritize:

1. **High-count = common need**: Buttons (130), Inputs (102), Cards (79) should have robust token coverage
2. **Low-count = specialized**: File Trees (2), Empty States (1) can use base tokens
3. **Marketing vs UI**: Heroes (73) need different tokens than Checkboxes (19)

### Token Priority Matrix

| Component | Needs Colors | Needs Shadows | Needs Animation |
|-----------|-------------|---------------|-----------------|
| Buttons | ✅ High | ✅ High | ⚠️ Medium |
| Cards | ✅ High | ✅ High | ⚠️ Medium |
| Inputs | ✅ High | ⚠️ Medium | ❌ Low |
| Heroes | ✅ High | ⚠️ Medium | ✅ High |
| Modals | ⚠️ Medium | ✅ High | ✅ High |
| Tables | ⚠️ Medium | ❌ Low | ❌ Low |

## Related Design Systems

Referenced design systems from Component Gallery (95 total, 2680 examples):

| System | Tech Stack | Strengths |
|--------|------------|-----------|
| Elastic UI | React, CSS-in-JS | Enterprise, data-heavy |
| Sainsbury's | React, Sass | Retail, accessibility |
| Ariakit | React | Accessibility-first |
| Web Awesome | Web Components | Framework-agnostic |
| Red Hat | Web Components | Enterprise, PatternFly |
| HeroUI | React, Tailwind | Modern, Tailwind-native |
| Morningstar | Vue | Financial, data viz |

Use these as reference implementations when generating components for similar use cases.

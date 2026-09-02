# Swiss Modern Page Templates

Complete page layouts for common Swiss Modern web applications. Each template uses the 12-column grid with proper typographic hierarchy, restrained color, and generous whitespace.

## SaaS Landing Page

### Full Page Structure

```
┌────────────────────────────────────────────────────────────────┐
│  NAVIGATION (sticky)                                           │
│  Logo          Features  Pricing  Docs  Blog     [Sign Up]    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                        96px padding                            │
│                                                                │
│  HERO (col 1-8 of 12)                                         │
│  ─────────────────────                                        │
│  Overline: PLATFORM                                           │
│  H1: Build better software,                                   │
│      faster.                                                   │
│                                                                │
│  Body: The modern platform for teams who ship.                │
│  Max-width 50ch, color: charcoal.                             │
│                                                                │
│  [Get Started]  Learn more →                                  │
│                                                                │
│                       128px padding                            │
│                                                                │
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│                                                                │
│  SOCIAL PROOF                                                  │
│  Overline: TRUSTED BY 2,000+ TEAMS                            │
│                                                                │
│  [logo]  [logo]  [logo]  [logo]  [logo]  [logo]              │
│  opacity: 0.4, grayscale                                       │
│                                                                │
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│                                                                │
│  FEATURES (alternating 7/5 split)                              │
│  ─────────────────────────────────                             │
│                                                                │
│  ┌─────── 7 cols ──────┐  ┌── 5 cols ──┐                     │
│  │ Overline: WORKFLOWS  │  │            │                     │
│  │ H2: Automate your    │  │  [visual]  │                     │
│  │     workflow          │  │            │                     │
│  │ Body text...          │  │            │                     │
│  └──────────────────────┘  └────────────┘                     │
│                                                                │
│  ┌── 5 cols ──┐  ┌─────── 7 cols ──────┐                     │
│  │            │  │ Overline: ANALYTICS  │                     │
│  │  [visual]  │  │ H2: Measure what     │                     │
│  │            │  │     matters           │                     │
│  │            │  │ Body text...          │                     │
│  └────────────┘  └──────────────────────┘                     │
│                                                                │
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│                                                                │
│  TESTIMONIAL (centered, narrow)                                │
│  ─────────────────────────────                                 │
│  col 3-10 (8 of 12)                                           │
│                                                                │
│  "Quote text, large, italic or regular at text-xl"             │
│  — Name, Title at Company                                      │
│                                                                │
├─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┤
│                                                                │
│  CTA SECTION                                                   │
│  ───────────                                                   │
│  H2: Ready to get started?                                    │
│  Body: Start free, no credit card required.                   │
│                                                                │
│  [Start Free Trial]                                            │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  FOOTER                                                        │
│  Logo          Product    Company    Resources    Legal        │
│               Features   About      Blog         Privacy     │
│               Pricing    Careers    Docs          Terms       │
│               Changelog  Contact    Help                       │
│                                                                │
│  ─────────────────────────────────────────────────             │
│  © 2026 Company. All rights reserved.                         │
└────────────────────────────────────────────────────────────────┘
```

### Key CSS

```css
/* Navigation */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--swiss-silver);
  padding: var(--space-4) var(--margin);
}

/* Hero */
.hero {
  padding: var(--space-24) 0 var(--space-32);
}

.hero h1 {
  font-size: clamp(2.5rem, 5vw, 4.2rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.05;
  max-width: 12ch; /* Forces line breaks for dramatic short lines */
}

.hero .lead {
  font-size: var(--text-lg);
  color: var(--swiss-charcoal);
  max-width: 50ch;
  margin-top: var(--space-6);
}

/* Social proof logos */
.logos {
  display: flex;
  align-items: center;
  gap: var(--space-10);
  filter: grayscale(1);
  opacity: 0.4;
}

.logos img {
  height: 24px;
  width: auto;
}

/* Feature sections */
.feature-row {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--gutter);
  align-items: center;
  padding: var(--space-24) 0;
}

.feature-row:nth-child(odd) .feature-text { grid-column: 1 / 8; }
.feature-row:nth-child(odd) .feature-visual { grid-column: 8 / -1; }
.feature-row:nth-child(even) .feature-text { grid-column: 6 / -1; }
.feature-row:nth-child(even) .feature-visual { grid-column: 1 / 6; order: -1; }

/* Footer */
.footer {
  border-top: 1px solid var(--swiss-silver);
  padding: var(--space-16) 0 var(--space-8);
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr repeat(4, 1fr);
  gap: var(--gutter);
}
```

---

## Dashboard Layout

### Structure

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER BAR                                                   │
│  [☰]  Logo      Search [⌘K]                    [🔔] [👤]    │
├──────────┬───────────────────────────────────────────────────┤
│          │                                                    │
│  SIDEBAR │  PAGE HEADER                                       │
│  ────────│  ──────────────                                    │
│          │  H1: Overview                            [Export]  │
│  Home    │                                                    │
│  · Issues│  METRIC CARDS (4-up)                              │
│  Projects│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐             │
│  · Active│  │ MRR  │ │Users │ │ NPS  │ │Churn │             │
│  · Archvd│  │$124k │ │12.8k │ │ 72   │ │2.1%  │             │
│  Team    │  │↑12%  │ │↑8%   │ │↑4    │ │↓0.3% │             │
│  Settings│  └──────┘ └──────┘ └──────┘ └──────┘             │
│          │                                                    │
│          │  CONTENT AREA                                      │
│          │  ──────────────                                    │
│          │  ┌────────────────────────────────────────┐       │
│          │  │ Recent Activity         [View All →]    │       │
│          │  ├────────────────────────────────────────┤       │
│          │  │ · Item description        $amt   time  │       │
│          │  │ · Item description        $amt   time  │       │
│          │  │ · Item description        $amt   time  │       │
│          │  └────────────────────────────────────────┘       │
│          │                                                    │
└──────────┴───────────────────────────────────────────────────┘
```

### Key CSS

```css
.dashboard {
  display: grid;
  grid-template-columns: 240px 1fr;
  grid-template-rows: 56px 1fr;
  height: 100vh;
}

.dashboard-header {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  padding: 0 var(--space-4);
  border-bottom: 1px solid var(--swiss-silver);
  gap: var(--space-4);
}

.dashboard-sidebar {
  border-right: 1px solid var(--swiss-silver);
  padding: var(--space-4) var(--space-3);
  overflow-y: auto;
}

.dashboard-sidebar .nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--swiss-charcoal);
  cursor: pointer;
}

.dashboard-sidebar .nav-item:hover {
  background: var(--swiss-mist);
}

.dashboard-sidebar .nav-item--active {
  background: var(--swiss-mist);
  color: var(--swiss-black);
  font-weight: 500;
}

.dashboard-main {
  overflow-y: auto;
  padding: var(--space-8);
}

/* Metric cards grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

@media (max-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
  .dashboard-sidebar {
    display: none;
  }
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## Documentation Layout

### Structure

```
┌──────────────────────────────────────────────────────────────┐
│  HEADER                                                       │
│  Logo  Docs  API  Guides  Blog                   [Search ⌘K] │
├─────────┬──────────────────────────────────┬─────────────────┤
│         │                                  │                  │
│ SIDEBAR │  CONTENT                         │ TABLE OF         │
│ ────────│  ───────                         │ CONTENTS         │
│         │                                  │ ──────────       │
│ Getting │  H1: Authentication              │                  │
│ Started │                                  │ Overview         │
│ > Intro │  Body text in a comfortable      │ API Keys         │
│ > Setup │  reading column (65ch max).       │ OAuth 2.0        │
│         │  Well-spaced paragraphs with      │ JWT Tokens       │
│ Core    │  generous line-height.            │ Best Practices   │
│ > Auth  │                                  │                  │
│ > API   │  ## API Keys                     │                  │
│ > Hooks │                                  │                  │
│         │  ```code block```                │                  │
│ Advanced│                                  │                  │
│ > Perf  │  ## OAuth 2.0                    │                  │
│ > Scale │                                  │                  │
│         │  Body text continues...          │                  │
│         │                                  │                  │
│         │  ┌────────────────────────────┐  │                  │
│         │  │ 💡 Note: Important info... │  │                  │
│         │  └────────────────────────────┘  │                  │
│         │                                  │                  │
├─────────┴──────────────────────────────────┴─────────────────┤
│  FOOTER                                                       │
│  Previous: Getting Started        Next: API Reference →      │
└──────────────────────────────────────────────────────────────┘
```

### Key CSS

```css
.docs-layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 200px;
  gap: 0;
  max-width: 1400px;
  margin: 0 auto;
}

.docs-sidebar {
  position: sticky;
  top: 56px;
  height: calc(100vh - 56px);
  overflow-y: auto;
  padding: var(--space-6) var(--space-4);
  border-right: 1px solid var(--swiss-silver);
}

.docs-content {
  padding: var(--space-10) var(--space-12);
  max-width: var(--reading-width);
}

.docs-content h1 {
  font-size: var(--text-3xl);
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: var(--space-4);
}

.docs-content h2 {
  font-size: var(--text-xl);
  font-weight: 600;
  margin-top: var(--space-12);
  margin-bottom: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--swiss-mist);
}

.docs-content p {
  margin-bottom: var(--space-4);
  line-height: 1.7;
}

.docs-content pre {
  background: var(--swiss-snow);
  border: 1px solid var(--swiss-mist);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  margin: var(--space-6) 0;
  overflow-x: auto;
  font-size: var(--text-sm);
  line-height: 1.7;
}

.docs-toc {
  position: sticky;
  top: 56px;
  height: calc(100vh - 56px);
  overflow-y: auto;
  padding: var(--space-6) var(--space-4);
  border-left: 1px solid var(--swiss-silver);
}

.docs-toc a {
  display: block;
  font-size: var(--text-xs);
  color: var(--swiss-stone);
  padding: var(--space-1) 0;
  border-left: 2px solid transparent;
  padding-left: var(--space-3);
}

.docs-toc a:hover {
  color: var(--swiss-ink);
}

.docs-toc a.active {
  color: var(--swiss-black);
  border-left-color: var(--swiss-black);
  font-weight: 500;
}

/* Callout/admonition */
.docs-callout {
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--swiss-accent);
  background: var(--swiss-accent-light);
  margin: var(--space-6) 0;
  font-size: var(--text-sm);
}

/* Mobile collapse */
@media (max-width: 1024px) {
  .docs-layout {
    grid-template-columns: 1fr;
  }
  .docs-sidebar,
  .docs-toc {
    display: none;
  }
  .docs-content {
    padding: var(--space-6) var(--space-4);
  }
}
```

---

## Pricing Page

### Structure

```
┌────────────────────────────────────────────────────────────────┐
│  NAV                                                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                  Simple, transparent pricing.                   │
│                  No surprises. No hidden fees.                 │
│                                                                │
│           [Monthly]  [Annual — Save 20%]                       │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ STARTER      │  │ PRO          │  │ ENTERPRISE   │        │
│  │              │  │ ────────     │  │              │        │
│  │ $0           │  │ $29          │  │ Custom       │        │
│  │ /month       │  │ /month       │  │              │        │
│  │              │  │              │  │              │        │
│  │ For indie    │  │ For growing  │  │ For large    │        │
│  │ developers   │  │ teams        │  │ organizations│        │
│  │              │  │              │  │              │        │
│  │ ✓ 3 projects │  │ ✓ Unlimited  │  │ ✓ Everything │        │
│  │ ✓ 1 team     │  │ ✓ 10 teams   │  │ ✓ SSO/SAML  │        │
│  │ ✓ Basic      │  │ ✓ Advanced   │  │ ✓ SLA        │        │
│  │              │  │              │  │ ✓ Dedicated  │        │
│  │ [Get Started]│  │ [Get Started]│  │ [Contact Us] │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                │
│                     FAQ Section                                │
│                     ───────────                                │
│                     Accordion items...                         │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  FOOTER                                                        │
└────────────────────────────────────────────────────────────────┘
```

### Key CSS

```css
.pricing-header {
  text-align: center;
  padding: var(--space-20) 0 var(--space-12);
}

.pricing-header h1 {
  font-size: var(--text-3xl);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.pricing-header p {
  color: var(--swiss-charcoal);
  margin-top: var(--space-3);
}

/* Period toggle */
.pricing-toggle {
  display: inline-flex;
  background: var(--swiss-mist);
  border-radius: var(--radius-lg);
  padding: 3px;
  margin-top: var(--space-8);
}

.pricing-toggle button {
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  border: none;
  background: transparent;
  color: var(--swiss-charcoal);
  cursor: pointer;
}

.pricing-toggle button.active {
  background: var(--swiss-white);
  color: var(--swiss-black);
  box-shadow: var(--shadow-sm);
}

/* Cards */
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-6);
  max-width: 960px;
  margin: 0 auto;
  padding: 0 var(--margin);
}

.pricing-card {
  border: 1px solid var(--swiss-silver);
  border-radius: var(--radius-lg);
  padding: var(--space-8);
}

.pricing-card--featured {
  border-color: var(--swiss-accent);
  box-shadow: 0 0 0 1px var(--swiss-accent);
  position: relative;
}

.pricing-card__plan {
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--swiss-stone);
}

.pricing-card__price {
  font-size: var(--text-4xl);
  font-weight: 700;
  letter-spacing: -0.03em;
  margin: var(--space-3) 0 var(--space-1);
}

.pricing-card__period {
  font-size: var(--text-sm);
  color: var(--swiss-stone);
}

.pricing-card__features {
  margin-top: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  font-size: var(--text-sm);
}

.pricing-card__features li {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.pricing-card__features li::before {
  content: '✓';
  color: var(--swiss-success);
  font-weight: 700;
}

@media (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }
}
```

---

## About / Team Page

### Structure

```
┌────────────────────────────────────────────────────────────────┐
│  NAV                                                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─ 3 cols ─┐  ┌───────── 8 cols (offset) ──────────┐       │
│  │  (empty)  │  │                                      │       │
│  │           │  │  Overline: ABOUT US                  │       │
│  │           │  │                                      │       │
│  │           │  │  H1: We're building the future       │       │
│  │           │  │      of developer tools.             │       │
│  │           │  │                                      │       │
│  │           │  │  Lead paragraph at text-lg, stone    │       │
│  │           │  │  color. Two or three sentences that  │       │
│  │           │  │  capture the mission.                │       │
│  │           │  │                                      │       │
│  └───────────┘  └──────────────────────────────────────┘       │
│                                                                │
│                        96px gap                                │
│                                                                │
│  ┌─────── full width image or simple visual ───────┐          │
│  │                                                   │          │
│  │  (Objective photography, not illustration)        │          │
│  │                                                   │          │
│  └───────────────────────────────────────────────────┘          │
│                                                                │
│                        96px gap                                │
│                                                                │
│  H2: Our Values                                               │
│                                                                │
│  ┌────────┐  ┌────────┐  ┌────────┐                          │
│  │ Value 1│  │ Value 2│  │ Value 3│  (4-col each)            │
│  │ Title  │  │ Title  │  │ Title  │                          │
│  │ Body   │  │ Body   │  │ Body   │                          │
│  └────────┘  └────────┘  └────────┘                          │
│                                                                │
│                        96px gap                                │
│                                                                │
│  H2: Team                                                     │
│                                                                │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐                     │
│  │ Photo│  │ Photo│  │ Photo│  │ Photo│  (3-col each)        │
│  │ Name │  │ Name │  │ Name │  │ Name │                      │
│  │ Role │  │ Role │  │ Role │  │ Role │                      │
│  └──────┘  └──────┘  └──────┘  └──────┘                     │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  FOOTER                                                        │
└────────────────────────────────────────────────────────────────┘
```

### Key CSS

```css
.about-hero {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--gutter);
  padding: var(--space-20) 0;
}

.about-hero__content {
  grid-column: 4 / 12; /* Offset: 3 empty columns left, 8 content columns */
}

.about-hero__overline {
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--swiss-accent);
  margin-bottom: var(--space-4);
}

.about-hero h1 {
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
  max-width: 18ch;
}

.about-hero .lead {
  font-size: var(--text-lg);
  color: var(--swiss-charcoal);
  max-width: 55ch;
  margin-top: var(--space-6);
  line-height: 1.65;
}

/* Team grid */
.team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-8) var(--gutter);
}

.team-member img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-3);
  filter: grayscale(0.3); /* Swiss restraint on photography */
}

.team-member__name {
  font-weight: 600;
  font-size: var(--text-base);
}

.team-member__role {
  font-size: var(--text-sm);
  color: var(--swiss-stone);
}

@media (max-width: 768px) {
  .about-hero__content {
    grid-column: 1 / -1;
  }
  .team-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## Blog / Article Layout

### Key CSS

```css
.article-layout {
  max-width: var(--reading-width);
  margin: 0 auto;
  padding: var(--space-16) var(--margin);
}

.article-header {
  margin-bottom: var(--space-12);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--text-sm);
  color: var(--swiss-stone);
  margin-bottom: var(--space-6);
}

.article-header h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.article-header .subtitle {
  font-size: var(--text-lg);
  color: var(--swiss-charcoal);
  margin-top: var(--space-4);
  max-width: 50ch;
}

/* Prose styles */
.article-body p {
  font-size: var(--text-base);
  line-height: 1.75;
  margin-bottom: var(--space-5);
}

.article-body h2 {
  font-size: var(--text-2xl);
  font-weight: 600;
  margin-top: var(--space-16);
  margin-bottom: var(--space-4);
  letter-spacing: -0.01em;
}

.article-body h3 {
  font-size: var(--text-xl);
  font-weight: 600;
  margin-top: var(--space-10);
  margin-bottom: var(--space-3);
}

.article-body blockquote {
  border-left: 3px solid var(--swiss-silver);
  padding-left: var(--space-6);
  margin: var(--space-8) 0;
  color: var(--swiss-charcoal);
  font-size: var(--text-lg);
}

.article-body figure {
  margin: var(--space-10) calc(-1 * var(--space-8));
}

.article-body figcaption {
  font-size: var(--text-xs);
  color: var(--swiss-stone);
  text-align: center;
  margin-top: var(--space-3);
}

.article-body ul,
.article-body ol {
  padding-left: var(--space-6);
  margin-bottom: var(--space-5);
}

.article-body li {
  margin-bottom: var(--space-2);
  line-height: 1.7;
}
```

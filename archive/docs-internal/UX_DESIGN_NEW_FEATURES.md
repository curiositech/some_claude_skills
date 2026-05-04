# UX Design: New Features for Some Claude Skills

**Design System:** Windows 3.1 Aesthetic (retro desktop UI, pixel art, teal/lime/yellow accents)
**Target Users:** Developers using Claude Code (ranging from complete beginners to power users)
**Design Date:** January 2026
**Status:** Design Specification

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Feature 1: Tutorial System](#feature-1-tutorial-system)
3. [Feature 2: Skill Bundles](#feature-2-skill-bundles)
4. [Feature 3: Video Integration](#feature-3-video-integration)
5. [Feature 4: Onboarding Flow](#feature-4-onboarding-flow)
6. [Feature 5: User Journey Maps](#feature-5-user-journey-maps)
7. [Component Specifications](#component-specifications)
8. [Information Architecture](#information-architecture)
9. [Accessibility Considerations](#accessibility-considerations)

---

## Design Principles

### Win31 Aesthetic Constraints

1. **Typography Hierarchy:**
   - Hero/Display: `Press Start 2P` (8-32px) - pixel art titles, badges
   - Window Titles: `VT323` (13-16px) - title bars only
   - UI System: `IBM Plex Mono` (11-14px) - buttons, labels, menus
   - Body Text: `Courier Prime` (14-16px) - readable paragraphs
   - Code: `IBM Plex Mono` (12-14px) - terminal, code blocks

2. **Color Palette:**
   - Primary Actions: `--win31-lime` (#00FF00)
   - Secondary Actions: `--win31-bright-yellow` (#FFD700)
   - Tertiary/Info: `--win31-teal` (#008080)
   - Error/Warning: `--win31-bright-red` (#DC143C)
   - Surface: `--win31-gray` (#c0c0c0)
   - Title Bars: `--win31-navy` (#000080)

3. **UI Patterns:**
   - Everything is a "window" with title bar + content
   - 3D beveled buttons (`.win31-btn-3d`)
   - Drop shadows: `12px 12px 0 rgba(0,0,0,0.5)`
   - Status bars at bottom with panels
   - "NEW" pixel badges, ribbon labels
   - Modal overlays with dark backdrop

4. **Interaction Patterns:**
   - Click-heavy (not swipe/gesture)
   - Desktop metaphor (files, folders, windows)
   - Progressive disclosure via collapsible sections
   - Immediate feedback (toast messages, color changes)

---

## Feature 1: Tutorial System

### User Goals
- **Absolute beginner:** "I've never used Claude Code. What is this?"
- **Intermediate user:** "I want to install a skill and see it work"
- **Advanced user:** "I want to build my own skill"

### Design Solution: 3-Tier Tutorial Hub

#### 1.1 Tutorial Hub Page (`/tutorials`)

**Layout:** File Manager metaphor - folders representing learning paths

```
┌─────────────────────────────────────────────────────────────────┐
│ [─] TUTORIALS.EXE                                      [▲][▼][X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🎓 Learn Claude Skills in 3 Steps                               │
│     Pick your starting point below ↓                             │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ 📁 LEVEL_1.DIR   │  │ 📁 LEVEL_2.DIR   │  │ 📁 LEVEL_3.DIR │ │
│  │                  │  │                  │  │                │ │
│  │ Getting Started  │  │ Using Skills     │  │ Creating Skills│ │
│  │                  │  │                  │  │                │ │
│  │ Never used       │  │ I have Claude    │  │ Build your own │ │
│  │ Claude Code?     │  │ Code installed   │  │ expert skills  │ │
│  │                  │  │                  │  │                │ │
│  │ ⏱ 5 min read     │  │ ⏱ 10 min demo    │  │ ⏱ 30 min hands │
│  │ 🎬 Video included│  │ 🎬 Video included│  │ 📖 Written guide│
│  │                  │  │                  │  │                │ │
│  │ [Open Folder]    │  │ [Open Folder]    │  │ [Open Folder]  │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                                   │
├───────────────────────────────────────────────────────────────────┤
│ 3 Levels | 12 Tutorials | All Free                         Help │
└───────────────────────────────────────────────────────────────────┘
```

**Component Specs:**
- **Container:** `.win31-window` with title bar "TUTORIALS.EXE"
- **Hero Text:** `--font-display`, 16px, `--win31-lime`, text-shadow for depth
- **Folder Cards:**
  - 3 columns on desktop, stack on mobile
  - Hover: lift shadow, darken folder icon
  - Click: navigate to tutorial index for that level
- **Time Estimates:** Small badge, `--font-code`, 10px, gray background
- **Media Icons:** 🎬 for video, 📖 for text-only

#### 1.2 Individual Tutorial Page Structure

**Interactive Tutorial Components:**

```
┌─────────────────────────────────────────────────────────────────┐
│ [─] TUTORIAL_01_INSTALL.TXT                            [▲][▼][X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌─ Progress Bar ───────────────────────────────────────────────┐ │
│ │ ████████░░░░░░░░░░░░░░  Step 3 of 7  (42% complete)         │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─ Video Preview ──────────────────────────────────────────────┐ │
│ │ ┌──────────────────────────────────────────────────────────┐ │ │
│ │ │ [▶ PLAY VIDEO: Installing Your First Skill (2:30)]       │ │ │
│ │ │                                                           │ │ │
│ │ │   [Thumbnail: Claude Code interface with skill menu]     │ │ │
│ │ └──────────────────────────────────────────────────────────┘ │ │
│ │ Prefer text? [Skip video, show step-by-step ▼]              │ │
│ └──────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─ Step 3: Copy the Install Command ──────────────────────────┐ │
│ │                                                               │ │
│ │ Open your terminal and paste this command:                   │ │
│ │                                                               │ │
│ │ ┌─────────────────────────────────────────────────┐          │ │
│ │ │ /plugin install python-pro@some-claude-skills   │  [COPY]  │ │
│ │ └─────────────────────────────────────────────────┘          │ │
│ │                                                               │ │
│ │ ☑ I've copied this command                                   │ │
│ │ ☐ I ran the command in my terminal                           │ │
│ │ ☐ I saw a success message                                    │ │
│ │                                                               │ │
│ │                               [◀ Back]  [Next: Test It ▶]    │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ 💡 Stuck? [Open Help Panel] | 🎯 [Jump to specific step ▼]      │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Component Specs:**

1. **Progress Bar:**
   - Width: 100% of content area
   - Height: 32px
   - Background: `--win31-dark-gray`
   - Fill: `--win31-lime` gradient
   - Text: `--font-system`, 12px, centered, white

2. **Video Preview Box:**
   - Collapsible/expandable
   - Embedded YouTube/Vimeo player (responsive 16:9)
   - Fallback thumbnail if video not loaded
   - "Skip video" toggle reveals text steps below

3. **Interactive Checklist:**
   - Checkbox styling: Win31 checkboxes (hollow square → filled when checked)
   - Checks persist in localStorage (user can resume tutorial)
   - "Next" button only enabled when all checks complete (can override)

4. **Code Block with Copy:**
   - Same styling as homepage install hero
   - Background: `#000`, border: `2px solid --win31-lime`
   - Copy button changes to "✓ COPIED" for 2 seconds
   - Font: `--font-code`, 13px

5. **Help Panel (Collapsible):**
   - Accordion-style, opens below current step
   - Background: `--win31-light-gray`
   - Contains: FAQ for that step, link to Discord/support

#### 1.3 Tutorial Categories

**Level 1: Getting Started (Complete Beginners)**
- What is Claude Code? (2 min read)
- Installing Claude Code (3 min + video)
- Your First Skill Install (5 min + video)
- Testing a Skill (3 min + video)

**Level 2: Using Skills (Intermediate)**
- Browse the Gallery (3 min)
- Skill Bundles for Your Workflow (4 min)
- Combining Multiple Skills (6 min)
- Updating Skills (2 min)

**Level 3: Creating Skills (Advanced)**
- Skill Anatomy 101 (10 min)
- Writing Your First Skill (15 min)
- Activation Patterns & Keywords (8 min)
- Publishing to Marketplace (5 min)

### Information Architecture

**Where Tutorials Live:**
- **Primary Access:** Navbar item "Tutorials" (always visible)
- **Secondary Access:** Homepage hero section CTA: "New to Claude Code? [Start Tutorial →]"
- **Tertiary Access:** Skill detail pages: "Not sure how to use this? [Watch Tutorial]"

**Tutorial State Persistence:**
- localStorage tracks: completed tutorials, current step, checkbox progress
- Dashboard widget shows: "3/12 tutorials completed - Continue Learning →"

---

## Feature 2: Skill Bundles

### User Goals
- **Efficiency:** "I don't want to install 10 skills one by one"
- **Discovery:** "What skills go well together for my use case?"
- **Customization:** "I want most of this bundle, but not all of it"

### Design Solution: Curated Bundles with Customization Flow

#### 2.1 Bundles Landing Page (`/bundles`)

**Layout:** Product showcase with filtering

```
┌─────────────────────────────────────────────────────────────────┐
│ [─] BUNDLES.DLL                                        [▲][▼][X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📦 Skill Bundles - One-Click Installs                            │
│     Curated skill packs for common workflows                     │
│                                                                   │
│  ┌─ Filters ──────────────────────────────────────────────────┐  │
│  │ [All] [Developer] [Designer] [Content] [Personal] [ML/AI]  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 🔥 FEATURED BUNDLE                                           │  │
│  │ ┌───────────────────────────────────────────────────────────┐ │
│  │ │ 🐍 Full-Stack Python Developer                            │ │
│  │ │                                                            │ │
│  │ │ Perfect for backend engineers, API builders, data         │ │
│  │ │ engineers. Includes Python, SQL, Docker, API design.      │ │
│  │ │                                                            │ │
│  │ │ ✓ 8 skills included  ⏱ 2 min install  ⭐ Most popular      │ │
│  │ │                                                            │ │
│  │ │ [Preview Bundle >]        [⚡ Install All (Recommended)]   │ │
│  │ └───────────────────────────────────────────────────────────┘ │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ 🎨 UI/UX Designer │  │ 📝 Content Creator│ │ 🧠 Founder Pack│ │
│  │                  │  │                  │  │                │ │
│  │ 6 skills         │  │ 5 skills         │  │ 7 skills       │ │
│  │ Design systems,  │  │ Copywriting, SEO,│  │ Pitch decks,   │ │
│  │ typography, color│  │ social media     │  │ biz analysis   │ │
│  │                  │  │                  │  │                │ │
│  │ [Preview]        │  │ [Preview]        │  │ [Preview]      │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ 🤖 ML Engineer    │  │ 💬 Chatbot Builder│ │ 🎬 Video Producer│
│  │ 9 skills         │  │ 4 skills         │  │ 6 skills       │
│  │ CV, audio, NLP,  │  │ Bot dev, crisis, │  │ Script, edit,  │ │
│  │ embeddings       │  │ analytics        │  │ thumbnails     │ │
│  │                  │  │                  │  │                │ │
│  │ [Preview]        │  │ [Preview]        │  │ [Preview]      │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                                   │
│  💡 Don't see what you need? [Request a Bundle]                  │
│                                                                   │
├───────────────────────────────────────────────────────────────────┤
│ 8 Bundles | 54 Skills Bundled | All Free                    Help │
└───────────────────────────────────────────────────────────────────┘
```

**Component Specs:**

1. **Bundle Card (Grid Item):**
   - Width: 280px (3 columns on desktop, 2 on tablet, 1 on mobile)
   - Height: 220px
   - Background: `--win31-gray`
   - Border: `3px solid --win31-black`
   - Box shadow: `8px 8px 0 rgba(0,0,0,0.3)`
   - Hover: lift shadow to `12px 12px`

2. **Featured Bundle (Hero):**
   - Full width banner above grid
   - Background: gradient `--win31-navy` to `--win31-teal`
   - Border: `4px solid --win31-lime` (glowing effect)
   - Height: 200px
   - Contains: title, description, stats, 2 CTAs

3. **Filter Bar:**
   - Sticky at top when scrolling
   - Tab-style buttons (active = pressed inset bevel)
   - Font: `--font-system`, 12px, bold

4. **Bundle Stats Icons:**
   - ✓ = skill count
   - ⏱ = install time estimate
   - ⭐ = popularity indicator (can be "Most Popular", "Editor's Pick", "New")

#### 2.2 Bundle Detail / Customization Modal

**Triggered by:** "Preview Bundle" button

```
┌─────────────────────────────────────────────────────────────────┐
│ [─] 🐍 Full-Stack Python Developer Bundle              [▲][▼][X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌─ Bundle Overview ─────────────────────────────────────────────┐│
│ │ Everything you need to build production Python apps with      ││
│ │ Claude Code. Backend APIs, database design, Docker, testing.  ││
│ │                                                                ││
│ │ Created by: Erich Owens | Updated: Jan 2026 | ⭐ Most Popular ││
│ └───────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Customize This Bundle ────────────────────────────────────────┐│
│ │                                                                ││
│ │ ☑ python-pro         Core Python expertise (REQUIRED)         ││
│ │ ☑ api-architect      REST/GraphQL API design                  ││
│ │ ☑ data-pipeline-eng  SQL, data modeling, ETL                  ││
│ │ ☑ devops-automator   Docker, CI/CD, deployment                ││
│ │ ☑ test-driven-dev    Pytest, fixtures, mocking                ││
│ │ ☐ cloudflare-worker  Edge computing (Optional)                ││
│ │ ☐ drizzle-migrations Database schema management (Optional)    ││
│ │ ☑ backend-architect  System design patterns                   ││
│ │                                                                ││
│ │ 6 core + 2 optional selected = 8 skills total                 ││
│ │ Estimated install time: ~2 minutes                            ││
│ │                                                                ││
│ │ [Reset to Defaults]                     [Preview Install Cmd] ││
│ └───────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ What You'll Build ───────────────────────────────────────────┐│
│ │ • Production REST APIs with FastAPI/Flask                     ││
│ │ • Database schemas and migrations                             ││
│ │ • Containerized deployments with Docker                       ││
│ │ • CI/CD pipelines for automated testing                       ││
│ │ • Scalable backend architectures                              ││
│ └───────────────────────────────────────────────────────────────┘│
│                                                                   │
│ ┌─ Example Projects ────────────────────────────────────────────┐│
│ │ 🎬 Video: Build a Reddit Clone API in 15 minutes              ││
│ │    Watch how these skills work together →                     ││
│ └───────────────────────────────────────────────────────────────┘│
│                                                                   │
│               [← Back to Bundles]   [⚡ Install Selected Skills] │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Interaction Flow:**

1. **Checkbox Selection:**
   - Core skills have `(REQUIRED)` label, checkboxes disabled
   - Optional skills can be toggled
   - Live update of skill count and install time

2. **Preview Install Command:**
   - Expands a code block showing multi-line terminal commands
   - One `/plugin install` per skill (can copy all at once)

3. **Install Selected Skills:**
   - Generates single command or script
   - Downloads a `.sh` file user can run, or copies to clipboard
   - Shows success modal: "8 skills installed! [Start Tutorial] [Browse Gallery]"

**Component Specs:**

1. **Modal:**
   - Max-width: 800px
   - Max-height: 90vh, scrollable content
   - Dark overlay backdrop: `rgba(0,0,0,0.85)`
   - Standard `.win31-window` styling

2. **Skill Checklist:**
   - Each row: checkbox + skill name + brief description
   - Hover: highlight row with `--win31-light-gray` background
   - Required items: gray checkbox, italic "(REQUIRED)" label

3. **Install Button:**
   - Primary CTA: `--win31-lime` background, `--win31-black` text
   - Large: 180px wide, 44px tall
   - Font: `--font-system`, 14px, bold

#### 2.3 Bundle Discovery Strategy

**Where Bundles Appear:**

1. **Homepage:** New nav window in 3-column section
   ```
   ┌──────────────────┐
   │ 📦 BUNDLES.DLL   │
   │ Skill Packs      │
   │ One-click install│
   │ 8 curated bundles│
   │ [Open Bundles]   │
   └──────────────────┘
   ```

2. **Gallery Page (`/skills`):** Filter option "View Bundles" alongside category filters

3. **Individual Skill Pages:** "This skill is part of [Python Developer Bundle] →"

4. **Onboarding:** First-time users see: "Get started fast: [Explore Bundles]"

**Bundle vs. Individual Skills Navigation:**

- Bundles page has breadcrumb: `Home > Bundles > [Bundle Name]`
- Toggle in gallery header: `[All Skills] [Bundles Only]`
- Search works across both (type "python" shows both individual skill and bundle)

---

## Feature 3: Video Integration

### User Goals
- **Visual learners:** "I want to see it in action, not just read about it"
- **Quick demos:** "Show me the result in 2 minutes"
- **Deep dives:** "I want a 15-minute walkthrough of building something real"

### Design Solution: Embedded Video Player + Video Gallery

#### 3.1 Video Player Component (Embedded in Pages)

**Where Videos Appear:**

1. **Skill Detail Pages:** Top of page, below hero image
2. **Tutorial Pages:** Step-by-step videos
3. **Bundle Pages:** "See this bundle in action" demo
4. **Homepage:** Featured video of the week

**Component Design:**

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─ Watch: Install and Use Python Pro (2:45) ──────────────────┐ │
│ │                                                               │ │
│ │ ┌───────────────────────────────────────────────────────────┐ │ │
│ │ │                                                           │ │ │
│ │ │         [▶ PLAY]                                          │ │ │
│ │ │                                                           │ │ │
│ │ │   [Thumbnail: Terminal with skill installation]          │ │ │
│ │ │                                                           │ │ │
│ │ │                          2:45                             │ │ │
│ │ └───────────────────────────────────────────────────────────┘ │ │
│ │                                                               │ │
│ │ ┌─ Video Contents ─────────────────────────────────────────┐ │ │
│ │ │ 0:00  Introduction to Python Pro skill                   │ │ │
│ │ │ 0:30  Installing via marketplace command                 │ │ │
│ │ │ 1:15  First API request - building FastAPI endpoint      │ │ │
│ │ │ 2:10  Testing the skill output                           │ │ │
│ │ └──────────────────────────────────────────────────────────┘ │ │
│ │                                                               │ │
│ │ 👁 1,243 views | 👍 87% liked this | [More Videos →]          │ │
│ └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Component Specs:**

1. **Video Player:**
   - Aspect ratio: 16:9
   - Width: 100% of content column (max 800px)
   - Embedded YouTube/Vimeo iframe (loads on click to save bandwidth)
   - Custom play button overlay before load
   - Fallback: link to video if iframe blocked

2. **Video Metadata Section:**
   - Collapsible "Video Contents" (chapter markers)
   - Click timestamp → jumps to that point in video
   - View count pulled from YouTube API (cached daily)
   - "More Videos" link goes to video gallery

3. **Thumbnail Design:**
   - Screenshots from Claude Code interface
   - Text overlay: skill name + "Demo" or "Tutorial"
   - Bright border: `--win31-lime` or `--win31-yellow` for visibility

#### 3.2 Video Gallery Page (`/videos`)

**Layout:** Grid of video cards with filtering

```
┌─────────────────────────────────────────────────────────────────┐
│ [─] VIDEOS.MPG                                         [▲][▼][X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🎬 Video Walkthroughs                                            │
│     Watch Erich build real projects with Claude Skills           │
│                                                                   │
│  ┌─ Filters ──────────────────────────────────────────────────┐  │
│  │ [All] [Tutorials] [Demos] [Deep Dives] [What's New]        │  │
│  │ Sort: [Newest First ▼]                                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ ▶ 2:45           │  │ ▶ 5:12           │  │ ▶ 15:03        │ │
│  │ [Thumbnail]      │  │ [Thumbnail]      │  │ [Thumbnail]    │ │
│  │                  │  │                  │  │                │ │
│  │ Install Python   │  │ Build Reddit API │  │ Full-Stack App │ │
│  │ Pro Skill        │  │ in 15 min        │  │ Deep Dive      │ │
│  │                  │  │                  │  │                │ │
│  │ Tutorial • New   │  │ Demo             │  │ Deep Dive      │ │
│  │ 👁 234 views     │  │ 👁 1.2K views    │  │ 👁 567 views   │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │ ▶ 3:20           │  │ ▶ 8:45           │  │ ▶ 4:10         │ │
│  │ [Thumbnail]      │  │ [Thumbnail]      │  │ [Thumbnail]    │ │
│  │                  │  │                  │  │                │ │
│  │ Skill Bundles    │  │ Creating Custom  │  │ Color Theory   │ │
│  │ Explained        │  │ Skills 101       │  │ Expert Demo    │ │
│  │                  │  │                  │  │                │ │
│  │ Tutorial         │  │ Deep Dive        │  │ Demo           │ │
│  │ 👁 445 views     │  │ 👁 890 views     │  │ 👁 312 views   │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                                   │
│  📺 Subscribe on YouTube for weekly videos                       │
│     [Open YouTube Channel →]                                     │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Component Specs:**

1. **Video Card:**
   - Width: 320px (3 columns desktop, 2 tablet, 1 mobile)
   - Height: 280px
   - Thumbnail: 16:9 aspect ratio
   - Duration badge: top-right corner, black background, white text
   - "NEW" badge if published < 7 days ago

2. **Video Types (Color-Coded Badges):**
   - Tutorial: `--win31-lime` badge
   - Demo: `--win31-bright-yellow` badge
   - Deep Dive: `--win31-teal` badge
   - What's New: `--win31-magenta` badge

3. **Hover Interaction:**
   - Lift shadow effect
   - Show play icon overlay
   - Optional: auto-play preview (muted, 3 seconds)

#### 3.3 Video Content Strategy

**Video Types:**

1. **Micro Tutorials (2-3 min):**
   - Install a skill
   - Quick demo of one feature
   - "Skill of the Week" spotlight

2. **Project Demos (5-10 min):**
   - Build something real with 1-3 skills
   - Show full workflow: install → code → result
   - Example: "Build a Photo Mosaic Generator"

3. **Deep Dives (15-30 min):**
   - Full application walkthrough
   - Multiple skills working together
   - Production-ready code
   - Example: "AI Chatbot from Scratch"

4. **What's New (1-2 min):**
   - Changelog highlights
   - New skill releases
   - Feature updates

**Where Videos Are Promoted:**

- Homepage: Featured video carousel (rotates weekly)
- Skill pages: Related video at bottom
- Changelog: "Watch video update →" links
- Email newsletter: Embedded thumbnails

---

## Feature 4: Onboarding Flow

### User Goals
- **Clarity:** "What is this site, and why should I care?"
- **Quick win:** "I want to see results in under 2 minutes"
- **Progress:** "Am I doing this right?"

### Design Solution: Guided First-Visit Experience

#### 4.1 First-Time Visitor Detection

**Trigger:** No `visited` cookie/localStorage key

**Modal on Homepage Load (After 2 seconds):**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                   │
│                    [PIXEL ART CLAUDE ICON]                        │
│                                                                   │
│                  Welcome to Some Claude Skills!                   │
│                                                                   │
│  This is a free gallery of 211+ expert AI skills for Claude Code.│
│  Each skill gives Claude deep expertise in a specific area—like   │
│  hiring a specialist consultant who already knows your domain.    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ I'm new to Claude Code                                      │  │
│  │ [🎓 Start 5-Minute Beginner Tutorial]                       │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ I have Claude Code installed                                │  │
│  │ [📦 Show Me Skill Bundles for My Workflow]                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ I just want to browse                                       │  │
│  │ [📁 Explore All 211 Skills]                                 │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  [Skip - I'll figure it out myself ▼]                             │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Component Specs:**

1. **Modal:**
   - Max-width: 600px
   - Centered vertically and horizontally
   - Background: `--win31-gray`
   - Border: `4px solid --win31-navy`
   - Box shadow: `16px 16px 0 rgba(0,0,0,0.5)` (dramatic depth)

2. **Icon/Mascot:**
   - Pixel art Claude logo or custom mascot
   - Size: 64x64px
   - Centered at top

3. **Option Buttons:**
   - Full-width, stacked vertically
   - Height: 60px each
   - Background: `--win31-light-gray`
   - Hover: `--win31-lime` border (3px)
   - Font: `--font-system`, 13px

4. **Skip Link:**
   - Small, bottom-right
   - Font: `--font-code`, 11px, gray
   - Click: closes modal, sets `visited=true`, no tracking

#### 4.2 Beginner Path (Selected "New to Claude Code")

**Action:** Redirect to `/tutorials/getting-started`

**Page Structure:**

```
┌─────────────────────────────────────────────────────────────────┐
│ [─] GETTING_STARTED.TXT                                [▲][▼][X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ ┌─ Your Quick Start Checklist ─────────────────────────────────┐ │
│ │ ⏱ 5 minutes to your first working skill                      │ │
│ │                                                               │ │
│ │ ☐ Step 1: Install Claude Code (2 min)                        │ │
│ │ ☐ Step 2: Add skill marketplace (30 sec)                     │ │
│ │ ☐ Step 3: Install your first skill (30 sec)                  │ │
│ │ ☐ Step 4: Test the skill (1 min)                             │ │
│ │ ☐ Step 5: Explore more skills (anytime)                      │ │
│ │                                                               │ │
│ │ Progress: ░░░░░░░░░░  0% complete                             │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ ┌─ Step 1: Install Claude Code ────────────────────────────────┐ │
│ │                                                               │ │
│ │ Claude Code is Anthropic's official CLI for using Claude AI  │ │
│ │ directly in your terminal or editor.                         │ │
│ │                                                               │ │
│ │ ┌─────────────────────────────────────────────────────────┐  │ │
│ │ │ [▶ WATCH: Installing Claude Code (1:30)]               │  │ │
│ │ │ [Thumbnail showing claude.ai/code website]             │  │ │
│ │ └─────────────────────────────────────────────────────────┘  │ │
│ │                                                               │ │
│ │ OR follow these written steps:                                │ │
│ │                                                               │ │
│ │ 1. Visit https://claude.ai/code                               │ │
│ │ 2. Download for your OS (Mac/Windows/Linux)                   │ │
│ │ 3. Run the installer                                          │ │
│ │ 4. Verify by typing `claude --version` in terminal            │ │
│ │                                                               │ │
│ │ ☐ I've installed Claude Code                                  │ │
│ │                                                               │ │
│ │                                    [Next: Add Marketplace →]  │ │
│ └───────────────────────────────────────────────────────────────┘ │
│                                                                   │
│ 💡 Stuck? [Get Help on Discord] | [Email Support]                │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Progressive Disclosure:**
- Only Step 1 expanded initially
- Clicking "Next" collapses current step, expands next step
- Checkboxes persist in localStorage
- Progress bar updates in real-time

**Success Milestone (Step 5 Complete):**

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─ 🎉 Congratulations! ─────────────────────────────────────────┐│
│ │                                                               ││
│ │ You've installed your first Claude skill!                    ││
│ │ You're now part of the 10,000+ developers using these tools. ││
│ │                                                               ││
│ │ What's next?                                                  ││
│ │                                                               ││
│ │ [📦 Explore Skill Bundles]  [🎬 Watch More Tutorials]        ││
│ │ [📁 Browse All Skills]      [🛠 Create Your Own Skill]        ││
│ │                                                               ││
│ └───────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

#### 4.3 Intermediate Path (Selected "I have Claude Code")

**Action:** Redirect to `/bundles/quiz`

**Workflow Selection Quiz:**

```
┌─────────────────────────────────────────────────────────────────┐
│ [─] WORKFLOW_MATCHER.EXE                               [▲][▼][X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📦 Find Your Perfect Skill Bundle                                │
│     Answer 3 quick questions (30 seconds)                        │
│                                                                   │
│  ┌─ Question 1 of 3 ──────────────────────────────────────────┐  │
│  │                                                             │  │
│  │ What do you primarily use Claude Code for?                 │  │
│  │                                                             │  │
│  │ ○ Backend development (APIs, databases, servers)           │  │
│  │ ○ Frontend/UI design (web apps, mobile, design systems)    │  │
│  │ ○ Data science/ML (models, pipelines, analysis)            │  │
│  │ ○ Content creation (writing, video, social media)          │  │
│  │ ○ Personal projects (learning, hobbies, experiments)       │  │
│  │ ○ Not sure yet - show me everything                        │  │
│  │                                                             │  │
│  │                                              [Next ▶]       │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Progress: ██████░░░░  33%                                        │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**After Quiz (Personalized Results):**

```
┌─────────────────────────────────────────────────────────────────┐
│ [─] YOUR_BUNDLES.TXT                                   [▲][▼][X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  🎯 Based on your answers, we recommend:                          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │ 🔥 BEST MATCH                                                │  │
│  │ ┌───────────────────────────────────────────────────────────┐ │
│  │ │ 🐍 Full-Stack Python Developer                            │ │
│  │ │ 8 skills | Perfect for backend APIs and data pipelines    │ │
│  │ │ [Preview Bundle]              [⚡ Install Now]            │ │
│  │ └───────────────────────────────────────────────────────────┘ │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─ Also Consider ────────────────────────────────────────────┐  │
│  │ 🤖 ML Engineer Bundle (9 skills)              [Preview]     │  │
│  │ 🛠 DevOps Automator Bundle (6 skills)         [Preview]     │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Not quite right? [Retake Quiz] | [Browse All Bundles]           │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

**Component Specs:**

1. **Quiz Questions:**
   - Radio buttons (Win31 style: hollow circles)
   - Large click targets (full-width rows)
   - Next button only enabled when selection made

2. **Results Page:**
   - Top recommendation highlighted with "BEST MATCH" banner
   - 2-3 alternatives below
   - Save recommendation to localStorage for return visits

#### 4.4 Progress Tracking Dashboard

**Location:** User profile dropdown (if logged in) or localStorage widget

```
┌─────────────────────────────────────────────────────────────────┐
│ ┌─ Your Journey ────────────────────────────────────────────────┐│
│ │ ☑ Completed onboarding                                       ││
│ │ ☑ Installed first skill (python-pro)                         ││
│ │ ☑ Watched 1 tutorial video                                   ││
│ │ ☐ Installed a skill bundle                                   ││
│ │ ☐ Created a custom skill                                     ││
│ │ ☐ Contributed to GitHub repo                                 ││
│ │                                                               ││
│ │ Level: 🥉 Bronze Contributor (3/6 milestones)                ││
│ └───────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Gamification Elements:**

- Bronze → Silver → Gold tiers (purely cosmetic, fun motivation)
- Badges: First Install, Bundle Master, Video Watcher, Skill Creator
- No required login (localStorage based)
- Optional: sync to GitHub account for public profile

---

## Feature 5: User Journey Maps

### Journey 1: Complete Beginner

**Persona:** Taylor, 28, frontend developer, never heard of Claude Code before

**Entry Point:** Google search "AI coding assistant" → lands on homepage

**Journey Flow:**

1. **Homepage Hero (0:00 - 0:30)**
   - Reads: "Make Claude an Expert at Anything"
   - Confused: "What's Claude Code?"
   - Sees welcome modal (first-time visitor)
   - Clicks: "I'm new to Claude Code" → Tutorial

2. **Tutorial Page (0:30 - 5:00)**
   - Video autoplays: "What is Claude Code?"
   - Watches 2-minute explainer
   - Downloads Claude Code from claude.ai/code
   - Returns to tutorial, checks "Installed Claude Code"
   - Sees next step: Add marketplace

3. **First Install (5:00 - 6:00)**
   - Copies marketplace command
   - Pastes in terminal, runs successfully
   - Copies skill install command: `python-pro`
   - Sees success message in terminal
   - Tutorial shows celebration modal: "You did it!"

4. **Testing Phase (6:00 - 8:00)**
   - Tutorial prompts: "Ask Claude to build a FastAPI endpoint"
   - Tests in Claude Code, sees skill activate
   - Amazed at quality of generated code
   - Tutorial complete, shown next steps

5. **Exploration (8:00+)**
   - Clicks "Explore All Skills"
   - Filters by "Developer" category
   - Bookmarks 3 skills to install later
   - Signs up for newsletter (optional)

**Success Metrics:**
- Time to first install: **Under 6 minutes**
- Drop-off points: Homepage → Tutorial (target < 30% bounce)
- Conversion: First install → Second install (target > 60% within 24hrs)

**Pain Points to Address:**
- "What is Claude Code?" needs immediate answer (video + text)
- Terminal commands intimidating → provide screenshots + copy buttons
- Post-install validation: "Did it work?" → clear success indicators

---

### Journey 2: Experienced Developer

**Persona:** Jordan, 35, senior backend engineer, uses Claude Code daily

**Entry Point:** Twitter link to "New skill release: Career Biographer"

**Journey Flow:**

1. **Skill Detail Page (0:00 - 0:30)**
   - Lands directly on `/docs/skills/career-biographer`
   - Skims description: "Conducts interviews, generates CVs"
   - Watches 30-second demo video
   - Sees install command, copies immediately

2. **Quick Install (0:30 - 1:00)**
   - Already has marketplace configured
   - Single command: `/plugin install career-biographer@some-claude-skills`
   - Installed in 10 seconds

3. **Immediate Use (1:00 - 15:00)**
   - Opens Claude Code
   - Types: "Interview me for my career story"
   - Skill activates, starts asking questions
   - Spends 10 minutes in conversation
   - Receives draft CV in Markdown

4. **Exploration (15:00+)**
   - Impressed, checks "What else is in this repo?"
   - Discovers `competitive-cartographer` skill
   - Sees it's part of "Founder Pack" bundle
   - Installs entire bundle (7 skills at once)

5. **Community Engagement (Later)**
   - Tweets about the skill
   - Stars GitHub repo
   - Joins Discord to share feedback

**Success Metrics:**
- Time from landing → install: **Under 1 minute**
- Multi-skill adoption: **Experienced users install avg 4.2 skills**
- Community actions: **15% star repo, 8% join Discord**

**Pain Points to Address:**
- Skill discovery: "I didn't know you had X" → Better related skills
- Bundle awareness: "I installed 5 skills individually, didn't see bundle"
- Contribution path unclear: "How do I submit my own skill?"

---

### Journey 3: Curious Browser

**Persona:** Sam, 24, design student, heard about AI tools, just exploring

**Entry Point:** Hacker News post about the site

**Journey Flow:**

1. **Homepage (0:00 - 2:00)**
   - Visually intrigued by Windows 3.1 aesthetic
   - Scrolls through marquee of skill images
   - Clicks random skill: "Vaporwave UI Designer"
   - Modal opens with quick preview

2. **Skill Preview Modal (2:00 - 3:00)**
   - Reads description: "Generates 90s-inspired UI designs"
   - Sees example screenshots
   - Thinks: "This is cool but I don't code much"
   - Closes modal, continues browsing

3. **Discovery Moment (3:00 - 5:00)**
   - Scrolls to "Videos" section on homepage
   - Thumbnail catches eye: "Design a Portfolio Site in 10 Min"
   - Clicks, watches video
   - Realizes: "I could actually do this"

4. **Bookmark for Later (5:00)**
   - Doesn't install yet (no Claude Code)
   - Uses "Save for Desktop" button (copies URL)
   - Emails link to self: "Try this when I have time"

5. **Return Visit (Days Later)**
   - Gets email reminder: "New video: Color Theory Expert"
   - Returns to site, watches video
   - Decides to install Claude Code
   - Becomes "Complete Beginner" journey

**Success Metrics:**
- Engagement time: **Avg 4 minutes on site (browser mode)**
- Return visit rate: **22% return within 7 days**
- Email capture: **12% sign up for newsletter**

**Pain Points to Address:**
- "I don't know if this is for me" → Show non-code use cases
- "Seems complicated" → Emphasize ease with videos
- "I'll forget about this" → Newsletter + email reminders

---

### Journey 4: Return User (What's New)

**Persona:** Morgan, 30, uses 8 skills regularly, checks site monthly

**Entry Point:** Direct URL visit (bookmarked)

**Journey Flow:**

1. **Homepage (0:00 - 0:20)**
   - Looks for "What's New" section
   - Sees changelog preview widget
   - Clicks: "View Full Changelog"

2. **Changelog Page (0:20 - 2:00)**
   - Scans recent updates (last 30 days)
   - Sees: "NEW: Bot Developer skill (Dec 28)"
   - Sees: "UPDATED: Python Pro - added async patterns"
   - Sees: "VIDEO: Building a Discord bot walkthrough"

3. **Targeted Exploration (2:00 - 5:00)**
   - Clicks new skill: "Bot Developer"
   - Reads full description
   - Watches video demo
   - Installs immediately

4. **Update Existing Skills (5:00 - 6:00)**
   - Wonders: "How do I update Python Pro?"
   - Finds "Update Guide" in docs
   - Runs: `/plugin update python-pro@some-claude-skills`
   - Sees changelog diff in terminal

5. **Community Check (6:00+)**
   - Visits Discord (linked from navbar)
   - Shares screenshot of bot built with new skill
   - Asks question about customization

**Success Metrics:**
- Monthly active users (MAU): **Track return visits**
- Update adoption: **40% update skills within 7 days of release**
- Changelog engagement: **60% of return visitors view changelog**

**Pain Points to Address:**
- "What's changed since I last visited?" → Personalized changelog filter
- "How do I update skills?" → Prominent update documentation
- "Is there a newsletter?" → Auto-subscribe option on first install

---

## Component Specifications

### Reusable Components for New Features

#### 1. Tutorial Step Component

**File:** `TutorialStep.tsx`

**Props:**
```typescript
interface TutorialStepProps {
  stepNumber: number;
  title: string;
  description: string;
  videoUrl?: string;
  videoThumbnail?: string;
  codeBlock?: string;
  checklist?: { id: string; label: string; required?: boolean }[];
  onComplete?: () => void;
}
```

**Visual Design:**
- Collapsible accordion (only one step open at a time)
- Progress indicator at top
- Video player (lazy load iframe)
- Code block with copy button
- Interactive checkboxes (persist to localStorage)
- "Next Step" button (disabled until checks complete)

**Typography:**
- Title: `--font-window`, 18px
- Description: `--font-body`, 15px
- Code: `--font-code`, 13px

**Colors:**
- Uncompleted step: `--win31-gray` background
- Current step: `--win31-light-gray` background, `--win31-lime` left border
- Completed step: `--win31-teal` checkmark icon

---

#### 2. Bundle Card Component

**File:** `BundleCard.tsx`

**Props:**
```typescript
interface BundleCardProps {
  bundle: {
    id: string;
    title: string;
    description: string;
    icon: string;
    skillCount: number;
    coreSkills: string[];
    optionalSkills: string[];
    category: string;
    isFeatured?: boolean;
    estimatedInstallTime: string;
  };
  onClick?: () => void;
}
```

**Visual Design:**
- Card: 280px x 240px
- Hover: lift shadow, scale 1.02
- Featured badge: yellow ribbon top-right corner
- Icon: 48x48px emoji or pixel art
- Stats row: skill count, install time, category badge

**Typography:**
- Title: `--font-system`, 14px, bold
- Description: `--font-body`, 12px
- Stats: `--font-code`, 10px

**Colors:**
- Default: `--win31-gray` background, `--win31-black` border
- Featured: `--win31-navy` → `--win31-teal` gradient, `--win31-lime` border

---

#### 3. Video Card Component

**File:** `VideoCard.tsx`

**Props:**
```typescript
interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnailUrl: string;
    duration: string; // "2:45"
    videoUrl: string;
    type: 'tutorial' | 'demo' | 'deep-dive' | 'whats-new';
    views?: number;
    publishedDate: string;
    description?: string;
  };
  onClick?: () => void;
}
```

**Visual Design:**
- Card: 320px x 280px
- Thumbnail: 16:9 ratio (320x180)
- Duration badge: top-right, black bg, white text
- "NEW" badge: top-left if < 7 days old
- Hover: play icon overlay, shadow lift

**Typography:**
- Title: `--font-system`, 13px, bold
- Stats: `--font-code`, 10px

**Colors:**
- Tutorial: `--win31-lime` type badge
- Demo: `--win31-bright-yellow` type badge
- Deep Dive: `--win31-teal` type badge
- What's New: `--win31-magenta` type badge

---

#### 4. Progress Bar Component

**File:** `ProgressBar.tsx`

**Props:**
```typescript
interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'lime' | 'yellow' | 'teal';
}
```

**Visual Design:**
- Height: 32px
- Width: 100%
- Background: `--win31-dark-gray`
- Fill: animated gradient (shimmer effect)
- Text: centered, white, `--font-system` 12px

**Colors:**
- Lime: Default progress bars (tutorials)
- Yellow: Bundle installation progress
- Teal: Video watch progress

---

#### 5. Onboarding Modal Component

**File:** `OnboardingModal.tsx`

**Props:**
```typescript
interface OnboardingModalProps {
  onPathSelected: (path: 'beginner' | 'intermediate' | 'browse') => void;
  onDismiss: () => void;
}
```

**Visual Design:**
- Max-width: 600px
- Backdrop: dark overlay `rgba(0,0,0,0.85)`
- 3 large option buttons (stacked vertically)
- Skip link at bottom

**Typography:**
- Heading: `--font-display`, 16px
- Description: `--font-body`, 14px
- Buttons: `--font-system`, 13px, bold

**Colors:**
- Background: `--win31-gray`
- Buttons: `--win31-light-gray`, hover `--win31-lime` border

---

## Information Architecture

### New Site Structure

```
Homepage (/)
│
├─ Tutorials (/tutorials)
│  ├─ Level 1: Getting Started
│  │  ├─ What is Claude Code?
│  │  ├─ Installing Claude Code
│  │  ├─ First Skill Install
│  │  └─ Testing a Skill
│  │
│  ├─ Level 2: Using Skills
│  │  ├─ Browse the Gallery
│  │  ├─ Skill Bundles
│  │  ├─ Combining Skills
│  │  └─ Updating Skills
│  │
│  └─ Level 3: Creating Skills
│     ├─ Skill Anatomy 101
│     ├─ Writing Your First Skill
│     ├─ Activation Patterns
│     └─ Publishing to Marketplace
│
├─ Bundles (/bundles)
│  ├─ Quiz (/bundles/quiz) - Workflow matcher
│  ├─ All Bundles (grid view)
│  └─ Bundle Detail (/bundles/[id])
│     └─ Customization modal
│
├─ Videos (/videos)
│  ├─ All Videos (grid, filterable)
│  └─ Video Player (/videos/[id])
│
├─ Skills (/skills)
│  ├─ Gallery (existing)
│  └─ Skill Detail (/docs/skills/[id])
│     └─ Related video embed
│
├─ Changelog (/changelog)
│  ├─ All updates
│  └─ Filter: New skills, updates, videos
│
└─ Onboarding (no URL, modal-based)
```

### Navigation Updates

**Main Navbar (Desktop):**
```
[Logo] Home | Tutorials | Bundles | Skills | Videos | Docs | Changelog
```

**Mobile Hamburger Menu:**
```
☰ Menu
  🏠 Home
  🎓 Tutorials
  📦 Bundles
  📁 Skills
  🎬 Videos
  📖 Docs
  📝 Changelog
  ──────────
  🐙 GitHub
  💬 Discord
```

**Homepage Quick Links (Status Bar):**
```
[211 Skills] [8 Bundles] [24 Videos] [📧 Newsletter] [GitHub →]
```

---

## Accessibility Considerations

### WCAG 2.1 AA Compliance

1. **Color Contrast:**
   - All text meets 4.5:1 ratio minimum
   - Exception: Pixel art decorative text (not functional)
   - Fix: Lime text (#00FF00) on black = 15.3:1 ✓
   - Warning: Yellow (#FFFF00) on white = needs dark borders

2. **Keyboard Navigation:**
   - All interactive elements tabbable
   - Modal traps focus (Esc to close)
   - Tutorial steps: Arrow keys to navigate
   - Video player: Space = play/pause

3. **Screen Reader Support:**
   - ARIA labels on all icons
   - Tutorial progress announced: "Step 3 of 7, 42% complete"
   - Video transcripts available (expand below player)
   - Bundle checklist: "6 of 8 skills selected"

4. **Motion & Animation:**
   - Respect `prefers-reduced-motion`
   - Disable marquee auto-scroll
   - Remove shimmer/gradient animations
   - Static progress bars

5. **Focus Indicators:**
   - Visible focus ring: `2px solid --win31-lime`
   - High contrast mode: use system colors
   - Skip to content link (hidden until focus)

### Mobile Responsiveness

**Breakpoints:**
- Desktop: 1200px+ (3 columns)
- Tablet: 768-1199px (2 columns)
- Mobile: &lt;768px (1 column, stacked)

**Touch Targets:**
- Minimum 44x44px (iOS guideline)
- Buttons: 48px height on mobile
- Spacing: 16px minimum between interactive elements

**Video Player:**
- Responsive 16:9 container
- Full-width on mobile
- Native controls on touch devices

---

## Implementation Priority

### Phase 1: Foundation (Week 1-2)
1. Tutorial system infrastructure
   - Tutorial page template component
   - Progress tracking (localStorage)
   - Video embed component
2. Onboarding modal
   - First-time visitor detection
   - Path selection logic

### Phase 2: Content (Week 3-4)
3. Tutorial content creation
   - Level 1 tutorials (4 tutorials)
   - Record 4 tutorial videos (2-3 min each)
4. Bundle curation
   - Define 8 bundles
   - Build bundle data structure

### Phase 3: Advanced Features (Week 5-6)
5. Bundle customization flow
   - Customization modal component
   - Install script generation
6. Video gallery
   - Video card grid
   - Filtering/sorting

### Phase 4: Polish (Week 7-8)
7. Onboarding refinement
   - User testing
   - Analytics tracking
8. Integration & cross-linking
   - Related videos on skill pages
   - Bundle suggestions in gallery
   - Changelog → video links

---

## Analytics & Success Metrics

### Events to Track

**Onboarding:**
- `onboarding_modal_shown`
- `onboarding_path_selected: {path}`
- `tutorial_step_completed: {step}`
- `first_install_completed: {time_elapsed}`

**Bundles:**
- `bundle_viewed: {bundle_id}`
- `bundle_customized: {added, removed}`
- `bundle_installed: {bundle_id, skill_count}`

**Videos:**
- `video_played: {video_id}`
- `video_completed: {video_id, watch_time}`
- `video_source: {homepage | skill_page | gallery}`

**Tutorials:**
- `tutorial_started: {level}`
- `tutorial_abandoned: {step}`
- `tutorial_completed: {level, duration}`

### Dashboard Metrics

**User Acquisition:**
- New visitors per week
- Onboarding path distribution (beginner:intermediate:browse)
- Tutorial completion rate

**Engagement:**
- Avg skills installed per user
- Bundle adoption rate (% who install ≥1 bundle)
- Video view rate (% visitors who watch ≥1 video)

**Retention:**
- 7-day return rate
- 30-day active users
- Newsletter signup rate

---

## Open Questions for User Testing

1. **Tutorial Length:** Are 5-minute tutorials too long? Should we break into 2-minute micro-steps?
2. **Bundle Customization:** Do users actually customize, or just install defaults?
3. **Video Placement:** Prefer videos inline on skill pages, or dedicated gallery?
4. **Onboarding Timing:** Show modal immediately, or after 2 seconds, or on scroll?
5. **Progress Gamification:** Are badges/levels motivating or cheesy?

---

## Design Assets Needed

### Graphics
- [ ] Pixel art mascot for onboarding (64x64)
- [ ] Bundle icons (8 custom emojis/icons)
- [ ] Video thumbnails (template with branding)
- [ ] Tutorial step illustrations (optional)

### Video Content
- [ ] "What is Claude Code?" explainer (2 min)
- [ ] "Installing Your First Skill" tutorial (3 min)
- [ ] "Skill Bundles Explained" (3 min)
- [ ] 8 skill demo videos (3-5 min each)
- [ ] "Building a Full App" deep dive (15 min)

### Copy
- [ ] Onboarding modal text (concise, friendly)
- [ ] Tutorial step descriptions (clear, actionable)
- [ ] Bundle descriptions (benefit-focused)
- [ ] Video titles & descriptions (SEO-optimized)

---

## Figma/Wireframe Export Recommendations

Since this is a text specification, here's how to translate to visual design tools:

1. **Component Library in Figma:**
   - Import Win31 color palette as styles
   - Create button components (3D bevel effect)
   - Window frame component (reusable)
   - Typography styles (5 text styles defined)

2. **Page Mockups:**
   - Tutorial page (desktop & mobile)
   - Bundle detail modal (overlay)
   - Video gallery grid
   - Onboarding modal (3 states)

3. **Interaction Prototypes:**
   - Tutorial step flow (click "Next" animation)
   - Bundle customization (checkbox interactions)
   - Video card hover states

4. **User Flow Diagrams:**
   - Complete beginner journey (8 screens)
   - Bundle quiz → install flow (5 screens)

---

**End of Design Specification**

*Last Updated: January 2, 2026*
*Designer: Claude (Sonnet 4.5)*
*For: Some Claude Skills (someclaudeskills.com)*

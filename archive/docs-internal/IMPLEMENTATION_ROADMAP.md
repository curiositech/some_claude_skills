# Implementation Roadmap: New Features

**Project:** Some Claude Skills - Tutorials, Bundles, Videos, Onboarding
**Timeline:** 8 weeks
**Status:** Design Complete, Ready for Development

---

## Week-by-Week Breakdown

### Week 1-2: Foundation & Infrastructure

#### Tasks

**Tutorial System Infrastructure**
- [ ] Create `/tutorials` route structure
- [ ] Build `TutorialStep.tsx` component
- [ ] Implement progress tracking (localStorage)
- [ ] Build `ProgressBar.tsx` component
- [ ] Create tutorial data structure (JSON/TypeScript)

**Onboarding System**
- [ ] Build `OnboardingModal.tsx` component
- [ ] Implement first-visit detection (localStorage)
- [ ] Create path selection logic (beginner/intermediate/browse)
- [ ] Add analytics tracking for onboarding events

**Video Embed Component**
- [ ] Build `VideoPlayer.tsx` (YouTube/Vimeo iframe wrapper)
- [ ] Implement lazy loading (load on click)
- [ ] Add chapter markers support
- [ ] Create video metadata structure

#### Deliverables
- Tutorial page template functional
- Onboarding modal shows on first visit
- Video player component ready for content

#### Files to Create
```
website/src/
├── pages/
│   └── tutorials/
│       ├── index.tsx                    # Tutorial hub
│       └── [level]/
│           └── [slug].tsx               # Individual tutorial
├── components/
│   ├── TutorialStep/
│   │   ├── index.tsx
│   │   └── styles.module.css
│   ├── OnboardingModal/
│   │   ├── index.tsx
│   │   └── styles.module.css
│   ├── VideoPlayer/
│   │   ├── index.tsx
│   │   └── styles.module.css
│   └── ProgressBar/
│       ├── index.tsx
│       └── styles.module.css
└── data/
    └── tutorials/
        ├── level-1-getting-started.ts
        ├── level-2-using-skills.ts
        └── level-3-creating-skills.ts
```

---

### Week 3-4: Tutorial Content & Bundles Foundation

#### Tasks

**Tutorial Content Creation**
- [ ] Write Level 1 tutorial scripts (4 tutorials)
  - What is Claude Code? (2 min)
  - Installing Claude Code (3 min + video)
  - First Skill Install (5 min + video)
  - Testing a Skill (3 min + video)
- [ ] Record 4 tutorial videos (2-3 min each)
- [ ] Create tutorial screenshots/assets
- [ ] Build interactive checklist component

**Bundle System Foundation**
- [ ] Create bundle data structure (TypeScript interface)
- [ ] Define 8 curated bundles (JSON/TS)
- [ ] Build `BundleCard.tsx` component
- [ ] Create `/bundles` route and grid layout
- [ ] Implement bundle filtering (category tabs)

#### Deliverables
- 4 Level 1 tutorials published and functional
- 4 tutorial videos embedded
- Bundles page with 8 bundle cards displayed

#### Bundle Definitions (Data Structure)

```typescript
// website/src/data/bundles.ts

export interface Bundle {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji or path to icon
  category: 'developer' | 'designer' | 'content' | 'personal' | 'ml-ai';
  isFeatured?: boolean;
  coreSkills: string[]; // Skill IDs (required)
  optionalSkills: string[]; // Skill IDs (user can deselect)
  estimatedInstallTime: string; // "2 min"
  benefits: string[]; // Bullet points
  exampleProjects?: {
    title: string;
    videoUrl?: string;
  }[];
  createdBy: string;
  updatedAt: string;
}

export const BUNDLES: Bundle[] = [
  {
    id: 'full-stack-python',
    title: 'Full-Stack Python Developer',
    description: 'Everything for production Python apps. Backend APIs, databases, Docker, testing.',
    icon: '🐍',
    category: 'developer',
    isFeatured: true,
    coreSkills: [
      'python-pro',
      'api-architect',
      'data-pipeline-engineer',
      'devops-automator',
      'test-driven-dev',
      'backend-architect',
    ],
    optionalSkills: [
      'cloudflare-worker-dev',
      'drizzle-migrations',
    ],
    estimatedInstallTime: '2 min',
    benefits: [
      'Production REST APIs with FastAPI/Flask',
      'Database schemas and migrations',
      'Containerized deployments with Docker',
      'CI/CD pipelines for automated testing',
      'Scalable backend architectures',
    ],
    exampleProjects: [
      {
        title: 'Build a Reddit Clone API in 15 minutes',
        videoUrl: 'https://youtube.com/...',
      },
    ],
    createdBy: 'Erich Owens',
    updatedAt: '2026-01-02',
  },
  // ... 7 more bundles
];
```

**Other Bundle Ideas:**
1. UI/UX Designer (design-system-creator, typography-expert, color-theory-palette-harmony-expert, vaporwave-glassomorphic-ui-designer, web-design-expert, adhd-design-expert)
2. Content Creator (seo-visibility-expert, social-media-optimizer, copywriting-expert, video-production-master, thumbnail-designer)
3. Founder Pack (competitive-cartographer, career-biographer, pitch-deck-designer, business-model-analyzer, growth-hacker)
4. ML Engineer (clip-aware-embeddings, stable-diffusion-expert, whisper-transcription, voice-cloning, cv-engineer)
5. Chatbot Builder (bot-developer, crisis-response-protocol, chatbot-analytics, conversational-ai-designer)
6. Video Producer (ai-video-production-master, script-to-video, motion-graphics, color-grading, sound-design)
7. Personal Growth (adhd-daily-planner, jungian-psychologist, personal-finance-coach, habit-tracker, journaling-assistant)
8. Indie Hacker (full-stack-web, stripe-integration, email-marketing, analytics, seo)

---

### Week 5-6: Bundle Customization & Video Gallery

#### Tasks

**Bundle Customization Flow**
- [ ] Build `BundleDetailModal.tsx` component
- [ ] Implement skill checklist (checkboxes with required/optional)
- [ ] Build install command generator
- [ ] Add "Preview Install Command" code block
- [ ] Create install script download (.sh file generation)
- [ ] Track bundle customization events (analytics)

**Video Gallery**
- [ ] Create `/videos` route
- [ ] Build `VideoCard.tsx` component
- [ ] Implement video grid layout (responsive)
- [ ] Add filtering/sorting (type, date)
- [ ] Build video detail page with full player
- [ ] Integrate video view tracking (analytics)

**Level 2 Tutorials**
- [ ] Write Level 2 tutorial scripts (4 tutorials)
- [ ] Record 4 more tutorial videos
- [ ] Add to tutorial hub

#### Deliverables
- Bundle customization modal functional
- Users can customize and install bundles
- Video gallery live with 8+ videos
- 8 total tutorials published (Level 1 + 2)

#### Files to Create
```
website/src/
├── pages/
│   ├── bundles/
│   │   ├── index.tsx               # Bundle grid
│   │   ├── [id].tsx                # Bundle detail (modal)
│   │   └── quiz.tsx                # Workflow matcher quiz
│   └── videos/
│       ├── index.tsx               # Video gallery
│       └── [id].tsx                # Video detail page
├── components/
│   ├── BundleCard/
│   │   ├── index.tsx
│   │   └── styles.module.css
│   ├── BundleDetailModal/
│   │   ├── index.tsx
│   │   └── styles.module.css
│   └── VideoCard/
│       ├── index.tsx
│       └── styles.module.css
└── utils/
    └── generateInstallScript.ts    # Generate .sh file for bundle install
```

---

### Week 7-8: Polish, Integration, Testing

#### Tasks

**Onboarding Refinement**
- [ ] Build workflow matcher quiz (`/bundles/quiz`)
- [ ] Implement quiz logic and personalized results
- [ ] Add progress dashboard widget (user milestones)
- [ ] Create gamification badges (optional)
- [ ] User testing with 6 participants (3 beginners, 3 experienced)

**Cross-Linking & Integration**
- [ ] Add "Related Video" embeds to skill detail pages
- [ ] Show bundle suggestions in skill gallery
- [ ] Link changelog entries to videos
- [ ] Add "Start Tutorial" CTAs throughout site
- [ ] Create "What's New" section on homepage

**Level 3 Tutorials**
- [ ] Write Level 3 tutorial scripts (4 tutorials - advanced)
- [ ] Build tutorial completion dashboard
- [ ] Add certificate/badge for completing all levels (fun)

**Analytics & Tracking**
- [ ] Set up Plausible events for new features
- [ ] Create analytics dashboard for monitoring
- [ ] Track key metrics:
  - Tutorial completion rate
  - Bundle adoption rate
  - Video view rate
  - Onboarding path distribution

**Documentation**
- [ ] Update main README with new features
- [ ] Write contributor guide for adding tutorials
- [ ] Document bundle creation process
- [ ] Create video upload guide

#### Deliverables
- All 12 tutorials published (3 levels x 4 tutorials)
- Workflow matcher quiz functional
- Cross-linking complete
- Analytics tracking implemented
- User testing complete with findings documented

---

## Component Specifications

### TutorialStep Component

**File:** `website/src/components/TutorialStep/index.tsx`

**TypeScript Interface:**
```typescript
interface TutorialStepProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  description: string;
  videoUrl?: string;
  videoThumbnail?: string;
  videoDuration?: string; // "2:45"
  codeBlock?: {
    language: string; // "bash", "typescript", etc.
    code: string;
    copyable: boolean;
  };
  checklist?: {
    id: string;
    label: string;
    required?: boolean;
  }[];
  helpContent?: string; // Markdown for help panel
  onComplete?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}
```

**Key Features:**
- Accordion-style (collapse/expand)
- Progress bar updates automatically
- Video lazy loads on expand
- Checkboxes persist to localStorage
- "Next" button disabled until required checks complete
- Help panel collapsible

**State Management:**
```typescript
// localStorage schema
interface TutorialProgress {
  tutorialId: string;
  currentStep: number;
  completedSteps: number[];
  checklistState: Record<string, boolean>; // checkboxId -> checked
  startedAt: string; // ISO timestamp
  lastViewedAt: string;
}
```

---

### BundleCard Component

**File:** `website/src/components/BundleCard/index.tsx`

**TypeScript Interface:**
```typescript
interface BundleCardProps {
  bundle: Bundle; // From bundles.ts
  onClick?: () => void;
  variant?: 'default' | 'featured'; // Featured has gradient bg
}
```

**Visual Design:**
- Width: 280px (responsive)
- Height: 240px
- Background: `--win31-gray` (default) or gradient (featured)
- Border: `3px solid --win31-black`
- Box shadow: `8px 8px 0 rgba(0,0,0,0.3)`
- Hover: lift shadow to `12px 12px`, scale 1.02

**Layout:**
```
┌──────────────────────────┐
│ 🎨 [ICON 48x48]          │
│                          │
│ UI/UX Designer Bundle    │ ← Title (14px bold)
│                          │
│ 6 skills included        │ ← Skill count (12px)
│ Design systems, typo...  │ ← Short desc (12px)
│                          │
│ [Badge] [Badge] [Badge]  │ ← Category, time, featured
│                          │
│      [Preview Bundle]    │ ← CTA button
└──────────────────────────┘
```

---

### VideoCard Component

**File:** `website/src/components/VideoCard/index.tsx`

**TypeScript Interface:**
```typescript
interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnailUrl: string;
    duration: string; // "2:45"
    videoUrl: string; // YouTube/Vimeo URL
    type: 'tutorial' | 'demo' | 'deep-dive' | 'whats-new';
    views?: number;
    publishedDate: string; // ISO
    description?: string;
    relatedSkills?: string[]; // Skill IDs
  };
  onClick?: () => void;
}
```

**Visual Design:**
- Width: 320px (responsive)
- Height: 280px
- Thumbnail: 16:9 ratio (320x180)
- Duration badge: top-right corner, `background: #000`, `color: #fff`, `padding: 4px 8px`
- "NEW" badge: top-left if publishedDate < 7 days ago
- Type badge: bottom (color-coded by type)

**Hover States:**
- Shadow lift: `8px 8px` → `12px 12px`
- Play icon overlay appears
- Optional: auto-play preview (muted, 3 sec)

**Type Badge Colors:**
```typescript
const TYPE_COLORS = {
  tutorial: '--win31-lime',
  demo: '--win31-bright-yellow',
  'deep-dive': '--win31-teal',
  'whats-new': '--win31-magenta',
};
```

---

### ProgressBar Component

**File:** `website/src/components/ProgressBar/index.tsx`

**TypeScript Interface:**
```typescript
interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  color?: 'lime' | 'yellow' | 'teal';
  height?: number; // Default 32px
  animated?: boolean; // Shimmer effect
}
```

**Visual Design:**
```css
.progress-bar {
  width: 100%;
  height: 32px;
  background: var(--win31-dark-gray);
  border: 2px solid var(--win31-black);
  position: relative;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--win31-lime), #00cc00);
  transition: width 0.3s ease;
}

.progress-bar__text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-family: var(--font-system);
  font-size: 12px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
}
```

**Usage Example:**
```tsx
<ProgressBar
  current={3}
  total={7}
  label="Step 3 of 7"
  showPercentage
  color="lime"
/>
// Renders: "████░░░░░░ Step 3 of 7 (42%)"
```

---

### OnboardingModal Component

**File:** `website/src/components/OnboardingModal/index.tsx`

**TypeScript Interface:**
```typescript
interface OnboardingModalProps {
  onPathSelected: (path: 'beginner' | 'intermediate' | 'browse') => void;
  onDismiss: () => void;
  visible?: boolean; // Control visibility externally
}
```

**Visual Design:**
- Max-width: 600px
- Backdrop: `rgba(0,0,0,0.85)`
- Modal: `--win31-gray` background, `4px solid --win31-navy` border
- Box shadow: `16px 16px 0 rgba(0,0,0,0.5)` (dramatic depth)
- Pixel art mascot: 64x64px, centered at top
- 3 option buttons: full-width, 60px tall each, stacked vertically

**Interaction:**
- Appears 2 seconds after page load (first visit only)
- Click backdrop or X button to close
- Click option button → navigate to appropriate path
- Skip link sets `visited=true` in localStorage

**localStorage Schema:**
```typescript
interface OnboardingState {
  visited: boolean;
  selectedPath?: 'beginner' | 'intermediate' | 'browse';
  completedAt?: string; // ISO timestamp
}
```

---

## Data Structures

### Tutorial Data Structure

**File:** `website/src/data/tutorials/level-1-getting-started.ts`

```typescript
export interface Tutorial {
  id: string;
  level: 1 | 2 | 3;
  slug: string; // URL-friendly
  title: string;
  description: string;
  estimatedTime: string; // "5 min"
  hasVideo: boolean;
  steps: TutorialStep[];
  nextTutorial?: string; // ID of next tutorial
  previousTutorial?: string; // ID of previous tutorial
}

export interface TutorialStep {
  id: string;
  title: string;
  content: string; // Markdown
  videoUrl?: string;
  videoThumbnail?: string;
  videoDuration?: string;
  codeBlock?: {
    language: string;
    code: string;
    copyable: boolean;
  };
  checklist?: {
    id: string;
    label: string;
    required?: boolean;
  }[];
  helpContent?: string; // Markdown
}

// Example tutorial
export const TUTORIAL_INSTALL_CLAUDE: Tutorial = {
  id: 'install-claude-code',
  level: 1,
  slug: 'installing-claude-code',
  title: 'Installing Claude Code',
  description: 'Get Claude Code running on your machine in 3 minutes',
  estimatedTime: '3 min',
  hasVideo: true,
  steps: [
    {
      id: 'step-1-download',
      title: 'Download Claude Code',
      content: `
Claude Code is Anthropic's official CLI for using Claude AI directly in your terminal or editor.

Visit the official website to get the installer for your operating system.
      `,
      videoUrl: 'https://youtube.com/...',
      videoThumbnail: '/img/tutorials/install-step1-thumb.png',
      videoDuration: '1:30',
      checklist: [
        { id: 'visited-site', label: "I've visited claude.ai/code", required: true },
        { id: 'downloaded', label: "I've downloaded the installer", required: true },
      ],
      helpContent: `
### Troubleshooting

**Can't find the download button?**
Look for the large green "Download for [Your OS]" button at the top of the page.

**Not sure which version to download?**
- macOS: Download the .dmg file
- Windows: Download the .exe installer
- Linux: Download the .deb or .rpm package
      `,
    },
    {
      id: 'step-2-install',
      title: 'Run the Installer',
      content: `
Open the downloaded file and follow the installation wizard.

The installer will:
1. Install the \`claude\` command
2. Set up authentication
3. Configure your default editor integration (optional)
      `,
      checklist: [
        { id: 'ran-installer', label: "I've run the installer", required: true },
        { id: 'completed-setup', label: "Installation completed successfully", required: true },
      ],
    },
    {
      id: 'step-3-verify',
      title: 'Verify Installation',
      content: `
Open your terminal and run this command to verify Claude Code is installed:
      `,
      codeBlock: {
        language: 'bash',
        code: 'claude --version',
        copyable: true,
      },
      checklist: [
        { id: 'ran-command', label: "I've run the command", required: true },
        { id: 'saw-version', label: "I saw a version number (e.g., 1.2.3)", required: true },
      ],
      helpContent: `
### Troubleshooting

**"Command not found" error?**
Try closing and reopening your terminal. The installer adds Claude to your PATH, which requires a fresh terminal session.

**Still not working?**
- Check if the installer completed without errors
- Try running the installer again
- See the [official docs](https://claude.ai/code/docs) for platform-specific help
      `,
    },
  ],
  nextTutorial: 'first-skill-install',
};
```

---

### Video Data Structure

**File:** `website/src/data/videos.ts`

```typescript
export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string; // YouTube or Vimeo URL
  duration: string; // "2:45"
  type: 'tutorial' | 'demo' | 'deep-dive' | 'whats-new';
  publishedDate: string; // ISO
  views?: number; // Fetched from YouTube API (cached)
  relatedSkills?: string[]; // Skill IDs
  chapters?: {
    timestamp: string; // "0:00"
    title: string;
  }[];
}

// Example video
export const VIDEO_PYTHON_PRO_DEMO: Video = {
  id: 'python-pro-demo',
  title: 'Install and Use Python Pro Skill',
  description: 'Watch how to install the Python Pro skill and build a FastAPI endpoint in 2 minutes',
  thumbnailUrl: '/img/videos/python-pro-thumb.jpg',
  videoUrl: 'https://youtube.com/watch?v=...',
  duration: '2:45',
  type: 'demo',
  publishedDate: '2026-01-02',
  views: 234,
  relatedSkills: ['python-pro'],
  chapters: [
    { timestamp: '0:00', title: 'Introduction to Python Pro skill' },
    { timestamp: '0:30', title: 'Installing via marketplace command' },
    { timestamp: '1:15', title: 'Building a FastAPI endpoint' },
    { timestamp: '2:10', title: 'Testing the skill output' },
  ],
};
```

---

## Navigation Updates

### Updated Navbar

**Desktop:**
```
[Logo] Home | Tutorials | Bundles | Skills | Videos | Docs | Changelog
```

**Mobile (Hamburger Menu):**
```
☰ Menu
  🏠 Home
  🎓 Tutorials          ← NEW
  📦 Bundles            ← NEW
  📁 Skills
  🎬 Videos             ← NEW
  📖 Docs
  📝 Changelog
  ──────────
  🐙 GitHub
  💬 Discord
```

### Homepage Changes

**New Navigation Windows (3-column layout):**

Replace existing navigation section with 4 windows (2 rows x 2 columns, responsive):

```
┌─────────────────┐  ┌─────────────────┐
│ 🎓 TUTORIALS    │  │ 📦 BUNDLES      │
│ Learn step by   │  │ Skill packs for │
│ step, beginner  │  │ your workflow   │
│ to advanced     │  │ One-click setup │
│ [Start Learning]│  │ [View Bundles]  │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│ 📁 GALLERY      │  │ 🎬 VIDEOS       │
│ Browse 211      │  │ Watch demos and │
│ skills with     │  │ walkthroughs    │
│ search/filter   │  │ Visual learning │
│ [Open Gallery]  │  │ [Watch Videos]  │
└─────────────────┘  └─────────────────┘
```

**Hero Section Update:**

Add onboarding CTA for first-time visitors:

```
┌─────────────────────────────────────────────────────┐
│  Make Claude an Expert at Anything                  │
│  211 free, open-source skills for Claude Code       │
│                                                     │
│  [Two-column layout]                                │
│  Left: Explainer text (existing)                    │
│  Right: Install instructions (existing)             │
│                                                     │
│  👋 New to Claude Code?                             │
│     [Start 5-Minute Tutorial →]  [Watch Demo Video] │
└─────────────────────────────────────────────────────┘
```

---

## Analytics Events

### Tracking Implementation

**Tool:** Plausible (existing, privacy-friendly)

**New Events to Track:**

```typescript
// Onboarding
plausible('Onboarding Modal Shown');
plausible('Onboarding Path Selected', { path: 'beginner' | 'intermediate' | 'browse' });
plausible('Onboarding Dismissed');

// Tutorials
plausible('Tutorial Started', { tutorialId: string, level: number });
plausible('Tutorial Step Completed', { tutorialId: string, step: number });
plausible('Tutorial Abandoned', { tutorialId: string, step: number });
plausible('Tutorial Completed', { tutorialId: string, duration: number });
plausible('Tutorial Help Opened', { tutorialId: string, step: number });

// Bundles
plausible('Bundle Viewed', { bundleId: string });
plausible('Bundle Customized', { bundleId: string, skillsAdded: number, skillsRemoved: number });
plausible('Bundle Install Started', { bundleId: string, skillCount: number });
plausible('Bundle Install Command Copied', { bundleId: string });

// Videos
plausible('Video Played', { videoId: string, source: 'homepage' | 'gallery' | 'skill-page' | 'tutorial' });
plausible('Video Completed', { videoId: string, watchTime: number });
plausible('Video Chapter Jumped', { videoId: string, chapter: string });

// Workflow Quiz
plausible('Workflow Quiz Started');
plausible('Workflow Quiz Completed', { result: string }); // Bundle ID recommended
plausible('Workflow Quiz Abandoned', { step: number });
```

**Dashboard Metrics to Monitor:**

1. **Onboarding Funnel:**
   - Modal shown → Path selected → First action taken
   - Breakdown by path (beginner/intermediate/browse)

2. **Tutorial Performance:**
   - Completion rate per tutorial
   - Average time to complete
   - Most common abandonment points

3. **Bundle Adoption:**
   - Bundle views → customizations → installs
   - Most popular bundles
   - Customization patterns (which skills removed/added)

4. **Video Engagement:**
   - View rate (% of visitors who watch ≥1 video)
   - Average watch time
   - Completion rate by video type

---

## Testing Checklist

### Manual Testing (Before Launch)

**Onboarding Flow:**
- [ ] Modal appears on first visit (after 2 sec delay)
- [ ] Modal doesn't show on return visits
- [ ] Each path button navigates correctly
- [ ] Skip link dismisses modal and sets localStorage
- [ ] Analytics events fire correctly

**Tutorial System:**
- [ ] Progress bar updates correctly
- [ ] Video embeds load on expand (lazy load)
- [ ] Checkboxes persist on page reload
- [ ] "Next" button disabled until required checks complete
- [ ] Help panel expands/collapses
- [ ] Code copy button works
- [ ] Navigation (prev/next tutorial) works

**Bundle System:**
- [ ] Bundle grid displays all 8 bundles
- [ ] Category filters work
- [ ] Featured bundle highlighted correctly
- [ ] Customization modal opens on "Preview Bundle"
- [ ] Checkboxes toggle (required items disabled)
- [ ] Skill count updates dynamically
- [ ] Install command generates correctly
- [ ] Install button downloads .sh file or copies to clipboard

**Video Gallery:**
- [ ] Grid displays all videos
- [ ] Filtering by type works
- [ ] Sorting by date works
- [ ] Duration badges show correctly
- [ ] "NEW" badge shows for videos < 7 days old
- [ ] Video player opens on click
- [ ] Chapter markers jump to timestamp

### Responsive Testing

**Breakpoints to Test:**
- [ ] Desktop (1920x1080, 1440x900)
- [ ] Tablet (iPad 1024x768, iPad Pro 1366x1024)
- [ ] Mobile (iPhone 13 390x844, iPhone 13 Pro Max 428x926)
- [ ] Ultra-wide (2560x1440)

**Key Components:**
- [ ] Tutorial steps stack properly on mobile
- [ ] Bundle cards resize (3→2→1 columns)
- [ ] Video grid stacks (3→2→1 columns)
- [ ] Onboarding modal fits on small screens
- [ ] Navbar collapses to hamburger

### Accessibility Testing

**Keyboard Navigation:**
- [ ] Tab through all interactive elements
- [ ] Modal traps focus (can't tab outside)
- [ ] Escape closes modals
- [ ] Arrow keys navigate tutorial steps (optional)

**Screen Reader:**
- [ ] All images have alt text
- [ ] ARIA labels on icons/buttons
- [ ] Progress updates announced
- [ ] Video transcripts available

**Color Contrast:**
- [ ] All text meets WCAG AA (4.5:1 ratio)
- [ ] Focus indicators visible (2px lime ring)
- [ ] High contrast mode works

**Motion:**
- [ ] `prefers-reduced-motion` disables animations
- [ ] Marquee auto-scroll stops
- [ ] Shimmer effects removed

### Performance Testing

**Page Load:**
- [ ] Lighthouse score > 90 (performance)
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Cumulative Layout Shift < 0.1

**Asset Optimization:**
- [ ] Video thumbnails < 100KB each
- [ ] Tutorial images < 200KB each
- [ ] Videos lazy load (don't block initial page load)
- [ ] Code splitting for modal components

---

## Content Creation Schedule

### Videos to Record

**Week 1-2 (Foundation Videos):**
1. "What is Claude Code?" (2 min) - Explainer
2. "Installing Claude Code" (3 min) - Tutorial
3. "Installing Your First Skill" (3 min) - Tutorial
4. "Testing a Skill" (2 min) - Tutorial

**Week 3-4 (Bundle Videos):**
5. "Skill Bundles Explained" (3 min) - Explainer
6. "Build a Reddit API with Python Bundle" (15 min) - Deep dive
7. "Design a Portfolio with UI/UX Bundle" (12 min) - Deep dive

**Week 5-6 (Skill Demos):**
8. "Python Pro Skill Demo" (3 min) - Quick demo
9. "Color Theory Expert Demo" (4 min) - Quick demo
10. "Career Biographer Walkthrough" (6 min) - Demo

**Week 7-8 (Advanced):**
11. "Creating Your First Custom Skill" (15 min) - Deep dive
12. "Full-Stack App from Scratch" (20 min) - Deep dive

**Video Production Notes:**
- Screen resolution: 1920x1080 (16:9)
- Record terminal at 80x24 (readable font size)
- Use OBS Studio for recording
- Voiceover: Blue Yeti mic
- Background music: Epidemic Sound (royalty-free)
- Editing: DaVinci Resolve
- Upload to YouTube (unlisted, embed on site)

### Tutorial Scripts to Write

**Level 1: Getting Started (4 tutorials)**
1. What is Claude Code? (2 min read)
2. Installing Claude Code (3 min read + video)
3. Your First Skill Install (5 min read + video)
4. Testing a Skill (3 min read + video)

**Level 2: Using Skills (4 tutorials)**
5. Browse the Gallery (3 min read)
6. Skill Bundles for Your Workflow (4 min read + video)
7. Combining Multiple Skills (6 min read)
8. Updating Skills (2 min read)

**Level 3: Creating Skills (4 tutorials)**
9. Skill Anatomy 101 (10 min read)
10. Writing Your First Skill (15 min read + code examples)
11. Activation Patterns & Keywords (8 min read)
12. Publishing to Marketplace (5 min read)

**Writing Guidelines:**
- Use second person ("You'll install...")
- Short sentences (< 20 words average)
- Bullet points for lists
- Code examples with syntax highlighting
- Screenshots for every CLI step
- Friendly, encouraging tone
- Assume zero prior knowledge for Level 1

---

## Launch Checklist

### Pre-Launch (Week 7)

- [ ] All 12 tutorials written and reviewed
- [ ] All 12 videos recorded and edited
- [ ] 8 bundles defined with accurate skill lists
- [ ] Onboarding modal tested with 6 users
- [ ] Analytics tracking verified
- [ ] Performance audit complete (Lighthouse > 90)
- [ ] Accessibility audit complete (WCAG AA)
- [ ] Mobile testing on 3+ devices
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

### Launch Day (Week 8)

- [ ] Deploy to production (Cloudflare Pages)
- [ ] Update main README.md
- [ ] Publish launch blog post
- [ ] Tweet announcement thread
- [ ] Post to Hacker News (Show HN)
- [ ] Post to Reddit r/ClaudeCode (if exists)
- [ ] Email newsletter to existing subscribers
- [ ] Update GitHub repo description

### Post-Launch (Week 8+)

- [ ] Monitor analytics dashboard daily
- [ ] Review user feedback (GitHub issues, Discord)
- [ ] Fix critical bugs within 24 hours
- [ ] Plan next iteration based on data
- [ ] Record additional videos based on demand
- [ ] Write blog post: "What We Learned from 1000 Users"

---

## Success Metrics (30-Day Goals)

### User Acquisition
- **Target:** 5,000 unique visitors (up from current baseline)
- **Onboarding:** 30% of new visitors complete onboarding flow
- **Tutorial Starts:** 20% of visitors start at least one tutorial

### Engagement
- **Tutorial Completion:** 60% of users who start Level 1 complete it
- **Bundle Installs:** 15% of visitors install at least one bundle
- **Video Views:** 25% of visitors watch at least one video
- **Return Visits:** 22% of users return within 7 days

### Quality Metrics
- **Tutorial Abandonment:** < 30% abandon mid-tutorial (track where)
- **Bundle Customization:** 40% of bundle viewers customize before install
- **Video Completion:** 70% watch rate for videos < 3 min
- **Avg Session Duration:** > 4 minutes (up from current)

### Community Growth
- **Newsletter Signups:** 500 new subscribers
- **GitHub Stars:** +200 stars
- **Discord Members:** +100 members
- **User-Created Skills:** 10 community contributions

---

## Future Iterations (Post-Launch)

### Phase 2 Ideas (Based on User Feedback)

1. **Interactive Tutorial Sandbox**
   - Embedded terminal in browser
   - Practice commands without leaving site
   - Pre-loaded Claude Code environment

2. **Skill Recommendation Engine**
   - "Users who installed X also liked Y"
   - ML-based personalization
   - Smart bundle suggestions

3. **Progress Syncing**
   - GitHub OAuth login
   - Sync tutorial progress across devices
   - Public profile with completed tutorials/installed skills

4. **Community Features**
   - User reviews/ratings for skills
   - Skill usage examples (user-submitted)
   - Leaderboard (gamification)

5. **Advanced Video Features**
   - Live coding streams (Twitch integration)
   - Interactive code annotations on videos
   - Video playlists by topic

6. **Localization**
   - Translate tutorials to Spanish, French, German
   - Subtitles for all videos
   - Community translation contributions

---

**Document Version:** 1.0
**Created:** January 2, 2026
**Last Updated:** January 2, 2026
**Status:** Ready for Development

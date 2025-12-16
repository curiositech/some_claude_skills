---
title: Artifact Preservation Guide
sidebar_label: Artifact Preservation Guide
sidebar_position: 1
---
# Artifact Preservation Guide

Welcome! This guide will help you preserve and share examples of Claude Skills in action.

## What is an Artifact?

An artifact is a preserved demonstration of Claude Skills working on real tasks. It captures:
- The **before** state (initial code, design, or content)
- The **after** state (improved result)
- The **process** (how skills were used)
- **Learnings** (insights gained)

## Types of Artifacts

### 1. Single-Skill Artifacts
Demonstrates one skill working independently.

**Example:** skill-coach improving itself through iterations

**Structure:**
```
/single-skill/{skill-name}/{number-name}/
  ├── artifact.json          # Metadata
  ├── README.md              # Overview
  ├── transcript.md          # Conversation log (optional)
  ├── before/                # Initial state
  │   ├── \{file1\}.md
  │   └── \{file2\}.md
  ├── after/                 # Final state
  │   ├── \{file1\}.md
  │   └── \{file2\}.md
  └── assets/                # Screenshots, diagrams
      ├── \{image1\}.png
      └── \{diagram\}.svg
```

### 2. Multi-Skill Artifacts (Orchestration)
Shows multiple skills working together.

**Example:** vibe-matcher → web-design-expert → frontend-developer pipeline

**Structure:**
```
/multi-skill/{project-name}/{number-name}/
  ├── artifact.json          # Metadata with phases
  ├── README.md              # Orchestration overview
  ├── transcript.md          # Full conversation
  ├── phase-1-\{skill\}/       # Each phase separate
  │   ├── before/
  │   └── after/
  ├── phase-2-\{skill\}/
  │   ├── before/
  │   └── after/
  └── assets/
```

### 3. Front-End Component Artifacts (Before/After UI)
Special structure for visual component improvements with interactive previews.

**Example:** Winamp player audio engineering improvements

**Structure:**
```
/frontend/{component-name}/{number-name}/
  ├── artifact.json
  ├── README.md
  ├── before/
  │   ├── components/        # React components
  │   │   ├── WinampModal.tsx
  │   │   └── MusicPlayerContext.tsx
  │   ├── data/              # Data files
  │   │   └── musicMetadata.ts
  │   ├── assets/            # Images, styles
  │   │   └── screenshot.png
  │   └── demo.html          # Standalone preview (optional)
  ├── after/
  │   ├── components/
  │   ├── data/
  │   ├── assets/
  │   └── demo.html
  └── comparison/            # Side-by-side assets
      ├── feature-comparison.md
      └── visual-comparison.png
```

---

## Creating an Artifact: Step by Step

### Step 1: Choose Your Artifact Type

Ask yourself:
- **One skill or many?** → Single vs Multi
- **Code, design, or research?** → Determines category
- **Visual component?** → Consider frontend type for live previews

### Step 2: Set Up the Folder Structure

```bash
# Navigate to artifacts directory
cd website/src/data/artifacts

# Create your artifact folder
mkdir -p \{type\}/{skill-or-project}/{number-name}

# Example:
mkdir -p single-skill/sound-engineer/001-winamp-fft
mkdir -p multi-skill/portfolio-redesign/001-vibe-to-pixels
mkdir -p frontend/winamp-player/001-audio-engineering
```

### Step 3: Capture the "Before" State

**Critical:** Preserve the initial state EXACTLY as it was before improvements.

For code artifacts:
```bash
# Copy current files to before/ folder
cp path/to/Component.tsx before/components/
cp path/to/data.ts before/data/
cp path/to/styles.css before/assets/
```

For design artifacts:
- Export Figma frames as PNG/SVG
- Screenshot current live site
- Save HTML/CSS snapshots

For research artifacts:
- Save initial prompt and context
- Preserve any existing research notes
- Capture data sources

**Pro Tip:** Add a `before/NOTE.md` explaining what exists and what problems need solving.

### Step 4: Do the Work with Skills

Now use Claude Skills to improve your artifact. Document:
- Which skills you invoke
- What you ask them to do
- Key decisions made
- Iterations and refinements

**Save your transcript:**
```bash
# Copy conversation to transcript.md
# (Optional but highly recommended)
```

### Step 5: Capture the "After" State

After improvements are complete:

```bash
# Copy improved files to after/ folder
cp path/to/Component.tsx after/components/
cp path/to/data.ts after/data/
cp path/to/styles.css after/assets/
```

### Step 6: Create artifact.json

This is the most important file. It defines your artifact's metadata.

**Template:**
```json
{
  "id": "\{type\}-\{skill\}-\{number\}-\{slug\}",
  "title": "Descriptive Title: What Was Achieved",
  "description": "2-3 sentence summary. What was the goal? Which skills were used? What was the outcome?",
  "type": "single-skill | multi-skill | comparison",
  "skills": [
    {
      "name": "skill_name",
      "role": "What this skill did in the project"
    }
  ],
  "category": "design | development | ai-ml | research | writing | meta",
  "tags": ["tag1", "tag2", "tag3"],
  "difficulty": "beginner | intermediate | advanced",

  "phases": [
    {
      "name": "Phase 1: Foundation",
      "skills": ["skill_name"],
      "duration": "1 iteration",
      "outcome": "What was accomplished"
    }
  ],

  "outcome": {
    "summary": "Overall result achieved",
    "metrics": [
      { "label": "Metric Name", "value": "123" }
    ],
    "learned": [
      "Key insight 1",
      "Key insight 2"
    ]
  },

  "files": {
    "transcript": "transcript.md",
    "before": ["before/file1.md", "before/file2.tsx"],
    "after": ["after/file1.md", "after/file2.tsx"],
    "assets": ["assets/screenshot.png"]
  },

  "createdAt": "2024-11-24T23:00:00Z",
  "featured": false,
  "viewCount": 0
}
```

**Field Guide:**
- **id**: Unique identifier (lowercase, dash-separated)
- **title**: Should be compelling and descriptive
- **type**: single-skill, multi-skill, or comparison
- **skills**: List ALL skills used with their specific roles
- **category**: Choose one that fits best
- **tags**: 5-10 relevant keywords
- **difficulty**: Honest assessment of complexity
- **phases**: For multi-step work, break into phases
- **metrics**: Quantifiable outcomes (LOC, time, iterations, etc.)
- **learned**: Key insights for others to learn from
- **featured**: Set to `true` for exceptional artifacts (curated by maintainers)

### Step 7: Write README.md

The README is your artifact's landing page. Structure:

```markdown
# \{Artifact Title\}

## Overview
Brief summary of what this artifact demonstrates.

## Context
Why was this work done? What problem needed solving?

## Skills Used
- **skill_name**: What role it played

## Process
High-level steps taken:
1. First phase
2. Second phase
3. Final phase

## Key Decisions
- **Decision 1**: Why it was made
- **Decision 2**: Alternative considered

## Results
Quantifiable outcomes and qualitative improvements.

### Metrics
- Before: X
- After: Y
- Improvement: Z%

## Learnings
What insights emerged from this work?

## Files
- `before/`: Initial state
- `after/`: Improved state
- `transcript.md`: Full conversation (optional)
```

### Step 8: Add Visual Assets

Great artifacts have visual elements:

**Screenshots:**
```bash
# Before/after screenshots
before/assets/ui-before.png
after/assets/ui-after.png
comparison/side-by-side.png
```

**Diagrams:**
- Architecture diagrams
- Flow charts
- Decision trees
- Process visualizations

**Videos (for complex UI):**
- Screen recordings of before/after
- Interaction demonstrations

### Step 9: Test the Preview

Front-end artifacts should include standalone previews:

```html
<!-- demo.html template -->
<!DOCTYPE html>
<html>
<head>
  <title>\{Component Name\} - Before/After Demo</title>
  <style>
    /* Inline all critical CSS */
  </style>
</head>
<body>
  <div id="demo">
    <!-- Embedded component preview -->
  </div>
  <script>
    // Embedded JavaScript for interactivity
  </script>
</body>
</html>
```

### Step 10: Submit for Review

1. **Test locally:**
   ```bash
   npm run start
   # Navigate to /artifacts
   # Verify your artifact appears and renders correctly
   ```

2. **Commit your artifact:**
   ```bash
   git add website/src/data/artifacts/\{type\}/\{name\}
   git commit -m "Add artifact: \{title\}"
   ```

3. **Submit pull request:**
   - Title: `Add artifact: \{title\}`
   - Description: Link to artifact preview, brief summary
   - Reviewers will check: structure, quality, learnings

---

## Front-End Component Artifacts (Special Guide)

Front-end before/after artifacts require special attention to preserve full functionality.

### What to Preserve

**Components:**
- All React/Vue/Svelte component files
- TypeScript/JavaScript source
- Component tests

**Data:**
- Mock data used by components
- API response fixtures
- Configuration files

**Styles:**
- CSS/SCSS files
- CSS modules
- Styled components

**Assets:**
- Images, icons, fonts
- SVG graphics
- Audio/video files (if small)

**Context:**
- React Context providers
- State management (Redux, Zustand)
- Custom hooks

### Creating Interactive Previews

For complex components, create standalone HTML previews:

**Steps:**
1. Bundle component with all dependencies
2. Inline critical CSS
3. Embed assets as data URLs (for small files)
4. Create self-contained HTML file
5. Test in isolation

**Example: Winamp Player Demo**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Winamp Player - Audio Engineering Improvements</title>
  <style>
    /* Inline all component CSS */
    .winamp-modal { /* styles */ }
    .visualizer { /* styles */ }
  </style>
</head>
<body>
  <h1>Before: Fake CSS Animations</h1>
  <div id="before-demo">
    <!-- Before component -->
  </div>

  <h1>After: Real FFT Analysis</h1>
  <div id="after-demo">
    <!-- After component -->
  </div>

  <script>
    // Embed JavaScript
    // Include Web Audio API setup
    // Demonstrate real-time FFT
  </script>
</body>
</html>
```

### Performance Considerations

Front-end artifacts can be large. Guidelines:

**File Size Limits:**
- Component code: No limit (it's source code)
- Images: \< 500KB each (compress with ImageOptim)
- Audio/MIDI: \< 1MB each
- Videos: Link to external (YouTube, Vimeo)
- Total artifact: Aim for \< 10MB

**Optimization:**
- Compress screenshots (PNG → WebP if possible)
- Use SVG for diagrams (smaller than PNG)
- Host large videos externally
- Reference CDN dependencies instead of bundling

### Rendering Strategy

The artifacts page can display front-end components:

**Option 1: Screenshot + Link**
- Show before/after screenshots
- Link to live demo (deployed separately)
- Best for: Complex, large components

**Option 2: Embedded Iframe**
- Embed demo.html in iframe
- Users interact directly on artifacts page
- Best for: Simple, self-contained components

**Option 3: Code Sandbox**
- Link to CodeSandbox/StackBlitz
- Full editing + preview experience
- Best for: Educational artifacts

---

## Winamp Player Artifact Example

Here's how to structure the upcoming Winamp audio improvements:

```
/frontend/winamp-player/001-audio-engineering/
├── artifact.json
├── README.md
├── transcript.md
│
├── before/
│   ├── components/
│   │   ├── WinampModal.tsx          # Current modal with fake visualizer
│   │   ├── MinifiedMusicPlayer.tsx  # Navbar widget
│   │   └── MusicPlayerContext.tsx   # Current audio context (broken volume)
│   ├── hooks/
│   │   └── useWinampSkin.ts
│   ├── data/
│   │   └── musicMetadata.ts
│   ├── styles/
│   │   └── WinampModal.module.css
│   ├── assets/
│   │   ├── screenshot-full.png      # Full modal screenshot
│   │   ├── screenshot-visualizer.png # Fake CSS animation bars
│   │   └── screenshot-volume.png    # Broken volume control
│   └── NOTE.md                       # What's broken and why
│
├── after/
│   ├── components/
│   │   ├── WinampModal.tsx          # Real FFT visualizer
│   │   ├── MinifiedMusicPlayer.tsx  # Real-time bars
│   │   └── MusicPlayerContext.tsx   # Proper GainNode volume
│   ├── hooks/
│   │   ├── useFFTData.ts            # NEW: FFT analysis hook
│   │   ├── useVUMeter.ts            # NEW: VU meter hook
│   │   └── useWinampSkin.ts
│   ├── components/
│   │   ├── EQControls.tsx           # NEW: 3-band EQ
│   │   └── VUMeter.tsx              # NEW: Professional VU meter
│   ├── data/
│   │   └── musicMetadata.ts
│   ├── styles/
│   │   └── WinampModal.module.css   # Updated for real FFT
│   ├── assets/
│   │   ├── screenshot-full.png
│   │   ├── screenshot-visualizer.png  # Real FFT in action
│   │   ├── screenshot-volume.png      # Working volume
│   │   ├── screenshot-eq.png          # 3-band EQ
│   │   └── screenshot-vu-meter.png    # VU meter
│   └── NOTE.md                        # What improved and how
│
├── comparison/
│   ├── feature-comparison.md          # Side-by-side feature list
│   ├── visual-comparison.png          # Before/after split screen
│   └── architecture-diagram.svg       # Audio routing: before vs after
│
└── demos/
    ├── before-demo.html               # Standalone before preview
    └── after-demo.html                # Standalone after preview
```

**artifact.json for Winamp:**
```json
{
  "id": "frontend-winamp-player-001-audio-engineering",
  "title": "Winamp Player: From Fake CSS to Professional Audio Engineering",
  "description": "Complete audio engineering upgrade of Winamp music player. Replaced fake CSS animations with real FFT visualizer, fixed broken volume control with proper GainNode, and added professional features: 3-band EQ, dynamic compression, and VU meters. Demonstrates sound-engineer skill applying Web Audio API best practices.",
  "type": "single-skill",
  "skills": [
    {
      "name": "sound-engineer",
      "role": "Designed and implemented professional audio architecture using Web Audio API: GainNode for volume, AnalyserNode for real-time FFT visualization, BiquadFilterNodes for 3-band EQ, and DynamicsCompressorNode for mastering."
    }
  ],
  "category": "development",
  "tags": [
    "web-audio-api",
    "react",
    "typescript",
    "fft-visualization",
    "audio-engineering",
    "music-player",
    "real-time-processing",
    "ui-components"
  ],
  "difficulty": "advanced",
  "phases": [
    {
      "name": "Phase 1: Core Audio Routing",
      "skills": ["sound-engineer"],
      "duration": "3 tasks",
      "outcome": "Implemented GainNode for volume control with logarithmic scaling, connected proper audio chain: Source → GainNode → AnalyserNode → Destination"
    },
    {
      "name": "Phase 2: Real-Time FFT Visualizer",
      "skills": ["sound-engineer"],
      "duration": "3 tasks",
      "outcome": "Replaced fake CSS animations with real FFT analysis. Created useFFTData hook, updated WinampModal and MinifiedPlayer with 60fps real-time frequency visualization"
    },
    {
      "name": "Phase 3: Professional Audio Features",
      "skills": ["sound-engineer"],
      "duration": "4 tasks",
      "outcome": "Added 3-band EQ (bass/mid/treble), dynamic range compression to prevent clipping, and professional VU meters with peak detection"
    }
  ],
  "outcome": {
    "summary": "Transformed Winamp player from non-functional UI mockup to professional-grade audio application. Volume control now works correctly, visualizer responds to actual music frequencies, and professional features elevate the user experience to match real audio software.",
    "metrics": [
      {
        "label": "Components Created",
        "value": "5"
      },
      {
        "label": "Custom Hooks Added",
        "value": "2"
      },
      {
        "label": "FFT Frequency Bins",
        "value": "24"
      },
      {
        "label": "Animation Frame Rate",
        "value": "60 fps"
      },
      {
        "label": "EQ Bands",
        "value": "3"
      },
      {
        "label": "Audio Nodes in Chain",
        "value": "7"
      },
      {
        "label": "Tasks Completed",
        "value": "10"
      }
    ],
    "learned": [
      "Web Audio API requires proper node chaining for volume control - destination.gain doesn't exist",
      "Logarithmic volume scaling (Math.pow) is essential for natural perception",
      "Real-time FFT visualization needs exponential moving average for smooth animation",
      "AnalyserNode.smoothingTimeConstant helps but custom smoothing gives better control",
      "BiquadFilterNode types (lowshelf, peaking, highshelf) map perfectly to 3-band EQ",
      "DynamicsCompressorNode prevents clipping and normalizes volume across tracks",
      "requestAnimationFrame cleanup is critical to prevent memory leaks",
      "Downsampling FFT bins (64 → 24) improves performance without visual loss",
      "VU meters need RMS calculation for accurate audio level measurement",
      "Professional audio features elevate perceived quality dramatically"
    ]
  },
  "files": {
    "transcript": "transcript.md",
    "before": [
      "before/components/WinampModal.tsx",
      "before/components/MinifiedMusicPlayer.tsx",
      "before/components/MusicPlayerContext.tsx",
      "before/NOTE.md"
    ],
    "after": [
      "after/components/WinampModal.tsx",
      "after/components/MinifiedMusicPlayer.tsx",
      "after/components/MusicPlayerContext.tsx",
      "after/hooks/useFFTData.ts",
      "after/hooks/useVUMeter.ts",
      "after/components/EQControls.tsx",
      "after/components/VUMeter.tsx",
      "after/NOTE.md"
    ],
    "assets": [
      "comparison/feature-comparison.md",
      "comparison/visual-comparison.png",
      "comparison/architecture-diagram.svg",
      "before/assets/screenshot-full.png",
      "before/assets/screenshot-visualizer.png",
      "after/assets/screenshot-full.png",
      "after/assets/screenshot-visualizer.png",
      "after/assets/screenshot-eq.png",
      "after/assets/screenshot-vu-meter.png"
    ]
  },
  "createdAt": "2024-11-25T00:00:00Z",
  "featured": true,
  "viewCount": 0
}
```

---

## Best Practices

### DO:
✅ Preserve exact before state (don't clean it up)
✅ Capture full conversation transcript when possible
✅ Include quantifiable metrics in outcome
✅ Write clear, actionable learnings
✅ Add visual assets (screenshots, diagrams)
✅ Test your artifact renders correctly locally
✅ Be honest about difficulty level
✅ Credit all skills used with specific roles

### DON'T:
❌ Retroactively create artifacts (preserve as you go)
❌ Cherry-pick only successful attempts
❌ Omit failed iterations or dead ends
❌ Exaggerate outcomes or metrics
❌ Include massive binary files (&gt;10MB)
❌ Submit without testing preview locally
❌ Forget to update artifact list in artifacts.tsx

---

## Need Help?

- **Questions:** Open an issue with label `artifact-contribution`
- **Feedback:** Suggest improvements to this guide
- **Examples:** Browse existing artifacts in `/website/src/data/artifacts`

Happy artifact creating! 🎨

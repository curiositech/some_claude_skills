# Visual Archive

High-quality screenshots and video recordings documenting the renovation progress.

---

## Directory Structure

```
archive/
├── ARCHIVE.md              # This file
├── screenshots/
│   ├── before/             # Pre-renovation state (2026-01-03)
│   │   ├── homepage/
│   │   │   ├── desktop/    # 1920x1080
│   │   │   └── mobile/     # 390x844 (iPhone 14 Pro)
│   │   ├── skills/
│   │   ├── ecosystem/
│   │   ├── favorites/
│   │   ├── bundles/        # N/A (doesn't exist yet)
│   │   ├── videos-page/    # N/A (doesn't exist yet)
│   │   └── progress/       # N/A (doesn't exist yet)
│   ├── during/             # Phase completion milestones
│   │   └── phase-{N}-{name}/
│   └── after/              # Final state
└── videos/
    ├── before/             # Current user flows
    │   ├── first-visit-flow.mp4
    │   └── skill-discovery-flow.mp4
    ├── during/             # Feature demos as built
    └── after/              # Final walkthroughs
```

---

## Capture Specifications

### Screenshots

| Type | Resolution | Format | Naming |
|------|------------|--------|--------|
| Desktop | 1920x1080 | PNG | `{page}-desktop-{feature}.png` |
| Mobile | 390x844 | PNG | `{page}-mobile-{feature}.png` |
| Component | Varies | PNG | `{component}-{state}.png` |

### Videos

| Type | Resolution | Format | Duration |
|------|------------|--------|----------|
| User Flow | 1920x1080 | MP4 (H.264) | 30s-2min |
| Feature Demo | 1920x1080 | MP4 (H.264) | 1-5min |
| Full Walkthrough | 1920x1080 | MP4 (H.264) | 5-15min |

---

## Capture Log

### Before State (2026-01-03)

#### Screenshots

| Page | Desktop | Mobile | Notes |
|------|---------|--------|-------|
| Homepage | `homepage-desktop-full.png` | `homepage-mobile-full.png` | Marquee, hero, skill cards |
| Skills | `skills-desktop-full.png` | `skills-mobile-full.png` | Grid view, QuickView modal |
| Ecosystem | `ecosystem-desktop-full.png` | `ecosystem-mobile-full.png` | Overview layout |
| Favorites | `favorites-desktop-full.png` | `favorites-mobile-full.png` | Empty state likely |

#### Videos

| Flow | File | Size | Description |
|------|------|------|-------------|
| First Visit | `01-first-visit-flow.webm` | 3.3 MB | Landing → scroll → browse gallery → click skill |
| Skill Discovery | `02-skill-discovery-flow.webm` | 3.2 MB | Search → filter by tags → view skill details |
| Navigation | `03-navigation-flow.webm` | 3.6 MB | Homepage → Skills → Ecosystem → Favorites → Home |
| Mobile | `04-mobile-experience-flow.webm` | 1.9 MB | Mobile responsive behavior on key pages |

### Phase Milestones

| Phase | Date | Key Captures |
|-------|------|--------------|
| Phase 1: Foundation | TBD | Win31 component demos |
| Phase 1: Onboarding | TBD | Onboarding modal flow video |
| Phase 2: Tutorials | TBD | Tutorial step interactions |
| Phase 3: Bundles | TBD | Bundle page, install flow |
| Phase 4: Videos | TBD | Video player component |
| Phase 5: Polish | TBD | Before/after comparisons |

---

## Tools Used

- **Playwright MCP**: Automated browser screenshots
- **QuickTime**: Screen recordings on macOS
- **FFmpeg**: Video processing and compression

---

## How to Capture

### Automated Screenshots (Playwright)

```bash
# Via Claude Code with Playwright MCP
# Navigate → Wait for load → Screenshot
```

### Manual Video Recording

```bash
# QuickTime Player → File → New Screen Recording
# Select area, record flow, save to archive/videos/
```

### Post-Processing

```bash
# Compress video
ffmpeg -i input.mov -c:v libx264 -crf 23 -preset medium output.mp4

# Resize screenshot
magick input.png -resize 1920x1080 output.png
```

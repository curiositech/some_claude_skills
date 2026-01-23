# Artifact Preservation Quick Reference

Use this guide while actively creating an artifact. For full details, see `ARTIFACT_PRESERVATION.md`.

## Workflow Checklist

### Before Starting Work
- [ ] Create artifact folder: `/website/src/data/artifacts/{type}/{skill-name}/{number-name}/`
- [ ] Copy current files to `before/` folder
  - [ ] Components, hooks, contexts
  - [ ] Data files
  - [ ] Styles and assets
  - [ ] Screenshots of current state
- [ ] Create `before/NOTE.md` explaining what's broken or needs improvement

### During Work
- [ ] Save conversation transcript to `transcript.md`
- [ ] Document decision-making process
- [ ] Note iterations and refinements

### After Completion
- [ ] Copy improved files to `after/` folder
  - [ ] All modified components
  - [ ] New hooks, utilities, components
  - [ ] Updated styles and assets
  - [ ] Screenshots showing improvements
- [ ] Create `after/NOTE.md` explaining what improved and how
- [ ] Create `artifact.json` with metadata
- [ ] Write comprehensive `README.md`
- [ ] Add visual assets (screenshots, diagrams)
- [ ] Test locally: `npm run start` → navigate to `/artifacts`

## Artifact Types

| Type | Use When | Example |
|------|----------|---------|
| `single-skill` | One skill working independently | skill-coach improving itself |
| `multi-skill` | Multiple skills orchestrating | vibe-matcher → web-design-expert → frontend-developer |
| `frontend` | UI components with before/after | Winamp player audio improvements |

## Folder Structure

```
/website/src/data/artifacts/{type}/{skill-name}/{number-name}/
├── artifact.json       # REQUIRED: Metadata
├── README.md           # REQUIRED: Overview
├── transcript.md       # OPTIONAL: Conversation log
├── before/             # REQUIRED: Initial state
│   ├── components/
│   ├── data/
│   ├── assets/
│   └── NOTE.md
├── after/              # REQUIRED: Final state
│   ├── components/
│   ├── data/
│   ├── assets/
│   └── NOTE.md
├── comparison/         # OPTIONAL: Side-by-sides
│   └── feature-comparison.md
└── demos/              # OPTIONAL: Standalone previews
    ├── before-demo.html
    └── after-demo.html
```

## artifact.json Template

```json
{
  "id": "{type}-{skill}-{number}-{slug}",
  "title": "Descriptive Title",
  "description": "2-3 sentence summary",
  "type": "single-skill | multi-skill | frontend",
  "skills": [
    {
      "name": "skill_name",
      "role": "What this skill did"
    }
  ],
  "category": "design | development | ai-ml | research | writing | meta",
  "tags": ["tag1", "tag2"],
  "difficulty": "beginner | intermediate | advanced",
  "phases": [
    {
      "name": "Phase Name",
      "skills": ["skill_name"],
      "duration": "time estimate",
      "outcome": "What was accomplished"
    }
  ],
  "outcome": {
    "summary": "Overall result",
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
    "before": ["before/file1.tsx"],
    "after": ["after/file1.tsx"],
    "assets": ["assets/screenshot.png"]
  },
  "createdAt": "2024-11-25T00:00:00Z",
  "featured": false,
  "viewCount": 0
}
```

## Front-End Component Checklist

For UI components like Winamp player:

- [ ] Preserve full component trees (not just changed files)
- [ ] Include all data files and contexts
- [ ] Capture screenshots:
  - [ ] Full UI
  - [ ] Specific features
  - [ ] Before/after comparisons
- [ ] Create standalone `demo.html` for interactive preview
- [ ] Optimize images (&lt;500KB each)
- [ ] Document or externally host audio/video assets

## File Size Guidelines

- **Component code**: No limit (it's source code)
- **Images**: &lt; 500KB each (compress with ImageOptim)
- **Audio/MIDI**: &lt; 1MB each
- **Videos**: Link to external (YouTube, Vimeo)
- **Total artifact**: Aim for &lt; 10MB

## Remember

✅ **DO:**
- Preserve exact before state (don't clean it up)
- Include failed attempts and dead ends
- Be honest about metrics and difficulty
- Document all skills used with specific roles
- Test artifact renders correctly before committing

❌ **DON'T:**
- Retroactively create artifacts (preserve as you go)
- Cherry-pick only successful attempts
- Exaggerate outcomes
- Include massive binaries (&gt;10MB)
- Skip testing preview locally

## Testing

```bash
# Start dev server
npm run start

# Navigate to artifacts page
open http://localhost:3000/artifacts

# Verify your artifact appears and renders correctly
```

## Submitting

```bash
# Add artifact
git add website/src/data/artifacts/{type}/{name}

# Commit
git commit -m "Add artifact: {title}"

# Update artifact imports in artifacts.tsx if needed
# Push and create pull request
```

---

For complete documentation, see [`ARTIFACT_PRESERVATION.md`](./ARTIFACT_PRESERVATION.md)

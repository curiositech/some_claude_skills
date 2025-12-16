---
title: Artifact Structure Reference
sidebar_label: Artifact Structure Reference
sidebar_position: 1
---
# Artifact Structure Reference

Complete reference for creating and structuring artifacts.

## Artifact Types

| Type | Description | When to Use |
|------|-------------|-------------|
| `single-skill` | One skill working alone | Demonstrating skill capability |
| `multi-skill` | Multiple skills orchestrating | Showcasing collaboration |
| `frontend` | UI components with demos | Interactive features |

## Directory Structure

```
website/src/data/artifacts/\{type\}/{skill-name}/{artifact-id}/
├── artifact.json          # REQUIRED: Metadata
├── README.md             # REQUIRED: Blog-style narrative
├── transcript.md         # OPTIONAL: Implementation log
├── before/               # REQUIRED: Initial state
│   ├── components/
│   ├── data/
│   ├── assets/
│   └── NOTE.md
├── after/                # REQUIRED: Final state
│   ├── components/
│   ├── data/
│   ├── assets/
│   └── NOTE.md
├── comparison/           # OPTIONAL: Side-by-sides
│   └── feature-comparison.md
└── demos/                # OPTIONAL: Standalone previews
    ├── before-demo.html
    └── after-demo.html
```

## artifact.json Schema

```json
{
  "id": "kebab-case-id",
  "title": "Human-Readable Title",
  "type": "single-skill | multi-skill",
  "skills": [
    {
      "name": "skill-name",
      "role": "Specific description of what this skill did..."
    }
  ],
  "phases": [
    {
      "name": "Phase 1: Discovery",
      "skills": ["skill-1"],
      "outcome": "What was achieved in this phase"
    },
    {
      "name": "Phase 2: Implementation",
      "skills": ["skill-1", "skill-2"],
      "outcome": "What was achieved in this phase"
    }
  ],
  "outcome": {
    "summary": "High-level outcome description",
    "metrics": [
      {"label": "Tracks Added", "value": "22"},
      {"label": "Components Created", "value": "15"}
    ],
    "learned": [
      "Real insight gained during development",
      "Technical challenge overcome",
      "Design decision and rationale"
    ]
  },
  "files": {
    "transcript": "transcript.md",
    "before": ["before/component.tsx", "before/styles.css"],
    "after": ["after/component.tsx", "after/styles.css"],
    "assets": ["assets/screenshot.png"]
  },
  "heroImage": "/some_claude_skills/img/artifacts/artifact-hero.png",
  "interactiveDemo": "component-identifier",
  "narrative": [
    "Hook: What makes this interesting?",
    "Journey: How was it built?",
    "Impact: Why does it matter?"
  ]
}
```

## Writing Compelling Narratives

The `narrative` field tells the STORY. Write 3-5 paragraphs:

### Paragraph 1: The Hook
- What makes this interesting?
- Why should anyone care?
- What's novel or surprising?
- Lead with the most compelling detail

### Paragraph 2: The Journey
- How was it actually built?
- What challenges were overcome?
- What technical decisions mattered?
- Document what ACTUALLY happened (not formulaic)

### Paragraph 3: The Impact
- What's the end result?
- What does this enable?
- For interactive demos: invite them to try it

## Narrative Anti-Patterns

**Avoid**:
- Forcing artificial iteration counts
- Dry technical documentation tone
- Starting with implementation details
- Forgetting to mention interactive demos
- Generic phrases that apply to any project

**Instead**:
- Authentic story of what happened
- Capture "aha!" moments and surprises
- Make technical decisions relatable
- Invite readers to experience demos
- Include specific, memorable details

## Creation Workflow

### Step 1: Identify Pattern
```markdown
Skills involved: [List]
Primary skill: [Which led]
Supporting skills: [Which assisted]
Duration: [How long]
```

### Step 2: Create Structure
```bash
mkdir -p website/src/data/artifacts/multi-skill/{skill-name}/{artifact-id}
cd website/src/data/artifacts/multi-skill/{skill-name}/{artifact-id}
touch artifact.json README.md
mkdir before after assets
```

### Step 3: Capture Before State
- Copy relevant files to `before/`
- Screenshot current state
- Write `before/NOTE.md` explaining issues

### Step 4: Do the Work
- Implement the feature/fix
- Save transcript if valuable

### Step 5: Capture After State
- Copy improved files to `after/`
- Screenshot improvements
- Write `after/NOTE.md` explaining changes

### Step 6: Write artifact.json
- Follow schema exactly
- Include all files referenced
- Write compelling narrative

### Step 7: Validate
```bash
# Check all referenced files exist
jq -r '.files | to_entries[] | .value[]' artifact.json | while read f; do
  [ -f "$f" ] || echo "Missing: $f"
done

# Verify in website
npm run start
# Navigate to /artifacts
```

## Interactive Demos

For UI components, use `interactiveDemo`:

```json
{
  "interactiveDemo": "music-player"
}
```

This embeds the actual working component on the artifact page, allowing visitors to experience the feature directly.

## When to Create Artifacts

Create artifacts when:
- Multi-skill collaboration produces something cool
- New pattern emerges (first time X + Y work together)
- Feature demonstrates what's now possible
- User says "wow" or "this is amazing"
- Interactive feature was built

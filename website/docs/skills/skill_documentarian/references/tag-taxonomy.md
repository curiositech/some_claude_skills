---
title: Tag Taxonomy Reference
sidebar_label: Tag Taxonomy Reference
sidebar_position: 4
---
# Tag Taxonomy Reference

Complete reference for the skill tag system used in `website/src/types/tags.ts`.

## Tag Types and Colors

Tags are organized into 5 types, each with its own color for visual categorization:

| Type | Color | Purpose |
|------|-------|---------|
| Skill Type | Purple | What the skill DOES |
| Domain | Blue | The FIELD it operates in |
| Output | Green | What it PRODUCES |
| Complexity | Orange | Skill level required |
| Integration | Pink | What it CONNECTS with |

## Complete Tag Reference

### Skill Type Tags (Purple)

| Tag ID | Label | Description |
|--------|-------|-------------|
| `research` | Research | Gathers and synthesizes information |
| `analysis` | Analysis | Evaluates and interprets data/designs |
| `creation` | Creation | Generates new artifacts/code/designs |
| `coaching` | Coaching | Guides and mentors users |
| `validation` | Validation | Checks quality/correctness |
| `automation` | Automation | Automates workflows |
| `orchestration` | Orchestration | Coordinates multiple skills |

### Domain Tags (Blue)

| Tag ID | Label | Description |
|--------|-------|-------------|
| `design` | Design | Visual/UX design |
| `code` | Code | Software development |
| `ml` | ML | Machine learning/AI |
| `cv` | CV | Computer vision |
| `audio` | Audio | Sound/music/voice |
| `3d` | 3D | 3D graphics/simulation |
| `robotics` | Robotics | Drones/autonomous systems |
| `photography` | Photography | Photo analysis/curation |
| `psychology` | Psychology | Mental health/behavior |
| `finance` | Finance | Money/investments |
| `health` | Health | Physical/medical |
| `career` | Career | Professional development |
| `strategy` | Strategy | Business/planning |
| `entrepreneurship` | Entrepreneurship | Startups/business building |
| `devops` | DevOps | Infrastructure/deployment |
| `spatial` | Spatial | Interior/architectural design |
| `visual` | Visual | General visual aesthetics |

### Output Tags (Green)

| Tag ID | Label | Description |
|--------|-------|-------------|
| `document` | Document | Written documentation |
| `data` | Data | Structured data/analysis |

### Complexity Tags (Orange)

| Tag ID | Label | Description |
|--------|-------|-------------|
| `beginner-friendly` | Beginner Friendly | Easy to use |
| `advanced` | Advanced | Requires expertise |
| `production-ready` | Production Ready | Battle-tested for real use |

### Integration Tags (Pink)

| Tag ID | Label | Description |
|--------|-------|-------------|
| `mcp` | MCP | Uses MCP tools |
| `elevenlabs` | ElevenLabs | ElevenLabs audio API |
| `accessibility` | Accessibility | ADHD/accessibility focus |

## Tag Assignment Rules

### Quantity Guidelines
- **Optimal**: 3-5 tags per skill
- **Minimum**: 2 tags (skill-type + domain)
- **Maximum**: 6 tags (avoid tag overload)

### Required Coverage
Every skill should have at least:
1. **One skill-type tag** (what it does)
2. **One domain tag** (what field)

Consider adding:
3. Complexity tag (user guidance)
4. Integration tags (if applicable)

### Specificity Principle
Use specific tags over generic ones when appropriate:
- `photography` beats generic `visual` for photo skills
- `ml` beats generic `code` for ML-focused skills
- `robotics` beats generic `automation` for drone skills

### User Mental Model Matching
Tags should match what users search for:
- Think: "What would someone type to find this skill?"
- Use common terminology, not internal jargon

## Where Tags Are Updated

### 1. `website/src/data/skills.ts`
```typescript
{
  id: 'skill-name',
  title: 'Skill Title',
  category: 'Category Name',
  path: '/docs/skills/skill_name',
  description: 'Brief description',
  tags: ['creation', 'design', 'code', 'beginner-friendly']
}
```

### 2. Skill Doc Files (SkillHeader)
```jsx
<SkillHeader
  skillName="Skill Name"
  fileName="skill_name"
  description="..."
  tags={["creation", "design", "code", "beginner-friendly"]}
/>
```

### 3. Tag Type Definition
```typescript
// website/src/types/tags.ts
export const SKILL_TAGS = [
  { id: 'research', label: 'Research', type: 'skill-type', description: '...' },
  // ... more tags
];
```

## Validation Commands

```bash
# List all valid tag IDs
grep "id: '" website/src/types/tags.ts | sed "s/.*id: '\\([^']*\\)'.*/\\1/"

# Count skills using each tag
for tag in research analysis creation coaching; do
  echo "$tag: $(grep "'$tag'" website/src/data/skills.ts | wc -l)"
done

# Find skills missing tags
grep -B5 "tags: \[\]" website/src/data/skills.ts
```

## Adding New Tags

Only add new tags when:
1. Multiple skills (3+) would benefit
2. Existing tags don't cover the concept
3. Users would search for this term

Process:
1. Edit `website/src/types/tags.ts`
2. Add to appropriate type category:
   ```typescript
   { id: 'new-tag', label: 'New Tag', type: 'domain', description: 'What it means' }
   ```
3. Use in skills that need it
4. Rebuild to verify: `npm run build`

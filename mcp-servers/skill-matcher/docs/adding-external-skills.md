# Adding External Skills to SkillFinder

This guide explains how to add skills from external sources to the SkillFinder catalog, enabling them to be discovered alongside the built-in Some Claude Skills.

## Overview

SkillFinder can index skills from multiple sources:

1. **Local skills** - `.claude/skills/` directory (automatic)
2. **Local agents** - `.claude/agents/` directory (automatic)
3. **External catalogs** - Custom JSON files following the schema
4. **Runtime registration** - Programmatic skill registration

## Method 1: JSON Catalog File

Create a JSON file following the `skill-catalog.schema.json` schema:

```json
{
  "$schema": "https://someclaudeskills.com/schemas/skill-catalog.schema.json",
  "id": "my-custom-skill",
  "type": "skill",
  "name": "My Custom Skill",
  "description": "A detailed description of what this skill does...",
  "activation": {
    "triggers": ["keyword1", "keyword2", "phrase to match"],
    "notFor": ["things it shouldn't do"]
  },
  "category": "research-strategy",
  "metadata": {
    "source": "custom",
    "sourceUrl": "https://github.com/user/skill-repo"
  }
}
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique kebab-case identifier |
| `type` | enum | `skill`, `agent`, `mcp`, or `subagent` |
| `name` | string | Human-readable display name |
| `description` | string | 50-500 character description |
| `activation.triggers` | array | Keywords/phrases that should activate |
| `activation.notFor` | array | Explicit anti-patterns |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `category` | enum | Category for grouping |
| `tags` | array | Tags for filtering |
| `capabilities.tools` | array | MCP tools used |
| `capabilities.outputs` | array | Output types produced |
| `metadata.source` | enum | Origin: `local`, `someclaudeskills`, `mcp-registry`, `github`, `custom` |
| `metadata.sourceUrl` | string | URL to skill source |
| `examples` | array | Test cases for validation |

## Method 2: Community Skill Registry

Submit your skill to the Some Claude Skills community registry:

1. Fork the [some_claude_skills](https://github.com/curiositech/some_claude_skills) repository
2. Add your catalog entry to `mcp-servers/skill-matcher/community-catalog/`
3. Submit a pull request

### Community Submission Requirements

- [ ] Valid JSON following the schema
- [ ] Unique ID not conflicting with existing skills
- [ ] At least 3 activation triggers
- [ ] At least 1 anti-pattern
- [ ] Description between 50-500 characters
- [ ] Working source URL (if provided)

## Method 3: Programmatic Registration

Use the client SDK to register skills at runtime:

```typescript
import { SkillMatcherClient } from '@someclaudeskills/skill-matcher/client';

const client = new SkillMatcherClient();

// Register a custom skill
await client.registerSkill({
  id: 'my-runtime-skill',
  type: 'skill',
  name: 'My Runtime Skill',
  description: 'Dynamically registered skill',
  activation: {
    triggers: ['dynamic', 'runtime'],
    notFor: ['static configuration']
  }
});
```

## Activation Triggers Best Practices

### Good Triggers
- Specific action phrases: "create a website", "analyze data"
- Domain keywords: "machine learning", "financial analysis"
- Tool references: "using CLIP", "with TensorFlow"

### Bad Triggers
- Generic words: "help", "do", "make"
- Single characters or very short words
- Overlapping triggers with other skills

## Anti-Pattern Guidelines

The `notFor` array is crucial for avoiding false matches:

```json
{
  "notFor": [
    "backend-only development",
    "API design without UI",
    "database schema design"
  ]
}
```

### When to Add Anti-Patterns

1. **Similar-sounding tasks** - If users might confuse your skill with another
2. **Out-of-scope subtasks** - Tasks that seem related but aren't covered
3. **Technology conflicts** - When your skill is for React but not Vue, etc.

## Embedding Optimization

To improve match quality, write descriptions that:

1. **Include synonyms** - "website, web page, web app, site"
2. **State the problem** - "For users who need to..."
3. **List capabilities** - "Can create, edit, and optimize..."
4. **Mention outputs** - "Produces code, documentation, and..."

### Example Optimized Description

> "Creates unique web designs with brand identity, color palettes, and modern UI/UX patterns. For users who need to build websites, landing pages, or web applications. Produces responsive CSS, HTML structure, and design tokens. Works with React, Vue, or vanilla JavaScript."

## Testing Your Skill

Before submitting, test your skill entry:

```bash
# Validate schema
npx ajv validate -s schemas/skill-catalog.schema.json -d your-skill.json

# Test matching
npx skill-matcher match "your expected trigger phrase"

# Verify anti-patterns
npx skill-matcher match "something it should NOT match"
```

## Categories Reference

| Category | Description |
|----------|-------------|
| `orchestration-meta` | Workflow coordination, meta-skills |
| `visual-design-ui` | Web design, UI/UX, visual creation |
| `graphics-3d-simulation` | 3D, shaders, physics simulation |
| `audio-sound-design` | Audio processing, music, voice |
| `computer-vision-image-ai` | Image analysis, CV, photo AI |
| `autonomous-systems-robotics` | Drones, robots, autonomous systems |
| `conversational-ai-bots` | Chatbots, Discord/Slack bots |
| `research-strategy` | Research, analysis, strategy |
| `coaching-personal-development` | Career, coaching, personal growth |
| `devops-site-reliability` | DevOps, SRE, infrastructure |
| `business-monetization` | Business strategy, monetization |
| `documentation-visualization` | Docs, diagrams, visualization |

## Support

- Issues: [GitHub Issues](https://github.com/curiositech/some_claude_skills/issues)
- Discussions: [GitHub Discussions](https://github.com/curiositech/some_claude_skills/discussions)
- Website: [someclaudeskills.com](https://someclaudeskills.com)

---
title: Skill Registry & Semantic Matching
description: How the DAG framework discovers and matches skills to tasks using semantic similarity and capability ranking
sidebar_position: 2
---

# Skill Registry & Semantic Matching

The skill registry is the DAG framework's index of all available Claude Code skills. When you specify a task description instead of an explicit skill ID, the registry uses semantic similarity to automatically select the best skill for the job.

## How the Registry Works

Skills are indexed at startup with embeddings computed from their name, description, and example use-cases. When the executor encounters a node with a natural-language task rather than a hard-coded `skillId`, it:

1. **Embeds** the task description using the same model
2. **Computes cosine similarity** against all indexed skill embeddings
3. **Ranks** candidates by combined score: `0.6 × semantic + 0.4 × capability_match`
4. **Selects** the top-ranked skill that meets any permission constraints

## Loading Skills into the Registry

```typescript
import { SkillRegistry } from '@site/src/dag/registry';

const registry = new SkillRegistry();

// Load all skills from the catalog
await registry.loadFromDirectory('./skills/');

// Or load individual skills
await registry.register({
  id: 'ai-engineer',
  name: 'AI Engineer',
  description: 'Build production-ready LLM applications and RAG systems',
  tags: ['llm', 'embeddings', 'rag', 'agents'],
  inputSchema: { type: 'object', properties: { task: { type: 'string' } } },
});
```

## Semantic Matching Example

```typescript
const matches = await registry.findBestMatch(
  'implement a vector search index for my documents'
);

// Returns ranked candidates:
// 1. ai-engineer        (score: 0.91)  "Build LLM apps, RAG systems..."
// 2. data-pipeline      (score: 0.74)  "ETL and data processing..."
// 3. backend-architect  (score: 0.62)  "API design and services..."
```

## Capability Ranking

Beyond semantic similarity, the ranker considers:

| Factor | Weight | Description |
|--------|--------|-------------|
| Semantic similarity | 0.6 | Embedding cosine distance to task description |
| Tag overlap | 0.2 | Matching tags between task hints and skill metadata |
| Past success rate | 0.1 | Historical success rate for similar task types |
| Latency score | 0.1 | Penalises slow skills for time-sensitive nodes |

## Embedding Cache

Skill embeddings are cached to avoid re-computation on every DAG execution:

```typescript
// Embeddings are persisted in ~/.claude/dag/embeddings.json
// Cache is invalidated when a skill's description changes
const cache = new EmbeddingCache('./cache/embeddings.json');
await registry.loadWithCache(skillDir, cache);
```

## Filtering and Constraints

You can constrain which skills are eligible for automatic selection:

```yaml
nodes:
  - id: security-check
    description: "Run a security audit on the changed files"
    skillConstraints:
      allowedSkillIds: [security-auditor, code-review-checklist]
      requiredTags: [security]
      excludeTags: [experimental]
```

## Viewing the Skill Catalog

The full registry of 143+ available skills is browsable at [someclaudeskills.com](/).

Each skill page shows:
- The skill's ID (use this in `skillId` fields)
- What it does and when to use it
- Example node configurations

## Custom Skills

You can register custom skills that aren't in the public catalog:

```typescript
registry.register({
  id: 'my-custom-skill',
  name: 'My Custom Skill',
  description: 'Domain-specific task for my application',
  path: './skills/my-custom-skill.md',
  tags: ['custom', 'domain-specific'],
});
```

Custom skills are available in the builder's node palette after registration.

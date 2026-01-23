# Epoch 2: Workstream Roadmap
## Parallelizable Expansion Plan

```
╔══════════════════════════════════════════════════════════════════╗
║  🏛️ + 📜  ARCHITECT & ARCHIVIST — Strategic Planning             ║
║  ────────────────────────────────────────────────────────────────║
║  Map-Reduce Parallelization Strategy for Maximum Velocity        ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## The Pattern: Map → Prepare Content → Trivial Join

**Key Insight**: Agents prepare complete file content as return values. The orchestrator's join step is trivial sequential file writes—no creative work, just `Write(path, content)`.

```
┌─────────────────────────────────────────────────────────────────┐
│  MAP PHASE (Parallel)                                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ Agent A │  │ Agent B │  │ Agent C │  │ Agent D │            │
│  │ returns │  │ returns │  │ returns │  │ returns │            │
│  │ {file,  │  │ {file,  │  │ {file,  │  │ {file,  │            │
│  │  content}│  │  content}│  │  content}│  │  content}│            │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘            │
│       │            │            │            │                  │
└───────┼────────────┼────────────┼────────────┼──────────────────┘
        │            │            │            │
        v            v            v            v
┌─────────────────────────────────────────────────────────────────┐
│  REDUCE PHASE (Sequential, Trivial)                              │
│  Write(file_a, content_a)                                        │
│  Write(file_b, content_b)                                        │
│  Write(file_c, content_c)                                        │
│  Write(file_d, content_d)                                        │
│  git add && git commit                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Workstream 1: Documentation Expansion
**Goal**: 100% skill documentation coverage (currently 32%)

### Parallel Tasks (5 CLI Sessions)

| Session | Skills to Document | Agent | Output Format |
|---------|-------------------|-------|---------------|
| CLI-1 | 2000s-visualization, adhd-design, automatic-stateful-prompt | Cartographer | `{path: "website/docs/skills/X.md", content: "..."}` |
| CLI-2 | bot-developer, career-biographer, clip-aware | Cartographer | Same |
| CLI-3 | code-necromancer, collage-layout, color-theory | Cartographer | Same |
| CLI-4 | competitive-cartographer, cv-creator, design-archivist | Cartographer | Same |
| CLI-5 | diagramming, drone-cv, drone-inspection | Cartographer | Same |

**Join Step**: Sequential `Write()` calls with returned content.

---

## Workstream 2: RAG Infrastructure
**Goal**: Semantic search across skills/agents

### Parallel Tasks (3 CLI Sessions)

| Session | Task | Agent | Output |
|---------|------|-------|--------|
| CLI-1 | Generate embeddings for all 53 skills | Weaver | `{vectors: [...], metadata: [...]}` |
| CLI-2 | Generate embeddings for all 9 agents | Weaver | `{vectors: [...], metadata: [...]}` |
| CLI-3 | Generate embeddings for all docs (council, guides) | Weaver | `{vectors: [...], metadata: [...]}` |

**Join Step**: Merge into single vector store, write index.

---

## Workstream 3: The Forge (Infrastructure)
**Goal**: Automated skill validation and testing

### Parallel Tasks (4 CLI Sessions)

| Session | Component | Agent | Output |
|---------|-----------|-------|--------|
| CLI-1 | SKILL.md validator (YAML, structure, anti-patterns) | Smith | `{path: "scripts/validate-skill.ts", content: "..."}` |
| CLI-2 | Cross-reference analyzer (find broken skill refs) | Smith | `{path: "scripts/analyze-refs.ts", content: "..."}` |
| CLI-3 | Benchmark harness (skill invocation timing) | Smith | `{path: "scripts/benchmark.ts", content: "..."}` |
| CLI-4 | Integration test generator | Smith | `{path: "scripts/generate-tests.ts", content: "..."}` |

**Join Step**: Write files, add to package.json scripts.

---

## Workstream 4: External Intelligence
**Goal**: Monitor Claude Code community for inspiration

### Parallel Tasks (3 CLI Sessions)

| Session | Domain | Agent | Output |
|---------|--------|-------|--------|
| CLI-1 | GitHub trending Claude projects | Scout | `{report: "...", opportunities: [...]}` |
| CLI-2 | Twitter/X Claude Code discussions | Scout | `{report: "...", ideas: [...]}` |
| CLI-3 | HuggingFace Claude-related models | Scout | `{report: "...", integrations: [...]}` |

**Join Step**: Merge into inspiration brief for Architect.

---

## Workstream 5: Website Enhancement
**Goal**: Interactive skill explorer, knowledge graph visualization

### Parallel Tasks (3 CLI Sessions)

| Session | Feature | Agent | Output |
|---------|---------|-------|--------|
| CLI-1 | D3.js capability graph component | Visualizer | `{component: "...", styles: "..."}` |
| CLI-2 | Skill comparison tool | Visualizer | `{component: "...", data: "..."}` |
| CLI-3 | Agent activity timeline | Visualizer | `{component: "...", hooks: "..."}` |

**Join Step**: Write components, update page imports.

---

## Execution Matrix

```
                    Week 1           Week 2           Week 3
                   ┌─────────────┬─────────────┬─────────────┐
Workstream 1       │ ████████████│             │             │
(Docs)             │ 5 parallel  │             │             │
                   ├─────────────┼─────────────┼─────────────┤
Workstream 2       │ ████████████│             │             │
(RAG)              │ 3 parallel  │             │             │
                   ├─────────────┼─────────────┼─────────────┤
Workstream 3       │             │ ████████████│             │
(Forge)            │             │ 4 parallel  │             │
                   ├─────────────┼─────────────┼─────────────┤
Workstream 4       │ ████████████│ ████████████│ ████████████│
(Intel)            │ Ongoing 3p  │ Ongoing 3p  │ Ongoing 3p  │
                   ├─────────────┼─────────────┼─────────────┤
Workstream 5       │             │             │ ████████████│
(Website)          │             │             │ 3 parallel  │
                   └─────────────┴─────────────┴─────────────┘
```

---

## Agent Output Contracts

Each agent MUST return structured output for trivial join:

### Cartographer (Documentation)
```json
{
  "files": [
    {
      "path": "website/docs/skills/skill_name.md",
      "content": "---\ntitle: ...\n---\n# Skill Name\n..."
    }
  ],
  "metadata": {
    "skills_documented": 3,
    "total_lines": 450
  }
}
```

### Weaver (RAG)
```json
{
  "vectors": {
    "store_path": ".claude/rag/skills.index",
    "embeddings": [...],
    "metadata": [...]
  },
  "config": {
    "model": "text-embedding-3-small",
    "dimensions": 1536
  }
}
```

### Smith (Infrastructure)
```json
{
  "files": [
    {
      "path": "scripts/validate-skill.ts",
      "content": "import { ... } ..."
    }
  ],
  "package_json_additions": {
    "scripts": {
      "validate:skill": "npx tsx scripts/validate-skill.ts"
    }
  }
}
```

### Scout (Intelligence)
```json
{
  "report": "# External Intelligence Report\n...",
  "opportunities": [
    {
      "source": "github:anthropics/courses",
      "type": "inspiration",
      "priority": "high",
      "description": "..."
    }
  ]
}
```

### Visualizer (Website)
```json
{
  "components": [
    {
      "path": "website/src/components/CapabilityGraph/index.tsx",
      "content": "import React from 'react'..."
    },
    {
      "path": "website/src/components/CapabilityGraph/styles.module.css",
      "content": ".graph { ... }"
    }
  ],
  "page_updates": [
    {
      "path": "website/src/pages/explore.tsx",
      "imports_to_add": ["import { CapabilityGraph } from '../components/CapabilityGraph'"]
    }
  ]
}
```

---

## CLI Session Launch Commands

```bash
# Workstream 1: Documentation (5 sessions)
claude --session docs-1 "As Cartographer, document skills: 2000s-visualization, adhd-design, automatic-stateful-prompt. Return JSON with files array."
claude --session docs-2 "As Cartographer, document skills: bot-developer, career-biographer, clip-aware. Return JSON with files array."
claude --session docs-3 "As Cartographer, document skills: code-necromancer, collage-layout, color-theory. Return JSON with files array."
claude --session docs-4 "As Cartographer, document skills: competitive-cartographer, cv-creator, design-archivist. Return JSON with files array."
claude --session docs-5 "As Cartographer, document skills: diagramming, drone-cv, drone-inspection. Return JSON with files array."

# Workstream 2: RAG (3 sessions)
claude --session rag-skills "As Weaver, generate embeddings for all skills. Return vector store config."
claude --session rag-agents "As Weaver, generate embeddings for all agents. Return vector store config."
claude --session rag-docs "As Weaver, generate embeddings for council docs and guides. Return vector store config."

# Workstream 3: Forge (4 sessions)
claude --session forge-validator "As Smith, build SKILL.md validator. Return TypeScript file content."
claude --session forge-analyzer "As Smith, build cross-reference analyzer. Return TypeScript file content."
claude --session forge-bench "As Smith, build benchmark harness. Return TypeScript file content."
claude --session forge-tests "As Smith, build integration test generator. Return TypeScript file content."
```

---

## Current Blockers

1. **Background Agent Write Permissions** — Solved by using multiple CLI sessions
2. **Rate Limits** — Stagger session starts by 30s
3. **Context Overflow** — Each agent works on bounded subset

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Documentation Coverage | 32% (17/53) | 100% |
| RAG Index Size | 0 | 75 docs indexed |
| Forge Tools | 0 | 4 validation scripts |
| Scout Reports | 0 | 3 intelligence briefs |
| Website Components | 0 | 3 new interactive components |

---

## Priority Order

1. **Documentation** (highest value, lowest risk)
2. **Forge** (enables quality at scale)
3. **RAG** (enables discovery)
4. **Website** (visualization)
5. **Intel** (ongoing background)

---

```
────────────────────────────────────────────────────────────────────
                         ⟨ END TRANSMISSION ⟩
               Architect + Archivist • 2025-12-09 13:15
────────────────────────────────────────────────────────────────────
```

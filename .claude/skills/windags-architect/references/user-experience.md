# winDAGs User Experience: The Lovely Niceties

The features that make winDAGs feel like a product people love, not just a tool they tolerate.

---

## Persistence and Recovery

### Save State on Failure or Pause

Every DAG execution checkpoints after each node completion. If the process fails, the user resumes from the last completed node — not from scratch.

- **Temporal-backed**: In cloud mode, Temporal's event-sourced replay handles this automatically.
- **Local mode**: SQLite-based checkpoint file. Each completed node's output is persisted. On resume, the executor reads checkpoints and skips completed nodes.
- **Pause/resume**: The user can pause a running DAG at any point. Human-gate nodes are natural pause points, but the user can also force-pause between any two waves.
- **Cost on failure**: Only the failed node's tokens are wasted. All prior work is preserved.

### Saved DAG Runs

Every completed (or partially completed) DAG run is saved with:
- Full execution trace (inputs, outputs, skills used, costs per node)
- The DAG definition as it was at execution time (including any mutations)
- Quality scores from all four evaluators
- Total cost, duration, and model mix

Users can browse, search, and compare past runs. This history feeds the skill ranking system and lets users re-run successful DAGs on new inputs.

---

## Pluripotent Nodes (Not "Vague" — "Full of Potential")

When the system presents a node it can't yet fully specify, don't show a gray question mark. Show **3-4 exciting potential paths** the node could expand into.

### The Sales Pitch for Patience

```
┌────────────────────────────────────────────────────┐
│  🌱 Phase 3: Build (waiting for design phase)      │
│                                                    │
│  This phase will crystallize once design completes.│
│  Based on similar projects, it could become:       │
│                                                    │
│  Path A: Full-stack app (React + API + DB)         │
│  Path B: Static site with dynamic API calls        │
│  Path C: Mobile-first PWA with offline support     │
│  Path D: Serverless functions + static frontend    │
│                                                    │
│  Each path activates different skills and agents.  │
│  Estimated cost range: $0.08 - $0.45              │
└────────────────────────────────────────────────────┘
```

The user sees that the system has **too many brilliant thoughts, not too few**. The wait isn't emptiness — it's controlled potential.

### Implementation

When creating a pluripotent node, the meta-DAG generates 3-4 hypothetical expansions using a cheap Haiku call. These are displayed but not executed. When the upstream phase completes, the actual expansion may differ from all four previews — that's fine. The previews served their purpose: communicating richness.

---

## Cost Projections

### Before Execution

Show an estimated cost breakdown before the user commits:

```
┌──────────────────────────────────────────────┐
│  Cost Estimate: Portfolio Builder DAG        │
│                                              │
│  Phase 1: Interview (Sonnet)      ~$0.02    │
│  Phase 2: Research (2× Haiku)     ~$0.003   │
│  Phase 3: Content (Sonnet)        ~$0.02    │
│  Phase 4: Design (Sonnet)         ~$0.02    │
│  Phase 5: Build (Sonnet)          ~$0.04    │
│  Phase 6: Deploy (Haiku)          ~$0.001   │
│  Phase 7: Human Review            ~$0.00    │
│  ─────────────────────────────────────────── │
│  Estimated total:          $0.10 - $0.18    │
│  Pluripotent phases:       ±$0.05 variance  │
│  Time estimate:            3-8 minutes      │
│                                              │
│  [Start Execution]  [Edit DAG]  [Cancel]     │
└──────────────────────────────────────────────┘
```

### During Execution

Live cost ticker on the dashboard. Each node shows its actual cost as it completes. Running total with budget remaining.

### After Execution

Full cost breakdown with model-level detail (input tokens, output tokens, per-model pricing). Compare actual vs. estimated. Show cost optimization suggestions ("Node X used Sonnet but could have used Haiku — save $0.008 next time").

---

## Output Export

DAG outputs should port to the formats users actually want:

| Output Format | Use Case | How |
|--------------|----------|-----|
| Markdown | Documentation, reports | Default — all node outputs are markdown-compatible |
| PDF | Formal deliverables, printable reports | Pandoc conversion from markdown |
| JSON | API integration, data pipelines | Structured output contracts already produce JSON |
| ZIP | Complete project archives | All artifacts (code, docs, images) in one package |
| GitHub PR | Code changes | Commit changes to a branch, open PR |
| Notion/Confluence | Team wikis | API integration for pushing content |
| HTML | Standalone web pages | Render markdown to styled HTML |

The export system reads the DAG's output contracts and transforms them. Each node already declares its output schema, so the exporter knows what it's working with.

---

## Versioned Skills with SLA

### The Problem

Skills evolve. Version 2 of `code-review-skill` may produce different (hopefully better) output than version 1. But users running production DAGs need stability.

### The Solution: Version Pinning with Upgrade Nudges

- **DAG templates pin skill versions**: `skills: [code-review-skill@v2.1]`
- **SLA on pinned versions**: "This skill version will be supported for 6 months from release. After that, it remains available but receives no bug fixes."
- **Upgrade notification**: When a newer version exists, the dashboard shows: "v2.2 available. 15% higher downstream acceptance in testing. [Preview upgrade] [Pin current]"
- **Preview upgrade**: Run the DAG with the new skill version side-by-side. Show diff of outputs. Let the user decide.
- **Backprop to Elo**: When a user upgrades and the DAG succeeds, the new version's Elo gets a positive signal. When they preview and reject, it gets a negative signal. Organic upgrade data feeds the ranking system.

---

## Pre-Filled DAG Templates

### The Template Gallery

The first thing a new user sees. Organized by domain, each template is a ready-to-run DAG with sensible defaults:

**Software Engineering**

| Template | Nodes | Est. Cost | Time |
|----------|-------|-----------|------|
| Portfolio Website Builder | 7 | $0.12 | 5 min |
| Codebase Refactor | 6 | $0.15 | 8 min |
| PR Review Pipeline | 4 | $0.04 | 2 min |
| Technical Documentation | 5 | $0.08 | 4 min |
| Bug Investigation | 4 | $0.06 | 3 min |
| API Design + Implementation | 8 | $0.25 | 12 min |

**Research & Writing**

| Template | Nodes | Est. Cost | Time |
|----------|-------|-----------|------|
| Research Synthesis Report | 5 | $0.10 | 5 min |
| Competitive Analysis | 6 | $0.12 | 6 min |
| Blog Post from Topic | 4 | $0.06 | 3 min |
| Grant Proposal Draft | 7 | $0.20 | 10 min |

**Business & Product**

| Template | Nodes | Est. Cost | Time |
|----------|-------|-----------|------|
| Product Requirements Doc | 5 | $0.08 | 4 min |
| Go-to-Market Strategy | 6 | $0.15 | 7 min |
| User Interview Analysis | 4 | $0.06 | 3 min |
| Quarterly Business Review | 5 | $0.10 | 5 min |

**Personal Productivity**

| Template | Nodes | Est. Cost | Time |
|----------|-------|-----------|------|
| Vibe Code Project Triage | 5 | $0.04 | 2 min |
| Resume + Cover Letter | 4 | $0.06 | 3 min |
| Learning Plan for New Skill | 5 | $0.08 | 4 min |
| Decision Framework | 4 | $0.05 | 2 min |

Each template has a "Preview DAG" button showing the full graph with node descriptions, skills used, and expected cost before the user commits.

---

## Anti-Pattern: Exposing Raw Decomposition

**Wrong**: Let users query the API to get their own decompositions for free, extracting the meta-DAG's intelligence without paying for execution.

**Right**: The decomposition is part of the execution. Users see the DAG structure (it's the product), but the detailed decomposition logic (which skills, which models, which contracts) is generated fresh for each execution. Pluripotent node previews are cheap Haiku calls that show potential, not the actual optimized plan.

**The business boundary**: Viewing templates and pluripotent previews is free (it's the sales pitch). Executing the DAG and getting real outputs is where value is delivered and cost is incurred.

---

## Delightful Details

- **Animated node execution**: Nodes pulse when running, glow green on completion, flash red on failure
- **Sound design**: Optional subtle audio cues for node completion (satisfying "ding"), failure (gentle alert), and DAG completion (achievement sound)
- **Progress estimation**: "Node 4/7 • ~2 minutes remaining • $0.06 so far"
- **Celebration on completion**: Confetti or subtle animation when a DAG succeeds on first try
- **Failure empathy**: When a node fails, don't just show red — show what it tried, why it failed, and what the system will do next (retry, mutate, escalate)
- **Cost savings badge**: "This DAG saved $0.82 compared to All-Opus routing" — reinforces the value of intelligent routing
- **Skill credits**: "Powered by: code-review-skill (by @username, Elo 1847)" — credits skill creators, reinforces marketplace

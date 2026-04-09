# Product Requirements Document
## Self-Bootstrapping Agentic Ecosystem

**Version**: 1.0.0
**Date**: December 5, 2025
**Author**: Claude + Eric
**Status**: In Development

---

## Executive Summary

Transform "Some Claude Skills" into "Some Claude Skills & Agents" - a self-expanding, self-improving agentic ecosystem that grows fractally through knowledge space. The system features nine founding agents (The Founding Council) who work together to create new agents, spawn new skills, and explore unprecedented combinations of capability.

---

## Vision

**From seeds to forests, from skills to civilizations.**

We are building:
- An ecosystem that creates its own inhabitants
- A library that writes its own books
- A city that designs its own architecture
- A garden that tends itself

---

## Problem Statement

Current state:
- 49 excellent skills, manually created
- Basic orchestrator for coordination
- Manual process for skill creation
- No systematic exploration of knowledge space
- Limited visibility into ecosystem growth
- Human as bottleneck for expansion

Target state:
- Agents that autonomously create agents and skills
- Systematic mapping and exploration of adjacent knowledge
- RAG-enhanced agents with deep domain expertise
- Beautiful real-time visualization of the expanding ecosystem
- Automated documentation and blog-ready historiography
- Human as inspired observer and occasional guide

---

## The Founding Council

Nine agents form the foundation:

| Agent | Role | Primary Output |
|-------|------|----------------|
| **The Architect** | Meta-orchestrator | Mutant circuit designs |
| **The Smith** | Infrastructure builder | MCPs, tools, environments |
| **The Cartographer** | Knowledge explorer | Expansion roadmaps |
| **The Weaver** | RAG specialist | Enhanced retrieval |
| **The Librarian** | Content curator | Licensed knowledge bases |
| **The Scout** | External intelligence | Inspiration briefs |
| **The Visualizer** | Portal builder | Dashboards, graphs |
| **The Archivist** | Historian | Snapshots, blogs |
| **The Liaison** | Human interface | Communications |

---

## Key Features

### F1: Self-Bootstrapping Agent Creation
**Description**: Agents can design and implement new agents based on identified needs.

**Acceptance Criteria**:
- [ ] The Architect can generate full agent specifications
- [ ] The Smith can build agent infrastructure
- [ ] New agents integrate automatically into the ecosystem
- [ ] Agent-created agents can create their own agents (recursive)

### F2: Knowledge Space Exploration
**Description**: Systematic mapping and exploration of adjacent knowledge territories.

**Acceptance Criteria**:
- [ ] The Cartographer produces knowledge density maps
- [ ] Gap analysis identifies high-value expansion targets
- [ ] Exploration prioritizes by impact potential
- [ ] The Scout feeds external intelligence into navigation

### F3: RAG Enhancement Pipeline
**Description**: Any agent can be augmented with retrieval-augmented generation.

**Acceptance Criteria**:
- [ ] The Weaver creates embedding pipelines on demand
- [ ] The Librarian provides curated, licensed content
- [ ] Vector stores integrate seamlessly
- [ ] Retrieval quality metrics meet &gt;90% relevance threshold

### F4: Combinatorial Circuit Design
**Description**: The Architect identifies and creates novel combinations of agents/skills.

**Acceptance Criteria**:
- [ ] Capability graph tracks all agent/skill capabilities
- [ ] Combinatorial analysis suggests novel circuits
- [ ] "Mutant circuits" are documented and tested
- [ ] Emergence tracking captures unexpected capabilities

### F5: Real-Time Visualization
**Description**: Beautiful dashboard showing the expanding ecosystem.

**Acceptance Criteria**:
- [ ] Live knowledge graph visualization
- [ ] Agent activity monitoring
- [ ] Growth metrics and trends
- [ ] Interactive exploration interface
- [ ] "Bottle city" aesthetic achieved

### F6: Automated Historiography
**Description**: Complete documentation and blog-ready content generation.

**Acceptance Criteria**:
- [ ] Before/after snapshots for all changes
- [ ] Automatic changelog generation
- [ ] Blog post draft creation
- [ ] Decision ledger maintained
- [ ] Progress reports auto-generated

### F7: Human Liaison System
**Description**: Clear communication channel between ecosystem and human.

**Acceptance Criteria**:
- [ ] Daily summary capability
- [ ] "Blog-ready" determination
- [ ] Decision point escalation
- [ ] Announcement drafting
- [ ] Human can engage at chosen depth

---

## Technical Architecture

### Directory Structure
```
some_claude_skills/
├── .claude/
│   ├── skills/                    # 49+ skills
│   │   └── [skill-name]/
│   │       ├── SKILL.md
│   │       ├── references/
│   │       └── scripts/
│   └── agents/                    # NEW: Agents
│       ├── FOUNDING_COUNCIL.md    # This document
│       ├── architect/
│       │   ├── AGENT.md
│       │   ├── references/
│       │   └── scripts/
│       ├── smith/
│       ├── cartographer/
│       ├── weaver/
│       ├── librarian/
│       ├── scout/
│       ├── visualizer/
│       ├── archivist/
│       └── liaison/
├── mcp-servers/
│   ├── prompt-learning/           # Existing
│   ├── rag-engine/                # NEW: Weaver's MCP
│   ├── knowledge-graph/           # NEW: Cartographer's MCP
│   └── ecosystem-monitor/         # NEW: Visualizer's MCP
├── website/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── agents.tsx         # NEW: Agent gallery
│   │   │   └── ecosystem.tsx      # NEW: Live dashboard
│   │   └── components/
│   │       ├── AgentCard/
│   │       ├── KnowledgeGraph/
│   │       └── EcosystemDashboard/
│   └── docs/
│       └── agents/                # NEW: Agent documentation
└── planning/
    ├── AGENTIC_ECOSYSTEM_PRD.md   # This document
    └── knowledge-maps/            # Cartographer outputs
```

### Agent Format (AGENT.md)
```yaml
---
name: agent-name
role: Brief role description
allowed-tools: Read,Write,Edit,Bash,Task,WebFetch,...
triggers:
  - "keyword1"
  - "keyword2"
coordinates_with:
  - architect
  - smith
outputs:
  - output-type-1
  - output-type-2
---

# Full agent instructions and capabilities
```

### Communication Patterns

**Synchronous**: Direct delegation via orchestrator
```
User → Orchestrator → Architect → Smith → Result
```

**Asynchronous**: Event-driven activation
```
Scout detects trend → Event log → Cartographer reads → Updates map
```

**Periodic**: Scheduled tasks
```
Daily: Archivist snapshot
Weekly: Liaison summary
Continuous: Visualizer monitoring
```

---

## Implementation Phases

### Phase 1: Genesis (Week 1)
- [x] Document Founding Council
- [ ] Build The Architect agent
- [ ] Build The Smith agent
- [ ] Create agent infrastructure (AGENT.md format)
- [ ] Update website with agents section

### Phase 2: Exploration (Week 2)
- [ ] Build The Cartographer agent
- [ ] Build The Scout agent
- [ ] Create initial knowledge map
- [ ] Identify first expansion targets

### Phase 3: Enhancement (Week 3)
- [ ] Build The Weaver agent
- [ ] Build The Librarian agent
- [ ] Create first RAG-enhanced agent
- [ ] Establish content curation pipeline

### Phase 4: Observation (Week 4)
- [ ] Build The Visualizer agent
- [ ] Build The Archivist agent
- [ ] Build The Liaison agent
- [ ] Launch ecosystem dashboard
- [ ] First public blog post

### Phase 5: Expansion (Ongoing)
- [ ] First agent-created agent
- [ ] First mutant circuit
- [ ] Recursive self-improvement
- [ ] Exponential growth begins

---

## Success Criteria

### Quantitative
| Metric | Target | Timeline |
|--------|--------|----------|
| Active agents | 9+ | Week 4 |
| Skills | 60+ | Week 4 |
| RAG-enhanced agents | 3+ | Week 3 |
| Agent-created agents | 1+ | Week 5 |
| Dashboard views | Working | Week 4 |
| Blog posts ready | 1+ | Week 4 |

### Qualitative
- [ ] User can observe ecosystem growth in real-time
- [ ] New capabilities emerge from combinations
- [ ] Documentation is always current
- [ ] Human feels informed, not overwhelmed
- [ ] System improves without human intervention

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Infinite recursion | Medium | High | Depth limits, quality gates |
| Low-quality agents | Medium | Medium | Scoring rubric, validation |
| Context overload | High | Medium | Progressive disclosure |
| Licensing violations | Low | High | The Librarian's vigilance |
| Human confusion | Medium | Medium | The Liaison's clarity |

---

## Open Questions

1. **Agent naming**: Should agents have formal names ("The Architect") or functional IDs ("meta-orchestrator")?
   - Decision: Both. Formal names for personality, IDs for invocation.

2. **Growth limits**: How fast should the ecosystem expand?
   - Decision: Quality over speed. Each agent must pass scoring rubric.

3. **Human approval**: When is human sign-off required?
   - Decision: For public announcements and major architecture changes.

---

## Appendix: Agent Specifications

See `.claude/agents/FOUNDING_COUNCIL.md` for detailed specifications of all nine founding agents.

---

*"We are building the future of agentic systems - one that designs itself."*

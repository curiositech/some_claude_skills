# The Founding Council of Agents

> *"From seeds to forests, from skills to civilizations"*

This document defines the nine founding agents of the self-bootstrapping agentic ecosystem. Together, they form a self-replicating, self-improving system that expands fractally through knowledge space.

---

## The Vision

The Founding Council is designed to:
1. **Create agents that create agents** - Recursive self-improvement
2. **Build skills that spawn skills** - Fractal knowledge expansion
3. **Form combinatorial circuits** - Krakoan mutant teams of unprecedented capability
4. **Navigate knowledge space** - Avant-garde exploration of adjacent possible
5. **Preserve and document** - Full historiography for learning and blogging

---

## The Nine Founding Agents

### 1. THE CARTOGRAPHER 🗺️
*Explorer of Adjacent Knowledge Space*

**Purpose**: Maps the frontier of what's possible. Identifies the densest, most interesting vectors for expansion. Guides the ecosystem toward high-value knowledge territories.

**Core Capabilities**:
- Semantic analysis of existing skills/agents to identify gaps
- Research across papers, repos, documentation for opportunity detection
- Calculates "knowledge density" metrics for prioritization
- Produces expansion roadmaps with justification
- Identifies "mutant circuit" opportunities (skill combinations)

**Key Outputs**:
- Knowledge space maps (visual + data)
- Expansion priority queue
- Gap analysis reports
- Adjacent possible manifests

**Coordinates With**: The Architect, The Scout, The Liaison

---

### 2. THE SMITH ⚒️
*Builder of Infrastructure*

**Purpose**: Constructs the foundational tooling that enables all other agents. Builds MCPs, bash utilities, validation scripts, GUIs, and development environments.

**Core Capabilities**:
- MCP server development and deployment
- CLI tool creation (bash, Python, Node)
- Validation script authoring
- Environment setup automation
- GUI/dashboard scaffolding
- Docker/containerization when needed

**Key Outputs**:
- Working MCP servers
- Utility scripts (`validate_*.py`, `generate_*.ts`)
- Environment bootstrappers
- Integration test suites

**Coordinates With**: The Visualizer (for GUIs), The Architect (for specs)

---

### 3. THE WEAVER 🕸️
*RAG Specialist*

**Purpose**: Bolts on retrieval-augmented generation to superpower any agent. Creates and manages knowledge bases, embedding pipelines, and retrieval systems.

**Core Capabilities**:
- Embedding pipeline design (sentence-transformers, OpenAI, CLIP)
- Vector database setup (Chroma, Pinecone, Weaviate, Qdrant)
- Chunking strategy optimization
- Query expansion and reranking
- Knowledge base maintenance and refresh

**Key Outputs**:
- RAG-enhanced agent configurations
- Embedding pipelines
- Vector stores with curated content
- Retrieval quality metrics

**Coordinates With**: The Librarian (for content), The Smith (for infrastructure)

---

### 4. THE LIBRARIAN 📚
*Content Curator with Rights Awareness*

**Purpose**: Scrapes, discovers, and curates high-quality knowledge sources. Ensures proper attribution and licensing compliance.

**Core Capabilities**:
- Web scraping with respect for robots.txt
- License detection and compliance checking
- Content quality scoring
- Deduplication and canonicalization
- Source attribution tracking
- Firecrawl/Playwright integration for dynamic content

**Key Outputs**:
- Curated document collections
- License manifests
- Attribution databases
- Content quality reports

**Coordinates With**: The Weaver (to vectorize content), The Scout (for source discovery)

---

### 5. THE ARCHITECT 🏛️
*Meta-Orchestrator of Combinatorial Genius*

**Purpose**: The supreme designer who sees what doesn't exist but could if the right combinations were assembled. Creates "mutant circuits" - unprecedented agent/skill combinations.

**Core Capabilities**:
- Capability graph analysis
- Combinatorial potential calculation
- Novel workflow design
- Cross-domain synthesis
- Emergence prediction
- Multi-agent choreography

**Key Outputs**:
- Mutant circuit specifications
- Novel agent/skill designs
- Workflow orchestration plans
- Emergence hypotheses

**Coordinates With**: Everyone (this is the meta-orchestrator)

---

### 6. THE VISUALIZER 🔮
*Builder of Portals*

**Purpose**: Creates the "bottle city" view - beautiful, efficient interfaces for observing the expanding ecosystem. Makes complexity comprehensible.

**Core Capabilities**:
- Dashboard design and implementation
- Data visualization (D3, Recharts, custom)
- Real-time monitoring interfaces
- Interactive knowledge graphs
- Progress tracking displays
- Aesthetic excellence in UI

**Key Outputs**:
- Live ecosystem dashboards
- Knowledge graph visualizations
- Agent activity monitors
- Progress timelines
- Interactive skill explorers

**Coordinates With**: The Smith (for implementation), The Archivist (for data)

---

### 7. THE ARCHIVIST 📜
*Keeper of History*

**Purpose**: Maintains detailed snapshots and commentary of all work. Creates blog-ready documentation and tracks progress through knowledge space.

**Core Capabilities**:
- State snapshotting (before/after preservation)
- Automated changelog generation
- Blog post drafting from activity
- Progress metrics calculation
- Decision logging and rationale capture
- Historical analysis

**Key Outputs**:
- Snapshot archives
- Auto-generated changelogs
- Blog post drafts
- Progress reports
- Decision ledgers

**Coordinates With**: The Visualizer (for display), The Liaison (for communication)

---

### 8. THE SCOUT 🔭
*External Intelligence Gatherer*

**Purpose**: Reads external content - READMEs, blog posts, papers, discussions - to find inspiration vectors. Keeps the ecosystem informed about what's happening in the wider world.

**Core Capabilities**:
- RSS/feed monitoring
- GitHub trending analysis
- Paper discovery (arXiv, HuggingFace)
- Blog post analysis
- Community discussion mining
- Trend detection

**Key Outputs**:
- Inspiration briefs
- Trend reports
- Opportunity alerts
- External reference collections

**Coordinates With**: The Cartographer (for direction), The Librarian (for curation)

---

### 9. THE LIAISON 🤝
*Human Interface*

**Purpose**: Your personal connection to the expanding ecosystem. Keeps you informed, identifies when human input is needed, prepares communications for public announcement.

**Core Capabilities**:
- Progress summarization for humans
- Decision point identification
- Public announcement drafting
- Blog post polishing
- Status reporting
- Escalation management

**Key Outputs**:
- Daily/weekly summaries
- Decision briefs
- Announcement drafts
- Blog posts
- Status dashboards

**Coordinates With**: Everyone (outward-facing interface)

---

## Agent Hierarchy

```
                    ┌─────────────────┐
                    │  THE ARCHITECT  │
                    │ (Meta-Orchestr) │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐        ┌─────▼─────┐       ┌─────▼─────┐
    │CARTOGR- │        │   THE     │       │   THE     │
    │  APHER  │◄──────►│  SCOUT    │       │  LIAISON  │
    └────┬────┘        └───────────┘       └───────────┘
         │                                       ▲
         │                                       │
    ┌────▼────┐                            ┌─────┴─────┐
    │   THE   │                            │   THE     │
    │ SMITH   │◄──────────────────────────►│ ARCHIVIST │
    └────┬────┘                            └───────────┘
         │                                       ▲
         │                                       │
    ┌────▼────┐        ┌───────────┐       ┌─────┴─────┐
    │   THE   │◄──────►│   THE     │◄─────►│   THE     │
    │ WEAVER  │        │ LIBRARIAN │       │VISUALIZER │
    └─────────┘        └───────────┘       └───────────┘
```

---

## Self-Bootstrapping Protocol

### Phase 1: Genesis
1. The Architect designs the initial agent specifications
2. The Smith builds the infrastructure for agent deployment
3. The Cartographer maps the initial knowledge territory

### Phase 2: Knowledge Acquisition
4. The Scout finds external sources of inspiration
5. The Librarian curates and validates content
6. The Weaver creates RAG capabilities for enhanced retrieval

### Phase 3: Expansion
7. The Architect identifies combinatorial opportunities
8. New agents/skills are spawned from existing ones
9. The ecosystem grows fractally

### Phase 4: Observation & Communication
10. The Visualizer builds dashboards for monitoring
11. The Archivist captures state and generates documentation
12. The Liaison prepares communications for the human

### Phase 5: Iteration
- Repeat from Phase 1 with expanded capabilities
- Each cycle produces more sophisticated agents and skills
- Knowledge density increases exponentially

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Agent Count | 2x every cycle | Count active agents |
| Skill Count | 1.5x every cycle | Count production skills |
| Knowledge Coverage | +20% per week | Gap analysis score |
| RAG Quality | &gt;90% relevance | Retrieval precision |
| Documentation Coverage | 100% | Auto-doc ratio |
| Human Understanding | High | Liaison clarity score |

---

## First Priorities

1. **Build The Architect agent** - The meta-orchestrator must exist first to design the rest
2. **Build The Smith agent** - Infrastructure enables everything
3. **Build The Cartographer agent** - Maps where we go next
4. **Build The Visualizer agent** - You need to see what's happening
5. **Build remaining agents** - Weaver, Librarian, Scout, Archivist, Liaison

---

## Implementation Notes

### Agent Format
Each agent will be implemented as:
- A skill file (`.claude/agents/[name]/AGENT.md`)
- Supporting reference materials
- Working scripts and tools
- Integration with the ecosystem

### Activation
Agents are activated via:
- Explicit invocation (`@architect`, `@smith`, etc.)
- Orchestrator delegation
- Scheduled tasks (for monitoring agents)
- Event triggers (for reactive agents)

### Communication
Agents communicate via:
- Shared file system state
- Structured output formats
- Event logs
- The Liaison (for human communication)

---

*"We are building a garden that tends itself, a library that writes its own books, a city that designs its own architecture."*

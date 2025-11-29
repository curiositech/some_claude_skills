---
title: HR Network Analyst
description: Hypermodern HR data scientist for professional network graph analysis
category: Research & Strategy
sidebar_position: 27
---

# HR Network Analyst

<SkillHeader
  skillName="Hr Network Analyst"
  fileName="hr-network-analyst"
  description={"\"Professional network graph analyst identifying Gladwellian superconnectors, mavens, and influence brokers using betweenness centrality, structural holes theory, and multi-source network reconstruction. Activate on 'superconnectors', 'network analysis', 'who knows who', 'professional network', 'influence mapping', 'betweenness centrality'. NOT for surveillance, discrimination, stalking, privacy violation, or speculation without data.\""}
  tags={["research","analysis","data","career","strategy","advanced","mcp"]}
/>

A hypermodern HR data scientist who applies graph theory and network science to professional relationship mapping. Identifies the hidden superconnectors, influence brokers, and knowledge mavens that drive professional ecosystems.

## Quick Start

**Minimal example to find superconnectors in a domain:**

```
User: "Who are the key connectors in the AI safety research community?"

Analyst:
1. Define network boundary: AI safety researchers, 2020-2024
2. Identify data sources:
   - Co-authorship networks (Semantic Scholar, arXiv)
   - Conference organizers/speakers (NeurIPS, ICML safety workshops)
   - Cross-institutional collaboration patterns
   - Twitter/X discussion networks
3. Compute centrality metrics:
   - Betweenness: Who bridges different research clusters?
   - Eigenvector: Who's connected to other influential people?
   - Structural holes: Who spans otherwise disconnected groups?
4. Classify by Gladwellian archetype:
   - Connectors: High betweenness, bridge multiple institutions
   - Mavens: Publishing volume + citation flow + teaching roles
   - Brokers: Sit between academia, labs, and policy
5. Output ranked list with network position rationale
```

**Key principle**: The most valuable people aren't always the most famous—they're the ones who connect otherwise disconnected worlds.

## Core Mission

Apply network science to professional ecosystems to answer:
- **Who should I know?** (optimal networking targets)
- **Who knows everyone?** (superconnectors for referrals)
- **Who bridges worlds?** (cross-domain brokers)
- **How does influence flow?** (information/opportunity pathways)
- **Where are the structural holes?** (untapped connection opportunities)

## Theoretical Foundations

### Gladwellian Archetypes (The Tipping Point)

| Archetype | Network Signature | Identification Signals | HR Value |
|-----------|-------------------|------------------------|----------|
| **Connectors** | High degree + betweenness, diverse cluster membership | Multiple conference domains, cross-institutional co-authors | Best referral sources, bridge networks |
| **Mavens** | High in-degree, central in knowledge-sharing networks | Prolific writers, newsletter runners, frequently tagged | Know who's good at what, validate candidates |
| **Salesmen** | High influence propagation, bridge decision-makers | Track record of introductions, high response rates | Close hesitant candidates, navigate negotiations |

### Network Centrality Metrics

| Metric | Formula | HR Interpretation |
|--------|---------|-------------------|
| **Betweenness** | How often on shortest paths between others | "Gatekeeper" - controls information flow |
| **Degree** | Raw connection count | "Popular" - knows many people |
| **Eigenvector** | Connected to well-connected people | "Influential" - quality over quantity |
| **PageRank** | Probability of random walker landing | "Authoritative" - endorsed by important others |
| **Closeness** | Average shortest path to all nodes | "Accessible" - can reach anyone quickly |

### Structural Holes Theory (Burt)

**Core Insight**: Advantage comes from bridging otherwise disconnected groups, not from connections within dense clusters.

```python
# Find structural hole spanners
constraint = nx.constraint(G)
low_constraint = {k: v for k, v in constraint.items() if v < 0.5}
# These are your broker opportunities
```

## Data Sources & Network Construction

### Primary Data Sources

| Source | What to Extract | Edge Weight |
|--------|-----------------|-------------|
| **LinkedIn** | Connection overlaps, endorsements, groups | 0.5 |
| **Co-authorship** | Repeated collaboration, position on papers | 1.0 |
| **Conferences** | Co-speaking, same panel, organizer ties | 0.8 |
| **GitHub** | Co-contributors, PR reviews, org membership | 0.6 |
| **Twitter/X** | Mutual follows, quote-tweets, replies | 0.3 |

### Multi-Layer Network Fusion

```python
# Combine signals from multiple sources
G_unified = nx.Graph()
for source, weight in edge_weights.items():
    for u, v in source_graphs[source].edges():
        if G_unified.has_edge(u, v):
            G_unified[u][v]['weight'] += weight
        else:
            G_unified.add_edge(u, v, weight=weight)
```

## Analysis Workflows

### Workflow 1: Find Superconnectors for Referrals

**Use case**: "I need to hire 5 ML engineers. Who should I ask?"

```typescript
interface SuperconnectorProfile {
  name: string;
  currentRole: string;
  networkMetrics: {
    betweennessCentrality: number;
    degreeCentrality: number;
    clusterMemberships: string[];
  };
  gladwellType: 'connector' | 'maven' | 'salesman' | 'hybrid';
  accessibilityScore: number;
  relevanceScore: number;
  approachStrategy: string;
  mutualConnections: string[];
}
```

### Workflow 2: Map Influence in a Domain

**Use case**: "How does influence flow in climate tech?"

1. Define domain boundaries
2. Multi-source network construction
3. Community detection (Louvain, label propagation)
4. Compute influence metrics per community
5. Identify cross-community brokers

### Workflow 3: Optimize Personal Networking Strategy

**Use case**: "I want to break into VC. Who should I connect with?"

1. Map user's current network
2. Map target domain network
3. Find shortest paths from current to target
4. Identify structural holes user could fill
5. Prioritize by reachability + bridge potential + domain match

### Workflow 4: Organizational Network Analysis (ONA)

**Use case**: "Map how information flows in our 500-person company"

Find hidden influencers, bottlenecks, silos, and integration opportunities by analyzing communication/collaboration patterns vs. formal org structure.

## Implementation Tools

### Python Ecosystem

```python
import networkx as nx           # General purpose
import graph_tool.all as gt     # Fast, good visualization
from pyvis.network import Network  # Interactive HTML

# Core analysis
bc = nx.betweenness_centrality(G)
communities = nx.community.louvain_communities(G)
constraint = nx.constraint(G)
```

### Graph Databases

- **Neo4j**: GDS library with built-in centrality algorithms
- **Amazon Neptune**: Gremlin queries for path analysis
- **TigerGraph**: GSQL for deep-link analytics

See `references/graph-databases.md` for complete query examples.

## When to Use

**Use when**:
- Finding referral sources for recruiting
- Mapping influence in a new domain
- Optimizing personal networking strategy
- Organizational network analysis
- Understanding "who knows who"

**Do NOT use for**:
- Surveillance without consent
- Discrimination based on network position
- Accessing non-public data
- Stalking or harassment

## Common Anti-Patterns

| Anti-Pattern | Problem | Solution |
|--------------|---------|----------|
| **Degree Obsession** | High degree often = noise, not influence | Use betweenness for bridging, eigenvector for quality |
| **Static Network Assumption** | Old connections may be dead | Recency-weight edges, verify currency |
| **Single-Source Reliance** | Missing relationships not on LinkedIn | Multi-source fusion with appropriate weighting |
| **Ignoring Context** | High betweenness in irrelevant domain isn't useful | Constrain analysis to relevant boundaries |

## Integration with Other Skills

| Skill | Integration |
|-------|-------------|
| **Career Biographer** | Network position informs career narrative framing |
| **Competitive Cartographer** | Map competitive landscape through relationship lens |
| **Research Analyst** | Deep dive on identified key figures |
| **CV Creator** | Leverage network insights for positioning |

## References

This skill includes comprehensive reference materials:

- `references/algorithms.md` - NetworkX code, centrality formulas, Gladwell classification
- `references/graph-databases.md` - Neo4j, Neptune, TigerGraph, ArangoDB queries
- `references/data-sources.md` - LinkedIn network data acquisition strategies, APIs, scraping tools, legal considerations

## Example Output: AI Safety Superconnectors

**Domain**: AI Safety research community, 2020-2024

**Top Connectors Identified**:
1. **Dr. A** - Bridges academic labs and policy orgs (BC: 0.23)
2. **B** - Connects technical and governance worlds (BC: 0.18)
3. **C** - Information hub for field entrants (Maven, high PageRank)

**Structural Holes Identified**: Gap between compute governance and ML safety researchers

**Networking Recommendations**: Entry via Dr. A's reading group, policy roles via B, research via C's newsletter community

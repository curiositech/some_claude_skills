---
title: Network Theory Reference
sidebar_label: Network Theory Reference
sidebar_position: 5
---
# Network Theory Reference

Theoretical foundations for professional network analysis.

## Gladwellian Archetypes (The Tipping Point)

### Connectors

**Definition**: People who know an extraordinary number across diverse social worlds.

**Network Signature**:
- Very high degree centrality (many connections)
- High betweenness centrality (bridge between clusters)
- Diverse cluster membership (not siloed)
- Power-law distribution: rare but disproportionately connected

**Identification Signals**:
- Multiple conference speaker lists across domains
- Co-authored with 5+ different institutions
- LinkedIn spans 10+ distinct industries
- Referenced by people who don't otherwise interact

**HR Value**: Best for referrals across domains, accelerate hiring in new markets

### Mavens

**Definition**: Information specialists who accumulate knowledge and love sharing it.

**Network Signature**:
- High in-degree (people seek them out)
- Central in knowledge-sharing networks
- High PageRank (authoritative)
- Create content others reference

**Identification Signals**:
- Prolific writers/speakers on specific topics
- Run newsletters, podcasts, educational content
- Tagged in "who should I follow for X?" threads
- High engagement-to-follower ratio

**HR Value**: Know who's good at what, validate candidate quality

### Salesmen

**Definition**: Persuaders with natural ability to get agreement.

**Network Signature**:
- High influence propagation
- Strong reciprocal relationships
- Central in deal-making networks
- Bridge between decision-makers

**Identification Signals**:
- Track record of successful introductions
- Referenced in "how I got my job" stories
- Active in investor/founder/hiring circles
- High response rate to outreach

**HR Value**: Close candidates on fence, navigate negotiations

## Network Centrality Metrics

### Betweenness Centrality
**Formula**: BC(v) = Σ (σst(v) / σst) for all s,t pairs
**Meaning**: How often node lies on shortest paths between others
**HR Interpretation**: "Gatekeeper" - controls information flow

```python
import networkx as nx
bc = nx.betweenness_centrality(G)
```

**When it matters**: Finding people who can introduce to unreachable networks

### Degree Centrality
**Formula**: DC(v) = degree(v) / (n-1)
**Meaning**: Raw count of connections, normalized
**HR Interpretation**: "Popular" - knows many directly

**When it matters**: Maximizing referral reach, event organizing

### Eigenvector Centrality
**Formula**: Recursive: centrality depends on neighbors' centrality
**Meaning**: Connected to other well-connected people
**HR Interpretation**: "Influential" - quality over quantity

**When it matters**: Access to power, rising stars, influence hierarchies

### Closeness Centrality
**Formula**: CC(v) = (n-1) / Σ d(v,u)
**Meaning**: Average shortest path to all others
**HR Interpretation**: "Accessible" - can reach anyone quickly

**When it matters**: Information spreading, optimal hire positioning

### PageRank
**Formula**: Iterative probability of random walk
**Meaning**: Weighted by quality of incoming connections
**HR Interpretation**: "Authoritative" - endorsed by important others

**When it matters**: Thought leaders vs merely prolific

## Structural Holes Theory (Burt)

**Core Insight**: Advantage comes from bridging disconnected groups, not dense cluster connections.

**Key Metrics**:
- **Constraint**: How concentrated in one group
- **Effective Size**: Redundancy-adjusted network size
- **Hierarchy**: Constraint concentration across contacts

```python
constraint = nx.constraint(G)
low_constraint = {k: v for k, v in constraint.items() if v < 0.5}
# These are broker opportunities
```

**HR Applications**:
- Candidates bridging groups bring diverse information
- Mix connectors and specialists in teams
- Target structural holes, not cluster centers

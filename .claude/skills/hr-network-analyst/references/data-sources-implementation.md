# Data Sources & Implementation Reference

Network construction from multiple professional data sources.

## Primary Data Sources

### LinkedIn Analysis
**Extract**: Connection overlaps, shared experiences, endorsement patterns, group memberships, comment networks

**Ethical considerations**: Respect rate limits/ToS, public data only, aggregate patterns

```python
from networkx import bipartite
people_projection = bipartite.projected_graph(B, people_nodes)
```

### Conference & Event Networks
**Edge weights**:
- Co-speaking at same event → strong
- Same session/track → medium
- Same conference → weak
- Panel co-participation → very strong

**High-value by domain**:
- Tech: Strange Loop, QCon, domain-specific (RustConf)
- AI/ML: NeurIPS, ICML, ICLR workshops
- Data: Strata, dbt Coalesce

### Publication & Co-authorship
**Sources**: Semantic Scholar (open), Google Scholar, arXiv, DBLP, PubMed

**Edge weighting**:
- Co-authorship count (repeated = trust)
- Citation flows
- Author list position (first/last = more weight)

### GitHub & Open Source
**Extract**: Repo collaboration, review relationships, org membership, sponsorship, issues

**Quality signals**:
- Sustained > one-off contribution
- Cross-project = broader network
- Maintainer = trust indicator

### Twitter/X Analysis
**Extract**: Follow graphs, mutual follows, quote-tweet/reply networks, list memberships

### Reddit & Community
**Extract**: Cross-subreddit posting (bridges), comment interactions, moderator networks

## Multi-Layer Network Fusion

```python
edge_weights = {
    'coauthor': 1.0,           # Strongest
    'conference_copanel': 0.8,
    'linkedin_connection': 0.5,
    'github_corepo': 0.6,
    'twitter_mutual': 0.3,
}

G_unified = nx.Graph()
for source, weight in edge_weights.items():
    for u, v in source_graphs[source].edges():
        if G_unified.has_edge(u, v):
            G_unified[u][v]['weight'] += weight
        else:
            G_unified.add_edge(u, v, weight=weight)
```

## Entity Resolution

**Challenge**: Same person across sources
- "Jane Smith" (LinkedIn)
- "J. Smith" (papers)
- "@janesmith" (Twitter)
- "jsmith" (GitHub)

**Approaches**:
- Email as unique identifier
- ORCID for researchers
- LinkedIn URL as canonical
- Fuzzy matching with verification

## Analysis Implementation

```python
import networkx as nx
import pandas as pd
from pyvis.network import Network

def analyze_professional_network(edges_df):
    G = nx.from_pandas_edgelist(edges_df, 'source', 'target', ['weight'])

    metrics = {
        'betweenness': nx.betweenness_centrality(G, weight='weight'),
        'degree': nx.degree_centrality(G),
        'eigenvector': nx.eigenvector_centrality(G, weight='weight'),
        'pagerank': nx.pagerank(G, weight='weight'),
    }

    constraint = nx.constraint(G, weight='weight')
    communities = nx.community.louvain_communities(G)

    def classify_gladwell(node):
        bc = metrics['betweenness'][node]
        dc = metrics['degree'][node]
        ec = metrics['eigenvector'][node]

        if bc > 0.1 and dc > 0.1:
            return 'connector'
        elif ec > 0.1 and dc < 0.05:
            return 'maven'
        elif dc > 0.05 and constraint.get(node, 1) < 0.3:
            return 'salesman'
        return 'standard'

    return {
        'metrics': metrics,
        'constraint': constraint,
        'communities': communities,
        'classifications': {n: classify_gladwell(n) for n in G.nodes()}
    }
```

## Visualization

```python
def visualize_network_html(G, metrics, output_path='network.html'):
    net = Network(height='800px', width='100%', bgcolor='#222222')

    for node in G.nodes():
        size = 10 + 50 * metrics['betweenness'][node]
        net.add_node(node, size=size, title=f"BC: {metrics['betweenness'][node]:.3f}")

    for edge in G.edges():
        net.add_edge(edge[0], edge[1])

    net.show(output_path)
```

## Temporal Considerations

- Recency-weight edges (recent > old)
- Track rising stars (centrality trajectory)
- Identify fading connections
- Seasonal patterns (conference cycles)

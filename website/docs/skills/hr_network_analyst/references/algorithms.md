---
title: Network Analysis Algorithms Reference
sidebar_label: Network Analysis Algorithms...
sidebar_position: 1
---
# Network Analysis Algorithms Reference

## Centrality Measures

### Betweenness Centrality

**Mathematical Definition**:
```
CB(v) = Σ σst(v) / σst
       s≠v≠t
```

Where:
- σst = total number of shortest paths from node s to node t
- σst(v) = number of those paths passing through v

**Interpretation**: Measures how often a node acts as a bridge along shortest paths.

**NetworkX Implementation**:
```python
import networkx as nx

# Basic betweenness
bc = nx.betweenness_centrality(G)

# Weighted (edges with 'weight' attribute)
bc_weighted = nx.betweenness_centrality(G, weight='weight')

# Normalized (default) vs unnormalized
bc_unnorm = nx.betweenness_centrality(G, normalized=False)

# Approximate (faster for large graphs)
bc_approx = nx.betweenness_centrality(G, k=100)  # sample k nodes
```

**Complexity**: O(VE) for unweighted, O(VE + V² log V) for weighted

---

### Degree Centrality

**Mathematical Definition**:
```
CD(v) = deg(v) / (n-1)
```

**Interpretation**: Simple count of connections, normalized.

**NetworkX Implementation**:
```python
# Undirected
dc = nx.degree_centrality(G)

# Directed
in_dc = nx.in_degree_centrality(G)
out_dc = nx.out_degree_centrality(G)
```

---

### Eigenvector Centrality

**Mathematical Definition**:
```
xi = (1/λ) Σ Aij xj
           j
```

Where A is the adjacency matrix and λ is the largest eigenvalue.

**Interpretation**: A node is important if connected to other important nodes (recursive).

**NetworkX Implementation**:
```python
ec = nx.eigenvector_centrality(G)

# With weights
ec_weighted = nx.eigenvector_centrality(G, weight='weight')

# NumPy version (faster)
ec_numpy = nx.eigenvector_centrality_numpy(G)
```

---

### PageRank

**Mathematical Definition**:
```
PR(v) = (1-d)/N + d Σ PR(u)/L(u)
                   u∈Bin(v)
```

Where:
- d = damping factor (typically 0.85)
- N = total nodes
- Bin(v) = nodes linking to v
- L(u) = outgoing links from u

**Interpretation**: Probability of random walker landing on node.

**NetworkX Implementation**:
```python
pr = nx.pagerank(G)

# Custom damping
pr = nx.pagerank(G, alpha=0.9)

# With weights
pr = nx.pagerank(G, weight='weight')
```

---

### Closeness Centrality

**Mathematical Definition**:
```
CC(v) = (n-1) / Σ d(v,u)
               u≠v
```

**Interpretation**: Inverse of average distance to all other nodes.

**NetworkX Implementation**:
```python
cc = nx.closeness_centrality(G)

# For disconnected graphs
cc = nx.closeness_centrality(G, wf_improved=True)
```

---

## Structural Holes (Burt)

### Constraint

**Mathematical Definition**:
```
Ci = Σ cij²
     j

cij = (pij + Σ piq × pqj)²
           q
```

Where pij = proportion of i's network invested in j.

**Interpretation**: How constrained is a node by its network? Low constraint = spanning structural holes.

**NetworkX Implementation**:
```python
constraint = nx.constraint(G)

# With weights
constraint_w = nx.constraint(G, weight='weight')

# For specific nodes
constraint_node = nx.constraint(G, nodes=['Alice', 'Bob'])
```

### Effective Size

**Mathematical Definition**:
```
ES(i) = Σ [1 - Σ piq × mjq]
        j    q≠j

mjq = pjq / max(pkq for all k)
```

**Interpretation**: Redundancy-adjusted network size.

**NetworkX Implementation**:
```python
eff_size = nx.effective_size(G)
```

---

## Community Detection

### Louvain Algorithm

**Implementation**:
```python
from networkx.algorithms.community import louvain_communities

communities = louvain_communities(G)

# With resolution parameter
communities = louvain_communities(G, resolution=1.5)

# Get partition as dict
partition = {}
for i, comm in enumerate(communities):
    for node in comm:
        partition[node] = i
```

### Label Propagation

```python
from networkx.algorithms.community import label_propagation_communities

communities = label_propagation_communities(G)
```

### Modularity Score

```python
from networkx.algorithms.community import modularity

Q = modularity(G, communities)
```

---

## Network Statistics

### Basic Properties

```python
# Number of nodes and edges
n = G.number_of_nodes()
m = G.number_of_edges()

# Density
density = nx.density(G)

# Average clustering coefficient
avg_clustering = nx.average_clustering(G)

# Transitivity (global clustering)
transitivity = nx.transitivity(G)

# Average shortest path (for connected graphs)
if nx.is_connected(G):
    avg_path = nx.average_shortest_path_length(G)

# Diameter
if nx.is_connected(G):
    diameter = nx.diameter(G)
```

### K-Core Decomposition

```python
# Find k-core (subgraph where all nodes have degree >= k)
k_core = nx.k_core(G, k=5)

# Core number of each node
core_numbers = nx.core_number(G)
```

---

## Useful Patterns

### Multi-Layer Network Fusion

```python
def fuse_networks(networks, weights):
    """
    Combine multiple network sources with weights.

    Args:
        networks: dict of {source_name: networkx.Graph}
        weights: dict of {source_name: float}

    Returns:
        Fused network with combined edge weights
    """
    G_fused = nx.Graph()

    for source, G_source in networks.items():
        w = weights.get(source, 1.0)

        for u, v, data in G_source.edges(data=True):
            edge_weight = data.get('weight', 1.0) * w

            if G_fused.has_edge(u, v):
                G_fused[u][v]['weight'] += edge_weight
                G_fused[u][v]['sources'].append(source)
            else:
                G_fused.add_edge(u, v, weight=edge_weight, sources=[source])

    return G_fused
```

### Temporal Decay Weighting

```python
from datetime import datetime
import math

def apply_temporal_decay(G, date_attr='date', half_life_days=365):
    """
    Apply exponential decay to edge weights based on recency.
    """
    now = datetime.now()

    for u, v, data in G.edges(data=True):
        if date_attr in data:
            edge_date = data[date_attr]
            days_old = (now - edge_date).days
            decay = math.exp(-math.log(2) * days_old / half_life_days)
            data['weight'] = data.get('weight', 1.0) * decay

    return G
```

### Gladwell Classification

```python
def classify_gladwell(G, metrics=None):
    """
    Classify nodes into Gladwell archetypes.

    Returns dict mapping node -> archetype
    """
    if metrics is None:
        metrics = {
            'betweenness': nx.betweenness_centrality(G),
            'degree': nx.degree_centrality(G),
            'eigenvector': nx.eigenvector_centrality(G),
        }
        try:
            metrics['constraint'] = nx.constraint(G)
        except:
            metrics['constraint'] = {n: 0.5 for n in G.nodes()}

    classifications = {}

    # Compute thresholds (top percentile)
    bc_threshold = sorted(metrics['betweenness'].values())[-int(len(G)*0.1)]
    dc_threshold = sorted(metrics['degree'].values())[-int(len(G)*0.1)]
    ec_threshold = sorted(metrics['eigenvector'].values())[-int(len(G)*0.1)]

    for node in G.nodes():
        bc = metrics['betweenness'][node]
        dc = metrics['degree'][node]
        ec = metrics['eigenvector'][node]
        constraint = metrics['constraint'].get(node, 0.5)

        if bc >= bc_threshold and dc >= dc_threshold:
            classifications[node] = 'connector'
        elif ec >= ec_threshold and dc < dc_threshold:
            classifications[node] = 'maven'
        elif dc >= dc_threshold and constraint < 0.3:
            classifications[node] = 'salesman'
        else:
            classifications[node] = 'standard'

    return classifications
```

---

## Data Source APIs

### Semantic Scholar

```python
import requests

def get_author_collaborators(author_id):
    """Get co-authors from Semantic Scholar."""
    url = f"https://api.semanticscholar.org/graph/v1/author/{author_id}"
    params = {
        'fields': 'papers.authors'
    }
    resp = requests.get(url, params=params)
    data = resp.json()

    coauthors = set()
    for paper in data.get('papers', []):
        for author in paper.get('authors', []):
            if author['authorId'] != author_id:
                coauthors.add((author['authorId'], author['name']))

    return coauthors
```

### GitHub

```python
import requests

def get_repo_contributors(owner, repo, token=None):
    """Get contributors to a GitHub repo."""
    headers = {}
    if token:
        headers['Authorization'] = f'token {token}'

    url = f"https://api.github.com/repos/{owner}/{repo}/contributors"
    resp = requests.get(url, headers=headers)

    return [(c['login'], c['contributions']) for c in resp.json()]


def build_github_network(repos, token=None):
    """Build collaboration network from list of repos."""
    G = nx.Graph()

    for owner, repo in repos:
        contributors = get_repo_contributors(owner, repo, token)

        # Add edges between all contributors to same repo
        for i, (user1, contrib1) in enumerate(contributors):
            for user2, contrib2 in contributors[i+1:]:
                if G.has_edge(user1, user2):
                    G[user1][user2]['weight'] += 1
                    G[user1][user2]['repos'].append(f"{owner}/{repo}")
                else:
                    G.add_edge(user1, user2, weight=1, repos=[f"{owner}/{repo}"])

    return G
```

---

## Visualization

### Interactive HTML Network

```python
from pyvis.network import Network

def visualize_network(G, metrics, output='network.html'):
    """Create interactive HTML visualization."""
    net = Network(height='800px', width='100%', bgcolor='#1a1a2e')

    # Color map for Gladwell types
    colors = {
        'connector': '#e94560',
        'maven': '#0f3460',
        'salesman': '#16c79a',
        'standard': '#666666'
    }

    classifications = classify_gladwell(G, metrics)

    for node in G.nodes():
        bc = metrics['betweenness'][node]
        size = 10 + 100 * bc
        color = colors[classifications[node]]
        title = f"{node}<br>Type: {classifications[node]}<br>BC: {bc:.4f}"

        net.add_node(node, size=size, color=color, title=title)

    for u, v, data in G.edges(data=True):
        weight = data.get('weight', 1)
        net.add_edge(u, v, value=weight)

    net.show_buttons(filter_=['physics'])
    net.save_graph(output)
```

### Static Matplotlib

```python
import matplotlib.pyplot as plt

def plot_network_static(G, metrics, figsize=(12, 12)):
    """Create static network visualization."""
    fig, ax = plt.subplots(figsize=figsize)

    # Layout
    pos = nx.spring_layout(G, k=2, iterations=50)

    # Node sizes by betweenness
    node_sizes = [1000 * metrics['betweenness'][n] + 50 for n in G.nodes()]

    # Node colors by eigenvector centrality
    node_colors = [metrics['eigenvector'][n] for n in G.nodes()]

    nx.draw_networkx(
        G, pos, ax=ax,
        node_size=node_sizes,
        node_color=node_colors,
        cmap=plt.cm.viridis,
        with_labels=True,
        font_size=8,
        alpha=0.8
    )

    plt.colorbar(plt.cm.ScalarMappable(cmap=plt.cm.viridis),
                 label='Eigenvector Centrality', ax=ax)

    plt.tight_layout()
    return fig
```

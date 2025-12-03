---
title: Graph Database Analysis Reference
sidebar_label: Graph Database Analysis Ref...
sidebar_position: 4
---
# Graph Database Analysis Reference

## Neo4j

Neo4j is the most popular graph database for professional network analysis. It uses Cypher query language and has built-in graph data science algorithms.

### Setup

```cypher
// Create constraint for unique person IDs
CREATE CONSTRAINT person_id IF NOT EXISTS
FOR (p:Person) REQUIRE p.id IS UNIQUE;

// Create index for faster lookups
CREATE INDEX person_name IF NOT EXISTS
FOR (p:Person) ON (p.name);
```

### Data Model for Professional Networks

```cypher
// Node types
(:Person {id, name, email, role, company, linkedin_url})
(:Company {id, name, industry, size})
(:Conference {id, name, year, location})
(:Publication {id, title, year, venue, doi})
(:Project {id, name, repo_url, tech_stack})

// Relationship types
(:Person)-[:WORKS_AT {since, role}]->(:Company)
(:Person)-[:SPOKE_AT {talk_title, track}]->(:Conference)
(:Person)-[:COAUTHORED {position}]->(:Publication)
(:Person)-[:CONTRIBUTED_TO {commits, role}]->(:Project)
(:Person)-[:KNOWS {strength, source, since}]->(:Person)
(:Person)-[:COLLABORATED_WITH {project, duration}]->(:Person)
```

### Loading Data

```cypher
// Load from CSV
LOAD CSV WITH HEADERS FROM 'file:///people.csv' AS row
MERGE (p:Person {id: row.id})
SET p.name = row.name,
    p.email = row.email,
    p.role = row.role;

// Load edges
LOAD CSV WITH HEADERS FROM 'file:///connections.csv' AS row
MATCH (a:Person {id: row.source})
MATCH (b:Person {id: row.target})
MERGE (a)-[r:KNOWS]->(b)
SET r.strength = toFloat(row.strength),
    r.source = row.data_source;
```

### Centrality Algorithms (Graph Data Science Library)

```cypher
// First, create a graph projection
CALL gds.graph.project(
  'professional-network',
  'Person',
  {
    KNOWS: {
      orientation: 'UNDIRECTED',
      properties: ['strength']
    }
  }
);

// Betweenness Centrality
CALL gds.betweenness.stream('professional-network')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS name, score
ORDER BY score DESC
LIMIT 20;

// Write back to nodes
CALL gds.betweenness.write('professional-network', {
  writeProperty: 'betweenness'
});

// PageRank
CALL gds.pageRank.stream('professional-network', {
  dampingFactor: 0.85,
  maxIterations: 20
})
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS name, score
ORDER BY score DESC
LIMIT 20;

// Eigenvector Centrality
CALL gds.eigenvector.stream('professional-network', {
  maxIterations: 100
})
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS name, score
ORDER BY score DESC;

// Degree Centrality
CALL gds.degree.stream('professional-network')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS name, score
ORDER BY score DESC;

// Closeness Centrality
CALL gds.closeness.stream('professional-network')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).name AS name, score
ORDER BY score DESC;
```

### Community Detection

```cypher
// Louvain community detection
CALL gds.louvain.stream('professional-network')
YIELD nodeId, communityId
RETURN gds.util.asNode(nodeId).name AS name, communityId
ORDER BY communityId;

// Write communities to nodes
CALL gds.louvain.write('professional-network', {
  writeProperty: 'community'
});

// Label Propagation
CALL gds.labelPropagation.stream('professional-network')
YIELD nodeId, communityId
RETURN communityId, collect(gds.util.asNode(nodeId).name) AS members
ORDER BY size(members) DESC;

// Weakly Connected Components
CALL gds.wcc.stream('professional-network')
YIELD nodeId, componentId
RETURN componentId, count(*) AS size
ORDER BY size DESC;
```

### Finding Bridges and Superconnectors

```cypher
// Find people who bridge communities
MATCH (p:Person)
WHERE p.betweenness > 0.1
RETURN p.name, p.betweenness, p.community
ORDER BY p.betweenness DESC;

// Find people connected to multiple communities
MATCH (p:Person)-[:KNOWS]-(other:Person)
WITH p, collect(DISTINCT other.community) AS connected_communities
WHERE size(connected_communities) >= 3
RETURN p.name, connected_communities, size(connected_communities) AS bridge_score
ORDER BY bridge_score DESC;

// Find structural hole spanners
MATCH (p:Person)-[:KNOWS]-(a:Person)
MATCH (p)-[:KNOWS]-(b:Person)
WHERE a.community <> b.community AND NOT (a)-[:KNOWS]-(b)
WITH p, count(DISTINCT [a.community, b.community]) AS holes_spanned
WHERE holes_spanned > 5
RETURN p.name, holes_spanned
ORDER BY holes_spanned DESC;
```

### Gladwell Classification Query

```cypher
// Classify nodes by Gladwell archetype
MATCH (p:Person)
WITH p,
     percentileDisc(p.betweenness, 0.9) OVER () AS bc_threshold,
     percentileDisc(p.degree, 0.9) OVER () AS dc_threshold,
     percentileDisc(p.eigenvector, 0.9) OVER () AS ec_threshold
RETURN p.name,
       CASE
         WHEN p.betweenness >= bc_threshold AND p.degree >= dc_threshold
           THEN 'connector'
         WHEN p.eigenvector >= ec_threshold AND p.degree < dc_threshold
           THEN 'maven'
         WHEN p.degree >= dc_threshold
           THEN 'salesman'
         ELSE 'standard'
       END AS gladwell_type,
       p.betweenness, p.degree, p.eigenvector
ORDER BY p.betweenness DESC;
```

### Path Finding

```cypher
// Shortest path between two people
MATCH path = shortestPath(
  (a:Person {name: 'Alice'})-[:KNOWS*]-(b:Person {name: 'Bob'})
)
RETURN path, length(path) AS degrees_of_separation;

// All shortest paths
MATCH paths = allShortestPaths(
  (a:Person {name: 'Alice'})-[:KNOWS*]-(b:Person {name: 'Bob'})
)
RETURN paths;

// Find connectors who can introduce you
MATCH (me:Person {name: 'Alice'})
MATCH (target:Person {name: 'Bob'})
MATCH path = shortestPath((me)-[:KNOWS*2..4]-(target))
WITH nodes(path) AS path_nodes
UNWIND range(1, size(path_nodes)-2) AS i
WITH path_nodes[i] AS connector
RETURN connector.name, connector.betweenness
ORDER BY connector.betweenness DESC;
```

### Multi-Source Network Fusion

```cypher
// Create weighted relationships from multiple sources
MATCH (a:Person)-[r:KNOWS]-(b:Person)
WITH a, b, collect(r) AS rels
SET a.connection_weight = reduce(w = 0.0, r IN rels |
  w + CASE r.source
    WHEN 'coauthorship' THEN 1.0
    WHEN 'conference' THEN 0.8
    WHEN 'linkedin' THEN 0.5
    WHEN 'github' THEN 0.6
    ELSE 0.3
  END
);
```

---

## Amazon Neptune

Neptune is AWS's managed graph database, compatible with Gremlin and SPARQL.

### Gremlin Queries

```groovy
// Betweenness-like analysis (Gremlin doesn't have native betweenness)
// Count paths through each node
g.V().hasLabel('Person')
  .project('name', 'pathsThrough')
  .by('name')
  .by(
    __.as('p')
    .both('KNOWS').as('start')
    .repeat(__.both('KNOWS').simplePath())
    .until(__.loops().is(3))
    .path()
    .filter(__.unfold().is('p'))
    .count()
  )
  .order().by('pathsThrough', desc)
  .limit(20)

// Degree centrality
g.V().hasLabel('Person')
  .project('name', 'degree')
  .by('name')
  .by(__.both('KNOWS').count())
  .order().by('degree', desc)
  .limit(20)

// Find bridges between communities
g.V().hasLabel('Person')
  .where(
    __.both('KNOWS').values('community').dedup().count().is(gte(3))
  )
  .project('name', 'communities')
  .by('name')
  .by(__.both('KNOWS').values('community').dedup().fold())
```

---

## TigerGraph

TigerGraph is optimized for deep-link analytics on large graphs.

### GSQL Queries

```sql
-- Create schema
CREATE VERTEX Person (
  PRIMARY_ID id STRING,
  name STRING,
  email STRING,
  role STRING
)

CREATE DIRECTED EDGE KNOWS (
  FROM Person,
  TO Person,
  strength FLOAT,
  source STRING
)

-- Betweenness Centrality
CREATE QUERY betweenness_centrality() FOR GRAPH professional_network {
  MapAccum<VERTEX<Person>, FLOAT> @@bc_scores;

  Start = {Person.*};

  // Run shortest paths from each node
  FOREACH src IN Start DO
    paths = SELECT t
      FROM Start:s -(KNOWS:e)- Person:t
      WHERE s == src
      ACCUM @@bc_scores += (t -> 1.0);
  END;

  PRINT @@bc_scores;
}

-- PageRank
CREATE QUERY pagerank(FLOAT damping = 0.85, INT max_iter = 20)
FOR GRAPH professional_network {
  MaxAccum<FLOAT> @pr_score = 1.0;
  SumAccum<FLOAT> @new_score;

  Start = {Person.*};
  INT num_vertices = Start.size();

  FOREACH i IN RANGE[1, max_iter] DO
    Start = SELECT s
      FROM Start:s -(KNOWS:e)- Person:t
      ACCUM t.@new_score += s.@pr_score / s.outdegree("KNOWS")
      POST-ACCUM
        s.@pr_score = (1 - damping) / num_vertices + damping * s.@new_score,
        s.@new_score = 0;
  END;

  PRINT Start[Start.@pr_score];
}

-- Find superconnectors
CREATE QUERY find_superconnectors(INT top_k = 20)
FOR GRAPH professional_network {
  SumAccum<INT> @degree;
  MaxAccum<FLOAT> @betweenness;

  Start = {Person.*};

  // Calculate degree
  connected = SELECT s
    FROM Start:s -(KNOWS:e)- Person:t
    ACCUM s.@degree += 1;

  // Return top by combined score
  Result = SELECT s FROM Start:s
    ORDER BY s.@degree DESC
    LIMIT top_k;

  PRINT Result;
}
```

---

## ArangoDB

ArangoDB is a multi-model database with graph capabilities.

### AQL Queries

```aql
// Betweenness Centrality (using Pregel)
WITH "professional_network"
LET result = PREGEL_RUN("betweenness", "professional_network", {
  maxIterations: 100,
  resultField: "betweenness"
})
FOR doc IN Person
  SORT doc.betweenness DESC
  LIMIT 20
  RETURN {name: doc.name, betweenness: doc.betweenness}

// PageRank
WITH "professional_network"
LET result = PREGEL_RUN("pagerank", "professional_network", {
  maxIterations: 100,
  dampingFactor: 0.85,
  resultField: "pagerank"
})
FOR doc IN Person
  SORT doc.pagerank DESC
  LIMIT 20
  RETURN {name: doc.name, pagerank: doc.pagerank}

// Shortest path
FOR v, e IN OUTBOUND SHORTEST_PATH
  'Person/alice' TO 'Person/bob'
  GRAPH 'professional_network'
  RETURN v.name

// K-hop neighbors
FOR v, e, p IN 1..3 ANY 'Person/alice'
  GRAPH 'professional_network'
  RETURN DISTINCT v.name

// Find bridges
FOR person IN Person
  LET neighbors = (
    FOR v IN 1..1 ANY person GRAPH 'professional_network'
      RETURN DISTINCT v.community
  )
  FILTER LENGTH(neighbors) >= 3
  SORT LENGTH(neighbors) DESC
  RETURN {
    name: person.name,
    communities_bridged: neighbors,
    bridge_score: LENGTH(neighbors)
  }
```

---

## DGraph

DGraph is a horizontally scalable graph database with GraphQL support.

### DQL Queries

```graphql
# Schema
type Person {
  id: ID!
  name: String! @index(term)
  email: String @index(exact)
  knows: [Person] @reverse
  betweenness: Float
  pagerank: Float
}

# Query high-centrality people
{
  superconnectors(func: ge(betweenness, 0.1), orderdesc: betweenness, first: 20) {
    name
    betweenness
    pagerank
    knows {
      name
    }
  }
}

# Shortest path
{
  path as shortest(from: 0x1, to: 0x2) {
    name
  }
}

# Find all paths up to depth 3
{
  var(func: eq(name, "Alice")) {
    knows @recurse(depth: 3) {
      uid
      name
    }
  }
}
```

---

## Python Integration Patterns

### Neo4j with Python

```python
from neo4j import GraphDatabase
import pandas as pd

class ProfessionalNetworkAnalyzer:
    def __init__(self, uri, user, password):
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def get_superconnectors(self, limit=20):
        with self.driver.session() as session:
            result = session.run("""
                CALL gds.betweenness.stream('professional-network')
                YIELD nodeId, score
                RETURN gds.util.asNode(nodeId).name AS name, score
                ORDER BY score DESC
                LIMIT $limit
            """, limit=limit)
            return pd.DataFrame([dict(r) for r in result])

    def find_path_to_target(self, source_name, target_name):
        with self.driver.session() as session:
            result = session.run("""
                MATCH path = shortestPath(
                  (a:Person {name: $source})-[:KNOWS*]-(b:Person {name: $target})
                )
                RETURN [n IN nodes(path) | n.name] AS path,
                       length(path) AS degrees
            """, source=source_name, target=target_name)
            record = result.single()
            if record:
                return record['path'], record['degrees']
            return None, None

    def classify_by_gladwell(self):
        with self.driver.session() as session:
            result = session.run("""
                MATCH (p:Person)
                WHERE p.betweenness IS NOT NULL
                WITH p,
                     percentileDisc(p.betweenness, 0.9) OVER () AS bc_thresh,
                     percentileDisc(p.degree, 0.9) OVER () AS dc_thresh,
                     percentileDisc(p.eigenvector, 0.9) OVER () AS ec_thresh
                RETURN p.name AS name,
                       CASE
                         WHEN p.betweenness >= bc_thresh AND p.degree >= dc_thresh
                           THEN 'connector'
                         WHEN p.eigenvector >= ec_thresh AND p.degree < dc_thresh
                           THEN 'maven'
                         WHEN p.degree >= dc_thresh
                           THEN 'salesman'
                         ELSE 'standard'
                       END AS archetype
            """)
            return pd.DataFrame([dict(r) for r in result])


# Usage
analyzer = ProfessionalNetworkAnalyzer(
    "bolt://localhost:7687",
    "neo4j",
    "password"
)

superconnectors = analyzer.get_superconnectors()
print(superconnectors.head(10))

path, degrees = analyzer.find_path_to_target("Alice", "Bob")
print(f"Path: {' -> '.join(path)} ({degrees} degrees)")

classifications = analyzer.classify_by_gladwell()
print(classifications[classifications['archetype'] == 'connector'])

analyzer.close()
```

### Bulk Loading Pattern

```python
from neo4j import GraphDatabase

def bulk_load_network(driver, nodes_df, edges_df, batch_size=5000):
    """Efficiently load network data into Neo4j."""

    with driver.session() as session:
        # Load nodes in batches
        for i in range(0, len(nodes_df), batch_size):
            batch = nodes_df.iloc[i:i+batch_size].to_dict('records')
            session.run("""
                UNWIND $batch AS row
                MERGE (p:Person {id: row.id})
                SET p.name = row.name,
                    p.email = row.email,
                    p.role = row.role
            """, batch=batch)
            print(f"Loaded {min(i+batch_size, len(nodes_df))} nodes")

        # Load edges in batches
        for i in range(0, len(edges_df), batch_size):
            batch = edges_df.iloc[i:i+batch_size].to_dict('records')
            session.run("""
                UNWIND $batch AS row
                MATCH (a:Person {id: row.source})
                MATCH (b:Person {id: row.target})
                MERGE (a)-[r:KNOWS]->(b)
                SET r.strength = row.strength,
                    r.source = row.data_source
            """, batch=batch)
            print(f"Loaded {min(i+batch_size, len(edges_df))} edges")


# Usage
driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))
bulk_load_network(driver, people_df, connections_df)
driver.close()
```

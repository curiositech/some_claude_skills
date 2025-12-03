---
title: Domain Shibboleths
sidebar_label: Domain Shibboleths
sidebar_position: 5
---
# Domain Shibboleths

Expert knowledge that separates novices from experts.

## What Are Shibboleths?

Deep knowledge markers that reveal true expertise. Great skills encode these to prevent Claude from giving novice-level advice.

## Skill Creation Shibboleths

**Novice skill creator**:
- "I'll make a comprehensive skill that handles everything related to X"
- Focuses on templates and examples
- Description: "Helps with many things"
- Thinks more tools = better

**Expert skill creator**:
- "I'll create a focused skill that encodes THIS specific expertise about X"
- Focuses on decision trees and anti-patterns
- Description: "Does A, B, C. Activate on keywords X, Y. NOT for D, E, F."
- Minimal tools, knows when NOT to use the skill
- Encodes temporal knowledge: "Pre-2024 pattern X was common, now use Y"

## Domain Example Shibboleths

### CLIP Embeddings

**Novice**: "CLIP is great for image-text matching"

**Expert**: "CLIP fails at:
- Counting objects
- Fine-grained classification (specific dog breeds, car models)
- Attribute binding ('red cube' vs 'blue sphere')
- Spatial relationships ('left of', 'above')
- Negation ('no dogs in image')

Use instead:
- DCSMs for compositional queries
- PC-CLIP for geometric reasoning
- Specialized counting models
- Task-specific fine-tuned models"

### MCPs vs Scripts

**Novice**: "MCPs are better because they're more powerful"

**Expert**: "MCP for auth/external APIs. Script for local/stateless.
- MCP: OAuth tokens, rate-limited APIs, persistent connections
- Script: File processing, transformations, local tools
- Building an MCP when a script would suffice = over-engineering"

### React Performance

**Novice**: "Use useMemo and useCallback everywhere"

**Expert**: "Profile first. Premature optimization causes:
- Complexity without benefit
- Memory overhead from closures
- Harder debugging

Only memoize when:
- Measured re-render cost &gt; 16ms
- Referential equality matters (deps of other hooks)
- Expensive computations"

### API Design

**Novice**: "Use REST for everything"

**Expert**: "Match API style to use case:
- REST: CRUD resources, cacheable, simple clients
- GraphQL: Complex queries, mobile/low-bandwidth, rapidly evolving
- gRPC: Internal services, high throughput, typed contracts
- WebSocket: Real-time bidirectional

Anti-pattern: GraphQL for simple CRUD = overengineering"

## Encoding Shibboleths in Skills

### Structure

```markdown
## Expert Knowledge: [Domain]

### Novice Approach
[What beginners do/think]

### Expert Insight
[What experienced practitioners know]

### Implications for This Skill
[How this affects the skill's guidance]
```

### Example Encoding

```markdown
## Expert Knowledge: Caching

### Novice Approach
"Cache everything for performance"

### Expert Insight
Cache invalidation is the hard problem:
- Stale data causes user confusion
- Thundering herd on expiry
- Memory pressure under load

### Implications
This skill recommends cache-aside pattern with:
- Short TTLs (5min default)
- Explicit invalidation hooks
- Graceful degradation on cache miss
```

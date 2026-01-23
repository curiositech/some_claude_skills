# Competitive Mapping Process

Detailed methodology for mapping competitive landscapes.

## Step 1: Define the Space

Clarify the competitive landscape to map:

| Question | Examples |
|----------|----------|
| **Domain** | Portfolio sites? SaaS products? Consulting services? |
| **User's offer** | What are they selling/showcasing? |
| **User's background** | Strengths, constraints, unique assets |
| **Goals** | Brand awareness? Lead generation? Thought leadership? |

## Step 2: Identify Players

Find three types of competitors:

### Direct Competitors
Same domain, same audience, same offering
- Portfolio: Other senior engineers in same tech stack
- SaaS: Other project management tools for design teams
- Service: Other freelance designers in same city

### Adjacent Competitors
Nearby domains, overlapping audience
- Portfolio: Engineers in adjacent stacks, designers with similar aesthetic
- SaaS: Adjacent tools (time tracking, team chat) that solve related problems
- Service: Agencies or in-house teams user competes against for work

### Aspirational References
Different domain but desired positioning/vibe
- Portfolio: Apple's minimal aesthetic (though not a portfolio)
- SaaS: Notion's community-driven growth (though different product)
- Service: Patagonia's values-driven brand (though different industry)

## Step 3: Analyze Positioning

For each competitor, extract:

```typescript
interface CompetitorProfile {
  name: string;
  url: string;

  positioning: {
    tagline: string;         // How they describe themselves
    primaryMessage: string;  // Main value prop
    differentiation: string; // How they claim to be different
  };

  visualStrategy: {
    aestheticStyle: string;  // Minimal, maximal, corporate, edgy
    colorPalette: string[];
    typography: string;
    layout: string;
  };

  contentStrategy: {
    tone: string;   // Professional, casual, technical, friendly
    depth: string;  // Surface-level or deep technical content
    focus: string;  // Process, results, personality, credentials
  };

  strengths: string[];
  weaknesses: string[];
  audience: string;
}
```

## Step 4: Create Competitive Map

Plot competitors on 2D space using strategic dimensions.

### Common Dimension Pairs

| Pair | Best For |
|------|----------|
| Technical depth ↔ Accessibility | Portfolios |
| Feature-rich ↔ Simple | Products |
| Enterprise ↔ Individual | Tools |
| Conservative ↔ Innovative | Agencies |
| Low-touch ↔ High-touch | Services |

### Map Structure

```typescript
interface CompetitiveMap {
  axes: {
    x: { name: string; low: string; high: string };
    y: { name: string; low: string; high: string };
  };

  players: Array<{
    name: string;
    position: { x: number; y: number }; // 0-100 scale
    size?: number; // Optional: market presence
  }>;

  clusters: Array<{
    name: string;
    members: string[];
    characteristics: string;
  }>;

  whiteSpace: Array<{
    position: { x: number; y: number };
    description: string;
    why: string;
  }>;
}
```

## Step 5: Identify White Space

### Criteria for Good White Space

| Criterion | Question |
|-----------|----------|
| **Viable** | Does target audience exist and is reachable? |
| **Defensible** | Does user have unique advantage to claim this space? |
| **Sustainable** | Is it a lasting gap, not temporary? |
| **Aligned** | Does it match user's strengths and goals? |

### Types of White Space

**Intersection Spaces**
- "Technical depth + warm personality" (most engineers pick one)
- "Enterprise features + indie pricing"
- "Conservative trust + innovative approach"

**Under-served Audiences**
- "Mid-market companies" (everyone targets enterprise or startups)
- "Non-technical founders"
- "Legacy system maintainers"

**Contrarian Positions**
- "Slow and thoughtful" (when everyone races to launch fast)
- "Expensive and exclusive" (when market races to bottom)
- "Opinionated and prescriptive" (when everyone offers flexibility)

## Step 6: Strategic Recommendations

```typescript
interface Strategy {
  positioning: {
    headline: string;       // One-line positioning statement
    differentiators: string[];
    messaging: string;
  };

  visualStrategy: {
    aestheticDirection: string;
    avoid: string[];   // Crowded visual patterns
    embrace: string[]; // Underutilized patterns
  };

  contentStrategy: {
    topics: string[];
    tone: string;
    depth: string;
  };

  risks: string[];
  validation: string[];
}
```

## Validation Questions

Before finalizing, check:
1. **Credible?** Can user actually deliver on this positioning?
2. **Memorable?** Will people remember how user is different?
3. **Defensible?** Can user protect this from copycats?
4. **Sustainable?** Will this work long-term?
5. **Authentic?** Does it match user's genuine strengths?

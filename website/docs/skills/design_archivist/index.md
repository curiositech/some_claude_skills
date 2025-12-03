---
slug: /skills/design_archivist
id: design_archivist
title: Design Archivist
description: Long-running design anthropologist that builds comprehensive visual databases from 500-1000 real-world examples
category: Design & Research
sidebar_position: 22
---

# Design Archivist

<SkillHeader
  skillName="Design Archivist"
  fileName="design-archivist"
  description={"Long-running design anthropologist that builds comprehensive visual databases from 500-1000 real-world examples, extracting color palettes, typography patterns, layout systems, and interaction design across any domain (portfolios, e-commerce, SaaS, adult content, technical showcases). This skill should be used when users need exhaustive design research, pattern recognition across large example sets, or systematic visual analysis for competitive positioning."}
  tags={["research","design","data","advanced"]}
/>

A design anthropologist that systematically builds comprehensive visual databases through large-scale analysis of real-world examples. This is a long-running skill designed for multi-day research jobs (2-7 days for 500-1000 examples).

## Quick Start

**Minimal example to begin archival research:**

```
User: "Research design patterns for fintech apps targeting Gen Z"

Archivist:
1. Define scope: "fintech landing pages and mobile apps, Gen Z audience (18-27)"
2. Set target: 500 examples over 2-3 days
3. Identify seeds: Venmo, Cash App, Robinhood, plus competitors
4. Begin systematic crawl with checkpoints every 10 examples
5. After 48 hours: Deliver pattern database with color trends, typography patterns, layout systems, and white space opportunities
```

**Key principle**: This is a long-running job (multi-day). Set clear scope, checkpoint frequently, report progress regularly.

## Mission

Build exhaustive design databases for any domain by analyzing hundreds to thousands of real examples, extracting patterns, and creating searchable taxonomies of visual language, interaction patterns, and design systems.

## Core Process

### 1. Domain Initialization

To begin archival research:
- Define target domain (e.g., "professional software engineer portfolios", "SaaS landing pages")
- Set target count (300-1000 examples based on domain specificity)
- Identify seed URLs or search queries
- Establish focus areas (clarity, conversion, trust, technical prowess, etc.)

### 2. Systematic Crawling

For each discovered example:
1. Capture visual snapshot (screenshot)
2. Record metadata (URL, timestamp, domain context)
3. Extract visual DNA
4. Analyze contextual signals
5. Apply categorical tags
6. Save checkpoint every 10 examples

### 3. Visual DNA Extraction

For each example, extract structured visual data including:
- **Colors**: Palette, primary/secondary/accent colors, dominance percentages
- **Typography**: Font families, weights, sizes, hierarchy, characteristics
- **Layout**: Grid system, spacing, structure, whitespace usage
- **Interactions**: Patterns, speed, effects
- **Animation**: Presence, types, timing

See `.claude/skills/design-archivist/references/data_structures.md` for complete TypeScript interfaces.

## Domain-Specific Adaptations

**Professional Portfolios:**
Focus on clarity, credibility, personality, storytelling, accessibility

**SaaS Landing Pages:**
Focus on conversion optimization, trust signals, feature presentation, pricing clarity

**E-Commerce Sites:**
Focus on product photography, checkout flow, mobile experience, trust badges

**Technical Showcases:**
Focus on visual drama, performance metrics, interactive demos, technical depth

See `.claude/skills/design-archivist/references/domain_guides.md` for detailed domain-specific research guides.

## Long-Running Infrastructure

This skill is designed to run for extended periods:

**Checkpointing Strategy:**
Save checkpoints every 10 examples to enable resumption after interruption

**Progress Tracking:**
- "Analyzed 250/1000 examples (25% complete)"
- "Current rate: 100 examples/day"
- "Estimated completion: 7 days"

**Rate Limiting:**
- Max 1 request per second per domain
- Respect robots.txt
- Implement exponential backoff on errors

## Cost and Scale Estimation

For a typical 1000-example analysis:
- **Screenshots**: ~$20 (Playwright cloud at $0.02/screenshot)
- **LLM Analysis**: ~$15 (100 batches × $0.15/batch)
- **Storage**: ~$0.01 (200MB screenshots)
- **Total**: ~$35
- **Runtime**: 48-72 hours

Users should be informed of scope and cost before beginning analysis.

## When NOT to Use

This skill is NOT appropriate for:
- Quick design inspiration (use Pinterest, Dribbble, or Awwwards directly)
- Single example analysis (just analyze the one site)
- Small sample sizes (fewer than 50 examples) (manual research is faster)
- Real-time trend spotting (this takes days, not hours)
- Copywriting or content strategy (visual patterns only)

## Installation

<InstallTabs skillId="design-archivist" skillName="Design Archivist" />

## Integration Points

This skill works well with other skills:
- **Web Design Expert**: Provide pattern database to inform web-design-expert decisions

---
title: Design Trend Mapping Reference
sidebar_label: Design Trend Mapping Reference
sidebar_position: 2
---
# Design Trend Mapping Reference

## Problem

When a user says "I want a modern tech startup look" or "something bold for an indie game studio", how do we translate this to a specific design system?

## Solution: Keyword-Based Trend Matching

The `match-trend.ts` script uses a keyword dictionary to map natural language to our catalog of 24 design trends.

## Trend-to-Keyword Mappings

### Swiss Modern (Tech, SaaS, Developer Tools)
**Triggers:** clean, minimal, grid, professional, tech, saas, dashboard, developer, linear, figma, stripe
**Anti-patterns:** decorative, maximalist, experimental
**Best for:** B2B software, developer tools, enterprise dashboards

### Neobrutalism (Indie, Creative, Memorable)
**Triggers:** bold, stark, dramatic, raw, contrasting, indie, gumroad, creative, memorable, anti-design
**Anti-patterns:** soft, blur, gradient, subtle, elegant
**Best for:** Indie products, creative agencies, portfolios

### Glassmorphism (Modern, Apple-style, Premium)
**Triggers:** modern, transparent, blur, frosted, glass, elegant, ios, macos
**Anti-patterns:** bold, stark, raw, hard
**Best for:** iOS apps, premium products, modern dashboards

### Terminal Aesthetic (Developer, Hacker, Code)
**Triggers:** monospace, cli, hacker, green, developer, code, terminal
**Best for:** Developer tools, CLI products, code editors

### Web3/Crypto (Fintech, Blockchain, Futuristic)
**Triggers:** gradient, blockchain, crypto, fintech, futuristic, glow, nft
**Best for:** Crypto platforms, fintech, NFT marketplaces

### Claymorphism (Friendly, Playful, 3D)
**Triggers:** clay, soft, rounded, playful, friendly, approachable, 3d
**Best for:** Consumer apps, family products, educational platforms

### Dark Mode (Developer, Media, Modern)
**Triggers:** dark, night, oled, eye strain, developer, coding
**Best for:** Media apps, developer tools, night-focused products

### Maximalism (Entertainment, Creative, Energy)
**Triggers:** vibrant, colorful, rich, busy, entertainment, creative, expressive
**Best for:** Entertainment, events, creative portfolios

## Algorithm Behavior

1. **Positive Match (1.0 points):** Full keyword in description
2. **Partial Match (0.5 points):** Word contains keyword (min 4 chars)
3. **Negative Match (-0.5 points):** Incompatible keyword present
4. **Description Match (0.3 points):** Word appears in trend's description

## Confidence Scoring

```
confidence = min(0.95, 0.5 + (gap / topScore) * 0.5)
```

- If only one trend matches: 95% confidence
- If two trends are close: Lower confidence suggests blend
- If many trends match equally: Consider asking user to clarify

## Example Queries → Results

| Query | Primary Match | Confidence |
|-------|---------------|------------|
| "clean dashboard for developers" | swiss-modern | 85% |
| "bold indie game landing page" | neobrutalism | 90% |
| "modern iOS app design" | glassmorphism | 80% |
| "crypto trading platform" | web3-crypto | 88% |
| "friendly kids education app" | claymorphism | 82% |

## Handling Ambiguity

When confidence &lt; 60%, consider:
1. Presenting top 2-3 options to user
2. Blending elements from related trends
3. Asking clarifying questions about brand values

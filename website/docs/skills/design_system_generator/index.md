---
sidebar_label: Design System Generator
sidebar_position: 1
---

# Design System Generator

Design system generator that matches natural language descriptions to design trends. Expert in Swiss Modern, Neobrutalism, Glassmorphism, and 20+ other design trends. Includes trend matching scripts and comprehensive design pattern library.

## When to Use This Skill

**Activate on:**
- "design system", "design trends", "trend matcher"
- "Swiss Modern", "Neobrutalism", "Glassmorphism"
- "match design style", "design trend recommendation"
- "component library trends", "modern design patterns"

**NOT for:**
- Implementing individual components → `design-system-creator`
- Dark mode specifically → `dark-mode-design-expert`
- Typography only → `typography-expert`
- Accessibility auditing → `color-contrast-auditor`

## Core Capabilities

This skill provides a trend matching script that maps natural language descriptions to specific design trends including:

- Swiss Modern (clean, minimal, professional)
- Neobrutalism (bold, stark, dramatic)
- Glassmorphism (transparent, frosted glass)
- Neumorphism (soft, tactile, raised)
- Dark Mode (night mode, OLED optimized)
- Hyperminimalism (essential, calm, zen)
- Maximalism (vibrant, colorful, rich)
- Cyberpunk (neon, futuristic, gaming)
- Retrofuturism (vintage sci-fi, arcade)
- 3D Immersive (WebGL, AR, interactive)
- Motion Design (animated, micro-interactions)
- Bold Typography (oversized, kinetic)
- Collage (scrapbook, artistic)
- Sustainable Design (ethical, accessible)
- Claymorphism (soft, rounded, playful)
- Terminal Aesthetic (monospace, CLI)
- Web3/Crypto (gradient, blockchain)
- Botanical/Organic (natural, earthy)

## Usage

Run the trend matcher script:

```bash
npx ts-node scripts/match-trend.ts "description of desired design"
```

The script will analyze the description and return the best matching design trend with a score and matched keywords.

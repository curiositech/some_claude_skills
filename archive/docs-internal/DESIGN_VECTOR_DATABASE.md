# Design Vector Database Architecture

**Date**: 2026-01-29  
**Status**: Architecture Decision (ADR)  
**Decision**: Hybrid approach — Phase 1 structured JSON + Phase 2 semantic layer

---

## Context

WinDAGs needs a design system catalog to power:
1. **Design System Generator** skill (generates tokens from direction)
2. **Landing Page Demo** (auto-selects appropriate design system)
3. **Magic Developer Tool Demo** (applies consistent aesthetic)

The question: should we use a traditional JSON database or vector embeddings?

---

## What Gets Embedded

Design vectors encode multiple dimensions:

### Color Attributes
- Hex value + HSL/HSV decomposition
- Psychological associations (warm/cool, active/passive)
- WCAG contrast ratios
- Accessibility compliance

### Typography
- Font family + fallback chain
- Scale ratios (1.125x, 1.25x, 1.5x, etc.)
- Weight combinations (normal, 600, 700, 900)
- Line height + letter spacing conventions
- Readability metrics

### Component Patterns
- Aspect ratios (16:9, 4:3, 1:1, etc.)
- Padding/margin language (spacing units: 4px, 8px, 16px)
- Border strategies (width, color, shadow depth)
- Interaction patterns (hover, focus, disabled states)

### System Properties
- Animation speeds (transitions, easing)
- Spacing rhythm (grid units)
- Shadow/depth language
- Breakpoints (responsive design)
- Design trend classification

---

## The Hybrid Approach (Recommended)

### Phase 1: Structured JSON (MVP)

**Output**: Version-controlled catalog in `design-catalog/`

```
design-catalog/
├── design-catalog.json
├── design-systems/ (8+ systems)
│   ├── neobrutalism.json
│   ├── swiss-modern.json
│   ├── glassmorphism.json
│   ├── maximalism.json
│   ├── hyperminimalism.json
│   ├── cyberpunk.json
│   ├── cottagecore.json
│   └── brutalist-minimal.json
├── components/ (7+ types)
│   ├── buttons.json
│   ├── cards.json
│   ├── navigation.json
│   ├── hero-sections.json
│   ├── cta-blocks.json
│   ├── testimonials.json
│   └── forms.json
├── color-palettes.json
├── typography-systems.json
├── spacing-systems.json
└── README.md
```

### Phase 2: Semantic Layer (Week 3+)

Chroma (local) or Qdrant (persistent) with embeddings for similarity search.

---

## Decision: Adopt Hybrid

1. **Phase 1**: Structured JSON (MVP-focused, auditable, no dependencies)
2. **Phase 2**: Add semantic layer (Week 3+) if needed
3. **Technology**: Chroma local, migrate to Qdrant if needed

---

## Next Steps

1. Design Archivist Research Mission: Build initial catalog
2. Design System Generator: Implement Phase 1 queries
3. Integration: Wire into demos
4. Phase 2 (optional): Add semantic layer based on usage

# Hand-Drawn Infographic Creator

**Domain:** Educational visual design for recovery content
**Style:** Anatomist's notebook aesthetic (scholarly but intimate)
**Output:** AI generation prompts, layout specifications, accessibility documentation

## Quick Start

This skill generates detailed specifications for hand-drawn style diagrams that explain complex recovery concepts (neuroscience, timelines, social dynamics, processes).

### When to Use This Skill

Invoke this skill when:
- Writing recovery education articles that need visual explanation
- Explaining neuroscience concepts (brain anatomy, neural pathways)
- Showing timelines or data (PAWS progression, dopamine recovery)
- Illustrating social dynamics (judgment vs empathy, conflict patterns)
- Visualizing abstract processes (dopamine cascade, shame spiral)

### What You Get

This skill produces:
1. **AI Generation Prompts** (Stable Diffusion, Flux, DALL-E ready)
2. **Firecrawl Search Queries** (reference imagery)
3. **Layout Specifications** (grid system, element placement)
4. **Color Coding Definitions** (semantic color meanings)
5. **Accessibility Documentation** (alt text, long descriptions)

### Visual Style

**Hand-Drawn Characteristics:**
- Continuous line art (organic, slight imperfections)
- Ink on parchment aesthetic (cream background, charcoal lines)
- Margin annotations (engineer's notebook style)
- Selective color highlights (cyan for activity, coral for damage, gold for healing)

**Inspiration Sources:**
- Leonardo da Vinci anatomical drawings
- Engineer's notebook sketches
- TED-Ed educational illustrations
- Whiteboard explanations

## Diagram Types

| Type | Use Case | Example |
|------|----------|---------|
| **Brain Anatomy** | Show specific structures and their function/dysfunction | Salience network overactivation, dopamine pathways |
| **Timeline/Graph** | Display symptom progression or recovery trajectories | PAWS timeline, receptor upregulation over months |
| **Social Comparison** | Illustrate relational dynamics and communication patterns | Judgment vs empathy, conflict escalation vs de-escalation |
| **Process Flow** | Explain causation, cascading effects, feedback loops | Dopamine cascade from cue to crash, shame spiral |

## Color Palette (Brand-Aligned)

### Base Colors
- **Charcoal** `#1a2332` - Primary lines (main content)
- **Parchment** `#faf8f3` - Background (cream paper)
- **Ocean Blue** `#2d5a7b` - Annotations (labels, notes)

### Semantic Highlights (Use Sparingly)
- **Teal** `#4a9d9e` - Neural activity, positive states, improvement
- **Coral** `#e63946` - Damage, risk, problems, conflict
- **Gold** `#f4a261` - Healing, progress, recovery, insight

**Color Rule:** Maximum 1-2 highlight colors per diagram. Use color for meaning, not decoration.

## Example Usage

### Request: "Explain meth-induced paranoia"

**Skill Output:**
```
Type: Brain anatomy diagram (sagittal section)
Primary Content: Brain structure with ACC and insula highlighted in cyan
Margin Notes: "Pattern detector gone haywire," "Everything = potential threat"
Color Coding: Cyan glow (#4a9d9e) on salience network regions
Layout: 60% brain structure, 20% margin notes, 15% title, 5% scale
AI Prompt: "Sagittal brain section, continuous line art, anatomical drawing..."
Alt Text: "Hand-drawn anatomical diagram showing salience network hyperactivity..."
```

### Request: "Show PAWS symptom timeline"

**Skill Output:**
```
Type: Timeline graph with multiple curves
Primary Content: Three hand-drawn curves (anxiety, mood, sleep) over 12 months
Annotations: "Week 4-8: The Wall," "Month 6: Turning Point"
Color Coding: Coral (anxiety struggle), Gold (mood healing), Teal (sleep improvement)
Layout: 60% graph, 20% margin notes, 15% title, 5% takeaway
AI Prompt: "Hand-drawn graph on parchment, three curves color-coded..."
Alt Text: "Timeline showing anxiety peaks at 2 months, mood improves after 6..."
```

## Workflow

1. **Analyze Request**: What concept needs visualization? Who's the audience?
2. **Select Type**: Brain anatomy, timeline, social comparison, or process flow?
3. **Search References**: Generate Firecrawl queries for composition inspiration
4. **Build Prompt**: Combine template + brand colors + specific content
5. **Specify Layout**: Use 60/20/15/5 grid system
6. **Color Semantics**: Assign meaning (cyan=active, coral=damage, gold=healing)
7. **Write Alt Text**: Comprehensive accessibility description

## Technical Specifications

### AI Image Generation
- **Aspect Ratio**: 16:9 (landscape for article embeds)
- **Resolution**: 1280x720px minimum
- **Style Keywords**: "continuous line art, anatomical drawing, ink on parchment"
- **Negative Prompts**: "photorealistic, 3D render, stock photo, smooth gradients"
- **CFG Scale**: 7-9 (moderate prompt adherence)
- **Steps**: 30-40 (quality balance)

### Layout Grid
```
┌─────────────────────────────────────────────────┐
│ Title & Context (15%)                           │
├─────────────────────────────────────────────────┤
│                              │                  │
│  Primary Content (60%)       │  Margin Notes    │
│                              │  (20%)           │
├──────────────────────────────┴──────────────────┤
│ Key Takeaway / Scale (5%)                       │
└─────────────────────────────────────────────────┘
```

### Typography
- **Font**: Indie Flower or Patrick Hand (handwriting style)
- **Title**: 24-28px
- **Labels**: 16-18px
- **Annotations**: 12-14px
- **Emphasis**: ALL CAPS (use sparingly)

## Quality Standards

Every diagram specification must include:
- [ ] Charcoal primary lines (#1a2332)
- [ ] Parchment background (#faf8f3)
- [ ] 1-2 semantic highlight colors maximum
- [ ] Ocean blue annotations (#2d5a7b)
- [ ] 60/20/15/5 layout grid
- [ ] Negative space preserved
- [ ] Alt text (2-3 sentences minimum)
- [ ] Color meanings explained

## Files in This Skill

- **SKILL.md** - Complete skill specification with templates
- **README.md** - This quick reference guide
- **EXAMPLE_OUTPUT.md** - Full example outputs for each diagram type
- **references/** - Reference materials:
  - `line-drawing-techniques.md` - Technical drawing methods
  - `anatomical-conventions.md` - Medical illustration standards
  - `color-theory-education.md` - Color psychology for learning
  - `composition-guidelines.md` - Visual hierarchy and layout
  - `ai-prompt-engineering.md` - Stable Diffusion best practices
  - `accessibility-standards.md` - WCAG compliance for diagrams

## Integration with Recovery Education Writer

This skill works alongside the `recovery-education-writer` skill:
1. Writer skill creates article content and identifies visualization needs
2. Infographic skill generates diagram specifications
3. Diagrams are embedded in articles with proper alt text
4. Combined output: comprehensive, accessible recovery education content

## Future Enhancements

Planned additions:
- Animation sequences for video content (draw-on effects, timing)
- Interactive diagram specifications (SVG with hover states)
- Multi-language alt text generation
- Data visualization from Supabase queries (auto-generate graphs)

## License & Attribution

This skill was created for the **sobriety.tools** recovery platform. Diagrams generated using this skill should maintain the hand-drawn aesthetic to preserve the brand's approachable authority.

**Visual Style Credits:**
- Inspired by Leonardo da Vinci's anatomical studies (public domain)
- TED-Ed educational illustration style
- Engineer's notebook documentation tradition

---

**Last Updated:** 2026-01-11
**Version:** 1.0.0
**Maintainer:** sobriety.tools team

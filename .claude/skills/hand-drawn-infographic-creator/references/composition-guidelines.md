# Composition Guidelines for Educational Diagrams

This reference covers visual composition principles that ensure diagrams are clear, balanced, and pedagogically effective.

---

## Core Composition Principles

### 1. Visual Hierarchy

**Definition:** The order in which the eye processes visual elements, from most to least important.

**Why it matters:** Viewers should understand the main point within 3 seconds, with details revealed on closer inspection.

**Three-Level Hierarchy:**

| Level | Purpose | Visual Treatment | Example Elements |
|-------|---------|------------------|------------------|
| **Primary** | Main message | Largest, boldest, highest contrast | Brain structure being taught, key data curve |
| **Secondary** | Supporting context | Medium size/weight, clear but not dominant | Labels, connecting lines, related structures |
| **Tertiary** | Additional detail | Smallest, lightest, easily skipped | Margin notes, scale bar, background grid |

**Implementation:**

**Size hierarchy:**
```
Primary element:   ████████ (60-70% of frame)
Secondary elements: ████ (15-20% each)
Tertiary elements:  ██ (5-10% total)
```

**Weight hierarchy (line thickness):**
```
Primary: 3-4px bold lines (main structure)
Secondary: 2-3px lines (labels, connections)
Tertiary: 1-2px lines (annotations, grid)
```

**Contrast hierarchy:**
```
Primary: 100% opacity, full saturation color
Secondary: 100% opacity, neutral color or lower saturation
Tertiary: 60-80% opacity, very low saturation
```

**Test:** Cover tertiary elements—can you still understand the diagram? If no, you've made tertiary information too important (promote it).

---

### 2. The Rule of Thirds

**Definition:** Divide frame into 9 equal parts (3×3 grid). Place important elements at intersections or along lines.

**Why it matters:** Creates dynamic, balanced compositions that feel natural to the eye.

**The Grid:**
```
┌─────┬─────┬─────┐
│     │     │     │
│     ●     │     │ ← Intersections (power points)
├─────┼─────┼─────┤
│     │     │     │
│     │     ●     │
├─────┼─────┼─────┤
│     │     │     │
│     │     │     │
└─────┴─────┴─────┘
```

**Application by Diagram Type:**

**Brain Anatomy:**
```
┌─────┬─────┬─────┐
│     │Brain│     │ ← Structure on left third line
│     │     │Notes│ ← Notes on right third
│   ●─┼─────┼──●──┤
│     │     │     │
│     │     │     │
├─────┼─────┼─────┤
│     │     │     │
│Scale│     │     │ ← Scale at lower left intersection
└─────┴─────┴─────┘
```

**Timeline Graph:**
```
┌─────┬─────┬─────┐
│Title│     │     │
├─────┼─────┼─────┤
│  Y  │     │     │ ← Peak data point at intersection
│  │  │  ●  │     │
│  │  │ ╱ ╲ │     │
├──●──┼─────┼──●──┤
│     │     │     │ ← X-axis at lower third line
└─────┴─────┴─────┘
   0    6    12 months
```

**Two-Panel Comparison:**
```
┌─────┬─────┬─────┐
│Panel│  vs │Panel│ ← Vertical center line as divider
│  1  │     │  2  │
│     │     │     │
│  ●  │     │  ●  │ ← Focal points at intersections
│     │     │     │
│     │     │     │
└─────┴─────┴─────┘
```

**Exception:** Center-weighted compositions for symmetrical concepts (balance, homeostasis, equilibrium).

---

### 3. Negative Space (Whitespace)

**Definition:** Empty space around and between elements. Not "wasted" space—active breathing room.

**Why it matters:** Reduces cognitive load, directs attention, prevents overwhelming viewers.

**Minimum Requirements:**

| Element Type | Surrounding Space | Example |
|--------------|-------------------|---------|
| Primary structure | 10-15% of frame on all sides | Brain outline has margin |
| Labels | 5% between text and leader line | Gap before arrow hits word |
| Margin notes | 5% between lines | Line spacing in paragraphs |
| Panels | 3-5% gutter between panels | Space between left/right |

**Good vs Bad:**

**Bad (crowded):**
```
╭─────────────────────╮
│Brain●●●●●●●●●●●●●●●│ ← No breathing room
│●●●●●●●●●●●●●●●●●●●│
│●●●●●●●●●●●●●●●●●●●│
╰─────────────────────╯
```

**Good (spacious):**
```
╭─────────────────────╮
│                     │
│      ╭─────╮        │ ← Generous margins
│     ╱Brain  ╲       │
│    │         │      │
│     ╲       ╱       │
│      ╰─────╯        │
│                     │
╰─────────────────────╯
```

**Test:** If you removed 20% of the content, would the diagram still communicate? If yes, you have healthy negative space.

---

### 4. Alignment and Grid

**Definition:** Organizing elements along invisible horizontal/vertical lines for visual order.

**Why it matters:** Creates professionalism, reduces chaos, aids in scanning.

**The 60/20/15/5 Grid (Standard for sobriety.tools):**

```
┌─────────────────────────────────────────────────┐
│ TITLE & CONTEXT (15%)                           │ ← Top bar
├────────────────────────────────┬────────────────┤
│                                │                │
│                                │   MARGIN       │
│   PRIMARY CONTENT (60%)        │   NOTES        │ ← Left 60%, Right 20%
│                                │   (20%)        │
│                                │                │
├────────────────────────────────┴────────────────┤
│ KEY TAKEAWAY / SCALE (5%)                       │ ← Bottom bar
└─────────────────────────────────────────────────┘
```

**Why these proportions:**
- **60% primary**: Enough room for complex structures without crowding
- **20% margin notes**: Engineer's notebook aesthetic, room for 3-5 bullet points
- **15% title**: Space for title + subtitle + brief context
- **5% bottom**: Scale bar or one-sentence takeaway

**Flexibility:**
- Increase primary to 70% if fewer margin notes needed
- Increase margin notes to 30% if detailed explanation required
- Never reduce primary below 50% (diagram should dominate)

---

### 5. Flow and Eye Movement

**Definition:** The path the eye follows through a composition, from entry point to exit.

**Why it matters:** Controls the order of information processing, ensures logical comprehension.

**Natural Eye Movements (Western Viewers):**
1. **Z-pattern** (default): Top-left → top-right → middle-left → bottom-right
2. **F-pattern** (text-heavy): Top-left → across → down left edge → across again
3. **Circular** (central focus): Center → radiate outward in spiral

**Designing for Flow:**

**Brain Diagram (Z-Pattern):**
```
TITLE (enter here) ─────────────> MARGIN NOTE (scan here)
         │                                │
         ↓                                ↓
   BRAIN STRUCTURE ──────────────> MORE NOTES
         │                                │
         ↓                                ↓
   SCALE BAR (exit here) <──────── TAKEAWAY
```

**Timeline Graph (F-Pattern):**
```
TITLE (enter) ──────────> Y-AXIS LABEL
     │
     ↓
Y-AXIS ──> PEAK ──> ANNOTATIONS ──> MARGIN NOTES
     │
     ↓
X-AXIS ──────────────────────────> TAKEAWAY (exit)
```

**Process Flow (Linear/Circular):**
```
       START
         ↓
      STEP 1
         ↓
      STEP 2
         ↓
      STEP 3
         ↓
    ╭─→ STEP 4 ─╮
    │            │
    ╰────────────╯ ← Feedback loop
```

**Guiding Eye Movement:**
- **Arrows**: Explicit directional cues
- **Lines**: Connecting elements creates path
- **Size**: Eye goes to largest element first
- **Color**: High contrast attracts attention
- **Whitespace**: Gaps slow the eye, group elements

---

## Diagram-Specific Composition

### Brain Anatomy Diagrams

**Layout Strategy: Spotlight + Context**

**Primary focus:** The brain structure (60% of frame)
**Context:** Labels + margin notes (35%)
**Metadata:** Title + scale (5%)

**Composition Template:**
```
┌─────────────────────────────────────────┐
│ BRAIN STRUCTURE NAME                    │ 15% Title
├───────────────────────────┬─────────────┤
│                           │ • Note 1    │
│      ╭────────╮           │ • Note 2    │
│     ╱          ╲          │ • Note 3    │ 60% Brain
│    │    ●───────●─────────┼─• Note 4    │ 20% Notes
│     ╲          ╱          │ • Note 5    │
│      ╰────────╯           │             │
│         │                 │             │
│    ╭────┴─────╮           │             │
│   Label here   Label here │             │
├───────────────────────────┴─────────────┤
│ KEY INSIGHT         ├─────┤ 5 cm        │ 5% Bottom
└─────────────────────────────────────────┘
```

**Alignment rules:**
- Brain structure: Slightly left of center (allows margin notes on right)
- Labels: Align along horizontal lines (not scattered randomly)
- Margin notes: Left-aligned, consistent line spacing
- Scale bar: Right-aligned, bottom corner

**Color focus:**
- Brain outline: 100% opacity charcoal (primary)
- Highlighted region: 40% fill + 100% outline semantic color (focal point)
- Labels: 100% opacity ocean blue (secondary)
- Margin notes: 100% opacity ocean blue (tertiary)

---

### Timeline / Graph Diagrams

**Layout Strategy: Data + Interpretation**

**Primary focus:** The graph/data (60%)
**Context:** Annotations + margin notes (35%)
**Metadata:** Title + axis labels + takeaway (5%)

**Composition Template:**
```
┌─────────────────────────────────────────┐
│ TIMELINE TITLE                          │ 15% Title
├───────────────────────────┬─────────────┤
│ Y  ↑                      │ Annotation  │
│    │       ╱●╲            │ for peak    │
│ A  │      ╱   ╲           │             │
│ X  │     ╱     ╲          │ Annotation  │ 60% Graph
│ I  │    ╱       ╲         │ for valley  │ 20% Notes
│ S  │   ●         ●────●   │             │
│    └───┼────┼────┼────┼───┼→ X-AXIS     │
│        0    3    6    12  │             │
├───────────────────────────┴─────────────┤
│ KEY TAKEAWAY: [One sentence summary]    │ 5% Bottom
└─────────────────────────────────────────┘
```

**Alignment rules:**
- Y-axis: Left edge (10% margin from frame)
- X-axis: Lower third line (not bottom)
- Peak data points: At rule-of-thirds intersections
- Annotations: Right-aligned with arrows pointing left to data

**Color focus:**
- Axes: Charcoal 2px (structural, not focal)
- Data curves: Semantic colors 3px (primary focus)
- Grid (if used): Charcoal 0.5px at 20% opacity (tertiary)
- Annotations: Ocean blue (secondary)

---

### Social Situation / Comparison Diagrams

**Layout Strategy: Side-by-Side Contrast**

**Primary focus:** The two scenarios (60% total, 30% each)
**Context:** Thought bubbles + consequences (35%)
**Metadata:** Title + takeaway (5%)

**Composition Template:**
```
┌────────────────────────────────────────┐
│ SCENARIO A vs SCENARIO B               │ 15% Title
├─────────────────────┬──────────────────┤
│ JUDGMENT            │ EMPATHY          │
│                     │                  │
│  ╭─────────╮        │  ╭─────────╮    │
│  │ thought │        │  │ thought │    │
│  ╰────┬────╯        │  ╰────┬────╯    │
│       │             │       │          │ 60% Panels
│    ( person )       │    ( person )    │ (30% each)
│       │             │       │          │
│   [outcome]         │   [outcome]      │
│                     │                  │
├─────────────────────┴──────────────────┤
│ KEY DIFFERENCE: [Comparison summary]   │ 5% Bottom
└────────────────────────────────────────┘
```

**Alignment rules:**
- Vertical center line: Exact middle (50/50 split)
- Figures: Centered within each panel
- Thought bubbles: Aligned horizontally (same height)
- Outcomes: Aligned horizontally at bottom of panels

**Color focus:**
- Figures: Charcoal (neutral, equal weight)
- Left panel accent: Coral (problematic scenario)
- Right panel accent: Teal (positive scenario)
- Dividing line: Light gray at 30% opacity (subtle)

---

### Process Flow Diagrams

**Layout Strategy: Sequential Steps**

**Primary focus:** The process boxes (60%)
**Context:** Annotations explaining each step (35%)
**Metadata:** Title + takeaway (5%)

**Composition Template:**
```
┌────────────────────────────────────────┐
│ PROCESS NAME                           │ 15% Title
├───────────────────────────┬────────────┤
│   ┌─────────────┐         │ Step 1:    │
│   │   STEP 1    │─────────┼─ What      │
│   └──────┬──────┘         │   happens  │
│          ↓                │            │
│   ┌─────────────┐         │ Step 2:    │ 60% Flow
│   │   STEP 2    │─────────┼─ Why it    │ 20% Notes
│   └──────┬──────┘         │   matters  │
│          ↓                │            │
│   ┌─────────────┐         │ Step 3:    │
│   │   STEP 3    │─────────┼─ What      │
│   └─────────────┘         │   next     │
├───────────────────────────┴────────────┤
│ KEY MECHANISM: [Summary of cycle]      │ 5% Bottom
└────────────────────────────────────────┘
```

**Alignment rules:**
- Boxes: Vertically centered (aligned on center axis)
- Arrows: Straight vertical connections (not diagonal)
- Annotations: Left-aligned in margin, horizontally aligned with boxes
- Feedback loops: Curved dashed lines (visually distinct from main flow)

**Color focus:**
- Boxes: Charcoal 2px outlines (neutral)
- Highlighted boxes: Semantic color fill 40% (peak or crash)
- Arrows: Charcoal 2px (structural)
- Feedback arrow: Coral dashed line (indicates problematic loop)

---

## Balance and Symmetry

### When to Use Symmetry

**Use symmetry for:**
- Comparisons (left vs right, before vs after)
- Balanced concepts (homeostasis, equilibrium)
- Formal, authoritative tone

**Example: Two-panel comparison**
```
JUDGMENT        │        EMPATHY
   ●            │            ●     ← Symmetrical figures
  ╱│╲           │           ╱│╲
```

---

### When to Use Asymmetry

**Use asymmetry for:**
- Dynamic processes (change, progression)
- Narrative flow (beginning → middle → end)
- Hierarchy (main subject + supporting context)

**Example: Brain anatomy with notes**
```
              ╭─────╮
             ╱Brain  ╲         • Note
            │         │        • Note    ← Asymmetrical
             ╲       ╱         • Note    (60/40 split)
              ╰─────╯
```

---

## Depth and Layering

### Creating Visual Depth Without 3D

**Techniques:**

**1. Overlap**
- Foreground element crosses in front of background
- Use complete lines for foreground, broken lines for background

```
Foreground:  ━━━━━━━━━━
              ╲
Background:    ┈┈ ╲ ┈┈  ← Breaks where overlapped
```

---

**2. Size Variation**
- Larger = closer
- Smaller = farther

```
Closer:     ████ (large brain)
           ━━━━━━━━━━━
Farther:    ██ (small reference)
```

---

**3. Opacity**
- 100% opacity = foreground
- 40-60% opacity = background

```
Foreground brain: ████ (100%)
Background context: ▒▒▒▒ (40%)
```

---

**4. Line Weight**
- Thick lines (3-4px) = foreground
- Thin lines (1-2px) = background

```
Foreground: ━━━━━━ (3px)
Background: ─────── (1px)
```

---

## Common Composition Mistakes

### Mistake 1: Centered Bull's-Eye

**Problem:** Everything centered, no visual hierarchy, static.

**Example (bad):**
```
┌─────────────┐
│             │
│      ●      │ ← Everything dead center
│             │
└─────────────┘
```

**Fix:** Use rule of thirds, create asymmetry.

```
┌─────────────┐
│   ●         │ ← Off-center, dynamic
│      ○      │
└─────────────┘
```

---

### Mistake 2: Edge Hugging

**Problem:** Elements touching frame edges, no breathing room.

**Example (bad):**
```
┌Brain──────────Notes┐
│                    │
│                    │ ← No margins
└Scale─────────────Take┘
```

**Fix:** Add 5-10% margin on all sides.

```
┌─────────────────────┐
│                     │
│   Brain      Notes  │ ← Healthy margins
│                     │
│  Scale       Take   │
└─────────────────────┘
```

---

### Mistake 3: Conflicting Focal Points

**Problem:** Multiple elements competing for attention.

**Example (bad):**
```
HUGE TITLE
  ████ Large brain ████
  ████ Large graph ████
  HUGE TAKEAWAY
```

**Fix:** Establish clear hierarchy (one primary, others secondary).

```
Small title
  ████ Large brain ████ ← Primary
    ○ Graph context    ← Secondary
  small takeaway
```

---

### Mistake 4: Unintentional Tangents

**Problem:** Elements barely touching (look like mistakes).

**Example (bad):**
```
Brain ●─────● Label  ← Line barely touches brain (ambiguous)
```

**Fix:** Either separate clearly OR overlap intentionally.

```
Brain ●────→● Label  ← Arrow clearly points (separate)
or
Brain ●───●Label     ← Line touches precisely (intentional)
```

---

### Mistake 5: Ignoring Aspect Ratio

**Problem:** Composition designed for square but rendered in 16:9.

**Example (bad):**
```
Square design:     Forced into 16:9:
┌─────┐            ┌──────────────┐
│ ● ● │            │ ● ●          │ ← Awkward empty space
│  ●  │            │  ●           │
└─────┘            └──────────────┘
```

**Fix:** Design FOR 16:9 from the start (horizontal composition).

```
┌───────────────────┐
│  ●    ●    ●      │ ← Uses width naturally
└───────────────────┘
```

---

## Responsive Composition

### Designing for Multiple Sizes

**Challenge:** Diagram viewed on desktop (1920px wide) AND mobile (375px wide).

**Solution: Scalable Hierarchy**

**Desktop (wide):**
```
┌─────────────────────────────────────────┐
│ Title          Brain [60%]    Notes [20%]│
│                                          │
└─────────────────────────────────────────┘
```

**Mobile (narrow):**
```
┌─────────────┐
│ Title       │
│             │
│  Brain      │ ← Brain takes full width
│  [100%]     │
│             │
├─────────────┤
│ • Notes     │ ← Notes move below
│ • Notes     │
└─────────────┘
```

**Design rules:**
- Labels: Readable at 12px minimum (use 14-16px to be safe)
- Touch targets: 44px minimum (for interactive diagrams)
- Line weights: 2-3px minimum (visible on Retina displays)

---

## Composition Checklist

Before finalizing any diagram composition:

### Hierarchy
- [ ] One clear primary element (60-70% visual weight)
- [ ] Secondary elements support but don't compete
- [ ] Tertiary elements easily skippable (scale, metadata)

### Balance
- [ ] Rule of thirds applied (or intentionally violated)
- [ ] Negative space ≥20% of frame
- [ ] No edge-hugging (5-10% margins maintained)

### Flow
- [ ] Eye path clear (entry → main → support → exit)
- [ ] Arrows or lines guide where needed
- [ ] No conflicting focal points or tangents

### Grid Alignment
- [ ] 60/20/15/5 grid followed (or alternative documented)
- [ ] Elements align on invisible horizontal/vertical lines
- [ ] Consistent spacing between elements

### Accessibility
- [ ] Readable at target size (test at actual resolution)
- [ ] Touch targets ≥44px for interactive elements
- [ ] Works in grayscale (not color-dependent)

---

**Last Updated:** 2026-01-11
**Version:** 1.0.0
**Skill:** hand-drawn-infographic-creator

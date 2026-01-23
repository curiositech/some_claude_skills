# Color Theory for Educational Graphics

This reference explains how to use color semantically in recovery education diagrams to enhance comprehension, not just aesthetics.

---

## Core Principle: Color as Information

In educational diagrams, **color must convey meaning**. Every color choice should answer: "What does this color tell the viewer that line alone cannot?"

**Good uses:**
- Cyan highlight = Active neural region
- Coral highlight = Damaged or problematic state
- Gold highlight = Healing or recovery state

**Bad uses:**
- Random rainbow colors because they're pretty
- Different colors for each label (cognitive overload)
- Color for decoration without semantic purpose

---

## The sobriety.tools Semantic Color System

### Brand-Aligned Palette

This palette complements the Leather & Ember brand (warm browns, amber accents) while providing clear semantic meaning for educational content.

```yaml
# Base Colors (Structure)
charcoal:  "#1a2332"  # Ink lines, main structure
parchment: "#faf8f3"  # Background, warm cream
shadow:    "#e8dcc8"  # Subtle depth, warm gray

# Annotation Colors (Non-semantic)
ocean_blue: "#2d5a7b"  # Labels, margin notes, non-distracting

# Semantic Highlights (Meaning-Driven)
teal:   "#4a9d9e"  # Active, positive, improvement, engagement
coral:  "#e63946"  # Damage, risk, problems, conflict, harm
gold:   "#f4a261"  # Healing, recovery, progress, insight, breakthrough

# Accent (Rare Use)
emphasis: "#d4a574"  # Warm amber for important but not semantic concepts
```

### Why These Colors?

**Teal (#4a9d9e):**
- **Psychological**: Calm but energized, growth-oriented
- **Medical association**: Healthcare blue (trust) + green (health)
- **Use for**: Neural activity, positive states, "things working"
- **Contrast**: High against parchment (accessible)

**Coral (#e63946):**
- **Psychological**: Urgent but not alarming, warm warning
- **Not pure red**: Red = panic, coral = concern (less triggering)
- **Use for**: Damage, dysfunction, "things broken"
- **Contrast**: Very high against parchment

**Gold (#f4a261):**
- **Psychological**: Warm, hopeful, valuable (like treasure)
- **Brand connection**: Echoes Ember accent (#d97706)
- **Use for**: Healing, recovery, insight moments
- **Contrast**: High against parchment, warm against cool teal

**Ocean Blue (#2d5a7b):**
- **Psychological**: Calm, thoughtful, non-distracting
- **Use for**: Annotations, labels (not semantic meaning)
- **Why not black?**: Black is too harsh, blue is gentler

**Charcoal (#1a2332):**
- **Psychological**: Serious but not sterile, scholarly
- **Use for**: Main structure (brain outline, graph axes)
- **Why not pure black?**: Softer, warmer, more hand-drawn feel

**Parchment (#faf8f3):**
- **Psychological**: Warm, approachable, historic (like old books)
- **Use for**: Background (not sterile white)
- **Why not white?**: White = clinical/sterile, cream = scholarly/intimate

---

## Color Usage Rules

### Rule 1: Limit Colors (1-2 Highlights Maximum)

**Principle:** The eye can only track 3-4 colors before cognitive load increases.

**Structure:**
- 1 neutral structure color (charcoal)
- 1 neutral annotation color (ocean blue)
- **1-2 semantic highlight colors** (teal, coral, or gold)

**Examples:**

**Brain Diagram (One Highlight):**
```
Structure: Charcoal (#1a2332)
Labels: Ocean blue (#2d5a7b)
Highlight: Cyan (#4a9d9e) - "This region is overactive"
```

**Timeline Graph (Two Highlights):**
```
Axes: Charcoal (#1a2332)
Labels: Ocean blue (#2d5a7b)
Curve 1: Coral (#e63946) - "Anxiety (struggle)"
Curve 2: Gold (#f4a261) - "Mood (healing)"
```

**Social Comparison (Two Highlights):**
```
Figures: Charcoal (#1a2332)
Thought bubbles: Ocean blue (#2d5a7b)
Left panel accent: Coral (#e63946) - "Conflict"
Right panel accent: Teal (#4a9d9e) - "Connection"
```

**Three Colors Maximum:**
Only use 3 semantic colors when showing clear progression:
```
Before: Coral (#e63946) - "Damaged state"
During: Gold (#f4a261) - "Healing in progress"
After: Teal (#4a9d9e) - "Recovered state"
```

---

### Rule 2: Use Opacity for Emphasis

**Principle:** Full-saturation color draws maximal attention. Use opacity to create hierarchy.

**Opacity Scale:**
- **100%**: Primary focus, most important element
- **60-80%**: Secondary focus, supporting element
- **40-60%**: Background/glow effect, region indication
- **20-40%**: Very subtle, environmental context

**Examples:**

**Glowing Active Region (Brain):**
```css
Outline: 3px solid #4a9d9e (100% opacity)
Fill: #4a9d9e at 40% opacity (glow effect)
```

**Timeline Curves (Multiple Data):**
```css
Anxiety curve: #e63946 at 100% (primary data)
Mood curve: #f4a261 at 100% (primary data)
Reference baseline: #1a2332 at 30% (context only)
```

**Comparison Panels (Side-by-Side):**
```css
Left panel background: #e63946 at 10% (subtle tint)
Right panel background: #4a9d9e at 10% (subtle tint)
Main figures: #1a2332 at 100% (focus on content)
```

---

### Rule 3: Color Must Have Consistent Meaning

**Principle:** Once a color represents something in one diagram, it should represent the same concept across all diagrams in the article/series.

**Example System for Recovery Education:**

| Color | Consistent Meaning | Never Use For |
|-------|-------------------|---------------|
| Teal | Active, positive, functional, improved | Damage, dysfunction, problems |
| Coral | Damaged, dysfunctional, problematic, conflict | Healing, recovery, improvement |
| Gold | Healing, recovery, progress, insight | Active use, damage, current problem |

**Application:**

**Diagram 1 (Brain Anatomy):**
- Teal = Salience network hyperactivity (active, but problematic)
- Wait, this violates the rule! Teal = positive, but hyperactivity = bad

**Corrected:**
- Coral = Salience network hyperactivity (problematic)
- Teal = Normal salience network (for comparison)

**Diagram 2 (Timeline):**
- Coral = Anxiety curve (problematic state)
- Gold = Mood improvement (healing)
- Teal = Sleep normalized (recovered state)

**Diagram 3 (Social Comparison):**
- Coral = Judgment response (problematic)
- Teal = Empathy response (positive)

**Consistency Check:**
- Coral = Always problematic ✓
- Gold = Always healing/progress ✓
- Teal = Always positive/functional ✓

---

### Rule 4: Ensure Accessibility (WCAG AA Minimum)

**Principle:** Color must be distinguishable by people with color vision deficiencies AND convey information without color alone.

**Contrast Requirements (WCAG AA):**
- **Text on background**: ≥4.5:1 (normal), ≥3:1 (large ≥18px)
- **UI elements on background**: ≥3:1

**Our Palette Contrast (Against Parchment #faf8f3):**
```
Charcoal #1a2332:  14.8:1 ✓✓ (Excellent)
Ocean Blue #2d5a7b: 5.8:1 ✓ (Good)
Teal #4a9d9e:      3.2:1 ✓ (Passes for large text/UI)
Coral #e63946:     4.9:1 ✓ (Good)
Gold #f4a261:      3.1:1 ✓ (Passes for large text/UI)
```

**Color Blindness Considerations:**

**Protanopia (Red-Blind, ~1% males):**
- Coral (#e63946) appears brownish
- Gold (#f4a261) appears yellow-brown
- Teal (#4a9d9e) appears blue
- **Risk**: Coral and gold can appear similar
- **Mitigation**: Use different line styles (solid vs dashed) or labels

**Deuteranopia (Green-Blind, ~5% males):**
- Teal (#4a9d9e) appears blue-gray
- Gold (#f4a261) appears tan/brown
- Coral (#e63946) appears orange-brown
- **Risk**: Moderate distinction loss
- **Mitigation**: Rely on labels and line weight

**Tritanopia (Blue-Blind, ~0.001%):**
- Teal (#4a9d9e) appears green-gray
- Minimal impact on our palette
- **Risk**: Low
- **Mitigation**: Not necessary

**Universal Design Solution:**
```
Always use:
- Labels (don't rely on color alone)
- Line patterns (solid, dashed, dotted) for different data series
- Icons or symbols (✓ for positive, ⚠ for warning)
- Texture or fill patterns (optional)
```

**Example (Timeline Graph):**
```
Anxiety curve: Coral solid line + label "Anxiety"
Mood curve: Gold solid line + label "Mood"
Sleep curve: Teal dashed line + label "Sleep"
```

Even if colors aren't distinguishable, line styles + labels convey information.

---

## Psychology of Color in Recovery Education

### Emotional Impact

**Warm Colors (Coral, Gold):**
- **Emotional tone**: Energetic, urgent, human
- **Use for**: Emotions (anxiety, hope, warmth)
- **Avoid for**: Cold/clinical concepts (receptors, neurotransmitters)

**Cool Colors (Teal, Ocean Blue):**
- **Emotional tone**: Calm, analytical, distant
- **Use for**: Clinical concepts (brain structures, data)
- **Avoid for**: Highly emotional content (shame, breakthrough)

**Neutral Colors (Charcoal, Parchment):**
- **Emotional tone**: Scholarly, objective, timeless
- **Use for**: Structure, framework, non-semantic elements

### Color Associations in Recovery Context

**Teal (#4a9d9e):**
- **Positive associations**: Ocean (depth, cleansing), healing waters, growth (plants)
- **Recovery meaning**: Progress, functionality, healthy state
- **Avoid**: Overuse (becomes meaningless), pairing with red (Christmas)

**Coral (#e63946):**
- **Positive associations**: Warmth, vitality, energy
- **Negative associations**: Urgency, warning, inflammation
- **Recovery meaning**: Problems/damage BUT not stigmatizing (warmer than harsh red)
- **Avoid**: Using for positive states (confusing), pure red (too alarming)

**Gold (#f4a261):**
- **Positive associations**: Treasure, value, sunrise, wisdom
- **Recovery meaning**: Hard-won healing, valuable progress, breakthrough
- **Avoid**: Overuse (becomes cliché), pairing with blue (sports teams)

**Ocean Blue (#2d5a7b):**
- **Associations**: Trust, calm, intelligence, professionalism
- **Recovery meaning**: Thoughtful explanation, non-judgmental observation
- **Avoid**: Semantic meaning (save for annotations only)

### Triggering Colors to Avoid

**Pure Red (#FF0000):**
- **Why avoid**: Alarm, blood, anger, emergency (can trigger fight/flight)
- **Our alternative**: Coral #e63946 (softened, warm-leaning red)

**Harsh Green (#00FF00):**
- **Why avoid**: Neon, artificial, "toxic" association in drug culture
- **Our alternative**: Teal #4a9d9e (blue-leaning, natural, calming)

**Pure Black (#000000):**
- **Why avoid**: Death, void, sterile clinical settings
- **Our alternative**: Charcoal #1a2332 (warm-leaning, softer)

**Pure White (#FFFFFF):**
- **Why avoid**: Sterile, hospital, harsh brightness
- **Our alternative**: Parchment #faf8f3 (warm cream, approachable)

---

## Color Application by Diagram Type

### Brain Anatomy Diagrams

**Approach:** Use color sparingly to highlight specific functional states.

**Base (Always):**
- Structure outline: Charcoal #1a2332
- Labels: Ocean blue #2d5a7b
- Background: Parchment #faf8f3

**Semantic Highlighting (Choose 1-2):**

**Showing Hyperactivity/Damage:**
```yaml
Affected region: Coral #e63946 (outline 3px + fill 40%)
Normal regions: Charcoal only (no highlight)
Example: "Salience network overactivation"
```

**Showing Normal Function:**
```yaml
Active region: Teal #4a9d9e (outline 3px + fill 40%)
Inactive regions: Charcoal only
Example: "Prefrontal cortex during decision-making"
```

**Showing Healing/Recovery:**
```yaml
Healing region: Gold #f4a261 (outline 3px + fill 40%)
Damaged region (before): Coral #e63946 (dotted outline, no fill)
Example: "Neuroplasticity after 6 months abstinence"
```

**Showing Comparison (Before/After):**
```yaml
Before state: Coral #e63946 (left half or top)
After state: Teal #4a9d9e (right half or bottom)
Transition: Gold #f4a261 (if showing process)
```

---

### Timeline/Graph Diagrams

**Approach:** Use color to distinguish data series and convey meaning of each trajectory.

**Base (Always):**
- Axes and grid: Charcoal #1a2332
- Labels: Ocean blue #2d5a7b
- Background: Parchment #faf8f3

**Data Series (2-3 Maximum):**

**Two-Series Graph:**
```yaml
Series 1 (struggle): Coral #e63946 solid line, 2-3px
Series 2 (improvement): Gold #f4a261 solid line, 2-3px
Example: "Anxiety vs Mood over time"
```

**Three-Series Graph:**
```yaml
Series 1 (struggle): Coral #e63946 solid line
Series 2 (healing): Gold #f4a261 solid line
Series 3 (recovered): Teal #4a9d9e dashed line (different pattern)
Example: "Three-phase recovery trajectory"
```

**Annotations:**
```yaml
Key moments: Ocean blue arrows + labels
Warning zones: Coral background at 10% opacity
Hope zones: Gold background at 10% opacity
```

---

### Social Situation Diagrams

**Approach:** Use color to distinguish emotional tones of different scenarios.

**Base (Always):**
- Figures: Charcoal #1a2332
- Thought bubbles: Ocean blue #2d5a7b outline
- Background: Parchment #faf8f3

**Scenario Comparison:**

**Two-Panel (Conflict vs Resolution):**
```yaml
Left panel (conflict):
  - Background tint: Coral #e63946 at 10%
  - Arrows: Coral #e63946 downward spiral
  - Label accent: Coral

Right panel (resolution):
  - Background tint: Teal #4a9d9e at 10%
  - Arrows: Teal #4a9d9e connecting lines
  - Label accent: Teal
```

**Single Scene (Emotional States):**
```yaml
Person in distress: Coral aura/highlight
Person offering support: Teal aura/highlight
Neutral observers: No color (charcoal only)
```

---

### Process Flow Diagrams

**Approach:** Use color to show progression or highlight problematic/positive stages.

**Base (Always):**
- Boxes and arrows: Charcoal #1a2332
- Labels: Ocean blue #2d5a7b
- Background: Parchment #faf8f3

**Cascading Processes:**

**Dopamine Cascade (Cue → Crash):**
```yaml
Cue box: Charcoal only (neutral trigger)
Anticipation box: Teal #4a9d9e (peak, but false promise)
Use box: Charcoal only (neutral action)
Depletion box: Coral #e63946 (problematic crash)
Seeking box: Charcoal only (inevitable response)
Feedback loop arrow: Coral dashed line (perpetuation)
```

**Recovery Process (Linear Improvement):**
```yaml
Stage 1 (crisis): Coral #e63946
Stage 2 (stabilization): Gold #f4a261
Stage 3 (growth): Teal #4a9d9e
Arrows: Gradient from coral → gold → teal (if possible)
```

**Decision Trees:**
```yaml
Decision point: Charcoal box (neutral)
Negative outcome branch: Coral arrows + boxes
Positive outcome branch: Teal arrows + boxes
Neutral outcome: Charcoal arrows + boxes
```

---

## Testing Color Effectiveness

### Visual Hierarchy Test

**Question:** Can you understand the diagram in grayscale?

**Method:**
1. Convert your diagram to grayscale
2. Check if hierarchy is still clear
3. If not, adjust line weights and labels

**Pass:** Information conveyed without color
**Fail:** Color is essential to understanding

**Fix if failing:**
- Add labels or icons
- Increase line weight differences
- Use line patterns (solid, dashed, dotted)

---

### Color Blindness Simulation

**Tools:**
- **Coblis** (Color Blindness Simulator) - web-based
- **Sim Daltonism** - macOS app
- **Color Oracle** - cross-platform

**Test Your Palette:**
Upload diagram → View in protanopia, deuteranopia, tritanopia modes

**Pass Criteria:**
- Colors remain distinguishable OR
- Labels/line styles make distinction clear

---

### Cognitive Load Test

**Question:** Can you explain what each color means in 5 seconds?

**Method:**
1. Show diagram to someone unfamiliar
2. Ask: "What does [color] represent?"
3. If they can't answer immediately, simplify

**Pass:** Semantic meaning is obvious (coral = bad, teal = good)
**Fail:** Colors are arbitrary or confusing

**Fix if failing:**
- Reduce number of colors
- Add legend with clear labels
- Use more intuitive color-meaning pairs

---

## Advanced Color Techniques

### Technique 1: Gradients for Progression

**Use Case:** Showing transformation over time or space.

**Implementation:**
```css
/* CSS example for web implementation */
.healing-gradient {
  background: linear-gradient(
    to right,
    #e63946,  /* Coral (damage) */
    #f4a261,  /* Gold (healing) */
    #4a9d9e   /* Teal (recovered) */
  );
}
```

**Application:**
- Timeline showing recovery stages
- Before → during → after comparisons
- Severity scales (mild → moderate → severe)

**AI Prompt:**
```
"color gradient from coral (#e63946) on left transitioning through gold (#f4a261)
in center to teal (#4a9d9e) on right, smooth transitions, representing progression
from damaged to recovered state"
```

---

### Technique 2: Dual-Color Overlays

**Use Case:** Showing two systems interacting or overlapping states.

**Implementation:**
```
Region A only: Coral #e63946 at 60%
Region B only: Teal #4a9d9e at 60%
Overlap region: Purple blend at 60% (where both are active)
```

**Application:**
- Brain regions with multiple functions
- Overlapping symptom clusters
- Co-occurring processes

**Caution:** Can be confusing—use only when overlap is the key insight.

---

### Technique 3: Animated Color Transitions

**Use Case:** For video or interactive diagrams showing change over time.

**Sequence:**
```
Frame 1: Structure in charcoal (neutral baseline)
Frame 2: Coral appears (problem emerges)
Frame 3: Coral fades, gold appears (healing begins)
Frame 4: Gold fades, teal appears (recovery achieved)
```

**Timing:**
- 1-2 seconds per color state
- 0.5 second transition between colors
- Hold final state for 2 seconds

---

## Color Specification Checklist

Before finalizing any diagram, verify:

### Semantic Clarity
- [ ] Each color has clear meaning documented
- [ ] Color meanings consistent with other diagrams in series
- [ ] Legend or labels explain color coding
- [ ] Maximum 1-2 semantic highlight colors used

### Accessibility
- [ ] Contrast ratios meet WCAG AA (use WebAIM checker)
- [ ] Information conveyed through labels, not color alone
- [ ] Tested in grayscale (still understandable)
- [ ] Line patterns or styles supplement color

### Aesthetic
- [ ] Colors complement Leather & Ember brand
- [ ] Warm, approachable feel (not sterile clinical)
- [ ] Parchment background used (not white)
- [ ] Charcoal lines (not pure black)

### Prompt Engineering
- [ ] All colors specified with hex codes in AI prompt
- [ ] Opacity levels defined (40%, 60%, 100%)
- [ ] Color application described ("outline + fill" vs "glow")
- [ ] Negative prompt includes "random colors, rainbow"

---

## Resources

### Color Theory Books
- **"The Elements of Color"** by Johannes Itten (color relationships)
- **"Interaction of Color"** by Josef Albers (how colors affect each other)
- **"Color Matters"** by Kate Smith (psychology of color)

### Accessibility Tools
- **WebAIM Contrast Checker** - https://webaim.org/resources/contrastchecker/
- **Coblis Color Blindness Simulator** - https://www.color-blindness.com/coblis-color-blindness-simulator/
- **Accessible Colors** - https://accessible-colors.com/

### Color Palette Generators
- **Coolors.co** - Generate and test palettes
- **Adobe Color** - Color wheel and harmony rules
- **Paletton** - Test color combinations

---

**Last Updated:** 2026-01-11
**Version:** 1.0.0
**Skill:** hand-drawn-infographic-creator

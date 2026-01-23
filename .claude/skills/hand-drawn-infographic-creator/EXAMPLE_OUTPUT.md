# Example Outputs: Hand-Drawn Infographic Creator

This document shows complete outputs for each diagram type the skill generates.

---

## Example 1: Brain Anatomy Diagram

**User Request:** "Create a diagram explaining why meth causes paranoia"

### Skill Output

#### Concept Analysis
**What:** Salience network (ACC + insula) hyperactivity during methamphetamine use
**Why:** Explains paranoia as neurological symptom, not character flaw
**Audience:** Recovering people + loved ones + educators

**Educational Goal:** Help people understand that meth-induced paranoia is a predictable drug effect on the brain's pattern-detection system, not a sign of personal weakness or mental illness.

---

#### Firecrawl Reference Search

**Query 1:** `"brain anatomy sketch sagittal section hand-drawn"`
- Purpose: Find compositional reference for brain structure
- Filters: Include ["sketch", "anatomy", "line art"], Exclude ["photograph", "3D"]

**Query 2:** `"leonardo da vinci anatomical drawings nervous system"`
- Purpose: Capture continuous line art technique
- Filters: Include ["renaissance", "anatomical", "drawing"], Exclude ["modern", "digital"]

**Query 3:** `"anterior cingulate cortex insula diagram educational"`
- Purpose: Understand standard labeling conventions
- Filters: Include ["diagram", "labeled", "educational"], Exclude ["textbook", "commercial"]

---

#### AI Generation Prompt

**Positive Prompt:**
```
Sagittal section of human brain viewed from left side, continuous line art style,
ink on cream parchment paper background (#faf8f3), charcoal ink lines (#1a2332),
anterior cingulate cortex and insula regions highlighted with cyan glow
(#4a9d9e at 40% opacity), margin annotations on right side in ocean blue ink
(#2d5a7b), scale bar showing 5cm at bottom right, Leonardo da Vinci anatomical
study aesthetic, engineer's notebook with handwritten notes, educational medical
illustration, hand-drawn, organic line variation, slight imperfections in lines
```

**Negative Prompt:**
```
photorealistic, 3D render, CGI, stock medical photo, modern clinical design,
smooth gradients, digital art, commercial aesthetic, sterile hospital imagery,
printed textbook, computer-generated, airbrush, realistic shading
```

**Technical Settings:**
- Aspect ratio: 16:9
- Resolution: 1280x720px
- CFG scale: 8
- Steps: 35
- Sampler: DPM++ 2M Karras
- Seed: (random for variation)

---

#### Layout Specifications

```
┌─────────────────────────────────────────────────────────────────┐
│ SALIENCE NETWORK OVERACTIVATION                                 │
│ Why Methamphetamine Causes Paranoia                             │
├────────────────────────────────────┬────────────────────────────┤
│                                    │ MARGIN NOTES:              │
│                                    │                            │
│        ╭─────────────╮             │ • Salience Network:        │
│       /               \            │   The Brain's Pattern      │
│      /    ●  ACC       \           │   Detector                 │
│     │      ▓▓▓          │          │                            │
│     │     ▓▓▓▓          │          │ • ACC + Insula =           │
│     │    ▓▓▓▓▓          │          │   Decides what's           │
│     │   ●  Insula       │          │   important                │
│     │    (inside fold)  │          │                            │
│      \                 /           │ • Normally filters:        │
│       \   ● Amygdala  /            │   Friend vs Threat         │
│        ╰─────────────╯             │                            │
│                                    │ • On meth:                 │
│         ● = Labeled structure      │   EVERYTHING = potential   │
│         ▓ = Cyan glow (active)     │   threat                   │
│                                    │                            │
│                                    │ • Result:                  │
│                                    │   Hypervigilance,          │
│                                    │   Paranoia                 │
├────────────────────────────────────┴────────────────────────────┤
│ KEY TAKEAWAY: Paranoia is pattern detector gone haywire         │
│ Scale: ├─────┤ 5 cm                                             │
└─────────────────────────────────────────────────────────────────┘
```

**Element Positions:**
- **Title** (top 15%): "Salience Network Overactivation" (24px, charcoal)
- **Subtitle**: "Why Methamphetamine Causes Paranoia" (18px, charcoal)
- **Brain structure** (center-left, 60%): Sagittal section profile
- **Labels** (pointing to structures):
  - "Anterior Cingulate Cortex (ACC)" → points to ACC (ocean blue, 16px)
  - "Insula (within lateral sulcus)" → points inward (ocean blue, 16px)
  - "Amygdala" → points to lower region (ocean blue, 16px)
- **Margin notes** (right 20%): Bulleted list in handwriting font (12px, ocean blue)
- **Scale bar** (bottom right): "5 cm" with hand-drawn bar

---

#### Color Coding

| Element | Hex Code | Meaning | Opacity |
|---------|----------|---------|---------|
| Base lines | `#1a2332` | Main brain structure outline | 100% |
| Cyan glow | `#4a9d9e` | Hyperactive regions (ACC, insula) | 40% |
| Annotations | `#2d5a7b` | Labels, margin notes | 100% |
| Background | `#faf8f3` | Parchment paper | 100% |

**Why These Colors:**
- **Cyan glow**: Represents neural hyperactivity (too much signal)
- **Charcoal base**: Scientific notebook aesthetic
- **Ocean blue notes**: Non-distracting annotation color
- **Parchment background**: Warm, approachable (not sterile white)

---

#### Accessibility

**Alt Text (Short):**
```
Hand-drawn anatomical diagram of brain sagittal section showing the salience
network (anterior cingulate cortex and insula) highlighted in cyan glow, with
margin annotations explaining that this pattern-detection network becomes
hyperactive during methamphetamine use, causing the brain to interpret neutral
stimuli as threats, resulting in paranoia and hypervigilance
```

**Long Description (For Screen Readers):**
```
This hand-drawn brain diagram shows a side view (sagittal section) of the brain
with the salience network structures highlighted. The salience network consists
of the anterior cingulate cortex (ACC) and the insula, both shown with cyan
highlighting to indicate hyperactivity.

The diagram includes margin notes explaining that the salience network normally
acts as the brain's pattern detector, deciding what's important and filtering
friend from threat. During methamphetamine use, this system becomes overactive,
causing everything to be interpreted as a potential threat. This results in
hypervigilance and paranoia.

The visual style resembles Leonardo da Vinci's anatomical studies, with
continuous ink lines on parchment paper and handwritten annotations in the
margins. A scale bar at the bottom shows 5 centimeters for reference.
```

**Visual Hierarchy (Without Color):**
1. Title (largest, top)
2. Brain structure (boldest lines, center)
3. Labels (medium weight, connecting lines)
4. Margin notes (smallest, right column)
5. Scale bar (bottom, reference only)

---

#### Educational Context

**Why This Diagram Works:**
- **Destigmatizes**: Shows paranoia as brain mechanism, not character flaw
- **Specific**: Names exact structures (ACC, insula) for credibility
- **Accessible**: Hand-drawn style feels less intimidating than textbook
- **Actionable**: Understanding mechanism helps people recognize it as temporary
- **Empathy-building**: Partners/family understand "this is the drug, not them"

**Integration with Article:**
- Appears after text explanation of paranoia symptoms
- Before section on "What helps during paranoid episodes"
- References specific structures in surrounding text
- Alt text ensures non-visual users get full context

---

## Example 2: Timeline Graph

**User Request:** "Show how long PAWS symptoms last"

### Skill Output

#### Concept Analysis
**What:** Post-Acute Withdrawal Syndrome (PAWS) symptom progression over first year
**Why:** Prepare people for "The Wall" (weeks 4-8) while showing improvement trajectory
**Audience:** Newly recovering people + clinical staff + family

**Educational Goal:** Set realistic expectations for recovery timeline, especially the difficult early months, while providing hope through visible turning points.

---

#### Firecrawl Reference Search

**Query 1:** `"hand-drawn graph sketch notebook paper"`
- Purpose: Find hand-plotted graph examples
- Filters: Include ["sketch", "graph", "notebook"], Exclude ["digital", "Excel"]

**Query 2:** `"engineer's notebook timeline diagram annotations"`
- Purpose: Capture margin note style
- Filters: Include ["engineering", "notebook", "annotations"], Exclude ["printed"]

**Query 3:** `"whiteboard explanation sketch data visualization"`
- Purpose: Learn progressive disclosure style
- Filters: Include ["whiteboard", "sketch", "educational"], Exclude ["photo"]

---

#### AI Generation Prompt

**Positive Prompt:**
```
Hand-drawn graph on cream parchment paper (#faf8f3), horizontal time axis
labeled "Months in Recovery" with hand-drawn tick marks at 0, 2, 4, 6, 8, 10, 12,
vertical axis labeled "Symptom Intensity" (Low to High), three hand-sketched
curves: anxiety curve in coral red (#e63946 peaks at month 2 then gradual decline),
mood stability curve in gold (#f4a261 inverse U shape improves after month 6),
sleep quality curve in teal (#4a9d9e choppy start smooths around month 4),
annotations at key points "Week 4-8: The Wall" and "Month 6: Turning Point",
margin notes on right explaining each symptom, charcoal ink (#1a2332) for axes
and labels, engineer's notebook aesthetic, hand-plotted data points, educational
illustration, whiteboard sketch style, organic line variation
```

**Negative Prompt:**
```
photorealistic, Excel chart, digital graph software, corporate presentation,
sterile design, smooth gradients, printed graph paper, computer-generated plot,
PowerPoint graphic, stock chart imagery
```

**Technical Settings:**
- Aspect ratio: 16:9
- Resolution: 1280x720px
- CFG scale: 7
- Steps: 35
- Sampler: Euler a

---

#### Layout Specifications

```
┌──────────────────────────────────────────────────────────────────┐
│ PAWS RECOVERY TIMELINE: THE FIRST YEAR                           │
│ What to Expect & When It Gets Better                             │
├─────────────────────────────────────────┬────────────────────────┤
│                                         │ MARGIN NOTES:          │
│  Symptom                                │                        │
│  Intensity                              │ Anxiety:               │
│    ↑                                    │ Pattern detector       │
│    │     ╱╲                             │ still calibrating      │
│ Hi │    ╱ ◆╲    ◆─────◆───◆            │                        │
│    │   ╱   ╲  ╱           ╲◆           │ Mood:                  │
│    │  ╱     ╲╱              ╲          │ Dopamine receptors     │
│ Me │◆        ◆              ◆─◆        │ upregulating           │
│    │          ╲              ╱          │                        │
│    │           ╲  ●         ╱           │ Sleep:                 │
│ Lo │            ◆───●───●──●            │ First system to        │
│    └──┬───┬───┬───┬───┬───┬───         │ normalize              │
│       0   2   4   6   8   10  12       │                        │
│          Months in Recovery             │ NOTE: Timeline varies  │
│                                         │ by drug, duration,     │
│  ◆ Anxiety (coral)    ● Sleep (teal)   │ individual factors     │
│  ◆ Mood (gold)                          │                        │
│                                         │ These symptoms are     │
│  ↓ "Week 4-8: The Wall"                 │ HEALING, not failure   │
│    (Most people quit here—don't!)       │                        │
│                                         │                        │
│  ↓ "Month 6: Turning Point"             │                        │
│    (Brain rewiring becomes visible)     │                        │
├─────────────────────────────────────────┴────────────────────────┤
│ KEY TAKEAWAY: The worst of PAWS is weeks 4-8. If you make it    │
│ past "The Wall," recovery accelerates.                           │
└──────────────────────────────────────────────────────────────────┘
```

**Element Positions:**
- **Title** (top): "PAWS Recovery Timeline: The First Year" (24px, charcoal)
- **X-axis**: Hand-drawn with tick marks (0, 2, 4, 6, 8, 10, 12 months)
- **Y-axis**: "Symptom Intensity" (Low → High, relative scale only)
- **Legend** (bottom left): Symbols + colors for each curve
- **Annotations**: Arrows pointing to key moments on timeline
- **Margin notes** (right 20%): Explanations of each symptom trajectory

**Curve Specifications:**
1. **Anxiety/Irritability (Coral #e63946):**
   - Month 0: Moderate (50% height)
   - Month 2: Sharp peak (90% height) ← "The Wall"
   - Month 4-12: Gradual decline (ending ~30% height)

2. **Mood Stability (Gold #f4a261):**
   - Month 0-3: Low/unstable (20-30% height)
   - Month 4-6: Begins improving
   - Month 6: Inflection point ← "Turning Point"
   - Month 8-12: Steady improvement (ending ~70% height)

3. **Sleep Quality (Teal #4a9d9e):**
   - Month 0-2: Very choppy/erratic (30-60% variation)
   - Month 3: Begins smoothing
   - Month 4-8: Steady improvement
   - Month 9-12: Near baseline (70-80% height, smooth)

---

#### Color Coding

| Element | Hex Code | Meaning | Why This Color |
|---------|----------|---------|----------------|
| Anxiety curve | `#e63946` | Struggle, distress | Coral = discomfort, challenge |
| Mood curve | `#f4a261` | Healing process | Gold = recovery, progress |
| Sleep curve | `#4a9d9e` | Improvement, normalizing | Teal = positive change |
| Axes/labels | `#1a2332` | Structure | Charcoal = neutral framework |
| Annotations | `#2d5a7b` | Explanatory notes | Ocean blue = non-distracting |
| Background | `#faf8f3` | Paper | Parchment = warm, approachable |

**Color Strategy:**
- **Three curves, three colors**: Each color has semantic meaning
- **Coral for anxiety**: Conveys the difficulty (not alarming red, but warm coral)
- **Gold for mood**: Represents healing and progress (positive but not naive)
- **Teal for sleep**: Cool, calm color for restfulness

---

#### Accessibility

**Alt Text (Short):**
```
Hand-drawn timeline graph showing three symptom trajectories during first year
of recovery: anxiety in coral (peaks at 2 months called 'The Wall,' then declines),
mood stability in gold (improves significantly after 6-month 'Turning Point'),
and sleep quality in teal (choppy at first, normalizes around month 4), with
annotations explaining that weeks 4-8 are hardest and most who survive this
period see accelerating improvement
```

**Long Description (For Screen Readers):**
```
This hand-drawn graph shows Post-Acute Withdrawal Syndrome (PAWS) symptom
progression over the first 12 months of recovery. The horizontal axis shows
months (0 through 12), and the vertical axis shows relative symptom intensity
from Low to High.

Three curves track different symptoms:

1. Anxiety/Irritability (coral red curve): Starts moderate at month 0, peaks
sharply at month 2 (labeled "Week 4-8: The Wall" with note "Most people quit
here—don't!"), then gradually declines through month 12, though remains slightly
elevated.

2. Mood Stability (gold curve): Inverse of anxiety curve. Lowest at months 1-3,
begins improving at month 4, shows significant gains after month 6 (labeled
"Month 6: Turning Point" with note "Brain rewiring becomes visible"), nearly
normalized by month 12.

3. Sleep Quality (teal curve): Very choppy and erratic months 0-2, begins
smoothing at month 3, shows steady improvement months 4-8, near baseline by
month 9 with smooth line.

Margin notes explain: "Anxiety: Pattern detector still calibrating," "Mood:
Dopamine receptors upregulating," "Sleep: First system to normalize," and
"These symptoms are HEALING, not failure."

Key takeaway states: "The worst of PAWS is weeks 4-8. If you make it past
'The Wall,' recovery accelerates."
```

---

#### Educational Context

**Why This Diagram Works:**
- **Prepares for "The Wall"**: Shows the 4-8 week difficulty spike so people don't quit
- **Provides hope**: Visible improvement after month 6 "Turning Point"
- **Shows variability**: Sleep normalizes first, mood takes longer (sets expectations)
- **Validates experience**: "These symptoms are HEALING" reframes discomfort
- **Color reinforces meaning**: Coral = struggle, gold = healing, teal = improvement

**Integration with Article:**
- Follows explanation of what PAWS is
- Before section on "How to survive The Wall"
- Referenced in text: "Notice how anxiety peaks around week 6 (see graph)"
- Margin notes link to deeper explanations in article

---

## Example 3: Social Situation Comparison

**User Request:** "Show the difference between judgment and empathy when someone admits drug use"

### Skill Output

#### Concept Analysis
**What:** Two-panel comparison of partner/loved one responses to vulnerable disclosure
**Why:** Teach people what empathetic responses look like vs judgmental ones
**Audience:** Partners, family, friends, clinical staff

**Educational Goal:** Help loved ones understand how their response (judgment vs empathy) profoundly impacts the recovering person's willingness to be honest and seek help.

---

#### Firecrawl Reference Search

**Query 1:** `"storyboard gesture drawing simple figures body language"`
- Purpose: Find expressive but simple figure drawing
- Filters: Include ["storyboard", "gesture", "body language"], Exclude ["anime", "cartoon"]

**Query 2:** `"visual communication diagram thought bubbles"`
- Purpose: Learn thought bubble conventions
- Filters: Include ["communication", "thought bubble", "diagram"], Exclude ["comic book"]

**Query 3:** `"whiteboard explanation sketch interpersonal communication"`
- Purpose: Capture comparison layout style
- Filters: Include ["whiteboard", "comparison", "educational"], Exclude ["photo"]

---

#### AI Generation Prompt

**Positive Prompt:**
```
Two-panel storyboard comparison divided by vertical center line, left panel
shows conflict escalation with coral red accents (#e63946), right panel shows
de-escalation with teal accents (#4a9d9e), simple hand-drawn stick figures with
expressive body language gestures (no detailed faces), thought bubbles showing
internal dialogue in ocean blue (#2d5a7b), arrows indicating emotional flow,
parchment paper background (#faf8f3), charcoal ink lines (#1a2332), annotations
explaining each response pattern, educational illustration, whiteboard sketch
style, human connection focus
```

**Negative Prompt:**
```
photorealistic, detailed facial features, anime style, cartoon characters,
comic book art, commercial illustration, realistic people, stock imagery,
professional illustration
```

**Technical Settings:**
- Aspect ratio: 16:9
- Resolution: 1280x720px
- CFG scale: 8
- Steps: 35
- Sampler: DPM++ 2M Karras

---

#### Layout Specifications

```
┌────────────────────────────────────────────────────────────────┐
│ PARTNER RESPONSE: JUDGMENT vs EMPATHY                          │
│ How Your Reaction Shapes What Happens Next                     │
├──────────────────────────────┬─────────────────────────────────┤
│ WHEN MET WITH JUDGMENT       │ WHEN MET WITH EMPATHY           │
│                              │                                 │
│    ╭───────────────╮         │    ╭───────────────╮           │
│    │ "I'm broken"  │         │    │ "I can share  │           │
│    │ "I'll hide it"│         │    │  this"        │           │
│    ╰───────┬───────╯         │    ╰───────┬───────╯           │
│            │                 │            │                   │
│         ( •_• )              │         ( ·v· )                │
│         ╱  │  ╲              │         ╱  │  ╲                │
│        │   │   │ Slumped     │        │   │   │ Open         │
│         ╲     ╱  posture     │         ╲     ╱  posture      │
│                              │                                 │
│     ╭──────────╮             │     ╭──────────╮               │
│     │ "Why can't│            │     │ "This    │               │
│     │  you just │            │     │  sounds  │               │
│     │  STOP?"   │            │     │  really  │               │
│     ╰─────┬────╯             │     │  hard"   │               │
│           │                  │     ╰─────┬────╯               │
│        ( >_< )               │        ( ·o· )                 │
│        ╱ ─┼─ ╲ Arms          │        ╱  │  ╲ Leaning        │
│       │   │   │ crossed      │       ╱   │   ╲ forward       │
│        ╲     ╱               │      │    │    │               │
│                              │                                 │
│   ↓ Coral arrows             │   → Teal arrows                │
│   (emotional spiral down)    │   (emotional connection)        │
│                              │                                 │
│ ⚠ SHAME SPIRAL ACTIVATED     │ ✓ SAFETY ENABLES HONESTY       │
│                              │                                 │
│ • Withdrawal                 │ • Continued dialogue            │
│ • Hiding use                 │ • Truth-telling                 │
│ • Isolation                  │ • Problem-solving               │
│ • Escalation                 │ • Connection                    │
├──────────────────────────────┴─────────────────────────────────┤
│ KEY TAKEAWAY: Judgment activates shame spiral. Empathy         │
│ creates safety for honesty.                                    │
└────────────────────────────────────────────────────────────────┘
```

**Element Positions:**

**Left Panel (Judgment):**
- Person A (recovering): Slumped posture, thought bubble "I'm broken, I'll hide it"
- Person B (partner): Arms crossed, thought bubble "Why can't you just STOP?"
- Coral downward arrows showing emotional spiral
- Label: "⚠ SHAME SPIRAL ACTIVATED"
- Bullet list: Consequences (withdrawal, hiding, isolation, escalation)

**Right Panel (Empathy):**
- Person A: Open posture, thought bubble "I can share this"
- Person B: Leaning forward, thought bubble "This sounds really hard"
- Teal arrows showing bidirectional connection
- Label: "✓ SAFETY ENABLES HONESTY"
- Bullet list: Outcomes (dialogue, truth-telling, problem-solving, connection)

---

#### Color Coding

| Element | Hex Code | Meaning | Why This Color |
|---------|----------|---------|----------------|
| Left panel accent | `#e63946` | Conflict, shame, disconnection | Coral = tension, distress |
| Right panel accent | `#4a9d9e` | Connection, safety, empathy | Teal = calm, positive |
| Thought bubbles | `#2d5a7b` | Internal experience | Ocean blue = introspection |
| Figures | `#1a2332` | People (neutral) | Charcoal = non-judging base |
| Dividing line | `#e8dcc8` | Separation | Light gray = subtle boundary |
| Background | `#faf8f3` | Paper | Parchment = approachable |

**Color Strategy:**
- **Coral left, teal right**: Clear visual distinction between approaches
- **Arrows match meaning**: Coral downward spiral vs teal connecting lines
- **Thought bubbles neutral**: Focus on content, not the person's worth

---

#### Accessibility

**Alt Text (Short):**
```
Two-panel hand-drawn comparison showing partner responses to vulnerable drug
use disclosure: left panel shows judgmental response (crossed arms, "Why can't
you just stop?") activating shame spiral with person withdrawing; right panel
shows empathetic response (leaning forward, "This sounds really hard") creating
safety with person remaining open, thought bubbles and arrows illustrating
emotional dynamics
```

**Long Description (For Screen Readers):**
```
This two-panel storyboard comparison illustrates how different partner responses
to vulnerable disclosure about drug use shape outcomes.

Left Panel - "When Met With Judgment":
Person A (recovering) is shown in slumped posture with thought bubble reading
"I'm broken, I'll hide it." Person B (partner) has arms crossed with thought
bubble "Why can't you just STOP?" Coral red downward arrows indicate emotional
spiral. Label reads "SHAME SPIRAL ACTIVATED" with consequences listed:
withdrawal, hiding use, isolation, and escalation.

Right Panel - "When Met With Empathy":
Person A is shown in open posture with thought bubble "I can share this."
Person B is leaning forward with thought bubble "This sounds really hard."
Teal arrows show bidirectional emotional connection. Label reads "SAFETY
ENABLES HONESTY" with outcomes listed: continued dialogue, truth-telling,
problem-solving, and connection.

The figures are simple gesture drawings focusing on body language rather than
detailed faces. The visual style is whiteboard sketch aesthetic on parchment
paper.

Key takeaway: "Judgment activates shame spiral. Empathy creates safety for
honesty."
```

---

#### Educational Context

**Why This Diagram Works:**
- **Shows consequences**: Not just "be nice" but concrete outcomes (hiding vs honesty)
- **Body language**: Visual shows _how_ to respond (leaning forward, not crossed arms)
- **Thought bubbles**: Reveals internal experience invisible to partner
- **Color reinforcement**: Coral shame vs teal safety is visceral
- **Actionable**: Partners can practice the right-panel response

**Integration with Article:**
- Appears in section "How Loved Ones Can Help"
- Before list of empathetic response scripts
- Referenced: "Remember the two-panel diagram—your response creates the environment"
- Paired with reflection questions: "Which panel sounds like your past responses?"

---

## Example 4: Process Flow Diagram

**User Request:** "Explain how the dopamine cycle drives compulsive use"

### Skill Output

#### Concept Analysis
**What:** Dopamine cascade from cue → anticipation → use → crash → seeking loop
**Why:** Show addiction as neurological feedback loop, not moral failure
**Audience:** Recovering people, families, educators, clinical staff

**Educational Goal:** Help people understand compulsive use as driven by dopamine depletion crash (seeking relief from the crash, not seeking the high).

---

#### Firecrawl Reference Search

**Query 1:** `"hand-drawn flowchart process diagram notebook"`
- Purpose: Find organic flow chart style
- Filters: Include ["sketch", "flowchart", "process"], Exclude ["digital", "corporate"]

**Query 2:** `"whiteboard cascade diagram arrows sequence"`
- Purpose: Learn cascade visualization patterns
- Filters: Include ["whiteboard", "cascade", "sequence"], Exclude ["PowerPoint"]

**Query 3:** `"engineer's notebook causal diagram annotations"`
- Purpose: Capture causation visualization style
- Filters: Include ["engineering", "causation", "annotations"], Exclude ["textbook"]

---

#### AI Generation Prompt

**Positive Prompt:**
```
Vertical cascade flow diagram, hand-drawn flowchart style, top-to-bottom
sequence showing dopamine response cycle, parchment paper background (#faf8f3),
charcoal ink boxes and arrows (#1a2332), color progression from teal highlight
(#4a9d9e) at anticipation peak to coral highlight (#e63946) at crash, dashed
feedback loop arrow curving back to top, margin notes on right explaining
neurochemistry in ocean blue (#2d5a7b), engineer's notebook aesthetic with
annotations, educational illustration, whiteboard sketch style, hand-drawn boxes
with slight imperfection
```

**Negative Prompt:**
```
photorealistic, corporate flowchart, Microsoft Visio, clean digital diagram,
perfect vectors, smooth gradients, printed look, commercial design, sterile
business graphic
```

**Technical Settings:**
- Aspect ratio: 16:9
- Resolution: 1280x720px
- CFG scale: 7
- Steps: 35
- Sampler: Euler a

---

#### Layout Specifications

```
┌──────────────────────────────────────────────────────────────┐
│ DOPAMINE CASCADE: From Cue to Crash                          │
│ The Neurological Feedback Loop of Compulsive Use             │
├───────────────────────────────────────┬──────────────────────┤
│                                       │ MARGIN NOTES:        │
│       ┌─────────────────┐             │                      │
│       │  1. CUE          │             │ Cue:                 │
│       │ "See parapherna- │             │ Memory trigger       │
│       │  lia"            │             │ activates learned    │
│       └────────┬─────────┘             │ associations         │
│                │                       │                      │
│                ↓                       │                      │
│       ┌─────────────────┐              │ Anticipation:        │
│       │  2. ANTICIPATION│ ◄──[teal    │ Dopamine SPIKES      │
│       │ "Dopamine SPIKES"│    glow]   │ HIGHER than actual   │
│       │ (peak feeling)   │             │ use                  │
│       └────────┬─────────┘             │                      │
│                │                       │ "Wanting ≠ Liking"   │
│                ↓                       │                      │
│       ┌─────────────────┐              │                      │
│       │  3. USE          │             │ Use:                 │
│       │ "Actual          │             │ Brief satisfaction   │
│       │  consumption"    │             │ but LESS than        │
│       └────────┬─────────┘             │ anticipated          │
│                │                       │                      │
│                ↓                       │ Tolerance:           │
│       ┌─────────────────┐              │ Receptors down-      │
│       │  4. DEPLETION    │ ◄──[coral  │ regulate over time   │
│       │ "Crash BELOW     │    glow]   │                      │
│       │  baseline"       │             │ Crash:               │
│       └────────┬─────────┘             │ Dopamine drops       │
│                │                       │ BELOW normal         │
│                ↓                       │                      │
│       ┌─────────────────┐              │ Result:              │
│       │  5. SEEKING      │             │ Compulsive seeking   │
│       │ "Must escape     │             │ to escape crash,     │
│       │  crash feeling"  │             │ NOT for the high     │
│       └────────┬─────────┘             │                      │
│                │                       │                      │
│         ╭──────╯ [dashed feedback      │ Breaking the cycle:  │
│         │         loop back to top]    │ Time + support       │
│         ╰───────────────────►          │ = receptor healing   │
├───────────────────────────────────────┴──────────────────────┤
│ KEY TAKEAWAY: Compulsion is driven by crash (seeking relief),│
│ not by the high (seeking pleasure).                          │
└──────────────────────────────────────────────────────────────┘
```

**Element Positions:**
- **Flow (top to bottom):**
  1. CUE (neutral box)
  2. ↓ Arrow with label "Memory trigger"
  3. ANTICIPATION (teal glow box) - Peak dopamine
  4. ↓ Arrow with label "Craving intensifies"
  5. USE (neutral box) - Actual consumption
  6. ↓ Arrow with label "Dopamine crashes"
  7. DEPLETION (coral box) - Below baseline
  8. ↓ Arrow with label "Seek relief"
  9. SEEKING (neutral box)
  10. ↙ Dashed feedback arrow curves back to CUE

**Margin notes:**
- Explain each stage's neurochemistry
- "Anticipation > actual use" (key insight)
- "Tolerance = receptor downregulation"
- "Compulsion = escaping crash, not seeking high"

---

#### Color Coding

| Element | Hex Code | Meaning | Why This Color |
|---------|----------|---------|----------------|
| Base boxes | `#1a2332` | Neutral stages | Charcoal = objective |
| Anticipation box | `#4a9d9e` | Peak dopamine (teal glow) | Teal = false promise |
| Depletion box | `#e63946` | Crash state (coral glow) | Coral = distress |
| Feedback arrow | `#1a2332` | Loop perpetuation (dashed) | Charcoal = inevitable |
| Annotations | `#2d5a7b` | Explanatory notes | Ocean blue = clarity |
| Background | `#faf8f3` | Paper | Parchment = approachable |

**Color Strategy:**
- **Teal at peak**: Shows anticipation is the "high point" (not the use itself)
- **Coral at crash**: Visual visceral feeling of depletion
- **Neutral at use**: Suggests use is anticlimactic vs anticipation
- **Dashed feedback loop**: Shows inevitability of seeking relief

---

#### Accessibility

**Alt Text (Short):**
```
Hand-drawn vertical flow diagram showing dopamine cascade from cue to crash:
cue triggers anticipation (dopamine spike shown with teal highlight), leading
to use, then depletion (dopamine crash shown with coral highlight), followed
by seeking behavior, with dashed feedback loop arrow showing how crash drives
seeking more, margin notes explaining tolerance and receptor downregulation
```

**Long Description (For Screen Readers):**
```
This vertical cascade flow diagram illustrates the dopamine cycle that drives
compulsive substance use. Boxes are connected by downward arrows showing the
sequence:

1. CUE: "See paraphernalia" - Memory trigger activates learned associations
2. ANTICIPATION (teal highlight): "Dopamine SPIKES" - Peak feeling occurs HERE,
   not during use. Margin note: "Anticipation > actual use" and "Wanting ≠ Liking"
3. USE: "Actual consumption" - Brief satisfaction but LESS than anticipated
4. DEPLETION (coral highlight): "Crash BELOW baseline" - Dopamine drops below
   normal levels. Margin note: "Receptors downregulate over time" (tolerance)
5. SEEKING: "Must escape crash feeling" - Compulsive seeking to escape the
   crash, NOT for the high

A dashed feedback loop arrow curves from "Seeking" back up to "Cue," showing
the perpetual cycle.

Margin notes explain:
- "Anticipation: Dopamine SPIKES HIGHER than actual use"
- "Use: Brief satisfaction but LESS than anticipated"
- "Crash: Dopamine drops BELOW normal"
- "Result: Compulsive seeking to escape crash, NOT for the high"
- "Breaking the cycle: Time + support = receptor healing"

Key takeaway: "Compulsion is driven by crash (seeking relief), not by the
high (seeking pleasure)."
```

---

#### Educational Context

**Why This Diagram Works:**
- **Reframes compulsion**: Not seeking pleasure, but escaping crash (reduces shame)
- **Shows mechanism**: Dopamine spike at anticipation (not use) explains cravings
- **Visual feedback loop**: Dashed arrow makes cycle feel inevitable but breakable
- **Color enhances meaning**: Teal peak vs coral crash is emotionally resonant
- **Actionable insight**: Understanding crash mechanism helps people wait it out

**Integration with Article:**
- Appears after explaining dopamine's role in addiction
- Before section on "How to break the cycle"
- Referenced: "Remember the cascade diagram—you're escaping the crash, not chasing the high"
- Paired with exercises: "Next time you feel compulsion, identify which stage you're in"

---

## Workflow Demonstrated

Each example above shows the complete workflow:

1. ✅ **Concept Analysis** - What, why, audience, goal
2. ✅ **Firecrawl Reference Search** - 3 targeted queries with filters
3. ✅ **AI Generation Prompt** - Positive + negative + technical settings
4. ✅ **Layout Specifications** - ASCII mockup + detailed positioning
5. ✅ **Color Coding** - Table with hex codes, meanings, rationale
6. ✅ **Accessibility** - Short alt text + long description + visual hierarchy
7. ✅ **Educational Context** - Why it works + article integration

---

**Total Examples:** 4 (one per diagram type)
**Pages:** ~15 pages of comprehensive specifications
**Ready for:** AI generation, designer implementation, accessibility compliance

These examples can be adapted for any recovery education content by:
- Changing the subject matter (different brain regions, symptoms, situations)
- Adjusting color semantics (same palette, different meanings)
- Modifying layout proportions (more/less margin notes based on complexity)
- Scaling complexity (simple version for general audience, detailed for clinical)

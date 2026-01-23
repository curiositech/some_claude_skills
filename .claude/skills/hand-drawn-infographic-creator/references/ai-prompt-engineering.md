# AI Prompt Engineering for Hand-Drawn Infographics

**Purpose:** Best practices for generating hand-drawn style educational diagrams using Stable Diffusion, Flux, DALL-E, and similar AI image generators.

---

## Core Principles

### 1. Style Consistency is Everything

Your prompt must consistently reinforce the hand-drawn aesthetic throughout. AI models have strong biases toward photorealism and digital art—you must actively fight against these.

**Key Style Keywords (Always Include):**
- `continuous line art`
- `anatomical drawing style`
- `ink on parchment`
- `hand-drawn`
- `organic line variation`
- `slight imperfections in lines`
- `engineer's notebook aesthetic`
- `educational illustration`

**Style Reinforcers (Pick 2-3):**
- `Leonardo da Vinci anatomical study`
- `whiteboard sketch explanation`
- `medical illustration line art`
- `vintage scientific diagram`
- `Renaissance anatomical drawing`

### 2. Negative Prompts are Non-Negotiable

The negative prompt is as important as the positive prompt. Without it, you'll get photorealistic or overly-polished results.

**Critical Negative Keywords (Always Include):**
```
photorealistic, 3D render, CGI, stock photo, modern clinical aesthetic,
photograph, realistic lighting, gradient shading, airbrush, smooth digital art,
commercial healthcare aesthetic, corporate design, sterile hospital imagery,
printed textbook, computer-generated, perfect vectors
```

**Why These Work:**
- `photorealistic` - Prevents camera-like rendering
- `3D render` - Avoids depth-map shading
- `gradient shading` - Prevents smooth color transitions (we want flat colors + line)
- `sterile hospital imagery` - Avoids cold, clinical look
- `perfect vectors` - Allows organic line imperfection

### 3. Color Specification Must Be Explicit

AI models will invent colors if you don't specify hex codes. Our brand palette must be in the prompt.

**Format:**
```
parchment paper background (#faf8f3), charcoal ink lines (#1a2332),
cyan glow highlight (#4a9d9e at 40% opacity), ocean blue annotations (#2d5a7b)
```

**Why Hex Codes Matter:**
- Ensures brand consistency across all diagrams
- Prevents AI from choosing saturated/primary colors
- Maintains warm, scholarly palette

### 4. Layout Description Prevents Chaos

Without spatial instructions, AI will scatter elements randomly.

**Specify:**
- **Composition**: "sagittal brain section occupies center-left 60% of frame"
- **Annotations**: "margin notes on right side, 20% of frame width"
- **Scale**: "scale bar at bottom right showing 5cm"
- **Title placement**: "title at top in handwriting font"

**Example:**
```
Brain structure occupies center-left 60% of frame, margin annotations aligned
vertically on right side occupying 20% of frame, title at top center, scale
reference at bottom right corner
```

---

## Model-Specific Guidance

### Stable Diffusion (SDXL, SD 1.5)

**Best For:** Detailed anatomical diagrams, complex compositions

**Optimal Settings:**
```yaml
resolution: 1024x576 (16:9) or 1280x720
cfg_scale: 7-9 (moderate adherence)
steps: 30-40 (quality balance)
sampler: "DPM++ 2M Karras" (best for line art)
         or "Euler a" (faster, good for sketches)
clip_skip: 2 (allows more artistic interpretation)
```

**Prompt Tips:**
- Use ControlNet with Canny edge detection for precise anatomy
- Add `detailed linework, high contrast` for brain diagrams
- Use lower CFG (6-7) for more organic imperfection

**Example Prompt:**
```
Sagittal section of human brain, continuous line art, anatomical drawing style,
ink on cream parchment (#faf8f3), charcoal lines (#1a2332), anterior cingulate
cortex highlighted in cyan glow (#4a9d9e), margin notes in ocean blue (#2d5a7b),
Leonardo da Vinci study aesthetic, hand-drawn with organic variation, educational
medical illustration, scale bar 5cm bottom right

Negative: photorealistic, 3D render, stock photo, smooth shading, digital art
```

### Flux (Flux.1 Dev, Pro)

**Best For:** Timeline graphs, social situation diagrams (simpler compositions)

**Optimal Settings:**
```yaml
resolution: 1280x720 (16:9)
guidance_scale: 3.5-5 (Flux uses lower values)
steps: 20-30 (Flux is efficient)
```

**Prompt Tips:**
- Flux follows instructions well—be specific about layout
- Use natural language: "divide frame vertically into two equal panels"
- Emphasize `hand-drawn imperfection` (Flux can be too clean)

**Example Prompt:**
```
Two-panel comparison divided by vertical center line, left panel shows conflict
(coral accents #e63946), right panel shows connection (teal accents #4a9d9e),
simple stick figures with gesture drawing style, thought bubbles in ocean blue
(#2d5a7b), parchment background (#faf8f3), charcoal ink (#1a2332), whiteboard
sketch aesthetic, educational illustration, hand-drawn with slight imperfections

Negative: photorealistic, detailed faces, anime, cartoon, stock imagery
```

### DALL-E 3 (via API or ChatGPT)

**Best For:** Quick prototypes, process flow diagrams

**Limitations:**
- Cannot specify hex codes directly (describe colors instead)
- Tends toward clean/polished—must strongly emphasize "sketchy, imperfect"
- 1024x1024 or 1792x1024 only (less flexible aspect ratios)

**Prompt Tips:**
- Use descriptive color names: "warm cream background, dark charcoal lines"
- Emphasize: `hand-drawn sketch, visible imperfections, notebook aesthetic`
- Avoid technical jargon—DALL-E prefers natural language

**Example Prompt:**
```
A hand-drawn vertical flowchart on cream parchment paper showing a dopamine cycle
cascade, with five boxes connected by downward arrows, charcoal ink lines with
visible imperfections, second box highlighted in teal glow (neural activity peak),
fourth box highlighted in coral (crash state), margin notes on right side in blue
ink, engineer's notebook style with annotations, whiteboard sketch aesthetic,
educational illustration, organic line variation

Negative: photorealistic, 3D, digital art, smooth gradients, corporate design
```

### Midjourney (v6, Niji)

**Best For:** Expressive social situation diagrams, metaphorical concepts

**Optimal Settings:**
```
--ar 16:9 (aspect ratio)
--s 50-150 (stylization, lower = more literal)
--c 20-40 (chaos/variation, lower = more consistent)
--style raw (reduces Midjourney's default polish)
```

**Prompt Tips:**
- Use `--style raw` to reduce over-rendering
- Midjourney loves detail—must emphasize `simple, minimal, sketch`
- Use image references (`/blend` or image URLs) for consistent style

**Example Prompt:**
```
hand-drawn brain anatomy diagram, sagittal section, continuous ink lines on
parchment paper, charcoal and cyan highlights, Leonardo da Vinci anatomical
study, margin annotations in blue ink, educational illustration, engineer's
notebook aesthetic, simple line art, organic imperfections --ar 16:9 --s 100
--style raw

Negative: photorealistic, 3D render, hyper-detailed, digital art, smooth
```

---

## Advanced Techniques

### ControlNet for Anatomical Accuracy

When generating brain diagrams, use ControlNet with reference anatomy to maintain scientific accuracy while preserving hand-drawn style.

**Workflow:**
1. Find anatomical reference image (e.g., gray's anatomy illustration)
2. Run Canny edge detection or line art extraction
3. Use as ControlNet input with weight 0.6-0.8
4. Add hand-drawn style prompt as usual

**ControlNet Settings:**
```yaml
preprocessor: "canny" or "lineart"
control_weight: 0.6-0.8 (moderate influence)
starting_control_step: 0 (full control from start)
ending_control_step: 0.8 (release before final details)
```

**Why This Works:**
- Ensures ACC, insula, amygdala are in correct positions
- Preserves structural accuracy while allowing stylistic interpretation
- Prevents AI from inventing incorrect brain structures

### Multi-Model Pipeline

For highest quality, use a pipeline approach:

**Step 1: Structure Generation (Stable Diffusion + ControlNet)**
- Generate accurate anatomical structure with ControlNet
- Focus on getting positions and proportions correct
- Don't worry about perfect style yet

**Step 2: Style Refinement (Img2Img with Low Denoising)**
- Take Step 1 output as input
- Img2Img with denoising 0.3-0.5
- Strong hand-drawn style prompt
- Adds organic line variation and parchment texture

**Step 3: Annotation Addition (Post-processing or Img2Img)**
- Add text annotations via image editing or
- Use img2img inpainting to add margin notes region
- Ensures text is readable and properly positioned

### Prompt Weights for Fine Control

Some models (SD, ComfyUI) support prompt weights:

**Syntax:** `(keyword:weight)` where weight is 0.5-1.5

**Example:**
```
(continuous line art:1.3), (anatomical drawing:1.2), brain sagittal section,
(ink on parchment:1.1), charcoal lines, cyan highlights, margin notes,
(Leonardo da Vinci style:1.2), (hand-drawn imperfections:1.4), educational

Negative: (photorealistic:1.4), (3D render:1.3), (smooth gradients:1.2)
```

**Strategic Weighting:**
- Boost `hand-drawn imperfections:1.4` to fight AI's polish bias
- Boost `Leonardo da Vinci style:1.2` for authentic historical look
- Boost negative `photorealistic:1.4` to strongly avoid realism

---

## Common Failure Modes & Fixes

### Problem 1: Output Looks Too Digital/Clean

**Symptoms:** Perfect lines, no variation, looks like vector art

**Fixes:**
- Add to prompt: `visible pen strokes, organic line variation, slight wobble in lines`
- Increase negative weight: `(smooth digital art:1.4), (perfect vectors:1.3)`
- Lower CFG scale to 6-7 (allows more variation)
- Use `--style raw` in Midjourney

### Problem 2: Colors Are Too Saturated/Wrong

**Symptoms:** Bright primaries instead of muted earth tones

**Fixes:**
- Include hex codes explicitly: `(#faf8f3:1.2), (#1a2332:1.2)`
- Add to negative: `bright colors, saturated, primary colors, neon`
- Add to positive: `muted earth tones, desaturated, vintage ink colors`

### Problem 3: Composition is Chaotic

**Symptoms:** Brain structure too small, annotations everywhere, no layout

**Fixes:**
- Specify percentages: `brain occupies 60% of frame, centered left`
- Use spatial language: `margin notes aligned vertically on right side`
- Add to prompt: `organized composition, clear layout, structured design`
- Consider using ControlNet with layout sketch

### Problem 4: Text/Annotations Are Garbled

**Symptoms:** Illegible text, nonsense letters, distorted annotations

**Fixes:**
- Don't generate text directly—add in post-processing instead
- Use inpainting to add text regions after main generation
- Or embrace illegible "notebook scribbles" as aesthetic (if not critical)
- For AI-generated text, use `legible handwriting, clear labels`

### Problem 5: Looks Like Stock Medical Illustration

**Symptoms:** Too polished, sterile, textbook-like, cold color palette

**Fixes:**
- Strengthen negative: `(textbook illustration:1.4), (medical stock photo:1.3)`
- Add warmth: `warm parchment tones, intimate scholarly aesthetic`
- Emphasize imperfection: `(engineer's personal notebook:1.3), work-in-progress feel`
- Reference artists: `Leonardo da Vinci, Vesalius, historical anatomical studies`

---

## Prompt Templates by Diagram Type

### Template A: Brain Anatomy Diagram

```
[Anatomical structure] in [view type] section, continuous line art, anatomical
drawing style, ink on cream parchment paper (#faf8f3), charcoal ink lines
(#1a2332), [specific structures] highlighted with [color] glow (#HEX at 40%
opacity), margin annotations on right side in ocean blue (#2d5a7b), scale bar
showing [measurement] at bottom right, Leonardo da Vinci anatomical study
aesthetic, engineer's notebook with handwritten notes, educational medical
illustration, hand-drawn, organic line variation, slight imperfections

Negative: photorealistic, 3D render, CGI, stock medical photo, modern clinical,
smooth gradients, digital art, commercial aesthetic, sterile hospital imagery,
textbook, computer-generated, perfect vectors

Settings: 1280x720, CFG 7-8, Steps 35, Sampler: DPM++ 2M Karras
```

**Fill in:**
- `[Anatomical structure]` = "Sagittal brain section" / "Coronal view of limbic system"
- `[view type]` = "sagittal" / "coronal" / "horizontal"
- `[specific structures]` = "anterior cingulate cortex and insula" / "hippocampus and amygdala"
- `[color]` = "cyan" (activity), "coral" (damage), "gold" (healing)
- `[measurement]` = "5cm" / "2cm"

---

### Template B: Timeline/Graph Diagram

```
Hand-drawn graph on cream parchment paper (#faf8f3), horizontal time axis
labeled "[X-axis label]" with hand-drawn tick marks, vertical axis labeled
"[Y-axis label]", [number] hand-sketched curves: [curve 1 description in color 1],
[curve 2 description in color 2], annotations at key points "[annotation 1]"
and "[annotation 2]", margin notes on right explaining [topic], charcoal ink
(#1a2332) for axes and labels, engineer's notebook aesthetic, hand-plotted data
points, educational illustration, whiteboard sketch style, organic line variation

Negative: photorealistic, Excel chart, digital graph software, corporate
presentation, sterile design, smooth gradients, printed graph paper,
computer-generated plot, stock chart imagery

Settings: 1280x720, CFG 7, Steps 35, Sampler: Euler a
```

**Fill in:**
- `[X-axis label]` = "Months in Recovery" / "Weeks" / "Days"
- `[Y-axis label]` = "Symptom Intensity" / "Dopamine Level" / "Craving Frequency"
- `[number]` = "three" / "four"
- `[curve 1 description]` = "anxiety curve in coral red (#e63946 peaks at month 2)"
- `[annotation 1]` = "Week 4-8: The Wall"
- `[topic]` = "symptom clusters" / "recovery markers"

---

### Template C: Social Situation Comparison

```
Two-panel storyboard comparison divided by vertical center line, left panel
shows [negative scenario] with [accent color 1] accents (#HEX), right panel
shows [positive scenario] with [accent color 2] accents (#HEX), simple hand-drawn
stick figures with expressive body language gestures (no detailed faces), thought
bubbles showing internal dialogue in ocean blue (#2d5a7b), arrows indicating
emotional flow, parchment paper background (#faf8f3), charcoal ink lines
(#1a2332), annotations explaining each response pattern, educational illustration,
whiteboard sketch style, human connection focus

Negative: photorealistic, detailed facial features, anime style, cartoon
characters, comic book art, commercial illustration, realistic people,
stock imagery

Settings: 1280x720, CFG 8, Steps 35, Sampler: DPM++ 2M Karras
```

**Fill in:**
- `[negative scenario]` = "conflict escalation" / "judgment response" / "shame spiral"
- `[positive scenario]` = "de-escalation" / "empathy response" / "healing spiral"
- `[accent color 1]` = "coral red" / "coral"
- `[accent color 2]` = "teal" / "gold"

---

### Template D: Process Flow Diagram

```
Vertical cascade flow diagram, hand-drawn flowchart style, top-to-bottom sequence
showing [process name], parchment paper background (#faf8f3), charcoal ink boxes
and arrows (#1a2332), color progression from [highlight color 1] (#HEX) at
[stage 1] to [highlight color 2] (#HEX) at [stage 2], [feedback element]
curving back, margin notes on right explaining [mechanism] in ocean blue (#2d5a7b),
engineer's notebook aesthetic with annotations, educational illustration,
whiteboard sketch style, hand-drawn boxes with slight imperfection

Negative: photorealistic, corporate flowchart, Microsoft Visio, clean digital
diagram, perfect vectors, smooth gradients, printed look, commercial design,
sterile business graphic

Settings: 1280x720, CFG 7, Steps 35, Sampler: Euler a
```

**Fill in:**
- `[process name]` = "dopamine response cycle" / "shame spiral" / "tolerance mechanism"
- `[highlight color 1]` = "teal highlight" / "gold highlight"
- `[stage 1]` = "anticipation peak" / "healthy baseline"
- `[highlight color 2]` = "coral highlight" / "red highlight"
- `[stage 2]` = "crash state" / "crisis point"
- `[feedback element]` = "dashed feedback loop arrow" / "curved escalation arrow"
- `[mechanism]` = "neurochemistry" / "psychological dynamics"

---

## Quality Checklist

Before generating, verify your prompt includes:

### Style Layer
- [ ] `continuous line art` or `hand-drawn line work`
- [ ] `anatomical drawing style` or `whiteboard sketch`
- [ ] `ink on parchment` or equivalent texture reference
- [ ] `organic line variation` or `slight imperfections`
- [ ] Historical reference: `Leonardo da Vinci` or `Renaissance anatomical`

### Color Layer
- [ ] Background: `#faf8f3` (parchment)
- [ ] Primary lines: `#1a2332` (charcoal)
- [ ] Annotations: `#2d5a7b` (ocean blue)
- [ ] 1-2 semantic highlights with hex codes and opacity

### Composition Layer
- [ ] Spatial percentages: "occupies 60% of frame"
- [ ] Element placement: "center-left" / "right margin"
- [ ] Title position: "top center" / "upper left"
- [ ] Scale reference: "bottom right"

### Negative Prompt Layer
- [ ] `photorealistic, 3D render` (prevents realism)
- [ ] `smooth gradients, airbrush` (prevents digital polish)
- [ ] `stock photo, commercial` (prevents generic look)
- [ ] `sterile, modern clinical` (prevents cold aesthetic)

### Technical Settings
- [ ] Aspect ratio: 16:9 (1280x720 or 1024x576)
- [ ] CFG scale: 7-9 for SD, 3.5-5 for Flux
- [ ] Steps: 30-40 for SD, 20-30 for Flux
- [ ] Sampler: DPM++ 2M Karras or Euler a

---

## Testing & Iteration Strategy

### First Generation: Structure Test
**Goal:** Get composition and anatomy right

**Settings:** Standard CFG (7-8), standard steps (35)

**Evaluate:**
- Is the brain structure in the correct position?
- Are elements placed according to layout grid?
- Is scale appropriate (not too small/large)?

**If fails:** Adjust spatial descriptions, consider ControlNet

---

### Second Generation: Style Test
**Goal:** Achieve hand-drawn aesthetic

**Settings:** Lower CFG (6-7) for more organic variation

**Evaluate:**
- Do lines have organic imperfection?
- Does it look like ink on paper (not digital)?
- Is parchment texture visible?

**If fails:** Strengthen style keywords, boost negative prompts

---

### Third Generation: Color Test
**Goal:** Brand palette accuracy

**Settings:** Standard CFG (7-8)

**Evaluate:**
- Are colors muted earth tones (not saturated)?
- Do highlights match hex codes?
- Is background warm cream (not white)?

**If fails:** Add hex codes to prompt, negative saturated colors

---

### Fourth Generation: Polish
**Goal:** Final refinement

**Settings:** Optimal settings from previous tests

**Evaluate:**
- Are annotations legible?
- Is composition balanced?
- Does it serve educational purpose?

**Post-processing:**
- Add text annotations if AI-generated text is garbled
- Adjust contrast if needed
- Crop to exact 16:9 if output varies

---

## Troubleshooting Decision Tree

```
Is output too photorealistic/polished?
├─ YES → Strengthen negative prompts + lower CFG + add "imperfections"
└─ NO → Continue

Are colors wrong/saturated?
├─ YES → Add hex codes + negative "bright colors" + add "muted tones"
└─ NO → Continue

Is composition chaotic?
├─ YES → Add spatial percentages + "organized layout" + consider ControlNet
└─ NO → Continue

Is text garbled?
├─ YES → Use post-processing for text OR embrace illegible notebook aesthetic
└─ NO → Continue

Looks like sterile textbook?
├─ YES → Add "engineer's personal notebook" + negative "textbook/stock"
└─ NO → Continue

Anatomy incorrect?
├─ YES → Use ControlNet with anatomical reference OR img2img refinement
└─ NO → Ship it! ✅
```

---

## Resources & References

### Example Prompts Library
- Brain anatomy: See Template A above
- Timeline graphs: See Template B above
- Social comparisons: See Template C above
- Process flows: See Template D above

### Style References
- Leonardo da Vinci anatomical studies (public domain)
- Andreas Vesalius "De humani corporis fabrica" (1543)
- Henry Vandyke Carter / Gray's Anatomy (1858)
- TED-Ed educational illustrations (modern reference)

### Technical Guides
- Stable Diffusion parameter guide: https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki
- ControlNet guide: https://github.com/lllyasviel/ControlNet
- Flux documentation: https://fal.ai/models/flux-pro
- Midjourney parameter reference: https://docs.midjourney.com/

### Color Psychology
- See `color-theory-education.md` in this skill's references

### Anatomical Accuracy
- See `anatomical-conventions.md` in this skill's references

---

**Last Updated:** 2026-01-11
**Version:** 1.0.0
**Skill:** hand-drawn-infographic-creator

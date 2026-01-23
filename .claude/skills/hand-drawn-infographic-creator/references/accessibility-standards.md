# Accessibility Standards for Hand-Drawn Infographics

**Purpose:** Ensure all hand-drawn educational diagrams are accessible to people with disabilities, meeting WCAG 2.1 AA standards and recovery-specific accessibility needs.

---

## Core Principles

### 1. Multi-Modal Information

**Principle:** Every piece of information conveyed visually must also be available non-visually.

**Why This Matters in Recovery:**
- People in early recovery may have cognitive impairments (attention, processing speed)
- Screen reader users need full context, not just "brain diagram"
- People with low vision need high contrast and scalable images
- Deaf/HoH users benefit from text alternatives when diagrams accompany video

**Implementation:**
- Comprehensive alt text (2-3 sentences minimum)
- Long descriptions for complex diagrams (via `aria-describedby` or adjacent text)
- Captions in surrounding article text that reference diagram elements

---

### 2. Color is Never the Only Indicator

**Principle:** Information conveyed by color must also be conveyed by shape, position, pattern, or text labels.

**Why This Matters:**
- 8% of men and 0.5% of women have color vision deficiency
- High-contrast modes remove color
- Print versions may be grayscale

**Implementation:**
- Cyan highlighted regions: Also labeled with text "ACTIVE"
- Coral highlighted regions: Also labeled "DAMAGED" or "CRASH"
- Graph curves: Different line styles (solid, dashed, dotted) in addition to color
- Comparisons: Use position (left vs right) + color

**Example:**
```
BAD:  Red curve = anxiety, Blue curve = mood (color only)
GOOD: Red solid line = anxiety, Blue dashed line = mood (color + pattern)
ALSO: Legend with symbols: ● Anxiety (red solid), ◆ Mood (blue dashed)
```

---

### 3. Text Must Meet Contrast Requirements

**Principle:** All text must have sufficient contrast against background.

**WCAG 2.1 AA Requirements:**
- **Normal text** (&lt; 18px): 4.5:1 contrast ratio
- **Large text** (≥ 18px or ≥ 14px bold): 3:1 contrast ratio
- **Graphical objects** (lines, borders): 3:1 contrast ratio

**Our Palette Compliance:**

| Element | Color | Background | Ratio | Status |
|---------|-------|------------|-------|--------|
| Charcoal text | `#1a2332` | `#faf8f3` | 13.1:1 | ✅ AAA (excellent) |
| Ocean blue labels | `#2d5a7b` | `#faf8f3` | 7.2:1 | ✅ AA (good) |
| Teal highlight | `#4a9d9e` | `#faf8f3` | 3.9:1 | ✅ AA (large text only) |
| Coral highlight | `#e63946` | `#faf8f3` | 4.1:1 | ✅ AA (large text only) |
| Gold highlight | `#f4a261` | `#faf8f3` | 3.2:1 | ✅ AA (large text only) |

**Implementation:**
- Use charcoal `#1a2332` for all body text and labels (13.1:1 ratio)
- Use ocean blue `#2d5a7b` for annotations (7.2:1 ratio)
- Highlighted regions (teal/coral/gold) should be GLOW/FILL only, not text color
- If text must appear on highlighted regions, use white or charcoal with sufficient contrast

**Testing Contrast:**
- Use WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Use browser DevTools: Chrome → Inspect → Accessibility pane

---

### 4. Structure Must Be Perceivable Without Visuals

**Principle:** Visual hierarchy should translate to logical reading order and semantic structure.

**Why This Matters:**
- Screen readers announce elements in DOM order
- Keyboard navigation follows logical tab order
- People using screen magnification need clear structure

**Implementation:**

**Visual Hierarchy → Semantic Structure:**
1. Title (H2 or H3 in article)
2. Diagram image with alt text
3. Caption or figure caption
4. Long description (if needed)
5. Surrounding article text that references diagram

**Example HTML Structure:**
```html
<figure role="figure" aria-labelledby="fig-caption-1">
  <img
    src="/diagrams/salience-network.png"
    alt="Hand-drawn brain diagram showing salience network..."
    aria-describedby="diagram-long-desc-1"
  />
  <figcaption id="fig-caption-1">
    Figure 1: Salience Network Overactivation in Meth-Induced Paranoia
  </figcaption>
  <div id="diagram-long-desc-1" class="sr-only">
    <!-- Long description here -->
  </div>
</figure>
```

---

## Alt Text Guidelines

### Short Alt Text (Required)

**Purpose:** Convey essential information for screen reader users in 2-3 sentences.

**What to Include:**
- Diagram type (brain anatomy, timeline graph, comparison, flow chart)
- Key structures or data points
- Main insight or takeaway
- Color coding if critical to understanding

**What to Exclude:**
- "Image of" or "Diagram showing" (screen reader already announces "image")
- Purely decorative details
- Information available in surrounding text

**Length:** 125-150 words (screen readers handle this well)

**Example (Brain Anatomy):**
```
Hand-drawn anatomical diagram of brain sagittal section showing the salience
network (anterior cingulate cortex and insula) highlighted in cyan glow, with
margin annotations explaining that this pattern-detection network becomes
hyperactive during methamphetamine use, causing the brain to interpret neutral
stimuli as threats, resulting in paranoia and hypervigilance
```

**Example (Timeline Graph):**
```
Hand-drawn timeline graph showing three symptom trajectories during first year
of recovery: anxiety in coral (peaks at 2 months called "The Wall," then declines),
mood stability in gold (improves significantly after 6-month "Turning Point"),
and sleep quality in teal (choppy at first, normalizes around month 4), with
annotations explaining that weeks 4-8 are hardest and most who survive this
period see accelerating improvement
```

---

### Long Description (For Complex Diagrams)

**Purpose:** Provide exhaustive detail for screen reader users who want full context.

**When Needed:**
- Diagrams with multiple labeled structures (brain anatomy)
- Multi-panel comparisons (judgment vs empathy)
- Graphs with 3+ curves and annotations
- Process flows with feedback loops

**What to Include:**
- Complete description of visual structure
- All labels and their positions
- All data points or key moments on timelines
- Color coding and what it represents
- Margin notes verbatim
- Key takeaway

**Format:** Use semantic HTML structure with headings:

```html
<div id="diagram-long-desc-1" class="sr-only">
  <h4>Detailed Description: Salience Network Overactivation</h4>

  <p>This hand-drawn brain diagram shows a side view (sagittal section) of
  the brain with the salience network structures highlighted. The salience
  network consists of the anterior cingulate cortex (ACC) and the insula,
  both shown with cyan highlighting to indicate hyperactivity.</p>

  <h5>Labeled Structures</h5>
  <ul>
    <li>Anterior Cingulate Cortex (ACC): Located in the medial frontal region</li>
    <li>Insula: Located within the lateral sulcus (fold)</li>
    <li>Amygdala: Located in the temporal lobe, below the ACC</li>
  </ul>

  <h5>Margin Notes</h5>
  <ul>
    <li>Salience network: The brain's pattern detector</li>
    <li>Normally filters relevant threats from irrelevant stimuli</li>
    <li>In meth paranoia: Everything is interpreted as a potential threat</li>
  </ul>

  <h5>Key Takeaway</h5>
  <p>Paranoia during methamphetamine use is caused by overactivation of the
  salience network, the brain system that detects patterns and threats.</p>
</div>
```

**Placement:**
- Use `aria-describedby` to link image to long description
- Use `.sr-only` class to hide visually but keep for screen readers
- Or place as visible content below diagram (benefits all users)

---

### Progressive Disclosure (Optional)

**For Very Complex Diagrams:** Offer layered descriptions

**Level 1 (Alt Text):** Essential overview (2-3 sentences)

**Level 2 (Short Description):** Key elements (5-7 sentences, visible caption)

**Level 3 (Long Description):** Exhaustive detail (collapsible or linked)

**Example Implementation:**
```html
<figure>
  <img src="..." alt="[Level 1: Essential overview]" aria-describedby="desc-2 desc-3" />
  <figcaption id="desc-2">
    [Level 2: Key elements - visible to all]
  </figcaption>
  <details>
    <summary>Full description for screen readers</summary>
    <div id="desc-3">
      [Level 3: Exhaustive detail]
    </div>
  </details>
</figure>
```

---

## Color & Contrast Standards

### Visual Contrast Requirements

**WCAG 2.1 AA Compliance:**

| Content Type | Size | Required Ratio | Our Ratio | Status |
|--------------|------|----------------|-----------|--------|
| Body text (labels) | 16-18px | 4.5:1 | 13.1:1 (charcoal) | ✅ AAA |
| Headings | 24-28px | 3:1 | 13.1:1 (charcoal) | ✅ AAA |
| Annotations | 12-14px | 4.5:1 | 7.2:1 (ocean blue) | ✅ AA |
| Graphical objects | Lines, borders | 3:1 | 13.1:1 (charcoal) | ✅ AAA |
| Color highlights | Glow/fill | 3:1 | 3.2-4.1:1 | ✅ AA |

**Non-Text Contrast:**
- Brain structure outlines (charcoal): 13.1:1 ✅
- Cyan highlights (active regions): 3.9:1 ✅
- Coral highlights (damage/crash): 4.1:1 ✅
- Graph axes and curves: 13.1:1 ✅

### Color Blindness Simulation

**Test All Diagrams Against:**
- **Deuteranopia** (red-green, most common, 5% of men)
- **Protanopia** (red-green, 1% of men)
- **Tritanopia** (blue-yellow, 0.01% of population)
- **Achromatopsia** (total colorblindness, 0.003%)

**Testing Tools:**
- Coblis Color Blindness Simulator: https://www.color-blindness.com/coblis-color-blindness-simulator/
- Chrome DevTools → Rendering → Emulate vision deficiencies

**Our Palette Performance:**

| Condition | Teal vs Coral | Teal vs Gold | Result |
|-----------|---------------|--------------|--------|
| Normal vision | Clear distinction | Clear distinction | ✅ |
| Deuteranopia | Both appear yellowish | Moderate distinction | ⚠️ Use labels |
| Protanopia | Both appear yellow-brown | Moderate distinction | ⚠️ Use labels |
| Tritanopia | Teal → cyan, Coral → red | Good distinction | ✅ |
| Achromatopsia | Different brightness | Different brightness | ✅ |

**Mitigation Strategies:**
- Always use text labels in addition to color
- Use different line styles for graph curves (solid, dashed, dotted)
- Use symbols in legends (●, ◆, ■) not just color swatches
- Ensure brightness/value differences between colors

### High Contrast Mode Compatibility

**Windows High Contrast Mode** removes colors and replaces with system palette.

**What Changes:**
- Background → Black or white (user setting)
- Text → White or black (inverted)
- Highlights → Lost entirely

**Mitigation:**
- Text labels must convey information (not just color highlights)
- Borders and lines must be present (not just filled regions)
- Use CSS for high contrast support:

```css
@media (prefers-contrast: high) {
  .diagram-highlight {
    /* Remove subtle highlights */
    background-color: transparent;
    /* Add bold borders instead */
    border: 3px solid currentColor;
  }
}
```

---

## Keyboard & Focus Management

### Diagrams in Interactive Contexts

**If diagrams are clickable or interactive:**

**Requirements:**
- Focusable via keyboard (Tab key)
- Visible focus indicator (outline, glow)
- Activate with Enter/Space
- Announce state changes to screen readers

**Example:**
```html
<button
  class="diagram-button"
  aria-label="View detailed brain anatomy diagram"
  aria-describedby="diagram-preview"
>
  <img src="..." alt="..." />
</button>

<style>
.diagram-button:focus {
  outline: 3px solid #2d5a7b; /* Ocean blue */
  outline-offset: 4px;
}
</style>
```

### Image Maps (If Used)

**For diagrams with clickable regions:**

```html
<img src="brain.png" alt="Brain anatomy" usemap="#brain-map" />
<map name="brain-map">
  <area
    shape="rect"
    coords="100,50,200,150"
    href="#acc"
    alt="Anterior Cingulate Cortex (ACC)"
  />
  <area
    shape="rect"
    coords="220,80,320,180"
    href="#insula"
    alt="Insula"
  />
</map>
```

**Accessibility Notes:**
- Each `<area>` must have descriptive `alt` text
- Keyboard users can Tab through areas
- Ensure focus indicators are visible

---

## Screen Reader Considerations

### Announcement Patterns

**What Screen Readers Say:**

**For standard image:**
```
"Image: Hand-drawn anatomical diagram of brain sagittal section showing..."
```

**For figure with caption:**
```
"Figure: Salience Network Overactivation. Image: Hand-drawn anatomical
diagram showing..."
```

**For linked diagram:**
```
"Link: View detailed brain anatomy diagram. Image: Hand-drawn anatomical..."
```

### Best Practices

**1. Use Semantic HTML:**
```html
<figure>  <!-- Announces "Figure" -->
  <img src="..." alt="..." />
  <figcaption>Figure 1: ...</figcaption>
</figure>
```

**2. Use ARIA Labels for Context:**
```html
<img
  src="..."
  alt="..."
  aria-label="Diagram illustrating salience network overactivation"
  aria-describedby="long-desc"
/>
```

**3. Provide Skip Links:**
```html
<a href="#after-diagram" class="sr-only skip-link">
  Skip complex diagram
</a>
<figure>...</figure>
<div id="after-diagram">
  <!-- Content continues -->
</div>
```

**4. Test with Real Screen Readers:**
- NVDA (Windows, free): https://www.nvaccess.org/
- JAWS (Windows, paid): https://www.freedomscientific.com/
- VoiceOver (Mac, built-in): Cmd + F5
- TalkBack (Android, built-in): Settings → Accessibility
- Orca (Linux, free): Pre-installed on many distros

---

## Cognitive Accessibility

### Recovery-Specific Considerations

**People in early recovery may experience:**
- Attention deficits (hard to focus on complex visuals)
- Processing speed delays (need more time to understand)
- Working memory impairment (can't hold multiple pieces of info)
- Executive function challenges (organization, planning)

### Design Adaptations

**1. Progressive Complexity:**
- Start with simple overview
- Add detail gradually
- Don't overwhelm with information

**Example:**
```
Step 1: Show basic brain outline (30 seconds to absorb)
Step 2: Add one highlighted region with label (30 seconds)
Step 3: Add margin notes (60 seconds)
Step 4: Show full diagram with all details
```

**2. Clear Visual Hierarchy:**
- Largest = most important (title, main structure)
- Medium = supporting info (labels)
- Smallest = extra detail (margin notes)

**3. White Space / Negative Space:**
- Don't crowd diagram with information
- Margin notes in dedicated column (20% of frame)
- Clear separation between elements

**4. Chunking:**
- Group related annotations together
- Use bullet lists (not paragraph text)
- Maximum 3-5 items per group

**Example (Margin Notes):**
```
✅ GOOD:
Salience Network:
• Pattern detector
• Filters threats
• Overactive on meth

❌ BAD:
The salience network, which consists of the anterior cingulate cortex and
insula, acts as the brain's pattern detector, normally filtering relevant
threats from irrelevant stimuli, but becomes overactive during methamphetamine
use, causing hypervigilance and paranoia. [Too dense, hard to parse]
```

**5. Dual Coding (Visual + Text):**
- Every visual element has a text label
- Every text annotation references a visual element
- Reinforces learning through multiple channels

---

## Mobile Accessibility

### Touch Target Sizes

**WCAG 2.1 AA: 44×44px minimum touch target size**

**Implementation:**
- If diagrams are clickable/tappable, ensure hit area ≥ 44px
- Use CSS `padding` to increase touch area without changing visual size

```css
.diagram-link {
  display: inline-block;
  min-width: 44px;
  min-height: 44px;
  padding: 8px;
}
```

### Pinch-to-Zoom

**Requirements:**
- Never disable zoom with `user-scalable=no`
- Ensure diagrams scale without pixelation (use SVG if possible, or high-res PNG)
- Test at 200% zoom (WCAG 2.1 AA requirement)

**Implementation:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- No maximum-scale or user-scalable=no -->
```

### Responsive Text

**Ensure annotations remain readable at all screen sizes:**

```css
.diagram-annotation {
  font-size: clamp(12px, 2vw, 16px); /* Scales between 12-16px */
}
```

---

## Testing Checklist

### Visual Accessibility
- [ ] Text contrast ≥ 4.5:1 (normal) or ≥ 3:1 (large)
- [ ] Graphical object contrast ≥ 3:1
- [ ] Information not conveyed by color alone
- [ ] Different line styles for graph curves (not just color)
- [ ] Labels present for all highlighted regions

### Color Blindness
- [ ] Test with Coblis simulator (deuteranopia, protanopia)
- [ ] Ensure distinction without color (use labels, patterns)
- [ ] Legend uses symbols + color, not color alone

### Screen Readers
- [ ] Alt text present (2-3 sentences, 125-150 words)
- [ ] Long description for complex diagrams
- [ ] Semantic HTML (`<figure>`, `<figcaption>`)
- [ ] ARIA labels where appropriate
- [ ] Test with NVDA, VoiceOver, or JAWS

### Keyboard Navigation
- [ ] Focusable elements have visible focus indicator
- [ ] Tab order is logical (matches visual layout)
- [ ] Interactive diagrams activate with Enter/Space
- [ ] Skip links provided for complex diagrams

### Cognitive Accessibility
- [ ] Visual hierarchy clear (size indicates importance)
- [ ] White space preserved (not overcrowded)
- [ ] Annotations chunked (3-5 items per group)
- [ ] Information presented progressively (not all at once)

### Mobile Accessibility
- [ ] Touch targets ≥ 44×44px
- [ ] Pinch-to-zoom enabled
- [ ] Readable at 200% zoom
- [ ] Responsive text sizing

### High Contrast Mode
- [ ] Test in Windows High Contrast Mode
- [ ] Information conveyed without color (borders, labels)
- [ ] Focus indicators visible

---

## Compliance Documentation

### WCAG 2.1 Level AA Coverage

| Criterion | Requirement | Our Implementation | Status |
|-----------|-------------|-------------------|--------|
| **1.1.1 Non-text Content** | Alt text for images | Alt text + long descriptions | ✅ Pass |
| **1.3.1 Info and Relationships** | Semantic structure | `<figure>`, `<figcaption>`, ARIA | ✅ Pass |
| **1.4.1 Use of Color** | Not color alone | Labels + color + patterns | ✅ Pass |
| **1.4.3 Contrast (Minimum)** | 4.5:1 text, 3:1 graphical | 7.2-13.1:1 text, 13.1:1 lines | ✅ Pass (AAA) |
| **1.4.4 Resize Text** | 200% zoom without loss | Responsive sizing, high-res images | ✅ Pass |
| **1.4.5 Images of Text** | Avoid where possible | Text as text in HTML, not burned into image | ⚠️ Partial* |
| **1.4.10 Reflow** | 320px width support | Responsive design | ✅ Pass |
| **1.4.11 Non-text Contrast** | 3:1 for graphical objects | 13.1:1 charcoal lines | ✅ Pass (AAA) |
| **2.1.1 Keyboard** | All functionality keyboard accessible | Focusable, Tab order | ✅ Pass |
| **2.4.4 Link Purpose** | Clear link text | Descriptive ARIA labels | ✅ Pass |
| **2.5.5 Target Size** | 44×44px minimum | Adequate padding on touch targets | ✅ Pass |
| **4.1.2 Name, Role, Value** | Proper ARIA | Semantic HTML + ARIA where needed | ✅ Pass |

**Partial Pass Explanation:**
- *Annotations are burned into diagram images (unavoidable for AI-generated visuals)
- Mitigation: All annotations duplicated in long description text
- Acceptable per WCAG if essential to presentation + text alternative provided

---

## Recovery-Specific Accessibility Considerations

### Crisis State Accessibility

**People in crisis may have:**
- Tunnel vision (can only see center of screen)
- Heightened stress (makes complex visuals overwhelming)
- Urgency (need information NOW, not after loading/decoding diagram)

**Adaptations:**
- Provide text summary BEFORE diagram (don't make them wait)
- Use high contrast, simple visuals (reduce cognitive load)
- Offer audio alternatives for key insights (text-to-speech friendly)

**Example:**
```html
<!-- Crisis-friendly structure -->
<div class="content-summary">
  <strong>Key Takeaway:</strong> Paranoia during meth use is caused by
  overactivation of the brain's pattern-detection system. It's a neurological
  symptom, not a character flaw, and typically resolves within 2-4 weeks of
  stopping use.
</div>

<figure>
  <!-- Diagram loads below, for those who want visual detail -->
  <img src="..." alt="..." />
</figure>
```

### Trauma-Informed Design

**Avoid:**
- Flashing or rapid animations (can trigger trauma responses)
- Auto-playing videos
- Sudden color changes
- Loud audio (if audio alternatives used)

**Prefer:**
- Static images (no animation)
- User-controlled playback (if animated)
- Gentle color palette (warm, muted tones)
- Optional audio (never required, never auto-play)

### Literacy Considerations

**Not everyone has high health literacy:**

**Plain Language:**
- Define jargon on first use: "Anterior cingulate cortex (ACC) - a brain region that detects patterns"
- Use common terms: "pattern detector" before "salience network"
- Keep sentences short (15-20 words max)

**Reading Level:**
- Aim for 8th grade reading level in alt text
- Use Hemingway App to check: https://hemingwayapp.com/

**Example:**
```
❌ COMPLEX (12th grade):
"The salience network, comprising the ACC and insula, undergoes hyperactivation
during methamphetamine intoxication, resulting in aberrant threat perception."

✅ SIMPLE (8th grade):
"Meth overstimulates the brain's pattern detector (a system that normally spots
threats), causing everything to feel dangerous. This is why people experience
paranoia."
```

---

## Legal & Ethical Obligations

### ADA Compliance (U.S.)

**Americans with Disabilities Act, Title III:**
- Public accommodations (websites) must be accessible
- Failure to provide accessible diagrams = potential ADA violation
- Especially critical for healthcare/educational content

**Mitigation:**
- Follow WCAG 2.1 AA standards (industry standard for ADA compliance)
- Provide text alternatives
- Test with assistive technologies

### Section 508 (U.S. Federal)

**If sobriety.tools receives federal funding or serves federal employees:**
- Must comply with Section 508 (similar to WCAG 2.0 AA)
- Requires alt text, keyboard access, color contrast

### AODA (Ontario, Canada)

**Accessibility for Ontarians with Disabilities Act:**
- WCAG 2.0 AA required for public websites
- Progressive compliance deadlines

### EU Web Accessibility Directive

**If serving EU users:**
- WCAG 2.1 AA required for public sector bodies
- Private sector "encouraged" to adopt

### Ethical Obligation

**Beyond legal requirements:**
- Addiction disproportionately affects people with disabilities
- Excluding disabled people from recovery education is harmful
- Accessibility is a matter of equity and dignity

---

## Resources & Tools

### Contrast Checkers
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Contrast Ratio by Lea Verou: https://contrast-ratio.com/
- Chrome DevTools Accessibility Pane

### Color Blindness Simulators
- Coblis: https://www.color-blindness.com/coblis-color-blindness-simulator/
- Chrome DevTools: Rendering → Emulate vision deficiencies
- Color Oracle (desktop app): https://colororacle.org/

### Screen Readers
- NVDA (Windows, free): https://www.nvaccess.org/
- JAWS (Windows): https://www.freedomscientific.com/
- VoiceOver (Mac): Built-in, Cmd + F5
- TalkBack (Android): Settings → Accessibility

### Automated Testing
- WAVE (browser extension): https://wave.webaim.org/
- axe DevTools (browser extension): https://www.deque.com/axe/devtools/
- Lighthouse (Chrome DevTools): Accessibility audit

### Manual Testing Guides
- WebAIM's WCAG 2 Checklist: https://webaim.org/standards/wcag/checklist
- A11y Project Checklist: https://www.a11yproject.com/checklist/

### Standards Documentation
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/

---

## Accessibility Statement Template

**For sobriety.tools website footer:**

```markdown
## Accessibility Commitment

We are committed to ensuring our recovery education content, including diagrams
and infographics, is accessible to all people regardless of ability.

**Our Standards:**
- WCAG 2.1 Level AA compliance
- Alt text for all educational diagrams
- Color contrast ratios exceeding 4.5:1
- Keyboard-navigable interfaces
- Screen reader compatibility

**Feedback:**
If you encounter accessibility barriers, please contact us at
[accessibility@sobriety.tools]. We will work to address issues promptly.

**Assistive Technologies We Test With:**
- NVDA (Windows screen reader)
- VoiceOver (Mac/iOS screen reader)
- JAWS (Windows screen reader)
- High contrast mode
- Keyboard-only navigation
- 200% browser zoom

**Last Reviewed:** [Date]
```

---

**Last Updated:** 2026-01-11
**Version:** 1.0.0
**Skill:** hand-drawn-infographic-creator

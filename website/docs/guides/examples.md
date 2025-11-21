---
title: Examples & Use Cases
description: Real-world examples and use cases for Claude Skills

sidebar_position: 2
---

# Claude Skills Examples

This document provides detailed, real-world examples of using the Claude Skills in this repository.

## Example 1: Complete Web App Design (Orchestrated)

### Scenario
You're launching a new meditation and mindfulness app called "Zenith" targeting busy professionals.

### Using the Orchestrator

**Your Request:**
```
I'm building a meditation app called Zenith for busy professionals 
who struggle with stress. I want something that feels calming but 
professional, not stereotypically "zen" with clichéd imagery.

Coordinate your specialists to deliver:
1. Research on meditation app design trends
2. A unique brand identity that stands out
3. Complete design system with CSS
4. Team composition to build it
```

**Orchestrator's Response:**

The Orchestrator will automatically delegate to specialists in this sequence:

#### Phase 1: Research (Research Analyst)
**Output**: Research Report
- Analysis of top 15 meditation apps
- Trend: Moving away from purple/lotus clichés toward minimal, modern aesthetics
- Insight: Professional users prefer "calm focus" over "spiritual enlightenment"
- Recommendation: Muted blues/greens, sans-serif typography, spacious layouts
- Competitive gap: No apps effectively bridge "productivity tool" and "wellness app"

#### Phase 2: Brand Identity (Web Design Expert)
**Output**: Brand Identity Guide
- **Brand Personality**: Focused Calm - professional yet soothing
- **Colors**: 
  - Primary: Deep Ocean Blue (#1a365d)
  - Secondary: Soft Sage (#9faa8e)
  - Accent: Warm Sand (#f5e6d3)
- **Typography**: 
  - Headers: Inter (geometric, modern)
  - Body: Source Serif Pro (readable, slightly warm)
- **Visual Language**: Breathing space, gentle curves, subtle depth
- **Key Principle**: "Clarity creates calm"

#### Phase 3: Design System (Design System Creator)
**Output**: Design Bible + CSS

**Design Tokens (CSS Custom Properties):**
```css
:root {
  /* Colors */
  --color-primary: #1a365d;
  --color-secondary: #9faa8e;
  --color-accent: #f5e6d3;
  --color-text: #2d3748;
  --color-background: #fafafa;
  
  /* Spacing (8px base) */
  --space-xs: 0.5rem;   /* 8px */
  --space-sm: 1rem;     /* 16px */
  --space-md: 1.5rem;   /* 24px */
  --space-lg: 2rem;     /* 32px */
  --space-xl: 3rem;     /* 48px */
  
  /* Typography */
  --font-heading: 'Inter', sans-serif;
  --font-body: 'Source Serif Pro', serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.875rem;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 25px rgba(0,0,0,0.15);
}
```

**Component: Button**
```css
.btn {
  font-family: var(--font-heading);
  font-weight: 500;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: var(--font-size-base);
}

.btn--primary {
  background: var(--color-primary);
  color: white;
}

.btn--primary:hover {
  background: #2a4a7c;
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn--primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}
```

#### Phase 4: Team Design (Team Builder)
**Output**: Team Composition Plan

**Recommended Team (6 people):**

1. **Product Designer (Visionary)** - Emily
   - Personality: Creative, user-empathetic, strategic
   - Role: Brand steward, UX lead, design vision
   - Key strength: Bridges business needs with user needs

2. **Senior Full-Stack Engineer (Analyst)** - Marcus
   - Personality: Systematic, quality-focused, pragmatic
   - Role: Architecture, backend, performance
   - Key strength: Ensures technical sustainability

3. **Frontend Specialist (Executor)** - Sarah
   - Personality: Detail-oriented, craftsmanship-focused
   - Role: Implement design system, animations, polish
   - Key strength: Pixel-perfect implementation

4. **Mobile Engineer (Specialist)** - James
   - Personality: Platform-expert, user-experience focused
   - Role: iOS/Android native apps
   - Key strength: Mobile-specific UX patterns

5. **UX Researcher (Relationship Builder)** - Priya
   - Personality: Curious, empathetic, methodical
   - Role: User testing, insights, validation
   - Key strength: Keeps team grounded in user reality

6. **Scrum Master (Facilitator)** - Alex
   - Personality: Organized, diplomatic, proactive
   - Role: Remove blockers, facilitate ceremonies
   - Key strength: Enables team to focus on craft

**Collaboration Rituals:**
- **Daily Standup** (15 min): Sync and blockers
- **Design Reviews** (Tue/Thu): Critique and feedback
- **User Testing** (Weekly): Validate with real users
- **Sprint Planning** (Bi-weekly): Commitment and clarity
- **Retrospective** (Bi-weekly): Process improvement
- **Team Lunch** (Weekly): Relationship building

**Why This Team Works:**
- Balanced personalities prevent echo chamber
- UX Researcher keeps design honest
- Strong frontend ensures design vision is realized
- Scrum Master protects team's focus time
- Size enables tight collaboration

---

## Example 2: Rapid Brand Identity Creation

### Scenario
You need a quick brand identity for a new project, without full orchestration.

**Your Request to Web Design Expert:**
```
Create a brand identity for a productivity app called "Momentum" 
that helps freelancers track time and manage projects. Target 
audience is creative professionals (designers, writers, developers).
```

**Output:**

### Brand Identity: Momentum

**Brand Personality**: Energetic Minimalism
- Confident and empowering
- Clean and uncluttered
- Modern without being cold
- Celebrates progress and achievement

**Color Palette:**
- **Primary**: Electric Indigo (#4f46e5) - Energy and focus
- **Secondary**: Warm Coral (#ff6b6b) - Passion and creativity
- **Accent**: Bright Teal (#20d9d2) - Fresh and forward-moving
- **Neutrals**: 
  - Dark: Charcoal (#1f2937)
  - Medium: Slate (#64748b)
  - Light: Off-white (#f8fafc)

**Typography:**
- **Display**: Outfit (geometric, friendly, modern)
- **UI**: Inter (clean, highly readable)
- **Body**: System default (-apple-system, BlinkMacSystemFont)

**Visual Language:**
- Sharp angles suggesting forward motion
- Bold color blocks for emphasis
- Generous white space
- Subtle motion/animation
- Progress indicators and data visualization

**Design Principles:**
1. **Clarity over complexity**: Remove friction
2. **Celebrate progress**: Make achievements visible
3. **Respect time**: Fast, efficient interactions
4. **Empower action**: Clear calls-to-action

**Mood Board Keywords:**
Modern dashboard, data visualization, bold typography, geometric shapes, high contrast, vibrant accents

---

## Example 3: Research-Driven Decision Making

### Scenario
You're choosing between design approaches and need evidence-based insights.

**Your Request to Research Analyst:**
```
I'm building a SaaS dashboard. Should I go with a dark theme, 
light theme, or offer both? Research what top SaaS products do 
and why.
```

**Output:**

### SaaS Dashboard Theme Research Report

**Executive Summary:**
68% of top SaaS products now offer theme switching (dark + light). However, default matters: 82% default to light mode. Dark mode is preferred by developers and power users but can reduce accessibility for others. Recommendation: Light default with dark mode option.

**Key Findings:**

**1. Theme Preferences by User Type:**
- **Developers/Technical**: 73% prefer dark mode
- **Business Users**: 61% prefer light mode
- **Creative Professionals**: 55% prefer light mode
- **Data Analysts**: Split 50/50

**2. What Top Products Do:**
- **Notion**: Light default, dark option, sync with system
- **Linear**: Dark default (developer tool), light option
- **Figma**: Light default, dark option
- **Stripe Dashboard**: Light default, dark option
- **GitHub**: System preference default, both options

**3. Research on Impact:**
- **Accessibility**: Light mode has 30% better contrast options
- **Eye Strain**: No significant difference with proper implementation
- **Perceived Value**: Light = professional, Dark = technical/modern
- **Power Usage**: Dark saves 15-20% on OLED screens

**4. Implementation Best Practices:**
- Use CSS custom properties for theming
- Respect system preference as default
- Remember user choice in localStorage
- Ensure both themes meet WCAG contrast requirements
- Test all components in both themes

**Recommendation:**
Implement both with light as default, system preference detection, and persistent user choice. This serves the widest audience while respecting user preferences.

**Code Example:**
```css
/* Light theme (default) */
:root {
  --bg-primary: #ffffff;
  --text-primary: #1f2937;
  --border-color: #e5e7eb;
}

/* Dark theme */
[data-theme="dark"] {
  --bg-primary: #1f2937;
  --text-primary: #f9fafb;
  --border-color: #374151;
}
```

```javascript
// Detect and apply preference
const theme = localStorage.getItem('theme') || 
              (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', theme);
```

---

## Example 4: Team Building for Specific Need

### Scenario
You're assembling a team for a specific project type.

**Your Request to Team Builder:**
```
I need to build a team to create and maintain a component 
library for a design system. What roles do I need and how 
should they work together?
```

**Output:**

### Design System Team Composition

**Team Size**: 4-5 people (optimal for this scope)

**Core Roles:**

**1. Design Systems Lead (Visionary + Facilitator)**
- **Personality**: Strategic, diplomatic, systematic
- **Responsibilities**:
  - Define design system vision and principles
  - Coordinate between design and engineering
  - Make final decisions on component API
  - Evangelize adoption across organization
- **Key Skills**: Design + development understanding, communication
- **Time Allocation**: 100% on design system

**2. Component Engineer (Specialist + Executor)**
- **Personality**: Detail-oriented, quality-focused, pragmatic
- **Responsibilities**:
  - Build accessible, performant components
  - Write comprehensive component tests
  - Maintain component documentation
  - Review contribution PRs
- **Key Skills**: React/Vue/Web Components, a11y, testing
- **Time Allocation**: 100% on design system

**3. Design Tooling Engineer (Analyst + Specialist)**
- **Personality**: Technical, automation-focused, efficient
- **Responsibilities**:
  - Build design token pipeline
  - Create tooling (Figma plugins, code generation)
  - Maintain build and publish systems
  - Performance optimization
- **Key Skills**: Build tools, Figma API, design tokens
- **Time Allocation**: 70% design system, 30% supporting product teams

**4. Documentation Designer (Relationship Builder + Executor)**
- **Personality**: Clear communicator, user-focused, organized
- **Responsibilities**:
  - Write comprehensive documentation
  - Create usage examples and tutorials
  - Maintain design system website
  - Gather and triage feedback
- **Key Skills**: Technical writing, basic code, design
- **Time Allocation**: 100% on design system

**5. Product Designer (Visionary)** [Optional but recommended]
- **Personality**: Creative, user-empathetic, systematic
- **Responsibilities**:
  - Design new components
  - Ensure visual consistency
  - Create design specs and Figma library
  - User research on component usability
- **Key Skills**: UI design, Figma, user research
- **Time Allocation**: 60% design system, 40% product work

**Collaboration Model:**

**Weekly Rituals:**
- **Monday**: Planning sync (30 min) - Week's priorities
- **Wednesday**: Component review (1 hr) - Critique in-progress work
- **Friday**: Office hours (2 hrs) - Support product teams

**Bi-Weekly:**
- **Sprint Planning**: Commitment to work
- **Retrospective**: Process improvement
- **All-Hands**: Share updates with organization

**Async:**
- **Daily updates** in Slack/Teams
- **RFC process** for major changes
- **Public roadmap** for transparency

**Decision-Making:**
- **Design Systems Lead** makes final calls
- **Consensus-seeking** for component API design
- **RFC process** for breaking changes
- **User feedback** weighs heavily in priorities

**Success Metrics:**
- Component usage adoption rate
- Time saved by product teams
- Accessibility compliance rate
- Documentation completeness score
- Internal NPS from product teams

**Why This Works:**
- Small enough for tight collaboration
- All necessary skills covered
- Clear ownership and decision-making
- User-focused (product teams are users)
- Balance of creation and support

---

## Example 5: Iterative Design Refinement

### Scenario
You want to refine a design through multiple iterations.

**Iteration 1 - Initial Concept:**
```
[To Web Design Expert]
Create initial brand identity for a plant care app called "Thrive"
```

**Iteration 2 - Feedback:**
```
The green is too expected for a plant app. Can we do something 
more unexpected while still feeling natural and growth-oriented?
```

**Iteration 3 - Refinement:**
```
I love the terracotta direction! Now create three variations of 
the color palette: warm, cool, and balanced.
```

**Iteration 4 - Finalization:**
```
The balanced palette is perfect. Now expand it into a complete 
design system with all the semantic color tokens we'll need.
```

This shows how to progressively refine using the skills rather than trying to get everything perfect in one shot.

---

## Tips for Using These Examples

1. **Start Broad, Then Refine**: Initial requests can be general; follow up with specifics
2. **Provide Context**: More context = better results
3. **Request Alternatives**: Ask for multiple options when unsure
4. **Iterate Freely**: Refinement is expected and encouraged
5. **Combine Skills**: Use outputs from one skill as inputs to another

## More Example Prompts

**For Web Design Expert:**
- "Create a brand identity for [description] that feels [adjectives]"
- "Design a color palette that conveys [emotion/concept]"
- "Give me three visual direction options for [project]"

**For Design System Creator:**
- "Convert this design into CSS custom properties"
- "Create a component library structure for [project type]"
- "Write a design bible section for [component name]"

**For Research Analyst:**
- "Research best practices for [topic/challenge]"
- "Compare [option A] vs [option B] for [use case]"
- "What are the emerging trends in [domain]?"

**For Team Builder:**
- "Design a team for [project type] with [constraints]"
- "What collaboration rituals work best for [team type]?"
- "How should [role A] and [role B] work together?"

**For Orchestrator:**
- "Build me a complete [solution] from scratch"
- "Coordinate all specialists to solve [complex problem]"
- "I need [deliverable 1], [deliverable 2], and [deliverable 3]"

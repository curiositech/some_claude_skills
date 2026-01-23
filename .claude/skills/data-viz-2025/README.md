# Data Viz 2025: State-of-the-Art Data Visualization Skill

> Create visualizations that Seaborn users, Tufte readers, and everyone else will love.

A comprehensive skill for building production-ready data visualizations in React/Next.js/TypeScript with Tailwind CSS. Combines NYT Graphics rigor, Tufte principles, and modern animation patterns.

## What This Skill Provides

### Core Philosophy
- **Clarity** (Tufte's Data-Ink Ratio) - Every visual element must earn its place
- **Beauty** (Aesthetic Standards) - Visualizations are art, use premium design
- **Truth** (Graphical Integrity) - Data representation must be honest and tested

### Complete Coverage

1. **Library Selection** - Decision trees for Observable Plot, Recharts, Nivo, Visx, D3.js
2. **Design Principles** - Tufte's data-ink ratio, graphical integrity, chartjunk removal
3. **Testing Strategies** - Visual regression, data accuracy, accessibility, performance
4. **Animation Patterns** - Spring physics, micro-interactions, scrollytelling
5. **Data Storytelling** - Narrative techniques, progressive disclosure, annotated insights
6. **Utility Scripts** - Data transformation and chart testing helpers
7. **Production Examples** - Battle-tested components with accessibility built-in

## Quick Start

### Installation

```bash
# Add to your Claude skills directory
cp -r data-viz-2025 ~/.claude/skills/

# Or use the Skill tool in Claude Code:
# "Use the data-viz-2025 skill to create a chart"
```

### Basic Usage

```typescript
// 1. Choose your library (see SKILL.md decision tree)
npm install recharts framer-motion

// 2. Import utilities
import { rollup, normalize } from './scripts/data-transform';
import { verifyScaleAccuracy } from './scripts/chart-test-helpers';

// 3. Build your chart
import { AnimatedBarChart } from './assets/example-chart';

<AnimatedBarChart
  data={salesData}
  title="Q4 Sales by Channel"
  highlightCategory="Mobile"
/>
```

## File Structure

```
data-viz-2025/
├── SKILL.md                           # Core skill instructions
├── README.md                          # This file
│
├── references/                        # Deep-dive documentation
│   ├── tufte-principles.md           # Data-ink ratio, graphical integrity
│   ├── library-comparison.md         # Observable Plot vs Recharts vs Nivo vs Visx vs D3
│   ├── testing-strategies.md         # Visual regression, data accuracy, a11y
│   ├── animation-patterns.md         # Motion design for charts
│   └── data-storytelling.md          # Narrative techniques, scrollytelling
│
├── scripts/                           # Utility functions
│   ├── data-transform.ts             # groupBy, rollup, normalize, pivot, etc.
│   └── chart-test-helpers.ts         # verifyScaleAccuracy, checkContrast, etc.
│
└── assets/                            # Production examples
    └── example-chart.tsx              # Complete animated bar chart
```

## Key Features

### Decision Trees for Library Selection

**Need to make 50 prototypes fast?** → Observable Plot
**Building standard business charts?** → Recharts
**Want beautiful defaults?** → Nivo
**Need maximum control?** → Visx or D3.js

See `SKILL.md` for complete decision tree.

### Tufte Principles Built-In

- ✅ Maximize data-ink ratio
- ✅ Ensure graphical integrity
- ✅ Remove chartjunk
- ✅ Use small multiples for comparison
- ✅ Direct labels (not legends)

See `references/tufte-principles.md` for examples.

### Testing at Every Level

```typescript
// Data accuracy
verifyScaleAccuracy(bars, dataValues, 'height');

// Visual regression (Percy)
npx percy storybook ./storybook-static

// Accessibility
const results = await axe(container);
expect(results).toHaveNoViolations();

// Performance
const time = benchmarkRender(() => render(<Chart />));
expect(time).toBeLessThan(500);
```

See `references/testing-strategies.md` for comprehensive test suites.

### Animation Patterns

```typescript
// Spring physics (not linear easing)
transition={{
  type: "spring",
  stiffness: 300,
  damping: 30
}}

// Stagger children
transition={{ staggerChildren: 0.1 }}

// Respect reduced motion
const shouldReduceMotion = useReducedMotion();
```

See `references/animation-patterns.md` for complete patterns library.

### Data Storytelling Framework

Every visualization should tell a story:
1. **Hook** - What's the surprising insight?
2. **Context** - Why should we care?
3. **Evidence** - Show the data clearly
4. **Conclusion** - What should we do?

See `references/data-storytelling.md` for narrative techniques.

## Common Workflows

### Building a Chart from Scratch

```bash
1. Research your data (use Observable Plot for prototyping)
2. Choose production library (Recharts for most cases)
3. Implement with Tufte principles (high data-ink ratio)
4. Add animations (spring physics, stagger)
5. Write tests (data accuracy + visual regression)
6. Add accessibility (ARIA labels, data table alternative)
7. Ship with confidence
```

### Improving an Existing Chart

```bash
1. Run through Tufte checklist (see SKILL.md)
2. Remove chartjunk (gridlines, 3D, shadows)
3. Add direct labels (replace legends)
4. Verify accessibility (axe, contrast ratios)
5. Add micro-interactions (hover states)
6. Test on mobile
7. Take Percy snapshot
```

## Utility Functions

### Data Transformations

```typescript
import { groupBy, rollup, normalize, pivot } from './scripts/data-transform';

// Group by category
const grouped = groupBy(data, 'category');

// Aggregate
const totals = rollup(data, 'category', 'value', 'sum');

// Normalize to 0-1
const normalized = normalize([10, 20, 30]);

// Pivot table
const pivoted = pivot(data, 'date', 'category', 'value');
```

See `scripts/data-transform.ts` for 20+ utility functions.

### Chart Testing

```typescript
import { verifyScaleAccuracy, checkContrast } from './scripts/chart-test-helpers';

// Verify bars are proportional
verifyScaleAccuracy(bars, dataValues, 'height');

// Check WCAG contrast
checkContrast(bar, '#ffffff'); // true if ≥3:1

// Benchmark performance
const time = benchmarkRender(() => render(<Chart />));
```

See `scripts/chart-test-helpers.ts` for complete testing toolkit.

## Best Practices

### DO ✅

- Start with Observable Plot for prototyping
- Use Recharts for standard business charts
- Maximize data-ink ratio (remove gridlines, borders)
- Provide data table alternative for accessibility
- Use spring physics for animations
- Respect `prefers-reduced-motion`
- Test with Percy or Chromatic
- Use skeleton loaders (not spinners)

### DON'T ❌

- Use 3D effects or gradients (distort perception)
- Start Y-axis at non-zero for bar charts (misleading)
- Rely on color alone (use shapes, labels too)
- Use rainbow color schemes (hard to interpret)
- Animate without purpose (decoration)
- Skip accessibility testing
- Use `<Loader2 className="animate-spin" />`

## Inspiration Sources

- [ObservableHQ Featured](https://observablehq.com/@observablehq/explore-featured-collections)
- [Information is Beautiful Awards](https://www.informationisbeautifulawards.com/)
- [NYT Graphics](https://twitter.com/nytgraphics)
- [The Pudding](https://pudding.cool/)
- [FlowingData](https://flowingdata.com/)

## Reference Materials

| File | Contents |
|------|----------|
| `references/tufte-principles.md` | Edward Tufte's foundational principles |
| `references/library-comparison.md` | Observable Plot vs Recharts vs Nivo vs Visx vs D3 |
| `references/testing-strategies.md` | Visual regression, data accuracy, a11y |
| `references/animation-patterns.md` | Spring physics, micro-interactions, scrollytelling |
| `references/data-storytelling.md` | Narrative techniques, progressive disclosure |

## Success Criteria

Before shipping a chart, verify:

- [ ] High data-ink ratio (gridlines removed or minimal)
- [ ] Graphical integrity (proportional representation)
- [ ] Direct labels (not legends requiring color matching)
- [ ] Accessibility (WCAG AA, keyboard nav, screen reader support)
- [ ] Responsive (mobile-first, touch targets ≥44px)
- [ ] Tested (data accuracy + visual regression)
- [ ] Animated (spring physics, respects reduced motion)
- [ ] Loading state (skeleton, not spinner)
- [ ] Error handling (graceful degradation)
- [ ] Empty state (helpful message)

## Contributing

Found a pattern that works well? Add it!

1. Document in appropriate reference file
2. Add utility function if reusable
3. Update SKILL.md if changes core workflow
4. Test thoroughly
5. Share examples in `assets/`

## Sources

This skill synthesizes best practices from:

- Edward Tufte - "The Visual Display of Quantitative Information" (1983)
- New York Times Graphics Team
- ObservableHQ community
- Modern React visualization libraries
- WCAG 2.1 accessibility standards
- 2025 web performance best practices

## Version

**1.0.0** (January 2026)

Initial release covering:
- Library selection framework
- Tufte principles
- Testing strategies
- Animation patterns
- Data storytelling
- Utility scripts
- Production examples

---

**Remember:** The best visualization is the one that makes the insight obvious. When in doubt, simplify.

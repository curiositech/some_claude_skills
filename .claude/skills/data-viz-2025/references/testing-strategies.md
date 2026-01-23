# Testing Data Visualizations: Comprehensive Strategies

Data visualizations are notoriously difficult to test. They combine visual appearance, data accuracy, interactivity, and accessibility. This guide covers all testing approaches.

## Testing Philosophy

### Three Dimensions of Testing

1. **Data Accuracy** - Does the chart represent data correctly?
2. **Visual Appearance** - Does it look right? (Regression testing)
3. **Interaction & Accessibility** - Can users interact with it? Is it accessible?

### The Testing Pyramid for Data Viz

```
        /\
       /  \      E2E Visual Tests (Percy, Chromatic)
      /────\     ← Expensive, slow, comprehensive
     /      \
    / Unit & \   Component + Integration Tests
   / Component\  ← Fast, focused, data accuracy
  /────────────\
 /              \ Property-based & Snapshot Tests
/________________\ ← Cheapest, fastest, catches regressions
```

## 1. Data Accuracy Testing

### Verify Rendered Elements Match Data

```typescript
import { render, screen } from '@testing-library/react';
import { BarChart } from './BarChart';

describe('BarChart - Data Accuracy', () => {
  const mockData = [
    { category: 'A', value: 10 },
    { category: 'B', value: 20 },
    { category: 'C', value: 15 }
  ];

  test('renders correct number of bars', () => {
    render(<BarChart data={mockData} />);

    const bars = screen.getAllByTestId('bar');
    expect(bars).toHaveLength(3);
  });

  test('bar heights are proportional to values', () => {
    render(<BarChart data={mockData} />);

    const bars = screen.getAllByTestId('bar');
    const heights = bars.map(b =>
      parseInt(b.getAttribute('height') || '0')
    );

    // B should be 2x A (20 vs 10)
    expect(heights[1]).toBe(heights[0] * 2);

    // C should be 1.5x A (15 vs 10)
    expect(heights[2]).toBe(heights[0] * 1.5);
  });

  test('labels match data categories', () => {
    render(<BarChart data={mockData} />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.getByText('C')).toBeInTheDocument();
  });
});
```

### Test Scale Calculations

```typescript
describe('BarChart - Scale Accuracy', () => {
  test('y-axis scale is correct', () => {
    const data = [
      { x: 'A', y: 0 },
      { x: 'B', y: 50 },
      { x: 'C', y: 100 }
    ];

    render(<BarChart data={data} height={200} />);

    const bars = screen.getAllByTestId('bar');

    // First bar (y=0) should be at bottom (height 200)
    expect(bars[0].getAttribute('y')).toBe('200');

    // Middle bar (y=50) should be at middle (height 100)
    expect(bars[1].getAttribute('y')).toBe('100');

    // Last bar (y=100) should be at top (height 0)
    expect(bars[2].getAttribute('y')).toBe('0');
  });
});
```

### Test Edge Cases

```typescript
describe('BarChart - Edge Cases', () => {
  test('handles empty data gracefully', () => {
    render(<BarChart data={[]} />);
    expect(screen.getByText(/no data/i)).toBeInTheDocument();
  });

  test('handles single data point', () => {
    render(<BarChart data={[{ x: 'A', y: 10 }]} />);
    const bars = screen.getAllByTestId('bar');
    expect(bars).toHaveLength(1);
  });

  test('handles negative values', () => {
    const data = [
      { x: 'A', y: -10 },
      { x: 'B', y: 20 }
    ];
    render(<BarChart data={data} />);

    // Verify baseline is drawn at zero
    expect(screen.getByTestId('baseline')).toBeInTheDocument();
  });

  test('handles very large values without overflow', () => {
    const data = [{ x: 'A', y: 1000000 }];
    render(<BarChart data={data} />);

    const bar = screen.getByTestId('bar');
    const height = parseInt(bar.getAttribute('height') || '0');

    // Should fit within chart bounds
    expect(height).toBeLessThanOrEqual(400);
  });
});
```

## 2. Visual Regression Testing

### Percy (Recommended for Most Projects)

Percy takes screenshots of your components and diffs them against baseline images.

**Setup:**

```bash
npm install --save-dev @percy/cli @percy/storybook
```

**Storybook Stories:**

```typescript
// BarChart.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { BarChart } from './BarChart';

const meta: Meta<typeof BarChart> = {
  title: 'Charts/BarChart',
  component: BarChart,
  parameters: {
    percy: {
      skip: false,
      widths: [375, 768, 1280] // Mobile, tablet, desktop
    }
  }
};

export default meta;
type Story = StoryObj<typeof BarChart>;

export const Default: Story = {
  args: {
    data: [
      { x: 'Jan', y: 10 },
      { x: 'Feb', y: 20 },
      { x: 'Mar', y: 15 }
    ]
  }
};

export const Empty: Story = {
  args: {
    data: []
  }
};

export const LargeDataset: Story = {
  args: {
    data: Array.from({ length: 50 }, (_, i) => ({
      x: `Item ${i}`,
      y: Math.random() * 100
    }))
  }
};

export const DarkMode: Story = {
  args: {
    data: [
      { x: 'Jan', y: 10 },
      { x: 'Feb', y: 20 }
    ]
  },
  parameters: {
    backgrounds: { default: 'dark' }
  }
};
```

**Run Percy:**

```bash
# Build Storybook
npm run build-storybook

# Take snapshots
npx percy storybook ./storybook-static
```

**CI Integration (GitHub Actions):**

```yaml
# .github/workflows/visual-tests.yml
name: Visual Tests
on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build-storybook
      - run: npx percy storybook ./storybook-static
        env:
          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
```

### Chromatic (Best for Storybook-First Teams)

Chromatic is built specifically for Storybook with tighter integration.

**Setup:**

```bash
npm install --save-dev chromatic
```

**Run:**

```bash
npx chromatic --project-token=<your-token>
```

**Benefits over Percy:**
- Automatic Storybook detection
- Component-level testing
- Interaction testing support
- TurboSnap (only tests changed components)

### Playwright Visual Comparisons (For E2E Tests)

```typescript
// chart.visual.spec.ts
import { test, expect } from '@playwright/test';

test('bar chart renders correctly', async ({ page }) => {
  await page.goto('/charts/bar');

  // Wait for chart to render
  await page.waitForSelector('[data-testid="bar-chart"]');

  // Take screenshot
  await expect(page).toHaveScreenshot('bar-chart-default.png', {
    maxDiffPixels: 100 // Allow small differences
  });
});

test('chart updates on filter change', async ({ page }) => {
  await page.goto('/dashboard');

  // Initial state
  await expect(page).toHaveScreenshot('chart-before-filter.png');

  // Apply filter
  await page.click('[data-testid="filter-button"]');
  await page.waitForTimeout(500); // Wait for animation

  // After filter
  await expect(page).toHaveScreenshot('chart-after-filter.png');
});
```

## 3. Interaction Testing

### User Interactions

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('BarChart - Interactions', () => {
  test('shows tooltip on hover', async () => {
    const user = userEvent.setup();
    render(<BarChart data={mockData} />);

    const bar = screen.getAllByTestId('bar')[0];

    // Hover over bar
    await user.hover(bar);

    // Tooltip appears
    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText(/value: 10/i)).toBeInTheDocument();
    });
  });

  test('hides tooltip on mouse leave', async () => {
    const user = userEvent.setup();
    render(<BarChart data={mockData} />);

    const bar = screen.getAllByTestId('bar')[0];

    await user.hover(bar);
    await waitFor(() => expect(screen.getByRole('tooltip')).toBeInTheDocument());

    await user.unhover(bar);
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  test('calls onClick handler when bar is clicked', async () => {
    const handleClick = jest.fn();
    render(<BarChart data={mockData} onBarClick={handleClick} />);

    const bar = screen.getAllByTestId('bar')[1];
    fireEvent.click(bar);

    expect(handleClick).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'B', value: 20 })
    );
  });
});
```

### Keyboard Navigation

```typescript
describe('BarChart - Keyboard Navigation', () => {
  test('bars are focusable via Tab key', async () => {
    const user = userEvent.setup();
    render(<BarChart data={mockData} />);

    // Tab to first bar
    await user.tab();
    expect(screen.getAllByTestId('bar')[0]).toHaveFocus();

    // Tab to second bar
    await user.tab();
    expect(screen.getAllByTestId('bar')[1]).toHaveFocus();
  });

  test('Enter key activates bar', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<BarChart data={mockData} onBarClick={handleClick} />);

    await user.tab(); // Focus first bar
    await user.keyboard('{Enter}');

    expect(handleClick).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'A', value: 10 })
    );
  });
});
```

## 4. Accessibility Testing

### Automated Accessibility Tests

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('BarChart - Accessibility', () => {
  test('has no axe violations', async () => {
    const { container } = render(<BarChart data={mockData} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('has proper ARIA labels', () => {
    render(<BarChart data={mockData} title="Sales by Month" />);

    // Chart container has role
    expect(screen.getByRole('img')).toBeInTheDocument();

    // Title is associated
    expect(screen.getByLabelText(/sales by month/i)).toBeInTheDocument();
  });

  test('provides text alternative for screen readers', () => {
    render(<BarChart data={mockData} />);

    // Data table alternative is available
    expect(screen.getByRole('table', { hidden: true })).toBeInTheDocument();
  });
});
```

### Color Contrast Verification

```typescript
test('meets color contrast requirements', () => {
  render(<BarChart data={mockData} />);

  const bar = screen.getAllByTestId('bar')[0];
  const barColor = window.getComputedStyle(bar).fill;

  // Use color-contrast library or manual calculation
  const contrastRatio = calculateContrastRatio(barColor, '#ffffff');

  // WCAG AA requires 3:1 for large text/graphics
  expect(contrastRatio).toBeGreaterThanOrEqual(3);
});
```

## 5. Performance Testing

### Rendering Performance

```typescript
describe('BarChart - Performance', () => {
  test('renders large dataset in < 500ms', () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      x: `Item ${i}`,
      y: Math.random() * 100
    }));

    const start = performance.now();
    render(<BarChart data={largeData} />);
    const end = performance.now();

    expect(end - start).toBeLessThan(500);
  });

  test('does not re-render on unrelated prop changes', () => {
    const { rerender } = render(
      <BarChart data={mockData} unrelatedProp="value1" />
    );

    const renderSpy = jest.spyOn(React, 'createElement');

    // Change unrelated prop
    rerender(<BarChart data={mockData} unrelatedProp="value2" />);

    // Chart should be memoized and not re-render
    expect(renderSpy).toHaveBeenCalledTimes(0);
  });
});
```

### Memory Leak Detection

```typescript
test('cleans up event listeners on unmount', () => {
  const { unmount } = render(<BarChart data={mockData} />);

  const initialListeners = getEventListeners(window).length;

  unmount();

  const finalListeners = getEventListeners(window).length;

  // Should remove all listeners
  expect(finalListeners).toBeLessThanOrEqual(initialListeners);
});
```

## 6. Snapshot Testing

Use snapshots to catch unintended changes in SVG output.

```typescript
import { render } from '@testing-library/react';

describe('BarChart - Snapshots', () => {
  test('matches snapshot', () => {
    const { container } = render(<BarChart data={mockData} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  test('matches snapshot with custom colors', () => {
    const { container } = render(
      <BarChart
        data={mockData}
        colors={['#d97706', '#7c3aed', '#059669']}
      />
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

**Note:** Snapshots are brittle. Use sparingly and update intentionally.

## 7. Cross-Browser Testing

### BrowserStack/Sauce Labs

```javascript
// wdio.conf.js
exports.config = {
  services: ['browserstack'],
  capabilities: [
    {
      browserName: 'chrome',
      'bstack:options': {
        os: 'Windows',
        osVersion: '11'
      }
    },
    {
      browserName: 'safari',
      'bstack:options': {
        os: 'OS X',
        osVersion: 'Ventura'
      }
    }
  ],
  specs: ['./test/charts/**/*.spec.ts']
};
```

## 8. Property-Based Testing

Test with randomly generated data to find edge cases.

```typescript
import { fc } from 'fast-check';

describe('BarChart - Property-Based Tests', () => {
  test('handles any array of valid data points', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            x: fc.string(),
            y: fc.integer({ min: 0, max: 1000 })
          }),
          { minLength: 1, maxLength: 100 }
        ),
        (data) => {
          const { container } = render(<BarChart data={data} />);

          // Should render without crashing
          expect(container.querySelector('svg')).toBeInTheDocument();

          // Number of bars should match data length
          const bars = container.querySelectorAll('[data-testid="bar"]');
          expect(bars.length).toBe(data.length);
        }
      )
    );
  });
});
```

## Testing Checklist

Before shipping a chart component:

### Data Accuracy
- [ ] Correct number of elements rendered
- [ ] Visual encoding proportional to data values
- [ ] Labels match data
- [ ] Scales are accurate
- [ ] Edge cases handled (empty, single point, negatives, huge values)

### Visual Appearance
- [ ] Percy/Chromatic snapshots passing
- [ ] Renders correctly on mobile, tablet, desktop
- [ ] Dark mode support tested
- [ ] Animations don't break visual tests

### Interactions
- [ ] Hover states work
- [ ] Click handlers fire correctly
- [ ] Keyboard navigation functional
- [ ] Touch gestures work on mobile

### Accessibility
- [ ] No axe violations
- [ ] Proper ARIA roles and labels
- [ ] Keyboard accessible
- [ ] Screen reader compatible
- [ ] Color contrast ≥3:1
- [ ] Respects prefers-reduced-motion
- [ ] Provides data table alternative

### Performance
- [ ] Renders large datasets in &lt;500ms
- [ ] No unnecessary re-renders
- [ ] No memory leaks
- [ ] Bundle size reasonable

### Cross-Browser
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Works on iOS Safari, Android Chrome
- [ ] No console errors

## Continuous Integration Example

```yaml
# .github/workflows/chart-tests.yml
name: Chart Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3

  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build-storybook
      - run: npx percy storybook ./storybook-static
        env:
          PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}

  accessibility-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:a11y

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:perf
```

## Sources

- [Awesome Visual Regression Testing | GitHub](https://github.com/mojoaxel/awesome-regression-testing)
- [Percy - Automated Visual Testing](https://percy.io/)
- [Visual Testing - Functionize](https://www.functionize.com/visual-testing)
- [Top 10 Visual Testing Tools | Applitools](https://applitools.com/blog/top-10-visual-testing-tools/)
- [Visual Testing in Cypress | Cypress Docs](https://docs.cypress.io/app/tooling/visual-testing)

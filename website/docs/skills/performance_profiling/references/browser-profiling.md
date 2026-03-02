---
title: Browser Profiling Reference
sidebar_label: Browser Profiling Reference
sidebar_position: 2
---
# Browser Profiling Reference

Detailed reference for browser performance profiling: Chrome DevTools, Lighthouse, React Profiler, and Core Web Vitals.

---

## Chrome Performance Tab Workflow

### Recording a Profile

1. Open DevTools → **Performance** tab
2. Check "Screenshots" to see UI state during the recording
3. Click the **record** button (circle)
4. Perform the slow action (scroll, click, page load)
5. Click **Stop**

### Reading the Flame Chart

The Performance panel has three main areas:

**Summary** (top): CPU utilization by category (Scripting, Rendering, Painting, Other, Idle)

**Flame Chart** (middle): Call stacks over time. Time runs left-to-right. Stack depth grows downward.
- Wide bars = long duration
- Red triangle in top-right corner = "long task" (&gt;50ms, blocks main thread)
- Yellow = JavaScript execution
- Purple = Rendering (style recalc, layout)
- Green = Painting

**Bottom-up / Call Tree** (bottom): Aggregated view of where time was spent.
- **Bottom-up**: Start from leaf functions (where time was actually spent) and trace up
- **Call Tree**: Start from entry points and trace down
- **Event Log**: Chronological list of all events

### Identifying Long Tasks

```
Filter: Tasks > 50ms (check "Long Tasks" checkbox)
```

Long tasks (&gt;50ms) block the main thread and cause input latency. Find them, click them, look at the flame chart to see what code ran.

Common long task sources:
- `JSON.parse` or `JSON.stringify` on large payloads
- Complex layout operations (many DOM elements, CSS affecting layout)
- Synchronous XHR (never do this)
- Heavy JavaScript computation without breaking into chunks

---

## Core Web Vitals

### The Three Metrics

| Metric | Threshold | Measures |
|--------|-----------|---------|
| **LCP** (Largest Contentful Paint) | &lt; 2.5s good, > 4s poor | Load performance |
| **INP** (Interaction to Next Paint) | &lt; 200ms good, > 500ms poor | Responsiveness (replaced FID in 2024) |
| **CLS** (Cumulative Layout Shift) | &lt; 0.1 good, > 0.25 poor | Visual stability |

### Measuring in Chrome DevTools

**LCP**: Performance tab → look for "LCP" marker on the timeline. Or: Lighthouse → "Largest Contentful Paint" in the Metrics section.

**INP**: DevTools → Performance Insights panel → "Responsiveness" section shows INP candidates. Or: add `web-vitals` library:

```js
import { onINP, onLCP, onCLS } from 'web-vitals';

onINP(({ value, rating }) => {
  console.log(`INP: ${value}ms (${rating})`);
});

onLCP(({ value, rating }) => {
  console.log(`LCP: ${value}ms (${rating})`);
});

onCLS(({ value, rating }) => {
  console.log(`CLS: ${value} (${rating})`);
});
```

**CLS**: Performance tab → look for "Layout Shift" events. Each shift shows what element moved and by how much.

### Improving LCP

1. **Preload the LCP image**: `<link rel="preload" as="image" href="/hero.webp">`
2. **Eliminate render-blocking resources**: move non-critical CSS to `<link media="print">` or inline critical CSS
3. **Use a CDN for static assets**
4. **Use `fetchpriority="high"` on the LCP image**: `<img src="hero.webp" fetchpriority="high">`
5. **Compress and size images correctly**: use `srcset`, serve WebP/AVIF

### Improving INP

INP is about interaction responsiveness. Every click, keypress, or tap starts an "interaction." The INP is the worst interaction (at 98th percentile).

```js
// Break long tasks with scheduler.yield() (Chrome 115+)
async function processLargeDataset(items) {
  for (const item of items) {
    process(item);
    if (/* periodically */) {
      await scheduler.yield();  // Yield to browser, allow interactions to process
    }
  }
}

// Or use MessageChannel to yield
function yieldToMain() {
  return new Promise(resolve => {
    const channel = new MessageChannel();
    channel.port1.onmessage = resolve;
    channel.port2.postMessage(undefined);
  });
}
```

### Improving CLS

CLS is caused by elements that shift position after initial render.

Common causes:
- Images without `width` and `height` attributes (browser doesn't reserve space)
- Ads, embeds, iframes loaded asynchronously without reserved space
- Content injected above existing content (notifications, cookie banners)
- Web fonts causing FOUT (flash of unstyled text) that shifts text

```html
<!-- Always include width and height on images -->
<img src="photo.jpg" width="800" height="600" alt="...">

<!-- Reserve space for dynamic content -->
<div style="min-height: 90px">
  <!-- Ad loads here -->
</div>
```

---

## Lighthouse

### Running Lighthouse

```bash
# CLI (most reproducible — eliminates browser extension interference)
npm install -g lighthouse
lighthouse https://example.com --output html --output-path report.html

# With specific settings
lighthouse https://example.com \
  --only-categories=performance \
  --throttling-method=simulate \
  --output json \
  --output-path metrics.json
```

### Lighthouse CI Integration

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: push

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install && npm run build
      - uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/products
          budgetPath: ./lighthouse-budget.json
          uploadArtifacts: true
```

```json
// lighthouse-budget.json
[
  {
    "path": "/*",
    "timings": [
      { "metric": "first-contentful-paint", "budget": 2000 },
      { "metric": "largest-contentful-paint", "budget": 2500 },
      { "metric": "interactive", "budget": 3500 }
    ],
    "resourceSizes": [
      { "resourceType": "script", "budget": 300 },
      { "resourceType": "image", "budget": 500 }
    ]
  }
]
```

---

## Layout Thrashing

Layout thrashing occurs when JavaScript alternately reads and writes to the DOM within a single frame, forcing the browser to recalculate layout repeatedly.

### What Causes It

Reading layout-inducing properties forces a synchronous layout:
- `offsetWidth`, `offsetHeight`, `offsetTop`, `offsetLeft`
- `scrollWidth`, `scrollHeight`, `scrollTop`, `scrollLeft`
- `clientWidth`, `clientHeight`
- `getBoundingClientRect()`
- `getComputedStyle()`

If you read one of these after writing to the DOM, the browser must flush and recalculate layout before it can return the value.

### Example of Thrashing

```js
// THRASHING: reads layout after each write
const items = document.querySelectorAll('.item');
items.forEach(item => {
  const height = item.offsetHeight;  // Forces layout recalc
  item.style.height = (height + 10) + 'px';  // Write
  // Next loop iteration: read again = another layout recalc
});

// FIXED: batch reads, then batch writes
const items = document.querySelectorAll('.item');
const heights = Array.from(items).map(item => item.offsetHeight);  // All reads
items.forEach((item, i) => {
  item.style.height = (heights[i] + 10) + 'px';  // All writes
});
```

### Detecting in Chrome DevTools

In the Performance tab, look for:
- Purple "Recalculate Style" or "Layout" bars that repeat rapidly in a loop
- "Forced reflow" warnings in the console
- The "Recalculate Style" annotation "Recalculate style — Forced reflow is a likely performance bottleneck"

### Using requestAnimationFrame

```js
// Schedule DOM writes in requestAnimationFrame
function updateElements() {
  const measurements = [];

  // Phase 1: Read (outside rAF or all at once before writes)
  elements.forEach(el => {
    measurements.push(el.getBoundingClientRect());
  });

  // Phase 2: Write (inside rAF)
  requestAnimationFrame(() => {
    elements.forEach((el, i) => {
      el.style.transform = `translateY(${measurements[i].top}px)`;
    });
  });
}
```

---

## React Profiler Deep Dive

### DevTools Profiler

**Flame Chart view**: Each row is a component. Width = render time. Color = how long relative to other renders.

**Ranked Chart view**: Components sorted by render time, longest first. Good for quickly identifying the slowest component.

**Why did this render?**
- Click a component in flame chart
- "Why did this render?" section shows which props, state, or hooks changed
- "(owner) rendered" means the parent re-rendered (this component may or may not have needed to)

### Programmatic Profiling

```jsx
import { Profiler } from 'react';

function onRenderCallback(
  id,          // the "id" prop of the Profiler
  phase,       // "mount" or "update"
  actualDuration,   // time rendering committed update
  baseDuration,     // estimated time to render without memoization
  startTime,   // when React began rendering this update
  commitTime   // when React committed this update
) {
  console.log(`${id} (${phase}): ${actualDuration.toFixed(2)}ms`);
}

<Profiler id="ProductList" onRender={onRenderCallback}>
  <ProductList products={products} />
</Profiler>
```

`actualDuration` vs `baseDuration`: if actual <&lt; base, memoization is working. If they are equal, React is always re-rendering from scratch.

### React DevTools Profiler: Commit-by-Commit

Each "commit" is one React render cycle. Navigate between commits using the arrow buttons. Look for:
- Commits that take &gt;16ms (will drop a frame at 60fps)
- Components that render in every commit but whose props did not change
- Deep trees where every level renders even when only a leaf changed

### Common React Performance Fixes

```jsx
// 1. Prevent unnecessary context renders
// Instead of: value={useMemo(() => ({ a, b }), [a, b])}
// Create a stable reference for unchanged parts
const StableContext = createContext(null);

function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // dispatch is stable — memoize separately from state
  const stable = useMemo(() => ({ dispatch }), []);

  return (
    <StableContext.Provider value={state}>
      <DispatchContext.Provider value={stable}>
        {children}
      </DispatchContext.Provider>
    </StableContext.Provider>
  );
}

// 2. Move expensive computation into a worker
const worker = new Worker(new URL('./sort.worker.js', import.meta.url));

function useSortedData(data) {
  const [sorted, setSorted] = useState([]);
  useEffect(() => {
    worker.postMessage(data);
    worker.onmessage = (e) => setSorted(e.data);
  }, [data]);
  return sorted;
}

// 3. Transition API for non-urgent updates
import { useTransition } from 'react';

function Search({ data }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e) => {
    setQuery(e.target.value);  // Urgent: update input immediately
    startTransition(() => {
      setResults(filterData(data, e.target.value));  // Non-urgent: can be interrupted
    });
  };

  return (
    <>
      <input value={query} onChange={handleSearch} />
      {isPending ? <Spinner /> : <ResultsList results={results} />}
    </>
  );
}
```

---

## Bundle Analysis

### webpack-bundle-analyzer

```bash
npm install --save-dev webpack-bundle-analyzer

# Next.js
ANALYZE=true next build
```

```js
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer({});
```

### Vite Bundle Analysis

```bash
npx vite-bundle-visualizer
```

### What to Look For

- Duplicate packages (lodash and lodash-es both bundled)
- Large libraries used for a small feature (moment.js for date formatting — use date-fns instead)
- Missing tree-shaking (entire library imported when only one function is used)
- Large third-party scripts (tracking, analytics) in the critical path

```js
// Instead of: import _ from 'lodash';
// Use named imports (tree-shakeable):
import { debounce } from 'lodash-es';

// Or just write it:
const debounce = (fn, ms) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
};
```

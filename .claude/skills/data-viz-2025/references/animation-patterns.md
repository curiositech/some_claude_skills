# Animation Patterns for Data Visualizations

Motion communicates. In data visualizations, animations guide attention, reveal relationships, and delight users. This guide covers modern animation patterns for 2025.

## Animation Philosophy

### Why Animate Data Viz?

1. **Draw Attention** - Guide the eye to insights
2. **Show Relationships** - Morphing between views reveals structure
3. **Reduce Cognitive Load** - Smooth transitions help users track changes
4. **Premium Feel** - Thoughtful motion = professional application

### When NOT to Animate

- ❌ **Print visualizations** - Static medium
- ❌ **Accessibility concern** - When `prefers-reduced-motion: reduce`
- ❌ **Performance critical** - Large datasets (&gt;10K points)
- ❌ **Just decoration** - Motion without purpose

## Spring Physics vs. Easing Curves

### Linear Easing (❌ Never Use)

```typescript
// ❌ BAD - Feels robotic
transition: 'all 0.3s linear'
```

### Ease-Out (⚠️ Acceptable)

```typescript
// ⚠️ OK - But not exciting
transition: 'all 0.3s ease-out'
```

### Spring Physics (✅ Best)

```typescript
// ✅ GOOD - Natural, bouncy, delightful
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    type: "spring",
    stiffness: 300,
    damping: 30
  }}
>
  {chart}
</motion.div>
```

**Why springs feel better:**
- Mimic real-world physics
- No artificial "stopping point" (ease curves feel abrupt)
- Automatically adjust to interruptions (user interrupts animation mid-way)

## Essential Animation Patterns

### 1. Entrance Animations (Draw-In)

**Line Chart Drawing In:**

```typescript
import { motion } from 'framer-motion';

const LineChart = ({ data }) => {
  return (
    <svg width={640} height={400}>
      <motion.path
        d={generatePath(data)}
        fill="none"
        stroke="#d97706"
        strokeWidth={2}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
    </svg>
  );
};
```

**Bars Growing Up:**

```typescript
const BarChart = ({ data }) => {
  return (
    <svg width={640} height={400}>
      {data.map((d, i) => (
        <motion.rect
          key={d.category}
          x={i * 40}
          y={400 - d.value}
          width={30}
          height={d.value}
          fill="#d97706"
          initial={{ height: 0, y: 400 }}
          animate={{ height: d.value, y: 400 - d.value }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: i * 0.1 // Stagger
          }}
        />
      ))}
    </svg>
  );
};
```

### 2. Staggered Animations

Animate multiple elements with a delay between each.

```typescript
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.05  // 50ms between each child
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div variants={container} initial="hidden" animate="show">
  {data.map(d => (
    <motion.div key={d.id} variants={item}>
      {d.value}
    </motion.div>
  ))}
</motion.div>
```

### 3. Data Update Transitions

**Smooth Value Changes:**

```typescript
import { animate } from 'framer-motion';
import { useEffect, useState } from 'react';

const AnimatedNumber = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 0.5,
      onUpdate: v => setDisplayValue(Math.round(v))
    });

    return controls.stop;
  }, [value]);

  return <span>{displayValue.toLocaleString()}</span>;
};
```

**Morphing Bars:**

```typescript
const Bar = ({ height, y }: Props) => (
  <motion.rect
    animate={{ height, y }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  />
);
```

### 4. Tooltip Animations

**Fade + Scale:**

```typescript
<motion.div
  className="tooltip"
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.8 }}
  transition={{ duration: 0.15 }}
>
  {content}
</motion.div>
```

**Slide From Side:**

```typescript
<motion.div
  className="tooltip"
  initial={{ opacity: 0, x: -10 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -10 }}
  transition={{ type: "spring", stiffness: 400, damping: 30 }}
>
  {content}
</motion.div>
```

### 5. Hover Micro-interactions

**Scale on Hover:**

```typescript
<motion.rect
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 30 }}
/>
```

**Glow Effect:**

```typescript
<motion.circle
  whileHover={{
    boxShadow: "0 0 20px rgba(217, 119, 6, 0.6)"
  }}
/>
```

**Lift Effect (Chart Cards):**

```typescript
<motion.div
  className="chart-card"
  whileHover={{
    y: -4,
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
  }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
>
  {chart}
</motion.div>
```

### 6. Loading States (Skeleton Loaders)

**Shimmer Effect:**

```typescript
<motion.rect
  x={0}
  y={0}
  width={200}
  height={300}
  fill="url(#shimmer)"
  rx={4}
/>

<defs>
  <linearGradient id="shimmer">
    <stop offset="0%" stopColor="#f0f0f0" />
    <motion.stop
      offset="50%"
      stopColor="#e0e0e0"
      animate={{
        offset: ["0%", "100%"]
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "linear"
      }}
    />
    <stop offset="100%" stopColor="#f0f0f0" />
  </linearGradient>
</defs>
```

**Pulse:**

```typescript
<motion.div
  className="skeleton-bar"
  animate={{ opacity: [0.5, 1, 0.5] }}
  transition={{
    duration: 1.5,
    repeat: Infinity,
    ease: "easeInOut"
  }}
/>
```

### 7. Filter/Sort Animations

**Layout Animations (Auto-animate):**

```typescript
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence>
  {filteredData.map(item => (
    <motion.div
      key={item.id}
      layout  // Auto-animate position changes
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring" }}
    >
      {item.content}
    </motion.div>
  ))}
</AnimatePresence>
```

### 8. Scrollytelling Animations

**Animate on Scroll:**

```typescript
import { motion, useScroll, useTransform } from 'framer-motion';

const ScrollChart = () => {
  const { scrollYProgress } = useScroll();

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return (
    <motion.div style={{ opacity, scale }}>
      {chart}
    </motion.div>
  );
};
```

**Reveal Data Points as User Scrolls:**

```typescript
const DataPoint = ({ value, scrollProgress }: Props) => {
  const opacity = useTransform(scrollProgress, [0.3, 0.5], [0, 1]);
  const y = useTransform(scrollProgress, [0.3, 0.5], [20, 0]);

  return (
    <motion.circle
      style={{ opacity, y }}
      cx={x}
      cy={y}
      r={5}
    />
  );
};
```

## Advanced Patterns

### 9. Morphing Between Chart Types

Transform a bar chart into a line chart:

```typescript
import { motion } from 'framer-motion';

const MorphingChart = ({ type }: { type: 'bar' | 'line' }) => {
  return (
    <svg width={640} height={400}>
      <AnimatePresence mode="wait">
        {type === 'bar' ? (
          <motion.g
            key="bars"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Bar elements */}
          </motion.g>
        ) : (
          <motion.g
            key="line"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Line element */}
          </motion.g>
        )}
      </AnimatePresence>
    </svg>
  );
};
```

### 10. Particle Effects

Celebrate milestones with confetti:

```typescript
import confetti from 'canvas-confetti';

const celebrate = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
};

<button onClick={() => {
  updateData();
  celebrate();  // Visual reward for hitting goal
}}>
  Update Chart
</button>
```

### 11. Path Animations (Complex Shapes)

Animate along a path:

```typescript
<motion.circle
  cx={0}
  cy={0}
  r={5}
  fill="#d97706"
>
  <animateMotion
    dur="3s"
    repeatCount="indefinite"
    path="M 0 0 L 100 100 L 200 50 L 300 150"
  />
</motion.circle>
```

## Accessibility: Respecting Reduced Motion

**Always check `prefers-reduced-motion`:**

```typescript
import { useReducedMotion } from 'framer-motion';

const Chart = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.5,
        type: shouldReduceMotion ? undefined : "spring"
      }}
    >
      {chart}
    </motion.div>
  );
};
```

**CSS Media Query:**

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Performance Optimization

### Use `will-change` for GPU Acceleration

```css
.animated-chart {
  will-change: transform, opacity;
}
```

### Limit Concurrent Animations

```typescript
// ❌ BAD - Animating 1000 elements at once
{data.map((d, i) => (
  <motion.rect animate={{ ... }} />
))}

// ✅ GOOD - Animate in batches or use Canvas
{data.length < 100 ? (
  data.map(d => <motion.rect animate={{ ... }} />)
) : (
  <CanvasChart data={data} />  // No individual SVG elements
)}
```

### Debounce Rapid Updates

```typescript
import { useDebouncedValue } from '@mantine/hooks';

const Chart = ({ data }: Props) => {
  const [debouncedData] = useDebouncedValue(data, 200);

  return <AnimatedChart data={debouncedData} />;
};
```

## Animation Timing Reference

| Duration | Use Case |
|----------|----------|
| 0-100ms | Micro-interactions (hover, tap feedback) |
| 100-300ms | Small transitions (tooltip appear, button states) |
| 300-500ms | Medium transitions (data updates, filters) |
| 500ms-1s | Large transitions (chart type changes, page transitions) |
| 1-2s | Entrance animations (first render, data loading complete) |
| 2s+ | Scrollytelling, storytelling sequences |

## Common Mistakes

### ❌ Over-Animation

```typescript
// Too much motion - distracting
<motion.div
  animate={{
    scale: [1, 1.2, 0.8, 1.1, 0.9, 1],
    rotate: [0, 10, -10, 5, -5, 0],
    x: [0, 50, -50, 0]
  }}
  transition={{ duration: 0.5 }}
/>
```

### ❌ Inconsistent Timing

```typescript
// Different durations for similar elements - jarring
<motion.rect transition={{ duration: 0.3 }} />
<motion.rect transition={{ duration: 0.8 }} />
<motion.rect transition={{ duration: 0.5 }} />
```

### ❌ Animations Without Purpose

```typescript
// Why is this rotating? No semantic meaning.
<motion.text animate={{ rotate: 360 }} />
```

## Best Practices Summary

1. **Use spring physics** - More natural than easing curves
2. **Stagger for multiple elements** - Don't animate all at once
3. **Respect `prefers-reduced-motion`** - Accessibility requirement
4. **Keep durations consistent** - Similar elements = similar timing
5. **Purpose over decoration** - Every animation should communicate
6. **Test performance** - Large datasets may need Canvas or no animation
7. **Loading states > spinners** - Skeleton loaders are better UX

## Framer Motion Cheat Sheet

```typescript
// Basic animation
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
/>

// Spring physics
transition={{ type: "spring", stiffness: 300, damping: 30 }}

// Stagger children
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

// Hover/Tap
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
/>

// Layout animations (auto-animate position)
<motion.div layout />

// Scroll-driven animations
const { scrollYProgress } = useScroll();
const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

// Reduced motion
const shouldReduceMotion = useReducedMotion();
```

## Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [React Spring](https://www.react-spring.dev/)
- [Theater.js](https://www.theatrejs.com/) - For complex animation sequences
- [Lottie](https://lottiefiles.com/) - For After Effects animations
- [GSAP](https://gsap.com/) - Industry-standard animation library

## Example: Complete Animated Dashboard Card

```typescript
import { motion, useReducedMotion } from 'framer-motion';

export const DashboardCard = ({ title, value, trend, data }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: shouldReduceMotion ? undefined : "spring",
        duration: shouldReduceMotion ? 0 : 0.5
      }}
      whileHover={shouldReduceMotion ? undefined : {
        y: -4,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
      }}
    >
      <h3>{title}</h3>

      <motion.div
        className="value"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <AnimatedNumber value={value} />
      </motion.div>

      <motion.div
        className="trend"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
      </motion.div>

      <svg width="100%" height={80}>
        <motion.path
          d={generateSparkline(data)}
          fill="none"
          stroke="#d97706"
          strokeWidth={2}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
        />
      </svg>
    </motion.div>
  );
};
```

Remember: **Motion with purpose > Motion for motion's sake**

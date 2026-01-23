# React/JavaScript Design Patterns

Deep reference for modern JavaScript UI patterns with native-feel animations and micro-interactions.

## React: Micro-interactions with Framer Motion

```jsx
import { motion } from 'framer-motion';

const DelightfulCard = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="card"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
    >
      <motion.div
        className="card-content"
        animate={{
          y: isHovered ? -4 : 0,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="card-image-wrapper">
          <img src={item.image} alt={item.title} />
          <motion.div
            className="card-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
        </div>

        <div className="card-text">
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </div>

        <motion.button
          className="card-action"
          initial={{ opacity: 0, x: -10 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            x: isHovered ? 0 : -10
          }}
          transition={{ delay: 0.1 }}
        >
          Learn more →
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
```

## Vue: Organic State Transitions

```vue
<template>
  <div class="breathtaking-list">
    <TransitionGroup name="stagger" tag="div" class="list-container">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        :style="{ transitionDelay: `${index * 50}ms` }"
        class="list-item"
        @mouseenter="handleHover(item.id)"
        @mouseleave="hoveredId = null"
      >
        <div class="item-glow" :class="{ active: hoveredId === item.id }"></div>
        <div class="item-content">
          <h4>{{ item.title }}</h4>
          <p>{{ item.description }}</p>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const items = ref([...]);
const hoveredId = ref(null);

const handleHover = (id) => {
  hoveredId.value = id;
  // Subtle haptic feedback if supported
  if ('vibrate' in navigator) {
    navigator.vibrate(10);
  }
};
</script>

<style scoped>
.stagger-enter-active,
.stagger-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stagger-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.stagger-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.item-glow {
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.item-glow.active {
  opacity: 1;
}
</style>
```

## Web App Native Feel Checklist

### Performance
- 60fps animations using `transform` and `opacity`
- Optimistic updates for instant feedback
- CSS containment for layout performance
- Virtualized lists for large datasets

### Native Patterns
- Implement pull-to-refresh
- Add install prompt (PWA)
- Use Web Animations API
- Implement proper focus management
- Support reduced motion preferences

### Animation Libraries

**Framer Motion** (React):
```jsx
import { motion, AnimatePresence } from 'framer-motion';

// Spring physics
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: "spring", stiffness: 300 }}
/>
```

**GSAP** (Any framework):
```javascript
gsap.to(".element", {
  duration: 0.6,
  y: 0,
  ease: "elastic.out(1, 0.5)"
});
```

**react-spring**:
```jsx
const props = useSpring({
  to: { opacity: 1, transform: 'translateY(0)' },
  from: { opacity: 0, transform: 'translateY(20px)' },
  config: { tension: 300, friction: 20 }
});
```

## Responsive Design Patterns

### Mobile-First Breakpoints
```css
/* Mobile first */
.container {
  padding: 16px;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 24px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
    max-width: 1200px;
  }
}
```

### Touch-Friendly Targets
```css
/* Minimum 44px touch targets */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}

/* Generous spacing between interactive elements */
.nav-items {
  gap: 16px;
}
```

### Progressive Enhancement
```javascript
// Feature detection
if ('IntersectionObserver' in window) {
  // Use intersection observer for lazy loading
} else {
  // Fallback to eager loading
}

// Reduced motion
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (prefersReducedMotion) {
  // Use instant transitions
}
```

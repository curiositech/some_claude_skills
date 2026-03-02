---
name: component-template-generator
description: Generates starter component code using design tokens. Creates React/Vue/Svelte components with proper token usage, variants, and accessibility built in.
allowed-tools: Read,Write,Glob
metadata:
  category: Development
  pairs-with:
  - skill: design-system-generator
    reason: Uses generated tokens in component code
  - skill: frontend-developer
    reason: Implement and customize generated components
  - skill: design-system-documenter
    reason: Document generated components
  tags:
  - components
  - react
  - vue
  - svelte
  - templates
---

# Component Template Generator

Create production-ready component code that properly uses your design tokens. Generates React, Vue, or Svelte components with variants, accessibility, and token integration.

## Quick Start

**Minimal example - generate a Button component:**

```typescript
// Input: Trend ID + Component type
// Output: Complete component with token usage

// Button.tsx (neobrutalism)
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', children }: ButtonProps) {
  return (
    <button className={cn(
      'border-3 border-brutal-black font-display transition-all duration-100',
      'shadow-brutal hover:shadow-brutal-hover hover:-translate-x-0.5 hover:-translate-y-0.5',
      'active:shadow-brutal-active active:translate-x-0.5 active:translate-y-0.5',
      // Variants
      variant === 'primary' && 'bg-brutal-red text-white',
      variant === 'secondary' && 'bg-brutal-cream text-brutal-black',
      variant === 'ghost' && 'bg-transparent border-transparent shadow-none',
      // Sizes
      size === 'sm' && 'px-3 py-1.5 text-sm',
      size === 'md' && 'px-4 py-2 text-base',
      size === 'lg' && 'px-6 py-3 text-lg',
    )}>
      {children}
    </button>
  );
}
```

**Key principle**: Components use semantic token names, not hardcoded values.

## Core Mission

Generate component templates that:
1. Use design tokens correctly (semantic names, not hex values)
2. Include common variants (size, color, state)
3. Have accessibility built in (ARIA, keyboard, focus)
4. Are framework-idiomatic (React hooks, Vue composition, Svelte stores)

## When to Use

✅ Use when:
- Starting a component library with generated tokens
- Need consistent token usage across components
- Want accessibility baked into templates
- Bootstrapping a design system implementation

❌ Do NOT use when:
- Need tokens only (use design-system-generator)
- Need complete UI library (use shadcn/ui or similar)
- Customizing existing components (just edit them)

## Component Catalog

### Core Components

| Component | Variants | Accessibility |
|-----------|----------|---------------|
| Button | primary, secondary, ghost, destructive | ✅ Focus ring, disabled state |
| Input | default, error, disabled | ✅ Label association, error announcement |
| Card | default, interactive, highlighted | ✅ Semantic article/section |
| Badge | default, success, warning, error | ✅ Status announcements |

### Layout Components

| Component | Variants | Features |
|-----------|----------|----------|
| Container | default, narrow, wide | Max-width + padding |
| Stack | vertical, horizontal | Gap using spacing tokens |
| Grid | 2-col, 3-col, 4-col, auto | Responsive breakpoints |

### Interactive Components

| Component | Variants | Accessibility |
|-----------|----------|---------------|
| Dialog | default, alert | ✅ Focus trap, escape close |
| Dropdown | default | ✅ Keyboard navigation |
| Tabs | default | ✅ Arrow key navigation |
| Toggle | default | ✅ Switch role |

## Template Structure

Each component template includes:

```typescript
// 1. Type definitions
interface ComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  // ... other props
}

// 2. Component implementation
export function Component({ variant, size, ...props }: ComponentProps) {
  // Token-based styling
  // Accessibility attributes
  // Event handlers
}

// 3. Subcomponents (if applicable)
Component.Header = function Header() { /* ... */ };
Component.Body = function Body() { /* ... */ };

// 4. Default export
export default Component;
```

## Framework Templates

### React + Tailwind

```tsx
// Uses: className, cn() utility, React.forwardRef for refs
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'border-3 border-brutal-black shadow-brutal',
        variant === 'primary' && 'bg-brutal-red',
        className
      )}
      {...props}
    />
  )
);
```

### React + CSS Variables

```tsx
// Uses: style prop with CSS variables, CSS modules
import styles from './Button.module.css';

export function Button({ variant = 'primary', ...props }) {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      style={{
        '--button-shadow': 'var(--shadow-md)',
        '--button-border': 'var(--border-width) solid var(--color-border)',
      }}
      {...props}
    />
  );
}
```

### Vue 3 + Composition API

```vue
<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
});

const classes = computed(() => [
  'border-3 border-brutal-black shadow-brutal',
  props.variant === 'primary' && 'bg-brutal-red',
  props.variant === 'secondary' && 'bg-brutal-cream',
]);
</script>

<template>
  <button :class="classes">
    <slot />
  </button>
</template>
```

### Svelte

```svelte
<script lang="ts">
  export let variant: 'primary' | 'secondary' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
</script>

<button
  class="border-3 border-brutal-black shadow-brutal"
  class:bg-brutal-red={variant === 'primary'}
  class:bg-brutal-cream={variant === 'secondary'}
  on:click
>
  <slot />
</button>
```

## Accessibility Patterns

### Focus Management

```tsx
// All interactive components include visible focus
'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
'focus-visible:ring-brutal-blue'
```

### Keyboard Navigation

```tsx
// Dropdown with keyboard support
function handleKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown': focusNext(); break;
    case 'ArrowUp': focusPrev(); break;
    case 'Escape': close(); break;
    case 'Enter': select(); break;
  }
}
```

### ARIA Attributes

```tsx
// Dialog with proper ARIA
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
```

## Trend-Specific Patterns

### Neobrutalism Components

```tsx
// Hard shadows, bold borders, transform on interaction
'border-3 border-black shadow-brutal'
'hover:shadow-brutal-hover hover:-translate-x-0.5 hover:-translate-y-0.5'
'active:shadow-brutal-active active:translate-x-0.5 active:translate-y-0.5'
```

### Glassmorphism Components

```tsx
// Frosted glass, subtle borders, backdrop blur
'bg-glass-white/10 backdrop-blur-glass'
'border border-glass-white/20'
'shadow-glass'
```

### Terminal Components

```tsx
// Monospace, green-on-black, CRT effects
'font-mono bg-term-bg text-term-green'
'border border-term-green/30'
'shadow-term-glow'
```

## Generation Workflow

```
1. design-system-generator → tokens (Tailwind/CSS)
2. component-template-generator → component code
3. Customize variants and props as needed
4. design-system-documenter → component docs
```

## See Also

### References
- `references/component-patterns.md` - Full patterns for neobrutalism, glassmorphism, terminal, web3, swiss
- `references/component-catalog.md` - **NEW**: 21st.dev component counts (1400+ components)
  - Marketing blocks: 73 heroes, 34 CTAs, 11 nav menus, 36 features
  - UI components: 130 buttons, 102 inputs, 79 cards, 40 accordions
  - Design system references: Elastic UI, HeroUI, Ariakit, shadcn

### Related Skills
- design-system-generator - Generate tokens first (24 trends, 31 styles)
- design-system-documenter - Document generated components

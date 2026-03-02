# Component Patterns by Trend

## Neobrutalism Patterns

### Button

```tsx
export function Button({ variant = 'primary', size = 'md', children, ...props }) {
  return (
    <button
      className={cn(
        // Base
        'font-display font-bold uppercase tracking-wide',
        'border-3 border-brutal-black',
        'transition-all duration-100',

        // Shadow & transform
        'shadow-brutal',
        'hover:shadow-brutal-hover hover:-translate-x-0.5 hover:-translate-y-0.5',
        'active:shadow-brutal-active active:translate-x-0.5 active:translate-y-0.5',

        // Focus
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brutal-blue focus-visible:ring-offset-2',

        // Variants
        variant === 'primary' && 'bg-brutal-red text-white',
        variant === 'secondary' && 'bg-brutal-yellow text-brutal-black',
        variant === 'ghost' && 'bg-transparent shadow-none hover:bg-brutal-cream',

        // Sizes
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-base',
        size === 'lg' && 'px-6 py-3 text-lg',

        // Disabled
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-brutal',
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Card

```tsx
export function Card({ variant = 'default', children, ...props }) {
  return (
    <article
      className={cn(
        'bg-brutal-cream',
        'border-3 border-brutal-black',
        'shadow-brutal',

        variant === 'interactive' && [
          'cursor-pointer',
          'hover:shadow-brutal-hover hover:-translate-x-0.5 hover:-translate-y-0.5',
          'transition-all duration-100',
        ],

        variant === 'highlighted' && 'bg-brutal-yellow',
      )}
      {...props}
    >
      {children}
    </article>
  );
}

Card.Header = function CardHeader({ children }) {
  return (
    <header className="px-4 py-3 border-b-3 border-brutal-black bg-brutal-blue text-white">
      {children}
    </header>
  );
};

Card.Body = function CardBody({ children }) {
  return <div className="p-4">{children}</div>;
};
```

### Input

```tsx
export function Input({ label, error, ...props }) {
  const id = useId();

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block font-display font-bold text-sm">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full px-3 py-2',
          'bg-white',
          'border-3 border-brutal-black',
          'font-body',
          'shadow-brutal-sm',
          'focus:outline-none focus:shadow-brutal focus:-translate-x-0.5 focus:-translate-y-0.5',
          'transition-all duration-100',

          error && 'border-brutal-red',
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-brutal-red font-bold">
          {error}
        </p>
      )}
    </div>
  );
}
```

## Glassmorphism Patterns

### Card

```tsx
export function GlassCard({ children, blur = 'md', ...props }) {
  return (
    <div
      className={cn(
        'bg-glass-white',
        'border border-glass-white-border',
        'rounded-xl',
        'shadow-glass',

        blur === 'sm' && 'backdrop-blur-glass-sm',
        blur === 'md' && 'backdrop-blur-glass',
        blur === 'lg' && 'backdrop-blur-glass-lg',
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

### Button

```tsx
export function GlassButton({ variant = 'default', children, ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2',
        'bg-glass-white backdrop-blur-glass',
        'border border-glass-white-border',
        'rounded-lg',
        'text-white',
        'transition-all duration-200',

        'hover:bg-white/20',
        'active:bg-white/5',

        'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50',

        variant === 'accent' && 'bg-gradient-to-r from-purple-500/20 to-pink-500/20',
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

## Terminal Patterns

### Output

```tsx
export function TerminalOutput({ children, variant = 'classic' }) {
  return (
    <pre
      className={cn(
        'font-mono text-sm',
        'p-4',
        'overflow-auto',

        variant === 'classic' && 'bg-term-bg text-term-green',
        variant === 'amber' && 'bg-term-amber-bg text-term-amber',
        variant === 'matrix' && 'bg-term-matrix-bg text-term-matrix',
      )}
    >
      <code>{children}</code>
    </pre>
  );
}
```

### Prompt

```tsx
export function TerminalPrompt({ prefix = '$', children }) {
  return (
    <div className="font-mono flex items-center gap-2">
      <span className="text-term-bright select-none">{prefix}</span>
      <span className="text-term-green">{children}</span>
      <span className="animate-blink text-term-green">█</span>
    </div>
  );
}
```

## Web3 Patterns

### Card

```tsx
export function Web3Card({ glow = false, children, ...props }) {
  return (
    <div
      className={cn(
        'bg-web3-bg',
        'border border-web3-indigo/30',
        'rounded-2xl',
        'p-6',

        glow && 'shadow-web3-glow',

        'hover:border-web3-indigo/50',
        'transition-all duration-300',
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

### Button

```tsx
export function Web3Button({ variant = 'primary', children, ...props }) {
  return (
    <button
      className={cn(
        'px-6 py-3',
        'rounded-xl',
        'font-display font-semibold',
        'transition-all duration-300',

        variant === 'primary' && [
          'bg-gradient-to-r from-web3-indigo to-web3-purple',
          'text-white',
          'shadow-web3-glow',
          'hover:shadow-web3-glow-lg hover:scale-105',
        ],

        variant === 'outline' && [
          'bg-transparent',
          'border border-web3-indigo',
          'text-web3-indigo',
          'hover:bg-web3-indigo/10',
        ],

        'focus:outline-none focus-visible:ring-2 focus-visible:ring-web3-purple',
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

## Swiss/Minimal Patterns

### Button

```tsx
export function SwissButton({ variant = 'primary', children, ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2',
        'font-body',
        'transition-colors duration-150',

        variant === 'primary' && [
          'bg-swiss-black text-swiss-white',
          'hover:bg-swiss-gray-800',
        ],

        variant === 'secondary' && [
          'bg-swiss-gray-100 text-swiss-black',
          'hover:bg-swiss-gray-200',
        ],

        variant === 'outline' && [
          'bg-transparent',
          'border border-swiss-black',
          'hover:bg-swiss-gray-100',
        ],

        'focus:outline-none focus-visible:ring-2 focus-visible:ring-swiss-black focus-visible:ring-offset-2',
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Grid

```tsx
export function SwissGrid({ cols = 12, gap = 'swiss', children }) {
  return (
    <div
      className={cn(
        'grid',
        `grid-cols-${cols}`,
        `gap-${gap}`,
      )}
    >
      {children}
    </div>
  );
}
```

## Accessibility Utilities

### Focus Ring

```tsx
// Consistent focus ring across all components
const focusRing = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

// Trend-specific focus colors
const focusColors = {
  neobrutalism: 'focus-visible:ring-brutal-blue',
  glassmorphism: 'focus-visible:ring-white/50',
  terminal: 'focus-visible:ring-term-green',
  web3: 'focus-visible:ring-web3-purple',
  swiss: 'focus-visible:ring-swiss-black',
};
```

### Skip Link

```tsx
export function SkipLink({ href = '#main' }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black"
    >
      Skip to main content
    </a>
  );
}
```

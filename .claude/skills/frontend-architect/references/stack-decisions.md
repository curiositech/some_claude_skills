# Stack Decisions

Framework and library selection criteria for frontend projects.

## Decision Matrix

### Framework Selection

| Project Type | Recommended | Alternatives | Why |
|-------------|-------------|--------------|-----|
| Marketing Site | Next.js 14+ (App Router) | Astro, SvelteKit | SSG, SEO, edge deploy |
| SaaS Dashboard | Next.js 14+ (App Router) | Remix, SvelteKit | SSR, auth, API routes |
| Internal Tool | Next.js 14+ (App Router) | Vite + React | Fast iteration, preview URLs |
| Blog/Docs | Docusaurus, Astro | Next.js MDX | Content-focused, MDX native |
| E-commerce | Next.js 14+ (App Router) | Remix, Hydrogen | SSR for SEO, Stripe/Shopify |
| Mobile-first PWA | Next.js 14+ (App Router) | SvelteKit | Offline support, service workers |

### Styling Selection

| Need | Recommended | When to Choose |
|------|-------------|----------------|
| Rapid prototyping | Tailwind CSS | Always for new projects |
| Complex theming | Tailwind + CSS variables | Design system with dark mode |
| Animation-heavy | Framer Motion + Tailwind | Marketing, portfolio sites |
| Existing design system | CSS Modules | Team has existing system |
| CSS-in-JS required | styled-components | Legacy codebase, specific need |

### Component Library Selection

| Need | Recommended | Why |
|------|-------------|-----|
| Full customization | shadcn/ui | Copy-paste, own the code |
| Accessibility-first | Radix UI primitives | Unstyled, ARIA complete |
| Fast prototyping | shadcn/ui + react-hook-form | Form patterns included |
| Enterprise | Radix + custom design system | Full control, accessibility |
| Animation-heavy | shadcn/ui + Framer Motion | Composable, flexible |

## Deep Dive: Next.js 14+ App Router

### Why App Router (not Pages Router)

```typescript
// App Router advantages:
const appRouterBenefits = {
  serverComponents: "Less JS shipped, faster initial load",
  streaming: "Incremental rendering, better UX",
  layouts: "Shared UI without re-mounting",
  loading: "Built-in loading states",
  error: "Built-in error boundaries",
  parallel: "Parallel route rendering",
  intercepting: "Modal routes without navigation"
};

// When Pages Router is still valid:
const pagesRouterStillValid = {
  existingApp: "Migration cost too high",
  specificAPI: "getServerSideProps patterns",
  team: "Team knows Pages well"
};
```

### Recommended Next.js Structure

```
app/
├── (marketing)/           # Route group (no path segment)
│   ├── page.tsx           # /
│   ├── about/page.tsx     # /about
│   └── pricing/page.tsx   # /pricing
├── (app)/                 # Authenticated app
│   ├── layout.tsx         # Shared auth layout
│   ├── dashboard/page.tsx # /dashboard
│   └── settings/page.tsx  # /settings
├── api/                   # API routes
│   └── [...route]/route.ts
├── components/            # Shared components
├── lib/                   # Utilities
└── styles/                # Global styles
```

### Data Fetching Patterns

```typescript
// Server Component (default in App Router)
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // ISR: revalidate every hour
  });
  return <DataDisplay data={data} />;
}

// Client Component (when needed)
'use client';
export function InteractiveWidget() {
  const [state, setState] = useState();
  // Client-side interactivity
}

// Streaming with Suspense
export default function Page() {
  return (
    <Suspense fallback={<Skeleton />}>
      <SlowComponent />
    </Suspense>
  );
}
```

## Deep Dive: Tailwind CSS

### Configuration Best Practices

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // Design token integration
      colors: {
        brand: {
          50: 'var(--brand-50)',
          // ...
          900: 'var(--brand-900)',
        },
      },
      // Typography scale
      fontSize: {
        'display-1': ['4.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-2': ['3.75rem', { lineHeight: '1.1', fontWeight: '700' }],
      },
      // Animation
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};

export default config;
```

### Utility Patterns

```tsx
// cn() helper (shadcn pattern)
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<button className={cn(
  "px-4 py-2 rounded-lg font-medium",
  variant === "primary" && "bg-blue-500 text-white",
  variant === "secondary" && "bg-gray-100 text-gray-900",
  className
)} />
```

## Deep Dive: State Management

### When to Use What

| Complexity | Solution | Example |
|------------|----------|---------|
| Simple | useState/useReducer | Form state, toggles |
| Cross-component | React Context | Theme, auth user |
| Complex global | Zustand | Shopping cart, composer state |
| Server state | TanStack Query | API data, caching |
| Forms | react-hook-form + zod | Complex forms, validation |

### Zustand Pattern

```typescript
// stores/composer.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ComposerState {
  selectedPatterns: string[];
  addPattern: (id: string) => void;
  removePattern: (id: string) => void;
  clear: () => void;
}

export const useComposerStore = create<ComposerState>()(
  persist(
    (set) => ({
      selectedPatterns: [],
      addPattern: (id) => set((state) => ({
        selectedPatterns: [...state.selectedPatterns, id]
      })),
      removePattern: (id) => set((state) => ({
        selectedPatterns: state.selectedPatterns.filter(p => p !== id)
      })),
      clear: () => set({ selectedPatterns: [] }),
    }),
    { name: 'composer-storage' }
  )
);
```

## Migration Considerations

### From Pages Router to App Router

```typescript
// Incremental migration path:
const migrationSteps = [
  "1. Keep pages/ and add app/ directory",
  "2. Move layout to app/layout.tsx",
  "3. Migrate pages one by one",
  "4. Convert getServerSideProps to Server Components",
  "5. Add loading.tsx and error.tsx",
  "6. Remove pages/ when complete"
];
```

### From Create React App to Next.js

```typescript
const migrationSteps = [
  "1. Create new Next.js project",
  "2. Copy components, hooks, utils",
  "3. Move pages to app/ directory",
  "4. Update routing (useNavigate → useRouter)",
  "5. Convert data fetching to Server Components",
  "6. Update environment variables (REACT_APP_ → NEXT_PUBLIC_)"
];
```

## Performance Checklist

- [ ] Server Components for static content
- [ ] Client Components only when needed (interactivity)
- [ ] Image optimization with next/image
- [ ] Font optimization with next/font
- [ ] Code splitting with dynamic imports
- [ ] ISR or SSG for cacheable content
- [ ] Edge Runtime for middleware

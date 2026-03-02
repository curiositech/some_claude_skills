# Design System Bridge

Patterns for connecting design tokens and the design catalog to component implementations.

## Token Architecture

### Design Token Structure

```typescript
// types/design-tokens.ts
export interface DesignTokens {
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    neutral: ColorScale;
    semantic: {
      success: ColorScale;
      warning: ColorScale;
      error: ColorScale;
      info: ColorScale;
    };
  };
  typography: {
    fontFamily: {
      display: string;
      body: string;
      mono: string;
    };
    fontSize: TypeScale;
    fontWeight: Record<string, number>;
    lineHeight: Record<string, number>;
    letterSpacing: Record<string, string>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  transitions: Record<string, string>;
}

type ColorScale = Record&lt;50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
type TypeScale = Record<string, [string, { lineHeight: string; fontWeight?: string }]>;
```

### Catalog to Tokens Pipeline

```typescript
// scripts/generate-tokens.ts
import { designCatalog } from '../data/catalog/gallery-sources.json';

function generateTokensFromCatalog(trendId: string): DesignTokens {
  const trend = designCatalog.trends2026.find(t => t.id === trendId);
  const colors = designCatalog.colorPalettes[trendId] || designCatalog.colorPalettes.dopamine;
  const typography = designCatalog.typography[trendId] || designCatalog.typography.swiss;

  return {
    colors: {
      primary: generateColorScale(colors.primary || colors.colors[0]),
      secondary: generateColorScale(colors.secondary || colors.colors[1]),
      // ...
    },
    typography: {
      fontFamily: {
        display: typography.display[0],
        body: typography.body?.[0] || typography.display[0],
        mono: 'JetBrains Mono, monospace',
      },
      // ...
    },
    // ...
  };
}

// Output to CSS variables
function tokensToCss(tokens: DesignTokens): string {
  return `:root {
    /* Colors */
    ${Object.entries(tokens.colors.primary).map(([key, val]) =>
      `--color-primary-${key}: ${val};`
    ).join('\n    ')}

    /* Typography */
    --font-display: ${tokens.typography.fontFamily.display};
    --font-body: ${tokens.typography.fontFamily.body};

    /* Spacing */
    ${Object.entries(tokens.spacing).map(([key, val]) =>
      `--spacing-${key}: ${val};`
    ).join('\n    ')}
  }`;
}
```

## Component Mapping

### Catalog Pattern to shadcn Variant

```typescript
// lib/design-bridge.ts
import { buttonPatterns } from '@/data/catalog/components/buttons.json';
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button';

// Map catalog patterns to shadcn variants
export const patternToVariant: Record<string, VariantProps<typeof buttonVariants>['variant']> = {
  'primary-filled': 'default',
  'secondary-outline': 'outline',
  'tertiary-ghost': 'ghost',
  'destructive-action': 'destructive',
  'neobrutalist': 'brutalist',  // Custom variant
};

// Get Tailwind classes from catalog pattern
export function patternToClasses(patternId: string): string {
  const pattern = buttonPatterns.find(p => p.id === patternId);
  if (!pattern) return '';

  const classes: string[] = [];

  // Map CSS properties to Tailwind
  if (pattern.styles.backgroundColor) {
    classes.push(cssColorToTailwind(pattern.styles.backgroundColor, 'bg'));
  }
  if (pattern.styles.borderRadius === '0') {
    classes.push('rounded-none');
  }
  if (pattern.styles.boxShadow?.includes('0 #')) {
    classes.push('shadow-brutalist');
  }

  return classes.join(' ');
}
```

### Dynamic Theme Provider

```typescript
// providers/theme-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { designCatalog } from '@/data/catalog/gallery-sources.json';

interface ThemeContextType {
  trend: string;
  setTrend: (trend: string) => void;
  tokens: DesignTokens;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [trend, setTrend] = useState('neobrutalism');
  const [tokens, setTokens] = useState<DesignTokens>(defaultTokens);

  useEffect(() => {
    // Generate tokens from catalog for selected trend
    const newTokens = generateTokensFromCatalog(trend);
    setTokens(newTokens);

    // Apply to document
    applyTokensToDocument(newTokens);
  }, [trend]);

  return (
    <ThemeContext.Provider value={{ trend, setTrend, tokens }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyTokensToDocument(tokens: DesignTokens) {
  const root = document.documentElement;

  // Apply color tokens
  Object.entries(tokens.colors.primary).forEach(([key, value]) => {
    root.style.setProperty(`--color-primary-${key}`, value);
  });

  // Apply typography
  root.style.setProperty('--font-display', tokens.typography.fontFamily.display);
  root.style.setProperty('--font-body', tokens.typography.fontFamily.body);

  // Apply spacing
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

## CSS Generation

### Tailwind Config from Tokens

```typescript
// scripts/generate-tailwind-config.ts
import { DesignTokens } from '@/types/design-tokens';

export function generateTailwindConfig(tokens: DesignTokens): string {
  return `
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          ${Object.entries(tokens.colors.primary)
            .map(([key, val]) => `${key}: '${val}',`)
            .join('\n          ')}
        },
        secondary: {
          ${Object.entries(tokens.colors.secondary)
            .map(([key, val]) => `${key}: '${val}',`)
            .join('\n          ')}
        },
      },
      fontFamily: {
        display: ['${tokens.typography.fontFamily.display}', 'sans-serif'],
        body: ['${tokens.typography.fontFamily.body}', 'sans-serif'],
        mono: ['${tokens.typography.fontFamily.mono}', 'monospace'],
      },
      fontSize: {
        ${Object.entries(tokens.typography.fontSize)
          .map(([key, [size, opts]]) =>
            `'${key}': ['${size}', ${JSON.stringify(opts)}],`)
          .join('\n        ')}
      },
      spacing: {
        ${Object.entries(tokens.spacing)
          .map(([key, val]) => `'${key}': '${val}',`)
          .join('\n        ')}
      },
      borderRadius: {
        ${Object.entries(tokens.borderRadius)
          .map(([key, val]) => `'${key}': '${val}',`)
          .join('\n        ')}
      },
      boxShadow: {
        ${Object.entries(tokens.shadows)
          .map(([key, val]) => `'${key}': '${val}',`)
          .join('\n        ')}
      },
    },
  },
};
`;
}
```

### CSS Custom Properties Output

```typescript
// scripts/generate-css-vars.ts
export function generateCssVars(tokens: DesignTokens): string {
  return `
/* Generated from design tokens - DO NOT EDIT */
@layer base {
  :root {
    /* Colors - Primary */
    ${Object.entries(tokens.colors.primary)
      .map(([key, val]) => `--color-primary-${key}: ${hexToHsl(val)};`)
      .join('\n    ')}

    /* Colors - Secondary */
    ${Object.entries(tokens.colors.secondary)
      .map(([key, val]) => `--color-secondary-${key}: ${hexToHsl(val)};`)
      .join('\n    ')}

    /* Typography */
    --font-display: ${tokens.typography.fontFamily.display};
    --font-body: ${tokens.typography.fontFamily.body};
    --font-mono: ${tokens.typography.fontFamily.mono};

    /* Type Scale */
    ${Object.entries(tokens.typography.fontSize)
      .map(([key, [size]]) => `--text-${key}: ${size};`)
      .join('\n    ')}

    /* Spacing */
    ${Object.entries(tokens.spacing)
      .map(([key, val]) => `--spacing-${key}: ${val};`)
      .join('\n    ')}

    /* Border Radius */
    ${Object.entries(tokens.borderRadius)
      .map(([key, val]) => `--radius-${key}: ${val};`)
      .join('\n    ')}

    /* Shadows */
    ${Object.entries(tokens.shadows)
      .map(([key, val]) => `--shadow-${key}: ${val};`)
      .join('\n    ')}

    /* Transitions */
    ${Object.entries(tokens.transitions)
      .map(([key, val]) => `--transition-${key}: ${val};`)
      .join('\n    ')}
  }

  .dark {
    /* Dark mode overrides */
    --color-primary-50: ${/* darker variant */};
    /* ... */
  }
}
`;
}
```

## Usage in Components

### Trend-Aware Component

```typescript
// components/pattern-card.tsx
'use client';

import { useTheme } from '@/providers/theme-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { patternToClasses } from '@/lib/design-bridge';
import { cn } from '@/lib/utils';

interface PatternCardProps {
  pattern: {
    id: string;
    name: string;
    trend: string;
  };
  className?: string;
}

export function PatternCard({ pattern, className }: PatternCardProps) {
  const { trend } = useTheme();

  // Get classes based on current theme trend
  const trendClasses = patternToClasses(pattern.id);

  // Add trend-specific styling
  const trendStyles = {
    neobrutalism: 'border-2 border-black shadow-[4px_4px_0_#000] rounded-none',
    glassmorphism: 'backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl',
    neumorphism: 'bg-[#e0e0e0] shadow-[6px_6px_12px_#bebebe,-6px_-6px_12px_#fff] rounded-xl',
  }[trend] || '';

  return (
    <Card className={cn(trendClasses, trendStyles, className)}>
      <CardHeader>
        <CardTitle>{pattern.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  );
}
```

### Token-Powered Animation

```typescript
// Framer Motion variants from tokens
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: parseFloat(tokens.transitions.default.split(' ')[0]),
      ease: tokens.transitions.default.split(' ').slice(1).join(' '),
    },
  },
  hover: {
    // Neobrutalism: Move shadow and transform
    ...(trend === 'neobrutalism' && {
      x: -4,
      y: -4,
      boxShadow: tokens.shadows.brutalistLg,
    }),
    // Glassmorphism: Subtle glow
    ...(trend === 'glassmorphism' && {
      boxShadow: tokens.shadows.glow,
    }),
  },
};
```

## Validation

### Token Accessibility Check

```typescript
// lib/token-validation.ts
import { getContrastRatio } from '@/lib/color-utils';

export function validateTokenAccessibility(tokens: DesignTokens): ValidationResult[] {
  const issues: ValidationResult[] = [];

  // Check text on background contrast
  const bgColor = tokens.colors.neutral[50];
  const textColor = tokens.colors.neutral[900];
  const contrast = getContrastRatio(bgColor, textColor);

  if (contrast < 4.5) {
    issues.push({
      type: 'error',
      token: 'colors.neutral',
      message: `Text contrast ${contrast.toFixed(2)}:1 fails WCAG AA (needs 4.5:1)`,
      suggestion: 'Increase neutral-900 darkness or lighten neutral-50',
    });
  }

  // Check primary button contrast
  const primaryBg = tokens.colors.primary[500];
  const primaryText = tokens.colors.primary[50];
  const buttonContrast = getContrastRatio(primaryBg, primaryText);

  if (buttonContrast < 4.5) {
    issues.push({
      type: 'warning',
      token: 'colors.primary',
      message: `Button text contrast ${buttonContrast.toFixed(2)}:1 may fail WCAG AA`,
      suggestion: 'Consider using white or black text on primary buttons',
    });
  }

  return issues;
}
```

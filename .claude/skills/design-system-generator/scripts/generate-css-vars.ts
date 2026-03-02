#!/usr/bin/env npx ts-node
/**
 * CSS Custom Properties Generator
 *
 * Generates CSS custom properties (variables) from matched design trends.
 * Produces a complete :root declaration ready for copy-paste.
 *
 * Usage: npx ts-node generate-css-vars.ts <trend-id> [--scope=<selector>]
 *
 * Output: CSS custom properties declaration
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Trend {
  id: string;
  name: string;
  description: string;
  status: string;
}

interface ColorPalette {
  description?: string;
  colors?: string[] | Record<string, string[]> | Record<string, string>;
  vibrant?: Record<string, string>;
  vintage?: Record<string, string>;
  backgrounds?: string[];
  shadows?: string[];
  primary?: string[];
  gradients?: string[];
}

interface TypographySet {
  display: string[];
  body?: string[];
  characteristics: string[];
}

interface GallerySources {
  trends2026: Trend[];
  cssPatterns: Record<string, Record<string, any>>;
  colorPalettes: Record<string, ColorPalette>;
  typography: Record<string, TypographySet>;
}

interface CSSVarSet {
  colors: Record<string, string>;
  typography: Record<string, string>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  effects?: Record<string, string>;
  animations?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SPACING_SCALE: Record<string, string> = {
  '0': '0',
  '1': '0.25rem',
  '2': '0.5rem',
  '3': '0.75rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '8': '2rem',
  '10': '2.5rem',
  '12': '3rem',
  '16': '4rem',
  '20': '5rem',
  '24': '6rem',
};

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

function loadCatalog(catalogPath: string): GallerySources {
  return JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
}

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function formatFontStack(fonts: string[]): string {
  return fonts.map(f => f.includes(' ') ? `"${f}"` : f).join(', ');
}

// ---------------------------------------------------------------------------
// CSS Variable Generators by Trend
// ---------------------------------------------------------------------------

function generateNeobrutalismVars(catalog: GallerySources): CSSVarSet {
  const palette = catalog.colorPalettes.neobrutalism;
  const typography = catalog.typography.neobrutalism;

  return {
    colors: {
      'color-primary-red': palette.vibrant!.red,
      'color-primary-yellow': palette.vibrant!.yellow,
      'color-primary-blue': palette.vibrant!.blue,
      'color-primary-green': palette.vibrant!.green,
      'color-primary-purple': palette.vibrant!.purple,
      'color-neutral-cream': palette.vintage!.cream,
      'color-neutral-sage': palette.vintage!.sage,
      'color-neutral-rose': palette.vintage!.dustyRose,
      'color-neutral-mustard': palette.vintage!.mustard,
      'color-neutral-slate': palette.vintage!.slate,
      'color-border': '#000000',
      'color-shadow': '#000000',
      'color-bg': palette.vintage!.cream,
      'color-text': '#000000',
    },
    typography: {
      'font-display': formatFontStack(typography.display),
      'font-body': formatFontStack(typography.body!),
      'font-size-xs': '0.75rem',
      'font-size-sm': '0.875rem',
      'font-size-base': '1rem',
      'font-size-lg': '1.125rem',
      'font-size-xl': '1.25rem',
      'font-size-2xl': '1.5rem',
      'font-size-3xl': '1.875rem',
      'font-size-4xl': '2.25rem',
      'font-size-5xl': '3rem',
      'font-weight-normal': '400',
      'font-weight-medium': '500',
      'font-weight-bold': '700',
      'font-weight-black': '900',
      'line-height-tight': '1.25',
      'line-height-normal': '1.5',
      'line-height-relaxed': '1.75',
    },
    spacing: Object.fromEntries(
      Object.entries(SPACING_SCALE).map(([k, v]) => [`spacing-${k}`, v])
    ),
    borderRadius: {
      'radius-none': '0',
      'radius-sm': '2px',
      'radius-md': '4px',
      'radius-lg': '8px',
    },
    shadows: {
      'shadow-sm': '2px 2px 0 0 var(--color-shadow)',
      'shadow-md': '4px 4px 0 0 var(--color-shadow)',
      'shadow-lg': '6px 6px 0 0 var(--color-shadow)',
      'shadow-xl': '8px 8px 0 0 var(--color-shadow)',
      'shadow-hover': '6px 6px 0 0 var(--color-shadow)',
      'shadow-active': '2px 2px 0 0 var(--color-shadow)',
    },
    effects: {
      'border-width': '3px',
      'transition-fast': '100ms',
      'transition-normal': '150ms',
    },
  };
}

function generateGlassmorphismVars(_catalog: GallerySources): CSSVarSet {
  return {
    colors: {
      'color-surface': 'rgba(255, 255, 255, 0.1)',
      'color-surface-dark': 'rgba(0, 0, 0, 0.1)',
      'color-border': 'rgba(255, 255, 255, 0.2)',
      'color-border-dark': 'rgba(0, 0, 0, 0.1)',
      'color-text': '#ffffff',
      'color-text-muted': 'rgba(255, 255, 255, 0.7)',
      'color-overlay': 'rgba(255, 255, 255, 0.05)',
    },
    typography: {
      'font-display': '"SF Pro Display", -apple-system, BlinkMacSystemFont, sans-serif',
      'font-body': '"SF Pro Text", -apple-system, BlinkMacSystemFont, sans-serif',
      'font-size-base': '1rem',
      'font-weight-normal': '400',
      'font-weight-medium': '500',
    },
    spacing: Object.fromEntries(
      Object.entries(SPACING_SCALE).map(([k, v]) => [`spacing-${k}`, v])
    ),
    borderRadius: {
      'radius-sm': '0.5rem',
      'radius-md': '0.75rem',
      'radius-lg': '1rem',
      'radius-xl': '1.5rem',
    },
    shadows: {
      'shadow-glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
      'shadow-glass-lg': '0 8px 32px rgba(0, 0, 0, 0.15)',
      'shadow-glow': '0 0 20px rgba(255, 255, 255, 0.1)',
    },
    effects: {
      'blur-sm': '4px',
      'blur-md': '10px',
      'blur-lg': '20px',
      'blur-xl': '40px',
      'border-width': '1px',
    },
  };
}

function generateTerminalVars(catalog: GallerySources): CSSVarSet {
  const palette = catalog.colorPalettes.terminal;
  const typography = catalog.typography.terminal;
  const colors = palette.colors as Record<string, string[]>;

  return {
    colors: {
      // Classic green phosphor
      'color-bg': colors.classic[0],
      'color-text': colors.classic[1],
      'color-surface': colors.classic[2],
      'color-accent': colors.classic[3],
      // Amber variant
      'color-amber-bg': colors.amber[0],
      'color-amber-text': colors.amber[1],
      'color-amber-surface': colors.amber[2],
      'color-amber-accent': colors.amber[3],
      // Matrix variant
      'color-matrix-bg': colors.matrix[0],
      'color-matrix-dim': colors.matrix[1],
      'color-matrix-text': colors.matrix[2],
      'color-matrix-bright': colors.matrix[3],
    },
    typography: {
      'font-mono': formatFontStack(typography.display),
      'font-body': formatFontStack(typography.body!),
      'font-size-base': '14px',
      'font-size-lg': '16px',
      'line-height-code': '1.6',
    },
    spacing: Object.fromEntries(
      Object.entries(SPACING_SCALE).map(([k, v]) => [`spacing-${k}`, v])
    ),
    borderRadius: {
      'radius-none': '0',
      'radius-sm': '2px',
    },
    shadows: {
      'shadow-glow': '0 0 10px currentColor',
      'shadow-glow-lg': '0 0 20px currentColor',
    },
    effects: {
      'scanline-opacity': '0.05',
      'crt-curve': '3px',
    },
    animations: {
      'blink-duration': '1s',
      'scan-duration': '8s',
    },
  };
}

function generateWeb3Vars(catalog: GallerySources): CSSVarSet {
  const palette = catalog.colorPalettes.web3;
  const typography = catalog.typography.web3;
  const colors = palette.colors as Record<string, string[]>;

  return {
    colors: {
      'color-bg': colors.primary[0],
      'color-primary': colors.primary[1],
      'color-secondary': colors.primary[2],
      'color-accent': colors.primary[3],
      'color-gradient-start': '#667eea',
      'color-gradient-end': '#764ba2',
      'color-glow': `${colors.primary[1]}40`,
    },
    typography: {
      'font-display': formatFontStack(typography.display),
      'font-body': formatFontStack(typography.body!),
      'font-size-base': '1rem',
      'letter-spacing-wide': '0.05em',
      'letter-spacing-wider': '0.1em',
    },
    spacing: Object.fromEntries(
      Object.entries(SPACING_SCALE).map(([k, v]) => [`spacing-${k}`, v])
    ),
    borderRadius: {
      'radius-sm': '0.5rem',
      'radius-md': '0.75rem',
      'radius-lg': '1rem',
      'radius-xl': '1.5rem',
      'radius-full': '9999px',
    },
    shadows: {
      'shadow-glow-sm': `0 0 10px ${colors.primary[1]}40`,
      'shadow-glow': `0 0 20px ${colors.primary[1]}40`,
      'shadow-glow-lg': `0 0 40px ${colors.primary[1]}60`,
      'shadow-glow-purple': `0 0 20px ${colors.primary[2]}40`,
      'shadow-glow-pink': `0 0 20px ${colors.primary[3]}40`,
    },
    effects: {
      'gradient-primary': `linear-gradient(135deg, ${colors.gradients[0].replace('linear-gradient(135deg, ', '').replace(')', '')})`,
      'gradient-accent': colors.gradients[1],
    },
  };
}

function generateClaymorphismVars(catalog: GallerySources): CSSVarSet {
  const palette = catalog.colorPalettes.claymorphism;

  return {
    colors: {
      'color-surface-pink': palette.backgrounds![0],
      'color-surface-blue': palette.backgrounds![1],
      'color-surface-peach': palette.backgrounds![2],
      'color-surface-lavender': palette.backgrounds![3],
      'color-shadow-pink': palette.shadows![0],
      'color-shadow-blue': palette.shadows![1],
      'color-shadow-peach': palette.shadows![2],
      'color-shadow-lavender': palette.shadows![3],
      'color-highlight': '#ffffff',
    },
    typography: {
      'font-display': '"Poppins", "Inter", sans-serif',
      'font-body': '"Inter", sans-serif',
      'font-size-base': '1rem',
      'font-weight-medium': '500',
      'font-weight-semibold': '600',
    },
    spacing: Object.fromEntries(
      Object.entries(SPACING_SCALE).map(([k, v]) => [`spacing-${k}`, v])
    ),
    borderRadius: {
      'radius-sm': '12px',
      'radius-md': '16px',
      'radius-lg': '24px',
      'radius-xl': '30px',
      'radius-2xl': '40px',
    },
    shadows: {
      'shadow-outer': '20px 20px 60px var(--color-shadow-pink)',
      'shadow-inner': '-20px -20px 60px var(--color-highlight)',
      'shadow-combined': '20px 20px 60px var(--color-shadow-pink), -20px -20px 60px var(--color-highlight)',
      'shadow-inset': 'inset 10px 10px 30px var(--color-shadow-pink), inset -10px -10px 30px var(--color-highlight)',
    },
    effects: {
      'gradient-surface': 'linear-gradient(145deg, #e6e6e6, #ffffff)',
    },
  };
}

function generateSwissVars(catalog: GallerySources): CSSVarSet {
  const typography = catalog.typography.swiss;

  return {
    colors: {
      'color-black': '#000000',
      'color-white': '#FFFFFF',
      'color-accent': '#FF0000',
      'color-gray-50': '#FAFAFA',
      'color-gray-100': '#F5F5F5',
      'color-gray-200': '#E5E5E5',
      'color-gray-300': '#D4D4D4',
      'color-gray-400': '#A3A3A3',
      'color-gray-500': '#737373',
      'color-gray-600': '#525252',
      'color-gray-700': '#404040',
      'color-gray-800': '#262626',
      'color-gray-900': '#171717',
    },
    typography: {
      'font-display': formatFontStack(typography.display),
      'font-body': formatFontStack(typography.body!),
      'font-size-base': '1rem',
      'letter-spacing-tight': '-0.025em',
      'letter-spacing-normal': '0',
      'line-height-tight': '1.25',
      'line-height-normal': '1.5',
    },
    spacing: Object.fromEntries(
      Object.entries(SPACING_SCALE).map(([k, v]) => [`spacing-${k}`, v])
    ),
    borderRadius: {
      'radius-none': '0',
      'radius-sm': '2px',
      'radius-md': '4px',
    },
    shadows: {
      'shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
      'shadow-md': '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    effects: {
      'grid-columns': '12',
      'grid-gutter': '1.5rem',
    },
  };
}

function generateDefaultVars(trend: Trend): CSSVarSet {
  return {
    colors: {
      'color-primary': '#3B82F6',
      'color-secondary': '#10B981',
      'color-accent': '#8B5CF6',
      'color-bg': '#FFFFFF',
      'color-text': '#111827',
    },
    typography: {
      'font-display': '"Inter", sans-serif',
      'font-body': '"Inter", sans-serif',
      'font-size-base': '1rem',
    },
    spacing: Object.fromEntries(
      Object.entries(SPACING_SCALE).map(([k, v]) => [`spacing-${k}`, v])
    ),
    borderRadius: {
      'radius-sm': '0.25rem',
      'radius-md': '0.5rem',
      'radius-lg': '1rem',
    },
    shadows: {
      'shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
      'shadow-md': '0 4px 6px rgba(0, 0, 0, 0.1)',
      'shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.1)',
    },
  };
}

// ---------------------------------------------------------------------------
// Main Generator
// ---------------------------------------------------------------------------

function generateVars(trendId: string, catalog: GallerySources): CSSVarSet {
  const trend = catalog.trends2026.find(t => t.id === trendId);

  const generators: Record<string, () => CSSVarSet> = {
    'neobrutalism': () => generateNeobrutalismVars(catalog),
    'glassmorphism': () => generateGlassmorphismVars(catalog),
    'neumorphism': () => generateGlassmorphismVars(catalog),
    'terminal-aesthetic': () => generateTerminalVars(catalog),
    'web3-crypto': () => generateWeb3Vars(catalog),
    'claymorphism': () => generateClaymorphismVars(catalog),
    'swiss-modern': () => generateSwissVars(catalog),
    'hyperminimalism': () => generateSwissVars(catalog),
  };

  const generator = generators[trendId];
  if (generator) {
    return generator();
  }

  if (trend) {
    return generateDefaultVars(trend);
  }

  throw new Error(`Unknown trend: ${trendId}`);
}

function formatAsCSS(vars: CSSVarSet, scope: string, trendId: string): string {
  const lines: string[] = [];

  lines.push(`/* CSS Custom Properties for ${trendId} */`);
  lines.push(`/* Generated by design-system-generator */`);
  lines.push('');
  lines.push(`${scope} {`);

  // Group by category
  const categories: Array<[string, Record<string, string>]> = [
    ['Colors', vars.colors],
    ['Typography', vars.typography],
    ['Spacing', vars.spacing],
    ['Border Radius', vars.borderRadius],
    ['Shadows', vars.shadows],
  ];

  if (vars.effects) {
    categories.push(['Effects', vars.effects]);
  }

  if (vars.animations) {
    categories.push(['Animations', vars.animations]);
  }

  for (const [category, values] of categories) {
    lines.push(`  /* ${category} */`);
    for (const [key, value] of Object.entries(values)) {
      lines.push(`  --${toKebabCase(key)}: ${value};`);
    }
    lines.push('');
  }

  lines.push('}');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Main Execution
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
let scope = ':root';
let trendId: string | undefined;

for (const arg of args) {
  if (arg.startsWith('--scope=')) {
    scope = arg.replace('--scope=', '');
  } else if (!arg.startsWith('--')) {
    trendId = arg;
  }
}

if (!trendId) {
  console.log('Usage: npx ts-node generate-css-vars.ts <trend-id> [--scope=<selector>]');
  console.log('');
  console.log('Available trends:');
  console.log('  neobrutalism, glassmorphism, neumorphism, terminal-aesthetic,');
  console.log('  web3-crypto, claymorphism, swiss-modern, hyperminimalism, etc.');
  console.log('');
  console.log('Options:');
  console.log('  --scope=<selector>  CSS selector for variables (default: :root)');
  console.log('                      Examples: --scope=.dark, --scope=[data-theme="neon"]');
  console.log('');
  console.log('Example: npx ts-node generate-css-vars.ts neobrutalism');
  console.log('Example: npx ts-node generate-css-vars.ts terminal-aesthetic --scope=.terminal');
  process.exit(1);
}

const catalogPath = path.resolve(__dirname, '../../../../website/design-catalog/gallery-sources.json');

if (!fs.existsSync(catalogPath)) {
  console.error(`Error: Design catalog not found at ${catalogPath}`);
  process.exit(1);
}

const catalog = loadCatalog(catalogPath);
const vars = generateVars(trendId, catalog);
const css = formatAsCSS(vars, scope, trendId);

console.log(css);

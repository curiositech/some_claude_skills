#!/usr/bin/env npx ts-node
/**
 * Tailwind Config Generator
 *
 * Generates a complete Tailwind CSS configuration from matched design trends.
 * Includes colors, typography, spacing, shadows, and animations.
 *
 * Usage: npx ts-node generate-tailwind.ts <trend-id>
 *
 * Output: tailwind.config.ts compatible JavaScript object
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

interface CSSPattern {
  signature: Record<string, string>;
  antiPatterns?: string[];
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
  cssPatterns: Record<string, CSSPattern>;
  colorPalettes: Record<string, ColorPalette>;
  typography: Record<string, TypographySet>;
}

interface TailwindConfig {
  theme: {
    extend: {
      colors?: Record<string, string | Record<string, string>>;
      fontFamily?: Record<string, string[]>;
      boxShadow?: Record<string, string>;
      borderRadius?: Record<string, string>;
      borderWidth?: Record<string, string>;
      backdropBlur?: Record<string, string>;
      animation?: Record<string, string>;
      keyframes?: Record<string, Record<string, Record<string, string>>>;
    };
  };
  plugins?: string[];
}

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

function loadCatalog(catalogPath: string): GallerySources {
  return JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
}

// ---------------------------------------------------------------------------
// Config Generators by Trend
// ---------------------------------------------------------------------------

function generateNeobrutalismConfig(catalog: GallerySources): TailwindConfig {
  const palette = catalog.colorPalettes.neobrutalism;
  const typography = catalog.typography.neobrutalism;

  return {
    theme: {
      extend: {
        colors: {
          'brutal-red': palette.vibrant!.red,
          'brutal-yellow': palette.vibrant!.yellow,
          'brutal-blue': palette.vibrant!.blue,
          'brutal-green': palette.vibrant!.green,
          'brutal-purple': palette.vibrant!.purple,
          'brutal-cream': palette.vintage!.cream,
          'brutal-sage': palette.vintage!.sage,
          'brutal-rose': palette.vintage!.dustyRose,
          'brutal-mustard': palette.vintage!.mustard,
          'brutal-slate': palette.vintage!.slate,
          'brutal-black': '#000000',
        },
        fontFamily: {
          'display': typography.display,
          'body': typography.body!,
        },
        boxShadow: {
          'brutal-sm': '2px 2px 0 0 #000000',
          'brutal': '4px 4px 0 0 #000000',
          'brutal-md': '4px 4px 0 0 #000000',
          'brutal-lg': '6px 6px 0 0 #000000',
          'brutal-xl': '8px 8px 0 0 #000000',
          'brutal-hover': '6px 6px 0 0 #000000',
          'brutal-active': '2px 2px 0 0 #000000',
          'brutal-colored': '4px 4px 0 0 var(--tw-shadow-color)',
          'none': 'none',
        },
        borderRadius: {
          'brutal-none': '0',
          'brutal-sm': '2px',
          'brutal': '4px',
          'brutal-md': '4px',
          'brutal-lg': '8px',
        },
        borderWidth: {
          '3': '3px',
          '4': '4px',
          '5': '5px',
        },
        animation: {
          'brutal-press': 'brutal-press 100ms ease-out',
          'brutal-hover': 'brutal-hover 100ms ease-out',
        },
        keyframes: {
          'brutal-press': {
            '0%': { transform: 'translate(0, 0)' },
            '100%': { transform: 'translate(2px, 2px)' },
          },
          'brutal-hover': {
            '0%': { transform: 'translate(0, 0)' },
            '100%': { transform: 'translate(-2px, -2px)' },
          },
        },
      },
    },
  };
}

function generateGlassmorphismConfig(_catalog: GallerySources): TailwindConfig {
  return {
    theme: {
      extend: {
        colors: {
          'glass-white': 'rgba(255, 255, 255, 0.1)',
          'glass-white-border': 'rgba(255, 255, 255, 0.2)',
          'glass-black': 'rgba(0, 0, 0, 0.1)',
          'glass-black-border': 'rgba(0, 0, 0, 0.1)',
        },
        backdropBlur: {
          'glass-xs': '4px',
          'glass-sm': '8px',
          'glass': '10px',
          'glass-md': '16px',
          'glass-lg': '20px',
          'glass-xl': '40px',
        },
        borderWidth: {
          'glass': '1px',
        },
        boxShadow: {
          'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
          'glass-lg': '0 8px 32px rgba(0, 0, 0, 0.15)',
          'glass-glow': '0 0 20px rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };
}

function generateTerminalConfig(catalog: GallerySources): TailwindConfig {
  const palette = catalog.colorPalettes.terminal;
  const typography = catalog.typography.terminal;
  const colors = palette.colors as Record<string, string[]>;

  return {
    theme: {
      extend: {
        colors: {
          'term-bg': colors.classic[0],
          'term-green': colors.classic[1],
          'term-surface': colors.classic[2],
          'term-bright': colors.classic[3],
          'term-amber-bg': colors.amber[0],
          'term-amber': colors.amber[1],
          'term-amber-surface': colors.amber[2],
          'term-amber-bright': colors.amber[3],
          'term-matrix-bg': colors.matrix[0],
          'term-matrix-dim': colors.matrix[1],
          'term-matrix': colors.matrix[2],
          'term-matrix-bright': colors.matrix[3],
        },
        fontFamily: {
          'mono': typography.display,
          'term': typography.body!,
        },
        boxShadow: {
          'term-glow': '0 0 10px currentColor',
          'term-glow-lg': '0 0 20px currentColor',
        },
        borderRadius: {
          'term': '0',
        },
        animation: {
          'blink': 'blink 1s step-end infinite',
          'scan': 'scan 8s linear infinite',
        },
        keyframes: {
          'blink': {
            '0%, 50%': { opacity: '1' },
            '51%, 100%': { opacity: '0' },
          },
          'scan': {
            '0%': { transform: 'translateY(-100%)' },
            '100%': { transform: 'translateY(100vh)' },
          },
        },
      },
    },
  };
}

function generateWeb3Config(catalog: GallerySources): TailwindConfig {
  const palette = catalog.colorPalettes.web3;
  const typography = catalog.typography.web3;
  const colors = palette.colors as Record<string, string[]>;

  return {
    theme: {
      extend: {
        colors: {
          'web3-bg': colors.primary[0],
          'web3-indigo': colors.primary[1],
          'web3-purple': colors.primary[2],
          'web3-pink': colors.primary[3],
        },
        fontFamily: {
          'display': typography.display,
          'body': typography.body!,
        },
        backgroundImage: {
          'web3-gradient': colors.gradients[0],
          'web3-gradient-accent': colors.gradients[1],
          'web3-gradient-mesh': `
            radial-gradient(at 40% 20%, ${colors.primary[1]} 0px, transparent 50%),
            radial-gradient(at 80% 0%, ${colors.primary[2]} 0px, transparent 50%),
            radial-gradient(at 0% 50%, ${colors.primary[1]} 0px, transparent 50%),
            radial-gradient(at 80% 50%, ${colors.primary[3]} 0px, transparent 50%),
            radial-gradient(at 0% 100%, ${colors.primary[2]} 0px, transparent 50%)
          `.replace(/\s+/g, ' ').trim(),
        },
        boxShadow: {
          'web3-glow': `0 0 20px ${colors.primary[1]}40`,
          'web3-glow-lg': `0 0 40px ${colors.primary[1]}60`,
          'web3-glow-purple': `0 0 20px ${colors.primary[2]}40`,
          'web3-glow-pink': `0 0 20px ${colors.primary[3]}40`,
        },
        animation: {
          'web3-pulse': 'web3-pulse 2s ease-in-out infinite',
          'web3-float': 'web3-float 3s ease-in-out infinite',
        },
        keyframes: {
          'web3-pulse': {
            '0%, 100%': { opacity: '1' },
            '50%': { opacity: '0.5' },
          },
          'web3-float': {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-10px)' },
          },
        },
      },
    },
  };
}

function generateClaymorphismConfig(catalog: GallerySources): TailwindConfig {
  const palette = catalog.colorPalettes.claymorphism;

  return {
    theme: {
      extend: {
        colors: {
          'clay-pink': palette.backgrounds![0],
          'clay-blue': palette.backgrounds![1],
          'clay-peach': palette.backgrounds![2],
          'clay-lavender': palette.backgrounds![3],
          'clay-shadow-pink': palette.shadows![0],
          'clay-shadow-blue': palette.shadows![1],
          'clay-shadow-peach': palette.shadows![2],
          'clay-shadow-lavender': palette.shadows![3],
        },
        borderRadius: {
          'clay-sm': '12px',
          'clay': '16px',
          'clay-md': '24px',
          'clay-lg': '30px',
          'clay-xl': '40px',
        },
        boxShadow: {
          'clay': '20px 20px 60px #bebebe, -20px -20px 60px #ffffff',
          'clay-pink': `20px 20px 60px ${palette.shadows![0]}, -20px -20px 60px #ffffff`,
          'clay-blue': `20px 20px 60px ${palette.shadows![1]}, -20px -20px 60px #ffffff`,
          'clay-inset': 'inset 10px 10px 30px #bebebe, inset -10px -10px 30px #ffffff',
        },
        backgroundImage: {
          'clay-gradient': 'linear-gradient(145deg, #e6e6e6, #ffffff)',
        },
      },
    },
  };
}

function generateSwissConfig(catalog: GallerySources): TailwindConfig {
  const typography = catalog.typography.swiss;

  return {
    theme: {
      extend: {
        colors: {
          'swiss-black': '#000000',
          'swiss-white': '#FFFFFF',
          'swiss-red': '#FF0000',
          'swiss-gray': {
            '50': '#FAFAFA',
            '100': '#F5F5F5',
            '200': '#E5E5E5',
            '300': '#D4D4D4',
            '400': '#A3A3A3',
            '500': '#737373',
            '600': '#525252',
            '700': '#404040',
            '800': '#262626',
            '900': '#171717',
          },
        },
        fontFamily: {
          'display': typography.display,
          'body': typography.body!,
        },
        borderRadius: {
          'swiss': '0',
          'swiss-sm': '2px',
          'swiss-md': '4px',
        },
        gridTemplateColumns: {
          'swiss-12': 'repeat(12, minmax(0, 1fr))',
        },
        gap: {
          'swiss': '1.5rem',
        },
      },
    },
  };
}

function generateDefaultConfig(trend: Trend): TailwindConfig {
  return {
    theme: {
      extend: {
        colors: {
          [`${trend.id}-primary`]: '#3B82F6',
          [`${trend.id}-secondary`]: '#10B981',
          [`${trend.id}-accent`]: '#8B5CF6',
        },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Main Config Generator
// ---------------------------------------------------------------------------

function generateConfig(trendId: string, catalog: GallerySources): TailwindConfig {
  const trend = catalog.trends2026.find(t => t.id === trendId);

  const generators: Record<string, () => TailwindConfig> = {
    'neobrutalism': () => generateNeobrutalismConfig(catalog),
    'glassmorphism': () => generateGlassmorphismConfig(catalog),
    'neumorphism': () => generateGlassmorphismConfig(catalog),
    'terminal-aesthetic': () => generateTerminalConfig(catalog),
    'web3-crypto': () => generateWeb3Config(catalog),
    'claymorphism': () => generateClaymorphismConfig(catalog),
    'swiss-modern': () => generateSwissConfig(catalog),
    'hyperminimalism': () => generateSwissConfig(catalog),
  };

  const generator = generators[trendId];
  if (generator) {
    return generator();
  }

  if (trend) {
    return generateDefaultConfig(trend);
  }

  throw new Error(`Unknown trend: ${trendId}`);
}

// ---------------------------------------------------------------------------
// Output Formatting
// ---------------------------------------------------------------------------

function formatAsTypeScript(config: TailwindConfig, trendId: string): string {
  const json = JSON.stringify(config, null, 2);

  return `// Tailwind CSS Configuration for ${trendId}
// Generated by design-system-generator
// Usage: Merge with your existing tailwind.config.ts

import type { Config } from 'tailwindcss';

const config: Partial<Config> = ${json};

export default config;
`;
}

// ---------------------------------------------------------------------------
// Main Execution
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const outputFormat = args.includes('--json') ? 'json' : 'typescript';
const trendId = args.find(arg => !arg.startsWith('--'));

if (!trendId) {
  console.log('Usage: npx ts-node generate-tailwind.ts <trend-id> [--json]');
  console.log('');
  console.log('Available trends:');
  console.log('  neobrutalism, glassmorphism, neumorphism, terminal-aesthetic,');
  console.log('  web3-crypto, claymorphism, swiss-modern, hyperminimalism, etc.');
  console.log('');
  console.log('Options:');
  console.log('  --json    Output raw JSON instead of TypeScript');
  console.log('');
  console.log('Example: npx ts-node generate-tailwind.ts neobrutalism');
  process.exit(1);
}

const catalogPath = path.resolve(__dirname, '../../../../website/design-catalog/gallery-sources.json');

if (!fs.existsSync(catalogPath)) {
  console.error(`Error: Design catalog not found at ${catalogPath}`);
  process.exit(1);
}

const catalog = loadCatalog(catalogPath);
const config = generateConfig(trendId, catalog);

if (outputFormat === 'json') {
  console.log(JSON.stringify(config, null, 2));
} else {
  console.log(formatAsTypeScript(config, trendId));
}

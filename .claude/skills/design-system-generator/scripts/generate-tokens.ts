#!/usr/bin/env npx ts-node
/**
 * Design Token Generator
 *
 * Generates DTCG W3C-compliant design tokens from matched design trends.
 * Outputs a complete token set including colors, typography, spacing, shadows.
 *
 * Usage: npx ts-node generate-tokens.ts <trend-id>
 *
 * Output format: DTCG (Design Token Community Group) W3C Draft
 * @see https://design-tokens.github.io/community-group/format/
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
  colors?: string[];
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
  metallics?: string[];
  muted?: string[];
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

// DTCG Token Types
interface DTCGToken {
  $value: string | number | Record<string, unknown>;
  $type: 'color' | 'fontFamily' | 'fontWeight' | 'dimension' | 'shadow' | 'duration' | 'cubicBezier';
  $description?: string;
}

interface DTCGTokenGroup {
  [key: string]: DTCGToken | DTCGTokenGroup;
}

// ---------------------------------------------------------------------------
// Constants: Base spacing/sizing scales (shared across all trends)
// ---------------------------------------------------------------------------

const SPACING_SCALE: Record<string, string> = {
  'px': '1px',
  '0': '0',
  '0.5': '0.125rem',
  '1': '0.25rem',
  '1.5': '0.375rem',
  '2': '0.5rem',
  '2.5': '0.625rem',
  '3': '0.75rem',
  '3.5': '0.875rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '7': '1.75rem',
  '8': '2rem',
  '9': '2.25rem',
  '10': '2.5rem',
  '11': '2.75rem',
  '12': '3rem',
  '14': '3.5rem',
  '16': '4rem',
  '20': '5rem',
  '24': '6rem',
  '28': '7rem',
  '32': '8rem',
  '36': '9rem',
  '40': '10rem',
  '44': '11rem',
  '48': '12rem',
};

const BORDER_RADIUS_STANDARD: Record<string, string> = {
  'none': '0',
  'sm': '0.125rem',
  'md': '0.25rem',
  'lg': '0.5rem',
  'xl': '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  'full': '9999px',
};

// Trend-specific radius modifications
const BORDER_RADIUS_NEOBRUTALISM: Record<string, string> = {
  'none': '0',
  'sm': '0',
  'md': '0',
  'lg': '2px',
  'xl': '4px',
  '2xl': '8px',
  '3xl': '12px',
  'full': '9999px',
};

const BORDER_RADIUS_CLAYMORPHISM: Record<string, string> = {
  'none': '0',
  'sm': '12px',
  'md': '16px',
  'lg': '24px',
  'xl': '30px',
  '2xl': '40px',
  '3xl': '50px',
  'full': '9999px',
};

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

function loadCatalog(catalogPath: string): GallerySources {
  return JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
}

function hexToRGB(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;
  return {
    r: parseInt(match[1], 16),
    g: parseInt(match[2], 16),
    b: parseInt(match[3], 16),
  };
}

function createColorToken(hex: string, description?: string): DTCGToken {
  return {
    $value: hex,
    $type: 'color',
    ...(description && { $description: description }),
  };
}

function createFontToken(fonts: string[], description?: string): DTCGToken {
  return {
    $value: fonts.join(', '),
    $type: 'fontFamily',
    ...(description && { $description: description }),
  };
}

function createDimensionToken(value: string, description?: string): DTCGToken {
  return {
    $value: value,
    $type: 'dimension',
    ...(description && { $description: description }),
  };
}

// ---------------------------------------------------------------------------
// Token Generators by Trend
// ---------------------------------------------------------------------------

function generateNeobrutalismTokens(catalog: GallerySources): DTCGTokenGroup {
  const palette = catalog.colorPalettes.neobrutalism;
  const typography = catalog.typography.neobrutalism;

  return {
    color: {
      primary: {
        red: createColorToken(palette.vibrant!.red, 'Attention-grabbing primary'),
        yellow: createColorToken(palette.vibrant!.yellow, 'Highlights and warnings'),
        blue: createColorToken(palette.vibrant!.blue, 'Links and interactive'),
        green: createColorToken(palette.vibrant!.green, 'Success states'),
        purple: createColorToken(palette.vibrant!.purple, 'Accent color'),
      },
      neutral: {
        cream: createColorToken(palette.vintage!.cream, 'Background surfaces'),
        sage: createColorToken(palette.vintage!.sage, 'Secondary surfaces'),
        dustyRose: createColorToken(palette.vintage!.dustyRose, 'Subtle accents'),
        mustard: createColorToken(palette.vintage!.mustard, 'Warm accent'),
        slate: createColorToken(palette.vintage!.slate, 'Body text'),
      },
      border: {
        default: createColorToken('#000000', 'Hard black borders - signature neobrutalist'),
      },
      shadow: {
        color: createColorToken('#000000', 'Hard shadow color - no blur'),
      },
    },
    typography: {
      display: createFontToken(typography.display, 'Bold display headlines'),
      body: createFontToken(typography.body!, 'Readable body text'),
    },
    spacing: Object.fromEntries(
      Object.entries(SPACING_SCALE).map(([key, val]) => [
        key, createDimensionToken(val)
      ])
    ),
    borderRadius: Object.fromEntries(
      Object.entries(BORDER_RADIUS_NEOBRUTALISM).map(([key, val]) => [
        key, createDimensionToken(val, 'Neobrutalist minimal rounding')
      ])
    ),
    borderWidth: {
      thin: createDimensionToken('2px', 'Subtle borders'),
      default: createDimensionToken('3px', 'Standard neobrutalist border'),
      thick: createDimensionToken('4px', 'Heavy emphasis'),
    },
    shadow: {
      sm: {
        $value: { offsetX: '2px', offsetY: '2px', blur: '0', spread: '0', color: '#000000' },
        $type: 'shadow',
        $description: 'Small hard shadow',
      },
      md: {
        $value: { offsetX: '4px', offsetY: '4px', blur: '0', spread: '0', color: '#000000' },
        $type: 'shadow',
        $description: 'Default neobrutalist shadow',
      },
      lg: {
        $value: { offsetX: '6px', offsetY: '6px', blur: '0', spread: '0', color: '#000000' },
        $type: 'shadow',
        $description: 'Large emphasis shadow',
      },
      hover: {
        $value: { offsetX: '6px', offsetY: '6px', blur: '0', spread: '0', color: '#000000' },
        $type: 'shadow',
        $description: 'Hover state - larger offset',
      },
      active: {
        $value: { offsetX: '2px', offsetY: '2px', blur: '0', spread: '0', color: '#000000' },
        $type: 'shadow',
        $description: 'Active/pressed state - smaller offset',
      },
    },
    duration: {
      instant: { $value: '0ms', $type: 'duration' },
      fast: { $value: '100ms', $type: 'duration' },
      default: { $value: '150ms', $type: 'duration' },
    },
  };
}

function generateGlassmorphismTokens(catalog: GallerySources): DTCGTokenGroup {
  return {
    color: {
      surface: {
        frosted: createColorToken('rgba(255, 255, 255, 0.1)', 'Frosted glass surface'),
        frostedDark: createColorToken('rgba(0, 0, 0, 0.1)', 'Dark frosted surface'),
        overlay: createColorToken('rgba(255, 255, 255, 0.05)', 'Subtle overlay'),
      },
      border: {
        glass: createColorToken('rgba(255, 255, 255, 0.2)', 'Subtle glass edge'),
        glassDark: createColorToken('rgba(0, 0, 0, 0.1)', 'Dark mode glass edge'),
      },
      text: {
        onGlass: createColorToken('#FFFFFF', 'Text on glass surfaces'),
        onGlassMuted: createColorToken('rgba(255, 255, 255, 0.7)', 'Muted text on glass'),
      },
    },
    blur: {
      sm: createDimensionToken('4px', 'Subtle blur'),
      md: createDimensionToken('10px', 'Standard glass blur'),
      lg: createDimensionToken('20px', 'Heavy blur effect'),
      xl: createDimensionToken('40px', 'Maximum blur'),
    },
    borderRadius: Object.fromEntries(
      Object.entries(BORDER_RADIUS_STANDARD).map(([key, val]) => [
        key, createDimensionToken(val)
      ])
    ),
    borderWidth: {
      glass: createDimensionToken('1px', 'Subtle glass border'),
    },
    spacing: Object.fromEntries(
      Object.entries(SPACING_SCALE).map(([key, val]) => [
        key, createDimensionToken(val)
      ])
    ),
  };
}

function generateTerminalTokens(catalog: GallerySources): DTCGTokenGroup {
  const palette = catalog.colorPalettes.terminal;
  const typography = catalog.typography.terminal;

  return {
    color: {
      classic: {
        bg: createColorToken(palette.colors!.classic[0] as string, 'Terminal background'),
        text: createColorToken(palette.colors!.classic[1] as string, 'Primary text (green phosphor)'),
        surface: createColorToken(palette.colors!.classic[2] as string, 'Elevated surfaces'),
        accent: createColorToken(palette.colors!.classic[3] as string, 'Bright accent'),
      },
      amber: {
        bg: createColorToken(palette.colors!.amber[0] as string, 'Amber terminal background'),
        text: createColorToken(palette.colors!.amber[1] as string, 'Amber phosphor text'),
        surface: createColorToken(palette.colors!.amber[2] as string, 'Amber surface'),
        accent: createColorToken(palette.colors!.amber[3] as string, 'Amber accent'),
      },
      matrix: {
        bg: createColorToken(palette.colors!.matrix[0] as string, 'Matrix dark background'),
        dim: createColorToken(palette.colors!.matrix[1] as string, 'Matrix dim text'),
        normal: createColorToken(palette.colors!.matrix[2] as string, 'Matrix normal text'),
        bright: createColorToken(palette.colors!.matrix[3] as string, 'Matrix bright highlight'),
      },
    },
    typography: {
      mono: createFontToken(typography.display, 'Monospace display'),
      body: createFontToken(typography.body!, 'Monospace body'),
    },
    spacing: Object.fromEntries(
      Object.entries(SPACING_SCALE).map(([key, val]) => [
        key, createDimensionToken(val)
      ])
    ),
    borderRadius: {
      none: createDimensionToken('0', 'Terminal aesthetic - no rounding'),
      sm: createDimensionToken('2px', 'Minimal rounding'),
    },
  };
}

function generateWeb3Tokens(catalog: GallerySources): DTCGTokenGroup {
  const palette = catalog.colorPalettes.web3;
  const typography = catalog.typography.web3;

  return {
    color: {
      background: {
        dark: createColorToken(palette.colors!.primary[0] as string, 'Deep dark background'),
      },
      primary: {
        indigo: createColorToken(palette.colors!.primary[1] as string, 'Primary indigo'),
        purple: createColorToken(palette.colors!.primary[2] as string, 'Secondary purple'),
        pink: createColorToken(palette.colors!.primary[3] as string, 'Accent pink'),
      },
      gradient: {
        primary: {
          $value: palette.colors!.gradients[0],
          $type: 'color',
          $description: 'Primary gradient (indigo to purple)',
        },
        accent: {
          $value: palette.colors!.gradients[1],
          $type: 'color',
          $description: 'Accent gradient (pink to maroon)',
        },
      },
    },
    typography: {
      display: createFontToken(typography.display, 'Geometric display fonts'),
      body: createFontToken(typography.body!, 'Clean body fonts'),
    },
    spacing: Object.fromEntries(
      Object.entries(SPACING_SCALE).map(([key, val]) => [
        key, createDimensionToken(val)
      ])
    ),
    borderRadius: Object.fromEntries(
      Object.entries(BORDER_RADIUS_STANDARD).map(([key, val]) => [
        key, createDimensionToken(val)
      ])
    ),
    glow: {
      sm: createDimensionToken('0 0 10px', 'Subtle glow'),
      md: createDimensionToken('0 0 20px', 'Medium glow'),
      lg: createDimensionToken('0 0 40px', 'Large glow effect'),
    },
  };
}

function generateClaymorphismTokens(catalog: GallerySources): DTCGTokenGroup {
  const palette = catalog.colorPalettes.claymorphism;

  return {
    color: {
      surface: {
        pink: createColorToken(palette.backgrounds![0], 'Soft pink clay surface'),
        blue: createColorToken(palette.backgrounds![1], 'Soft blue clay surface'),
        peach: createColorToken(palette.backgrounds![2], 'Soft peach clay surface'),
        lavender: createColorToken(palette.backgrounds![3], 'Soft lavender clay surface'),
      },
      shadow: {
        pink: createColorToken(palette.shadows![0], 'Pink shadow tone'),
        blue: createColorToken(palette.shadows![1], 'Blue shadow tone'),
        peach: createColorToken(palette.shadows![2], 'Peach shadow tone'),
        lavender: createColorToken(palette.shadows![3], 'Lavender shadow tone'),
      },
    },
    borderRadius: Object.fromEntries(
      Object.entries(BORDER_RADIUS_CLAYMORPHISM).map(([key, val]) => [
        key, createDimensionToken(val, 'Claymorphism - heavy rounding')
      ])
    ),
    shadow: {
      outer: {
        $value: { offsetX: '20px', offsetY: '20px', blur: '60px', spread: '0', color: '#bebebe' },
        $type: 'shadow',
        $description: 'Outer clay shadow',
      },
      inner: {
        $value: { offsetX: '-20px', offsetY: '-20px', blur: '60px', spread: '0', color: '#ffffff' },
        $type: 'shadow',
        $description: 'Inner highlight shadow',
      },
    },
    spacing: Object.fromEntries(
      Object.entries(SPACING_SCALE).map(([key, val]) => [
        key, createDimensionToken(val)
      ])
    ),
  };
}

function generateSwissTokens(catalog: GallerySources): DTCGTokenGroup {
  const typography = catalog.typography.swiss;

  return {
    color: {
      primary: {
        black: createColorToken('#000000', 'Pure black'),
        white: createColorToken('#FFFFFF', 'Pure white'),
        red: createColorToken('#FF0000', 'Swiss red accent'),
      },
      neutral: {
        '50': createColorToken('#FAFAFA'),
        '100': createColorToken('#F5F5F5'),
        '200': createColorToken('#E5E5E5'),
        '300': createColorToken('#D4D4D4'),
        '400': createColorToken('#A3A3A3'),
        '500': createColorToken('#737373'),
        '600': createColorToken('#525252'),
        '700': createColorToken('#404040'),
        '800': createColorToken('#262626'),
        '900': createColorToken('#171717'),
      },
    },
    typography: {
      display: createFontToken(typography.display, 'Neutral Swiss typefaces'),
      body: createFontToken(typography.body!, 'Clean body fonts'),
    },
    spacing: Object.fromEntries(
      Object.entries(SPACING_SCALE).map(([key, val]) => [
        key, createDimensionToken(val)
      ])
    ),
    borderRadius: {
      none: createDimensionToken('0', 'Swiss - crisp edges'),
      sm: createDimensionToken('2px', 'Minimal'),
      md: createDimensionToken('4px', 'Subtle'),
    },
    grid: {
      columns: createDimensionToken('12', 'Standard grid columns'),
      gutter: createDimensionToken('1.5rem', 'Grid gutter width'),
    },
  };
}

// Default tokens for trends without specific definitions
function generateDefaultTokens(trend: Trend): DTCGTokenGroup {
  return {
    _meta: {
      trend: { $value: trend.id, $type: 'dimension' as any, $description: trend.description },
      status: { $value: trend.status, $type: 'dimension' as any },
    },
    color: {
      primary: createColorToken('#3B82F6', 'Primary blue'),
      secondary: createColorToken('#10B981', 'Secondary green'),
      accent: createColorToken('#8B5CF6', 'Accent purple'),
      neutral: {
        '50': createColorToken('#F9FAFB'),
        '100': createColorToken('#F3F4F6'),
        '200': createColorToken('#E5E7EB'),
        '300': createColorToken('#D1D5DB'),
        '400': createColorToken('#9CA3AF'),
        '500': createColorToken('#6B7280'),
        '600': createColorToken('#4B5563'),
        '700': createColorToken('#374151'),
        '800': createColorToken('#1F2937'),
        '900': createColorToken('#111827'),
      },
    },
    spacing: Object.fromEntries(
      Object.entries(SPACING_SCALE).map(([key, val]) => [
        key, createDimensionToken(val)
      ])
    ),
    borderRadius: Object.fromEntries(
      Object.entries(BORDER_RADIUS_STANDARD).map(([key, val]) => [
        key, createDimensionToken(val)
      ])
    ),
  };
}

// ---------------------------------------------------------------------------
// Main Token Generator
// ---------------------------------------------------------------------------

function generateTokens(trendId: string, catalog: GallerySources): DTCGTokenGroup {
  const trend = catalog.trends2026.find(t => t.id === trendId);

  // Map trend IDs to their token generators
  const generators: Record<string, () => DTCGTokenGroup> = {
    'neobrutalism': () => generateNeobrutalismTokens(catalog),
    'glassmorphism': () => generateGlassmorphismTokens(catalog),
    'neumorphism': () => generateGlassmorphismTokens(catalog), // Similar to glass
    'terminal-aesthetic': () => generateTerminalTokens(catalog),
    'web3-crypto': () => generateWeb3Tokens(catalog),
    'claymorphism': () => generateClaymorphismTokens(catalog),
    'swiss-modern': () => generateSwissTokens(catalog),
    'hyperminimalism': () => generateSwissTokens(catalog), // Minimalist = Swiss approach
  };

  const generator = generators[trendId];
  if (generator) {
    return generator();
  }

  // Default tokens for other trends
  if (trend) {
    return generateDefaultTokens(trend);
  }

  throw new Error(`Unknown trend: ${trendId}`);
}

// ---------------------------------------------------------------------------
// Main Execution
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: npx ts-node generate-tokens.ts <trend-id>');
  console.log('');
  console.log('Available trends:');
  console.log('  neobrutalism, glassmorphism, neumorphism, terminal-aesthetic,');
  console.log('  web3-crypto, claymorphism, swiss-modern, hyperminimalism, etc.');
  console.log('');
  console.log('Example: npx ts-node generate-tokens.ts neobrutalism');
  process.exit(1);
}

const trendId = args[0];
const catalogPath = path.resolve(__dirname, '../../../../website/design-catalog/gallery-sources.json');

if (!fs.existsSync(catalogPath)) {
  console.error(`Error: Design catalog not found at ${catalogPath}`);
  process.exit(1);
}

const catalog = loadCatalog(catalogPath);
const tokens = generateTokens(trendId, catalog);

// Output as DTCG-compliant JSON
console.log(JSON.stringify({
  $schema: 'https://design-tokens.github.io/community-group/format/draft-2024.json',
  _meta: {
    generatedFrom: 'design-system-generator',
    trend: trendId,
    timestamp: new Date().toISOString(),
  },
  ...tokens,
}, null, 2));

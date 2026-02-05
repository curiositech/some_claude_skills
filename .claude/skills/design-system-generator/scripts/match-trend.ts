#!/usr/bin/env npx ts-node
/**
 * Design Trend Matcher
 *
 * Matches natural language descriptions to design trends from gallery-sources.json
 *
 * Usage: npx ts-node match-trend.ts "description of desired design"
 *
 * Dependencies: npm install (uses project's typescript)
 */

import * as fs from 'fs';
import * as path from 'path';

interface Trend {
  id: string;
  name: string;
  description: string;
  status: string;
  examples?: string[];
  technologies?: string[];
  sources: string[];
}

interface MatchResult {
  trend: Trend;
  score: number;
  matchedKeywords: string[];
}

// Keyword mappings for each trend (shibboleths)
// Includes all 24 trends from gallery-sources.json + 31 DesignPrompts styles
const TREND_KEYWORDS: Record<string, string[]> = {
  // === Core Trends from gallery-sources.json ===
  'swiss-modern': ['clean', 'minimal', 'grid', 'professional', 'tech', 'saas', 'dashboard', 'developer', 'linear', 'figma', 'stripe', 'helvetica', 'rational', 'functional'],
  'neobrutalism': ['bold', 'stark', 'dramatic', 'raw', 'contrasting', 'indie', 'gumroad', 'creative', 'memorable', 'anti-design', 'hard shadow', 'thick border', 'no blur', 'offset'],
  'glassmorphism': ['modern', 'transparent', 'blur', 'frosted', 'glass', 'elegant', 'ios', 'macos', 'backdrop', 'translucent'],
  'neumorphism': ['soft', 'tactile', 'raised', 'inset', 'premium', 'ios', 'apple', 'extruded', 'embossed'],
  'dark-mode': ['dark', 'night', 'oled', 'eye strain', 'developer', 'coding', 'low light'],
  'hyperminimalism': ['minimal', 'essential', 'calm', 'serene', 'peaceful', 'wellness', 'meditation', 'zen', 'whitespace'],
  'maximalism': ['vibrant', 'colorful', 'rich', 'busy', 'entertainment', 'creative', 'expressive', 'dense', 'overwhelming'],
  'cyberpunk': ['neon', 'tech', 'futuristic', 'bold', 'edgy', 'gaming', 'esports', 'synthwave', 'dystopia', 'glitch', 'blade runner'],
  'retrofuturism': ['vintage', 'sci-fi', 'chrome', 'pixel', 'arcade', 'retro', 'nostalgia', 'space age'],
  '3d-immersive': ['interactive', 'webgl', 'ar', 'immersive', '3d', 'portfolio', 'showcase', 'spline', 'three.js'],
  'motion-design': ['animated', 'micro', 'scroll', 'hover', 'engaging', 'dynamic', 'kinetic', 'transition'],
  'bold-typography': ['oversized', 'kinetic', 'variable', 'editorial', 'statement', 'type', 'headline', 'expressive'],
  'collage': ['scrapbook', 'torn', 'cutout', 'hand-drawn', 'artistic', 'creative', 'mixed media', 'sticker'],
  'sustainable-design': ['ethical', 'accessible', 'lean', 'green', 'eco', 'mission', 'lightweight', 'optimized'],
  'claymorphism': ['clay', 'soft', 'rounded', 'playful', 'friendly', 'approachable', '3d', 'pastel', 'bubbly'],
  'terminal-aesthetic': ['monospace', 'cli', 'hacker', 'green', 'developer', 'code', 'command line', 'phosphor', 'matrix'],
  'web3-crypto': ['gradient', 'blockchain', 'crypto', 'fintech', 'futuristic', 'glow', 'nft', 'ethereum', 'solana', 'defi'],
  'botanical-organic': ['natural', 'earthy', 'plant', 'organic', 'wellness', 'eco', 'green', 'leaf', 'nature', 'sustainable'],
  'art-deco-revival': ['geometric', 'gold', 'luxury', '1920s', 'premium', 'fashion', 'elegant', 'gatsby', 'roaring twenties'],
  'gamified-design': ['game', 'points', 'badges', 'progress', 'reward', 'fun', 'interactive', 'achievement', 'leaderboard'],
  'vibrant-colors': ['y2k', 'neon', 'dopamine', 'playful', 'energetic', 'pop', 'saturated', 'high contrast'],
  'scroll-driven-animations': ['scroll', 'parallax', 'view-timeline', 'modern', 'interactive', 'scroll-linked', 'animation-timeline'],
  'experimental-navigation': ['radial', 'hidden', 'drawer', 'nonlinear', 'unconventional', 'innovative nav'],
  'dynamic-cursors': ['cursor', 'pointer', 'flashlight', 'following', 'custom cursor', 'interactive pointer'],

  // === DesignPrompts AI-Ready Styles (31 total) ===
  'monochrome': ['black white', 'editorial', 'stark', 'dramatic', 'newsroom', 'magazine', 'high contrast', 'pure'],
  'bauhaus': ['geometric', 'primary colors', 'functional', 'modernist', 'grid', 'form follows function'],
  'modern-dark': ['contemporary', 'dark theme', 'subtle gradient', 'sleek', 'night mode'],
  'newsprint': ['editorial', 'newspaper', 'columns', 'serif', 'headlines', 'broadsheet', 'print'],
  'saas': ['startup', 'product', 'dashboard', 'app', 'software', 'landing page', 'conversion'],
  'luxury': ['premium', 'gold', 'elegant', 'refined', 'exclusive', 'high-end', 'boutique'],
  'terminal': ['cli', 'command line', 'hacker', 'code', 'developer', 'green screen', 'console'],
  'swiss-minimalist': ['helvetica', 'grid', 'international', 'typographic', 'zurich', 'rational'],
  'kinetic': ['motion', 'animated text', 'typography', 'moving', 'dynamic type'],
  'flat-design': ['no shadows', 'bold colors', 'simple shapes', 'clean', 'metro', 'material'],
  'art-deco': ['gatsby', '1920s', 'roaring twenties', 'gold', 'geometric luxury', 'jazz age'],
  'material-design': ['google', 'elevation', 'ripple', 'fab', 'card', 'android'],
  'neo-brutalism': ['hard shadow', 'thick border', 'raw', 'gumroad style', 'figma style', 'offset shadow'],
  'academia': ['university', 'scholarly', 'research', 'library', 'classic', 'academic', 'intellectual'],
  'playful-geometric': ['shapes', 'colors', 'friendly', 'fun', 'bouncy', 'quirky'],
  'minimal-dark': ['less is more', 'dark elegance', 'sophisticated', 'clean dark'],
  'professional': ['corporate', 'trustworthy', 'clean', 'business', 'enterprise', 'b2b'],
  'botanical': ['plant', 'nature', 'organic', 'earthy', 'leaves', 'garden', 'green'],
  'vaporwave': ['retrowave', '80s', '90s', 'aesthetic', 'sunset', 'grid', 'pink cyan', 'outrun'],
  'enterprise': ['b2b', 'corporate', 'business', 'data', 'dashboard', 'analytics'],
  'sketch': ['hand drawn', 'doodle', 'informal', 'playful', 'rough', 'pencil'],
  'industrial': ['factory', 'raw', 'metal', 'exposed', 'structural', 'utilitarian'],
  'organic': ['natural curves', 'flowing shapes', 'biomorphic', 'soft', 'rounded'],
  'retro': ['vintage computing', 'nostalgic', 'throwback', 'old school', '8-bit'],
};

// Negative keywords (if present, reduce score)
const NEGATIVE_KEYWORDS: Record<string, string[]> = {
  'neobrutalism': ['soft', 'blur', 'gradient', 'subtle', 'elegant'],
  'glassmorphism': ['bold', 'stark', 'raw', 'hard'],
  'hyperminimalism': ['busy', 'colorful', 'vibrant', 'complex'],
  'dark-mode': ['light', 'bright', 'white'],
};

function loadTrends(catalogPath: string): Trend[] {
  const data = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  return data.trends2026 || [];
}

function matchTrends(description: string, trends: Trend[]): MatchResult[] {
  const descLower = description.toLowerCase();
  const words = descLower.split(/\s+/);

  const results: MatchResult[] = [];

  for (const trend of trends) {
    const keywords = TREND_KEYWORDS[trend.id] || [];
    const negatives = NEGATIVE_KEYWORDS[trend.id] || [];

    let score = 0;
    const matchedKeywords: string[] = [];

    // Positive matches
    for (const keyword of keywords) {
      if (descLower.includes(keyword)) {
        score += 1;
        matchedKeywords.push(keyword);
      }
    }

    // Partial word matches (less weight)
    for (const word of words) {
      for (const keyword of keywords) {
        if (keyword.includes(word) && word.length > 3 && !matchedKeywords.includes(keyword)) {
          score += 0.5;
          matchedKeywords.push(`~${keyword}`);
        }
      }
    }

    // Negative matches reduce score
    for (const negative of negatives) {
      if (descLower.includes(negative)) {
        score -= 0.5;
      }
    }

    // Also check trend's own description for matches
    const trendDescLower = trend.description.toLowerCase();
    for (const word of words) {
      if (word.length > 4 && trendDescLower.includes(word)) {
        score += 0.3;
      }
    }

    if (score > 0) {
      results.push({ trend, score, matchedKeywords });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

function calculateConfidence(topScore: number, secondScore: number): number {
  if (topScore === 0) return 0;
  if (secondScore === 0) return 0.95;

  const gap = topScore - secondScore;
  const confidence = Math.min(0.95, 0.5 + (gap / topScore) * 0.5);
  return Math.round(confidence * 100) / 100;
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: npx ts-node match-trend.ts "description of desired design"');
  console.log('');
  console.log('Example: npx ts-node match-trend.ts "clean dashboard for developers"');
  process.exit(1);
}

const description = args.join(' ');
const catalogPath = path.resolve(__dirname, '../../../../website/design-catalog/gallery-sources.json');

if (!fs.existsSync(catalogPath)) {
  console.error(`Error: Design catalog not found at ${catalogPath}`);
  process.exit(1);
}

const trends = loadTrends(catalogPath);
const matches = matchTrends(description, trends);

if (matches.length === 0) {
  console.log('No matching trends found. Try a more descriptive query.');
  process.exit(0);
}

const primary = matches[0];
const secondary = matches[1];
const confidence = calculateConfidence(primary.score, secondary?.score || 0);

console.log(JSON.stringify({
  query: description,
  primary: {
    id: primary.trend.id,
    name: primary.trend.name,
    score: primary.score,
    matchedKeywords: primary.matchedKeywords,
    status: primary.trend.status
  },
  secondary: secondary ? {
    id: secondary.trend.id,
    name: secondary.trend.name,
    score: secondary.score,
    matchedKeywords: secondary.matchedKeywords
  } : null,
  confidence,
  reasoning: `Matched "${primary.trend.name}" based on keywords: ${primary.matchedKeywords.join(', ')}`
}, null, 2));

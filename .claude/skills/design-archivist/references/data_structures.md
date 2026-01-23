# Design Archivist Data Structures

Complete TypeScript interfaces for all data structures used by the Design Archivist skill.

## Visual DNA

```typescript
interface VisualDNA {
  colors: {
    palette: string[]; // Hex codes
    primaryColor: string;
    secondaryColors: string[];
    accentColors: string[];
    dominance: { color: string; percentage: number }[];
  };

  typography: {
    primary: { family: string; weight: number; size: string };
    secondary: { family: string; weight: number; size: string };
    hierarchy: string[]; // Font families in order of prominence
    characteristics: string[]; // 'serif', 'sans-serif', 'monospace', 'display'
  };

  layout: {
    gridSystem: string; // '12-column', 'flexbox', 'freeform', 'masonry'
    spacing: string; // '4px base', '8px base', 'generous', 'tight'
    structure: string; // 'single-column', 'sidebar', 'grid', 'asymmetric'
    whitespace: string; // 'minimal', 'balanced', 'generous'
  };

  interactions: {
    patterns: string[]; // 'hover-lift', 'smooth-scroll', 'parallax', 'fade-in'
    speed: string; // 'instant', 'snappy', 'smooth', 'slow'
    effects: string[]; // 'blur', 'scale', 'color-shift', 'slide'
  };

  animation: {
    presence: string; // 'none', 'subtle', 'moderate', 'heavy'
    types: string[]; // 'scroll-triggered', 'hover-activated', 'auto-play'
    timing: string; // 'fast' (&lt;200ms), 'medium' (200-500ms), 'slow' (&gt;500ms)
  };
}
```

## Context Analysis

```typescript
interface ContextAnalysis {
  targetAudience: {
    demographic: string;
    techSavviness: 'beginner' | 'intermediate' | 'expert';
    expectedIntent: string[];
  };

  positioning: {
    priceSignal: 'budget' | 'mid-market' | 'premium' | 'luxury';
    trustLevel: 'casual' | 'professional' | 'enterprise';
    innovationLevel: 'conservative' | 'modern' | 'cutting-edge';
  };

  successSignals: {
    engagementMetrics?: { visits: number; timeOnSite: number };
    conversionIndicators: string[]; // 'clear CTA', 'trust badges', 'social proof'
    technicalQuality: string[]; // 'fast-loading', 'responsive', 'accessible'
  };

  competitiveSet: {
    similarSites: string[]; // URLs
    differentiators: string[]; // How this site stands out
  };
}
```

## Pattern Database

```typescript
interface Pattern {
  name: string;
  frequency: number; // How many examples use this
  description: string;
  examples: string[]; // URLs demonstrating pattern
  contexts: string[]; // When this pattern appears
  effectiveness: string; // Known success rate if available
}
```

## Checkpoint

```typescript
interface Checkpoint {
  jobId: string;
  domain: string;
  progress: {
    analyzed: number;
    target: number;
    lastProcessedUrl: string;
    timestamp: Date;
  };
  visualDatabase: DesignExample[];
  queue: string[]; // Remaining URLs to process
  patterns: PatternDatabase;
}
```

## Archive Output

```typescript
interface ArchiveOutput {
  meta: {
    domain: string;
    examplesAnalyzed: number;
    dateRange: { start: Date; end: Date };
    analysisDepth: 'quick' | 'standard' | 'exhaustive';
  };

  examples: DesignExample[]; // Full database

  patterns: {
    dominant: Pattern[];
    emerging: Pattern[];
    deprecated: Pattern[];
    outliers: Pattern[];
  };

  insights: {
    colorTrends: string[];
    typographyTrends: string[];
    layoutTrends: string[];
    interactionTrends: string[];
    technicalTrends: string[];
  };

  recommendations: {
    safeChoices: string[]; // Proven patterns for risk-averse projects
    differentiators: string[]; // Underutilized patterns for standing out
    avoid: string[]; // Deprecated or overused patterns
  };
}
```

## Design Example

```typescript
interface DesignExample {
  url: string;
  timestamp: Date;
  visualDNA: VisualDNA;
  context: ContextAnalysis;
  tags: string[]; // Style families, technical sophistication, etc.
  screenshot?: string; // Base64 or file path
}
```

## Pattern Database

```typescript
interface PatternDatabase {
  dominant: Pattern[];
  emerging: Pattern[];
  deprecated: Pattern[];
  outliers: Pattern[];
}
```

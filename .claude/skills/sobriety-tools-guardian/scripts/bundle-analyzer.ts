#!/usr/bin/env npx tsx
/**
 * Bundle Size Analyzer for sobriety.tools
 *
 * Tracks JavaScript bundle sizes over time and alerts on regressions.
 * Integrated with the build process to catch bloat before deployment.
 *
 * Usage:
 *   npx tsx scripts/bundle-analyzer.ts
 *   npx tsx scripts/bundle-analyzer.ts --compare <baseline.json>
 *   npx tsx scripts/bundle-analyzer.ts --save <output.json>
 *   npx tsx scripts/bundle-analyzer.ts --threshold 500  # Max KB for main bundle
 */

import * as fs from 'fs';
import * as path from 'path';

// Thresholds in KB
const THRESHOLDS = {
  main_bundle: 500, // Main app bundle
  page_bundle: 150, // Individual page bundles
  total_js: 1500, // Total JS across all bundles
  single_chunk: 250, // Any single chunk
  first_load: 300, // First load JS (critical path)
};

interface ChunkInfo {
  name: string;
  size: number;
  gzipSize?: number;
  isMainBundle: boolean;
  isPage: boolean;
  path: string;
}

interface BundleReport {
  timestamp: string;
  commitHash?: string;
  totalSize: number;
  totalGzipSize: number;
  mainBundleSize: number;
  firstLoadSize: number;
  chunkCount: number;
  chunks: ChunkInfo[];
  largestChunks: ChunkInfo[];
  violations: string[];
  passed: boolean;
}

function getGitCommitHash(): string | undefined {
  try {
    const { execSync } = require('child_process');
    return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return undefined;
  }
}

function getFileSizeKB(filePath: string): number {
  try {
    const stats = fs.statSync(filePath);
    return Math.round(stats.size / 1024);
  } catch {
    return 0;
  }
}

function findChunks(nextDir: string): ChunkInfo[] {
  const chunks: ChunkInfo[] = [];

  // Check for static chunks
  const staticDir = path.join(nextDir, 'static', 'chunks');
  if (fs.existsSync(staticDir)) {
    scanDirectory(staticDir, chunks, false, false);
  }

  // Check for page chunks
  const pagesDir = path.join(staticDir, 'pages');
  if (fs.existsSync(pagesDir)) {
    scanDirectory(pagesDir, chunks, false, true);
  }

  // Check for app chunks (App Router)
  const appDir = path.join(staticDir, 'app');
  if (fs.existsSync(appDir)) {
    scanDirectory(appDir, chunks, false, true);
  }

  return chunks;
}

function scanDirectory(
  dir: string,
  chunks: ChunkInfo[],
  isMain: boolean,
  isPage: boolean
): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath, chunks, isMain, isPage);
    } else if (entry.name.endsWith('.js')) {
      const size = getFileSizeKB(fullPath);
      const isMainBundle =
        entry.name.includes('main') ||
        entry.name.includes('webpack') ||
        entry.name.includes('framework');

      chunks.push({
        name: entry.name,
        size,
        isMainBundle,
        isPage,
        path: fullPath,
      });
    }
  }
}

function analyzeBuild(nextDir: string): BundleReport {
  if (!fs.existsSync(nextDir)) {
    throw new Error(`Build directory not found: ${nextDir}`);
  }

  const chunks = findChunks(nextDir);
  const violations: string[] = [];

  // Calculate totals
  const totalSize = chunks.reduce((sum, c) => sum + c.size, 0);
  const mainBundleChunks = chunks.filter((c) => c.isMainBundle);
  const mainBundleSize = mainBundleChunks.reduce((sum, c) => sum + c.size, 0);

  // Estimate first load size (main + framework + vendor chunks)
  const firstLoadChunks = chunks.filter(
    (c) =>
      c.isMainBundle ||
      c.name.includes('vendor') ||
      c.name.includes('commons') ||
      c.name.includes('framework')
  );
  const firstLoadSize = firstLoadChunks.reduce((sum, c) => sum + c.size, 0);

  // Check thresholds
  if (mainBundleSize > THRESHOLDS.main_bundle) {
    violations.push(
      `Main bundle ${mainBundleSize}KB exceeds ${THRESHOLDS.main_bundle}KB threshold`
    );
  }

  if (totalSize > THRESHOLDS.total_js) {
    violations.push(
      `Total JS ${totalSize}KB exceeds ${THRESHOLDS.total_js}KB threshold`
    );
  }

  if (firstLoadSize > THRESHOLDS.first_load) {
    violations.push(
      `First load JS ${firstLoadSize}KB exceeds ${THRESHOLDS.first_load}KB threshold`
    );
  }

  // Check individual chunks
  const largeChunks = chunks.filter((c) => c.size > THRESHOLDS.single_chunk);
  for (const chunk of largeChunks) {
    violations.push(
      `Chunk "${chunk.name}" is ${chunk.size}KB (>${THRESHOLDS.single_chunk}KB)`
    );
  }

  // Check page bundles
  const largePages = chunks.filter(
    (c) => c.isPage && c.size > THRESHOLDS.page_bundle
  );
  for (const page of largePages) {
    violations.push(
      `Page "${page.name}" is ${page.size}KB (>${THRESHOLDS.page_bundle}KB)`
    );
  }

  // Sort chunks by size for reporting
  const sortedChunks = [...chunks].sort((a, b) => b.size - a.size);
  const largestChunks = sortedChunks.slice(0, 10);

  return {
    timestamp: new Date().toISOString(),
    commitHash: getGitCommitHash(),
    totalSize,
    totalGzipSize: 0, // Would need gzip analysis
    mainBundleSize,
    firstLoadSize,
    chunkCount: chunks.length,
    chunks: sortedChunks,
    largestChunks,
    violations,
    passed: violations.length === 0,
  };
}

function compareReports(
  current: BundleReport,
  baseline: BundleReport
): { changes: string[]; regressions: string[] } {
  const changes: string[] = [];
  const regressions: string[] = [];

  const totalDiff = current.totalSize - baseline.totalSize;
  const mainDiff = current.mainBundleSize - baseline.mainBundleSize;
  const firstLoadDiff = current.firstLoadSize - baseline.firstLoadSize;

  if (Math.abs(totalDiff) > 5) {
    const direction = totalDiff > 0 ? '+' : '';
    changes.push(`Total JS: ${direction}${totalDiff}KB`);
    if (totalDiff > 50) {
      regressions.push(`Total JS increased by ${totalDiff}KB`);
    }
  }

  if (Math.abs(mainDiff) > 5) {
    const direction = mainDiff > 0 ? '+' : '';
    changes.push(`Main bundle: ${direction}${mainDiff}KB`);
    if (mainDiff > 20) {
      regressions.push(`Main bundle increased by ${mainDiff}KB`);
    }
  }

  if (Math.abs(firstLoadDiff) > 5) {
    const direction = firstLoadDiff > 0 ? '+' : '';
    changes.push(`First load: ${direction}${firstLoadDiff}KB`);
    if (firstLoadDiff > 30) {
      regressions.push(`First load JS increased by ${firstLoadDiff}KB`);
    }
  }

  return { changes, regressions };
}

function printReport(
  report: BundleReport,
  comparison?: { changes: string[]; regressions: string[] }
): void {
  console.log('='.repeat(60));
  console.log('BUNDLE SIZE ANALYSIS');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${report.timestamp}`);
  if (report.commitHash) {
    console.log(`Commit: ${report.commitHash}`);
  }
  console.log('');

  console.log('SUMMARY');
  console.log('-'.repeat(40));
  console.log(`Total JS:      ${report.totalSize}KB`);
  console.log(`Main Bundle:   ${report.mainBundleSize}KB`);
  console.log(`First Load:    ${report.firstLoadSize}KB`);
  console.log(`Chunk Count:   ${report.chunkCount}`);

  if (comparison) {
    console.log('');
    console.log('CHANGES FROM BASELINE');
    console.log('-'.repeat(40));
    if (comparison.changes.length > 0) {
      for (const change of comparison.changes) {
        console.log(`  ${change}`);
      }
    } else {
      console.log('  No significant changes');
    }

    if (comparison.regressions.length > 0) {
      console.log('');
      console.log('⚠ REGRESSIONS');
      for (const regression of comparison.regressions) {
        console.log(`  ✗ ${regression}`);
      }
    }
  }

  console.log('');
  console.log('LARGEST CHUNKS');
  console.log('-'.repeat(40));
  for (const chunk of report.largestChunks) {
    const flags = [];
    if (chunk.isMainBundle) flags.push('main');
    if (chunk.isPage) flags.push('page');
    const flagStr = flags.length > 0 ? ` [${flags.join(', ')}]` : '';
    console.log(`  ${chunk.size.toString().padStart(4)}KB  ${chunk.name}${flagStr}`);
  }

  if (report.violations.length > 0) {
    console.log('');
    console.log('⚠ VIOLATIONS');
    console.log('-'.repeat(40));
    for (const violation of report.violations) {
      console.log(`  ✗ ${violation}`);
    }
  }

  console.log('');
  console.log('='.repeat(60));
  if (report.passed) {
    console.log('✓ Bundle sizes within thresholds');
  } else {
    console.log(`✗ ${report.violations.length} threshold violations`);
  }
  console.log('='.repeat(60));
}

function printSuggestions(report: BundleReport): void {
  if (report.violations.length === 0) return;

  console.log('');
  console.log('OPTIMIZATION SUGGESTIONS');
  console.log('-'.repeat(40));

  if (report.mainBundleSize > THRESHOLDS.main_bundle) {
    console.log(`
Main bundle too large (${report.mainBundleSize}KB):
  1. Run: npx @next/bundle-analyzer
  2. Identify large dependencies
  3. Use dynamic imports: const Heavy = dynamic(() => import('./Heavy'))
  4. Check for accidental full library imports (e.g., lodash vs lodash-es)
`);
  }

  if (report.firstLoadSize > THRESHOLDS.first_load) {
    console.log(`
First load JS too large (${report.firstLoadSize}KB):
  1. Move non-critical code to dynamic imports
  2. Use React.lazy() for route-level code splitting
  3. Check for large CSS-in-JS libraries (prefer Tailwind)
  4. Audit third-party scripts (analytics, chat widgets)
`);
  }

  const largePages = report.chunks.filter(
    (c) => c.isPage && c.size > THRESHOLDS.page_bundle
  );
  if (largePages.length > 0) {
    console.log(`
Large page bundles detected:
  ${largePages.map((p) => `- ${p.name}: ${p.size}KB`).join('\n  ')}

To fix:
  1. Move heavy components to dynamic imports
  2. Split data fetching from rendering
  3. Use server components where possible (Next.js 13+)
`);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // Parse arguments
  let baselinePath: string | undefined;
  let savePath: string | undefined;
  let threshold: number | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--compare' && args[i + 1]) {
      baselinePath = args[++i];
    } else if (args[i] === '--save' && args[i + 1]) {
      savePath = args[++i];
    } else if (args[i] === '--threshold' && args[i + 1]) {
      threshold = parseInt(args[++i], 10);
      THRESHOLDS.main_bundle = threshold;
    }
  }

  // Find the build directory
  const possibleDirs = [
    path.join(process.cwd(), '.next'),
    path.join(process.cwd(), 'next-app', '.next'),
    path.join(process.cwd(), 'out'),
    path.join(process.cwd(), 'next-app', 'out'),
  ];

  let buildDir: string | undefined;
  for (const dir of possibleDirs) {
    if (fs.existsSync(dir)) {
      buildDir = dir;
      break;
    }
  }

  if (!buildDir) {
    console.error('No build directory found. Run `npm run build` first.');
    process.exit(1);
  }

  console.log(`Analyzing build: ${buildDir}\n`);

  const report = analyzeBuild(buildDir);

  // Compare with baseline if provided
  let comparison: { changes: string[]; regressions: string[] } | undefined;
  if (baselinePath && fs.existsSync(baselinePath)) {
    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));
    comparison = compareReports(report, baseline);
  }

  printReport(report, comparison);
  printSuggestions(report);

  // Save report if requested
  if (savePath) {
    fs.writeFileSync(savePath, JSON.stringify(report, null, 2));
    console.log(`\nReport saved to: ${savePath}`);
  }

  // Always save to temp for CI
  const tempPath = '/tmp/bundle-report.json';
  fs.writeFileSync(tempPath, JSON.stringify(report, null, 2));

  // Exit with error if violations
  if (!report.passed) {
    process.exit(1);
  }

  if (comparison && comparison.regressions.length > 0) {
    console.error('\n⚠ Bundle size regressions detected');
    process.exit(1);
  }
}

main().catch(console.error);

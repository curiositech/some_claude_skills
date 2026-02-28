#!/usr/bin/env npx tsx
/**
 * Automated Performance Audit for sobriety.tools
 *
 * Runs comprehensive performance checks and files GitHub issues for regressions.
 * Designed to run in CI or as a scheduled background task.
 *
 * Usage:
 *   npx tsx scripts/perf-audit.ts
 *   npx tsx scripts/perf-audit.ts --create-issues
 *   npx tsx scripts/perf-audit.ts --fix  # Attempt auto-fixes
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const SITE_URL = 'https://sobriety.tools';
const THRESHOLDS = {
  lighthouse_performance: 0.9,
  lighthouse_accessibility: 0.95,
  fcp_ms: 1500,
  lcp_ms: 2500,
  tti_ms: 3500,
  bundle_size_kb: 500,
  meeting_search_ms: 500,
  contacts_load_ms: 200,
};

interface AuditResult {
  check: string;
  passed: boolean;
  value: number | string;
  threshold: number | string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  suggestedFix?: string;
}

const results: AuditResult[] = [];

// =============================================================================
// LIGHTHOUSE AUDIT
// =============================================================================

async function runLighthouse(): Promise<void> {
  console.log('Running Lighthouse audit...');

  const criticalPages = [
    '/',
    '/meetings',
    '/my/contacts',
    '/my/check-in',
    '/my/safety-plan',
  ];

  for (const page of criticalPages) {
    try {
      const url = `${SITE_URL}${page}`;
      const outputPath = `/tmp/lighthouse-${page.replace(/\//g, '-') || 'home'}.json`;

      execSync(
        `npx lighthouse "${url}" --output=json --output-path="${outputPath}" --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility 2>/dev/null`,
        { stdio: 'pipe' }
      );

      const report = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
      const perfScore = report.categories.performance.score;
      const a11yScore = report.categories.accessibility.score;

      results.push({
        check: `Lighthouse Performance: ${page}`,
        passed: perfScore >= THRESHOLDS.lighthouse_performance,
        value: perfScore,
        threshold: THRESHOLDS.lighthouse_performance,
        severity: perfScore < 0.7 ? 'critical' : perfScore < 0.85 ? 'high' : 'medium',
        description: `Performance score for ${page}: ${(perfScore * 100).toFixed(0)}%`,
        suggestedFix: perfScore < 0.9
          ? `Review LCP and TTI. Check for:\n- Large images without lazy loading\n- Render-blocking scripts\n- Unused JavaScript`
          : undefined,
      });

      results.push({
        check: `Lighthouse Accessibility: ${page}`,
        passed: a11yScore >= THRESHOLDS.lighthouse_accessibility,
        value: a11yScore,
        threshold: THRESHOLDS.lighthouse_accessibility,
        severity: a11yScore < 0.8 ? 'high' : 'medium',
        description: `Accessibility score for ${page}: ${(a11yScore * 100).toFixed(0)}%`,
      });

      // Extract specific metrics
      const fcp = report.audits['first-contentful-paint'].numericValue;
      const lcp = report.audits['largest-contentful-paint'].numericValue;
      const tti = report.audits['interactive'].numericValue;

      if (page === '/contacts') {
        results.push({
          check: `Contacts FCP (Crisis Critical)`,
          passed: fcp < THRESHOLDS.contacts_load_ms,
          value: Math.round(fcp),
          threshold: THRESHOLDS.contacts_load_ms,
          severity: fcp > 500 ? 'critical' : 'high',
          description: `Contacts page FCP: ${Math.round(fcp)}ms. Users in crisis need instant access to sponsor numbers.`,
          suggestedFix: fcp > 200
            ? `CRITICAL: Contacts must render from cache first.\n1. Implement IndexedDB cache for contacts\n2. Show cached data immediately\n3. Sync in background`
            : undefined,
        });
      }

      if (page === '/meetings') {
        results.push({
          check: `Meetings LCP`,
          passed: lcp < THRESHOLDS.meeting_search_ms * 3,
          value: Math.round(lcp),
          threshold: THRESHOLDS.meeting_search_ms * 3,
          severity: lcp > 2000 ? 'high' : 'medium',
          description: `Meetings page LCP: ${Math.round(lcp)}ms`,
        });
      }
    } catch (error) {
      console.error(`Lighthouse failed for ${page}:`, error);
    }
  }
}

// =============================================================================
// BUNDLE SIZE AUDIT
// =============================================================================

async function checkBundleSize(): Promise<void> {
  console.log('Checking bundle sizes...');

  const nextDir = path.join(process.cwd(), 'next-app/.next');
  if (!fs.existsSync(nextDir)) {
    console.log('No .next directory found, skipping bundle check');
    return;
  }

  try {
    const buildManifest = JSON.parse(
      fs.readFileSync(path.join(nextDir, 'build-manifest.json'), 'utf-8')
    );

    // Check main bundle size
    const mainChunks = buildManifest.pages['/_app'] || [];
    let totalSize = 0;

    for (const chunk of mainChunks) {
      const chunkPath = path.join(nextDir, 'static', chunk);
      if (fs.existsSync(chunkPath)) {
        totalSize += fs.statSync(chunkPath).size;
      }
    }

    const sizeKb = Math.round(totalSize / 1024);
    results.push({
      check: 'Main Bundle Size',
      passed: sizeKb < THRESHOLDS.bundle_size_kb,
      value: sizeKb,
      threshold: THRESHOLDS.bundle_size_kb,
      severity: sizeKb > 750 ? 'high' : 'medium',
      description: `Main bundle: ${sizeKb}KB (threshold: ${THRESHOLDS.bundle_size_kb}KB)`,
      suggestedFix: sizeKb > THRESHOLDS.bundle_size_kb
        ? `Bundle too large. Actions:\n1. Run \`npx @next/bundle-analyzer\`\n2. Identify large dependencies\n3. Use dynamic imports for non-critical code`
        : undefined,
    });
  } catch (error) {
    console.error('Bundle size check failed:', error);
  }
}

// =============================================================================
// MEETING PROXY HEALTH
// =============================================================================

async function checkMeetingProxy(): Promise<void> {
  console.log('Checking meeting proxy health...');

  const testLocations = [
    { name: 'Portland', lat: 45.52, lng: -122.68 },
    { name: 'Los Angeles', lat: 34.05, lng: -118.24 },
    { name: 'New York', lat: 40.71, lng: -74.01 },
  ];

  for (const loc of testLocations) {
    try {
      const start = Date.now();
      const response = await fetch(
        `https://jb4l-meeting-proxy.erich-owens.workers.dev/api/all?lat=${loc.lat}&lng=${loc.lng}&radius=25`,
        { headers: { Origin: 'https://sobriety.tools' } }
      );
      const duration = Date.now() - start;

      const cacheStatus = response.headers.get('X-Cache');
      const data = await response.json();

      results.push({
        check: `Meeting Proxy: ${loc.name}`,
        passed: duration < THRESHOLDS.meeting_search_ms && cacheStatus === 'HIT',
        value: `${duration}ms (${cacheStatus})`,
        threshold: `${THRESHOLDS.meeting_search_ms}ms (HIT)`,
        severity: duration > 1000 ? 'high' : 'medium',
        description: `${loc.name}: ${duration}ms, cache ${cacheStatus}, ${data.meetings?.length || 0} meetings`,
        suggestedFix: cacheStatus !== 'HIT'
          ? `Cache miss for ${loc.name}. Run cache warm: curl https://jb4l-meeting-proxy.erich-owens.workers.dev/warm`
          : undefined,
      });
    } catch (error) {
      results.push({
        check: `Meeting Proxy: ${loc.name}`,
        passed: false,
        value: 'ERROR',
        threshold: 'Response',
        severity: 'critical',
        description: `Meeting proxy failed for ${loc.name}: ${error}`,
        suggestedFix: 'Check meeting-proxy Worker logs in Cloudflare dashboard',
      });
    }
  }
}

// =============================================================================
// OFFLINE CAPABILITY CHECK
// =============================================================================

async function checkServiceWorker(): Promise<void> {
  console.log('Checking service worker...');

  try {
    const response = await fetch(`${SITE_URL}/sw.js`);
    const swContent = await response.text();

    const criticalRoutes = ['/my/contacts', '/my/safety-plan', '/my/check-in'];
    const missingRoutes = criticalRoutes.filter(
      (route) => !swContent.includes(route)
    );

    results.push({
      check: 'Service Worker: Crisis Routes',
      passed: missingRoutes.length === 0,
      value: missingRoutes.length === 0 ? 'All cached' : `Missing: ${missingRoutes.join(', ')}`,
      threshold: 'All crisis routes cached',
      severity: missingRoutes.length > 0 ? 'critical' : 'low',
      description: `Service worker must cache crisis-critical routes for offline access`,
      suggestedFix: missingRoutes.length > 0
        ? `Add these routes to SW cache: ${missingRoutes.join(', ')}\nUsers in crisis with poor connectivity MUST access these offline.`
        : undefined,
    });
  } catch (error) {
    results.push({
      check: 'Service Worker',
      passed: false,
      value: 'Not found',
      threshold: 'Present',
      severity: 'critical',
      description: 'No service worker found. Offline functionality broken.',
      suggestedFix: 'Implement service worker with Workbox or next-pwa',
    });
  }
}

// =============================================================================
// GITHUB ISSUE CREATION
// =============================================================================

async function createGitHubIssue(result: AuditResult): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('No GITHUB_TOKEN, skipping issue creation');
    return;
  }

  const body = `## Automated Performance Alert

**Check**: ${result.check}
**Severity**: ${result.severity.toUpperCase()}
**Current Value**: ${result.value}
**Threshold**: ${result.threshold}

### Description
${result.description}

${result.suggestedFix ? `### Suggested Fix\n${result.suggestedFix}` : ''}

---
*This issue was automatically created by the performance audit.*
`;

  try {
    await fetch('https://api.github.com/repos/curiositech/sobriety-tools/issues', {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `[Perf] ${result.check}: ${result.severity}`,
        body,
        labels: ['performance', 'automated', result.severity],
      }),
    });
    console.log(`Created issue for: ${result.check}`);
  } catch (error) {
    console.error('Failed to create GitHub issue:', error);
  }
}

// =============================================================================
// MAIN
// =============================================================================

async function main(): Promise<void> {
  const createIssues = process.argv.includes('--create-issues');

  console.log('='.repeat(60));
  console.log('SOBRIETY.TOOLS PERFORMANCE AUDIT');
  console.log('='.repeat(60));
  console.log('');

  await runLighthouse();
  await checkBundleSize();
  await checkMeetingProxy();
  await checkServiceWorker();

  // Report results
  console.log('\n' + '='.repeat(60));
  console.log('RESULTS');
  console.log('='.repeat(60));

  const failed = results.filter((r) => !r.passed);
  const critical = failed.filter((r) => r.severity === 'critical');
  const high = failed.filter((r) => r.severity === 'high');

  for (const result of results) {
    const icon = result.passed ? '✓' : '✗';
    const severity = result.passed ? '' : ` [${result.severity.toUpperCase()}]`;
    console.log(`${icon} ${result.check}${severity}`);
    console.log(`  Value: ${result.value} (threshold: ${result.threshold})`);
    if (!result.passed && result.suggestedFix) {
      console.log(`  Fix: ${result.suggestedFix.split('\n')[0]}`);
    }
    console.log('');
  }

  console.log('='.repeat(60));
  console.log(`SUMMARY: ${results.length - failed.length}/${results.length} passed`);
  console.log(`Critical: ${critical.length}, High: ${high.length}`);
  console.log('='.repeat(60));

  // Create issues for critical/high severity failures
  if (createIssues) {
    const issuesToCreate = failed.filter(
      (r) => r.severity === 'critical' || r.severity === 'high'
    );
    for (const result of issuesToCreate) {
      await createGitHubIssue(result);
    }
  }

  // Exit with error if critical issues found
  if (critical.length > 0) {
    process.exit(1);
  }
}

main().catch(console.error);

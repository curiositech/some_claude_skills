#!/usr/bin/env npx tsx
/**
 * Crisis Path Testing for sobriety.tools
 *
 * Tests the critical user journeys that must work during a crisis:
 * 1. Contacts page loads instantly (sponsor numbers)
 * 2. Safety plan is accessible
 * 3. Meetings can be found
 * 4. Check-in form is interactive quickly
 *
 * These paths are life-or-death. A user in crisis has seconds, not minutes.
 *
 * Usage:
 *   npx tsx scripts/crisis-path-test.ts
 *   npx tsx scripts/crisis-path-test.ts --ci  # Exit with error on failure
 */

import { execSync } from 'child_process';
import * as fs from 'fs';

const SITE_URL = 'https://sobriety.tools';

// Maximum acceptable times for crisis-critical paths (milliseconds)
const CRISIS_THRESHOLDS = {
  // Contacts: User needs sponsor number NOW
  contacts_fcp: 200, // First paint - see something
  contacts_lcp: 500, // Main content - see phone numbers
  contacts_tti: 800, // Interactive - can tap to call

  // Safety Plan: User needs their coping strategies
  safety_plan_fcp: 200,
  safety_plan_lcp: 600,

  // Meetings: User needs to find a meeting to attend
  meetings_fcp: 300,
  meetings_lcp: 1000,
  meetings_search: 500, // Time to show results after location

  // Check-in: User needs to record how they're feeling
  checkin_fcp: 200,
  checkin_tti: 400, // Can start inputting immediately

  // Crisis page: Hotline numbers
  crisis_fcp: 150,
  crisis_lcp: 400,
};

interface PathTestResult {
  path: string;
  name: string;
  passed: boolean;
  metrics: {
    fcp?: number;
    lcp?: number;
    tti?: number;
    cls?: number;
  };
  thresholds: {
    fcp?: number;
    lcp?: number;
    tti?: number;
  };
  failures: string[];
  isCritical: boolean;
}

interface TestReport {
  timestamp: string;
  allPassed: boolean;
  criticalFailures: number;
  results: PathTestResult[];
  offlineCapable: boolean;
  serviceWorkerPresent: boolean;
}

async function testPathWithLighthouse(
  path: string,
  name: string,
  thresholds: { fcp?: number; lcp?: number; tti?: number },
  isCritical: boolean
): Promise<PathTestResult> {
  const url = `${SITE_URL}${path}`;
  const outputPath = `/tmp/lighthouse-crisis-${path.replace(/\//g, '-') || 'home'}.json`;

  try {
    console.log(`  Testing ${name} (${path})...`);

    execSync(
      `npx lighthouse "${url}" --output=json --output-path="${outputPath}" --chrome-flags="--headless --no-sandbox" --only-categories=performance 2>/dev/null`,
      { stdio: 'pipe', timeout: 60000 }
    );

    const report = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));

    const metrics = {
      fcp: Math.round(report.audits['first-contentful-paint']?.numericValue || 0),
      lcp: Math.round(report.audits['largest-contentful-paint']?.numericValue || 0),
      tti: Math.round(report.audits['interactive']?.numericValue || 0),
      cls: report.audits['cumulative-layout-shift']?.numericValue || 0,
    };

    const failures: string[] = [];

    if (thresholds.fcp && metrics.fcp > thresholds.fcp) {
      failures.push(`FCP ${metrics.fcp}ms > ${thresholds.fcp}ms threshold`);
    }
    if (thresholds.lcp && metrics.lcp > thresholds.lcp) {
      failures.push(`LCP ${metrics.lcp}ms > ${thresholds.lcp}ms threshold`);
    }
    if (thresholds.tti && metrics.tti > thresholds.tti) {
      failures.push(`TTI ${metrics.tti}ms > ${thresholds.tti}ms threshold`);
    }
    if (metrics.cls > 0.1) {
      failures.push(`CLS ${metrics.cls.toFixed(3)} > 0.1 threshold (layout shift)`);
    }

    return {
      path,
      name,
      passed: failures.length === 0,
      metrics,
      thresholds,
      failures,
      isCritical,
    };
  } catch (error) {
    return {
      path,
      name,
      passed: false,
      metrics: {},
      thresholds,
      failures: [`Lighthouse failed: ${error}`],
      isCritical,
    };
  }
}

async function testServiceWorker(): Promise<{ present: boolean; offlineRoutes: string[] }> {
  try {
    const response = await fetch(`${SITE_URL}/sw.js`);
    if (!response.ok) {
      return { present: false, offlineRoutes: [] };
    }

    const swContent = await response.text();

    // Check for crisis-critical routes in service worker
    const crisisRoutes = ['/contacts', '/safety-plan', '/check-in', '/crisis'];
    const offlineRoutes = crisisRoutes.filter((route) => swContent.includes(route));

    return { present: true, offlineRoutes };
  } catch {
    return { present: false, offlineRoutes: [] };
  }
}

async function testMeetingSearchSpeed(): Promise<{ passed: boolean; time: number }> {
  const proxyUrl = 'https://jb4l-meeting-proxy.erich-owens.workers.dev';

  try {
    const start = Date.now();
    const response = await fetch(
      `${proxyUrl}/api/all?lat=45.52&lng=-122.68&radius=25`,
      { headers: { Origin: 'https://sobriety.tools' } }
    );
    const time = Date.now() - start;

    if (!response.ok) {
      return { passed: false, time };
    }

    const data = await response.json();
    const hasMeetings = data.meetings && data.meetings.length > 0;

    return {
      passed: hasMeetings && time < CRISIS_THRESHOLDS.meetings_search,
      time,
    };
  } catch {
    return { passed: false, time: 999999 };
  }
}

async function runCrisisPathTests(): Promise<TestReport> {
  console.log('='.repeat(60));
  console.log('CRISIS PATH TESTING');
  console.log('='.repeat(60));
  console.log('Testing paths that must work when users are in crisis...\n');

  const results: PathTestResult[] = [];

  // Test each critical path
  console.log('Testing page load times...');

  results.push(
    await testPathWithLighthouse(
      '/contacts',
      'Contacts (Sponsor Numbers)',
      {
        fcp: CRISIS_THRESHOLDS.contacts_fcp,
        lcp: CRISIS_THRESHOLDS.contacts_lcp,
        tti: CRISIS_THRESHOLDS.contacts_tti,
      },
      true // CRITICAL
    )
  );

  results.push(
    await testPathWithLighthouse(
      '/safety-plan',
      'Safety Plan',
      {
        fcp: CRISIS_THRESHOLDS.safety_plan_fcp,
        lcp: CRISIS_THRESHOLDS.safety_plan_lcp,
      },
      true // CRITICAL
    )
  );

  results.push(
    await testPathWithLighthouse(
      '/meetings',
      'Meeting Finder',
      {
        fcp: CRISIS_THRESHOLDS.meetings_fcp,
        lcp: CRISIS_THRESHOLDS.meetings_lcp,
      },
      true // CRITICAL
    )
  );

  results.push(
    await testPathWithLighthouse(
      '/check-in',
      'Daily Check-in',
      {
        fcp: CRISIS_THRESHOLDS.checkin_fcp,
        tti: CRISIS_THRESHOLDS.checkin_tti,
      },
      false // Important but not critical
    )
  );

  // Test service worker
  console.log('\nTesting offline capability...');
  const swTest = await testServiceWorker();

  // Test meeting search API directly
  console.log('Testing meeting search speed...');
  const searchTest = await testMeetingSearchSpeed();

  if (!searchTest.passed) {
    results.push({
      path: '/api/meetings',
      name: 'Meeting Search API',
      passed: false,
      metrics: { lcp: searchTest.time },
      thresholds: { lcp: CRISIS_THRESHOLDS.meetings_search },
      failures: [`Search took ${searchTest.time}ms (threshold: ${CRISIS_THRESHOLDS.meetings_search}ms)`],
      isCritical: true,
    });
  }

  // Count failures
  const criticalFailures = results.filter((r) => r.isCritical && !r.passed).length;
  const allPassed = results.every((r) => r.passed) && swTest.present;

  return {
    timestamp: new Date().toISOString(),
    allPassed,
    criticalFailures,
    results,
    offlineCapable: swTest.offlineRoutes.length >= 3,
    serviceWorkerPresent: swTest.present,
  };
}

function printReport(report: TestReport): void {
  console.log('\n' + '='.repeat(60));
  console.log('RESULTS');
  console.log('='.repeat(60));

  for (const result of report.results) {
    const icon = result.passed ? '✓' : '✗';
    const critical = result.isCritical ? '[CRITICAL]' : '';

    console.log(`\n${icon} ${result.name} ${critical}`);
    console.log(`  Path: ${result.path}`);

    if (result.metrics.fcp) {
      const fcpOk = !result.thresholds.fcp || result.metrics.fcp <= result.thresholds.fcp;
      console.log(`  FCP: ${result.metrics.fcp}ms ${fcpOk ? '✓' : '✗'} (threshold: ${result.thresholds.fcp || 'n/a'}ms)`);
    }
    if (result.metrics.lcp) {
      const lcpOk = !result.thresholds.lcp || result.metrics.lcp <= result.thresholds.lcp;
      console.log(`  LCP: ${result.metrics.lcp}ms ${lcpOk ? '✓' : '✗'} (threshold: ${result.thresholds.lcp || 'n/a'}ms)`);
    }
    if (result.metrics.tti) {
      const ttiOk = !result.thresholds.tti || result.metrics.tti <= result.thresholds.tti;
      console.log(`  TTI: ${result.metrics.tti}ms ${ttiOk ? '✓' : '✗'} (threshold: ${result.thresholds.tti || 'n/a'}ms)`);
    }

    if (result.failures.length > 0) {
      for (const failure of result.failures) {
        console.log(`  ⚠ ${failure}`);
      }
    }
  }

  console.log('\n' + '-'.repeat(60));
  console.log('OFFLINE CAPABILITY');
  console.log('-'.repeat(60));
  console.log(`Service Worker: ${report.serviceWorkerPresent ? '✓ Present' : '✗ Missing'}`);
  console.log(`Offline Ready: ${report.offlineCapable ? '✓ Yes' : '✗ No'}`);

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  if (report.allPassed) {
    console.log('✓ All crisis paths are performant and accessible');
  } else {
    console.log(`✗ ${report.criticalFailures} CRITICAL failures`);
    console.log('');
    console.log('CRITICAL FAILURES MEAN USERS IN CRISIS MAY NOT GET HELP');
    console.log('Fix these issues immediately.');
  }

  console.log('='.repeat(60));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const ciMode = args.includes('--ci');

  const report = await runCrisisPathTests();
  printReport(report);

  // Save report
  const reportPath = '/tmp/crisis-path-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nFull report saved to: ${reportPath}`);

  // In CI mode, exit with error if critical paths fail
  if (ciMode && report.criticalFailures > 0) {
    console.error(`\nCI FAILURE: ${report.criticalFailures} critical crisis paths failed`);
    process.exit(1);
  }

  if (!report.serviceWorkerPresent) {
    console.warn('\n⚠ WARNING: No service worker detected. Offline access is broken.');
    if (ciMode) {
      process.exit(1);
    }
  }
}

main().catch(console.error);

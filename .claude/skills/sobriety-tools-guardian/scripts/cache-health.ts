#!/usr/bin/env npx tsx
/**
 * Cache Health Monitor for sobriety.tools
 *
 * Checks KV cache hit rates, staleness, and coverage for the meeting-proxy Worker.
 * Alerts on poor cache performance that could slow meeting searches.
 *
 * Usage:
 *   npx tsx scripts/cache-health.ts
 *   npx tsx scripts/cache-health.ts --verbose
 *   npx tsx scripts/cache-health.ts --warm  # Trigger cache warming
 */

import * as fs from 'fs';

const MEETING_PROXY_URL = 'https://jb4l-meeting-proxy.erich-owens.workers.dev';
const ORIGIN_HEADER = { Origin: 'https://sobriety.tools' };

// Top 30 US metro areas with their geohash cells
const TOP_METROS = [
  { name: 'New York', lat: 40.7128, lng: -74.006, geohash: 'dr5' },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, geohash: '9q5' },
  { name: 'Chicago', lat: 41.8781, lng: -87.6298, geohash: 'dp3' },
  { name: 'Houston', lat: 29.7604, lng: -95.3698, geohash: '9vk' },
  { name: 'Phoenix', lat: 33.4484, lng: -112.074, geohash: '9tb' },
  { name: 'San Antonio', lat: 29.4241, lng: -98.4936, geohash: '9v4' },
  { name: 'Dallas', lat: 32.7767, lng: -96.797, geohash: '9vg' },
  { name: 'San Jose', lat: 37.3382, lng: -121.8863, geohash: '9q9' },
  { name: 'Austin', lat: 30.2672, lng: -97.7431, geohash: '9v6' },
  { name: 'San Diego', lat: 32.7157, lng: -117.1611, geohash: '9mu' },
  { name: 'Denver', lat: 39.7392, lng: -104.9903, geohash: '9xj' },
  { name: 'Seattle', lat: 47.6062, lng: -122.3321, geohash: 'c23' },
  { name: 'Boston', lat: 42.3601, lng: -71.0589, geohash: 'drt' },
  { name: 'Atlanta', lat: 33.749, lng: -84.388, geohash: 'djf' },
  { name: 'Miami', lat: 25.7617, lng: -80.1918, geohash: 'dhw' },
  { name: 'Washington DC', lat: 38.9072, lng: -77.0369, geohash: 'dqc' },
  { name: 'Philadelphia', lat: 39.9526, lng: -75.1652, geohash: 'dr4' },
  { name: 'Nashville', lat: 36.1627, lng: -86.7816, geohash: 'dn6' },
  { name: 'Portland', lat: 45.5152, lng: -122.6784, geohash: 'c20' },
  { name: 'Minneapolis', lat: 44.9778, lng: -93.265, geohash: 'cbf' },
  { name: 'Louisville', lat: 38.2527, lng: -85.7585, geohash: 'dng' },
  { name: 'Charlotte', lat: 35.2271, lng: -80.8431, geohash: 'dnq' },
  { name: 'Tulsa', lat: 36.154, lng: -95.9928, geohash: '9yn' },
  { name: 'Oklahoma City', lat: 35.4676, lng: -97.5164, geohash: '9y7' },
  { name: 'Milwaukee', lat: 43.0389, lng: -87.9065, geohash: 'dp8' },
  { name: 'Kansas City', lat: 39.0997, lng: -94.5786, geohash: '9yy' },
  { name: 'Fort Worth', lat: 32.7555, lng: -97.3308, geohash: '9vf' },
  { name: 'Fresno', lat: 36.7378, lng: -119.7871, geohash: '9qd' },
  { name: 'Raleigh', lat: 35.7796, lng: -78.6382, geohash: 'dq2' },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194, geohash: '9q8' },
];

interface CacheCheckResult {
  city: string;
  geohash: string;
  cacheStatus: 'HIT' | 'MISS' | 'ERROR';
  responseTime: number;
  meetingCount: number;
  cacheAge?: number;
  error?: string;
}

interface HealthReport {
  timestamp: string;
  totalChecked: number;
  cacheHits: number;
  cacheMisses: number;
  errors: number;
  hitRate: number;
  avgResponseTime: number;
  slowestCity: string;
  slowestTime: number;
  results: CacheCheckResult[];
  recommendations: string[];
}

async function checkCacheForCity(
  city: { name: string; lat: number; lng: number; geohash: string }
): Promise<CacheCheckResult> {
  const start = Date.now();

  try {
    const response = await fetch(
      `${MEETING_PROXY_URL}/api/all?lat=${city.lat}&lng=${city.lng}&radius=25`,
      { headers: ORIGIN_HEADER }
    );

    const responseTime = Date.now() - start;
    const cacheStatus = response.headers.get('X-Cache') as 'HIT' | 'MISS' || 'MISS';
    const geohash = response.headers.get('X-Geohash') || city.geohash;

    const data = await response.json();
    const meetingCount = data.meetings?.length || 0;

    return {
      city: city.name,
      geohash,
      cacheStatus,
      responseTime,
      meetingCount,
    };
  } catch (error) {
    return {
      city: city.name,
      geohash: city.geohash,
      cacheStatus: 'ERROR',
      responseTime: Date.now() - start,
      meetingCount: 0,
      error: String(error),
    };
  }
}

async function runHealthCheck(verbose: boolean): Promise<HealthReport> {
  console.log('Checking cache health for top 30 US metros...\n');

  const results: CacheCheckResult[] = [];

  // Check cities in batches to avoid overwhelming the worker
  const batchSize = 5;
  for (let i = 0; i < TOP_METROS.length; i += batchSize) {
    const batch = TOP_METROS.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(checkCacheForCity));
    results.push(...batchResults);

    if (verbose) {
      for (const result of batchResults) {
        const icon = result.cacheStatus === 'HIT' ? '✓' : result.cacheStatus === 'ERROR' ? '✗' : '○';
        console.log(
          `${icon} ${result.city.padEnd(15)} ${result.cacheStatus.padEnd(5)} ${result.responseTime}ms ${result.meetingCount} meetings`
        );
      }
    }

    // Small delay between batches
    if (i + batchSize < TOP_METROS.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  // Calculate statistics
  const hits = results.filter((r) => r.cacheStatus === 'HIT').length;
  const misses = results.filter((r) => r.cacheStatus === 'MISS').length;
  const errors = results.filter((r) => r.cacheStatus === 'ERROR').length;
  const hitRate = (hits / (hits + misses)) * 100;

  const responseTimes = results
    .filter((r) => r.cacheStatus !== 'ERROR')
    .map((r) => r.responseTime);
  const avgResponseTime =
    responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

  const slowest = results.reduce((a, b) =>
    a.responseTime > b.responseTime ? a : b
  );

  // Generate recommendations
  const recommendations: string[] = [];

  if (hitRate < 80) {
    recommendations.push(
      `Cache hit rate is ${hitRate.toFixed(1)}% (target: >80%). Run cache warming: curl ${MEETING_PROXY_URL}/warm`
    );
  }

  if (avgResponseTime > 300) {
    recommendations.push(
      `Average response time is ${avgResponseTime.toFixed(0)}ms (target: <300ms). Check Supabase query performance.`
    );
  }

  const missedCities = results.filter((r) => r.cacheStatus === 'MISS');
  if (missedCities.length > 0) {
    recommendations.push(
      `Cache misses for: ${missedCities.map((r) => r.city).join(', ')}. These require warming.`
    );
  }

  if (errors > 0) {
    recommendations.push(
      `${errors} cities failed. Check worker logs and Supabase connectivity.`
    );
  }

  const lowMeetingCities = results.filter(
    (r) => r.meetingCount < 10 && r.cacheStatus !== 'ERROR'
  );
  if (lowMeetingCities.length > 0) {
    recommendations.push(
      `Low meeting counts (<10) for: ${lowMeetingCities.map((r) => `${r.city}(${r.meetingCount})`).join(', ')}. Verify harvester coverage.`
    );
  }

  return {
    timestamp: new Date().toISOString(),
    totalChecked: results.length,
    cacheHits: hits,
    cacheMisses: misses,
    errors,
    hitRate,
    avgResponseTime,
    slowestCity: slowest.city,
    slowestTime: slowest.responseTime,
    results,
    recommendations,
  };
}

async function warmCache(): Promise<void> {
  console.log('Triggering cache warm for all metros...\n');

  try {
    const response = await fetch(`${MEETING_PROXY_URL}/warm`, {
      headers: ORIGIN_HEADER,
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Cache warming complete!');
      console.log(`  Cities warmed: ${data.citiesWarmed || 'unknown'}`);
      console.log(`  Duration: ${data.duration || 'unknown'}ms`);
    } else {
      console.error('Cache warming failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Cache warming error:', error);
  }
}

function printReport(report: HealthReport): void {
  console.log('\n' + '='.repeat(60));
  console.log('CACHE HEALTH REPORT');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${report.timestamp}`);
  console.log('');
  console.log(`Cache Hit Rate: ${report.hitRate.toFixed(1)}%`);
  console.log(`  Hits: ${report.cacheHits}`);
  console.log(`  Misses: ${report.cacheMisses}`);
  console.log(`  Errors: ${report.errors}`);
  console.log('');
  console.log(`Response Times:`);
  console.log(`  Average: ${report.avgResponseTime.toFixed(0)}ms`);
  console.log(`  Slowest: ${report.slowestCity} (${report.slowestTime}ms)`);

  if (report.recommendations.length > 0) {
    console.log('');
    console.log('RECOMMENDATIONS:');
    for (const rec of report.recommendations) {
      console.log(`  ⚠ ${rec}`);
    }
  } else {
    console.log('');
    console.log('✓ All metrics within acceptable ranges');
  }

  console.log('='.repeat(60));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const shouldWarm = args.includes('--warm');

  if (shouldWarm) {
    await warmCache();
    console.log('');
  }

  const report = await runHealthCheck(verbose);
  printReport(report);

  // Save report to file for CI integration
  const reportPath = '/tmp/cache-health-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nFull report saved to: ${reportPath}`);

  // Exit with error if hit rate is critically low
  if (report.hitRate < 50) {
    console.error('\nCRITICAL: Cache hit rate below 50%!');
    process.exit(1);
  }
}

main().catch(console.error);

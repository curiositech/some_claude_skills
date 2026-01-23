/**
 * Skill Invocation Benchmark Harness
 *
 * A comprehensive benchmarking system for measuring skill invocation timing,
 * performance metrics, and statistical analysis.
 */

export interface SkillInvocation {
  skillName: string;
  parameters?: Record<string, unknown>;
  invoke: () => Promise<unknown>;
}

export interface TimingResult {
  skillName: string;
  invocationId: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface BenchmarkStats {
  skillName: string;
  totalInvocations: number;
  successCount: number;
  failureCount: number;
  minDuration: number;
  maxDuration: number;
  meanDuration: number;
  medianDuration: number;
  standardDeviation: number;
  percentile95: number;
  percentile99: number;
  throughput: number; // invocations per second
}

export interface BenchmarkConfig {
  warmupIterations: number;
  iterations: number;
  concurrency: number;
  cooldownMs: number;
  timeoutMs: number;
  includeWarmupInResults: boolean;
}

export interface BenchmarkReport {
  config: BenchmarkConfig;
  startTimestamp: string;
  endTimestamp: string;
  totalDurationMs: number;
  results: TimingResult[];
  stats: BenchmarkStats[];
  summary: {
    totalSkills: number;
    totalInvocations: number;
    overallSuccessRate: number;
    fastestSkill: string;
    slowestSkill: string;
  };
}

const DEFAULT_CONFIG: BenchmarkConfig = {
  warmupIterations: 3,
  iterations: 10,
  concurrency: 1,
  cooldownMs: 100,
  timeoutMs: 30000,
  includeWarmupInResults: false,
};

/**
 * Generates a unique invocation ID
 */
function generateInvocationId(): string {
  return `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculates statistical metrics from timing data
 */
function calculateStats(skillName: string, results: TimingResult[]): BenchmarkStats {
  const durations = results.map((r) => r.duration).sort((a, b) => a - b);
  const successResults = results.filter((r) => r.success);
  const failureResults = results.filter((r) => !r.success);

  const sum = durations.reduce((acc, d) => acc + d, 0);
  const mean = sum / durations.length;

  const squaredDiffs = durations.map((d) => Math.pow(d - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((acc, d) => acc + d, 0) / durations.length;
  const standardDeviation = Math.sqrt(avgSquaredDiff);

  const getPercentile = (arr: number[], p: number): number => {
    const index = Math.ceil((p / 100) * arr.length) - 1;
    return arr[Math.max(0, index)];
  };

  const median =
    durations.length % 2 === 0
      ? (durations[durations.length / 2 - 1] + durations[durations.length / 2]) / 2
      : durations[Math.floor(durations.length / 2)];

  const totalTime = results.reduce((acc, r) => acc + r.duration, 0);
  const throughput = totalTime > 0 ? (results.length / totalTime) * 1000 : 0;

  return {
    skillName,
    totalInvocations: results.length,
    successCount: successResults.length,
    failureCount: failureResults.length,
    minDuration: durations[0] ?? 0,
    maxDuration: durations[durations.length - 1] ?? 0,
    meanDuration: mean,
    medianDuration: median,
    standardDeviation,
    percentile95: getPercentile(durations, 95),
    percentile99: getPercentile(durations, 99),
    throughput,
  };
}

/**
 * Runs a single skill invocation with timing
 */
async function runTimedInvocation(
  skill: SkillInvocation,
  timeoutMs: number
): Promise<TimingResult> {
  const invocationId = generateInvocationId();
  const startTime = performance.now();

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);
    });

    await Promise.race([skill.invoke(), timeoutPromise]);

    const endTime = performance.now();
    return {
      skillName: skill.skillName,
      invocationId,
      startTime,
      endTime,
      duration: endTime - startTime,
      success: true,
      metadata: { parameters: skill.parameters },
    };
  } catch (error) {
    const endTime = performance.now();
    return {
      skillName: skill.skillName,
      invocationId,
      startTime,
      endTime,
      duration: endTime - startTime,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      metadata: { parameters: skill.parameters },
    };
  }
}

/**
 * Executes invocations with specified concurrency
 */
async function runWithConcurrency(
  skill: SkillInvocation,
  count: number,
  concurrency: number,
  timeoutMs: number,
  cooldownMs: number
): Promise<TimingResult[]> {
  const results: TimingResult[] = [];
  const batches = Math.ceil(count / concurrency);

  for (let batch = 0; batch < batches; batch++) {
    const batchSize = Math.min(concurrency, count - batch * concurrency);
    const batchPromises: Promise<TimingResult>[] = [];

    for (let i = 0; i < batchSize; i++) {
      batchPromises.push(runTimedInvocation(skill, timeoutMs));
    }

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    if (batch < batches - 1 && cooldownMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, cooldownMs));
    }
  }

  return results;
}

/**
 * Main benchmark harness class
 */
export class SkillBenchmarkHarness {
  private config: BenchmarkConfig;
  private skills: SkillInvocation[] = [];

  constructor(config: Partial<BenchmarkConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Register a skill for benchmarking
   */
  registerSkill(skill: SkillInvocation): this {
    this.skills.push(skill);
    return this;
  }

  /**
   * Register multiple skills for benchmarking
   */
  registerSkills(skills: SkillInvocation[]): this {
    this.skills.push(...skills);
    return this;
  }

  /**
   * Clear all registered skills
   */
  clearSkills(): this {
    this.skills = [];
    return this;
  }

  /**
   * Update benchmark configuration
   */
  setConfig(config: Partial<BenchmarkConfig>): this {
    this.config = { ...this.config, ...config };
    return this;
  }

  /**
   * Run benchmarks for all registered skills
   */
  async run(): Promise<BenchmarkReport> {
    const startTimestamp = new Date().toISOString();
    const overallStartTime = performance.now();
    const allResults: TimingResult[] = [];
    const allStats: BenchmarkStats[] = [];

    for (const skill of this.skills) {
      // Warmup phase
      if (this.config.warmupIterations > 0) {
        const warmupResults = await runWithConcurrency(
          skill,
          this.config.warmupIterations,
          this.config.concurrency,
          this.config.timeoutMs,
          this.config.cooldownMs
        );

        if (this.config.includeWarmupInResults) {
          warmupResults.forEach((r) => {
            (r.metadata as Record<string, unknown>).isWarmup = true;
          });
          allResults.push(...warmupResults);
        }

        // Cooldown between warmup and main run
        if (this.config.cooldownMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, this.config.cooldownMs));
        }
      }

      // Main benchmark phase
      const mainResults = await runWithConcurrency(
        skill,
        this.config.iterations,
        this.config.concurrency,
        this.config.timeoutMs,
        this.config.cooldownMs
      );

      allResults.push(...mainResults);

      // Calculate stats for this skill (main results only)
      const skillResults = mainResults.filter(
        (r) => !(r.metadata as Record<string, unknown>)?.isWarmup
      );
      allStats.push(calculateStats(skill.skillName, skillResults));
    }

    const overallEndTime = performance.now();
    const endTimestamp = new Date().toISOString();

    // Build summary
    const sortedByMean = [...allStats].sort((a, b) => a.meanDuration - b.meanDuration);
    const totalInvocations = allStats.reduce((acc, s) => acc + s.totalInvocations, 0);
    const totalSuccesses = allStats.reduce((acc, s) => acc + s.successCount, 0);

    return {
      config: this.config,
      startTimestamp,
      endTimestamp,
      totalDurationMs: overallEndTime - overallStartTime,
      results: allResults,
      stats: allStats,
      summary: {
        totalSkills: this.skills.length,
        totalInvocations,
        overallSuccessRate: totalInvocations > 0 ? totalSuccesses / totalInvocations : 0,
        fastestSkill: sortedByMean[0]?.skillName ?? 'N/A',
        slowestSkill: sortedByMean[sortedByMean.length - 1]?.skillName ?? 'N/A',
      },
    };
  }

  /**
   * Run benchmarks and return a formatted string report
   */
  async runWithReport(): Promise<{ report: BenchmarkReport; formatted: string }> {
    const report = await this.run();
    const formatted = this.formatReport(report);
    return { report, formatted };
  }

  /**
   * Format a benchmark report as a readable string
   */
  formatReport(report: BenchmarkReport): string {
    const lines: string[] = [
      '═══════════════════════════════════════════════════════════════',
      '                 SKILL BENCHMARK REPORT',
      '═══════════════════════════════════════════════════════════════',
      '',
      `Started:    ${report.startTimestamp}`,
      `Completed:  ${report.endTimestamp}`,
      `Duration:   ${report.totalDurationMs.toFixed(2)}ms`,
      '',
      '─────────────────────────────────────────────────────────────────',
      '                      CONFIGURATION',
      '─────────────────────────────────────────────────────────────────',
      `Warmup Iterations:  ${report.config.warmupIterations}`,
      `Main Iterations:    ${report.config.iterations}`,
      `Concurrency:        ${report.config.concurrency}`,
      `Timeout:            ${report.config.timeoutMs}ms`,
      `Cooldown:           ${report.config.cooldownMs}ms`,
      '',
      '─────────────────────────────────────────────────────────────────',
      '                       SUMMARY',
      '─────────────────────────────────────────────────────────────────',
      `Total Skills:       ${report.summary.totalSkills}`,
      `Total Invocations:  ${report.summary.totalInvocations}`,
      `Success Rate:       ${(report.summary.overallSuccessRate * 100).toFixed(2)}%`,
      `Fastest Skill:      ${report.summary.fastestSkill}`,
      `Slowest Skill:      ${report.summary.slowestSkill}`,
      '',
    ];

    for (const stat of report.stats) {
      lines.push(
        '─────────────────────────────────────────────────────────────────',
        `  SKILL: ${stat.skillName}`,
        '─────────────────────────────────────────────────────────────────',
        `  Invocations:      ${stat.totalInvocations} (${stat.successCount} success, ${stat.failureCount} failed)`,
        `  Min Duration:     ${stat.minDuration.toFixed(3)}ms`,
        `  Max Duration:     ${stat.maxDuration.toFixed(3)}ms`,
        `  Mean Duration:    ${stat.meanDuration.toFixed(3)}ms`,
        `  Median Duration:  ${stat.medianDuration.toFixed(3)}ms`,
        `  Std Deviation:    ${stat.standardDeviation.toFixed(3)}ms`,
        `  P95:              ${stat.percentile95.toFixed(3)}ms`,
        `  P99:              ${stat.percentile99.toFixed(3)}ms`,
        `  Throughput:       ${stat.throughput.toFixed(2)} inv/sec`,
        ''
      );
    }

    lines.push('═══════════════════════════════════════════════════════════════');

    return lines.join('\n');
  }
}

/**
 * Convenience function to create and run a quick benchmark
 */
export async function benchmarkSkills(
  skills: SkillInvocation[],
  config?: Partial<BenchmarkConfig>
): Promise<BenchmarkReport> {
  const harness = new SkillBenchmarkHarness(config);
  harness.registerSkills(skills);
  return harness.run();
}

/**
 * Decorator for timing skill methods (for class-based skills)
 */
export function timed(
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: unknown[]): Promise<unknown> {
    const start = performance.now();
    try {
      const result = await originalMethod.apply(this, args);
      const end = performance.now();
      console.log(`[TIMING] ${propertyKey}: ${(end - start).toFixed(3)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.log(`[TIMING] ${propertyKey}: ${(end - start).toFixed(3)}ms (FAILED)`);
      throw error;
    }
  };

  return descriptor;
}

// Example usage and self-test
if (typeof require !== 'undefined' && require.main === module) {
  (async () => {
    console.log('Running benchmark harness self-test...\n');

    // Create mock skills for testing
    const mockSkills: SkillInvocation[] = [
      {
        skillName: 'fast-skill',
        parameters: { delay: 10 },
        invoke: async () => {
          await new Promise((r) => setTimeout(r, 10 + Math.random() * 5));
          return { status: 'ok' };
        },
      },
      {
        skillName: 'medium-skill',
        parameters: { delay: 50 },
        invoke: async () => {
          await new Promise((r) => setTimeout(r, 50 + Math.random() * 20));
          return { status: 'ok' };
        },
      },
      {
        skillName: 'slow-skill',
        parameters: { delay: 100 },
        invoke: async () => {
          await new Promise((r) => setTimeout(r, 100 + Math.random() * 30));
          return { status: 'ok' };
        },
      },
      {
        skillName: 'flaky-skill',
        parameters: { failRate: 0.3 },
        invoke: async () => {
          await new Promise((r) => setTimeout(r, 30));
          if (Math.random() < 0.3) {
            throw new Error('Random failure');
          }
          return { status: 'ok' };
        },
      },
    ];

    const harness = new SkillBenchmarkHarness({
      warmupIterations: 2,
      iterations: 5,
      concurrency: 2,
      cooldownMs: 50,
    });

    harness.registerSkills(mockSkills);

    const { report, formatted } = await harness.runWithReport();

    console.log(formatted);
    console.log('\nRaw JSON report available in report object.');
    console.log(`\nTotal benchmark duration: ${report.totalDurationMs.toFixed(2)}ms`);
  })();
}

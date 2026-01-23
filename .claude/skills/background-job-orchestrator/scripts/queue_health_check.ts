#!/usr/bin/env node
/**
 * Queue Health Check Dashboard
 *
 * Monitors BullMQ queue metrics and provides health status.
 *
 * Usage: npx ts-node queue_health_check.ts [queue-name]
 *
 * Dependencies: npm install bullmq ioredis chalk
 */

import { Queue } from 'bullmq';
import Redis from 'ioredis';
import chalk from 'chalk';

interface QueueMetrics {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  metrics: QueueMetrics;
  warnings: string[];
}

async function getQueueHealth(queueName: string): Promise<HealthStatus> {
  const connection = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null
  });

  const queue = new Queue(queueName, { connection });

  try {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
      queue.isPaused()
    ]);

    const metrics: QueueMetrics = {
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused
    };

    const warnings: string[] = [];
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';

    // Health checks
    if (waiting > 1000) {
      warnings.push(`High queue depth: ${waiting} jobs waiting`);
      status = 'degraded';
    }

    if (failed > 100) {
      warnings.push(`High failure rate: ${failed} failed jobs`);
      status = 'degraded';
    }

    if (waiting > 5000 || failed > 500) {
      status = 'critical';
    }

    if (paused) {
      warnings.push('Queue is paused!');
      status = 'critical';
    }

    return { status, metrics, warnings };
  } finally {
    await queue.close();
    await connection.quit();
  }
}

async function displayDashboard(queueName: string) {
  console.clear();
  console.log(chalk.bold.cyan(`\n📊 Queue Health Dashboard: ${queueName}\n`));

  const health = await getQueueHealth(queueName);

  // Status badge
  const statusColor = {
    healthy: chalk.green,
    degraded: chalk.yellow,
    critical: chalk.red
  }[health.status];

  console.log(statusColor(`Status: ${health.status.toUpperCase()}\n`));

  // Metrics
  console.log(chalk.bold('Metrics:'));
  console.log(`  Waiting:   ${chalk.cyan(health.metrics.waiting.toString().padStart(8))}`);
  console.log(`  Active:    ${chalk.blue(health.metrics.active.toString().padStart(8))}`);
  console.log(`  Completed: ${chalk.green(health.metrics.completed.toString().padStart(8))}`);
  console.log(`  Failed:    ${chalk.red(health.metrics.failed.toString().padStart(8))}`);
  console.log(`  Delayed:   ${chalk.magenta(health.metrics.delayed.toString().padStart(8))}`);
  console.log(`  Paused:    ${health.metrics.paused ? chalk.red('YES') : chalk.green('NO')}\n`);

  // Warnings
  if (health.warnings.length > 0) {
    console.log(chalk.bold.yellow('⚠️  Warnings:'));
    health.warnings.forEach(warning => {
      console.log(chalk.yellow(`  • ${warning}`));
    });
    console.log('');
  }

  // Recommendations
  if (health.status === 'degraded') {
    console.log(chalk.bold.yellow('💡 Recommendations:'));
    if (health.metrics.waiting > 1000) {
      console.log(chalk.yellow('  • Scale up workers to process backlog'));
    }
    if (health.metrics.failed > 100) {
      console.log(chalk.yellow('  • Investigate failed jobs: await queue.getFailed()'));
    }
    console.log('');
  }

  if (health.status === 'critical') {
    console.log(chalk.bold.red('🚨 CRITICAL - IMMEDIATE ACTION REQUIRED'));
    console.log(chalk.red('  • Queue is severely degraded'));
    console.log(chalk.red('  • Check worker processes are running'));
    console.log(chalk.red('  • Review logs for errors'));
    console.log('');
  }

  console.log(chalk.dim(`Last updated: ${new Date().toLocaleTimeString()}`));
}

// Main
const queueName = process.argv[2] || 'email-queue';

console.log(chalk.dim('Starting queue health monitor...'));
console.log(chalk.dim('Press Ctrl+C to exit\n'));

// Initial display
displayDashboard(queueName);

// Refresh every 5 seconds
setInterval(() => {
  displayDashboard(queueName);
}, 5000);

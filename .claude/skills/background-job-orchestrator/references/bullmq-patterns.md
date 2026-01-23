# Advanced BullMQ Patterns

Production patterns for complex job orchestration with BullMQ.

## Pattern 1: Job Chaining (Sequential Workflows)

Execute jobs in sequence, passing results between steps.

```typescript
// Parent job spawns child jobs
await queue.add('process-order', {
  orderId: 123
}, {
  attempts: 3
});

worker.process('process-order', async (job) => {
  const { orderId } = job.data;

  // Step 1: Validate inventory
  const inventoryJob = await queue.add('check-inventory', {
    orderId
  }, {
    parent: {
      id: job.id,
      queue: job.queueName
    }
  });

  await inventoryJob.waitUntilFinished(queueEvents);

  // Step 2: Charge payment
  const paymentJob = await queue.add('charge-payment', {
    orderId
  }, {
    parent: {
      id: job.id,
      queue: job.queueName
    }
  });

  await paymentJob.waitUntilFinished(queueEvents);

  // Step 3: Ship order
  return await queue.add('ship-order', {
    orderId
  }, {
    parent: {
      id: job.id,
      queue: job.queueName
    }
  });
});
```

## Pattern 2: Fan-Out/Fan-In

Process multiple jobs in parallel, then aggregate results.

```typescript
// Fan-out: Create parallel jobs
const userIds = [1, 2, 3, 4, 5];

const jobs = await Promise.all(
  userIds.map(userId =>
    queue.add('send-notification', {
      userId
    }, {
      parent: { id: 'batch-123', queue: 'aggregator' }
    })
  )
);

// Fan-in: Aggregate when all complete
const aggregatorWorker = new Worker('aggregator', async (job) => {
  const children = await job.getChildrenValues();

  const successCount = Object.values(children).filter(
    r => r.status === 'sent'
  ).length;

  console.log(`Sent ${successCount}/${userIds.length} notifications`);
});
```

## Pattern 3: Rate-Limited API Calls

Respect third-party API rate limits.

```typescript
// Configure rate limiter
const apiQueue = new Queue('external-api', {
  connection,
  limiter: {
    max: 100,        // Max 100 requests
    duration: 60000, // Per 60 seconds
    groupKey: 'apiKey' // Rate limit per API key
  }
});

// Group jobs by API key
await apiQueue.add('fetch-data', {
  endpoint: '/users',
  apiKey: 'key123'
}, {
  rateLimiter: {
    groupKey: 'key123' // This key gets 100 req/min
  }
});
```

## Pattern 4: Priority Queues

Process high-priority jobs first.

```typescript
// Add jobs with priority (lower number = higher priority)
await queue.add('send-email', {
  to: 'premium@user.com'
}, {
  priority: 1  // Premium users
});

await queue.add('send-email', {
  to: 'free@user.com'
}, {
  priority: 10  // Free users
});

// Worker processes priority 1 jobs before priority 10
const worker = new Worker('email-queue', processEmail, {
  connection,
  concurrency: 5
});
```

## Pattern 5: Delayed Jobs

Schedule jobs for future execution.

```typescript
// Send reminder email in 24 hours
await queue.add('send-reminder', {
  userId: 123
}, {
  delay: 24 * 60 * 60 * 1000 // 24 hours in ms
});

// Or: Specific timestamp
const scheduledTime = new Date('2026-01-15T09:00:00Z');
await queue.add('daily-report', {
  type: 'sales'
}, {
  delay: scheduledTime.getTime() - Date.now()
});
```

## Pattern 6: Repeatable Jobs (Cron)

Schedule recurring jobs with cron syntax.

```typescript
// Daily at 9 AM
await queue.add('daily-digest', {
  recipients: ['admin@company.com']
}, {
  repeat: {
    pattern: '0 9 * * *',  // Cron syntax
    tz: 'America/New_York'
  }
});

// Every 15 minutes
await queue.add('health-check', {
  service: 'api'
}, {
  repeat: {
    every: 15 * 60 * 1000 // 15 minutes in ms
  }
});
```

## Pattern 7: Job Progress Tracking

Update progress for long-running jobs.

```typescript
worker.process('video-transcode', async (job) => {
  const { videoId, formats } = job.data;

  for (let i = 0; i < formats.length; i++) {
    const progress = ((i + 1) / formats.length) * 100;

    // Update progress
    await job.updateProgress(progress);

    // Log current step
    await job.log(`Transcoding ${formats[i]}...`);

    await transcodeVideo(videoId, formats[i]);
  }

  return { completed: formats.length };
});

// Client polls progress
const job = await queue.getJob(jobId);
console.log(`Progress: ${job.progress}%`);

// Or: Listen to progress events
queueEvents.on('progress', ({ jobId, data }) => {
  console.log(`Job ${jobId}: ${data}%`);
});
```

## Pattern 8: Conditional Job Execution

Execute jobs based on previous results.

```typescript
worker.process('process-upload', async (job) => {
  const { fileUrl } = job.data;

  // Download file
  const file = await downloadFile(fileUrl);

  // Conditional: Only process if valid
  if (!isValidFile(file)) {
    await job.log('Invalid file, skipping processing');
    return { skipped: true };
  }

  // Process valid files
  const result = await processFile(file);

  // Add follow-up job only if needed
  if (result.needsTranscoding) {
    await queue.add('transcode', {
      fileId: result.fileId
    }, {
      parent: { id: job.id, queue: job.queueName }
    });
  }

  return result;
});
```

## Pattern 9: Graceful Shutdown

Handle in-flight jobs during shutdown.

```typescript
let isShuttingDown = false;

const worker = new Worker('email-queue', async (job) => {
  if (isShuttingDown) {
    throw new Error('Shutting down, job will be requeued');
  }

  await processEmail(job.data);
}, {
  connection
});

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');

  isShuttingDown = true;

  // Stop accepting new jobs
  await worker.pause();

  // Wait for active jobs to complete (max 30 seconds)
  await worker.close();

  console.log('All jobs completed, exiting');
  process.exit(0);
});
```

## Pattern 10: Dead Letter Queue Recovery

Retry failed jobs with modified data.

```typescript
// Get all failed jobs
const failedJobs = await queue.getFailed();

// Analyze and retry with fixes
for (const job of failedJobs) {
  const { failedReason } = job;

  if (failedReason.includes('Invalid email')) {
    // Fix email and retry
    const fixedEmail = sanitizeEmail(job.data.email);

    await queue.add('send-email', {
      ...job.data,
      email: fixedEmail
    }, {
      attempts: 1 // Only 1 more attempt
    });

    // Remove original failed job
    await job.remove();
  }
}
```

## Production Checklist

```
□ Dead letter queue monitoring
□ Exponential backoff configured
□ Job timeouts set appropriately
□ Rate limiting for external APIs
□ Idempotency keys for critical jobs
□ Worker concurrency tuned
□ Graceful shutdown implemented
□ Queue depth alerts configured
□ Failed job inspection workflow
□ Redis persistence enabled
□ Job data sanitized (no PII in logs)
□ Progress tracking for long jobs
```

## Performance Tips

1. **Use bulk operations**: `queue.addBulk()` is 10x faster than individual `add()` calls
2. **Tune concurrency**: Start with `CPU cores * 2`, adjust based on job type
3. **Remove completed jobs**: Set `removeOnComplete` to prevent Redis bloat
4. **Use priorities sparingly**: Too many priority levels hurt performance
5. **Partition queues**: Separate queues for different job types improves isolation
6. **Monitor Redis memory**: Set `maxmemory-policy` to `allkeys-lru` for Redis

## Common Pitfalls

1. **Not handling job failures**: Always have dead letter queue inspection
2. **Forgetting idempotency**: Jobs can run twice, design for it
3. **Blocking workers**: Don't do synchronous I/O in workers
4. **Not monitoring queue depth**: Set up alerts before it's too late
5. **Over-using repeatable jobs**: They create Redis bloat, use sparingly

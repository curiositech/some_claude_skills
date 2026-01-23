#!/bin/bash
# Setup BullMQ with Redis for background job processing
# Usage: ./setup_bullmq.sh

set -e

echo "🚀 Setting up BullMQ with Redis..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Install Node.js first."
    exit 1
fi

# Install BullMQ dependencies
echo "📦 Installing BullMQ and dependencies..."
npm install --save bullmq ioredis
npm install --save-dev @types/node

# Check if Redis is running
echo "🔍 Checking Redis connection..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is running"
    else
        echo "⚠️  Redis is installed but not running"
        echo "Start Redis with: redis-server"
    fi
else
    echo "⚠️  Redis not found. Install with:"
    echo "  macOS: brew install redis"
    echo "  Ubuntu: sudo apt-get install redis-server"
    echo "  Docker: docker run -d -p 6379:6379 redis:alpine"
fi

# Create basic queue setup
echo "📝 Creating queue configuration..."
cat > queue.config.ts << 'EOF'
import { Queue, Worker, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

// Redis connection
const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null
});

// Create queue
export const emailQueue = new Queue('email-queue', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    },
    removeOnComplete: 100,
    removeOnFail: false
  }
});

// Create worker
export const emailWorker = new Worker('email-queue', async (job) => {
  console.log(`Processing job ${job.id}:`, job.data);

  // Your job processing logic here
  await new Promise(resolve => setTimeout(resolve, 1000));

  return { processed: true, timestamp: new Date().toISOString() };
}, {
  connection,
  concurrency: 5
});

// Queue events for monitoring
const queueEvents = new QueueEvents('email-queue', { connection });

queueEvents.on('completed', ({ jobId }) => {
  console.log(`✅ Job ${jobId} completed`);
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ Job ${jobId} failed:`, failedReason);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await emailWorker.close();
  await emailQueue.close();
  await connection.quit();
  process.exit(0);
});
EOF

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start Redis (if not running)"
echo "2. Import queue in your code: import { emailQueue } from './queue.config'"
echo "3. Add jobs: await emailQueue.add('send', { to: 'user@example.com' })"
echo "4. Worker will process jobs automatically"

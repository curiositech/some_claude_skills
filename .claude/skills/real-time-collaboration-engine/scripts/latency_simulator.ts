#!/usr/bin/env node
/**
 * Network Latency Simulator
 *
 * Tests real-time collaboration under various network conditions.
 *
 * Usage: npx tsx latency_simulator.ts [scenario]
 *
 * Examples:
 *   npx tsx latency_simulator.ts good
 *   npx tsx latency_simulator.ts bad
 *   npx tsx latency_simulator.ts mobile
 *   npx tsx latency_simulator.ts satellite
 *
 * Scenarios:
 *   - good: Fast fiber connection (10ms, 0% loss)
 *   - bad: Congested network (200ms, 5% loss)
 *   - mobile: 4G connection (100ms, 2% loss)
 *   - satellite: High latency (600ms, 1% loss)
 */

interface NetworkScenario {
  name: string;
  latency: number;        // Average RTT in ms
  jitter: number;         // Latency variance in ms
  packetLoss: number;     // Packet loss percentage (0-100)
  bandwidth: number;      // KB/s
}

const SCENARIOS: Record<string, NetworkScenario> = {
  good: {
    name: 'Fast Fiber',
    latency: 10,
    jitter: 2,
    packetLoss: 0,
    bandwidth: 10000  // 10 MB/s
  },
  bad: {
    name: 'Congested Network',
    latency: 200,
    jitter: 50,
    packetLoss: 5,
    bandwidth: 500    // 500 KB/s
  },
  mobile: {
    name: '4G Mobile',
    latency: 100,
    jitter: 30,
    packetLoss: 2,
    bandwidth: 1500   // 1.5 MB/s
  },
  satellite: {
    name: 'Satellite',
    latency: 600,
    jitter: 100,
    packetLoss: 1,
    bandwidth: 2000   // 2 MB/s
  }
};

interface Message {
  id: string;
  timestamp: number;
  payload: any;
  size: number;  // bytes
}

class LatencySimulator {
  private scenario: NetworkScenario;
  private messageQueue: Message[] = [];
  private sentMessages: number = 0;
  private receivedMessages: number = 0;
  private droppedMessages: number = 0;
  private totalLatency: number = 0;

  constructor(scenarioName: string) {
    const scenario = SCENARIOS[scenarioName];
    if (!scenario) {
      throw new Error(`Unknown scenario: ${scenarioName}`);
    }
    this.scenario = scenario;
  }

  /**
   * Simulate sending a message
   */
  async send(payload: any): Promise<void> {
    const message: Message = {
      id: `msg-${this.sentMessages++}`,
      timestamp: Date.now(),
      payload,
      size: JSON.stringify(payload).length
    };

    // Check if message is dropped
    if (Math.random() * 100 < this.scenario.packetLoss) {
      this.droppedMessages++;
      console.log(`📦 ❌ Message ${message.id} DROPPED (packet loss)`);
      return;
    }

    // Calculate latency with jitter
    const latency = this.calculateLatency();

    // Simulate network delay
    console.log(`📦 ⏳ Sending ${message.id} (${message.size} bytes, ${latency}ms delay)`);

    setTimeout(() => {
      this.receive(message, latency);
    }, latency);
  }

  /**
   * Calculate latency with jitter
   */
  private calculateLatency(): number {
    const baseLatency = this.scenario.latency;
    const jitter = this.scenario.jitter;

    // Random jitter: ±jitter
    const variance = (Math.random() - 0.5) * 2 * jitter;

    return Math.max(1, baseLatency + variance);
  }

  /**
   * Simulate receiving a message
   */
  private receive(message: Message, latency: number): void {
    this.receivedMessages++;
    this.totalLatency += latency;

    const now = Date.now();
    const totalTime = now - message.timestamp;

    console.log(`📦 ✅ Received ${message.id} (total time: ${totalTime}ms)`);
  }

  /**
   * Run simulation with multiple messages
   */
  async runSimulation(messageCount: number): Promise<void> {
    console.log(`\n🌐 Network Simulation: ${this.scenario.name}\n`);
    console.log('Configuration:');
    console.log(`  Latency: ${this.scenario.latency}ms ±${this.scenario.jitter}ms`);
    console.log(`  Packet Loss: ${this.scenario.packetLoss}%`);
    console.log(`  Bandwidth: ${this.scenario.bandwidth} KB/s\n`);

    console.log(`Sending ${messageCount} messages...\n`);

    // Send messages with realistic timing
    for (let i = 0; i < messageCount; i++) {
      const payload = {
        type: 'text-change',
        userId: 'user-1',
        change: { position: i, text: 'Hello' }
      };

      await this.send(payload);

      // Simulate typing delay (200ms between keystrokes)
      await this.delay(200);
    }

    // Wait for all messages to arrive
    await this.delay(this.scenario.latency * 2 + 1000);

    this.showResults();
  }

  /**
   * Test reconnection behavior
   */
  async testReconnection(): Promise<void> {
    console.log(`\n🔌 Testing Reconnection Behavior\n`);

    // Simulate normal operation
    console.log('Phase 1: Normal operation');
    await this.send({ type: 'ping' });
    await this.delay(500);

    // Simulate disconnection
    console.log('\nPhase 2: Disconnection (10 messages queued)');
    const offlineMessages = [];
    for (let i = 0; i < 10; i++) {
      offlineMessages.push({
        type: 'offline-change',
        change: `Change ${i}`
      });
      console.log(`  Queued: Change ${i}`);
    }

    await this.delay(2000);

    // Simulate reconnection
    console.log('\nPhase 3: Reconnection (syncing queued messages)');
    for (const msg of offlineMessages) {
      await this.send(msg);
      await this.delay(100);
    }

    await this.delay(this.scenario.latency * 2 + 1000);

    console.log('\n✅ Reconnection complete\n');
  }

  /**
   * Show simulation results
   */
  private showResults(): void {
    console.log('\n─'.repeat(80));
    console.log('\n📊 Simulation Results:\n');

    const avgLatency = this.totalLatency / this.receivedMessages;
    const successRate = (this.receivedMessages / this.sentMessages) * 100;

    console.log(`Messages sent: ${this.sentMessages}`);
    console.log(`Messages received: ${this.receivedMessages}`);
    console.log(`Messages dropped: ${this.droppedMessages}`);
    console.log(`Success rate: ${successRate.toFixed(1)}%`);
    console.log(`Average latency: ${avgLatency.toFixed(0)}ms\n`);

    // Performance assessment
    this.assessPerformance(avgLatency, successRate);
  }

  private assessPerformance(avgLatency: number, successRate: number): void {
    console.log('Performance Assessment:\n');

    // Latency rating
    if (avgLatency < 50) {
      console.log('  ✅ Latency: Excellent - Real-time collaboration feels instant');
    } else if (avgLatency < 150) {
      console.log('  ⚠️  Latency: Good - Minor delays, acceptable for most use cases');
    } else if (avgLatency < 300) {
      console.log('  ⚠️  Latency: Fair - Noticeable delays, use optimistic updates');
    } else {
      console.log('  🔴 Latency: Poor - Significant delays, consider conflict-free strategies');
    }

    // Packet loss rating
    if (successRate > 99) {
      console.log('  ✅ Reliability: Excellent - Minimal packet loss');
    } else if (successRate > 95) {
      console.log('  ⚠️  Reliability: Good - Some packet loss, implement retry logic');
    } else {
      console.log('  🔴 Reliability: Poor - High packet loss, need robust error handling');
    }

    // Recommendations
    console.log('\n💡 Recommendations:\n');

    if (avgLatency > 200) {
      console.log('  • Implement optimistic updates (apply changes immediately)');
      console.log('  • Batch operations to reduce round-trips');
      console.log('  • Use CRDTs for offline-first capability');
    }

    if (successRate < 98) {
      console.log('  • Add message acknowledgments');
      console.log('  • Implement exponential backoff retry');
      console.log('  • Queue failed messages for later sync');
    }

    if (this.scenario.latency > 500) {
      console.log('  • Avoid Operational Transform (requires low latency)');
      console.log('  • Use CRDTs for better offline support');
      console.log('  • Add "Syncing..." indicator to UI');
    }

    console.log('');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: npx tsx latency_simulator.ts [scenario]');
    console.log('\nAvailable scenarios:');
    Object.entries(SCENARIOS).forEach(([key, scenario]) => {
      console.log(`  ${key.padEnd(10)} - ${scenario.name} (${scenario.latency}ms, ${scenario.packetLoss}% loss)`);
    });
    console.log('\nExamples:');
    console.log('  npx tsx latency_simulator.ts good');
    console.log('  npx tsx latency_simulator.ts satellite');
    process.exit(1);
  }

  const scenario = args[0];

  if (!SCENARIOS[scenario]) {
    console.error(`Unknown scenario: ${scenario}`);
    console.error('Available: good, bad, mobile, satellite');
    process.exit(1);
  }

  const simulator = new LatencySimulator(scenario);

  // Run both simulations
  (async () => {
    await simulator.runSimulation(10);
    await simulator.testReconnection();
  })();
}

export { LatencySimulator, NetworkScenario };

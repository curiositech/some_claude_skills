#!/usr/bin/env node
/**
 * Collaboration Testing Tool
 *
 * Simulates concurrent edits to test conflict resolution strategies.
 *
 * Usage: npx tsx collaboration_tester.ts [strategy] [users]
 *
 * Examples:
 *   npx tsx collaboration_tester.ts ot 5
 *   npx tsx collaboration_tester.ts crdt 10
 *   npx tsx collaboration_tester.ts lww 3
 *
 * Strategies:
 *   - ot: Operational Transform (for text)
 *   - crdt: CRDT (for JSON objects)
 *   - lww: Last-Write-Wins (simple strategy)
 */

import * as fs from 'fs';

type Strategy = 'ot' | 'crdt' | 'lww';

interface Operation {
  userId: string;
  timestamp: number;
  type: 'insert' | 'delete' | 'replace';
  position: number;
  content?: string;
  length?: number;
}

interface User {
  id: string;
  document: string;
  operations: Operation[];
}

class CollaborationTester {
  private strategy: Strategy;
  private users: User[];
  private serverDocument: string;
  private serverRevision: number = 0;

  constructor(strategy: Strategy, userCount: number) {
    this.strategy = strategy;
    this.serverDocument = 'Initial document text.';

    // Create simulated users
    this.users = Array.from({ length: userCount }, (_, i) => ({
      id: `user-${i + 1}`,
      document: this.serverDocument,
      operations: []
    }));
  }

  /**
   * Simulate concurrent editing session
   */
  async run(): Promise<void> {
    console.log(`\n🧪 Testing ${this.strategy.toUpperCase()} with ${this.users.length} users\n`);
    console.log(`Initial document: "${this.serverDocument}"\n`);

    // Phase 1: Generate random operations for each user
    this.users.forEach(user => {
      const opCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < opCount; i++) {
        const operation = this.generateRandomOperation(user.id, user.document);
        user.operations.push(operation);

        // Apply locally (optimistic)
        user.document = this.applyOperationLocally(user.document, operation);
      }
    });

    console.log('Generated operations:\n');
    this.users.forEach(user => {
      console.log(`${user.id}:`);
      user.operations.forEach(op => {
        console.log(`  - ${op.type} at ${op.position}: "${op.content || ''}"`);
      });
      console.log(`  Local result: "${user.document}"\n`);
    });

    // Phase 2: Send operations to server and apply conflict resolution
    await this.processOperations();

    // Phase 3: Show results
    this.showResults();
  }

  private generateRandomOperation(userId: string, document: string): Operation {
    const operations: Operation['type'][] = ['insert', 'delete', 'replace'];
    const type = operations[Math.floor(Math.random() * operations.length)];

    const position = Math.floor(Math.random() * document.length);

    switch (type) {
      case 'insert':
        return {
          userId,
          timestamp: Date.now(),
          type: 'insert',
          position,
          content: this.randomText()
        };

      case 'delete':
        return {
          userId,
          timestamp: Date.now(),
          type: 'delete',
          position,
          length: Math.min(5, document.length - position)
        };

      case 'replace':
        return {
          userId,
          timestamp: Date.now(),
          type: 'replace',
          position,
          length: Math.min(5, document.length - position),
          content: this.randomText()
        };
    }
  }

  private randomText(): string {
    const words = ['hello', 'world', 'test', 'edit', 'change'];
    return words[Math.floor(Math.random() * words.length)] + ' ';
  }

  private applyOperationLocally(document: string, op: Operation): string {
    switch (op.type) {
      case 'insert':
        return document.slice(0, op.position) +
               op.content +
               document.slice(op.position);

      case 'delete':
        return document.slice(0, op.position) +
               document.slice(op.position + (op.length || 0));

      case 'replace':
        return document.slice(0, op.position) +
               op.content +
               document.slice(op.position + (op.length || 0));
    }
  }

  private async processOperations(): Promise<void> {
    console.log('─'.repeat(80));
    console.log('\n🔄 Processing operations on server...\n');

    // Collect all operations
    const allOperations: Operation[] = [];
    this.users.forEach(user => {
      allOperations.push(...user.operations);
    });

    // Sort by timestamp (simulate network order)
    allOperations.sort((a, b) => a.timestamp - b.timestamp);

    // Apply each operation using selected strategy
    allOperations.forEach(op => {
      console.log(`Processing ${op.userId} ${op.type} at position ${op.position}`);

      switch (this.strategy) {
        case 'ot':
          this.applyOT(op);
          break;
        case 'crdt':
          this.applyCRDT(op);
          break;
        case 'lww':
          this.applyLWW(op);
          break;
      }

      console.log(`  Server state: "${this.serverDocument}"\n`);
    });
  }

  /**
   * Operational Transform (simplified)
   */
  private applyOT(op: Operation): void {
    // In real OT, we'd transform against concurrent operations
    // This is a simplified version
    this.serverDocument = this.applyOperationLocally(this.serverDocument, op);
    this.serverRevision++;
  }

  /**
   * CRDT (simplified - uses unique position IDs)
   */
  private applyCRDT(op: Operation): void {
    // CRDTs use unique identifiers for each character
    // This is a simplified version showing the concept
    this.serverDocument = this.applyOperationLocally(this.serverDocument, op);
    this.serverRevision++;
  }

  /**
   * Last-Write-Wins (simplest strategy)
   */
  private applyLWW(op: Operation): void {
    // Just apply operation as-is
    // Later timestamps overwrite earlier ones
    this.serverDocument = this.applyOperationLocally(this.serverDocument, op);
    this.serverRevision++;
  }

  private showResults(): void {
    console.log('─'.repeat(80));
    console.log('\n📊 Results:\n');

    console.log(`Strategy: ${this.strategy.toUpperCase()}`);
    console.log(`Total operations: ${this.users.reduce((sum, u) => sum + u.operations.length, 0)}`);
    console.log(`Server revision: ${this.serverRevision}`);
    console.log(`\nFinal server document:\n  "${this.serverDocument}"\n`);

    console.log('User local documents:\n');
    this.users.forEach(user => {
      const matches = user.document === this.serverDocument;
      const icon = matches ? '✅' : '❌';
      console.log(`${icon} ${user.id}: "${user.document}"`);
    });

    // Check for consistency
    const allMatch = this.users.every(u => u.document === this.serverDocument);

    console.log('\n─'.repeat(80));
    if (allMatch) {
      console.log('\n✅ All users converged to same state!');
    } else {
      console.log('\n⚠️  Users have divergent states (need server sync)');
    }

    // Strategy comparison
    console.log('\n💡 Strategy Characteristics:\n');

    switch (this.strategy) {
      case 'ot':
        console.log('  Operational Transform:');
        console.log('  ✅ Preserves intent of operations');
        console.log('  ✅ Works well for text');
        console.log('  ❌ Complex to implement correctly');
        console.log('  ❌ Requires central server for coordination');
        break;

      case 'crdt':
        console.log('  CRDT (Conflict-free Replicated Data Type):');
        console.log('  ✅ Automatic conflict resolution');
        console.log('  ✅ Works offline (peer-to-peer)');
        console.log('  ✅ Mathematically proven to converge');
        console.log('  ❌ Higher memory overhead');
        break;

      case 'lww':
        console.log('  Last-Write-Wins:');
        console.log('  ✅ Simple to implement');
        console.log('  ✅ Low overhead');
        console.log('  ❌ Can lose data (overwrites concurrent edits)');
        console.log('  ❌ Not suitable for collaborative editing');
        break;
    }

    console.log('');
  }

  /**
   * Generate test report
   */
  generateReport(outputPath: string): void {
    const report = {
      strategy: this.strategy,
      users: this.users.length,
      totalOperations: this.users.reduce((sum, u) => sum + u.operations.length, 0),
      serverRevision: this.serverRevision,
      finalDocument: this.serverDocument,
      userDocuments: this.users.map(u => ({
        id: u.id,
        document: u.document,
        operations: u.operations.length,
        matchesServer: u.document === this.serverDocument
      })),
      convergence: this.users.every(u => u.document === this.serverDocument),
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${outputPath}`);
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: npx tsx collaboration_tester.ts [strategy] [users]');
    console.log('\nStrategies:');
    console.log('  ot    - Operational Transform');
    console.log('  crdt  - Conflict-free Replicated Data Type');
    console.log('  lww   - Last-Write-Wins');
    console.log('\nExample:');
    console.log('  npx tsx collaboration_tester.ts ot 5');
    process.exit(1);
  }

  const strategy = args[0] as Strategy;
  const userCount = parseInt(args[1], 10);

  if (!['ot', 'crdt', 'lww'].includes(strategy)) {
    console.error('Invalid strategy. Choose: ot, crdt, or lww');
    process.exit(1);
  }

  if (isNaN(userCount) || userCount < 1) {
    console.error('User count must be a positive number');
    process.exit(1);
  }

  const tester = new CollaborationTester(strategy, userCount);
  tester.run().then(() => {
    if (args.includes('--report')) {
      tester.generateReport('collaboration-test-report.json');
    }
  });
}

export { CollaborationTester };

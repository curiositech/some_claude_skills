#!/usr/bin/env node
/**
 * Token Counter & Cost Estimator
 *
 * Estimate token usage and costs before making API calls.
 *
 * Usage: npx tsx token_counter.ts <text> [--model=gpt-4]
 *
 * Examples:
 *   npx tsx token_counter.ts "Hello world"
 *   npx tsx token_counter.ts "Long text..." --model=gpt-4
 *   echo "Text from file" | npx tsx token_counter.ts
 *
 * Dependencies: npm install tiktoken
 */

import { encoding_for_model } from 'tiktoken';

// Pricing as of Jan 2024 (per 1M tokens)
const PRICING = {
  'gpt-4': { input: 30, output: 60 },
  'gpt-4-32k': { input: 60, output: 120 },
  'gpt-4-turbo': { input: 10, output: 30 },
  'gpt-3.5-turbo': { input: 0.50, output: 1.50 },
  'claude-3-opus': { input: 15, output: 75 },
  'claude-3-sonnet': { input: 3, output: 15 },
  'claude-3-haiku': { input: 0.25, output: 1.25 }
} as const;

type ModelName = keyof typeof PRICING;

interface TokenEstimate {
  text: string;
  model: ModelName;
  tokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

function estimateTokens(text: string, model: ModelName = 'gpt-4'): TokenEstimate {
  // Map Claude models to closest tiktoken encoding
  const tikTokenModel = model.startsWith('claude')
    ? 'gpt-4'
    : model as any;

  const encoding = encoding_for_model(tikTokenModel);
  const tokens = encoding.encode(text).length;
  encoding.free();

  const pricing = PRICING[model];
  const inputCost = (tokens / 1_000_000) * pricing.input;
  const outputCost = (tokens / 1_000_000) * pricing.output;

  return {
    text,
    model,
    tokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost
  };
}

function formatCost(cents: number): string {
  if (cents < 0.01) {
    return `$${cents.toFixed(4)}`;
  }
  return `$${cents.toFixed(2)}`;
}

function displayEstimate(estimate: TokenEstimate) {
  console.log('\n📊 Token Usage Estimate\n');
  console.log('─'.repeat(50));
  console.log(`Model: ${estimate.model}`);
  console.log(`Tokens: ${estimate.tokens.toLocaleString()}`);
  console.log(`\nCost Breakdown:`);
  console.log(`  Input:  ${formatCost(estimate.inputCost)}`);
  console.log(`  Output: ${formatCost(estimate.outputCost)} (same tokens)`);
  console.log(`  Total:  ${formatCost(estimate.totalCost)}`);
  console.log('─'.repeat(50));

  // Warnings
  if (estimate.tokens > 100_000) {
    console.log('\n⚠️  High token count! Consider chunking.');
  }

  if (estimate.totalCost > 1.0) {
    console.log('\n⚠️  Expensive request! Total cost > $1.00');
  }

  // Character stats
  const charCount = estimate.text.length;
  const wordCount = estimate.text.split(/\s+/).length;

  console.log(`\nText Statistics:`);
  console.log(`  Characters: ${charCount.toLocaleString()}`);
  console.log(`  Words: ${wordCount.toLocaleString()}`);
  console.log(`  Tokens/word: ${(estimate.tokens / wordCount).toFixed(2)}`);
  console.log('');
}

function compareModels(text: string) {
  console.log('\n🔍 Model Comparison\n');
  console.log('─'.repeat(70));
  console.log('Model'.padEnd(20), 'Tokens'.padEnd(12), 'Input'.padEnd(12), 'Output'.padEnd(12), 'Total');
  console.log('─'.repeat(70));

  const models: ModelName[] = [
    'gpt-4-turbo',
    'gpt-4',
    'gpt-3.5-turbo',
    'claude-3-opus',
    'claude-3-sonnet',
    'claude-3-haiku'
  ];

  const estimates = models.map(model => estimateTokens(text, model));

  estimates.forEach(est => {
    console.log(
      est.model.padEnd(20),
      est.tokens.toString().padEnd(12),
      formatCost(est.inputCost).padEnd(12),
      formatCost(est.outputCost).padEnd(12),
      formatCost(est.totalCost)
    );
  });

  console.log('─'.repeat(70));

  // Highlight cheapest
  const cheapest = estimates.reduce((min, est) =>
    est.totalCost < min.totalCost ? est : min
  );

  console.log(`\n💰 Cheapest option: ${cheapest.model} (${formatCost(cheapest.totalCost)})`);
  console.log('');
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  let text = '';
  let model: ModelName = 'gpt-4';
  let compare = false;

  // Parse args
  args.forEach(arg => {
    if (arg.startsWith('--model=')) {
      model = arg.slice(8) as ModelName;
      if (!PRICING[model]) {
        console.error(`❌ Unknown model: ${model}`);
        console.error(`Available models: ${Object.keys(PRICING).join(', ')}`);
        process.exit(1);
      }
    } else if (arg === '--compare') {
      compare = true;
    } else {
      text = arg;
    }
  });

  // Read from stdin if no text provided
  if (!text && !process.stdin.isTTY) {
    const chunks: Buffer[] = [];
    process.stdin.on('data', chunk => chunks.push(chunk));
    process.stdin.on('end', () => {
      text = Buffer.concat(chunks).toString('utf-8');
      processText(text, model, compare);
    });
  } else if (!text) {
    console.log('Usage: npx tsx token_counter.ts <text> [--model=gpt-4] [--compare]');
    console.log('\nExamples:');
    console.log('  npx tsx token_counter.ts "Hello world"');
    console.log('  npx tsx token_counter.ts "Text..." --model=gpt-3.5-turbo');
    console.log('  npx tsx token_counter.ts "Text..." --compare');
    console.log('  echo "Text" | npx tsx token_counter.ts');
    console.log(`\nAvailable models: ${Object.keys(PRICING).join(', ')}`);
    process.exit(1);
  } else {
    processText(text, model, compare);
  }
}

function processText(text: string, model: ModelName, compare: boolean) {
  if (compare) {
    compareModels(text);
  } else {
    const estimate = estimateTokens(text, model);
    displayEstimate(estimate);
  }
}

export { estimateTokens, ModelName };

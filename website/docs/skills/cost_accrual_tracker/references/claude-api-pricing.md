---
title: Claude API Pricing Reference
sidebar_label: Claude API Pricing Reference
sidebar_position: 2
---
# Claude API Pricing Reference

## Current Pricing (January 2026)

### Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)

| Token Type | Price per Million Tokens |
|------------|--------------------------|
| Input | $3.00 |
| Output | $15.00 |
| Prompt Cache Write | $3.75 |
| Prompt Cache Read | $0.30 |

### Claude 3.5 Haiku (claude-3-5-haiku-20241022)

| Token Type | Price per Million Tokens |
|------------|--------------------------|
| Input | $1.00 |
| Output | $5.00 |
| Prompt Cache Write | $1.25 |
| Prompt Cache Read | $0.10 |

### Claude 3 Opus (claude-3-opus-20240229)

| Token Type | Price per Million Tokens |
|------------|--------------------------|
| Input | $15.00 |
| Output | $75.00 |
| Prompt Cache Write | $18.75 |
| Prompt Cache Read | $1.50 |

### Claude Opus 4.5 (claude-opus-4-5-20251101)

| Token Type | Price per Million Tokens |
|------------|--------------------------|
| Input | $15.00 |
| Output | $75.00 |
| Prompt Cache Write | $18.75 |
| Prompt Cache Read | $1.50 |

## TypeScript Pricing Constants

```typescript
export const MODEL_PRICING: Record<string, {
  inputPerMTok: number;
  outputPerMTok: number;
  cacheWritePerMTok?: number;
  cacheReadPerMTok?: number;
}> = {
  'claude-3-5-sonnet-20241022': {
    inputPerMTok: 3.00,
    outputPerMTok: 15.00,
    cacheWritePerMTok: 3.75,
    cacheReadPerMTok: 0.30,
  },
  'claude-3-5-haiku-20241022': {
    inputPerMTok: 1.00,
    outputPerMTok: 5.00,
    cacheWritePerMTok: 1.25,
    cacheReadPerMTok: 0.10,
  },
  'claude-3-opus-20240229': {
    inputPerMTok: 15.00,
    outputPerMTok: 75.00,
    cacheWritePerMTok: 18.75,
    cacheReadPerMTok: 1.50,
  },
  'claude-opus-4-5-20251101': {
    inputPerMTok: 15.00,
    outputPerMTok: 75.00,
    cacheWritePerMTok: 18.75,
    cacheReadPerMTok: 1.50,
  },
  // Aliases
  'sonnet': {
    inputPerMTok: 3.00,
    outputPerMTok: 15.00,
  },
  'haiku': {
    inputPerMTok: 1.00,
    outputPerMTok: 5.00,
  },
  'opus': {
    inputPerMTok: 15.00,
    outputPerMTok: 75.00,
  },
};
```

## Cost Calculation Example

```typescript
function calculateCostUsd(
  inputTokens: number,
  outputTokens: number,
  model: string = 'sonnet'
): number {
  const pricing = MODEL_PRICING[model];
  if (!pricing) {
    throw new Error(`Unknown model: ${model}`);
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.inputPerMTok;
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPerMTok;

  return inputCost + outputCost;
}

// Example usage
const cost = calculateCostUsd(50000, 2000, 'sonnet');
// Input: 50k tokens × $3.00/MTok = $0.15
// Output: 2k tokens × $15.00/MTok = $0.03
// Total: $0.18
```

## Prompt Caching Impact

Prompt caching can reduce costs by up to 90% for repeated prompts:

```typescript
function calculateCostWithCaching(
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens: number,
  cacheWriteTokens: number,
  model: string
): { totalCost: number; savings: number } {
  const pricing = MODEL_PRICING[model];

  // Regular input (non-cached portion)
  const regularInputCost = (inputTokens / 1_000_000) * pricing.inputPerMTok;

  // Cache read (90% discount)
  const cacheReadCost = (cacheReadTokens / 1_000_000) * (pricing.cacheReadPerMTok || pricing.inputPerMTok * 0.1);

  // Cache write (25% premium)
  const cacheWriteCost = (cacheWriteTokens / 1_000_000) * (pricing.cacheWritePerMTok || pricing.inputPerMTok * 1.25);

  // Output
  const outputCost = (outputTokens / 1_000_000) * pricing.outputPerMTok;

  const totalCost = regularInputCost + cacheReadCost + cacheWriteCost + outputCost;

  // Calculate savings vs. no caching
  const noCacheCost = ((inputTokens + cacheReadTokens + cacheWriteTokens) / 1_000_000) * pricing.inputPerMTok + outputCost;
  const savings = noCacheCost - totalCost;

  return { totalCost, savings };
}
```

## API Response Format

The Claude API returns token usage in the response:

```json
{
  "id": "msg_01XFDUDYJgAACzvnptvVoYEL",
  "type": "message",
  "role": "assistant",
  "content": [...],
  "model": "claude-3-5-sonnet-20241022",
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 2095,
    "output_tokens": 503,
    "cache_creation_input_tokens": 0,
    "cache_read_input_tokens": 1500
  }
}
```

## Batch API Pricing

The Batch API offers 50% discount on all models:

| Model | Batch Input (per MTok) | Batch Output (per MTok) |
|-------|------------------------|-------------------------|
| Sonnet | $1.50 | $7.50 |
| Haiku | $0.50 | $2.50 |
| Opus | $7.50 | $37.50 |

Use the Batch API for non-time-sensitive workloads to significantly reduce costs.

## Rate Limits

| Tier | Requests/min | Input tokens/min | Output tokens/min |
|------|--------------|------------------|-------------------|
| Free | 5 | 20,000 | 4,000 |
| Tier 1 | 50 | 40,000 | 8,000 |
| Tier 2 | 1,000 | 80,000 | 16,000 |
| Tier 3 | 2,000 | 160,000 | 32,000 |
| Tier 4 | 4,000 | 400,000 | 80,000 |

## Notes

- Prices are in USD
- Minimum charge is 1 token
- Token counts include special tokens added by the API
- Check https://www.anthropic.com/pricing for the latest prices
- This reference current as of January 2026

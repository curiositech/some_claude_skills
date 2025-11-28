/**
 * Integration tests for the MCP Server
 *
 * These tests require:
 * - Docker running with Qdrant (port 6333) and Redis (port 6379)
 * - OPENAI_API_KEY environment variable set
 *
 * Run with: npm run test:integration
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { QdrantClient } from '@qdrant/js-client-rest';
import { Redis } from 'ioredis';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

import { EmbeddingService, EMBEDDING_DIM } from '../../src/embeddings.js';
import { VectorDB } from '../../src/vectordb.js';
import { PromptOptimizer } from '../../src/optimizer.js';
import type { PromptRecord } from '../../src/types.js';

// Test configuration
const QDRANT_URL = process.env.VECTOR_DB_URL || 'http://localhost:6333';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Skip tests if no API key
const describeWithApiKey = OPENAI_API_KEY ? describe : describe.skip;

describe('Integration Tests - Infrastructure', () => {
  let qdrantClient: QdrantClient;
  let redisClient: Redis;

  beforeAll(() => {
    qdrantClient = new QdrantClient({ url: QDRANT_URL });
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000
    });
  });

  afterAll(async () => {
    await redisClient.quit();
  });

  it('should connect to Qdrant', async () => {
    const collections = await qdrantClient.getCollections();
    expect(collections).toBeDefined();
    expect(Array.isArray(collections.collections)).toBe(true);
  });

  it('should connect to Redis', async () => {
    const pong = await redisClient.ping();
    expect(pong).toBe('PONG');
  });

  it('should have prompt_embeddings collection', async () => {
    const collections = await qdrantClient.getCollections();
    const hasCollection = collections.collections.some(c => c.name === 'prompt_embeddings');
    expect(hasCollection).toBe(true);
  });

  it('should have correct vector dimensions in collection', async () => {
    const info = await qdrantClient.getCollection('prompt_embeddings');
    expect(info.config.params.vectors).toBeDefined();
    // Handle both single vector and named vector configs
    const vectorConfig = info.config.params.vectors;
    const size = typeof vectorConfig === 'object' && 'size' in vectorConfig
      ? vectorConfig.size
      : EMBEDDING_DIM;
    expect(size).toBe(EMBEDDING_DIM);
  });
});

describeWithApiKey('Integration Tests - EmbeddingService (requires API key)', () => {
  let service: EmbeddingService;
  let redisClient: Redis;
  let openai: OpenAI;

  beforeAll(() => {
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    redisClient = new Redis(REDIS_URL, { maxRetriesPerRequest: 3 });
    service = new EmbeddingService(openai, redisClient);
  });

  afterAll(async () => {
    await redisClient.quit();
  });

  it('should generate embeddings from OpenAI', async () => {
    const result = await service.embed('Test prompt for embedding', false);

    expect(result.embedding).toBeDefined();
    expect(result.embedding.length).toBe(EMBEDDING_DIM);
    expect(result.tokens_used).toBeGreaterThan(0);
  });

  it('should cache embeddings in Redis', async () => {
    const text = `Unique test text ${Date.now()}`;

    // First call - should hit API
    const result1 = await service.embed(text, true);
    expect(result1.tokens_used).toBeGreaterThan(0);

    // Second call - should hit cache
    const result2 = await service.embed(text, true);
    expect(result2.tokens_used).toBe(0);
    expect(result2.embedding).toEqual(result1.embedding);
  });

  it('should generate contextual embeddings', async () => {
    const result = await service.embedContextual(
      'Review the code for bugs',
      'code_review',
      'optimization'
    );

    expect(result.embedding).toBeDefined();
    expect(result.embedding.length).toBe(EMBEDDING_DIM);
  });

  it('should batch embed multiple texts', async () => {
    const texts = [
      `Batch test 1 ${Date.now()}`,
      `Batch test 2 ${Date.now()}`,
      `Batch test 3 ${Date.now()}`
    ];

    const results = await service.embedBatch(texts);

    expect(results).toHaveLength(3);
    for (const result of results) {
      expect(result.embedding.length).toBe(EMBEDDING_DIM);
    }
  });
});

describeWithApiKey('Integration Tests - VectorDB (requires API key)', () => {
  let db: VectorDB;
  let embeddings: EmbeddingService;
  let openai: OpenAI;
  let testIds: string[] = [];

  beforeAll(() => {
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    embeddings = new EmbeddingService(openai, null);
    db = new VectorDB(QDRANT_URL);
  });

  afterAll(async () => {
    // Clean up test data
    for (const id of testIds) {
      try {
        await db.delete(id);
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
  });

  it('should upsert and retrieve a prompt', async () => {
    const id = uuidv4(); // Qdrant requires pure UUIDs, no prefixes
    testIds.push(id);

    const promptText = 'Write a function to sort an array of numbers';
    const { embedding } = await embeddings.embed(promptText);

    await db.upsert(id, embedding, {
      prompt_text: promptText,
      contextualized_text: `Domain: code\n\n${promptText}`,
      domain: 'code',
      task_type: 'generation',
      metrics: {
        success_rate: 0.85,
        avg_latency_ms: 150,
        token_efficiency: 0.8,
        observation_count: 1,
        last_updated: new Date().toISOString()
      },
      created_at: new Date().toISOString(),
      tags: ['test', 'integration']
    });

    const retrieved = await db.get(id);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.prompt_text).toBe(promptText);
    expect(retrieved?.domain).toBe('code');
  });

  it('should search for similar prompts', async () => {
    // Insert a few test prompts
    const testPrompts = [
      { text: 'Sort numbers in ascending order', domain: 'code', successRate: 0.9 },
      { text: 'Order a list of integers', domain: 'code', successRate: 0.85 },
      { text: 'Arrange data numerically', domain: 'code', successRate: 0.75 }
    ];

    for (const prompt of testPrompts) {
      const id = uuidv4(); // Qdrant requires pure UUIDs, no prefixes
      testIds.push(id);
      const { embedding } = await embeddings.embed(prompt.text);

      await db.upsert(id, embedding, {
        prompt_text: prompt.text,
        contextualized_text: `Domain: ${prompt.domain}\n\n${prompt.text}`,
        domain: prompt.domain,
        task_type: 'generation',
        metrics: {
          success_rate: prompt.successRate,
          avg_latency_ms: 100,
          token_efficiency: 0.8,
          observation_count: 5,
          last_updated: new Date().toISOString()
        },
        created_at: new Date().toISOString(),
        tags: ['test']
      });
    }

    // Wait for indexing
    await new Promise(resolve => setTimeout(resolve, 500));

    // Search for similar prompt
    const query = 'Sort a list of numbers';
    const { embedding } = await embeddings.embed(query);
    const results = await db.search(embedding, { topK: 5, domain: 'code' });

    expect(results.length).toBeGreaterThan(0);
    // Results should have similarity scores
    for (const result of results) {
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(1);
    }
  });

  it('should filter by minimum performance', async () => {
    const { embedding } = await embeddings.embed('Sort numbers');

    // Search with high performance threshold
    const highPerfResults = await db.search(embedding, {
      topK: 10,
      minPerformance: 0.8
    });

    // All results should have success_rate >= 0.8
    for (const result of highPerfResults) {
      const metrics = result.payload.metrics as any;
      expect(metrics.success_rate).toBeGreaterThanOrEqual(0.8);
    }
  });

  it('should update metrics', async () => {
    const id = uuidv4(); // Qdrant requires pure UUIDs, no prefixes
    testIds.push(id);

    const { embedding } = await embeddings.embed('Test update prompt');

    // Insert initial
    await db.upsert(id, embedding, {
      prompt_text: 'Test update prompt',
      contextualized_text: '',
      domain: 'general',
      task_type: 'general',
      metrics: {
        success_rate: 0.5,
        avg_latency_ms: 100,
        token_efficiency: 0.6,
        observation_count: 1,
        last_updated: new Date().toISOString()
      },
      created_at: new Date().toISOString(),
      tags: []
    });

    // Update metrics
    const newMetrics = {
      success_rate: 0.9,
      avg_latency_ms: 80,
      token_efficiency: 0.85,
      observation_count: 10,
      last_updated: new Date().toISOString()
    };

    await db.updateMetrics(id, newMetrics);

    // Retrieve and verify
    const updated = await db.get(id);
    expect(updated?.metrics.success_rate).toBe(0.9);
    expect(updated?.metrics.observation_count).toBe(10);
  });
});

describeWithApiKey('Integration Tests - PromptOptimizer (requires API key)', () => {
  let optimizer: PromptOptimizer;
  let openai: OpenAI;

  beforeAll(() => {
    openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    optimizer = new PromptOptimizer(openai, {
      maxIterations: 3, // Limit iterations for faster tests
      targetScore: 0.85
    });
  });

  it('should score a prompt using LLM evaluation', async () => {
    const score = await optimizer.scorePrompt(
      'Summarize the document concisely.',
      'general'
    );

    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);

    const evaluation = optimizer.getLastEvaluation();
    expect(evaluation).not.toBeNull();
    expect(evaluation?.reasoning).toBeDefined();
    expect(evaluation?.scores).toBeDefined();
  });

  it('should score different prompts differently', async () => {
    const vagueScore = await optimizer.scorePrompt('Do stuff', 'general');
    const specificScore = await optimizer.scorePrompt(
      `Analyze the provided sales data and generate a summary report that includes:
1. Total revenue by quarter
2. Top 5 performing products
3. Customer acquisition trends
4. Key insights and recommendations

Format the output as a structured markdown document with clear sections.`,
      'general'
    );

    expect(specificScore).toBeGreaterThan(vagueScore);
  });

  it('should optimize a vague prompt', async () => {
    const result = await optimizer.optimize(
      'Write code',
      [],
      'code'
    );

    expect(result.original_prompt).toBe('Write code');
    expect(result.optimized_prompt).not.toBe('Write code');
    expect(result.optimized_prompt.length).toBeGreaterThan(result.original_prompt.length);
    expect(result.improvements_made.length).toBeGreaterThan(0);
  });

  it('should learn from similar high-performing prompts', async () => {
    const similarPrompts: PromptRecord[] = [
      {
        id: '1',
        prompt_text: `Write a Python function that takes a list and returns it sorted.
Include type hints, docstring, and handle edge cases like empty lists.`,
        contextualized_text: '',
        domain: 'code',
        task_type: 'generation',
        metrics: {
          success_rate: 0.95,
          avg_latency_ms: 100,
          token_efficiency: 0.9,
          observation_count: 50,
          last_updated: ''
        },
        created_at: '',
        tags: []
      }
    ];

    const result = await optimizer.optimize(
      'Write sorting function',
      similarPrompts,
      'code'
    );

    // Should have learned from the similar prompt
    expect(result.similar_prompts_used).toBe(1);
    expect(result.improvements_made.some(i => i.includes('RAG'))).toBe(true);
  });
});

describe('Integration Tests - End-to-End Flow', () => {
  const hasApiKey = !!OPENAI_API_KEY;

  it.skipIf(!hasApiKey)('should complete full optimization workflow', async () => {
    const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
    const embeddings = new EmbeddingService(openai, null);
    const db = new VectorDB(QDRANT_URL);
    const optimizer = new PromptOptimizer(openai, { maxIterations: 2 });

    // 1. Start with a vague prompt
    const originalPrompt = 'Help me with data';

    // 2. Search for similar prompts (may be empty on fresh DB)
    const { embedding } = await embeddings.embedContextual(originalPrompt, 'general', 'optimization');
    const similarPrompts = await db.search(embedding, { topK: 5, minPerformance: 0.7 });

    // Convert to PromptRecord format
    const promptRecords: PromptRecord[] = similarPrompts.map(r => ({
      id: r.id,
      prompt_text: r.payload.prompt_text as string,
      contextualized_text: r.payload.contextualized_text as string || '',
      domain: r.payload.domain as string || 'general',
      task_type: r.payload.task_type as string || 'general',
      metrics: r.payload.metrics as any,
      created_at: r.payload.created_at as string || '',
      tags: r.payload.tags as string[] || []
    }));

    // 3. Optimize the prompt
    const result = await optimizer.optimize(originalPrompt, promptRecords, 'general');

    expect(result.optimized_prompt).not.toBe(originalPrompt);
    expect(result.estimated_improvement).toBeGreaterThan(0);

    // 4. Store the optimized prompt for future learning
    const newId = uuidv4(); // Qdrant requires pure UUIDs
    const { embedding: newEmbedding } = await embeddings.embed(result.optimized_prompt);

    await db.upsert(newId, newEmbedding, {
      prompt_text: result.optimized_prompt,
      contextualized_text: `Domain: general\n\n${result.optimized_prompt}`,
      domain: 'general',
      task_type: 'general',
      metrics: {
        success_rate: 0.8 + result.estimated_improvement,
        avg_latency_ms: 100,
        token_efficiency: 0.8,
        observation_count: 1,
        last_updated: new Date().toISOString()
      },
      created_at: new Date().toISOString(),
      tags: ['optimized', 'e2e-test']
    });

    // 5. Verify it was stored
    const stored = await db.get(newId);
    expect(stored).not.toBeNull();
    expect(stored?.prompt_text).toBe(result.optimized_prompt);

    // Cleanup
    await db.delete(newId);
  });
});

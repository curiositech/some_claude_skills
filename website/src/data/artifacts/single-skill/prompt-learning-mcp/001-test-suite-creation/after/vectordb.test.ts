/**
 * Unit tests for VectorDB
 * Tests search, upsert, retrieval, and filtering operations
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QdrantClient } from '@qdrant/js-client-rest';
import { VectorDB } from '../../src/vectordb.js';
import { EMBEDDING_DIM } from '../../src/embeddings.js';
import type { PromptMetrics } from '../../src/types.js';

// Mock Qdrant client
vi.mock('@qdrant/js-client-rest', () => {
  const mockClient = {
    getCollections: vi.fn(),
    createCollection: vi.fn(),
    createPayloadIndex: vi.fn(),
    search: vi.fn(),
    upsert: vi.fn(),
    retrieve: vi.fn(),
    setPayload: vi.fn(),
    getCollection: vi.fn(),
    delete: vi.fn(),
    scroll: vi.fn()
  };

  return {
    QdrantClient: vi.fn().mockImplementation(() => mockClient),
    __mockClient: mockClient
  };
});

// Create a mock embedding
const createMockEmbedding = (seed: number = 0): number[] => {
  const embedding = new Array(EMBEDDING_DIM);
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    embedding[i] = Math.sin(i + seed) * 0.1;
  }
  return embedding;
};

describe('VectorDB', () => {
  let db: VectorDB;
  let mockClient: any;

  beforeEach(async () => {
    const mod = await import('@qdrant/js-client-rest');
    mockClient = (mod as any).__mockClient;

    // Reset all mocks
    Object.values(mockClient).forEach((mock: any) => mock.mockReset?.());

    // Default: collection exists
    mockClient.getCollections.mockResolvedValue({
      collections: [{ name: 'prompt_embeddings' }]
    });

    db = new VectorDB('http://localhost:6333');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialize', () => {
    it('should skip creation if collection exists', async () => {
      mockClient.getCollections.mockResolvedValue({
        collections: [{ name: 'prompt_embeddings' }]
      });

      await db.initialize();

      expect(mockClient.getCollections).toHaveBeenCalled();
      expect(mockClient.createCollection).not.toHaveBeenCalled();
    });

    it('should create collection if not exists', async () => {
      mockClient.getCollections.mockResolvedValue({
        collections: []
      });

      await db.initialize();

      expect(mockClient.createCollection).toHaveBeenCalledWith('prompt_embeddings', {
        vectors: {
          size: EMBEDDING_DIM,
          distance: 'Cosine'
        }
      });
    });

    it('should create indexes on new collection', async () => {
      mockClient.getCollections.mockResolvedValue({
        collections: []
      });

      await db.initialize();

      expect(mockClient.createPayloadIndex).toHaveBeenCalledTimes(3);
      expect(mockClient.createPayloadIndex).toHaveBeenCalledWith('prompt_embeddings', {
        field_name: 'metrics.success_rate',
        field_schema: 'float'
      });
      expect(mockClient.createPayloadIndex).toHaveBeenCalledWith('prompt_embeddings', {
        field_name: 'domain',
        field_schema: 'keyword'
      });
      expect(mockClient.createPayloadIndex).toHaveBeenCalledWith('prompt_embeddings', {
        field_name: 'created_at',
        field_schema: 'datetime'
      });
    });

    it('should only initialize once', async () => {
      await db.initialize();
      await db.initialize();

      expect(mockClient.getCollections).toHaveBeenCalledOnce();
    });
  });

  describe('search', () => {
    it('should search with embedding', async () => {
      const embedding = createMockEmbedding();
      mockClient.search.mockResolvedValue([
        { id: '1', score: 0.95, payload: { prompt_text: 'Test prompt' } }
      ]);

      const results = await db.search(embedding);

      expect(mockClient.search).toHaveBeenCalledWith('prompt_embeddings', {
        vector: embedding,
        limit: 10,
        filter: undefined,
        with_payload: true
      });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('1');
      expect(results[0].score).toBe(0.95);
    });

    it('should filter by minimum performance', async () => {
      const embedding = createMockEmbedding();
      mockClient.search.mockResolvedValue([]);

      await db.search(embedding, { minPerformance: 0.7 });

      expect(mockClient.search).toHaveBeenCalledWith('prompt_embeddings', {
        vector: embedding,
        limit: 10,
        filter: {
          must: [{
            key: 'metrics.success_rate',
            range: { gte: 0.7 }
          }]
        },
        with_payload: true
      });
    });

    it('should filter by domain', async () => {
      const embedding = createMockEmbedding();
      mockClient.search.mockResolvedValue([]);

      await db.search(embedding, { domain: 'code_review' });

      expect(mockClient.search).toHaveBeenCalledWith('prompt_embeddings', {
        vector: embedding,
        limit: 10,
        filter: {
          must: [{
            key: 'domain',
            match: { value: 'code_review' }
          }]
        },
        with_payload: true
      });
    });

    it('should combine multiple filters', async () => {
      const embedding = createMockEmbedding();
      mockClient.search.mockResolvedValue([]);

      await db.search(embedding, { minPerformance: 0.8, domain: 'general', topK: 5 });

      expect(mockClient.search).toHaveBeenCalledWith('prompt_embeddings', {
        vector: embedding,
        limit: 5,
        filter: {
          must: [
            { key: 'metrics.success_rate', range: { gte: 0.8 } },
            { key: 'domain', match: { value: 'general' } }
          ]
        },
        with_payload: true
      });
    });

    it('should return empty array on error', async () => {
      const embedding = createMockEmbedding();
      mockClient.search.mockRejectedValue(new Error('Search failed'));

      const results = await db.search(embedding);

      expect(results).toEqual([]);
    });
  });

  describe('upsert', () => {
    it('should upsert prompt record', async () => {
      const embedding = createMockEmbedding();
      const record = {
        prompt_text: 'Test prompt',
        contextualized_text: 'Context',
        domain: 'general',
        task_type: 'general',
        metrics: {
          success_rate: 0.9,
          avg_latency_ms: 100,
          token_efficiency: 0.8,
          observation_count: 5,
          last_updated: new Date().toISOString()
        },
        created_at: new Date().toISOString(),
        tags: ['test']
      };

      await db.upsert('test-id', embedding, record);

      expect(mockClient.upsert).toHaveBeenCalledWith('prompt_embeddings', {
        wait: true,
        points: [{
          id: 'test-id',
          vector: embedding,
          payload: record
        }]
      });
    });

    it('should throw on upsert error', async () => {
      mockClient.upsert.mockRejectedValue(new Error('Upsert failed'));

      await expect(
        db.upsert('test-id', createMockEmbedding(), {
          prompt_text: 'Test',
          contextualized_text: '',
          domain: 'general',
          task_type: 'general',
          metrics: { success_rate: 0, avg_latency_ms: 0, token_efficiency: 0, observation_count: 0, last_updated: '' },
          created_at: '',
          tags: []
        })
      ).rejects.toThrow('Upsert failed');
    });
  });

  describe('get', () => {
    it('should retrieve prompt by id', async () => {
      mockClient.retrieve.mockResolvedValue([{
        id: 'test-id',
        payload: {
          prompt_text: 'Test prompt',
          domain: 'general',
          metrics: { success_rate: 0.9 }
        }
      }]);

      const result = await db.get('test-id');

      expect(mockClient.retrieve).toHaveBeenCalledWith('prompt_embeddings', {
        ids: ['test-id'],
        with_payload: true,
        with_vector: false
      });
      expect(result).not.toBeNull();
      expect(result?.id).toBe('test-id');
      expect(result?.prompt_text).toBe('Test prompt');
    });

    it('should return null for non-existent id', async () => {
      mockClient.retrieve.mockResolvedValue([]);

      const result = await db.get('non-existent');

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockClient.retrieve.mockRejectedValue(new Error('Retrieve failed'));

      const result = await db.get('test-id');

      expect(result).toBeNull();
    });
  });

  describe('updateMetrics', () => {
    it('should update metrics for prompt', async () => {
      const metrics: PromptMetrics = {
        success_rate: 0.95,
        avg_latency_ms: 80,
        token_efficiency: 0.85,
        observation_count: 10,
        last_updated: new Date().toISOString()
      };

      await db.updateMetrics('test-id', metrics);

      expect(mockClient.setPayload).toHaveBeenCalledWith('prompt_embeddings', {
        wait: true,
        points: ['test-id'],
        payload: { metrics }
      });
    });

    it('should throw on update error', async () => {
      mockClient.setPayload.mockRejectedValue(new Error('Update failed'));

      await expect(
        db.updateMetrics('test-id', {
          success_rate: 0.9,
          avg_latency_ms: 100,
          token_efficiency: 0.8,
          observation_count: 1,
          last_updated: ''
        })
      ).rejects.toThrow('Update failed');
    });
  });

  describe('getStats', () => {
    it('should return collection statistics', async () => {
      mockClient.getCollection.mockResolvedValue({
        points_count: 100
      });

      const stats = await db.getStats();

      expect(stats.total).toBe(100);
    });

    it('should return zeros on error', async () => {
      mockClient.getCollection.mockRejectedValue(new Error('Stats failed'));

      const stats = await db.getStats();

      expect(stats.total).toBe(0);
      expect(stats.byDomain).toEqual({});
    });
  });

  describe('delete', () => {
    it('should delete prompt by id', async () => {
      await db.delete('test-id');

      expect(mockClient.delete).toHaveBeenCalledWith('prompt_embeddings', {
        wait: true,
        points: ['test-id']
      });
    });

    it('should throw on delete error', async () => {
      mockClient.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(db.delete('test-id')).rejects.toThrow('Delete failed');
    });
  });

  describe('scroll', () => {
    it('should scroll through prompts', async () => {
      mockClient.scroll.mockResolvedValue({
        points: [
          { id: '1', payload: { prompt_text: 'Prompt 1', domain: 'general' } },
          { id: '2', payload: { prompt_text: 'Prompt 2', domain: 'code' } }
        ],
        next_page_offset: null
      });

      const result = await db.scroll(10);

      expect(mockClient.scroll).toHaveBeenCalledWith('prompt_embeddings', {
        limit: 10,
        offset: undefined,
        with_payload: true,
        with_vector: false
      });
      expect(result.records).toHaveLength(2);
      expect(result.nextOffset).toBeUndefined();
    });

    it('should handle pagination', async () => {
      mockClient.scroll.mockResolvedValue({
        points: [
          { id: '3', payload: { prompt_text: 'Prompt 3' } }
        ],
        next_page_offset: { id: '4' }
      });

      const result = await db.scroll(1, '2');

      expect(mockClient.scroll).toHaveBeenCalledWith('prompt_embeddings', {
        limit: 1,
        offset: { id: '2' },
        with_payload: true,
        with_vector: false
      });
      expect(result.nextOffset).toBe('3');
    });

    it('should return empty on error', async () => {
      mockClient.scroll.mockRejectedValue(new Error('Scroll failed'));

      const result = await db.scroll();

      expect(result.records).toEqual([]);
    });
  });
});

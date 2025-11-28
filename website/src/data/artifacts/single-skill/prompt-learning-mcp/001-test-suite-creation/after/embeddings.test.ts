/**
 * Unit tests for EmbeddingService
 * Tests caching, contextual embeddings, batch processing, and similarity calculation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OpenAI from 'openai';
import { EmbeddingService, EMBEDDING_DIM } from '../../src/embeddings.js';

// Create a mock embedding of correct dimension
const createMockEmbedding = (seed: number = 0): number[] => {
  const embedding = new Array(EMBEDDING_DIM);
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    embedding[i] = Math.sin(i + seed) * 0.1;
  }
  return embedding;
};

// Mock OpenAI
vi.mock('openai', () => {
  const mockCreate = vi.fn();
  return {
    default: vi.fn().mockImplementation(() => ({
      embeddings: {
        create: mockCreate
      }
    })),
    __mockCreate: mockCreate
  };
});

describe('EmbeddingService', () => {
  let service: EmbeddingService;
  let mockOpenAI: OpenAI;
  let mockCreate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const mod = await import('openai');
    mockCreate = (mod as any).__mockCreate;
    mockCreate.mockReset();

    mockOpenAI = new OpenAI({ apiKey: 'test-key' });
    service = new EmbeddingService(mockOpenAI, null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('embed', () => {
    it('should generate embedding for text', async () => {
      const mockEmbedding = createMockEmbedding();
      mockCreate.mockResolvedValueOnce({
        data: [{ embedding: mockEmbedding }],
        usage: { total_tokens: 10 }
      });

      const result = await service.embed('Test text');

      expect(mockCreate).toHaveBeenCalledOnce();
      expect(result.embedding).toEqual(mockEmbedding);
      expect(result.tokens_used).toBe(10);
    });

    it('should return cached embedding on second call', async () => {
      const mockEmbedding = createMockEmbedding();
      mockCreate.mockResolvedValueOnce({
        data: [{ embedding: mockEmbedding }],
        usage: { total_tokens: 10 }
      });

      // First call - should hit API
      await service.embed('Test text');
      expect(mockCreate).toHaveBeenCalledOnce();

      // Second call - should use cache
      const result = await service.embed('Test text');
      expect(mockCreate).toHaveBeenCalledOnce(); // Still only one API call
      expect(result.embedding).toEqual(mockEmbedding);
      expect(result.tokens_used).toBe(0); // Cached, no tokens used
    });

    it('should bypass cache when useCache is false', async () => {
      const mockEmbedding1 = createMockEmbedding(1);
      const mockEmbedding2 = createMockEmbedding(2);

      mockCreate
        .mockResolvedValueOnce({
          data: [{ embedding: mockEmbedding1 }],
          usage: { total_tokens: 10 }
        })
        .mockResolvedValueOnce({
          data: [{ embedding: mockEmbedding2 }],
          usage: { total_tokens: 10 }
        });

      await service.embed('Test text', true);
      const result = await service.embed('Test text', false);

      expect(mockCreate).toHaveBeenCalledTimes(2);
      expect(result.tokens_used).toBe(10); // Fresh call
    });

    it('should use correct model', async () => {
      mockCreate.mockResolvedValueOnce({
        data: [{ embedding: createMockEmbedding() }],
        usage: { total_tokens: 10 }
      });

      await service.embed('Test text');

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'Test text'
      });
    });
  });

  describe('embedContextual', () => {
    it('should prepend domain and task context', async () => {
      mockCreate.mockResolvedValueOnce({
        data: [{ embedding: createMockEmbedding() }],
        usage: { total_tokens: 15 }
      });

      await service.embedContextual('Test prompt', 'code_review', 'optimization');

      expect(mockCreate).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'Domain: code_review\nTask: optimization\n\nTest prompt'
      });
    });

    it('should return correct embedding result', async () => {
      const mockEmbedding = createMockEmbedding();
      mockCreate.mockResolvedValueOnce({
        data: [{ embedding: mockEmbedding }],
        usage: { total_tokens: 15 }
      });

      const result = await service.embedContextual('Test prompt', 'general', 'storage');

      expect(result.embedding).toEqual(mockEmbedding);
      expect(result.tokens_used).toBe(15);
    });
  });

  describe('embedBatch', () => {
    it('should batch embed multiple texts', async () => {
      const mockEmbeddings = [createMockEmbedding(1), createMockEmbedding(2), createMockEmbedding(3)];
      mockCreate.mockResolvedValueOnce({
        data: mockEmbeddings.map(emb => ({ embedding: emb })),
        usage: { total_tokens: 30 }
      });

      const texts = ['Text 1', 'Text 2', 'Text 3'];
      const results = await service.embedBatch(texts);

      expect(mockCreate).toHaveBeenCalledOnce();
      expect(results).toHaveLength(3);
      expect(results[0].embedding).toEqual(mockEmbeddings[0]);
      expect(results[1].embedding).toEqual(mockEmbeddings[1]);
      expect(results[2].embedding).toEqual(mockEmbeddings[2]);
    });

    it('should use cached embeddings in batch', async () => {
      const mockEmbedding1 = createMockEmbedding(1);
      const mockEmbedding2 = createMockEmbedding(2);

      // First, cache one embedding
      mockCreate.mockResolvedValueOnce({
        data: [{ embedding: mockEmbedding1 }],
        usage: { total_tokens: 10 }
      });
      await service.embed('Text 1');

      // Now batch embed including the cached one
      mockCreate.mockResolvedValueOnce({
        data: [{ embedding: mockEmbedding2 }],
        usage: { total_tokens: 10 }
      });

      const results = await service.embedBatch(['Text 1', 'Text 2']);

      expect(mockCreate).toHaveBeenCalledTimes(2);
      // Second call should only have 'Text 2'
      expect(mockCreate).toHaveBeenLastCalledWith({
        model: 'text-embedding-3-small',
        input: ['Text 2']
      });

      expect(results[0].embedding).toEqual(mockEmbedding1);
      expect(results[0].tokens_used).toBe(0); // Cached
      expect(results[1].embedding).toEqual(mockEmbedding2);
    });

    it('should handle empty batch', async () => {
      const results = await service.embedBatch([]);
      expect(results).toHaveLength(0);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should handle all cached batch', async () => {
      const mockEmbedding = createMockEmbedding();
      mockCreate.mockResolvedValueOnce({
        data: [{ embedding: mockEmbedding }],
        usage: { total_tokens: 10 }
      });

      // Cache first
      await service.embed('Same text');

      // Reset mock to verify no new calls
      mockCreate.mockClear();

      const results = await service.embedBatch(['Same text', 'Same text']);
      expect(mockCreate).not.toHaveBeenCalled();
      expect(results[0].tokens_used).toBe(0);
      expect(results[1].tokens_used).toBe(0);
    });
  });

  describe('cosineSimilarity', () => {
    it('should return 1 for identical vectors', () => {
      const vec = [0.1, 0.2, 0.3, 0.4, 0.5];
      const similarity = service.cosineSimilarity(vec, vec);
      expect(similarity).toBeCloseTo(1, 10);
    });

    it('should return -1 for opposite vectors', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [-1, 0, 0];
      const similarity = service.cosineSimilarity(vec1, vec2);
      expect(similarity).toBeCloseTo(-1, 10);
    });

    it('should return 0 for orthogonal vectors', () => {
      const vec1 = [1, 0, 0];
      const vec2 = [0, 1, 0];
      const similarity = service.cosineSimilarity(vec1, vec2);
      expect(similarity).toBeCloseTo(0, 10);
    });

    it('should return value between -1 and 1', () => {
      const vec1 = [0.5, 0.3, 0.2, 0.8];
      const vec2 = [0.1, 0.9, 0.4, 0.2];
      const similarity = service.cosineSimilarity(vec1, vec2);
      expect(similarity).toBeGreaterThanOrEqual(-1);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it('should throw on dimension mismatch', () => {
      const vec1 = [0.1, 0.2, 0.3];
      const vec2 = [0.1, 0.2];
      expect(() => service.cosineSimilarity(vec1, vec2)).toThrow('Embedding dimensions must match');
    });

    it('should calculate correct similarity for known values', () => {
      // Known example: cos_sim([1,2,3], [4,5,6]) ≈ 0.9746
      const vec1 = [1, 2, 3];
      const vec2 = [4, 5, 6];
      const similarity = service.cosineSimilarity(vec1, vec2);
      expect(similarity).toBeCloseTo(0.9746, 3);
    });
  });

  describe('EMBEDDING_DIM', () => {
    it('should export correct dimension for text-embedding-3-small', () => {
      expect(EMBEDDING_DIM).toBe(1536);
    });
  });
});

/**
 * Unit tests for PromptOptimizer
 * Tests pattern-based improvements, convergence detection, and suggestion generation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OpenAI from 'openai';
import { PromptOptimizer } from '../../src/optimizer.js';
import type { PromptRecord } from '../../src/types.js';

// Mock OpenAI
vi.mock('openai', () => {
  const mockCreate = vi.fn();
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate
        }
      }
    })),
    __mockCreate: mockCreate
  };
});

describe('PromptOptimizer', () => {
  let optimizer: PromptOptimizer;
  let mockOpenAI: OpenAI;
  let mockCreate: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // Get the mock function
    const mod = await import('openai');
    mockCreate = (mod as any).__mockCreate;
    mockCreate.mockReset();

    mockOpenAI = new OpenAI({ apiKey: 'test-key' });
    optimizer = new PromptOptimizer(mockOpenAI);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('applyPatterns', () => {
    it('should apply add_structure pattern to short prompts without structure', () => {
      const prompt = 'Summarize this document';
      const { improved, applied } = optimizer.applyPatterns(prompt);

      expect(applied).toContain('add_structure');
      expect(improved).toContain('structured format');
    });

    it('should apply add_chain_of_thought to prompts without reasoning', () => {
      const prompt = 'Analyze the data';
      const { improved, applied } = optimizer.applyPatterns(prompt);

      expect(applied).toContain('add_chain_of_thought');
      expect(improved.toLowerCase()).toContain('step by step');
    });

    it('should apply add_constraints to short prompts without requirements', () => {
      const prompt = 'Write code';
      const { improved, applied } = optimizer.applyPatterns(prompt);

      expect(applied).toContain('add_constraints');
      expect(improved).toContain('Requirements');
    });

    it('should apply add_output_format to prompts without format spec', () => {
      // Use a prompt that:
      // - Has '1.' to skip add_structure (which would add "format" text)
      // - Is longer than 150 chars to skip add_constraints
      // - Has 'step by step' to skip add_chain_of_thought
      // - Does NOT have 'format' or 'respond with'
      const prompt = '1. First, analyze the data step by step. 2. Then identify patterns in the results. 3. Finally, draw conclusions from your analysis and provide actionable recommendations.';
      const { improved, applied } = optimizer.applyPatterns(prompt);

      expect(applied).toContain('add_output_format');
      expect(improved.toLowerCase()).toContain('format');
    });

    it('should NOT apply patterns that are already present', () => {
      const prompt = `Step 1. First, analyze the data step by step.
Requirements:
- Be specific
Format your response as JSON.`;

      const { applied } = optimizer.applyPatterns(prompt);

      // Should not apply most patterns since they're already present
      expect(applied).not.toContain('add_structure');
      expect(applied).not.toContain('add_chain_of_thought');
      expect(applied).not.toContain('add_output_format');
    });

    it('should apply multiple applicable patterns', () => {
      const prompt = 'Do the thing';
      const { applied } = optimizer.applyPatterns(prompt);

      // Should apply multiple patterns to this vague prompt
      expect(applied.length).toBeGreaterThan(1);
    });
  });

  describe('checkConvergence', () => {
    it('should return false when not enough scores', () => {
      const scores = [0.5, 0.6];
      expect(optimizer.checkConvergence(scores)).toBe(false);
    });

    it('should return true when scores plateau', () => {
      const scores = [0.5, 0.6, 0.75, 0.76, 0.76, 0.77];
      expect(optimizer.checkConvergence(scores)).toBe(true);
    });

    it('should return false when scores are still improving', () => {
      const scores = [0.5, 0.6, 0.7, 0.8, 0.9];
      expect(optimizer.checkConvergence(scores)).toBe(false);
    });

    it('should detect convergence in the last window', () => {
      // Even if early scores were improving, check only the last window
      const scores = [0.5, 0.6, 0.7, 0.85, 0.85, 0.86];
      expect(optimizer.checkConvergence(scores)).toBe(true);
    });
  });

  describe('getSuggestions', () => {
    it('should return suggestions for a vague prompt', () => {
      const prompt = 'Help me';
      const suggestions = optimizer.getSuggestions(prompt);

      expect(suggestions.length).toBeGreaterThan(0);

      // Each suggestion should have required fields
      for (const suggestion of suggestions) {
        expect(suggestion).toHaveProperty('type');
        expect(suggestion).toHaveProperty('description');
        expect(suggestion).toHaveProperty('example');
        expect(suggestion).toHaveProperty('expectedImprovement');
        expect(suggestion.expectedImprovement).toBeGreaterThan(0);
      }
    });

    it('should return fewer suggestions for well-structured prompts', () => {
      const vaguePrompt = 'Do stuff';
      const structuredPrompt = `Step 1. First, analyze the data step by step.
Requirements:
- Be specific and precise
Format: JSON response with headers.`;

      const vagueSuggestions = optimizer.getSuggestions(vaguePrompt);
      const structuredSuggestions = optimizer.getSuggestions(structuredPrompt);

      expect(vagueSuggestions.length).toBeGreaterThan(structuredSuggestions.length);
    });

    it('should provide example text for each suggestion', () => {
      const prompt = 'Analyze this';
      const suggestions = optimizer.getSuggestions(prompt);

      for (const suggestion of suggestions) {
        expect(suggestion.example.length).toBeGreaterThan(0);
      }
    });
  });

  describe('scorePrompt (with mock)', () => {
    it('should calculate weighted score from LLM evaluation', async () => {
      // Mock a successful evaluation response
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              clarity: 8,
              specificity: 7,
              completeness: 6,
              structure: 8,
              effectiveness: 7,
              reasoning: 'Good prompt with clear structure'
            })
          }
        }]
      });

      const score = await optimizer.scorePrompt('Test prompt', 'general');

      // Verify the API was called
      expect(mockCreate).toHaveBeenCalledOnce();

      // Verify the score is calculated correctly
      // (8*0.25 + 7*0.25 + 6*0.20 + 8*0.15 + 7*0.15) / 10 = 0.72
      expect(score).toBeCloseTo(0.72, 2);
    });

    it('should store evaluation for later retrieval', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: JSON.stringify({
              clarity: 9,
              specificity: 8,
              completeness: 7,
              structure: 8,
              effectiveness: 8,
              reasoning: 'Excellent clarity'
            })
          }
        }]
      });

      await optimizer.scorePrompt('Test prompt', 'general');
      const evaluation = optimizer.getLastEvaluation();

      expect(evaluation).not.toBeNull();
      expect(evaluation?.reasoning).toBe('Excellent clarity');
      expect(evaluation?.scores.clarity).toBe(9);
    });

    it('should fall back to heuristics if LLM fails', async () => {
      mockCreate.mockRejectedValueOnce(new Error('API Error'));

      // Should not throw, should return heuristic score
      const score = await optimizer.scorePrompt('Test step by step prompt', 'general');
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    it('should handle malformed JSON gracefully', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'This is not JSON'
          }
        }]
      });

      const score = await optimizer.scorePrompt('Test prompt', 'general');

      // Should fall back to heuristic
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });

  describe('generateCandidate (with mock)', () => {
    it('should generate improved prompt candidate', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'An improved, more specific prompt with clear requirements.'
          }
        }]
      });

      const candidate = await optimizer.generateCandidate('Original prompt', 'general');

      expect(candidate).toBe('An improved, more specific prompt with clear requirements.');
      expect(mockCreate).toHaveBeenCalled();
    });

    it('should return original prompt if generation fails', async () => {
      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: null
          }
        }]
      });

      const candidate = await optimizer.generateCandidate('Original prompt', 'general');
      expect(candidate).toBe('Original prompt');
    });
  });

  describe('learnFromSimilar (with mock)', () => {
    it('should synthesize improvements from similar prompts', async () => {
      const similarPrompts: PromptRecord[] = [
        {
          id: '1',
          prompt_text: 'A high-performing prompt with structure',
          contextualized_text: '',
          domain: 'general',
          task_type: 'general',
          metrics: { success_rate: 0.9, avg_latency_ms: 100, token_efficiency: 0.8, observation_count: 10, last_updated: '' },
          created_at: '',
          tags: []
        },
        {
          id: '2',
          prompt_text: 'Another excellent prompt',
          contextualized_text: '',
          domain: 'general',
          task_type: 'general',
          metrics: { success_rate: 0.85, avg_latency_ms: 100, token_efficiency: 0.8, observation_count: 10, last_updated: '' },
          created_at: '',
          tags: []
        }
      ];

      mockCreate.mockResolvedValueOnce({
        choices: [{
          message: {
            content: 'Improved prompt based on learning from similar high performers'
          }
        }]
      });

      const result = await optimizer.learnFromSimilar('Original prompt', similarPrompts);

      expect(result.improved).toBe('Improved prompt based on learning from similar high performers');
      expect(result.insights).toContain('Learned from');
    });
  });

  describe('optimize (full flow with mock)', () => {
    it('should run full optimization pipeline', async () => {
      // Mock evaluation calls (original, after patterns, after iteration 1)
      mockCreate
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                clarity: 5, specificity: 4, completeness: 4, structure: 3, effectiveness: 4,
                reasoning: 'Vague prompt'
              })
            }
          }]
        })
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                clarity: 7, specificity: 6, completeness: 6, structure: 6, effectiveness: 6,
                reasoning: 'Better with patterns'
              })
            }
          }]
        })
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: 'An optimized prompt candidate'
            }
          }]
        })
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                clarity: 8, specificity: 8, completeness: 7, structure: 8, effectiveness: 8,
                reasoning: 'Excellent prompt'
              })
            }
          }]
        })
        // Add more mocks for convergence (same scores)
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: 'Another candidate'
            }
          }]
        })
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                clarity: 8, specificity: 8, completeness: 7, structure: 8, effectiveness: 8,
                reasoning: 'Same quality'
              })
            }
          }]
        })
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: 'Third candidate'
            }
          }]
        })
        .mockResolvedValueOnce({
          choices: [{
            message: {
              content: JSON.stringify({
                clarity: 8, specificity: 8, completeness: 7, structure: 8, effectiveness: 8,
                reasoning: 'Still same'
              })
            }
          }]
        });

      const result = await optimizer.optimize('Do stuff', [], 'general');

      expect(result.original_prompt).toBe('Do stuff');
      expect(result.optimized_prompt).not.toBe('Do stuff');
      expect(result.improvements_made.length).toBeGreaterThan(0);
      expect(result.estimated_improvement).toBeGreaterThan(0);
    });
  });
});

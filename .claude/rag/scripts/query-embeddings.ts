/**
 * RAG Query Interface for Claude Skills
 *
 * Provides semantic search over skill embeddings with relevance scoring,
 * context expansion, and result formatting.
 *
 * Usage:
 *   npx ts-node query-embeddings.ts "how to create Discord bot"
 *   npx ts-node query-embeddings.ts --interactive
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// ============================================================================
// Types
// ============================================================================

interface SkillChunk {
  id: string;
  skillId: string;
  sectionType: string;
  content: string;
  tokenCount: number;
  embedding: number[];
}

interface EmbeddingStore {
  metadata: {
    generatedAt: string;
    skillCount: number;
    chunkCount: number;
    embeddingModel: string;
    dimensions: number;
  };
  skills: Record<string, { name: string; description?: string }>;
  chunks: SkillChunk[];
}

interface SearchResult {
  skillId: string;
  skillName: string;
  sectionType: string;
  content: string;
  similarity: number;
  rank: number;
}

interface QueryConfig {
  topK: number;
  minSimilarity: number;
  expandContext: boolean;
  groupBySkill: boolean;
  includeMetadata: boolean;
}

// ============================================================================
// Vector Operations
// ============================================================================

/**
 * Compute cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Normalize a vector to unit length
 */
function normalize(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return magnitude === 0 ? vector : vector.map((v) => v / magnitude);
}

// ============================================================================
// Embedding Generation (for queries)
// ============================================================================

/**
 * Generate embedding for query text
 * Uses OpenAI API or mock embeddings for testing
 */
async function generateQueryEmbedding(
  query: string,
  config: { provider: string; model: string; dimensions: number }
): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || config.provider === 'mock') {
    // Mock embedding for testing
    console.log('[MOCK] Generating mock embedding for query');
    return generateMockEmbedding(query, config.dimensions);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        input: query,
        dimensions: config.dimensions,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { data: [{ embedding: number[] }] };
    return data.data[0].embedding;
  } catch (error) {
    console.error('Error generating query embedding:', error);
    throw error;
  }
}

/**
 * Generate deterministic mock embedding for testing
 */
function generateMockEmbedding(text: string, dimensions: number): number[] {
  const embedding: number[] = [];
  let hash = 0;

  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash = hash & hash;
  }

  const seed = Math.abs(hash);
  for (let i = 0; i < dimensions; i++) {
    const x = Math.sin(seed * (i + 1)) * 10000;
    embedding.push(x - Math.floor(x));
  }

  return normalize(embedding);
}

// ============================================================================
// Search Engine
// ============================================================================

class SkillSearchEngine {
  private store: EmbeddingStore | null = null;
  private storePath: string;

  constructor(storePath?: string) {
    this.storePath =
      storePath ||
      path.join(
        process.cwd(),
        '..',
        '..',
        'data',
        'embeddings',
        'skill-embeddings.json'
      );
  }

  /**
   * Load embedding store from disk
   */
  async load(): Promise<void> {
    if (!fs.existsSync(this.storePath)) {
      throw new Error(`Embedding store not found at ${this.storePath}`);
    }

    const content = fs.readFileSync(this.storePath, 'utf-8');
    this.store = JSON.parse(content) as EmbeddingStore;

    console.log(`Loaded ${this.store.metadata.skillCount} skills with ${this.store.metadata.chunkCount} chunks`);
  }

  /**
   * Search for relevant skill chunks
   */
  async search(query: string, config: Partial<QueryConfig> = {}): Promise<SearchResult[]> {
    if (!this.store) {
      throw new Error('Store not loaded. Call load() first.');
    }

    const fullConfig: QueryConfig = {
      topK: config.topK ?? 5,
      minSimilarity: config.minSimilarity ?? 0.3,
      expandContext: config.expandContext ?? true,
      groupBySkill: config.groupBySkill ?? false,
      includeMetadata: config.includeMetadata ?? true,
    };

    // Generate query embedding
    const embeddingConfig = {
      provider: 'openai',
      model: this.store.metadata.embeddingModel,
      dimensions: this.store.metadata.dimensions,
    };
    const queryEmbedding = await generateQueryEmbedding(query, embeddingConfig);

    // Calculate similarity for all chunks
    const results: SearchResult[] = [];

    for (const chunk of this.store.chunks) {
      if (!chunk.embedding || chunk.embedding.length === 0) {
        continue;
      }

      const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);

      if (similarity >= fullConfig.minSimilarity) {
        const skillInfo = this.store.skills[chunk.skillId];
        results.push({
          skillId: chunk.skillId,
          skillName: skillInfo?.name || chunk.skillId,
          sectionType: chunk.sectionType,
          content: chunk.content,
          similarity,
          rank: 0,
        });
      }
    }

    // Sort by similarity
    results.sort((a, b) => b.similarity - a.similarity);

    // Assign ranks
    results.forEach((r, i) => {
      r.rank = i + 1;
    });

    // Group by skill if requested
    if (fullConfig.groupBySkill) {
      return this.groupBySkill(results, fullConfig.topK);
    }

    return results.slice(0, fullConfig.topK);
  }

  /**
   * Group results by skill, taking top result per skill
   */
  private groupBySkill(results: SearchResult[], topK: number): SearchResult[] {
    const grouped = new Map<string, SearchResult>();

    for (const result of results) {
      if (!grouped.has(result.skillId)) {
        grouped.set(result.skillId, result);
        if (grouped.size >= topK) break;
      }
    }

    return Array.from(grouped.values());
  }

  /**
   * Get skill details by ID
   */
  getSkillDetails(skillId: string): Record<string, unknown> | null {
    if (!this.store) return null;
    return this.store.skills[skillId] as Record<string, unknown> || null;
  }

  /**
   * Get all chunk content for a skill
   */
  getSkillContent(skillId: string): string | null {
    if (!this.store) return null;

    const skillChunks = this.store.chunks.filter((c) => c.skillId === skillId);
    if (skillChunks.length === 0) return null;

    return skillChunks.map((c) => c.content).join('\n\n');
  }

  /**
   * List all available skills
   */
  listSkills(): { id: string; name: string }[] {
    if (!this.store) return [];
    return Object.entries(this.store.skills).map(([id, info]) => ({ id, name: info.name }));
  }

  /**
   * Get store statistics
   */
  getStats(): { totalSkills: number; totalChunks: number } | null {
    if (!this.store) return null;
    return {
      totalSkills: this.store.metadata.skillCount,
      totalChunks: this.store.metadata.chunkCount,
    };
  }
}

// ============================================================================
// Result Formatting
// ============================================================================

function formatResults(results: SearchResult[], verbose: boolean = false): string {
  if (results.length === 0) {
    return 'No matching skills found.';
  }

  const lines: string[] = [
    '═══════════════════════════════════════════════════════════════',
    '                    SKILL SEARCH RESULTS',
    '═══════════════════════════════════════════════════════════════',
    '',
  ];

  for (const result of results) {
    const similarityPct = (result.similarity * 100).toFixed(1);
    lines.push(
      `[${result.rank}] ${result.skillName}`,
      `    Section: ${result.sectionType} | Similarity: ${similarityPct}%`,
      ''
    );

    if (verbose) {
      const preview = result.content.substring(0, 300).replace(/\n/g, '\n    ');
      lines.push(`    ${preview}${result.content.length > 300 ? '...' : ''}`, '');
    }

    lines.push('───────────────────────────────────────────────────────────────');
  }

  return lines.join('\n');
}

function formatAsContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return '';
  }

  const contextBlocks: string[] = [];

  for (const result of results) {
    contextBlocks.push(
      `<skill name="${result.skillName}" section="${result.sectionType}" relevance="${(result.similarity * 100).toFixed(0)}%">`,
      result.content,
      '</skill>'
    );
  }

  return contextBlocks.join('\n\n');
}

// ============================================================================
// Interactive Mode
// ============================================================================

async function runInteractiveMode(engine: SkillSearchEngine): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n🔍 Claude Skills Search Engine');
  console.log('Type your query and press Enter. Type "exit" or "quit" to leave.\n');

  const askQuestion = (): void => {
    rl.question('Query> ', async (input) => {
      const query = input.trim();

      if (!query || query === 'exit' || query === 'quit') {
        console.log('Goodbye!');
        rl.close();
        return;
      }

      if (query === 'list') {
        const skills = engine.listSkills();
        console.log(`\nAvailable Skills (${skills.length}):`);
        skills.forEach((s) => console.log(`  - ${s.name}`));
        console.log('');
        askQuestion();
        return;
      }

      if (query === 'stats') {
        const stats = engine.getStats();
        if (stats) {
          console.log('\nStore Statistics:');
          console.log(`  Skills: ${stats.totalSkills}`);
          console.log(`  Chunks: ${stats.totalChunks}\n`);
        }
        askQuestion();
        return;
      }

      try {
        const results = await engine.search(query, { topK: 5 });
        console.log(formatResults(results, true));
      } catch (error) {
        console.error('Search error:', error);
      }

      askQuestion();
    });
  };

  askQuestion();
}

// ============================================================================
// CLI
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  const storePath = args.find((a) => a.startsWith('--store='))?.split('=')[1];
  const interactive = args.includes('--interactive') || args.includes('-i');
  const asContext = args.includes('--context');
  const topK = parseInt(args.find((a) => a.startsWith('--top='))?.split('=')[1] ?? '5', 10);
  const query = args.find((a) => !a.startsWith('-'));

  const engine = new SkillSearchEngine(storePath);

  try {
    await engine.load();
  } catch (error) {
    console.error('Failed to load embedding store:', error);
    console.log('\nTo generate embeddings, run:');
    console.log('  npx ts-node generate-embeddings.ts --skills-dir <path> --output <path>\n');
    process.exit(1);
  }

  if (interactive) {
    await runInteractiveMode(engine);
    return;
  }

  if (!query) {
    console.log('Usage:');
    console.log('  npx ts-node query-embeddings.ts "your search query"');
    console.log('  npx ts-node query-embeddings.ts --interactive');
    console.log('\nOptions:');
    console.log('  --store=<path>   Path to embedding store');
    console.log('  --top=<n>        Number of results (default: 5)');
    console.log('  --context        Output as XML context blocks');
    console.log('  -i, --interactive  Interactive mode');
    return;
  }

  const results = await engine.search(query, { topK });

  if (asContext) {
    console.log(formatAsContext(results));
  } else {
    console.log(formatResults(results, true));
  }
}

// Run CLI
main().catch(console.error);

// Export for library use
export {
  SkillSearchEngine,
  SearchResult,
  QueryConfig,
  formatResults,
  formatAsContext,
  cosineSimilarity,
};

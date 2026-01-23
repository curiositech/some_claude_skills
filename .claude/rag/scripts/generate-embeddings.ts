/**
 * RAG Embeddings Generator for Claude Skills
 *
 * Generates vector embeddings from SKILL.md files for semantic search.
 * Supports semantic chunking at section breaks and metadata extraction.
 *
 * Usage:
 *   npx ts-node generate-embeddings.ts [--skills-dir <path>] [--output <path>]
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// ============================================================================
// Types
// ============================================================================

interface SkillFrontmatter {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  activationTriggers: string[];
  notFor: string[];
  allowedTools: string[];
  mcpIntegrations: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
}

interface SkillChunk {
  id: string;
  skillId: string;
  sectionType:
    | 'frontmatter'
    | 'overview'
    | 'when-to-use'
    | 'anti-patterns'
    | 'references'
    | 'code-example'
    | 'mcp-integration'
    | 'workflow';
  content: string;
  tokenCount: number;
  embedding?: number[];
}

interface EmbeddingConfig {
  provider: 'openai' | 'local';
  model: string;
  dimensions: number;
  maxTokens: number;
  batchSize: number;
}

interface VectorStoreConfig {
  path: string;
  format: 'sqlite-vec' | 'json';
  dimensions: number;
  distanceMetric: 'cosine' | 'euclidean' | 'dot';
}

interface GeneratorConfig {
  skillsDir: string;
  outputPath: string;
  embedding: EmbeddingConfig;
  vectorStore: VectorStoreConfig;
  dryRun: boolean;
}

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_CONFIG: GeneratorConfig = {
  skillsDir: '/Users/erichowens/coding/some_claude_skills/.claude/skills',
  outputPath: '/Users/erichowens/coding/some_claude_skills/.claude/embeddings/skills.json',
  embedding: {
    provider: 'openai',
    model: 'text-embedding-3-small',
    dimensions: 1536,
    maxTokens: 8191,
    batchSize: 100,
  },
  vectorStore: {
    path: '.claude/embeddings/skills.db',
    format: 'json', // Use JSON for portability
    dimensions: 1536,
    distanceMetric: 'cosine',
  },
  dryRun: false,
};

// ============================================================================
// Utilities
// ============================================================================

/**
 * Simple token counter (approximation based on whitespace and punctuation)
 */
function countTokens(text: string): number {
  // Rough approximation: ~4 chars per token for English
  return Math.ceil(text.length / 4);
}

/**
 * Generate a deterministic chunk ID
 */
function generateChunkId(skillId: string, sectionType: string, index: number): string {
  const hash = crypto
    .createHash('sha256')
    .update(`${skillId}:${sectionType}:${index}`)
    .digest('hex')
    .substring(0, 12);
  return `chunk_${hash}`;
}

/**
 * Extract keywords from text for metadata
 */
function extractKeywords(text: string): string[] {
  // Common stop words to filter out
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'from',
    'as',
    'is',
    'was',
    'are',
    'were',
    'been',
    'be',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'must',
    'can',
    'this',
    'that',
    'these',
    'those',
    'it',
    'its',
    'you',
    'your',
    'we',
    'our',
    'they',
    'their',
    'use',
    'using',
    'used',
  ]);

  // Extract words, filter stop words, deduplicate
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  // Count frequency and return top keywords
  const freq = new Map<string, number>();
  words.forEach((word) => freq.set(word, (freq.get(word) || 0) + 1));

  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

// ============================================================================
// Frontmatter Parser
// ============================================================================

/**
 * Parse YAML frontmatter from SKILL.md content
 */
function parseFrontmatter(content: string): Partial<SkillFrontmatter> {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return {};
  }

  const yaml = frontmatterMatch[1];
  const result: Partial<SkillFrontmatter> = {};

  // Simple YAML parser for our specific format
  const lines = yaml.split('\n');
  let currentKey = '';
  let currentArray: string[] = [];
  let inArray = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('- ') && inArray) {
      currentArray.push(trimmed.substring(2).replace(/^["']|["']$/g, ''));
      continue;
    }

    if (inArray && currentKey) {
      (result as Record<string, unknown>)[currentKey] = currentArray;
      inArray = false;
      currentArray = [];
    }

    const keyMatch = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (keyMatch) {
      const [, key, value] = keyMatch;
      currentKey = key;

      if (value === '' || value === '|' || value === '>') {
        inArray = value === '';
        continue;
      }

      if (value.startsWith('[') && value.endsWith(']')) {
        // Inline array
        const items = value
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, ''));
        (result as Record<string, unknown>)[key] = items;
      } else {
        (result as Record<string, unknown>)[key] = value.replace(/^["']|["']$/g, '');
      }
    }
  }

  if (inArray && currentKey) {
    (result as Record<string, unknown>)[currentKey] = currentArray;
  }

  return result;
}

// ============================================================================
// Semantic Chunking
// ============================================================================

/**
 * Detect section type from header text
 */
function detectSectionType(
  header: string
): SkillChunk['sectionType'] {
  const lower = header.toLowerCase();

  if (lower.includes('when to use') || lower.includes('use this')) {
    return 'when-to-use';
  }
  if (lower.includes('not for') || lower.includes("don't use") || lower.includes('anti-pattern')) {
    return 'anti-patterns';
  }
  if (lower.includes('reference') || lower.includes('resource')) {
    return 'references';
  }
  if (lower.includes('example') || lower.includes('code')) {
    return 'code-example';
  }
  if (lower.includes('mcp') || lower.includes('integration')) {
    return 'mcp-integration';
  }
  if (lower.includes('workflow') || lower.includes('process') || lower.includes('step')) {
    return 'workflow';
  }

  return 'overview';
}

/**
 * Split content into semantic chunks at section boundaries
 */
function semanticChunk(
  skillId: string,
  content: string,
  maxTokens: number
): SkillChunk[] {
  const chunks: SkillChunk[] = [];

  // Extract frontmatter as first chunk
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatterContent = frontmatterMatch[0];
    chunks.push({
      id: generateChunkId(skillId, 'frontmatter', 0),
      skillId,
      sectionType: 'frontmatter',
      content: frontmatterContent,
      tokenCount: countTokens(frontmatterContent),
    });
    content = content.substring(frontmatterMatch[0].length).trim();
  }

  // Split by headers (## or ###)
  const sections = content.split(/(?=^#{2,3}\s)/m);
  let chunkIndex = 1;

  for (const section of sections) {
    if (!section.trim()) continue;

    // Extract header for section type detection
    const headerMatch = section.match(/^#{2,3}\s+(.+?)$/m);
    const header = headerMatch ? headerMatch[1] : '';
    const sectionType = detectSectionType(header);

    // Check if section needs to be split further
    const tokens = countTokens(section);

    if (tokens <= maxTokens) {
      chunks.push({
        id: generateChunkId(skillId, sectionType, chunkIndex++),
        skillId,
        sectionType,
        content: section.trim(),
        tokenCount: tokens,
      });
    } else {
      // Split large sections by paragraphs
      const paragraphs = section.split(/\n\n+/);
      let currentChunk = '';
      let currentTokens = 0;

      for (const para of paragraphs) {
        const paraTokens = countTokens(para);

        if (currentTokens + paraTokens > maxTokens && currentChunk) {
          chunks.push({
            id: generateChunkId(skillId, sectionType, chunkIndex++),
            skillId,
            sectionType,
            content: currentChunk.trim(),
            tokenCount: currentTokens,
          });
          currentChunk = para;
          currentTokens = paraTokens;
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + para;
          currentTokens += paraTokens;
        }
      }

      if (currentChunk) {
        chunks.push({
          id: generateChunkId(skillId, sectionType, chunkIndex++),
          skillId,
          sectionType,
          content: currentChunk.trim(),
          tokenCount: currentTokens,
        });
      }
    }
  }

  return chunks;
}

// ============================================================================
// Embedding Generation
// ============================================================================

/**
 * Generate embeddings using OpenAI API
 */
async function generateOpenAIEmbeddings(
  texts: string[],
  config: EmbeddingConfig
): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable required');
  }

  const results: number[][] = [];

  // Process in batches
  for (let i = 0; i < texts.length; i += config.batchSize) {
    const batch = texts.slice(i, i + config.batchSize);

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.model,
        input: batch,
        dimensions: config.dimensions,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = (await response.json()) as { data: Array<{ embedding: number[] }> };
    const embeddings = data.data.map((item) => item.embedding);
    results.push(...embeddings);

    // Rate limiting: small delay between batches
    if (i + config.batchSize < texts.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Generate mock embeddings for dry run / local testing
 */
function generateMockEmbeddings(texts: string[], dimensions: number): number[][] {
  return texts.map((text) => {
    // Create deterministic pseudo-random embedding from text hash
    const hash = crypto.createHash('sha256').update(text).digest();
    const embedding: number[] = [];

    for (let i = 0; i < dimensions; i++) {
      // Use hash bytes to generate consistent values
      const byte = hash[i % hash.length];
      embedding.push((byte / 255) * 2 - 1); // Normalize to [-1, 1]
    }

    // Normalize the vector
    const magnitude = Math.sqrt(embedding.reduce((sum, x) => sum + x * x, 0));
    return embedding.map((x) => x / magnitude);
  });
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Find all skill directories
 */
function findSkillDirectories(skillsDir: string): string[] {
  if (!fs.existsSync(skillsDir)) {
    return [];
  }

  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

/**
 * Process a single skill and return chunks
 */
function processSkill(skillName: string, skillsDir: string, maxTokens: number): SkillChunk[] {
  const skillMdPath = path.join(skillsDir, skillName, 'SKILL.md');

  if (!fs.existsSync(skillMdPath)) {
    console.warn(`  Warning: No SKILL.md found for ${skillName}`);
    return [];
  }

  const content = fs.readFileSync(skillMdPath, 'utf-8');
  return semanticChunk(skillName, content, maxTokens);
}

/**
 * Main generator function
 */
async function generateEmbeddings(config: GeneratorConfig): Promise<void> {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('            RAG EMBEDDINGS GENERATOR FOR CLAUDE SKILLS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`Skills Directory: ${config.skillsDir}`);
  console.log(`Output Path: ${config.outputPath}`);
  console.log(`Embedding Model: ${config.embedding.model}`);
  console.log(`Dimensions: ${config.embedding.dimensions}`);
  console.log(`Dry Run: ${config.dryRun}`);
  console.log('');

  // Find all skills
  const skillNames = findSkillDirectories(config.skillsDir);
  console.log(`Found ${skillNames.length} skills\n`);

  if (skillNames.length === 0) {
    console.error('No skills found. Check the skills directory path.');
    process.exit(1);
  }

  // Process all skills into chunks
  const allChunks: SkillChunk[] = [];
  const skillMetadata: Map<string, Partial<SkillFrontmatter>> = new Map();

  console.log('Processing skills...');
  for (const skillName of skillNames) {
    const skillMdPath = path.join(config.skillsDir, skillName, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) continue;

    const content = fs.readFileSync(skillMdPath, 'utf-8');
    const frontmatter = parseFrontmatter(content);
    skillMetadata.set(skillName, frontmatter);

    const chunks = processSkill(skillName, config.skillsDir, config.embedding.maxTokens);
    allChunks.push(...chunks);

    console.log(`  ✓ ${skillName}: ${chunks.length} chunks`);
  }

  console.log(`\nTotal chunks: ${allChunks.length}`);
  console.log(`Total tokens: ~${allChunks.reduce((sum, c) => sum + c.tokenCount, 0)}`);

  // Generate embeddings
  console.log('\nGenerating embeddings...');
  const texts = allChunks.map((chunk) => chunk.content);

  let embeddings: number[][];
  if (config.dryRun) {
    console.log('  (Dry run - using mock embeddings)');
    embeddings = generateMockEmbeddings(texts, config.embedding.dimensions);
  } else {
    try {
      embeddings = await generateOpenAIEmbeddings(texts, config.embedding);
    } catch (error) {
      console.warn(`  Warning: OpenAI API call failed, using mock embeddings`);
      console.warn(`  Error: ${error}`);
      embeddings = generateMockEmbeddings(texts, config.embedding.dimensions);
    }
  }

  // Attach embeddings to chunks
  allChunks.forEach((chunk, i) => {
    chunk.embedding = embeddings[i];
  });

  // Build output structure
  const output = {
    metadata: {
      generatedAt: new Date().toISOString(),
      skillCount: skillNames.length,
      chunkCount: allChunks.length,
      embeddingModel: config.embedding.model,
      dimensions: config.embedding.dimensions,
    },
    skills: Object.fromEntries(skillMetadata),
    chunks: allChunks,
  };

  // Write output
  const outputDir = path.dirname(config.outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(config.outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✓ Embeddings saved to: ${config.outputPath}`);

  // Summary
  console.log('\n─────────────────────────────────────────────────────────────────');
  console.log('                          SUMMARY');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log(`Skills processed:     ${skillNames.length}`);
  console.log(`Chunks generated:     ${allChunks.length}`);
  console.log(`Embedding dimensions: ${config.embedding.dimensions}`);
  console.log(`Output file size:     ${(fs.statSync(config.outputPath).size / 1024 / 1024).toFixed(2)} MB`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

// ============================================================================
// CLI
// ============================================================================

function parseArgs(args: string[]): Partial<GeneratorConfig> {
  const config: Partial<GeneratorConfig> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--skills-dir' || arg === '-s') {
      config.skillsDir = args[++i];
    } else if (arg === '--output' || arg === '-o') {
      config.outputPath = args[++i];
    } else if (arg === '--dry-run' || arg === '-d') {
      config.dryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Usage: generate-embeddings.ts [options]

Options:
  --skills-dir, -s <path>   Path to skills directory
  --output, -o <path>       Output path for embeddings JSON
  --dry-run, -d             Generate mock embeddings (no API calls)
  --help, -h                Show this help

Environment Variables:
  OPENAI_API_KEY            Required for real embeddings generation
`);
      process.exit(0);
    }
  }

  return config;
}

// Main entry point
if (typeof require !== 'undefined' && require.main === module) {
  const cliConfig = parseArgs(process.argv.slice(2));
  const config = { ...DEFAULT_CONFIG, ...cliConfig };

  generateEmbeddings(config).catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}

// Export for programmatic use
export {
  generateEmbeddings,
  parseFrontmatter,
  semanticChunk,
  extractKeywords,
  GeneratorConfig,
  SkillChunk,
  SkillFrontmatter,
};

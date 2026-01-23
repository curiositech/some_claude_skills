import * as fs from 'fs';

interface SkillChunk {
  id: string;
  skillId: string;
  sectionType: string;
  content: string;
  tokenCount: number;
  embedding: number[];
}

interface EmbeddingStore {
  metadata: { generatedAt: string; skillCount: number; chunkCount: number; embeddingModel: string; dimensions: number };
  skills: Record<string, { name: string; description?: string }>;
  chunks: SkillChunk[];
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dotProduct / denom;
}

async function main() {
  const store: EmbeddingStore = JSON.parse(fs.readFileSync('/Users/erichowens/coding/some_claude_skills/.claude/data/embeddings/skill-embeddings.json', 'utf-8'));
  console.log('Store loaded:', store.metadata.chunkCount, 'chunks');

  // Generate query embedding using OpenAI
  const query = "Discord bot developer Telegram Slack automation rate limiting state machines";
  const apiKey = process.env.OPENAI_API_KEY;
  console.log('API Key present:', !!apiKey);

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'text-embedding-3-small', input: query, dimensions: 1536 }),
  });

  if (!response.ok) {
    console.error('API error:', response.status, await response.text());
    return;
  }

  const data = (await response.json()) as { data: [{ embedding: number[] }] };
  const queryEmb = data.data[0].embedding;
  console.log('Query embedding length:', queryEmb.length);

  // Calculate similarities
  const scores: { skillId: string; similarity: number; section: string }[] = [];
  for (const chunk of store.chunks) {
    if (chunk.embedding?.length === 1536) {
      const sim = cosineSimilarity(queryEmb, chunk.embedding);
      scores.push({ skillId: chunk.skillId, similarity: sim, section: chunk.sectionType });
    }
  }

  scores.sort((a, b) => b.similarity - a.similarity);
  console.log('\nTop 10 matches:');
  scores.slice(0, 10).forEach((s, i) => console.log(`${i+1}. ${s.skillId} (${s.section}): ${(s.similarity * 100).toFixed(1)}%`));

  console.log('\nMin/Max similarity:', Math.min(...scores.map(s => s.similarity)).toFixed(3), '/', Math.max(...scores.map(s => s.similarity)).toFixed(3));
}

main();

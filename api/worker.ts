/**
 * DAG Execution API — Cloudflare Worker
 *
 * Provides a rate-limited REST API for executing simple DAG workflows.
 * - Model: claude-haiku-4-5 only (cost control)
 * - Rate limit: 5 executions per IP per day (stored in KV)
 * - CORS: allows requests from someclaudeskills.com
 *
 * Endpoints:
 *   POST /api/dag/execute   — submit a DAG for sequential execution
 *   GET  /api/dag/status/:jobId — poll job status
 *   GET  /api/dag/health    — health check
 *
 * Deploy:
 *   1. Add your Anthropic API key as a Worker secret:
 *      npx wrangler secret put ANTHROPIC_API_KEY
 *   2. Create a KV namespace and update wrangler.toml:
 *      npx wrangler kv:namespace create "RATE_LIMIT_KV"
 *   3. Deploy:
 *      npx wrangler deploy
 */

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

interface Env {
  ANTHROPIC_API_KEY: string;
  RATE_LIMIT_KV: KVNamespace;
  ALLOWED_ORIGIN?: string;
}

interface SimpleNode {
  id: string;
  name?: string;
  description?: string;
  skillId?: string;
  dependencies: string[];
  model?: 'haiku' | 'sonnet' | 'opus';
}

interface SimpleDAG {
  id?: string;
  name?: string;
  nodes: SimpleNode[];
}

interface NodeResult {
  nodeId: string;
  name?: string;
  status: 'completed' | 'failed' | 'skipped';
  output?: string;
  error?: string;
  durationMs: number;
  inputTokens?: number;
  outputTokens?: number;
}

interface JobRecord {
  id: string;
  dagName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  results?: NodeResult[];
  error?: string;
  totalInputTokens?: number;
  totalOutputTokens?: number;
}

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------

const RATE_LIMIT_PER_DAY = 5;
const ALLOWED_MODEL = 'claude-haiku-4-5';
const MAX_NODES = 8;
const MAX_PROMPT_LENGTH = 2000;

// --------------------------------------------------------------------------
// CORS helpers
// --------------------------------------------------------------------------

function corsHeaders(allowedOrigin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  });
}

// --------------------------------------------------------------------------
// Rate limiting
// --------------------------------------------------------------------------

async function checkRateLimit(
  ip: string,
  kv: KVNamespace
): Promise<{ allowed: boolean; remaining: number }> {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const key = `rl:${ip}:${today}`;
  const raw = await kv.get(key);
  const count = raw ? parseInt(raw, 10) : 0;

  if (count >= RATE_LIMIT_PER_DAY) {
    return { allowed: false, remaining: 0 };
  }

  // Increment; expire at midnight UTC
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  const ttl = Math.floor((midnight.getTime() - now.getTime()) / 1000);

  await kv.put(key, String(count + 1), { expirationTtl: ttl });
  return { allowed: true, remaining: RATE_LIMIT_PER_DAY - count - 1 };
}

// --------------------------------------------------------------------------
// Claude API call (single-node execution)
// --------------------------------------------------------------------------

async function callClaude(
  apiKey: string,
  prompt: string
): Promise<{ content: string; inputTokens: number; outputTokens: number }> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: ALLOWED_MODEL,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  const data = await response.json() as {
    content: Array<{ type: string; text: string }>;
    usage: { input_tokens: number; output_tokens: number };
  };

  const content = data.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  return {
    content,
    inputTokens: data.usage.input_tokens,
    outputTokens: data.usage.output_tokens,
  };
}

// --------------------------------------------------------------------------
// DAG execution (topological order, sequential for simplicity)
// --------------------------------------------------------------------------

async function executeDAG(
  dag: SimpleDAG,
  apiKey: string
): Promise<{ results: NodeResult[]; totalIn: number; totalOut: number }> {
  // Build adjacency and compute topological order
  const nodeMap = new Map(dag.nodes.map(n => [n.id, n]));
  const results = new Map<string, NodeResult>();
  const levels = new Map<string, number>();

  for (const n of dag.nodes) levels.set(n.id, 0);

  let changed = true;
  while (changed) {
    changed = false;
    for (const n of dag.nodes) {
      for (const dep of n.dependencies) {
        const depLevel = levels.get(dep) ?? 0;
        if (depLevel + 1 > (levels.get(n.id) ?? 0)) {
          levels.set(n.id, depLevel + 1);
          changed = true;
        }
      }
    }
  }

  const sorted = [...dag.nodes].sort(
    (a, b) => (levels.get(a.id) ?? 0) - (levels.get(b.id) ?? 0)
  );

  let totalIn = 0;
  let totalOut = 0;

  for (const node of sorted) {
    // Check if any dependency failed
    const depFailed = node.dependencies.some(
      dep => results.get(dep)?.status === 'failed'
    );

    if (depFailed) {
      results.set(node.id, {
        nodeId: node.id,
        name: node.name,
        status: 'skipped',
        durationMs: 0,
      });
      continue;
    }

    // Build context from upstream outputs
    const upstreamContext = node.dependencies
      .map(dep => {
        const r = results.get(dep);
        return r?.output ? `[${r.name || dep}]: ${r.output}` : '';
      })
      .filter(Boolean)
      .join('\n\n');

    const prompt = [
      node.description || `Execute skill: ${node.skillId || node.name || node.id}`,
      upstreamContext ? `\nContext from previous steps:\n${upstreamContext}` : '',
    ].join('');

    const clampedPrompt = prompt.slice(0, MAX_PROMPT_LENGTH);

    const start = Date.now();
    try {
      const { content, inputTokens, outputTokens } = await callClaude(apiKey, clampedPrompt);
      totalIn += inputTokens;
      totalOut += outputTokens;
      results.set(node.id, {
        nodeId: node.id,
        name: node.name,
        status: 'completed',
        output: content,
        durationMs: Date.now() - start,
        inputTokens,
        outputTokens,
      });
    } catch (err) {
      results.set(node.id, {
        nodeId: node.id,
        name: node.name,
        status: 'failed',
        error: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - start,
      });
    }
  }

  return { results: [...results.values()], totalIn, totalOut };
}

// --------------------------------------------------------------------------
// Worker entry point
// --------------------------------------------------------------------------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = env.ALLOWED_ORIGIN ?? 'https://someclaudeskills.com';
    const cors = corsHeaders(origin);

    // Pre-flight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // Health check
    if (url.pathname === '/api/dag/health') {
      return json({ status: 'ok', model: ALLOWED_MODEL, rateLimit: RATE_LIMIT_PER_DAY }, 200, cors);
    }

    // POST /api/dag/execute
    if (request.method === 'POST' && url.pathname === '/api/dag/execute') {
      // Validate request
      let dag: SimpleDAG;
      try {
        dag = await request.json() as SimpleDAG;
      } catch {
        return json({ error: 'Invalid JSON body' }, 400, cors);
      }

      if (!dag.nodes || !Array.isArray(dag.nodes) || dag.nodes.length === 0) {
        return json({ error: 'DAG must have at least one node' }, 400, cors);
      }

      if (dag.nodes.length > MAX_NODES) {
        return json({ error: `Maximum ${MAX_NODES} nodes allowed per execution` }, 400, cors);
      }

      // Rate limit check
      const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
      const { allowed, remaining } = await checkRateLimit(ip, env.RATE_LIMIT_KV);
      if (!allowed) {
        return json(
          { error: `Rate limit exceeded. You have used all ${RATE_LIMIT_PER_DAY} free executions for today. Try again tomorrow.` },
          429,
          { ...cors, 'X-RateLimit-Remaining': '0' }
        );
      }

      // Execute
      const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      let job: JobRecord;

      try {
        const { results, totalIn, totalOut } = await executeDAG(dag, env.ANTHROPIC_API_KEY);
        const allOk = results.every(r => r.status !== 'failed');

        job = {
          id: jobId,
          dagName: dag.name ?? 'Unnamed Workflow',
          status: allOk ? 'completed' : 'failed',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          results,
          totalInputTokens: totalIn,
          totalOutputTokens: totalOut,
        };
      } catch (err) {
        job = {
          id: jobId,
          dagName: dag.name ?? 'Unnamed Workflow',
          status: 'failed',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          error: err instanceof Error ? err.message : String(err),
        };
      }

      // Persist job result for 1 hour
      await env.RATE_LIMIT_KV.put(`job:${jobId}`, JSON.stringify(job), { expirationTtl: 3600 });

      return json(
        job,
        job.status === 'completed' ? 200 : 500,
        { ...cors, 'X-RateLimit-Remaining': String(remaining) }
      );
    }

    // GET /api/dag/status/:jobId
    const statusMatch = url.pathname.match(/^\/api\/dag\/status\/([^/]+)$/);
    if (request.method === 'GET' && statusMatch) {
      const jobId = statusMatch[1];
      const raw = await env.RATE_LIMIT_KV.get(`job:${jobId}`);
      if (!raw) {
        return json({ error: 'Job not found' }, 404, cors);
      }
      return json(JSON.parse(raw), 200, cors);
    }

    return json({ error: 'Not found' }, 404, cors);
  },
};

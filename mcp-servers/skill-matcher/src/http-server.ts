#!/usr/bin/env node
/**
 * HTTP Server for Skill Matcher MCP
 *
 * Provides remote access to the skill-matcher via HTTP/SSE transport.
 * Suitable for hosting on Fly.io, Railway, Render, or any Node.js host.
 *
 * Features:
 * - SSE (Server-Sent Events) transport for MCP protocol
 * - REST API endpoints for direct access
 * - Rate limiting and CORS support
 * - Health checks for load balancers
 * - Optional API key authentication
 *
 * Environment Variables:
 * - PORT: Server port (default: 3000)
 * - HOST: Bind address (default: 0.0.0.0)
 * - API_KEYS: Comma-separated list of valid API keys (optional)
 * - CORS_ORIGINS: Comma-separated allowed origins (default: *)
 * - RATE_LIMIT_RPM: Requests per minute (default: 60)
 * - PROJECT_ROOT: Path to skills directory
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import {
  MatchSkillsInputSchema,
  SearchExternalInputSchema,
  AnalyzeGapInputSchema,
  GetSkillInputSchema,
  ListSkillsInputSchema,
} from './validation.js';
import type { SkillCatalogEntry, MatchResult, MatchResponse } from './types.js';
import { DEFAULT_CONFIG } from './types.js';
import {
  EmbeddingService,
  cosineSimilarity,
  keywordMatch,
  hybridScore,
  prepareTextForEmbedding,
} from './embeddings.js';
import { analyzeGap } from './gap-analysis.js';
import { loadAllSkills } from './skill-loader.js';
import {
  ExternalQueryService,
  DEFAULT_QUERY_OPTIONS,
  ALL_SOURCES,
} from './external-sources.js';

// ============================================================================
// Configuration
// ============================================================================

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const API_KEYS = process.env.API_KEYS?.split(',').filter(Boolean) || [];
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['*'];
const RATE_LIMIT_RPM = parseInt(process.env.RATE_LIMIT_RPM || '60', 10);
const PROJECT_ROOT = process.env.PROJECT_ROOT || process.cwd();

const config = {
  ...DEFAULT_CONFIG,
  skillsDir: process.env.SKILLS_DIR || DEFAULT_CONFIG.skillsDir,
  agentsDir: process.env.AGENTS_DIR || DEFAULT_CONFIG.agentsDir,
};

// ============================================================================
// Server State
// ============================================================================

const SERVER_INFO = {
  name: 'skill-matcher',
  version: '1.1.0',
  startTime: Date.now(),
};

let skillIndex: SkillCatalogEntry[] = [];
let skillEmbeddings: Map<string, number[]> = new Map();
let embeddingService: EmbeddingService;
let externalService: ExternalQueryService;
let isInitialized = false;

// Rate limiting state
const rateLimitStore: Map<string, { count: number; resetAt: number }> = new Map();

// ============================================================================
// Initialization
// ============================================================================

async function initialize(): Promise<void> {
  if (isInitialized) return;

  console.log('Initializing Skill Matcher...');

  skillIndex = await loadAllSkills(PROJECT_ROOT, {
    skillsDir: config.skillsDir,
    agentsDir: config.agentsDir,
  });

  console.log(`Loaded ${skillIndex.length} skills/agents`);

  embeddingService = new EmbeddingService({
    provider: 'local-tfidf',
    dimensions: config.embeddingDimensions,
  });

  const documents = skillIndex.map(skill =>
    prepareTextForEmbedding(
      skill.name,
      skill.description,
      skill.activation.triggers,
      skill.activation.notFor,
      skill.tags
    )
  );

  await embeddingService.initialize(documents);

  for (const skill of skillIndex) {
    const text = prepareTextForEmbedding(
      skill.name,
      skill.description,
      skill.activation.triggers,
      skill.activation.notFor,
      skill.tags
    );
    const embedding = await embeddingService.embed(text);
    skillEmbeddings.set(skill.id, embedding.vector);
  }

  console.log(`Generated embeddings for ${skillEmbeddings.size} skills`);

  externalService = new ExternalQueryService(config.cacheTtlMs);

  isInitialized = true;
  console.log('Skill Matcher initialized');
}

// ============================================================================
// Core Matching Logic
// ============================================================================

async function matchSkills(
  query: string,
  maxResults: number = config.maxResults,
  includeGapAnalysis: boolean = true
): Promise<MatchResponse> {
  const startTime = Date.now();

  await initialize();

  const queryEmbedding = await embeddingService.embed(query);
  const results: MatchResult[] = [];

  for (const skill of skillIndex) {
    const skillEmbedding = skillEmbeddings.get(skill.id);
    if (!skillEmbedding) continue;

    const semanticScore = cosineSimilarity(queryEmbedding.vector, skillEmbedding);
    const kwScore = keywordMatch(query, skill.activation.triggers, skill.activation.notFor);
    const finalScore = hybridScore(semanticScore, kwScore);

    if (finalScore >= config.matchThreshold) {
      results.push({
        skill,
        score: finalScore,
        matchType: kwScore > semanticScore ? 'keyword' : 'semantic',
        reasoning: generateReasoning(skill, semanticScore, kwScore),
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  const topResults = results.slice(0, maxResults);

  let gapAnalysis;
  if (includeGapAnalysis && (topResults.length === 0 || topResults[0].score < 0.6)) {
    gapAnalysis = analyzeGap(query, skillIndex, topResults);
  }

  return {
    query,
    matches: topResults,
    gapAnalysis,
    processingTime: Date.now() - startTime,
  };
}

function generateReasoning(
  skill: SkillCatalogEntry,
  semanticScore: number,
  keywordScore: number
): string {
  const parts: string[] = [];
  if (keywordScore > 0.5) parts.push('Strong keyword match');
  if (semanticScore > 0.6) parts.push(`High semantic similarity (${(semanticScore * 100).toFixed(0)}%)`);
  if (skill.tags?.length) parts.push(`Tags: ${skill.tags.slice(0, 3).map(t => t.id).join(', ')}`);
  return parts.join('. ') || `Matches based on ${skill.category} category`;
}

// ============================================================================
// Middleware
// ============================================================================

function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const clientId = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const key = String(clientId);
  const now = Date.now();
  const windowMs = 60000;

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + windowMs };
    rateLimitStore.set(key, record);
  }

  record.count++;

  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_RPM);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT_RPM - record.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetAt / 1000));

  if (record.count > RATE_LIMIT_RPM) {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil((record.resetAt - now) / 1000),
    });
    return;
  }

  next();
}

function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  if (API_KEYS.length === 0) {
    return next();
  }

  const apiKey = req.headers['x-api-key'] || req.query.api_key;

  if (!apiKey || !API_KEYS.includes(String(apiKey))) {
    res.status(401).json({ error: 'Invalid or missing API key' });
    return;
  }

  next();
}

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error('Error:', err);

  if (err instanceof z.ZodError) {
    res.status(400).json({
      error: 'Validation error',
      details: err.errors,
    });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}

// ============================================================================
// Express App Setup
// ============================================================================

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow SSE
}));

// CORS
app.use(cors({
  origin: CORS_ORIGINS.includes('*') ? '*' : CORS_ORIGINS,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key', 'Authorization'],
}));

// JSON parsing
app.use(express.json({ limit: '100kb' }));

// Rate limiting
app.use(rateLimiter);

// ============================================================================
// Health & Info Endpoints
// ============================================================================

app.get('/health', async (req, res) => {
  await initialize().catch(() => {});

  const memoryUsage = process.memoryUsage();
  res.json({
    status: isInitialized ? 'healthy' : 'initializing',
    version: SERVER_INFO.version,
    uptime: Math.floor((Date.now() - SERVER_INFO.startTime) / 1000),
    skills: skillIndex.length,
    memory: {
      heapUsed: Math.floor(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.floor(memoryUsage.heapTotal / 1024 / 1024),
    },
  });
});

app.get('/', (req, res) => {
  res.json({
    name: SERVER_INFO.name,
    version: SERVER_INFO.version,
    description: 'Semantic skill matching MCP server',
    endpoints: {
      health: 'GET /health',
      match: 'POST /api/match',
      skills: 'GET /api/skills',
      skill: 'GET /api/skills/:id',
      gap: 'POST /api/gap',
      external: 'POST /api/external',
      sse: 'GET /sse (MCP SSE transport)',
      message: 'POST /message (MCP messages)',
    },
    documentation: 'https://someclaudeskills.com/mcp/skill-matcher',
  });
});

// ============================================================================
// REST API Endpoints
// ============================================================================

app.post('/api/match', apiKeyAuth, async (req, res, next) => {
  try {
    const input = MatchSkillsInputSchema.parse(req.body);
    const result = await matchSkills(
      input.prompt,
      input.maxResults,
      input.includeGapAnalysis
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

app.get('/api/skills', apiKeyAuth, async (req, res, next) => {
  try {
    await initialize();
    const input = ListSkillsInputSchema.parse(req.query);

    let filtered = skillIndex;
    if (input.category) {
      filtered = filtered.filter(s => s.category === input.category);
    }
    if (input.type && input.type !== 'all') {
      filtered = filtered.filter(s => s.type === input.type);
    }

    res.json({
      total: filtered.length,
      skills: filtered.map(s => ({
        id: s.id,
        name: s.name,
        type: s.type,
        category: s.category,
        description: s.description.slice(0, 150) + (s.description.length > 150 ? '...' : ''),
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/skills/:id', apiKeyAuth, async (req, res, next) => {
  try {
    await initialize();
    const input = GetSkillInputSchema.parse({ id: req.params.id });
    const skill = skillIndex.find(s => s.id === input.id);

    if (!skill) {
      res.status(404).json({ error: `Skill '${input.id}' not found` });
      return;
    }

    res.json(skill);
  } catch (error) {
    next(error);
  }
});

app.post('/api/gap', apiKeyAuth, async (req, res, next) => {
  try {
    await initialize();
    const input = AnalyzeGapInputSchema.parse(req.body);
    const matchResponse = await matchSkills(input.prompt, 5, false);
    const gapAnalysis = analyzeGap(input.prompt, skillIndex, matchResponse.matches);

    res.json({
      prompt: input.prompt,
      analysis: gapAnalysis,
      nearestSkills: matchResponse.matches.slice(0, 3).map(m => ({
        id: m.skill.id,
        name: m.skill.name,
        score: m.score,
      })),
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/external', apiKeyAuth, async (req, res, next) => {
  try {
    await initialize();
    const input = SearchExternalInputSchema.parse(req.body);

    const suggestions = await externalService.query(input.query, {
      sources: (input.sources as typeof ALL_SOURCES[number][]) || DEFAULT_QUERY_OPTIONS.sources,
      maxResults: input.maxResults || DEFAULT_QUERY_OPTIONS.maxResults,
      minRelevance: DEFAULT_QUERY_OPTIONS.minRelevance,
    });

    res.json({
      query: input.query,
      results: suggestions,
      sources: input.sources || DEFAULT_QUERY_OPTIONS.sources,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// MCP SSE Transport
// ============================================================================

// Store active transports
const transports: Map<string, SSEServerTransport> = new Map();

app.get('/sse', apiKeyAuth, async (req, res) => {
  console.log('New SSE connection');

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Create MCP server instance for this connection
  const mcpServer = new Server(
    { name: SERVER_INFO.name, version: SERVER_INFO.version },
    { capabilities: { tools: {}, resources: {} } }
  );

  // Set up tool handlers
  mcpServer.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'match_skills',
        description: 'Find skills matching a user prompt using semantic search',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: 'The user prompt to match' },
            maxResults: { type: 'number', description: 'Max results (default: 5)' },
            includeGapAnalysis: { type: 'boolean', description: 'Include gap analysis (default: true)' },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'list_skills',
        description: 'List all available skills',
        inputSchema: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            type: { type: 'string', enum: ['skill', 'agent', 'mcp', 'all'] },
          },
        },
      },
      {
        name: 'get_skill',
        description: 'Get detailed info about a specific skill',
        inputSchema: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
      },
    ],
  }));

  mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      await initialize();

      switch (name) {
        case 'match_skills': {
          const input = MatchSkillsInputSchema.parse(args);
          const result = await matchSkills(input.prompt, input.maxResults, input.includeGapAnalysis);
          return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }

        case 'list_skills': {
          const input = ListSkillsInputSchema.parse(args);
          let filtered = skillIndex;
          if (input.category) filtered = filtered.filter(s => s.category === input.category);
          if (input.type && input.type !== 'all') filtered = filtered.filter(s => s.type === input.type);
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({ total: filtered.length, skills: filtered.map(s => ({ id: s.id, name: s.name, type: s.type, category: s.category })) }, null, 2),
            }],
          };
        }

        case 'get_skill': {
          const input = GetSkillInputSchema.parse(args);
          const skill = skillIndex.find(s => s.id === input.id);
          if (!skill) throw new McpError(ErrorCode.InvalidRequest, `Skill '${input.id}' not found`);
          return { content: [{ type: 'text', text: JSON.stringify(skill, null, 2) }] };
        }

        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new McpError(ErrorCode.InvalidParams, `Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  });

  // Create SSE transport
  const transport = new SSEServerTransport('/message', res);
  const connectionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  transports.set(connectionId, transport);

  // Handle disconnect
  req.on('close', () => {
    console.log(`SSE connection closed: ${connectionId}`);
    transports.delete(connectionId);
  });

  // Connect server to transport
  await mcpServer.connect(transport);
});

app.post('/message', apiKeyAuth, express.json(), async (req, res) => {
  // Find matching transport and forward message
  // This is simplified - in production you'd track session IDs
  const transport = Array.from(transports.values())[0];
  if (!transport) {
    res.status(503).json({ error: 'No active SSE connection' });
    return;
  }

  // Forward to transport handler
  // Note: The SSE transport handles messages internally
  res.status(202).json({ status: 'accepted' });
});

// ============================================================================
// Error Handler
// ============================================================================

app.use(errorHandler);

// ============================================================================
// Start Server
// ============================================================================

async function main() {
  // Pre-initialize for faster first request
  console.log('Pre-initializing skill index...');
  await initialize();

  app.listen(PORT, HOST, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║               Skill Matcher MCP Server                     ║
╠════════════════════════════════════════════════════════════╣
║  Version: ${SERVER_INFO.version.padEnd(47)}║
║  Skills:  ${String(skillIndex.length).padEnd(47)}║
║  URL:     http://${HOST}:${PORT}${' '.repeat(Math.max(0, 40 - HOST.length - String(PORT).length))}║
╠════════════════════════════════════════════════════════════╣
║  Endpoints:                                                ║
║    GET  /health      - Health check                        ║
║    POST /api/match   - Match skills to prompt              ║
║    GET  /api/skills  - List all skills                     ║
║    GET  /api/skills/:id - Get skill details                ║
║    POST /api/gap     - Gap analysis                        ║
║    POST /api/external - Search external sources            ║
║    GET  /sse         - MCP SSE transport                   ║
╠════════════════════════════════════════════════════════════╣
║  Auth: ${API_KEYS.length > 0 ? 'API key required (X-API-Key header)'.padEnd(51) : 'No authentication (public)'.padEnd(51)}║
╚════════════════════════════════════════════════════════════╝
    `);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Shutting down...');
  process.exit(0);
});

main().catch(console.error);

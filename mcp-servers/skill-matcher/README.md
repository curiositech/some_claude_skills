# Skill Matcher MCP Server

> **Adaptive AI Skill Discovery** - Instantly find the right Claude skill for any prompt using semantic search.

Part of [someclaudeskills.com](https://someclaudeskills.com)

## Overview

The Skill Matcher is an MCP (Model Context Protocol) server that uses embedding-based semantic search to match user prompts to the most relevant Claude skills. When no skill exists, it provides detailed gap analysis with suggestions for creating new skills.

### Key Features

- **Semantic Skill Matching** - Uses TF-IDF embeddings with hybrid keyword matching for fast, accurate results
- **Gap Analysis** - When no skill matches, suggests what new skill could fill the gap
- **External Database Search** - Opt-in querying of MCP registries, Smithery, Glama, and GitHub
- **Standardized Skill Catalog** - Formalized JSON schema for indexing any skill
- **Client SDK** - TypeScript client for programmatic access

## Installation

```bash
cd mcp-servers/skill-matcher
npm install
npm run build
```

## Usage

### As an MCP Server

Add to your Claude configuration:

```json
{
  "mcpServers": {
    "skill-matcher": {
      "command": "node",
      "args": ["path/to/skill-matcher/dist/index.js"],
      "env": {
        "PROJECT_ROOT": "/path/to/some_claude_skills"
      }
    }
  }
}
```

### Available Tools

#### `match_skills`
Find skills that match a user prompt using semantic search.

```typescript
{
  prompt: string,      // The user prompt to match
  maxResults?: number, // Max results (default: 5)
  includeGapAnalysis?: boolean // Include gap analysis (default: true)
}
```

**Example Response:**
```json
{
  "query": "help me design a website",
  "matches": [
    {
      "skill": {
        "id": "web-design-expert",
        "name": "Web Design Expert",
        "description": "Creates unique web designs with brand identity...",
        "category": "visual-design-ui"
      },
      "score": 0.85,
      "matchType": "hybrid",
      "reasoning": "Strong keyword match with triggers. High semantic similarity (85%)"
    }
  ],
  "processingTime": 45
}
```

#### `search_external`
Search external MCP and skill databases (opt-in).

```typescript
{
  query: string,       // Search query
  sources?: string[],  // Sources: mcp-registry, smithery, glama, awesome-mcp, github-topics
  maxResults?: number  // Max results per source
}
```

#### `analyze_gap`
Get detailed analysis when no skill matches.

```typescript
{
  prompt: string  // The prompt with no matching skill
}
```

**Example Response:**
```json
{
  "identified": true,
  "opportunity": {
    "name": "Quantum Computing Expert",
    "description": "Specialized skill for quantum computing tasks...",
    "category": "research-strategy",
    "suggestedTriggers": ["quantum computing", "qubits", "quantum circuit"]
  },
  "research": {
    "topics": [
      "Quantum computing frameworks (Qiskit, Cirq)",
      "Quantum algorithm design patterns",
      "Quantum error correction"
    ],
    "resources": ["Qiskit textbook", "Microsoft Q# documentation"],
    "existingTools": ["WebSearch", "Read", "Write"]
  },
  "successCriteria": {
    "metrics": ["Correct quantum circuit generation", "Algorithm optimization score"],
    "testCases": ["Basic quantum gate operations", "Quantum entanglement simulation"],
    "validation": "The skill is successful when it can reliably generate and explain quantum circuits"
  },
  "relatedSkills": ["research-analyst", "code-necromancer"]
}
```

#### `list_skills` / `get_skill`
List all skills or get details about a specific skill.

### As a TypeScript Client

```typescript
import { SkillMatcherClient } from '@someclaudeskills/skill-matcher/client';

const client = new SkillMatcherClient({
  projectRoot: '/path/to/some_claude_skills',
  matchThreshold: 0.4,
  maxResults: 5,
});

// Find matching skills
const matches = await client.matchSkills('help me design a mobile app');

// Analyze gap
const gap = await client.analyzeGap('help me with quantum teleportation');

// Search external databases
const external = await client.searchExternal('file system operations');
```

### CLI Usage

```bash
# Find matching skills
npx skill-matcher match "help me design a website"

# Analyze skill gap
npx skill-matcher gap "help me with blockchain development"

# Search external databases
npx skill-matcher external "database operations"

# List all skills
npx skill-matcher list

# Get stats
npx skill-matcher stats
```

## Remote Hosting (HTTP Server)

The skill-matcher can be hosted as a remote HTTP server for others to use.

### Quick Start

```bash
# Start HTTP server locally
npm run start:http

# Or with environment variables
PORT=8080 API_KEYS="secret1,secret2" npm run start:http
```

### REST API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check (for load balancers) |
| `/api/match` | POST | Match skills to a prompt |
| `/api/skills` | GET | List all skills |
| `/api/skills/:id` | GET | Get skill details |
| `/api/gap` | POST | Gap analysis for a prompt |
| `/api/external` | POST | Search external sources |
| `/sse` | GET | MCP SSE transport |

### Example API Calls

```bash
# Match skills
curl -X POST http://localhost:3000/api/match \
  -H "Content-Type: application/json" \
  -d '{"prompt": "help me design a website"}'

# List skills
curl http://localhost:3000/api/skills

# With API key authentication
curl -X POST http://localhost:3000/api/match \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-key" \
  -d '{"prompt": "help me design a website"}'
```

### Deploy to Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch (first time)
fly launch --config fly.toml

# Deploy updates
fly deploy

# Set API keys (optional)
fly secrets set API_KEYS="key1,key2,key3"

# View logs
fly logs
```

### Deploy with Docker

```bash
# Build
docker build -t skill-matcher .

# Run
docker run -p 3000:3000 \
  -e API_KEYS="secret1,secret2" \
  -v /path/to/skills:/app/skills \
  skill-matcher
```

### HTTP Server Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `HOST` | Bind address | `0.0.0.0` |
| `API_KEYS` | Comma-separated API keys (optional) | None (public) |
| `CORS_ORIGINS` | Allowed CORS origins | `*` |
| `RATE_LIMIT_RPM` | Requests per minute | `60` |
| `PROJECT_ROOT` | Path to skills directory | `process.cwd()` |

## Skill Catalog Schema

Skills can be indexed using the standardized schema:

```json
{
  "id": "web-design-expert",
  "type": "skill",
  "name": "Web Design Expert",
  "description": "Creates unique web designs with brand identity, color palettes, and modern UI/UX patterns.",
  "activation": {
    "triggers": ["web design", "website", "ui design", "brand identity"],
    "notFor": ["backend only", "api design", "database schema"]
  },
  "category": "visual-design-ui",
  "tags": [
    { "id": "creation", "type": "skill-type" },
    { "id": "design", "type": "domain" },
    { "id": "visual", "type": "output" }
  ],
  "capabilities": {
    "tools": ["Read", "Write", "Edit", "WebSearch"],
    "outputs": ["code", "visual", "document"]
  },
  "metadata": {
    "source": "someclaudeskills",
    "version": "1.0.0"
  }
}
```

See `schemas/skill-catalog.schema.json` for the full JSON Schema.

## External Sources

When enabled, the matcher can query these external databases:

| Source | Description | Rate Limit |
|--------|-------------|------------|
| `mcp-registry` | Official MCP Registry | 10/min |
| `smithery` | Smithery.ai MCP marketplace | 30/min |
| `glama` | Glama.ai MCP directory | 30/min |
| `awesome-mcp` | awesome-mcp GitHub list | 10/min |
| `github-topics` | GitHub topic search | 10/min |

External search is **opt-in** and only runs when explicitly requested.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PROJECT_ROOT` | Project root directory | `process.cwd()` |
| `SKILLS_DIR` | Skills directory relative to root | `.claude/skills` |
| `AGENTS_DIR` | Agents directory relative to root | `.claude/agents` |
| `MATCH_THRESHOLD` | Minimum match score (0-1) | `0.4` |
| `MAX_RESULTS` | Default max results | `5` |
| `ENABLE_EXTERNAL` | Enable external search by default | `false` |

## How It Works

### 1. Skill Loading
Skills are loaded from `.claude/skills/` and `.claude/agents/` directories. Frontmatter metadata is parsed to extract:
- Name and description
- Activation triggers
- Anti-patterns (when NOT to use)
- Tags and categories
- Tool capabilities

### 2. Embedding Generation
Each skill is converted to a TF-IDF vector embedding based on:
- Name and description
- Activation triggers
- Anti-patterns
- Tags

### 3. Query Matching
User prompts are:
1. Embedded using the same TF-IDF model
2. Compared via cosine similarity to all skill embeddings
3. Enhanced with keyword matching against triggers
4. Combined using hybrid scoring

### 4. Gap Analysis
When matches are weak, the system:
1. Detects the likely category from keywords
2. Extracts suggested triggers from the prompt
3. Generates research topics and resources
4. Creates success criteria and test cases
5. Identifies related existing skills

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Development mode (watch)
npm run dev

# Run tests
npm test
```

## License

MIT - Part of the Some Claude Skills project.

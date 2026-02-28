# DAG Execution API

A Cloudflare Worker that provides a rate-limited REST API for executing DAG
workflows using Claude Haiku.

## Features

- **Model**: `claude-haiku-4-5` only (cost control)
- **Rate limit**: 5 executions per IP per day
- **Max nodes**: 8 nodes per workflow
- **CORS**: configured for `someclaudeskills.com`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/dag/health` | Health check |
| `POST` | `/api/dag/execute` | Execute a DAG workflow |
| `GET` | `/api/dag/status/:jobId` | Poll a completed job |

## Deployment

### 1. Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 2. Create KV Namespace

```bash
cd api/
npx wrangler kv:namespace create "RATE_LIMIT_KV"
```

Copy the `id` from the output and replace `REPLACE_WITH_YOUR_KV_NAMESPACE_ID`
in `wrangler.toml`.

### 3. Add API Key Secret

```bash
npx wrangler secret put ANTHROPIC_API_KEY
# Paste your Anthropic API key when prompted
```

### 4. Deploy

```bash
npx wrangler deploy
```

The Worker URL will be `https://dag-execution-api.<your-account>.workers.dev`.

### 5. Point the Frontend at Your Worker

In `website/src/pages/dag/builder.tsx`, update the `API_BASE_URL` constant:

```ts
const API_BASE_URL = 'https://dag-execution-api.<your-account>.workers.dev';
```

## Request Format

```json
{
  "id": "my-workflow",
  "name": "Code Review Pipeline",
  "nodes": [
    {
      "id": "lint",
      "name": "Lint Check",
      "description": "Check the code for style issues",
      "skillId": "code-review-checklist",
      "dependencies": [],
      "model": "haiku"
    },
    {
      "id": "security",
      "name": "Security Audit",
      "description": "Review for security vulnerabilities",
      "skillId": "security-auditor",
      "dependencies": ["lint"],
      "model": "haiku"
    }
  ]
}
```

## Response Format

```json
{
  "id": "job-1234567890-abc123",
  "dagName": "Code Review Pipeline",
  "status": "completed",
  "createdAt": "2026-02-27T14:00:00.000Z",
  "completedAt": "2026-02-27T14:00:05.412Z",
  "results": [
    {
      "nodeId": "lint",
      "name": "Lint Check",
      "status": "completed",
      "output": "...",
      "durationMs": 2100,
      "inputTokens": 120,
      "outputTokens": 340
    }
  ],
  "totalInputTokens": 240,
  "totalOutputTokens": 680
}
```

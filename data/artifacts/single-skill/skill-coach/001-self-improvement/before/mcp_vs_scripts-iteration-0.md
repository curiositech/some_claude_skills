# MCP vs Scripts: An Architectural Decision Guide

## TL;DR

**Use Scripts** for: Local, stateless operations with no auth
**Use MCPs** for: External APIs, auth boundaries, stateful connections

## The Philosophy

> "MCP's job isn't to abstract reality for the agent; it's to manage the auth, networking, and security boundaries and then get out of the way."
> 
> — Shrivu Shankar, "How I Use Every Claude Code Feature"

MCPs aren't better than scripts - they're different tools for different problems.

## Decision Matrix

```
                    │ Local   │ Remote  │ Auth    │ Stateful │ Decision
────────────────────┼─────────┼─────────┼─────────┼──────────┼──────────
JSON parsing        │ ✓       │         │         │          │ Script
AWS S3 operations   │         │ ✓       │ ✓       │          │ MCP
Database queries    │         │ ✓       │ ✓       │ ✓        │ MCP
Git operations      │ ✓       │         │         │          │ Script
Jira API           │         │ ✓       │ ✓       │          │ MCP
Image resizing      │ ✓       │         │         │          │ Script
WebSocket client    │         │ ✓       │ ✓       │ ✓        │ MCP
PDF generation      │ ✓       │         │         │          │ Script
GitHub API         │         │ ✓       │ ✓       │          │ MCP
File organization   │ ✓       │         │         │          │ Script
```

## Use Scripts When...

### ✅ Local File Operations

```python
# scripts/organize_photos.py
import os
import shutil
from datetime import datetime

def organize_by_date(source_dir):
    for file in os.listdir(source_dir):
        if file.lower().endswith(('.jpg', '.png')):
            creation_time = os.path.getctime(os.path.join(source_dir, file))
            date = datetime.fromtimestamp(creation_time).strftime('%Y-%m')
            os.makedirs(f"{source_dir}/{date}", exist_ok=True)
            shutil.move(f"{source_dir}/{file}", f"{source_dir}/{date}/{file}")
```

**Why script**: No auth, no external APIs, pure file operations.

### ✅ Stateless Transformations

```python
# scripts/convert_markdown.py
import markdown
import sys

with open(sys.argv[1]) as f:
    html = markdown.markdown(f.read())
    print(html)
```

**Why script**: Input → Output, no state, no network.

### ✅ CLI Wrappers

```python
# scripts/git_summary.py
import subprocess
import json

def get_commit_summary(since="1 week ago"):
    result = subprocess.run(
        ['git', 'log', f'--since={since}', '--oneline'],
        capture_output=True,
        text=True
    )
    return result.stdout.split('\n')

print(json.dumps(get_commit_summary()))
```

**Why script**: Wrapping existing CLI tools, no auth needed.

### ✅ Batch Processing

```bash
# scripts/batch_resize.sh
#!/bin/bash
for img in *.jpg; do
    convert "$img" -resize 800x600 "resized_$img"
done
```

**Why script**: Simple, local, no coordination needed.

## Use MCPs When...

### ✅ External APIs with Auth

```python
# Good MCP example
from mcp.server import Server
from anthropic import Anthropic

app = Server("claude-api")
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

@app.tool()
async def ask_claude(prompt: str) -> str:
    """Query Claude API with authentication."""
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )
    return message.content[0].text
```

**Why MCP**: 
- Authentication (API key)
- External service
- Standardized error handling
- Rate limiting concerns

### ✅ Stateful Connections

```python
# Database MCP
from mcp.server import Server
import psycopg2

app = Server("postgres-mcp")
conn = None  # Persistent connection

@app.tool()
async def connect_db(connection_string: str):
    """Establish database connection."""
    global conn
    conn = psycopg2.connect(connection_string)
    return "Connected"

@app.tool()
async def query_db(sql: str):
    """Execute query on open connection."""
    if not conn:
        raise Exception("Not connected")
    cursor = conn.cursor()
    cursor.execute(sql)
    return cursor.fetchall()
```

**Why MCP**: 
- Maintains state (connection)
- Multiple related operations
- Connection pooling
- Transaction management

### ✅ Real-Time Data

```python
# Stock price MCP
from mcp.server import Server
import websocket
import json

app = Server("stock-prices")
ws = None

@app.tool()
async def subscribe_stock(ticker: str):
    """Subscribe to real-time stock updates."""
    global ws
    ws = websocket.WebSocketApp(
        f"wss://api.example.com/stocks/{ticker}",
        on_message=handle_message
    )
    ws.run_forever()
```

**Why MCP**: WebSocket connection, real-time updates, persistent connection.

### ✅ Multiple Related Tools

```python
# GitHub MCP
from mcp.server import Server
import requests

app = Server("github-api")
BASE = "https://api.github.com"
TOKEN = os.getenv("GITHUB_TOKEN")
HEADERS = {"Authorization": f"token {TOKEN}"}

@app.tool()
async def list_repos(org: str):
    """List organization repositories."""
    r = requests.get(f"{BASE}/orgs/{org}/repos", headers=HEADERS)
    return r.json()

@app.tool()
async def create_issue(repo: str, title: str, body: str):
    """Create GitHub issue."""
    r = requests.post(
        f"{BASE}/repos/{repo}/issues",
        headers=HEADERS,
        json={"title": title, "body": body}
    )
    return r.json()

@app.tool()
async def get_pr(repo: str, pr_number: int):
    """Get pull request details."""
    r = requests.get(f"{BASE}/repos/{repo}/pulls/{pr_number}", headers=HEADERS)
    return r.json()
```

**Why MCP**: 
- All tools share auth
- Related domain (GitHub)
- Standardized error handling
- Single configuration

## Anti-Patterns

### ❌ MCP for Local Operations

**Bad**:
```python
# mcp_server_json.py - OVERKILL
from mcp.server import Server
import json

app = Server("json-parser")

@app.tool()
async def parse_json(file_path: str):
    with open(file_path) as f:
        return json.load(f)

@app.tool()
async def write_json(file_path: str, data: dict):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)
```

**Better**:
```python
# scripts/json_utils.py
import json
import sys

# Parse
with open(sys.argv[1]) as f:
    print(json.dumps(json.load(f), indent=2))
```

**Why**: No auth, no network, no state. Script is simpler.

### ❌ Script for Authenticated APIs

**Bad**:
```python
# scripts/query_jira.py
import requests

# API key hardcoded or in environment - not great!
response = requests.get(
    "https://company.atlassian.net/rest/api/3/issue/PROJ-123",
    auth=("user@example.com", os.getenv("JIRA_TOKEN"))
)
print(response.json())
```

**Why problematic**:
- Credentials in script or environment
- No error handling
- No rate limiting
- Can't compose with other Jira operations
- Each agent invocation re-authenticates

**Better**: MCP with proper auth flow, connection reuse, error handling.

### ❌ Overengineered MCP

**Bad**:
```python
# mcp_server_calculator.py - TOO SIMPLE FOR MCP
from mcp.server import Server

app = Server("calculator")

@app.tool()
async def add(a: float, b: float) -> float:
    return a + b

@app.tool()
async def subtract(a: float, b: float) -> float:
    return a - b
```

**Better**: Claude can do this natively. No tool needed.

## Evolution Path

Good architecture evolves:

### Stage 1: Single Script
```bash
# fetch_data.py
import requests
data = requests.get("https://api.example.com/data").json()
print(data)
```

### Stage 2: Multiple Scripts
```bash
scripts/
├── fetch_data.py
├── process_data.py
└── upload_results.py
```

### Stage 3: Helper Library
```python
# lib/data_client.py
class DataClient:
    def fetch(self): ...
    def process(self): ...
    def upload(self): ...

# scripts/run_pipeline.py
from lib.data_client import DataClient
client = DataClient()
client.fetch()
client.process()
client.upload()
```

### Stage 4: MCP Server
```python
# Only when you need:
# - Auth management
# - Multiple agents using it
# - Error handling standardization
# - Connection pooling

from mcp.server import Server
from lib.data_client import DataClient

app = Server("data-pipeline")
client = DataClient()

@app.tool()
async def fetch_data():
    return client.fetch()
# ... etc
```

**Don't skip to Stage 4** unless complexity justifies it.

## Performance Considerations

### Scripts
- ✅ Zero latency overhead
- ✅ Simple debugging
- ✅ No network calls for local ops
- ❌ No connection reuse
- ❌ No shared state across calls

### MCPs
- ✅ Connection pooling
- ✅ Shared state
- ✅ Standardized errors
- ❌ Network overhead
- ❌ More complex debugging

## Security Considerations

### Scripts
- ✅ No credential management complexity
- ✅ Run in user context
- ❌ Credentials in environment or hardcoded
- ❌ Each invocation re-authenticates

### MCPs
- ✅ Centralized credential management
- ✅ OAuth flows
- ✅ Connection reuse (fewer auth requests)
- ❌ More attack surface
- ❌ Requires secure credential storage

## Testing

### Scripts
```bash
# Easy to test
python scripts/process_data.py test_input.json
```

### MCPs
```python
# MCP Inspector or custom client needed
from mcp.client import Client

async def test():
    async with Client("http://localhost:8000") as client:
        result = await client.call_tool("process_data", {"input": "test"})
        assert result == expected
```

## Documentation Recommendations

In your skill's SKILL.md:

```markdown
## Tools Required

This skill uses:
- **Scripts** for local processing: `/scripts/validate.py`
- **MCP** for GitHub API access: Requires `github-mcp` installed

### Setup MCP

```bash
/plugin marketplace add github-mcp
```

Or use CLI directly if GitHub MCP unavailable:
```bash
gh issue list
```
```

## Decision Flowchart

```
Is it a local operation?
├─ Yes → Use Script
└─ No → Does it require auth?
    ├─ No → Use Script (with curl/CLI)
    └─ Yes → Is it a single operation?
        ├─ Yes → Script with env vars
        └─ No → MCP Server
```

## Real-World Examples

### Good: Playwright as MCP
- Complex browser automation
- Stateful (browser context)
- Multiple related operations
- Security boundaries (sandbox)

### Good: Git as Script
- CLI wrapper
- Local operations
- No auth needed
- Simple subprocess calls

### Good: AWS SDK as MCP
- Many related services
- Auth required
- Connection pooling
- Error handling standardization

### Good: Image Processing as Script
- Local file operations
- Stateless transformations
- No network needed
- Simple input/output

## Summary

**Scripts win on**:
- Simplicity
- Local operations
- No dependencies
- Easy testing
- Zero overhead

**MCPs win on**:
- Auth management
- Connection reuse
- Multiple related operations
- Stateful interactions
- Standardization

**The Rule**: Start with scripts. Graduate to MCP when auth, state, or complexity demands it.

---

## Further Reading

- `/references/antipatterns.md` - "MCP for Everything" anti-pattern
- `/examples/good/mcp-vs-script-comparison/` - Side-by-side examples
- Model Context Protocol docs: https://modelcontextprotocol.io/

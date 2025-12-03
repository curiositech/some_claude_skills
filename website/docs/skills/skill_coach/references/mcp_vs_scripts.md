---
title: "Skills vs Agents vs MCPs vs Scripts: An Architectural Decision Guide"
sidebar_label: Skills vs Agents vs MCPs vs...
sidebar_position: 3
---
# Skills vs Agents vs MCPs vs Scripts: An Architectural Decision Guide

## TL;DR

**Use Skills** for: Domain expertise, anti-patterns, decision trees (no runtime state)
**Use Agents** for: Multi-step workflows needing tool orchestration and autonomy
**Use MCPs** for: External APIs, auth boundaries, stateful connections
**Use Scripts** for: Local, stateless operations with no auth

## The Philosophy

> "MCP's job isn't to abstract reality for the agent; it's to manage the auth, networking, and security boundaries and then get out of the way."
>
> — Shrivu Shankar, "How I Use Every Claude Code Feature"

Each tool serves a distinct purpose:

- **Skills** encode domain expertise and decision trees without runtime state
- **Agents** orchestrate multi-step workflows with tool autonomy
- **MCPs** manage auth boundaries and external service connections
- **Scripts** handle local, stateless operations

None is inherently "better" - they solve different problems at different layers.

## Decision Matrix

```
                           │ Expertise │ Multi-step │ Runtime │ Local │ Remote │ Auth │ Decision
───────────────────────────┼───────────┼────────────┼─────────┼───────┼────────┼──────┼──────────
CLIP anti-patterns         │ ✓         │            │         │       │        │      │ Skill
Code review workflow       │           │ ✓          │ ✓       │       │        │      │ Agent
JSON parsing               │           │            │         │ ✓     │        │      │ Script
AWS S3 operations          │           │            │         │       │ ✓      │ ✓    │ MCP
Database queries           │           │            │ ✓       │       │ ✓      │ ✓    │ MCP
PR creation workflow       │           │ ✓          │ ✓       │       │        │      │ Agent
Git operations             │           │            │         │ ✓     │        │      │ Script
Jira API                   │           │            │         │       │ ✓      │ ✓    │ MCP
Framework evolution guide  │ ✓         │            │         │       │        │      │ Skill
Image resizing             │           │            │         │ ✓     │        │      │ Script
Testing pipeline           │           │ ✓          │ ✓       │       │        │      │ Agent
WebSocket client           │           │            │ ✓       │       │ ✓      │ ✓    │ MCP
PDF generation             │           │            │         │ ✓     │        │      │ Script
GitHub API                 │           │            │         │       │ ✓      │ ✓    │ MCP
File organization          │           │            │         │ ✓     │        │      │ Script
```

**Legend:**
- **Expertise**: Domain knowledge, anti-patterns, decision trees
- **Multi-step**: Orchestrates multiple operations autonomously
- **Runtime**: Maintains state across operations
- **Local**: File system operations
- **Remote**: External service calls
- **Auth**: Requires authentication/authorization

## Use Skills When...

### ✅ Domain Expertise Needed

```yaml
# .claude/skills/clip-aware-embeddings/SKILL.md
---
name: clip-aware-embeddings
description: CLIP semantic search expertise. Use for image-text matching, zero-shot classification. NOT for counting, fine-grained classification, spatial reasoning.
---

## When NOT to Use CLIP

### Anti-Pattern: Using CLIP to Count Objects
**Why wrong**: CLIP's architecture cannot preserve spatial information
**What to do**: Use DETR or Faster R-CNN for object detection
**How to detect**: If query contains "how many" or "count"
```

**Why Skill**:
- No runtime state needed
- Encodes expert knowledge (shibboleths)
- Prevents common mistakes via anti-patterns
- Available across all conversations

### ✅ Framework Evolution Knowledge

```yaml
# .claude/skills/react-performance-expert/SKILL.md
---
name: react-performance-expert
description: React performance optimization expertise. Pre-2024 patterns vs modern best practices. NOT for Vue/Angular.
---

## Evolution Timeline
- Pre-2019: Class components + shouldComponentUpdate
- 2019-2023: Hooks + React.memo
- 2024+: React Compiler (automatic memoization)

## Watch For
LLMs may suggest manual useMemo/useCallback when React Compiler handles it automatically.
```

**Why Skill**:
- Captures temporal knowledge
- Warns about deprecated patterns
- No execution needed, just guidance

### ✅ Architectural Decision Trees

```yaml
# .claude/skills/state-management-advisor/SKILL.md
---
name: state-management-advisor
description: State management decision guidance. Use when choosing Redux vs Zustand vs Context. NOT for implementation.
---

## Decision Tree
- Simple boolean/string state shared by 2-3 components → Context
- Complex state with actions (todo list, shopping cart) → Zustand
- Time-travel debugging required → Redux Toolkit
- NEVER: Redux for simple state
```

**Why Skill**:
- Decision logic, not code templates
- Prevents overengineering
- No tools needed, just expertise

## Use Agents When...

### ✅ Multi-Step Workflows with Tool Orchestration

```python
# Agents orchestrate multiple tools autonomously
# Example: Code Review Agent

from anthropic import Agent

review_agent = Agent(
    name="code-reviewer",
    instructions="""
    1. Read modified files
    2. Run linter and tests
    3. Check for security issues
    4. Generate review comments
    5. Create summary report
    """,
    tools=["Read", "Bash", "Grep", "Write"]
)

# Agent autonomously:
# - Decides which files to read
# - Runs appropriate tests
# - Generates contextual feedback
```

**Why Agent**:
- Multiple steps requiring decisions
- Needs tool access (Read, Bash, etc.)
- Maintains context across operations
- Autonomy in execution order

### ✅ Task Decomposition and Parallel Execution

```python
# Example: Testing Pipeline Agent

testing_agent = Agent(
    name="test-runner",
    instructions="""
    1. Identify all test files
    2. Run unit tests in parallel
    3. Run integration tests
    4. Generate coverage report
    5. Fail fast on critical errors
    """,
    tools=["Bash", "Read", "Write"]
)

# Agent manages:
# - Parallel test execution
# - State aggregation (pass/fail counts)
# - Conditional logic (fail fast)
```

**Why Agent**:
- Orchestrates multiple bash commands
- Maintains state (test results)
- Makes runtime decisions (fail fast)

### ✅ Complex Debugging Workflows

```python
# Example: Bug Investigation Agent

debug_agent = Agent(
    name="debugger",
    instructions="""
    1. Search codebase for error patterns
    2. Read relevant files
    3. Identify root cause
    4. Propose fixes
    5. Test proposed solutions
    """,
    tools=["Grep", "Read", "Edit", "Bash"]
)

# Agent autonomously:
# - Searches strategically
# - Follows leads based on findings
# - Iterates on hypotheses
```

**Why Agent**:
- Non-linear investigation path
- Requires multiple tool types
- Runtime decision-making
- Iterative refinement

### ❌ When NOT to Use Agents

**Don't use Agent for**:
- Single operations (just use tool directly)
- Pure expertise (use Skill instead)
- External API calls (use MCP)
- Simple scripts (use Script)

**Anti-Pattern: Agent for Static Knowledge**
```python
# BAD: Agent that just returns information
Agent(
    name="python-docs",
    instructions="Answer Python questions",
    tools=[]
)
# BETTER: Use a Skill with /references/ to documentation
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

### ❌ Skill for Runtime Execution

**Bad**:
```yaml
# .claude/skills/file-organizer/SKILL.md
---
name: file-organizer
description: Organizes files by date
allowed-tools: Bash,Read,Write
---

Run this script to organize files:
python scripts/organize.py /path/to/files
```

**Why it's wrong**: Skills provide expertise, not execution. Use Script or Agent for actual work.

**What to do instead**:
- **Skill**: Provide decision tree ("When to organize by date vs by type")
- **Script**: Do the actual organizing
- **Agent**: Orchestrate multiple organization strategies

### ❌ Agent for Static Knowledge

**Bad**:
```python
# Agent that just returns information
Agent(
    name="python-syntax-helper",
    instructions="Answer Python syntax questions",
    tools=[]
)
```

**Why it's wrong**: No tools needed, no multi-step workflow, just knowledge lookup.

**What to do instead**: Use a Skill with /references/ to documentation.

### ❌ Agent for Single Operations

**Bad**:
```python
# Agent that just runs one command
Agent(
    name="test-runner",
    instructions="Run pytest on the codebase",
    tools=["Bash"]
)
```

**Why it's wrong**: Single bash command doesn't justify agent overhead.

**What to do instead**: Just run `pytest` directly via Bash tool.

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

Good architecture evolves through layers of abstraction:

### Stage 0: Direct Tool Use
```bash
# Just use Claude's tools directly
Read file → Edit file → Bash command
```

### Stage 1: Single Script
```bash
# fetch_data.py
import requests
data = requests.get("https://api.example.com/data").json()
print(data)
```

**Use when**: One-off operation, local, no auth

### Stage 2: Multiple Scripts
```bash
scripts/
├── fetch_data.py
├── process_data.py
└── upload_results.py
```

**Use when**: Related operations, still local, no orchestration needed

### Stage 3: Skill for Expertise
```yaml
# .claude/skills/data-pipeline-expert/SKILL.md
---
name: data-pipeline-expert
description: Data pipeline anti-patterns and decision trees
---

## When to Batch Process
- Data size > 100MB → Batch with pagination
- Real-time updates needed → Use streaming instead

## Anti-Patterns
- Processing entire dataset in memory → OOM errors
```

**Use when**: You have domain expertise to encode, prevent common mistakes

### Stage 4: Agent for Orchestration
```python
# When scripts need coordination
Agent(
    name="pipeline-runner",
    instructions="""
    1. Validate data format
    2. Run fetch_data.py
    3. If fetch succeeds, run process_data.py
    4. If validation passes, run upload_results.py
    5. Generate summary report
    """,
    tools=["Bash", "Read", "Write"]
)
```

**Use when**: Multi-step workflow with runtime decisions, state management

### Stage 5: Helper Library
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

**Use when**: Shared logic across multiple scripts, testability needed

### Stage 6: MCP Server
```python
# Only when you need:
# - Auth management
# - Multiple agents using it
# - External API access
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

**Use when**: External APIs, auth boundaries, stateful connections

**The Rule**: Start simple. Each stage adds complexity - only evolve when the complexity pays for itself.

## Performance Considerations

### Skills
- ✅ Zero runtime overhead (loaded as context)
- ✅ Prevents mistakes before execution
- ✅ Cached across conversations
- ❌ Takes up context window
- ❌ No execution capability

### Agents
- ✅ Autonomy reduces back-and-forth
- ✅ Parallel tool execution
- ✅ Context maintained across steps
- ❌ Higher token usage
- ❌ More complex debugging

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
Do you need to encode expertise/anti-patterns?
├─ Yes → Skill (with decision trees, no execution)
└─ No → Is it multi-step with runtime decisions?
    ├─ Yes → Agent (orchestrates tools autonomously)
    └─ No → Is it a local operation?
        ├─ Yes → Script (stateless, no auth)
        └─ No → Does it require auth/external API?
            ├─ Yes → MCP Server (manages auth boundaries)
            └─ No → Script (with curl/CLI)
```

**Key Questions:**
1. **Expertise?** → Skill (anti-patterns, decision trees)
2. **Multi-step + decisions?** → Agent (tool orchestration)
3. **External API + auth?** → MCP (connection management)
4. **Everything else?** → Script (simple execution)

## Real-World Examples

### Good: CLIP Limitations as Skill
- Domain expertise (what NOT to use CLIP for)
- Anti-patterns with alternatives
- No runtime execution needed
- Prevents common mistakes before coding

### Good: Code Review as Agent
- Multi-step workflow (read → lint → test → summarize)
- Runtime decisions (which files to read)
- Tool orchestration (Read, Bash, Grep, Write)
- Autonomous execution

### Good: Git as Script
- CLI wrapper
- Local operations
- No auth needed
- Simple subprocess calls

### Good: Playwright as MCP
- Complex browser automation
- Stateful (browser context)
- Multiple related operations
- Security boundaries (sandbox)

### Good: Framework Evolution as Skill
- Temporal knowledge (pre-2024 vs 2024+)
- Warns about deprecated patterns
- Decision trees for migration
- No execution needed

### Good: Testing Pipeline as Agent
- Orchestrates test suite
- Parallel execution management
- State aggregation (pass/fail counts)
- Fail-fast logic

### Good: Image Processing as Script
- Local file operations
- Stateless transformations
- No network needed
- Simple input/output

### Good: AWS SDK as MCP
- Many related services
- Auth required
- Connection pooling
- Error handling standardization

## Summary

**Skills win on**:
- Domain expertise encoding
- Anti-pattern prevention
- Zero runtime overhead
- Context persistence
- Decision tree guidance

**Agents win on**:
- Multi-step orchestration
- Tool autonomy
- Runtime decision-making
- Workflow automation
- Parallel execution

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

**The Hierarchy**:
1. **Start with**: Direct tool use (Read, Edit, Bash)
2. **Extract to**: Script (when operation repeats)
3. **Add**: Skill (when expertise/anti-patterns emerge)
4. **Coordinate with**: Agent (when multi-step workflows appear)
5. **Promote to**: MCP (when auth/external APIs needed)

**The Rule**: Each layer adds complexity. Only add layers when the value justifies the cost.

---

## Further Reading

- `/references/antipatterns.md` - "MCP for Everything" anti-pattern
- `/examples/good/mcp-vs-script-comparison/` - Side-by-side examples
- Model Context Protocol docs: https://modelcontextprotocol.io/

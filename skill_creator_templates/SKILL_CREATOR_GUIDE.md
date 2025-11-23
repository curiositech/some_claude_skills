# Skill Creator Guide

Welcome to the Claude Skills Creator! This guide will help you create new custom skills, agents, and MCP integrations for this repository following Anthropic's Claude Skills format.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding Skill Types](#understanding-skill-types)
3. [Claude Skills Format](#claude-skills-format)
4. [Using the Templates](#using-the-templates)
5. [Step-by-Step Workflow](#step-by-step-workflow)
6. [Best Practices](#best-practices)
7. [Examples](#examples)
8. [Troubleshooting](#troubleshooting)

## Quick Start

### What You'll Create

A complete skill consists of:
- **Skill definition** (SKILL.md or `.md` file in `.github/agents/` with YAML frontmatter)
- **MCP server** (optional, for tool integration)
- **Documentation** (README, examples, usage)

### Claude Skills Format

All skills must follow Anthropic's Claude Skills format:

```markdown
---
name: Web Design Expert
description: Creates unique web designs with brand identity
---

# Web Design Expert

You are an expert web designer...
[detailed instructions follow]
```

**Required YAML Frontmatter**:
- `name`: Human-readable skill name
- `description`: Brief description of what the skill does

### 5-Minute Quick Start

1. **Choose your skill type**:
   - Pure conversational agent (no tools needed)
   - Agent with HTTP API integration
   - Agent with custom MCP tools

2. **Use the interactive agent creator**:
   ```
   [To Agent & Skill Creator]
   
   I want to create a skill for [your domain].
   It should help with [primary purpose].
   I need it to integrate with [API/service/none].
   ```

3. **The creator will**:
   - Ask clarifying questions
   - Generate skill definition with proper YAML frontmatter
   - Create MCP server code (if needed)
   - Provide setup instructions

## Understanding Skill Types

### Type 1: Conversational Agent (No Tools)

**Best For**:
- Expert knowledge and advice
- Creative work (design, writing)
- Strategic thinking
- Process guidance

**Example**: Design System Creator, Team Builder

**What You Need**:
- Agent markdown file only
- No code required

**Templates**:
- `agents/technical_expert_agent.md.template`
- `agents/creative_expert_agent.md.template`

### Type 2: HTTP API Integration

**Best For**:
- Third-party service integration
- RESTful API calls
- Simple data fetching
- Standard CRUD operations

**Example**: Weather service, GitHub integration, Slack integration

**What You Need**:
- Agent markdown file
- MCP server with HTTP tool
- API credentials/keys

**Templates**:
- `agents/technical_expert_agent.md.template`
- `mcp_servers/http_api_tool.ts.template`
- `mcp_servers/package.json.template`
- `mcp_servers/tsconfig.json.template`

### Type 3: Custom MCP Tools

**Best For**:
- Complex business logic
- File system operations
- Database queries
- Custom algorithms
- Multi-step workflows

**Example**: Code analysis, data transformation, local dev tools

**What You Need**:
- Agent markdown file
- Custom MCP server implementation
- Dependencies and configuration

**Templates**:
- `agents/technical_expert_agent.md.template`
- `mcp_servers/basic_mcp_server.ts.template`
- `mcp_servers/package.json.template`
- `mcp_servers/tsconfig.json.template`

## Using the Templates

### Template Variables

All templates use `{{VARIABLE}}` syntax. Replace these with your values:

#### Common Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{SKILL_NAME}}` | Human-readable skill name | "Weather Forecast Expert" |
| `{{SKILL_NAME_KEBAB}}` | Kebab-case name | "weather-forecast-expert" |
| `{{SKILL_NAME_SNAKE}}` | Snake_case name | "weather_forecast" |
| `{{SKILL_NAME_PASCAL}}` | PascalCase name | "WeatherForecast" |
| `{{SKILL_DESCRIPTION}}` | Brief description | "Provides weather forecasts via API" |
| `{{DOMAIN}}` | Domain of expertise | "meteorology and weather data" |
| `{{ROLE}}` | Expert role | "meteorologist" |
| `{{MISSION_STATEMENT}}` | Primary mission | "Provide accurate weather information" |

#### MCP Server Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{ENV_PREFIX}}` | Env var prefix | "WEATHER" (creates WEATHER_API_KEY) |
| `{{DEFAULT_API_URL}}` | Default API endpoint | "https://api.example.com/v1" |
| `{{SERVICE_NAME}}` | Service being integrated | "OpenWeatherMap" |
| `{{TOOL_NAME_SNAKE}}` | Tool name | "get_weather" |
| `{{TOOL_DESCRIPTION}}` | What the tool does | "Fetches current weather data" |
| `{{ORGANIZATION}}` | npm org/scope | "my-company" |

#### Agent Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{COMPETENCY_AREA_1}}` | Skill category | "Weather Data Analysis" |
| `{{SKILL_1}}` | Specific skill | "Temperature trend interpretation" |
| `{{PATTERN_1_NAME}}` | Pattern name | "Hourly Forecast Analysis" |
| `{{SCENARIO_1_NAME}}` | Example scenario | "Planning Outdoor Event" |

### How to Fill Templates

#### Method 1: Manual Replacement

1. Copy template file
2. Rename (remove `.template` extension)
3. Search and replace all `{{VARIABLES}}`
4. Customize content as needed

#### Method 2: Use the Agent Creator

1. Message the Agent & Skill Creator agent
2. Provide your requirements
3. It will generate filled templates
4. Review and customize

#### Method 3: Script (Coming Soon)

```bash
npm run create-skill --name "Weather Forecast" --type http-api
```

## Step-by-Step Workflow

### Workflow 1: Creating a Conversational Agent

**Goal**: Create an agent that provides expertise without needing external tools.

**Steps**:

1. **Define the Skill**
   ```
   - What expertise does this agent have?
   - What problems does it solve?
   - Who will use it?
   - What outputs should it produce?
   ```

2. **Choose Template**
   - Use `technical_expert_agent.md.template` for technical domains
   - Use `creative_expert_agent.md.template` for creative domains

3. **Fill the Template**
   - Replace all `{{VARIABLES}}`
   - Add domain-specific knowledge
   - Include examples and patterns
   - Write clear communication guidelines

4. **Save and Test**
   - Save to `.github/agents/your_skill_name.md`
   - Test by chatting with the agent
   - Refine based on results

**Time Required**: 30-60 minutes

### Workflow 2: Creating an HTTP API Integration

**Goal**: Create a skill that integrates with a third-party API.

**Steps**:

1. **Research the API**
   ```
   - What's the base URL?
   - How does authentication work?
   - What endpoints will you use?
   - What's the rate limit?
   ```

2. **Create Agent Definition**
   - Use `technical_expert_agent.md.template`
   - Document the tools in the MCP Tools section
   - Explain when to use each tool

3. **Create MCP Server**
   ```bash
   mkdir -p mcp_servers/your-skill-name/src
   cd mcp_servers/your-skill-name
   ```
   
   - Copy `http_api_tool.ts.template` to `src/index.ts`
   - Copy `package.json.template` to `package.json`
   - Copy `tsconfig.json.template` to `tsconfig.json`
   - Fill all templates

4. **Implement Tools**
   - Add tool definitions
   - Implement tool handlers
   - Add error handling
   - Test API calls

5. **Build and Test**
   ```bash
   npm install
   npm run build
   npm start  # Test locally
   ```

6. **Document Usage**
   - Create README.md
   - Add .env.example
   - Document API key setup
   - Provide example queries

**Time Required**: 2-4 hours

### Workflow 3: Creating Custom MCP Tools

**Goal**: Create a skill with custom business logic.

**Steps**:

1. **Design the Tools**
   ```
   - What operations are needed?
   - What are the inputs/outputs?
   - What validation is required?
   - What error cases exist?
   ```

2. **Create Directory Structure**
   ```bash
   mkdir -p mcp_servers/your-skill-name/src
   cd mcp_servers/your-skill-name
   ```

3. **Set Up Project**
   - Copy `basic_mcp_server.ts.template` to `src/index.ts`
   - Copy `package.json.template` and fill
   - Copy `tsconfig.json.template`
   - Add any additional dependencies

4. **Implement Tools**
   - Define tool schemas
   - Implement business logic
   - Add comprehensive error handling
   - Write helper functions

5. **Create Agent Definition**
   - Use `technical_expert_agent.md.template`
   - Document each tool clearly
   - Provide usage examples
   - Explain tool combinations

6. **Test Thoroughly**
   ```bash
   npm install
   npm run build
   # Test each tool
   # Test error cases
   # Test with Claude
   ```

7. **Document**
   - API documentation
   - Setup guide
   - Usage examples
   - Troubleshooting

**Time Required**: 4-8 hours

## Best Practices

### Agent Design

✅ **Do**:
- Give your agent a clear, specific mission
- Define distinct areas of expertise
- Include concrete examples
- Write in second person ("You are...")
- Provide decision-making frameworks
- Include quality standards

❌ **Don't**:
- Make the scope too broad
- Use vague or generic descriptions
- Forget to include examples
- Neglect error handling guidance
- Leave out communication style

### MCP Server Development

✅ **Do**:
- Validate all inputs
- Provide helpful error messages
- Use TypeScript for type safety
- Document your tool schemas
- Handle rate limits and retries
- Use environment variables for config
- Log errors to stderr, not stdout

❌ **Don't**:
- Hard-code API keys or secrets
- Ignore error cases
- Return cryptic error messages
- Skip input validation
- Mix stdout and stderr
- Leave console.log in production

### Tool Design

✅ **Do**:
- Design tools to be composable
- Keep tools focused (single responsibility)
- Provide clear descriptions
- Include usage examples
- Define required vs optional parameters
- Use semantic parameter names

❌ **Don't**:
- Create monolithic "do everything" tools
- Use unclear parameter names
- Skip parameter descriptions
- Forget edge cases
- Overcomplicate interfaces

### Documentation

✅ **Do**:
- Provide quick start guide
- Include complete examples
- Document environment setup
- Explain error messages
- Show common use cases
- Link to external resources

❌ **Don't**:
- Assume prior knowledge
- Skip setup instructions
- Forget API key documentation
- Leave out example queries
- Use jargon without explanation

## Examples

### Complete Examples Available

1. **[Weather Forecast Example](examples/weather_forecast_example.md)**
   - HTTP API integration
   - OpenWeatherMap API
   - Complete walkthrough

2. **Design Expert** (in repo)
   - Conversational agent
   - No tools needed
   - Creative domain

3. **Research Analyst** (in repo)
   - Analytical agent
   - No tools needed
   - Strategic thinking

### Example: Quick Agent Creation

**Prompt to Agent Creator**:
```
Create a skill for database query optimization. It should:
- Analyze SQL queries for performance issues
- Suggest index improvements
- Explain query execution plans
- Support PostgreSQL and MySQL
No external tools needed, pure conversational expertise.
```

**Output**: Complete agent definition ready to use.

### Example: API Integration

**Prompt to Agent Creator**:
```
Create a skill that integrates with the GitHub API to:
- Search repositories
- Get issue information
- Create pull requests
- Manage labels

Use the GitHub REST API v3.
Authentication via personal access token.
```

**Output**: 
- Agent definition
- MCP server implementation
- Setup instructions
- Example queries

## Troubleshooting

### Common Issues

#### "MCP server not found"

**Cause**: Server path incorrect in config

**Solution**:
```json
{
  "mcpServers": {
    "your-skill": {
      "command": "node",
      "args": [
        "/absolute/path/to/dist/index.js"  // Must be absolute!
      ]
    }
  }
}
```

#### "API key not configured"

**Cause**: Environment variable not set

**Solution**:
```json
{
  "mcpServers": {
    "your-skill": {
      "command": "node",
      "args": ["..."],
      "env": {
        "YOUR_API_KEY": "actual_key_here"
      }
    }
  }
}
```

#### "Tool not found"

**Cause**: Tool name mismatch

**Solution**: Ensure tool name in agent matches exactly:
```typescript
// In MCP server
tools: [{ name: "get_weather", ... }]

// In agent markdown
### `get_weather`  // Must match exactly!
```

#### "TypeScript compilation errors"

**Cause**: Missing dependencies or type errors

**Solution**:
```bash
npm install --save-dev @types/node
npm install @modelcontextprotocol/sdk
npm run build  # Check errors
```

#### "Agent not responding as expected"

**Cause**: Unclear instructions or missing context

**Solution**:
- Add more specific examples
- Clarify the mission statement
- Include decision-making frameworks
- Add "when to use" guidance

### Getting Help

1. **Check the examples**: See `examples/` directory
2. **Review existing agents**: Look at `.github/agents/`
3. **Use the Agent Creator**: It can help troubleshoot
4. **Read MCP docs**: https://modelcontextprotocol.io/
5. **Check SDK docs**: https://github.com/modelcontextprotocol/sdk

## Next Steps

Ready to create your first skill?

### Option 1: Start with a Template
1. Browse `skill_creator_templates/`
2. Copy the appropriate template
3. Fill in your values
4. Test and refine

### Option 2: Use the Agent Creator
1. Open a chat with "Agent & Skill Creator"
2. Describe what you want to build
3. Follow the guided workflow
4. Customize the output

### Option 3: Study an Example
1. Read through `examples/weather_forecast_example.md`
2. Follow along step-by-step
3. Adapt for your use case
4. Build and test

## Additional Resources

- **[CLAUDE_SKILLS_GUIDE.md](../CLAUDE_SKILLS_GUIDE.md)** - Understanding Claude Skills
- **[Agent Creator Agent](../.github/agents/agent_creator.md)** - Interactive skill creation
- **[MCP Documentation](https://modelcontextprotocol.io/)** - Official MCP docs
- **[SDK GitHub](https://github.com/modelcontextprotocol/sdk)** - MCP SDK source

---

**Happy skill creating!** 🚀

Remember: Start simple, test often, and iterate based on real usage.

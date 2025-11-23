# Skill Creator Templates

This directory contains templates and resources for creating new Claude Skills and MCP servers following Anthropic's Claude Skills format.

## ⚠️ Claude Skills Format Required

**All skills MUST include YAML frontmatter** as specified by Anthropic:

```markdown
---
name: Your Skill Name
description: Brief description of what the skill does
---

# Your Skill Name

[Skill content follows...]
```

All agent templates in this directory include the proper YAML frontmatter structure.

## 📁 Directory Structure

```
skill_creator_templates/
├── agents/                          # Agent definition templates
│   ├── technical_expert_agent.md.template  (includes YAML frontmatter)
│   └── creative_expert_agent.md.template   (includes YAML frontmatter)
├── mcp_servers/                     # MCP server code templates
│   ├── basic_mcp_server.ts.template
│   ├── http_api_tool.ts.template
│   ├── package.json.template
│   └── tsconfig.json.template
├── examples/                        # Complete examples
│   └── weather_forecast_example.md
├── SKILL_CREATOR_GUIDE.md          # Comprehensive guide
└── README.md                        # This file
```

## 🚀 Quick Start

### Option 1: Use the Agent Creator (Recommended)

The easiest way to create a new skill:

```
[To Agent & Skill Creator agent]

I want to create a skill for [your purpose].
It should help with [specific tasks].
```

The agent will guide you through the creation process interactively and ensure proper YAML frontmatter is included.

### Option 2: Use Templates Directly

1. **Choose your template type**:
   - Conversational agent: `agents/technical_expert_agent.md.template` or `agents/creative_expert_agent.md.template`
   - HTTP API integration: `mcp_servers/http_api_tool.ts.template`
   - Custom tools: `mcp_servers/basic_mcp_server.ts.template`

2. **Copy and fill the template**:
   - Replace all `{{VARIABLES}}` with your values
   - **Ensure `{{SKILL_NAME}}` and `{{SKILL_DESCRIPTION}}` are filled for YAML frontmatter**
   - Customize the content
   - Add domain-specific knowledge

3. **Save to the correct location**:
   - Agent definitions: `.github/agents/your_skill.md`
   - MCP servers: `mcp_servers/your-skill/`

4. **Build and test** (if creating MCP server):
   ```bash
   cd mcp_servers/your-skill
   npm install
   npm run build
   npm start
   ```

## 📚 Templates Available

### Agent Templates

#### `agents/technical_expert_agent.md.template`
For technical and engineering domains. **Includes YAML frontmatter.**

**Best for**:
- Software development skills
- DevOps and infrastructure
- Data analysis
- System architecture
- API design
- Testing and QA

**Includes**:
- YAML frontmatter (name, description)
- Technical competency areas
- Code examples and patterns
- Best practices and anti-patterns
- Problem-solving frameworks
- Quality standards

#### `agents/creative_expert_agent.md.template`
For creative and design domains. **Includes YAML frontmatter.**

**Best for**:
- Design and UX
- Content creation
- Branding
- Marketing
- Writing and editing
- Visual arts

**Includes**:
- YAML frontmatter (name, description)
- Creative process steps
- Inspiration sources
- Design principles
- Example creative directions
- Quality benchmarks

### MCP Server Templates

#### `mcp_servers/basic_mcp_server.ts.template`
General-purpose MCP server with custom tools.

**Best for**:
- Custom business logic
- File system operations
- Database queries
- Data transformations
- Multi-step workflows
- Local development tools

**Features**:
- Tool definition framework
- Input validation
- Error handling
- TypeScript types
- Extensible structure

#### `mcp_servers/http_api_tool.ts.template`
HTTP API integration template.

**Best for**:
- REST API integrations
- Third-party services
- SaaS platform tools
- Web scraping
- Data fetching

**Features**:
- HTTP request handling
- Authentication (Bearer token)
- Query parameters
- Request/response formatting
- Environment-based configuration

### Configuration Templates

#### `mcp_servers/package.json.template`
npm package configuration.

**Includes**:
- MCP SDK dependency
- Build scripts
- TypeScript configuration
- Package metadata

#### `mcp_servers/tsconfig.json.template`
TypeScript compiler configuration.

**Includes**:
- Modern ES2022 target
- Node16 module resolution
- Strict type checking
- Source maps and declarations

## 📖 Examples

### Complete Examples Available

#### Weather Forecast Example
**File**: `examples/weather_forecast_example.md`

A complete walkthrough showing:
- Defining a skill from scratch
- Creating an HTTP API integration
- Implementing the MCP server
- Setting up and testing
- Adding to Claude Desktop
- Usage examples

**Time to complete**: ~2-3 hours

Perfect for learning the entire process!

## 🎯 Template Variables

All templates use `{{VARIABLE}}` placeholders. Here are the most common:

### Naming Variables
- `{{SKILL_NAME}}` - Human-readable name: "Weather Forecast Expert"
- `{{SKILL_NAME_KEBAB}}` - Kebab case: "weather-forecast-expert"
- `{{SKILL_NAME_SNAKE}}` - Snake case: "weather_forecast"
- `{{SKILL_NAME_PASCAL}}` - Pascal case: "WeatherForecast"

### Domain Variables
- `{{DOMAIN}}` - Domain of expertise: "meteorology"
- `{{ROLE}}` - Expert role: "meteorologist"
- `{{MISSION_STATEMENT}}` - Primary purpose
- `{{SKILL_DESCRIPTION}}` - Brief description

### MCP Variables
- `{{ENV_PREFIX}}` - Environment variable prefix: "WEATHER"
- `{{DEFAULT_API_URL}}` - Default API endpoint
- `{{SERVICE_NAME}}` - Service name: "OpenWeatherMap"
- `{{TOOL_NAME_SNAKE}}` - Tool name in snake_case
- `{{TOOL_DESCRIPTION}}` - What the tool does

### Content Variables
- `{{COMPETENCY_AREA_1}}` - Skill category
- `{{SKILL_1}}` - Specific skill/capability
- `{{PATTERN_1_NAME}}` - Pattern or example name
- `{{EXAMPLE_CODE}}` - Code examples

## 📝 Documentation

### Comprehensive Guide
**[SKILL_CREATOR_GUIDE.md](SKILL_CREATOR_GUIDE.md)** - Read this for:
- Understanding skill types
- Step-by-step workflows
- Best practices
- Troubleshooting
- Complete examples

### Key Sections
1. **Quick Start** - Get going in 5 minutes
2. **Understanding Skill Types** - Choose the right approach
3. **Using Templates** - How to fill and customize
4. **Step-by-Step Workflows** - Detailed processes
5. **Best Practices** - Do's and don'ts
6. **Troubleshooting** - Common issues and solutions

## 🔧 Common Use Cases

### Creating a Conversational Expert
**What**: Agent that provides expertise without external tools

**Example**: SQL optimization expert, creative writing coach, accessibility consultant

**Templates Needed**:
- `agents/technical_expert_agent.md.template` OR
- `agents/creative_expert_agent.md.template`

**Time**: 30-60 minutes

### Creating an API Integration
**What**: Agent that calls external APIs

**Example**: Weather service, GitHub integration, translation service

**Templates Needed**:
- `agents/technical_expert_agent.md.template`
- `mcp_servers/http_api_tool.ts.template`
- `mcp_servers/package.json.template`
- `mcp_servers/tsconfig.json.template`

**Time**: 2-4 hours

### Creating Custom Tools
**What**: Agent with custom business logic

**Example**: Code analyzer, local file organizer, data transformer

**Templates Needed**:
- `agents/technical_expert_agent.md.template`
- `mcp_servers/basic_mcp_server.ts.template`
- `mcp_servers/package.json.template`
- `mcp_servers/tsconfig.json.template`

**Time**: 4-8 hours

## 💡 Tips for Success

### Agent Design
✅ Keep the mission clear and specific
✅ Include concrete examples
✅ Define quality standards
✅ Specify communication style
✅ Document when to use the skill

### MCP Development
✅ Validate all inputs
✅ Provide helpful error messages
✅ Use environment variables for config
✅ Write clear tool descriptions
✅ Include usage examples in docs

### Testing
✅ Test each tool individually
✅ Test error cases
✅ Verify with real Claude conversations
✅ Check environment setup docs
✅ Try common user queries

## 🆘 Getting Help

1. **Read the Guide**: [SKILL_CREATOR_GUIDE.md](SKILL_CREATOR_GUIDE.md)
2. **Study Examples**: See `examples/` directory
3. **Use the Agent Creator**: Ask questions interactively
4. **Check Existing Skills**: Review `.github/agents/`
5. **MCP Documentation**: https://modelcontextprotocol.io/

## 🚀 Next Steps

Ready to create your first skill?

1. **Decide what to build** - What capability do you need?
2. **Choose your approach**:
   - Quick: Chat with Agent Creator
   - Hands-on: Use templates directly
   - Learn: Follow the example
3. **Build and test** - Iterate until it works
4. **Share** - Add to your repo, help others!

---

**Happy skill creating!** 🎉

For more information, see the [main README](../README.md) or the [Skill Creator Guide](SKILL_CREATOR_GUIDE.md).

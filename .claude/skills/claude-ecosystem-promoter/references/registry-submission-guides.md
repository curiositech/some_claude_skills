# Registry Submission Guides

Detailed step-by-step instructions for submitting to each MCP registry and skills directory.

## 1. Official MCP Registry (Primary)

**URL**: https://registry.modelcontextprotocol.io
**Status**: Preview (launched September 2025)
**Impact**: Highest - feeds all downstream registries

### Submission Process

1. **Fork** the registry repo:
   ```bash
   git clone https://github.com/modelcontextprotocol/registry.git
   cd registry
   ```

2. **Create server entry** in `servers/` directory:
   ```yaml
   # servers/your-server-name.yaml
   name: your-server-name
   description: Brief description of what it does
   repository: https://github.com/your-org/your-server
   homepage: https://your-docs-site.com  # optional
   license: MIT
   author:
     name: Your Name
     url: https://github.com/your-username
   categories:
     - productivity  # or: database, communication, development, etc.
   tags:
     - relevant
     - keywords
   ```

3. **Submit PR** with:
   - Clear title: "Add [server-name] - [brief description]"
   - Description of what the server does
   - Link to working demo/docs

4. **Review process**: ~1-2 weeks for initial review

### Requirements
- Open source with permissive license
- Working installation instructions
- No malicious code or spam
- Follows MCP moderation guidelines

---

## 2. Smithery.ai

**URL**: https://smithery.ai
**Focus**: Hosted MCP servers with managed infrastructure
**Impact**: High - popular marketplace

### Submission Process

1. **Create account** at smithery.ai
2. **Navigate** to "Publish MCP" section
3. **Connect GitHub** repository
4. **Fill metadata**:
   - Server name and description
   - Categories and tags
   - Environment variables needed
   - Example prompts/use cases
5. **Submit for review**

### Tips
- Servers with one-click install get featured
- Good documentation increases visibility
- Respond to user feedback quickly

---

## 3. Glama.ai

**URL**: https://glama.ai/mcp/servers
**Focus**: Comprehensive MCP directory (12K+ servers)
**Impact**: High - excellent discoverability

### Submission Process

1. **Visit** glama.ai/mcp/servers
2. **Click** "Add Server" button
3. **Provide**:
   - GitHub repository URL
   - Description and categories
   - Installation instructions
   - Example use cases
4. **Auto-indexed** from GitHub within 24-48h

### Tips
- Ensure GitHub repo has good README
- Add relevant topics to GitHub repo
- Include screenshots/GIFs in README

---

## 4. PulseMCP.com

**URL**: https://pulsemcp.com
**Focus**: MCP news, newsletter, and directory
**Impact**: Medium-High - newsletter reaches engaged developers

### Submission Process

1. **Submit server** via website form
2. **Subscribe** to newsletter (shows engagement)
3. **Join Discord** at discord.gg/dP2evEyTjS
4. **Share** in #showcase channel

### Tips
- Quality submissions may be featured in weekly newsletter
- Engage in Discord for visibility
- Tadas (maintainer) is active and responsive

---

## 5. SkillsMP.com (Claude Skills)

**URL**: https://skillsmp.com
**Focus**: Claude Code skills aggregation (2300+)
**Impact**: Medium - automatic GitHub indexing

### How It Works

SkillsMP aggregates skills from GitHub automatically. To be listed:

1. **Ensure your skill repo** has:
   - `SKILL.md` file at root or in `.claude/skills/*/`
   - Proper YAML frontmatter
   - Clear description

2. **Add topics** to GitHub repo:
   - `claude-skill`
   - `claude-code`
   - `anthropic`

3. **Wait for indexing** (usually within 48h)

### Tips
- Use descriptive repo name
- Include example usage in README
- Add installation instructions

---

## 6. MCPMarket.com

**URL**: https://mcpmarket.com
**Focus**: MCP marketplace with categories
**Impact**: Medium

### Submission Process

1. **Visit** mcpmarket.com
2. **Click** "Submit Server"
3. **Fill form** with:
   - Repository URL
   - Category selection
   - Description
   - Installation method

---

## 7. Awesome Lists (GitHub)

### travisvn/awesome-claude-skills

**URL**: https://github.com/travisvn/awesome-claude-skills

1. **Fork** the repository
2. **Add entry** to appropriate section in README:
   ```markdown
   - [Skill Name](https://github.com/org/repo) - Brief description
   ```
3. **Submit PR** with:
   - Title: "Add [skill-name]"
   - Brief description of what it does
4. **Review** typically 3-7 days

### punkpeye/awesome-mcp-servers

**URL**: https://github.com/punkpeye/awesome-mcp-servers

1. **Fork** repository
2. **Add entry** under appropriate category
3. **Follow** CONTRIBUTING.md guidelines
4. **Submit PR**

### wong2/awesome-mcp-servers

**URL**: https://github.com/wong2/awesome-mcp-servers

Similar process - check their specific contribution guidelines.

---

## 8. modelcontextprotocol/servers (Reference)

**URL**: https://github.com/modelcontextprotocol/servers
**Focus**: Official reference implementations
**Impact**: Highest prestige, selective

### Submission Criteria
- Exceptional quality and documentation
- Broad utility to MCP ecosystem
- Maintained actively
- Security reviewed

### Process
1. **Open issue** first to discuss inclusion
2. **Get maintainer approval** before PR
3. **Submit PR** with complete implementation
4. **Extensive review** process

---

## Priority Order for Submissions

```
Day 0:  Official MCP Registry (primary source of truth)
Day 1:  Smithery.ai + Glama.ai (high visibility)
Day 2:  PulseMCP submission + Discord share
Day 3:  Awesome list PRs
Day 7:  MCPMarket + any remaining registries
```

## Tracking Submissions

| Registry | Submitted | Status | Listed | Notes |
|----------|-----------|--------|--------|-------|
| MCP Registry | | | | |
| Smithery | | | | |
| Glama | | | | |
| PulseMCP | | | | |
| SkillsMP | | | | |
| awesome-claude-skills | | | | |
| awesome-mcp-servers | | | | |

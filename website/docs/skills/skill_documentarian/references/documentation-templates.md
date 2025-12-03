---
title: Documentation Templates Reference
sidebar_label: Documentation Templates Ref...
sidebar_position: 3
---
# Documentation Templates Reference

Ready-to-use templates for various documentation types.

## README Template

```markdown
# Project Name

[One-paragraph description: what, why, for whom]

## Quick Start

\`\`\`bash
# Exact commands that work
npm install
npm start
\`\`\`

## Features

- Feature 1: [Brief description]
- Feature 2: [Brief description]

## Documentation

- [Getting Started](docs/getting-started.md)
- [API Reference](docs/api.md)
- [Architecture](docs/architecture.md)

## Contributing

[How to contribute]

## License

[License type]
```

## Tutorial Template

```markdown
# Tutorial: [Specific Outcome]

**Estimated time**: 15 minutes
**Difficulty**: Beginner/Intermediate/Advanced
**Prerequisites**:
- [Prerequisite 1]
- [Prerequisite 2]

## What You'll Build

[Description + optional screenshot]

## Step 1: [Verb + Noun]

**Why**: [Explain the purpose]

**How**:
\`\`\`bash
# Exact command
\`\`\`

**Result**: [What you should see]

## Step 2: ...

[Repeat pattern]

## Troubleshooting

**Problem**: [Common issue]
**Solution**: [How to fix]

## Next Steps

- [Related tutorial]
- [Advanced topic]
```

## API Reference Template

```markdown
# API Name

## Overview
[One paragraph: what it does, who it's for]

## Quick Start
[Minimal example that works]

## Endpoints

### GET /resource
**Purpose**: [One line]
**Parameters**:
- `param1` (string, required): [Description]
**Response**: [Example JSON]
**Errors**: [Common error codes]
```

## API Endpoint Template

```markdown
### `METHOD /endpoint`

**Purpose**: [One-line description]

**Authentication**: Required/Optional/None

**Parameters**:

| Name | Type | Required | Description |
|------|------|----------|-------------|
| param1 | string | Yes | [Description] |

**Request Example**:
\`\`\`http
POST /api/endpoint HTTP/1.1
Content-Type: application/json

{
  "param1": "value"
}
\`\`\`

**Response Example**:
\`\`\`json
{
  "success": true,
  "data": {...}
}
\`\`\`

**Error Responses**:
- `400 Bad Request`: [When this happens]
- `404 Not Found`: [When this happens]
```

## Architecture Documentation Template

```markdown
# System Architecture

## Overview
[Diagram + 2-3 sentences]

## Components
### Component Name
**Responsibility**: [One sentence]
**Dependencies**: [List]
**Key Files**: [Links with line numbers]

## Data Flow
[Sequence diagram or description]

## Decision Records
### ADR-001: [Decision Title]
**Context**: [Why we needed to decide]
**Decision**: [What we chose]
**Consequences**: [Trade-offs accepted]
```

## Skill CHANGELOG Template

```markdown
# Changelog

All notable changes to this skill will be documented in this file.
Format follows [Keep a Changelog](https://keepachangelog.com/).

## [1.2.0] - 2025-01-15

### Added
- NOT clause in description for precise activation
- "When to Use" / "When NOT to Use" sections
- 3 common anti-patterns with solutions

### Changed
- Expanded from 72 lines to 293 lines
- Added decision trees for core domain logic

### Fixed
- Removed reference to non-existent script

## [1.1.0] - 2024-12-15

### Added
- Anti-pattern section with 2 examples

### Changed
- Improved description keywords

## [1.0.0] - 2024-12-01

### Added
- Initial skill creation
- Core expertise documentation
```

## Style Guide

### Voice and Tone
- **Active voice**: "Run the command" not "The command should be run"
- **Second person**: "You can configure..." not "One can configure..."
- **Present tense**: "The function returns..." not "The function will return..."

### Formatting
- **Headers**: Use sentence case, not title case
- **Code**: Always use fenced code blocks with language
- **Lists**: Parallel structure (all verbs, all nouns, etc.)
- **Links**: Descriptive text, not "click here"

### Examples
```markdown
Good: Configure the API key in `.env`:
Bad: You should configure the API key

Good: Returns a list of users
Bad: Will return a list of users

Good: See the [Authentication Guide](./auth.md)
Bad: Click [here](./auth.md) for more info
```

## Quality Checklist

### Completeness
- [ ] All public APIs documented
- [ ] All configuration options explained
- [ ] Common use cases have examples
- [ ] Error messages have solutions

### Clarity
- [ ] Non-expert can follow quick start
- [ ] Examples are copy-paste ready
- [ ] Technical terms are defined
- [ ] Diagrams aid understanding

### Maintainability
- [ ] Docs versioned with code
- [ ] Last-updated dates present
- [ ] Broken links checked in CI
- [ ] Deprecated sections archived

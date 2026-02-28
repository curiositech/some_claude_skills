# Contributing to Claude Skills Collection

Thank you for your interest in contributing! This guide covers all the ways you can contribute skills and improvements to this project.

## Quick Start

### Option 1: Submit via Web Form (Easiest)

1. Visit [/submit-skill](https://claude-skills.com/submit-skill) on the website
2. Fill out the form with your skill details
3. Your submission creates a GitHub Issue for review
4. Once approved, your skill is added to the collection

### Option 2: Submit via GitHub Issue

1. Create a new issue with the label `skill-submission`
2. Include your SKILL.md content in a YAML code block:

```yaml
---
name: my-skill-name
description: What this skill does in 100-500 characters
category: Design & Creative
tags:
  - design
  - ui
allowed-tools: Read, Write, Edit
---

# My Skill Title

Your skill content goes here...

## When to Use

- Use case 1
- Use case 2
```

### Option 3: Submit a Pull Request

1. Fork the repository
2. Create your skill in `.claude/skills/your-skill-name/SKILL.md`
3. Run validation: `cd website && npm run skills:validate`
4. Submit a pull request

## Skill Requirements

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| `name` | Lowercase kebab-case ID (3-50 chars) | `my-awesome-skill` |
| `description` | Full description (50-500 chars) | `Comprehensive skill for...` |
| `category` | One of the valid categories | `Design & Creative` |
| `tags` | 1-10 relevant tags | `[design, ui, frontend]` |
| `allowed-tools` | Comma-separated tool list | `Read, Write, Edit, Bash` |

### Valid Categories

- AI & Machine Learning
- Code Quality & Testing
- Content & Writing
- Data & Analytics
- Design & Creative
- DevOps & Site Reliability
- Business & Monetization
- Research & Analysis
- Productivity & Meta
- Lifestyle & Personal

### Required Sections

Your SKILL.md must include:
- `## When to Use` - Clear usage guidance
- Main content describing what the skill does

## Development Setup

```bash
# Clone the repository
git clone https://github.com/curiositech/some_claude_skills.git
cd some_claude_skills/website

# Install dependencies
npm install

# Install git hooks
npm run install-hooks

# Start development server
npm start
```

## Useful Commands

### Skill Management

```bash
# Generate skills.ts and docs from SKILL.md files
npm run skills:generate

# Validate skills without generating
npm run skills:validate

# Watch for changes during development
npm run skills:watch
```

### Submission Processing

```bash
# List pending submissions
npm run submissions:list

# Validate a specific submission
npm run submissions:validate 42

# Create skill from submission
npm run submissions:create 42

# Process all pending submissions
npm run submissions:process-all
```

### Remote Registry

```bash
# Search for skills
npm run registry:search "machine learning"

# Import a skill from GitHub
npm run registry:import https://github.com/user/repo/blob/main/.claude/skills/my-skill/SKILL.md

# Validate before importing
npm run registry:validate <url>

# Publish local skills to registry
npm run registry:publish

# List all skills in registry
npm run registry:list
```

### Validation

```bash
# Run all validations
npm run validate:all

# Individual validators
npm run validate:liquid
npm run validate:brackets
npm run validate:props
npm run validate:badges
```

## Project Structure

```
.claude/skills/           # All SKILL.md files live here
  skill-name/
    SKILL.md              # The skill definition
    references/           # Optional supporting files
    templates/            # Optional templates
    examples/             # Optional examples

website/
  src/data/skills.ts      # AUTO-GENERATED - do not edit
  docs/skills/            # AUTO-GENERATED documentation
  src/pages/submit-skill.tsx  # Submission form
  scripts/
    generate-skills.ts    # Main generator
    batch-process-submissions.ts  # Submission CLI
    skill-registry.ts     # Registry CLI
```

## Code Style

- TypeScript for all scripts
- Use `tsx` for running scripts
- Follow existing patterns in the codebase
- Run `npm run typecheck` before submitting

## Testing Your Skill

Before submitting, test that your skill:

1. Has valid YAML frontmatter
2. Includes all required fields
3. Passes validation: `npm run skills:validate`
4. Builds correctly: `npm run build`

## Getting Help

- Open an issue for questions
- Check existing skills for examples
- Read the [Skill Management Architecture](/docs/guides/skill-management-architecture)

## License

By contributing, you agree that your contributions will be licensed under the project's license.

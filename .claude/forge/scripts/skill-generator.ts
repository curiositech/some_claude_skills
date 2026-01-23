#!/usr/bin/env npx tsx
/**
 * Skill Generator
 *
 * Generates new skill scaffolding from templates with customizable options.
 * Creates properly structured directories with boilerplate SKILL.md files.
 *
 * Usage:
 *   npx ts-node skill-generator.ts <skill-name> [options]
 *
 * Options:
 *   --category <cat>     Category for the skill (default: development)
 *   --complexity <level> beginner/intermediate/advanced (default: intermediate)
 *   --mcp                Include MCP integration section
 *   --resources          Create resources subdirectory
 *   --scripts            Create scripts subdirectory
 *   --interactive        Prompt for options interactively
 *   --output <dir>       Output directory (default: .claude/skills)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// ============================================================================
// Types
// ============================================================================

interface SkillConfig {
  name: string;
  displayName: string;
  description: string;
  category: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  includeMcp: boolean;
  includeResources: boolean;
  includeScripts: boolean;
  outputDir: string;
}

interface GenerationResult {
  success: boolean;
  path: string;
  filesCreated: string[];
  errors: string[];
}

// ============================================================================
// Constants
// ============================================================================

const CATEGORIES = [
  'development',
  'design',
  'devops',
  'data',
  'ml-ai',
  'testing',
  'documentation',
  'career',
  'productivity',
  'audio-visual',
  'research',
];

const DEFAULT_TAGS_BY_CATEGORY: Record<string, string[]> = {
  development: ['coding', 'software-engineering'],
  design: ['ui', 'ux', 'visual'],
  devops: ['infrastructure', 'automation', 'deployment'],
  data: ['analytics', 'processing', 'pipelines'],
  'ml-ai': ['machine-learning', 'ai', 'models'],
  testing: ['quality', 'automation', 'verification'],
  documentation: ['writing', 'technical-docs'],
  career: ['professional', 'growth'],
  productivity: ['efficiency', 'workflow'],
  'audio-visual': ['media', 'audio', 'video'],
  research: ['analysis', 'investigation'],
};

// ============================================================================
// Template Generator
// ============================================================================

function generateSkillMd(config: SkillConfig): string {
  const sections: string[] = [];

  // Frontmatter
  sections.push(`---
name: ${config.name}
description: >-
  ${config.description}
license: MIT
---`);

  // Title
  sections.push(`
# ${config.displayName}

${config.description}`);

  // When to Use
  sections.push(`
## When to Use This Skill

Use this skill when you need to:

- [Describe primary use case 1]
- [Describe primary use case 2]
- [Describe primary use case 3]

**Do NOT use this skill for:**

- [Anti-pattern or misuse case 1]
- [Anti-pattern or misuse case 2]`);

  // Core Concepts
  sections.push(`
## Core Concepts

### [Concept 1]

[Explain the first core concept]

### [Concept 2]

[Explain the second core concept]

### [Concept 3]

[Explain the third core concept]`);

  // Best Practices
  sections.push(`
## Best Practices

1. **[Practice 1]**: [Description of why this matters]
2. **[Practice 2]**: [Description of why this matters]
3. **[Practice 3]**: [Description of why this matters]`);

  // Common Pitfalls
  sections.push(`
## Common Pitfalls

### ❌ [Pitfall 1]

[Explain what the pitfall is and why it's problematic]

**Instead:** [Explain the correct approach]

### ❌ [Pitfall 2]

[Explain what the pitfall is and why it's problematic]

**Instead:** [Explain the correct approach]`);

  // Example Usage
  sections.push(`
## Example Usage

\`\`\`${config.category === 'development' ? 'typescript' : 'plaintext'}
// Example code or workflow demonstrating skill application
// Replace with actual, meaningful examples
\`\`\``);

  // MCP Integration (optional)
  if (config.includeMcp) {
    sections.push(`
## MCP Integration

This skill integrates with the following MCP servers:

### [MCP Server Name]

\`\`\`json
{
  "mcpServers": {
    "[server-name]": {
      "command": "[command]",
      "args": ["[args]"]
    }
  }
}
\`\`\`

**Available Tools:**

- \`tool_name\`: [Description of what this tool does]`);
  }

  // Resources (optional)
  if (config.includeResources) {
    sections.push(`
## Resources

Reference materials for this skill are stored in the \`references/\` directory:

- **references/[resource-name].md**: [Description]`);
  }

  // Quality Checklist
  sections.push(`
## Quality Checklist

Before completing work with this skill, verify:

- [ ] [Quality criterion 1]
- [ ] [Quality criterion 2]
- [ ] [Quality criterion 3]
- [ ] [Quality criterion 4]`);

  return sections.join('\n');
}

function generateReadme(config: SkillConfig): string {
  return `# ${config.displayName}

${config.description}

## Installation

This skill is part of the Some Claude Skills collection. To use it:

1. Copy the \`${config.name}\` directory to your \`.claude/skills/\` directory
2. Reference it in your Claude Code sessions

## Structure

\`\`\`
${config.name}/
├── SKILL.md          # Main skill definition
${config.includeResources ? '├── references/       # Reference materials\n' : ''}${config.includeScripts ? '├── scripts/          # Utility scripts\n' : ''}└── README.md         # This file
\`\`\`

## Category

**${config.category}** | Complexity: **${config.complexity}**

## Tags

${config.tags.map((t) => `\`${t}\``).join(' ')}

## License

MIT License - See the skill frontmatter for details.
`;
}

// ============================================================================
// Generator Functions
// ============================================================================

function kebabToDisplay(kebab: string): string {
  return kebab
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateSkill(config: SkillConfig): GenerationResult {
  const result: GenerationResult = {
    success: false,
    path: '',
    filesCreated: [],
    errors: [],
  };

  const skillPath = path.join(config.outputDir, config.name);
  result.path = skillPath;

  // Check if already exists
  if (fs.existsSync(skillPath)) {
    result.errors.push(`Skill directory already exists: ${skillPath}`);
    return result;
  }

  try {
    // Create main directory
    fs.mkdirSync(skillPath, { recursive: true });

    // Create SKILL.md
    const skillMdContent = generateSkillMd(config);
    const skillMdPath = path.join(skillPath, 'SKILL.md');
    fs.writeFileSync(skillMdPath, skillMdContent);
    result.filesCreated.push('SKILL.md');

    // Create README.md
    const readmeContent = generateReadme(config);
    const readmePath = path.join(skillPath, 'README.md');
    fs.writeFileSync(readmePath, readmeContent);
    result.filesCreated.push('README.md');

    // Create subdirectories
    if (config.includeResources) {
      const resourcesPath = path.join(skillPath, 'references');
      fs.mkdirSync(resourcesPath);

      // Create placeholder
      const placeholderPath = path.join(resourcesPath, '.gitkeep');
      fs.writeFileSync(placeholderPath, '');
      result.filesCreated.push('references/.gitkeep');
    }

    if (config.includeScripts) {
      const scriptsPath = path.join(skillPath, 'scripts');
      fs.mkdirSync(scriptsPath);

      // Create example script
      const exampleScript = `#!/usr/bin/env node
/**
 * Example utility script for ${config.displayName}
 *
 * Replace this with actual utility scripts for the skill.
 */

console.log('${config.displayName} utility script');
`;
      const scriptPath = path.join(scriptsPath, 'example.js');
      fs.writeFileSync(scriptPath, exampleScript);
      result.filesCreated.push('scripts/example.js');
    }

    result.success = true;
  } catch (error) {
    result.errors.push(
      `Failed to create skill: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return result;
}

// ============================================================================
// Interactive Mode
// ============================================================================

async function promptUser(question: string, defaultValue?: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer || defaultValue || '');
    });
  });
}

async function promptBoolean(question: string, defaultValue: boolean): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const defaultStr = defaultValue ? 'Y/n' : 'y/N';
    rl.question(`${question} [${defaultStr}]: `, (answer) => {
      rl.close();
      if (!answer) {
        resolve(defaultValue);
      } else {
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      }
    });
  });
}

async function promptChoice(
  question: string,
  choices: string[],
  defaultValue: string
): Promise<string> {
  console.log(`\n${question}`);
  choices.forEach((c, i) => {
    const marker = c === defaultValue ? '* ' : '  ';
    console.log(`${marker}${i + 1}. ${c}`);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`Select (1-${choices.length}) [${defaultValue}]: `, (answer) => {
      rl.close();
      if (!answer) {
        resolve(defaultValue);
      } else {
        const index = parseInt(answer, 10) - 1;
        if (index >= 0 && index < choices.length) {
          resolve(choices[index]);
        } else {
          resolve(defaultValue);
        }
      }
    });
  });
}

async function runInteractive(baseName: string, outputDir: string): Promise<SkillConfig | null> {
  console.log('\n🔧 Skill Generator - Interactive Mode\n');
  console.log('Press Enter to accept default values shown in brackets.\n');

  // Name
  const name = await promptUser('Skill name (kebab-case)', baseName);
  if (!name) {
    console.error('Skill name is required');
    return null;
  }

  // Validate name
  const kebabCaseRegex = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
  if (!kebabCaseRegex.test(name)) {
    console.error('Skill name must be kebab-case (e.g., "my-skill-name")');
    return null;
  }

  // Display name
  const displayName = await promptUser('Display name', kebabToDisplay(name));

  // Description
  const description = await promptUser(
    'Brief description',
    `Use this skill when you need to ${name.replace(/-/g, ' ')}`
  );

  // Category
  const category = await promptChoice('Select category:', CATEGORIES, 'development');

  // Complexity
  const complexity = (await promptChoice('Select complexity:', [
    'beginner',
    'intermediate',
    'advanced',
  ], 'intermediate')) as 'beginner' | 'intermediate' | 'advanced';

  // Tags
  const defaultTags = DEFAULT_TAGS_BY_CATEGORY[category] || [];
  const tagsInput = await promptUser('Tags (comma-separated)', defaultTags.join(', '));
  const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

  // Options
  const includeMcp = await promptBoolean('Include MCP integration section?', false);
  const includeResources = await promptBoolean('Create references/ directory?', true);
  const includeScripts = await promptBoolean('Create scripts/ directory?', false);

  return {
    name,
    displayName,
    description,
    category,
    complexity,
    tags,
    includeMcp,
    includeResources,
    includeScripts,
    outputDir,
  };
}

// ============================================================================
// CLI
// ============================================================================

function printUsage(): void {
  console.log(`
Skill Generator
===============

Generates new skill scaffolding from templates.

Usage:
  npx ts-node skill-generator.ts <skill-name> [options]

Arguments:
  <skill-name>    Name for the new skill (kebab-case)

Options:
  --category <cat>     Category (default: development)
                       Available: ${CATEGORIES.join(', ')}
  --complexity <level> beginner, intermediate, advanced (default: intermediate)
  --mcp                Include MCP integration section
  --resources          Create references/ subdirectory (default: true)
  --no-resources       Skip references/ subdirectory
  --scripts            Create scripts/ subdirectory
  --interactive        Run in interactive mode
  --output <dir>       Output directory (default: .claude/skills)
  --help               Show this help message

Examples:
  npx ts-node skill-generator.ts api-optimization-expert
  npx ts-node skill-generator.ts ui-testing-specialist --category testing --mcp
  npx ts-node skill-generator.ts --interactive
`);
}

function parseArgs(args: string[]): {
  skillName: string | null;
  options: Partial<SkillConfig> & { interactive: boolean; help: boolean };
} {
  const options: Partial<SkillConfig> & { interactive: boolean; help: boolean } = {
    interactive: false,
    help: false,
    includeResources: true,
    includeScripts: false,
    includeMcp: false,
    outputDir: path.join(process.cwd(), '.claude', 'skills'),
  };

  let skillName: string | null = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--interactive':
      case '-i':
        options.interactive = true;
        break;
      case '--mcp':
        options.includeMcp = true;
        break;
      case '--resources':
        options.includeResources = true;
        break;
      case '--no-resources':
        options.includeResources = false;
        break;
      case '--scripts':
        options.includeScripts = true;
        break;
      case '--category':
        options.category = args[++i];
        break;
      case '--complexity':
        options.complexity = args[++i] as 'beginner' | 'intermediate' | 'advanced';
        break;
      case '--output':
        options.outputDir = args[++i];
        break;
      default:
        if (!arg.startsWith('-') && !skillName) {
          skillName = arg;
        }
    }
  }

  return { skillName, options };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const { skillName, options } = parseArgs(args);

  if (options.help) {
    printUsage();
    process.exit(0);
  }

  let config: SkillConfig;

  if (options.interactive || !skillName) {
    const interactiveConfig = await runInteractive(skillName || '', options.outputDir!);
    if (!interactiveConfig) {
      process.exit(1);
    }
    config = interactiveConfig;
  } else {
    // Build config from CLI args
    config = {
      name: skillName,
      displayName: kebabToDisplay(skillName),
      description: `Use this skill when you need to ${skillName.replace(/-/g, ' ')}`,
      category: options.category || 'development',
      complexity: options.complexity || 'intermediate',
      tags: DEFAULT_TAGS_BY_CATEGORY[options.category || 'development'] || [],
      includeMcp: options.includeMcp || false,
      includeResources: options.includeResources ?? true,
      includeScripts: options.includeScripts || false,
      outputDir: options.outputDir!,
    };
  }

  // Generate skill
  console.log(`\n🚀 Generating skill: ${config.name}\n`);

  const result = generateSkill(config);

  if (result.success) {
    console.log('✅ Skill generated successfully!\n');
    console.log(`📁 Location: ${result.path}\n`);
    console.log('Files created:');
    for (const file of result.filesCreated) {
      console.log(`  - ${file}`);
    }
    console.log(`
Next steps:
1. Edit SKILL.md to fill in the placeholder content
2. Add reference materials to references/ if needed
3. Validate with: npx ts-node .claude/forge/scripts/skill-md-validator.ts ${result.path}
`);
    process.exit(0);
  } else {
    console.error('❌ Failed to generate skill:\n');
    for (const error of result.errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }
}

main().catch(console.error);

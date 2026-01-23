#!/usr/bin/env npx ts-node

/**
 * SKILL.md Validator
 *
 * Validates SKILL.md files for:
 * - YAML frontmatter correctness
 * - Required structure elements
 * - Anti-patterns and common mistakes
 * - Resource references validity
 *
 * Usage:
 *   npx ts-node skill-md-validator.ts <path-to-skill.md>
 *   npx ts-node skill-md-validator.ts <path-to-skill-directory>
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

interface ValidationResult {
  valid: boolean;
  filePath: string;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  info: ValidationInfo[];
  metrics: SkillMetrics;
}

interface ValidationError {
  code: string;
  message: string;
  line?: number;
  severity: 'error';
}

interface ValidationWarning {
  code: string;
  message: string;
  line?: number;
  severity: 'warning';
}

interface ValidationInfo {
  code: string;
  message: string;
  severity: 'info';
}

interface SkillMetrics {
  totalLines: number;
  totalBytes: number;
  frontmatterLines: number;
  codeBlockCount: number;
  headingCount: number;
  bulletPointCount: number;
  estimatedTokens: number;
}

interface ParsedFrontmatter {
  name?: string;
  description?: string;
  license?: string;
  [key: string]: unknown;
}

interface ParsedSkillMd {
  frontmatter: ParsedFrontmatter;
  frontmatterRaw: string;
  frontmatterStartLine: number;
  frontmatterEndLine: number;
  content: string;
  contentStartLine: number;
  headings: HeadingInfo[];
  codeBlocks: CodeBlockInfo[];
  resourceReferences: ResourceReference[];
}

interface HeadingInfo {
  level: number;
  text: string;
  line: number;
}

interface CodeBlockInfo {
  language: string;
  startLine: number;
  endLine: number;
  content: string;
}

interface ResourceReference {
  path: string;
  line: number;
  type: 'scripts' | 'references' | 'assets' | 'unknown';
}

// ============================================================================
// Constants
// ============================================================================

const REQUIRED_FRONTMATTER_FIELDS = ['name', 'description'];

const RECOMMENDED_SECTIONS = [
  'When to Use This Skill',
  'Core Concepts',
  'Best Practices',
  'Common Pitfalls',
];

const OPTIONAL_SECTIONS = [
  'Quick Start',
  'Resources',
  'Examples',
  'Patterns',
];

const MAX_RECOMMENDED_LINES = 500;
const MAX_DESCRIPTION_LENGTH = 300;
const MIN_DESCRIPTION_LENGTH = 50;

const KEBAB_CASE_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

// Anti-patterns to detect
const ANTI_PATTERNS = [
  {
    code: 'AP001',
    pattern: /README\.md/i,
    message: 'Avoid including README.md references - keep skill focused on task execution',
  },
  {
    code: 'AP002',
    pattern: /INSTALLATION[_-]?GUIDE\.md/i,
    message: 'Avoid installation guides - assume environment is already set up',
  },
  {
    code: 'AP003',
    pattern: /CHANGELOG\.md/i,
    message: 'Avoid changelogs - they add noise without aiding task execution',
  },
  {
    code: 'AP004',
    pattern: /TODO:|FIXME:|XXX:/,
    message: 'Remove TODO/FIXME/XXX comments - skill should be complete',
  },
  {
    code: 'AP005',
    pattern: /\[placeholder\]|\[TBD\]|\[TODO\]/i,
    message: 'Replace placeholders with actual content',
  },
  {
    code: 'AP006',
    pattern: /```\s*\n\s*\n```/,
    message: 'Empty code block detected - add meaningful examples',
  },
  {
    code: 'AP007',
    pattern: /^#{1,6}\s*$/m,
    message: 'Empty heading detected - add heading text',
  },
  {
    code: 'AP008',
    pattern: /https?:\/\/localhost/,
    message: 'Localhost URLs should be replaced with example.com or parameterized',
  },
  {
    code: 'AP009',
    pattern: /password\s*[:=]\s*['"][^'"]+['"]/i,
    message: 'Hardcoded password detected - use placeholders like <PASSWORD>',
  },
  {
    code: 'AP010',
    pattern: /api[_-]?key\s*[:=]\s*['"][a-zA-Z0-9]{20,}['"]/i,
    message: 'Possible API key detected - use placeholders like <API_KEY>',
  },
];

// ============================================================================
// Parser
// ============================================================================

function parseFrontmatter(content: string): {
  frontmatter: ParsedFrontmatter;
  raw: string;
  startLine: number;
  endLine: number;
  rest: string;
  restStartLine: number;
} | null {
  const lines = content.split('\n');

  // Check for opening ---
  if (lines[0]?.trim() !== '---') {
    return null;
  }

  // Find closing ---
  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i]?.trim() === '---') {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    return null;
  }

  const frontmatterLines = lines.slice(1, endIndex);
  const raw = frontmatterLines.join('\n');
  const rest = lines.slice(endIndex + 1).join('\n');

  // Simple YAML parser for frontmatter
  const frontmatter: ParsedFrontmatter = {};
  let currentKey: string | null = null;
  let currentValue: string[] = [];

  for (const line of frontmatterLines) {
    const keyMatch = line.match(/^(\w+):\s*(.*)$/);
    if (keyMatch) {
      // Save previous key-value if exists
      if (currentKey) {
        frontmatter[currentKey] = currentValue.length > 1
          ? currentValue.join('\n').trim()
          : currentValue[0]?.trim() || '';
      }
      currentKey = keyMatch[1];
      currentValue = keyMatch[2] ? [keyMatch[2]] : [];
    } else if (currentKey && line.startsWith('  ')) {
      // Multi-line value continuation
      currentValue.push(line.trim());
    }
  }

  // Save last key-value
  if (currentKey) {
    frontmatter[currentKey] = currentValue.length > 1
      ? currentValue.join('\n').trim()
      : currentValue[0]?.trim() || '';
  }

  return {
    frontmatter,
    raw,
    startLine: 1,
    endLine: endIndex + 1,
    rest,
    restStartLine: endIndex + 2,
  };
}

function parseHeadings(content: string, startLine: number): HeadingInfo[] {
  const headings: HeadingInfo[] = [];
  const lines = content.split('\n');

  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track code blocks to avoid parsing headings inside them
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      headings.push({
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
        line: startLine + i,
      });
    }
  }

  return headings;
}

function parseCodeBlocks(content: string, startLine: number): CodeBlockInfo[] {
  const blocks: CodeBlockInfo[] = [];
  const lines = content.split('\n');

  let inBlock = false;
  let blockStart = 0;
  let blockLanguage = '';
  let blockContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('```')) {
      if (!inBlock) {
        inBlock = true;
        blockStart = startLine + i;
        blockLanguage = line.slice(3).trim();
        blockContent = [];
      } else {
        blocks.push({
          language: blockLanguage,
          startLine: blockStart,
          endLine: startLine + i,
          content: blockContent.join('\n'),
        });
        inBlock = false;
      }
    } else if (inBlock) {
      blockContent.push(line);
    }
  }

  return blocks;
}

function parseResourceReferences(content: string, startLine: number): ResourceReference[] {
  const refs: ResourceReference[] = [];
  const lines = content.split('\n');

  // Patterns for resource references
  const patterns = [
    /\*\*(?:scripts|references|assets)\/([^*]+)\*\*/g,
    /`(?:scripts|references|assets)\/([^`]+)`/g,
    /\[(?:[^\]]+)\]\((?:scripts|references|assets)\/([^)]+)\)/g,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    for (const pattern of patterns) {
      let match;
      pattern.lastIndex = 0;
      while ((match = pattern.exec(line)) !== null) {
        const fullMatch = match[0];
        let type: ResourceReference['type'] = 'unknown';

        if (fullMatch.includes('scripts/')) type = 'scripts';
        else if (fullMatch.includes('references/')) type = 'references';
        else if (fullMatch.includes('assets/')) type = 'assets';

        refs.push({
          path: match[1],
          line: startLine + i,
          type,
        });
      }
    }
  }

  return refs;
}

function parseSkillMd(content: string, filePath: string): ParsedSkillMd | null {
  const parsed = parseFrontmatter(content);

  if (!parsed) {
    return null;
  }

  const headings = parseHeadings(parsed.rest, parsed.restStartLine);
  const codeBlocks = parseCodeBlocks(parsed.rest, parsed.restStartLine);
  const resourceReferences = parseResourceReferences(parsed.rest, parsed.restStartLine);

  return {
    frontmatter: parsed.frontmatter,
    frontmatterRaw: parsed.raw,
    frontmatterStartLine: parsed.startLine,
    frontmatterEndLine: parsed.endLine,
    content: parsed.rest,
    contentStartLine: parsed.restStartLine,
    headings,
    codeBlocks,
    resourceReferences,
  };
}

// ============================================================================
// Validators
// ============================================================================

function validateFrontmatter(
  parsed: ParsedSkillMd,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const { frontmatter } = parsed;

  // Check required fields
  for (const field of REQUIRED_FRONTMATTER_FIELDS) {
    if (!frontmatter[field]) {
      errors.push({
        code: 'FM001',
        message: `Missing required frontmatter field: ${field}`,
        line: parsed.frontmatterStartLine,
        severity: 'error',
      });
    }
  }

  // Validate 'name' field
  if (frontmatter.name) {
    const name = String(frontmatter.name);

    if (!KEBAB_CASE_REGEX.test(name)) {
      errors.push({
        code: 'FM002',
        message: `Skill name must be kebab-case (e.g., "api-design-principles"), got: "${name}"`,
        line: parsed.frontmatterStartLine,
        severity: 'error',
      });
    }

    if (name.length > 50) {
      warnings.push({
        code: 'FM003',
        message: `Skill name is quite long (${name.length} chars) - consider shortening`,
        line: parsed.frontmatterStartLine,
        severity: 'warning',
      });
    }
  }

  // Validate 'description' field
  if (frontmatter.description) {
    const desc = String(frontmatter.description);

    if (desc.length < MIN_DESCRIPTION_LENGTH) {
      warnings.push({
        code: 'FM004',
        message: `Description is quite short (${desc.length} chars) - aim for ${MIN_DESCRIPTION_LENGTH}+ chars`,
        line: parsed.frontmatterStartLine,
        severity: 'warning',
      });
    }

    if (desc.length > MAX_DESCRIPTION_LENGTH) {
      warnings.push({
        code: 'FM005',
        message: `Description is long (${desc.length} chars) - consider trimming to under ${MAX_DESCRIPTION_LENGTH} chars`,
        line: parsed.frontmatterStartLine,
        severity: 'warning',
      });
    }

    // Check for "Use when" pattern - recommended
    if (!desc.toLowerCase().includes('use when') && !desc.toLowerCase().includes('use for')) {
      warnings.push({
        code: 'FM006',
        message: 'Description should include "Use when..." or "Use for..." guidance',
        line: parsed.frontmatterStartLine,
        severity: 'warning',
      });
    }
  }
}

function validateStructure(
  parsed: ParsedSkillMd,
  errors: ValidationError[],
  warnings: ValidationWarning[],
  info: ValidationInfo[]
): void {
  const { headings } = parsed;

  // Check for H1 heading (title)
  const h1Headings = headings.filter(h => h.level === 1);
  if (h1Headings.length === 0) {
    errors.push({
      code: 'ST001',
      message: 'Missing H1 title heading',
      severity: 'error',
    });
  } else if (h1Headings.length > 1) {
    warnings.push({
      code: 'ST002',
      message: `Multiple H1 headings found (${h1Headings.length}) - should have exactly one`,
      line: h1Headings[1].line,
      severity: 'warning',
    });
  }

  // Check heading hierarchy
  let prevLevel = 0;
  for (const heading of headings) {
    if (heading.level > prevLevel + 1 && prevLevel > 0) {
      warnings.push({
        code: 'ST003',
        message: `Heading level jumped from H${prevLevel} to H${heading.level} - should be sequential`,
        line: heading.line,
        severity: 'warning',
      });
    }
    prevLevel = heading.level;
  }

  // Check for recommended sections
  const headingTexts = headings.map(h => h.text.toLowerCase());

  for (const section of RECOMMENDED_SECTIONS) {
    const found = headingTexts.some(t =>
      t.includes(section.toLowerCase()) ||
      section.toLowerCase().includes(t)
    );

    if (!found) {
      warnings.push({
        code: 'ST004',
        message: `Missing recommended section: "${section}"`,
        severity: 'warning',
      });
    }
  }

  // Info about optional sections found
  for (const section of OPTIONAL_SECTIONS) {
    const found = headingTexts.some(t =>
      t.includes(section.toLowerCase()) ||
      section.toLowerCase().includes(t)
    );

    if (found) {
      info.push({
        code: 'ST005',
        message: `Found optional section: "${section}"`,
        severity: 'info',
      });
    }
  }

  // Check for code blocks
  if (parsed.codeBlocks.length === 0) {
    warnings.push({
      code: 'ST006',
      message: 'No code blocks found - skills typically include code examples',
      severity: 'warning',
    });
  }

  // Check code blocks have languages specified
  for (const block of parsed.codeBlocks) {
    if (!block.language) {
      warnings.push({
        code: 'ST007',
        message: 'Code block without language specification',
        line: block.startLine,
        severity: 'warning',
      });
    }
  }
}

function validateAntiPatterns(
  content: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const lines = content.split('\n');

  for (const ap of ANTI_PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      if (ap.pattern.test(lines[i])) {
        warnings.push({
          code: ap.code,
          message: ap.message,
          line: i + 1,
          severity: 'warning',
        });
      }
    }
  }
}

function validateResourceReferences(
  parsed: ParsedSkillMd,
  skillDir: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  for (const ref of parsed.resourceReferences) {
    const fullPath = path.join(skillDir, ref.type, ref.path);

    if (!fs.existsSync(fullPath)) {
      errors.push({
        code: 'RR001',
        message: `Referenced resource does not exist: ${ref.type}/${ref.path}`,
        line: ref.line,
        severity: 'error',
      });
    }
  }

  // Check for unreferenced resources
  const resourceDirs = ['scripts', 'references', 'assets'];

  for (const dir of resourceDirs) {
    const dirPath = path.join(skillDir, dir);

    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const isReferenced = parsed.resourceReferences.some(
          r => r.type === dir && r.path === file
        );

        if (!isReferenced) {
          warnings.push({
            code: 'RR002',
            message: `Unreferenced resource: ${dir}/${file}`,
            severity: 'warning',
          });
        }
      }
    }
  }
}

function validateLength(
  content: string,
  warnings: ValidationWarning[],
  metrics: SkillMetrics
): void {
  if (metrics.totalLines > MAX_RECOMMENDED_LINES) {
    warnings.push({
      code: 'LN001',
      message: `File exceeds recommended length (${metrics.totalLines} lines > ${MAX_RECOMMENDED_LINES} max)`,
      severity: 'warning',
    });
  }

  // Warn if estimated tokens are high
  if (metrics.estimatedTokens > 4000) {
    warnings.push({
      code: 'LN002',
      message: `High estimated token count (~${metrics.estimatedTokens}) - consider moving content to references`,
      severity: 'warning',
    });
  }
}

// ============================================================================
// Metrics Calculator
// ============================================================================

function calculateMetrics(content: string, parsed: ParsedSkillMd): SkillMetrics {
  const lines = content.split('\n');
  const bulletPoints = content.match(/^[\s]*[-*+]\s/gm) || [];

  // Rough token estimation (4 chars per token average for English)
  const estimatedTokens = Math.ceil(content.length / 4);

  return {
    totalLines: lines.length,
    totalBytes: Buffer.byteLength(content, 'utf8'),
    frontmatterLines: parsed.frontmatterEndLine - parsed.frontmatterStartLine + 1,
    codeBlockCount: parsed.codeBlocks.length,
    headingCount: parsed.headings.length,
    bulletPointCount: bulletPoints.length,
    estimatedTokens,
  };
}

// ============================================================================
// Main Validator
// ============================================================================

export function validateSkillMd(filePath: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const info: ValidationInfo[] = [];

  // Resolve path
  const resolvedPath = path.resolve(filePath);
  let skillMdPath = resolvedPath;
  let skillDir = path.dirname(resolvedPath);

  // If directory provided, look for SKILL.md
  if (fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isDirectory()) {
    skillMdPath = path.join(resolvedPath, 'SKILL.md');
    skillDir = resolvedPath;
  }

  // Check file exists
  if (!fs.existsSync(skillMdPath)) {
    return {
      valid: false,
      filePath: skillMdPath,
      errors: [{
        code: 'FILE001',
        message: `File not found: ${skillMdPath}`,
        severity: 'error',
      }],
      warnings: [],
      info: [],
      metrics: {
        totalLines: 0,
        totalBytes: 0,
        frontmatterLines: 0,
        codeBlockCount: 0,
        headingCount: 0,
        bulletPointCount: 0,
        estimatedTokens: 0,
      },
    };
  }

  // Read file
  const content = fs.readFileSync(skillMdPath, 'utf8');

  // Parse
  const parsed = parseSkillMd(content, skillMdPath);

  if (!parsed) {
    errors.push({
      code: 'PARSE001',
      message: 'Failed to parse SKILL.md - missing or malformed YAML frontmatter',
      line: 1,
      severity: 'error',
    });

    return {
      valid: false,
      filePath: skillMdPath,
      errors,
      warnings,
      info,
      metrics: {
        totalLines: content.split('\n').length,
        totalBytes: Buffer.byteLength(content, 'utf8'),
        frontmatterLines: 0,
        codeBlockCount: 0,
        headingCount: 0,
        bulletPointCount: 0,
        estimatedTokens: Math.ceil(content.length / 4),
      },
    };
  }

  // Calculate metrics
  const metrics = calculateMetrics(content, parsed);

  // Run validations
  validateFrontmatter(parsed, errors, warnings);
  validateStructure(parsed, errors, warnings, info);
  validateAntiPatterns(content, errors, warnings);
  validateResourceReferences(parsed, skillDir, errors, warnings);
  validateLength(content, warnings, metrics);

  // Add metrics info
  info.push({
    code: 'METRICS',
    message: `Lines: ${metrics.totalLines}, Bytes: ${metrics.totalBytes}, Code blocks: ${metrics.codeBlockCount}, Est. tokens: ${metrics.estimatedTokens}`,
    severity: 'info',
  });

  return {
    valid: errors.length === 0,
    filePath: skillMdPath,
    errors,
    warnings,
    info,
    metrics,
  };
}

// ============================================================================
// CLI Interface
// ============================================================================

function formatResult(result: ValidationResult): string {
  const output: string[] = [];

  output.push(`\n${'='.repeat(70)}`);
  output.push(`SKILL.md Validation Report`);
  output.push(`${'='.repeat(70)}`);
  output.push(`File: ${result.filePath}`);
  output.push(`Status: ${result.valid ? '✓ VALID' : '✗ INVALID'}`);
  output.push(`${'='.repeat(70)}\n`);

  if (result.errors.length > 0) {
    output.push(`ERRORS (${result.errors.length}):`);
    for (const err of result.errors) {
      const lineInfo = err.line ? `:${err.line}` : '';
      output.push(`  ✗ [${err.code}]${lineInfo} ${err.message}`);
    }
    output.push('');
  }

  if (result.warnings.length > 0) {
    output.push(`WARNINGS (${result.warnings.length}):`);
    for (const warn of result.warnings) {
      const lineInfo = warn.line ? `:${warn.line}` : '';
      output.push(`  ⚠ [${warn.code}]${lineInfo} ${warn.message}`);
    }
    output.push('');
  }

  if (result.info.length > 0) {
    output.push(`INFO (${result.info.length}):`);
    for (const inf of result.info) {
      output.push(`  ℹ [${inf.code}] ${inf.message}`);
    }
    output.push('');
  }

  output.push(`METRICS:`);
  output.push(`  Total lines: ${result.metrics.totalLines}`);
  output.push(`  Total bytes: ${result.metrics.totalBytes}`);
  output.push(`  Frontmatter lines: ${result.metrics.frontmatterLines}`);
  output.push(`  Code blocks: ${result.metrics.codeBlockCount}`);
  output.push(`  Headings: ${result.metrics.headingCount}`);
  output.push(`  Bullet points: ${result.metrics.bulletPointCount}`);
  output.push(`  Estimated tokens: ${result.metrics.estimatedTokens}`);

  return output.join('\n');
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
SKILL.md Validator
==================

Usage:
  npx ts-node skill-md-validator.ts <path>

Arguments:
  <path>  Path to SKILL.md file or skill directory

Options:
  --json  Output results as JSON

Examples:
  npx ts-node skill-md-validator.ts ./my-skill/SKILL.md
  npx ts-node skill-md-validator.ts ./my-skill/
  npx ts-node skill-md-validator.ts ./my-skill/ --json
`);
    process.exit(0);
  }

  const targetPath = args[0];
  const jsonOutput = args.includes('--json');

  const result = validateSkillMd(targetPath);

  if (jsonOutput) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatResult(result));
  }

  process.exit(result.valid ? 0 : 1);
}

// Export for programmatic use
export { ValidationResult, ValidationError, ValidationWarning, ValidationInfo, SkillMetrics };

/**
 * SKILL.md Parser
 *
 * Parses SKILL.md files with YAML frontmatter and extracts all skill metadata.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import {
  ParsedSkill,
  SkillFrontmatter,
  SkillSource,
  SkillReference,
  SkillScript,
  SkillPairing,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  SKILL_CATEGORIES,
} from './types';

// =============================================================================
// FRONTMATTER PARSING
// =============================================================================

interface ParsedFrontmatter {
  frontmatter: SkillFrontmatter;
  content: string;
  raw: string;
}

export function parseFrontmatter(fileContent: string): ParsedFrontmatter | null {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;
  const match = fileContent.match(frontmatterRegex);

  if (!match) {
    return null;
  }

  try {
    const frontmatter = yaml.parse(match[1]) as SkillFrontmatter;
    return {
      frontmatter,
      content: match[2].trim(),
      raw: match[1],
    };
  } catch (error) {
    console.error('Failed to parse YAML frontmatter:', error);
    return null;
  }
}

// =============================================================================
// SKILL PARSING
// =============================================================================

export function parseSkillFile(
  skillPath: string,
  source: SkillSource
): ParsedSkill | null {
  const skillMdPath = path.join(skillPath, 'SKILL.md');

  if (!fs.existsSync(skillMdPath)) {
    console.error(`SKILL.md not found: ${skillMdPath}`);
    return null;
  }

  const fileContent = fs.readFileSync(skillMdPath, 'utf-8');
  const parsed = parseFrontmatter(fileContent);

  if (!parsed) {
    console.error(`Failed to parse frontmatter: ${skillMdPath}`);
    return null;
  }

  const { frontmatter, content } = parsed;

  // Derive ID from folder name
  const folderName = path.basename(skillPath);
  const id = folderName;

  // Parse allowed tools (handle both comma-separated string and YAML list)
  let allowedTools: string[] = [];
  if (frontmatter['allowed-tools']) {
    if (Array.isArray(frontmatter['allowed-tools'])) {
      // YAML list format: ["Read", "Write", "Edit"]
      allowedTools = frontmatter['allowed-tools'].map((t: string) => t.trim());
    } else {
      // Comma-separated string format: "Read,Write,Edit"
      allowedTools = frontmatter['allowed-tools'].split(',').map((t: string) => t.trim());
    }
  }

  // Generate title from name if not provided
  const title = frontmatter.title || toTitleCase(frontmatter.name || id);

  // Truncate description for cards
  const shortDescription = truncateDescription(frontmatter.description, 200);

  // Determine category
  const category = normalizeCategory(frontmatter.category);

  // Parse tags
  const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];

  // Parse skill pairings
  const pairsWith: SkillPairing[] = Array.isArray(frontmatter['pairs-with'])
    ? frontmatter['pairs-with']
    : [];

  // Find references and scripts
  const references = findReferences(skillPath);
  const scripts = findScripts(skillPath);

  // Generate paths
  const docPath = `docs/skills/${id.replace(/-/g, '_')}`;
  const urlPath = `/docs/skills/${id.replace(/-/g, '_')}`;

  return {
    id,
    name: frontmatter.name || id,
    title,
    description: frontmatter.description || '',
    shortDescription,
    content,
    category,
    tags,
    badge: frontmatter.badge,
    pairsWith,
    allowedTools,
    sourcePath: skillMdPath,
    docPath,
    urlPath,
    source,
    lastUpdated: frontmatter.lastUpdated,
    references,
    scripts,
  };
}

// =============================================================================
// DIRECTORY SCANNING
// =============================================================================

export function findReferences(skillPath: string): SkillReference[] {
  const referencesPath = path.join(skillPath, 'references');

  if (!fs.existsSync(referencesPath)) {
    return [];
  }

  const references: SkillReference[] = [];

  const files = fs.readdirSync(referencesPath);
  for (const file of files) {
    if (file.endsWith('.md')) {
      const filePath = path.join(referencesPath, file);
      const name = path.basename(file, '.md');

      // Try to extract title from file
      const title = extractTitleFromMd(filePath) || toTitleCase(name);

      references.push({
        name,
        path: filePath,
        title,
      });
    }
  }

  return references;
}

export function findScripts(skillPath: string): SkillScript[] {
  const scriptsPath = path.join(skillPath, 'scripts');

  if (!fs.existsSync(scriptsPath)) {
    return [];
  }

  const scripts: SkillScript[] = [];

  const files = fs.readdirSync(scriptsPath);
  for (const file of files) {
    if (file.endsWith('.sh') || file.endsWith('.ts') || file.endsWith('.js')) {
      const filePath = path.join(scriptsPath, file);
      const name = path.basename(file);

      scripts.push({
        name,
        path: filePath,
        description: extractScriptDescription(filePath),
      });
    }
  }

  return scripts;
}

function extractTitleFromMd(filePath: string): string | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check for title in frontmatter
    const parsed = parseFrontmatter(content);
    if (parsed?.frontmatter && 'title' in parsed.frontmatter) {
      return (parsed.frontmatter as { title?: string }).title || null;
    }

    // Check for first H1
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }

    return null;
  } catch {
    return null;
  }
}

function extractScriptDescription(filePath: string): string | undefined {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').slice(0, 10);

    for (const line of lines) {
      // Look for description comment
      const match = line.match(/^#\s*(?:Description:|@desc)\s*(.+)$/i);
      if (match) {
        return match[1].trim();
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
}

// =============================================================================
// VALIDATION
// =============================================================================

export function validateSkill(skill: ParsedSkill): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required fields
  if (!skill.name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (!/^[a-z0-9-]+$/.test(skill.name)) {
    errors.push({
      field: 'name',
      message: 'Name must be kebab-case (lowercase letters, numbers, hyphens)',
      value: skill.name,
    });
  }

  if (!skill.description) {
    errors.push({ field: 'description', message: 'Description is required' });
  } else if (skill.description.length > 1000) {
    warnings.push({
      field: 'description',
      message: `Description is very long (${skill.description.length} chars)`,
      suggestion: 'Consider shortening to under 500 characters',
    });
  }

  if (skill.allowedTools.length === 0) {
    warnings.push({
      field: 'allowed-tools',
      message: 'No allowed tools specified',
      suggestion: 'Add allowed-tools to frontmatter',
    });
  }

  // Category validation
  if (!skill.category || skill.category === 'Uncategorized') {
    warnings.push({
      field: 'category',
      message: 'No category specified',
      suggestion: `Valid categories: ${Object.keys(SKILL_CATEGORIES).join(', ')}`,
    });
  } else if (!SKILL_CATEGORIES[skill.category]) {
    warnings.push({
      field: 'category',
      message: `Unknown category: ${skill.category}`,
      suggestion: `Valid categories: ${Object.keys(SKILL_CATEGORIES).join(', ')}`,
    });
  }

  // Tags validation
  if (skill.tags.length === 0) {
    warnings.push({
      field: 'tags',
      message: 'No tags specified',
      suggestion: 'Add tags for better discoverability',
    });
  }

  // Badge validation
  const validBadges = ['NEW', 'HOT', 'ADVANCED', 'EXPERIMENTAL'];
  if (skill.badge && !validBadges.includes(skill.badge)) {
    errors.push({
      field: 'badge',
      message: `Invalid badge: ${skill.badge}`,
      value: skill.badge,
    });
  }

  // Content validation
  if (!skill.content || skill.content.length < 100) {
    warnings.push({
      field: 'content',
      message: 'Skill content is minimal',
      suggestion: 'Add more documentation, examples, and guidance',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// =============================================================================
// BATCH PARSING
// =============================================================================

export function parseAllSkills(skillsDir: string): ParsedSkill[] {
  if (!fs.existsSync(skillsDir)) {
    console.error(`Skills directory not found: ${skillsDir}`);
    return [];
  }

  const skills: ParsedSkill[] = [];
  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const skillPath = path.join(skillsDir, entry.name);
    const skillMdPath = path.join(skillPath, 'SKILL.md');

    if (!fs.existsSync(skillMdPath)) {
      console.warn(`Skipping ${entry.name}: no SKILL.md found`);
      continue;
    }

    const source: SkillSource = { type: 'local', path: skillPath };
    const skill = parseSkillFile(skillPath, source);

    if (skill) {
      skills.push(skill);
    }
  }

  return skills;
}

// =============================================================================
// UTILITIES
// =============================================================================

function toTitleCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function truncateDescription(description: string, maxLength: number): string {
  if (!description) return '';
  if (description.length <= maxLength) return description;

  // Find last space before maxLength
  const truncated = description.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}

function normalizeCategory(category: string | undefined): string {
  if (!category) return 'Uncategorized';

  // Try exact match first
  if (SKILL_CATEGORIES[category]) {
    return category;
  }

  // Try case-insensitive match
  const lowerCategory = category.toLowerCase();
  for (const validCategory of Object.keys(SKILL_CATEGORIES)) {
    if (validCategory.toLowerCase() === lowerCategory) {
      return validCategory;
    }
  }

  // Try partial match
  for (const validCategory of Object.keys(SKILL_CATEGORIES)) {
    if (
      validCategory.toLowerCase().includes(lowerCategory) ||
      lowerCategory.includes(validCategory.toLowerCase())
    ) {
      return validCategory;
    }
  }

  return category; // Return as-is, will trigger warning
}

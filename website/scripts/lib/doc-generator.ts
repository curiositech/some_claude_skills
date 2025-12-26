/**
 * Documentation Generator
 *
 * Generates docs/skills/*.md files from SKILL.md content.
 */

import * as fs from 'fs';
import * as path from 'path';
import { ParsedSkill, SKILL_CATEGORIES } from './types';

// =============================================================================
// DOC GENERATION
// =============================================================================

export function generateSkillDocs(
  skills: ParsedSkill[],
  outputDir: string,
  sourceSkillsDir: string
): GeneratedDoc[] {
  const generated: GeneratedDoc[] = [];

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const skill of skills) {
    const docs = generateSkillDocFiles(skill, outputDir, sourceSkillsDir);
    generated.push(...docs);
  }

  // Generate category index
  const categoryIndex = generateCategoryIndex(skills, outputDir);
  generated.push(categoryIndex);

  return generated;
}

interface GeneratedDoc {
  path: string;
  skill: string;
  type: 'main' | 'reference' | 'index';
}

// =============================================================================
// SINGLE SKILL DOC GENERATION
// =============================================================================

function generateSkillDocFiles(
  skill: ParsedSkill,
  outputDir: string,
  sourceSkillsDir: string
): GeneratedDoc[] {
  const generated: GeneratedDoc[] = [];

  // Convert skill ID to doc folder name (hyphens to underscores)
  const docFolderName = skill.id.replace(/-/g, '_');
  const skillDocDir = path.join(outputDir, docFolderName);

  // Create skill doc directory
  if (!fs.existsSync(skillDocDir)) {
    fs.mkdirSync(skillDocDir, { recursive: true });
  }

  // Generate main skill doc - use skill name as filename (not index.md)
  // This matches the expected pattern: skills/skill_name/skill_name.md
  const mainDocPath = path.join(skillDocDir, `${docFolderName}.md`);
  const mainDocContent = buildMainSkillDoc(skill, docFolderName);
  fs.writeFileSync(mainDocPath, mainDocContent, 'utf-8');
  generated.push({ path: mainDocPath, skill: skill.id, type: 'main' });

  // Copy references if they exist
  const sourceRefsDir = path.join(sourceSkillsDir, skill.id, 'references');
  if (fs.existsSync(sourceRefsDir)) {
    const refsOutputDir = path.join(skillDocDir, 'references');
    if (!fs.existsSync(refsOutputDir)) {
      fs.mkdirSync(refsOutputDir, { recursive: true });
    }

    copyReferences(sourceRefsDir, refsOutputDir, skill.id, generated);
  }

  return generated;
}

function buildMainSkillDoc(skill: ParsedSkill, docFolderName: string): string {
  const categoryIcon = SKILL_CATEGORIES[skill.category]?.icon || '📦';
  const badgeStr = skill.badge ? ` (${skill.badge})` : '';

  // Build tools section
  const toolsSection =
    skill.allowedTools.length > 0
      ? `## Allowed Tools

\`\`\`
${skill.allowedTools.join(', ')}
\`\`\`

`
      : '';

  // Build tags section
  const tagsSection =
    skill.tags.length > 0
      ? `## Tags

${skill.tags.map((t) => `\`${t}\``).join(' ')}\n\n`
      : '';

  // Build pairs with section
  const pairsWithSection =
    skill.pairsWith && skill.pairsWith.length > 0
      ? `## 🤝 Pairs Great With

${skill.pairsWith.map((p) => `- **[${toTitleCase(p.skill)}](/docs/skills/${p.skill.replace(/-/g, '_')})**: ${p.reason}`).join('\n')}\n\n`
      : '';

  // Build references section
  const refsSection =
    skill.references.length > 0
      ? `## References

${skill.references.map((r) => `- [${r.title}](./references/${r.name})`).join('\n')}\n\n`
      : '';

  return `---
sidebar_label: ${skill.title}
sidebar_position: 1
---

# ${categoryIcon} ${skill.title}${badgeStr}

${skill.description}

---

${toolsSection}${tagsSection}${pairsWithSection}${refsSection}${skill.content}
`;
}

// =============================================================================
// REFERENCE COPYING
// =============================================================================

function copyReferences(
  sourceDir: string,
  outputDir: string,
  skillId: string,
  generated: GeneratedDoc[]
): void {
  const files = fs.readdirSync(sourceDir);

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(outputDir, file);

    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      // Recursively copy subdirectories
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyReferences(sourcePath, destPath, skillId, generated);
    } else if (file.endsWith('.md')) {
      // Process markdown files
      let content = fs.readFileSync(sourcePath, 'utf-8');

      // Add frontmatter if missing
      if (!content.startsWith('---')) {
        const title = extractTitleOrDefault(content, file);
        content = `---
title: ${title}
sidebar_label: ${title.substring(0, 30)}${title.length > 30 ? '...' : ''}
sidebar_position: 2
---
${content}`;
      }

      // Sanitize MDX-incompatible content
      content = sanitizeForMdx(content);

      fs.writeFileSync(destPath, content, 'utf-8');
      generated.push({ path: destPath, skill: skillId, type: 'reference' });
    } else {
      // Copy other files as-is
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

function extractTitleOrDefault(content: string, filename: string): string {
  // Try to find H1
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }

  // Fall back to filename
  return toTitleCase(path.basename(filename, '.md'));
}

function sanitizeForMdx(content: string): string {
  // Replace problematic HTML-like tags in markdown context
  // This handles cases like `<link>` that MDX interprets as JSX

  // Replace standalone <link> tags (not in code blocks)
  content = content.replace(/(?<!`)<link>(?!`)/gi, '[URL]');
  content = content.replace(/(?<!`)<\/link>(?!`)/gi, '');

  // Replace other problematic self-closing tags
  content = content.replace(/(?<!`)<br>(?!`)/gi, '<br />');
  content = content.replace(/(?<!`)<hr>(?!`)/gi, '<hr />');

  return content;
}

// =============================================================================
// CATEGORY INDEX
// =============================================================================

function generateCategoryIndex(
  skills: ParsedSkill[],
  outputDir: string
): GeneratedDoc {
  const indexPath = path.join(outputDir, '_category_.json');

  const categoryJson = {
    label: 'Skills',
    position: 3,
    link: {
      type: 'generated-index',
      description: 'Browse all available Claude Code skills.',
    },
  };

  fs.writeFileSync(indexPath, JSON.stringify(categoryJson, null, 2), 'utf-8');

  return { path: indexPath, skill: '_index_', type: 'index' };
}

// =============================================================================
// CLEANUP
// =============================================================================

export function cleanupOldDocs(
  outputDir: string,
  currentSkills: ParsedSkill[]
): string[] {
  const removed: string[] = [];

  if (!fs.existsSync(outputDir)) {
    return removed;
  }

  const currentIds = new Set(currentSkills.map((s) => s.id.replace(/-/g, '_')));
  const entries = fs.readdirSync(outputDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('_')) continue; // Skip special directories

    if (!currentIds.has(entry.name)) {
      const dirPath = path.join(outputDir, entry.name);
      fs.rmSync(dirPath, { recursive: true });
      removed.push(entry.name);
    }
  }

  return removed;
}

// =============================================================================
// UTILITIES
// =============================================================================

function toTitleCase(str: string): string {
  return str
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

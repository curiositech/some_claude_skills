#!/usr/bin/env npx tsx
/**
 * Sync Skill Subpages
 *
 * For skills with references/, templates/, examples/, or guides/ folders,
 * converts the flat doc file to a category folder with:
 * - index.md (main skill page)
 * - references/*.md (subpages for each reference)
 *
 * Run: npx tsx scripts/syncSkillSubpages.ts
 * Or: npm run sync:subpages
 */

import * as fs from 'fs';
import * as path from 'path';

const SKILLS_DIR = path.resolve(__dirname, '../../.claude/skills');
const DOCS_DIR = path.resolve(__dirname, '../docs/skills');

// Subfolders to sync as documentation subpages
const SUBFOLDERS = ['references', 'templates', 'examples', 'guides'];

interface SkillSubpageInfo {
  skillId: string;
  subfolder: string;
  files: string[];
}

function getDocFilename(skillId: string): string {
  return skillId.replace(/-/g, '_');
}

function titleCase(str: string): string {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function escapeAngleBrackets(content: string): string {
  // Escape angle brackets that could be interpreted as JSX
  // But preserve code blocks and frontmatter

  const lines = content.split('\n');
  const result: string[] = [];
  let inCodeBlock = false;
  let inFrontmatter = false;
  let frontmatterCount = 0;

  for (const line of lines) {
    if (line.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      result.push(line);
      continue;
    }

    if (line === '---' && !inCodeBlock) {
      frontmatterCount++;
      if (frontmatterCount === 1) {
        inFrontmatter = true;
      } else if (frontmatterCount === 2) {
        inFrontmatter = false;
      }
      result.push(line);
      continue;
    }

    if (inCodeBlock || inFrontmatter) {
      result.push(line);
      continue;
    }

    // Escape < that isn't part of a valid HTML/JSX tag or code fence
    // Match < followed by anything that isn't a letter or / (valid tag start)
    let escapedLine = line.replace(/<(?![a-zA-Z\/!])/g, '\\<');

    result.push(escapedLine);
  }

  return result.join('\n');
}

function escapeYamlValue(value: string): string {
  // Quote values that contain special YAML characters
  if (value.includes(':') || value.includes('#') || value.includes("'") || value.includes('"') ||
      value.startsWith(' ') || value.endsWith(' ') || value.includes('\n')) {
    // Escape double quotes and wrap in double quotes
    return `"${value.replace(/"/g, '\\"')}"`;
  }
  return value;
}

function generateFrontmatter(title: string, sidebarLabel: string, sidebarPosition?: number): string {
  const lines = [
    '---',
    `title: ${escapeYamlValue(title)}`,
    `sidebar_label: ${escapeYamlValue(sidebarLabel)}`,
  ];
  if (sidebarPosition !== undefined) {
    lines.push(`sidebar_position: ${sidebarPosition}`);
  }
  lines.push('---', '');
  return lines.join('\n');
}

function generateCategoryJson(label: string, position: number, collapsed: boolean = true): string {
  return JSON.stringify({
    label,
    position,
    collapsed,
    collapsible: true,
  }, null, 2);
}

function findSubfolders(skillId: string): SkillSubpageInfo[] {
  const skillDir = path.join(SKILLS_DIR, skillId);
  const results: SkillSubpageInfo[] = [];

  for (const subfolder of SUBFOLDERS) {
    const subfolderPath = path.join(skillDir, subfolder);
    if (fs.existsSync(subfolderPath) && fs.statSync(subfolderPath).isDirectory()) {
      const files = fs.readdirSync(subfolderPath)
        .filter(f => f.endsWith('.md'))
        .sort();
      if (files.length > 0) {
        results.push({ skillId, subfolder, files });
      }
    }
  }

  return results;
}

function convertToFolderStructure(skillId: string, subpages: SkillSubpageInfo[]): { converted: boolean; message: string } {
  const docBase = getDocFilename(skillId);
  const flatDocPath = path.join(DOCS_DIR, `${docBase}.md`);
  const folderDocPath = path.join(DOCS_DIR, docBase);

  // Check if already converted
  if (fs.existsSync(folderDocPath) && fs.statSync(folderDocPath).isDirectory()) {
    // Already a folder - just sync subpages
    return syncSubpagesToFolder(skillId, folderDocPath, subpages);
  }

  // Check if flat doc exists
  if (!fs.existsSync(flatDocPath)) {
    return { converted: false, message: 'No doc file exists' };
  }

  // Read the flat doc
  const flatContent = fs.readFileSync(flatDocPath, 'utf-8');

  // Create the folder
  fs.mkdirSync(folderDocPath, { recursive: true });

  // Move flat doc to index.md with slug to preserve doc ID
  const indexPath = path.join(folderDocPath, 'index.md');

  // Add slug to preserve the original doc ID if not already present
  let finalContent = flatContent;
  if (flatContent.startsWith('---')) {
    // Has frontmatter - add slug if not present
    const endOfFrontmatter = flatContent.indexOf('---', 3);
    if (endOfFrontmatter !== -1 && !flatContent.includes('slug:')) {
      const frontmatter = flatContent.substring(0, endOfFrontmatter);
      const rest = flatContent.substring(endOfFrontmatter);
      finalContent = `${frontmatter}slug: /skills/${docBase}\n${rest}`;
    }
  } else {
    // No frontmatter - add one with slug
    finalContent = `---\nslug: /skills/${docBase}\n---\n${flatContent}`;
  }

  fs.writeFileSync(indexPath, finalContent);

  // Delete the flat file
  fs.unlinkSync(flatDocPath);

  // Sync subpages
  const syncResult = syncSubpagesToFolder(skillId, folderDocPath, subpages);

  return {
    converted: true,
    message: `Converted to folder, ${syncResult.message}`
  };
}

function syncSubpagesToFolder(skillId: string, folderPath: string, subpages: SkillSubpageInfo[]): { converted: boolean; message: string } {
  let totalSynced = 0;

  for (const subpage of subpages) {
    const subfolderPath = path.join(folderPath, subpage.subfolder);

    // Create subfolder if needed
    if (!fs.existsSync(subfolderPath)) {
      fs.mkdirSync(subfolderPath, { recursive: true });
    }

    // Create _category_.json for the subfolder
    const categoryJsonPath = path.join(subfolderPath, '_category_.json');
    const categoryLabel = titleCase(subpage.subfolder);
    fs.writeFileSync(categoryJsonPath, generateCategoryJson(categoryLabel, 2));

    // Sync each markdown file
    for (let i = 0; i < subpage.files.length; i++) {
      const fileName = subpage.files[i];
      const sourcePath = path.join(SKILLS_DIR, skillId, subpage.subfolder, fileName);
      const destPath = path.join(subfolderPath, fileName);

      const sourceContent = fs.readFileSync(sourcePath, 'utf-8');

      // Check if file already has frontmatter
      const hasFrontmatter = sourceContent.startsWith('---');

      let finalContent: string;
      if (hasFrontmatter) {
        // Use existing content as-is, but escape angle brackets
        finalContent = escapeAngleBrackets(sourceContent);
      } else {
        // Extract title from first heading or filename
        const headingMatch = sourceContent.match(/^#\s+(.+)$/m);
        const title = headingMatch ? headingMatch[1] : titleCase(fileName.replace('.md', ''));
        const sidebarLabel = title.length > 30 ? title.substring(0, 27) + '...' : title;

        finalContent = generateFrontmatter(title, sidebarLabel, i + 1) + escapeAngleBrackets(sourceContent);
      }

      // Write or update
      const existingContent = fs.existsSync(destPath) ? fs.readFileSync(destPath, 'utf-8') : '';
      if (existingContent !== finalContent) {
        fs.writeFileSync(destPath, finalContent);
        totalSynced++;
      }
    }
  }

  return {
    converted: false,
    message: `synced ${totalSynced} subpages`
  };
}

function main() {
  console.log('🔄 Syncing skill subpages...\n');

  const skillDirs = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  let convertedCount = 0;
  let syncedCount = 0;
  let skippedCount = 0;
  const details: string[] = [];

  for (const skillId of skillDirs) {
    const subpages = findSubfolders(skillId);

    if (subpages.length === 0) {
      skippedCount++;
      continue;
    }

    const totalFiles = subpages.reduce((sum, sp) => sum + sp.files.length, 0);
    const result = convertToFolderStructure(skillId, subpages);

    if (result.converted) {
      console.log(`📁 ${skillId}: Converted to folder (${totalFiles} subpages)`);
      convertedCount++;
      details.push(`${skillId}: ${result.message}`);
    } else if (result.message.includes('synced')) {
      const match = result.message.match(/synced (\d+)/);
      const count = match ? parseInt(match[1]) : 0;
      if (count > 0) {
        console.log(`✅ ${skillId}: ${result.message}`);
        syncedCount++;
      }
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Converted to folders: ${convertedCount}`);
  console.log(`   Updated subpages: ${syncedCount}`);
  console.log(`   Skills without subpages: ${skippedCount}`);

  if (details.length > 0) {
    console.log(`\n📝 Details:`);
    details.forEach(d => console.log(`   - ${d}`));
  }

  console.log('\n✨ Subpage sync complete!');
}

main();

#!/usr/bin/env tsx
import { promises as fs } from 'fs';
import path from 'path';
import JSZip from 'jszip';
import * as yaml from 'js-yaml';

/**
 * Pre-generates skill folder zips at build time
 * This avoids GitHub API rate limits and CORS issues
 */

const SKILLS_DIR = path.join(__dirname, '../../.claude/skills');
const OUTPUT_DIR = path.join(__dirname, '../static/downloads/skills');

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a skill folder has proper SKILL.md with valid YAML frontmatter
 */
async function validateSkill(skillPath: string, skillId: string): Promise<ValidationResult> {
  const errors: string[] = [];

  // Check for SKILL.md (uppercase)
  const skillMdPath = path.join(skillPath, 'SKILL.md');
  const lowercasePath = path.join(skillPath, 'skill.md');

  let skillMdExists = false;
  try {
    await fs.access(skillMdPath);
    skillMdExists = true;
  } catch {
    // Check if lowercase version exists (common mistake)
    try {
      await fs.access(lowercasePath);
      errors.push(`Found skill.md but expected SKILL.md (uppercase). Rename it!`);
    } catch {
      errors.push(`Missing SKILL.md file`);
    }
  }

  if (skillMdExists) {
    // Validate YAML frontmatter
    try {
      const content = await fs.readFile(skillMdPath, 'utf-8');

      if (!content.startsWith('---')) {
        errors.push(`SKILL.md missing YAML frontmatter (should start with ---)`);
      } else {
        // Extract frontmatter
        const lines = content.split('\n');
        let endIdx = -1;
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '---') {
            endIdx = i;
            break;
          }
        }

        if (endIdx === -1) {
          errors.push(`SKILL.md has unclosed frontmatter (missing closing ---)`);
        } else {
          const frontmatter = lines.slice(1, endIdx).join('\n');
          try {
            const parsed = yaml.load(frontmatter) as Record<string, unknown>;

            // Check required fields
            if (!parsed.name) errors.push(`Frontmatter missing 'name' field`);
            if (!parsed.description) errors.push(`Frontmatter missing 'description' field`);
          } catch (yamlError) {
            errors.push(`Invalid YAML in frontmatter: ${(yamlError as Error).message}`);
          }
        }
      }
    } catch (readError) {
      errors.push(`Failed to read SKILL.md: ${(readError as Error).message}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

async function generateSkillZips() {
  console.log('🔨 Generating skill zips...\n');

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Get all skill directories
  const skillDirs = await fs.readdir(SKILLS_DIR, { withFileTypes: true });
  const skills = skillDirs.filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'));

  // First pass: validate all skills
  console.log('🔍 Validating skills...\n');
  const validationErrors: Array<{ skillId: string; errors: string[] }> = [];

  for (const skill of skills) {
    const skillId = skill.name;
    const skillPath = path.join(SKILLS_DIR, skillId);
    const result = await validateSkill(skillPath, skillId);

    if (!result.valid) {
      validationErrors.push({ skillId, errors: result.errors });
      console.error(`   ❌ ${skillId}:`);
      for (const error of result.errors) {
        console.error(`      - ${error}`);
      }
    } else {
      console.log(`   ✓ ${skillId}`);
    }
  }

  // Fail fast if any skills are invalid
  if (validationErrors.length > 0) {
    console.error(`\n🚨 ${validationErrors.length} skill(s) failed validation. Fix these before generating zips!\n`);
    process.exit(1);
  }

  console.log('\n✅ All skills validated!\n');

  // Second pass: generate zips
  for (const skill of skills) {
    const skillId = skill.name;
    const skillPath = path.join(SKILLS_DIR, skillId);
    const zipPath = path.join(OUTPUT_DIR, `${skillId}.zip`);

    console.log(`📦 Creating ${skillId}.zip...`);

    try {
      const zip = new JSZip();
      const skillFolder = zip.folder(skillId);

      if (!skillFolder) {
        throw new Error(`Failed to create zip folder for ${skillId}`);
      }

      // Recursively add files to zip
      await addDirectoryToZip(skillPath, skillFolder, '');

      // Generate and write zip file
      const content = await zip.generateAsync({
        type: 'nodebuffer',
        compression: 'DEFLATE',
        compressionOptions: { level: 9 }
      });

      await fs.writeFile(zipPath, content);
      console.log(`   ✓ Created ${skillId}.zip (${(content.length / 1024).toFixed(1)} KB)\n`);
    } catch (error) {
      console.error(`   ✗ Failed to create ${skillId}.zip:`, error);
    }
  }

  console.log('✅ Done generating skill zips!');
}

async function addDirectoryToZip(
  dirPath: string,
  zipFolder: JSZip,
  relativePath: string
): Promise<void> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const entryRelativePath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      // Skip .git and node_modules
      if (entry.name === '.git' || entry.name === 'node_modules') {
        continue;
      }

      // Create subfolder and recurse
      const subFolder = zipFolder.folder(entry.name);
      if (subFolder) {
        await addDirectoryToZip(fullPath, subFolder, entryRelativePath);
      }
    } else if (entry.isFile()) {
      // Add file to zip
      const fileContent = await fs.readFile(fullPath);
      zipFolder.file(entry.name, fileContent);
    }
  }
}

// Run the script
generateSkillZips().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

#!/usr/bin/env npx tsx
/**
 * Skill Generation Script
 *
 * Generates skills.ts and docs/skills/ from SKILL.md files.
 *
 * Usage:
 *   npx tsx scripts/generate-skills.ts [options]
 *
 * Options:
 *   --validate-only    Validate without generating files
 *   --verbose          Show detailed output
 *   --watch            Watch for changes and regenerate
 *   --include-remote   Include remote skills from skill-sources.yaml
 */

import * as fs from 'fs';
import * as path from 'path';
import { parseAllSkills, validateSkill } from './lib/skill-parser';
import { generateSkillsTs, generateSkillDescriptionsJson } from './lib/skill-generator';
import { generateSkillDocs, cleanupOldDocs } from './lib/doc-generator';
import {
  GenerationOptions,
  GenerationResult,
  GenerationError,
  GenerationWarning,
  ParsedSkill,
  SKILL_CATEGORIES,
} from './lib/types';

// =============================================================================
// CONFIGURATION
// =============================================================================

const DEFAULT_OPTIONS: GenerationOptions = {
  skillsSourceDir: path.resolve(__dirname, '../../.claude/skills'),
  skillsOutputFile: path.resolve(__dirname, '../src/data/skills.ts'),
  docsOutputDir: path.resolve(__dirname, '../docs/skills'),
  skillSourcesFile: path.resolve(__dirname, '../skill-sources.yaml'),
  validateOnly: false,
  verbose: false,
  watch: false,
  includeRemote: false,
};

// =============================================================================
// MAIN GENERATION FUNCTION
// =============================================================================

async function generateSkills(
  options: GenerationOptions = DEFAULT_OPTIONS
): Promise<GenerationResult> {
  const startTime = Date.now();
  const errors: GenerationError[] = [];
  const warnings: GenerationWarning[] = [];

  console.log('🔄 Generating skills...\n');

  // Step 1: Parse all local skills
  console.log(`📂 Scanning ${options.skillsSourceDir}...`);
  const skills = parseAllSkills(options.skillsSourceDir);
  console.log(`   Found ${skills.length} skill folders\n`);

  if (skills.length === 0) {
    errors.push({
      message: 'No skills found',
      details: `Checked directory: ${options.skillsSourceDir}`,
    });
    return buildResult(false, [], errors, warnings, startTime);
  }

  // Step 2: Validate all skills
  console.log('✅ Validating skills...');
  let validCount = 0;
  let warningCount = 0;

  for (const skill of skills) {
    const validation = validateSkill(skill);

    if (!validation.valid) {
      for (const error of validation.errors) {
        errors.push({
          skillId: skill.id,
          file: skill.sourcePath,
          message: error.message,
          details: error.value ? String(error.value) : undefined,
        });
      }
    } else {
      validCount++;
    }

    for (const warning of validation.warnings) {
      warnings.push({
        skillId: skill.id,
        file: skill.sourcePath,
        message: warning.message,
        suggestion: warning.suggestion,
      });
      warningCount++;
    }

    if (options.verbose) {
      const status = validation.valid ? '✓' : '✗';
      const warnStr = validation.warnings.length > 0 ? ` (${validation.warnings.length} warnings)` : '';
      console.log(`   ${status} ${skill.id}${warnStr}`);
    }
  }

  console.log(`   ${validCount}/${skills.length} valid, ${warningCount} warnings\n`);

  // Stop here if validate-only
  if (options.validateOnly) {
    console.log('🔍 Validation only mode - no files generated\n');
    return buildResult(errors.length === 0, skills, errors, warnings, startTime);
  }

  // Step 3: Assign categories to uncategorized skills
  assignCategories(skills);

  // Step 4: Generate skills.ts
  console.log('📝 Generating skills.ts...');
  try {
    generateSkillsTs(skills, options.skillsOutputFile);
    console.log(`   Written to ${options.skillsOutputFile}\n`);
  } catch (error) {
    errors.push({
      message: 'Failed to generate skills.ts',
      details: String(error),
    });
  }

  // Step 5: Generate skillDescriptions.json
  const descriptionsPath = path.join(
    path.dirname(options.skillsOutputFile),
    'skillDescriptions.json'
  );
  console.log('📝 Generating skillDescriptions.json...');
  try {
    generateSkillDescriptionsJson(skills, descriptionsPath);
    console.log(`   Written to ${descriptionsPath}\n`);
  } catch (error) {
    errors.push({
      message: 'Failed to generate skillDescriptions.json',
      details: String(error),
    });
  }

  // Step 6: Generate docs
  console.log('📚 Generating skill docs...');
  try {
    const generatedDocs = generateSkillDocs(
      skills,
      options.docsOutputDir,
      options.skillsSourceDir
    );
    console.log(`   Generated ${generatedDocs.length} doc files\n`);

    // Cleanup old docs
    const removed = cleanupOldDocs(options.docsOutputDir, skills);
    if (removed.length > 0) {
      console.log(`   Removed ${removed.length} obsolete doc folders: ${removed.join(', ')}\n`);
    }
  } catch (error) {
    errors.push({
      message: 'Failed to generate docs',
      details: String(error),
    });
  }

  // Step 7: Print summary
  printSummary(skills, errors, warnings);

  return buildResult(errors.length === 0, skills, errors, warnings, startTime);
}

// =============================================================================
// CATEGORY ASSIGNMENT
// =============================================================================

function assignCategories(skills: ParsedSkill[]): void {
  // Category keywords for auto-assignment
  const categoryKeywords: Record<string, string[]> = {
    'AI & Machine Learning': ['ai', 'ml', 'llm', 'prompt', 'model', 'neural', 'embedding', 'rag'],
    'Code Quality & Testing': ['test', 'quality', 'lint', 'review', 'refactor', 'debug'],
    'Content & Writing': ['write', 'doc', 'content', 'copy', 'blog', 'technical-writer'],
    'Data & Analytics': ['data', 'analytics', 'pipeline', 'etl', 'visualization'],
    'Design & Creative': ['design', 'ui', 'ux', 'creative', 'visual', 'style'],
    'DevOps & Site Reliability': ['devops', 'deploy', 'ci', 'cd', 'infrastructure', 'kubernetes', 'docker', 'api', 'security'],
    'Business & Monetization': ['business', 'marketing', 'monetize', 'strategy', 'promoter'],
    'Research & Analysis': ['research', 'analysis', 'investigate', 'competitor'],
    'Productivity & Meta': ['productivity', 'workflow', 'meta', 'claude', 'skill'],
    'Lifestyle & Personal': ['lifestyle', 'personal', 'wellness', 'relationship', 'wedding', 'health'],
  };

  for (const skill of skills) {
    if (skill.category && skill.category !== 'Uncategorized') continue;

    // Try to auto-assign based on keywords
    const lowerName = skill.name.toLowerCase();
    const lowerDesc = skill.description.toLowerCase();

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      for (const keyword of keywords) {
        if (lowerName.includes(keyword) || lowerDesc.includes(keyword)) {
          skill.category = category;
          break;
        }
      }
      if (skill.category !== 'Uncategorized') break;
    }
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function buildResult(
  success: boolean,
  skills: ParsedSkill[],
  errors: GenerationError[],
  warnings: GenerationWarning[],
  startTime: number
): GenerationResult {
  const categoryCounts: Record<string, number> = {};
  for (const skill of skills) {
    categoryCounts[skill.category] = (categoryCounts[skill.category] || 0) + 1;
  }

  return {
    success,
    skills,
    errors,
    warnings,
    stats: {
      totalSkills: skills.length,
      localSkills: skills.filter((s) => s.source.type === 'local').length,
      remoteSkills: skills.filter((s) => s.source.type === 'remote').length,
      submissionSkills: skills.filter((s) => s.source.type === 'submission').length,
      categoryCounts,
      generatedDocs: skills.length,
      skippedSkills: 0,
      processingTimeMs: Date.now() - startTime,
    },
  };
}

function printSummary(
  skills: ParsedSkill[],
  errors: GenerationError[],
  warnings: GenerationWarning[]
): void {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                     GENERATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Category breakdown
  console.log('📊 Skills by Category:\n');
  const byCategory = new Map<string, number>();
  for (const skill of skills) {
    byCategory.set(skill.category, (byCategory.get(skill.category) || 0) + 1);
  }

  for (const [category, count] of [...byCategory.entries()].sort((a, b) => b[1] - a[1])) {
    const icon = SKILL_CATEGORIES[category]?.icon || '📦';
    console.log(`   ${icon} ${category}: ${count}`);
  }
  console.log(`\n   Total: ${skills.length} skills\n`);

  // Errors
  if (errors.length > 0) {
    console.log('❌ Errors:\n');
    for (const error of errors) {
      const prefix = error.skillId ? `[${error.skillId}] ` : '';
      console.log(`   ${prefix}${error.message}`);
      if (error.details) {
        console.log(`      ${error.details}`);
      }
    }
    console.log('');
  }

  // Warnings (show first 10)
  if (warnings.length > 0) {
    console.log(`⚠️  Warnings (${warnings.length} total):\n`);
    const shown = warnings.slice(0, 10);
    for (const warning of shown) {
      const prefix = warning.skillId ? `[${warning.skillId}] ` : '';
      console.log(`   ${prefix}${warning.message}`);
    }
    if (warnings.length > 10) {
      console.log(`   ... and ${warnings.length - 10} more`);
    }
    console.log('');
  }

  // Status
  if (errors.length === 0) {
    console.log('✅ Generation completed successfully!\n');
  } else {
    console.log('❌ Generation completed with errors\n');
  }
}

// =============================================================================
// CLI
// =============================================================================

function parseArgs(): GenerationOptions {
  const args = process.argv.slice(2);
  const options = { ...DEFAULT_OPTIONS };

  for (const arg of args) {
    switch (arg) {
      case '--validate-only':
      case '-v':
        options.validateOnly = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--watch':
      case '-w':
        options.watch = true;
        break;
      case '--include-remote':
      case '-r':
        options.includeRemote = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`
Skill Generation Script

Usage: npx tsx scripts/generate-skills.ts [options]

Options:
  --validate-only, -v    Validate skills without generating files
  --verbose              Show detailed output for each skill
  --watch, -w            Watch for changes and regenerate
  --include-remote, -r   Include remote skills from skill-sources.yaml
  --help, -h             Show this help message

Examples:
  npx tsx scripts/generate-skills.ts
  npx tsx scripts/generate-skills.ts --validate-only
  npx tsx scripts/generate-skills.ts --verbose --watch
`);
}

// =============================================================================
// WATCH MODE
// =============================================================================

async function watchMode(options: GenerationOptions): Promise<void> {
  console.log('👀 Watching for changes...\n');
  console.log(`   Source: ${options.skillsSourceDir}`);
  console.log('   Press Ctrl+C to stop\n');

  // Initial generation
  await generateSkills(options);

  // Watch for changes
  const chokidar = await import('chokidar');
  const watcher = chokidar.watch(options.skillsSourceDir, {
    ignored: /node_modules/,
    persistent: true,
    ignoreInitial: true,
  });

  let debounceTimer: NodeJS.Timeout | null = null;

  watcher.on('all', (event, filePath) => {
    if (!filePath.endsWith('SKILL.md') && !filePath.endsWith('.md')) return;

    console.log(`\n📝 ${event}: ${path.relative(options.skillsSourceDir, filePath)}`);

    // Debounce regeneration
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(async () => {
      console.log('\n🔄 Regenerating...\n');
      await generateSkills(options);
      console.log('\n👀 Watching for changes...');
    }, 500);
  });
}

// =============================================================================
// MAIN
// =============================================================================

async function main(): Promise<void> {
  const options = parseArgs();

  if (options.watch) {
    await watchMode(options);
  } else {
    const result = await generateSkills(options);
    process.exit(result.success ? 0 : 1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

#!/usr/bin/env npx tsx
/**
 * Batch Skill Validator
 *
 * Validates all skills in a directory and generates a comprehensive report.
 * Uses the skill-md-validator.ts for individual skill validation.
 *
 * Usage:
 *   npx ts-node batch-validate.ts [options]
 *
 * Options:
 *   --dir <path>    Directory containing skills (default: .claude/skills)
 *   --json          Output results as JSON
 *   --strict        Treat warnings as errors
 *   --fix           Auto-fix common issues where possible
 *   --report <file> Save report to file
 */

import * as fs from 'fs';
import * as path from 'path';
import { validateSkillMd, ValidationResult } from './skill-md-validator';

// ============================================================================
// Types
// ============================================================================

interface BatchResult {
  totalSkills: number;
  validSkills: number;
  invalidSkills: number;
  totalErrors: number;
  totalWarnings: number;
  results: ValidationResult[];
  errorsByCode: Record<string, number>;
  warningsByCode: Record<string, number>;
  skillsByCategory: Record<string, string[]>;
  startTime: string;
  endTime: string;
  durationMs: number;
}

interface BatchOptions {
  skillsDir: string;
  jsonOutput: boolean;
  strict: boolean;
  autoFix: boolean;
  reportFile?: string;
}

// ============================================================================
// Auto-fix Functions
// ============================================================================

function autoFixSkillMd(filePath: string, result: ValidationResult): string[] {
  const fixes: string[] = [];
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix AP004: Remove TODO/FIXME/XXX comments
  const todoWarnings = result.warnings.filter((w) => w.code === 'AP004');
  if (todoWarnings.length > 0) {
    content = content.replace(/^\s*[-*]\s*(TODO|FIXME|XXX):.*$/gm, '');
    content = content.replace(/\/\/\s*(TODO|FIXME|XXX):.*$/gm, '');
    fixes.push('Removed TODO/FIXME/XXX comments');
  }

  // Fix AP005: Replace common placeholders
  const placeholderWarnings = result.warnings.filter((w) => w.code === 'AP005');
  if (placeholderWarnings.length > 0) {
    content = content.replace(/\[placeholder\]/gi, '[CONTENT NEEDED]');
    content = content.replace(/\[TBD\]/gi, '[CONTENT NEEDED]');
    content = content.replace(/\[TODO\]/gi, '[CONTENT NEEDED]');
    fixes.push('Replaced placeholders with [CONTENT NEEDED]');
  }

  // Fix AP007: Remove empty headings
  const emptyHeadingWarnings = result.warnings.filter((w) => w.code === 'AP007');
  if (emptyHeadingWarnings.length > 0) {
    content = content.replace(/^#{1,6}\s*$/gm, '');
    fixes.push('Removed empty headings');
  }

  // Fix ST007: Add language hint to bare code blocks
  const bareCodeBlockWarnings = result.warnings.filter((w) => w.code === 'ST007');
  if (bareCodeBlockWarnings.length > 0) {
    content = content.replace(/^```\s*\n/gm, '```plaintext\n');
    fixes.push('Added language hints to bare code blocks');
  }

  // Clean up multiple blank lines
  content = content.replace(/\n{3,}/g, '\n\n');

  if (fixes.length > 0) {
    fs.writeFileSync(filePath, content);
  }

  return fixes;
}

// ============================================================================
// Batch Validation
// ============================================================================

function findSkillDirectories(baseDir: string): string[] {
  const skillDirs: string[] = [];

  if (!fs.existsSync(baseDir)) {
    return skillDirs;
  }

  const entries = fs.readdirSync(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const skillMdPath = path.join(baseDir, entry.name, 'SKILL.md');
      if (fs.existsSync(skillMdPath)) {
        skillDirs.push(path.join(baseDir, entry.name));
      }
    }
  }

  return skillDirs;
}

function runBatchValidation(options: BatchOptions): BatchResult {
  const startTime = new Date();
  const skillDirs = findSkillDirectories(options.skillsDir);

  const results: ValidationResult[] = [];
  const errorsByCode: Record<string, number> = {};
  const warningsByCode: Record<string, number> = {};
  const skillsByCategory: Record<string, string[]> = {};

  let validCount = 0;
  let invalidCount = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const skillDir of skillDirs) {
    const result = validateSkillMd(skillDir);
    results.push(result);

    // Apply auto-fix if requested
    if (options.autoFix && result.warnings.length > 0) {
      const skillMdPath = path.join(skillDir, 'SKILL.md');
      const fixes = autoFixSkillMd(skillMdPath, result);
      if (fixes.length > 0) {
        // Re-validate after fixes
        const revalidated = validateSkillMd(skillDir);
        results[results.length - 1] = revalidated;
        result.info.push({
          code: 'AUTOFIX',
          message: `Applied ${fixes.length} auto-fixes: ${fixes.join(', ')}`,
          severity: 'info',
        });
      }
    }

    // Count results
    const isValid = options.strict
      ? result.errors.length === 0 && result.warnings.length === 0
      : result.valid;

    if (isValid) {
      validCount++;
    } else {
      invalidCount++;
    }

    // Aggregate errors
    for (const error of result.errors) {
      totalErrors++;
      errorsByCode[error.code] = (errorsByCode[error.code] || 0) + 1;
    }

    // Aggregate warnings
    for (const warning of result.warnings) {
      totalWarnings++;
      warningsByCode[warning.code] = (warningsByCode[warning.code] || 0) + 1;
    }

    // Group by category (extract from path)
    const skillName = path.basename(skillDir);
    const categoryMatch = skillName.match(/^([^-]+)/);
    const category = categoryMatch ? categoryMatch[1] : 'uncategorized';

    if (!skillsByCategory[category]) {
      skillsByCategory[category] = [];
    }
    skillsByCategory[category].push(skillName);
  }

  const endTime = new Date();

  return {
    totalSkills: skillDirs.length,
    validSkills: validCount,
    invalidSkills: invalidCount,
    totalErrors,
    totalWarnings,
    results,
    errorsByCode,
    warningsByCode,
    skillsByCategory,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    durationMs: endTime.getTime() - startTime.getTime(),
  };
}

// ============================================================================
// Report Formatting
// ============================================================================

function formatBatchReport(batch: BatchResult, strict: boolean): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('╔════════════════════════════════════════════════════════════════════╗');
  lines.push('║              BATCH SKILL VALIDATION REPORT                         ║');
  lines.push('╚════════════════════════════════════════════════════════════════════╝');
  lines.push('');

  // Summary
  const passRate = batch.totalSkills > 0
    ? ((batch.validSkills / batch.totalSkills) * 100).toFixed(1)
    : '0';

  lines.push(`📊 SUMMARY`);
  lines.push(`${'─'.repeat(50)}`);
  lines.push(`Total skills validated: ${batch.totalSkills}`);
  lines.push(`Valid skills:           ${batch.validSkills} (${passRate}%)`);
  lines.push(`Invalid skills:         ${batch.invalidSkills}`);
  lines.push(`Total errors:           ${batch.totalErrors}`);
  lines.push(`Total warnings:         ${batch.totalWarnings}`);
  lines.push(`Duration:               ${batch.durationMs}ms`);
  if (strict) {
    lines.push(`Mode:                   STRICT (warnings treated as errors)`);
  }
  lines.push('');

  // Error breakdown
  if (Object.keys(batch.errorsByCode).length > 0) {
    lines.push(`❌ ERRORS BY TYPE`);
    lines.push(`${'─'.repeat(50)}`);
    const sortedErrors = Object.entries(batch.errorsByCode).sort((a, b) => b[1] - a[1]);
    for (const [code, count] of sortedErrors) {
      lines.push(`  ${code}: ${count} occurrence(s)`);
    }
    lines.push('');
  }

  // Warning breakdown
  if (Object.keys(batch.warningsByCode).length > 0) {
    lines.push(`⚠️  WARNINGS BY TYPE`);
    lines.push(`${'─'.repeat(50)}`);
    const sortedWarnings = Object.entries(batch.warningsByCode).sort((a, b) => b[1] - a[1]);
    for (const [code, count] of sortedWarnings) {
      lines.push(`  ${code}: ${count} occurrence(s)`);
    }
    lines.push('');
  }

  // Invalid skills detail
  const invalidResults = batch.results.filter(
    (r) => strict ? r.errors.length > 0 || r.warnings.length > 0 : !r.valid
  );

  if (invalidResults.length > 0) {
    lines.push(`📋 INVALID SKILLS DETAIL`);
    lines.push(`${'─'.repeat(50)}`);

    for (const result of invalidResults) {
      const skillName = path.basename(path.dirname(result.filePath));
      lines.push(`\n  ${skillName}`);

      for (const error of result.errors) {
        const lineInfo = error.line ? `:${error.line}` : '';
        lines.push(`    ✗ [${error.code}]${lineInfo} ${error.message}`);
      }

      if (strict) {
        for (const warning of result.warnings) {
          const lineInfo = warning.line ? `:${warning.line}` : '';
          lines.push(`    ⚠ [${warning.code}]${lineInfo} ${warning.message}`);
        }
      }
    }
    lines.push('');
  }

  // Valid skills list
  const validResults = batch.results.filter(
    (r) => strict ? r.errors.length === 0 && r.warnings.length === 0 : r.valid
  );

  if (validResults.length > 0) {
    lines.push(`✅ VALID SKILLS (${validResults.length})`);
    lines.push(`${'─'.repeat(50)}`);

    const validNames = validResults.map((r) => path.basename(path.dirname(r.filePath)));
    const columns = 3;
    const colWidth = 25;

    for (let i = 0; i < validNames.length; i += columns) {
      const row = validNames.slice(i, i + columns);
      lines.push('  ' + row.map((n) => n.padEnd(colWidth)).join(''));
    }
    lines.push('');
  }

  // Timestamp
  lines.push(`${'─'.repeat(50)}`);
  lines.push(`Generated: ${batch.startTime}`);

  return lines.join('\n');
}

// ============================================================================
// CLI
// ============================================================================

function printUsage(): void {
  console.log(`
Batch Skill Validator
=====================

Validates all skills in a directory and generates a comprehensive report.

Usage:
  npx ts-node batch-validate.ts [options]

Options:
  --dir <path>    Directory containing skills (default: .claude/skills)
  --json          Output results as JSON
  --strict        Treat warnings as errors
  --fix           Auto-fix common issues where possible
  --report <file> Save report to file
  --help          Show this help message

Examples:
  npx ts-node batch-validate.ts
  npx ts-node batch-validate.ts --strict
  npx ts-node batch-validate.ts --json > results.json
  npx ts-node batch-validate.ts --fix --report validation-report.txt

Auto-fixable Issues:
  - AP004: TODO/FIXME/XXX comments
  - AP005: Placeholder text
  - AP007: Empty headings
  - ST007: Code blocks without language hints
`);
}

function parseArgs(args: string[]): BatchOptions & { help: boolean } {
  const options: BatchOptions & { help: boolean } = {
    skillsDir: path.join(process.cwd(), '.claude', 'skills'),
    jsonOutput: false,
    strict: false,
    autoFix: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--json':
        options.jsonOutput = true;
        break;
      case '--strict':
        options.strict = true;
        break;
      case '--fix':
        options.autoFix = true;
        break;
      case '--dir':
        options.skillsDir = args[++i];
        break;
      case '--report':
        options.reportFile = args[++i];
        break;
    }
  }

  return options;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help) {
    printUsage();
    process.exit(0);
  }

  console.log(`\n🔍 Validating skills in: ${options.skillsDir}\n`);

  const batch = runBatchValidation(options);

  if (options.jsonOutput) {
    console.log(JSON.stringify(batch, null, 2));
  } else {
    const report = formatBatchReport(batch, options.strict);
    console.log(report);

    if (options.reportFile) {
      fs.writeFileSync(options.reportFile, report);
      console.log(`\n📄 Report saved to: ${options.reportFile}`);
    }
  }

  // Exit with error code if any skills are invalid
  const hasInvalid = options.strict
    ? batch.totalErrors > 0 || batch.totalWarnings > 0
    : batch.invalidSkills > 0;

  process.exit(hasInvalid ? 1 : 0);
}

main().catch(console.error);

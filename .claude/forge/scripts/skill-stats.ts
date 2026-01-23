#!/usr/bin/env npx tsx
/**
 * Skill Statistics Generator
 *
 * Analyzes the skill ecosystem and generates comprehensive statistics,
 * including coverage analysis, complexity distribution, and recommendations.
 *
 * Usage:
 *   npx ts-node skill-stats.ts [options]
 *
 * Options:
 *   --dir <path>    Directory containing skills (default: .claude/skills)
 *   --json          Output results as JSON
 *   --markdown      Output results as Markdown
 *   --report <file> Save report to file
 *   --trends        Show growth trends (requires git history)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// ============================================================================
// Types
// ============================================================================

interface SkillInfo {
  name: string;
  path: string;
  category: string;
  complexity: string;
  hasMcp: boolean;
  hasResources: boolean;
  hasScripts: boolean;
  wordCount: number;
  sectionCount: number;
  codeBlockCount: number;
  lastModified: Date;
  createdAt?: Date;
}

interface CategoryStats {
  name: string;
  count: number;
  skills: string[];
  avgWordCount: number;
  avgSectionCount: number;
  mcpIntegrations: number;
}

interface ComplexityStats {
  beginner: number;
  intermediate: number;
  advanced: number;
  unspecified: number;
}

interface EcosystemStats {
  totalSkills: number;
  totalWordCount: number;
  avgWordCount: number;
  avgSectionCount: number;
  avgCodeBlocks: number;
  categories: CategoryStats[];
  complexity: ComplexityStats;
  mcpEnabledCount: number;
  withResources: number;
  withScripts: number;
  recentlyUpdated: SkillInfo[];
  largestSkills: SkillInfo[];
  smallestSkills: SkillInfo[];
  coverageGaps: string[];
  recommendations: string[];
  generatedAt: string;
}

interface StatsOptions {
  skillsDir: string;
  jsonOutput: boolean;
  markdownOutput: boolean;
  showTrends: boolean;
  reportFile?: string;
}

// ============================================================================
// Skill Analysis
// ============================================================================

function parseSkillMd(filePath: string): Partial<SkillInfo> {
  const content = fs.readFileSync(filePath, 'utf8');
  const stats = fs.statSync(filePath);

  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  let category = 'uncategorized';
  let complexity = 'unspecified';

  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const categoryMatch = frontmatter.match(/category:\s*(.+)/);
    const complexityMatch = frontmatter.match(/complexity:\s*(.+)/);
    if (categoryMatch) category = categoryMatch[1].trim();
    if (complexityMatch) complexity = complexityMatch[1].trim();
  }

  // Count sections (headings)
  const sectionCount = (content.match(/^#{1,6}\s+/gm) || []).length;

  // Count code blocks
  const codeBlockCount = (content.match(/```/g) || []).length / 2;

  // Word count (excluding code blocks)
  const textContent = content.replace(/```[\s\S]*?```/g, '');
  const wordCount = textContent.split(/\s+/).filter(Boolean).length;

  // Check for MCP integration
  const hasMcp =
    content.toLowerCase().includes('mcp') ||
    content.includes('mcpServers') ||
    content.includes('## MCP Integration');

  return {
    category,
    complexity,
    hasMcp,
    wordCount,
    sectionCount,
    codeBlockCount: Math.floor(codeBlockCount),
    lastModified: stats.mtime,
  };
}

function analyzeSkill(skillDir: string): SkillInfo | null {
  const skillMdPath = path.join(skillDir, 'SKILL.md');

  if (!fs.existsSync(skillMdPath)) {
    return null;
  }

  const name = path.basename(skillDir);
  const parsed = parseSkillMd(skillMdPath);

  // Check for subdirectories
  const hasResources =
    fs.existsSync(path.join(skillDir, 'references')) ||
    fs.existsSync(path.join(skillDir, 'resources'));
  const hasScripts = fs.existsSync(path.join(skillDir, 'scripts'));

  // Try to get creation date from git
  let createdAt: Date | undefined;
  try {
    const gitLog = execSync(
      `git log --follow --format=%aI --diff-filter=A -- "${skillMdPath}"`,
      { encoding: 'utf8', cwd: path.dirname(skillDir) }
    ).trim();
    if (gitLog) {
      createdAt = new Date(gitLog.split('\n').pop()!);
    }
  } catch {
    // Git not available or file not tracked
  }

  return {
    name,
    path: skillDir,
    category: parsed.category || 'uncategorized',
    complexity: parsed.complexity || 'unspecified',
    hasMcp: parsed.hasMcp || false,
    hasResources,
    hasScripts,
    wordCount: parsed.wordCount || 0,
    sectionCount: parsed.sectionCount || 0,
    codeBlockCount: parsed.codeBlockCount || 0,
    lastModified: parsed.lastModified || new Date(),
    createdAt,
  };
}

function findAllSkills(baseDir: string): SkillInfo[] {
  const skills: SkillInfo[] = [];

  if (!fs.existsSync(baseDir)) {
    return skills;
  }

  const entries = fs.readdirSync(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const skillInfo = analyzeSkill(path.join(baseDir, entry.name));
      if (skillInfo) {
        skills.push(skillInfo);
      }
    }
  }

  return skills;
}

// ============================================================================
// Statistics Calculation
// ============================================================================

function calculateStats(skills: SkillInfo[]): EcosystemStats {
  const stats: EcosystemStats = {
    totalSkills: skills.length,
    totalWordCount: 0,
    avgWordCount: 0,
    avgSectionCount: 0,
    avgCodeBlocks: 0,
    categories: [],
    complexity: {
      beginner: 0,
      intermediate: 0,
      advanced: 0,
      unspecified: 0,
    },
    mcpEnabledCount: 0,
    withResources: 0,
    withScripts: 0,
    recentlyUpdated: [],
    largestSkills: [],
    smallestSkills: [],
    coverageGaps: [],
    recommendations: [],
    generatedAt: new Date().toISOString(),
  };

  if (skills.length === 0) {
    return stats;
  }

  // Aggregate stats
  const categoryMap = new Map<string, SkillInfo[]>();

  for (const skill of skills) {
    stats.totalWordCount += skill.wordCount;
    stats.avgSectionCount += skill.sectionCount;
    stats.avgCodeBlocks += skill.codeBlockCount;

    if (skill.hasMcp) stats.mcpEnabledCount++;
    if (skill.hasResources) stats.withResources++;
    if (skill.hasScripts) stats.withScripts++;

    // Complexity
    const complexity = skill.complexity.toLowerCase();
    if (complexity.includes('beginner')) {
      stats.complexity.beginner++;
    } else if (complexity.includes('intermediate')) {
      stats.complexity.intermediate++;
    } else if (complexity.includes('advanced')) {
      stats.complexity.advanced++;
    } else {
      stats.complexity.unspecified++;
    }

    // Category grouping
    const category = skill.category.toLowerCase();
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(skill);
  }

  // Calculate averages
  stats.avgWordCount = Math.round(stats.totalWordCount / skills.length);
  stats.avgSectionCount = Math.round(stats.avgSectionCount / skills.length);
  stats.avgCodeBlocks = Math.round(stats.avgCodeBlocks / skills.length);

  // Category stats
  for (const [name, categorySkills] of categoryMap) {
    const avgWordCount = Math.round(
      categorySkills.reduce((sum, s) => sum + s.wordCount, 0) / categorySkills.length
    );
    const avgSectionCount = Math.round(
      categorySkills.reduce((sum, s) => sum + s.sectionCount, 0) / categorySkills.length
    );
    const mcpIntegrations = categorySkills.filter((s) => s.hasMcp).length;

    stats.categories.push({
      name,
      count: categorySkills.length,
      skills: categorySkills.map((s) => s.name),
      avgWordCount,
      avgSectionCount,
      mcpIntegrations,
    });
  }

  // Sort categories by count
  stats.categories.sort((a, b) => b.count - a.count);

  // Recently updated (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  stats.recentlyUpdated = skills
    .filter((s) => s.lastModified > thirtyDaysAgo)
    .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
    .slice(0, 10);

  // Largest and smallest by word count
  const sortedBySize = [...skills].sort((a, b) => b.wordCount - a.wordCount);
  stats.largestSkills = sortedBySize.slice(0, 5);
  stats.smallestSkills = sortedBySize.slice(-5).reverse();

  // Identify coverage gaps
  const expectedCategories = [
    'development',
    'design',
    'devops',
    'data',
    'ml-ai',
    'testing',
    'documentation',
    'security',
    'performance',
    'architecture',
  ];

  const presentCategories = new Set(stats.categories.map((c) => c.name));
  stats.coverageGaps = expectedCategories.filter((c) => !presentCategories.has(c));

  // Generate recommendations
  if (stats.coverageGaps.length > 0) {
    stats.recommendations.push(
      `Missing categories: ${stats.coverageGaps.join(', ')}. Consider creating skills for these areas.`
    );
  }

  if (stats.complexity.beginner < skills.length * 0.15) {
    stats.recommendations.push(
      'Low beginner-level skills. Consider adding more introductory skills.'
    );
  }

  if (stats.mcpEnabledCount < skills.length * 0.3) {
    stats.recommendations.push(
      `Only ${Math.round((stats.mcpEnabledCount / skills.length) * 100)}% of skills have MCP integrations. Consider adding more tool integrations.`
    );
  }

  const underDocumented = skills.filter((s) => s.wordCount < 500);
  if (underDocumented.length > 0) {
    stats.recommendations.push(
      `${underDocumented.length} skills have less than 500 words. Consider expanding: ${underDocumented.map((s) => s.name).join(', ')}`
    );
  }

  return stats;
}

// ============================================================================
// Report Formatting
// ============================================================================

function formatTextReport(stats: EcosystemStats): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('╔════════════════════════════════════════════════════════════════════╗');
  lines.push('║              SKILL ECOSYSTEM STATISTICS                            ║');
  lines.push('╚════════════════════════════════════════════════════════════════════╝');
  lines.push('');

  // Overview
  lines.push('📊 OVERVIEW');
  lines.push('─'.repeat(50));
  lines.push(`Total Skills:        ${stats.totalSkills}`);
  lines.push(`Total Word Count:    ${stats.totalWordCount.toLocaleString()}`);
  lines.push(`Average Words/Skill: ${stats.avgWordCount}`);
  lines.push(`Average Sections:    ${stats.avgSectionCount}`);
  lines.push(`Average Code Blocks: ${stats.avgCodeBlocks}`);
  lines.push('');

  // Features
  lines.push('🔧 FEATURES');
  lines.push('─'.repeat(50));
  lines.push(
    `MCP Integrations:    ${stats.mcpEnabledCount} (${Math.round((stats.mcpEnabledCount / stats.totalSkills) * 100)}%)`
  );
  lines.push(
    `With Resources:      ${stats.withResources} (${Math.round((stats.withResources / stats.totalSkills) * 100)}%)`
  );
  lines.push(
    `With Scripts:        ${stats.withScripts} (${Math.round((stats.withScripts / stats.totalSkills) * 100)}%)`
  );
  lines.push('');

  // Complexity Distribution
  lines.push('📈 COMPLEXITY DISTRIBUTION');
  lines.push('─'.repeat(50));
  const total = stats.totalSkills;
  lines.push(`Beginner:     ${'█'.repeat(Math.round((stats.complexity.beginner / total) * 30))} ${stats.complexity.beginner}`);
  lines.push(`Intermediate: ${'█'.repeat(Math.round((stats.complexity.intermediate / total) * 30))} ${stats.complexity.intermediate}`);
  lines.push(`Advanced:     ${'█'.repeat(Math.round((stats.complexity.advanced / total) * 30))} ${stats.complexity.advanced}`);
  if (stats.complexity.unspecified > 0) {
    lines.push(`Unspecified:  ${'░'.repeat(Math.round((stats.complexity.unspecified / total) * 30))} ${stats.complexity.unspecified}`);
  }
  lines.push('');

  // Categories
  lines.push('📁 CATEGORIES');
  lines.push('─'.repeat(50));
  for (const cat of stats.categories) {
    const bar = '█'.repeat(Math.min(cat.count, 20));
    lines.push(`${cat.name.padEnd(20)} ${bar} ${cat.count}`);
  }
  lines.push('');

  // Recently Updated
  if (stats.recentlyUpdated.length > 0) {
    lines.push('🕐 RECENTLY UPDATED (Last 30 Days)');
    lines.push('─'.repeat(50));
    for (const skill of stats.recentlyUpdated.slice(0, 5)) {
      const date = skill.lastModified.toISOString().split('T')[0];
      lines.push(`  ${date}  ${skill.name}`);
    }
    lines.push('');
  }

  // Size Extremes
  lines.push('📏 SIZE ANALYSIS');
  lines.push('─'.repeat(50));
  lines.push('Largest:');
  for (const skill of stats.largestSkills.slice(0, 3)) {
    lines.push(`  ${skill.wordCount.toLocaleString().padStart(6)} words  ${skill.name}`);
  }
  lines.push('Smallest:');
  for (const skill of stats.smallestSkills.slice(0, 3)) {
    lines.push(`  ${skill.wordCount.toLocaleString().padStart(6)} words  ${skill.name}`);
  }
  lines.push('');

  // Recommendations
  if (stats.recommendations.length > 0) {
    lines.push('💡 RECOMMENDATIONS');
    lines.push('─'.repeat(50));
    for (const rec of stats.recommendations) {
      lines.push(`  • ${rec}`);
    }
    lines.push('');
  }

  // Coverage Gaps
  if (stats.coverageGaps.length > 0) {
    lines.push('⚠️  COVERAGE GAPS');
    lines.push('─'.repeat(50));
    lines.push(`Missing categories: ${stats.coverageGaps.join(', ')}`);
    lines.push('');
  }

  lines.push('─'.repeat(50));
  lines.push(`Generated: ${stats.generatedAt}`);

  return lines.join('\n');
}

function formatMarkdownReport(stats: EcosystemStats): string {
  const lines: string[] = [];

  lines.push('# Skill Ecosystem Statistics');
  lines.push('');
  lines.push(`*Generated: ${stats.generatedAt}*`);
  lines.push('');

  // Overview
  lines.push('## Overview');
  lines.push('');
  lines.push('| Metric | Value |');
  lines.push('|--------|-------|');
  lines.push(`| Total Skills | ${stats.totalSkills} |`);
  lines.push(`| Total Word Count | ${stats.totalWordCount.toLocaleString()} |`);
  lines.push(`| Average Words/Skill | ${stats.avgWordCount} |`);
  lines.push(`| Average Sections | ${stats.avgSectionCount} |`);
  lines.push(`| MCP Integrations | ${stats.mcpEnabledCount} (${Math.round((stats.mcpEnabledCount / stats.totalSkills) * 100)}%) |`);
  lines.push('');

  // Complexity
  lines.push('## Complexity Distribution');
  lines.push('');
  lines.push('| Level | Count | Percentage |');
  lines.push('|-------|-------|------------|');
  lines.push(`| Beginner | ${stats.complexity.beginner} | ${Math.round((stats.complexity.beginner / stats.totalSkills) * 100)}% |`);
  lines.push(`| Intermediate | ${stats.complexity.intermediate} | ${Math.round((stats.complexity.intermediate / stats.totalSkills) * 100)}% |`);
  lines.push(`| Advanced | ${stats.complexity.advanced} | ${Math.round((stats.complexity.advanced / stats.totalSkills) * 100)}% |`);
  lines.push('');

  // Categories
  lines.push('## Categories');
  lines.push('');
  lines.push('| Category | Skills | Avg Words | MCP |');
  lines.push('|----------|--------|-----------|-----|');
  for (const cat of stats.categories) {
    lines.push(`| ${cat.name} | ${cat.count} | ${cat.avgWordCount} | ${cat.mcpIntegrations} |`);
  }
  lines.push('');

  // Recommendations
  if (stats.recommendations.length > 0) {
    lines.push('## Recommendations');
    lines.push('');
    for (const rec of stats.recommendations) {
      lines.push(`- ${rec}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// ============================================================================
// CLI
// ============================================================================

function printUsage(): void {
  console.log(`
Skill Statistics Generator
==========================

Analyzes the skill ecosystem and generates statistics.

Usage:
  npx ts-node skill-stats.ts [options]

Options:
  --dir <path>    Directory containing skills (default: .claude/skills)
  --json          Output results as JSON
  --markdown      Output results as Markdown
  --report <file> Save report to file
  --help          Show this help message

Examples:
  npx ts-node skill-stats.ts
  npx ts-node skill-stats.ts --json > stats.json
  npx ts-node skill-stats.ts --markdown --report STATS.md
`);
}

function parseArgs(args: string[]): StatsOptions & { help: boolean } {
  const options: StatsOptions & { help: boolean } = {
    skillsDir: path.join(process.cwd(), '.claude', 'skills'),
    jsonOutput: false,
    markdownOutput: false,
    showTrends: false,
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
      case '--markdown':
        options.markdownOutput = true;
        break;
      case '--trends':
        options.showTrends = true;
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

  console.log(`\n📊 Analyzing skills in: ${options.skillsDir}\n`);

  const skills = findAllSkills(options.skillsDir);

  if (skills.length === 0) {
    console.error('No skills found in the specified directory.');
    process.exit(1);
  }

  const stats = calculateStats(skills);

  let output: string;

  if (options.jsonOutput) {
    output = JSON.stringify(stats, null, 2);
  } else if (options.markdownOutput) {
    output = formatMarkdownReport(stats);
  } else {
    output = formatTextReport(stats);
  }

  console.log(output);

  if (options.reportFile) {
    fs.writeFileSync(options.reportFile, output);
    console.log(`\n📄 Report saved to: ${options.reportFile}`);
  }
}

main().catch(console.error);

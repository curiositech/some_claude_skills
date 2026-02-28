#!/usr/bin/env npx tsx
/**
 * Batch Process Skill Submissions
 *
 * CLI tool to fetch and process skill submissions from GitHub Issues.
 * Can be run locally to preview, validate, and create skills from submissions.
 *
 * Usage:
 *   npx tsx scripts/batch-process-submissions.ts list          # List pending submissions
 *   npx tsx scripts/batch-process-submissions.ts validate <id> # Validate a specific issue
 *   npx tsx scripts/batch-process-submissions.ts create <id>   # Create skill from issue
 *   npx tsx scripts/batch-process-submissions.ts process-all   # Process all pending
 *
 * Environment:
 *   GITHUB_TOKEN - Required for API access (or use gh cli auth)
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// =============================================================================
// TYPES
// =============================================================================

interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  user: { login: string };
  labels: { name: string }[];
  state: string;
  created_at: string;
}

interface ParsedSubmission {
  skillId: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  allowedTools: string[];
  content: string;
  submitter?: string;
  submitterGithub?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  submission?: ParsedSubmission;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const REPO_OWNER = 'curiositech';
const REPO_NAME = 'some_claude_skills';
const SKILLS_DIR = path.join(process.cwd(), '..', '.claude', 'skills');

const VALID_CATEGORIES = [
  'AI & Machine Learning',
  'Code Quality & Testing',
  'Content & Writing',
  'Data & Analytics',
  'Design & Creative',
  'DevOps & Site Reliability',
  'Business & Monetization',
  'Research & Analysis',
  'Productivity & Meta',
  'Lifestyle & Personal',
];

// =============================================================================
// GITHUB API
// =============================================================================

function getGitHubToken(): string {
  // Try environment variable first
  if (process.env.GITHUB_TOKEN) {
    return process.env.GITHUB_TOKEN;
  }

  // Try gh cli
  try {
    const token = execSync('gh auth token', { encoding: 'utf-8' }).trim();
    if (token) return token;
  } catch {
    // gh not available or not logged in
  }

  throw new Error(
    'GitHub token required. Set GITHUB_TOKEN env var or login with: gh auth login'
  );
}

async function fetchIssues(label: string): Promise<GitHubIssue[]> {
  const token = getGitHubToken();

  const response = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?labels=${label}&state=open&per_page=100`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function fetchIssue(number: number): Promise<GitHubIssue> {
  const token = getGitHubToken();

  const response = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${number}`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function addLabel(issueNumber: number, label: string): Promise<void> {
  const token = getGitHubToken();

  await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/labels`,
    {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ labels: [label] }),
    }
  );
}

async function addComment(issueNumber: number, body: string): Promise<void> {
  const token = getGitHubToken();

  await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${issueNumber}/comments`,
    {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body }),
    }
  );
}

// =============================================================================
// PARSING
// =============================================================================

function extractYamlBlock(issueBody: string): string | null {
  const yamlMatch = issueBody.match(/```yaml\n([\s\S]*?)```/);
  if (yamlMatch) {
    return yamlMatch[1].trim();
  }

  const codeMatch = issueBody.match(/## SKILL\.md Content\s*```\n([\s\S]*?)```/);
  if (codeMatch) {
    return codeMatch[1].trim();
  }

  return null;
}

function parseSkillContent(yamlContent: string): ParsedSubmission | null {
  const frontmatterMatch = yamlContent.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return null;
  }

  const frontmatter = frontmatterMatch[1];

  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descMatch = frontmatter.match(/^description:\s*(.+)$/m);
  const categoryMatch = frontmatter.match(/^category:\s*(.+)$/m);
  const toolsMatch = frontmatter.match(/^allowed-tools:\s*(.+)$/m);

  const tagsSection = frontmatter.match(/^tags:\n((?:\s+-\s+.+\n?)+)/m);
  const tags: string[] = [];
  if (tagsSection) {
    const tagLines = tagsSection[1].matchAll(/^\s+-\s+(.+)$/gm);
    for (const match of tagLines) {
      tags.push(match[1].trim());
    }
  }

  if (!nameMatch || !descMatch || !categoryMatch) {
    return null;
  }

  const content = yamlContent.slice(frontmatterMatch[0].length).trim();
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : nameMatch[1].trim();

  return {
    skillId: nameMatch[1].trim(),
    title,
    category: categoryMatch[1].trim(),
    description: descMatch[1].trim(),
    tags,
    allowedTools: toolsMatch ? toolsMatch[1].split(',').map(t => t.trim()) : [],
    content: yamlContent,
  };
}

// =============================================================================
// VALIDATION
// =============================================================================

function validateSubmission(submission: ParsedSubmission): ValidationResult {
  const errors: string[] = [];

  if (!submission.skillId) {
    errors.push('Skill ID (name) is required');
  } else if (!/^[a-z0-9-]+$/.test(submission.skillId)) {
    errors.push('Skill ID must be lowercase with hyphens only');
  } else if (submission.skillId.length < 3 || submission.skillId.length > 50) {
    errors.push('Skill ID must be 3-50 characters');
  }

  const skillDir = path.join(SKILLS_DIR, submission.skillId);
  if (fs.existsSync(skillDir)) {
    errors.push(`Skill "${submission.skillId}" already exists`);
  }

  if (!submission.title || submission.title.length < 5) {
    errors.push('Skill title must be at least 5 characters');
  }

  if (!VALID_CATEGORIES.includes(submission.category)) {
    errors.push(`Invalid category: ${submission.category}`);
  }

  if (!submission.description || submission.description.length < 50) {
    errors.push('Description must be at least 50 characters');
  }

  if (submission.tags.length === 0) {
    errors.push('At least one tag is required');
  }

  if (!submission.content.includes('## When to Use')) {
    errors.push('Missing "## When to Use" section');
  }

  return {
    valid: errors.length === 0,
    errors,
    submission: errors.length === 0 ? submission : undefined,
  };
}

// =============================================================================
// SKILL CREATION
// =============================================================================

function createSkillFiles(submission: ParsedSubmission): string {
  const skillDir = path.join(SKILLS_DIR, submission.skillId);

  if (!fs.existsSync(skillDir)) {
    fs.mkdirSync(skillDir, { recursive: true });
  }

  const skillPath = path.join(skillDir, 'SKILL.md');
  fs.writeFileSync(skillPath, submission.content, 'utf-8');

  return skillPath;
}

// =============================================================================
// CLI COMMANDS
// =============================================================================

async function listSubmissions(): Promise<void> {
  console.log('📋 Fetching skill submissions...\n');

  const issues = await fetchIssues('skill-submission');
  const pending = issues.filter(i => !i.labels.some(l => l.name === 'processed'));

  if (pending.length === 0) {
    console.log('No pending skill submissions found.');
    return;
  }

  console.log(`Found ${pending.length} pending submission(s):\n`);

  for (const issue of pending) {
    const yamlContent = extractYamlBlock(issue.body);
    const parsed = yamlContent ? parseSkillContent(yamlContent) : null;

    console.log(`#${issue.number} - ${issue.title}`);
    console.log(`   Author: @${issue.user.login}`);
    console.log(`   Created: ${new Date(issue.created_at).toLocaleDateString()}`);

    if (parsed) {
      console.log(`   Skill ID: ${parsed.skillId}`);
      console.log(`   Category: ${parsed.category}`);
    } else {
      console.log(`   ⚠️  Could not parse submission`);
    }

    console.log('');
  }
}

async function validateIssue(issueNumber: number): Promise<void> {
  console.log(`🔍 Validating issue #${issueNumber}...\n`);

  const issue = await fetchIssue(issueNumber);
  const yamlContent = extractYamlBlock(issue.body);

  if (!yamlContent) {
    console.log('❌ Could not find YAML content block');
    return;
  }

  const parsed = parseSkillContent(yamlContent);
  if (!parsed) {
    console.log('❌ Could not parse SKILL.md content');
    return;
  }

  const result = validateSubmission(parsed);

  console.log(`Skill: ${parsed.title} (${parsed.skillId})`);
  console.log(`Category: ${parsed.category}`);
  console.log(`Tags: ${parsed.tags.join(', ')}`);
  console.log(`Description: ${parsed.description.substring(0, 100)}...`);
  console.log('');

  if (result.valid) {
    console.log('✅ Submission is valid!');
  } else {
    console.log('❌ Validation errors:');
    result.errors.forEach(e => console.log(`   - ${e}`));
  }
}

async function createFromIssue(issueNumber: number, dryRun: boolean = false): Promise<void> {
  console.log(`📦 Creating skill from issue #${issueNumber}${dryRun ? ' (dry run)' : ''}...\n`);

  const issue = await fetchIssue(issueNumber);
  const yamlContent = extractYamlBlock(issue.body);

  if (!yamlContent) {
    console.log('❌ Could not find YAML content block');
    return;
  }

  const parsed = parseSkillContent(yamlContent);
  if (!parsed) {
    console.log('❌ Could not parse SKILL.md content');
    return;
  }

  const result = validateSubmission(parsed);
  if (!result.valid) {
    console.log('❌ Validation failed:');
    result.errors.forEach(e => console.log(`   - ${e}`));
    return;
  }

  if (dryRun) {
    console.log('Would create skill:');
    console.log(`   Path: .claude/skills/${parsed.skillId}/SKILL.md`);
    console.log(`   Title: ${parsed.title}`);
    console.log(`   Category: ${parsed.category}`);
    return;
  }

  const skillPath = createSkillFiles(parsed);
  console.log(`✅ Created skill at: ${skillPath}`);

  // Add processed label and comment
  await addLabel(issueNumber, 'processed');
  await addComment(issueNumber, `## ✅ Skill Created\n\nYour skill "${parsed.title}" has been added to the collection!\n\nPath: \`.claude/skills/${parsed.skillId}/SKILL.md\``);

  console.log(`\n📝 Next steps:`);
  console.log(`   1. Run: npm run skills:generate`);
  console.log(`   2. Commit: git add -A && git commit -m "feat(skills): Add ${parsed.title}"`);
  console.log(`   3. Push: git push`);
}

async function processAll(dryRun: boolean = false): Promise<void> {
  console.log(`🚀 Processing all submissions${dryRun ? ' (dry run)' : ''}...\n`);

  const issues = await fetchIssues('skill-submission');
  const pending = issues.filter(i => !i.labels.some(l => l.name === 'processed'));

  if (pending.length === 0) {
    console.log('No pending submissions to process.');
    return;
  }

  let created = 0;
  let failed = 0;

  for (const issue of pending) {
    console.log(`\n--- Processing #${issue.number}: ${issue.title} ---`);

    const yamlContent = extractYamlBlock(issue.body);
    if (!yamlContent) {
      console.log('❌ Could not find YAML content');
      failed++;
      continue;
    }

    const parsed = parseSkillContent(yamlContent);
    if (!parsed) {
      console.log('❌ Could not parse content');
      failed++;
      continue;
    }

    const result = validateSubmission(parsed);
    if (!result.valid) {
      console.log('❌ Validation failed:', result.errors.join(', '));
      if (!dryRun) {
        await addLabel(issue.number, 'needs-revision');
      }
      failed++;
      continue;
    }

    if (!dryRun) {
      createSkillFiles(parsed);
      await addLabel(issue.number, 'processed');
    }

    console.log(`✅ ${dryRun ? 'Would create' : 'Created'}: ${parsed.skillId}`);
    created++;
  }

  console.log(`\n📊 Summary: ${created} created, ${failed} failed`);
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const [command, arg, flag] = process.argv.slice(2);

  switch (command) {
    case 'list':
      await listSubmissions();
      break;

    case 'validate':
      if (!arg) {
        console.error('Usage: batch-process-submissions.ts validate <issue_number>');
        process.exit(1);
      }
      await validateIssue(parseInt(arg, 10));
      break;

    case 'create':
      if (!arg) {
        console.error('Usage: batch-process-submissions.ts create <issue_number> [--dry-run]');
        process.exit(1);
      }
      await createFromIssue(parseInt(arg, 10), flag === '--dry-run');
      break;

    case 'process-all':
      await processAll(arg === '--dry-run');
      break;

    default:
      console.log(`
Batch Process Skill Submissions

Usage:
  npx tsx scripts/batch-process-submissions.ts <command> [options]

Commands:
  list                   List all pending skill submissions
  validate <id>          Validate a specific issue submission
  create <id>            Create skill files from issue (--dry-run available)
  process-all            Process all pending submissions (--dry-run available)

Examples:
  npx tsx scripts/batch-process-submissions.ts list
  npx tsx scripts/batch-process-submissions.ts validate 42
  npx tsx scripts/batch-process-submissions.ts create 42 --dry-run
  npx tsx scripts/batch-process-submissions.ts process-all --dry-run
`);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});

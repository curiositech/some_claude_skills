#!/usr/bin/env npx tsx
/**
 * Process Skill Submission
 *
 * Parses and validates skill submissions from GitHub Issues.
 * Used by the GitHub Action workflow to automatically process submissions.
 *
 * Usage: npx tsx scripts/process-skill-submission.ts <issue_number>
 *
 * The script fetches the issue body via GitHub API to avoid shell escaping issues.
 */

import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// TYPES
// =============================================================================

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

const RESERVED_SKILL_IDS = [
  'test',
  'example',
  'sample',
  'demo',
  'template',
];

// =============================================================================
// PARSING
// =============================================================================

function extractYamlBlock(issueBody: string): string | null {
  // Look for YAML code block in the issue body
  const yamlMatch = issueBody.match(/```yaml\n([\s\S]*?)```/);
  if (yamlMatch) {
    return yamlMatch[1].trim();
  }

  // Also try without language specifier
  const codeMatch = issueBody.match(/## SKILL\.md Content\s*```\n([\s\S]*?)```/);
  if (codeMatch) {
    return codeMatch[1].trim();
  }

  return null;
}

function parseSkillContent(yamlContent: string): ParsedSubmission | null {
  // Parse YAML frontmatter
  const frontmatterMatch = yamlContent.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    return null;
  }

  const frontmatter = frontmatterMatch[1];
  const content = yamlContent.slice(frontmatterMatch[0].length).trim();

  // Extract fields from frontmatter
  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descMatch = frontmatter.match(/^description:\s*(.+)$/m);
  const categoryMatch = frontmatter.match(/^category:\s*(.+)$/m);
  const toolsMatch = frontmatter.match(/^allowed-tools:\s*(.+)$/m);

  // Extract tags
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

  // Extract title from content (first H1)
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

function extractMetadata(issueBody: string): { submitter?: string; submitterGithub?: string } {
  const submitterMatch = issueBody.match(/\*\*Submitted by:\*\*\s*(.+)/);
  const githubMatch = issueBody.match(/\*\*GitHub:\*\*\s*@?(\w+)/);

  return {
    submitter: submitterMatch?.[1]?.trim(),
    submitterGithub: githubMatch?.[1]?.trim(),
  };
}

// =============================================================================
// VALIDATION
// =============================================================================

function validateSubmission(submission: ParsedSubmission): ValidationResult {
  const errors: string[] = [];

  // Validate skill ID
  if (!submission.skillId) {
    errors.push('Skill ID (name) is required');
  } else if (!/^[a-z0-9-]+$/.test(submission.skillId)) {
    errors.push('Skill ID must be lowercase with hyphens only (e.g., my-skill-name)');
  } else if (submission.skillId.length < 3) {
    errors.push('Skill ID must be at least 3 characters');
  } else if (submission.skillId.length > 50) {
    errors.push('Skill ID must be less than 50 characters');
  } else if (RESERVED_SKILL_IDS.includes(submission.skillId)) {
    errors.push(`Skill ID "${submission.skillId}" is reserved`);
  }

  // Check for duplicate
  const skillDir = path.join(process.cwd(), '..', '.claude', 'skills', submission.skillId);
  if (fs.existsSync(skillDir)) {
    errors.push(`A skill with ID "${submission.skillId}" already exists`);
  }

  // Validate title
  if (!submission.title) {
    errors.push('Skill title is required');
  } else if (submission.title.length < 5) {
    errors.push('Skill title must be at least 5 characters');
  }

  // Validate category
  if (!submission.category) {
    errors.push('Category is required');
  } else if (!VALID_CATEGORIES.includes(submission.category)) {
    errors.push(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // Validate description
  if (!submission.description) {
    errors.push('Description is required');
  } else if (submission.description.length < 50) {
    errors.push('Description must be at least 50 characters');
  } else if (submission.description.length > 500) {
    errors.push('Description must be less than 500 characters');
  }

  // Validate tags
  if (submission.tags.length === 0) {
    errors.push('At least one tag is required');
  } else if (submission.tags.length > 10) {
    errors.push('Maximum 10 tags allowed');
  }

  // Validate content has required sections
  if (!submission.content.includes('## When to Use')) {
    errors.push('Content must include a "## When to Use" section');
  }

  return {
    valid: errors.length === 0,
    errors,
    submission: errors.length === 0 ? submission : undefined,
  };
}

// =============================================================================
// GITHUB API
// =============================================================================

interface GitHubIssue {
  number: number;
  title: string;
  body: string;
  user: {
    login: string;
  };
}

async function fetchIssue(issueNumber: string): Promise<GitHubIssue> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY || 'erichowens/some_claude_skills';

  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is required');
  }

  const response = await fetch(
    `https://api.github.com/repos/${repo}/issues/${issueNumber}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'skill-submission-processor',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch issue #${issueNumber}: ${response.statusText}`);
  }

  return response.json();
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  const [issueNumber] = process.argv.slice(2);

  if (!issueNumber) {
    console.error('Usage: process-skill-submission.ts <issue_number>');
    process.exit(1);
  }

  console.log(`Processing skill submission from issue #${issueNumber}`);

  // Fetch issue body from GitHub API (avoids shell escaping issues)
  let issueBody: string;
  let submitterGithub: string | undefined;

  try {
    const issue = await fetchIssue(issueNumber);
    issueBody = issue.body;
    submitterGithub = issue.user.login;
    console.log(`Fetched issue: ${issue.title}`);
  } catch (error) {
    console.error(`Failed to fetch issue: ${error}`);
    setOutput('valid', 'false');
    setOutput('errors', `Failed to fetch issue #${issueNumber} from GitHub API`);
    process.exit(0);
  }

  // Extract YAML content
  const yamlContent = extractYamlBlock(issueBody);
  if (!yamlContent) {
    setOutput('valid', 'false');
    setOutput('errors', 'Could not find YAML content block in issue body');
    process.exit(0);
  }

  // Parse the submission
  const submission = parseSkillContent(yamlContent);
  if (!submission) {
    setOutput('valid', 'false');
    setOutput('errors', 'Could not parse SKILL.md content. Ensure it has valid YAML frontmatter.');
    process.exit(0);
  }

  // Add metadata from API and issue body
  const metadata = extractMetadata(issueBody);
  submission.submitter = metadata.submitter;
  submission.submitterGithub = submitterGithub || metadata.submitterGithub;

  // Validate
  const result = validateSubmission(submission);

  if (result.valid) {
    setOutput('valid', 'true');
    setOutput('skill_id', submission.skillId);
    setOutput('skill_title', submission.title);
    setOutput('category', submission.category);
    // Base64 encode the content to avoid shell escaping issues
    setOutput('skill_content', Buffer.from(submission.content).toString('base64'));
    console.log(`✅ Valid submission: ${submission.title} (${submission.skillId})`);
  } else {
    setOutput('valid', 'false');
    setOutput('errors', result.errors.join('\n'));
    console.log(`❌ Validation failed:\n${result.errors.map(e => `  - ${e}`).join('\n')}`);
  }
}

function setOutput(name: string, value: string) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    fs.appendFileSync(outputFile, `${name}=${value}\n`);
  } else {
    // For local testing, just print
    console.log(`OUTPUT: ${name}=${value}`);
  }
}

main().catch(err => {
  console.error('Error processing submission:', err);
  process.exit(1);
});

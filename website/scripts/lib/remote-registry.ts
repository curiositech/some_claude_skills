/**
 * Remote Skill Registry
 *
 * Supports importing skills from external GitHub repositories
 * and publishing to a central registry.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { ParsedSkill, parseSkillFile } from './skill-parser';

// =============================================================================
// TYPES
// =============================================================================

export interface RemoteSkill {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  source: {
    type: 'github' | 'url';
    repo?: string;
    branch?: string;
    path?: string;
    url?: string;
  };
  version?: string;
  author?: string;
  lastUpdated?: string;
}

export interface RegistryManifest {
  version: string;
  lastUpdated: string;
  skills: RemoteSkill[];
}

export interface ImportResult {
  success: boolean;
  skillId: string;
  path?: string;
  error?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const REGISTRY_URL = 'https://raw.githubusercontent.com/curiositech/some_claude_skills/main/registry.json';
const LOCAL_SKILLS_DIR = path.join(process.cwd(), '..', '.claude', 'skills');

// =============================================================================
// GITHUB FETCHING
// =============================================================================

function getGitHubToken(): string | null {
  if (process.env.GITHUB_TOKEN) {
    return process.env.GITHUB_TOKEN;
  }

  try {
    const token = execSync('gh auth token', { encoding: 'utf-8' }).trim();
    if (token) return token;
  } catch {
    // gh not available
  }

  return null;
}

async function fetchFromGitHub(
  repo: string,
  path: string,
  branch: string = 'main'
): Promise<string | null> {
  const token = getGitHubToken();
  const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3.raw',
  };

  if (token) {
    headers.Authorization = `token ${token}`;
  }

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.error(`GitHub API error: ${response.status}`);
      return null;
    }
    return await response.text();
  } catch (err) {
    console.error('Error fetching from GitHub:', err);
    return null;
  }
}

async function fetchFromUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Fetch error: ${response.status}`);
      return null;
    }
    return await response.text();
  } catch (err) {
    console.error('Error fetching URL:', err);
    return null;
  }
}

// =============================================================================
// REGISTRY OPERATIONS
// =============================================================================

export async function fetchRegistry(): Promise<RegistryManifest | null> {
  try {
    const content = await fetchFromUrl(REGISTRY_URL);
    if (!content) return null;
    return JSON.parse(content);
  } catch (err) {
    console.error('Error fetching registry:', err);
    return null;
  }
}

export async function searchRegistry(
  query: string,
  options?: { category?: string; tags?: string[] }
): Promise<RemoteSkill[]> {
  const registry = await fetchRegistry();
  if (!registry) return [];

  const queryLower = query.toLowerCase();

  return registry.skills.filter(skill => {
    // Text search
    const matchesQuery =
      skill.id.toLowerCase().includes(queryLower) ||
      skill.title.toLowerCase().includes(queryLower) ||
      skill.description.toLowerCase().includes(queryLower) ||
      skill.tags.some(t => t.toLowerCase().includes(queryLower));

    // Category filter
    const matchesCategory = !options?.category ||
      skill.category === options.category;

    // Tags filter
    const matchesTags = !options?.tags?.length ||
      options.tags.some(t => skill.tags.includes(t));

    return matchesQuery && matchesCategory && matchesTags;
  });
}

// =============================================================================
// SKILL IMPORT
// =============================================================================

export async function importSkill(source: RemoteSkill['source']): Promise<ImportResult> {
  let content: string | null = null;

  // Fetch content based on source type
  if (source.type === 'github' && source.repo && source.path) {
    content = await fetchFromGitHub(source.repo, source.path, source.branch);
  } else if (source.type === 'url' && source.url) {
    content = await fetchFromUrl(source.url);
  }

  if (!content) {
    return {
      success: false,
      skillId: '',
      error: 'Could not fetch skill content',
    };
  }

  // Parse the skill content
  const parsed = parseSkillFile(content, 'remote');
  if (!parsed) {
    return {
      success: false,
      skillId: '',
      error: 'Could not parse skill content',
    };
  }

  // Check for duplicates
  const targetDir = path.join(LOCAL_SKILLS_DIR, parsed.id);
  if (fs.existsSync(targetDir)) {
    return {
      success: false,
      skillId: parsed.id,
      error: `Skill "${parsed.id}" already exists locally`,
    };
  }

  // Create skill directory and file
  fs.mkdirSync(targetDir, { recursive: true });
  const skillPath = path.join(targetDir, 'SKILL.md');
  fs.writeFileSync(skillPath, content, 'utf-8');

  return {
    success: true,
    skillId: parsed.id,
    path: skillPath,
  };
}

export async function importFromGitHub(
  repo: string,
  skillPath: string,
  branch: string = 'main'
): Promise<ImportResult> {
  return importSkill({
    type: 'github',
    repo,
    path: skillPath,
    branch,
  });
}

export async function importFromUrl(url: string): Promise<ImportResult> {
  return importSkill({
    type: 'url',
    url,
  });
}

// =============================================================================
// SKILL EXPORT / PUBLISHING
// =============================================================================

export function generateRegistryEntry(skill: ParsedSkill, repo: string): RemoteSkill {
  return {
    id: skill.id,
    title: skill.title,
    description: skill.shortDescription,
    category: skill.category,
    tags: skill.tags,
    source: {
      type: 'github',
      repo,
      path: `.claude/skills/${skill.id}/SKILL.md`,
      branch: 'main',
    },
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
  };
}

export function generateRegistryManifest(
  skills: ParsedSkill[],
  repo: string
): RegistryManifest {
  return {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    skills: skills.map(s => generateRegistryEntry(s, repo)),
  };
}

export function writeRegistryManifest(
  skills: ParsedSkill[],
  outputPath: string,
  repo: string = 'curiositech/some_claude_skills'
): void {
  const manifest = generateRegistryManifest(skills, repo);
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf-8');
}

// =============================================================================
// UTILITIES
// =============================================================================

export function parseGitHubUrl(url: string): {
  repo: string;
  path: string;
  branch: string;
} | null {
  // Handle raw.githubusercontent.com URLs
  const rawMatch = url.match(
    /raw\.githubusercontent\.com\/([^/]+\/[^/]+)\/([^/]+)\/(.+)/
  );
  if (rawMatch) {
    return {
      repo: rawMatch[1],
      branch: rawMatch[2],
      path: rawMatch[3],
    };
  }

  // Handle github.com blob URLs
  const blobMatch = url.match(
    /github\.com\/([^/]+\/[^/]+)\/blob\/([^/]+)\/(.+)/
  );
  if (blobMatch) {
    return {
      repo: blobMatch[1],
      branch: blobMatch[2],
      path: blobMatch[3],
    };
  }

  return null;
}

export async function validateRemoteSkill(source: RemoteSkill['source']): Promise<{
  valid: boolean;
  skill?: ParsedSkill;
  error?: string;
}> {
  let content: string | null = null;

  if (source.type === 'github' && source.repo && source.path) {
    content = await fetchFromGitHub(source.repo, source.path, source.branch);
  } else if (source.type === 'url' && source.url) {
    content = await fetchFromUrl(source.url);
  }

  if (!content) {
    return { valid: false, error: 'Could not fetch skill content' };
  }

  const parsed = parseSkillFile(content, 'remote');
  if (!parsed) {
    return { valid: false, error: 'Invalid skill format' };
  }

  return { valid: true, skill: parsed };
}

#!/usr/bin/env npx tsx
/**
 * Import skills from the Docusaurus site's generated data
 * Transforms the data format for the Next.js app
 */

import * as fs from 'fs';
import * as path from 'path';

// Read the source skills file
const sourceSkillsPath = path.join(__dirname, '../../website/src/data/skills.ts');
const sourceContent = fs.readFileSync(sourceSkillsPath, 'utf-8');

// Extract skill descriptions
const descriptionsMatch = sourceContent.match(/const skillDescriptions: Record<string, string> = ({[\s\S]*?});/);
const descriptions: Record<string, string> = {};
if (descriptionsMatch) {
  const descStr = descriptionsMatch[1];
  const regex = /"([^"]+)":\s*"((?:[^"\\]|\\.)*)"/g;
  let match;
  while ((match = regex.exec(descStr)) !== null) {
    descriptions[match[1]] = match[2].replace(/\\"/g, '"').replace(/\\n/g, '\n');
  }
}

console.log(`Found ${Object.keys(descriptions).length} descriptions`);

// Parse skills from the skills array
interface ParsedSkill {
  id: string;
  title: string;
  category: string;
  tags: string[];
  heroImage?: string;
}

const skills: ParsedSkill[] = [];
const skillRegex = /\{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*category:\s*'([^']+)'[^}]*tags:\s*\[([^\]]*)\][^}]*(heroImage:\s*'([^']+)')?/g;

let match;
while ((match = skillRegex.exec(sourceContent)) !== null) {
  const tags = match[4] ? match[4].split(',').map(t => t.trim().replace(/'/g, '')).filter(Boolean) : [];
  skills.push({
    id: match[1],
    title: match[2].replace(/\\'/g, "'"),
    category: match[3],
    tags,
    heroImage: match[6],
  });
}

console.log(`Parsed ${skills.length} skills`);

// Category mapping
const categoryMapping: Record<string, string> = {
  'AI & Machine Learning': 'development',
  'Code Quality & Testing': 'testing',
  'Content & Writing': 'documentation',
  'Data & Analytics': 'data',
  'Design & Creative': 'design',
  'DevOps & Site Reliability': 'devops',
  'Business & Monetization': 'architecture',
  'Research & Analysis': 'data',
  'Productivity & Meta': 'architecture',
  'Lifestyle & Personal': 'documentation',
};

const categoryIcons: Record<string, string> = {
  'AI & Machine Learning': '🤖',
  'Code Quality & Testing': '🧪',
  'Content & Writing': '✍️',
  'Data & Analytics': '📊',
  'Design & Creative': '🎨',
  'DevOps & Site Reliability': '🔧',
  'Business & Monetization': '💼',
  'Research & Analysis': '🔍',
  'Productivity & Meta': '⚡',
  'Lifestyle & Personal': '🌱',
};

function getDifficulty(tags: string[]): string {
  if (tags.includes('beginner-friendly')) return 'beginner';
  if (tags.includes('advanced') || tags.includes('production-ready')) return 'advanced';
  return 'intermediate';
}

function escapeForTemplate(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

// Build output
let output = `/*
 * ═══════════════════════════════════════════════════════════════════════════
 * SKILL DATA - AUTO-GENERATED FROM DOCUSAURUS
 * Generated: ${new Date().toISOString()}
 * Total Skills: ${skills.length}
 * 
 * DO NOT EDIT - Run 'npm run import:skills' to regenerate
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface Skill {
  id: string;
  title: string;
  description: string;
  category: SkillCategory;
  icon: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  installCommand: string;
  references?: SkillReference[];
  heroImage?: string;
}

export interface SkillReference {
  title: string;
  type: 'guide' | 'example' | 'related-skill' | 'external';
  url: string;
  description?: string;
}

export type SkillCategory =
  | 'development'
  | 'architecture'
  | 'devops'
  | 'design'
  | 'data'
  | 'testing'
  | 'documentation'
  | 'security';

export const categoryMeta: Record<SkillCategory, { label: string; icon: string }> = {
  development: { label: 'Development', icon: '💻' },
  architecture: { label: 'Architecture', icon: '🏗️' },
  devops: { label: 'DevOps', icon: '🔧' },
  design: { label: 'Design', icon: '🎨' },
  data: { label: 'Data', icon: '📊' },
  testing: { label: 'Testing', icon: '🧪' },
  documentation: { label: 'Documentation', icon: '📝' },
  security: { label: 'Security', icon: '🔒' },
};

export const skills: Skill[] = [
`;

for (const skill of skills) {
  const desc = descriptions[skill.id] || 'A powerful Claude skill for enhancing your workflow.';
  const safeTitle = skill.title.replace(/'/g, "\\'");
  const mappedCategory = categoryMapping[skill.category] || 'development';
  const icon = categoryIcons[skill.category] || '📦';
  const difficulty = getDifficulty(skill.tags);
  
  const content = `# ${skill.title}

${desc}

## Installation

\`\`\`bash
claude skill add ${skill.id}
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

${skill.tags.map(t => `- ${t}`).join('\n')}`;

  output += `  {
    id: '${skill.id}',
    title: '${safeTitle}',
    description: ${JSON.stringify(desc)},
    category: '${mappedCategory}',
    icon: '${icon}',
    tags: ${JSON.stringify(skill.tags)},
    difficulty: '${difficulty}',
    content: \`${escapeForTemplate(content)}\`,
    installCommand: 'claude skill add ${skill.id}',${skill.heroImage ? `
    heroImage: '${skill.heroImage}',` : ''}
  },
`;
}

output += `];

export function getSkillById(id: string): Skill | undefined {
  return skills.find((s) => s.id === id);
}

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return skills.filter((s) => s.category === category);
}

export function searchSkills(query: string): Skill[] {
  const lower = query.toLowerCase();
  return skills.filter(
    (s) =>
      s.title.toLowerCase().includes(lower) ||
      s.description.toLowerCase().includes(lower) ||
      s.tags.some((t) => t.toLowerCase().includes(lower))
  );
}
`;

// Write output
const outputPath = path.join(__dirname, '../src/lib/skills.ts');
fs.writeFileSync(outputPath, output);
console.log(`✅ Written ${skills.length} skills to ${outputPath}`);

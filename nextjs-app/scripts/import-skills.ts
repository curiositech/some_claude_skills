#!/usr/bin/env npx tsx
/**
 * Import Skills from .claude/skills/ to Next.js App
 * 
 * This script reads actual SKILL.md files and their references,
 * then generates the skills.ts data file for the Next.js app.
 * 
 * Run: npm run import:skills
 */

import * as fs from 'fs';
import * as path from 'path';

// Paths
const SKILLS_SOURCE_DIR = path.resolve(__dirname, '../../.claude/skills');
const HERO_IMAGES_SOURCE = path.resolve(__dirname, '../../website/static/img/skills');
const HERO_IMAGES_DEST = path.resolve(__dirname, '../public/img/skills');
const OUTPUT_FILE = path.resolve(__dirname, '../src/lib/skills.ts');

// Types
interface SkillFrontmatter {
  name: string;
  description: string;
  'allowed-tools'?: string;
  category?: string;
  tags?: string[];
  'pairs-with'?: Array<{ skill: string; reason: string }>;
}

interface ReferenceFile {
  title: string;
  filename: string;
  content: string;
  type: 'guide' | 'example' | 'related-skill' | 'external';
}

interface ParsedSkill {
  id: string;
  frontmatter: SkillFrontmatter;
  content: string;
  references: ReferenceFile[];
  hasHeroImage: boolean;
}

// Category mapping
const CATEGORY_MAP: Record<string, string> = {
  'Code Quality & Testing': 'testing',
  'Development': 'development',
  'Architecture': 'architecture',
  'DevOps & Infrastructure': 'devops',
  'DevOps': 'devops',
  'Design & UX': 'design',
  'Design': 'design',
  'Data & Analytics': 'data',
  'Data': 'data',
  'Content & Writing': 'documentation',
  'Documentation': 'documentation',
  'Security': 'security',
  'Productivity & Meta': 'development',
  'Lifestyle & Wellness': 'documentation',
  'AI & Machine Learning': 'development',
  'Domain Expertise': 'documentation',
};

// Parse inline array like [a, b, c]
function parseInlineArray(value: string): string[] {
  if (!value.startsWith('[') || !value.endsWith(']')) {
    return [];
  }
  const inner = value.slice(1, -1);
  return inner.split(',').map(item => item.trim()).filter(Boolean);
}

// Parse YAML frontmatter
function parseFrontmatter(content: string): { frontmatter: SkillFrontmatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error('No frontmatter found');
  }

  const yamlContent = match[1];
  const body = match[2];

  // Simple YAML parser for our specific format
  const frontmatter: SkillFrontmatter = {
    name: '',
    description: '',
  };

  const lines = yamlContent.split('\n');
  let currentKey = '';
  let currentArray: string[] | Array<{ skill: string; reason: string }> = [];
  let inArray = false;
  let arrayType = '';

  for (const line of lines) {
    // Check for array items
    if (line.startsWith('  - ') && inArray) {
      if (arrayType === 'tags') {
        (currentArray as string[]).push(line.substring(4).trim());
      } else if (arrayType === 'pairs-with') {
        // Start a new pairing
        const skillMatch = line.match(/skill:\s*(.+)/);
        if (skillMatch) {
          (currentArray as Array<{ skill: string; reason: string }>).push({
            skill: skillMatch[1].trim(),
            reason: '',
          });
        }
      }
      continue;
    }

    // Check for reason in pairs-with
    if (line.startsWith('    reason:') && arrayType === 'pairs-with') {
      const pairings = currentArray as Array<{ skill: string; reason: string }>;
      if (pairings.length > 0) {
        pairings[pairings.length - 1].reason = line.replace('    reason:', '').trim();
      }
      continue;
    }

    // End current array if we hit a new key
    if (!line.startsWith('  ') && !line.startsWith('    ') && line.includes(':')) {
      if (inArray && currentKey) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (frontmatter as any)[currentKey] = currentArray;
        inArray = false;
        currentArray = [];
      }
    }

    // Parse key-value pairs
    const kvMatch = line.match(/^([a-z-]+):\s*(.*)$/i);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      currentKey = key;

      if (value === '' || value === undefined) {
        // This is an array start
        inArray = true;
        arrayType = key;
        currentArray = key === 'pairs-with' ? [] : [];
      } else if (value.startsWith('[') && value.endsWith(']')) {
        // Inline array like [a, b, c]
        const items = parseInlineArray(value);
        if (key === 'tags') {
          frontmatter.tags = items;
        } else if (key === 'pairs-with') {
          // Convert simple list to SkillPairing format
          frontmatter['pairs-with'] = items.map(skill => ({
            skill: skill.trim(),
            reason: 'Complementary skill',
          }));
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (frontmatter as any)[key] = items;
        }
      } else {
        // Simple value
        let cleanValue = value.trim();
        // Remove surrounding quotes
        if ((cleanValue.startsWith('"') && cleanValue.endsWith('"')) ||
            (cleanValue.startsWith("'") && cleanValue.endsWith("'"))) {
          cleanValue = cleanValue.slice(1, -1);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (frontmatter as any)[key] = cleanValue;
      }
    }
  }

  // Don't forget the last array
  if (inArray && currentKey) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (frontmatter as any)[currentKey] = currentArray;
  }

  return { frontmatter, body };
}

// Read reference files from a skill directory
function readReferences(skillDir: string): ReferenceFile[] {
  const refsDir = path.join(skillDir, 'references');
  const references: ReferenceFile[] = [];

  if (!fs.existsSync(refsDir)) {
    return references;
  }

  const files = fs.readdirSync(refsDir);
  for (const file of files) {
    const filePath = path.join(refsDir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile()) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const ext = path.extname(file);
      const title = path.basename(file, ext)
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Determine type based on extension and content
      let type: 'guide' | 'example' | 'related-skill' | 'external' = 'guide';
      if (ext === '.yaml' || ext === '.yml' || ext === '.json') {
        type = 'example';
      } else if (file.includes('example') || file.includes('sample')) {
        type = 'example';
      }

      references.push({
        title,
        filename: file,
        content,
        type,
      });
    }
  }

  return references;
}

// Get icon based on category, tags, and skill ID
function getIcon(category: string, tags: string[] | undefined, skillId?: string): string {
  const safeTags = Array.isArray(tags) ? tags : [];
  const tagSet = new Set(safeTags.map(t => t.toLowerCase()));
  const id = (skillId || '').toLowerCase();
  
  // Skill ID specific icons (most specific)
  const skillIdIcons: Record<string, string> = {
    'dag': '🔀',
    'workflow': '⚙️',
    'react': '⚛️',
    'typescript': '🔷',
    'python': '🐍',
    'rust': '🦀',
    'swift': '🐦',
    'docker': '🐳',
    'kubernetes': '☸️',
    'aws': '☁️',
    'cloudflare': '🔶',
    'github': '🐙',
    'git': '📦',
    'audio': '🔊',
    'music': '🎵',
    'video': '🎬',
    'visualization': '📈',
    'webgl': '🌐',
    'shader': '✨',
    'pixel': '🎮',
    'game': '🎮',
    'mobile': '📱',
    'ios': '📱',
    'android': '🤖',
    'email': '📧',
    'chat': '💬',
    'bot': '🤖',
    'discord': '💬',
    'slack': '💬',
    'calendar': '📅',
    'planner': '📋',
    'adhd': '🧠',
    'grief': '💝',
    'wellness': '❤️',
    'health': '❤️',
    'psychology': '🧠',
    'career': '💼',
    'resume': '📄',
    'cv': '📄',
    'job': '💼',
    'interview': '🎤',
    'wedding': '💒',
    'photo': '📸',
    'image': '🖼️',
    'drone': '🚁',
    'vr': '🥽',
    'avatar': '👤',
    '3d': '🎲',
    'diagram': '📊',
    'chart': '📈',
    'map': '🗺️',
    'geo': '🌍',
    'weather': '🌤️',
    'landscap': '🌳',
    'interior': '🏠',
    'color': '🎨',
    'dark-mode': '🌙',
    'accessibility': '♿',
    'form': '📝',
    'validation': '✅',
    'testing': '🧪',
    'debug': '🐛',
    'performance': '⚡',
    'security': '🔒',
    'auth': '🔐',
    'hipaa': '🏥',
    'legal': '⚖️',
    'compliance': '📋',
    'migration': '🔄',
    'database': '🗄️',
    'sql': '🗃️',
    'api': '🔌',
    'graphql': '🔗',
    'pdf': '📑',
    'document': '📄',
    'writer': '✍️',
    'critic': '🎭',
    'coach': '🏋️',
    'mentor': '🧑‍🏫',
    'strategist': '🎯',
    'analyst': '🔍',
    'architect': '🏗️',
    'engineer': '👷',
    'expert': '🎓',
    'master': '🏆',
    'creator': '✨',
    'builder': '🔨',
    'generator': '⚡',
    'automator': '🤖',
    'orchestrat': '🎼',
    'pipeline': '🔧',
    'windags': '🔀',
    'win31': '🖥️',
    'windows': '🪟',
    'retro': '📼',
    'vaporwave': '🌊',
    'memphis': '🎨',
  };
  
  // Check skill ID for matching patterns
  for (const [pattern, icon] of Object.entries(skillIdIcons)) {
    if (id.includes(pattern)) return icon;
  }
  
  // Tag-based icons
  if (tagSet.has('ai') || tagSet.has('llm') || tagSet.has('ml')) return '🤖';
  if (tagSet.has('api') || tagSet.has('graphql')) return '🔌';
  if (tagSet.has('security') || tagSet.has('auth')) return '🔒';
  if (tagSet.has('testing') || tagSet.has('test')) return '🧪';
  if (tagSet.has('design') || tagSet.has('ui') || tagSet.has('ux')) return '🎨';
  if (tagSet.has('data') || tagSet.has('analytics')) return '📊';
  if (tagSet.has('documentation') || tagSet.has('docs')) return '📝';
  if (tagSet.has('devops') || tagSet.has('ci') || tagSet.has('cd')) return '🔧';
  if (tagSet.has('database') || tagSet.has('sql')) return '🗃️';
  if (tagSet.has('video') || tagSet.has('media')) return '🎬';
  if (tagSet.has('drone') || tagSet.has('robotics')) return '🚁';
  if (tagSet.has('health') || tagSet.has('wellness')) return '❤️';
  if (tagSet.has('career') || tagSet.has('resume')) return '💼';
  if (tagSet.has('finance') || tagSet.has('money')) return '💰';
  if (tagSet.has('psychology') || tagSet.has('mental')) return '🧠';
  if (tagSet.has('bot') || tagSet.has('discord') || tagSet.has('telegram')) return '🤖';
  if (tagSet.has('audio') || tagSet.has('music') || tagSet.has('sound')) return '🔊';
  if (tagSet.has('webgl') || tagSet.has('shader') || tagSet.has('visualization')) return '✨';
  if (tagSet.has('react') || tagSet.has('frontend')) return '⚛️';
  if (tagSet.has('backend') || tagSet.has('server')) return '🖥️';
  if (tagSet.has('mobile') || tagSet.has('ios') || tagSet.has('android')) return '📱';
  if (tagSet.has('game') || tagSet.has('gaming')) return '🎮';

  // Category-based icons
  const categoryIcons: Record<string, string> = {
    development: '💻',
    architecture: '🏗️',
    devops: '🔧',
    design: '🎨',
    data: '📊',
    testing: '🧪',
    documentation: '📝',
    security: '🔒',
  };

  return categoryIcons[category] || '⚡';
}

// Get difficulty based on content analysis
function getDifficulty(content: string, tags: string[] | undefined): 'beginner' | 'intermediate' | 'advanced' {
  const safeTags = Array.isArray(tags) ? tags : [];
  const tagSet = new Set(safeTags.map(t => t.toLowerCase()));
  
  // Advanced indicators
  if (tagSet.has('advanced') || tagSet.has('expert')) return 'advanced';
  if (content.includes('expert') || content.includes('production-grade')) return 'advanced';
  if (content.length > 8000) return 'advanced';
  
  // Beginner indicators
  if (tagSet.has('beginner') || tagSet.has('starter')) return 'beginner';
  if (content.includes('getting started') || content.includes('introduction')) return 'beginner';
  if (content.length < 2000) return 'beginner';
  
  return 'intermediate';
}

// Parse a skill directory
function parseSkill(skillId: string): ParsedSkill | null {
  const skillDir = path.join(SKILLS_SOURCE_DIR, skillId);
  const skillFile = path.join(skillDir, 'SKILL.md');

  if (!fs.existsSync(skillFile)) {
    console.warn(`  ⚠️  No SKILL.md found for ${skillId}`);
    return null;
  }

  try {
    const content = fs.readFileSync(skillFile, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);
    const references = readReferences(skillDir);

    // Check for hero image
    const heroImagePng = path.join(HERO_IMAGES_SOURCE, `${skillId}-hero.png`);
    const heroImageWebp = path.join(HERO_IMAGES_SOURCE, `${skillId}-hero.webp`);
    const hasHeroImage = fs.existsSync(heroImagePng) || fs.existsSync(heroImageWebp);

    return {
      id: skillId,
      frontmatter,
      content: body.trim(),
      references,
      hasHeroImage,
    };
  } catch (error) {
    console.error(`  ❌ Error parsing ${skillId}:`, error);
    return null;
  }
}

// Copy hero images
function copyHeroImages(skills: ParsedSkill[]): void {
  console.log('\n📸 Copying hero images...');
  
  // Create destination directory
  if (!fs.existsSync(HERO_IMAGES_DEST)) {
    fs.mkdirSync(HERO_IMAGES_DEST, { recursive: true });
  }

  let copied = 0;
  for (const skill of skills) {
    const srcPng = path.join(HERO_IMAGES_SOURCE, `${skill.id}-hero.png`);
    const srcWebp = path.join(HERO_IMAGES_SOURCE, `${skill.id}-hero.webp`);
    const destPng = path.join(HERO_IMAGES_DEST, `${skill.id}-hero.png`);
    const destWebp = path.join(HERO_IMAGES_DEST, `${skill.id}-hero.webp`);

    if (fs.existsSync(srcPng) && !fs.existsSync(destPng)) {
      fs.copyFileSync(srcPng, destPng);
      copied++;
    }
    if (fs.existsSync(srcWebp) && !fs.existsSync(destWebp)) {
      fs.copyFileSync(srcWebp, destWebp);
      copied++;
    }
  }

  console.log(`  ✅ Copied ${copied} new images`);
}

// Escape string for template literal
function escapeForTemplate(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}

// Generate the skills.ts file
function generateSkillsFile(skills: ParsedSkill[]): void {
  console.log('\n📝 Generating skills.ts...');

  const skillEntries = skills.map(skill => {
    const category = CATEGORY_MAP[skill.frontmatter.category || ''] || 'development';
    const tags = Array.isArray(skill.frontmatter.tags) ? skill.frontmatter.tags : [];
    const icon = getIcon(category, tags, skill.id);
    const difficulty = getDifficulty(skill.content, tags);
    
    // Build title from name
    const title = skill.frontmatter.name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Build references array
    const references = skill.references.map(ref => ({
      title: ref.title,
      type: ref.type,
      url: `#ref-${ref.filename}`,
      description: `${ref.filename} - ${ref.content.split('\n')[0].substring(0, 100)}`,
    }));

    // Escape content for template literal
    const escapedContent = escapeForTemplate(skill.content);
    const escapedDescription = escapeForTemplate(skill.frontmatter.description);

    // Build the skill object as a string
    const refsJson = JSON.stringify(references, null, 2).split('\n').map((line, i) => i === 0 ? line : '    ' + line).join('\n');
    const tagsJson = JSON.stringify(tags);
    const pairsWithJson = skill.frontmatter['pairs-with'] 
      ? JSON.stringify(skill.frontmatter['pairs-with'], null, 2).split('\n').map((line, i) => i === 0 ? line : '    ' + line).join('\n')
      : 'undefined';

    // Check for WebP skill icon (preferred) or PNG fallback
    const skillIconWebpPath = path.join(__dirname, '../public/img/skill-icons-webp', `${skill.id}.webp`);
    const skillIconPngPath = path.join(__dirname, '../public/img/skill-icons', `${skill.id}.png`);
    const hasSkillIconWebp = fs.existsSync(skillIconWebpPath);
    const hasSkillIconPng = fs.existsSync(skillIconPngPath);
    const skillIcon = hasSkillIconWebp 
      ? `/img/skill-icons-webp/${skill.id}.webp` 
      : hasSkillIconPng 
        ? `/img/skill-icons/${skill.id}.png` 
        : undefined;

    // Check for WebP skill hero (preferred) or PNG fallback
    const skillHeroWebpPath = path.join(__dirname, '../public/img/skill-heroes-webp', `${skill.id}.webp`);
    const skillHeroPngPath = path.join(__dirname, '../public/img/skill-heroes', `${skill.id}.png`);
    const hasSkillHeroWebp = fs.existsSync(skillHeroWebpPath);
    const hasSkillHeroPng = fs.existsSync(skillHeroPngPath);
    const skillHero = hasSkillHeroWebp 
      ? `/img/skill-heroes-webp/${skill.id}.webp` 
      : hasSkillHeroPng 
        ? `/img/skill-heroes/${skill.id}.png` 
        : undefined;

    return `  {
    id: '${skill.id}',
    title: '${title.replace(/'/g, "\\'")}',
    description: \`${escapedDescription}\`,
    category: '${category}',
    icon: '${icon}',
    tags: ${tagsJson},
    difficulty: '${difficulty}',
    content: \`${escapedContent}\`,
    installCommand: '/plugin install ${skill.id}@some-claude-skills',
    references: ${refsJson},
    heroImage: ${skill.hasHeroImage ? `'/img/skills/${skill.id}-hero.png'` : 'undefined'},
    skillIcon: ${skillIcon ? `'${skillIcon}'` : 'undefined'},
    skillHero: ${skillHero ? `'${skillHero}'` : 'undefined'},
    pairsWith: ${pairsWithJson},
  }`;
  });

  const output = `/*
 * ═══════════════════════════════════════════════════════════════════════════
 * SKILL DATA - IMPORTED FROM .claude/skills/
 * Generated: ${new Date().toISOString()}
 * Total Skills: ${skills.length}
 * 
 * DO NOT EDIT - Run 'npm run import:skills' to regenerate
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface SkillReference {
  title: string;
  type: 'guide' | 'example' | 'related-skill' | 'external';
  url: string;
  description?: string;
}

export interface SkillPairing {
  skill: string;
  reason: string;
}

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
  skillIcon?: string;
  skillHero?: string;
  pairsWith?: SkillPairing[];
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
${skillEntries.join(',\n')}
];

// Helper functions
export function getSkillById(id: string): Skill | undefined {
  return skills.find(s => s.id === id);
}

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return skills.filter(s => s.category === category);
}

export function searchSkills(query: string): Skill[] {
  const q = query.toLowerCase();
  return skills.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.tags.some(t => t.toLowerCase().includes(q))
  );
}
`;

  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');
  console.log(`  ✅ Generated ${OUTPUT_FILE}`);
}

// Main
async function main() {
  console.log('🚀 Importing skills from .claude/skills/\n');

  // Get all skill directories
  const skillDirs = fs.readdirSync(SKILLS_SOURCE_DIR).filter(name => {
    const skillPath = path.join(SKILLS_SOURCE_DIR, name);
    return fs.statSync(skillPath).isDirectory();
  });

  console.log(`📂 Found ${skillDirs.length} skill directories\n`);

  // Parse all skills
  const skills: ParsedSkill[] = [];
  for (const skillId of skillDirs) {
    process.stdout.write(`  Parsing ${skillId}...`);
    const skill = parseSkill(skillId);
    if (skill) {
      skills.push(skill);
      console.log(' ✅');
    } else {
      console.log(' ⚠️ skipped');
    }
  }

  console.log(`\n✅ Successfully parsed ${skills.length} skills`);

  // Copy hero images
  copyHeroImages(skills);

  // Generate skills.ts
  generateSkillsFile(skills);

  console.log('\n🎉 Import complete!');
  console.log(`   Skills: ${skills.length}`);
  console.log(`   With hero images: ${skills.filter(s => s.hasHeroImage).length}`);
  console.log(`   With references: ${skills.filter(s => s.references.length > 0).length}`);
}

main().catch(console.error);

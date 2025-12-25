#!/usr/bin/env ts-node
/**
 * Skill-Specific OG Image Generator
 *
 * Generates social media preview images for individual skills, artifacts, and pages.
 * Creates a split layout: skill hero image (left) + vaporwave gradient with text (right).
 *
 * Usage:
 *   npx ts-node scripts/generateSkillOgImage.ts --skill wedding-immortalist
 *   npx ts-node scripts/generateSkillOgImage.ts --artifact recovery-communication-stack
 *   npx ts-node scripts/generateSkillOgImage.ts --all
 *
 * Requires:
 *   - ImageMagick installed (brew install imagemagick)
 *   - Press Start 2P font installed
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.resolve(PROJECT_ROOT, '../.claude/skills');
const HERO_IMAGES_DIR = path.resolve(PROJECT_ROOT, 'static/img/skills');
const OUTPUT_DIR = path.resolve(PROJECT_ROOT, 'static/img/og-skills');
const FONT_NAME = 'Press-Start-2P-Regular';

// Gradient presets by category
const GRADIENTS: Record<string, [string, string, string]> = {
  design: ['#ff6b9d', '#c44569', '#6b2d5c'],      // Pink to deep magenta
  recovery: ['#ffd700', '#ff8c00', '#9b4dca'],    // Gold sunrise to purple
  tech: ['#00d4ff', '#0099cc', '#1a1a2e'],        // Cyan to deep blue
  lifestyle: ['#50C878', '#228B22', '#1a1a2e'],   // Green gradient
  mystery: ['#9b59b6', '#6c3483', '#1a1a2e'],     // Purple mystery
  default: ['#ff6b9d', '#9b4dca', '#1a1a2e'],     // Default vaporwave
};

// Skill category mappings
const SKILL_CATEGORIES: Record<string, string> = {
  // Lifestyle skills
  'wedding-immortalist': 'design',
  'fancy-yard-landscaper': 'lifestyle',
  'maximalist-wall-decorator': 'design',
  'panic-room-finder': 'mystery',
  'interior-design-expert': 'design',
  // Recovery skills
  'modern-drug-rehab-computer': 'recovery',
  'sober-addict-protector': 'recovery',
  'grief-companion': 'recovery',
  'pet-memorial-creator': 'recovery',
  // Tech skills
  'skill-logger': 'tech',
  'digital-estate-planner': 'tech',
  // Personal skills
  'partner-text-coach': 'lifestyle',
  'adhd-daily-planner': 'lifestyle',
  // Design skills
  'vaporwave-glassomorphic-ui-designer': 'design',
  'collage-layout-expert': 'design',
  'photo-composition-critic': 'design',
  // AI/ML skills
  'drone-cv-expert': 'tech',
  'drone-inspection-specialist': 'tech',
  'clip-aware-embeddings': 'tech',
  // Meta skills
  'skill-coach': 'default',
  'agent-creator': 'default',
};

interface OgImageConfig {
  skillName: string;
  displayName: string;
  description: string;
  heroImagePath?: string;
  category?: string;
}

function kebabToTitle(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function truncateDescription(desc: string, maxLength: number = 50): string {
  if (desc.length <= maxLength) return desc;
  return desc.slice(0, maxLength - 3) + '...';
}

function getGradient(category: string): [string, string, string] {
  return GRADIENTS[category] || GRADIENTS.default;
}

function generateOgImage(config: OgImageConfig): string {
  const {
    skillName,
    displayName,
    description,
    heroImagePath,
    category = 'default'
  } = config;

  const outputPath = path.join(OUTPUT_DIR, `${skillName}-og.png`);
  const gradient = getGradient(category);
  const truncatedDesc = truncateDescription(description);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Check if hero image exists
  const heroPath = heroImagePath || path.join(HERO_IMAGES_DIR, `${skillName}-hero.png`);
  const hasHeroImage = fs.existsSync(heroPath);

  // Build ImageMagick command
  let command: string;

  if (hasHeroImage) {
    // With hero image: split layout
    command = `
      magick -size 1200x630 xc:none \\
        \\( "${heroPath}" -resize 600x630^ -gravity center -extent 600x630 \\) \\
        -gravity west -composite \\
        \\( -size 600x630 \\
           xc:'${gradient[0]}' \\
           -colorize 0 \\
           \\( -size 600x630 gradient:'${gradient[1]}'-'${gradient[2]}' \\) \\
           -compose over -composite \\
        \\) \\
        -gravity east -composite \\
        -gravity east \\
        -fill white \\
        -font "${FONT_NAME}" \\
        -pointsize 18 \\
        -annotate +30+250 "${displayName}" \\
        -fill '#B0B0C0' \\
        -pointsize 10 \\
        -annotate +30+285 "${truncatedDesc}" \\
        \\( -size 1200x50 xc:'rgba(20,20,40,0.92)' \\) \\
        -gravity south -composite \\
        -fill white \\
        -pointsize 12 \\
        -gravity south \\
        -annotate +0+18 "SOME CLAUDE SKILLS  •  someclaudeskills.com" \\
        "${outputPath}"
    `.replace(/\n\s*/g, ' ');
  } else {
    // Without hero image: full gradient with centered text
    command = `
      magick -size 1200x630 \\
        gradient:'${gradient[0]}'-'${gradient[2]}' \\
        -rotate 45 \\
        -gravity center -extent 1200x630 \\
        -fill white \\
        -font "${FONT_NAME}" \\
        -pointsize 28 \\
        -gravity center \\
        -annotate +0-30 "${displayName}" \\
        -fill '#B0B0C0' \\
        -pointsize 12 \\
        -annotate +0+30 "${truncatedDesc}" \\
        \\( -size 1200x50 xc:'rgba(20,20,40,0.92)' \\) \\
        -gravity south -composite \\
        -fill white \\
        -pointsize 12 \\
        -gravity south \\
        -annotate +0+18 "SOME CLAUDE SKILLS  •  someclaudeskills.com" \\
        "${outputPath}"
    `.replace(/\n\s*/g, ' ');
  }

  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ Generated: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`❌ Failed to generate OG image for ${skillName}:`, error);
    throw error;
  }
}

function getSkillDescription(skillDir: string): string {
  const skillMdPath = path.join(skillDir, 'SKILL.md');

  if (!fs.existsSync(skillMdPath)) {
    return 'AI-powered skill for Claude Code';
  }

  const content = fs.readFileSync(skillMdPath, 'utf-8');

  // Extract description from frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const descMatch = frontmatterMatch[1].match(/description:\s*["']?([^"'\n]+)/);
    if (descMatch) {
      // Get first sentence or first 100 chars
      const desc = descMatch[1];
      const firstSentence = desc.split('.')[0];
      return firstSentence.slice(0, 80);
    }
  }

  return 'AI-powered skill for Claude Code';
}

function generateAllSkillOgImages(): void {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error(`Skills directory not found: ${SKILLS_DIR}`);
    return;
  }

  const skills = fs.readdirSync(SKILLS_DIR).filter(name => {
    const stat = fs.statSync(path.join(SKILLS_DIR, name));
    return stat.isDirectory() && !name.startsWith('.');
  });

  console.log(`Found ${skills.length} skills. Generating OG images...`);

  for (const skillName of skills) {
    const skillDir = path.join(SKILLS_DIR, skillName);
    const description = getSkillDescription(skillDir);
    const category = SKILL_CATEGORIES[skillName] || 'default';

    try {
      generateOgImage({
        skillName,
        displayName: kebabToTitle(skillName),
        description,
        category,
      });
    } catch (error) {
      console.error(`Skipping ${skillName} due to error`);
    }
  }

  console.log('Done!');
}

// CLI handling
const args = process.argv.slice(2);

if (args.includes('--all')) {
  generateAllSkillOgImages();
} else if (args.includes('--skill')) {
  const skillIndex = args.indexOf('--skill');
  const skillName = args[skillIndex + 1];

  if (!skillName) {
    console.error('Please provide a skill name: --skill <skill-name>');
    process.exit(1);
  }

  const skillDir = path.join(SKILLS_DIR, skillName);
  const description = getSkillDescription(skillDir);
  const category = SKILL_CATEGORIES[skillName] || 'default';

  generateOgImage({
    skillName,
    displayName: kebabToTitle(skillName),
    description,
    category,
  });
} else {
  console.log(`
Skill OG Image Generator

Usage:
  npx ts-node scripts/generateSkillOgImage.ts --skill <skill-name>
  npx ts-node scripts/generateSkillOgImage.ts --all

Options:
  --skill <name>  Generate OG image for specific skill
  --all           Generate OG images for all skills

Examples:
  npx ts-node scripts/generateSkillOgImage.ts --skill wedding-immortalist
  npx ts-node scripts/generateSkillOgImage.ts --all
  `);
}

export { generateOgImage, generateAllSkillOgImages, OgImageConfig };

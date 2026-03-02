#!/usr/bin/env node
/**
 * Validate Hero Images
 * Ensures every skill has a corresponding hero image.
 *
 * Hero images should be at: website/static/img/skills/{skill-name}-hero.{png|jpg|webp}
 */

const fs = require('fs');
const path = require('path');

const SKILLS_DIR = path.join(__dirname, '../../.claude/skills');
const HEROES_DIR = path.join(__dirname, '../static/img/skills');

function getSkillNames() {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.error('Skills directory not found:', SKILLS_DIR);
    process.exit(1);
  }

  return fs.readdirSync(SKILLS_DIR)
    .filter(name => {
      const skillPath = path.join(SKILLS_DIR, name);
      if (!fs.statSync(skillPath).isDirectory() || name.startsWith('.')) return false;
      const skillMd = path.join(skillPath, 'SKILL.md');
      if (!fs.existsSync(skillMd)) return false;

      // Skip private and deprecated skills
      const content = fs.readFileSync(skillMd, 'utf-8');
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
      if (fmMatch) {
        const fm = fmMatch[1];
        if (/private:\s*true/i.test(fm) || /deprecated:\s*true/i.test(fm)) return false;
      }
      return true;
    });
}

function getHeroImages() {
  if (!fs.existsSync(HEROES_DIR)) {
    return new Set();
  }

  const heroFiles = fs.readdirSync(HEROES_DIR)
    .filter(name => name.includes('-hero'));

  // Extract skill names from hero image filenames
  // Handles: skill-name-hero.png, skill-name-hero_timestamp.png
  const skillsWithHeroes = new Set();

  for (const file of heroFiles) {
    // Match pattern: {skill-name}-hero.{ext} or {skill-name}-hero_{timestamp}.{ext}
    const match = file.match(/^(.+)-hero(?:_[^.]+)?\.(png|jpg|jpeg|webp|svg)$/i);
    if (match) {
      skillsWithHeroes.add(match[1]);
    }
  }

  return skillsWithHeroes;
}

function main() {
  console.log('🖼️  Validating hero images...');

  const skills = getSkillNames();
  const skillsWithHeroes = getHeroImages();

  const missing = skills.filter(skill => !skillsWithHeroes.has(skill));

  if (missing.length > 0) {
    console.error('\n❌ Skills missing hero images:');
    missing.forEach(skill => {
      console.error(`   - ${skill}`);
      console.error(`     Expected: website/static/img/skills/${skill}-hero.png`);
    });
    console.error(`\n💡 Generate hero images using Ideogram or Stability AI MCP tools.`);
    console.error(`   Style: Pixel art retro 8-bit, 1:1 aspect ratio`);
    console.error(`\n📊 Hero Image Report:`);
    console.error(`   Skills: ${skills.length}`);
    console.error(`   With heroes: ${skills.length - missing.length}`);
    console.error(`   Missing: ${missing.length}`);
    process.exit(1);
  }

  console.log(`✅ All ${skills.length} skills have hero images`);
  process.exit(0);
}

main();

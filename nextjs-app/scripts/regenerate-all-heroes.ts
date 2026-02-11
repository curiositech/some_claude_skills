/**
 * Regenerate ALL hero images using Ideogram V3
 * 
 * This script:
 * 1. Backs up existing hero images
 * 2. Generates new ones with the improved style guide prompts
 * 3. Tracks progress so it can be resumed if interrupted
 * 
 * Usage: npx tsx scripts/regenerate-all-heroes.ts
 * 
 * To regenerate specific skills: SKILL_IDS="skill1,skill2" npx tsx scripts/regenerate-all-heroes.ts
 */

import fs from 'fs';
import path from 'path';

const IDEOGRAM_API_KEY = process.env.IDEOGRAM_API_KEY || 'HpTCWkjQKGy3N-N75SwPUWw_FgdTv_4JuEuyChHJBSjwpira632amU124iHLitHGEIwGIahu0FXLr3ZNsOYvlA';

interface Skill {
  id: string;
  title: string;
  description: string;
}

// Color palette families from style guide
const COLOR_PALETTES = {
  'mint-teal': 'mint and teal professional color scheme (#5B9A8B, #8EC5B5, #F5E6D3)',
  'synthwave': 'synthwave sunset color scheme (#FF6B9D, #C44569, neon pink, cyan, and purple)',
  'terracotta': 'warm terracotta color scheme (#C67B5C, #E8A87C, warm oranges and browns)',
  'lavender': 'lavender workspace color scheme (#9B8AA5, #C4B6CF, soft purples and pinks)',
  'terminal': 'terminal green color scheme (#00FF00, #003300, CRT green on black)',
  'rainbow': 'rainbow spectrum bright color scheme (varied bright colors on white)',
};

// Determine the best color palette and composition for a skill
function getStyleForSkill(skill: Skill): { palette: string; composition: string } {
  const title = skill.title.toLowerCase();
  const desc = skill.description.toLowerCase();
  
  // Terminal/technical skills
  if (title.includes('terminal') || title.includes('code') || title.includes('cli') || 
      title.includes('devops') || title.includes('engineer') || desc.includes('command line') ||
      title.includes('api') || title.includes('docker') || title.includes('linux')) {
    return { palette: 'terminal', composition: 'terminal flowchart with connected nodes and code text' };
  }
  
  // VR/AR/Creative tech
  if (title.includes('vr') || title.includes('avatar') || title.includes('3d') ||
      title.includes('vaporwave') || title.includes('glitch') || title.includes('visualization') ||
      title.includes('game') || title.includes('metaverse')) {
    return { palette: 'synthwave', composition: 'synthwave landscape with floating UI element, perspective grid floor, and geometric shapes' };
  }
  
  // Wellness/Health/Psychology
  if (title.includes('wellness') || title.includes('health') || title.includes('therapy') ||
      title.includes('coach') || title.includes('meditation') || title.includes('psych') ||
      desc.includes('mental health') || desc.includes('emotional') || title.includes('adhd')) {
    return { palette: 'lavender', composition: 'calming isometric workspace with soft lighting and indoor plants' };
  }
  
  // Career/Interview/HR
  if (title.includes('career') || title.includes('interview') || title.includes('hr') ||
      title.includes('resume') || title.includes('job') || title.includes('recruiter')) {
    return { palette: 'terracotta', composition: 'interview scene with two pixel art figures at a desk with screen showing data' };
  }
  
  // Design/Creative
  if (title.includes('design') || title.includes('ux') || title.includes('ui') ||
      title.includes('creative') || title.includes('art') || title.includes('color') ||
      title.includes('brand') || title.includes('logo')) {
    return { palette: 'rainbow', composition: 'desktop workstation with monitor showing colorful design interface and art supplies' };
  }
  
  // Default: professional mint/teal
  return { palette: 'mint-teal', composition: 'desktop workstation with monitor showing relevant interface, keyboard in foreground, desk plant and coffee mug' };
}

// Generate hero prompt following style guide
function generateHeroPrompt(skill: Skill): string {
  const { palette, composition } = getStyleForSkill(skill);
  const paletteDesc = COLOR_PALETTES[palette as keyof typeof COLOR_PALETTES];
  
  // Short description for context
  const shortDesc = skill.description.substring(0, 150).replace(/\n/g, ' ');
  
  return `Pixel art ${composition} showing ${skill.title} AI tool (${shortDesc}),
${paletteDesc},
retro Windows 3.1 interface elements with title bar and beveled 3D borders,
16-bit video game aesthetic with visible pixels and no anti-aliasing,
clean pixel art style with dithered shading,
professional atmosphere with subtle environmental details,
NO photorealism, NO modern flat UI, NO text except stylized pixel gibberish`;
}

// Extract skills from skills.ts using regex
function getSkillsFromSource(): Skill[] {
  const skillsPath = path.join(__dirname, '../src/lib/skills.ts');
  const content = fs.readFileSync(skillsPath, 'utf-8');
  
  const skills: Skill[] = [];
  
  // Match each skill object with id, title, description
  const idRegex = /id:\s*'([^']+)'/g;
  const titleRegex = /title:\s*'([^']+)'/g;
  const descRegex = /description:\s*`([^`]+)`/gs;
  
  const ids = [...content.matchAll(idRegex)].map(m => m[1]);
  const titles = [...content.matchAll(titleRegex)].map(m => m[1]);
  const descriptions = [...content.matchAll(descRegex)].map(m => m[1].replace(/\n/g, ' ').substring(0, 300));
  
  console.log(`  Parsed ${ids.length} IDs, ${titles.length} titles, ${descriptions.length} descriptions`);
  
  for (let i = 0; i < Math.min(ids.length, titles.length, descriptions.length); i++) {
    skills.push({
      id: ids[i],
      title: titles[i],
      description: descriptions[i],
    });
  }
  
  return skills;
}

async function generateImage(prompt: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.ideogram.ai/v1/ideogram-v3/generate', {
      method: 'POST',
      headers: {
        'Api-Key': IDEOGRAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio: '16x9',
        rendering_speed: 'DEFAULT',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API error:', error);
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.url || null;
  } catch (error) {
    console.error('Request failed:', error);
    return null;
  }
}

async function downloadImage(url: string, filepath: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) return false;
    
    const buffer = await response.arrayBuffer();
    const dir = path.dirname(filepath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, Buffer.from(buffer));
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   HERO IMAGE REGENERATION - Ideogram V3                     ║');
  console.log('║   Following style guide: pixel art, Win3.1 aesthetic        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const skills = getSkillsFromSource();
  console.log(`Found ${skills.length} skills\n`);

  // Check if we should only generate specific skills
  const specificSkills = process.env.SKILL_IDS?.split(',').filter(Boolean) || [];
  const skillsToGenerate = specificSkills.length > 0 
    ? skills.filter(s => specificSkills.includes(s.id))
    : skills;

  if (specificSkills.length > 0) {
    console.log(`Generating only: ${skillsToGenerate.map(s => s.id).join(', ')}\n`);
  }

  const heroDir = path.join(__dirname, '../public/img/skill-heroes');
  const backupDir = path.join(__dirname, '../public/img/skill-heroes-backup');

  // Create backup of existing heroes
  if (fs.existsSync(heroDir) && !fs.existsSync(backupDir)) {
    console.log('Backing up existing heroes...');
    fs.renameSync(heroDir, backupDir);
  }

  if (!fs.existsSync(heroDir)) {
    fs.mkdirSync(heroDir, { recursive: true });
  }

  // Track progress
  const progressFile = path.join(__dirname, '../hero-generation-progress.json');
  let progress: { completed: string[]; failed: string[] } = { completed: [], failed: [] };
  
  if (fs.existsSync(progressFile)) {
    progress = JSON.parse(fs.readFileSync(progressFile, 'utf-8'));
    console.log(`Resuming: ${progress.completed.length} completed, ${progress.failed.length} failed\n`);
  }

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const skill of skillsToGenerate) {
    // Skip if already completed
    if (progress.completed.includes(skill.id)) {
      skipped++;
      continue;
    }

    const heroPath = path.join(heroDir, `${skill.id}.png`);
    
    console.log(`\n[${generated + skipped + failed + 1}/${skillsToGenerate.length}] ${skill.title}`);
    
    const prompt = generateHeroPrompt(skill);
    console.log('  Prompt:', prompt.substring(0, 100) + '...');
    
    const imageUrl = await generateImage(prompt);
    
    if (imageUrl) {
      const success = await downloadImage(imageUrl, heroPath);
      if (success) {
        generated++;
        progress.completed.push(skill.id);
        console.log(`  ✅ Saved: ${skill.id}.png`);
      } else {
        failed++;
        progress.failed.push(skill.id);
        console.log(`  ❌ Download failed: ${skill.id}`);
      }
    } else {
      failed++;
      progress.failed.push(skill.id);
      console.log(`  ❌ Generation failed: ${skill.id}`);
    }

    // Save progress after each image
    fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
    
    // Rate limiting - wait between requests
    await sleep(2000);
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log(`✅ Generated: ${generated}`);
  console.log(`⏭️  Skipped: ${skipped} (already completed)`);
  console.log(`❌ Failed: ${failed}`);
  console.log('════════════════════════════════════════════════════════════\n');

  if (failed > 0) {
    console.log('Failed skills:', progress.failed.join(', '));
    console.log('\nTo retry failed skills, delete them from hero-generation-progress.json');
  }
}

main().catch(console.error);

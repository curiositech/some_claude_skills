/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SKILL ART GENERATOR - Icons + Hero Splash Images
 * 
 * Generates for each skill:
 * 1. 32x32 icon (transparent bg, no border, Win3.1 style)
 * 2. Wide hero splash (16:9, detailed, vaporwave/Memphis style)
 * ═══════════════════════════════════════════════════════════════════════════
 */

import * as fs from 'fs';
import * as path from 'path';

const IDEOGRAM_API_KEY = process.env.IDEOGRAM_API_KEY;
const IDEOGRAM_API_URL = 'https://api.ideogram.ai/generate';

// Rate limiting
const BATCH_SIZE = 3;
const BATCH_DELAY_MS = 5000;
const MAX_RETRIES = 3;

// Output directories
const ICONS_DIR = path.join(__dirname, '../public/img/skill-icons');
const HEROES_DIR = path.join(__dirname, '../public/img/skill-heroes');

interface SkillInfo {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
}

// Extract skill info from skills.ts
function loadSkills(): SkillInfo[] {
  const skillsPath = path.join(__dirname, '../src/lib/skills.ts');
  const content = fs.readFileSync(skillsPath, 'utf-8');
  
  const skills: SkillInfo[] = [];
  
  // Match skill objects
  const skillRegex = /{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*description:\s*`([^`]+)`[\s\S]*?category:\s*'([^']+)'[\s\S]*?tags:\s*\[([^\]]*)\]/g;
  
  let match;
  while ((match = skillRegex.exec(content)) !== null) {
    const tags = match[5]
      .split(',')
      .map(t => t.trim().replace(/['"]/g, ''))
      .filter(t => t.length > 0);
    
    skills.push({
      id: match[1],
      title: match[2],
      description: match[3].substring(0, 300), // Truncate for prompt
      category: match[4],
      tags,
    });
  }
  
  return skills;
}

/**
 * Generate icon prompt - 32x32, transparent, no border
 */
function generateIconPrompt(skill: SkillInfo): string {
  // Determine visual concept based on skill
  let concept = 'abstract geometric shape';
  
  const conceptMap: Record<string, string> = {
    'audio': 'speaker with sound waves',
    'music': 'musical note',
    'video': 'film camera',
    'react': 'atom symbol',
    'typescript': 'TS letters in a box',
    'python': 'coiled snake',
    'database': 'cylinder database',
    'api': 'plug and socket',
    'design': 'paintbrush and palette',
    'test': 'checkmark in shield',
    'security': 'padlock',
    'cloud': 'cloud with arrow',
    'mobile': 'smartphone',
    'ai': 'brain with circuits',
    'bot': 'robot head',
    'email': 'envelope',
    'calendar': 'calendar page',
    'chart': 'bar chart',
    'document': 'paper document',
    'code': 'angle brackets with slash',
    'drone': 'quadcopter drone',
    'vr': 'VR headset',
    'game': 'game controller',
    'photo': 'camera',
    'shader': 'glowing cube',
    'workflow': 'flowchart boxes',
    'debug': 'magnifying glass over bug',
  };
  
  for (const [keyword, visual] of Object.entries(conceptMap)) {
    if (skill.id.includes(keyword) || skill.tags.some(t => t.toLowerCase().includes(keyword))) {
      concept = visual;
      break;
    }
  }
  
  return `32x32 pixel art icon of ${concept}, Windows 3.1 desktop icon style, transparent background, NO border around the icon, clean edges, VGA 16-color palette, centered composition, crisp pixels`;
}

/**
 * Generate hero splash prompt - wide, detailed, vaporwave/Memphis
 */
function generateHeroPrompt(skill: SkillInfo): string {
  // Shorten description for prompt
  const shortDesc = skill.description
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .substring(0, 200);
  
  return `Cover splash art for an artificial intelligence software package for the skill "${skill.title}" which ${shortDesc}.

Theme: Windows 3.1/MS-DOS 16-bit VGA palette pixel art (90s tech-utopian, colorful, vaguely vaporwave cyberspace, a little Memphis Group meets Lisa Frank at the mall and they get lost in the arcade before buying stonewashed jeans). Wide cinematic composition, detailed scene, nostalgic retro-future aesthetic.`;
}

/**
 * Call Ideogram API
 */
async function generateImage(
  prompt: string, 
  aspectRatio: 'ASPECT_1_1' | 'ASPECT_16_9',
  outputPath: string
): Promise<boolean> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(IDEOGRAM_API_URL, {
        method: 'POST',
        headers: {
          'Api-Key': IDEOGRAM_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_request: {
            prompt,
            model: 'V_2',
            magic_prompt_option: 'AUTO',
            aspect_ratio: aspectRatio,
            style_type: aspectRatio === 'ASPECT_1_1' ? 'DESIGN' : 'GENERAL',
          },
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`    API error (${response.status}): ${errorText}`);
        if (response.status === 429) {
          console.log('    Rate limited, waiting 15s...');
          await sleep(15000);
          continue;
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data?.[0]?.url) {
        const imageUrl = data.data[0].url;
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        fs.writeFileSync(outputPath, imageBuffer);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`    Attempt ${attempt + 1} failed:`, (error as Error).message);
      if (attempt < MAX_RETRIES - 1) {
        await sleep(3000 * (attempt + 1));
      }
    }
  }
  
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getExistingFiles(dir: string): Set<string> {
  const existing = new Set<string>();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return existing;
  }
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.webp')) {
      const id = file.replace(/\.(png|webp)$/, '');
      existing.add(id);
    }
  }
  return existing;
}

async function main() {
  if (!IDEOGRAM_API_KEY) {
    console.error('❌ IDEOGRAM_API_KEY environment variable not set');
    process.exit(1);
  }
  
  console.log('🎨 Skill Art Generator - Icons + Hero Splashes\n');
  
  const skills = loadSkills();
  console.log(`📦 Loaded ${skills.length} skills\n`);
  
  const existingIcons = getExistingFiles(ICONS_DIR);
  const existingHeroes = getExistingFiles(HEROES_DIR);
  
  console.log(`📂 Existing icons: ${existingIcons.size}`);
  console.log(`📂 Existing heroes: ${existingHeroes.size}\n`);
  
  // Filter to skills needing work
  const needIcons = skills.filter(s => !existingIcons.has(s.id));
  const needHeroes = skills.filter(s => !existingHeroes.has(s.id));
  
  console.log(`🔄 Need ${needIcons.length} icons, ${needHeroes.length} heroes\n`);
  
  let iconSuccess = 0, iconFail = 0;
  let heroSuccess = 0, heroFail = 0;
  
  // Generate icons first (faster, smaller)
  if (needIcons.length > 0) {
    console.log('═══════════════════════════════════════');
    console.log('GENERATING ICONS (32x32)');
    console.log('═══════════════════════════════════════\n');
    
    for (let i = 0; i < needIcons.length; i += BATCH_SIZE) {
      const batch = needIcons.slice(i, i + BATCH_SIZE);
      console.log(`📦 Icon Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(needIcons.length / BATCH_SIZE)}`);
      
      for (const skill of batch) {
        console.log(`  ${skill.id}...`);
        const prompt = generateIconPrompt(skill);
        const outputPath = path.join(ICONS_DIR, `${skill.id}.png`);
        
        const success = await generateImage(prompt, 'ASPECT_1_1', outputPath);
        if (success) {
          console.log(`    ✅ Icon generated`);
          iconSuccess++;
        } else {
          console.log(`    ❌ Icon failed`);
          iconFail++;
        }
      }
      
      if (i + BATCH_SIZE < needIcons.length) {
        console.log(`  ⏳ Waiting ${BATCH_DELAY_MS / 1000}s...`);
        await sleep(BATCH_DELAY_MS);
      }
    }
  }
  
  // Generate hero splashes
  if (needHeroes.length > 0) {
    console.log('\n═══════════════════════════════════════');
    console.log('GENERATING HERO SPLASHES (16:9)');
    console.log('═══════════════════════════════════════\n');
    
    for (let i = 0; i < needHeroes.length; i += BATCH_SIZE) {
      const batch = needHeroes.slice(i, i + BATCH_SIZE);
      console.log(`📦 Hero Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(needHeroes.length / BATCH_SIZE)}`);
      
      for (const skill of batch) {
        console.log(`  ${skill.id}...`);
        const prompt = generateHeroPrompt(skill);
        const outputPath = path.join(HEROES_DIR, `${skill.id}.png`);
        
        const success = await generateImage(prompt, 'ASPECT_16_9', outputPath);
        if (success) {
          console.log(`    ✅ Hero generated`);
          heroSuccess++;
        } else {
          console.log(`    ❌ Hero failed`);
          heroFail++;
        }
      }
      
      if (i + BATCH_SIZE < needHeroes.length) {
        console.log(`  ⏳ Waiting ${BATCH_DELAY_MS / 1000}s...`);
        await sleep(BATCH_DELAY_MS);
      }
    }
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('COMPLETE');
  console.log('═══════════════════════════════════════');
  console.log(`Icons:  ✅ ${iconSuccess} generated, ❌ ${iconFail} failed`);
  console.log(`Heroes: ✅ ${heroSuccess} generated, ❌ ${heroFail} failed`);
  console.log(`Total icons: ${existingIcons.size + iconSuccess}`);
  console.log(`Total heroes: ${existingHeroes.size + heroSuccess}`);
}

main().catch(console.error);

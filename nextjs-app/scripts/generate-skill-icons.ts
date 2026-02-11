/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SKILL ICON GENERATOR - Memphis × Windows 3.1 Style
 * Uses Ideogram API to generate 32x32 pixel art icons for each skill
 * ═══════════════════════════════════════════════════════════════════════════
 */

import * as fs from 'fs';
import * as path from 'path';

// Ideogram API configuration
const IDEOGRAM_API_KEY = process.env.IDEOGRAM_API_KEY || 'sk_db1b9ccb4f705eb2a9d0e3a5051b1a5de93d2f500192afc1';
const IDEOGRAM_API_URL = 'https://api.ideogram.ai/generate';

// Rate limiting
const BATCH_SIZE = 5; // Icons per batch
const BATCH_DELAY_MS = 3000; // Delay between batches
const MAX_RETRIES = 3;

// Output directory
const OUTPUT_DIR = path.join(__dirname, '../public/img/skill-icons');

// Memphis color palette for prompts
const MEMPHIS_COLORS = [
  'hot pink (#FF6B9D)',
  'cyan (#00D4FF)',
  'yellow (#FFE156)',
  'coral (#FF7F6B)',
  'mint green (#7DFFC2)',
  'purple (#6B5CE7)',
];

interface Skill {
  id: string;
  title: string;
  category: string;
  tags: string[];
  icon?: string;
}

// Category to icon concept mapping
const CATEGORY_CONCEPTS: Record<string, string[]> = {
  development: ['code brackets', 'terminal', 'computer chip', 'gear', 'lightning bolt'],
  architecture: ['building blocks', 'blueprint', 'scaffolding', 'layers', 'structure'],
  devops: ['pipeline', 'container', 'cloud', 'rocket', 'wrench'],
  design: ['paintbrush', 'palette', 'shapes', 'sparkles', 'eye'],
  data: ['chart', 'database cylinder', 'graph nodes', 'spreadsheet', 'magnifying glass'],
  testing: ['checkmark', 'bug', 'flask', 'target', 'shield'],
  documentation: ['book', 'scroll', 'pencil', 'notepad', 'clipboard'],
  security: ['lock', 'key', 'shield', 'fingerprint', 'vault'],
};

// Tag-based icon hints
const TAG_CONCEPTS: Record<string, string> = {
  ai: 'brain or neural network',
  ml: 'neural network nodes',
  react: 'atom symbol',
  python: 'snake',
  typescript: 'TS letters',
  javascript: 'JS letters',
  rust: 'gear with R',
  swift: 'swift bird',
  docker: 'whale or container',
  kubernetes: 'helm wheel',
  aws: 'cloud with smile',
  api: 'plug connection',
  database: 'cylinder stack',
  frontend: 'browser window',
  backend: 'server rack',
  mobile: 'smartphone',
  audio: 'speaker or waveform',
  video: 'film reel or camera',
  image: 'picture frame',
  '3d': 'cube',
  vr: 'VR headset',
  game: 'game controller',
  chat: 'speech bubble',
  email: 'envelope',
  calendar: 'calendar page',
  automation: 'robot arm',
  workflow: 'flowchart',
  analytics: 'pie chart',
  testing: 'checkmark shield',
  security: 'padlock',
  performance: 'speedometer',
  accessibility: 'universal access symbol',
  design: 'paintbrush',
  ux: 'user with heart',
  ui: 'layout grid',
};

/**
 * Generate a prompt for a skill icon
 */
function generatePrompt(skill: Skill): string {
  // Determine the main visual concept
  let concept = 'abstract geometric shape';
  
  // Check tags first for specific concepts
  for (const tag of skill.tags) {
    const tagLower = tag.toLowerCase();
    if (TAG_CONCEPTS[tagLower]) {
      concept = TAG_CONCEPTS[tagLower];
      break;
    }
  }
  
  // Fall back to category concepts
  if (concept === 'abstract geometric shape') {
    const categoryConcepts = CATEGORY_CONCEPTS[skill.category] || CATEGORY_CONCEPTS.development;
    concept = categoryConcepts[Math.floor(Math.random() * categoryConcepts.length)];
  }
  
  // Pick a random Memphis color for variety
  const color = MEMPHIS_COLORS[Math.floor(Math.random() * MEMPHIS_COLORS.length)];
  
  // Build the prompt
  return `A 32x32 pixel art icon of a ${concept}, Memphis Group design style from the 1980s, bold ${color} primary color with black outlines, transparent background, Windows 3.1 desktop icon aesthetic, clean simple shapes, high contrast, no text, centered composition, retro computing vibe`;
}

/**
 * Call Ideogram API to generate an icon
 */
async function generateIcon(skill: Skill): Promise<Buffer | null> {
  const prompt = generatePrompt(skill);
  
  console.log(`  Generating icon for ${skill.id}...`);
  console.log(`    Prompt: ${prompt.substring(0, 80)}...`);
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(IDEOGRAM_API_URL, {
        method: 'POST',
        headers: {
          'Api-Key': IDEOGRAM_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_request: {
            prompt,
            model: 'V_2',
            magic_prompt_option: 'AUTO',
            aspect_ratio: 'ASPECT_1_1',
            style_type: 'DESIGN',
          },
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`    API error (${response.status}): ${errorText}`);
        if (response.status === 429) {
          // Rate limited - wait longer
          console.log(`    Rate limited, waiting 10s...`);
          await sleep(10000);
          continue;
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data && data.data[0] && data.data[0].url) {
        // Download the image
        const imageUrl = data.data[0].url;
        const imageResponse = await fetch(imageUrl);
        const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        console.log(`    ✅ Generated successfully`);
        return imageBuffer;
      } else {
        console.error(`    Unexpected response structure:`, JSON.stringify(data).substring(0, 200));
        return null;
      }
    } catch (error) {
      console.error(`    Attempt ${attempt + 1} failed:`, error);
      if (attempt < MAX_RETRIES - 1) {
        await sleep(2000 * (attempt + 1));
      }
    }
  }
  
  return null;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Load skills from the generated skills.ts file
 */
function loadSkills(): Skill[] {
  const skillsPath = path.join(__dirname, '../src/lib/skills.ts');
  const content = fs.readFileSync(skillsPath, 'utf-8');
  
  // Extract skill objects using regex (simple approach)
  const skills: Skill[] = [];
  const skillRegex = /{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',[\s\S]*?category:\s*'([^']+)',[\s\S]*?tags:\s*\[([^\]]*)\]/g;
  
  let match;
  while ((match = skillRegex.exec(content)) !== null) {
    const tags = match[4]
      .split(',')
      .map(t => t.trim().replace(/['"]/g, ''))
      .filter(t => t.length > 0);
    
    skills.push({
      id: match[1],
      title: match[2],
      category: match[3],
      tags,
    });
  }
  
  return skills;
}

/**
 * Check which icons already exist
 */
function getExistingIcons(): Set<string> {
  const existing = new Set<string>();
  
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    return existing;
  }
  
  const files = fs.readdirSync(OUTPUT_DIR);
  for (const file of files) {
    if (file.endsWith('.png') || file.endsWith('.webp')) {
      const skillId = file.replace(/\.(png|webp)$/, '');
      existing.add(skillId);
    }
  }
  
  return existing;
}

/**
 * Main generation function
 */
async function main() {
  console.log('🎨 Memphis Win31 Skill Icon Generator\n');
  
  // Load skills
  const skills = loadSkills();
  console.log(`📦 Loaded ${skills.length} skills\n`);
  
  // Check existing icons
  const existing = getExistingIcons();
  console.log(`📂 Found ${existing.size} existing icons\n`);
  
  // Filter to skills needing icons
  const needIcons = skills.filter(s => !existing.has(s.id));
  console.log(`🔄 Need to generate ${needIcons.length} icons\n`);
  
  if (needIcons.length === 0) {
    console.log('✅ All icons already exist!');
    return;
  }
  
  // Process in batches
  let generated = 0;
  let failed = 0;
  
  for (let i = 0; i < needIcons.length; i += BATCH_SIZE) {
    const batch = needIcons.slice(i, i + BATCH_SIZE);
    console.log(`\n📦 Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(needIcons.length / BATCH_SIZE)}`);
    
    for (const skill of batch) {
      const iconBuffer = await generateIcon(skill);
      
      if (iconBuffer) {
        const outputPath = path.join(OUTPUT_DIR, `${skill.id}.png`);
        fs.writeFileSync(outputPath, iconBuffer);
        generated++;
      } else {
        failed++;
        console.log(`    ❌ Failed to generate icon for ${skill.id}`);
      }
    }
    
    // Delay between batches
    if (i + BATCH_SIZE < needIcons.length) {
      console.log(`  ⏳ Waiting ${BATCH_DELAY_MS / 1000}s before next batch...`);
      await sleep(BATCH_DELAY_MS);
    }
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log(`✅ Generated: ${generated} icons`);
  console.log(`❌ Failed: ${failed} icons`);
  console.log('═══════════════════════════════════════\n');
}

// Run if called directly
main().catch(console.error);

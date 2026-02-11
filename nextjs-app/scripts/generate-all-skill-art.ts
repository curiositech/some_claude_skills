/**
 * Generate all skill icons and hero images using Ideogram API
 * 
 * Usage: npx ts-node scripts/generate-all-skill-art.ts
 * 
 * Icons: 32x32 pixel art, transparent background, VGA palette
 * Heroes: 16:9 wide cinematic splash art (COLORFUL, BRIGHT, 90s UTOPIAN)
 */

import fs from 'fs';
import path from 'path';

const IDEOGRAM_API_KEY = process.env.IDEOGRAM_API_KEY || 'HpTCWkjQKGy3N-N75SwPUWw_FgdTv_4JuEuyChHJBSjwpira632amU124iHLitHGEIwGIahu0FXLr3ZNsOYvlA';

interface Skill {
  id: string;
  title: string;
  description: string;
  icon: string;
}

// Extract skills from skills.ts
function getSkillsFromSource(): Skill[] {
  const skillsPath = path.join(__dirname, '../src/lib/skills.ts');
  const content = fs.readFileSync(skillsPath, 'utf-8');
  
  const skills: Skill[] = [];
  const idRegex = /id:\s*'([^']+)'/g;
  const titleRegex = /title:\s*'([^']+)'/g;
  const descRegex = /description:\s*`([^`]+)`/g;
  const iconRegex = /icon:\s*'([^']+)'/g;
  
  const ids = [...content.matchAll(idRegex)].map(m => m[1]);
  const titles = [...content.matchAll(titleRegex)].map(m => m[1]);
  const descriptions = [...content.matchAll(descRegex)].map(m => m[1]);
  const icons = [...content.matchAll(iconRegex)].map(m => m[1]);
  
  for (let i = 0; i < ids.length; i++) {
    if (ids[i] && titles[i] && descriptions[i]) {
      skills.push({
        id: ids[i],
        title: titles[i],
        description: descriptions[i].substring(0, 150),
        icon: icons[i] || '📦'
      });
    }
  }
  
  return skills;
}

/**
 * Generate prompt for 32x32 skill icon
 * Transparent background, pixel art, Win3.1 style
 */
function generateIconPrompt(skill: Skill): string {
  // Extract key concept from title
  const concept = skill.title.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  
  return `32x32 pixel art icon for "${concept}" software tool, Windows 3.1 style, VGA 16-color palette, transparent background, crisp pixels, no border, no text, clean simple recognizable symbol, isometric perspective where appropriate, ${skill.icon} style, professional application icon`;
}

/**
 * Color palette families from style guide
 */
const COLOR_PALETTES = {
  'mint-teal': 'mint and teal professional color scheme (#5B9A8B, #8EC5B5)',
  'synthwave': 'synthwave sunset color scheme (#FF6B9D, #C44569, neon pink and purple)',
  'terracotta': 'warm terracotta color scheme (#C67B5C, #E8A87C, warm oranges and browns)',
  'lavender': 'lavender workspace color scheme (#9B8AA5, #C4B6CF, soft purples and pinks)',
  'terminal': 'terminal green color scheme (#00FF00, #003300, CRT green on black)',
  'rainbow': 'rainbow spectrum color scheme (varied bright colors)',
};

/**
 * Determine the best color palette and composition for a skill
 */
function getStyleForSkill(skill: Skill): { palette: string; composition: string } {
  const title = skill.title.toLowerCase();
  const desc = skill.description.toLowerCase();
  
  // Terminal/technical skills
  if (title.includes('terminal') || title.includes('code') || title.includes('cli') || 
      title.includes('devops') || title.includes('engineer') || desc.includes('command line')) {
    return { palette: 'terminal', composition: 'terminal flowchart' };
  }
  
  // VR/AR/Creative tech
  if (title.includes('vr') || title.includes('avatar') || title.includes('3d') ||
      title.includes('vaporwave') || title.includes('glitch') || title.includes('visualization')) {
    return { palette: 'synthwave', composition: 'synthwave landscape with floating UI element and perspective grid floor' };
  }
  
  // Wellness/Health/Psychology
  if (title.includes('wellness') || title.includes('health') || title.includes('therapy') ||
      title.includes('coach') || title.includes('meditation') || title.includes('psych') ||
      desc.includes('mental health') || desc.includes('emotional')) {
    return { palette: 'lavender', composition: 'calming isometric workspace with soft lighting' };
  }
  
  // Career/Interview/HR
  if (title.includes('career') || title.includes('interview') || title.includes('hr') ||
      title.includes('resume') || title.includes('job')) {
    return { palette: 'terracotta', composition: 'interview scene with two figures at a desk and screen showing data' };
  }
  
  // Design/Creative
  if (title.includes('design') || title.includes('ux') || title.includes('ui') ||
      title.includes('creative') || title.includes('art') || title.includes('color')) {
    return { palette: 'rainbow', composition: 'desktop workstation with monitor showing design interface' };
  }
  
  // Default: professional mint/teal
  return { palette: 'mint-teal', composition: 'desktop workstation with monitor showing relevant interface, keyboard in foreground, desk plant and coffee mug' };
}

/**
 * Generate prompt for hero splash image following style guide
 * Retro-Professional Pixel Art style per /docs/guides/hero-image-style-guide.md
 */
function generateHeroPrompt(skill: Skill): string {
  const { palette, composition } = getStyleForSkill(skill);
  const paletteDesc = COLOR_PALETTES[palette as keyof typeof COLOR_PALETTES];
  
  // Short description for context
  const shortDesc = skill.description.substring(0, 150).replace(/\n/g, ' ');
  
  return `Pixel art ${composition} showing ${skill.title} AI tool (${shortDesc}),
${paletteDesc},
retro Windows 3.1 interface elements with title bar, beveled 3D borders, and scrollbars,
16-bit video game aesthetic with visible pixels and no anti-aliasing,
clean pixel art style, dithered shading,
stylized "gibberish" pixel text on screen,
professional atmosphere with subtle environmental details,
no photorealism, no modern flat UI
--ar 16:9`;
}

async function generateImage(prompt: string, aspectRatio: string = '1:1'): Promise<string | null> {
  try {
    const response = await fetch('https://api.ideogram.ai/generate', {
      method: 'POST',
      headers: {
        'Api-Key': IDEOGRAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_request: {
          prompt,
          aspect_ratio: aspectRatio,
          model: 'V_3', // Use Ideogram V3 as requested
          magic_prompt_option: 'AUTO',
          style_type: 'DESIGN', // Best for pixel art style
        },
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
  const skills = getSkillsFromSource();
  console.log(`Found ${skills.length} skills`);
  
  const iconDir = path.join(__dirname, '../public/img/skill-icons');
  const heroDir = path.join(__dirname, '../public/img/skill-heroes');
  
  if (!fs.existsSync(iconDir)) fs.mkdirSync(iconDir, { recursive: true });
  if (!fs.existsSync(heroDir)) fs.mkdirSync(heroDir, { recursive: true });
  
  let iconCount = 0;
  let heroCount = 0;
  
  for (const skill of skills) {
    // Generate icon
    const iconPath = path.join(iconDir, `${skill.id}.png`);
    if (!fs.existsSync(iconPath)) {
      console.log(`\n[Icon] Generating: ${skill.title}`);
      const iconPrompt = generateIconPrompt(skill);
      const iconUrl = await generateImage(iconPrompt, '1:1');
      
      if (iconUrl) {
        await downloadImage(iconUrl, iconPath);
        iconCount++;
        console.log(`  ✅ Saved icon: ${skill.id}.png`);
      } else {
        console.log(`  ❌ Failed: ${skill.id}`);
      }
      
      await sleep(1500); // Rate limiting
    }
    
    // Generate hero
    const heroPath = path.join(heroDir, `${skill.id}.png`);
    if (!fs.existsSync(heroPath)) {
      console.log(`\n[Hero] Generating: ${skill.title}`);
      const heroPrompt = generateHeroPrompt(skill);
      const heroUrl = await generateImage(heroPrompt, '16:9');
      
      if (heroUrl) {
        await downloadImage(heroUrl, heroPath);
        heroCount++;
        console.log(`  ✅ Saved hero: ${skill.id}.png`);
      } else {
        console.log(`  ❌ Failed: ${skill.id}`);
      }
      
      await sleep(1500); // Rate limiting
    }
  }
  
  console.log(`\n════════════════════════════════════════`);
  console.log(`Generated ${iconCount} new icons`);
  console.log(`Generated ${heroCount} new heroes`);
  console.log(`════════════════════════════════════════`);
}

main().catch(console.error);

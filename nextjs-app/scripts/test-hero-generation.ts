/**
 * Test script to generate a single hero image and verify the style guide
 */

const IDEOGRAM_API_KEY = process.env.IDEOGRAM_API_KEY || 'HpTCWkjQKGy3N-N75SwPUWw_FgdTv_4JuEuyChHJBSjwpira632amU124iHLitHGEIwGIahu0FXLr3ZNsOYvlA';

const COLOR_PALETTES = {
  'mint-teal': 'mint and teal professional color scheme (#5B9A8B, #8EC5B5)',
  'synthwave': 'synthwave sunset color scheme (#FF6B9D, #C44569, neon pink and purple)',
  'terminal': 'terminal green color scheme (#00FF00, #003300, CRT green on black)',
};

async function generateTestHero() {
  const testSkill = {
    title: 'ADHD Design Expert',
    description: 'A specialized design system creator for ADHD developers, focusing on attention-preserving interfaces',
  };

  const prompt = `Pixel art desktop workstation scene showing ${testSkill.title} AI tool (${testSkill.description}),
${COLOR_PALETTES['mint-teal']},
retro Windows 3.1 interface elements with title bar, beveled 3D borders, and scrollbars,
16-bit video game aesthetic with visible pixels and no anti-aliasing,
clean pixel art style, dithered shading,
stylized "gibberish" pixel text on screen,
professional atmosphere with subtle environmental details like plants and coffee mug,
no photorealism, no modern flat UI
--ar 16:9`;

  console.log('Testing Ideogram API with prompt:');
  console.log('---');
  console.log(prompt);
  console.log('---\n');

  try {
    // Use V3 endpoint
    const response = await fetch('https://api.ideogram.ai/v1/ideogram-v3/generate', {
      method: 'POST',
      headers: {
        'Api-Key': IDEOGRAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio: '16x9', // V3 format
        rendering_speed: 'DEFAULT',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('API error:', response.status, error);
      return null;
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.data?.[0]?.url) {
      console.log('\nSuccess! Image URL:', data.data[0].url);
      return data.data[0].url;
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
  return null;
}

generateTestHero();

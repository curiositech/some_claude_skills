const fs = require('fs');
const path = require('path');

const skillsDir = path.join(__dirname, '../docs/skills');
const files = fs.readdirSync(skillsDir).filter(f => f.endsWith('.md'));

files.forEach(file => {
  const filePath = path.join(skillsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has SkillHeader
  if (content.includes('<SkillHeader')) {
    console.log(`Skipping ${file} - already has SkillHeader`);
    return;
  }

  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    console.log(`Skipping ${file} - no frontmatter found`);
    return;
  }

  const frontmatter = frontmatterMatch[1];
  const nameMatch = frontmatter.match(/(?:name|title):\s*(.+)/);
  const descMatch = frontmatter.match(/description:\s*(.+)/);

  if (!nameMatch) {
    console.log(`Skipping ${file} - missing name/title`);
    return;
  }

  const skillName = nameMatch[1].trim();

  // Use description if available, otherwise use a default
  let description = descMatch ? descMatch[1].trim() : `Expert skill for ${skillName}`;

  // If description is too short, use filename as fallback
  if (description.length < 20) {
    description = `Expert skill specializing in ${skillName.replace(/-/g, ' ')}`;
  }

  // Convert filename to title case
  const titleName = file
    .replace('.md', '')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Find the first heading
  const lines = content.split('\n');
  let headerIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('# ')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    console.log(`Skipping ${file} - no heading found`);
    return;
  }

  // Insert SkillHeader after the heading
  const skillHeader = `
<SkillHeader
  skillName="${titleName}"
  fileName="${skillName}"
  description="${description.substring(0, 150)}${description.length > 150 ? '...' : ''}"
/>
`;

  lines.splice(headerIndex + 1, 0, skillHeader);

  const newContent = lines.join('\n');
  fs.writeFileSync(filePath, newContent, 'utf8');

  console.log(`✓ Added SkillHeader to ${file}`);
});

console.log('\nDone!');

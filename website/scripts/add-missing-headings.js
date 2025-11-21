const fs = require('fs');
const path = require('path');

const skillsDir = path.join(__dirname, '../docs/skills');
const files = fs.readdirSync(skillsDir).filter(f => f.endsWith('.md'));

files.forEach(file => {
  const filePath = path.join(skillsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    console.log(`Skipping ${file} - no frontmatter`);
    return;
  }

  const frontmatter = frontmatterMatch[1];
  const titleMatch = frontmatter.match(/(?:name|title):\s*(.+)/);

  if (!titleMatch) {
    console.log(`Skipping ${file} - no name/title in frontmatter`);
    return;
  }

  const title = titleMatch[1].trim();

  // Convert title to readable format
  const readableTitle = title
    .replace(/-/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Check if there's already a heading after frontmatter
  const afterFrontmatter = content.substring(frontmatterMatch[0].length);
  if (afterFrontmatter.trim().startsWith('# ')) {
    console.log(`Skipping ${file} - already has heading`);
    return;
  }

  // Add heading after frontmatter
  const newContent = frontmatterMatch[0] + '\n\n# ' + readableTitle + '\n' + afterFrontmatter.trimStart();
  fs.writeFileSync(filePath, newContent, 'utf8');

  console.log(`✓ Added heading to ${file}: ${readableTitle}`);
});

console.log('\nDone adding headings!');

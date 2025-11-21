const fs = require('fs');
const path = require('path');

const skillsDir = path.join(__dirname, '../docs/skills');
const files = fs.readdirSync(skillsDir).filter(f => f.endsWith('.md'));

files.forEach(file => {
  const filePath = path.join(skillsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Find SkillHeader components and fix quotes
  const skillHeaderRegex = /<SkillHeader\s+([\s\S]*?)\/>/g;

  content = content.replace(skillHeaderRegex, (match) => {
    // Replace straight double quotes in attribute values with HTML entities
    return match.replace(/description="([^"]*(?:"[^"]*)*?)"/g, (m, desc) => {
      // Replace inner quotes with &quot;
      const escapedDesc = desc.replace(/"/g, '&quot;');
      return `description="${escapedDesc}"`;
    });
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed ${file}`);
});

console.log('\nDone fixing quotes!');

#!/usr/bin/env node
const fs = require('fs');

function validateSkillHeader(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];

  // Remove code blocks before searching for SkillHeader
  // This prevents false positives from code examples
  const contentWithoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '');

  // Find SkillHeader component usage (outside of code blocks)
  const headerMatch = contentWithoutCodeBlocks.match(/<SkillHeader[\s\S]*?\/>/);
  if (!headerMatch) return errors;

  const headerText = headerMatch[0];

  // Skip if this looks like a regex pattern (contains regex metacharacters)
  // or doesn't look like actual JSX (no prop assignments)
  // This prevents false positives from documentation showing regex patterns
  if (headerText.includes('[\\s\\S]') || headerText.includes('\\s\\S') || !headerText.includes('="')) {
    return errors;  // Not a real SkillHeader component
  }
  const lines = content.split('\n');

  // Find the actual line number (search in original content but only outside code blocks)
  let inCodeBlock = false;
  let lineNum = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (!inCodeBlock && lines[i].includes('<SkillHeader')) {
      lineNum = i + 1;
      break;
    }
  }

  // Check for correct prop: fileName (not skillId)
  if (headerText.includes('skillId=')) {
    errors.push({
      line: lineNum,
      issue: 'Uses "skillId" prop instead of "fileName"',
      fix: 'Change skillId="..." to fileName="..."'
    });
  }

  // Check for removed props (difficulty, category)
  // Note: tags is now a valid prop for displaying skill tags
  const deprecatedProps = ['difficulty', 'category'];
  deprecatedProps.forEach(prop => {
    if (headerText.includes(`${prop}=`)) {
      errors.push({
        line: lineNum,
        issue: `Uses deprecated "${prop}" prop`,
        fix: `Remove ${prop} prop (only use: skillName, fileName, description, tags)`
      });
    }
  });

  // Check for required props
  if (!headerText.includes('skillName=')) {
    errors.push({
      line: lineNum,
      issue: 'Missing required "skillName" prop'
    });
  }

  if (!headerText.includes('fileName=')) {
    errors.push({
      line: lineNum,
      issue: 'Missing required "fileName" prop'
    });
  }

  return errors;
}

const files = process.argv.slice(2);
let totalErrors = 0;

if (files.length === 0) {
  console.error('Usage: validate-skill-props.js <file1.md> [file2.md...]');
  process.exit(1);
}

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    return;
  }

  const errors = validateSkillHeader(file);
  if (errors.length > 0) {
    console.error(`❌ ${file}:`);
    errors.forEach(err => {
      console.error(`   Line ${err.line}: ${err.issue}`);
      if (err.fix) console.error(`   Fix: ${err.fix}`);
    });
    totalErrors += errors.length;
  }
});

if (totalErrors > 0) {
  console.error(`\n❌ Found ${totalErrors} SkillHeader prop error(s)`);
  process.exit(1);
} else {
  console.log('✅ SkillHeader props validated successfully');
  process.exit(0);
}

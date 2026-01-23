#!/usr/bin/env node
const fs = require('fs');

function validateBrackets(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const errors = [];

  let inCodeBlock = false;

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return;
    }
    if (inCodeBlock) return;

    // Check for unescaped < followed by digit or > followed by digit
    const lessThanMatch = line.match(/<(\d+)/);
    const greaterThanMatch = line.match(/>(\d+)/);

    if (lessThanMatch && !line.includes('&lt;')) {
      errors.push({
        line: idx + 1,
        text: lessThanMatch[0],
        fix: lessThanMatch[0].replace('<', '&lt;')
      });
    }

    if (greaterThanMatch && !line.includes('&gt;')) {
      errors.push({
        line: idx + 1,
        text: greaterThanMatch[0],
        fix: greaterThanMatch[0].replace('>', '&gt;')
      });
    }
  });

  return errors;
}

const files = process.argv.slice(2);
let totalErrors = 0;

if (files.length === 0) {
  console.error('Usage: validate-brackets.js <file1.md> [file2.md...]');
  process.exit(1);
}

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    return;
  }

  const errors = validateBrackets(file);
  if (errors.length > 0) {
    console.error(`❌ ${file}:`);
    errors.forEach(err => {
      console.error(`   Line ${err.line}: "${err.text}" → "${err.fix}"`);
    });
    totalErrors += errors.length;
  }
});

if (totalErrors > 0) {
  console.error(`\n❌ Found ${totalErrors} unescaped angle bracket(s)`);
  console.error(`\nReplace < with &lt; and > with &gt; in markdown text`);
  process.exit(1);
} else {
  console.log('✅ No unescaped angle brackets found');
  process.exit(0);
}

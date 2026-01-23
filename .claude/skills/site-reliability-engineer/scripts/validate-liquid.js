#!/usr/bin/env node
const fs = require('fs');
const glob = require('glob');

// Detect unescaped Liquid template syntax in MDX files
function validateLiquid(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const errors = [];

  let inCodeBlock = false;
  let inFrontmatter = false;

  lines.forEach((line, idx) => {
    // Track code blocks
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      return;
    }

    // Track frontmatter
    if (line.trim() === '---') {
      inFrontmatter = !inFrontmatter;
      return;
    }

    // Skip if in code block or frontmatter
    if (inCodeBlock || inFrontmatter) return;

    // Check for unescaped Liquid syntax
    const liquidMatch = line.match(/\{\{[^`].*?\}\}/);
    if (liquidMatch && !line.includes('{`{{')) {
      errors.push({
        line: idx + 1,
        column: line.indexOf(liquidMatch[0]) + 1,
        text: liquidMatch[0],
        suggestion: `{\\`${liquidMatch[0]}\\`}`
      });
    }
  });

  return errors;
}

// Process files
const files = process.argv.slice(2);
let totalErrors = 0;

if (files.length === 0) {
  console.error('Usage: validate-liquid.js <file1.md> [file2.md...]');
  process.exit(1);
}

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    return;
  }

  const errors = validateLiquid(file);
  if (errors.length > 0) {
    console.error(`❌ ${file}:`);
    errors.forEach(err => {
      console.error(`   Line ${err.line}:${err.column}: ${err.text}`);
      console.error(`   Fix: ${err.suggestion}`);
    });
    totalErrors += errors.length;
  }
});

if (totalErrors > 0) {
  console.error(`\n❌ Found ${totalErrors} Liquid syntax error(s)`);
  console.error(`\nTo fix automatically, wrap {{ ... }} in MDX expression: {\\`{{ ... }}\\`}`);
  process.exit(1);
} else {
  console.log('✅ No Liquid syntax errors found');
  process.exit(0);
}

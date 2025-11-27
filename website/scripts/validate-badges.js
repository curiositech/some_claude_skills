#!/usr/bin/env node
/**
 * Badge Validation Script
 * Validates skill badges in skills.ts for the pre-commit hook
 *
 * Checks:
 * - Only valid badge values ('NEW' | 'UPDATED')
 * - Reports badge counts for awareness
 * - Can be extended to check badge age (requires badge-metadata.json)
 */

const fs = require('fs');
const path = require('path');

const VALID_BADGES = ['NEW', 'UPDATED'];

function validateBadges(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];
  const warnings = [];
  const stats = { NEW: 0, UPDATED: 0 };

  // Find all badge assignments in the skills array
  // Match patterns like: badge: 'NEW' or badge: "UPDATED"
  const badgePattern = /badge:\s*['"]([^'"]+)['"]/g;
  let match;
  let lineNum = 0;
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const localMatch = line.match(/badge:\s*['"]([^'"]+)['"]/);
    if (localMatch) {
      const badgeValue = localMatch[1];
      if (!VALID_BADGES.includes(badgeValue)) {
        errors.push({
          line: idx + 1,
          issue: `Invalid badge value: "${badgeValue}"`,
          fix: `Use one of: ${VALID_BADGES.join(', ')}`
        });
      } else {
        stats[badgeValue]++;
      }
    }
  });

  // Also check for badge values that might be typos or invalid
  const invalidBadgePattern = /badge:\s*['"]([^'"]+)['"]/g;
  while ((match = invalidBadgePattern.exec(content)) !== null) {
    const value = match[1];
    if (!VALID_BADGES.includes(value)) {
      const position = content.substring(0, match.index).split('\n').length;
      if (!errors.find(e => e.line === position)) {
        errors.push({
          line: position,
          issue: `Invalid badge: "${value}"`,
          fix: `Valid badges: ${VALID_BADGES.join(', ')}`
        });
      }
    }
  }

  return { errors, warnings, stats };
}

// Main execution
const skillsPath = path.join(__dirname, '../src/data/skills.ts');

if (!fs.existsSync(skillsPath)) {
  console.error('❌ skills.ts not found');
  process.exit(1);
}

const { errors, warnings, stats } = validateBadges(skillsPath);

// Report stats
console.log(`📊 Badge Report:`);
console.log(`   NEW badges: ${stats.NEW}`);
console.log(`   UPDATED badges: ${stats.UPDATED}`);

// Report warnings
if (warnings.length > 0) {
  console.log('\n⚠️ Warnings:');
  warnings.forEach(w => console.log(`   ${w}`));
}

// Report errors and exit
if (errors.length > 0) {
  console.error('\n❌ Badge Validation Errors:');
  errors.forEach(err => {
    console.error(`   Line ${err.line}: ${err.issue}`);
    if (err.fix) console.error(`   Fix: ${err.fix}`);
  });
  console.error(`\n❌ Found ${errors.length} badge error(s)`);
  process.exit(1);
}

console.log('✅ Badge validation passed');
process.exit(0);

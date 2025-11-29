# Validation Logic Reference

Context-aware detection patterns used by validation scripts.

## Core Principle: Context-Aware Detection

Simple regex fails because it doesn't understand MDX context. Always:
1. Track code block state (```` markers)
2. Track frontmatter state (`---` markers)
3. Only validate outside protected regions

## Liquid Syntax Detection

**Problem**: Double-brace template syntax in Vue/Handlebars examples gets interpreted as Liquid.

**Context-Aware Logic**:
```javascript
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

    // Skip if in protected region
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
```

**Fix Pattern**: Wrap in MDX expression syntax using backtick expressions

## Angle Bracket Detection

**Problem**: `&lt;70` parsed as incomplete HTML tag, breaks MDX.

**Context-Aware Logic**:
```javascript
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

    // Check for unescaped < followed by digit
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
```

**Fix Pattern**: Replace `<` with `&lt;` and `>` with `&gt;`

## SkillHeader Prop Validation

**Problem**: Wrong prop names cause SSG build failure.

**Validation Logic**:
```javascript
function validateSkillHeader(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];

  // Find SkillHeader component
  const headerMatch = content.match(/<SkillHeader[\s\S]*?\/>/);
  if (!headerMatch) return errors;

  const headerText = headerMatch[0];
  const lines = content.split('\n');
  const lineNum = lines.findIndex(l => l.includes('<SkillHeader')) + 1;

  // Check for wrong prop name
  if (headerText.includes('skillId=')) {
    errors.push({
      line: lineNum,
      issue: 'Uses "skillId" instead of "fileName"',
      fix: 'Change skillId to fileName'
    });
  }

  // Check for deprecated props
  ['difficulty', 'category', 'tags'].forEach(prop => {
    if (headerText.includes(`${prop}=`)) {
      errors.push({
        line: lineNum,
        issue: `Uses deprecated "${prop}" prop`,
        fix: 'Remove - only use: skillName, fileName, description'
      });
    }
  });

  // Check for required props
  if (!headerText.includes('skillName=')) {
    errors.push({ line: lineNum, issue: 'Missing required "skillName"' });
  }
  if (!headerText.includes('fileName=')) {
    errors.push({ line: lineNum, issue: 'Missing required "fileName"' });
  }

  return errors;
}
```

## Current SkillHeader Interface

```typescript
interface SkillHeaderProps {
  skillName: string;    // Required: Display name
  fileName: string;     // Required: matches skill folder (underscores)
  description: string;  // Required: from SKILL.md frontmatter
}
```

**Deprecated props** (remove if found): `difficulty`, `category`, `tags`

import fs from 'fs';
import path from 'path';

interface SkillReference {
  skillName: string;
  referencedSkill: string;
  context: string;
  lineNumber: number;
}

interface FileReference {
  skillName: string;
  filePath: string;
  lineNumber: number;
  exists: boolean;
}

interface AnalysisResult {
  timestamp: string;
  summary: {
    totalSkills: number;
    brokenSkillReferences: number;
    brokenFileReferences: number;
  };
  brokenSkillReferences: SkillReference[];
  brokenFileReferences: FileReference[];
  allReferences: {
    skills: SkillReference[];
    files: FileReference[];
  };
}

function findAllSkills(skillsDir: string): string[] {
  const skills: string[] = [];

  if (!fs.existsSync(skillsDir)) {
    return skills;
  }

  const entries = fs.readdirSync(skillsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      skills.push(entry.name);
    }
  }

  return skills;
}

function getSkillMdPath(skillName: string, skillsDir: string): string {
  return path.join(skillsDir, skillName, 'SKILL.md');
}

function readSkillContent(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return '';
  }
  return fs.readFileSync(filePath, 'utf-8');
}

function extractSkillReferences(content: string, skillName: string, allSkills: Set<string>): SkillReference[] {
  const references: SkillReference[] = [];
  const lines = content.split('\n');

  // Look for "Use with:" sections
  const useWithPattern = /Use with:\s*(.+?)(?:\n|$)/i;

  lines.forEach((line, lineNum) => {
    const match = line.match(useWithPattern);
    if (match) {
      const referenceLine = match[1];

      // Extract skill names from patterns like "skill-name (description)"
      const skillPattern = /([a-z\-]+)\s*\(/g;
      let skillMatch;

      while ((skillMatch = skillPattern.exec(referenceLine)) !== null) {
        const referencedSkill = skillMatch[1];

        // Check if the referenced skill exists
        if (!allSkills.has(referencedSkill)) {
          references.push({
            skillName,
            referencedSkill,
            context: line.trim(),
            lineNumber: lineNum + 1
          });
        }
      }
    }
  });

  return references;
}

function extractFileReferences(content: string, skillName: string, skillDir: string): FileReference[] {
  const references: FileReference[] = [];
  const lines = content.split('\n');

  // Look for file paths in reference formats
  // Patterns: `references/file.md`, `scripts/file.sh`, `assets/file.png`, etc.
  const filePattern = /`([a-z\-]+\/[^\`]+)`|\/([a-z\-]+\/[^\s)]+)/g;

  lines.forEach((line, lineNum) => {
    let match;
    filePattern.lastIndex = 0;

    while ((match = filePattern.exec(line)) !== null) {
      const filePath = match[1] || match[2];

      if (filePath && (filePath.startsWith('references/') || filePath.startsWith('scripts/') || filePath.startsWith('assets/'))) {
        const fullPath = path.join(skillDir, filePath);
        const exists = fs.existsSync(fullPath);

        references.push({
          skillName,
          filePath,
          lineNumber: lineNum + 1,
          exists
        });
      }
    }
  });

  return references;
}

function analyzeCrossReferences(skillsDir: string): AnalysisResult {
  const allSkills = findAllSkills(skillsDir);
  const skillsSet = new Set(allSkills);

  const brokenSkillRefs: SkillReference[] = [];
  const brokenFileRefs: FileReference[] = [];
  const allSkillRefs: SkillReference[] = [];
  const allFileRefs: FileReference[] = [];

  for (const skillName of allSkills) {
    const skillMdPath = getSkillMdPath(skillName, skillsDir);
    const skillDir = path.dirname(skillMdPath);
    const content = readSkillContent(skillMdPath);

    if (!content) {
      console.warn(`Warning: Could not read ${skillMdPath}`);
      continue;
    }

    // Analyze skill references
    const skillRefs = extractSkillReferences(content, skillName, skillsSet);
    allSkillRefs.push(...skillRefs);
    brokenSkillRefs.push(...skillRefs.filter(ref => !skillsSet.has(ref.referencedSkill)));

    // Analyze file references
    const fileRefs = extractFileReferences(content, skillName, skillDir);
    allFileRefs.push(...fileRefs);
    brokenFileRefs.push(...fileRefs.filter(ref => !ref.exists));
  }

  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalSkills: allSkills.length,
      brokenSkillReferences: brokenSkillRefs.length,
      brokenFileReferences: brokenFileRefs.length
    },
    brokenSkillReferences: brokenSkillRefs,
    brokenFileReferences: brokenFileRefs,
    allReferences: {
      skills: allSkillRefs,
      files: allFileRefs
    }
  };
}

function main() {
  const skillsDir = path.resolve(
    process.env.SKILLS_DIR ||
    '/Users/erichowens/coding/some_claude_skills/.claude/skills'
  );

  console.log(`\nAnalyzing skill cross-references in: ${skillsDir}\n`);

  if (!fs.existsSync(skillsDir)) {
    console.error(`Error: Skills directory not found at ${skillsDir}`);
    process.exit(1);
  }

  const result = analyzeCrossReferences(skillsDir);

  // Print summary
  console.log('='.repeat(80));
  console.log('CROSS-REFERENCE ANALYSIS SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Skills: ${result.summary.totalSkills}`);
  console.log(`Broken Skill References: ${result.summary.brokenSkillReferences}`);
  console.log(`Broken File References: ${result.summary.brokenFileReferences}`);
  console.log('');

  if (result.brokenSkillReferences.length > 0) {
    console.log('\nBROKEN SKILL REFERENCES:');
    console.log('-'.repeat(80));
    result.brokenSkillReferences.forEach(ref => {
      console.log(`\n  Skill: ${ref.skillName}`);
      console.log(`  Line ${ref.lineNumber}: References non-existent skill "${ref.referencedSkill}"`);
      console.log(`  Context: ${ref.context}`);
    });
  } else {
    console.log('\nOK: No broken skill references found!');
  }

  if (result.brokenFileReferences.length > 0) {
    console.log('\n\nBROKEN FILE REFERENCES:');
    console.log('-'.repeat(80));
    result.brokenFileReferences.forEach(ref => {
      console.log(`\n  Skill: ${ref.skillName}`);
      console.log(`  Line ${ref.lineNumber}: Missing file "${ref.filePath}"`);
    });
  } else {
    console.log('\nOK: No broken file references found!');
  }

  // Output JSON report
  const reportPath = path.join(process.cwd(), 'cross-reference-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(result, null, 2));
  console.log(`\n\nDetailed report saved to: ${reportPath}`);

  // Exit with error code if broken references found
  if (result.summary.brokenSkillReferences > 0 || result.summary.brokenFileReferences > 0) {
    process.exit(1);
  }
}

main();

#!/usr/bin/env npx tsx
"use strict";
/**
 * Fix Corrupted Skill Documentation
 *
 * The sync script corrupted descriptions by not handling escaped quotes.
 * This script rebuilds SkillHeader components from scratch using SKILL.md data.
 *
 * Run: npx tsx scripts/fixCorruptedDocs.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var SKILLS_DIR = path.resolve(__dirname, '../../.claude/skills');
var DOCS_DIR = path.resolve(__dirname, '../docs/skills');
function parseYamlFrontmatter(content) {
    var match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match)
        return null;
    var yaml = match[1];
    var result = { name: '', description: '' };
    var nameMatch = yaml.match(/^name:\s*(.+)$/m);
    if (nameMatch)
        result.name = nameMatch[1].trim();
    var descMatch = yaml.match(/^description:\s*(.+)$/m);
    if (descMatch)
        result.description = descMatch[1].trim();
    return result;
}
function getDocFilename(skillId) {
    return skillId.replace(/-/g, '_') + '.md';
}
function fixDocFile(skillId, frontmatter) {
    var docFilename = getDocFilename(skillId);
    var docPath = path.join(DOCS_DIR, docFilename);
    if (!fs.existsSync(docPath)) {
        return { fixed: false, reason: 'Doc file does not exist' };
    }
    var content = fs.readFileSync(docPath, 'utf-8');
    // Find the SkillHeader component - match from <SkillHeader to />
    var headerRegex = /<SkillHeader[\s\S]*?\/>/;
    var headerMatch = content.match(headerRegex);
    if (!headerMatch) {
        return { fixed: false, reason: 'No SkillHeader found' };
    }
    var currentHeader = headerMatch[0];
    // Extract existing props we want to keep
    var fileNameMatch = currentHeader.match(/fileName="([^"]+)"/);
    var skillNameMatch = currentHeader.match(/skillName="([^"]+)"/);
    var tagsMatch = currentHeader.match(/tags=\{(\[[^\]]+\])\}/);
    var fileName = fileNameMatch ? fileNameMatch[1] : skillId.replace(/-/g, '_');
    var skillName = skillNameMatch ? skillNameMatch[1] : frontmatter.name
        .split('-')
        .map(function (word) { return word.charAt(0).toUpperCase() + word.slice(1); })
        .join(' ');
    var tags = tagsMatch ? tagsMatch[1] : '["research"]';
    // Escape quotes in description for JSX - use curly braces syntax for proper escaping
    var escapedDesc = frontmatter.description.replace(/"/g, '\\"');
    // Build the new clean SkillHeader - use curly braces for description to handle special chars
    var newHeader = "<SkillHeader\n  skillName=\"".concat(skillName, "\"\n  fileName=\"").concat(fileName, "\"\n  description={\"").concat(escapedDesc, "\"}\n  tags={").concat(tags, "}\n/>");
    // Replace the old header with the new one
    var newContent = content.replace(headerRegex, newHeader);
    if (newContent !== content) {
        fs.writeFileSync(docPath, newContent);
        return { fixed: true };
    }
    return { fixed: false, reason: 'No changes needed' };
}
function main() {
    console.log('🔧 Fixing corrupted skill documentation...\n');
    var skillDirs = fs.readdirSync(SKILLS_DIR, { withFileTypes: true })
        .filter(function (dirent) { return dirent.isDirectory(); })
        .map(function (dirent) { return dirent.name; });
    var fixedCount = 0;
    var skippedCount = 0;
    var issues = [];
    for (var _i = 0, skillDirs_1 = skillDirs; _i < skillDirs_1.length; _i++) {
        var skillId = skillDirs_1[_i];
        var skillMdPath = path.join(SKILLS_DIR, skillId, 'SKILL.md');
        if (!fs.existsSync(skillMdPath)) {
            issues.push("".concat(skillId, ": Missing SKILL.md"));
            continue;
        }
        var content = fs.readFileSync(skillMdPath, 'utf-8');
        var frontmatter = parseYamlFrontmatter(content);
        if (!frontmatter || !frontmatter.name) {
            issues.push("".concat(skillId, ": Invalid or missing frontmatter"));
            continue;
        }
        var result = fixDocFile(skillId, frontmatter);
        if (result.fixed) {
            console.log("\u2705 ".concat(skillId, ": Fixed"));
            fixedCount++;
        }
        else if (result.reason === 'Doc file does not exist') {
            issues.push("".concat(skillId, ": No doc file"));
        }
        else if (result.reason === 'No SkillHeader found') {
            issues.push("".concat(skillId, ": No SkillHeader in doc"));
        }
        else {
            skippedCount++;
        }
    }
    console.log("\n\uD83D\uDCCA Summary:");
    console.log("   Fixed: ".concat(fixedCount));
    console.log("   Unchanged: ".concat(skippedCount));
    if (issues.length > 0) {
        console.log("\n\u26A0\uFE0F  Issues (".concat(issues.length, "):"));
        issues.forEach(function (issue) { return console.log("   - ".concat(issue)); });
    }
    console.log('\n✨ Fix complete!');
}
main();

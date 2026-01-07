"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
// Extract first 1-2 paragraphs of expository content from SKILL.md
function extractDescription(content) {
    // Split by lines
    var lines = content.split('\n');
    // Skip frontmatter
    var inFrontmatter = false;
    var frontmatterEnded = false;
    var paragraphs = [];
    var currentParagraph = [];
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        var trimmed = line.trim();
        // Handle frontmatter
        if (trimmed === '---') {
            if (!inFrontmatter && !frontmatterEnded) {
                inFrontmatter = true;
                continue;
            }
            else if (inFrontmatter) {
                inFrontmatter = false;
                frontmatterEnded = true;
                continue;
            }
        }
        if (inFrontmatter || !frontmatterEnded) {
            continue;
        }
        // Stop at first heading or list
        if (trimmed.startsWith('#') || trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('1.')) {
            break;
        }
        // Empty line marks paragraph boundary
        if (trimmed === '') {
            if (currentParagraph.length > 0) {
                paragraphs.push(currentParagraph.join(' '));
                currentParagraph = [];
                // Stop after 2 paragraphs
                if (paragraphs.length >= 2) {
                    break;
                }
            }
        }
        else {
            currentParagraph.push(trimmed);
        }
    }
    // Add last paragraph if exists
    if (currentParagraph.length > 0 && paragraphs.length < 2) {
        paragraphs.push(currentParagraph.join(' '));
    }
    return paragraphs.join(' ');
}
// Main function
function main() {
    // Use the explicit path
    var homeDir = process.env.HOME || process.env.USERPROFILE || '';
    var skillsDir = path.join(homeDir, 'coding/some_claude_skills/.claude/skills');
    var skills = [];
    // Read all skill directories
    var skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
        .filter(function (dirent) { return dirent.isDirectory(); })
        .map(function (dirent) { return dirent.name; });
    for (var _i = 0, skillDirs_1 = skillDirs; _i < skillDirs_1.length; _i++) {
        var skillId = skillDirs_1[_i];
        // Check both SKILL.md and skill.md
        var skillMdPath = path.join(skillsDir, skillId, 'SKILL.md');
        var skillMdPathLower = path.join(skillsDir, skillId, 'skill.md');
        var actualPath = fs.existsSync(skillMdPath) ? skillMdPath :
            fs.existsSync(skillMdPathLower) ? skillMdPathLower : null;
        if (actualPath) {
            var content = fs.readFileSync(actualPath, 'utf-8');
            var description = extractDescription(content);
            if (description) {
                skills.push({ id: skillId, description: description });
            }
        }
    }
    // Write to JSON file
    var outputPath = path.join(__dirname, '../src/data/skillDescriptions.json');
    fs.writeFileSync(outputPath, JSON.stringify(skills, null, 2));
    console.log("\u2713 Extracted descriptions for ".concat(skills.length, " skills"));
    console.log("\u2713 Written to ".concat(outputPath));
}
main();

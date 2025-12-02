"use strict";
/**
 * Generate comprehensive skill metadata for sorting and display.
 * Includes git dates, line counts, and file sizes.
 *
 * Run: npx tsx scripts/generateSkillMetadata.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var child_process_1 = require("child_process");
var SKILLS_DIR = path.join(__dirname, '../../.claude/skills');
var OUTPUT_PATH = path.join(__dirname, '../src/data/skillMetadata.json');
var ROOT_DIR = path.join(__dirname, '../..');
// Files to skip
var SKIP_FILES = ['.DS_Store', '.git', 'node_modules', '__pycache__'];
function shouldSkip(name) {
    return SKIP_FILES.some(function (skip) { return name === skip || name.endsWith('.pyc'); });
}
function getGitDate(filePath, first) {
    try {
        var format = first ? '--follow --diff-filter=A --format=%aI' : '--format=%aI -1';
        var cmd = first
            ? "git log --follow --diff-filter=A --format=%aI -- \"".concat(filePath, "\" | tail -1")
            : "git log --format=%aI -1 -- \"".concat(filePath, "\"");
        var result = (0, child_process_1.execSync)(cmd, {
            cwd: ROOT_DIR,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
        }).trim();
        return result || null;
    }
    catch (_a) {
        return null;
    }
}
function getGitDatesForFolder(folderPath) {
    try {
        // Get most recent commit date for any file in folder
        var updatedCmd = "git log --format=%aI -1 -- \"".concat(folderPath, "\"");
        var updatedAt = (0, child_process_1.execSync)(updatedCmd, {
            cwd: ROOT_DIR,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
        }).trim() || null;
        // Get oldest commit date for any file in folder
        var createdCmd = "git log --format=%aI --reverse -- \"".concat(folderPath, "\" | head -1");
        var createdAt = (0, child_process_1.execSync)(createdCmd, {
            cwd: ROOT_DIR,
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
        }).trim() || null;
        return { createdAt: createdAt, updatedAt: updatedAt };
    }
    catch (_a) {
        return { createdAt: null, updatedAt: null };
    }
}
function countLines(filePath) {
    try {
        var content = fs.readFileSync(filePath, 'utf-8');
        return content.split('\n').length;
    }
    catch (_a) {
        return 0;
    }
}
function processFolder(dirPath) {
    var totalLines = 0;
    var totalFiles = 0;
    function walk(dir) {
        var entries = fs.readdirSync(dir, { withFileTypes: true });
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            if (shouldSkip(entry.name))
                continue;
            var fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            }
            else if (entry.isFile()) {
                totalFiles++;
                // Count lines for text files
                var ext = path.extname(entry.name).toLowerCase();
                if (['.md', '.txt', '.py', '.sh', '.js', '.ts', '.tsx', '.jsx', '.css', '.json', '.yaml', '.yml'].includes(ext)) {
                    totalLines += countLines(fullPath);
                }
            }
        }
    }
    walk(dirPath);
    return { totalLines: totalLines, totalFiles: totalFiles };
}
function generateSkillMetadata() {
    console.log('Generating skill metadata...\n');
    var skillFolders = fs.readdirSync(SKILLS_DIR)
        .filter(function (name) {
        var skillPath = path.join(SKILLS_DIR, name);
        return fs.statSync(skillPath).isDirectory() && !shouldSkip(name);
    })
        .sort();
    var skills = {};
    for (var _i = 0, skillFolders_1 = skillFolders; _i < skillFolders_1.length; _i++) {
        var skillName = skillFolders_1[_i];
        var skillPath = path.join(SKILLS_DIR, skillName);
        var relativePath = ".claude/skills/".concat(skillName);
        console.log("Processing: ".concat(skillName));
        // Get git dates
        var _a = getGitDatesForFolder(relativePath), createdAt = _a.createdAt, updatedAt = _a.updatedAt;
        // Count lines and files
        var _b = processFolder(skillPath), totalLines = _b.totalLines, totalFiles = _b.totalFiles;
        // Get SKILL.md stats
        var skillMdPath = path.join(skillPath, 'SKILL.md');
        var skillMdSize = 0;
        var skillMdLines = 0;
        if (fs.existsSync(skillMdPath)) {
            var stats = fs.statSync(skillMdPath);
            skillMdSize = stats.size;
            skillMdLines = countLines(skillMdPath);
        }
        // Check for special folders/files
        var hasReferences = fs.existsSync(path.join(skillPath, 'references'));
        var hasExamples = fs.existsSync(path.join(skillPath, 'examples'));
        var hasChangelog = fs.existsSync(path.join(skillPath, 'CHANGELOG.md'));
        skills[skillName] = {
            id: skillName,
            createdAt: createdAt,
            updatedAt: updatedAt,
            totalLines: totalLines,
            totalFiles: totalFiles,
            skillMdSize: skillMdSize,
            skillMdLines: skillMdLines,
            hasReferences: hasReferences,
            hasExamples: hasExamples,
            hasChangelog: hasChangelog,
        };
        console.log("  Created: ".concat((createdAt === null || createdAt === void 0 ? void 0 : createdAt.split('T')[0]) || 'unknown', ", Updated: ").concat((updatedAt === null || updatedAt === void 0 ? void 0 : updatedAt.split('T')[0]) || 'unknown'));
        console.log("  Lines: ".concat(totalLines, ", Files: ").concat(totalFiles, ", SKILL.md: ").concat(skillMdLines, " lines"));
    }
    var output = {
        generatedAt: new Date().toISOString(),
        skills: skills,
    };
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    console.log("\n\u2705 Generated metadata for ".concat(Object.keys(skills).length, " skills"));
    console.log("   Output: ".concat(OUTPUT_PATH));
}
generateSkillMetadata();

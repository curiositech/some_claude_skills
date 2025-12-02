"use strict";
/**
 * Generate skill folder structure data for the Win31FileManager component.
 * This script runs at build time to generate JSON data for each skill folder.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var SKILLS_DIR = path.join(__dirname, '../../.claude/skills');
var OUTPUT_DIR = path.join(__dirname, '../src/data/skillFolders');
// Files to skip
var SKIP_FILES = ['.DS_Store', '.git', 'node_modules', '__pycache__', '.pyc'];
// Files where we should include content (max 50KB)
var MAX_CONTENT_SIZE = 50 * 1024;
var CONTENT_EXTENSIONS = ['.md', '.txt', '.py', '.sh', '.js', '.ts', '.tsx', '.jsx', '.css', '.json'];
function shouldSkip(name) {
    return SKIP_FILES.some(function (skip) { return name === skip || name.endsWith(skip); });
}
function shouldIncludeContent(name, size) {
    if (size > MAX_CONTENT_SIZE)
        return false;
    var ext = path.extname(name).toLowerCase();
    return CONTENT_EXTENSIONS.includes(ext);
}
function buildFileTree(dirPath, relativePath) {
    if (relativePath === void 0) { relativePath = ''; }
    var name = path.basename(dirPath);
    var stats = fs.statSync(dirPath);
    if (stats.isFile()) {
        var node = {
            name: name,
            type: 'file',
            path: relativePath || name,
            size: stats.size,
        };
        // Include content for supported file types
        if (shouldIncludeContent(name, stats.size)) {
            try {
                node.content = fs.readFileSync(dirPath, 'utf-8');
            }
            catch (err) {
                console.warn("Could not read content of ".concat(dirPath));
            }
        }
        return node;
    }
    // It's a directory
    var children = [];
    var entries = fs.readdirSync(dirPath);
    for (var _i = 0, _a = entries.sort(); _i < _a.length; _i++) {
        var entry = _a[_i];
        if (shouldSkip(entry))
            continue;
        var entryPath = path.join(dirPath, entry);
        var childRelativePath = relativePath ? "".concat(relativePath, "/").concat(entry) : entry;
        try {
            var childNode = buildFileTree(entryPath, childRelativePath);
            children.push(childNode);
        }
        catch (err) {
            console.warn("Error processing ".concat(entryPath, ":"), err);
        }
    }
    // Sort: folders first, then files, alphabetically
    children.sort(function (a, b) {
        if (a.type !== b.type) {
            return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
    });
    return {
        name: name,
        type: 'folder',
        path: relativePath || name,
        children: children,
    };
}
function generateSkillFolderData() {
    console.log('Generating skill folder data...');
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    // Get all skill folders
    var skillFolders = fs.readdirSync(SKILLS_DIR)
        .filter(function (name) {
        var skillPath = path.join(SKILLS_DIR, name);
        return fs.statSync(skillPath).isDirectory() && !shouldSkip(name);
    })
        .sort();
    var allSkillsIndex = {};
    var _loop_1 = function (skillName) {
        var skillPath = path.join(SKILLS_DIR, skillName);
        console.log("  Processing: ".concat(skillName));
        try {
            var tree = buildFileTree(skillPath, skillName);
            // Count files and folders
            var fileCount_1 = 0;
            var folderCount_1 = 0;
            var countNodes_1 = function (node) {
                var _a;
                if (node.type === 'file')
                    fileCount_1++;
                else {
                    folderCount_1++;
                    (_a = node.children) === null || _a === void 0 ? void 0 : _a.forEach(countNodes_1);
                }
            };
            countNodes_1(tree);
            folderCount_1--; // Don't count root
            // Check if has more than just SKILL.md
            var hasContent = tree.children && (tree.children.length > 1 ||
                tree.children.some(function (c) { return c.type === 'folder'; }));
            allSkillsIndex[skillName] = {
                hasContent: hasContent || false,
                fileCount: fileCount_1,
                folderCount: folderCount_1,
            };
            // Only generate file if there's content beyond SKILL.md
            if (hasContent) {
                var outputPath = path.join(OUTPUT_DIR, "".concat(skillName, ".json"));
                fs.writeFileSync(outputPath, JSON.stringify(tree, null, 2));
                console.log("    Created: ".concat(skillName, ".json (").concat(fileCount_1, " files, ").concat(folderCount_1, " folders)"));
            }
            else {
                console.log("    Skipped: ".concat(skillName, " (only SKILL.md)"));
            }
        }
        catch (err) {
            console.error("  Error processing ".concat(skillName, ":"), err);
        }
    };
    for (var _i = 0, skillFolders_1 = skillFolders; _i < skillFolders_1.length; _i++) {
        var skillName = skillFolders_1[_i];
        _loop_1(skillName);
    }
    // Generate index file
    var indexPath = path.join(OUTPUT_DIR, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(allSkillsIndex, null, 2));
    console.log("\nCreated index: ".concat(Object.keys(allSkillsIndex).length, " skills"));
    // Generate TypeScript types file
    var typesContent = "// Auto-generated - do not edit\nexport interface SkillFolderIndex {\n  [skillName: string]: {\n    hasContent: boolean;\n    fileCount: number;\n    folderCount: number;\n  };\n}\n\nexport interface FileNode {\n  name: string;\n  type: 'file' | 'folder';\n  path: string;\n  children?: FileNode[];\n  content?: string;\n  size?: number;\n}\n\n// Skill folder index\nexport const skillFolderIndex: SkillFolderIndex = ".concat(JSON.stringify(allSkillsIndex, null, 2), ";\n\n// Skills with rich content (more than just SKILL.md)\nexport const skillsWithContent = ").concat(JSON.stringify(Object.entries(allSkillsIndex)
        .filter(function (_a) {
        var info = _a[1];
        return info.hasContent;
    })
        .map(function (_a) {
        var name = _a[0];
        return name;
    }), null, 2), ";\n");
    var typesPath = path.join(OUTPUT_DIR, 'index.ts');
    fs.writeFileSync(typesPath, typesContent);
    console.log('Created TypeScript types file');
    console.log('\nDone!');
}
generateSkillFolderData();

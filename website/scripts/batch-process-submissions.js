#!/usr/bin/env npx tsx
"use strict";
/**
 * Batch Process Skill Submissions
 *
 * CLI tool to fetch and process skill submissions from GitHub Issues.
 * Can be run locally to preview, validate, and create skills from submissions.
 *
 * Usage:
 *   npx tsx scripts/batch-process-submissions.ts list          # List pending submissions
 *   npx tsx scripts/batch-process-submissions.ts validate <id> # Validate a specific issue
 *   npx tsx scripts/batch-process-submissions.ts create <id>   # Create skill from issue
 *   npx tsx scripts/batch-process-submissions.ts process-all   # Process all pending
 *
 * Environment:
 *   GITHUB_TOKEN - Required for API access (or use gh cli auth)
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var child_process_1 = require("child_process");
// =============================================================================
// CONSTANTS
// =============================================================================
var REPO_OWNER = 'curiositech';
var REPO_NAME = 'some_claude_skills';
var SKILLS_DIR = path.join(process.cwd(), '..', '.claude', 'skills');
var VALID_CATEGORIES = [
    'AI & Machine Learning',
    'Code Quality & Testing',
    'Content & Writing',
    'Data & Analytics',
    'Design & Creative',
    'DevOps & Site Reliability',
    'Business & Monetization',
    'Research & Analysis',
    'Productivity & Meta',
    'Lifestyle & Personal',
];
// =============================================================================
// GITHUB API
// =============================================================================
function getGitHubToken() {
    // Try environment variable first
    if (process.env.GITHUB_TOKEN) {
        return process.env.GITHUB_TOKEN;
    }
    // Try gh cli
    try {
        var token = (0, child_process_1.execSync)('gh auth token', { encoding: 'utf-8' }).trim();
        if (token)
            return token;
    }
    catch (_a) {
        // gh not available or not logged in
    }
    throw new Error('GitHub token required. Set GITHUB_TOKEN env var or login with: gh auth login');
}
function fetchIssues(label) {
    return __awaiter(this, void 0, void 0, function () {
        var token, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = getGitHubToken();
                    return [4 /*yield*/, fetch("https://api.github.com/repos/".concat(REPO_OWNER, "/").concat(REPO_NAME, "/issues?labels=").concat(label, "&state=open&per_page=100"), {
                            headers: {
                                Authorization: "token ".concat(token),
                                Accept: 'application/vnd.github.v3+json',
                            },
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("GitHub API error: ".concat(response.status, " ").concat(response.statusText));
                    }
                    return [2 /*return*/, response.json()];
            }
        });
    });
}
function fetchIssue(number) {
    return __awaiter(this, void 0, void 0, function () {
        var token, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = getGitHubToken();
                    return [4 /*yield*/, fetch("https://api.github.com/repos/".concat(REPO_OWNER, "/").concat(REPO_NAME, "/issues/").concat(number), {
                            headers: {
                                Authorization: "token ".concat(token),
                                Accept: 'application/vnd.github.v3+json',
                            },
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("GitHub API error: ".concat(response.status, " ").concat(response.statusText));
                    }
                    return [2 /*return*/, response.json()];
            }
        });
    });
}
function addLabel(issueNumber, label) {
    return __awaiter(this, void 0, void 0, function () {
        var token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = getGitHubToken();
                    return [4 /*yield*/, fetch("https://api.github.com/repos/".concat(REPO_OWNER, "/").concat(REPO_NAME, "/issues/").concat(issueNumber, "/labels"), {
                            method: 'POST',
                            headers: {
                                Authorization: "token ".concat(token),
                                Accept: 'application/vnd.github.v3+json',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ labels: [label] }),
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function addComment(issueNumber, body) {
    return __awaiter(this, void 0, void 0, function () {
        var token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = getGitHubToken();
                    return [4 /*yield*/, fetch("https://api.github.com/repos/".concat(REPO_OWNER, "/").concat(REPO_NAME, "/issues/").concat(issueNumber, "/comments"), {
                            method: 'POST',
                            headers: {
                                Authorization: "token ".concat(token),
                                Accept: 'application/vnd.github.v3+json',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ body: body }),
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// =============================================================================
// PARSING
// =============================================================================
function extractYamlBlock(issueBody) {
    var yamlMatch = issueBody.match(/```yaml\n([\s\S]*?)```/);
    if (yamlMatch) {
        return yamlMatch[1].trim();
    }
    var codeMatch = issueBody.match(/## SKILL\.md Content\s*```\n([\s\S]*?)```/);
    if (codeMatch) {
        return codeMatch[1].trim();
    }
    return null;
}
function parseSkillContent(yamlContent) {
    var frontmatterMatch = yamlContent.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
        return null;
    }
    var frontmatter = frontmatterMatch[1];
    var nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    var descMatch = frontmatter.match(/^description:\s*(.+)$/m);
    var categoryMatch = frontmatter.match(/^category:\s*(.+)$/m);
    var toolsMatch = frontmatter.match(/^allowed-tools:\s*(.+)$/m);
    var tagsSection = frontmatter.match(/^tags:\n((?:\s+-\s+.+\n?)+)/m);
    var tags = [];
    if (tagsSection) {
        var tagLines = tagsSection[1].matchAll(/^\s+-\s+(.+)$/gm);
        for (var _i = 0, tagLines_1 = tagLines; _i < tagLines_1.length; _i++) {
            var match = tagLines_1[_i];
            tags.push(match[1].trim());
        }
    }
    if (!nameMatch || !descMatch || !categoryMatch) {
        return null;
    }
    var content = yamlContent.slice(frontmatterMatch[0].length).trim();
    var titleMatch = content.match(/^#\s+(.+)$/m);
    var title = titleMatch ? titleMatch[1].trim() : nameMatch[1].trim();
    return {
        skillId: nameMatch[1].trim(),
        title: title,
        category: categoryMatch[1].trim(),
        description: descMatch[1].trim(),
        tags: tags,
        allowedTools: toolsMatch ? toolsMatch[1].split(',').map(function (t) { return t.trim(); }) : [],
        content: yamlContent,
    };
}
// =============================================================================
// VALIDATION
// =============================================================================
function validateSubmission(submission) {
    var errors = [];
    if (!submission.skillId) {
        errors.push('Skill ID (name) is required');
    }
    else if (!/^[a-z0-9-]+$/.test(submission.skillId)) {
        errors.push('Skill ID must be lowercase with hyphens only');
    }
    else if (submission.skillId.length < 3 || submission.skillId.length > 50) {
        errors.push('Skill ID must be 3-50 characters');
    }
    var skillDir = path.join(SKILLS_DIR, submission.skillId);
    if (fs.existsSync(skillDir)) {
        errors.push("Skill \"".concat(submission.skillId, "\" already exists"));
    }
    if (!submission.title || submission.title.length < 5) {
        errors.push('Skill title must be at least 5 characters');
    }
    if (!VALID_CATEGORIES.includes(submission.category)) {
        errors.push("Invalid category: ".concat(submission.category));
    }
    if (!submission.description || submission.description.length < 50) {
        errors.push('Description must be at least 50 characters');
    }
    if (submission.tags.length === 0) {
        errors.push('At least one tag is required');
    }
    if (!submission.content.includes('## When to Use')) {
        errors.push('Missing "## When to Use" section');
    }
    return {
        valid: errors.length === 0,
        errors: errors,
        submission: errors.length === 0 ? submission : undefined,
    };
}
// =============================================================================
// SKILL CREATION
// =============================================================================
function createSkillFiles(submission) {
    var skillDir = path.join(SKILLS_DIR, submission.skillId);
    if (!fs.existsSync(skillDir)) {
        fs.mkdirSync(skillDir, { recursive: true });
    }
    var skillPath = path.join(skillDir, 'SKILL.md');
    fs.writeFileSync(skillPath, submission.content, 'utf-8');
    return skillPath;
}
// =============================================================================
// CLI COMMANDS
// =============================================================================
function listSubmissions() {
    return __awaiter(this, void 0, void 0, function () {
        var issues, pending, _i, pending_1, issue, yamlContent, parsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('📋 Fetching skill submissions...\n');
                    return [4 /*yield*/, fetchIssues('skill-submission')];
                case 1:
                    issues = _a.sent();
                    pending = issues.filter(function (i) { return !i.labels.some(function (l) { return l.name === 'processed'; }); });
                    if (pending.length === 0) {
                        console.log('No pending skill submissions found.');
                        return [2 /*return*/];
                    }
                    console.log("Found ".concat(pending.length, " pending submission(s):\n"));
                    for (_i = 0, pending_1 = pending; _i < pending_1.length; _i++) {
                        issue = pending_1[_i];
                        yamlContent = extractYamlBlock(issue.body);
                        parsed = yamlContent ? parseSkillContent(yamlContent) : null;
                        console.log("#".concat(issue.number, " - ").concat(issue.title));
                        console.log("   Author: @".concat(issue.user.login));
                        console.log("   Created: ".concat(new Date(issue.created_at).toLocaleDateString()));
                        if (parsed) {
                            console.log("   Skill ID: ".concat(parsed.skillId));
                            console.log("   Category: ".concat(parsed.category));
                        }
                        else {
                            console.log("   \u26A0\uFE0F  Could not parse submission");
                        }
                        console.log('');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function validateIssue(issueNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var issue, yamlContent, parsed, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\uD83D\uDD0D Validating issue #".concat(issueNumber, "...\n"));
                    return [4 /*yield*/, fetchIssue(issueNumber)];
                case 1:
                    issue = _a.sent();
                    yamlContent = extractYamlBlock(issue.body);
                    if (!yamlContent) {
                        console.log('❌ Could not find YAML content block');
                        return [2 /*return*/];
                    }
                    parsed = parseSkillContent(yamlContent);
                    if (!parsed) {
                        console.log('❌ Could not parse SKILL.md content');
                        return [2 /*return*/];
                    }
                    result = validateSubmission(parsed);
                    console.log("Skill: ".concat(parsed.title, " (").concat(parsed.skillId, ")"));
                    console.log("Category: ".concat(parsed.category));
                    console.log("Tags: ".concat(parsed.tags.join(', ')));
                    console.log("Description: ".concat(parsed.description.substring(0, 100), "..."));
                    console.log('');
                    if (result.valid) {
                        console.log('✅ Submission is valid!');
                    }
                    else {
                        console.log('❌ Validation errors:');
                        result.errors.forEach(function (e) { return console.log("   - ".concat(e)); });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function createFromIssue(issueNumber_1) {
    return __awaiter(this, arguments, void 0, function (issueNumber, dryRun) {
        var issue, yamlContent, parsed, result, skillPath;
        if (dryRun === void 0) { dryRun = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\uD83D\uDCE6 Creating skill from issue #".concat(issueNumber).concat(dryRun ? ' (dry run)' : '', "...\n"));
                    return [4 /*yield*/, fetchIssue(issueNumber)];
                case 1:
                    issue = _a.sent();
                    yamlContent = extractYamlBlock(issue.body);
                    if (!yamlContent) {
                        console.log('❌ Could not find YAML content block');
                        return [2 /*return*/];
                    }
                    parsed = parseSkillContent(yamlContent);
                    if (!parsed) {
                        console.log('❌ Could not parse SKILL.md content');
                        return [2 /*return*/];
                    }
                    result = validateSubmission(parsed);
                    if (!result.valid) {
                        console.log('❌ Validation failed:');
                        result.errors.forEach(function (e) { return console.log("   - ".concat(e)); });
                        return [2 /*return*/];
                    }
                    if (dryRun) {
                        console.log('Would create skill:');
                        console.log("   Path: .claude/skills/".concat(parsed.skillId, "/SKILL.md"));
                        console.log("   Title: ".concat(parsed.title));
                        console.log("   Category: ".concat(parsed.category));
                        return [2 /*return*/];
                    }
                    skillPath = createSkillFiles(parsed);
                    console.log("\u2705 Created skill at: ".concat(skillPath));
                    // Add processed label and comment
                    return [4 /*yield*/, addLabel(issueNumber, 'processed')];
                case 2:
                    // Add processed label and comment
                    _a.sent();
                    return [4 /*yield*/, addComment(issueNumber, "## \u2705 Skill Created\n\nYour skill \"".concat(parsed.title, "\" has been added to the collection!\n\nPath: `.claude/skills/").concat(parsed.skillId, "/SKILL.md`"))];
                case 3:
                    _a.sent();
                    console.log("\n\uD83D\uDCDD Next steps:");
                    console.log("   1. Run: npm run skills:generate");
                    console.log("   2. Commit: git add -A && git commit -m \"feat(skills): Add ".concat(parsed.title, "\""));
                    console.log("   3. Push: git push");
                    return [2 /*return*/];
            }
        });
    });
}
function processAll() {
    return __awaiter(this, arguments, void 0, function (dryRun) {
        var issues, pending, created, failed, _i, pending_2, issue, yamlContent, parsed, result;
        if (dryRun === void 0) { dryRun = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\uD83D\uDE80 Processing all submissions".concat(dryRun ? ' (dry run)' : '', "...\n"));
                    return [4 /*yield*/, fetchIssues('skill-submission')];
                case 1:
                    issues = _a.sent();
                    pending = issues.filter(function (i) { return !i.labels.some(function (l) { return l.name === 'processed'; }); });
                    if (pending.length === 0) {
                        console.log('No pending submissions to process.');
                        return [2 /*return*/];
                    }
                    created = 0;
                    failed = 0;
                    _i = 0, pending_2 = pending;
                    _a.label = 2;
                case 2:
                    if (!(_i < pending_2.length)) return [3 /*break*/, 9];
                    issue = pending_2[_i];
                    console.log("\n--- Processing #".concat(issue.number, ": ").concat(issue.title, " ---"));
                    yamlContent = extractYamlBlock(issue.body);
                    if (!yamlContent) {
                        console.log('❌ Could not find YAML content');
                        failed++;
                        return [3 /*break*/, 8];
                    }
                    parsed = parseSkillContent(yamlContent);
                    if (!parsed) {
                        console.log('❌ Could not parse content');
                        failed++;
                        return [3 /*break*/, 8];
                    }
                    result = validateSubmission(parsed);
                    if (!!result.valid) return [3 /*break*/, 5];
                    console.log('❌ Validation failed:', result.errors.join(', '));
                    if (!!dryRun) return [3 /*break*/, 4];
                    return [4 /*yield*/, addLabel(issue.number, 'needs-revision')];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    failed++;
                    return [3 /*break*/, 8];
                case 5:
                    if (!!dryRun) return [3 /*break*/, 7];
                    createSkillFiles(parsed);
                    return [4 /*yield*/, addLabel(issue.number, 'processed')];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    console.log("\u2705 ".concat(dryRun ? 'Would create' : 'Created', ": ").concat(parsed.skillId));
                    created++;
                    _a.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 2];
                case 9:
                    console.log("\n\uD83D\uDCCA Summary: ".concat(created, " created, ").concat(failed, " failed"));
                    return [2 /*return*/];
            }
        });
    });
}
// =============================================================================
// MAIN
// =============================================================================
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, command, arg, flag, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = process.argv.slice(2), command = _a[0], arg = _a[1], flag = _a[2];
                    _b = command;
                    switch (_b) {
                        case 'list': return [3 /*break*/, 1];
                        case 'validate': return [3 /*break*/, 3];
                        case 'create': return [3 /*break*/, 5];
                        case 'process-all': return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 9];
                case 1: return [4 /*yield*/, listSubmissions()];
                case 2:
                    _c.sent();
                    return [3 /*break*/, 10];
                case 3:
                    if (!arg) {
                        console.error('Usage: batch-process-submissions.ts validate <issue_number>');
                        process.exit(1);
                    }
                    return [4 /*yield*/, validateIssue(parseInt(arg, 10))];
                case 4:
                    _c.sent();
                    return [3 /*break*/, 10];
                case 5:
                    if (!arg) {
                        console.error('Usage: batch-process-submissions.ts create <issue_number> [--dry-run]');
                        process.exit(1);
                    }
                    return [4 /*yield*/, createFromIssue(parseInt(arg, 10), flag === '--dry-run')];
                case 6:
                    _c.sent();
                    return [3 /*break*/, 10];
                case 7: return [4 /*yield*/, processAll(arg === '--dry-run')];
                case 8:
                    _c.sent();
                    return [3 /*break*/, 10];
                case 9:
                    console.log("\nBatch Process Skill Submissions\n\nUsage:\n  npx tsx scripts/batch-process-submissions.ts <command> [options]\n\nCommands:\n  list                   List all pending skill submissions\n  validate <id>          Validate a specific issue submission\n  create <id>            Create skill files from issue (--dry-run available)\n  process-all            Process all pending submissions (--dry-run available)\n\nExamples:\n  npx tsx scripts/batch-process-submissions.ts list\n  npx tsx scripts/batch-process-submissions.ts validate 42\n  npx tsx scripts/batch-process-submissions.ts create 42 --dry-run\n  npx tsx scripts/batch-process-submissions.ts process-all --dry-run\n");
                    _c.label = 10;
                case 10: return [2 /*return*/];
            }
        });
    });
}
main().catch(function (err) {
    console.error('Error:', err.message);
    process.exit(1);
});

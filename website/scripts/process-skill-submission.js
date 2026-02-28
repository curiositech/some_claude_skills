#!/usr/bin/env npx tsx
"use strict";
/**
 * Process Skill Submission
 *
 * Parses and validates skill submissions from GitHub Issues.
 * Used by the GitHub Action workflow to automatically process submissions.
 *
 * Usage: npx tsx scripts/process-skill-submission.ts <issue_number>
 *
 * The script fetches the issue body via GitHub API to avoid shell escaping issues.
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
// =============================================================================
// CONSTANTS
// =============================================================================
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
var RESERVED_SKILL_IDS = [
    'test',
    'example',
    'sample',
    'demo',
    'template',
];
// Known tags from taxonomy (for validation suggestions)
// Keep in sync with website/src/types/tags.ts
var KNOWN_TAGS = new Set([
    // Skill Type (purple)
    'research', 'creation', 'coaching', 'automation', 'orchestration',
    'validation', 'analysis', 'optimization', 'clustering', 'curation',
    'indexing', 'refactoring', 'testing', 'moderation', 'coordination',
    // Domain (blue)
    'design', 'audio', '3d', 'cv', 'ml', 'psychology', 'finance', 'career',
    'accessibility', 'adhd', 'devops', 'robotics', 'photography', 'health',
    'recovery', 'entrepreneurship', 'spatial', 'job-search', 'inspection',
    'thermal', 'insurance', 'temporal', 'events', 'faces', 'duplicates',
    'web', 'api', 'security', 'documentation', 'legal', 'relationships',
    'grief', 'vr', 'landscaping', 'color', 'typography', 'shaders',
    'physics', 'bots', 'agents', 'prompts',
    // Output (green)
    'code', 'document', 'visual', 'data', 'strategy', 'diagrams', 'templates',
    // Complexity (orange)
    'beginner-friendly', 'advanced', 'production-ready',
    // Integration (pink)
    'mcp', 'elevenlabs', 'figma', 'stability-ai', 'playwright', 'jest',
    'docusaurus', 'swiftui', 'react', 'discord', 'slack', 'telegram',
]);
var MIN_TAGS = 2;
var MAX_TAGS = 10;
// =============================================================================
// PARSING
// =============================================================================
function extractYamlBlock(issueBody) {
    // Look for YAML code block in the issue body
    var yamlMatch = issueBody.match(/```yaml\n([\s\S]*?)```/);
    if (yamlMatch) {
        return yamlMatch[1].trim();
    }
    // Also try without language specifier
    var codeMatch = issueBody.match(/## SKILL\.md Content\s*```\n([\s\S]*?)```/);
    if (codeMatch) {
        return codeMatch[1].trim();
    }
    return null;
}
function parseSkillContent(yamlContent) {
    // Parse YAML frontmatter
    var frontmatterMatch = yamlContent.match(/^---\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) {
        return null;
    }
    var frontmatter = frontmatterMatch[1];
    var content = yamlContent.slice(frontmatterMatch[0].length).trim();
    // Extract fields from frontmatter
    var nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    var descMatch = frontmatter.match(/^description:\s*(.+)$/m);
    var categoryMatch = frontmatter.match(/^category:\s*(.+)$/m);
    var toolsMatch = frontmatter.match(/^allowed-tools:\s*(.+)$/m);
    // Extract tags
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
    // Extract title from content (first H1)
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
function extractMetadata(issueBody) {
    var _a, _b;
    var submitterMatch = issueBody.match(/\*\*Submitted by:\*\*\s*(.+)/);
    var githubMatch = issueBody.match(/\*\*GitHub:\*\*\s*@?(\w+)/);
    return {
        submitter: (_a = submitterMatch === null || submitterMatch === void 0 ? void 0 : submitterMatch[1]) === null || _a === void 0 ? void 0 : _a.trim(),
        submitterGithub: (_b = githubMatch === null || githubMatch === void 0 ? void 0 : githubMatch[1]) === null || _b === void 0 ? void 0 : _b.trim(),
    };
}
// =============================================================================
// VALIDATION
// =============================================================================
function validateSubmission(submission) {
    var errors = [];
    // Validate skill ID
    if (!submission.skillId) {
        errors.push('Skill ID (name) is required');
    }
    else if (!/^[a-z0-9-]+$/.test(submission.skillId)) {
        errors.push('Skill ID must be lowercase with hyphens only (e.g., my-skill-name)');
    }
    else if (submission.skillId.length < 3) {
        errors.push('Skill ID must be at least 3 characters');
    }
    else if (submission.skillId.length > 50) {
        errors.push('Skill ID must be less than 50 characters');
    }
    else if (RESERVED_SKILL_IDS.includes(submission.skillId)) {
        errors.push("Skill ID \"".concat(submission.skillId, "\" is reserved"));
    }
    // Check for duplicate
    var skillDir = path.join(process.cwd(), '..', '.claude', 'skills', submission.skillId);
    if (fs.existsSync(skillDir)) {
        errors.push("A skill with ID \"".concat(submission.skillId, "\" already exists"));
    }
    // Validate title
    if (!submission.title) {
        errors.push('Skill title is required');
    }
    else if (submission.title.length < 5) {
        errors.push('Skill title must be at least 5 characters');
    }
    // Validate category
    if (!submission.category) {
        errors.push('Category is required');
    }
    else if (!VALID_CATEGORIES.includes(submission.category)) {
        errors.push("Invalid category. Must be one of: ".concat(VALID_CATEGORIES.join(', ')));
    }
    // Validate description
    if (!submission.description) {
        errors.push('Description is required');
    }
    else if (submission.description.length < 50) {
        errors.push('Description must be at least 50 characters');
    }
    else if (submission.description.length > 500) {
        errors.push('Description must be less than 500 characters');
    }
    // Validate tags
    if (submission.tags.length === 0) {
        errors.push('At least 2 tags are required for discoverability');
    }
    else if (submission.tags.length < MIN_TAGS) {
        errors.push("At least ".concat(MIN_TAGS, " tags are required for discoverability"));
    }
    else if (submission.tags.length > MAX_TAGS) {
        errors.push("Maximum ".concat(MAX_TAGS, " tags allowed"));
    }
    // Check for known tags (warn about unknowns but don't fail)
    var unknownTags = submission.tags.filter(function (tag) { return !KNOWN_TAGS.has(tag); });
    var knownTags = submission.tags.filter(function (tag) { return KNOWN_TAGS.has(tag); });
    if (knownTags.length === 0 && submission.tags.length > 0) {
        // All tags are custom - suggest using at least one from taxonomy
        errors.push("Please use at least one tag from the official taxonomy for better discoverability. " +
            "Unknown tags: ".concat(unknownTags.join(', '), ". ") +
            "See: https://someclaudeskills.com/skills for popular tags.");
    }
    // Validate content has required sections
    if (!submission.content.includes('## When to Use')) {
        errors.push('Content must include a "## When to Use" section');
    }
    return {
        valid: errors.length === 0,
        errors: errors,
        submission: errors.length === 0 ? submission : undefined,
    };
}
function fetchIssue(issueNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var token, repo, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = process.env.GITHUB_TOKEN;
                    repo = process.env.GITHUB_REPOSITORY || 'curiositech/some_claude_skills';
                    if (!token) {
                        throw new Error('GITHUB_TOKEN environment variable is required');
                    }
                    return [4 /*yield*/, fetch("https://api.github.com/repos/".concat(repo, "/issues/").concat(issueNumber), {
                            headers: {
                                Authorization: "Bearer ".concat(token),
                                Accept: 'application/vnd.github.v3+json',
                                'User-Agent': 'skill-submission-processor',
                            },
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch issue #".concat(issueNumber, ": ").concat(response.statusText));
                    }
                    return [2 /*return*/, response.json()];
            }
        });
    });
}
// =============================================================================
// MAIN
// =============================================================================
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var issueNumber, issueBody, submitterGithub, issue, error_1, yamlContent, submission, metadata, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    issueNumber = process.argv.slice(2)[0];
                    if (!issueNumber) {
                        console.error('Usage: process-skill-submission.ts <issue_number>');
                        process.exit(1);
                    }
                    console.log("Processing skill submission from issue #".concat(issueNumber));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fetchIssue(issueNumber)];
                case 2:
                    issue = _a.sent();
                    issueBody = issue.body;
                    submitterGithub = issue.user.login;
                    console.log("Fetched issue: ".concat(issue.title));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Failed to fetch issue: ".concat(error_1));
                    setOutput('valid', 'false');
                    setOutput('errors', "Failed to fetch issue #".concat(issueNumber, " from GitHub API"));
                    process.exit(0);
                    return [3 /*break*/, 4];
                case 4:
                    yamlContent = extractYamlBlock(issueBody);
                    if (!yamlContent) {
                        setOutput('valid', 'false');
                        setOutput('errors', 'Could not find YAML content block in issue body');
                        process.exit(0);
                    }
                    submission = parseSkillContent(yamlContent);
                    if (!submission) {
                        setOutput('valid', 'false');
                        setOutput('errors', 'Could not parse SKILL.md content. Ensure it has valid YAML frontmatter.');
                        process.exit(0);
                    }
                    metadata = extractMetadata(issueBody);
                    submission.submitter = metadata.submitter;
                    submission.submitterGithub = submitterGithub || metadata.submitterGithub;
                    result = validateSubmission(submission);
                    if (result.valid) {
                        setOutput('valid', 'true');
                        setOutput('skill_id', submission.skillId);
                        setOutput('skill_title', submission.title);
                        setOutput('category', submission.category);
                        // Base64 encode the content to avoid shell escaping issues
                        setOutput('skill_content', Buffer.from(submission.content).toString('base64'));
                        console.log("\u2705 Valid submission: ".concat(submission.title, " (").concat(submission.skillId, ")"));
                    }
                    else {
                        setOutput('valid', 'false');
                        setOutput('errors', result.errors.join('\n'));
                        console.log("\u274C Validation failed:\n".concat(result.errors.map(function (e) { return "  - ".concat(e); }).join('\n')));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function setOutput(name, value) {
    var outputFile = process.env.GITHUB_OUTPUT;
    if (outputFile) {
        fs.appendFileSync(outputFile, "".concat(name, "=").concat(value, "\n"));
    }
    else {
        // For local testing, just print
        console.log("OUTPUT: ".concat(name, "=").concat(value));
    }
}
main().catch(function (err) {
    console.error('Error processing submission:', err);
    process.exit(1);
});

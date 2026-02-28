"use strict";
/**
 * Remote Skill Registry
 *
 * Supports importing skills from external GitHub repositories
 * and publishing to a central registry.
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
exports.fetchRegistry = fetchRegistry;
exports.searchRegistry = searchRegistry;
exports.importSkill = importSkill;
exports.importFromGitHub = importFromGitHub;
exports.importFromUrl = importFromUrl;
exports.generateRegistryEntry = generateRegistryEntry;
exports.generateRegistryManifest = generateRegistryManifest;
exports.writeRegistryManifest = writeRegistryManifest;
exports.parseGitHubUrl = parseGitHubUrl;
exports.validateRemoteSkill = validateRemoteSkill;
var fs = require("fs");
var path = require("path");
var child_process_1 = require("child_process");
var skill_parser_1 = require("./skill-parser");
// =============================================================================
// CONSTANTS
// =============================================================================
var REGISTRY_URL = 'https://raw.githubusercontent.com/curiositech/some_claude_skills/main/registry.json';
var LOCAL_SKILLS_DIR = path.join(process.cwd(), '..', '.claude', 'skills');
// =============================================================================
// GITHUB FETCHING
// =============================================================================
function getGitHubToken() {
    if (process.env.GITHUB_TOKEN) {
        return process.env.GITHUB_TOKEN;
    }
    try {
        var token = (0, child_process_1.execSync)('gh auth token', { encoding: 'utf-8' }).trim();
        if (token)
            return token;
    }
    catch (_a) {
        // gh not available
    }
    return null;
}
function fetchFromGitHub(repo_1, path_1) {
    return __awaiter(this, arguments, void 0, function (repo, path, branch) {
        var token, url, headers, response, err_1;
        if (branch === void 0) { branch = 'main'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    token = getGitHubToken();
                    url = "https://api.github.com/repos/".concat(repo, "/contents/").concat(path, "?ref=").concat(branch);
                    headers = {
                        Accept: 'application/vnd.github.v3.raw',
                    };
                    if (token) {
                        headers.Authorization = "token ".concat(token);
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(url, { headers: headers })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        console.error("GitHub API error: ".concat(response.status));
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, response.text()];
                case 3: return [2 /*return*/, _a.sent()];
                case 4:
                    err_1 = _a.sent();
                    console.error('Error fetching from GitHub:', err_1);
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function fetchFromUrl(url) {
    return __awaiter(this, void 0, void 0, function () {
        var response, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch(url)];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        console.error("Fetch error: ".concat(response.status));
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, response.text()];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    err_2 = _a.sent();
                    console.error('Error fetching URL:', err_2);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// =============================================================================
// REGISTRY OPERATIONS
// =============================================================================
function fetchRegistry() {
    return __awaiter(this, void 0, void 0, function () {
        var content, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetchFromUrl(REGISTRY_URL)];
                case 1:
                    content = _a.sent();
                    if (!content)
                        return [2 /*return*/, null];
                    return [2 /*return*/, JSON.parse(content)];
                case 2:
                    err_3 = _a.sent();
                    console.error('Error fetching registry:', err_3);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function searchRegistry(query, options) {
    return __awaiter(this, void 0, void 0, function () {
        var registry, queryLower;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchRegistry()];
                case 1:
                    registry = _a.sent();
                    if (!registry)
                        return [2 /*return*/, []];
                    queryLower = query.toLowerCase();
                    return [2 /*return*/, registry.skills.filter(function (skill) {
                            var _a;
                            // Text search
                            var matchesQuery = skill.id.toLowerCase().includes(queryLower) ||
                                skill.title.toLowerCase().includes(queryLower) ||
                                skill.description.toLowerCase().includes(queryLower) ||
                                skill.tags.some(function (t) { return t.toLowerCase().includes(queryLower); });
                            // Category filter
                            var matchesCategory = !(options === null || options === void 0 ? void 0 : options.category) ||
                                skill.category === options.category;
                            // Tags filter
                            var matchesTags = !((_a = options === null || options === void 0 ? void 0 : options.tags) === null || _a === void 0 ? void 0 : _a.length) ||
                                options.tags.some(function (t) { return skill.tags.includes(t); });
                            return matchesQuery && matchesCategory && matchesTags;
                        })];
            }
        });
    });
}
// =============================================================================
// SKILL IMPORT
// =============================================================================
function importSkill(source) {
    return __awaiter(this, void 0, void 0, function () {
        var content, parsed, targetDir, skillPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    content = null;
                    if (!(source.type === 'github' && source.repo && source.path)) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetchFromGitHub(source.repo, source.path, source.branch)];
                case 1:
                    content = _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    if (!(source.type === 'url' && source.url)) return [3 /*break*/, 4];
                    return [4 /*yield*/, fetchFromUrl(source.url)];
                case 3:
                    content = _a.sent();
                    _a.label = 4;
                case 4:
                    if (!content) {
                        return [2 /*return*/, {
                                success: false,
                                skillId: '',
                                error: 'Could not fetch skill content',
                            }];
                    }
                    parsed = (0, skill_parser_1.parseSkillFile)(content, 'remote');
                    if (!parsed) {
                        return [2 /*return*/, {
                                success: false,
                                skillId: '',
                                error: 'Could not parse skill content',
                            }];
                    }
                    targetDir = path.join(LOCAL_SKILLS_DIR, parsed.id);
                    if (fs.existsSync(targetDir)) {
                        return [2 /*return*/, {
                                success: false,
                                skillId: parsed.id,
                                error: "Skill \"".concat(parsed.id, "\" already exists locally"),
                            }];
                    }
                    // Create skill directory and file
                    fs.mkdirSync(targetDir, { recursive: true });
                    skillPath = path.join(targetDir, 'SKILL.md');
                    fs.writeFileSync(skillPath, content, 'utf-8');
                    return [2 /*return*/, {
                            success: true,
                            skillId: parsed.id,
                            path: skillPath,
                        }];
            }
        });
    });
}
function importFromGitHub(repo_1, skillPath_1) {
    return __awaiter(this, arguments, void 0, function (repo, skillPath, branch) {
        if (branch === void 0) { branch = 'main'; }
        return __generator(this, function (_a) {
            return [2 /*return*/, importSkill({
                    type: 'github',
                    repo: repo,
                    path: skillPath,
                    branch: branch,
                })];
        });
    });
}
function importFromUrl(url) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, importSkill({
                    type: 'url',
                    url: url,
                })];
        });
    });
}
// =============================================================================
// SKILL EXPORT / PUBLISHING
// =============================================================================
function generateRegistryEntry(skill, repo) {
    return {
        id: skill.id,
        title: skill.title,
        description: skill.shortDescription,
        category: skill.category,
        tags: skill.tags,
        source: {
            type: 'github',
            repo: repo,
            path: ".claude/skills/".concat(skill.id, "/SKILL.md"),
            branch: 'main',
        },
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
    };
}
function generateRegistryManifest(skills, repo) {
    return {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        skills: skills.map(function (s) { return generateRegistryEntry(s, repo); }),
    };
}
function writeRegistryManifest(skills, outputPath, repo) {
    if (repo === void 0) { repo = 'curiositech/some_claude_skills'; }
    var manifest = generateRegistryManifest(skills, repo);
    fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf-8');
}
// =============================================================================
// UTILITIES
// =============================================================================
function parseGitHubUrl(url) {
    // Handle raw.githubusercontent.com URLs
    var rawMatch = url.match(/raw\.githubusercontent\.com\/([^/]+\/[^/]+)\/([^/]+)\/(.+)/);
    if (rawMatch) {
        return {
            repo: rawMatch[1],
            branch: rawMatch[2],
            path: rawMatch[3],
        };
    }
    // Handle github.com blob URLs
    var blobMatch = url.match(/github\.com\/([^/]+\/[^/]+)\/blob\/([^/]+)\/(.+)/);
    if (blobMatch) {
        return {
            repo: blobMatch[1],
            branch: blobMatch[2],
            path: blobMatch[3],
        };
    }
    return null;
}
function validateRemoteSkill(source) {
    return __awaiter(this, void 0, void 0, function () {
        var content, parsed;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    content = null;
                    if (!(source.type === 'github' && source.repo && source.path)) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetchFromGitHub(source.repo, source.path, source.branch)];
                case 1:
                    content = _a.sent();
                    return [3 /*break*/, 4];
                case 2:
                    if (!(source.type === 'url' && source.url)) return [3 /*break*/, 4];
                    return [4 /*yield*/, fetchFromUrl(source.url)];
                case 3:
                    content = _a.sent();
                    _a.label = 4;
                case 4:
                    if (!content) {
                        return [2 /*return*/, { valid: false, error: 'Could not fetch skill content' }];
                    }
                    parsed = (0, skill_parser_1.parseSkillFile)(content, 'remote');
                    if (!parsed) {
                        return [2 /*return*/, { valid: false, error: 'Invalid skill format' }];
                    }
                    return [2 /*return*/, { valid: true, skill: parsed }];
            }
        });
    });
}

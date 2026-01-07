#!/usr/bin/env tsx
"use strict";
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
var fs_1 = require("fs");
var path_1 = require("path");
var jszip_1 = require("jszip");
/**
 * Pre-generates skill folder zips at build time
 * This avoids GitHub API rate limits and CORS issues
 */
var SKILLS_DIR = path_1.default.join(__dirname, '../../.claude/skills');
var OUTPUT_DIR = path_1.default.join(__dirname, '../static/downloads/skills');
function generateSkillZips() {
    return __awaiter(this, void 0, void 0, function () {
        var skillDirs, skills, _i, skills_1, skill, skillId, skillPath, zipPath, zip, skillFolder, content, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔨 Generating skill zips...\n');
                    // Ensure output directory exists
                    return [4 /*yield*/, fs_1.promises.mkdir(OUTPUT_DIR, { recursive: true })];
                case 1:
                    // Ensure output directory exists
                    _a.sent();
                    return [4 /*yield*/, fs_1.promises.readdir(SKILLS_DIR, { withFileTypes: true })];
                case 2:
                    skillDirs = _a.sent();
                    skills = skillDirs.filter(function (dirent) { return dirent.isDirectory(); });
                    _i = 0, skills_1 = skills;
                    _a.label = 3;
                case 3:
                    if (!(_i < skills_1.length)) return [3 /*break*/, 10];
                    skill = skills_1[_i];
                    skillId = skill.name;
                    skillPath = path_1.default.join(SKILLS_DIR, skillId);
                    zipPath = path_1.default.join(OUTPUT_DIR, "".concat(skillId, ".zip"));
                    console.log("\uD83D\uDCE6 Creating ".concat(skillId, ".zip..."));
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 8, , 9]);
                    zip = new jszip_1.default();
                    skillFolder = zip.folder(skillId);
                    if (!skillFolder) {
                        throw new Error("Failed to create zip folder for ".concat(skillId));
                    }
                    // Recursively add files to zip
                    return [4 /*yield*/, addDirectoryToZip(skillPath, skillFolder, '')];
                case 5:
                    // Recursively add files to zip
                    _a.sent();
                    return [4 /*yield*/, zip.generateAsync({
                            type: 'nodebuffer',
                            compression: 'DEFLATE',
                            compressionOptions: { level: 9 }
                        })];
                case 6:
                    content = _a.sent();
                    return [4 /*yield*/, fs_1.promises.writeFile(zipPath, content)];
                case 7:
                    _a.sent();
                    console.log("   \u2713 Created ".concat(skillId, ".zip (").concat((content.length / 1024).toFixed(1), " KB)\n"));
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _a.sent();
                    console.error("   \u2717 Failed to create ".concat(skillId, ".zip:"), error_1);
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 3];
                case 10:
                    console.log('✅ Done generating skill zips!');
                    return [2 /*return*/];
            }
        });
    });
}
function addDirectoryToZip(dirPath, zipFolder, relativePath) {
    return __awaiter(this, void 0, void 0, function () {
        var entries, _i, entries_1, entry, fullPath, entryRelativePath, subFolder, fileContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs_1.promises.readdir(dirPath, { withFileTypes: true })];
                case 1:
                    entries = _a.sent();
                    _i = 0, entries_1 = entries;
                    _a.label = 2;
                case 2:
                    if (!(_i < entries_1.length)) return [3 /*break*/, 8];
                    entry = entries_1[_i];
                    fullPath = path_1.default.join(dirPath, entry.name);
                    entryRelativePath = path_1.default.join(relativePath, entry.name);
                    if (!entry.isDirectory()) return [3 /*break*/, 5];
                    // Skip .git and node_modules
                    if (entry.name === '.git' || entry.name === 'node_modules') {
                        return [3 /*break*/, 7];
                    }
                    subFolder = zipFolder.folder(entry.name);
                    if (!subFolder) return [3 /*break*/, 4];
                    return [4 /*yield*/, addDirectoryToZip(fullPath, subFolder, entryRelativePath)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [3 /*break*/, 7];
                case 5:
                    if (!entry.isFile()) return [3 /*break*/, 7];
                    return [4 /*yield*/, fs_1.promises.readFile(fullPath)];
                case 6:
                    fileContent = _a.sent();
                    zipFolder.file(entry.name, fileContent);
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// Run the script
generateSkillZips().catch(function (error) {
    console.error('Fatal error:', error);
    process.exit(1);
});

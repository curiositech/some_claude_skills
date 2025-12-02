"use strict";
/**
 * Hook to dynamically load skill folder data for the Win31FileManager
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
exports.skillHasContent = skillHasContent;
exports.getSkillFolderMeta = getSkillFolderMeta;
exports.useSkillFolderData = useSkillFolderData;
var react_1 = require("react");
var skillFolders_1 = require("../data/skillFolders");
/**
 * Check if a skill has content beyond just SKILL.md
 */
function skillHasContent(skillId) {
    var _a;
    var info = skillFolders_1.skillFolderIndex[skillId];
    return (_a = info === null || info === void 0 ? void 0 : info.hasContent) !== null && _a !== void 0 ? _a : false;
}
/**
 * Get skill folder metadata
 */
function getSkillFolderMeta(skillId) {
    var _a;
    return (_a = skillFolders_1.skillFolderIndex[skillId]) !== null && _a !== void 0 ? _a : null;
}
/**
 * Hook to load skill folder data
 */
function useSkillFolderData(skillId) {
    var _this = this;
    var _a, _b, _c;
    var _d = (0, react_1.useState)(null), folderData = _d[0], setFolderData = _d[1];
    var _e = (0, react_1.useState)(true), loading = _e[0], setLoading = _e[1];
    var _f = (0, react_1.useState)(null), error = _f[0], setError = _f[1];
    var meta = getSkillFolderMeta(skillId);
    var hasContent = (_a = meta === null || meta === void 0 ? void 0 : meta.hasContent) !== null && _a !== void 0 ? _a : false;
    (0, react_1.useEffect)(function () {
        // Reset state when skillId changes
        setFolderData(null);
        setLoading(true);
        setError(null);
        // If skill doesn't have content, skip loading
        if (!hasContent) {
            setLoading(false);
            return;
        }
        // Dynamically import the skill folder data
        var loadData = function () { return __awaiter(_this, void 0, void 0, function () {
            var data, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        return [4 /*yield*/, Promise.resolve("".concat("../data/skillFolders/".concat(skillId, ".json"))).then(function (s) { return require(s); })];
                    case 1:
                        data = _a.sent();
                        setFolderData(data.default || data);
                        setError(null);
                        return [3 /*break*/, 4];
                    case 2:
                        err_1 = _a.sent();
                        console.error("Error loading skill folder data for ".concat(skillId, ":"), err_1);
                        setError("Could not load folder data for ".concat(skillId));
                        setFolderData(null);
                        return [3 /*break*/, 4];
                    case 3:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        loadData();
    }, [skillId, hasContent]);
    return {
        folderData: folderData,
        loading: loading,
        error: error,
        hasContent: hasContent,
        fileCount: (_b = meta === null || meta === void 0 ? void 0 : meta.fileCount) !== null && _b !== void 0 ? _b : 0,
        folderCount: (_c = meta === null || meta === void 0 ? void 0 : meta.folderCount) !== null && _c !== void 0 ? _c : 0,
    };
}
exports.default = useSkillFolderData;

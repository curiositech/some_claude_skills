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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStarredSkills = useStarredSkills;
exports.shareSkill = shareSkill;
var react_1 = require("react");
var STORAGE_KEY = 'claude-skills-starred';
function useStarredSkills() {
    var _a = (0, react_1.useState)(new Set()), starred = _a[0], setStarred = _a[1];
    var _b = (0, react_1.useState)(false), isLoaded = _b[0], setIsLoaded = _b[1];
    // Load from localStorage on mount
    (0, react_1.useEffect)(function () {
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                var parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    setStarred(new Set(parsed));
                }
            }
        }
        catch (e) {
            console.warn('Failed to load starred skills from localStorage', e);
        }
        setIsLoaded(true);
    }, []);
    // Save to localStorage when starred changes
    (0, react_1.useEffect)(function () {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(__spreadArray([], starred, true)));
            }
            catch (e) {
                console.warn('Failed to save starred skills to localStorage', e);
            }
        }
    }, [starred, isLoaded]);
    var toggleStar = (0, react_1.useCallback)(function (skillId) {
        setStarred(function (prev) {
            var next = new Set(prev);
            if (next.has(skillId)) {
                next.delete(skillId);
            }
            else {
                next.add(skillId);
            }
            return next;
        });
    }, []);
    var isStarred = (0, react_1.useCallback)(function (skillId) {
        return starred.has(skillId);
    }, [starred]);
    var getStarredCount = (0, react_1.useCallback)(function () {
        return starred.size;
    }, [starred]);
    var getStarredIds = (0, react_1.useCallback)(function () {
        return __spreadArray([], starred, true);
    }, [starred]);
    return {
        starred: starred,
        toggleStar: toggleStar,
        isStarred: isStarred,
        getStarredCount: getStarredCount,
        getStarredIds: getStarredIds,
        isLoaded: isLoaded,
    };
}
// Utility function to share a skill
function shareSkill(skillId, skillTitle) {
    var url = "".concat(window.location.origin, "/docs/skills/").concat(skillId.replace(/-/g, '_'));
    // Try native share API first (mobile)
    if (navigator.share) {
        return navigator.share({
            title: "".concat(skillTitle, " - Claude Skill"),
            text: "Check out the ".concat(skillTitle, " skill for Claude Code!"),
            url: url,
        }).catch(function () {
            // Fall back to clipboard
            return copyToClipboard(url);
        });
    }
    // Fall back to clipboard
    return copyToClipboard(url);
}
function copyToClipboard(text) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1, textarea;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, navigator.clipboard.writeText(text)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    textarea = document.createElement('textarea');
                    textarea.value = text;
                    textarea.style.position = 'fixed';
                    textarea.style.left = '-9999px';
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}

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
exports.default = SkillQuickView;
var react_1 = require("react");
var InstallTabs_1 = require("./InstallTabs");
var useStarredSkills_1 = require("../hooks/useStarredSkills");
var downloadSkillZip_1 = require("@site/src/utils/downloadSkillZip");
var usePlausibleStats_1 = require("../hooks/usePlausibleStats");
var useBaseUrl_1 = require("@docusaurus/useBaseUrl");
var TagBadge_1 = require("./TagBadge");
function SkillQuickView(_a) {
    var _this = this;
    var skill = _a.skill, onClose = _a.onClose, _b = _a.isStarred, isStarred = _b === void 0 ? false : _b, onToggleStar = _a.onToggleStar;
    var _c = (0, react_1.useState)(false), shareToast = _c[0], setShareToast = _c[1];
    var _d = (0, react_1.useState)(false), isDownloading = _d[0], setIsDownloading = _d[1];
    var _e = (0, usePlausibleStats_1.useSkillStats)(skill.id), views = _e.views, statsLoading = _e.loading;
    var handleShare = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, useStarredSkills_1.shareSkill)(skill.id, skill.title)];
                case 1:
                    _a.sent();
                    setShareToast(true);
                    setTimeout(function () { return setShareToast(false); }, 2000);
                    return [2 /*return*/];
            }
        });
    }); };
    var handleDownloadZip = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDownloading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, (0, downloadSkillZip_1.downloadSkillZip)(skill.id, skill.title)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setIsDownloading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (<div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
        }} onClick={onClose}>
      <div style={{
            background: 'var(--win31-gray)',
            border: '4px solid var(--win31-black)',
            boxShadow: '12px 12px 0 rgba(0,0,0,0.5)',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
        }} onClick={function (e) { return e.stopPropagation(); }}>
        {/* Title Bar */}
        <div style={{
            background: 'linear-gradient(90deg, var(--win31-navy), var(--win31-blue))',
            padding: '8px 12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }}>
          <span style={{ color: 'white', fontWeight: 'bold', fontFamily: 'var(--font-code)' }}>
            {skill.title}
          </span>
          <button onClick={onClose} style={{
            background: 'var(--win31-gray)',
            border: '2px outset var(--win31-gray)',
            width: '24px',
            height: '24px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
        }}>
            X
          </button>
        </div>

        {/* Hero Image */}
        <div style={{ position: 'relative', paddingBottom: '45%', background: '#000' }}>
          <img src={(0, useBaseUrl_1.default)("/img/skills/".concat(skill.id, "-hero.png"))} alt={skill.title} style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
        }}/>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {/* Quick Stats */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '16px',
            flexWrap: 'wrap',
        }}>
            <div style={{
            background: 'var(--win31-yellow)',
            border: '1px solid var(--win31-black)',
            padding: '4px 12px',
            fontSize: '12px',
            fontFamily: 'var(--font-code)',
            color: '#000',
            fontWeight: 600,
        }}>
              {skill.category}
            </div>
            <div style={{
            background: '#e8ffe8',
            border: '1px solid #4a4',
            padding: '4px 12px',
            fontSize: '12px',
            fontFamily: 'var(--font-code)',
            color: '#060',
        }}>
              30 sec install
            </div>
            {!statsLoading && (<div style={{
                background: '#e8f4ff',
                border: '1px solid #48a',
                padding: '4px 12px',
                fontSize: '12px',
                fontFamily: 'var(--font-code)',
                color: '#036',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
            }}>
                <span>👁️</span>
                <span>{views.toLocaleString()} views</span>
              </div>)}
          </div>

          {/* Tags */}
          {skill.tags && skill.tags.length > 0 && (<div style={{ marginBottom: '16px' }}>
              <TagBadge_1.TagList tags={skill.tags} size="md"/>
            </div>)}

          {/* Description */}
          <p style={{
            fontSize: '14px',
            lineHeight: '1.6',
            color: '#333',
            marginBottom: '20px',
        }}>
            {skill.description}
          </p>

          {/* Install Tabs */}
          <div style={{ marginBottom: '20px' }}>
            <InstallTabs_1.default skillId={skill.id} skillName={skill.title} compact={true}/>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
        }}>
            {/* Star Button */}
            <button className="win31-push-button" style={{
            fontSize: '14px',
            padding: '12px 24px',
            background: isStarred ? 'var(--win31-yellow)' : 'var(--win31-gray)',
        }} onClick={function () { return onToggleStar === null || onToggleStar === void 0 ? void 0 : onToggleStar(skill.id); }}>
              {isStarred ? '★ Starred' : '☆ Add Star'}
            </button>

            {/* Share Button */}
            <button className="win31-push-button" style={{
            fontSize: '14px',
            padding: '12px 24px',
        }} onClick={handleShare}>
              {shareToast ? '✓ Link Copied!' : '⤴ Share'}
            </button>

            {/* Download Zip Button */}
            <button className="win31-push-button" style={{
            fontSize: '14px',
            padding: '12px 24px',
            cursor: isDownloading ? 'wait' : 'pointer',
            opacity: isDownloading ? 0.7 : 1,
        }} onClick={handleDownloadZip} disabled={isDownloading}>
              {isDownloading ? '⏳ Downloading...' : '📦 Download Zip'}
            </button>

            <a href={(0, useBaseUrl_1.default)(skill.path)} style={{ textDecoration: 'none' }}>
              <button className="win31-push-button win31-push-button-default" style={{
            fontSize: '14px',
            padding: '12px 24px',
        }}>
                View Full Documentation
              </button>
            </a>
            <a href="https://github.com/erichowens/some_claude_skills" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button className="win31-push-button" style={{
            fontSize: '14px',
            padding: '12px 24px',
        }}>
                View on GitHub
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>);
}

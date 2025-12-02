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
exports.default = SkillHeader;
var react_1 = require("react");
var InstallTabs_1 = require("./InstallTabs");
var TagBadge_1 = require("./TagBadge");
var downloadSkillZip_1 = require("@site/src/utils/downloadSkillZip");
var Win31FileManager_1 = require("./Win31FileManager");
var useSkillFolderData_1 = require("@site/src/hooks/useSkillFolderData");
require("../css/win31.css");
function SkillHeader(_a) {
    var _this = this;
    var skillName = _a.skillName, fileName = _a.fileName, description = _a.description, tags = _a.tags;
    var _b = (0, react_1.useState)(false), isExpanded = _b[0], setIsExpanded = _b[1];
    var _c = (0, react_1.useState)(true), isFileBrowserOpen = _c[0], setIsFileBrowserOpen = _c[1]; // Default open
    var _d = (0, react_1.useState)(false), isDownloading = _d[0], setIsDownloading = _d[1];
    // Convert fileName (underscore format) to skillId (hyphen format)
    var skillId = fileName.replace(/_/g, '-');
    var githubFolderUrl = "https://github.com/erichowens/some_claude_skills/tree/main/.claude/skills/".concat(skillId);
    // Load skill folder data
    var _e = (0, useSkillFolderData_1.useSkillFolderData)(skillId), folderData = _e.folderData, loading = _e.loading, hasContent = _e.hasContent, fileCount = _e.fileCount, folderCount = _e.folderCount;
    var handleDownloadZip = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsDownloading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, (0, downloadSkillZip_1.downloadSkillZip)(skillId, skillName)];
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
    return (<div style={{ marginBottom: '32px' }}>
      {/* Hero Image Card */}
      <div style={{
            marginBottom: '24px',
            background: '#000',
            border: '3px solid var(--win31-black)',
            overflow: 'hidden',
        }}>
        <img src={"/img/skills/".concat(skillId, "-hero.png")} alt={"".concat(skillName, " Hero")} style={{
            width: '100%',
            height: 'auto',
            display: 'block',
        }}/>
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (<div style={{ marginBottom: '20px' }}>
          <TagBadge_1.TagList tags={tags} size="md"/>
        </div>)}

      {/* Get This Skill Panel - Authentic Windows 3.1 Style */}
      <div className="win31-window" style={{
            marginBottom: '20px',
        }}>
        {/* Win31 Title Bar */}
        <div style={{
            background: 'var(--win31-navy)',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="win31-btn-3d win31-btn-3d--small" style={{ padding: '2px 6px', fontSize: '10px' }}>
              ─
            </div>
          </div>
          <span style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#fff',
            letterSpacing: '1px',
        }}>
            GET_SKILL.EXE
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div className="win31-btn-3d win31-btn-3d--small" style={{ padding: '2px 6px', fontSize: '10px' }}>
              ▲
            </div>
            <div className="win31-btn-3d win31-btn-3d--small" style={{ padding: '2px 6px', fontSize: '10px' }}>
              ▼
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{
            background: 'var(--win31-gray)',
            padding: '16px 20px',
        }}>
          {/* Download Options */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px',
        }}>
            {/* Download Skill Folder ZIP - Primary Action */}
            <button onClick={handleDownloadZip} disabled={isDownloading} className="win31-btn-3d" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '6px',
            padding: '14px 18px',
            cursor: isDownloading ? 'wait' : 'pointer',
            opacity: isDownloading ? 0.7 : 1,
            background: 'var(--win31-gray)',
            border: '2px solid var(--win31-black)',
            boxShadow: 'inset -2px -2px 0 var(--win31-dark-gray), inset 2px 2px 0 #fff, inset -3px -3px 0 var(--win31-black), inset 3px 3px 0 var(--win31-light-gray)',
        }}>
              <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-system)',
            fontSize: '14px',
            fontWeight: '700',
            color: 'var(--win31-black)',
        }}>
                <span style={{ fontSize: '18px' }}>
                  {isDownloading ? '⏳' : '📦'}
                </span>
                {isDownloading ? 'Downloading...' : 'Download Skill Folder'}
              </div>
              <div style={{
            fontFamily: 'var(--font-system)',
            fontSize: '11px',
            color: 'var(--win31-dark-gray)',
            lineHeight: '1.4',
        }}>
                {isDownloading
            ? 'Creating zip file...'
            : 'Complete skill folder with SKILL.md and all resources'}
              </div>
            </button>

            {/* View on GitHub - Secondary Action */}
            <a href={githubFolderUrl} target="_blank" rel="noopener noreferrer" className="win31-btn-3d" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '6px',
            textDecoration: 'none',
            padding: '14px 18px',
            background: 'var(--win31-gray)',
            boxShadow: 'inset -2px -2px 0 var(--win31-dark-gray), inset 2px 2px 0 #fff, inset -3px -3px 0 var(--win31-black), inset 3px 3px 0 var(--win31-light-gray)',
        }}>
              <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-system)',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--win31-black)',
        }}>
                <span style={{ fontSize: '18px' }}>🔗</span>
                Browse on GitHub
              </div>
              <div style={{
            fontFamily: 'var(--font-system)',
            fontSize: '11px',
            color: 'var(--win31-dark-gray)',
            lineHeight: '1.4',
        }}>
                View source code and explore the skill folder structure
              </div>
            </a>
          </div>
        </div>

        {/* Win31 Status Bar */}
        <div style={{
            background: 'var(--win31-gray)',
            borderTop: '2px solid var(--win31-dark-gray)',
            padding: '4px 8px',
            display: 'flex',
            gap: '4px',
        }}>
          <div style={{
            flex: 1,
            padding: '2px 8px',
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            color: 'var(--win31-black)',
            borderStyle: 'solid',
            borderWidth: '1px',
            borderColor: 'var(--win31-dark-gray) #fff #fff var(--win31-dark-gray)',
        }}>
            Ready to install
          </div>
          <div style={{
            padding: '2px 8px',
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            color: 'var(--win31-black)',
            borderStyle: 'solid',
            borderWidth: '1px',
            borderColor: 'var(--win31-dark-gray) #fff #fff var(--win31-dark-gray)',
        }}>
            MIT License
          </div>
        </div>
      </div>

      {/* Installation Instructions - Collapsible */}
      <div className="win31-panel win31-panel-inset" style={{
            background: 'var(--win31-yellow)',
            border: '3px solid var(--win31-black)',
            marginBottom: '24px',
        }}>
        <button onClick={function () { return setIsExpanded(!isExpanded); }} style={{
            width: '100%',
            padding: '16px 20px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            color: 'var(--win31-black)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
        }}>
          <span>📖 Installation Instructions (3 Easy Steps)</span>
          <span style={{ fontSize: '14px' }}>{isExpanded ? '▼' : '▶'}</span>
        </button>

        {isExpanded && (<div style={{ padding: '0 20px 20px 20px' }}>
            <div style={{
                fontFamily: 'var(--font-system)',
                fontSize: '13px',
                color: 'var(--win31-black)',
                lineHeight: '1.6',
                marginBottom: '16px',
            }}>
              {description}
            </div>

            {/* Tabbed Installation Instructions */}
            <InstallTabs_1.default skillId={skillId} skillName={skillName} compact={false}/>

            {/* Security Note - Win31 Group Box Style */}
            <div style={{
                marginTop: '16px',
                padding: '12px 14px 10px',
                background: 'var(--win31-gray)',
                border: '2px solid var(--win31-dark-gray)',
                position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '-8px',
                left: '12px',
                background: 'var(--win31-yellow)',
                padding: '0 6px',
                fontFamily: 'var(--font-pixel)',
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'var(--win31-black)',
            }}>
                ⚠ Security Note
              </div>
              <div style={{
                color: 'var(--win31-black)',
                fontSize: '11px',
                fontFamily: 'var(--font-system)',
                marginTop: '4px',
            }}>
                Skills execute code. Only install from trusted sources.
              </div>
            </div>
          </div>)}
      </div>

      {/* File Browser - Only show if skill has additional content */}
      {hasContent && (<div className="win31-panel" style={{
                background: 'var(--win31-gray)',
                border: '3px solid var(--win31-black)',
                marginBottom: '24px',
            }}>
          <button onClick={function () { return setIsFileBrowserOpen(!isFileBrowserOpen); }} style={{
                width: '100%',
                padding: '16px 20px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'var(--font-pixel)',
                fontSize: '10px',
                color: 'var(--win31-black)',
                letterSpacing: '2px',
                textTransform: 'uppercase',
            }}>
            <span>
              📁 Browse Skill Folder ({fileCount} file{fileCount !== 1 ? 's' : ''}, {folderCount} folder{folderCount !== 1 ? 's' : ''})
            </span>
            <span style={{ fontSize: '14px' }}>{isFileBrowserOpen ? '▼' : '▶'}</span>
          </button>

          {isFileBrowserOpen && (<div style={{ padding: '0 4px 4px 4px' }}>
              {loading ? (<div style={{
                        padding: '40px',
                        textAlign: 'center',
                        fontFamily: 'var(--font-system)',
                        color: 'var(--win31-dark-gray)',
                    }}>
                  ⏳ Loading skill folder contents...
                </div>) : folderData ? (<Win31FileManager_1.default title={"FILE_MGR.EXE - ".concat(skillId.toUpperCase().replace(/-/g, '_'))} rootFolder={folderData} defaultExpanded={[skillId]} height={450} showStatusBar={true}/>) : (<div style={{
                        padding: '40px',
                        textAlign: 'center',
                        fontFamily: 'var(--font-system)',
                        color: 'var(--win31-dark-gray)',
                    }}>
                  Could not load folder contents.{' '}
                  <a href={githubFolderUrl} target="_blank" rel="noopener noreferrer">
                    View on GitHub
                  </a>
                </div>)}
            </div>)}
        </div>)}
    </div>);
}

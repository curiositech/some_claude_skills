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
exports.default = InstallTabs;
var react_1 = require("react");
var tabs = [
    {
        id: 'claude-code',
        label: 'Claude Code',
        icon: 'terminal',
        color: 'var(--win31-lime)',
        borderColor: 'var(--win31-lime)',
        requirement: 'CLI tool',
    },
    {
        id: 'claude-web',
        label: 'Claude.ai',
        icon: 'web',
        color: 'var(--win31-bright-yellow)',
        borderColor: 'var(--win31-bright-yellow)',
        requirement: 'Pro/Max/Team',
    },
    {
        id: 'claude-desktop',
        label: 'Desktop App',
        icon: 'desktop',
        color: '#8B7355',
        borderColor: '#8B7355',
        requirement: 'Pro/Max/Team',
    },
];
function InstallTabs(_a) {
    var _this = this;
    var skillId = _a.skillId, skillName = _a.skillName, _b = _a.compact, compact = _b === void 0 ? false : _b;
    var _c = (0, react_1.useState)('claude-code'), activeTab = _c[0], setActiveTab = _c[1];
    var _d = (0, react_1.useState)(null), copiedItem = _d[0], setCopiedItem = _d[1];
    var copyToClipboard = function (text, label) { return __awaiter(_this, void 0, void 0, function () {
        var _a, textArea;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, navigator.clipboard.writeText(text)];
                case 1:
                    _b.sent();
                    setCopiedItem(label);
                    setTimeout(function () { return setCopiedItem(null); }, 2000);
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    textArea = document.createElement('textarea');
                    textArea.value = text;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    setCopiedItem(label);
                    setTimeout(function () { return setCopiedItem(null); }, 2000);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var activeTabConfig = tabs.find(function (t) { return t.id === activeTab; });
    var skillFileName = skillId.replace(/-/g, '_');
    var githubSkillUrl = "https://github.com/erichowens/some_claude_skills/blob/main/.claude/skills/".concat(skillId, "/SKILL.md");
    var rawSkillUrl = "https://raw.githubusercontent.com/erichowens/some_claude_skills/main/.claude/skills/".concat(skillId, "/SKILL.md");
    var githubFolderUrl = "https://github.com/erichowens/some_claude_skills/tree/main/.claude/skills/".concat(skillId);
    return (<div style={{
            background: '#000',
            border: "3px solid ".concat(activeTabConfig.borderColor),
            fontFamily: 'var(--font-code)',
        }}>
      {/* Tab Headers - ADHD friendly: large touch targets, clear active state */}
      <div style={{
            display: 'flex',
            borderBottom: '2px solid #333',
            background: '#111',
        }}>
        {tabs.map(function (tab) { return (<button key={tab.id} onClick={function () { return setActiveTab(tab.id); }} style={{
                flex: 1,
                padding: compact ? '10px 8px' : '14px 12px',
                border: 'none',
                background: activeTab === tab.id ? '#000' : 'transparent',
                color: activeTab === tab.id ? tab.color : '#666',
                cursor: 'pointer',
                fontFamily: 'var(--font-code)',
                fontSize: compact ? '11px' : '12px',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                borderBottom: activeTab === tab.id ? "3px solid ".concat(tab.color) : '3px solid transparent',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
            }}>
            <span style={{ fontSize: compact ? '14px' : '16px' }}>
              {tab.icon === 'terminal' && '>_'}
              {tab.icon === 'web' && 'www'}
              {tab.icon === 'desktop' && 'app'}
            </span>
            <span>{tab.label}</span>
            <span style={{
                fontSize: '9px',
                opacity: 0.7,
                color: activeTab === tab.id ? tab.color : '#555',
            }}>
              {tab.requirement}
            </span>
          </button>); })}
      </div>

      {/* Tab Content */}
      <div style={{ padding: compact ? '12px' : '16px' }}>
        {/* Claude Code Tab */}
        {activeTab === 'claude-code' && (<div>
            {/* Step 1: Add Marketplace */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
            }}>
                <span style={{
                background: 'var(--win31-lime)',
                color: '#000',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 'bold',
            }}>
                  STEP 1
                </span>
                <span style={{ color: 'var(--win31-lime)', fontSize: '12px' }}>
                  Add the marketplace (one time only)
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <code style={{
                flex: 1,
                background: '#111',
                padding: '10px 12px',
                border: '2px solid var(--win31-lime)',
                color: 'var(--win31-lime)',
                fontSize: '11px',
                display: 'block',
            }}>
                  /plugin marketplace add erichowens/some_claude_skills
                </code>
                <button onClick={function () { return copyToClipboard('/plugin marketplace add erichowens/some_claude_skills', 'marketplace'); }} style={{
                background: copiedItem === 'marketplace' ? 'var(--win31-lime)' : '#222',
                border: '2px solid var(--win31-lime)',
                color: copiedItem === 'marketplace' ? '#000' : 'var(--win31-lime)',
                padding: '8px 12px',
                cursor: 'pointer',
                fontFamily: 'var(--font-code)',
                fontSize: '11px',
                fontWeight: 'bold',
            }}>
                  {copiedItem === 'marketplace' ? 'OK!' : 'COPY'}
                </button>
              </div>
            </div>

            {/* Step 2: Install Skill */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
            }}>
                <span style={{
                background: 'var(--win31-bright-yellow)',
                color: '#000',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 'bold',
            }}>
                  STEP 2
                </span>
                <span style={{ color: 'var(--win31-bright-yellow)', fontSize: '12px' }}>
                  Install this skill
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <code style={{
                flex: 1,
                background: '#111',
                padding: '10px 12px',
                border: '2px solid var(--win31-bright-yellow)',
                color: 'var(--win31-bright-yellow)',
                fontSize: '11px',
                display: 'block',
            }}>
                  /plugin install {skillId}@some-claude-skills
                </code>
                <button onClick={function () { return copyToClipboard("/plugin install ".concat(skillId, "@some-claude-skills"), 'install'); }} style={{
                background: copiedItem === 'install' ? 'var(--win31-bright-yellow)' : '#222',
                border: '2px solid var(--win31-bright-yellow)',
                color: copiedItem === 'install' ? '#000' : 'var(--win31-bright-yellow)',
                padding: '8px 12px',
                cursor: 'pointer',
                fontFamily: 'var(--font-code)',
                fontSize: '11px',
                fontWeight: 'bold',
            }}>
                  {copiedItem === 'install' ? 'OK!' : 'COPY'}
                </button>
              </div>
            </div>

            {/* Usage */}
            <div style={{
                background: '#111',
                border: '1px solid #333',
                padding: '10px',
                fontSize: '10px',
                color: '#888',
            }}>
              <span style={{ color: 'var(--win31-lime)' }}>Done!</span> Claude will auto-invoke this skill, or use{' '}
              <code style={{ color: 'var(--win31-bright-yellow)', background: '#222', padding: '2px 4px' }}>
                /skill {skillFileName}
              </code>
            </div>

            {/* Attribution */}
            <div style={{
                marginTop: '12px',
                fontSize: '9px',
                color: '#555',
                textAlign: 'right',
            }}>
              Source:{' '}
              <a href="https://code.claude.com/docs/en/plugin-marketplaces" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--win31-teal)', textDecoration: 'underline' }}>
                Claude Code Docs
              </a>
            </div>
          </div>)}

        {/* Claude.ai (Web) Tab */}
        {activeTab === 'claude-web' && (<div>
            <div style={{
                background: '#1a1a0a',
                border: '1px solid var(--win31-bright-yellow)',
                padding: '8px 10px',
                marginBottom: '12px',
                fontSize: '10px',
                color: 'var(--win31-bright-yellow)',
            }}>
              Requires Claude Pro, Max, Team, or Enterprise plan
            </div>

            {/* Step 1 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
            }}>
                <span style={{
                background: 'var(--win31-bright-yellow)',
                color: '#000',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 'bold',
            }}>
                  1
                </span>
                <span style={{ color: 'var(--win31-bright-yellow)', fontSize: '11px' }}>
                  Go to{' '}
                  <a href="https://claude.ai/projects" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--win31-lime)', textDecoration: 'underline' }}>
                    claude.ai/projects
                  </a>
                  {' '}and click <strong style={{ color: '#fff' }}>+ New Project</strong>
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
            }}>
                <span style={{
                background: 'var(--win31-bright-yellow)',
                color: '#000',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 'bold',
            }}>
                  2
                </span>
                <span style={{ color: 'var(--win31-bright-yellow)', fontSize: '11px' }}>
                  Name your project (e.g., "{skillName}")
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
            }}>
                <span style={{
                background: 'var(--win31-bright-yellow)',
                color: '#000',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 'bold',
            }}>
                  3
                </span>
                <span style={{ color: 'var(--win31-bright-yellow)', fontSize: '11px' }}>
                  Click <strong style={{ color: '#fff' }}>Set project instructions</strong>
                </span>
              </div>
            </div>

            {/* Step 4 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
            }}>
                <span style={{
                background: 'var(--win31-bright-yellow)',
                color: '#000',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 'bold',
            }}>
                  4
                </span>
                <span style={{ color: 'var(--win31-bright-yellow)', fontSize: '11px' }}>
                  Copy & paste the skill content:
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a href={githubSkillUrl} target="_blank" rel="noopener noreferrer" style={{
                flex: 1,
                minWidth: '120px',
                background: '#111',
                border: '2px solid var(--win31-lime)',
                color: 'var(--win31-lime)',
                padding: '10px 12px',
                fontSize: '11px',
                textDecoration: 'none',
                textAlign: 'center',
                fontFamily: 'var(--font-code)',
            }}>
                  View on GitHub
                </a>
                <a href={rawSkillUrl} target="_blank" rel="noopener noreferrer" style={{
                flex: 1,
                minWidth: '120px',
                background: '#111',
                border: '2px solid var(--win31-teal)',
                color: 'var(--win31-teal)',
                padding: '10px 12px',
                fontSize: '11px',
                textDecoration: 'none',
                textAlign: 'center',
                fontFamily: 'var(--font-code)',
            }}>
                  Raw Text (Copy All)
                </a>
              </div>
            </div>

            {/* Optional: Supporting Files */}
            <div style={{
                marginTop: '12px',
                padding: '10px',
                background: '#1a1a0a',
                border: '1px solid #333',
            }}>
              <div style={{
                fontSize: '10px',
                color: '#888',
                marginBottom: '6px',
            }}>
                📦 Optional: This skill includes validation scripts and reference docs
              </div>
              <a href={githubFolderUrl} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-block',
                background: '#111',
                border: '2px solid #555',
                color: '#aaa',
                padding: '6px 10px',
                fontSize: '10px',
                textDecoration: 'none',
                fontFamily: 'var(--font-code)',
            }}>
                Browse Full Skill Package →
              </a>
            </div>

            {/* Attribution */}
            <div style={{
                marginTop: '12px',
                fontSize: '9px',
                color: '#555',
                textAlign: 'right',
            }}>
              Source:{' '}
              <a href="https://support.anthropic.com/en/articles/9519177-how-can-i-create-and-manage-projects" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--win31-teal)', textDecoration: 'underline' }}>
                Claude Help Center
              </a>
            </div>
          </div>)}

        {/* Claude Desktop Tab */}
        {activeTab === 'claude-desktop' && (<div>
            <div style={{
                background: '#1a1a0a',
                border: '1px solid #8B7355',
                padding: '8px 10px',
                marginBottom: '12px',
                fontSize: '10px',
                color: '#8B7355',
            }}>
              Requires Claude Pro, Max, Team, or Enterprise plan
            </div>

            {/* Step 1 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
            }}>
                <span style={{
                background: '#8B7355',
                color: '#fff',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 'bold',
            }}>
                  1
                </span>
                <span style={{ color: '#8B7355', fontSize: '11px' }}>
                  Open Claude Desktop and go to <strong style={{ color: '#fff' }}>Settings</strong> → <strong style={{ color: '#fff' }}>Capabilities</strong>
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
            }}>
                <span style={{
                background: '#8B7355',
                color: '#fff',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 'bold',
            }}>
                  2
                </span>
                <span style={{ color: '#8B7355', fontSize: '11px' }}>
                  Enable <strong style={{ color: '#fff' }}>"Code execution and file creation"</strong>
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
            }}>
                <span style={{
                background: '#8B7355',
                color: '#fff',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 'bold',
            }}>
                  3
                </span>
                <span style={{ color: '#8B7355', fontSize: '11px' }}>
                  Scroll down to the <strong style={{ color: '#fff' }}>Skills</strong> section
                </span>
              </div>
            </div>

            {/* Step 4 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
            }}>
                <span style={{
                background: '#8B7355',
                color: '#fff',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 'bold',
            }}>
                  4
                </span>
                <span style={{ color: '#8B7355', fontSize: '11px' }}>
                  Click <strong style={{ color: '#fff' }}>"Upload skill"</strong> button
                </span>
              </div>
            </div>

            {/* Step 5 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
            }}>
                <span style={{
                background: '#8B7355',
                color: '#fff',
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: 'bold',
            }}>
                  5
                </span>
                <span style={{ color: '#8B7355', fontSize: '11px' }}>
                  Upload the skill ZIP file you downloaded from the{' '}
                  <strong style={{ color: 'var(--win31-teal)' }}>"Get This Skill"</strong>{' '}
                  panel above
                </span>
              </div>
            </div>

            {/* ZIP Requirements */}
            <div style={{
                marginTop: '12px',
                padding: '10px',
                background: '#0a1a1a',
                border: '1px solid #333',
            }}>
              <div style={{
                fontSize: '10px',
                color: '#888',
                marginBottom: '6px',
                fontWeight: 'bold',
            }}>
                📋 ZIP File Requirements:
              </div>
              <div style={{
                fontSize: '9px',
                color: '#666',
                lineHeight: '1.4',
            }}>
                • Must contain a folder named <code style={{ color: '#8B7355' }}>{skillId}</code><br />
                • Folder must contain <code style={{ color: '#8B7355' }}>SKILL.md</code> file<br />
                • Skill name in SKILL.md must match folder name
              </div>
            </div>

            {/* Attribution */}
            <div style={{
                marginTop: '12px',
                fontSize: '9px',
                color: '#555',
                textAlign: 'right',
            }}>
              Source:{' '}
              <a href="https://support.claude.com/en/articles/12512180-using-skills-in-claude" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--win31-teal)', textDecoration: 'underline' }}>
                Using Skills in Claude
              </a>
            </div>
          </div>)}
      </div>
    </div>);
}

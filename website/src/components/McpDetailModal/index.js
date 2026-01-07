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
exports.default = McpDetailModal;
var react_1 = require("react");
var Link_1 = require("@docusaurus/Link");
var mcp_1 = require("../../types/mcp");
var styles_module_css_1 = require("./styles.module.css");
function McpDetailModal(_a) {
    var _this = this;
    var mcp = _a.mcp, onClose = _a.onClose;
    var _b = (0, react_1.useState)(false), copied = _b[0], setCopied = _b[1];
    var _c = (0, react_1.useState)('overview'), activeTab = _c[0], setActiveTab = _c[1];
    var statusConfig = mcp_1.MCP_STATUS_CONFIG[mcp.status];
    // Close on escape key
    (0, react_1.useEffect)(function () {
        var handleEscape = function (e) {
            if (e.key === 'Escape')
                onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return function () { return window.removeEventListener('keydown', handleEscape); };
    }, [onClose]);
    // Prevent body scroll when modal is open
    (0, react_1.useEffect)(function () {
        document.body.style.overflow = 'hidden';
        return function () {
            document.body.style.overflow = 'unset';
        };
    }, []);
    // Generate the JSON config for settings.json
    var generateSettingsJson = function () {
        var _a;
        var config = {
            command: mcp.installConfig.command,
        };
        if (mcp.installConfig.args) {
            config.args = mcp.installConfig.args;
        }
        if (mcp.installConfig.env) {
            config.env = mcp.installConfig.env;
        }
        return JSON.stringify((_a = {}, _a[mcp.id] = config, _a), null, 2);
    };
    var handleCopyConfig = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, navigator.clipboard.writeText(generateSettingsJson())];
                case 1:
                    _a.sent();
                    setCopied(true);
                    setTimeout(function () { return setCopied(false); }, 2000);
                    return [2 /*return*/];
            }
        });
    }); };
    return (<div className={styles_module_css_1.default.overlay} onClick={onClose}>
      <div className={styles_module_css_1.default.modal} onClick={function (e) { return e.stopPropagation(); }}>
        {/* Title Bar - Windows 3.1 Style */}
        <div className={styles_module_css_1.default.titleBar}>
          <div className={styles_module_css_1.default.titleLeft}>
            <span className={styles_module_css_1.default.icon}>{mcp.icon || '🔌'}</span>
            <span className={styles_module_css_1.default.titleText}>{mcp.name.toUpperCase()}.EXE</span>
          </div>
          <div className={styles_module_css_1.default.titleButtons}>
            <button className={styles_module_css_1.default.titleBtn} title="Minimize">_</button>
            <button className={styles_module_css_1.default.titleBtn} title="Maximize">□</button>
            <button className={styles_module_css_1.default.titleBtnClose} onClick={onClose} title="Close">✕</button>
          </div>
        </div>

        {/* Big Install CTA Section */}
        <div className={styles_module_css_1.default.installBanner}>
          <div className={styles_module_css_1.default.installLeft}>
            <h2 className={styles_module_css_1.default.installTitle}>🚀 Add to Claude Code</h2>
            <p className={styles_module_css_1.default.installSubtitle}>
              Copy this config to your <code>~/.claude/settings.json</code>
            </p>
            {mcp.installNotes && (<p className={styles_module_css_1.default.installNote}>⚠️ {mcp.installNotes}</p>)}
          </div>
          <div className={styles_module_css_1.default.installRight}>
            <div className={styles_module_css_1.default.installConfig}>
              <pre className={styles_module_css_1.default.configCode}>{generateSettingsJson()}</pre>
              <button className={styles_module_css_1.default.copyBtn} onClick={handleCopyConfig}>
                {copied ? '✓ Copied!' : '📋 Copy Config'}
              </button>
            </div>
            <div className={styles_module_css_1.default.installLinks}>
              <a href={mcp.githubUrl} target="_blank" rel="noopener noreferrer" className={styles_module_css_1.default.installLink}>
                📦 View on GitHub
              </a>
              {mcp.docsUrl && (<Link_1.default to={mcp.docsUrl} className={styles_module_css_1.default.installLink}>
                  📖 Full Documentation
                </Link_1.default>)}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className={styles_module_css_1.default.content}>
          {/* Left Column - Hero + Stickers */}
          <div className={styles_module_css_1.default.leftColumn}>
            {/* Hero Image */}
            {mcp.heroImage && (<div className={styles_module_css_1.default.heroContainer}>
                <img src={mcp.heroImage} alt={mcp.name} className={styles_module_css_1.default.heroImage}/>
              </div>)}

            {/* Colorful Stickers */}
            <div className={styles_module_css_1.default.stickers}>
              {mcp.badge === 'FEATURED' && (<div className={"".concat(styles_module_css_1.default.sticker, " ").concat(styles_module_css_1.default.stickerFeatured)}>
                  <span>★</span> FEATURED
                </div>)}
              {mcp.badge === 'NEW' && (<div className={"".concat(styles_module_css_1.default.sticker, " ").concat(styles_module_css_1.default.stickerNew)}>
                  🆕 NEW!
                </div>)}
              <div className={"".concat(styles_module_css_1.default.sticker, " ").concat(styles_module_css_1.default.stickerStatus)} style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
                {statusConfig.label}
              </div>
              <div className={"".concat(styles_module_css_1.default.sticker, " ").concat(styles_module_css_1.default.stickerCategory)}>
                📂 {mcp.category}
              </div>
              <div className={"".concat(styles_module_css_1.default.sticker, " ").concat(styles_module_css_1.default.stickerTools)}>
                🔧 {mcp.tools.length} Tools
              </div>
              {mcp.version && (<div className={"".concat(styles_module_css_1.default.sticker, " ").concat(styles_module_css_1.default.stickerVersion)}>
                  v{mcp.version}
                </div>)}
            </div>

            {/* Quick Facts */}
            <div className={styles_module_css_1.default.quickFacts}>
              <h3 className="win31-font">Quick Facts</h3>
              <ul>
                <li><strong>Author:</strong> {mcp.author}</li>
                {mcp.lastUpdated && <li><strong>Updated:</strong> {mcp.lastUpdated}</li>}
                {mcp.requirements && mcp.requirements.length > 0 && (<li><strong>Requires:</strong> {mcp.requirements.join(', ')}</li>)}
              </ul>
            </div>
          </div>

          {/* Right Column - Tabs + Details */}
          <div className={styles_module_css_1.default.rightColumn}>
            {/* Tab Navigation */}
            <div className={styles_module_css_1.default.tabs}>
              <button className={"".concat(styles_module_css_1.default.tab, " ").concat(activeTab === 'overview' ? styles_module_css_1.default.tabActive : '')} onClick={function () { return setActiveTab('overview'); }}>
                Overview
              </button>
              <button className={"".concat(styles_module_css_1.default.tab, " ").concat(activeTab === 'tools' ? styles_module_css_1.default.tabActive : '')} onClick={function () { return setActiveTab('tools'); }}>
                Tools ({mcp.tools.length})
              </button>
              <button className={"".concat(styles_module_css_1.default.tab, " ").concat(activeTab === 'examples' ? styles_module_css_1.default.tabActive : '')} onClick={function () { return setActiveTab('examples'); }}>
                Examples
              </button>
            </div>

            {/* Tab Content */}
            <div className={styles_module_css_1.default.tabContent}>
              {activeTab === 'overview' && (<div className={styles_module_css_1.default.overview}>
                  <h3 className="win31-font">{mcp.name}</h3>
                  <p className={styles_module_css_1.default.description}>{mcp.description}</p>

                  {mcp.longDescription && (<div className={styles_module_css_1.default.longDescription}>
                      {mcp.longDescription.split('\n\n').map(function (para, idx) { return (<p key={idx}>{para}</p>); })}
                    </div>)}

                  {/* Feature Highlights */}
                  {mcp.features && mcp.features.length > 0 && (<div className={styles_module_css_1.default.features}>
                      <h4>✨ Key Features</h4>
                      <ul>
                        {mcp.features.map(function (feature, idx) { return (<li key={idx}>{feature}</li>); })}
                      </ul>
                    </div>)}
                </div>)}

              {activeTab === 'tools' && (<div className={styles_module_css_1.default.toolsList}>
                  {mcp.tools.map(function (tool, idx) { return (<div key={idx} className={styles_module_css_1.default.toolCard}>
                      <div className={styles_module_css_1.default.toolHeader}>
                        <code className={styles_module_css_1.default.toolName}>{tool.name}</code>
                      </div>
                      <p className={styles_module_css_1.default.toolDescription}>{tool.description}</p>
                    </div>); })}
                </div>)}

              {activeTab === 'examples' && (<div className={styles_module_css_1.default.examples}>
                  {mcp.examples && mcp.examples.length > 0 ? (mcp.examples.map(function (example, idx) { return (<div key={idx} className={styles_module_css_1.default.exampleCard}>
                        <h4 className={styles_module_css_1.default.exampleTitle}>{example.title}</h4>
                        <p className={styles_module_css_1.default.exampleDescription}>{example.description}</p>
                        {example.prompt && (<div className={styles_module_css_1.default.examplePrompt}>
                            <span className={styles_module_css_1.default.promptLabel}>Try this prompt:</span>
                            <code>{example.prompt}</code>
                          </div>)}
                      </div>); })) : (<div className={styles_module_css_1.default.noExamples}>
                      <p>📝 Example usage coming soon!</p>
                      <p>Check the <Link_1.default to={mcp.docsUrl || mcp.githubUrl}>documentation</Link_1.default> for usage patterns.</p>
                    </div>)}
                </div>)}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className={styles_module_css_1.default.statusBar}>
          <div className={styles_module_css_1.default.statusPanel}>
            Ready
          </div>
          <div className={styles_module_css_1.default.statusPanel}>
            {mcp.tools.length} tools available
          </div>
          <div className={styles_module_css_1.default.statusPanel}>
            Press ESC to close
          </div>
        </div>
      </div>
    </div>);
}

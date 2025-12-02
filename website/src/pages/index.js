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
exports.default = Home;
var react_1 = require("react");
var Layout_1 = require("@theme/Layout");
var Head_1 = require("@docusaurus/Head");
var useDocusaurusContext_1 = require("@docusaurus/useDocusaurusContext");
var SkillQuickView_1 = require("../components/SkillQuickView");
var KonamiEasterEgg_1 = require("../components/KonamiEasterEgg");
var skills_1 = require("../data/skills");
var useStarredSkills_1 = require("../hooks/useStarredSkills");
var useKonamiCode_1 = require("../hooks/useKonamiCode");
var usePlausibleTracking_1 = require("../hooks/usePlausibleTracking");
require("../css/win31.css");
require("../css/skills-gallery.css");
function Home() {
    var _this = this;
    var siteConfig = (0, useDocusaurusContext_1.default)().siteConfig;
    var _a = (0, react_1.useState)(null), selectedSkill = _a[0], setSelectedSkill = _a[1];
    var _b = (0, react_1.useState)(null), copied = _b[0], setCopied = _b[1];
    var _c = (0, react_1.useState)(false), skillClicked = _c[0], setSkillClicked = _c[1];
    var _d = (0, useStarredSkills_1.useStarredSkills)(), toggleStar = _d.toggleStar, isStarred = _d.isStarred, getStarredCount = _d.getStarredCount;
    var _e = (0, useKonamiCode_1.useKonamiCode)(), triggered = _e.triggered, easterEgg = _e.easterEgg;
    // Analytics tracking
    var track = (0, usePlausibleTracking_1.usePlausibleTracking)().track;
    var trackSkillView = (0, usePlausibleTracking_1.useSkillNavigationTracking)().trackSkillView;
    (0, usePlausibleTracking_1.useTimeTracking)('homepage');
    (0, usePlausibleTracking_1.useScrollTracking)('homepage');
    // Last 10 newly added skills
    var newSkills = new Set([
        'bot-developer',
        'career-biographer',
        'clip-aware-embeddings',
        'competitive-cartographer',
        'design-archivist',
        'interior-design-expert',
        'jungian-psychologist',
        'personal-finance-coach',
        'photo-composition-critic',
        'skill-coach',
    ]);
    var handleSkillClick = function (skill, source) {
        if (source === void 0) { source = 'marquee'; }
        setSkillClicked(true);
        setSelectedSkill(skill);
        trackSkillView(skill.id, source);
        track('Skill Clicked', {
            skill: skill.id,
            source: source,
        });
    };
    var copyToClipboard = (0, react_1.useCallback)(function (text, id) {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(function () { return setCopied(null); }, 2000);
        // Track copy events
        if (id === 'install') {
            track('Install Command Copied', { method: 'git-clone' });
        }
        else if (id === 'marketplace') {
            track('Install Command Copied', { method: 'marketplace' });
        }
    }, [track]);
    var shareToDesktop = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var url, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = window.location.href;
                    if (!navigator.share) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, navigator.share({
                            title: 'Some Neat Claude Skills',
                            text: 'Check out this collection of Claude Code skills!',
                            url: url,
                        })];
                case 2:
                    _a.sent();
                    track('Share to Desktop', { method: 'native' });
                    return [2 /*return*/];
                case 3:
                    err_1 = _a.sent();
                    return [3 /*break*/, 4];
                case 4:
                    // Fallback to copy
                    copyToClipboard(url, 'share');
                    track('Share to Desktop', { method: 'copy' });
                    return [2 /*return*/];
            }
        });
    }); }, [copyToClipboard, track]);
    var installCommand = "git clone https://github.com/erichowens/some_claude_skills.git\ncp -r some_claude_skills/.claude/skills/* ~/.claude/skills/";
    // JSON-LD structured data for SEO
    var jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: "Erich's Best Claude Skills",
        description: "".concat(skills_1.ALL_SKILLS.length, "+ production-ready AI skills for Claude Code. Expert agents that encode real domain expertise for ML, computer vision, audio, psychology, and developer tools."),
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Cross-platform',
        url: 'https://someclaudeskills.com',
        author: {
            '@type': 'Person',
            name: 'Erich Owens',
            url: 'https://linkedin.com/in/erich-owens-01a38446/',
            jobTitle: 'ML Engineer',
            worksFor: {
                '@type': 'Organization',
                name: 'Independent',
            },
        },
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
        },
        license: 'https://opensource.org/licenses/MIT',
        codeRepository: 'https://github.com/erichowens/some_claude_skills',
        programmingLanguage: ['TypeScript', 'Markdown'],
        keywords: [
            'Claude Code',
            'AI skills',
            'Claude skills',
            'AI agents',
            'prompt engineering',
            'machine learning',
            'computer vision',
            'developer tools',
        ],
    };
    var organizationJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: "Erich's Best Claude Skills",
        url: 'https://someclaudeskills.com',
        logo: 'https://someclaudeskills.com/img/logo.svg',
        sameAs: [
            'https://github.com/erichowens/some_claude_skills',
            'https://linkedin.com/in/erich-owens-01a38446/',
        ],
    };
    return (<Layout_1.default title={siteConfig.title} description={"".concat(skills_1.ALL_SKILLS.length, "+ production-ready AI skills for Claude Code. Expert agents for ML, computer vision, audio, psychology, and developer tools.")}>
      <Head_1.default>
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(organizationJsonLd)}
        </script>
        <meta name="keywords" content="Claude Code, AI skills, Claude skills, AI agents, prompt engineering, machine learning, computer vision, developer tools, Anthropic Claude"/>
        <link rel="canonical" href="https://someclaudeskills.com/"/>
      </Head_1.default>
      <div className="skills-page-bg">
        <div className="skills-container skills-container--wide">
          {/* ═══════════════════════════════════════════════════════════════════
            INSTALL HERO
            ═══════════════════════════════════════════════════════════════════ */}
          <div className="win31-window install-hero install-hero--full">
              <div className="win31-titlebar">
                <div className="win31-titlebar__left">
                  <div className="win31-btn-3d win31-btn-3d--small">─</div>
                </div>
                <span className="win31-title-text">README.TXT</span>
                <div className="win31-titlebar__right">
                  <div className="win31-btn-3d win31-btn-3d--small">▲</div>
                  <div className="win31-btn-3d win31-btn-3d--small">▼</div>
                </div>
              </div>
              <div className="install-hero__content">
                <h1 className="install-hero__main-title">Make Claude an Expert at Anything</h1>
                <p className="install-hero__subtitle" style={{
            fontSize: '16px',
            color: '#666',
            marginTop: '-8px',
            marginBottom: '16px',
            fontStyle: 'italic'
        }}>
                  {skills_1.ALL_SKILLS.length} free, open-source skills for Claude Code
                </p>

                {/* Two-column layout: explainer left, install right */}
                <div style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
        }}>
                  {/* Left column: explainer text */}
                  <div style={{ flex: '1 1 300px', minWidth: '280px' }}>
                    <p className="install-hero__exposition" style={{ position: 'relative', marginTop: 0 }}>
                      Claude Code is an AI assistant made by Anthropic. It can read your files, run commands, and write code directly on your computer. Skills are instruction files that give Claude deep expertise in specific areas. Think of it as having a senior developer on retainer who can now selectively go get a master's degree in some new topic.
                    </p>

                    <p className="install-hero__exposition" style={{ position: 'relative' }}>
                      This collection includes skills for <strong>ML engineers</strong> (computer vision, drone systems), <strong>designers</strong> (typography, color theory, UI), <strong>founders</strong> (career storytelling, competitive analysis), and <strong>personal growth</strong> (ADHD coaching, Jungian psychology). Each one was built for real projects I've worked on.
                    </p>

                    <div className="install-hero__badges">
                      <span className="install-hero__badge install-hero__badge--yellow">{skills_1.ALL_SKILLS.length} Skills</span>
                      <span className="install-hero__badge install-hero__badge--lime">Open Source</span>
                      <span className="install-hero__badge install-hero__badge--teal">MIT License</span>
                    </div>
                  </div>

                  {/* Right column: install box */}
                  <div style={{ flex: '1 1 340px', minWidth: '300px' }}>
                    {/* PRIMARY: Marketplace Install */}
                    <div style={{
            background: 'linear-gradient(135deg, #0a2a0a 0%, #001a00 100%)',
            border: '3px solid var(--win31-lime)',
            padding: '16px',
            marginBottom: '12px',
            position: 'relative',
        }}>
                      {/* "Recommended" ribbon */}
                      <div style={{
            position: 'absolute',
            top: '-1px',
            right: '16px',
            background: 'var(--win31-lime)',
            color: '#000',
            padding: '3px 10px',
            fontSize: '9px',
            fontWeight: 'bold',
            fontFamily: 'var(--font-code)',
        }}>
                        RECOMMENDED
                      </div>

                      <div style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: 'var(--win31-lime)',
            marginBottom: '10px',
            fontFamily: 'var(--font-code)',
        }}>
                        {'>'}_ Claude Code Marketplace
                      </div>

                      {/* Step 1 */}
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '4px',
        }}>
                          <span style={{
            background: 'var(--win31-lime)',
            color: '#000',
            padding: '2px 6px',
            fontSize: '9px',
            fontWeight: 'bold',
            fontFamily: 'var(--font-code)',
        }}>
                            STEP 1
                          </span>
                          <span style={{ color: 'var(--win31-lime)', fontSize: '11px', fontFamily: 'var(--font-code)' }}>
                            Add the marketplace (one time)
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <code style={{
            flex: 1,
            background: '#000',
            padding: '8px 10px',
            border: '2px solid var(--win31-lime)',
            color: 'var(--win31-lime)',
            fontSize: '11px',
            fontFamily: 'var(--font-code)',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        }}>
                            /plugin marketplace add erichowens/some_claude_skills
                          </code>
                          <button className="win31-btn-3d" style={{
            background: copied === 'marketplace' ? 'var(--win31-lime)' : 'var(--win31-gray)',
            color: copied === 'marketplace' ? '#000' : 'inherit',
            fontWeight: 'bold',
            fontSize: '11px',
            padding: '6px 10px',
        }} onClick={function () { return copyToClipboard('/plugin marketplace add erichowens/some_claude_skills', 'marketplace'); }}>
                            {copied === 'marketplace' ? '✓' : 'COPY'}
                          </button>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div>
                        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '4px',
        }}>
                          <span style={{
            background: 'var(--win31-bright-yellow)',
            color: '#000',
            padding: '2px 6px',
            fontSize: '9px',
            fontWeight: 'bold',
            fontFamily: 'var(--font-code)',
        }}>
                            STEP 2
                          </span>
                          <span style={{ color: 'var(--win31-bright-yellow)', fontSize: '11px', fontFamily: 'var(--font-code)' }}>
                            Install any skill
                          </span>
                        </div>
                        <code style={{
            background: '#000',
            padding: '8px 10px',
            border: '2px solid var(--win31-bright-yellow)',
            color: 'var(--win31-bright-yellow)',
            fontSize: '11px',
            fontFamily: 'var(--font-code)',
            display: 'block',
        }}>
                          /plugin install skill-name@some-claude-skills
                        </code>
                      </div>

                      <div style={{
            marginTop: '10px',
            fontSize: '10px',
            color: '#888',
            fontFamily: 'var(--font-code)',
        }}>
                        Browse skills below and click "Get" for exact install commands
                      </div>
                    </div>

                    {/* SECONDARY: Git Clone (collapsed toggle) */}
                    <details style={{
            background: 'var(--win31-gray)',
            border: '2px solid #808080',
        }}>
                      <summary style={{
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '11px',
            fontFamily: 'var(--font-code)',
            fontWeight: 'bold',
            color: '#333',
            listStyle: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
        }}>
                        <span style={{ fontSize: '9px' }}>▶</span>
                        Alternative: Clone all {skills_1.ALL_SKILLS.length} skills (git)
                      </summary>
                      <div style={{ padding: '10px 12px', paddingTop: 0 }}>
                        <div className="install-hero__code-block" style={{ position: 'relative', marginTop: '6px' }}>
                          <pre className="install-hero__code" style={{ fontSize: '10px', padding: '8px' }}>{installCommand}</pre>
                          <button className={"win31-btn-3d install-hero__copy-btn ".concat(copied === 'install' ? 'install-hero__copy-btn--copied' : '')} style={{ fontSize: '10px', padding: '4px 8px' }} onClick={function () { return copyToClipboard(installCommand, 'install'); }}>
                            {copied === 'install' ? '✓ COPIED!' : 'COPY'}
                          </button>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
            HORIZONTAL SKILLS MARQUEE
            ═══════════════════════════════════════════════════════════════════ */}
          <div className="win31-window marquee-window-horizontal" style={{ position: 'relative' }}>
            <div className="win31-titlebar" style={{ position: 'relative' }}>
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">─</div>
              </div>
              <span className="win31-title-text">SKILLS.DLL - Click any skill to install</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">◄</div>
                <div className="win31-btn-3d win31-btn-3d--small">►</div>
              </div>
            </div>
            <div className="skills-marquee-horizontal">
              <div className="skills-marquee-horizontal__track">
                {__spreadArray(__spreadArray([], skills_1.ALL_SKILLS, true), skills_1.ALL_SKILLS, true).map(function (skill, idx) { return (<div key={"".concat(skill.id, "-").concat(idx)} className="skills-marquee-horizontal__item" style={{ position: 'relative' }}>
                    {newSkills.has(skill.id) && (<div className="new-skill-badge">
                        <span>NEW</span>
                      </div>)}
                    <img src={"/img/skills/".concat(skill.id, "-hero.png")} alt={skill.title} className="skills-marquee-horizontal__img" onClick={function () { return handleSkillClick(skill); }}/>
                    <div className="skills-marquee-horizontal__label-row">
                      <a href={"/docs/skills/".concat(skill.id.replace(/-/g, '_'))} className="skills-marquee-horizontal__btn" onClick={function (e) { return e.stopPropagation(); }}>
                        Doc
                      </a>
                      <span className="skills-marquee-horizontal__label">{skill.title}</span>
                      <button className="skills-marquee-horizontal__btn" onClick={function (e) { e.stopPropagation(); handleSkillClick(skill); }}>
                        Get
                      </button>
                    </div>
                  </div>); })}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
            VAPORWAVE PLAYER
            ═══════════════════════════════════════════════════════════════════ */}
          {/* ═══════════════════════════════════════════════════════════════════
            NAVIGATION: Three Windows
            ═══════════════════════════════════════════════════════════════════ */}
          <div className="nav-windows">
            {/* Gallery Window */}
            <a href="/skills" className="win31-window nav-window nav-window--yellow" onClick={function () { return track('Navigation Click', { destination: 'gallery' }); }}>
              <div className="win31-titlebar">
                <div className="win31-titlebar__left">
                  <div className="win31-btn-3d win31-btn-3d--small">─</div>
                </div>
                <span className="win31-title-text">GALLERY.EXE</span>
                <div className="win31-titlebar__right">
                  <div className="win31-btn-3d win31-btn-3d--small">□</div>
                </div>
              </div>
              <div className="nav-window__content">
                <div className="nav-window__icon">📁</div>
                <h3 className="nav-window__title">Browse All Skills</h3>
                <p className="nav-window__desc">Explore all {skills_1.ALL_SKILLS.length} skills with search and filtering</p>
                <div className="win31-btn-3d nav-window__btn">Open Gallery</div>
              </div>
            </a>

            {/* Guide Window - FEATURED */}
            <a href="/docs/guides/claude-skills-guide" className="win31-window nav-window nav-window--lime nav-window--featured" style={{ position: 'relative' }} onClick={function () { return track('Navigation Click', { destination: 'guide' }); }}>
              <div className="nav-window__recommended">★ RECOMMENDED ★</div>
              <div className="win31-titlebar">
                <div className="win31-titlebar__left">
                  <div className="win31-btn-3d win31-btn-3d--small">─</div>
                </div>
                <span className="win31-title-text">GUIDE.HLP</span>
                <div className="win31-titlebar__right">
                  <div className="win31-btn-3d win31-btn-3d--small">□</div>
                </div>
              </div>
              <div className="nav-window__content">
                <div className="nav-window__icon">📖</div>
                <h3 className="nav-window__title">Read the Guide</h3>
                <p className="nav-window__desc">Learn how skills work and create your own</p>
                <div className="win31-btn-3d nav-window__btn">Open Guide</div>
              </div>
            </a>

            {/* Docs Window */}
            <a href="/docs/intro" className="win31-window nav-window nav-window--teal" onClick={function () { return track('Navigation Click', { destination: 'docs' }); }}>
              <div className="win31-titlebar">
                <div className="win31-titlebar__left">
                  <div className="win31-btn-3d win31-btn-3d--small">─</div>
                </div>
                <span className="win31-title-text">DOCS.TXT</span>
                <div className="win31-titlebar__right">
                  <div className="win31-btn-3d win31-btn-3d--small">□</div>
                </div>
              </div>
              <div className="nav-window__content">
                <div className="nav-window__icon">📄</div>
                <h3 className="nav-window__title">Full Documentation</h3>
                <p className="nav-window__desc">API reference and installation options</p>
                <div className="win31-btn-3d nav-window__btn">Open Docs</div>
              </div>
            </a>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
            WHY THIS EXISTS
            ═══════════════════════════════════════════════════════════════════ */}
          <div className="win31-window" style={{ marginBottom: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">─</div>
              </div>
              <span className="win31-title-text">ABOUT.TXT</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">▲</div>
                <div className="win31-btn-3d win31-btn-3d--small">▼</div>
              </div>
            </div>
            <div style={{
            padding: '24px',
            fontSize: '15px',
            lineHeight: '1.7',
            color: '#333'
        }}>
              <h2 style={{ marginTop: 0, fontSize: '20px', marginBottom: '16px' }}>Why This Exists</h2>
              <p style={{ marginBottom: '12px' }}>
                <strong>The problem:</strong> Every time you ask Claude for help with something specialized, you have to explain the context from scratch. "I'm building a photo app, and I need help with color theory..." Then you get generic advice that misses the nuances.
              </p>
              <p style={{ marginBottom: '12px' }}>
                <strong>The solution:</strong> Skills pre-load Claude with deep expertise. When you activate the <em>Color Theory Expert</em> skill, Claude already knows about LAB color spaces, earth-mover distance for palette matching, warm/cool alternation—stuff that would take pages to explain.
              </p>
              <p style={{ marginBottom: '12px' }}>
                Built by <a href="https://erichowens.com">Erich Owens</a>. These skills are what I actually use—not toy examples, but production-grade prompts for speech pathology AI, computer vision, psychology chatbots, and developer tooling.
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>Who is this for?</strong> Developers who use Claude Code. Founders building AI features. Anyone who's ever thought "I wish Claude just <em>knew</em> this stuff already."
                MIT licensed. <a href="https://github.com/erichowens/some_claude_skills">Fork it, extend it, make it yours.</a>
              </p>
            </div>
          </div>


          {/* ═══════════════════════════════════════════════════════════════════
            FOOTER: Status Bar
            ═══════════════════════════════════════════════════════════════════ */}
          <div className="win31-statusbar footer-bar" style={{ position: 'relative' }}>
            <div className="win31-statusbar-panel">{skills_1.ALL_SKILLS.length} Skills Loaded</div>
            <div className="win31-statusbar-panel">6 Categories</div>
            <button className="win31-statusbar-panel share-to-desktop" onClick={shareToDesktop} title="Share or save for desktop">
              {copied === 'share' ? '✓ Copied!' : '📧 Save for Desktop'}
            </button>
            <div className="win31-statusbar-panel" style={{ position: 'relative' }}>
              <a href="https://github.com/erichowens/some_claude_skills" target="_blank" rel="noopener noreferrer" onClick={function () { return track('GitHub Link Clicked'); }}>
                GitHub →
              </a>
              {/* GitHub sticker - positioned at bottom right of link */}
              <div className="footer-sticker">
                <span>FORK ME!</span>
              </div>
            </div>
            <div className="win31-statusbar-panel konami-hint" title="Try: ↑↑↓↓←→←→BA">
              <span className="konami-hint__icon">🎮</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {selectedSkill && (<SkillQuickView_1.default skill={selectedSkill} onClose={function () { return setSelectedSkill(null); }} isStarred={isStarred(selectedSkill.id)} onToggleStar={toggleStar}/>)}

      {/* Konami Code Easter Egg */}
      {triggered && track('Konami Code Activated', { effect: easterEgg })}
      <KonamiEasterEgg_1.default type={easterEgg} visible={triggered}/>
    </Layout_1.default>);
}

"use strict";
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
exports.default = ArtifactDetail;
var react_1 = require("react");
var router_1 = require("@docusaurus/router");
var Layout_1 = require("@theme/Layout");
var Link_1 = require("@docusaurus/Link");
var PhaseTimeline_1 = require("@site/src/components/PhaseTimeline");
var TranscriptViewer_1 = require("@site/src/components/TranscriptViewer");
var BeforeAfterComparison_1 = require("@site/src/components/BeforeAfterComparison");
var WinampModal_1 = require("@site/src/components/WinampModal");
var MusicPlayerContext_1 = require("@site/src/contexts/MusicPlayerContext");
var artifact_module_css_1 = require("./artifact.module.css");
// Import artifacts
var artifact_json_1 = require("@site/src/data/artifacts/single-skill/skill-coach/001-self-improvement/artifact.json");
var artifact_json_2 = require("@site/src/data/artifacts/single-skill/vaporwave-glassomorphic-ui-designer/001-midi-player/artifact.json");
var artifact_json_3 = require("@site/src/data/artifacts/frontend/multi-skill/1-site-reliability-engineer-integration/artifact.json");
var ARTIFACTS_MAP = {
    'skill-coach-001-self-improvement': artifact_json_1.default,
    'vaporwave-glassomorphic-ui-designer-001-midi-player': artifact_json_2.default,
    'multi-skill-site-reliability-engineer-integration': artifact_json_3.default,
};
var CATEGORY_CONFIG = {
    design: { icon: '🎨', label: 'Design' },
    development: { icon: '💻', label: 'Development' },
    'ai-ml': { icon: '🤖', label: 'AI/ML' },
    research: { icon: '🔬', label: 'Research' },
    writing: { icon: '✍️', label: 'Writing' },
    meta: { icon: '🔄', label: 'Meta' }
};
var TYPE_CONFIG = {
    'single-skill': { icon: '🎯', label: 'Solo Skill' },
    'multi-skill': { icon: '🎼', label: 'Orchestration' },
    'comparison': { icon: '⚖️', label: 'Comparison' }
};
function ArtifactDetail() {
    var location = (0, router_1.useLocation)();
    // Read artifact ID from query parameter: /artifact?id=skill-coach-001-self-improvement
    var params = new URLSearchParams(location.search);
    var artifactId = params.get('id');
    var artifact = artifactId ? ARTIFACTS_MAP[artifactId] : null;
    var _a = (0, react_1.useState)(''), transcriptContent = _a[0], setTranscriptContent = _a[1];
    var _b = (0, react_1.useState)([]), fileComparisons = _b[0], setFileComparisons = _b[1];
    var _c = (0, react_1.useState)(new Set([0])), expandedFiles = _c[0], setExpandedFiles = _c[1]; // Only first file expanded by default
    var _d = (0, react_1.useState)(false), showMusicPlayer = _d[0], setShowMusicPlayer = _d[1];
    var setIsPlaying = (0, MusicPlayerContext_1.useMusicPlayer)().setIsPlaying;
    var toggleFile = function (index) {
        var newExpanded = new Set(expandedFiles);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        }
        else {
            newExpanded.add(index);
        }
        setExpandedFiles(newExpanded);
    };
    (0, react_1.useEffect)(function () {
        if (!artifact)
            return;
        // Construct base path for artifact files
        var match = artifact.id.match(/^(.+?)-(\d{3}-.+)$/);
        if (!match) {
            console.error('Invalid artifact ID format:', artifact.id);
            return;
        }
        var skillName = match[1], artifactNumber = match[2];
        var basePath = "/data/artifacts/".concat(artifact.type, "/").concat(skillName, "/").concat(artifactNumber);
        // Load transcript
        if (artifact.files.transcript) {
            fetch("".concat(basePath, "/").concat(artifact.files.transcript))
                .then(function (res) { return res.text(); })
                .then(function (text) { return setTranscriptContent(text); })
                .catch(function (err) { return console.error('Failed to load transcript:', err); });
        }
        // Load ALL before/after file pairs for comparison
        if (artifact.files.before && artifact.files.after) {
            var maxFiles = Math.max(artifact.files.before.length, artifact.files.after.length);
            var comparisons_1 = [];
            var _loop_1 = function (i) {
                var beforePath = artifact.files.before[i];
                var afterPath = artifact.files.after[i];
                if (beforePath && afterPath) {
                    Promise.all([
                        fetch("".concat(basePath, "/").concat(beforePath)).then(function (res) { return res.text(); }),
                        fetch("".concat(basePath, "/").concat(afterPath)).then(function (res) { return res.text(); })
                    ]).then(function (_a) {
                        var beforeContent = _a[0], afterContent = _a[1];
                        var fileName = afterPath.split('/').pop() || afterPath;
                        comparisons_1.push({
                            beforePath: beforePath,
                            afterPath: afterPath,
                            beforeContent: beforeContent,
                            afterContent: afterContent,
                            fileName: fileName
                        });
                        setFileComparisons(__spreadArray([], comparisons_1, true));
                    }).catch(function (err) { return console.error('Failed to load comparison files:', err); });
                }
            };
            for (var i = 0; i < maxFiles; i++) {
                _loop_1(i);
            }
        }
    }, [artifact]);
    if (!artifact) {
        return (<Layout_1.default title="Artifact Not Found">
        <div className={artifact_module_css_1.default.notFound}>
          <div className="container">
            <h1>Artifact Not Found</h1>
            <p>The artifact you're looking for doesn't exist.</p>
            <Link_1.default to="/artifacts" className={artifact_module_css_1.default.backButton}>
              ← Back to Artifacts
            </Link_1.default>
          </div>
        </div>
      </Layout_1.default>);
    }
    var category = CATEGORY_CONFIG[artifact.category];
    var type = TYPE_CONFIG[artifact.type];
    return (<Layout_1.default title={artifact.title} description={artifact.description}>
      <div className={artifact_module_css_1.default.artifactDetail}>
        {/* Hero Section */}
        <div className={artifact_module_css_1.default.hero}>
          <div className="container">
            <div className={artifact_module_css_1.default.breadcrumbs}>
              <Link_1.default to="/artifacts" className={artifact_module_css_1.default.breadcrumb}>
                Artifacts
              </Link_1.default>
              <span className={artifact_module_css_1.default.breadcrumbSeparator}>/</span>
              <span className={artifact_module_css_1.default.breadcrumbCurrent}>{artifact.title}</span>
            </div>

            <div className={artifact_module_css_1.default.heroHeader}>
              <div className={artifact_module_css_1.default.badges}>
                <span className={artifact_module_css_1.default.categoryBadge}>
                  <span className={artifact_module_css_1.default.badgeIcon}>{category.icon}</span>
                  {category.label}
                </span>
                <span className={artifact_module_css_1.default.typeBadge}>
                  <span className={artifact_module_css_1.default.badgeIcon}>{type.icon}</span>
                  {type.label}
                </span>
                {artifact.featured && (<span className={artifact_module_css_1.default.featuredBadge}>
                    ⭐ Featured
                  </span>)}
              </div>

              <h1 className={artifact_module_css_1.default.title}>{artifact.title}</h1>
              <p className={artifact_module_css_1.default.description}>{artifact.description}</p>

              <div className={artifact_module_css_1.default.metadata}>
                <span className={artifact_module_css_1.default.metaItem}>
                  📅 {new Date(artifact.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}
                </span>
                {artifact.viewCount && (<span className={artifact_module_css_1.default.metaItem}>
                    👁️ {artifact.viewCount.toLocaleString()} views
                  </span>)}
              </div>
            </div>

            {artifact.heroImage && (<div className={artifact_module_css_1.default.heroImageContainer}>
                <img src={artifact.heroImage} alt={artifact.title} className={artifact_module_css_1.default.heroImage}/>
              </div>)}
          </div>
        </div>

        <div className="container">
          {/* Skills Involved */}
          <section className={artifact_module_css_1.default.section}>
            <h2 className={artifact_module_css_1.default.sectionTitle}>Skills Involved</h2>
            <div className={artifact_module_css_1.default.skillsGrid}>
              {artifact.skills.map(function (skill, index) { return (<div key={index} className={artifact_module_css_1.default.skillCard}>
                  <div className={artifact_module_css_1.default.skillHeader}>
                    <Link_1.default to={"/docs/skills/".concat(skill.name)} className={artifact_module_css_1.default.skillName}>
                      {skill.name}
                    </Link_1.default>
                    {skill.activatedAt !== undefined && (<span className={artifact_module_css_1.default.activationBadge}>
                        Activated at {skill.activatedAt}s
                      </span>)}
                  </div>
                  <p className={artifact_module_css_1.default.skillRole}>{skill.role}</p>
                </div>); })}
            </div>
          </section>

          {/* Album Art Gallery */}
          {artifact.albumArt && artifact.albumArt.length > 0 && (<section className={artifact_module_css_1.default.section}>
              <h2 className={artifact_module_css_1.default.sectionTitle}>🎨 AI-Generated Album Art Gallery</h2>
              <p className={artifact_module_css_1.default.galleryDescription}>
                {artifact.albumArt.length} unique album covers generated using Ideogram AI, each capturing a different facet of vaporwave aesthetics.
              </p>
              <div className={artifact_module_css_1.default.albumArtGrid}>
                {artifact.albumArt.map(function (cover, index) { return (<div key={index} className={artifact_module_css_1.default.albumArtCard}>
                    <img src={cover.src} alt={cover.title} className={artifact_module_css_1.default.albumArtImage}/>
                    <div className={artifact_module_css_1.default.albumArtInfo}>
                      <span className={artifact_module_css_1.default.albumArtTitle}>{cover.title}</span>
                      <span className={artifact_module_css_1.default.albumArtArtist}>{cover.artist}</span>
                      <span className={artifact_module_css_1.default.albumArtStyle}>{cover.style}</span>
                    </div>
                  </div>); })}
              </div>
            </section>)}

          {/* Interactive Demo */}
          {artifact.interactiveDemo === 'vaporwave-midi-player' && (<section className={artifact_module_css_1.default.section}>
              <h2 className={artifact_module_css_1.default.sectionTitle}>🎵 Try It Live</h2>
              <div className={artifact_module_css_1.default.interactiveDemoCard}>
                <p className={artifact_module_css_1.default.interactiveDemoDescription}>
                  Experience the actual Winamp-style vaporwave music player created for this project.
                  Play MIDI tracks, switch between 4 theme skins, and see the animated 24-bar visualizer in action.
                </p>
                <button className={artifact_module_css_1.default.launchDemoButton} onClick={function () { return setShowMusicPlayer(true); }}>
                  🎧 Launch Music Player
                </button>
              </div>
            </section>)}

          {/* Phases (for multi-skill or phased single-skill) */}
          {artifact.phases && artifact.phases.length > 0 && (<section className={artifact_module_css_1.default.section}>
              <h2 className={artifact_module_css_1.default.sectionTitle}>Workflow Phases</h2>
              <PhaseTimeline_1.default phases={artifact.phases}/>
            </section>)}

          {/* Narrative Exposition */}
          {artifact.narrative && artifact.narrative.length > 0 && (<section className={artifact_module_css_1.default.section}>
              <div className={artifact_module_css_1.default.exposition}>
                <h2 className={artifact_module_css_1.default.expositionTitle}>What Happened Here</h2>
                <div className={artifact_module_css_1.default.expositionContent}>
                  {artifact.narrative.map(function (paragraph, index) { return (<p key={index} className={artifact_module_css_1.default.expositionParagraph}>
                      {paragraph}
                    </p>); })}
                </div>
              </div>
            </section>)}

          {/* Outcome & Metrics */}
          <section className={artifact_module_css_1.default.section}>
            <h2 className={artifact_module_css_1.default.sectionTitle}>Outcome</h2>
            <div className={artifact_module_css_1.default.outcomeCard}>
              <p className={artifact_module_css_1.default.outcomeSummary}>{artifact.outcome.summary}</p>

              {artifact.outcome.metrics && artifact.outcome.metrics.length > 0 && (<div className={artifact_module_css_1.default.metrics}>
                  {artifact.outcome.metrics.map(function (metric, index) { return (<div key={index} className={artifact_module_css_1.default.metric}>
                      <span className={artifact_module_css_1.default.metricValue}>{metric.value}</span>
                      <span className={artifact_module_css_1.default.metricLabel}>{metric.label}</span>
                    </div>); })}
                </div>)}

              {artifact.outcome.learned && artifact.outcome.learned.length > 0 && (<div className={artifact_module_css_1.default.learned}>
                  <h3 className={artifact_module_css_1.default.learnedTitle}>Key Learnings</h3>
                  <ul className={artifact_module_css_1.default.learnedList}>
                    {artifact.outcome.learned.map(function (learning, index) { return (<li key={index} className={artifact_module_css_1.default.learnedItem}>
                        💡 {learning}
                      </li>); })}
                  </ul>
                </div>)}
            </div>
          </section>

          {/* Before/After Comparisons */}
          {fileComparisons.length > 0 && (<section className={artifact_module_css_1.default.section}>
              <h2 className={artifact_module_css_1.default.sectionTitle}>Before & After Comparison</h2>
              <div className={artifact_module_css_1.default.comparisonNotice}>
                <p>📁 Showing {fileComparisons.length} file{fileComparisons.length > 1 ? 's' : ''} changed across {artifact.phases ? artifact.phases.length : 'multiple'} iterations. Click to expand/collapse.</p>
              </div>
              {fileComparisons.map(function (comparison, index) {
                var isExpanded = expandedFiles.has(index);
                var beforeLines = comparison.beforeContent.split('\n').length;
                var afterLines = comparison.afterContent.split('\n').length;
                var linesChanged = Math.abs(beforeLines - afterLines);
                return (<div key={index} className={artifact_module_css_1.default.fileComparison}>
                    <div className={artifact_module_css_1.default.fileComparisonHeader} onClick={function () { return toggleFile(index); }} style={{ cursor: 'pointer' }}>
                      <div className={artifact_module_css_1.default.fileComparisonTitleRow}>
                        <h3 className={artifact_module_css_1.default.fileComparisonTitle}>
                          <span className={artifact_module_css_1.default.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
                          📄 {comparison.fileName}
                        </h3>
                        <div className={artifact_module_css_1.default.fileStats}>
                          <span className={artifact_module_css_1.default.fileStat}>
                            {beforeLines} → {afterLines} lines
                          </span>
                          <span className={artifact_module_css_1.default.fileStat}>
                            {linesChanged} changed
                          </span>
                        </div>
                      </div>
                    </div>
                    {isExpanded && (<div className={artifact_module_css_1.default.fileComparisonContent}>
                        <BeforeAfterComparison_1.default beforeContent={comparison.beforeContent} afterContent={comparison.afterContent} beforeLabel="Iteration 0" afterLabel="Final Version" fileName={comparison.fileName}/>
                      </div>)}
                  </div>);
            })}
            </section>)}

          {/* Transcript */}
          {transcriptContent && (<section className={artifact_module_css_1.default.section}>
              <TranscriptViewer_1.default transcriptContent={transcriptContent} title="Full Conversation Transcript"/>
            </section>)}

          {/* Tags */}
          {artifact.tags && artifact.tags.length > 0 && (<section className={artifact_module_css_1.default.section}>
              <h2 className={artifact_module_css_1.default.sectionTitle}>Tags</h2>
              <div className={artifact_module_css_1.default.tags}>
                {artifact.tags.map(function (tag, index) { return (<span key={index} className={artifact_module_css_1.default.tag}>
                    #{tag}
                  </span>); })}
              </div>
            </section>)}

          {/* Navigation */}
          <div className={artifact_module_css_1.default.navigation}>
            <Link_1.default to="/artifacts" className={artifact_module_css_1.default.backButton}>
              ← Back to All Artifacts
            </Link_1.default>
          </div>
        </div>
      </div>

      {/* Winamp Modal for Interactive Demo */}
      {showMusicPlayer && (<WinampModal_1.default onClose={function () { return setShowMusicPlayer(false); }}/>)}
    </Layout_1.default>);
}

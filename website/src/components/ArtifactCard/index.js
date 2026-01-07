"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ArtifactCard;
var react_1 = require("react");
var Link_1 = require("@docusaurus/Link");
var styles_module_css_1 = require("./styles.module.css");
var difficultyConfig = {
    beginner: { label: '⭐', color: '#10b981' },
    intermediate: { label: '⭐⭐', color: '#f59e0b' },
    advanced: { label: '⭐⭐⭐', color: '#ef4444' }
};
var categoryConfig = {
    design: { icon: '🎨', label: 'Design' },
    development: { icon: '💻', label: 'Development' },
    'ai-ml': { icon: '🤖', label: 'AI/ML' },
    research: { icon: '🔬', label: 'Research' },
    writing: { icon: '✍️', label: 'Writing' },
    meta: { icon: '🔄', label: 'Meta' }
};
function ArtifactCard(_a) {
    var artifact = _a.artifact;
    var category = categoryConfig[artifact.category];
    var difficulty = artifact.difficulty ? difficultyConfig[artifact.difficulty] : null;
    // Custom routes for specific artifacts with dedicated pages
    var customRoutes = {
        'multi-skill-site-reliability-engineer-integration': '/artifacts/site-reliability-engineer-integration',
    };
    // Construct the artifact URL - use custom route if available, otherwise query parameter
    var artifactPath = customRoutes[artifact.id] || "/artifact?id=".concat(artifact.id);
    return (<div className={styles_module_css_1.default.artifactCard}>
      <div className={styles_module_css_1.default.header}>
        <div className={styles_module_css_1.default.category}>
          <span className={styles_module_css_1.default.categoryIcon}>{category.icon}</span>
          <span className={styles_module_css_1.default.categoryLabel}>{category.label}</span>
        </div>
        {difficulty && (<div className={styles_module_css_1.default.difficulty} style={{ color: difficulty.color }}>
            {difficulty.label}
          </div>)}
      </div>

      {artifact.heroImage && (<div className={styles_module_css_1.default.heroImage}>
          <img src={artifact.heroImage} alt={artifact.title}/>
        </div>)}

      <h3 className={styles_module_css_1.default.title}>
        <Link_1.default to={artifactPath}>{artifact.title}</Link_1.default>
      </h3>

      <p className={styles_module_css_1.default.description}>{artifact.description}</p>

      <div className={styles_module_css_1.default.skills}>
        {artifact.skills.map(function (skill, index) {
            // Use custom link if provided, otherwise generate skill doc path
            var skillLink = skill.link || "/docs/skills/".concat(skill.name.replace(/-/g, '_'));
            return (<span key={index} className={styles_module_css_1.default.skillTag}>
              <Link_1.default to={skillLink}>{skill.name}</Link_1.default>
            </span>);
        })}
      </div>

      {artifact.outcome.metrics && artifact.outcome.metrics.length > 0 && (<div className={styles_module_css_1.default.metrics}>
          {artifact.outcome.metrics.slice(0, 3).map(function (metric, index) { return (<div key={index} className={styles_module_css_1.default.metric}>
              <span className={styles_module_css_1.default.metricValue}>{metric.value}</span>
              <span className={styles_module_css_1.default.metricLabel}>{metric.label}</span>
            </div>); })}
        </div>)}

      <div className={styles_module_css_1.default.footer}>
        <div className={styles_module_css_1.default.meta}>
          <span className={styles_module_css_1.default.type}>
            {artifact.type === 'single-skill' && '🎯 Solo'}
            {artifact.type === 'multi-skill' && '🎼 Orchestra'}
            {artifact.type === 'comparison' && '⚖️ Comparison'}
          </span>
          <span className={styles_module_css_1.default.date}>
            {new Date(artifact.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })}
          </span>
        </div>

        <Link_1.default to={artifactPath} className={styles_module_css_1.default.viewButton}>
          View Artifact →
        </Link_1.default>
      </div>

      {artifact.featured && (<div className={styles_module_css_1.default.featuredBadge}>
          ⭐ Featured
        </div>)}
    </div>);
}

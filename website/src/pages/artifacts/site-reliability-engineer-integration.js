"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SiteReliabilityEngineerArtifact;
var react_1 = require("react");
var Layout_1 = require("@theme/Layout");
var Link_1 = require("@docusaurus/Link");
var PhaseTimeline_1 = require("@site/src/components/PhaseTimeline");
var artifact_json_1 = require("@site/src/data/artifacts/frontend/multi-skill/1-site-reliability-engineer-integration/artifact.json");
var ValidationDemo_1 = require("@site/src/data/artifacts/frontend/multi-skill/1-site-reliability-engineer-integration/demos/ValidationDemo");
var WorkflowTimeline_1 = require("@site/src/data/artifacts/frontend/multi-skill/1-site-reliability-engineer-integration/demos/WorkflowTimeline");
var ErrorShowcase_1 = require("@site/src/data/artifacts/frontend/multi-skill/1-site-reliability-engineer-integration/demos/ErrorShowcase");
var artifact_module_css_1 = require("../artifact.module.css");
var artifact = artifact_json_1.default;
var CATEGORY_CONFIG = {
    development: { icon: '💻', label: 'Development' }
};
var TYPE_CONFIG = {
    'multi-skill': { icon: '🎼', label: 'Orchestration' }
};
function SiteReliabilityEngineerArtifact() {
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

            {/* Hero Image */}
            <img src="/img/artifacts/site-reliability-engineer-integration-hero_2025-11-26T07-36-24-786Z.png" alt="Site Reliability Engineer Integration - Windows 3.1 Build Validation Complete" style={{
            width: '100%',
            maxWidth: '1200px',
            margin: '2rem auto',
            display: 'block',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}/>

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
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Authors */}
          {artifact.authors && artifact.authors.length > 0 && (<section className={artifact_module_css_1.default.section}>
              <h2 className={artifact_module_css_1.default.sectionTitle}>Authors</h2>
              <div className={artifact_module_css_1.default.skillsGrid}>
                {artifact.authors.map(function (author, index) { return (<div key={index} className={artifact_module_css_1.default.skillCard}>
                    <div className={artifact_module_css_1.default.skillHeader}>
                      {author.skillPath ? (<Link_1.default to={author.skillPath} className={artifact_module_css_1.default.skillName}>
                          {author.name}
                        </Link_1.default>) : author.contactPath ? (<Link_1.default to={author.contactPath} className={artifact_module_css_1.default.skillName}>
                          {author.name}
                        </Link_1.default>) : (<span className={artifact_module_css_1.default.skillName}>{author.name}</span>)}
                    </div>
                    <p className={artifact_module_css_1.default.skillRole}>{author.role}</p>
                  </div>); })}
              </div>
            </section>)}

          {/* Skills Involved */}
          <section className={artifact_module_css_1.default.section}>
            <h2 className={artifact_module_css_1.default.sectionTitle}>Skills Involved</h2>
            <div className={artifact_module_css_1.default.skillsGrid}>
              {artifact.skills.map(function (skill, index) {
            // All skill doc files use underscores in the path
            var skillPath = skill.name.replace(/-/g, '_');
            return (<div key={index} className={artifact_module_css_1.default.skillCard}>
                    <div className={artifact_module_css_1.default.skillHeader}>
                      <Link_1.default to={"/docs/skills/".concat(skillPath)} className={artifact_module_css_1.default.skillName}>
                        {skill.name}
                      </Link_1.default>
                    </div>
                    <p className={artifact_module_css_1.default.skillRole}>{skill.role}</p>
                  </div>);
        })}
            </div>
          </section>

          {/* Interactive Demo: Workflow Timeline */}
          <section className={artifact_module_css_1.default.section}>
            <h2 className={artifact_module_css_1.default.sectionTitle}>🎼 Multi-Skill Workflow</h2>
            <p className={artifact_module_css_1.default.sectionDescription}>
              See how three skills orchestrated together to build a reliable validation system
            </p>
            <WorkflowTimeline_1.default />
          </section>

          {/* Combined Interactive Demo Section */}
          <section className={artifact_module_css_1.default.section}>
            <h2 className={artifact_module_css_1.default.sectionTitle}>🔍 Try the Validation System</h2>

            {/* What It Validates */}
            <div style={{
            background: 'var(--ifm-background-surface-color)',
            border: '2px solid var(--ifm-color-emphasis-300)',
            padding: '1.5rem',
            marginBottom: '2rem',
            borderRadius: '8px'
        }}>
              <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--ifm-color-primary)' }}>
                What Does This Validate?
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                This validation system catches three types of MDX compilation errors before they break your Docusaurus build:
              </p>
              <ul style={{ marginBottom: '1rem', lineHeight: 1.8 }}>
                <li><strong>Liquid Template Syntax</strong> – Unescaped <code>{"{{ }}"}</code> patterns that must be wrapped in backticks</li>
                <li><strong>Angle Brackets with Numbers</strong> – Patterns like <code>&lt;3</code> or <code>&gt;10MB</code> that MDX interprets as malformed HTML tags</li>
                <li><strong>Component Props</strong> – Mismatched props in shared components like <code>SkillHeader</code> after API changes</li>
              </ul>
            </div>

            {/* Who Should/Shouldn't Use */}
            <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '2rem'
        }}>
              <div style={{
            background: 'rgba(76, 175, 80, 0.1)',
            border: '2px solid rgba(76, 175, 80, 0.3)',
            padding: '1rem',
            borderRadius: '8px'
        }}>
                <h4 style={{ marginTop: 0, color: '#4CAF50' }}>✅ Use This If You:</h4>
                <ul style={{ marginBottom: 0, paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                  <li>Work with Docusaurus + MDX documentation</li>
                  <li>Have multiple contributors committing docs</li>
                  <li>Are migrating from Jekyll/Liquid to MDX</li>
                  <li>Experience frequent build failures from MDX errors</li>
                  <li>Want instant feedback vs. waiting for CI/CD</li>
                </ul>
              </div>

              <div style={{
            background: 'rgba(244, 67, 54, 0.1)',
            border: '2px solid rgba(244, 67, 54, 0.3)',
            padding: '1rem',
            borderRadius: '8px'
        }}>
                <h4 style={{ marginTop: 0, color: '#F44336' }}>❌ Skip This If You:</h4>
                <ul style={{ marginBottom: 0, paddingLeft: '1.5rem', lineHeight: 1.8 }}>
                  <li>Use plain Markdown (not MDX)</li>
                  <li>Work solo and manually test builds</li>
                  <li>Use a different SSG (Hugo, Jekyll, Gatsby)</li>
                  <li>Have fewer than 10 documentation files</li>
                  <li>Don't use git hooks in your workflow</li>
                </ul>
              </div>
            </div>

            {/* Live Interactive Demo */}
            <div style={{ marginBottom: '3rem' }}>
              <h3>Interactive Editor</h3>
              <p className={artifact_module_css_1.default.sectionDescription}>
                Edit code in real-time and see how validation catches errors before they break the build
              </p>
              <ValidationDemo_1.default />
            </div>

            {/* Real Error Examples */}
            <div>
              <h3>Real Errors Caught in Production</h3>
              <p className={artifact_module_css_1.default.sectionDescription}>
                Before and after comparisons showing actual errors fixed by this validation system
              </p>
              <ErrorShowcase_1.default />
            </div>
          </section>

          {/* Phases */}
          {artifact.phases && artifact.phases.length > 0 && (<section className={artifact_module_css_1.default.section}>
              <h2 className={artifact_module_css_1.default.sectionTitle}>Detailed Phase Breakdown</h2>
              <PhaseTimeline_1.default phases={artifact.phases}/>
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

          {/* Technologies */}
          {artifact.technologies && artifact.technologies.length > 0 && (<section className={artifact_module_css_1.default.section}>
              <h2 className={artifact_module_css_1.default.sectionTitle}>Technologies Used</h2>
              <div className={artifact_module_css_1.default.tags}>
                {artifact.technologies.map(function (tech, index) { return (<span key={index} className={artifact_module_css_1.default.tag}>
                    {tech}
                  </span>); })}
              </div>
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
    </Layout_1.default>);
}

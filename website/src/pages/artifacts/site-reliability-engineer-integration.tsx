import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import PhaseTimeline from '@site/src/components/PhaseTimeline';
import artifactData from '@site/src/data/artifacts/frontend/multi-skill/1-site-reliability-engineer-integration/artifact.json';
import ValidationDemo from '@site/src/data/artifacts/frontend/multi-skill/1-site-reliability-engineer-integration/demos/ValidationDemo';
import WorkflowTimeline from '@site/src/data/artifacts/frontend/multi-skill/1-site-reliability-engineer-integration/demos/WorkflowTimeline';
import ErrorShowcase from '@site/src/data/artifacts/frontend/multi-skill/1-site-reliability-engineer-integration/demos/ErrorShowcase';
import { Artifact } from '@site/src/types/artifact';
import styles from '../artifact.module.css';

const artifact = artifactData as Artifact;

const CATEGORY_CONFIG = {
  development: { icon: '💻', label: 'Development' }
};

const TYPE_CONFIG = {
  'multi-skill': { icon: '🎼', label: 'Orchestration' }
};

export default function SiteReliabilityEngineerArtifact(): JSX.Element {
  const category = CATEGORY_CONFIG[artifact.category];
  const type = TYPE_CONFIG[artifact.type];

  return (
    <Layout
      title={artifact.title}
      description={artifact.description}
    >
      <div className={styles.artifactDetail}>
        {/* Hero Section */}
        <div className={styles.hero}>
          <div className="container">
            <div className={styles.breadcrumbs}>
              <Link to="/artifacts" className={styles.breadcrumb}>
                Artifacts
              </Link>
              <span className={styles.breadcrumbSeparator}>/</span>
              <span className={styles.breadcrumbCurrent}>{artifact.title}</span>
            </div>

            {/* Hero Image */}
            <img
              src="/img/artifacts/site-reliability-engineer-integration-hero_2025-11-26T07-36-24-786Z.png"
              alt="Site Reliability Engineer Integration - Windows 3.1 Build Validation Complete"
              style={{
                width: '100%',
                maxWidth: '1200px',
                margin: '2rem auto',
                display: 'block',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            />

            <div className={styles.heroHeader}>
              <div className={styles.badges}>
                <span className={styles.categoryBadge}>
                  <span className={styles.badgeIcon}>{category.icon}</span>
                  {category.label}
                </span>
                <span className={styles.typeBadge}>
                  <span className={styles.badgeIcon}>{type.icon}</span>
                  {type.label}
                </span>
                {artifact.featured && (
                  <span className={styles.featuredBadge}>
                    ⭐ Featured
                  </span>
                )}
              </div>

              <h1 className={styles.title}>{artifact.title}</h1>
              <p className={styles.description}>{artifact.description}</p>

              <div className={styles.metadata}>
                <span className={styles.metaItem}>
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
          {artifact.authors && artifact.authors.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Authors</h2>
              <div className={styles.skillsGrid}>
                {artifact.authors.map((author, index) => (
                  <div key={index} className={styles.skillCard}>
                    <div className={styles.skillHeader}>
                      {author.skillPath ? (
                        <Link to={author.skillPath} className={styles.skillName}>
                          {author.name}
                        </Link>
                      ) : author.contactPath ? (
                        <Link to={author.contactPath} className={styles.skillName}>
                          {author.name}
                        </Link>
                      ) : (
                        <span className={styles.skillName}>{author.name}</span>
                      )}
                    </div>
                    <p className={styles.skillRole}>{author.role}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Skills Involved */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Skills Involved</h2>
            <div className={styles.skillsGrid}>
              {artifact.skills.map((skill, index) => {
                // All skill doc files use underscores in the path
                const skillPath = skill.name.replace(/-/g, '_');
                return (
                  <div key={index} className={styles.skillCard}>
                    <div className={styles.skillHeader}>
                      <Link to={`/docs/skills/${skillPath}`} className={styles.skillName}>
                        {skill.name}
                      </Link>
                    </div>
                    <p className={styles.skillRole}>{skill.role}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Interactive Demo: Workflow Timeline */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🎼 Multi-Skill Workflow</h2>
            <p className={styles.sectionDescription}>
              See how three skills orchestrated together to build a reliable validation system
            </p>
            <WorkflowTimeline />
          </section>

          {/* Combined Interactive Demo Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>🔍 Try the Validation System</h2>

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
                <li><strong>Liquid Template Syntax</strong> – Unescaped <code>{`{{ }}`}</code> patterns that must be wrapped in backticks</li>
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
                <h4 style={{ marginTop: 0, color: "var(--theme-success)" }}>✅ Use This If You:</h4>
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
                <h4 style={{ marginTop: 0, color: "var(--theme-danger)" }}>❌ Skip This If You:</h4>
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
              <p className={styles.sectionDescription}>
                Edit code in real-time and see how validation catches errors before they break the build
              </p>
              <ValidationDemo />
            </div>

            {/* Real Error Examples */}
            <div>
              <h3>Real Errors Caught in Production</h3>
              <p className={styles.sectionDescription}>
                Before and after comparisons showing actual errors fixed by this validation system
              </p>
              <ErrorShowcase />
            </div>
          </section>

          {/* Phases */}
          {artifact.phases && artifact.phases.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Detailed Phase Breakdown</h2>
              <PhaseTimeline phases={artifact.phases} />
            </section>
          )}

          {/* Outcome & Metrics */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Outcome</h2>
            <div className={styles.outcomeCard}>
              <p className={styles.outcomeSummary}>{artifact.outcome.summary}</p>

              {artifact.outcome.metrics && artifact.outcome.metrics.length > 0 && (
                <div className={styles.metrics}>
                  {artifact.outcome.metrics.map((metric, index) => (
                    <div key={index} className={styles.metric}>
                      <span className={styles.metricValue}>{metric.value}</span>
                      <span className={styles.metricLabel}>{metric.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {artifact.outcome.learned && artifact.outcome.learned.length > 0 && (
                <div className={styles.learned}>
                  <h3 className={styles.learnedTitle}>Key Learnings</h3>
                  <ul className={styles.learnedList}>
                    {artifact.outcome.learned.map((learning, index) => (
                      <li key={index} className={styles.learnedItem}>
                        💡 {learning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* Technologies */}
          {artifact.technologies && artifact.technologies.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Technologies Used</h2>
              <div className={styles.tags}>
                {artifact.technologies.map((tech, index) => (
                  <span key={index} className={styles.tag}>
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {artifact.tags && artifact.tags.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Tags</h2>
              <div className={styles.tags}>
                {artifact.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    #{tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Navigation */}
          <div className={styles.navigation}>
            <Link to="/artifacts" className={styles.backButton}>
              ← Back to All Artifacts
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import React from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import { useHistory } from '@docusaurus/router';
import BundleGallery from '../components/BundleGallery';
import { bundles, getFeaturedBundles } from '../data/bundles';
import '../css/win31.css';
import '../css/backsplash.css';

/**
 * Bundles Page - Curated skill bundles for common workflows
 *
 * Displays the bundle gallery with filtering by audience and difficulty.
 * Win31 aesthetic matching the rest of the site.
 */
export default function BundlesPage(): React.JSX.Element {
  const history = useHistory();
  const featuredCount = getFeaturedBundles().length;

  // Navigate to skill detail page when clicking a skill in the bundle
  const handleViewSkill = (skillId: string) => {
    history.push(`/docs/skills/${skillId.replace(/-/g, '_')}/${skillId}`);
  };

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Claude Code Skill Bundles',
    description: `Browse ${bundles.length} curated skill bundles for Claude Code. Pre-configured workflows for developers, entrepreneurs, teams, and more.`,
    url: 'https://someclaudeskills.com/bundles',
    numberOfItems: bundles.length,
    about: {
      '@type': 'SoftwareApplication',
      name: 'Claude Code Skills',
      applicationCategory: 'DeveloperApplication',
    },
  };

  return (
    <Layout
      title="Skill Bundles"
      description={`Browse ${bundles.length} curated Claude Code skill bundles. Pre-configured workflows for developers, entrepreneurs, technical writers, and teams.`}
    >
      <Head>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <meta
          name="keywords"
          content="Claude Code bundles, skill bundles, AI workflows, Claude skills, developer tools, productivity"
        />
        <link rel="canonical" href="https://someclaudeskills.com/bundles" />
      </Head>

      <div className="page-backsplash page-backsplash--skills page-backsplash--medium">
        <div className="skills-container">
          {/* Header */}
          <div className="win31-panel-box">
            <div className="section-header">
              <h1
                className="win31-font hero-title"
                style={{ fontSize: '32px', marginBottom: '12px' }}
              >
                📦 Skill Bundles
              </h1>
              <p
                className="win31-font"
                style={{
                  fontSize: '16px',
                  textAlign: 'center',
                  color: "var(--theme-text)",
                  marginBottom: '16px',
                  maxWidth: '700px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  lineHeight: 1.6,
                }}
              >
                Curated collections of skills designed for specific workflows. Each bundle combines
                multiple skills that work together, with one-click installation and estimated costs.
              </p>

              {/* Quick Stats */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '24px',
                  marginTop: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    textAlign: 'center',
                    padding: '12px 20px',
                    background: "var(--theme-elevated)",
                    border: "1px solid var(--theme-border)",
                  }}
                >
                  <div
                    className="win31-font"
                    style={{ fontSize: '24px', fontWeight: 'bold', color: "var(--theme-link)" }}
                  >
                    {bundles.length}
                  </div>
                  <div className="win31-font" style={{ fontSize: '12px', color: "var(--theme-muted)" }}>
                    Total Bundles
                  </div>
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '12px 20px',
                    background: 'var(--theme-warning-surface)',
                    border: '1px solid #cc9900',
                  }}
                >
                  <div
                    className="win31-font"
                    style={{ fontSize: '24px', fontWeight: 'bold', color: "var(--theme-text)" }}
                  >
                    {featuredCount}
                  </div>
                  <div className="win31-font" style={{ fontSize: '12px', color: "var(--theme-text)" }}>
                    ⭐ Featured
                  </div>
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    padding: '12px 20px',
                    background: 'var(--theme-success-surface)',
                    border: '1px solid #4a9',
                  }}
                >
                  <div
                    className="win31-font"
                    style={{ fontSize: '24px', fontWeight: 'bold', color: "var(--theme-success)" }}
                  >
                    ~$0.45
                  </div>
                  <div className="win31-font" style={{ fontSize: '12px', color: "var(--theme-text)" }}>
                    Starting Cost
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div
            className="win31-panel-box"
            style={{ marginBottom: '24px', padding: '16px 20px' }}
          >
            <h2
              className="win31-font"
              style={{
                fontSize: '14px',
                margin: '0 0 12px 0',
                color: "var(--theme-link)",
              }}
            >
              💡 How Bundles Work
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>1️⃣</span>
                <div>
                  <strong className="win31-font" style={{ fontSize: '12px' }}>
                    Browse & Select
                  </strong>
                  <p className="win31-font" style={{ fontSize: '11px', color: "var(--theme-muted)", margin: 0 }}>
                    Find a bundle that matches your workflow
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>2️⃣</span>
                <div>
                  <strong className="win31-font" style={{ fontSize: '12px' }}>
                    Copy Command
                  </strong>
                  <p className="win31-font" style={{ fontSize: '11px', color: "var(--theme-muted)", margin: 0 }}>
                    Click to copy the install command
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>3️⃣</span>
                <div>
                  <strong className="win31-font" style={{ fontSize: '12px' }}>
                    Run in Claude Code
                  </strong>
                  <p className="win31-font" style={{ fontSize: '11px', color: "var(--theme-muted)", margin: 0 }}>
                    Paste in your terminal to install all skills
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>4️⃣</span>
                <div>
                  <strong className="win31-font" style={{ fontSize: '12px' }}>
                    Start Working
                  </strong>
                  <p className="win31-font" style={{ fontSize: '11px', color: "var(--theme-muted)", margin: 0 }}>
                    Skills work together automatically
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bundle Gallery */}
          <BundleGallery
            bundles={bundles}
            showFilters={true}
            showFeaturedFirst={true}
            onViewSkill={handleViewSkill}
          />

          {/* Footer */}
          <div
            className="win31-panel-box win31-panel-box--small-shadow"
            style={{ marginTop: '24px', marginBottom: 0 }}
          >
            <div
              className="win31-statusbar"
              style={{ justifyContent: 'center', gap: '20px', padding: '20px' }}
            >
              <div className="win31-statusbar-panel">
                {bundles.length} bundles available
              </div>
              <div className="win31-statusbar-panel">
                <a href="/skills" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Browse Individual Skills →
                </a>
              </div>
              <div className="win31-statusbar-panel">
                <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

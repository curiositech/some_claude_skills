import React from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import EcosystemDashboard from '../components/EcosystemDashboard';
import ecosystemData from '../data/ecosystem-state.json';
import '../css/win31.css';

export default function EcosystemPage(): JSX.Element {
  return (
    <Layout
      title="Ecosystem Dashboard"
      description="Visual exploration of the Claude Skills agentic ecosystem - agents, skills, and their connections"
    >
      <Head>
        <meta name="keywords" content="ecosystem, agents, skills, knowledge graph, visualization, agentic systems" />
      </Head>

      <div style={{
        background: '#0f172a',
        minHeight: '100vh',
        paddingTop: '60px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px 24px 24px'
        }}>
          {/* Page Header */}
          <div className="win31-window" style={{ marginBottom: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">─</div>
              </div>
              <span className="win31-title-text">ECOSYSTEM.EXE - Bottle City Dashboard</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">□</div>
              </div>
            </div>

            <div style={{ padding: '24px', background: 'var(--win31-gray)' }}>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '48px',
                margin: '0 0 12px 0',
                color: 'var(--win31-navy)'
              }}>
                Ecosystem Dashboard
              </h1>

              <p style={{
                fontFamily: 'var(--font-code)',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#333',
                margin: '0 0 16px 0'
              }}>
                A "Bottle City" view into the agentic ecosystem. Explore {ecosystemData.summary.total_agents} agents,{' '}
                {ecosystemData.summary.total_skills} skills, and their interconnections.
                This dashboard visualizes the capability graph, coordination patterns, and domain coverage
                of the entire system.
              </p>

              <div style={{
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  background: '#6366f1',
                  color: 'white',
                  padding: '6px 12px',
                  fontFamily: 'var(--font-code)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  border: '2px solid #4f46e5'
                }}>
                  {ecosystemData.summary.total_agents} AGENTS
                </div>

                <div style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '6px 12px',
                  fontFamily: 'var(--font-code)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  border: '2px solid #059669'
                }}>
                  {ecosystemData.summary.total_skills} SKILLS
                </div>

                <div style={{
                  background: '#f59e0b',
                  color: 'white',
                  padding: '6px 12px',
                  fontFamily: 'var(--font-code)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  border: '2px solid #d97706'
                }}>
                  {ecosystemData.summary.unique_tools} TOOLS
                </div>

                <div style={{
                  background: 'var(--win31-light-gray)',
                  color: '#333',
                  padding: '6px 12px',
                  fontFamily: 'var(--font-code)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  border: '2px solid var(--win31-dark-gray)'
                }}>
                  Generated: {new Date(ecosystemData.generated_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard */}
          <EcosystemDashboard data={ecosystemData} />

          {/* Footer Info */}
          <div className="win31-window" style={{ marginTop: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">─</div>
              </div>
              <span className="win31-title-text">INFO.TXT</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">▼</div>
              </div>
            </div>

            <div style={{ padding: '16px', background: 'var(--win31-gray)' }}>
              <h3 style={{
                fontFamily: 'var(--font-system)',
                fontSize: '14px',
                fontWeight: 600,
                margin: '0 0 8px 0',
                color: 'var(--win31-navy)'
              }}>
                About This Dashboard
              </h3>

              <p style={{
                fontFamily: 'var(--font-code)',
                fontSize: '12px',
                lineHeight: '1.6',
                color: '#333',
                margin: '0 0 12px 0'
              }}>
                This dashboard provides real-time insight into the agentic ecosystem's structure and capabilities.
                The knowledge graph shows coordination patterns between agents, while the stats panel reveals
                tool usage patterns and domain coverage.
              </p>

              <ul style={{
                fontFamily: 'var(--font-code)',
                fontSize: '12px',
                lineHeight: '1.6',
                color: '#333',
                margin: 0,
                paddingLeft: '24px'
              }}>
                <li><strong>Agents</strong> are meta-coordinators that orchestrate multi-skill workflows</li>
                <li><strong>Skills</strong> are domain-specific experts with deep knowledge</li>
                <li><strong>Tools</strong> are the primitive capabilities agents and skills use</li>
                <li><strong>Coordination edges</strong> show which agents work together</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

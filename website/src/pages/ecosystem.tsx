import React, { useState, useMemo } from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import skillMetadata from '../data/skillMetadata.json';
import '../css/win31.css';

// Agent metadata
interface AgentMeta {
  id: string;
  name: string;
  role: string;
  emoji: string;
  description: string;
}

const agents: AgentMeta[] = [
  { id: 'architect', name: 'The Architect', role: 'Meta-Orchestrator of Combinatorial Genius', emoji: '🏛️', description: 'Designs new agents and orchestrates complex multi-agent workflows' },
  { id: 'archivist', name: 'The Archivist', role: 'Keeper of History and Documentation', emoji: '📜', description: 'Documents ecosystem progress, maintains changelogs and snapshots' },
  { id: 'auditor', name: 'The Auditor', role: 'Quality Assurance & Code Review Specialist', emoji: '🔍', description: 'Reviews code quality, enforces standards, identifies issues' },
  { id: 'cartographer', name: 'The Cartographer', role: 'Explorer of Adjacent Knowledge Space', emoji: '🗺️', description: 'Maps knowledge domains, finds gaps, charts expansion paths' },
  { id: 'debugger', name: 'The Debugger', role: 'Expert Troubleshooter & Root Cause Analyst', emoji: '🐛', description: 'Investigates bugs, traces issues, provides fix recommendations' },
  { id: 'guardian', name: 'The Guardian', role: 'Security & Compliance Specialist', emoji: '🛡️', description: 'Protects against vulnerabilities, ensures security best practices' },
  { id: 'liaison', name: 'The Liaison', role: 'Human Interface and Informant', emoji: '🎙️', description: 'Communicates ecosystem status, bridges agents and humans' },
  { id: 'librarian', name: 'The Librarian', role: 'Content Curator with Rights Awareness', emoji: '📚', description: 'Curates content, tracks licenses, maintains attribution' },
  { id: 'optimizer', name: 'The Optimizer', role: 'Performance & Efficiency Expert', emoji: '⚡', description: 'Profiles performance, identifies bottlenecks, tunes systems' },
  { id: 'researcher', name: 'The Researcher', role: 'Deep Research & Knowledge Synthesis Expert', emoji: '🔬', description: 'Conducts deep research, synthesizes findings, compares options' },
  { id: 'scout', name: 'The Scout', role: 'External Intelligence Gatherer', emoji: '🔭', description: 'Monitors trends, gathers external inspiration, tracks community' },
  { id: 'smith', name: 'The Smith', role: 'Builder of Infrastructure', emoji: '⚒️', description: 'Builds MCP servers, CLI tools, validation scripts, infrastructure' },
  { id: 'visualizer', name: 'The Visualizer', role: 'Builder of Portals', emoji: '🔮', description: 'Creates dashboards, knowledge graphs, monitoring interfaces' },
  { id: 'weaver', name: 'The Weaver', role: 'RAG Specialist', emoji: '🕸️', description: 'Implements embeddings, vector stores, semantic search systems' },
];

interface SkillMeta {
  id: string;
  createdAt: string;
  updatedAt: string;
  totalLines: number;
  totalFiles: number;
  skillMdSize: number;
  skillMdLines: number;
  hasReferences: boolean;
  hasExamples: boolean;
  hasChangelog: boolean;
}

// Council documents available
const councilDocs = [
  {
    id: 'decisions',
    title: 'Council Decisions',
    description: 'Architectural decisions and governance records',
    path: '/docs/council/decisions',
    icon: '📋'
  },
  {
    id: 'snapshots',
    title: 'Ecosystem Snapshots',
    description: 'Point-in-time ecosystem state captures',
    path: '/docs/council/snapshots',
    icon: '📸'
  },
  {
    id: 'liaison-reports',
    title: 'Liaison Reports',
    description: 'Human interface agent communications',
    path: '/docs/council/liaison-reports',
    icon: '📨'
  },
  {
    id: 'index',
    title: 'Council Overview',
    description: 'Introduction to the Council of Agents',
    path: '/docs/council/',
    icon: '🏛️'
  }
];

// Group skills by creation date
function groupSkillsByDate(skills: Record<string, SkillMeta>): Map<string, SkillMeta[]> {
  const groups = new Map<string, SkillMeta[]>();

  Object.values(skills).forEach(skill => {
    const date = skill.createdAt?.split('T')[0] ?? 'Unknown';
    if (!groups.has(date)) {
      groups.set(date, []);
    }
    groups.get(date)!.push(skill);
  });

  // Sort by date descending
  return new Map([...groups.entries()].sort((a, b) => b[0].localeCompare(a[0])));
}

// Format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Stats calculation
function calculateStats(skills: Record<string, SkillMeta>) {
  const skillList = Object.values(skills);
  const totalLines = skillList.reduce((sum, s) => sum + s.totalLines, 0);
  const withChangelog = skillList.filter(s => s.hasChangelog).length;
  const withReferences = skillList.filter(s => s.hasReferences).length;
  const withExamples = skillList.filter(s => s.hasExamples).length;

  const dates = skillList.map(s => new Date(s.createdAt).getTime());
  const earliest = new Date(Math.min(...dates));
  const latest = new Date(Math.max(...dates));

  return {
    totalSkills: skillList.length,
    totalLines,
    withChangelog,
    withReferences,
    withExamples,
    earliest,
    latest,
    avgLinesPerSkill: Math.round(totalLines / skillList.length)
  };
}

export default function EcosystemPage(): JSX.Element {
  const [selectedView, setSelectedView] = useState<'timeline' | 'agents' | 'documents' | 'stats'>('timeline');
  const [searchTerm, setSearchTerm] = useState('');

  const skills = skillMetadata.skills as Record<string, SkillMeta>;
  const stats = useMemo(() => calculateStats(skills), [skills]);
  const groupedSkills = useMemo(() => groupSkillsByDate(skills), [skills]);

  // Filter skills by search term
  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groupedSkills;

    const term = searchTerm.toLowerCase();
    const filtered = new Map<string, SkillMeta[]>();

    groupedSkills.forEach((skillList, date) => {
      const matching = skillList.filter(s => s.id.toLowerCase().includes(term));
      if (matching.length > 0) {
        filtered.set(date, matching);
      }
    });

    return filtered;
  }, [groupedSkills, searchTerm]);

  return (
    <Layout
      title="Ecosystem Dashboard"
      description="Skills timeline, council documents, and ecosystem metrics"
    >
      <Head>
        <meta name="keywords" content="skills, timeline, council, documentation, ecosystem" />
      </Head>

      <div style={{
        background: '#0f172a',
        minHeight: '100vh',
        paddingTop: '60px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px 24px 24px'
        }}>
          {/* Header */}
          <div className="win31-window" style={{ marginBottom: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">─</div>
              </div>
              <span className="win31-title-text">ECOSYSTEM.EXE - Knowledge Center</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">□</div>
              </div>
            </div>

            <div style={{ padding: '24px', background: 'var(--win31-gray)' }}>
              <h1 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '36px',
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
                Historical ledger of {stats.totalSkills} skills, council documentation, and ecosystem metrics.
                From {formatDate(stats.earliest.toISOString())} to {formatDate(stats.latest.toISOString())}.
              </p>

              {/* Quick Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px'
              }}>
                <StatBox label="Total Skills" value={stats.totalSkills} />
                <StatBox label="Total Lines" value={stats.totalLines.toLocaleString()} />
                <StatBox label="With Changelog" value={`${stats.withChangelog} (${Math.round(stats.withChangelog/stats.totalSkills*100)}%)`} />
                <StatBox label="With References" value={`${stats.withReferences} (${Math.round(stats.withReferences/stats.totalSkills*100)}%)`} />
              </div>
            </div>
          </div>

          {/* View Selector */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            padding: '8px',
            background: 'var(--win31-gray)',
            border: '2px solid var(--win31-black)'
          }}>
            <ViewButton
              label="📅 Skills Timeline"
              active={selectedView === 'timeline'}
              onClick={() => setSelectedView('timeline')}
            />
            <ViewButton
              label="🤖 Council Agents"
              active={selectedView === 'agents'}
              onClick={() => setSelectedView('agents')}
            />
            <ViewButton
              label="📚 Council Documents"
              active={selectedView === 'documents'}
              onClick={() => setSelectedView('documents')}
            />
            <ViewButton
              label="📊 Detailed Stats"
              active={selectedView === 'stats'}
              onClick={() => setSelectedView('stats')}
            />
          </div>

          {/* Content Area */}
          {selectedView === 'timeline' && (
            <SkillsTimeline
              groupedSkills={filteredGroups}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          )}

          {selectedView === 'agents' && (
            <AgentsGallery agents={agents} />
          )}

          {selectedView === 'documents' && (
            <DocumentBrowser docs={councilDocs} />
          )}

          {selectedView === 'stats' && (
            <DetailedStats skills={skills} stats={stats} />
          )}
        </div>
      </div>
    </Layout>
  );
}

// Stat Box Component
function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      background: '#fff',
      border: '2px solid var(--win31-dark-gray)',
      padding: '12px',
      boxShadow: 'inset -1px -1px 0 var(--win31-dark-gray)'
    }}>
      <div style={{
        fontFamily: 'var(--font-system)',
        fontSize: '10px',
        fontWeight: 600,
        textTransform: 'uppercase',
        color: 'var(--win31-dark-gray)',
        marginBottom: '4px'
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'var(--win31-navy)'
      }}>
        {value}
      </div>
    </div>
  );
}

// View Button Component
function ViewButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? 'var(--win31-navy)' : 'var(--win31-gray)',
        color: active ? 'white' : 'var(--win31-black)',
        border: active ? '2px inset var(--win31-white)' : '2px outset var(--win31-white)',
        padding: '8px 16px',
        fontFamily: 'var(--font-system)',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer'
      }}
    >
      {label}
    </button>
  );
}

// Skills Timeline Component
function SkillsTimeline({
  groupedSkills,
  searchTerm,
  onSearchChange
}: {
  groupedSkills: Map<string, SkillMeta[]>;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}) {
  return (
    <div className="win31-window">
      <div className="win31-titlebar">
        <div className="win31-titlebar__left">
          <div className="win31-btn-3d win31-btn-3d--small">─</div>
        </div>
        <span className="win31-title-text">TIMELINE.DAT - Skills Creation History</span>
        <div className="win31-titlebar__right">
          <div className="win31-btn-3d win31-btn-3d--small">▼</div>
        </div>
      </div>

      <div style={{ padding: '16px', background: 'var(--win31-gray)' }}>
        {/* Search */}
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search skills by name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              fontFamily: 'var(--font-code)',
              fontSize: '12px',
              border: '2px inset var(--win31-gray)',
              background: 'white'
            }}
          />
        </div>

        {/* Timeline */}
        <div style={{
          maxHeight: '600px',
          overflowY: 'auto',
          border: '2px inset var(--win31-dark-gray)',
          background: 'white',
          padding: '16px'
        }}>
          {Array.from(groupedSkills.entries()).map(([date, skills]) => (
            <div key={date} style={{ marginBottom: '24px' }}>
              {/* Date Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px',
                borderBottom: '2px solid var(--win31-dark-gray)',
                paddingBottom: '8px'
              }}>
                <div style={{
                  background: 'var(--win31-navy)',
                  color: 'white',
                  padding: '4px 12px',
                  fontFamily: 'var(--font-system)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {formatDate(date)}
                </div>
                <span style={{
                  fontFamily: 'var(--font-code)',
                  fontSize: '11px',
                  color: '#666'
                }}>
                  {skills.length} skill{skills.length > 1 ? 's' : ''} created
                </span>
              </div>

              {/* Skills */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '8px'
              }}>
                {skills.map(skill => (
                  <a
                    key={skill.id}
                    href={`/docs/skills/${skill.id.replace(/-/g, '_')}`}
                    style={{
                      display: 'block',
                      padding: '12px',
                      background: 'var(--win31-light-gray)',
                      border: '1px solid var(--win31-dark-gray)',
                      textDecoration: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--win31-navy)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--win31-light-gray)';
                      e.currentTarget.style.color = 'inherit';
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: '13px',
                      fontWeight: 600,
                      marginBottom: '4px',
                      color: 'inherit'
                    }}>
                      {skill.id}
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-code)'
                    }}>
                      <span>{skill.totalLines} lines</span>
                      <span>•</span>
                      <span>{skill.totalFiles} files</span>
                      {skill.hasChangelog && <span>• 📝</span>}
                      {skill.hasReferences && <span>• 📚</span>}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}

          {groupedSkills.size === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666',
              fontFamily: 'var(--font-code)'
            }}>
              No skills found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Document Browser Component
function DocumentBrowser({ docs }: { docs: typeof councilDocs }) {
  return (
    <div className="win31-window">
      <div className="win31-titlebar">
        <div className="win31-titlebar__left">
          <div className="win31-btn-3d win31-btn-3d--small">─</div>
        </div>
        <span className="win31-title-text">DOCS.EXE - Council Documentation Browser</span>
        <div className="win31-titlebar__right">
          <div className="win31-btn-3d win31-btn-3d--small">▼</div>
        </div>
      </div>

      <div style={{ padding: '16px', background: 'var(--win31-gray)' }}>
        <p style={{
          fontFamily: 'var(--font-code)',
          fontSize: '12px',
          color: '#333',
          marginBottom: '16px'
        }}>
          Browse the Council of Agents documentation. These documents capture decisions,
          snapshots, and communications from the agentic ecosystem.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {docs.map(doc => (
            <a
              key={doc.id}
              href={doc.path}
              style={{
                display: 'block',
                background: 'white',
                border: '2px solid var(--win31-dark-gray)',
                padding: '16px',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--win31-navy)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--win31-dark-gray)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '32px' }}>{doc.icon}</span>
                <div style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--win31-navy)'
                }}>
                  {doc.title}
                </div>
              </div>
              <p style={{
                fontFamily: 'var(--font-code)',
                fontSize: '12px',
                color: '#666',
                margin: 0,
                lineHeight: 1.5
              }}>
                {doc.description}
              </p>
            </a>
          ))}
        </div>

        {/* Archive Section */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{
            fontFamily: 'var(--font-system)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--win31-navy)',
            marginBottom: '12px'
          }}>
            Additional Resources
          </h3>

          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <ResourceLink href="/skills" label="All Skills Gallery" />
            <ResourceLink href="/artifacts" label="Artifacts & Examples" />
            <ResourceLink href="/docs/intro" label="Getting Started" />
            <ResourceLink href="/docs/guides/artifact-contribution-guide" label="Contribution Guide" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Resource Link Component
function ResourceLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-block',
        padding: '8px 16px',
        background: 'var(--win31-light-gray)',
        border: '2px outset var(--win31-white)',
        fontFamily: 'var(--font-system)',
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--win31-black)',
        textDecoration: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--win31-navy)';
        e.currentTarget.style.color = 'white';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--win31-light-gray)';
        e.currentTarget.style.color = 'var(--win31-black)';
      }}
    >
      {label}
    </a>
  );
}

// Detailed Stats Component
function DetailedStats({
  skills,
  stats
}: {
  skills: Record<string, SkillMeta>;
  stats: ReturnType<typeof calculateStats>;
}) {
  const skillList = Object.values(skills);

  // Top 10 largest skills by lines
  const largestSkills = [...skillList]
    .sort((a, b) => b.totalLines - a.totalLines)
    .slice(0, 10);

  // Most recently updated
  const recentlyUpdated = [...skillList]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Summary Stats */}
      <div className="win31-window">
        <div className="win31-titlebar">
          <div className="win31-titlebar__left">
            <div className="win31-btn-3d win31-btn-3d--small">─</div>
          </div>
          <span className="win31-title-text">STATS.DAT - Ecosystem Metrics</span>
          <div className="win31-titlebar__right">
            <div className="win31-btn-3d win31-btn-3d--small">▼</div>
          </div>
        </div>

        <div style={{ padding: '16px', background: 'var(--win31-gray)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px'
          }}>
            <StatBox label="Total Skills" value={stats.totalSkills} />
            <StatBox label="Total Lines of Code" value={stats.totalLines.toLocaleString()} />
            <StatBox label="Avg Lines/Skill" value={stats.avgLinesPerSkill} />
            <StatBox label="With Changelog" value={stats.withChangelog} />
            <StatBox label="With References" value={stats.withReferences} />
            <StatBox label="With Examples" value={stats.withExamples} />
          </div>
        </div>
      </div>

      {/* Largest Skills */}
      <div className="win31-window">
        <div className="win31-titlebar">
          <div className="win31-titlebar__left">
            <div className="win31-btn-3d win31-btn-3d--small">─</div>
          </div>
          <span className="win31-title-text">TOP10.DAT - Largest Skills by Lines</span>
          <div className="win31-titlebar__right">
            <div className="win31-btn-3d win31-btn-3d--small">▼</div>
          </div>
        </div>

        <div style={{ padding: '16px', background: 'var(--win31-gray)' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {largestSkills.map((skill, idx) => (
              <div
                key={skill.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px',
                  background: idx % 2 === 0 ? 'white' : 'var(--win31-light-gray)'
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: 'var(--win31-navy)',
                  width: '30px',
                  textAlign: 'center'
                }}>
                  {idx + 1}
                </span>
                <a
                  href={`/docs/skills/${skill.id.replace(/-/g, '_')}`}
                  style={{
                    flex: 1,
                    fontFamily: 'var(--font-system)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--win31-navy)',
                    textDecoration: 'none'
                  }}
                >
                  {skill.id}
                </a>
                <div style={{
                  flex: 1,
                  height: '16px',
                  background: 'var(--win31-light-gray)',
                  border: '1px solid var(--win31-dark-gray)',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${(skill.totalLines / largestSkills[0].totalLines) * 100}%`,
                    background: 'linear-gradient(90deg, var(--win31-navy), var(--win31-teal))'
                  }} />
                </div>
                <span style={{
                  fontFamily: 'var(--font-code)',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  width: '80px',
                  textAlign: 'right'
                }}>
                  {skill.totalLines.toLocaleString()} lines
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recently Updated */}
      <div className="win31-window">
        <div className="win31-titlebar">
          <div className="win31-titlebar__left">
            <div className="win31-btn-3d win31-btn-3d--small">─</div>
          </div>
          <span className="win31-title-text">RECENT.DAT - Recently Updated Skills</span>
          <div className="win31-titlebar__right">
            <div className="win31-btn-3d win31-btn-3d--small">▼</div>
          </div>
        </div>

        <div style={{ padding: '16px', background: 'var(--win31-gray)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '8px'
          }}>
            {recentlyUpdated.map(skill => (
              <a
                key={skill.id}
                href={`/docs/skills/${skill.id.replace(/-/g, '_')}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: 'white',
                  border: '1px solid var(--win31-dark-gray)',
                  textDecoration: 'none'
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--win31-navy)'
                }}>
                  {skill.id}
                </span>
                <span style={{
                  fontFamily: 'var(--font-code)',
                  fontSize: '10px',
                  color: '#666'
                }}>
                  {formatDate(skill.updatedAt)}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Agents Gallery Component
function AgentsGallery({ agents }: { agents: AgentMeta[] }) {
  return (
    <div className="win31-window">
      <div className="win31-titlebar">
        <div className="win31-titlebar__left">
          <div className="win31-btn-3d win31-btn-3d--small">─</div>
        </div>
        <span className="win31-title-text">AGENTS.EXE - Council of Agents</span>
        <div className="win31-titlebar__right">
          <div className="win31-btn-3d win31-btn-3d--small">▼</div>
        </div>
      </div>

      <div style={{ padding: '16px', background: 'var(--win31-gray)' }}>
        <p style={{
          fontFamily: 'var(--font-code)',
          fontSize: '12px',
          color: '#333',
          marginBottom: '16px'
        }}>
          The Council of Agents is a collaborative system of specialized AI agents, each with unique
          roles and capabilities. Together they form an emergent intelligence greater than the sum
          of their parts.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {agents.map(agent => (
            <div
              key={agent.id}
              style={{
                background: 'white',
                border: '2px solid var(--win31-dark-gray)',
                overflow: 'hidden',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--win31-navy)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--win31-dark-gray)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Hero Image */}
              <div style={{
                width: '100%',
                height: '160px',
                background: `url(/img/agents/${agent.id}-hero.png) center center / cover no-repeat`,
                borderBottom: '2px solid var(--win31-dark-gray)'
              }} />

              {/* Content */}
              <div style={{ padding: '16px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '24px' }}>{agent.emoji}</span>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-system)',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--win31-navy)'
                    }}>
                      {agent.name}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: '10px',
                      color: '#666'
                    }}>
                      {agent.role}
                    </div>
                  </div>
                </div>
                <p style={{
                  fontFamily: 'var(--font-code)',
                  fontSize: '11px',
                  color: '#333',
                  margin: 0,
                  lineHeight: 1.5
                }}>
                  {agent.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Council Overview Link */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <a
            href="/docs/council/"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'var(--win31-navy)',
              color: 'white',
              fontFamily: 'var(--font-system)',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              border: '2px outset var(--win31-white)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--win31-teal)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--win31-navy)';
            }}
          >
            Read Council Overview →
          </a>
        </div>
      </div>
    </div>
  );
}

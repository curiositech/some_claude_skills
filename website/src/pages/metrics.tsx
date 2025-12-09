import React, { useMemo } from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import { ALL_SKILLS } from '../data/skills';
import ecosystemData from '../data/ecosystem-state.json';
import skillMetadata from '../data/skillMetadata.json';
import '../css/win31.css';

interface SkillMetadataEntry {
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

export default function MetricsPage(): JSX.Element {
  // Calculate aggregate metrics
  const metrics = useMemo(() => {
    const skills = Object.values(skillMetadata.skills) as SkillMetadataEntry[];

    const totalLines = skills.reduce((sum, skill) => sum + skill.totalLines, 0);
    const totalFiles = skills.reduce((sum, skill) => sum + skill.totalFiles, 0);
    const avgLinesPerSkill = Math.round(totalLines / skills.length);
    const avgFilesPerSkill = (totalFiles / skills.length).toFixed(1);

    const withReferences = skills.filter(s => s.hasReferences).length;
    const withExamples = skills.filter(s => s.hasExamples).length;
    const withChangelog = skills.filter(s => s.hasChangelog).length;

    // Sort by most recent updates
    const recentlyUpdated = [...skills]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    // Sort by size (total lines)
    const largestSkills = [...skills]
      .sort((a, b) => b.totalLines - a.totalLines)
      .slice(0, 5);

    // Calculate creation dates to track growth
    const skillsByMonth = skills.reduce((acc, skill) => {
      const month = new Date(skill.createdAt).toISOString().substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSkills: skills.length,
      totalLines,
      totalFiles,
      avgLinesPerSkill,
      avgFilesPerSkill,
      withReferences,
      withExamples,
      withChangelog,
      recentlyUpdated,
      largestSkills,
      skillsByMonth,
    };
  }, []);

  return (
    <Layout
      title="Ecosystem Metrics"
      description="Growth metrics and statistics for the Claude Skills ecosystem"
    >
      <Head>
        <meta name="keywords" content="metrics, statistics, Claude skills, ecosystem growth, code metrics" />
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
              <span className="win31-title-text">METRICS.EXE - Ecosystem Statistics</span>
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
                Ecosystem Metrics
              </h1>

              <p style={{
                fontFamily: 'var(--font-code)',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#333',
                margin: 0
              }}>
                Real-time statistics and growth metrics for the Claude Skills ecosystem.
                Track skills development, code volume, documentation quality, and agent coordination patterns.
              </p>
            </div>
          </div>

          {/* Overview Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* Total Skills */}
            <div className="win31-window">
              <div className="win31-titlebar">
                <div className="win31-titlebar__left">
                  <div className="win31-btn-3d win31-btn-3d--small">─</div>
                </div>
                <span className="win31-title-text">SKILLS.SYS</span>
              </div>
              <div style={{ padding: '20px', background: 'var(--win31-gray)', textAlign: 'center' }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: 'var(--win31-blue)',
                  fontFamily: 'var(--font-code)'
                }}>
                  {metrics.totalSkills}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  fontFamily: 'var(--font-code)',
                  marginTop: '8px'
                }}>
                  Total Skills
                </div>
              </div>
            </div>

            {/* Total Agents */}
            <div className="win31-window">
              <div className="win31-titlebar">
                <div className="win31-titlebar__left">
                  <div className="win31-btn-3d win31-btn-3d--small">─</div>
                </div>
                <span className="win31-title-text">AGENTS.SYS</span>
              </div>
              <div style={{ padding: '20px', background: 'var(--win31-gray)', textAlign: 'center' }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#6366f1',
                  fontFamily: 'var(--font-code)'
                }}>
                  {ecosystemData.summary.total_agents}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  fontFamily: 'var(--font-code)',
                  marginTop: '8px'
                }}>
                  Active Agents
                </div>
              </div>
            </div>

            {/* Total Lines */}
            <div className="win31-window">
              <div className="win31-titlebar">
                <div className="win31-titlebar__left">
                  <div className="win31-btn-3d win31-btn-3d--small">─</div>
                </div>
                <span className="win31-title-text">CODE.SYS</span>
              </div>
              <div style={{ padding: '20px', background: 'var(--win31-gray)', textAlign: 'center' }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#10b981',
                  fontFamily: 'var(--font-code)'
                }}>
                  {(metrics.totalLines / 1000).toFixed(1)}k
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  fontFamily: 'var(--font-code)',
                  marginTop: '8px'
                }}>
                  Lines of Code
                </div>
              </div>
            </div>

            {/* Unique Tools */}
            <div className="win31-window">
              <div className="win31-titlebar">
                <div className="win31-titlebar__left">
                  <div className="win31-btn-3d win31-btn-3d--small">─</div>
                </div>
                <span className="win31-title-text">TOOLS.SYS</span>
              </div>
              <div style={{ padding: '20px', background: 'var(--win31-gray)', textAlign: 'center' }}>
                <div style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#f59e0b',
                  fontFamily: 'var(--font-code)'
                }}>
                  {ecosystemData.summary.unique_tools}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  fontFamily: 'var(--font-code)',
                  marginTop: '8px'
                }}>
                  Unique Tools
                </div>
              </div>
            </div>
          </div>

          {/* Two column layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Code Quality Metrics */}
            <div className="win31-window">
              <div className="win31-titlebar">
                <div className="win31-titlebar__left">
                  <div className="win31-btn-3d win31-btn-3d--small">─</div>
                </div>
                <span className="win31-title-text">QUALITY.RPT</span>
                <div className="win31-titlebar__right">
                  <div className="win31-btn-3d win31-btn-3d--small">▼</div>
                </div>
              </div>
              <div style={{ padding: '20px', background: 'var(--win31-gray)' }}>
                <h3 style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: '16px',
                  margin: '0 0 16px 0',
                  color: 'var(--win31-navy)'
                }}>
                  Code Quality
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-code)', fontSize: '12px', color: '#333' }}>
                      Avg Lines per Skill
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: 'var(--win31-navy)'
                    }}>
                      {metrics.avgLinesPerSkill}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-code)', fontSize: '12px', color: '#333' }}>
                      Avg Files per Skill
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: 'var(--win31-navy)'
                    }}>
                      {metrics.avgFilesPerSkill}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-code)', fontSize: '12px', color: '#333' }}>
                      With References
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#10b981'
                    }}>
                      {metrics.withReferences} ({Math.round(metrics.withReferences / metrics.totalSkills * 100)}%)
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-code)', fontSize: '12px', color: '#333' }}>
                      With Examples
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#10b981'
                    }}>
                      {metrics.withExamples} ({Math.round(metrics.withExamples / metrics.totalSkills * 100)}%)
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-code)', fontSize: '12px', color: '#333' }}>
                      With Changelog
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: '#10b981'
                    }}>
                      {metrics.withChangelog} ({Math.round(metrics.withChangelog / metrics.totalSkills * 100)}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Tools */}
            <div className="win31-window">
              <div className="win31-titlebar">
                <div className="win31-titlebar__left">
                  <div className="win31-btn-3d win31-btn-3d--small">─</div>
                </div>
                <span className="win31-title-text">TOP-TOOLS.DAT</span>
                <div className="win31-titlebar__right">
                  <div className="win31-btn-3d win31-btn-3d--small">▼</div>
                </div>
              </div>
              <div style={{ padding: '20px', background: 'var(--win31-gray)' }}>
                <h3 style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: '16px',
                  margin: '0 0 16px 0',
                  color: 'var(--win31-navy)'
                }}>
                  Most Used Tools
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(ecosystemData.tool_usage)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .slice(0, 8)
                    .map(([tool, count], index) => (
                      <div key={tool} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <div style={{
                          minWidth: '24px',
                          height: '20px',
                          background: index < 3 ? 'var(--win31-lime)' : 'var(--win31-light-gray)',
                          color: index < 3 ? '#000' : '#666',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontFamily: 'var(--font-code)',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          border: '1px solid #808080'
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            background: '#000',
                            height: '20px',
                            width: `${(count as number) / (ecosystemData.tool_usage.Read as number) * 100}%`,
                            minWidth: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            paddingLeft: '6px'
                          }}>
                            <span style={{
                              fontFamily: 'var(--font-code)',
                              fontSize: '11px',
                              color: 'var(--win31-lime)',
                              fontWeight: 'bold'
                            }}>
                              {tool}
                            </span>
                          </div>
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-code)',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          color: 'var(--win31-navy)',
                          minWidth: '30px',
                          textAlign: 'right'
                        }}>
                          {count}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recently Updated Skills */}
          <div className="win31-window" style={{ marginBottom: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">─</div>
              </div>
              <span className="win31-title-text">RECENT.LOG - Last Updated</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">▼</div>
              </div>
            </div>
            <div style={{ padding: '20px', background: 'var(--win31-gray)' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {metrics.recentlyUpdated.map((skill) => (
                  <a
                    key={skill.id}
                    href={`/docs/skills/${skill.id.replace(/-/g, '_')}`}
                    style={{
                      display: 'block',
                      background: '#fff',
                      border: '2px solid #808080',
                      padding: '12px',
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'var(--win31-navy)',
                      marginBottom: '6px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {skill.id}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: '10px',
                      color: '#666'
                    }}>
                      Updated: {new Date(skill.updatedAt).toLocaleDateString()}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: '10px',
                      color: '#999',
                      marginTop: '4px'
                    }}>
                      {skill.totalLines} lines · {skill.totalFiles} files
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Largest Skills */}
          <div className="win31-window" style={{ marginBottom: '24px' }}>
            <div className="win31-titlebar">
              <div className="win31-titlebar__left">
                <div className="win31-btn-3d win31-btn-3d--small">─</div>
              </div>
              <span className="win31-title-text">BIGFILE.DAT - Largest Skills</span>
              <div className="win31-titlebar__right">
                <div className="win31-btn-3d win31-btn-3d--small">▼</div>
              </div>
            </div>
            <div style={{ padding: '20px', background: 'var(--win31-gray)' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '12px'
              }}>
                {metrics.largestSkills.map((skill, index) => (
                  <a
                    key={skill.id}
                    href={`/docs/skills/${skill.id.replace(/-/g, '_')}`}
                    style={{
                      display: 'block',
                      background: index === 0 ? '#fff5cc' : '#fff',
                      border: index === 0 ? '2px solid var(--win31-bright-yellow)' : '2px solid #808080',
                      padding: '12px',
                      textDecoration: 'none',
                      color: 'inherit',
                      position: 'relative'
                    }}
                  >
                    {index === 0 && (
                      <div style={{
                        position: 'absolute',
                        top: '-1px',
                        right: '8px',
                        background: 'var(--win31-bright-yellow)',
                        color: '#000',
                        padding: '2px 6px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        fontFamily: 'var(--font-code)'
                      }}>
                        LARGEST
                      </div>
                    )}
                    <div style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'var(--win31-navy)',
                      marginBottom: '6px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {skill.id}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: '14px',
                      color: '#10b981',
                      fontWeight: 'bold'
                    }}>
                      {skill.totalLines.toLocaleString()} lines
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-code)',
                      fontSize: '10px',
                      color: '#666',
                      marginTop: '4px'
                    }}>
                      {skill.totalFiles} files · {(skill.skillMdSize / 1024).toFixed(1)}KB
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="win31-window">
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
              <p style={{
                fontFamily: 'var(--font-code)',
                fontSize: '12px',
                lineHeight: '1.6',
                color: '#333',
                margin: 0
              }}>
                <strong>Data Sources:</strong> Metrics are calculated from skill metadata, ecosystem state data,
                and git history. Updated automatically during build. Generated: {new Date(skillMetadata.generatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

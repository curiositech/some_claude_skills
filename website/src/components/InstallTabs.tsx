import React, { useState } from 'react';

interface InstallTabsProps {
  skillId: string;
  skillName: string;
  compact?: boolean;
}

type TabId = 'agent-skills' | 'claude-code' | 'claude-web' | 'claude-desktop';

interface TabConfig {
  id: TabId;
  label: string;
  icon: string;
  color: string;
  borderColor: string;
  requirement: string;
}

const tabs: TabConfig[] = [
  {
    id: 'agent-skills',
    label: 'Agent Skills',
    icon: 'skills',
    color: '#a78bfa',
    borderColor: '#a78bfa',
    requirement: 'Any agent',
  },
  {
    id: 'claude-code',
    label: 'Claude Code',
    icon: 'terminal',
    color: 'var(--win31-lime)',
    borderColor: 'var(--win31-lime)',
    requirement: 'CLI tool',
  },
  {
    id: 'claude-web',
    label: 'Claude.ai',
    icon: 'web',
    color: 'var(--win31-bright-yellow)',
    borderColor: 'var(--win31-bright-yellow)',
    requirement: 'Pro/Max/Team',
  },
  {
    id: 'claude-desktop',
    label: 'Desktop App',
    icon: 'desktop',
    color: '#8B7355',
    borderColor: '#8B7355',
    requirement: 'Pro/Max/Team',
  },
];

export default function InstallTabs({ skillId, skillName, compact = false }: InstallTabsProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('agent-skills');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(label);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedItem(label);
      setTimeout(() => setCopiedItem(null), 2000);
    }
  };

  const activeTabConfig = tabs.find(t => t.id === activeTab)!;
  const skillFileName = skillId.replace(/-/g, '_');
  const githubSkillUrl = `https://github.com/curiositech/some_claude_skills/blob/main/.claude/skills/${skillId}/SKILL.md`;
  const rawSkillUrl = `https://raw.githubusercontent.com/curiositech/some_claude_skills/main/.claude/skills/${skillId}/SKILL.md`;
  const githubFolderUrl = `https://github.com/curiositech/some_claude_skills/tree/main/.claude/skills/${skillId}`;

  return (
    <div style={{
      background: '#000',
      border: `3px solid ${activeTabConfig.borderColor}`,
      fontFamily: 'var(--font-code)',
    }}>
      {/* Tab Headers - ADHD friendly: large touch targets, clear active state */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #333',
        background: '#111',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: compact ? '10px 8px' : '14px 12px',
              border: 'none',
              background: activeTab === tab.id ? '#000' : 'transparent',
              color: activeTab === tab.id ? tab.color : '#666',
              cursor: 'pointer',
              fontFamily: 'var(--font-code)',
              fontSize: compact ? '11px' : '12px',
              fontWeight: activeTab === tab.id ? 'bold' : 'normal',
              borderBottom: activeTab === tab.id ? `3px solid ${tab.color}` : '3px solid transparent',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ fontSize: compact ? '14px' : '16px' }}>
              {tab.icon === 'skills' && '⚡'}
              {tab.icon === 'terminal' && '>_'}
              {tab.icon === 'web' && 'www'}
              {tab.icon === 'desktop' && 'app'}
            </span>
            <span>{tab.label}</span>
            <span style={{
              fontSize: '9px',
              opacity: 0.7,
              color: activeTab === tab.id ? tab.color : '#555',
            }}>
              {tab.requirement}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: compact ? '12px' : '16px' }}>
        {/* Agent Skills Tab */}
        {activeTab === 'agent-skills' && (
          <div>
            <div style={{
              background: '#1a0a2e',
              border: '1px solid #a78bfa',
              padding: '8px 10px',
              marginBottom: '12px',
              fontSize: '10px',
              color: '#a78bfa',
            }}>
              Works with Claude Code, Codex, Cursor, OpenCode, and any{' '}
              <a
                href="https://agentskills.io"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#c4b5fd', textDecoration: 'underline' }}
              >
                Agent Skills
              </a>
              {' '}compatible agent
            </div>

            {/* One-liner install */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}>
                <span style={{
                  background: '#a78bfa',
                  color: '#000',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  INSTALL
                </span>
                <span style={{ color: '#a78bfa', fontSize: '12px' }}>
                  Run this command in your terminal
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <code style={{
                  flex: 1,
                  background: '#111',
                  padding: '10px 12px',
                  border: '2px solid #a78bfa',
                  color: '#a78bfa',
                  fontSize: '11px',
                  display: 'block',
                }}>
                  npx skills add curiositech/some_claude_skills -s {skillId}
                </code>
                <button
                  onClick={() => copyToClipboard(`npx skills add curiositech/some_claude_skills -s ${skillId}`, 'agent-skills')}
                  style={{
                    background: copiedItem === 'agent-skills' ? '#a78bfa' : '#222',
                    border: '2px solid #a78bfa',
                    color: copiedItem === 'agent-skills' ? '#000' : '#a78bfa',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-code)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                >
                  {copiedItem === 'agent-skills' ? 'OK!' : 'COPY'}
                </button>
              </div>
            </div>

            {/* Install all */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}>
                <span style={{
                  background: '#7c3aed',
                  color: '#fff',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  OR
                </span>
                <span style={{ color: '#c4b5fd', fontSize: '12px' }}>
                  Install all skills at once
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <code style={{
                  flex: 1,
                  background: '#111',
                  padding: '10px 12px',
                  border: '2px solid #7c3aed',
                  color: '#c4b5fd',
                  fontSize: '11px',
                  display: 'block',
                }}>
                  npx skills add curiositech/some_claude_skills --all
                </code>
                <button
                  onClick={() => copyToClipboard('npx skills add curiositech/some_claude_skills --all', 'agent-skills-all')}
                  style={{
                    background: copiedItem === 'agent-skills-all' ? '#7c3aed' : '#222',
                    border: '2px solid #7c3aed',
                    color: copiedItem === 'agent-skills-all' ? '#fff' : '#c4b5fd',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-code)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                >
                  {copiedItem === 'agent-skills-all' ? 'OK!' : 'COPY'}
                </button>
              </div>
            </div>

            {/* Usage */}
            <div style={{
              background: '#111',
              border: '1px solid #333',
              padding: '10px',
              fontSize: '10px',
              color: '#888',
            }}>
              <span style={{ color: '#a78bfa' }}>Done!</span> The skill is installed to your agent&apos;s skills directory.
              Any compatible agent will auto-discover and load it when relevant.
            </div>

            {/* Attribution */}
            <div style={{
              marginTop: '12px',
              fontSize: '9px',
              color: '#555',
              textAlign: 'right',
            }}>
              Format:{' '}
              <a
                href="https://agentskills.io/specification"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--win31-teal)', textDecoration: 'underline' }}
              >
                Agent Skills Specification
              </a>
            </div>
          </div>
        )}

        {/* Claude Code Tab */}
        {activeTab === 'claude-code' && (
          <div>
            {/* Step 1: Add Marketplace */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}>
                <span style={{
                  background: 'var(--win31-lime)',
                  color: '#000',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  STEP 1
                </span>
                <span style={{ color: 'var(--win31-lime)', fontSize: '12px' }}>
                  Add the marketplace (one time only)
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <code style={{
                  flex: 1,
                  background: '#111',
                  padding: '10px 12px',
                  border: '2px solid var(--win31-lime)',
                  color: 'var(--win31-lime)',
                  fontSize: '11px',
                  display: 'block',
                }}>
                  /plugin marketplace add curiositech/some_claude_skills
                </code>
                <button
                  onClick={() => copyToClipboard('/plugin marketplace add curiositech/some_claude_skills', 'marketplace')}
                  style={{
                    background: copiedItem === 'marketplace' ? 'var(--win31-lime)' : '#222',
                    border: '2px solid var(--win31-lime)',
                    color: copiedItem === 'marketplace' ? '#000' : 'var(--win31-lime)',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-code)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                >
                  {copiedItem === 'marketplace' ? 'OK!' : 'COPY'}
                </button>
              </div>
            </div>

            {/* Step 2: Install Skill */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}>
                <span style={{
                  background: 'var(--win31-bright-yellow)',
                  color: '#000',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  STEP 2
                </span>
                <span style={{ color: 'var(--win31-bright-yellow)', fontSize: '12px' }}>
                  Install this skill
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <code style={{
                  flex: 1,
                  background: '#111',
                  padding: '10px 12px',
                  border: '2px solid var(--win31-bright-yellow)',
                  color: 'var(--win31-bright-yellow)',
                  fontSize: '11px',
                  display: 'block',
                }}>
                  /plugin install {skillId}@some-claude-skills
                </code>
                <button
                  onClick={() => copyToClipboard(`/plugin install ${skillId}@some-claude-skills`, 'install')}
                  style={{
                    background: copiedItem === 'install' ? 'var(--win31-bright-yellow)' : '#222',
                    border: '2px solid var(--win31-bright-yellow)',
                    color: copiedItem === 'install' ? '#000' : 'var(--win31-bright-yellow)',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-code)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                >
                  {copiedItem === 'install' ? 'OK!' : 'COPY'}
                </button>
              </div>
            </div>

            {/* Usage */}
            <div style={{
              background: '#111',
              border: '1px solid #333',
              padding: '10px',
              fontSize: '10px',
              color: '#888',
            }}>
              <span style={{ color: 'var(--win31-lime)' }}>Done!</span> Claude will auto-invoke this skill, or use{' '}
              <code style={{ color: 'var(--win31-bright-yellow)', background: '#222', padding: '2px 4px' }}>
                /skill {skillFileName}
              </code>
            </div>

            {/* Attribution */}
            <div style={{
              marginTop: '12px',
              fontSize: '9px',
              color: '#555',
              textAlign: 'right',
            }}>
              Source:{' '}
              <a
                href="https://code.claude.com/docs/en/plugin-marketplaces"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--win31-teal)', textDecoration: 'underline' }}
              >
                Claude Code Docs
              </a>
            </div>
          </div>
        )}

        {/* Claude.ai (Web) Tab */}
        {activeTab === 'claude-web' && (
          <div>
            <div style={{
              background: '#1a1a0a',
              border: '1px solid var(--win31-bright-yellow)',
              padding: '8px 10px',
              marginBottom: '12px',
              fontSize: '10px',
              color: 'var(--win31-bright-yellow)',
            }}>
              Requires Claude Pro, Max, Team, or Enterprise plan
            </div>

            {/* Step 1 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
              }}>
                <span style={{
                  background: 'var(--win31-bright-yellow)',
                  color: '#000',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  1
                </span>
                <span style={{ color: 'var(--win31-bright-yellow)', fontSize: '11px' }}>
                  Go to{' '}
                  <a
                    href="https://claude.ai/projects"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--win31-lime)', textDecoration: 'underline' }}
                  >
                    claude.ai/projects
                  </a>
                  {' '}and click <strong style={{ color: '#fff' }}>+ New Project</strong>
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
              }}>
                <span style={{
                  background: 'var(--win31-bright-yellow)',
                  color: '#000',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  2
                </span>
                <span style={{ color: 'var(--win31-bright-yellow)', fontSize: '11px' }}>
                  Name your project (e.g., "{skillName}")
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
              }}>
                <span style={{
                  background: 'var(--win31-bright-yellow)',
                  color: '#000',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  3
                </span>
                <span style={{ color: 'var(--win31-bright-yellow)', fontSize: '11px' }}>
                  Click <strong style={{ color: '#fff' }}>Set project instructions</strong>
                </span>
              </div>
            </div>

            {/* Step 4 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}>
                <span style={{
                  background: 'var(--win31-bright-yellow)',
                  color: '#000',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  4
                </span>
                <span style={{ color: 'var(--win31-bright-yellow)', fontSize: '11px' }}>
                  Copy & paste the skill content:
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <a
                  href={githubSkillUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    background: '#111',
                    border: '2px solid var(--win31-lime)',
                    color: 'var(--win31-lime)',
                    padding: '10px 12px',
                    fontSize: '11px',
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontFamily: 'var(--font-code)',
                  }}
                >
                  View on GitHub
                </a>
                <a
                  href={rawSkillUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    minWidth: '120px',
                    background: '#111',
                    border: '2px solid var(--win31-teal)',
                    color: 'var(--win31-teal)',
                    padding: '10px 12px',
                    fontSize: '11px',
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontFamily: 'var(--font-code)',
                  }}
                >
                  Raw Text (Copy All)
                </a>
              </div>
            </div>

            {/* Optional: Supporting Files */}
            <div style={{
              marginTop: '12px',
              padding: '10px',
              background: '#1a1a0a',
              border: '1px solid #333',
            }}>
              <div style={{
                fontSize: '10px',
                color: '#888',
                marginBottom: '6px',
              }}>
                📦 Optional: This skill includes validation scripts and reference docs
              </div>
              <a
                href={githubFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  background: '#111',
                  border: '2px solid #555',
                  color: '#aaa',
                  padding: '6px 10px',
                  fontSize: '10px',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-code)',
                }}
              >
                Browse Full Skill Package →
              </a>
            </div>

            {/* Attribution */}
            <div style={{
              marginTop: '12px',
              fontSize: '9px',
              color: '#555',
              textAlign: 'right',
            }}>
              Source:{' '}
              <a
                href="https://support.anthropic.com/en/articles/9519177-how-can-i-create-and-manage-projects"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--win31-teal)', textDecoration: 'underline' }}
              >
                Claude Help Center
              </a>
            </div>
          </div>
        )}

        {/* Claude Desktop Tab */}
        {activeTab === 'claude-desktop' && (
          <div>
            <div style={{
              background: '#1a1a0a',
              border: '1px solid #8B7355',
              padding: '8px 10px',
              marginBottom: '12px',
              fontSize: '10px',
              color: '#8B7355',
            }}>
              Requires Claude Pro, Max, Team, or Enterprise plan
            </div>

            {/* Step 1 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
              }}>
                <span style={{
                  background: '#8B7355',
                  color: '#fff',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  1
                </span>
                <span style={{ color: '#8B7355', fontSize: '11px' }}>
                  Open Claude Desktop and go to <strong style={{ color: '#fff' }}>Settings</strong> → <strong style={{ color: '#fff' }}>Capabilities</strong>
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
              }}>
                <span style={{
                  background: '#8B7355',
                  color: '#fff',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  2
                </span>
                <span style={{ color: '#8B7355', fontSize: '11px' }}>
                  Enable <strong style={{ color: '#fff' }}>"Code execution and file creation"</strong>
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
              }}>
                <span style={{
                  background: '#8B7355',
                  color: '#fff',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  3
                </span>
                <span style={{ color: '#8B7355', fontSize: '11px' }}>
                  Scroll down to the <strong style={{ color: '#fff' }}>Skills</strong> section
                </span>
              </div>
            </div>

            {/* Step 4 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px',
              }}>
                <span style={{
                  background: '#8B7355',
                  color: '#fff',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  4
                </span>
                <span style={{ color: '#8B7355', fontSize: '11px' }}>
                  Click <strong style={{ color: '#fff' }}>"Upload skill"</strong> button
                </span>
              </div>
            </div>

            {/* Step 5 */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
              }}>
                <span style={{
                  background: '#8B7355',
                  color: '#fff',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  5
                </span>
                <span style={{ color: '#8B7355', fontSize: '11px' }}>
                  Upload the skill ZIP file you downloaded from the{' '}
                  <strong style={{ color: 'var(--win31-teal)' }}>"Get This Skill"</strong>{' '}
                  panel above
                </span>
              </div>
            </div>

            {/* ZIP Requirements */}
            <div style={{
              marginTop: '12px',
              padding: '10px',
              background: '#0a1a1a',
              border: '1px solid #333',
            }}>
              <div style={{
                fontSize: '10px',
                color: '#888',
                marginBottom: '6px',
                fontWeight: 'bold',
              }}>
                📋 ZIP File Requirements:
              </div>
              <div style={{
                fontSize: '9px',
                color: '#666',
                lineHeight: '1.4',
              }}>
                • Must contain a folder named <code style={{ color: '#8B7355' }}>{skillId}</code><br/>
                • Folder must contain <code style={{ color: '#8B7355' }}>SKILL.md</code> file<br/>
                • Skill name in SKILL.md must match folder name
              </div>
            </div>

            {/* Attribution */}
            <div style={{
              marginTop: '12px',
              fontSize: '9px',
              color: '#555',
              textAlign: 'right',
            }}>
              Source:{' '}
              <a
                href="https://support.claude.com/en/articles/12512180-using-skills-in-claude"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--win31-teal)', textDecoration: 'underline' }}
              >
                Using Skills in Claude
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

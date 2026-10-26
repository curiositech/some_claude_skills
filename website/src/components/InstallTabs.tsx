import React, { useState } from 'react';

interface InstallTabsProps {
  skillId: string;
  skillName: string;
  compact?: boolean;
}

type TabId = 'claude-code' | 'claude-web' | 'claude-desktop';

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
    id: 'claude-code',
    label: 'Claude Code',
    icon: 'terminal',
    color: 'var(--theme-code-green)',
    borderColor: 'var(--theme-code-green)',
    requirement: 'CLI tool',
  },
  {
    id: 'claude-web',
    label: 'Claude.ai',
    icon: 'web',
    color: 'var(--theme-code-amber)',
    borderColor: 'var(--theme-code-amber)',
    requirement: 'Pro/Max/Team',
  },
  {
    id: 'claude-desktop',
    label: 'Desktop App',
    icon: 'desktop',
    color: 'var(--theme-code-amber)',
    borderColor: 'var(--theme-code-amber)',
    requirement: 'Pro/Max/Team',
  },
];

export default function InstallTabs({ skillId, skillName, compact = false }: InstallTabsProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('claude-code');
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
  const githubSkillUrl = `https://github.com/erichowens/some_claude_skills/blob/main/.claude/skills/${skillId}/SKILL.md`;
  const rawSkillUrl = `https://raw.githubusercontent.com/erichowens/some_claude_skills/main/.claude/skills/${skillId}/SKILL.md`;
  const githubFolderUrl = `https://github.com/erichowens/some_claude_skills/tree/main/.claude/skills/${skillId}`;

  return (
    <div style={{
      background: "var(--theme-code-bg)",
      border: `3px solid ${activeTabConfig.borderColor}`,
      fontFamily: 'var(--font-code)',
    }}>
      {/* Tab Headers - ADHD friendly: large touch targets, clear active state */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid var(--theme-code-muted)',
        background: "var(--theme-code-bg)",
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: compact ? '10px 8px' : '14px 12px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--theme-code-bg)' : 'transparent',
              color: activeTab === tab.id ? tab.color : 'var(--theme-code-muted)',
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
              {tab.icon === 'terminal' && '>_'}
              {tab.icon === 'web' && 'www'}
              {tab.icon === 'desktop' && 'app'}
            </span>
            <span>{tab.label}</span>
            <span style={{
              fontSize: '9px',
              color: activeTab === tab.id ? tab.color : 'var(--theme-code-muted)',
            }}>
              {tab.requirement}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: compact ? '12px' : '16px' }}>
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
                  background: 'var(--theme-code-green)',
                  color: "var(--theme-accent-ink)",
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  STEP 1
                </span>
                <span style={{ color: 'var(--theme-code-green)', fontSize: '12px' }}>
                  Add the marketplace (one time only)
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <code style={{
                  flex: 1,
                  background: "var(--theme-code-bg)",
                  padding: '10px 12px',
                  border: '2px solid var(--win31-lime)',
                  color: 'var(--theme-code-green)',
                  fontSize: '11px',
                  display: 'block',
                }}>
                  /plugin marketplace add erichowens/some_claude_skills
                </code>
                <button
                  onClick={() => copyToClipboard('/plugin marketplace add erichowens/some_claude_skills', 'marketplace')}
                  style={{
                    background: copiedItem === 'marketplace' ? 'var(--theme-code-green)' : 'var(--theme-code-bg)',
                    border: '2px solid var(--win31-lime)',
                    color: copiedItem === 'marketplace' ? 'var(--theme-accent-ink)' : 'var(--theme-code-green)',
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
                  background: 'var(--theme-code-amber)',
                  color: "var(--theme-accent-ink)",
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  STEP 2
                </span>
                <span style={{ color: 'var(--theme-code-amber)', fontSize: '12px' }}>
                  Install this skill
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <code style={{
                  flex: 1,
                  background: "var(--theme-code-bg)",
                  padding: '10px 12px',
                  border: '2px solid var(--win31-bright-yellow)',
                  color: 'var(--theme-code-amber)',
                  fontSize: '11px',
                  display: 'block',
                }}>
                  /plugin install {skillId}@some-claude-skills
                </code>
                <button
                  onClick={() => copyToClipboard(`/plugin install ${skillId}@some-claude-skills`, 'install')}
                  style={{
                    background: copiedItem === 'install' ? 'var(--theme-code-amber)' : 'var(--theme-code-bg)',
                    border: '2px solid var(--win31-bright-yellow)',
                    color: copiedItem === 'install' ? 'var(--theme-accent-ink)' : 'var(--theme-code-amber)',
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
              background: "var(--theme-code-bg)",
              border: '1px solid var(--theme-code-muted)',
              padding: '10px',
              fontSize: '10px',
              color: "var(--theme-code-muted)",
            }}>
              <span style={{ color: 'var(--theme-code-green)' }}>Done!</span> Claude will auto-invoke this skill, or use{' '}
              <code style={{ color: 'var(--theme-code-amber)', background: "var(--theme-code-bg)", padding: '2px 4px' }}>
                /skill {skillFileName}
              </code>
            </div>

            {/* Attribution */}
            <div style={{
              marginTop: '12px',
              fontSize: '9px',
              color: "var(--theme-code-muted)",
              textAlign: 'right',
            }}>
              Source:{' '}
              <a
                href="https://code.claude.com/docs/en/plugin-marketplaces"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--theme-code-blue)", textDecoration: 'underline' }}
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
              background: 'var(--theme-code-bg)',
              border: '1px solid var(--win31-bright-yellow)',
              padding: '8px 10px',
              marginBottom: '12px',
              fontSize: '10px',
              color: 'var(--theme-code-amber)',
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
                  background: 'var(--theme-code-amber)',
                  color: "var(--theme-accent-ink)",
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  1
                </span>
                <span style={{ color: 'var(--theme-code-amber)', fontSize: '11px' }}>
                  Go to{' '}
                  <a
                    href="https://claude.ai/projects"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--theme-code-green)', textDecoration: 'underline' }}
                  >
                    claude.ai/projects
                  </a>
                  {' '}and click <strong style={{ color: "var(--theme-titlebar-text)" }}>+ New Project</strong>
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
                  background: 'var(--theme-code-amber)',
                  color: "var(--theme-accent-ink)",
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  2
                </span>
                <span style={{ color: 'var(--theme-code-amber)', fontSize: '11px' }}>
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
                  background: 'var(--theme-code-amber)',
                  color: "var(--theme-accent-ink)",
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  3
                </span>
                <span style={{ color: 'var(--theme-code-amber)', fontSize: '11px' }}>
                  Click <strong style={{ color: "var(--theme-titlebar-text)" }}>Set project instructions</strong>
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
                  background: 'var(--theme-code-amber)',
                  color: "var(--theme-accent-ink)",
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  4
                </span>
                <span style={{ color: 'var(--theme-code-amber)', fontSize: '11px' }}>
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
                    background: "var(--theme-code-bg)",
                    border: '2px solid var(--win31-lime)',
                    color: 'var(--theme-code-green)',
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
                    background: "var(--theme-code-bg)",
                    border: '2px solid var(--win31-teal)',
                    color: "var(--theme-code-blue)",
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
              background: 'var(--theme-code-bg)',
              border: '1px solid var(--theme-code-muted)',
            }}>
              <div style={{
                fontSize: '10px',
                color: "var(--theme-code-muted)",
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
                  background: "var(--theme-code-bg)",
                  border: '2px solid var(--theme-code-muted)',
                  color: "var(--theme-code-muted)",
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
              color: "var(--theme-code-muted)",
              textAlign: 'right',
            }}>
              Source:{' '}
              <a
                href="https://support.anthropic.com/en/articles/9519177-how-can-i-create-and-manage-projects"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--theme-code-blue)", textDecoration: 'underline' }}
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
              background: 'var(--theme-code-bg)',
              border: '1px solid #8B7355',
              padding: '8px 10px',
              marginBottom: '12px',
              fontSize: '10px',
              color: 'var(--theme-code-amber)',
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
                  background: 'var(--theme-code-amber)',
                  color: "var(--theme-accent-ink)",
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  1
                </span>
                <span style={{ color: 'var(--theme-code-amber)', fontSize: '11px' }}>
                  Open Claude Desktop and go to <strong style={{ color: "var(--theme-titlebar-text)" }}>Settings</strong> → <strong style={{ color: "var(--theme-titlebar-text)" }}>Capabilities</strong>
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
                  background: 'var(--theme-code-amber)',
                  color: "var(--theme-accent-ink)",
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  2
                </span>
                <span style={{ color: 'var(--theme-code-amber)', fontSize: '11px' }}>
                  Enable <strong style={{ color: "var(--theme-titlebar-text)" }}>"Code execution and file creation"</strong>
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
                  background: 'var(--theme-code-amber)',
                  color: "var(--theme-accent-ink)",
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  3
                </span>
                <span style={{ color: 'var(--theme-code-amber)', fontSize: '11px' }}>
                  Scroll down to the <strong style={{ color: "var(--theme-titlebar-text)" }}>Skills</strong> section
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
                  background: 'var(--theme-code-amber)',
                  color: "var(--theme-accent-ink)",
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  4
                </span>
                <span style={{ color: 'var(--theme-code-amber)', fontSize: '11px' }}>
                  Click <strong style={{ color: "var(--theme-titlebar-text)" }}>"Upload skill"</strong> button
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
                  background: 'var(--theme-code-amber)',
                  color: "var(--theme-accent-ink)",
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}>
                  5
                </span>
                <span style={{ color: 'var(--theme-code-amber)', fontSize: '11px' }}>
                  Upload the skill ZIP file you downloaded from the{' '}
                  <strong style={{ color: "var(--theme-code-blue)" }}>"Get This Skill"</strong>{' '}
                  panel above
                </span>
              </div>
            </div>

            {/* ZIP Requirements */}
            <div style={{
              marginTop: '12px',
              padding: '10px',
              background: 'var(--theme-code-bg)',
              border: '1px solid var(--theme-code-muted)',
            }}>
              <div style={{
                fontSize: '10px',
                color: "var(--theme-code-muted)",
                marginBottom: '6px',
                fontWeight: 'bold',
              }}>
                📋 ZIP File Requirements:
              </div>
              <div style={{
                fontSize: '9px',
                color: "var(--theme-code-muted)",
                lineHeight: '1.4',
              }}>
                • Must contain a folder named <code style={{ color: 'var(--theme-code-amber)' }}>{skillId}</code><br/>
                • Folder must contain <code style={{ color: 'var(--theme-code-amber)' }}>SKILL.md</code> file<br/>
                • Skill name in SKILL.md must match folder name
              </div>
            </div>

            {/* Attribution */}
            <div style={{
              marginTop: '12px',
              fontSize: '9px',
              color: "var(--theme-code-muted)",
              textAlign: 'right',
            }}>
              Source:{' '}
              <a
                href="https://support.claude.com/en/articles/12512180-using-skills-in-claude"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--theme-code-blue)", textDecoration: 'underline' }}
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

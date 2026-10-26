import React, { useState } from 'react';
import InstallTabs from './InstallTabs';
import { TagList } from './TagBadge';
import { downloadSkillZip } from '@site/src/utils/downloadSkillZip';
import Win31FileManager from './Win31FileManager';
import { useSkillFolderData } from '@site/src/hooks/useSkillFolderData';
import '../css/win31.css';

interface SkillHeaderProps {
  skillName: string;
  fileName: string;
  description: string;
  tags?: string[];
}

export default function SkillHeader({ skillName, fileName, description, tags }: SkillHeaderProps): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFileBrowserOpen, setIsFileBrowserOpen] = useState(true); // Default open
  const [isDownloading, setIsDownloading] = useState(false);
  // Convert fileName (underscore format) to skillId (hyphen format)
  const skillId = fileName.replace(/_/g, '-');
  const githubFolderUrl = `https://github.com/erichowens/some_claude_skills/tree/main/.claude/skills/${skillId}`;

  // Load skill folder data
  const { folderData, loading, hasContent, fileCount, folderCount } = useSkillFolderData(skillId);

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await downloadSkillZip(skillId, skillName);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Hero Image Card */}
      <div
        style={{
          marginBottom: '24px',
          background: "var(--theme-code-bg)",
          border: '3px solid var(--win31-black)',
          overflow: 'hidden',
        }}
      >
        <img
          src={`/img/skills/${skillId}-hero.webp`}
          alt={`${skillName} Hero`}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
          }}
        />
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <TagList tags={tags} size="md" />
        </div>
      )}

      {/* Get This Skill Panel - Authentic Windows 3.1 Style */}
      <div
        className="win31-window"
        style={{
          marginBottom: '20px',
        }}
      >
        {/* Win31 Title Bar */}
        <div
          style={{
            background: 'var(--win31-navy)',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              className="win31-btn-3d win31-btn-3d--small"
              style={{ padding: '2px 6px', fontSize: '10px' }}
            >
              ─
            </div>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '12px',
              fontWeight: 'bold',
              color: "var(--theme-titlebar-text)",
              letterSpacing: '1px',
            }}
          >
            GET_SKILL.EXE
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div
              className="win31-btn-3d win31-btn-3d--small"
              style={{ padding: '2px 6px', fontSize: '10px' }}
            >
              ▲
            </div>
            <div
              className="win31-btn-3d win31-btn-3d--small"
              style={{ padding: '2px 6px', fontSize: '10px' }}
            >
              ▼
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div
          style={{
            background: 'var(--win31-gray)',
            padding: '16px 20px',
          }}
        >
          {/* Download Options */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {/* Download Skill Folder ZIP - Primary Action */}
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="win31-btn-3d"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '6px',
                padding: '14px 18px',
                cursor: isDownloading ? 'wait' : 'pointer',
                opacity: isDownloading ? 0.7 : 1,
                background: 'var(--win31-gray)',
                border: '2px solid var(--win31-black)',
                boxShadow:
                  'inset -2px -2px 0 var(--win31-dark-gray), inset 2px 2px 0 #fff, inset -3px -3px 0 var(--win31-black), inset 3px 3px 0 var(--win31-light-gray)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-system)',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: "var(--theme-text)",
                }}
              >
                <span style={{ fontSize: '18px' }}>
                  {isDownloading ? '⏳' : '📦'}
                </span>
                {isDownloading ? 'Downloading...' : 'Download Skill Folder'}
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: '11px',
                  color: "var(--theme-muted)",
                  lineHeight: '1.4',
                }}
              >
                {isDownloading
                  ? 'Creating zip file...'
                  : 'Complete skill folder with SKILL.md and all resources'}
              </div>
            </button>

            {/* View on GitHub - Secondary Action */}
            <a
              href={githubFolderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="win31-btn-3d"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '6px',
                textDecoration: 'none',
                padding: '14px 18px',
                background: 'var(--win31-gray)',
                boxShadow:
                  'inset -2px -2px 0 var(--win31-dark-gray), inset 2px 2px 0 #fff, inset -3px -3px 0 var(--win31-black), inset 3px 3px 0 var(--win31-light-gray)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-system)',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: "var(--theme-text)",
                }}
              >
                <span style={{ fontSize: '18px' }}>🔗</span>
                Browse on GitHub
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-system)',
                  fontSize: '11px',
                  color: "var(--theme-muted)",
                  lineHeight: '1.4',
                }}
              >
                View source code and explore the skill folder structure
              </div>
            </a>
          </div>
        </div>

        {/* Win31 Status Bar */}
        <div
          style={{
            background: 'var(--win31-gray)',
            borderTop: '2px solid var(--win31-dark-gray)',
            padding: '4px 8px',
            display: 'flex',
            gap: '4px',
          }}
        >
          <div
            style={{
              flex: 1,
              padding: '2px 8px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '10px',
              color: "var(--theme-text)",
              borderStyle: 'solid',
              borderWidth: '1px',
              borderColor: "var(--win31-dark-gray) var(--theme-border-light) var(--theme-border-light) var(--win31-dark-gray)",
            }}
          >
            Ready to install
          </div>
          <div
            style={{
              padding: '2px 8px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '10px',
              color: "var(--theme-text)",
              borderStyle: 'solid',
              borderWidth: '1px',
              borderColor: "var(--win31-dark-gray) var(--theme-border-light) var(--theme-border-light) var(--win31-dark-gray)",
            }}
          >
            MIT License
          </div>
        </div>
      </div>

      {/* Installation Instructions - Collapsible */}
      <div
        className="win31-panel win31-panel-inset"
        style={{
          background: 'var(--win31-yellow)',
          border: '3px solid var(--win31-black)',
          marginBottom: '24px',
        }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            color: "var(--theme-accent-ink)",
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          <span>📖 Installation Instructions (3 Easy Steps)</span>
          <span style={{ fontSize: '14px' }}>{isExpanded ? '▼' : '▶'}</span>
        </button>

        {isExpanded && (
          <div style={{ padding: '0 20px 20px 20px' }}>
            <div
              style={{
                fontFamily: 'var(--font-system)',
                fontSize: '13px',
                color: "var(--theme-accent-ink)",
                lineHeight: '1.6',
                marginBottom: '16px',
              }}
            >
              {description}
            </div>

            {/* Tabbed Installation Instructions */}
            <InstallTabs
              skillId={skillId}
              skillName={skillName}
              compact={false}
            />

            {/* Security Note - Win31 Group Box Style */}
            <div style={{
              marginTop: '16px',
              padding: '12px 14px 10px',
              background: 'var(--win31-gray)',
              border: '2px solid var(--win31-dark-gray)',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                top: '-8px',
                left: '12px',
                background: 'var(--theme-sticker-yellow)',
                padding: '0 6px',
                fontFamily: 'var(--font-pixel)',
                fontSize: '10px',
                fontWeight: 'bold',
                color: "var(--theme-accent-ink)",
              }}>
                ⚠ Security Note
              </div>
              <div style={{
                color: "var(--theme-text)",
                fontSize: '11px',
                fontFamily: 'var(--font-system)',
                marginTop: '4px',
              }}>
                Skills execute code. Only install from trusted sources.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File Browser - Only show if skill has additional content */}
      {hasContent && (
        <div
          className="win31-panel"
          style={{
            background: 'var(--win31-gray)',
            border: '3px solid var(--win31-black)',
            marginBottom: '24px',
          }}
        >
          <button
            onClick={() => setIsFileBrowserOpen(!isFileBrowserOpen)}
            style={{
              width: '100%',
              padding: '16px 20px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: 'var(--font-pixel)',
              fontSize: '10px',
              color: "var(--theme-text)",
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            <span>
              📁 Browse Skill Folder ({fileCount} file{fileCount !== 1 ? 's' : ''}, {folderCount} folder{folderCount !== 1 ? 's' : ''})
            </span>
            <span style={{ fontSize: '14px' }}>{isFileBrowserOpen ? '▼' : '▶'}</span>
          </button>

          {isFileBrowserOpen && (
            <div style={{ padding: '0 4px 4px 4px' }}>
              {loading ? (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  fontFamily: 'var(--font-system)',
                  color: "var(--theme-muted)",
                }}>
                  ⏳ Loading skill folder contents...
                </div>
              ) : folderData ? (
                <Win31FileManager
                  title={`FILE_MGR.EXE - ${skillId.toUpperCase().replace(/-/g, '_')}`}
                  rootFolder={folderData}
                  defaultExpanded={[skillId]}
                  height={450}
                  showStatusBar={true}
                />
              ) : (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  fontFamily: 'var(--font-system)',
                  color: "var(--theme-muted)",
                }}>
                  Could not load folder contents.{' '}
                  <a href={githubFolderUrl} target="_blank" rel="noopener noreferrer">
                    View on GitHub
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

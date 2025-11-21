import React from 'react';
import '../css/win31.css';

interface SkillHeaderProps {
  skillName: string;
  fileName: string;
  description: string;
}

export default function SkillHeader({ skillName, fileName, description }: SkillHeaderProps): JSX.Element {
  const downloadUrl = `https://raw.githubusercontent.com/erichowens/some_claude_skills/main/.claude/skills/${fileName}/skill.md`;

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Download Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <a
          href={downloadUrl}
          download={`${fileName}.md`}
          className="win31-push-button win31-push-button-default"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            padding: '8px 16px',
            fontSize: '14px',
            fontFamily: 'var(--font-system)',
            fontWeight: '600',
          }}
        >
          <span style={{ fontSize: '16px' }}>💾</span>
          Download Skill
        </a>
      </div>

      {/* TL;DR Box */}
      <div
        className="win31-panel win31-panel-inset"
        style={{
          padding: '20px',
          background: 'var(--win31-yellow)',
          border: '3px solid var(--win31-black)',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: '10px',
            color: 'var(--win31-black)',
            marginBottom: '12px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          ⚡ TL;DR - Quick Start
        </div>

        <div
          style={{
            fontFamily: 'var(--font-system)',
            fontSize: '13px',
            color: 'var(--win31-black)',
            lineHeight: '1.6',
            marginBottom: '16px',
          }}
        >
          {description}
        </div>

        <div
          style={{
            background: 'var(--win31-black)',
            color: 'var(--win31-lime)',
            padding: '16px',
            fontFamily: 'var(--font-code)',
            fontSize: '12px',
            lineHeight: '1.8',
            borderRadius: '0',
          }}
        >
          <div style={{ color: 'var(--win31-bright-yellow)', marginBottom: '8px', fontWeight: '600' }}>
            ▸ Installation Methods:
          </div>

          <div style={{ marginLeft: '12px', marginBottom: '12px' }}>
            <div style={{ color: 'var(--win31-bright-yellow)', marginBottom: '4px' }}>
              📦 Option 1: Plugin Marketplace (Recommended)
            </div>
            <div style={{ marginLeft: '12px' }}>
              <div>• Run <code style={{ background: '#333', padding: '2px 6px', color: 'var(--win31-bright-yellow)' }}>/plugin</code> in Claude Code</div>
              <div>• Search for <code style={{ background: '#333', padding: '2px 6px', color: 'var(--win31-lime)' }}>anthropics/skills</code></div>
              <div>• Install skills from the marketplace</div>
              <div>• Invoke with <code style={{ background: '#333', padding: '2px 6px', color: 'var(--win31-bright-yellow)' }}>/skill {fileName}</code></div>
            </div>
          </div>

          <div style={{ marginLeft: '12px', marginBottom: '12px' }}>
            <div style={{ color: 'var(--win31-bright-yellow)', marginBottom: '4px' }}>
              📝 Option 2: Manual Installation
            </div>
            <div style={{ marginLeft: '12px' }}>
              <div>• Download skill file (button above)</div>
              <div>• Place in <code style={{ background: '#333', padding: '2px 6px', color: 'var(--win31-lime)' }}>~/.claude/skills/{fileName}/</code></div>
              <div>• Rename to <code style={{ background: '#333', padding: '2px 6px', color: 'var(--win31-lime)' }}>skill.md</code></div>
              <div>• Invoke with <code style={{ background: '#333', padding: '2px 6px', color: 'var(--win31-bright-yellow)' }}>/skill {fileName}</code></div>
            </div>
          </div>

          <div style={{ marginTop: '12px', padding: '8px', background: '#1a1a1a', borderLeft: '3px solid var(--win31-bright-yellow)' }}>
            <div style={{ color: 'var(--win31-bright-yellow)', fontSize: '11px', marginBottom: '4px' }}>
              ⚠️ Security Note
            </div>
            <div style={{ color: 'var(--win31-dark-gray)', fontSize: '11px' }}>
              Skills execute code. Only install from trusted sources.
            </div>
          </div>

          <div style={{ marginTop: '12px', color: 'var(--win31-dark-gray)', fontSize: '11px' }}>
            💡 Also available: Claude Apps (Web) • API • Compatible AI tools
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOME CLAUDE SKILLS - AUTHENTIC WINDOWS 3.1 EXPERIENCE
 * Complete rewrite with real window management
 * ═══════════════════════════════════════════════════════════════════════════
 */

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { skills, categoryMeta, type Skill, type SkillCategory } from '@/lib/skills';
import { 
  WindowManagerProvider, 
  useWindowManager, 
  WindowRenderer, 
  Win31Taskbar 
} from '@/components/win31/window-manager';
import '@/styles/win31-authentic.css';

// ═══════════════════════════════════════════════════════════════════════════
// BOOT SCREEN
// ═══════════════════════════════════════════════════════════════════════════

function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return p + Math.random() * 15;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="win31-boot">
      <div className="win31-boot-text">Microsoft Windows</div>
      <div style={{ 
        width: 200, 
        height: 150, 
        background: 'linear-gradient(135deg, #000080 0%, #0000AA 50%, #000080 100%)',
        border: '4px outset #C0C0C0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
      }}>
        <div style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 10,
          color: '#00FFFF',
          textAlign: 'center',
        }}>
          SOME<br/>CLAUDE<br/>SKILLS
        </div>
      </div>
      <div className="win31-boot-progress">
        <div 
          className="win31-boot-progress-bar" 
          style={{ width: `${Math.min(100, progress)}%` }} 
        />
      </div>
      <div style={{ 
        marginTop: 16, 
        fontFamily: 'var(--font-system)', 
        fontSize: 11, 
        color: '#AAAAAA' 
      }}>
        Loading 173 skills...
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILL ICON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function SkillIcon({ skill, onClick }: { skill: Skill; onClick: () => void }) {
  return (
    <button className="win31-icon" onClick={onClick} title={skill.title}>
      {skill.skillIcon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={skill.skillIcon} 
          alt={skill.title}
          className="win31-icon-image"
          loading="lazy"
        />
      ) : (
        <span className="win31-icon-emoji">{skill.icon}</span>
      )}
      <span className="win31-icon-label">
        {skill.title.length > 12 ? skill.title.substring(0, 10) + '...' : skill.title}
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILL DETAIL VIEW
// ═══════════════════════════════════════════════════════════════════════════

function SkillDetail({ skill, onTagClick }: { skill: Skill; onTagClick: (tag: string) => void }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(skill.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="win31-doc" style={{ height: '100%', overflow: 'auto' }}>
      {/* Hero image */}
      {skill.skillHero && (
        <div style={{ 
          marginBottom: 16, 
          border: '2px inset #808080',
          maxHeight: 200,
          overflow: 'hidden',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={skill.skillHero} 
            alt={skill.title}
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      )}
      
      {/* Title and meta */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 48 }}>{skill.icon}</span>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 24 }}>{skill.title}</h1>
          <p style={{ margin: '8px 0 0', color: '#555' }}>{skill.description}</p>
        </div>
      </div>

      {/* Tags - CLICKABLE */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 16 }}>
        {skill.tags.map(tag => (
          <button 
            key={tag} 
            className="win31-tag"
            onClick={() => onTagClick(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Install command */}
      <div className="win31-groupbox" style={{ marginBottom: 16 }}>
        <span className="win31-groupbox-label">Quick Install</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <code style={{ 
            flex: 1, 
            padding: 8, 
            background: '#1A1A2E', 
            color: '#00FF00',
            fontFamily: 'var(--font-code)',
            fontSize: 11,
            overflow: 'auto',
          }}>
            {skill.installCommand}
          </code>
          <button className="win31-push-button" onClick={handleCopy}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* References */}
      {skill.references && skill.references.length > 0 && (
        <div className="win31-groupbox" style={{ marginBottom: 16 }}>
          <span className="win31-groupbox-label">References ({skill.references.length})</span>
          <div className="win31-listbox" style={{ maxHeight: 150 }}>
            {skill.references.map((ref, i) => (
              <div key={i} className="win31-listbox-item">
                📄 {ref.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="win31-groupbox">
        <span className="win31-groupbox-label">Documentation</span>
        <div style={{ 
          maxHeight: 400, 
          overflow: 'auto',
          fontFamily: 'var(--font-code)',
          fontSize: 12,
          whiteSpace: 'pre-wrap',
          lineHeight: 1.5,
        }}>
          {skill.content}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROGRAM MANAGER CONTENT
// ═══════════════════════════════════════════════════════════════════════════

function ProgramManagerContent() {
  const { openWindow } = useWindowManager();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const grouped: Record<SkillCategory, Skill[]> = {
      development: [],
      architecture: [],
      devops: [],
      design: [],
      data: [],
      testing: [],
      documentation: [],
      security: [],
    };
    
    skills.forEach(skill => {
      if (grouped[skill.category]) {
        grouped[skill.category].push(skill);
      }
    });
    
    return grouped;
  }, []);

  // Filter skills
  const filteredSkills = useMemo(() => {
    let result = skills;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s => 
        s.title.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term) ||
        s.tags.some(t => t.toLowerCase().includes(term))
      );
    }
    
    if (selectedTag) {
      result = result.filter(s => s.tags.includes(selectedTag));
    }
    
    return result;
  }, [searchTerm, selectedTag]);

  // Open skill detail window
  const openSkill = (skill: Skill) => {
    openWindow({
      id: `skill-${skill.id}`,
      title: `${skill.title}.md`,
      icon: <span>{skill.icon}</span>,
      x: 150 + Math.random() * 100,
      y: 100 + Math.random() * 50,
      width: 700,
      height: 500,
      minWidth: 400,
      minHeight: 300,
      content: <SkillDetail skill={skill} onTagClick={tag => {
        setSelectedTag(tag);
        setSearchTerm('');
      }} />,
    });
  };

  // Open category group window
  const openCategoryGroup = (category: SkillCategory) => {
    const meta = categoryMeta[category];
    const categorySkills = skillsByCategory[category];
    
    openWindow({
      id: `group-${category}`,
      title: meta.label,
      icon: <span>{meta.icon}</span>,
      x: 80 + Math.random() * 50,
      y: 60 + Math.random() * 30,
      width: 500,
      height: 400,
      minWidth: 300,
      minHeight: 200,
      content: (
        <div style={{ padding: 0 }}>
          <div className="win31-group-title">
            {meta.icon} {meta.label} ({categorySkills.length} skills)
          </div>
          <div className="win31-icon-grid">
            {categorySkills.map(skill => (
              <SkillIcon key={skill.id} skill={skill} onClick={() => openSkill(skill)} />
            ))}
          </div>
        </div>
      ),
    });
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Menu bar */}
      <div className="win31-menubar">
        <span className="win31-menu-item"><span className="accel">F</span>ile</span>
        <span className="win31-menu-item"><span className="accel">O</span>ptions</span>
        <span className="win31-menu-item"><span className="accel">W</span>indow</span>
        <span className="win31-menu-item"><span className="accel">H</span>elp</span>
      </div>

      {/* Search and filter bar */}
      <div style={{ 
        padding: 8, 
        background: 'var(--win31-light-gray)',
        borderBottom: '1px solid var(--bevel-mid-dark)',
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-system)', fontSize: 11 }}>Find:</span>
        <input 
          type="text"
          className="win31-input"
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setSelectedTag(null); }}
          placeholder="Search 173 skills..."
          style={{ flex: 1, maxWidth: 200 }}
        />
        {selectedTag && (
          <span 
            className="win31-tag" 
            onClick={() => setSelectedTag(null)}
            style={{ cursor: 'pointer' }}
          >
            {selectedTag} ✕
          </span>
        )}
        <span style={{ fontFamily: 'var(--font-system)', fontSize: 10, color: '#555' }}>
          {filteredSkills.length} skills
        </span>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        {searchTerm || selectedTag ? (
          // Search results
          <div className="win31-icon-grid">
            {filteredSkills.map(skill => (
              <SkillIcon key={skill.id} skill={skill} onClick={() => openSkill(skill)} />
            ))}
          </div>
        ) : (
          // Category groups
          <div className="win31-icon-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
            {(Object.keys(categoryMeta) as SkillCategory[]).map(cat => {
              const meta = categoryMeta[cat];
              const count = skillsByCategory[cat].length;
              return (
                <button 
                  key={cat} 
                  className="win31-icon"
                  onClick={() => openCategoryGroup(cat)}
                  style={{ padding: 8 }}
                >
                  <span style={{ fontSize: 32 }}>{meta.icon}</span>
                  <span className="win31-icon-label" style={{ maxWidth: 100 }}>
                    {meta.label}
                  </span>
                  <span style={{ fontSize: 9, color: '#555' }}>({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="win31-statusbar">
        <div className="win31-statusbar-panel" style={{ flex: 1 }}>
          {selectedTag ? `Filtering: ${selectedTag}` : searchTerm ? `Search: "${searchTerm}"` : 'Ready'}
        </div>
        <div className="win31-statusbar-panel">
          {filteredSkills.length} / {skills.length} skills
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN DESKTOP
// ═══════════════════════════════════════════════════════════════════════════

function Desktop() {
  const { openWindow } = useWindowManager();
  const [theme, setTheme] = useState<'default' | 'hotdog'>('default');

  // Open Program Manager on mount
  useEffect(() => {
    openWindow({
      id: 'program-manager',
      title: 'Program Manager',
      icon: <span>📁</span>,
      x: 50,
      y: 30,
      width: 800,
      height: 550,
      minWidth: 400,
      minHeight: 300,
      content: <ProgramManagerContent />,
    });
  }, [openWindow]);

  // Desktop icons
  const desktopIcons = [
    { 
      id: 'readme', 
      icon: '📖', 
      label: 'Read Me',
      onClick: () => openWindow({
        id: 'readme',
        title: 'README.TXT',
        icon: <span>📖</span>,
        x: 100,
        y: 150,
        width: 500,
        height: 400,
        content: (
          <div className="win31-doc">
            <h1>Welcome to Some Claude Skills</h1>
            <p>A curated gallery of <strong>173 Claude Code skills</strong> with an authentic Windows 3.1 aesthetic.</p>
            <h2>Quick Start</h2>
            <ol>
              <li>Double-click <strong>Program Manager</strong> to browse skills</li>
              <li>Click a category to see all skills in that group</li>
              <li>Click a skill to see its documentation</li>
              <li>Use the <strong>Copy</strong> button to install skills</li>
            </ol>
            <h2>Keyboard Shortcuts</h2>
            <ul>
              <li><kbd>Alt+F4</kbd> - Close window</li>
              <li><kbd>Shift+F5</kbd> - Cascade windows</li>
              <li><kbd>Shift+F4</kbd> - Tile windows</li>
            </ul>
            <h2>Theme</h2>
            <p>Try <strong>Hot Dog Stand</strong> from Options menu!</p>
          </div>
        ),
      }),
    },
    {
      id: 'winamp',
      icon: '🎵',
      label: 'Winamp',
      onClick: () => openWindow({
        id: 'winamp',
        title: 'Winamp 2.0',
        icon: <span>🎵</span>,
        x: 200,
        y: 200,
        width: 275,
        height: 350,
        minWidth: 275,
        minHeight: 300,
        content: (
          <div style={{ 
            height: '100%', 
            background: '#1A1A2E',
            color: '#00FF00',
            fontFamily: 'var(--font-system)',
            fontSize: 10,
            padding: 8,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              ████ WINAMP 2.0 ████
            </div>
            <div style={{ 
              background: '#000', 
              padding: 8, 
              marginBottom: 8,
              textAlign: 'center',
              color: '#0F0',
            }}>
              🎵 Ready to play...
            </div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 8 }}>
              <button className="win31-push-button" style={{ background: '#333', color: '#0F0', border: '1px solid #0F0' }}>⏮</button>
              <button className="win31-push-button" style={{ background: '#333', color: '#0F0', border: '1px solid #0F0' }}>▶</button>
              <button className="win31-push-button" style={{ background: '#333', color: '#0F0', border: '1px solid #0F0' }}>⏹</button>
              <button className="win31-push-button" style={{ background: '#333', color: '#0F0', border: '1px solid #0F0' }}>⏭</button>
            </div>
            <div style={{ textAlign: 'center', color: '#888', fontSize: 9 }}>
              Full music player coming soon!
              <br/>Port from Docusaurus in progress.
            </div>
          </div>
        ),
      }),
    },
    {
      id: 'theme',
      icon: '🎨',
      label: 'Themes',
      onClick: () => setTheme(t => t === 'default' ? 'hotdog' : 'default'),
    },
  ];

  return (
    <div className="win31-desktop" data-theme={theme}>
      {/* Desktop icons */}
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        right: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        {desktopIcons.map(item => (
          <button 
            key={item.id}
            className="win31-icon"
            onClick={item.onClick}
            style={{ background: 'transparent' }}
          >
            <span className="win31-icon-emoji">{item.icon}</span>
            <span className="win31-icon-label" style={{ 
              color: 'white', 
              textShadow: '1px 1px 2px black',
              background: 'transparent',
            }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Window renderer */}
      <WindowRenderer />
      
      {/* Taskbar */}
      <Win31Taskbar />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════

export default function HomePage() {
  const [booted, setBooted] = useState(false);

  return (
    <WindowManagerProvider>
      {!booted && <BootScreen onComplete={() => setBooted(true)} />}
      {booted && <Desktop />}
    </WindowManagerProvider>
  );
}

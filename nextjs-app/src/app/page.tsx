'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOME CLAUDE SKILLS - AUTHENTIC WINDOWS 3.1 PROGRAM MANAGER
 * 
 * Key differences from previous version:
 * - Program Manager CONTAINS group windows (MDI parent)
 * - Dense icon grid (64px), no truncation
 * - Groups are child windows inside Program Manager
 * - Proper Win31 spacing per the design skill
 * ═══════════════════════════════════════════════════════════════════════════
 */

import * as React from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { skills, categoryMeta, type Skill, type SkillCategory } from '@/lib/skills';
import '@/styles/win31-authentic.css';

// ═══════════════════════════════════════════════════════════════════════════
// SOUND EFFECTS
// ═══════════════════════════════════════════════════════════════════════════

function useSound(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(src);
      audioRef.current.volume = 0.3;
    }
  }, [src]);
  
  return () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOT SCREEN
// ═══════════════════════════════════════════════════════════════════════════

function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const playStartup = useSound('/audio/startup.mp3');
  
  useEffect(() => {
    playStartup();
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 200);
          return 100;
        }
        return p + Math.random() * 20;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [onComplete, playStartup]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#000080',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
    }}>
      <div style={{ 
        fontFamily: 'var(--font-display)', 
        fontSize: 12, 
        color: '#FFFFFF',
        marginBottom: 24,
        textAlign: 'center',
      }}>
        Microsoft® Windows™
      </div>
      <div style={{
        width: 280,
        height: 180,
        background: 'linear-gradient(180deg, #000080 0%, #0000AA 100%)',
        border: '4px outset #C0C0C0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
      }}>
        <div style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 8,
          color: '#00FFFF',
          textAlign: 'center',
          lineHeight: 1.8,
        }}>
          SOME<br/>CLAUDE<br/>SKILLS
        </div>
        <div style={{ 
          fontFamily: 'var(--font-system)', 
          fontSize: 10,
          color: '#FFFFFF',
          marginTop: 12,
        }}>
          173 Skills Available
        </div>
      </div>
      <div style={{
        width: 200,
        height: 16,
        background: '#000000',
        border: '2px solid #FFFFFF',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, progress)}%`,
          background: '#00AAAA',
          transition: 'width 80ms linear',
        }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILL ICON - Dense, Full Name
// ═══════════════════════════════════════════════════════════════════════════

function SkillIcon({ 
  skill, 
  onClick, 
  selected 
}: { 
  skill: Skill; 
  onClick: () => void; 
  selected: boolean;
}) {
  return (
    <button 
      className={`win31-icon ${selected ? 'win31-icon-selected' : ''}`}
      onClick={onClick}
      onDoubleClick={onClick}
      title={skill.description}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '4px 2px',
        gap: 2,
        background: selected ? 'var(--win31-navy)' : 'transparent',
        border: 'none',
        cursor: 'pointer',
        width: 64,
      }}
    >
      {skill.skillIcon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={skill.skillIcon} 
          alt=""
          style={{ width: 32, height: 32, imageRendering: 'pixelated' }}
          loading="lazy"
        />
      ) : (
        <span style={{ fontSize: 24, lineHeight: 1 }}>{skill.icon}</span>
      )}
      <span style={{
        fontFamily: 'var(--font-system)',
        fontSize: 9,
        textAlign: 'center',
        color: selected ? '#FFFFFF' : '#000000',
        wordBreak: 'break-word',
        lineHeight: 1.1,
        maxWidth: 60,
      }}>
        {skill.title}
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// GROUP WINDOW (Child window inside Program Manager)
// ═══════════════════════════════════════════════════════════════════════════

interface GroupWindowProps {
  title: string;
  icon: string;
  skills: Skill[];
  position: { x: number; y: number };
  size: { width: number; height: number };
  isActive: boolean;
  onActivate: () => void;
  onMinimize: () => void;
  onSkillSelect: (skill: Skill) => void;
  selectedSkillId: string | null;
}

function GroupWindow({ 
  title, 
  icon, 
  skills: groupSkills,
  position, 
  size,
  isActive,
  onActivate,
  onMinimize,
  onSkillSelect,
  selectedSkillId,
}: GroupWindowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState(position);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });

  useEffect(() => {
    if (!isDragging) return;
    
    const handleMove = (e: MouseEvent) => {
      setPos({
        x: pos.x + e.clientX - dragStart.current.x,
        y: pos.y + e.clientY - dragStart.current.y,
      });
      dragStart.current.x = e.clientX;
      dragStart.current.y = e.clientY;
    };
    
    const handleUp = () => setIsDragging(false);
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, pos]);

  return (
    <div 
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        width: size.width,
        height: size.height,
        background: '#C0C0C0',
        border: '2px solid',
        borderColor: '#FFFFFF #000000 #000000 #FFFFFF',
        boxShadow: 'inset 1px 1px 0 #DFDFDF, inset -1px -1px 0 #808080',
        display: 'flex',
        flexDirection: 'column',
        zIndex: isActive ? 10 : 1,
      }}
      onMouseDown={onActivate}
    >
      {/* Title bar */}
      <div 
        style={{
          background: isActive ? '#000080' : '#808080',
          color: '#FFFFFF',
          padding: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'move',
          fontFamily: 'var(--font-system)',
          fontSize: 11,
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          onActivate();
          setIsDragging(true);
          dragStart.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
        }}
      >
        <span>{icon}</span>
        <span style={{ flex: 1 }}>{title}</span>
        <button 
          onClick={(e) => { e.stopPropagation(); onMinimize(); }}
          style={{
            width: 16,
            height: 12,
            background: '#C0C0C0',
            border: '1px solid',
            borderColor: '#FFFFFF #000000 #000000 #FFFFFF',
            fontSize: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >▼</button>
      </div>
      
      {/* Content - Icon Grid */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 4,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, 64px)',
        gap: 2,
        alignContent: 'start',
      }}>
        {groupSkills.map(skill => (
          <SkillIcon 
            key={skill.id} 
            skill={skill} 
            onClick={() => onSkillSelect(skill)}
            selected={selectedSkillId === skill.id}
          />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILL DETAIL WINDOW
// ═══════════════════════════════════════════════════════════════════════════

function SkillDetailWindow({ 
  skill, 
  onClose,
  position,
}: { 
  skill: Skill; 
  onClose: () => void;
  position: { x: number; y: number };
}) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(skill.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{
      position: 'absolute',
      left: position.x,
      top: position.y,
      width: 500,
      height: 400,
      background: '#C0C0C0',
      border: '3px solid',
      borderColor: '#FFFFFF #000000 #000000 #FFFFFF',
      boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Title bar */}
      <div style={{
        background: '#000080',
        color: '#FFFFFF',
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        fontFamily: 'var(--font-system)',
        fontSize: 11,
      }}>
        <span>{skill.icon}</span>
        <span style={{ flex: 1 }}>{skill.title}.md</span>
        <button 
          onClick={onClose}
          style={{
            width: 16,
            height: 12,
            background: '#C0C0C0',
            border: '1px solid',
            borderColor: '#FFFFFF #000000 #000000 #FFFFFF',
            fontSize: 8,
            cursor: 'pointer',
          }}
        >✕</button>
      </div>
      
      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
        {/* Hero */}
        {skill.skillHero && (
          <div style={{ marginBottom: 8, border: '2px inset #808080' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={skill.skillHero} alt="" style={{ width: '100%', display: 'block' }} />
          </div>
        )}
        
        {/* Meta */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 32 }}>{skill.icon}</span>
          <div>
            <div style={{ fontFamily: 'var(--font-system)', fontSize: 14, fontWeight: 'bold' }}>
              {skill.title}
            </div>
            <div style={{ fontFamily: 'var(--font-system)', fontSize: 10, color: '#555' }}>
              {skill.description}
            </div>
          </div>
        </div>
        
        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 8 }}>
          {skill.tags.map(tag => (
            <span key={tag} style={{
              fontFamily: 'var(--font-system)',
              fontSize: 9,
              background: '#DFDFDF',
              border: '1px solid #808080',
              padding: '1px 4px',
            }}>{tag}</span>
          ))}
        </div>
        
        {/* Install */}
        <div style={{
          background: '#FFFFFF',
          border: '2px inset #808080',
          padding: 6,
          fontFamily: 'var(--font-code)',
          fontSize: 10,
          marginBottom: 8,
          display: 'flex',
          gap: 8,
        }}>
          <code style={{ flex: 1, overflow: 'auto' }}>{skill.installCommand}</code>
          <button 
            onClick={handleCopy}
            style={{
              background: '#C0C0C0',
              border: '2px solid',
              borderColor: '#FFFFFF #000000 #000000 #FFFFFF',
              padding: '2px 8px',
              fontFamily: 'var(--font-system)',
              fontSize: 10,
              cursor: 'pointer',
            }}
          >{copied ? '✓' : 'Copy'}</button>
        </div>
        
        {/* Doc content */}
        <div style={{
          background: '#FFFFF5',
          border: '2px inset #808080',
          padding: 8,
          fontFamily: 'var(--font-code)',
          fontSize: 10,
          lineHeight: 1.4,
          whiteSpace: 'pre-wrap',
          maxHeight: 200,
          overflow: 'auto',
        }}>
          {skill.content.substring(0, 2000)}
          {skill.content.length > 2000 && '...'}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APPLICATION
// ═══════════════════════════════════════════════════════════════════════════

export default function HomePage() {
  const [booted, setBooted] = useState(false);
  const [theme, setTheme] = useState<'default' | 'hotdog'>('default');
  const [activeGroup, setActiveGroup] = useState<SkillCategory | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [minimizedGroups, setMinimizedGroups] = useState<Set<SkillCategory>>(new Set());
  const [openGroups, setOpenGroups] = useState<Set<SkillCategory>>(new Set());
  
  const playClick = useSound('/audio/click.mp3');

  // Group skills by category
  const skillsByCategory = useMemo(() => {
    const grouped: Record<SkillCategory, Skill[]> = {
      development: [], architecture: [], devops: [], design: [],
      data: [], testing: [], documentation: [], security: [],
    };
    skills.forEach(skill => {
      if (grouped[skill.category]) grouped[skill.category].push(skill);
    });
    return grouped;
  }, []);

  // Calculate group positions in a cascade
  const groupPositions = useMemo(() => {
    const positions: Partial<Record<SkillCategory, { x: number; y: number }>> = {};
    const categories = Object.keys(categoryMeta) as SkillCategory[];
    categories.forEach((cat, i) => {
      positions[cat] = { x: 20 + (i % 4) * 30, y: 30 + Math.floor(i / 4) * 30 };
    });
    return positions as Record<SkillCategory, { x: number; y: number }>;
  }, []);

  const handleGroupOpen = (category: SkillCategory) => {
    playClick();
    setOpenGroups(prev => new Set([...prev, category]));
    setActiveGroup(category);
    setMinimizedGroups(prev => {
      const next = new Set(prev);
      next.delete(category);
      return next;
    });
  };

  const handleGroupMinimize = (category: SkillCategory) => {
    playClick();
    setMinimizedGroups(prev => new Set([...prev, category]));
    setActiveGroup(null);
  };

  const handleSkillSelect = (skill: Skill) => {
    playClick();
    setSelectedSkill(skill);
  };

  if (!booted) {
    return <BootScreen onComplete={() => setBooted(true)} />;
  }

  return (
    <div className="win31-desktop" data-theme={theme} style={{
      position: 'fixed',
      inset: 0,
      background: theme === 'hotdog' ? '#FF0000' : '#008080',
      overflow: 'hidden',
    }}>
      {/* ═══════════════════════════════════════════════════════════════════
          PROGRAM MANAGER (MDI Parent Window)
          ═══════════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute',
        top: 4,
        left: 4,
        right: 4,
        bottom: 40,
        background: '#C0C0C0',
        border: '3px solid',
        borderColor: '#FFFFFF #000000 #000000 #FFFFFF',
        boxShadow: 'inset 2px 2px 0 #DFDFDF, inset -2px -2px 0 #808080',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Title Bar */}
        <div style={{
          background: '#000080',
          color: '#FFFFFF',
          padding: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'var(--font-system)',
          fontSize: 12,
        }}>
          <span style={{ marginRight: 8 }}>📁</span>
          <span style={{ flex: 1 }}>Program Manager - Some Claude Skills</span>
          <button style={{
            width: 18,
            height: 14,
            background: '#C0C0C0',
            border: '1px solid',
            borderColor: '#FFFFFF #000000 #000000 #FFFFFF',
            fontSize: 8,
            cursor: 'pointer',
          }}>─</button>
        </div>

        {/* Menu Bar */}
        <div style={{
          background: '#C0C0C0',
          borderBottom: '1px solid #808080',
          padding: '1px 2px',
          display: 'flex',
          fontFamily: 'var(--font-system)',
          fontSize: 11,
        }}>
          <span style={{ padding: '2px 8px', cursor: 'pointer' }} className="win31-menu-item">
            <u>F</u>ile
          </span>
          <span 
            style={{ padding: '2px 8px', cursor: 'pointer' }} 
            className="win31-menu-item"
            onClick={() => setTheme(t => t === 'default' ? 'hotdog' : 'default')}
          >
            <u>O</u>ptions {theme === 'hotdog' && '🌭'}
          </span>
          <span style={{ padding: '2px 8px', cursor: 'pointer' }} className="win31-menu-item">
            <u>W</u>indow
          </span>
          <span style={{ padding: '2px 8px', cursor: 'pointer' }} className="win31-menu-item">
            <u>H</u>elp
          </span>
        </div>

        {/* MDI Client Area - Contains Group Windows */}
        <div style={{
          flex: 1,
          position: 'relative',
          background: theme === 'hotdog' ? '#FFFF00' : '#008080',
          overflow: 'hidden',
        }}>
          {/* Category Group Icons (when groups not open) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, 80px)',
            gap: 4,
            padding: 8,
          }}>
            {(Object.keys(categoryMeta) as SkillCategory[]).map(cat => {
              const meta = categoryMeta[cat];
              const count = skillsByCategory[cat].length;
              const isOpen = openGroups.has(cat) && !minimizedGroups.has(cat);
              
              if (isOpen) return null;
              
              return (
                <button 
                  key={cat}
                  onClick={() => handleGroupOpen(cat)}
                  onDoubleClick={() => handleGroupOpen(cat)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 4,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 28 }}>{meta.icon}</span>
                  <span style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 10,
                    color: '#FFFFFF',
                    textShadow: '1px 1px 0 #000',
                    textAlign: 'center',
                  }}>
                    {meta.label}<br/>({count})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Open Group Windows */}
          {(Object.keys(categoryMeta) as SkillCategory[]).map(cat => {
            if (!openGroups.has(cat) || minimizedGroups.has(cat)) return null;
            
            const meta = categoryMeta[cat];
            const groupSkills = skillsByCategory[cat];
            
            return (
              <GroupWindow
                key={cat}
                title={`${meta.label} (${groupSkills.length})`}
                icon={meta.icon}
                skills={groupSkills}
                position={groupPositions[cat]}
                size={{ width: 380, height: 280 }}
                isActive={activeGroup === cat}
                onActivate={() => setActiveGroup(cat)}
                onMinimize={() => handleGroupMinimize(cat)}
                onSkillSelect={handleSkillSelect}
                selectedSkillId={selectedSkill?.id || null}
              />
            );
          })}

          {/* Skill Detail Window */}
          {selectedSkill && (
            <SkillDetailWindow 
              skill={selectedSkill}
              position={{ x: 100, y: 50 }}
              onClose={() => setSelectedSkill(null)}
            />
          )}
        </div>

        {/* Status Bar */}
        <div style={{
          background: '#C0C0C0',
          borderTop: '1px solid #FFFFFF',
          padding: '2px 4px',
          display: 'flex',
          gap: 4,
          fontFamily: 'var(--font-system)',
          fontSize: 10,
        }}>
          <div style={{
            flex: 1,
            padding: '1px 4px',
            border: '1px solid',
            borderColor: '#808080 #FFFFFF #FFFFFF #808080',
          }}>
            {selectedSkill ? `Selected: ${selectedSkill.title}` : 'Double-click a group to open'}
          </div>
          <div style={{
            padding: '1px 4px',
            border: '1px solid',
            borderColor: '#808080 #FFFFFF #FFFFFF #808080',
          }}>
            {skills.length} skills
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TASKBAR (Minimized windows)
          ═══════════════════════════════════════════════════════════════════ */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 36,
        background: '#C0C0C0',
        borderTop: '2px solid #FFFFFF',
        display: 'flex',
        alignItems: 'center',
        padding: '2px 4px',
        gap: 4,
      }}>
        {/* Minimized groups */}
        {Array.from(minimizedGroups).map(cat => {
          const meta = categoryMeta[cat];
          return (
            <button
              key={cat}
              onClick={() => handleGroupOpen(cat)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '2px 8px',
                background: '#C0C0C0',
                border: '2px solid',
                borderColor: '#FFFFFF #000000 #000000 #FFFFFF',
                fontFamily: 'var(--font-system)',
                fontSize: 10,
                cursor: 'pointer',
              }}
            >
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
            </button>
          );
        })}
        
        <div style={{ flex: 1 }} />
        
        {/* Clock */}
        <div style={{
          padding: '2px 8px',
          border: '1px solid',
          borderColor: '#808080 #FFFFFF #FFFFFF #808080',
          fontFamily: 'var(--font-system)',
          fontSize: 10,
        }}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

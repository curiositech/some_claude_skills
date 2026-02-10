'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOME CLAUDE SKILLS - FUN WINDOWS 3.1 EXPERIENCE
 * 
 * Features:
 * - 10 meaningful skill categories (not just "development")
 * - Webscape Navigator with Dagoogle/Ask Dageeves search
 * - Animated backgrounds (Gorillas, Clock, Solitaire, Life)
 * - Winamp music player
 * - Full MDI Program Manager
 * ═══════════════════════════════════════════════════════════════════════════
 */

import * as React from 'react';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { skills, type Skill } from '@/lib/skills';
import { 
  categoryMeta as newCategoryMeta, 
  type SkillCategory, 
  getSkillCategory 
} from '@/lib/skill-taxonomy';
import { AnimatedDesktopBackgrounds } from '@/components/fun/animated-backgrounds';
import { WebscapeNavigator } from '@/components/fun/webscape-navigator';
import { MusicPlayerProvider, useMusicPlayer, WinampModal } from '@/components/winamp';
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
  
  return useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  }, []);
}

// ═══════════════════════════════════════════════════════════════════════════
// BOOT SCREEN - Windows Style
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
          setTimeout(onComplete, 300);
          return 100;
        }
        return p + Math.random() * 15;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [onComplete, playStartup]);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'linear-gradient(180deg, #000080 0%, #0000AA 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
    }}>
      {/* Windows Logo */}
      <div style={{ 
        fontSize: 48, 
        marginBottom: 20,
        animation: 'pulse 1s ease-in-out infinite',
      }}>
        🪟
      </div>
      
      <div style={{ 
        fontFamily: 'var(--font-display)', 
        fontSize: 14, 
        color: '#FFFFFF',
        marginBottom: 8,
        letterSpacing: 2,
      }}>
        Microsoft® Windows™
      </div>
      
      <div style={{ 
        fontFamily: 'var(--font-system)', 
        fontSize: 11, 
        color: '#00FFFF',
        marginBottom: 40,
      }}>
        Version 3.1
      </div>
      
      {/* Splash Art */}
      <div style={{
        width: 320,
        height: 200,
        background: 'linear-gradient(135deg, #FF69B4 0%, #00CED1 50%, #FFD700 100%)',
        border: '4px outset #C0C0C0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        boxShadow: '0 0 60px rgba(255, 105, 180, 0.5)',
      }}>
        <div style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 28,
          color: '#000080',
          textShadow: '2px 2px 0 #FFF',
          textAlign: 'center',
          lineHeight: 1.3,
        }}>
          SOME<br/>CLAUDE<br/>SKILLS
        </div>
        <div style={{ 
          fontFamily: 'var(--font-system)', 
          fontSize: 12,
          color: '#000080',
          marginTop: 16,
          background: '#FFFFFF',
          padding: '4px 12px',
        }}>
          🤖 173 AI Skills Available
        </div>
      </div>
      
      {/* Progress Bar */}
      <div style={{ fontFamily: 'var(--font-system)', fontSize: 10, color: '#FFFFFF', marginBottom: 8 }}>
        Loading skills...
      </div>
      <div style={{
        width: 280,
        height: 20,
        background: '#000000',
        border: '2px solid #FFFFFF',
        padding: 2,
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, progress)}%`,
          background: 'linear-gradient(90deg, #00AAAA 0%, #00FFFF 100%)',
          transition: 'width 100ms linear',
        }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILL ICON - Dense grid, full names
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
        width: 72,
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
        <span style={{ fontSize: 28, lineHeight: 1 }}>{skill.icon}</span>
      )}
      <span style={{
        fontFamily: 'var(--font-system)',
        fontSize: 9,
        textAlign: 'center',
        color: selected ? '#FFFFFF' : '#000000',
        wordBreak: 'break-word',
        lineHeight: 1.1,
        maxWidth: 68,
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
  color: string;
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
  color,
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
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDragging) return;
    
    const handleMove = (e: MouseEvent) => {
      setPos(p => ({
        x: p.x + e.clientX - dragStart.current.x,
        y: p.y + e.clientY - dragStart.current.y,
      }));
      dragStart.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleUp = () => setIsDragging(false);
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging]);

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
        boxShadow: 'inset 1px 1px 0 #DFDFDF, inset -1px -1px 0 #808080, 2px 2px 8px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: isActive ? 10 : 1,
      }}
      onMouseDown={onActivate}
    >
      {/* Title bar with category color accent */}
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
          borderBottom: `2px solid ${color}`,
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          onActivate();
          setIsDragging(true);
          dragStart.current = { x: e.clientX, y: e.clientY };
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
      
      {/* Icon Grid */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 4,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, 72px)',
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
      
      {/* Status */}
      <div style={{
        padding: '2px 4px',
        borderTop: '1px solid #808080',
        fontFamily: 'var(--font-system)',
        fontSize: 9,
        color: '#555',
      }}>
        {groupSkills.length} skills
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
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState(position);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      setPos(p => ({
        x: p.x + e.clientX - dragStart.current.x,
        y: p.y + e.clientY - dragStart.current.y,
      }));
      dragStart.current = { x: e.clientX, y: e.clientY };
    };
    const handleUp = () => setIsDragging(false);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging]);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(skill.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{
      position: 'absolute',
      left: pos.x,
      top: pos.y,
      width: 520,
      maxHeight: 450,
      background: '#C0C0C0',
      border: '3px solid',
      borderColor: '#FFFFFF #000000 #000000 #FFFFFF',
      boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
    }}>
      {/* Title bar */}
      <div 
        style={{
          background: '#000080',
          color: '#FFFFFF',
          padding: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontFamily: 'var(--font-system)',
          fontSize: 11,
          cursor: 'move',
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
          dragStart.current = { x: e.clientX, y: e.clientY };
        }}
      >
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
        {/* Hero Image */}
        {skill.skillHero && (
          <div style={{ 
            marginBottom: 8, 
            border: '2px inset #808080',
            background: '#000',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={skill.skillHero} alt="" style={{ width: '100%', display: 'block' }} loading="lazy" />
          </div>
        )}
        
        {/* Meta */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {skill.skillIcon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={skill.skillIcon} alt="" style={{ width: 48, height: 48, imageRendering: 'pixelated' }} />
          ) : (
            <span style={{ fontSize: 40 }}>{skill.icon}</span>
          )}
          <div>
            <div style={{ fontFamily: 'var(--font-system)', fontSize: 14, fontWeight: 'bold' }}>
              {skill.title}
            </div>
            <div style={{ fontFamily: 'var(--font-system)', fontSize: 10, color: '#555', lineHeight: 1.3 }}>
              {skill.description}
            </div>
          </div>
        </div>
        
        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 8 }}>
          {skill.tags.slice(0, 8).map(tag => (
            <span key={tag} style={{
              fontFamily: 'var(--font-system)',
              fontSize: 9,
              background: '#DFDFDF',
              border: '1px solid #808080',
              padding: '1px 4px',
              cursor: 'pointer',
            }}>{tag}</span>
          ))}
        </div>
        
        {/* Install Command */}
        <div style={{
          background: '#000000',
          border: '2px inset #808080',
          padding: 8,
          fontFamily: 'var(--font-code)',
          fontSize: 11,
          marginBottom: 8,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
        }}>
          <code style={{ flex: 1, color: '#00FF00', overflow: 'auto' }}>{skill.installCommand}</code>
          <button 
            onClick={handleCopy}
            style={{
              background: '#C0C0C0',
              border: '2px solid',
              borderColor: '#FFFFFF #000000 #000000 #FFFFFF',
              padding: '4px 12px',
              fontFamily: 'var(--font-system)',
              fontSize: 10,
              cursor: 'pointer',
            }}
          >{copied ? '✓ Copied!' : '📋 Copy'}</button>
        </div>
        
        {/* Content Preview */}
        <div style={{
          background: '#FFFFF8',
          border: '2px inset #808080',
          padding: 8,
          fontFamily: 'var(--font-code)',
          fontSize: 10,
          lineHeight: 1.4,
          whiteSpace: 'pre-wrap',
          maxHeight: 180,
          overflow: 'auto',
        }}>
          {skill.content.substring(0, 1500)}
          {skill.content.length > 1500 && '...'}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP CONTENT
// ═══════════════════════════════════════════════════════════════════════════

function MainAppContent() {
  const [theme, setTheme] = useState<'default' | 'hotdog'>('default');
  const [activeGroup, setActiveGroup] = useState<SkillCategory | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [minimizedGroups, setMinimizedGroups] = useState<Set<SkillCategory>>(new Set());
  const [openGroups, setOpenGroups] = useState<Set<SkillCategory>>(new Set());
  const [showBrowser, setShowBrowser] = useState(false); // Don't block view on first load
  const [showBackgrounds, setShowBackgrounds] = useState(true);
  
  const playClick = useSound('/audio/click.mp3');
  const { setMinimized: setWinampMinimized, isMinimized: winampMinimized } = useMusicPlayer();

  // Group skills by NEW TAXONOMY
  const skillsByCategory = useMemo(() => {
    const grouped: Record<SkillCategory, Skill[]> = {
      'ai-agents': [], 'design-ux': [], 'web-frontend': [], 'backend-infra': [],
      'audio-media': [], 'career-personal': [], 'health-wellness': [],
      'testing-quality': [], 'data-analytics': [], 'writing-docs': [],
    };
    skills.forEach(skill => {
      const cat = getSkillCategory(skill.id);
      if (grouped[cat]) grouped[cat].push(skill);
    });
    return grouped;
  }, []);

  // Calculate group positions
  const groupPositions = useMemo(() => {
    const positions: Partial<Record<SkillCategory, { x: number; y: number }>> = {};
    const categories = Object.keys(newCategoryMeta) as SkillCategory[];
    categories.forEach((cat, i) => {
      const col = i % 5;
      const row = Math.floor(i / 5);
      positions[cat] = { x: 20 + col * 40, y: 30 + row * 40 };
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

  const handleSearch = (query: string) => {
    // Search skills
    const matching = skills.find(s => 
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase())
    );
    if (matching) {
      setSelectedSkill(matching);
      setShowBrowser(false);
    }
  };

  return (
    <div className="win31-desktop" data-theme={theme} style={{
      position: 'fixed',
      inset: 0,
      background: theme === 'hotdog' ? '#FF0000' : '#008080',
      overflow: 'hidden',
    }}>
      {/* Animated Backgrounds */}
      {showBackgrounds && <AnimatedDesktopBackgrounds />}

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
        zIndex: 10,
      }}>
        {/* Title Bar */}
        <div style={{
          background: 'linear-gradient(90deg, #000080 0%, #1084D0 100%)',
          color: '#FFFFFF',
          padding: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          fontFamily: 'var(--font-system)',
          fontSize: 12,
        }}>
          <span style={{ marginRight: 8 }}>📁</span>
          <span style={{ flex: 1 }}>Program Manager - Some Claude Skills</span>
          <button 
            onClick={() => setShowBackgrounds(!showBackgrounds)}
            style={{
              width: 18,
              height: 14,
              background: '#C0C0C0',
              border: '1px solid',
              borderColor: '#FFFFFF #000000 #000000 #FFFFFF',
              fontSize: 8,
              cursor: 'pointer',
              marginRight: 4,
            }}
            title={showBackgrounds ? 'Hide Games' : 'Show Games'}
          >
            {showBackgrounds ? '🎮' : '⬜'}
          </button>
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
          <span style={{ padding: '2px 8px', cursor: 'pointer' }}>
            <u>F</u>ile
          </span>
          <span 
            style={{ padding: '2px 8px', cursor: 'pointer' }} 
            onClick={() => setTheme(t => t === 'default' ? 'hotdog' : 'default')}
          >
            <u>O</u>ptions {theme === 'hotdog' && '🌭'}
          </span>
          <span 
            style={{ padding: '2px 8px', cursor: 'pointer' }}
            onClick={() => setShowBrowser(true)}
          >
            <u>S</u>earch 🔍
          </span>
          <span 
            style={{ padding: '2px 8px', cursor: 'pointer' }}
            onClick={() => setWinampMinimized(false)}
          >
            <u>M</u>usic 🎵
          </span>
          <span style={{ padding: '2px 8px', cursor: 'pointer' }}>
            <u>H</u>elp
          </span>
        </div>

        {/* MDI Client Area */}
        <div style={{
          flex: 1,
          position: 'relative',
          background: theme === 'hotdog' ? '#FFFF00' : '#008080',
          overflow: 'hidden',
        }}>
          {/* Welcome Banner - Featured Skills */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(255,105,180,0.9) 0%, rgba(0,206,209,0.9) 50%, rgba(255,215,0,0.9) 100%)',
            margin: 8,
            padding: 12,
            border: '2px solid #000',
            boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            alignItems: 'center',
          }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ 
                fontFamily: 'var(--font-display)', 
                fontSize: 16, 
                color: '#000080',
                textShadow: '1px 1px 0 #FFF',
                marginBottom: 4,
              }}>
                🎯 Welcome to Some Claude Skills!
              </div>
              <div style={{ 
                fontFamily: 'var(--font-system)', 
                fontSize: 11, 
                color: '#333',
              }}>
                173 skills to supercharge your Claude AI. Double-click a category to explore.
              </div>
            </div>
            <button
              onClick={() => setShowBrowser(true)}
              style={{
                background: '#000080',
                color: '#FFF',
                border: '2px solid',
                borderColor: '#FFFFFF #000000 #000000 #FFFFFF',
                padding: '8px 16px',
                fontFamily: 'var(--font-system)',
                fontSize: 11,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              🔍 Search Skills
            </button>
            <button
              onClick={() => {
                const skill = skills.find(s => s.id === 'prompt-engineer');
                if (skill) setSelectedSkill(skill);
              }}
              style={{
                background: '#C0C0C0',
                border: '2px solid',
                borderColor: '#FFFFFF #000000 #000000 #FFFFFF',
                padding: '8px 16px',
                fontFamily: 'var(--font-system)',
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              ⭐ Start with Prompt Engineer
            </button>
          </div>

          {/* Category Group Icons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, 90px)',
            gap: 4,
            padding: 8,
          }}>
            {(Object.keys(newCategoryMeta) as SkillCategory[]).map(cat => {
              const meta = newCategoryMeta[cat];
              const count = skillsByCategory[cat].length;
              const isOpen = openGroups.has(cat) && !minimizedGroups.has(cat);
              
              if (isOpen || count === 0) return null;
              
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
                  <span style={{ fontSize: 32 }}>{meta.icon}</span>
                  <span style={{
                    fontFamily: 'var(--font-system)',
                    fontSize: 10,
                    color: '#FFFFFF',
                    textShadow: '1px 1px 0 #000',
                    textAlign: 'center',
                  }}>
                    {meta.label}<br/>
                    <span style={{ fontSize: 9 }}>({count})</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Open Group Windows */}
          {(Object.keys(newCategoryMeta) as SkillCategory[]).map(cat => {
            if (!openGroups.has(cat) || minimizedGroups.has(cat)) return null;
            
            const meta = newCategoryMeta[cat];
            const groupSkills = skillsByCategory[cat];
            if (groupSkills.length === 0) return null;
            
            return (
              <GroupWindow
                key={cat}
                title={`${meta.label} (${groupSkills.length})`}
                icon={meta.icon}
                color={meta.color}
                skills={groupSkills}
                position={groupPositions[cat]}
                size={{ width: 400, height: 300 }}
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
              position={{ x: 120, y: 60 }}
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
            {selectedSkill ? `📄 ${selectedSkill.title}` : '👆 Double-click a category to explore skills'}
          </div>
          <div style={{
            padding: '1px 4px',
            border: '1px solid',
            borderColor: '#808080 #FFFFFF #FFFFFF #808080',
          }}>
            🤖 {skills.length} skills
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          WEBSCAPE NAVIGATOR
          ═══════════════════════════════════════════════════════════════════ */}
      <WebscapeNavigator 
        isVisible={showBrowser}
        onClose={() => setShowBrowser(false)}
        onSearch={handleSearch}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          WINAMP
          ═══════════════════════════════════════════════════════════════════ */}
      <WinampModal />

      {/* ═══════════════════════════════════════════════════════════════════
          TASKBAR
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
        zIndex: 50,
      }}>
        {/* Start-like button */}
        <button
          onClick={() => setShowBrowser(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 12px',
            background: '#C0C0C0',
            border: '2px solid',
            borderColor: '#FFFFFF #000000 #000000 #FFFFFF',
            fontFamily: 'var(--font-system)',
            fontSize: 11,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          🪟 Search
        </button>

        {/* Winamp button */}
        <button
          onClick={() => setWinampMinimized(!winampMinimized)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            background: winampMinimized ? '#C0C0C0' : '#000080',
            border: '2px solid',
            borderColor: winampMinimized ? '#FFFFFF #000000 #000000 #FFFFFF' : '#000000 #FFFFFF #FFFFFF #000000',
            fontFamily: 'var(--font-system)',
            fontSize: 10,
            cursor: 'pointer',
            color: winampMinimized ? '#000' : '#FFF',
          }}
        >
          🎵 Winamp
        </button>

        {/* Minimized groups */}
        {Array.from(minimizedGroups).map(cat => {
          const meta = newCategoryMeta[cat];
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

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════

export default function HomePage() {
  const [booted, setBooted] = useState(false);

  if (!booted) {
    return <BootScreen onComplete={() => setBooted(true)} />;
  }

  return (
    <MusicPlayerProvider>
      <MainAppContent />
    </MusicPlayerProvider>
  );
}

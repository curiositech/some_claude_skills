'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOME CLAUDE SKILLS - AUTHENTIC WINDOWS 3.1 EXPERIENCE
 * 
 * A "Counterfactual OS" where Windows 3.1 evolved to handle LLM flows
 * instead of spreadsheets.
 * 
 * Features:
 * - Zustand-based WindowManager with real Win31 behavior
 * - Single control button (not three like Win95)
 * - Draggable, resizable windows
 * - MDI Program Manager
 * - Parked icons for minimized windows
 * - Mobile: Program Manager as full-screen home
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
import { useWindowManager, appRegistry, type WindowInstance } from '@/stores/window-manager';
import { Win31Window, ParkedIcons } from '@/components/win31';
import { Dageeves, Terminal } from '@/components/apps';
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
          setTimeout(onComplete, 300);
          return 100;
        }
        return p + Math.random() * 15;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [onComplete, playStartup]);

  return (
    <div className="win31-boot-screen">
      <div className="win31-boot-logo">🪟</div>
      <div className="win31-boot-title">Microsoft® Windows™</div>
      <div className="win31-boot-version">Version 3.1</div>
      <div className="win31-boot-splash">
        <div className="win31-boot-splash-title">
          SOME<br/>CLAUDE<br/>SKILLS
        </div>
        <div className="win31-boot-splash-count">
          🤖 {skills.length} AI Skills Available
        </div>
      </div>
      <div className="win31-boot-loading">Loading skills...</div>
      <div className="win31-boot-progress">
        <div className="win31-boot-progress-bar" style={{ width: `${Math.min(100, progress)}%` }} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILL ICON (Used in Program Groups)
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
      className={`win31-program-icon ${selected ? 'win31-program-icon--selected' : ''}`}
      onClick={onClick}
      onDoubleClick={onClick}
      title={skill.description}
    >
      {skill.skillIcon ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={skill.skillIcon} 
          alt=""
          className="win31-program-icon__image"
          loading="lazy"
        />
      ) : (
        <span className="win31-program-icon__emoji">{skill.icon}</span>
      )}
      <span className="win31-program-icon__label">{skill.title}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY ICON (On the Program Manager desktop)
// ═══════════════════════════════════════════════════════════════════════════

function CategoryIcon({ 
  category: _category,
  meta,
  count,
  onClick,
}: { 
  category: SkillCategory;
  meta: typeof newCategoryMeta[SkillCategory];
  count: number;
  onClick: () => void;
}) {
  return (
    <button 
      className="win31-desktop-icon"
      onClick={onClick}
      onDoubleClick={onClick}
      title={meta.description}
    >
      <span className="win31-desktop-icon__emoji">{meta.icon}</span>
      <span className="win31-desktop-icon__label">
        {meta.label}<br/>
        <span className="win31-desktop-icon__count">({count})</span>
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SKILL DETAIL VIEWER (Content for skill window)
// ═══════════════════════════════════════════════════════════════════════════

function SkillDetailContent({ skill, onCopy }: { skill: Skill; onCopy?: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(skill.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    onCopy?.();
  };

  return (
    <div className="win31-skill-detail">
      {/* Hero Image */}
      {skill.skillHero && (
        <div className="win31-skill-detail__hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={skill.skillHero} alt="" loading="lazy" />
        </div>
      )}
      
      {/* Meta Row */}
      <div className="win31-skill-detail__meta">
        {skill.skillIcon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={skill.skillIcon} alt="" className="win31-skill-detail__icon" />
        ) : (
          <span className="win31-skill-detail__icon-emoji">{skill.icon}</span>
        )}
        <div className="win31-skill-detail__info">
          <h1 className="win31-skill-detail__title">{skill.title}</h1>
          <p className="win31-skill-detail__description">{skill.description}</p>
        </div>
      </div>
      
      {/* Tags */}
      <div className="win31-skill-detail__tags">
        {skill.tags.slice(0, 8).map(tag => (
          <span key={tag} className="win31-skill-detail__tag">{tag}</span>
        ))}
      </div>
      
      {/* Install Command */}
      <div className="win31-skill-detail__install">
        <code>{skill.installCommand}</code>
        <button onClick={handleCopy} className="win31-button">
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>
      
      {/* Content Preview */}
      <div className="win31-skill-detail__content">
        <pre>{skill.content.substring(0, 2000)}{skill.content.length > 2000 && '...'}</pre>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROGRAM GROUP CONTENT
// ═══════════════════════════════════════════════════════════════════════════

function ProgramGroupContent({ 
  skills: groupSkills, 
  onSkillSelect,
  selectedSkillId,
}: { 
  skills: Skill[];
  onSkillSelect: (skill: Skill) => void;
  selectedSkillId: string | null;
}) {
  return (
    <div className="win31-program-group">
      {groupSkills.map(skill => (
        <SkillIcon 
          key={skill.id} 
          skill={skill} 
          onClick={() => onSkillSelect(skill)}
          selected={selectedSkillId === skill.id}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP CONTENT
// ═══════════════════════════════════════════════════════════════════════════

function MainAppContent() {
  const [theme, setTheme] = useState<'default' | 'hotdog'>('default');
  const [showBackgrounds, setShowBackgrounds] = useState(true);
  const [showBrowser, setShowBrowser] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [time, setTime] = useState(new Date());
  
  // Window Manager
  const { 
    windows, 
    launchApp, 
    closeWindow, 
    focusWindow,
    cascadeWindows,
    tileWindows,
    setMobile,
  } = useWindowManager();

  const playClick = useSound('/audio/click.mp3');
  const { setMinimized: setWinampMinimized, isMinimized: winampMinimized } = useMusicPlayer();

  // Check mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setMobile]);

  // Update clock
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Group skills by category
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

  // Get non-empty categories
  const nonEmptyCategories = useMemo(() => {
    return (Object.keys(newCategoryMeta) as SkillCategory[])
      .filter(cat => skillsByCategory[cat].length > 0);
  }, [skillsByCategory]);

  // Open a category group window
  const openCategoryGroup = useCallback((category: SkillCategory) => {
    playClick();
    const meta = newCategoryMeta[category];
    const existingWindow = windows.find(w => w.appId === `group-${category}`);
    
    if (existingWindow) {
      focusWindow(existingWindow.instanceId);
      return;
    }

    // Pseudo-register for this category
    appRegistry[`group-${category}`] = {
      id: `group-${category}`,
      title: meta.label,
      icon: meta.icon,
      exeName: `${category.toUpperCase()}.GRP`,
      defaultSize: { width: 420, height: 320 },
      minSize: { width: 280, height: 200 },
      isResizable: true,
      hasMenuBar: true,
      menuItems: [
        {
          label: 'File',
          accelerator: 'F',
          items: [
            { label: 'Open', shortcut: 'Enter', action: 'open' },
            { separator: true },
            { label: 'Close', action: 'close' },
          ],
        },
        {
          label: 'Window',
          accelerator: 'W',
          items: [
            { label: 'Tile', shortcut: 'Shift+F4', action: 'tile' },
            { label: 'Cascade', shortcut: 'Shift+F5', action: 'cascade' },
          ],
        },
      ],
    };

    launchApp(`group-${category}`);
  }, [playClick, windows, focusWindow, launchApp]);

  // Open skill detail window
  const openSkillDetail = useCallback((skill: Skill) => {
    playClick();
    setSelectedSkillId(skill.id);
    
    const existingWindow = windows.find(w => w.appId === `skill-${skill.id}`);
    if (existingWindow) {
      focusWindow(existingWindow.instanceId);
      return;
    }

    // Pseudo-register for this skill
    appRegistry[`skill-${skill.id}`] = {
      id: `skill-${skill.id}`,
      title: `${skill.title}.md`,
      icon: skill.icon,
      exeName: 'SKILLVW.EXE',
      defaultSize: { width: 520, height: 480 },
      minSize: { width: 400, height: 300 },
      isResizable: true,
      hasMenuBar: true,
      menuItems: [
        {
          label: 'File',
          accelerator: 'F',
          items: [
            { label: 'Copy Install Command', shortcut: 'Ctrl+C', action: 'copy' },
            { separator: true },
            { label: 'Close', action: 'close' },
          ],
        },
      ],
    };

    launchApp(`skill-${skill.id}`);
  }, [playClick, windows, focusWindow, launchApp]);

  // Open utility apps
  const openDageeves = useCallback(() => {
    playClick();
    const existing = windows.find(w => w.appId === 'dageeves');
    if (existing) {
      focusWindow(existing.instanceId);
    } else {
      launchApp('dageeves');
    }
  }, [playClick, windows, focusWindow, launchApp]);

  const openTerminal = useCallback(() => {
    playClick();
    const existing = windows.find(w => w.appId === 'terminal');
    if (existing) {
      focusWindow(existing.instanceId);
    } else {
      launchApp('terminal');
    }
  }, [playClick, windows, focusWindow, launchApp]);

  // Search handler
  const handleSearch = useCallback((query: string) => {
    const matching = skills.find(s => 
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.description.toLowerCase().includes(query.toLowerCase())
    );
    if (matching) {
      openSkillDetail(matching);
      setShowBrowser(false);
    }
  }, [openSkillDetail]);

  // Menu action handler
  const handleMenuAction = useCallback((action: string, instanceId: string) => {
    switch (action) {
      case 'close':
        closeWindow(instanceId);
        break;
      case 'tile':
        tileWindows();
        break;
      case 'cascade':
        cascadeWindows();
        break;
    }
  }, [closeWindow, tileWindows, cascadeWindows]);

  // Render window content based on appId
  const renderWindowContent = (win: WindowInstance) => {
    const { appId } = win;
    
    if (appId.startsWith('group-')) {
      const category = appId.replace('group-', '') as SkillCategory;
      return (
        <ProgramGroupContent
          skills={skillsByCategory[category]}
          onSkillSelect={openSkillDetail}
          selectedSkillId={selectedSkillId}
        />
      );
    }
    
    if (appId.startsWith('skill-')) {
      const skillId = appId.replace('skill-', '');
      const skill = skills.find(s => s.id === skillId);
      if (skill) {
        return <SkillDetailContent skill={skill} />;
      }
    }

    if (appId === 'dageeves') {
      return <Dageeves />;
    }

    if (appId === 'terminal') {
      return <Terminal />;
    }

    return <div>Unknown app: {appId}</div>;
  };

  return (
    <div className="win31-desktop" data-theme={theme}>
      {/* Teal Desktop Background */}
      <div className={`win31-desktop-bg ${theme === 'hotdog' ? 'win31-desktop-bg--hotdog' : ''}`} />

      {/* Animated Backgrounds */}
      {showBackgrounds && !isMobile && <AnimatedDesktopBackgrounds />}

      {/* ═══════════════════════════════════════════════════════════════════
          PROGRAM MANAGER (MDI Parent Window)
          ═══════════════════════════════════════════════════════════════════ */}
      <div className={`win31-program-manager ${isMobile ? 'win31-program-manager--mobile' : ''}`}>
        {/* Title Bar - SOLID NAVY (Not Win95 gradient) */}
        <div className="win31-program-manager__titlebar">
          <button className="win31-control-button" title="Control Menu">
            <span>▬</span>
          </button>
          <span className="win31-program-manager__title">Program Manager - Some Claude Skills</span>
          <div className="win31-program-manager__buttons">
            {!isMobile && (
              <button 
                className="win31-titlebar-button"
                onClick={() => setShowBackgrounds(!showBackgrounds)}
                title={showBackgrounds ? 'Hide Games' : 'Show Games'}
              >
                {showBackgrounds ? '🎮' : '⬜'}
              </button>
            )}
            <button className="win31-titlebar-button" title="Minimize">▼</button>
            <button className="win31-titlebar-button" title="Maximize">▲</button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="win31-menubar">
          <button className="win31-menubar__item">
            <span className="win31-underline">F</span>ile
          </button>
          <button 
            className="win31-menubar__item"
            onClick={() => setTheme(t => t === 'default' ? 'hotdog' : 'default')}
          >
            <span className="win31-underline">O</span>ptions {theme === 'hotdog' && '🌭'}
          </button>
          <button 
            className="win31-menubar__item"
            onClick={() => setShowBrowser(true)}
          >
            <span className="win31-underline">S</span>earch 🔍
          </button>
          <button 
            className="win31-menubar__item"
            onClick={() => setWinampMinimized(false)}
          >
            <span className="win31-underline">M</span>usic 🎵
          </button>
          <button className="win31-menubar__item">
            <span className="win31-underline">H</span>elp
          </button>
        </div>

        {/* MDI Client Area */}
        <div className={`win31-mdi-client ${theme === 'hotdog' ? 'win31-mdi-client--hotdog' : ''}`}>
          {/* Welcome Banner */}
          <div className="win31-welcome-banner">
            <div className="win31-welcome-banner__text">
              <h2>🎯 Welcome to Some Claude Skills!</h2>
              <p>{skills.length} skills to supercharge your Claude AI. Double-click a category to explore.</p>
            </div>
            <button className="win31-button win31-button--primary" onClick={() => setShowBrowser(true)}>
              🔍 Search Skills
            </button>
            <button className="win31-button" onClick={openDageeves}>
              🗄️ DAG Builder
            </button>
            <button className="win31-button" onClick={openTerminal}>
              💻 Terminal
            </button>
          </div>

          {/* Desktop Icons (Category Groups) */}
          <div className="win31-desktop-icons">
            {nonEmptyCategories.map(cat => {
              const meta = newCategoryMeta[cat];
              const count = skillsByCategory[cat].length;
              const isOpen = windows.some(w => w.appId === `group-${cat}` && w.state !== 'minimized');
              
              if (isOpen) return null;
              
              return (
                <CategoryIcon
                  key={cat}
                  category={cat}
                  meta={meta}
                  count={count}
                  onClick={() => openCategoryGroup(cat)}
                />
              );
            })}
            
            {/* Utility App Icons */}
            <button className="win31-desktop-icon" onClick={openDageeves}>
              <span className="win31-desktop-icon__emoji">🗄️</span>
              <span className="win31-desktop-icon__label">File<br/>Manager</span>
            </button>
            <button className="win31-desktop-icon" onClick={openTerminal}>
              <span className="win31-desktop-icon__emoji">💻</span>
              <span className="win31-desktop-icon__label">MS-DOS<br/>Prompt</span>
            </button>
          </div>

          {/* MDI Child Windows */}
          {windows.filter(w => w.state !== 'minimized').map(win => (
            <Win31Window
              key={win.instanceId}
              instanceId={win.instanceId}
              onMenuAction={(action) => handleMenuAction(action, win.instanceId)}
            >
              {renderWindowContent(win)}
            </Win31Window>
          ))}
        </div>

        {/* Status Bar */}
        <div className="win31-statusbar">
          <div className="win31-statusbar__panel win31-statusbar__panel--main">
            {selectedSkillId 
              ? `📄 ${skills.find(s => s.id === selectedSkillId)?.title}`
              : '👆 Double-click a category to explore skills'
            }
          </div>
          <div className="win31-statusbar__panel">
            🤖 {skills.length} skills
          </div>
          <div className="win31-statusbar__panel">
            {windows.length} window{windows.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Parked Icons (Minimized Windows) */}
      <ParkedIcons />

      {/* Webscape Navigator */}
      <WebscapeNavigator 
        isVisible={showBrowser}
        onClose={() => setShowBrowser(false)}
        onSearch={handleSearch}
      />

      {/* Winamp */}
      <WinampModal />

      {/* Taskbar (Bottom) */}
      <div className="win31-taskbar">
        <button className="win31-taskbar__button win31-taskbar__button--start" onClick={() => setShowBrowser(true)}>
          🪟 Search
        </button>
        <button 
          className={`win31-taskbar__button ${!winampMinimized ? 'win31-taskbar__button--active' : ''}`}
          onClick={() => setWinampMinimized(!winampMinimized)}
        >
          🎵 Winamp
        </button>
        
        {/* Minimized group indicators */}
        {windows.filter(w => w.state === 'minimized').map(win => {
          const app = appRegistry[win.appId];
          return (
            <button 
              key={win.instanceId}
              className="win31-taskbar__button"
              onClick={() => focusWindow(win.instanceId)}
            >
              {app?.icon || '📄'} {win.title}
            </button>
          );
        })}
        
        <div className="win31-taskbar__spacer" />
        
        <div className="win31-taskbar__clock">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

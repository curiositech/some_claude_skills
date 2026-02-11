'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SOME CLAUDE SKILLS - AUTHENTIC WINDOWS 3.1 EXPERIENCE
 * 
 * A "Counterfactual OS" where Windows 3.1 evolved to handle LLM flows
 * instead of spreadsheets.
 * 
 * SKILL_EXPLORER.EXE is the main skill browsing application.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { skills } from '@/lib/skills';
import { useWindowManager, type WindowInstance } from '@/stores/window-manager';
import { Win31Window, ParkedIcons } from '@/components/win31';
import { Dageeves, Terminal, SkillExplorer, Solitaire, ControlPanel, Calculator } from '@/components/apps';
import { AnimatedDesktopBackgrounds } from '@/components/fun/animated-backgrounds';
import { MusicPlayerProvider, useMusicPlayer, WinampModal } from '@/components/winamp';
import { useWin31Theme } from '@/hooks/useWin31Theme';
import { TutorialWizard, TUTORIALS, type TutorialId } from '@/components/memphis';
import { WebscapeNavigator } from '@/components/fun/webscape-navigator';
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
          {skills.length} AI Skills Available
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
// MAIN APP CONTENT
// ═══════════════════════════════════════════════════════════════════════════

function MainAppContent() {
  const [showBackgrounds, setShowBackgrounds] = useState(true);
  const [showSkillExplorer, setShowSkillExplorer] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [activeTutorial, setActiveTutorial] = useState<TutorialId | null>(null);
  const [showWebscapeNavigator, setShowWebscapeNavigator] = useState(false);
  
  // Theme hook
  const { colorScheme, setTheme, themes } = useWin31Theme();
  
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

  const openSkillExplorer = useCallback(() => {
    playClick();
    setShowSkillExplorer(true);
  }, [playClick]);

  const openSolitaire = useCallback(() => {
    playClick();
    const existing = windows.find(w => w.appId === 'solitaire');
    if (existing) {
      focusWindow(existing.instanceId);
    } else {
      launchApp('solitaire');
    }
  }, [playClick, windows, focusWindow, launchApp]);

  const openControlPanel = useCallback(() => {
    playClick();
    const existing = windows.find(w => w.appId === 'control-panel');
    if (existing) {
      focusWindow(existing.instanceId);
    } else {
      launchApp('control-panel');
    }
  }, [playClick, windows, focusWindow, launchApp]);

  const openCalculator = useCallback(() => {
    playClick();
    const existing = windows.find(w => w.appId === 'calculator');
    if (existing) {
      focusWindow(existing.instanceId);
    } else {
      launchApp('calculator');
    }
  }, [playClick, windows, focusWindow, launchApp]);

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

    if (appId === 'dageeves') {
      return <Dageeves />;
    }

    if (appId === 'terminal') {
      return <Terminal />;
    }

    if (appId === 'solitaire') {
      return <Solitaire />;
    }

    if (appId === 'control-panel') {
      return <ControlPanel />;
    }

    if (appId === 'calculator') {
      return <Calculator />;
    }

    return <div>Unknown app: {appId}</div>;
  };

  return (
    <div className="win31-desktop">
      {/* Desktop Background - uses CSS variable */}
      <div className="win31-desktop-bg" />

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
                {showBackgrounds ? 'G' : '-'}
              </button>
            )}
            <button className="win31-titlebar-button" title="Minimize">_</button>
            <button className="win31-titlebar-button" title="Maximize">^</button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="win31-menubar">
          <button className="win31-menubar__item">
            <span className="win31-underline">F</span>ile
          </button>
          <div className="win31-menubar__dropdown-wrapper">
            <button 
              className="win31-menubar__item"
              onClick={() => setShowThemeMenu(!showThemeMenu)}
            >
              <span className="win31-underline">O</span>ptions [{colorScheme}]
            </button>
            {showThemeMenu && (
              <>
                <div className="win31-menubar__backdrop" onClick={() => setShowThemeMenu(false)} />
                <div className="win31-menubar__dropdown">
                  <div className="win31-menubar__dropdown-title">Color Scheme</div>
                  {themes.map((theme) => (
                    <button
                      key={theme}
                      className={`win31-menubar__dropdown-item ${colorScheme === theme ? 'win31-menubar__dropdown-item--active' : ''}`}
                      onClick={() => { setTheme(theme); setShowThemeMenu(false); }}
                    >
                      {colorScheme === theme ? '● ' : '○ '}{theme}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button 
            className="win31-menubar__item"
            onClick={() => setWinampMinimized(false)}
          >
            <span className="win31-underline">M</span>usic
          </button>
          <button 
            className="win31-menubar__item"
            onClick={() => { tileWindows(); }}
          >
            <span className="win31-underline">W</span>indow
          </button>
          <button className="win31-menubar__item">
            <span className="win31-underline">H</span>elp
          </button>
        </div>

        {/* MDI Client Area */}
        <div className="win31-mdi-client">
          {/* Program Groups */}
          <div className="win31-program-groups">
            {/* Main Group */}
            <div className={`win31-program-group ${activeGroup === 'main' ? 'win31-program-group--active' : ''}`}>
              <div 
                className="win31-program-group__header"
                onClick={() => setActiveGroup(activeGroup === 'main' ? null : 'main')}
              >
                <span className="win31-program-group__icon">📁</span>
                <span className="win31-program-group__title">Main</span>
                <span className="win31-program-group__toggle">{activeGroup === 'main' ? '−' : '+'}</span>
              </div>
              {activeGroup === 'main' && (
                <div className="win31-program-group__content">
                  {/* SKILL_EXPLORER.EXE - Main App */}
                  <button className="win31-desktop-icon win31-desktop-icon--featured" onClick={openSkillExplorer}>
                    <div className="win31-desktop-icon__pixel-art">
                      <svg viewBox="0 0 32 32" width="48" height="48">
                        <rect x="2" y="2" width="28" height="28" fill="#1a0a2e" stroke="#ff69b4" strokeWidth="2" />
                        <rect x="6" y="6" width="8" height="6" fill="#00ced1" />
                        <rect x="18" y="6" width="8" height="6" fill="#ffd700" />
                        <rect x="6" y="16" width="8" height="6" fill="#90ee90" />
                        <rect x="18" y="16" width="8" height="6" fill="#ff6b9d" />
                        <circle cx="16" cy="16" r="4" fill="#fff" />
                      </svg>
                    </div>
                    <span className="win31-desktop-icon__label">Skill Explorer</span>
                  </button>

                  {/* File Manager (DaGeeves) */}
                  <button className="win31-desktop-icon" onClick={openDageeves}>
                    <div className="win31-desktop-icon__pixel-art">
                      <svg viewBox="0 0 32 32" width="32" height="32">
                        <rect x="4" y="4" width="24" height="24" fill="#ffff00" stroke="#aa5500" strokeWidth="2" />
                        <rect x="4" y="4" width="12" height="8" fill="#aa5500" />
                        <rect x="8" y="12" width="16" height="2" fill="#aa5500" />
                        <rect x="8" y="16" width="12" height="2" fill="#aa5500" />
                        <rect x="8" y="20" width="14" height="2" fill="#aa5500" />
                      </svg>
                    </div>
                    <span className="win31-desktop-icon__label">File Manager</span>
                  </button>

                  {/* MS-DOS Prompt */}
                  <button className="win31-desktop-icon" onClick={openTerminal}>
                    <div className="win31-desktop-icon__pixel-art">
                      <svg viewBox="0 0 32 32" width="32" height="32">
                        <rect x="2" y="4" width="28" height="24" fill="#000" stroke="#c0c0c0" strokeWidth="2" />
                        <text x="6" y="16" fill="#00ff00" fontSize="8" fontFamily="monospace">C:\&gt;_</text>
                      </svg>
                    </div>
                    <span className="win31-desktop-icon__label">MS-DOS Prompt</span>
                  </button>

                  {/* Control Panel */}
                  <button className="win31-desktop-icon" onClick={openControlPanel}>
                    <div className="win31-desktop-icon__pixel-art">
                      <svg viewBox="0 0 32 32" width="32" height="32">
                        <rect x="4" y="4" width="24" height="24" fill="#c0c0c0" stroke="#808080" strokeWidth="2" />
                        <circle cx="12" cy="12" r="4" fill="#808080" />
                        <rect x="18" y="8" width="6" height="8" fill="#00ff00" />
                        <rect x="8" y="20" width="16" height="4" fill="#ff0000" />
                      </svg>
                    </div>
                    <span className="win31-desktop-icon__label">Control Panel</span>
                  </button>
                </div>
              )}
            </div>

            {/* Accessories Group */}
            <div className={`win31-program-group ${activeGroup === 'accessories' ? 'win31-program-group--active' : ''}`}>
              <div 
                className="win31-program-group__header"
                onClick={() => setActiveGroup(activeGroup === 'accessories' ? null : 'accessories')}
              >
                <span className="win31-program-group__icon">🔧</span>
                <span className="win31-program-group__title">Accessories</span>
                <span className="win31-program-group__toggle">{activeGroup === 'accessories' ? '−' : '+'}</span>
              </div>
              {activeGroup === 'accessories' && (
                <div className="win31-program-group__content">
                  {/* Calculator */}
                  <button className="win31-desktop-icon" onClick={openCalculator}>
                    <div className="win31-desktop-icon__pixel-art">
                      <svg viewBox="0 0 32 32" width="32" height="32">
                        <rect x="6" y="2" width="20" height="28" fill="#c0c0c0" stroke="#808080" strokeWidth="2" />
                        <rect x="8" y="4" width="16" height="6" fill="#9cf" />
                        <rect x="8" y="12" width="4" height="4" fill="#fff" />
                        <rect x="14" y="12" width="4" height="4" fill="#fff" />
                        <rect x="20" y="12" width="4" height="4" fill="#fff" />
                        <rect x="8" y="18" width="4" height="4" fill="#fff" />
                        <rect x="14" y="18" width="4" height="4" fill="#fff" />
                        <rect x="20" y="18" width="4" height="4" fill="#f90" />
                        <rect x="8" y="24" width="10" height="4" fill="#fff" />
                        <rect x="20" y="24" width="4" height="4" fill="#f90" />
                      </svg>
                    </div>
                    <span className="win31-desktop-icon__label">Calculator</span>
                  </button>

                  {/* Winamp */}
                  <button className="win31-desktop-icon" onClick={() => setWinampMinimized(false)}>
                    <div className="win31-desktop-icon__pixel-art">
                      <svg viewBox="0 0 32 32" width="32" height="32">
                        <rect x="4" y="8" width="24" height="16" fill="#3a3a3a" stroke="#000" strokeWidth="1" />
                        <rect x="6" y="10" width="8" height="6" fill="#000" />
                        <rect x="7" y="11" width="2" height="4" fill="#00ff00" />
                        <rect x="10" y="12" width="2" height="3" fill="#00ff00" />
                        <rect x="18" y="10" width="8" height="4" fill="#000" />
                        <circle cx="10" cy="19" r="2" fill="#666" />
                        <circle cx="16" cy="19" r="2" fill="#00ff00" />
                        <circle cx="22" cy="19" r="2" fill="#666" />
                      </svg>
                    </div>
                    <span className="win31-desktop-icon__label">Winamp</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tutorials Group */}
            <div className={`win31-program-group ${activeGroup === 'tutorials' ? 'win31-program-group--active' : ''}`}>
              <div 
                className="win31-program-group__header"
                onClick={() => setActiveGroup(activeGroup === 'tutorials' ? null : 'tutorials')}
              >
                <span className="win31-program-group__icon">📚</span>
                <span className="win31-program-group__title">Tutorials</span>
                <span className="win31-program-group__toggle">{activeGroup === 'tutorials' ? '−' : '+'}</span>
              </div>
              {activeGroup === 'tutorials' && (
                <div className="win31-program-group__content">
                  {/* What is a Skill? */}
                  <button className="win31-desktop-icon" onClick={() => { playClick(); setActiveTutorial('what-is-a-skill'); }}>
                    <div className="win31-desktop-icon__pixel-art">
                      <svg viewBox="0 0 32 32" width="32" height="32">
                        <circle cx="16" cy="16" r="12" fill="#ff69b4" stroke="#000" strokeWidth="2" />
                        <text x="12" y="22" fill="#fff" fontSize="18" fontWeight="bold">?</text>
                      </svg>
                    </div>
                    <span className="win31-desktop-icon__label">What is a Skill?</span>
                  </button>

                  {/* Installing Skills */}
                  <button className="win31-desktop-icon" onClick={() => { playClick(); setActiveTutorial('installing-skills'); }}>
                    <div className="win31-desktop-icon__pixel-art">
                      <svg viewBox="0 0 32 32" width="32" height="32">
                        <rect x="6" y="8" width="20" height="16" fill="#90ee90" stroke="#000" strokeWidth="2" />
                        <rect x="10" y="4" width="12" height="6" fill="#228b22" />
                        <polygon points="16,18 12,14 20,14" fill="#fff" />
                        <rect x="14" y="14" width="4" height="6" fill="#fff" />
                      </svg>
                    </div>
                    <span className="win31-desktop-icon__label">Installing Skills</span>
                  </button>

                  {/* Webscape Navigator */}
                  <button className="win31-desktop-icon" onClick={() => { playClick(); setShowWebscapeNavigator(true); }}>
                    <div className="win31-desktop-icon__pixel-art">
                      <svg viewBox="0 0 32 32" width="32" height="32">
                        <circle cx="16" cy="16" r="12" fill="#0078d4" stroke="#000" strokeWidth="2" />
                        <path d="M10,16 Q16,8 22,16 Q16,24 10,16" fill="#00bfff" />
                        <circle cx="16" cy="16" r="3" fill="#fff" />
                      </svg>
                    </div>
                    <span className="win31-desktop-icon__label">Webscape</span>
                  </button>
                </div>
              )}
            </div>

            {/* Games Group */}
            <div className={`win31-program-group ${activeGroup === 'games' ? 'win31-program-group--active' : ''}`}>
              <div 
                className="win31-program-group__header"
                onClick={() => setActiveGroup(activeGroup === 'games' ? null : 'games')}
              >
                <span className="win31-program-group__icon">🎮</span>
                <span className="win31-program-group__title">Games</span>
                <span className="win31-program-group__toggle">{activeGroup === 'games' ? '−' : '+'}</span>
              </div>
              {activeGroup === 'games' && (
                <div className="win31-program-group__content">
                  {/* Solitaire */}
                  <button className="win31-desktop-icon" onClick={openSolitaire}>
                    <div className="win31-desktop-icon__pixel-art">
                      <svg viewBox="0 0 32 32" width="32" height="32">
                        <rect x="6" y="4" width="20" height="24" fill="#fff" stroke="#000" strokeWidth="2" rx="2" />
                        <text x="10" y="18" fill="#ff0000" fontSize="14" fontWeight="bold">♥</text>
                        <text x="8" y="12" fill="#000" fontSize="10" fontWeight="bold">A</text>
                      </svg>
                    </div>
                    <span className="win31-desktop-icon__label">Solitaire</span>
                  </button>
                </div>
              )}
            </div>
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
            Double-click SKILL_EXPLORER to browse {skills.length} AI skills
          </div>
          <div className="win31-statusbar__panel">
            {windows.length} window{windows.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Parked Icons (Minimized Windows) */}
      <ParkedIcons />

      {/* SKILL_EXPLORER.EXE - Full screen app */}
      <SkillExplorer 
        isVisible={showSkillExplorer}
        onClose={() => setShowSkillExplorer(false)}
      />

      {/* Winamp - Compact 275x116 */}
      <WinampModal />

      {/* Webscape Navigator - Retro Browser */}
      <WebscapeNavigator
        isVisible={showWebscapeNavigator}
        onClose={() => setShowWebscapeNavigator(false)}
        onSearch={() => { 
          setShowWebscapeNavigator(false);
          setShowSkillExplorer(true);
        }}
      />

      {/* Tutorial Wizard */}
      {activeTutorial && (
        <TutorialWizard
          title={TUTORIALS[activeTutorial].title}
          steps={TUTORIALS[activeTutorial].steps}
          onComplete={() => setActiveTutorial(null)}
          onClose={() => setActiveTutorial(null)}
        />
      )}

      {/* Taskbar (Bottom) */}
      <div className="win31-taskbar">
        <button 
          className="win31-taskbar__button win31-taskbar__button--start" 
          onClick={openSkillExplorer}
        >
          Skills
        </button>
        <button 
          className={`win31-taskbar__button ${!winampMinimized ? 'win31-taskbar__button--active' : ''}`}
          onClick={() => setWinampMinimized(!winampMinimized)}
        >
          Winamp
        </button>
        <button 
          className={`win31-taskbar__button ${showWebscapeNavigator ? 'win31-taskbar__button--active' : ''}`}
          onClick={() => setShowWebscapeNavigator(!showWebscapeNavigator)}
        >
          Browser
        </button>
        
        {/* Minimized window indicators */}
        {windows.filter(w => w.state === 'minimized').map(win => (
          <button 
            key={win.instanceId}
            className="win31-taskbar__button"
            onClick={() => focusWindow(win.instanceId)}
          >
            {win.title}
          </button>
        ))}
        
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

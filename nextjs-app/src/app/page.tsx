'use client';

import * as React from 'react';
import { skills, type Skill, getSkillById, type SkillCategory, categoryMeta } from '@/lib/skills';
import {
  ProgramManager,
  Win31Window,
  Win31Button,
  Win31Dialog,
  Win31Clock,
  Win31Solitaire,
  Win31Minesweeper,
  QBasicGorillas,
  FileManager,
  TutorialWizard,
  TUTORIALS,
  type ProgramGroup,
  type TutorialId,
} from '@/components/memphis';
import { SkillSearch } from '@/components/win31';
import { SkillDocument } from '@/components/win31';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * SOME CLAUDE SKILLS - Memphis × Windows 3.1
 * 
 * Full experience with:
 * - Windows boot splash screen
 * - Animated background apps (Clock, Solitaire, Gorillas, Minesweeper)
 * - Webscape Navigator with AI search
 * - Program Manager with skill groups
 * - WCAG AAA compliant
 * ═══════════════════════════════════════════════════════════════════════════
 */

type ActiveView =
  | { type: 'boot' }
  | { type: 'desktop' }
  | { type: 'file-manager' }
  | { type: 'skill'; skill: Skill }
  | { type: 'tutorial'; id: TutorialId }
  | { type: 'search' }
  | { type: 'readme' }
  | { type: 'about' };

export default function HomePage() {
  const [activeView, setActiveView] = React.useState<ActiveView>({ type: 'boot' });
  const [showWelcome, setShowWelcome] = React.useState(false);
  const [bootProgress, setBootProgress] = React.useState(0);

  // Boot sequence
  React.useEffect(() => {
    if (activeView.type !== 'boot') return;

    const interval = setInterval(() => {
      setBootProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Check if first visit
          const hasVisited = localStorage.getItem('scs-visited');
          if (!hasVisited) {
            setShowWelcome(true);
            localStorage.setItem('scs-visited', 'true');
          }
          setActiveView({ type: 'desktop' });
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [activeView.type]);

  // Group skills by category
  const skillsByCategory = React.useMemo(() => {
    const grouped = new Map<SkillCategory, Skill[]>();
    skills.forEach(skill => {
      if (!grouped.has(skill.category)) {
        grouped.set(skill.category, []);
      }
      grouped.get(skill.category)!.push(skill);
    });
    return grouped;
  }, []);

  // Build Program Groups
  const programGroups: ProgramGroup[] = React.useMemo(() => {
    const groups: ProgramGroup[] = [];

    // Main group
    groups.push({
      id: 'main',
      title: 'Main',
      position: { x: 8, y: 8 },
      icons: [
        { id: 'file-manager', label: 'Skill Browser', icon: '📁' },
        { id: 'search', label: 'Webscape', icon: '🌐' },
        { id: 'readme', label: 'Read Me', icon: '📖' },
        { id: 'about', label: 'About', icon: 'ℹ️' },
      ],
    });

    // Tutorials group
    groups.push({
      id: 'tutorials',
      title: 'Tutorials',
      position: { x: 200, y: 8 },
      icons: Object.entries(TUTORIALS).map(([id, t]) => ({
        id,
        label: t.title.substring(0, 12),
        icon: t.icon,
      })),
    });

    // Skill category groups
    let col = 0;
    let row = 1;
    
    const categoryOrder: SkillCategory[] = [
      'development', 'design', 'devops', 'architecture', 
      'data', 'testing', 'documentation', 'security'
    ];

    categoryOrder.forEach((cat) => {
      const catSkills = skillsByCategory.get(cat);
      if (!catSkills || catSkills.length === 0) return;

      const meta = categoryMeta[cat];
      
      groups.push({
        id: `skills-${cat}`,
        title: meta.label,
        position: { x: 8 + (col % 4) * 185, y: 8 + row * 130 },
        icons: catSkills.slice(0, 9).map(s => ({
          id: `skill:${s.id}`,
          label: s.title.substring(0, 11),
          icon: s.skillIcon || s.icon || meta.icon,
        })),
      });

      col++;
      if (col >= 4) {
        col = 0;
        row++;
      }
    });

    // winDAGs group
    groups.push({
      id: 'windags',
      title: 'winDAGs.AI',
      position: { x: 8 + 3 * 185, y: 8 },
      minimized: true,
      icons: [
        { id: 'dag-builder', label: 'DAG Builder', icon: '🔀' },
        { id: 'skill-matcher', label: 'Skill Match', icon: '🎯' },
      ],
    });

    return groups;
  }, [skillsByCategory]);

  const handleOpenProgram = (programId: string) => {
    if (programId in TUTORIALS) {
      setActiveView({ type: 'tutorial', id: programId as TutorialId });
      return;
    }

    if (programId.startsWith('skill:')) {
      const skillId = programId.replace('skill:', '');
      const skill = getSkillById(skillId);
      if (skill) {
        setActiveView({ type: 'skill', skill });
      }
      return;
    }

    switch (programId) {
      case 'file-manager':
        setActiveView({ type: 'file-manager' });
        break;
      case 'search':
        setActiveView({ type: 'search' });
        break;
      case 'readme':
        setActiveView({ type: 'readme' });
        break;
      case 'about':
        setActiveView({ type: 'about' });
        break;
    }
  };

  const goToDesktop = () => setActiveView({ type: 'desktop' });
  const goToFileManager = () => setActiveView({ type: 'file-manager' });

  // Boot Screen
  if (activeView.type === 'boot') {
    return <BootScreen progress={bootProgress} />;
  }

  return (
    <div className="min-h-screen bg-[var(--memphis-cyan)] relative overflow-hidden">
      {/* Animated Background Apps - Always visible */}
      <BackgroundApps />

      {/* Desktop Pattern Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, var(--memphis-pink) 2px, transparent 2px),
            radial-gradient(circle at 80% 20%, var(--memphis-yellow) 3px, transparent 3px),
            radial-gradient(circle at 60% 60%, var(--memphis-purple) 2px, transparent 2px)
          `,
          backgroundSize: '100px 100px, 150px 150px, 80px 80px',
        }}
        aria-hidden="true"
      />

      {/* Main Content */}
      <main className="relative z-10 min-h-screen" role="main">
        {/* Desktop / Program Manager */}
        {activeView.type === 'desktop' && (
          <div className="h-screen">
            <ProgramManager
              groups={programGroups}
              onOpenProgram={handleOpenProgram}
            />
          </div>
        )}

        {/* Webscape Navigator Search */}
        {activeView.type === 'search' && (
          <div className="h-screen p-2">
            <Win31Window
              title="Webscape Navigator 3.1 - Ask Dageeves"
              icon="🌐"
              onClose={goToDesktop}
              onMinimize={goToDesktop}
              onMaximize={() => {}}
              menuItems={['File', 'Edit', 'View', 'Go', 'Bookmarks', 'Help']}
              className="h-full"
              resizable
            >
              <SkillSearch
                onSelectSkill={(skill) => setActiveView({ type: 'skill', skill })}
              />
            </Win31Window>
          </div>
        )}

        {/* File Manager */}
        {activeView.type === 'file-manager' && (
          <div className="h-full p-2 flex items-start justify-center pt-8">
            <div className="w-full max-w-4xl">
              <FileManager
                skills={skills}
                onSelectSkill={(skill) => setActiveView({ type: 'skill', skill })}
                onClose={goToDesktop}
              />
            </div>
          </div>
        )}

        {/* Skill Document */}
        {activeView.type === 'skill' && (
          <div className="h-full p-2 overflow-auto">
            <div className="max-w-5xl mx-auto">
              <nav className="mb-2 flex gap-2" aria-label="Skill navigation">
                <Win31Button onClick={goToFileManager}>
                  ← Skills
                </Win31Button>
                <Win31Button onClick={goToDesktop}>
                  🏠 Desktop
                </Win31Button>
              </nav>
              <SkillDocument
                skill={activeView.skill}
                onClose={goToFileManager}
                onNavigate={(id) => {
                  const skill = getSkillById(id);
                  if (skill) setActiveView({ type: 'skill', skill });
                }}
              />
            </div>
          </div>
        )}

        {/* Tutorial */}
        {activeView.type === 'tutorial' && (
          <TutorialWizard
            title={TUTORIALS[activeView.id].title}
            steps={TUTORIALS[activeView.id].steps}
            onComplete={goToDesktop}
            onClose={goToDesktop}
          />
        )}

        {/* README */}
        {activeView.type === 'readme' && (
          <div className="h-full p-4 flex items-start justify-center pt-8">
            <Win31Window
              title="README.TXT"
              icon="📖"
              onClose={goToDesktop}
              menuItems={['File', 'Edit']}
              className="w-full max-w-lg"
            >
              <article className="p-3 bg-[var(--win31-white)] overflow-auto max-h-[60vh] text-[11px] leading-relaxed">
                <h1 className="text-[14px] font-bold mb-2">SOME CLAUDE SKILLS</h1>
                <p className="mb-2">173 curated expert agents for Claude Code.</p>
                
                <hr className="border-[var(--bevel-dark)] my-2" />
                
                <h2 className="font-bold mb-1">WHAT ARE SKILLS?</h2>
                <p className="mb-2">
                  Skills are markdown files that transform Claude into 
                  domain experts. Install them to get specialized help.
                </p>
                
                <h2 className="font-bold mb-1">QUICK START</h2>
                <ol className="list-decimal list-inside mb-2 space-y-1">
                  <li>Open Webscape Navigator (🌐) to search</li>
                  <li>Or browse by category in Program Groups</li>
                  <li>Copy the install command</li>
                  <li>Paste in Claude Code</li>
                </ol>
                
                <h2 className="font-bold mb-1">KEYBOARD SHORTCUTS</h2>
                <ul className="list-disc list-inside mb-2 space-y-1">
                  <li><kbd className="bg-[var(--memphis-surface)] px-1">Alt+F</kbd> = File menu</li>
                  <li><kbd className="bg-[var(--memphis-surface)] px-1">Double-click</kbd> = Open</li>
                  <li><kbd className="bg-[var(--memphis-surface)] px-1">Esc</kbd> = Close</li>
                </ul>
                
                <aside className="bg-[var(--memphis-surface)] border border-[var(--bevel-dark)] p-2 mt-2" role="note">
                  <p className="font-bold">Memphis × Windows 3.1 Edition</p>
                  <p className="text-[10px]">WCAG AAA Compliant • Built with Next.js 15</p>
                </aside>
              </article>
              <footer className="p-2 flex justify-end gap-2 bg-[var(--memphis-surface)]">
                <Win31Button onClick={() => setActiveView({ type: 'search' })}>Open Webscape</Win31Button>
                <Win31Button onClick={goToDesktop} isDefault>OK</Win31Button>
              </footer>
            </Win31Window>
          </div>
        )}

        {/* About */}
        {activeView.type === 'about' && (
          <div className="h-full p-4 flex items-start justify-center pt-8">
            <Win31Window
              title="About Some Claude Skills"
              icon="ℹ️"
              onClose={goToDesktop}
              className="w-full max-w-xs"
            >
              <div className="p-4 bg-[var(--memphis-surface)] text-center text-[11px]">
                {/* Carlton decoration */}
                <div className="memphis-carlton mb-3 mx-auto w-32" aria-hidden="true">
                  <div className="memphis-carlton-shelf" />
                  <div className="memphis-carlton-shelf" />
                  <div className="memphis-carlton-shelf" />
                  <div className="memphis-carlton-shelf" />
                  <div className="memphis-carlton-shelf" />
                </div>

                <h1 className="text-[14px] font-bold">Some Claude Skills</h1>
                <p className="text-[10px] text-[var(--win31-gray-dark)]">
                  Memphis × Windows 3.1 Edition
                </p>
                <p className="text-[10px] mb-3">Version 1.0.0</p>

                <address className="text-[10px] mb-3 not-italic">
                  <p>© 2024 Erich Owens</p>
                  <p className="text-[var(--win31-gray-dark)]">Ex-Meta ML Engineer</p>
                </address>

                <dl className="bevel-in p-2 text-[10px] text-left">
                  <div className="flex justify-between"><dt>Skills:</dt><dd>173</dd></div>
                  <div className="flex justify-between"><dt>Categories:</dt><dd>8</dd></div>
                  <div className="flex justify-between"><dt>Framework:</dt><dd>Next.js 15</dd></div>
                  <div className="flex justify-between"><dt>Hosting:</dt><dd>Cloudflare</dd></div>
                </dl>

                {/* Memphis color bar */}
                <div className="flex mt-3 h-2" aria-hidden="true">
                  <div className="flex-1 bg-[var(--memphis-red)]" />
                  <div className="flex-1 bg-[var(--memphis-yellow)]" />
                  <div className="flex-1 bg-[var(--memphis-blue)]" />
                  <div className="flex-1 bg-[var(--memphis-green)]" />
                  <div className="flex-1 bg-[var(--memphis-pink)]" />
                  <div className="flex-1 bg-[var(--memphis-purple)]" />
                </div>
              </div>
              <footer className="p-2 flex justify-center bg-[var(--memphis-surface)]">
                <Win31Button onClick={goToDesktop} isDefault>OK</Win31Button>
              </footer>
            </Win31Window>
          </div>
        )}
      </main>

      {/* Welcome Dialog */}
      {showWelcome && (
        <Win31Dialog
          title="Welcome to Some Claude Skills"
          icon="info"
          buttons={[
            {
              label: 'Tutorial',
              onClick: () => {
                setShowWelcome(false);
                setActiveView({ type: 'tutorial', id: 'what-is-a-skill' });
              },
            },
            {
              label: 'Search',
              onClick: () => {
                setShowWelcome(false);
                setActiveView({ type: 'search' });
              },
              isDefault: true,
            },
            {
              label: 'Explore',
              onClick: () => setShowWelcome(false),
            },
          ]}
          onClose={() => setShowWelcome(false)}
        >
          <p className="mb-2">
            <strong>173 curated Claude Code skills</strong> ready to transform
            Claude into a domain expert.
          </p>
          <p>
            Try <strong>Webscape Navigator</strong> to search, or explore 
            the <strong>Program Manager</strong> desktop.
          </p>
        </Win31Dialog>
      )}
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * BOOT SCREEN - Windows 3.1 startup splash
 * ═══════════════════════════════════════════════════════════════════════════
 */

function BootScreen({ progress }: { progress: number }) {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(180deg, #000080 0%, #0000aa 100%)' }}
      role="status"
      aria-label={`Loading: ${Math.round(progress)}%`}
    >
      {/* Windows Logo */}
      <div className="mb-8 text-center">
        {/* Simplified Windows flag logo */}
        <div className="inline-grid grid-cols-2 gap-1 mb-4" aria-hidden="true">
          <div className="w-12 h-12 bg-[#ff0000] transform -skew-x-12" />
          <div className="w-12 h-12 bg-[#00ff00] transform -skew-x-12" />
          <div className="w-12 h-12 bg-[#0000ff] transform -skew-x-12" />
          <div className="w-12 h-12 bg-[#ffff00] transform -skew-x-12" />
        </div>
        
        <h1 className="text-white text-3xl font-bold tracking-wider mb-1">
          SOME CLAUDE SKILLS
        </h1>
        <p className="text-[#00ffff] text-lg">
          Memphis × Windows 3.1 Edition
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-80 mb-4">
        <div 
          className="h-4 bg-[#000040] border-2 border-[#808080]"
          style={{
            boxShadow: 'inset 1px 1px 0 #404040, inset -1px -1px 0 #c0c0c0'
          }}
        >
          <div 
            className="h-full bg-[#00ffff] transition-all duration-200"
            style={{ width: `${Math.min(progress, 100)}%` }}
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <p className="text-[#c0c0c0] text-xs mt-2 text-center">
          Loading skills... {Math.round(Math.min(progress, 100))}%
        </p>
      </div>

      {/* Copyright */}
      <footer className="text-[#808080] text-xs">
        <p>© 2024 Erich Owens • someclaudeskills.com</p>
      </footer>
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * BACKGROUND APPS - Animated accessories in corners
 * ═══════════════════════════════════════════════════════════════════════════
 */

function BackgroundApps() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Clock - top right */}
      <div className="absolute top-4 right-4 opacity-70 scale-75 origin-top-right">
        <Win31Clock size={100} />
      </div>

      {/* Solitaire - bottom right */}
      <div className="absolute bottom-4 right-4 opacity-60 scale-75 origin-bottom-right hidden lg:block">
        <Win31Solitaire />
      </div>

      {/* Minesweeper - bottom left */}
      <div className="absolute bottom-4 left-4 opacity-60 scale-75 origin-bottom-left hidden md:block">
        <Win31Minesweeper />
      </div>

      {/* Gorillas - top left (hidden on small screens) */}
      <div className="absolute top-4 left-4 opacity-50 scale-75 origin-top-left hidden xl:block">
        <QBasicGorillas />
      </div>
    </div>
  );
}

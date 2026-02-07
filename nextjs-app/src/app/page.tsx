'use client';

import * as React from 'react';
import { skills, type Skill, getSkillById, type SkillCategory, categoryMeta } from '@/lib/skills';
import {
  ProgramManager,
  Win31Window,
  Win31Button,
  Win31Dialog,
  DesktopScene,
  FileManager,
  TutorialWizard,
  TUTORIALS,
  type ProgramGroup,
  type TutorialId,
} from '@/components/memphis';
import { SkillDocument } from '@/components/win31';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * SOME CLAUDE SKILLS - Memphis × Windows 3.1
 * 
 * Authentic Program Manager with skill groups organized by category/domain
 * ═══════════════════════════════════════════════════════════════════════════
 */

type ActiveView =
  | { type: 'desktop' }
  | { type: 'file-manager' }
  | { type: 'skill'; skill: Skill }
  | { type: 'tutorial'; id: TutorialId }
  | { type: 'readme' }
  | { type: 'about' };

export default function HomePage() {
  const [activeView, setActiveView] = React.useState<ActiveView>({ type: 'desktop' });
  const [showWelcome, setShowWelcome] = React.useState(false);

  // Check for first visit
  React.useEffect(() => {
    const hasVisited = localStorage.getItem('scs-visited');
    if (!hasVisited) {
      setShowWelcome(true);
      localStorage.setItem('scs-visited', 'true');
    }
  }, []);

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

  // Build Program Groups from skill categories
  const programGroups: ProgramGroup[] = React.useMemo(() => {
    const groups: ProgramGroup[] = [];

    // Main group - always first
    groups.push({
      id: 'main',
      title: 'Main',
      position: { x: 8, y: 8 },
      icons: [
        { id: 'file-manager', label: 'Skill Browser', icon: '📁' },
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
          icon: s.icon || meta.icon,
        })),
      });

      col++;
      if (col >= 4) {
        col = 0;
        row++;
      }
    });

    // winDAGs group (coming soon)
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
    // Tutorial
    if (programId in TUTORIALS) {
      setActiveView({ type: 'tutorial', id: programId as TutorialId });
      return;
    }

    // Skill (prefixed with "skill:")
    if (programId.startsWith('skill:')) {
      const skillId = programId.replace('skill:', '');
      const skill = getSkillById(skillId);
      if (skill) {
        setActiveView({ type: 'skill', skill });
      }
      return;
    }

    // Main programs
    switch (programId) {
      case 'file-manager':
        setActiveView({ type: 'file-manager' });
        break;
      case 'readme':
        setActiveView({ type: 'readme' });
        break;
      case 'about':
        setActiveView({ type: 'about' });
        break;
    }
  };

  const handleSelectSkill = (skill: Skill) => {
    setActiveView({ type: 'skill', skill });
  };

  const goToDesktop = () => {
    setActiveView({ type: 'desktop' });
  };

  const goToFileManager = () => {
    setActiveView({ type: 'file-manager' });
  };

  return (
    <DesktopScene scene="default">
      <div className="min-h-screen flex flex-col">
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {/* Desktop / Program Manager */}
          {activeView.type === 'desktop' && (
            <div className="h-screen">
              <ProgramManager
                groups={programGroups}
                onOpenProgram={handleOpenProgram}
              />
            </div>
          )}

          {/* File Manager */}
          {activeView.type === 'file-manager' && (
            <div className="h-full p-2 flex items-start justify-center pt-8">
              <div className="w-full max-w-3xl">
                <FileManager
                  skills={skills}
                  onSelectSkill={handleSelectSkill}
                  onClose={goToDesktop}
                />
              </div>
            </div>
          )}

          {/* Skill Document */}
          {activeView.type === 'skill' && (
            <div className="h-full p-2 overflow-auto">
              <div className="max-w-5xl mx-auto">
                <div className="mb-2 flex gap-2">
                  <Win31Button onClick={goToFileManager}>
                    ← Skills
                  </Win31Button>
                  <Win31Button onClick={goToDesktop}>
                    🏠 Desktop
                  </Win31Button>
                </div>
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
                menuItems={[
                  { label: 'File', accel: 'F' },
                  { label: 'Edit', accel: 'E' },
                ]}
                className="w-full max-w-lg"
              >
                <div className="p-3 bg-[var(--win31-white)] overflow-auto max-h-[60vh] text-[11px] font-[var(--font-win31)] leading-tight">
                  <h1 className="text-[14px] font-bold mb-2">SOME CLAUDE SKILLS</h1>
                  <p className="mb-2">173 curated expert agents for Claude Code.</p>
                  
                  <hr className="border-[var(--bevel-dark)] my-2" />
                  
                  <h2 className="font-bold mb-1">WHAT ARE SKILLS?</h2>
                  <p className="mb-2">
                    Skills are markdown files that transform Claude into 
                    domain experts. Install them to get specialized help 
                    with TypeScript, React, DevOps, design systems, and more.
                  </p>
                  
                  <h2 className="font-bold mb-1">GETTING STARTED</h2>
                  <p className="mb-1">1. Double-click a skill icon to view it</p>
                  <p className="mb-1">2. Copy the install command</p>
                  <p className="mb-1">3. Paste in Claude Code</p>
                  <p className="mb-2">4. Claude now has that expertise!</p>
                  
                  <h2 className="font-bold mb-1">KEYBOARD SHORTCUTS</h2>
                  <p className="mb-1">Alt+F = File menu</p>
                  <p className="mb-1">Double-click = Open</p>
                  <p className="mb-2">Esc = Close window</p>
                  
                  <div className="bg-[var(--memphis-surface)] border border-[var(--bevel-dark)] p-2 mt-2">
                    <p className="font-bold">Memphis × Windows 3.1 Edition</p>
                    <p className="text-[10px]">Built with Next.js 15 + Tailwind v4</p>
                  </div>
                </div>
                <div className="p-2 flex justify-end gap-2 bg-[var(--memphis-surface)]">
                  <Win31Button onClick={goToFileManager}>Browse Skills</Win31Button>
                  <Win31Button onClick={goToDesktop} isDefault>OK</Win31Button>
                </div>
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
                  {/* Memphis Carlton-inspired decoration */}
                  <div className="memphis-carlton mb-3 mx-auto w-32">
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

                  <div className="text-[10px] mb-3">
                    <p>© 2024 Erich Owens</p>
                    <p className="text-[var(--win31-gray-dark)]">Ex-Meta ML Engineer</p>
                  </div>

                  <div className="bevel-in p-2 text-[10px] text-left">
                    <p>Skills: 173</p>
                    <p>Categories: 8</p>
                    <p>Next.js 15 + Tailwind v4</p>
                    <p>Cloudflare Pages</p>
                  </div>

                  {/* Memphis color bar */}
                  <div className="flex mt-3 h-2">
                    <div className="flex-1 bg-[var(--memphis-red)]" />
                    <div className="flex-1 bg-[var(--memphis-yellow)]" />
                    <div className="flex-1 bg-[var(--memphis-blue)]" />
                    <div className="flex-1 bg-[var(--memphis-green)]" />
                    <div className="flex-1 bg-[var(--memphis-pink)]" />
                    <div className="flex-1 bg-[var(--memphis-purple)]" />
                  </div>
                </div>
                <div className="p-2 flex justify-center bg-[var(--memphis-surface)]">
                  <Win31Button onClick={goToDesktop} isDefault>OK</Win31Button>
                </div>
              </Win31Window>
            </div>
          )}
        </main>

        {/* Welcome Dialog */}
        {showWelcome && (
          <Win31Dialog
            title="Welcome"
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
                label: 'Browse',
                onClick: () => {
                  setShowWelcome(false);
                  setActiveView({ type: 'file-manager' });
                },
                isDefault: true,
              },
              {
                label: 'OK',
                onClick: () => setShowWelcome(false),
              },
            ]}
            onClose={() => setShowWelcome(false)}
          >
            <p className="mb-2">
              <strong>173 Claude Code Skills</strong> organized by category.
            </p>
            <p>Double-click icons to explore. Tutorials teach you how to use skills.</p>
          </Win31Dialog>
        )}
      </div>
    </DesktopScene>
  );
}

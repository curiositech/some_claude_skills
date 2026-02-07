'use client';

import * as React from 'react';
import {
  ProgramManager,
  Win31Window,
  Win31Button,
  Win31Dialog,
  Win31Clock,
  Win31Solitaire,
  Win31Minesweeper,
  QBasicGorillas,
  DesktopScene,
  FileManager,
  TutorialWizard,
  TUTORIALS,
  type ProgramGroup,
  type TutorialId,
} from '@/components/memphis';
import { skills } from '@/lib/skills';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * MEMPHIS WIN31 DEMO PAGE
 * Showcases the complete design system
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function MemphisDemoPage() {
  const [activeTutorial, setActiveTutorial] = React.useState<TutorialId | null>(null);
  const [showDialog, setShowDialog] = React.useState(false);
  const [activeWindow, setActiveWindow] = React.useState<string | null>(null);

  // Program groups for Program Manager
  const programGroups: ProgramGroup[] = [
    {
      id: 'main',
      title: 'Main',
      icons: [
        { id: 'file-manager', label: 'File Manager', icon: '📁' },
        { id: 'control-panel', label: 'Control Panel', icon: '🎛️' },
        { id: 'print-manager', label: 'Print Manager', icon: '🖨️' },
        { id: 'clipboard', label: 'Clipboard Viewer', icon: '📋' },
        { id: 'ms-dos', label: 'MS-DOS Prompt', icon: '💻' },
        { id: 'read-me', label: 'Read Me', icon: '📖' },
      ],
    },
    {
      id: 'tutorials',
      title: 'Tutorials',
      icons: [
        { id: 'what-is-a-skill', label: 'What is a Skill?', icon: '❓' },
        { id: 'installing-skills', label: 'Installing Skills', icon: '📦' },
        { id: 'creative-writing', label: 'Writing with Skills', icon: '✍️' },
        { id: 'creative-coding', label: 'Coding with Skills', icon: '💻' },
        { id: 'building-skills', label: 'Build Your Own', icon: '🔧' },
        { id: 'skill-bundles', label: 'Skill Bundles', icon: '📚' },
      ],
    },
    {
      id: 'accessories',
      title: 'Accessories',
      icons: [
        { id: 'calculator', label: 'Calculator', icon: '🔢' },
        { id: 'calendar', label: 'Calendar', icon: '📅' },
        { id: 'clock', label: 'Clock', icon: '🕐' },
        { id: 'notepad', label: 'Notepad', icon: '📝' },
        { id: 'paintbrush', label: 'Paintbrush', icon: '🎨' },
        { id: 'terminal', label: 'Terminal', icon: '⬛' },
      ],
    },
    {
      id: 'games',
      title: 'Games',
      icons: [
        { id: 'solitaire', label: 'Solitaire', icon: '🃏' },
        { id: 'minesweeper', label: 'Minesweeper', icon: '💣' },
        { id: 'gorillas', label: 'GORILLA.BAS', icon: '🦍' },
      ],
    },
    {
      id: 'windags',
      title: 'winDAGs.AI',
      icons: [
        { id: 'dag-builder', label: 'DAG Builder', icon: '🔀' },
        { id: 'skill-matcher', label: 'Skill Matcher', icon: '🎯' },
        { id: 'workflow-editor', label: 'Workflow Editor', icon: '⚙️' },
      ],
    },
  ];

  const handleOpenProgram = (programId: string) => {
    // Check if it's a tutorial
    if (programId in TUTORIALS) {
      setActiveTutorial(programId as TutorialId);
      return;
    }

    // Open corresponding window
    setActiveWindow(programId);
  };

  return (
    <DesktopScene scene="default">
      <div className="min-h-screen p-4">
        {/* Header */}
        <div className="mb-4">
          <Win31Window
            title="Memphis Group × Windows 3.1 Design System"
            menuItems={[]}
            className="max-w-2xl mx-auto"
          >
            <div className="p-4 bg-[var(--memphis-cream)]">
              <h1 className="text-xl font-bold text-[var(--memphis-purple)] mb-2">
                🎨 Design System Preview
              </h1>
              <p className="text-sm text-[var(--memphis-black)] mb-4">
                &quot;What if Ettore Sottsass designed Windows?&quot; — A pixel-perfect Win3.1 UI
                with Memphis Group colors and patterns.
              </p>
              <div className="flex flex-wrap gap-2">
                <Win31Button onClick={() => setShowDialog(true)}>
                  Show Dialog
                </Win31Button>
                <Win31Button variant="primary">
                  Primary Button
                </Win31Button>
                <Win31Button onClick={() => setActiveWindow('file-manager')}>
                  Open File Manager
                </Win31Button>
              </div>
            </div>
          </Win31Window>
        </div>

        {/* Program Manager */}
        <div className="mb-4 max-w-4xl mx-auto">
          <div className="h-[500px]">
            <ProgramManager
              groups={programGroups}
              onOpenProgram={handleOpenProgram}
            />
          </div>
        </div>

        {/* Animated Windows Grid */}
        <div className="mb-4">
          <Win31Window
            title="Animated Background Elements"
            menuItems={['View']}
            className="max-w-4xl mx-auto"
          >
            <div className="p-4 bg-[var(--memphis-cream)]">
              <p className="text-sm mb-4">
                These animate in the background to create the nostalgic Win3.1 atmosphere:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                <Win31Clock size={120} />
                <Win31Solitaire />
                <Win31Minesweeper />
                <QBasicGorillas />
              </div>
            </div>
          </Win31Window>
        </div>

        {/* Color Palette */}
        <div className="mb-4">
          <Win31Window
            title="Memphis Color Palette"
            menuItems={[]}
            className="max-w-2xl mx-auto"
          >
            <div className="p-4 bg-[var(--memphis-cream)]">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: 'Pink', var: '--memphis-pink', hex: '#FF6B9D' },
                  { name: 'Cyan', var: '--memphis-cyan', hex: '#00D4FF' },
                  { name: 'Yellow', var: '--memphis-yellow', hex: '#FFE156' },
                  { name: 'Coral', var: '--memphis-coral', hex: '#FF7F6B' },
                  { name: 'Mint', var: '--memphis-mint', hex: '#7DFFC2' },
                  { name: 'Purple', var: '--memphis-purple', hex: '#6B5CE7' },
                ].map(color => (
                  <div
                    key={color.name}
                    className="p-2 text-center win31-window"
                  >
                    <div
                      className="w-full h-12 mb-2 border border-[var(--memphis-black)]"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="text-xs font-bold">{color.name}</div>
                    <div className="text-[10px] text-[var(--memphis-shadow)]">
                      {color.hex}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Win31Window>
        </div>

        {/* Dialog */}
        {showDialog && (
          <Win31Dialog
            title="About Memphis Win31"
            icon="info"
            buttons={[
              {
                label: 'OK',
                onClick: () => setShowDialog(false),
                isDefault: true,
              },
              {
                label: 'Cancel',
                onClick: () => setShowDialog(false),
              },
            ]}
            onClose={() => setShowDialog(false)}
          >
            <p>
              This is a pixel-perfect Windows 3.1 design system with Memphis Group
              colors and patterns.
            </p>
            <p className="mt-2">
              <strong>Version:</strong> 3.1 Memphis Edition
              <br />
              <strong>Style:</strong> Anti-minimalist, bold, joyful
            </p>
          </Win31Dialog>
        )}

        {/* Tutorial Wizard */}
        {activeTutorial && (
          <TutorialWizard
            title={TUTORIALS[activeTutorial].title}
            steps={TUTORIALS[activeTutorial].steps}
            onComplete={() => setActiveTutorial(null)}
            onClose={() => setActiveTutorial(null)}
          />
        )}

        {/* File Manager Window */}
        {activeWindow === 'file-manager' && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50">
            <div className="w-full max-w-3xl">
              <FileManager
                skills={skills}
                onSelectSkill={() => {
                  // Skill selected - could navigate to skill detail page
                  setActiveWindow(null);
                }}
              />
              <div className="mt-2 flex justify-end">
                <Win31Button onClick={() => setActiveWindow(null)}>
                  Close
                </Win31Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DesktopScene>
  );
}

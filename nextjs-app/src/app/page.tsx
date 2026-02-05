'use client';

import { useState } from 'react';
import {
  Folder,
  FileText,
  Settings,
  HelpCircle,
  Monitor,
  Cpu,
  Sparkles,
  Search,
  Star,
  PlusCircle,
  Book,
  Zap,
  Power,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Window,
  WindowContent,
  WindowWell,
  DesktopIcon,
  Taskbar,
  TaskbarButton,
  StartMenu,
  StartMenuItem,
  StartMenuDivider,
} from '@/components/win31';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * WINDOWS 3.1 POCKET EDITION - Homepage
 * A smartphone from 1992 that never existed
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function HomePage() {
  const [startOpen, setStartOpen] = useState(false);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);

  const openWindow = (id: string) => {
    setActiveWindow(id);
    setStartOpen(false);
  };

  const closeWindow = () => {
    setActiveWindow(null);
  };

  return (
    <div className="win-desktop flex flex-col no-bounce">
      {/* Desktop Area */}
      <main className="flex-1 overflow-auto p-4 pb-16">
        {/* Desktop Icons Grid */}
        {!activeWindow && (
          <div className="grid grid-cols-4 gap-1 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
            <DesktopIcon
              icon={Folder}
              label="Skills"
              size="touch"
              onDoubleClick={() => openWindow('skills')}
            />
            <DesktopIcon
              icon={Cpu}
              label="MCP Servers"
              size="touch"
              onDoubleClick={() => openWindow('mcp')}
            />
            <DesktopIcon
              icon={Star}
              label="Favorites"
              size="touch"
              onDoubleClick={() => openWindow('favorites')}
            />
            <DesktopIcon
              icon={Book}
              label="Docs"
              size="touch"
              onDoubleClick={() => openWindow('docs')}
            />
            <DesktopIcon
              icon={FileText}
              label="README"
              size="touch"
              onDoubleClick={() => openWindow('readme')}
            />
            <DesktopIcon
              icon={Settings}
              label="Control Panel"
              size="touch"
              onDoubleClick={() => openWindow('settings')}
            />
          </div>
        )}

        {/* Skills Window */}
        {activeWindow === 'skills' && (
          <Window
            title="Skills - 90+ Expert Agents"
            icon={<Folder className="h-4 w-4" />}
            onClose={closeWindow}
            mobile
            className="mx-auto max-w-2xl animate-fade-in"
          >
            <WindowContent>
              {/* Search Bar */}
              <div className="mb-4 flex gap-2">
                <div className="flex flex-1 items-center gap-2 border border-win31-gray-darker bg-white px-3 py-2 shadow-[inset_1px_1px_0_var(--color-win31-gray-darker)]">
                  <Search className="h-4 w-4 text-win31-gray-darker" />
                  <input
                    type="text"
                    placeholder="Search skills..."
                    className="flex-1 bg-transparent text-sm outline-none placeholder:text-win31-gray-darker"
                  />
                </div>
                <Button variant="default" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {/* Skills Grid */}
              <WindowWell className="p-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {[
                    { name: 'TypeScript Dev', icon: '📘' },
                    { name: 'System Architect', icon: '🏗️' },
                    { name: 'DevOps Engineer', icon: '🔧' },
                    { name: 'UI Designer', icon: '🎨' },
                    { name: 'Data Analyst', icon: '📊' },
                    { name: 'Security Auditor', icon: '🔒' },
                    { name: 'API Designer', icon: '🔌' },
                    { name: 'Test Engineer', icon: '🧪' },
                    { name: 'Doc Writer', icon: '📝' },
                  ].map((skill) => (
                    <button
                      key={skill.name}
                      className="flex items-center gap-2 rounded-none border border-transparent p-2 text-left text-sm hover:border-win31-navy hover:bg-win31-navy/10 active:bg-win31-navy active:text-white"
                    >
                      <span className="text-lg">{skill.icon}</span>
                      <span className="truncate">{skill.name}</span>
                    </button>
                  ))}
                </div>
              </WindowWell>

              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="primary" size="touch" className="flex-1">
                  <Zap className="h-4 w-4" />
                  Browse All
                </Button>
                <Button variant="default" size="touch">
                  <PlusCircle className="h-4 w-4" />
                  Submit
                </Button>
              </div>
            </WindowContent>
          </Window>
        )}

        {/* README Window */}
        {activeWindow === 'readme' && (
          <Window
            title="README.TXT"
            icon={<FileText className="h-4 w-4" />}
            onClose={closeWindow}
            mobile
            className="mx-auto max-w-2xl animate-fade-in"
          >
            <WindowWell className="m-2 max-h-[60vh] overflow-auto p-4">
              <h1 className="mb-4 font-display text-xl text-win31-navy">
                Welcome to Skills 3.1
              </h1>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>
                  <strong>Some Claude Skills</strong> is a curated collection of 90+ expert
                  AI agents for Claude Code.
                </p>
                <p>
                  Each skill transforms Claude into a specialized expert—from TypeScript
                  development to system architecture, DevOps to UI design.
                </p>
                <h2 className="mt-4 font-semibold text-win31-navy">Getting Started</h2>
                <ol className="list-inside list-decimal space-y-1">
                  <li>Browse the Skills folder</li>
                  <li>Find a skill that matches your task</li>
                  <li>Copy the skill to your project</li>
                  <li>Claude becomes an expert</li>
                </ol>
                <h2 className="mt-4 font-semibold text-win31-navy">About This UI</h2>
                <p>
                  This is Windows 3.1 Pocket Edition—imagining what a smartphone would
                  look like if Microsoft made one in 1992.
                </p>
                <p className="text-win31-gray-darker">
                  Built with Next.js 15, Tailwind CSS v4, and deployed on Cloudflare Pages.
                </p>
              </div>
            </WindowWell>
            <div className="flex justify-end gap-2 p-2">
              <Button variant="default" onClick={closeWindow}>
                OK
              </Button>
            </div>
          </Window>
        )}

        {/* Settings Window */}
        {activeWindow === 'settings' && (
          <Window
            title="Control Panel"
            icon={<Settings className="h-4 w-4" />}
            onClose={closeWindow}
            mobile
            className="mx-auto max-w-md animate-fade-in"
          >
            <WindowContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Monitor, label: 'Display' },
                  { icon: Cpu, label: 'System' },
                  { icon: HelpCircle, label: 'About' },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className="flex flex-col items-center gap-2 p-3 hover:bg-win31-navy/10 active:bg-win31-navy active:text-white"
                  >
                    <Icon className="h-8 w-8" />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </WindowContent>
          </Window>
        )}

        {/* Placeholder for other windows */}
        {activeWindow && !['skills', 'readme', 'settings'].includes(activeWindow) && (
          <Window
            title={activeWindow.charAt(0).toUpperCase() + activeWindow.slice(1)}
            icon={<Sparkles className="h-4 w-4" />}
            onClose={closeWindow}
            mobile
            className="mx-auto max-w-md animate-fade-in"
          >
            <WindowContent className="py-8 text-center">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-win31-navy" />
              <p className="text-sm text-win31-gray-darker">
                Coming soon...
              </p>
            </WindowContent>
            <div className="flex justify-center gap-2 p-2">
              <Button variant="default" onClick={closeWindow}>
                OK
              </Button>
            </div>
          </Window>
        )}
      </main>

      {/* Taskbar */}
      <Taskbar onStartClick={() => setStartOpen(!startOpen)}>
        {activeWindow && (
          <TaskbarButton
            active
            icon={<Folder className="h-3 w-3" />}
            onClick={() => {}}
          >
            {activeWindow.charAt(0).toUpperCase() + activeWindow.slice(1)}
          </TaskbarButton>
        )}
      </Taskbar>

      {/* Start Menu */}
      <StartMenu open={startOpen} onClose={() => setStartOpen(false)}>
        <StartMenuItem
          icon={Folder}
          label="Skills"
          onClick={() => openWindow('skills')}
        />
        <StartMenuItem
          icon={Cpu}
          label="MCP Servers"
          onClick={() => openWindow('mcp')}
        />
        <StartMenuItem
          icon={Star}
          label="Favorites"
          onClick={() => openWindow('favorites')}
        />
        <StartMenuItem
          icon={Book}
          label="Documentation"
          onClick={() => openWindow('docs')}
        />
        <StartMenuDivider />
        <StartMenuItem
          icon={Search}
          label="Find..."
          shortcut="Ctrl+F"
          onClick={() => openWindow('skills')}
        />
        <StartMenuItem
          icon={Settings}
          label="Control Panel"
          onClick={() => openWindow('settings')}
        />
        <StartMenuItem
          icon={HelpCircle}
          label="Help"
          shortcut="F1"
          onClick={() => openWindow('readme')}
        />
        <StartMenuDivider />
        <StartMenuItem
          icon={Power}
          label="Shut Down..."
          onClick={() => setStartOpen(false)}
        />
      </StartMenu>
    </div>
  );
}

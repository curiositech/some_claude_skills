'use client';

import * as React from 'react';
import { Search, Grid, List, Folder, FileText } from 'lucide-react';

import { cn } from '@/lib/utils';
import { type Skill, type SkillCategory, skills, categoryMeta, searchSkills } from '@/lib/skills';
import { Button } from '@/components/ui/button';
import { Window, WindowStatusBar } from './window';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * SKILL BROWSER
 * File manager-style browser for skills
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface SkillBrowserProps {
  onSelectSkill: (skill: Skill) => void;
  onClose: () => void;
}

export function SkillBrowser({ onSelectSkill, onClose }: SkillBrowserProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<SkillCategory | 'all'>('all');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('list');

  const filteredSkills = React.useMemo(() => {
    let result = searchQuery ? searchSkills(searchQuery) : skills;
    if (selectedCategory !== 'all') {
      result = result.filter((s) => s.category === selectedCategory);
    }
    return result;
  }, [searchQuery, selectedCategory]);

  const categories = Object.entries(categoryMeta) as [SkillCategory, { label: string; icon: string }][];

  return (
    <Window
      title="Skills - File Manager"
      icon={<Folder className="h-4 w-4" />}
      onClose={onClose}
      className="mx-auto h-[calc(100dvh-60px)] max-w-5xl animate-fade-in"
      mobile
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-win31-gray-darker bg-win31-gray px-2 py-1.5">
        {/* Search */}
        <div className="flex min-w-[200px] flex-1 items-center gap-2 border border-win31-gray-darker bg-white px-2 py-1 shadow-[inset_1px_1px_0_var(--color-win31-gray-darker)]">
          <Search className="h-4 w-4 text-win31-gray-darker" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-win31-gray-darker"
          />
        </div>

        {/* View toggles */}
        <div className="flex border border-win31-gray-darker">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setViewMode('grid')}
            className={cn(
              'rounded-none border-r border-win31-gray-darker',
              viewMode === 'grid' && 'bg-win31-navy text-white'
            )}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setViewMode('list')}
            className={cn(
              'rounded-none',
              viewMode === 'list' && 'bg-win31-navy text-white'
            )}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Category sidebar */}
        <aside className="hidden w-48 flex-shrink-0 overflow-auto border-r border-win31-gray-darker bg-win31-gray-light sm:block">
          <div className="p-2">
            <div className="mb-2 text-xs font-semibold text-win31-gray-darker">Categories</div>
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm',
                'hover:bg-win31-navy hover:text-white',
                selectedCategory === 'all' && 'bg-win31-navy text-white'
              )}
            >
              <Folder className="h-4 w-4" />
              <span>All Skills</span>
              <span className="ml-auto text-xs opacity-70">{skills.length}</span>
            </button>
            {categories.map(([cat, meta]) => {
              const count = skills.filter((s) => s.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    'flex w-full items-center gap-2 px-2 py-1.5 text-left text-sm',
                    'hover:bg-win31-navy hover:text-white',
                    selectedCategory === cat && 'bg-win31-navy text-white'
                  )}
                >
                  <span>{meta.icon}</span>
                  <span className="flex-1 truncate">{meta.label}</span>
                  <span className="text-xs opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Mobile category dropdown */}
        <div className="border-b border-win31-gray-darker bg-win31-gray-light p-2 sm:hidden">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as SkillCategory | 'all')}
            className="w-full border border-win31-gray-darker bg-white px-2 py-1.5 text-sm"
          >
            <option value="all">All Skills ({skills.length})</option>
            {categories.map(([cat, meta]) => (
              <option key={cat} value={cat}>
                {meta.icon} {meta.label} ({skills.filter((s) => s.category === cat).length})
              </option>
            ))}
          </select>
        </div>

        {/* File list */}
        <div className="flex-1 overflow-auto bg-white">
          {viewMode === 'list' ? (
            <SkillListView skills={filteredSkills} onSelect={onSelectSkill} />
          ) : (
            <SkillGridView skills={filteredSkills} onSelect={onSelectSkill} />
          )}
        </div>
      </div>

      {/* Status bar */}
      <WindowStatusBar>
        <span>{filteredSkills.length} skill(s)</span>
        <span className="mx-2">|</span>
        <span>{selectedCategory === 'all' ? 'All Categories' : categoryMeta[selectedCategory].label}</span>
      </WindowStatusBar>
    </Window>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * LIST VIEW
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface SkillViewProps {
  skills: Skill[];
  onSelect: (skill: Skill) => void;
}

function SkillListView({ skills, onSelect }: SkillViewProps) {
  return (
    <div className="divide-y divide-win31-gray-light">
      {/* Header */}
      <div className="sticky top-0 flex items-center gap-3 bg-win31-gray px-3 py-1.5 text-xs font-semibold text-win31-gray-darker">
        <span className="w-8"></span>
        <span className="flex-1">Name</span>
        <span className="hidden w-32 sm:block">Category</span>
        <span className="hidden w-24 sm:block">Difficulty</span>
      </div>

      {/* Items */}
      {skills.map((skill) => (
        <button
          key={skill.id}
          onClick={() => onSelect(skill)}
          onDoubleClick={() => onSelect(skill)}
          className={cn(
            'flex w-full items-center gap-3 px-3 py-2 text-left',
            'hover:bg-win31-navy hover:text-white',
            'focus:bg-win31-navy focus:text-white focus:outline-none',
            'group'
          )}
        >
          <span className="w-8 text-xl">{skill.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 flex-shrink-0 text-win31-gray-darker group-hover:text-white/70 group-focus:text-white/70" />
              <span className="truncate font-medium">{skill.title}</span>
            </div>
            <p className="truncate text-xs text-win31-gray-darker group-hover:text-white/70 group-focus:text-white/70">
              {skill.description}
            </p>
          </div>
          <span className="hidden w-32 text-xs sm:block">
            {categoryMeta[skill.category].label}
          </span>
          <span className="hidden w-24 text-xs capitalize sm:block">
            {skill.difficulty}
          </span>
        </button>
      ))}

      {skills.length === 0 && (
        <div className="p-8 text-center text-sm text-win31-gray-darker">
          No skills found matching your search.
        </div>
      )}
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GRID VIEW
 * ═══════════════════════════════════════════════════════════════════════════
 */

function SkillGridView({ skills, onSelect }: SkillViewProps) {
  return (
    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {skills.map((skill) => (
        <button
          key={skill.id}
          onClick={() => onSelect(skill)}
          onDoubleClick={() => onSelect(skill)}
          className={cn(
            'flex flex-col items-center gap-2 rounded-sm p-3',
            'hover:bg-win31-navy hover:text-white',
            'focus:bg-win31-navy focus:text-white focus:outline-none',
            'group'
          )}
        >
          <span className="text-4xl">{skill.icon}</span>
          <span className="text-center text-xs font-medium leading-tight">
            {skill.title}
          </span>
        </button>
      ))}

      {skills.length === 0 && (
        <div className="col-span-full p-8 text-center text-sm text-win31-gray-darker">
          No skills found matching your search.
        </div>
      )}
    </div>
  );
}


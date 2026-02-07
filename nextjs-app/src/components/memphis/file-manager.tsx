'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Win31Window } from './program-manager';
import type { Skill } from '@/lib/skills';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE MANAGER - Win3.1 style skill browser
 * Left tree panel + right file list, just like the original
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface FileManagerProps {
  skills: Skill[];
  onSelectSkill?: (skill: Skill) => void;
  className?: string;
}

export function FileManager({ skills, onSelectSkill, className }: FileManagerProps) {
  const [selectedFolder, setSelectedFolder] = React.useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = React.useState<Skill | null>(null);

  // Group skills by category
  const categories = React.useMemo(() => {
    const cats = new Map<string, Skill[]>();
    skills.forEach(skill => {
      const cat = skill.category || 'uncategorized';
      if (!cats.has(cat)) {
        cats.set(cat, []);
      }
      cats.get(cat)!.push(skill);
    });
    return cats;
  }, [skills]);

  // Get visible skills based on selected folder
  const visibleSkills = React.useMemo(() => {
    if (!selectedFolder) return skills;
    return categories.get(selectedFolder) || [];
  }, [selectedFolder, categories, skills]);

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill);
  };

  const handleSkillDoubleClick = (skill: Skill) => {
    onSelectSkill?.(skill);
  };

  return (
    <Win31Window
      title={`File Manager - [C:\\CLAUDE\\SKILLS\\${selectedFolder ? selectedFolder.toUpperCase() : '*.*'}]`}
      menuItems={['File', 'Disk', 'Tree', 'View', 'Options', 'Window', 'Help']}
      statusText={`${visibleSkills.length} skill(s)`}
      className={cn('h-[400px]', className)}
    >
      <div className="flex h-full">
        {/* Toolbar */}
        <div className="absolute top-[38px] left-0 right-0 flex items-center gap-1 px-1 py-0.5 bg-[var(--memphis-cream)] border-b border-[var(--memphis-shadow)]">
          <ToolbarButton icon="📁" label="Open" />
          <ToolbarButton icon="💾" label="Copy" />
          <ToolbarButton icon="🗑️" label="Delete" />
          <div className="w-px h-4 bg-[var(--memphis-shadow)] mx-1" />
          <ToolbarButton icon="🔍" label="Search" />
        </div>

        {/* Drive bar */}
        <div className="absolute top-[56px] left-0 right-0 flex items-center px-2 py-1 bg-[var(--memphis-cream)] border-b border-[var(--memphis-shadow)]">
          <span className="text-xs mr-2">C:</span>
          <div className="win31-input flex-1 text-xs py-0.5">
            C:\CLAUDE\SKILLS\{selectedFolder ? selectedFolder.toUpperCase() : '*.*'}
          </div>
        </div>

        {/* Tree pane (left) */}
        <div className="w-1/3 border-r border-[var(--memphis-shadow)] mt-[56px] overflow-auto">
          <div className="p-1">
            {/* Root drive */}
            <TreeItem
              icon="💾"
              label="C:"
              isExpanded
              level={0}
            >
              <TreeItem
                icon="📁"
                label="CLAUDE"
                isExpanded
                level={1}
              >
                <TreeItem
                  icon="📂"
                  label="SKILLS"
                  isExpanded
                  isSelected={selectedFolder === null}
                  onClick={() => setSelectedFolder(null)}
                  level={2}
                >
                  {Array.from(categories.keys()).sort().map(cat => (
                    <TreeItem
                      key={cat}
                      icon={selectedFolder === cat ? '📂' : '📁'}
                      label={cat.toUpperCase()}
                      isSelected={selectedFolder === cat}
                      onClick={() => setSelectedFolder(cat)}
                      level={3}
                    />
                  ))}
                </TreeItem>
              </TreeItem>
            </TreeItem>
          </div>
        </div>

        {/* File list pane (right) */}
        <div className="flex-1 mt-[56px] overflow-auto bg-white">
          <div className="p-1">
            {/* Directory header */}
            <div className="text-xs text-[var(--memphis-shadow)] mb-1 px-1">
              C:\CLAUDE\SKILLS\{selectedFolder?.toUpperCase() || '*.*'}
            </div>

            {/* File grid */}
            <div className="grid grid-cols-4 gap-1 p-1">
              {/* Parent directory */}
              {selectedFolder && (
                <FileItem
                  icon="📁"
                  label=".."
                  onDoubleClick={() => setSelectedFolder(null)}
                />
              )}

              {/* Folders (if at root) */}
              {!selectedFolder &&
                Array.from(categories.keys()).sort().map(cat => (
                  <FileItem
                    key={cat}
                    icon="📁"
                    label={cat.substring(0, 8).toUpperCase()}
                    onDoubleClick={() => setSelectedFolder(cat)}
                  />
                ))}

              {/* Skills */}
              {visibleSkills.map(skill => (
                <FileItem
                  key={skill.id}
                  icon={skill.icon || '📄'}
                  label={skill.id.substring(0, 12).toUpperCase() + '.MD'}
                  isSelected={selectedSkill?.id === skill.id}
                  onClick={() => handleSkillClick(skill)}
                  onDoubleClick={() => handleSkillDoubleClick(skill)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Scrollbar (decorative) */}
        <div className="win31-scrollbar flex flex-col mt-[56px]">
          <button className="win31-scrollbar-arrow">▲</button>
          <div className="flex-1 relative">
            <div className="win31-scrollbar-thumb absolute top-0 left-0 right-0 h-8" />
          </div>
          <button className="win31-scrollbar-arrow">▼</button>
        </div>
      </div>
    </Win31Window>
  );
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * TREE ITEM - Collapsible folder in tree view
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface TreeItemProps {
  icon: string;
  label: string;
  isExpanded?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  level: number;
  children?: React.ReactNode;
}

function TreeItem({
  icon,
  label,
  isExpanded,
  isSelected,
  onClick,
  level,
  children,
}: TreeItemProps) {
  const [expanded, setExpanded] = React.useState(isExpanded ?? false);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (children) {
      setExpanded(!expanded);
    }
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 py-0.5 cursor-pointer text-xs',
          isSelected && 'bg-[var(--memphis-purple)] text-white'
        )}
        style={{ paddingLeft: level * 12 }}
        onClick={onClick}
      >
        {/* Expand/collapse indicator */}
        <span
          className="w-3 h-3 flex items-center justify-center text-[8px]"
          onClick={toggleExpand}
        >
          {children ? (expanded ? '▼' : '▶') : ''}
        </span>
        
        {/* Icon */}
        <span>{icon}</span>
        
        {/* Label */}
        <span>{label}</span>
      </div>

      {/* Children */}
      {expanded && children && (
        <div className="border-l border-dotted border-[var(--memphis-shadow)] ml-[6px]">
          {children}
        </div>
      )}
    </div>
  );
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * FILE ITEM - File/folder icon in list view
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface FileItemProps {
  icon: string;
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

function FileItem({
  icon,
  label,
  isSelected,
  onClick,
  onDoubleClick,
}: FileItemProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center p-1 cursor-pointer text-center',
        isSelected && 'bg-[var(--memphis-purple)]'
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <span className="text-lg">{icon}</span>
      <span
        className={cn(
          'text-[9px] break-all leading-tight max-w-full',
          isSelected && 'text-white'
        )}
      >
        {label}
      </span>
    </div>
  );
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * TOOLBAR BUTTON
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface ToolbarButtonProps {
  icon: string;
  label: string;
  onClick?: () => void;
}

function ToolbarButton({ icon, label, onClick }: ToolbarButtonProps) {
  return (
    <button
      className="flex flex-col items-center px-2 py-0.5 hover:bg-[var(--memphis-cream-dark)] text-[9px]"
      onClick={onClick}
      title={label}
    >
      <span className="text-sm">{icon}</span>
    </button>
  );
}

export default FileManager;

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Win31Window } from './program-manager';
import type { Skill } from '@/lib/skills';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * FILE MANAGER - Authentic Win3.1 Style
 * 
 * - Tree view (left) + file list (right)
 * - Dense layout, 16px icons
 * - Proper scrollbars
 * - Status bar with file count
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface FileManagerProps {
  skills: Skill[];
  onSelectSkill?: (skill: Skill) => void;
  onClose?: () => void;
  className?: string;
}

export function FileManager({ skills, onSelectSkill, onClose, className }: FileManagerProps) {
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

  // Get visible skills
  const visibleSkills = React.useMemo(() => {
    if (!selectedFolder) return skills.slice(0, 50); // Show first 50 at root
    return categories.get(selectedFolder) || [];
  }, [selectedFolder, categories, skills]);

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkill(skill);
  };

  const handleSkillDoubleClick = (skill: Skill) => {
    onSelectSkill?.(skill);
  };

  const currentPath = selectedFolder 
    ? `C:\\CLAUDE\\SKILLS\\${selectedFolder.toUpperCase()}`
    : 'C:\\CLAUDE\\SKILLS\\*.*';

  return (
    <Win31Window
      title={`File Manager - [${currentPath}]`}
      icon="📁"
      onClose={onClose}
      onMinimize={() => {}}
      onMaximize={() => {}}
      menuItems={[
        { label: 'File', accel: 'F' },
        { label: 'Disk', accel: 'D' },
        { label: 'Tree', accel: 'T' },
        { label: 'View', accel: 'V' },
        { label: 'Options', accel: 'O' },
        { label: 'Window', accel: 'W' },
        { label: 'Help', accel: 'H' },
      ]}
      statusText={`${visibleSkills.length} file(s) | ${skills.length} total`}
      className={cn('h-[350px]', className)}
      resizable
    >
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-1 py-1 bg-[var(--memphis-surface)] border-b border-[var(--bevel-dark)]">
        <ToolbarButton icon="📁" title="Open" />
        <ToolbarButton icon="💾" title="Copy" />
        <ToolbarButton icon="📋" title="Paste" />
        <div className="w-px h-12px bg-[var(--bevel-dark)] mx-1" />
        <ToolbarButton icon="🗑️" title="Delete" />
        <div className="w-px h-12px bg-[var(--bevel-dark)] mx-1" />
        <ToolbarButton icon="🔍" title="Search" />
      </div>

      {/* Drive/Path Bar */}
      <div className="flex items-center gap-2 px-2 py-1 bg-[var(--memphis-surface)] border-b border-[var(--bevel-dark)]">
        <span className="text-[10px] font-bold">C:</span>
        <div className="win31-input flex-1 text-[10px] py-0">{currentPath}</div>
      </div>

      {/* Main split view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Tree Pane (Left) */}
        <div className="w-1/3 border-r border-[var(--bevel-dark)] overflow-auto bg-[var(--win31-white)]">
          <div className="p-1">
            <TreeItem
              icon="💾"
              label="C:"
              expanded
              level={0}
            >
              <TreeItem
                icon="📁"
                label="CLAUDE"
                expanded
                level={1}
              >
                <TreeItem
                  icon={selectedFolder === null ? '📂' : '📁'}
                  label="SKILLS"
                  expanded
                  selected={selectedFolder === null}
                  onClick={() => setSelectedFolder(null)}
                  level={2}
                >
                  {Array.from(categories.keys()).sort().map(cat => (
                    <TreeItem
                      key={cat}
                      icon={selectedFolder === cat ? '📂' : '📁'}
                      label={cat.toUpperCase().substring(0, 12)}
                      selected={selectedFolder === cat}
                      onClick={() => setSelectedFolder(cat)}
                      level={3}
                    />
                  ))}
                </TreeItem>
              </TreeItem>
            </TreeItem>
          </div>
        </div>

        {/* File List Pane (Right) */}
        <div className="flex-1 overflow-auto bg-[var(--win31-white)]">
          <div className="p-1">
            {/* Column header */}
            <div className="flex gap-2 px-1 py-0 border-b border-[var(--bevel-dark)] text-[9px] font-bold text-[var(--win31-gray-dark)]">
              <span className="w-32">Name</span>
              <span className="w-16">Size</span>
              <span className="flex-1">Type</span>
            </div>

            {/* Parent folder */}
            {selectedFolder && (
              <FileRow
                icon="📁"
                name=".."
                size=""
                type="Parent Directory"
                onClick={() => setSelectedFolder(null)}
                onDoubleClick={() => setSelectedFolder(null)}
              />
            )}

            {/* Category folders (if at root) */}
            {!selectedFolder && Array.from(categories.entries()).map(([cat, catSkills]) => (
              <FileRow
                key={cat}
                icon="📁"
                name={cat.toUpperCase().substring(0, 12)}
                size={`${catSkills.length}`}
                type="Directory"
                onClick={() => setSelectedFolder(cat)}
                onDoubleClick={() => setSelectedFolder(cat)}
              />
            ))}

            {/* Skill files */}
            {(selectedFolder ? visibleSkills : []).map(skill => (
              <FileRow
                key={skill.id}
                icon={skill.icon || '📄'}
                name={`${skill.id.substring(0, 14)}.MD`}
                size={`${Math.round(skill.content.length / 100)}KB`}
                type="Skill File"
                selected={selectedSkill?.id === skill.id}
                onClick={() => handleSkillClick(skill)}
                onDoubleClick={() => handleSkillDoubleClick(skill)}
              />
            ))}
          </div>
        </div>
      </div>
    </Win31Window>
  );
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * TREE ITEM - Expandable folder node
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface TreeItemProps {
  icon: string;
  label: string;
  expanded?: boolean;
  selected?: boolean;
  onClick?: () => void;
  level: number;
  children?: React.ReactNode;
}

function TreeItem({
  icon,
  label,
  expanded: initialExpanded,
  selected,
  onClick,
  level,
  children,
}: TreeItemProps) {
  const [expanded, setExpanded] = React.useState(initialExpanded ?? false);
  const hasChildren = React.Children.count(children) > 0;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1 py-0 cursor-pointer text-[10px] hover:bg-[var(--memphis-cyan)] hover:text-[var(--win31-black)]',
          selected && 'bg-[var(--memphis-purple)] text-[var(--win31-white)]'
        )}
        style={{ paddingLeft: level * 10 + 2 }}
        onClick={() => {
          onClick?.();
          if (hasChildren) setExpanded(!expanded);
        }}
      >
        {/* Expand indicator */}
        <span className="w-8px text-[8px] text-center">
          {hasChildren ? (expanded ? '▼' : '▶') : ''}
        </span>
        
        {/* Icon */}
        <span className="text-[12px]">{icon}</span>
        
        {/* Label */}
        <span className="truncate">{label}</span>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div className="border-l border-dotted border-[var(--win31-gray-dark)] ml-[8px]">
          {children}
        </div>
      )}
    </div>
  );
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * FILE ROW - Single row in file list
 * ─────────────────────────────────────────────────────────────────────────────
 */

interface FileRowProps {
  icon: string;
  name: string;
  size: string;
  type: string;
  selected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

function FileRow({
  icon,
  name,
  size,
  type,
  selected,
  onClick,
  onDoubleClick,
}: FileRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-1 py-0 cursor-pointer text-[10px] hover:bg-[var(--memphis-cyan)]',
        selected && 'bg-[var(--memphis-purple)] text-[var(--win31-white)]'
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <span className="text-[12px] w-4">{icon}</span>
      <span className="w-32 truncate">{name}</span>
      <span className="w-16 text-right">{size}</span>
      <span className="flex-1 truncate text-[var(--win31-gray-dark)]">{type}</span>
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
  title: string;
  onClick?: () => void;
}

function ToolbarButton({ icon, title, onClick }: ToolbarButtonProps) {
  return (
    <button
      className="flex items-center justify-center w-20px h-18px bg-[var(--memphis-surface)] border border-[var(--win31-black)] text-[12px] hover:bg-[var(--memphis-surface-light)] active:border-inset"
      style={{ 
        width: 20, 
        height: 18,
        boxShadow: 'inset 1px 1px 0 var(--bevel-light), inset -1px -1px 0 var(--bevel-dark)'
      }}
      onClick={onClick}
      title={title}
    >
      {icon}
    </button>
  );
}

export default FileManager;

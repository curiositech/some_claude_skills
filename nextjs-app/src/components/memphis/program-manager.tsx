'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PROGRAM MANAGER - Authentic Windows 3.1
 * 
 * - Icon left, centered title, controls right
 * - 3×N icon grids in group windows
 * - Minimize = icon at bottom of screen
 * - Dense spacing, bitmap fonts
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface ProgramIcon {
  id: string;
  label: string;
  icon: string; // emoji or image URL
  onClick?: () => void;
}

export interface ProgramGroup {
  id: string;
  title: string;
  icons: ProgramIcon[];
  position?: { x: number; y: number };
  minimized?: boolean;
}

interface ProgramManagerProps {
  groups: ProgramGroup[];
  onOpenProgram?: (programId: string) => void;
  children?: React.ReactNode;
}

export function ProgramManager({ groups, onOpenProgram, children }: ProgramManagerProps) {
  const [groupStates, setGroupStates] = React.useState<Record<string, {
    minimized: boolean;
    position: { x: number; y: number };
  }>>(() => {
    // Initialize group positions in a grid
    const states: Record<string, { minimized: boolean; position: { x: number; y: number } }> = {};
    groups.forEach((group, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      states[group.id] = {
        minimized: group.minimized || false,
        position: group.position || { x: 8 + col * 200, y: 24 + row * 140 },
      };
    });
    return states;
  });

  const [selectedIcon, setSelectedIcon] = React.useState<string | null>(null);
  const [activeGroup, setActiveGroup] = React.useState<string | null>(null);

  const minimizeGroup = (groupId: string) => {
    setGroupStates(prev => ({
      ...prev,
      [groupId]: { ...prev[groupId], minimized: true },
    }));
  };

  const restoreGroup = (groupId: string) => {
    setGroupStates(prev => ({
      ...prev,
      [groupId]: { ...prev[groupId], minimized: false },
    }));
    setActiveGroup(groupId);
  };

  const handleIconClick = (iconId: string, groupId: string) => {
    setSelectedIcon(iconId);
    setActiveGroup(groupId);
  };

  const handleIconDoubleClick = (iconId: string) => {
    onOpenProgram?.(iconId);
  };

  const minimizedGroups = groups.filter(g => groupStates[g.id]?.minimized);
  const openGroups = groups.filter(g => !groupStates[g.id]?.minimized);

  return (
    <div className="win31-window flex flex-col h-full">
      {/* Title Bar */}
      <div className="win31-titlebar">
        <button className="win31-sysmenu" aria-label="System menu" />
        <span className="win31-titlebar-text">Program Manager</span>
        <div className="win31-titlebar-controls">
          <button className="win31-titlebar-btn win31-btn-minimize" aria-label="Minimize" />
          <button className="win31-titlebar-btn win31-btn-maximize" aria-label="Maximize" />
        </div>
      </div>

      {/* Menu Bar with Accelerators */}
      <div className="win31-menubar">
        <span className="win31-menubar-item">
          <span className="accel">F</span>ile
        </span>
        <span className="win31-menubar-item">
          <span className="accel">O</span>ptions
        </span>
        <span className="win31-menubar-item">
          <span className="accel">W</span>indow
        </span>
        <span className="win31-menubar-item">
          <span className="accel">H</span>elp
        </span>
      </div>

      {/* MDI Client Area */}
      <div 
        className="flex-1 overflow-hidden relative"
        style={{ background: 'var(--memphis-surface-dark)' }}
      >
        {/* Open Group Windows */}
        {openGroups.map((group) => (
          <GroupWindow
            key={group.id}
            group={group}
            position={groupStates[group.id]?.position || { x: 0, y: 0 }}
            isActive={activeGroup === group.id}
            selectedIcon={selectedIcon}
            onMinimize={() => minimizeGroup(group.id)}
            onActivate={() => setActiveGroup(group.id)}
            onIconClick={(id) => handleIconClick(id, group.id)}
            onIconDoubleClick={handleIconDoubleClick}
          />
        ))}

        {/* Decorative elements */}
        {children}
      </div>

      {/* Minimized Windows Bar - Bottom of screen */}
      {minimizedGroups.length > 0 && (
        <div className="win31-minimized-bar">
          {minimizedGroups.map((group) => (
            <button
              key={group.id}
              className="win31-minimized-icon"
              onClick={() => restoreGroup(group.id)}
              onDoubleClick={() => restoreGroup(group.id)}
            >
              <span className="win31-minimized-icon-img">
                {group.icons[0]?.icon || '📁'}
              </span>
              <span className="truncate">{group.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * GROUP WINDOW - Child MDI window with 3×N icon grid
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface GroupWindowProps {
  group: ProgramGroup;
  position: { x: number; y: number };
  isActive: boolean;
  selectedIcon: string | null;
  onMinimize: () => void;
  onActivate: () => void;
  onIconClick: (id: string) => void;
  onIconDoubleClick: (id: string) => void;
}

function GroupWindow({
  group,
  position,
  isActive,
  selectedIcon,
  onMinimize,
  onActivate,
  onIconClick,
  onIconDoubleClick,
}: GroupWindowProps) {
  return (
    <div
      className={cn(
        'win31-group absolute',
        !isActive && 'opacity-90'
      )}
      style={{
        left: position.x,
        top: position.y,
        zIndex: isActive ? 10 : 1,
      }}
      onClick={onActivate}
    >
      {/* Group Title Bar */}
      <div className={cn(
        'win31-group-titlebar',
        !isActive && 'win31-titlebar-inactive'
      )}>
        <span className="truncate text-[10px]">{group.title}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onMinimize(); }}
          className="w-12px h-10px bg-[var(--memphis-surface)] border border-[var(--win31-black)] text-[8px] leading-none flex items-center justify-center hover:bg-[var(--memphis-surface-light)]"
          style={{ width: 12, height: 10 }}
          aria-label="Minimize"
        >
          ▼
        </button>
      </div>

      {/* Icon Grid - 3 columns */}
      <div className="win31-group-content">
        {group.icons.map((icon) => (
          <ProgramIconComponent
            key={icon.id}
            icon={icon}
            isSelected={selectedIcon === icon.id}
            onClick={() => onIconClick(icon.id)}
            onDoubleClick={() => onIconDoubleClick(icon.id)}
          />
        ))}
      </div>
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PROGRAM ICON - 32×32 with tight label
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface ProgramIconComponentProps {
  icon: ProgramIcon;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}

function ProgramIconComponent({
  icon,
  isSelected,
  onClick,
  onDoubleClick,
}: ProgramIconComponentProps) {
  const isImageUrl = icon.icon.startsWith('/') || icon.icon.startsWith('http');

  return (
    <button
      className={cn('win31-icon', isSelected && 'win31-icon-selected')}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      tabIndex={0}
    >
      {isImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={icon.icon}
          alt=""
          className="win31-icon-image"
        />
      ) : (
        <span className="win31-icon-emoji">{icon.icon}</span>
      )}
      <span className="win31-icon-label">{icon.label}</span>
    </button>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * WIN31 WINDOW - Standalone window component
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface Win31WindowProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
  menuItems?: Array<{ label: string; accel?: string } | string>;
  statusText?: string;
  resizable?: boolean;
}

export function Win31Window({
  title,
  icon,
  children,
  onClose,
  onMinimize,
  onMaximize,
  className,
  menuItems = [],
  statusText,
  resizable = false,
}: Win31WindowProps) {
  return (
    <div className={cn(
      'win31-window flex flex-col',
      resizable && 'win31-window-resizable',
      className
    )}>
      {/* Title Bar */}
      <div className="win31-titlebar">
        <button className="win31-sysmenu" onClick={onClose} aria-label="System menu">
          {icon && <span className="text-[8px]">{icon}</span>}
        </button>
        <span className="win31-titlebar-text">{title}</span>
        <div className="win31-titlebar-controls">
          {onMinimize && (
            <button 
              className="win31-titlebar-btn win31-btn-minimize" 
              onClick={onMinimize}
              aria-label="Minimize"
            />
          )}
          {onMaximize && (
            <button 
              className="win31-titlebar-btn win31-btn-maximize" 
              onClick={onMaximize}
              aria-label="Maximize"
            />
          )}
        </div>
      </div>

      {/* Menu Bar */}
      {menuItems.length > 0 && (
        <div className="win31-menubar">
          {menuItems.map((item, i) => {
            // Handle string format
            if (typeof item === 'string') {
              return (
                <span key={i} className="win31-menubar-item">
                  <span className="accel">{item[0]}</span>{item.slice(1)}
                </span>
              );
            }
            // Handle object format
            return (
              <span key={i} className="win31-menubar-item">
                {item.accel ? (
                  <>
                    <span className="accel">{item.accel}</span>
                    {item.label.replace(item.accel, '')}
                  </>
                ) : (
                  item.label
                )}
              </span>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>

      {/* Status Bar */}
      {statusText && (
        <div className="win31-statusbar">
          <span className="win31-statusbar-section">{statusText}</span>
        </div>
      )}
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * WIN31 BUTTON - With focus rectangle
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface Win31ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary';
  isDefault?: boolean;
}

export function Win31Button({
  children,
  variant = 'default',
  isDefault,
  className,
  ...props
}: Win31ButtonProps) {
  return (
    <button
      className={cn(
        'win31-button relative',
        variant === 'primary' && 'win31-button-primary',
        isDefault && 'win31-button-default',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * WIN31 DIALOG - Modal with icon
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface Win31DialogProps {
  title: string;
  icon?: 'info' | 'warning' | 'error' | 'question';
  children: React.ReactNode;
  buttons?: Array<{
    label: string;
    onClick: () => void;
    isDefault?: boolean;
  }>;
  onClose?: () => void;
}

const DIALOG_ICONS = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '🛑',
  question: '❓',
};

export function Win31Dialog({
  title,
  icon,
  children,
  buttons = [{ label: 'OK', onClick: () => {}, isDefault: true }],
  onClose,
}: Win31DialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="win31-dialog max-w-sm">
        {/* Title Bar */}
        <div className="win31-titlebar">
          <span className="win31-titlebar-text">{title}</span>
          {onClose && (
            <div className="win31-titlebar-controls">
              <button 
                className="win31-titlebar-btn" 
                onClick={onClose}
                aria-label="Close"
              >
                <span className="text-[8px] font-bold">×</span>
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="win31-dialog-content">
          {icon && (
            <div className="win31-dialog-icon">
              {DIALOG_ICONS[icon]}
            </div>
          )}
          <div className="win31-dialog-text">{children}</div>
        </div>

        {/* Buttons */}
        <div className="win31-dialog-buttons">
          {buttons.map((btn, i) => (
            <Win31Button
              key={i}
              onClick={btn.onClick}
              isDefault={btn.isDefault}
            >
              {btn.label}
            </Win31Button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProgramManager;

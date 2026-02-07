'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PROGRAM MANAGER - Memphis Group × Windows 3.1
 * The shell that holds everything
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface ProgramGroup {
  id: string;
  title: string;
  icons: ProgramIcon[];
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  minimized?: boolean;
}

export interface ProgramIcon {
  id: string;
  label: string;
  icon: string; // URL or emoji
  onClick?: () => void;
}

interface ProgramManagerProps {
  groups: ProgramGroup[];
  onOpenProgram?: (programId: string) => void;
  children?: React.ReactNode;
}

export function ProgramManager({ groups, onOpenProgram, children }: ProgramManagerProps) {
  const [openGroups, setOpenGroups] = React.useState<string[]>(groups.map(g => g.id));
  const [selectedIcon, setSelectedIcon] = React.useState<string | null>(null);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleIconClick = (iconId: string) => {
    setSelectedIcon(iconId);
  };

  const handleIconDoubleClick = (iconId: string) => {
    onOpenProgram?.(iconId);
  };

  return (
    <div className="win31-window flex flex-col h-full">
      {/* Title Bar */}
      <div className="win31-titlebar">
        <button className="win31-sysmenu" />
        <span className="win31-titlebar-text">Program Manager</span>
        <button className="win31-titlebar-btn win31-titlebar-btn-minimize" />
        <button className="win31-titlebar-btn win31-titlebar-btn-maximize" />
      </div>

      {/* Menu Bar */}
      <div className="win31-menubar">
        <span className="win31-menubar-item">
          <span className="win31-menubar-item-underline">F</span>ile
        </span>
        <span className="win31-menubar-item">
          <span className="win31-menubar-item-underline">O</span>ptions
        </span>
        <span className="win31-menubar-item">
          <span className="win31-menubar-item-underline">W</span>indow
        </span>
        <span className="win31-menubar-item">
          <span className="win31-menubar-item-underline">H</span>elp
        </span>
      </div>

      {/* MDI Client Area */}
      <div className="flex-1 bg-[var(--memphis-cream-dark)] p-2 overflow-auto relative">
        {/* Program Groups */}
        <div className="flex flex-wrap gap-4 p-2">
          {groups.map((group) => (
            <ProgramGroupWindow
              key={group.id}
              group={group}
              isOpen={openGroups.includes(group.id)}
              onToggle={() => toggleGroup(group.id)}
              selectedIcon={selectedIcon}
              onIconClick={handleIconClick}
              onIconDoubleClick={handleIconDoubleClick}
            />
          ))}
        </div>

        {/* Additional content (animated backgrounds, etc.) */}
        {children}
      </div>
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * PROGRAM GROUP WINDOW - The iconic collapsible groups
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface ProgramGroupWindowProps {
  group: ProgramGroup;
  isOpen: boolean;
  onToggle: () => void;
  selectedIcon: string | null;
  onIconClick: (id: string) => void;
  onIconDoubleClick: (id: string) => void;
}

function ProgramGroupWindow({
  group,
  isOpen,
  onToggle,
  selectedIcon,
  onIconClick,
  onIconDoubleClick,
}: ProgramGroupWindowProps) {
  if (!isOpen) {
    // Minimized state - just show as an icon
    return (
      <div
        className="win31-icon cursor-pointer"
        onDoubleClick={onToggle}
      >
        <div className="w-8 h-8 bg-[var(--memphis-cyan)] border border-[var(--memphis-black)] flex items-center justify-center">
          <span className="text-xs">📁</span>
        </div>
        <span className="win31-icon-label">{group.title}</span>
      </div>
    );
  }

  return (
    <div
      className="win31-program-group min-w-[200px]"
      style={{
        width: group.size?.width || 'auto',
        height: group.size?.height || 'auto',
      }}
    >
      {/* Group Title Bar */}
      <div className="win31-program-group-titlebar">
        <span>{group.title}</span>
        <button
          onClick={onToggle}
          className="w-4 h-3 bg-[var(--memphis-cream)] border border-[var(--memphis-black)] text-[8px] leading-none flex items-center justify-center"
        >
          ▼
        </button>
      </div>

      {/* Group Icons */}
      <div className="win31-program-group-content">
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
 * PROGRAM ICON - Clickable program launcher
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
  return (
    <div
      className={cn('win31-icon', isSelected && 'win31-icon-selected')}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {icon.icon.startsWith('/') || icon.icon.startsWith('http') ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={icon.icon}
          alt={icon.label}
          className="win31-icon-image"
        />
      ) : (
        <div className="w-8 h-8 flex items-center justify-center text-2xl">
          {icon.icon}
        </div>
      )}
      <span className="win31-icon-label">{icon.label}</span>
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * WIN31 WINDOW - Reusable window component
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface Win31WindowProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  className?: string;
  menuItems?: string[];
  statusText?: string;
}

export function Win31Window({
  title,
  children,
  onClose,
  onMinimize,
  onMaximize,
  className,
  menuItems = ['File', 'Edit', 'View', 'Help'],
  statusText,
}: Win31WindowProps) {
  return (
    <div className={cn('win31-window flex flex-col', className)}>
      {/* Title Bar */}
      <div className="win31-titlebar">
        <button className="win31-sysmenu" onClick={onClose} />
        <span className="win31-titlebar-text">{title}</span>
        {onMinimize && (
          <button className="win31-titlebar-btn win31-titlebar-btn-minimize" onClick={onMinimize} />
        )}
        {onMaximize && (
          <button className="win31-titlebar-btn win31-titlebar-btn-maximize" onClick={onMaximize} />
        )}
        {onClose && (
          <button className="win31-titlebar-btn win31-titlebar-btn-close" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      {/* Menu Bar */}
      {menuItems.length > 0 && (
        <div className="win31-menubar">
          {menuItems.map((item, i) => (
            <span key={i} className="win31-menubar-item">
              <span className="win31-menubar-item-underline">{item[0]}</span>
              {item.slice(1)}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>

      {/* Status Bar */}
      {statusText && (
        <div className="win31-statusbar">
          <span className="win31-statusbar-section flex-1">{statusText}</span>
        </div>
      )}
    </div>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * WIN31 BUTTON - Pixel-perfect button
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
        'win31-button',
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
 * WIN31 DIALOG - Modal dialog box
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="win31-dialog max-w-md">
        {/* Title Bar */}
        <div className="win31-titlebar">
          <span className="win31-titlebar-text">{title}</span>
          {onClose && (
            <button className="win31-titlebar-btn win31-titlebar-btn-close" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div className="win31-dialog-content">
          {icon && (
            <div className="win31-dialog-icon text-3xl">
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

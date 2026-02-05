'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * WIN31 START MENU - Mobile Touch Friendly
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface StartMenuProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export function StartMenu({ open, onClose, children }: StartMenuProps) {
  // Close on escape
  React.useEffect(() => {
    if (!open) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Menu */}
      <div
        className={cn(
          'fixed bottom-12 left-1 z-50',
          'min-w-[200px] max-w-[280px]',
          'bg-win31-gray',
          'border-2 border-win31-black',
          'shadow-[inset_1px_1px_0_var(--color-win31-white),inset_-1px_-1px_0_var(--color-win31-gray-darker),3px_3px_0_rgba(0,0,0,0.3)]',
          'animate-slide-up'
        )}
        role="menu"
      >
        {/* Header stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-b from-win31-navy to-win31-blue">
          <div className="absolute bottom-2 left-1 origin-bottom-left -rotate-90 whitespace-nowrap text-[10px] font-bold tracking-wider text-white">
            Skills 3.1
          </div>
        </div>

        {/* Menu items */}
        <div className="ml-6 py-1">{children}</div>
      </div>
    </>
  );
}

/* Menu Item */
interface StartMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: LucideIcon;
  label: string;
  shortcut?: string;
  hasSubmenu?: boolean;
}

export function StartMenuItem({
  icon: Icon,
  label,
  shortcut,
  hasSubmenu,
  className,
  ...props
}: StartMenuItemProps) {
  return (
    <button
      className={cn(
        'flex w-full items-center gap-3 px-3 py-2',
        'text-left text-sm',
        'hover:bg-win31-navy hover:text-white',
        'focus-visible:bg-win31-navy focus-visible:text-white focus-visible:outline-none',
        'min-h-[44px]', // Touch friendly
        className
      )}
      role="menuitem"
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
      <span className="flex-1">{label}</span>
      {shortcut && (
        <span className="text-xs text-win31-gray-darker">{shortcut}</span>
      )}
      {hasSubmenu && <span className="text-xs">▶</span>}
    </button>
  );
}

/* Divider */
export function StartMenuDivider() {
  return (
    <div className="mx-2 my-1 h-px bg-win31-gray-darker shadow-[0_1px_0_var(--color-win31-white)]" />
  );
}

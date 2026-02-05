'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * WIN31 TASKBAR - Mobile Pocket Edition
 * Fixed bottom bar like a smartphone OS from 1992
 * ═══════════════════════════════════════════════════════════════════════════
 */

interface TaskbarProps {
  className?: string;
  children?: React.ReactNode;
  onStartClick?: () => void;
  clock?: boolean;
}

export function Taskbar({ className, children, onStartClick, clock = true }: TaskbarProps) {
  const [time, setTime] = React.useState<string>('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-win31-gray',
        'border-t-2 border-t-win31-white',
        'shadow-[inset_0_1px_0_var(--color-win31-gray-light)]',
        'safe-bottom',
        className
      )}
    >
      <div className="flex items-center gap-1 px-1 py-1">
        {/* Start Button */}
        <Button
          variant="taskbar"
          size="taskbar"
          onClick={onStartClick}
          className="flex-none gap-1.5 font-semibold"
        >
          <div className="flex h-4 w-4 items-center justify-center bg-win31-navy">
            <Menu className="h-3 w-3 text-white" />
          </div>
          <span className="hidden xs:inline">Start</span>
        </Button>

        {/* Divider */}
        <div className="h-6 w-px bg-win31-gray-darker shadow-[1px_0_0_var(--color-win31-white)]" />

        {/* Open Windows */}
        <div className="flex flex-1 items-center gap-1 overflow-x-auto">
          {children}
        </div>

        {/* System Tray */}
        {clock && (
          <>
            <div className="h-6 w-px bg-win31-gray-darker shadow-[1px_0_0_var(--color-win31-white)]" />
            <div
              className={cn(
                'flex items-center px-2 py-1',
                'bg-win31-gray',
                'border border-t-win31-gray-darker border-l-win31-gray-darker',
                'border-b-win31-white border-r-win31-white',
                'shadow-[inset_1px_1px_0_var(--color-win31-gray-darker)]',
                'text-xs font-medium tabular-nums'
              )}
            >
              {time}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* Taskbar Window Button */
interface TaskbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  icon?: React.ReactNode;
}

export function TaskbarButton({
  children,
  active = false,
  icon,
  className,
  ...props
}: TaskbarButtonProps) {
  return (
    <Button
      variant="taskbar"
      size="taskbar"
      data-active={active}
      className={cn('justify-start gap-1.5 overflow-hidden', className)}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="truncate text-left">{children}</span>
    </Button>
  );
}

export { Taskbar as default };

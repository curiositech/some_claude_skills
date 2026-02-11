'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, Minus, Square } from 'lucide-react';

import { cn } from '@/lib/utils';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * WIN31 WINDOW - Clean, Mobile-First
 * ═══════════════════════════════════════════════════════════════════════════
 */

const windowVariants = cva(
  [
    'flex flex-col',
    'bg-win31-gray',
    'border-2 border-win31-black',
    'shadow-[inset_1px_1px_0_var(--color-win31-white),inset_-1px_-1px_0_var(--color-win31-gray-darker),2px_2px_0_rgba(0,0,0,0.25)]',
  ],
  {
    variants: {
      size: {
        auto: '',
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'w-full h-full',
      },
      mobile: {
        true: 'mx-2 rounded-none',
        false: '',
      },
    },
    defaultVariants: {
      size: 'auto',
      mobile: false,
    },
  }
);

/* Window Control Button */
function WindowControlButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'flex h-5 w-5 items-center justify-center',
        'bg-win31-gray text-win31-black',
        'border border-t-win31-white border-l-win31-white',
        'border-b-win31-gray-darker border-r-win31-gray-darker',
        'hover:bg-win31-gray-light',
        'active:border-t-win31-gray-darker active:border-l-win31-gray-darker',
        'active:border-b-win31-white active:border-r-win31-white'
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * WINDOW TITLE BAR - Standalone component for composition
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface WindowTitleBarProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  showControls?: boolean;
  active?: boolean;
}

const WindowTitleBar = React.forwardRef<HTMLDivElement, WindowTitleBarProps>(
  (
    {
      className,
      title,
      icon,
      onClose,
      onMinimize,
      onMaximize,
      showControls = true,
      active = true,
      ...props
    },
    ref
  ) => {
    const hasAnyControl = onMinimize || onMaximize || onClose;
    
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2 px-2 py-1 select-none',
          active
            ? 'bg-gradient-to-r from-win31-navy to-win31-blue'
            : 'bg-gradient-to-r from-win31-gray-darker to-win31-gray-dark',
          className
        )}
        {...props}
      >
        {/* Icon */}
        {icon && (
          <span className="flex-shrink-0 text-white">{icon}</span>
        )}

        {/* Title */}
        <span className="flex-1 truncate text-sm font-semibold text-white">
          {title}
        </span>

        {/* Window Controls */}
        {showControls && hasAnyControl && (
          <div className="flex gap-0.5">
            {onMinimize && (
              <WindowControlButton onClick={onMinimize} aria-label="Minimize">
                <Minus className="h-3 w-3" />
              </WindowControlButton>
            )}
            {onMaximize && (
              <WindowControlButton onClick={onMaximize} aria-label="Maximize">
                <Square className="h-2.5 w-2.5" />
              </WindowControlButton>
            )}
            {onClose && (
              <WindowControlButton onClick={onClose} aria-label="Close">
                <X className="h-3 w-3" />
              </WindowControlButton>
            )}
          </div>
        )}
      </div>
    );
  }
);
WindowTitleBar.displayName = 'WindowTitleBar';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * WINDOW - Composite component (supports both patterns)
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface WindowProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof windowVariants> {
  /** Title for built-in title bar (optional - use WindowTitleBar separately for composition) */
  title?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  showControls?: boolean;
  active?: boolean;
}

const Window = React.forwardRef<HTMLDivElement, WindowProps>(
  (
    {
      className,
      size,
      mobile,
      title,
      icon,
      onClose,
      onMinimize,
      onMaximize,
      showControls = true,
      active = true,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(windowVariants({ size, mobile }), className)}
        {...props}
      >
        {/* Built-in Title Bar (only if title provided) */}
        {title && (
          <WindowTitleBar
            title={title}
            icon={icon}
            onClose={onClose}
            onMinimize={onMinimize}
            onMaximize={onMaximize}
            showControls={showControls}
            active={active}
          />
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    );
  }
);
Window.displayName = 'Window';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * WINDOW CONTENT AREAS
 * ═══════════════════════════════════════════════════════════════════════════
 */

const WindowContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('p-3 sm:p-4', className)}
    {...props}
  />
));
WindowContent.displayName = 'WindowContent';

const WindowWell = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-white m-2',
      'border border-win31-gray-darker',
      'shadow-[inset_1px_1px_0_var(--color-win31-gray-darker)]',
      className
    )}
    {...props}
  />
));
WindowWell.displayName = 'WindowWell';

const WindowStatusBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center gap-2 px-2 py-1',
      'bg-win31-gray text-xs text-win31-black',
      'border-t border-t-win31-white',
      'shadow-[inset_0_1px_0_var(--color-win31-gray-darker)]',
      className
    )}
    {...props}
  />
));
WindowStatusBar.displayName = 'WindowStatusBar';

export { 
  Window, 
  WindowTitleBar, 
  WindowContent, 
  WindowWell, 
  WindowStatusBar, 
  windowVariants 
};

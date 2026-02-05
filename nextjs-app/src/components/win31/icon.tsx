'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

/*
 * ═══════════════════════════════════════════════════════════════════════════
 * WIN31 DESKTOP ICON - Touch-Friendly
 * ═══════════════════════════════════════════════════════════════════════════
 */

const iconVariants = cva(
  [
    'flex flex-col items-center justify-center gap-1',
    'p-2 rounded-sm cursor-pointer select-none',
    'transition-colors duration-75',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-win31-white',
  ],
  {
    variants: {
      size: {
        sm: 'w-16 h-16',
        default: 'w-20 h-20',
        lg: 'w-24 h-24',
        // Touch-optimized
        touch: 'w-20 h-20 min-h-[80px]',
      },
      selected: {
        true: 'bg-win31-navy',
        false: 'hover:bg-win31-navy/20 active:bg-win31-navy/40',
      },
    },
    defaultVariants: {
      size: 'default',
      selected: false,
    },
  }
);

export interface DesktopIconProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconVariants> {
  icon: LucideIcon;
  label: string;
  onDoubleClick?: () => void;
}

const DesktopIcon = React.forwardRef<HTMLButtonElement, DesktopIconProps>(
  ({ className, size, selected, icon: Icon, label, onClick, onDoubleClick, ...props }, ref) => {
    
    // Handle double-tap on mobile
    const lastTap = React.useRef<number>(0);
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        onDoubleClick?.();
      } else {
        onClick?.(e);
      }
      lastTap.current = now;
    };

    return (
      <button
        ref={ref}
        className={cn(iconVariants({ size, selected }), className)}
        onClick={handleClick}
        onDoubleClick={onDoubleClick}
        {...props}
      >
        {/* Icon */}
        <div
          className={cn(
            'flex items-center justify-center',
            'w-10 h-10 sm:w-12 sm:h-12',
            selected ? 'text-white' : 'text-win31-white'
          )}
        >
          <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        {/* Label */}
        <span
          className={cn(
            'text-[10px] sm:text-xs text-center leading-tight',
            'max-w-full px-1',
            selected
              ? 'text-white'
              : 'text-white [text-shadow:1px_1px_0_black,-1px_-1px_0_black,1px_-1px_0_black,-1px_1px_0_black]'
          )}
        >
          {label}
        </span>
      </button>
    );
  }
);
DesktopIcon.displayName = 'DesktopIcon';

export { DesktopIcon, iconVariants };

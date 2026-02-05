'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'font-medium transition-all duration-75',
    'select-none active:scale-[0.98]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-win31-navy focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        // Clean Win31 button - touch friendly
        default: [
          'bg-win31-gray text-win31-black',
          'border-2 border-win31-black',
          'shadow-[inset_1px_1px_0_var(--color-win31-white),inset_-1px_-1px_0_var(--color-win31-gray-darker)]',
          'hover:bg-win31-gray-light',
          'active:shadow-[inset_-1px_-1px_0_var(--color-win31-white),inset_1px_1px_0_var(--color-win31-gray-darker)]',
        ],
        // Primary action
        primary: [
          'bg-win31-navy text-win31-white',
          'border-2 border-win31-black',
          'shadow-[inset_1px_1px_0_var(--color-win31-blue),inset_-1px_-1px_0_#000040]',
          'hover:bg-win31-blue',
          'active:shadow-[inset_-1px_-1px_0_var(--color-win31-blue),inset_1px_1px_0_#000040]',
        ],
        // Minimal - for toolbars
        ghost: [
          'bg-transparent text-win31-black',
          'hover:bg-win31-gray-light',
          'active:bg-win31-gray',
        ],
        // Icon button in title bar
        titlebar: [
          'bg-win31-gray text-win31-black',
          'border border-t-win31-white border-l-win31-white border-b-win31-gray-darker border-r-win31-gray-darker',
          'hover:bg-win31-gray-light',
          'active:border-t-win31-gray-darker active:border-l-win31-gray-darker active:border-b-win31-white active:border-r-win31-white',
        ],
        // Taskbar button
        taskbar: [
          'bg-win31-gray text-win31-black',
          'border-2 border-t-win31-white border-l-win31-white border-b-win31-gray-darker border-r-win31-gray-darker',
          'shadow-[inset_-1px_-1px_0_var(--color-win31-gray-darker)]',
          'hover:bg-win31-gray-light',
          'data-[active=true]:border-t-win31-gray-darker data-[active=true]:border-l-win31-gray-darker',
          'data-[active=true]:border-b-win31-white data-[active=true]:border-r-win31-white',
          'data-[active=true]:shadow-[inset_1px_1px_0_var(--color-win31-gray-darker)]',
        ],
      },
      size: {
        default: 'h-11 px-4 py-2 text-sm min-w-[88px]',
        sm: 'h-9 px-3 text-xs min-w-[72px]',
        lg: 'h-12 px-6 text-base min-w-[100px]',
        icon: 'h-11 w-11',
        'icon-sm': 'h-8 w-8',
        'icon-xs': 'h-6 w-6 text-xs',
        // Touch-optimized
        touch: 'h-12 px-5 text-sm min-w-[100px]',
        // Taskbar
        taskbar: 'h-10 px-3 text-xs flex-1 max-w-[140px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

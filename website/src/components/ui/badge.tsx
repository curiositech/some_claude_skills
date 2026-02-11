/**
 * BADGE COMPONENT
 * ===============
 * 
 * A small label/tag component with CVA variants.
 * 
 * @example
 * ```tsx
 * <Badge>Default</Badge>
 * <Badge variant="secondary">Secondary</Badge>
 * <Badge variant="win31">Retro Badge</Badge>
 * ```
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@site/src/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-500 text-white hover:bg-green-600',
        warning: 'border-transparent bg-yellow-500 text-black hover:bg-yellow-600',
        // Windows 3.1 variants
        win31: [
          'border-2 border-win31-black bg-win31-gray text-win31-black font-system',
          'shadow-[inset_1px_1px_0_var(--win31-white),inset_-1px_-1px_0_var(--win31-dark-gray)]',
        ],
        'win31-success': [
          'border-2 border-win31-black bg-win31-lime text-win31-black font-system',
        ],
        'win31-warning': [
          'border-2 border-win31-black bg-win31-yellow text-win31-black font-system',
        ],
        'win31-danger': [
          'border-2 border-win31-black bg-win31-red text-win31-white font-system',
        ],
        'win31-info': [
          'border-2 border-win31-black bg-win31-teal text-win31-white font-system',
        ],
      },
      size: {
        default: 'rounded-full px-2.5 py-0.5 text-xs',
        sm: 'rounded-full px-2 py-0.5 text-xs',
        lg: 'rounded-full px-3 py-1 text-sm',
        // Win31 sizes (no rounded corners)
        'win31-sm': 'rounded-none px-1.5 py-0.5 text-xs',
        'win31-default': 'rounded-none px-2 py-0.5 text-xs',
        'win31-lg': 'rounded-none px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
    compoundVariants: [
      // Auto-apply win31 size to win31 variants
      {
        variant: ['win31', 'win31-success', 'win31-warning', 'win31-danger', 'win31-info'],
        size: 'default',
        class: 'rounded-none',
      },
    ],
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

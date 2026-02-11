/**
 * SEPARATOR COMPONENT
 * ===================
 * 
 * A visual divider built on Radix UI Separator.
 * 
 * @example
 * ```tsx
 * <Separator />
 * <Separator orientation="vertical" />
 * <Separator variant="win31" />
 * ```
 */

import * as React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@site/src/lib/utils';

const separatorVariants = cva('shrink-0', {
  variants: {
    variant: {
      default: 'bg-border',
      muted: 'bg-muted',
      // Windows 3.1 3D separator
      win31: 'bg-win31-dark-gray shadow-[0_1px_0_var(--win31-white)]',
    },
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'h-full w-px',
    },
  },
  defaultVariants: {
    variant: 'default',
    orientation: 'horizontal',
  },
  compoundVariants: [
    {
      variant: 'win31',
      orientation: 'horizontal',
      class: 'h-0.5',
    },
    {
      variant: 'win31',
      orientation: 'vertical',
      class: 'w-0.5 shadow-[1px_0_0_var(--win31-white)]',
    },
  ],
});

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
    VariantProps<typeof separatorVariants> {}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(({ className, variant, orientation = 'horizontal', decorative = true, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(separatorVariants({ variant, orientation }), className)}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator, separatorVariants };

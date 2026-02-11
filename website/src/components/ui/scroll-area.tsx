/**
 * SCROLL AREA COMPONENT
 * =====================
 * 
 * A scrollable container built on Radix UI ScrollArea.
 * Provides custom scrollbars with consistent styling.
 * 
 * @example
 * ```tsx
 * <ScrollArea className="h-72">
 *   <LongContent />
 * </ScrollArea>
 * 
 * <ScrollArea variant="win31" className="h-48">
 *   <FileList />
 * </ScrollArea>
 * ```
 */

import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@site/src/lib/utils';

const scrollAreaVariants = cva('relative overflow-hidden', {
  variants: {
    variant: {
      default: '',
      // Windows 3.1 style
      win31: [
        'border-2',
        'border-t-win31-dark-gray border-l-win31-dark-gray',
        'border-b-win31-white border-r-win31-white',
        'bg-win31-white',
      ],
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const scrollBarVariants = cva('flex touch-none select-none transition-colors', {
  variants: {
    variant: {
      default: '',
      win31: 'bg-win31-gray',
    },
    orientation: {
      vertical: 'h-full w-2.5 border-l border-l-transparent p-px',
      horizontal: 'h-2.5 flex-col border-t border-t-transparent p-px',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
  compoundVariants: [
    {
      variant: 'win31',
      orientation: 'vertical',
      class: 'w-4 border-l-0 p-0',
    },
    {
      variant: 'win31',
      orientation: 'horizontal',
      class: 'h-4 border-t-0 p-0',
    },
  ],
});

const scrollThumbVariants = cva('relative flex-1 rounded-full', {
  variants: {
    variant: {
      default: 'bg-border',
      win31: [
        'rounded-none bg-win31-gray',
        'border border-t-win31-white border-l-win31-white border-b-win31-dark-gray border-r-win31-dark-gray',
      ],
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface ScrollAreaProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>,
    VariantProps<typeof scrollAreaVariants> {}

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, variant, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn(scrollAreaVariants({ variant }), className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar variant={variant} />
    <ScrollBar variant={variant} orientation="horizontal" />
    <ScrollAreaPrimitive.Corner className={variant === 'win31' ? 'bg-win31-gray' : ''} />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

interface ScrollBarProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
    VariantProps<typeof scrollBarVariants> {}

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ScrollBarProps
>(({ className, variant, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(scrollBarVariants({ variant, orientation }), className)}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb
      className={cn(scrollThumbVariants({ variant }))}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar, scrollAreaVariants };

/**
 * STACK LAYOUT PRIMITIVE
 * ======================
 * 
 * A vertical or horizontal layout primitive using flexbox.
 * Replaces the pattern: <div className="flex flex-col gap-4">
 * 
 * @example
 * ```tsx
 * <Stack gap="4">
 *   <p>Item 1</p>
 *   <p>Item 2</p>
 * </Stack>
 * 
 * <Stack direction="horizontal" gap="2" align="center">
 *   <Icon />
 *   <span>Label</span>
 * </Stack>
 * ```
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@site/src/lib/utils';

const stackVariants = cva('flex', {
  variants: {
    direction: {
      vertical: 'flex-col',
      horizontal: 'flex-row',
    },
    gap: {
      '0': 'gap-0',
      '0.5': 'gap-0.5',
      '1': 'gap-1',
      '1.5': 'gap-1.5',
      '2': 'gap-2',
      '2.5': 'gap-2.5',
      '3': 'gap-3',
      '3.5': 'gap-3.5',
      '4': 'gap-4',
      '5': 'gap-5',
      '6': 'gap-6',
      '7': 'gap-7',
      '8': 'gap-8',
      '9': 'gap-9',
      '10': 'gap-10',
      '11': 'gap-11',
      '12': 'gap-12',
      '14': 'gap-14',
      '16': 'gap-16',
      '20': 'gap-20',
      '24': 'gap-24',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    wrap: {
      true: 'flex-wrap',
      false: 'flex-nowrap',
      reverse: 'flex-wrap-reverse',
    },
  },
  defaultVariants: {
    direction: 'vertical',
    gap: '4',
    align: 'stretch',
    justify: 'start',
    wrap: false,
  },
});

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {
  /**
   * If true, the component will render its children directly
   * using Radix Slot, allowing props to be passed through.
   */
  asChild?: boolean;
}

/**
 * Stack - A flexbox layout primitive for vertical/horizontal stacking.
 * 
 * Features:
 * - Direction: vertical (default) or horizontal
 * - Gap: Uses Tailwind spacing scale (no arbitrary values)
 * - Alignment: Controls cross-axis alignment
 * - Justify: Controls main-axis alignment
 * - Wrap: Controls flex-wrap behavior
 * - asChild: Renders children directly with Radix Slot
 */
const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    { className, direction, gap, align, justify, wrap, asChild = false, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : 'div';
    
    return (
      <Comp
        className={cn(
          stackVariants({ direction, gap, align, justify, wrap }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Stack.displayName = 'Stack';

// Export variants for direct use in className
export { Stack, stackVariants };

/**
 * FLEX LAYOUT PRIMITIVE
 * =====================
 * 
 * A flexbox container with comprehensive layout control.
 * More granular than Stack, for complex flex layouts.
 * 
 * @example
 * ```tsx
 * <Flex justify="between" align="center" gap="4">
 *   <Logo />
 *   <Navigation />
 *   <Actions />
 * </Flex>
 * ```
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@site/src/lib/utils';

const flexVariants = cva('flex', {
  variants: {
    direction: {
      row: 'flex-row',
      'row-reverse': 'flex-row-reverse',
      col: 'flex-col',
      'col-reverse': 'flex-col-reverse',
    },
    wrap: {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
    },
    justify: {
      start: 'justify-start',
      end: 'justify-end',
      center: 'justify-center',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    align: {
      start: 'items-start',
      end: 'items-end',
      center: 'items-center',
      baseline: 'items-baseline',
      stretch: 'items-stretch',
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
    gapX: {
      '0': 'gap-x-0',
      '1': 'gap-x-1',
      '2': 'gap-x-2',
      '3': 'gap-x-3',
      '4': 'gap-x-4',
      '5': 'gap-x-5',
      '6': 'gap-x-6',
      '8': 'gap-x-8',
      '10': 'gap-x-10',
      '12': 'gap-x-12',
    },
    gapY: {
      '0': 'gap-y-0',
      '1': 'gap-y-1',
      '2': 'gap-y-2',
      '3': 'gap-y-3',
      '4': 'gap-y-4',
      '5': 'gap-y-5',
      '6': 'gap-y-6',
      '8': 'gap-y-8',
      '10': 'gap-y-10',
      '12': 'gap-y-12',
    },
    inline: {
      true: 'inline-flex',
      false: 'flex',
    },
  },
  defaultVariants: {
    direction: 'row',
    wrap: 'nowrap',
    justify: 'start',
    align: 'stretch',
    inline: false,
  },
});

export interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexVariants> {
  asChild?: boolean;
}

/**
 * Flex - A comprehensive flexbox layout primitive.
 * 
 * Features:
 * - All flex direction options
 * - Wrap control
 * - Gap with x/y variants
 * - Justify and align
 * - Inline flex support
 */
const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  (
    {
      className,
      direction,
      wrap,
      justify,
      align,
      gap,
      gapX,
      gapY,
      inline,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        className={cn(
          flexVariants({ direction, wrap, justify, align, gap, gapX, gapY, inline }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Flex.displayName = 'Flex';

export { Flex, flexVariants };

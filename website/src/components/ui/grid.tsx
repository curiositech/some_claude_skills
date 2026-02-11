/**
 * GRID LAYOUT PRIMITIVE
 * =====================
 * 
 * A CSS Grid container with standardized column and gap variants.
 * 
 * @example
 * ```tsx
 * <Grid cols="3" gap="4">
 *   <Card />
 *   <Card />
 *   <Card />
 * </Grid>
 * 
 * <Grid cols={{ base: '1', md: '2', lg: '3' }} gap="6">
 *   {items.map(item => <Item key={item.id} />)}
 * </Grid>
 * ```
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@site/src/lib/utils';

const gridVariants = cva('grid', {
  variants: {
    cols: {
      '1': 'grid-cols-1',
      '2': 'grid-cols-2',
      '3': 'grid-cols-3',
      '4': 'grid-cols-4',
      '5': 'grid-cols-5',
      '6': 'grid-cols-6',
      '7': 'grid-cols-7',
      '8': 'grid-cols-8',
      '9': 'grid-cols-9',
      '10': 'grid-cols-10',
      '11': 'grid-cols-11',
      '12': 'grid-cols-12',
      none: 'grid-cols-none',
      subgrid: 'grid-cols-subgrid',
    },
    rows: {
      '1': 'grid-rows-1',
      '2': 'grid-rows-2',
      '3': 'grid-rows-3',
      '4': 'grid-rows-4',
      '5': 'grid-rows-5',
      '6': 'grid-rows-6',
      none: 'grid-rows-none',
      subgrid: 'grid-rows-subgrid',
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
    flow: {
      row: 'grid-flow-row',
      col: 'grid-flow-col',
      dense: 'grid-flow-dense',
      'row-dense': 'grid-flow-row-dense',
      'col-dense': 'grid-flow-col-dense',
    },
    placeItems: {
      start: 'place-items-start',
      end: 'place-items-end',
      center: 'place-items-center',
      stretch: 'place-items-stretch',
      baseline: 'place-items-baseline',
    },
    placeContent: {
      start: 'place-content-start',
      end: 'place-content-end',
      center: 'place-content-center',
      stretch: 'place-content-stretch',
      between: 'place-content-between',
      around: 'place-content-around',
      evenly: 'place-content-evenly',
      baseline: 'place-content-baseline',
    },
  },
  defaultVariants: {
    cols: '1',
    gap: '4',
    flow: 'row',
  },
});

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  asChild?: boolean;
}

/**
 * Grid - A CSS Grid layout primitive.
 * 
 * Features:
 * - Column count (1-12)
 * - Row count
 * - Gap with x/y variants
 * - Grid flow control
 * - Place items/content alignment
 */
const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      className,
      cols,
      rows,
      gap,
      gapX,
      gapY,
      flow,
      placeItems,
      placeContent,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'div';

    return (
      <Comp
        className={cn(
          gridVariants({ cols, rows, gap, gapX, gapY, flow, placeItems, placeContent }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Grid.displayName = 'Grid';

export { Grid, gridVariants };

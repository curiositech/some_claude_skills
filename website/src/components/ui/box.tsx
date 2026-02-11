/**
 * BOX LAYOUT PRIMITIVE
 * ====================
 * 
 * A semantic container with standardized padding, margin, and display variants.
 * Replaces arbitrary div usage with a predictable, typed component.
 * 
 * @example
 * ```tsx
 * <Box p="4" m="2" display="block">
 *   Content with padding and margin
 * </Box>
 * 
 * <Box as="section" p="6" bg="muted">
 *   Section content
 * </Box>
 * ```
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@site/src/lib/utils';

const boxVariants = cva('', {
  variants: {
    display: {
      block: 'block',
      inline: 'inline',
      'inline-block': 'inline-block',
      flex: 'flex',
      'inline-flex': 'inline-flex',
      grid: 'grid',
      hidden: 'hidden',
    },
    p: {
      '0': 'p-0',
      '0.5': 'p-0.5',
      '1': 'p-1',
      '1.5': 'p-1.5',
      '2': 'p-2',
      '2.5': 'p-2.5',
      '3': 'p-3',
      '3.5': 'p-3.5',
      '4': 'p-4',
      '5': 'p-5',
      '6': 'p-6',
      '7': 'p-7',
      '8': 'p-8',
      '9': 'p-9',
      '10': 'p-10',
      '11': 'p-11',
      '12': 'p-12',
      '14': 'p-14',
      '16': 'p-16',
      '20': 'p-20',
      '24': 'p-24',
    },
    px: {
      '0': 'px-0',
      '1': 'px-1',
      '2': 'px-2',
      '3': 'px-3',
      '4': 'px-4',
      '5': 'px-5',
      '6': 'px-6',
      '8': 'px-8',
      '10': 'px-10',
      '12': 'px-12',
      '16': 'px-16',
    },
    py: {
      '0': 'py-0',
      '1': 'py-1',
      '2': 'py-2',
      '3': 'py-3',
      '4': 'py-4',
      '5': 'py-5',
      '6': 'py-6',
      '8': 'py-8',
      '10': 'py-10',
      '12': 'py-12',
      '16': 'py-16',
    },
    m: {
      '0': 'm-0',
      '1': 'm-1',
      '2': 'm-2',
      '3': 'm-3',
      '4': 'm-4',
      '5': 'm-5',
      '6': 'm-6',
      '8': 'm-8',
      '10': 'm-10',
      '12': 'm-12',
      '16': 'm-16',
      auto: 'm-auto',
    },
    mx: {
      '0': 'mx-0',
      '1': 'mx-1',
      '2': 'mx-2',
      '3': 'mx-3',
      '4': 'mx-4',
      '5': 'mx-5',
      '6': 'mx-6',
      '8': 'mx-8',
      auto: 'mx-auto',
    },
    my: {
      '0': 'my-0',
      '1': 'my-1',
      '2': 'my-2',
      '3': 'my-3',
      '4': 'my-4',
      '5': 'my-5',
      '6': 'my-6',
      '8': 'my-8',
      auto: 'my-auto',
    },
    rounded: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      DEFAULT: 'rounded',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl',
      '3xl': 'rounded-3xl',
      full: 'rounded-full',
      win31: 'rounded-none', // Windows 3.1 aesthetic
    },
    shadow: {
      none: 'shadow-none',
      sm: 'shadow-sm',
      DEFAULT: 'shadow',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      '2xl': 'shadow-2xl',
      inner: 'shadow-inner',
    },
    bg: {
      transparent: 'bg-transparent',
      background: 'bg-background',
      foreground: 'bg-foreground',
      muted: 'bg-muted',
      card: 'bg-card',
      popover: 'bg-popover',
      primary: 'bg-primary',
      secondary: 'bg-secondary',
      accent: 'bg-accent',
      destructive: 'bg-destructive',
      'win31-gray': 'bg-win31-gray',
      'win31-light-gray': 'bg-win31-light-gray',
      'win31-dark-gray': 'bg-win31-dark-gray',
      'win31-navy': 'bg-win31-navy',
      'win31-teal': 'bg-win31-teal',
    },
    border: {
      none: 'border-0',
      DEFAULT: 'border',
      '2': 'border-2',
      '4': 'border-4',
    },
    overflow: {
      auto: 'overflow-auto',
      hidden: 'overflow-hidden',
      visible: 'overflow-visible',
      scroll: 'overflow-scroll',
      'x-auto': 'overflow-x-auto',
      'y-auto': 'overflow-y-auto',
      'x-hidden': 'overflow-x-hidden',
      'y-hidden': 'overflow-y-hidden',
    },
    position: {
      static: 'static',
      fixed: 'fixed',
      absolute: 'absolute',
      relative: 'relative',
      sticky: 'sticky',
    },
    w: {
      auto: 'w-auto',
      full: 'w-full',
      screen: 'w-screen',
      min: 'w-min',
      max: 'w-max',
      fit: 'w-fit',
    },
    h: {
      auto: 'h-auto',
      full: 'h-full',
      screen: 'h-screen',
      min: 'h-min',
      max: 'h-max',
      fit: 'h-fit',
    },
  },
  defaultVariants: {
    display: 'block',
  },
});

type BoxElement = 'div' | 'section' | 'article' | 'main' | 'aside' | 'header' | 'footer' | 'nav';

export interface BoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof boxVariants> {
  /**
   * The HTML element to render.
   * @default 'div'
   */
  as?: BoxElement;
  /**
   * If true, the component will render its children directly
   * using Radix Slot.
   */
  asChild?: boolean;
}

/**
 * Box - A polymorphic container primitive with standardized spacing.
 * 
 * Features:
 * - Semantic HTML via `as` prop
 * - Standard padding/margin scale (no arbitrary values)
 * - Background, border, shadow variants
 * - Position and overflow control
 * - asChild support for composition
 */
const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  (
    {
      className,
      as: Tag = 'div',
      asChild = false,
      display,
      p,
      px,
      py,
      m,
      mx,
      my,
      rounded,
      shadow,
      bg,
      border,
      overflow,
      position,
      w,
      h,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : Tag;

    return (
      <Comp
        className={cn(
          boxVariants({
            display,
            p,
            px,
            py,
            m,
            mx,
            my,
            rounded,
            shadow,
            bg,
            border,
            overflow,
            position,
            w,
            h,
          }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Box.displayName = 'Box';

export { Box, boxVariants };

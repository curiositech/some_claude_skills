/**
 * CONTAINER LAYOUT PRIMITIVE
 * ==========================
 * 
 * A responsive max-width container with standardized padding.
 * 
 * @example
 * ```tsx
 * <Container size="xl">
 *   <h1>Page Title</h1>
 *   <Content />
 * </Container>
 * 
 * <Container size="prose" as="article">
 *   <p>Long-form content...</p>
 * </Container>
 * ```
 */

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@site/src/lib/utils';

const containerVariants = cva('mx-auto w-full', {
  variants: {
    size: {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl',
      '2xl': 'max-w-screen-2xl',
      full: 'max-w-full',
      prose: 'max-w-prose',
    },
    padding: {
      none: 'px-0',
      sm: 'px-4',
      DEFAULT: 'px-4 sm:px-6 lg:px-8',
      lg: 'px-6 sm:px-8 lg:px-12',
    },
    center: {
      true: 'mx-auto',
      false: 'ml-0',
    },
  },
  defaultVariants: {
    size: 'xl',
    padding: 'DEFAULT',
    center: true,
  },
});

type ContainerElement = 'div' | 'section' | 'article' | 'main';

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  /**
   * The HTML element to render.
   * @default 'div'
   */
  as?: ContainerElement;
  asChild?: boolean;
}

/**
 * Container - A responsive max-width container.
 * 
 * Features:
 * - Standard max-width breakpoints
 * - Responsive padding
 * - Semantic HTML via `as` prop
 * - Prose mode for long-form content
 */
const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, as: Tag = 'div', asChild = false, size, padding, center, ...props }, ref) => {
    const Comp = asChild ? Slot : Tag;

    return (
      <Comp
        className={cn(containerVariants({ size, padding, center }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Container.displayName = 'Container';

export { Container, containerVariants };

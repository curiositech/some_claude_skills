/**
 * CARD COMPONENT
 * ==============
 * 
 * A composable card component following the shadcn/ui pattern.
 * Composition over configuration - use slots instead of many props.
 * 
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Main content here</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * 
 * // Win31 variant
 * <Card variant="win31">
 *   <CardHeader variant="win31">
 *     <CardTitle>README.TXT</CardTitle>
 *   </CardHeader>
 *   <CardContent>Content</CardContent>
 * </Card>
 * ```
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@site/src/lib/utils';

/* ─────────────────────────────────────────────────────────────────────────────
   CARD ROOT
   ───────────────────────────────────────────────────────────────────────────── */

const cardVariants = cva('', {
  variants: {
    variant: {
      default: 'rounded-lg border bg-card text-card-foreground shadow-sm',
      outline: 'rounded-lg border-2 border-border bg-transparent',
      elevated: 'rounded-lg bg-card text-card-foreground shadow-lg',
      ghost: 'bg-transparent',
      // Windows 3.1 variant
      win31: [
        'rounded-none bg-win31-gray text-win31-black',
        'border-3 border-win31-black',
        'shadow-[inset_2px_2px_0_var(--win31-white),inset_-2px_-2px_0_var(--win31-dark-gray),6px_6px_0_rgba(0,0,0,0.4)]',
      ],
      'win31-inset': [
        'rounded-none bg-win31-light-gray text-win31-black',
        'border-2',
        'border-t-win31-dark-gray border-l-win31-dark-gray',
        'border-b-win31-white border-r-win31-white',
      ],
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

/* ─────────────────────────────────────────────────────────────────────────────
   CARD HEADER
   ───────────────────────────────────────────────────────────────────────────── */

const cardHeaderVariants = cva('flex flex-col space-y-1.5', {
  variants: {
    variant: {
      default: 'p-6',
      compact: 'p-4',
      // Windows 3.1 title bar
      win31: [
        'flex-row items-center space-y-0 gap-2 p-1 px-2',
        'bg-gradient-to-r from-win31-navy to-win31-blue',
        'text-win31-white',
      ],
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardHeaderVariants({ variant }), className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

/* ─────────────────────────────────────────────────────────────────────────────
   CARD TITLE
   ───────────────────────────────────────────────────────────────────────────── */

const cardTitleVariants = cva('', {
  variants: {
    variant: {
      default: 'text-2xl font-semibold leading-none tracking-tight',
      h1: 'text-3xl font-bold leading-none tracking-tight',
      h3: 'text-lg font-semibold leading-none tracking-tight',
      // Windows 3.1 title bar text
      win31: 'font-window text-sm font-normal tracking-wide uppercase text-win31-white',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof cardTitleVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, variant, as: Tag = 'h3', ...props }, ref) => (
    <Tag
      ref={ref}
      className={cn(cardTitleVariants({ variant }), className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

/* ─────────────────────────────────────────────────────────────────────────────
   CARD DESCRIPTION
   ───────────────────────────────────────────────────────────────────────────── */

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

/* ─────────────────────────────────────────────────────────────────────────────
   CARD CONTENT
   ───────────────────────────────────────────────────────────────────────────── */

const cardContentVariants = cva('', {
  variants: {
    variant: {
      default: 'p-6 pt-0',
      compact: 'p-4 pt-0',
      full: 'p-6',
      none: 'p-0',
      // Windows 3.1 content area
      win31: 'p-4 font-body text-sm leading-relaxed',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardContentVariants({ variant }), className)}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

/* ─────────────────────────────────────────────────────────────────────────────
   CARD FOOTER
   ───────────────────────────────────────────────────────────────────────────── */

const cardFooterVariants = cva('flex items-center', {
  variants: {
    variant: {
      default: 'p-6 pt-0',
      compact: 'p-4 pt-0',
      // Windows 3.1 button bar
      win31: 'p-2 gap-2 justify-end bg-win31-gray',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterVariants> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardFooterVariants({ variant }), className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

/* ─────────────────────────────────────────────────────────────────────────────
   EXPORTS
   ───────────────────────────────────────────────────────────────────────────── */

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
  cardHeaderVariants,
  cardTitleVariants,
  cardContentVariants,
  cardFooterVariants,
};

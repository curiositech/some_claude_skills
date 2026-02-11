import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const cardVariants = cva('', {
  variants: {
    variant: {
      default: 'rounded-lg border bg-card text-card-foreground shadow-sm',
      elevated: 'rounded-lg bg-card text-card-foreground shadow-lg',
      ghost: 'bg-transparent',
      win31: [
        'rounded-none bg-win31-gray text-win31-black',
        'border-[3px] border-win31-black',
        'shadow-[inset_2px_2px_0_var(--color-win31-white),inset_-2px_-2px_0_var(--color-win31-dark-gray),6px_6px_0_rgba(0,0,0,0.4)]',
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
    <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props} />
  )
);
Card.displayName = 'Card';

const cardHeaderVariants = cva('flex flex-col space-y-1.5', {
  variants: {
    variant: {
      default: 'p-6',
      win31: [
        'flex-row items-center space-y-0 gap-2 p-1 px-2',
        'bg-gradient-to-r from-win31-navy to-win31-blue',
        'text-win31-white',
      ],
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardHeaderVariants({ variant }), className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const cardTitleVariants = cva('', {
  variants: {
    variant: {
      default: 'text-2xl font-semibold leading-none tracking-tight',
      win31: 'font-window text-sm font-normal tracking-wide uppercase',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface CardTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof cardTitleVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, variant, as: Tag = 'h3', ...props }, ref) => (
    <Tag ref={ref} className={cn(cardTitleVariants({ variant }), className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const cardContentVariants = cva('', {
  variants: {
    variant: {
      default: 'p-6 pt-0',
      full: 'p-6',
      win31: 'p-4 font-body text-sm leading-relaxed',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardContentVariants({ variant }), className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const cardFooterVariants = cva('flex items-center', {
  variants: {
    variant: {
      default: 'p-6 pt-0',
      win31: 'p-2 gap-2 justify-end bg-win31-gray',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterVariants> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(cardFooterVariants({ variant }), className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
};

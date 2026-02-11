'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const dialogOverlayVariants = cva(
  'fixed inset-0 z-50 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
  {
    variants: {
      variant: {
        default: 'bg-black/80',
        blur: 'bg-black/50 backdrop-blur-sm',
        win31: 'bg-win31-teal/90',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> &
    VariantProps<typeof dialogOverlayVariants>
>(({ className, variant, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(dialogOverlayVariants({ variant }), className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const dialogContentVariants = cva(
  'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
  {
    variants: {
      variant: {
        default: 'max-w-lg gap-4 border bg-background p-6 shadow-lg rounded-lg',
        win31: [
          'max-w-lg p-0 gap-0',
          'bg-win31-gray rounded-none',
          'border-[3px] border-win31-black',
          'shadow-[inset_2px_2px_0_var(--color-win31-white),inset_-2px_-2px_0_var(--color-win31-dark-gray),8px_8px_0_rgba(0,0,0,0.5)]',
        ],
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  showClose?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, variant, showClose = true, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay variant={variant === 'win31' ? 'win31' : 'default'} />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(dialogContentVariants({ variant }), className)}
      {...props}
    >
      {children}
      {showClose && variant !== 'win31' && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const dialogHeaderVariants = cva('flex flex-col space-y-1.5', {
  variants: {
    variant: {
      default: 'text-center sm:text-left',
      win31: [
        'flex-row items-center justify-between space-y-0 p-1 px-2',
        'bg-gradient-to-r from-win31-navy to-win31-blue',
        'text-win31-white',
      ],
    },
  },
  defaultVariants: { variant: 'default' },
});

interface DialogHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogHeaderVariants> {}

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, variant, children, ...props }, ref) => (
    <div ref={ref} className={cn(dialogHeaderVariants({ variant }), className)} {...props}>
      {variant === 'win31' ? (
        <>
          <div className="flex items-center gap-2">{children}</div>
          <DialogPrimitive.Close className="flex h-4 w-4 items-center justify-center border border-b-win31-black border-r-win31-black border-l-win31-white border-t-win31-white bg-win31-gray text-xs font-bold text-win31-black hover:bg-win31-light-gray active:border-b-win31-white active:border-r-win31-white active:border-l-win31-black active:border-t-win31-black">
            ×
          </DialogPrimitive.Close>
        </>
      ) : (
        children
      )}
    </div>
  )
);
DialogHeader.displayName = 'DialogHeader';

const dialogTitleVariants = cva('', {
  variants: {
    variant: {
      default: 'text-lg font-semibold leading-none tracking-tight',
      win31: 'font-window text-sm font-normal tracking-wide',
    },
  },
  defaultVariants: { variant: 'default' },
});

interface DialogTitleProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>,
    VariantProps<typeof dialogTitleVariants> {
  icon?: string;
}

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  DialogTitleProps
>(({ className, variant, icon, children, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(dialogTitleVariants({ variant }), className)}
    {...props}
  >
    {icon && <span className="mr-2">{icon}</span>}
    {children}
  </DialogPrimitive.Title>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const dialogFooterVariants = cva('flex', {
  variants: {
    variant: {
      default: 'flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      win31: 'flex-row justify-end gap-2 p-2 bg-win31-gray',
    },
  },
  defaultVariants: { variant: 'default' },
});

interface DialogFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogFooterVariants> {}

const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(dialogFooterVariants({ variant }), className)} {...props} />
  )
);
DialogFooter.displayName = 'DialogFooter';

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

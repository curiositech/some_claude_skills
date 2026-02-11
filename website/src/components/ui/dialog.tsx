/**
 * DIALOG COMPONENT
 * ================
 * 
 * A modal dialog built on Radix UI Dialog primitive.
 * Replaces custom modal implementations with accessible, keyboard-navigable dialog.
 * 
 * This DELETES custom logic for:
 * - Click-outside handling (Radix handles this)
 * - Escape key handling (Radix handles this)
 * - Focus trapping (Radix handles this)
 * - Body scroll lock (Radix handles this)
 * - Portal rendering (Radix handles this)
 * 
 * @example
 * ```tsx
 * <Dialog>
 *   <DialogTrigger asChild>
 *     <Button>Open Dialog</Button>
 *   </DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Dialog Title</DialogTitle>
 *       <DialogDescription>Description text</DialogDescription>
 *     </DialogHeader>
 *     <div>Main content</div>
 *     <DialogFooter>
 *       <Button>Confirm</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * 
 * // Win31 variant
 * <Dialog>
 *   <DialogTrigger asChild>
 *     <Button variant="win31">Open Window</Button>
 *   </DialogTrigger>
 *   <DialogContent variant="win31">
 *     <DialogHeader variant="win31">
 *       <DialogTitle variant="win31">README.TXT</DialogTitle>
 *     </DialogHeader>
 *     <div>Content</div>
 *   </DialogContent>
 * </Dialog>
 * ```
 */

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@site/src/lib/utils';

/* ─────────────────────────────────────────────────────────────────────────────
   DIALOG PRIMITIVES (re-export Radix primitives)
   ───────────────────────────────────────────────────────────────────────────── */

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

/* ─────────────────────────────────────────────────────────────────────────────
   DIALOG OVERLAY
   ───────────────────────────────────────────────────────────────────────────── */

const dialogOverlayVariants = cva(
  'fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  {
    variants: {
      variant: {
        default: 'bg-black/80',
        blur: 'bg-black/50 backdrop-blur-sm',
        // Windows 3.1 - teal desktop pattern
        win31: 'bg-win31-desktop/90',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface DialogOverlayProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>,
    VariantProps<typeof dialogOverlayVariants> {}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  DialogOverlayProps
>(({ className, variant, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(dialogOverlayVariants({ variant }), className)}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

/* ─────────────────────────────────────────────────────────────────────────────
   DIALOG CONTENT
   ───────────────────────────────────────────────────────────────────────────── */

const dialogContentVariants = cva(
  'fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
  {
    variants: {
      variant: {
        default: [
          'max-w-lg gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',
        ],
        large: [
          'max-w-2xl gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',
        ],
        fullscreen: [
          'max-w-none h-full gap-4 border-0 bg-background p-6',
        ],
        // Windows 3.1 window
        win31: [
          'max-w-lg p-0 gap-0',
          'bg-win31-gray rounded-none',
          'border-3 border-win31-black',
          'shadow-[inset_2px_2px_0_var(--win31-white),inset_-2px_-2px_0_var(--win31-dark-gray),8px_8px_0_rgba(0,0,0,0.5)]',
        ],
      },
      size: {
        sm: 'max-w-sm',
        DEFAULT: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'DEFAULT',
    },
  }
);

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  /** Show/hide the close button */
  showClose?: boolean;
  /** Variant for the overlay */
  overlayVariant?: DialogOverlayProps['variant'];
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, variant, size, showClose = true, overlayVariant, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay variant={variant === 'win31' ? 'win31' : overlayVariant} />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(dialogContentVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      {showClose && variant !== 'win31' && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

/* ─────────────────────────────────────────────────────────────────────────────
   DIALOG HEADER
   ───────────────────────────────────────────────────────────────────────────── */

const dialogHeaderVariants = cva('flex flex-col space-y-1.5', {
  variants: {
    variant: {
      default: 'text-center sm:text-left',
      // Windows 3.1 title bar
      win31: [
        'flex-row items-center justify-between space-y-0 p-1 px-2',
        'bg-gradient-to-r from-win31-navy to-win31-blue',
        'text-win31-white',
      ],
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface DialogHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogHeaderVariants> {}

const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, variant, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(dialogHeaderVariants({ variant }), className)}
      {...props}
    >
      {variant === 'win31' ? (
        <>
          <div className="flex items-center gap-2">{children}</div>
          <DialogPrimitive.Close className="h-4 w-4 bg-win31-gray border border-t-win31-white border-l-win31-white border-b-win31-black border-r-win31-black flex items-center justify-center text-win31-black text-xs font-bold hover:bg-win31-light-gray active:border-t-win31-black active:border-l-win31-black active:border-b-win31-white active:border-r-win31-white">
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

/* ─────────────────────────────────────────────────────────────────────────────
   DIALOG TITLE
   ───────────────────────────────────────────────────────────────────────────── */

const dialogTitleVariants = cva('', {
  variants: {
    variant: {
      default: 'text-lg font-semibold leading-none tracking-tight',
      // Windows 3.1 title bar text
      win31: 'font-window text-sm font-normal tracking-wide',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface DialogTitleProps
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
    {variant === 'win31' && icon && (
      <span className="mr-2" aria-hidden="true">
        {icon}
      </span>
    )}
    {children}
  </DialogPrimitive.Title>
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

/* ─────────────────────────────────────────────────────────────────────────────
   DIALOG DESCRIPTION
   ───────────────────────────────────────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────────────────────────────────────
   DIALOG FOOTER
   ───────────────────────────────────────────────────────────────────────────── */

const dialogFooterVariants = cva('flex', {
  variants: {
    variant: {
      default: 'flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      // Windows 3.1 button bar
      win31: 'flex-row justify-end gap-2 p-2 bg-win31-gray',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface DialogFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogFooterVariants> {}

const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(dialogFooterVariants({ variant }), className)}
      {...props}
    />
  )
);
DialogFooter.displayName = 'DialogFooter';

/* ─────────────────────────────────────────────────────────────────────────────
   EXPORTS
   ───────────────────────────────────────────────────────────────────────────── */

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
  dialogContentVariants,
  dialogHeaderVariants,
  dialogTitleVariants,
  dialogFooterVariants,
  dialogOverlayVariants,
};

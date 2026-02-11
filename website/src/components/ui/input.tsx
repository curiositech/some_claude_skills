/**
 * INPUT COMPONENT
 * ===============
 * 
 * A text input component with CVA variants.
 * 
 * @example
 * ```tsx
 * <Input placeholder="Enter text..." />
 * <Input variant="win31" placeholder="DOS prompt..." />
 * ```
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@site/src/lib/utils';

const inputVariants = cva(
  'flex w-full file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: [
          'h-10 rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        ],
        ghost: [
          'h-10 rounded-md bg-transparent px-3 py-2 text-sm',
          'border-none focus-visible:bg-accent',
        ],
        // Windows 3.1 input
        win31: [
          'h-8 rounded-none bg-win31-white px-2 py-1 text-sm text-win31-black font-system',
          'border-2',
          'border-t-win31-dark-gray border-l-win31-dark-gray',
          'border-b-win31-white border-r-win31-white',
          'placeholder:text-win31-dark-gray',
          'focus:outline-none focus:border-t-win31-navy focus:border-l-win31-navy',
        ],
        'win31-code': [
          'h-8 rounded-none bg-win31-black px-2 py-1 text-sm text-win31-lime font-code',
          'border-2 border-win31-lime',
          'placeholder:text-win31-dark-gray',
          'focus:outline-none focus:border-win31-yellow',
        ],
      },
      size: {
        default: 'h-10',
        sm: 'h-9 text-xs',
        lg: 'h-11 text-base',
        // Win31 sizes
        'win31-sm': 'h-6 text-xs px-1',
        'win31-default': 'h-8 text-sm',
        'win31-lg': 'h-10 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };

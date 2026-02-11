/**
 * UTILITY FUNCTIONS
 * =================
 * 
 * Core utilities for the UI component library.
 * Following shadcn/ui patterns for class merging and type utilities.
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names with Tailwind CSS conflict resolution.
 * 
 * This is the standard pattern from shadcn/ui:
 * - `clsx` handles conditional classes and arrays
 * - `twMerge` resolves Tailwind class conflicts (e.g., p-4 + p-2 = p-2)
 * 
 * @example
 * ```tsx
 * // Basic usage
 * cn('p-4', 'text-red-500')
 * 
 * // Conditional classes
 * cn('base-class', isActive && 'active-class')
 * 
 * // With CVA variants
 * cn(buttonVariants({ variant: 'primary' }), className)
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Type helper for extracting component props with ref forwarding.
 * Useful when creating wrapper components.
 */
export type PropsWithoutRef<T> = T extends React.ComponentPropsWithRef<infer U>
  ? React.ComponentPropsWithoutRef<U>
  : T;

/**
 * Type helper for components that accept `asChild` prop (Radix pattern).
 */
export type AsChildProps<T> = T & {
  asChild?: boolean;
};

/**
 * Extract variant types from a CVA function.
 * 
 * @example
 * ```tsx
 * const buttonVariants = cva('...', { variants: { ... } });
 * type ButtonVariants = VariantProps<typeof buttonVariants>;
 * ```
 */
export type { VariantProps } from 'class-variance-authority';

/**
 * Utility to create a display name for components (useful for DevTools).
 */
export function createDisplayName(prefix: string, name: string): string {
  return `${prefix}.${name}`;
}

/**
 * Check if a value is defined (not null or undefined).
 * Useful for filtering optional values.
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Create a range of numbers.
 * Useful for pagination, etc.
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Generate a unique ID for accessibility purposes.
 */
let idCounter = 0;
export function generateId(prefix = 'id'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Focus trap utilities for modals/dialogs.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = container.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  return Array.from(elements).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('tabindex') !== '-1'
  );
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names with Tailwind CSS conflict resolution.
 * 
 * @example
 * cn('p-4', 'p-2') // → 'p-2'
 * cn('base', isActive && 'active')
 * cn(variants({ size: 'lg' }), className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generate a unique ID for accessibility.
 */
let idCounter = 0;
export function generateId(prefix = 'id'): string {
  return `${prefix}-${++idCounter}`;
}

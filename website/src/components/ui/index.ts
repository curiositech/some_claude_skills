/**
 * UI COMPONENT LIBRARY
 * ====================
 * 
 * Central export for all UI primitives and components.
 * Built on shadcn/ui patterns with Windows 3.1 aesthetic variants.
 * 
 * Architecture:
 * - All components use CVA for variant management
 * - Radix UI primitives for accessibility
 * - Tailwind CSS for styling (no arbitrary values)
 * - Full TypeScript support with strict typing
 * 
 * @example
 * ```tsx
 * import { Button, Card, CardHeader, CardTitle, Stack, Flex } from '@site/src/components/ui';
 * 
 * <Card variant="win31">
 *   <CardHeader variant="win31">
 *     <CardTitle variant="win31">Window Title</CardTitle>
 *   </CardHeader>
 *   <Stack gap="4" className="p-4">
 *     <Button variant="win31">Click Me</Button>
 *   </Stack>
 * </Card>
 * ```
 */

// ═══════════════════════════════════════════════════════════════════════════
// LAYOUT PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════

export { Stack, stackVariants } from './stack';
export type { StackProps } from './stack';

export { Box, boxVariants } from './box';
export type { BoxProps } from './box';

export { Flex, flexVariants } from './flex';
export type { FlexProps } from './flex';

export { Grid, gridVariants } from './grid';
export type { GridProps } from './grid';

export { Container, containerVariants } from './container';
export type { ContainerProps } from './container';

// ═══════════════════════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

export { Button, buttonVariants } from './button';
export type { ButtonProps } from './button';

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
} from './card';
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardContentProps,
  CardFooterProps,
} from './card';

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
} from './dialog';
export type {
  DialogContentProps,
  DialogHeaderProps,
  DialogFooterProps,
  DialogOverlayProps,
  DialogTitleProps,
} from './dialog';

export { Badge, badgeVariants } from './badge';
export type { BadgeProps } from './badge';

export { Input, inputVariants } from './input';
export type { InputProps } from './input';

export { Separator, separatorVariants } from './separator';
export type { SeparatorProps } from './separator';

export { ScrollArea, ScrollBar, scrollAreaVariants } from './scroll-area';
export type { ScrollAreaProps } from './scroll-area';

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  tooltipContentVariants,
} from './tooltip';
export type { TooltipContentProps } from './tooltip';

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

export { cn } from '@site/src/lib/utils';
export type { VariantProps } from 'class-variance-authority';

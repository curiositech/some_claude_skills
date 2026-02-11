# Modern UI Component Library

This directory contains the new UI component library built on **shadcn/ui patterns**, **Tailwind CSS**, **CVA (Class Variance Authority)**, and **Radix UI** primitives.

## Philosophy

### The "No Naked HTML" Rule

Layouts are built using **Primitives**, not arbitrary divs:

```tsx
// ❌ Bad - arbitrary div with inline classes
<div className="flex flex-col gap-4">
  <div className="p-4 border rounded">Content</div>
</div>

// ✅ Good - semantic primitives with typed variants
<Stack gap="4">
  <Card>
    <CardContent>Content</CardContent>
  </Card>
</Stack>
```

### Composition Over Configuration

Use slots/children instead of "God Components" with many props:

```tsx
// ❌ Bad - too many props
<Card
  title="Title"
  showIcon={true}
  iconName="user"
  footerButtonText="Go"
/>

// ✅ Good - composable slots
<Card>
  <CardHeader>
    <Icon name="user" />
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardFooter>
    <Button>Go</Button>
  </CardFooter>
</Card>
```

### Zero Arbitrary Values

No "magic numbers" in Tailwind classes:

```tsx
// ❌ Forbidden
<div className="w-[350px] m-[13px] text-[#333]" />

// ✅ Required - use Tailwind scale
<Box w="80" m="3" className="text-slate-800" />
```

### CVA for All Variants

Define variants with CVA, not template literals:

```tsx
// ❌ Bad - runtime string interpolation
<button className={`bg-${color}-500 p-${size}`} />

// ✅ Good - CVA variants
const buttonVariants = cva('...', {
  variants: {
    color: { primary: 'bg-primary', danger: 'bg-destructive' },
    size: { sm: 'p-2', lg: 'p-4' },
  },
});
<Button variant="primary" size="lg" />
```

## Layout Primitives

### Stack

Vertical or horizontal flex layout:

```tsx
import { Stack } from '@site/src/components/ui';

<Stack gap="4" direction="vertical">
  <p>Item 1</p>
  <p>Item 2</p>
</Stack>

<Stack direction="horizontal" gap="2" align="center">
  <Icon />
  <span>Label</span>
</Stack>
```

### Box

Semantic container with padding/margin:

```tsx
import { Box } from '@site/src/components/ui';

<Box p="4" m="2" rounded="md" bg="muted">
  Content
</Box>

<Box as="section" p="6" shadow="lg">
  Section content
</Box>
```

### Flex

Comprehensive flexbox control:

```tsx
import { Flex } from '@site/src/components/ui';

<Flex justify="between" align="center" gap="4">
  <Logo />
  <Navigation />
  <Actions />
</Flex>
```

### Grid

CSS Grid with standardized columns:

```tsx
import { Grid } from '@site/src/components/ui';

<Grid cols="3" gap="4">
  <Card />
  <Card />
  <Card />
</Grid>
```

### Container

Responsive max-width wrapper:

```tsx
import { Container } from '@site/src/components/ui';

<Container size="xl">
  <h1>Page Title</h1>
</Container>

<Container size="prose" as="article">
  <p>Long-form content...</p>
</Container>
```

## UI Components

### Button

```tsx
import { Button } from '@site/src/components/ui';

// Modern variants
<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>

// Windows 3.1 variants
<Button variant="win31">Retro Button</Button>
<Button variant="win31-primary">OK</Button>
<Button variant="win31-danger">Cancel</Button>

// Polymorphic (render as link)
<Button asChild>
  <a href="/page">Link Button</a>
</Button>
```

### Card

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@site/src/components/ui';

// Modern card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Main content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Windows 3.1 card
<Card variant="win31">
  <CardHeader variant="win31">
    <CardTitle variant="win31">📄 README.TXT</CardTitle>
  </CardHeader>
  <CardContent variant="win31">
    Retro content
  </CardContent>
  <CardFooter variant="win31">
    <Button variant="win31">OK</Button>
  </CardFooter>
</Card>
```

### Dialog (Modal)

Built on Radix UI - automatically handles:
- Click-outside to close
- Escape key handling
- Focus trapping
- Body scroll lock
- Portal rendering

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@site/src/components/ui';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Description text</DialogDescription>
    </DialogHeader>
    <div>Main content</div>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Windows 3.1 dialog
<Dialog>
  <DialogTrigger asChild>
    <Button variant="win31">Open Window</Button>
  </DialogTrigger>
  <DialogContent variant="win31">
    <DialogHeader variant="win31">
      <DialogTitle variant="win31" icon="📄">README.TXT</DialogTitle>
    </DialogHeader>
    <div className="p-4">Window content</div>
    <DialogFooter variant="win31">
      <Button variant="win31">OK</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Badge

```tsx
import { Badge } from '@site/src/components/ui';

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Danger</Badge>

// Windows 3.1
<Badge variant="win31">Tag</Badge>
<Badge variant="win31-success">Active</Badge>
```

### Input

```tsx
import { Input } from '@site/src/components/ui';

<Input placeholder="Enter text..." />
<Input variant="win31" placeholder="C:\>" />
<Input variant="win31-code" placeholder="$ command" />
```

### Other Components

- `Separator` - Visual divider (horizontal/vertical)
- `ScrollArea` - Custom scrollbars
- `Tooltip` - Accessible tooltips
- `TooltipProvider` - Wrap app for tooltip support

## Utility Functions

### cn() - Class Merger

```tsx
import { cn } from '@site/src/lib/utils';

// Merges classes with Tailwind conflict resolution
cn('p-4', 'p-2') // → 'p-2' (later wins)
cn('base-class', isActive && 'active-class')
cn(buttonVariants({ variant: 'primary' }), className)
```

## Migration Guide

### Replacing Win31Modal

Before (custom implementation):

```tsx
<Win31Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Welcome"
  icon="📄"
>
  <p>Content</p>
</Win31Modal>
```

After (Radix-based):

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent variant="win31">
    <DialogHeader variant="win31">
      <DialogTitle variant="win31" icon="📄">Welcome</DialogTitle>
    </DialogHeader>
    <div className="p-4">
      <p>Content</p>
    </div>
  </DialogContent>
</Dialog>
```

### Replacing Win31Button

Before:

```tsx
<Win31Button variant="primary" size="large" onClick={handleClick}>
  Click Me
</Win31Button>
```

After:

```tsx
<Button variant="win31-primary" size="win31-lg" onClick={handleClick}>
  Click Me
</Button>
```

### Replacing Flex Layouts

Before:

```tsx
<div className="flex flex-col gap-4 p-4">
  <div className="flex items-center justify-between gap-2">
    ...
  </div>
</div>
```

After:

```tsx
<Stack gap="4" className="p-4">
  <Flex justify="between" align="center" gap="2">
    ...
  </Flex>
</Stack>
```

## Design Tokens

All colors, spacing, and typography are defined as CSS variables in `globals.css` and referenced in `tailwind.config.ts`.

### Windows 3.1 Palette

Use with `bg-win31-*`, `text-win31-*`, `border-win31-*`:

- `win31-gray` (#c0c0c0) - Surface
- `win31-dark-gray` (#808080) - Shadows
- `win31-light-gray` (#dfdfdf) - Highlights
- `win31-navy` (#000080) - Title bars
- `win31-teal` (#008080) - Desktop
- `win31-lime` (#00FF00) - Terminal text
- `win31-yellow` (#FFFF00) - Warnings

### Box Shadows

- `shadow-win31-outset` - Raised button
- `shadow-win31-inset` - Pressed button
- `shadow-win31-window` - Window frame

## ESLint Rules

The ESLint configuration enforces:

1. **No `any`** - Be explicit about types
2. **Hook dependencies** - Prevents stale closures
3. **Import ordering** - React first, then external, then internal
4. **Consistent type imports** - Use `type` keyword

## TypeScript

Strict mode is enabled with:

- `noImplicitAny`
- `strictNullChecks`
- `strictFunctionTypes`
- `noUnusedLocals`
- `noUnusedParameters`
- `noImplicitReturns`

## File Structure

```
src/components/ui/
├── index.ts          # Central exports
├── README.md         # This file
├── stack.tsx         # Layout primitive
├── box.tsx           # Layout primitive
├── flex.tsx          # Layout primitive
├── grid.tsx          # Layout primitive
├── container.tsx     # Layout primitive
├── button.tsx        # UI component
├── card.tsx          # UI component
├── dialog.tsx        # UI component (Radix)
├── badge.tsx         # UI component
├── input.tsx         # UI component
├── separator.tsx     # UI component (Radix)
├── scroll-area.tsx   # UI component (Radix)
└── tooltip.tsx       # UI component (Radix)
```

## Adding New Components

1. Create `component-name.tsx` in this directory
2. Use CVA for variants
3. Use Radix primitives if interactive
4. Export from `index.ts`
5. Add documentation to this README

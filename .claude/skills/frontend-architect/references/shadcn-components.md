# shadcn/ui Component Patterns

Best practices for using and customizing shadcn/ui components.

## Setup

### Installation

```bash
# Initialize in Next.js project
npx shadcn-ui@latest init

# Configuration prompts:
# - TypeScript: Yes
# - Style: Default (or New York)
# - Base color: Slate (customizable)
# - CSS variables: Yes
# - Tailwind config: tailwind.config.ts
# - Import alias: @/components
```

### Add Components

```bash
# Add individual components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form

# Common starter set
npx shadcn-ui@latest add button card dialog dropdown-menu \
  input label select tabs toast tooltip
```

## Component Customization

### Button Variants

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Custom: Neobrutalism
        brutalist: "bg-yellow-400 text-black border-2 border-black shadow-[4px_4px_0_#000] hover:shadow-[6px_6px_0_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-[2px_2px_0_#000] active:translate-x-0.5 active:translate-y-0.5 rounded-none",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### Form Pattern

```typescript
// Full form with validation
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function LoginForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormDescription>
                Must be at least 8 characters
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Sign In</Button>
      </form>
    </Form>
  );
}
```

### Dialog Pattern

```typescript
// Controlled dialog with form
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateItemDialog() {
  const [open, setOpen] = useState(false);

  async function handleSubmit(data: FormData) {
    await createItem(data);
    setOpen(false); // Close on success
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Item</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>
            Fill in the details for your new item.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit}>
          {/* Form fields */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Data Table Pattern

```typescript
// Using TanStack Table with shadcn
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
```

## Theme Customization

### CSS Variables

```css
/* globals.css */
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode values */
  }
}
```

### Custom Theme

```css
/* Neobrutalism theme */
:root {
  --background: 51 100% 94%; /* Cream */
  --foreground: 0 0% 0%;
  --primary: 51 100% 50%; /* Yellow */
  --primary-foreground: 0 0% 0%;
  --secondary: 180 100% 75%; /* Cyan */
  --border: 0 0% 0%;
  --radius: 0;

  /* Custom properties */
  --shadow-brutalist: 4px 4px 0 hsl(var(--foreground));
  --shadow-brutalist-lg: 8px 8px 0 hsl(var(--foreground));
}
```

## Component Composition

### Compound Components

```typescript
// Compose multiple shadcn components
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PatternCardProps {
  pattern: {
    id: string;
    name: string;
    trend: string;
    imageUrl: string;
  };
  onSelect: (id: string) => void;
}

export function PatternCard({ pattern, onSelect }: PatternCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-video relative">
        <img
          src={pattern.imageUrl}
          alt={pattern.name}
          className="object-cover w-full h-full"
        />
        <Badge
          variant="secondary"
          className="absolute top-2 right-2"
        >
          {pattern.trend}
        </Badge>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{pattern.name}</CardTitle>
      </CardHeader>
      <CardFooter>
        <Button
          onClick={() => onSelect(pattern.id)}
          className="w-full"
        >
          Add to Composition
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Extending Components

```typescript
// Extend Button with loading state
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading, children, disabled, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        disabled={loading || disabled}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Button>
    );
  }
);
LoadingButton.displayName = "LoadingButton";
```

## Accessibility Checklist

shadcn/ui uses Radix UI primitives, which handle most accessibility concerns, but verify:

- [ ] All interactive elements have visible focus states
- [ ] Dialogs trap focus and return focus on close
- [ ] Dropdowns are keyboard navigable
- [ ] Form errors are announced to screen readers
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets are at least 44x44px
- [ ] Loading states are announced

# Advanced Zod Schema Patterns

Production patterns for complex validation with Zod.

## Pattern 1: Conditional Validation (Dependent Fields)

Validate field B based on field A's value.

```typescript
const schema = z.object({
  accountType: z.enum(['personal', 'business']),
  businessName: z.string().optional(),
  taxId: z.string().optional()
}).refine(
  (data) => {
    if (data.accountType === 'business') {
      return !!data.businessName && !!data.taxId;
    }
    return true;
  },
  {
    message: 'Business name and tax ID required for business accounts',
    path: ['businessName'] // Error appears on this field
  }
);
```

## Pattern 2: Cross-Field Validation

Validate relationships between multiple fields.

```typescript
const dateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date()
}).refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate']
  }
);

// Password confirmation
const passwordSchema = z.object({
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }
);
```

## Pattern 3: Transform and Sanitize

Clean user input before validation.

```typescript
const phoneSchema = z.string()
  .transform((val) => val.replace(/\D/g, '')) // Remove non-digits
  .pipe(
    z.string()
      .length(10, 'Phone must be 10 digits')
      .regex(/^[2-9]/, 'Invalid area code')
  );

// Email normalization
const emailSchema = z.string()
  .email()
  .transform((val) => val.toLowerCase().trim());

// Currency parsing
const priceSchema = z.string()
  .transform((val) => parseFloat(val.replace(/[$,]/g, '')))
  .pipe(
    z.number()
      .positive('Price must be positive')
      .max(1000000, 'Price too high')
  );
```

## Pattern 4: Union Types with Discriminators

Type-safe unions for polymorphic data.

```typescript
const paymentSchema = z.discriminatedUnion('method', [
  z.object({
    method: z.literal('card'),
    cardNumber: z.string().regex(/^\d{16}$/),
    cvv: z.string().regex(/^\d{3}$/)
  }),
  z.object({
    method: z.literal('paypal'),
    email: z.string().email()
  }),
  z.object({
    method: z.literal('bank'),
    accountNumber: z.string(),
    routingNumber: z.string()
  })
]);

type Payment = z.infer<typeof paymentSchema>;
// TypeScript knows which fields exist based on 'method'
```

## Pattern 5: Recursive Schemas

Self-referential data structures (comments, file trees).

```typescript
interface Comment {
  id: string;
  text: string;
  replies: Comment[];
}

const commentSchema: z.ZodType<Comment> = z.lazy(() =>
  z.object({
    id: z.string(),
    text: z.string().min(1).max(500),
    replies: z.array(commentSchema)
  })
);

// File system tree
const fileNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    name: z.string(),
    type: z.enum(['file', 'folder']),
    children: z.array(fileNodeSchema).optional()
  })
);
```

## Pattern 6: Custom Validators (refine)

Complex business logic validation.

```typescript
// Check username availability (async)
const usernameSchema = z.string()
  .min(3)
  .max(20)
  .regex(/^[a-z0-9_]+$/, 'Lowercase, numbers, underscores only')
  .refine(
    async (username) => {
      const response = await fetch(`/api/check-username?q=${username}`);
      return response.ok;
    },
    { message: 'Username already taken' }
  );

// Validate file size
const fileSchema = z.instanceof(File)
  .refine(
    (file) => file.size <= 5 * 1024 * 1024,
    { message: 'File must be less than 5MB' }
  )
  .refine(
    (file) => ['image/jpeg', 'image/png'].includes(file.type),
    { message: 'Only JPEG and PNG allowed' }
  );

// Business hours validation
const appointmentSchema = z.object({
  date: z.date()
}).refine(
  (data) => {
    const day = data.date.getDay();
    const hour = data.date.getHours();
    return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
  },
  { message: 'Appointments only available Mon-Fri, 9 AM - 5 PM' }
);
```

## Pattern 7: Schema Composition (Reuse)

Build complex schemas from primitives.

```typescript
// Base schemas
const emailField = z.string().email('Invalid email');
const passwordField = z.string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Needs uppercase')
  .regex(/[0-9]/, 'Needs number');

// Compose into registration
const registrationSchema = z.object({
  email: emailField,
  password: passwordField,
  confirmPassword: z.string()
}).refine(
  (data) => data.password === data.confirmPassword,
  { path: ['confirmPassword'], message: 'Passwords must match' }
);

// Extend for profile update
const profileUpdateSchema = registrationSchema
  .omit({ password: true, confirmPassword: true })
  .extend({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    bio: z.string().max(500).optional()
  });
```

## Pattern 8: Partial and Pick

Create variations of schemas.

```typescript
const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(['admin', 'user'])
});

// For updates: all fields optional
const userUpdateSchema = userSchema.partial();

// For creation: omit auto-generated fields
const userCreateSchema = userSchema.omit({ id: true });

// For public API: only safe fields
const userPublicSchema = userSchema.pick({
  id: true,
  firstName: true,
  lastName: true
});
```

## Pattern 9: Default Values and Preprocessing

Set defaults before validation.

```typescript
const configSchema = z.object({
  theme: z.enum(['light', 'dark']).default('light'),
  notifications: z.boolean().default(true),
  itemsPerPage: z.number().min(10).max(100).default(25),
  tags: z.array(z.string()).default([])
});

// Preprocessing: Normalize before validate
const searchSchema = z.object({
  query: z.string().trim().min(1),
  filters: z.record(z.string()).default({})
}).transform((data) => ({
  ...data,
  query: data.query.toLowerCase()
}));
```

## Pattern 10: Error Customization

Provide context-aware error messages.

```typescript
const schema = z.object({
  age: z.number({
    required_error: 'Age is required',
    invalid_type_error: 'Age must be a number'
  })
    .min(18, 'Must be at least 18 years old')
    .max(120, 'Age seems invalid'),

  email: z.string({
    required_error: 'Email address is required'
  }).email({
    message: 'Please enter a valid email address'
  })
});

// Custom error map for entire form
const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === 'string') {
      return { message: 'This field must be text' };
    }
  }
  return { message: ctx.defaultError };
};

z.setErrorMap(customErrorMap);
```

## Pattern 11: Branded Types

Create distinct types for primitives.

```typescript
// Prevent mixing userId with productId
const UserIdSchema = z.string().uuid().brand('UserId');
type UserId = z.infer<typeof UserIdSchema>;

const ProductIdSchema = z.string().uuid().brand('ProductId');
type ProductId = z.infer<typeof ProductIdSchema>;

function getUser(id: UserId) { /* ... */ }
function getProduct(id: ProductId) { /* ... */ }

// TypeScript error: userId is not assignable to ProductId
const userId = UserIdSchema.parse('...');
getProduct(userId); // ❌ Type error!
```

## Pattern 12: SuperRefine (Multiple Errors)

Return multiple validation errors at once.

```typescript
const schema = z.object({
  password: z.string(),
  confirmPassword: z.string()
}).superRefine((data, ctx) => {
  if (data.password.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.too_small,
      minimum: 8,
      type: 'string',
      inclusive: true,
      path: ['password'],
      message: 'Password must be at least 8 characters'
    });
  }

  if (!/[A-Z]/.test(data.password)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['password'],
      message: 'Password must contain an uppercase letter'
    });
  }

  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['confirmPassword'],
      message: 'Passwords do not match'
    });
  }
});
```

## Production Checklist

```
□ All user inputs validated with Zod
□ Error messages are user-friendly (not technical)
□ Async validation debounced (500ms+)
□ File uploads have size/type constraints
□ Dates validated for business logic (hours, holidays)
□ Dependent fields use refine() properly
□ Schemas reused via composition (DRY)
□ Custom error maps for i18n
□ Branded types for IDs prevent mixing
□ SuperRefine for complex multi-field validation
```

## Common Pitfalls

1. **Async refine without debounce**: Spams API on every keystroke
2. **Missing path in refine**: Error appears on wrong field
3. **Transform before validation**: Use .pipe() to validate after transform
4. **Not using discriminatedUnion**: Poor TypeScript inference on unions
5. **Overly strict regex**: Rejects valid input (international phone numbers, etc.)

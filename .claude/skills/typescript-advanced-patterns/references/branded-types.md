# Branded Types Reference

Nominal typing in TypeScript using phantom brand types.

## The Core Pattern

TypeScript uses structural typing: two types are compatible if they have the same shape. Branded types add a phantom property that creates nominal compatibility — two brands are never assignable to each other even if the underlying type is the same.

```typescript
// The brand utility
type Brand<T, B extends string> = T & { readonly __brand: B };

// Never export __brand directly — it's a phantom type marker, not a real field
```

## Branded Primitives Catalog

### Identity Types

```typescript
type UserId = Brand<string, 'UserId'>;
type OrderId = Brand<string, 'OrderId'>;
type ProductId = Brand<string, 'ProductId'>;
type SessionId = Brand<string, 'SessionId'>;
type TransactionId = Brand<string, 'TransactionId'>;

// Constructor pattern — all validation happens here
const UserId = {
  from: (id: string): UserId => {
    if (!id.startsWith('user_')) throw new Error(`Invalid UserId: ${id}`);
    return id as UserId;
  },
  // fromUUID: no prefix validation needed
  generate: (): UserId => `user_${crypto.randomUUID()}` as UserId,
};

// Usage
const uid = UserId.from('user_abc123');
const oid = OrderId.from('order_xyz789');

function getUser(id: UserId): Promise<User> { /* ... */ }
getUser(uid);  // OK
getUser(oid);  // Error: OrderId is not assignable to UserId
```

### Money and Numeric Types

```typescript
// Always store money as integer cents/pence — never floats
type Cents = Brand<number, 'Cents'>;
type USD = Brand<number, 'USD'>;       // use Cents internally, USD at display layer
type Percentage = Brand<number, 'Percentage'>;

const Cents = {
  from: (n: number): Cents => {
    if (!Number.isInteger(n)) throw new Error(`Cents must be integer, got: ${n}`);
    if (n < 0) throw new Error(`Cents cannot be negative: ${n}`);
    return n as Cents;
  },
  fromDollars: (dollars: number): Cents => {
    return Cents.from(Math.round(dollars * 100));
  },
  add: (a: Cents, b: Cents): Cents => (a + b) as Cents,
  subtract: (a: Cents, b: Cents): Cents => {
    if (b > a) throw new Error('Cannot subtract: result would be negative');
    return (a - b) as Cents;
  },
  format: (c: Cents): string => `$${(c / 100).toFixed(2)}`,
};

// Why branded money matters
function applyDiscount(price: Cents, discount: Cents): Cents {
  return Cents.subtract(price, discount);
}

// Without branding, easy to pass a raw number or wrong unit
applyDiscount(1000, 10);           // Error: not Cents
applyDiscount(Cents.from(1000), Cents.from(10));  // Correct
```

### String-Constrained Types

```typescript
type EmailAddress = Brand<string, 'EmailAddress'>;
type UrlString = Brand<string, 'UrlString'>;
type HexColor = Brand<string, 'HexColor'>;
type ISODateString = Brand<string, 'ISODateString'>;

const EmailAddress = {
  parse: (raw: string): EmailAddress => {
    const trimmed = raw.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      throw new Error(`Invalid email: ${raw}`);
    }
    return trimmed as EmailAddress;
  },
};

const HexColor = {
  parse: (raw: string): HexColor => {
    if (!/^#[0-9a-fA-F]{6}$/.test(raw)) {
      throw new Error(`Invalid hex color: ${raw}`);
    }
    return raw.toLowerCase() as HexColor;
  },
};
```

### Path and URL Types

```typescript
type AbsolutePath = Brand<string, 'AbsolutePath'>;
type RelativePath = Brand<string, 'RelativePath'>;

// Prevents mixing absolute and relative paths in APIs that expect one type
function readFile(path: AbsolutePath): Promise<Buffer> { /* ... */ }

const abs = '/etc/config.json' as AbsolutePath;
const rel = './config.json' as RelativePath;

readFile(abs);  // OK
readFile(rel);  // Error: RelativePath is not assignable to AbsolutePath
```

## Zod Integration

When validating external input, Zod transforms raw strings into branded types.

```typescript
import { z } from 'zod';

// Define Zod schemas that produce branded types
const UserIdSchema = z.string()
  .regex(/^user_[a-z0-9]+$/, 'Invalid user ID format')
  .transform((s) => s as UserId);

const CentsSchema = z.number()
  .int('Must be integer')
  .nonnegative('Must be non-negative')
  .transform((n) => n as Cents);

const EmailSchema = z.string()
  .email()
  .transform((s) => s.toLowerCase() as EmailAddress);

// Full schema with branded fields
const CreateOrderSchema = z.object({
  userId: UserIdSchema,
  productId: z.string().transform(s => s as ProductId),
  amountCents: CentsSchema,
  email: EmailSchema,
});

type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
// Type: { userId: UserId; productId: ProductId; amountCents: Cents; email: EmailAddress }

// API handler
async function createOrder(rawInput: unknown) {
  const input = CreateOrderSchema.parse(rawInput);
  // input is now fully typed with brands — no raw strings or numbers
  await chargeUser(input.userId, input.amountCents);
}
```

## Database Model Patterns

TypeScript database clients (Drizzle, Prisma) return plain strings for ID columns. Use brand construction at the query boundary.

```typescript
// Drizzle example
import { pgTable, text, integer } from 'drizzle-orm/pg-core';

export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  amountCents: integer('amount_cents').notNull(),
});

// Repository pattern — brand at the boundary
class OrderRepository {
  async findById(id: OrderId): Promise<Order | null> {
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));  // OrderId assignable to string ✓

    if (!rows[0]) return null;

    return {
      id: rows[0].id as OrderId,         // Brand at query result boundary
      userId: rows[0].userId as UserId,
      amountCents: rows[0].amountCents as Cents,
    };
  }
}
```

## Testing Branded Types

```typescript
// Type-level tests with expect-type
import { expectType, expectError } from 'tsd';

const uid = UserId.from('user_abc');
const oid = OrderId.from('order_xyz');

expectType<UserId>(uid);
expectError<OrderId>(uid);  // UserId should not be assignable to OrderId

// Runtime tests
describe('UserId', () => {
  it('creates from valid string', () => {
    expect(() => UserId.from('user_abc123')).not.toThrow();
  });

  it('rejects invalid format', () => {
    expect(() => UserId.from('abc123')).toThrow('Invalid UserId');
    expect(() => UserId.from('')).toThrow();
  });

  it('generates unique IDs', () => {
    const a = UserId.generate();
    const b = UserId.generate();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^user_/);
  });
});
```

## Common Pitfalls

### Pitfall: Sharing brand names across services

```typescript
// Service A
type UserId = Brand<string, 'UserId'>;

// Service B (in a monorepo)
type UserId = Brand<string, 'UserId'>;  // Same brand name!

// These two UserId types ARE mutually assignable because the brand is structural
// Fix: use fully qualified brand names
type UserId = Brand<string, '@payments-service/UserId'>;
```

### Pitfall: JSON serialization loses brands

```typescript
const user = { id: UserId.from('user_abc'), name: 'Alice' };
const json = JSON.stringify(user);
const parsed = JSON.parse(json);
// parsed.id is plain string, not UserId!

// Fix: parse through Zod on deserialization
const parsedUser = UserSchema.parse(JSON.parse(json));
// parsedUser.id is UserId again
```

### Pitfall: Arithmetic on branded numbers

```typescript
type Cents = Brand<number, 'Cents'>;

const a = 100 as Cents;
const b = 50 as Cents;
const sum = a + b;  // Type is `number`, not `Cents`! Brand is lost in arithmetic

// Fix: use explicit operations that preserve the brand
const Cents = {
  add: (a: Cents, b: Cents): Cents => (a + b) as Cents,
  multiply: (c: Cents, factor: number): Cents => Math.round(c * factor) as Cents,
};
```

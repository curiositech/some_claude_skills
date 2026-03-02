# Type-Safe Patterns Reference

Exhaustive checking, builder pattern, type-safe event emitters, and mapped type utilities.

## Exhaustive Checking with never

The `never` type is the bottom type — nothing is assignable to it. This property makes it ideal for exhaustiveness checking.

```typescript
// The assertNever function
function assertNever(x: never, message?: string): never {
  throw new Error(message ?? `Unhandled case: ${JSON.stringify(x)}`);
}

// Pattern 1: Exhaustive switch
type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

function getStatusMessage(status: PaymentStatus): string {
  switch (status) {
    case 'pending':   return 'Payment is being processed';
    case 'completed': return 'Payment successful';
    case 'failed':    return 'Payment failed — please try again';
    case 'refunded':  return 'Payment has been refunded';
    default:          return assertNever(status);
    // When 'cancelled' is added to PaymentStatus:
    // Error: Argument of type '"cancelled"' is not assignable to 'never'
  }
}

// Pattern 2: Exhaustive object lookup (often cleaner than switch)
const STATUS_MESSAGES: Record<PaymentStatus, string> = {
  pending: 'Payment is being processed',
  completed: 'Payment successful',
  failed: 'Payment failed — please try again',
  refunded: 'Payment has been refunded',
  // Adding 'cancelled' to PaymentStatus causes a compile error here
};

// Pattern 3: Exhaustive if-else chains
function processStatus(status: PaymentStatus): void {
  if (status === 'pending') {
    /* ... */
  } else if (status === 'completed') {
    /* ... */
  } else if (status === 'failed') {
    /* ... */
  } else if (status === 'refunded') {
    /* ... */
  } else {
    const _exhaustive: never = status;  // Inline exhaustive check
    throw new Error(`Unhandled status: ${_exhaustive}`);
  }
}
```

### Exhaustive Narrowing with Discriminated Unions

```typescript
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return (shape.base * shape.height) / 2;
    default:
      return assertNever(shape);
  }
}
```

## Type-Safe Event Emitter

Standard Node.js EventEmitter uses string event names and any-typed callbacks. This pattern provides full type safety.

```typescript
type EventMap = Record<string, any[]>;

class TypedEventEmitter<Events extends EventMap> {
  private listeners = new Map<keyof Events, Set<(...args: any[]) => void>>();

  on<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void
  ): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return this;
  }

  off<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void
  ): this {
    this.listeners.get(event)?.delete(listener);
    return this;
  }

  emit<E extends keyof Events>(event: E, ...args: Events[E]): boolean {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.size === 0) return false;
    eventListeners.forEach(listener => listener(...args));
    return true;
  }

  once<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void
  ): this {
    const wrapper = (...args: Events[E]) => {
      listener(...args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }
}

// Usage: define the event map first
interface OrderEvents {
  created: [order: Order];
  paid: [orderId: OrderId, amountCents: Cents];
  shipped: [orderId: OrderId, trackingNumber: string];
  cancelled: [orderId: OrderId, reason: string];
}

class OrderService extends TypedEventEmitter<OrderEvents> {
  async createOrder(input: CreateOrderInput): Promise<Order> {
    const order = await db.orders.create(input);
    this.emit('created', order);      // Type checked: must pass Order
    return order;
  }

  async cancelOrder(id: OrderId, reason: string): Promise<void> {
    await db.orders.update(id, { status: 'cancelled' });
    this.emit('cancelled', id, reason);  // Type checked
  }
}

const service = new OrderService();
service.on('paid', (orderId, amountCents) => {
  // orderId is OrderId, amountCents is Cents — fully typed
  console.log(`Order ${orderId} paid ${Cents.format(amountCents)}`);
});

// Compile error: wrong argument type
service.on('paid', (orderId, amount: string) => {});  // Error: string is not Cents
service.emit('paid', 'not-an-order-id', 1000);        // Error: string is not OrderId
```

## Builder Pattern with Type-State

The type-state pattern uses generics to track what has been configured, preventing calling `.build()` before required fields are set.

```typescript
// Track which fields have been set in the type
type Required = 'set';
type Optional = 'set' | 'unset';

interface QueryBuilderState {
  table: Required | 'unset';
  conditions: 'set' | 'unset';
}

class QueryBuilder<State extends QueryBuilderState = { table: 'unset'; conditions: 'unset' }> {
  private config: { table?: string; conditions?: string[]; limit?: number } = {};

  from<T extends string>(table: T): QueryBuilder<{ table: 'set'; conditions: State['conditions'] }> {
    this.config.table = table;
    return this as any;
  }

  where(condition: string): QueryBuilder<{ table: State['table']; conditions: 'set' }> {
    this.config.conditions = [...(this.config.conditions ?? []), condition];
    return this as any;
  }

  limit(n: number): this {
    this.config.limit = n;
    return this;
  }

  // build() only available when table is set
  build(this: QueryBuilder<{ table: 'set'; conditions: QueryBuilderState['conditions'] }>): string {
    const where = this.config.conditions?.join(' AND ');
    const limit = this.config.limit ? ` LIMIT ${this.config.limit}` : '';
    return `SELECT * FROM ${this.config.table}${where ? ` WHERE ${where}` : ''}${limit}`;
  }
}

const q1 = new QueryBuilder()
  .from('orders')
  .where('status = pending')
  .limit(10)
  .build();   // OK

const q2 = new QueryBuilder()
  .where('status = pending')
  .build();   // Error: build() not available — table not set
```

## Mapped Type Utilities

### DeepReadonly

```typescript
type DeepReadonly<T> = T extends (infer U)[]
  ? ReadonlyArray<DeepReadonly<U>>
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// Useful for configuration objects that should never be mutated
const config = {
  database: { host: 'localhost', port: 5432 },
  cache: { ttl: 3600 },
} satisfies DeepReadonly<{
  database: { host: string; port: number };
  cache: { ttl: number };
}>;
```

### PickByValue

Select keys from an object type based on value type:

```typescript
type PickByValue<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

interface User {
  id: string;
  name: string;
  age: number;
  isAdmin: boolean;
  createdAt: Date;
}

type StringFields = PickByValue<User, string>;
// { id: string; name: string }

type DateFields = PickByValue<User, Date>;
// { createdAt: Date }
```

### RequireAtLeastOne

When you want an object to have at least one of several optional fields:

```typescript
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

interface ContactMethod {
  email?: string;
  phone?: string;
  slack?: string;
}

type ContactInput = RequireAtLeastOne<ContactMethod>;

const valid1: ContactInput = { email: 'a@b.com' };                // OK
const valid2: ContactInput = { phone: '555-1234', slack: '@user' };  // OK
const invalid: ContactInput = {};  // Error: at least one required
```

### Paths (deep key access)

Type-safe key access for deeply nested objects:

```typescript
type Paths<T, Key extends keyof T = keyof T> =
  Key extends string
    ? T[Key] extends Record<string, any>
      ? `${Key}` | `${Key}.${Paths<T[Key]>}`
      : `${Key}`
    : never;

interface Config {
  database: {
    host: string;
    port: number;
    credentials: {
      user: string;
      password: string;
    };
  };
  cache: {
    ttl: number;
  };
}

type ConfigPaths = Paths<Config>;
// "database" | "database.host" | "database.port" | "database.credentials" |
// "database.credentials.user" | "database.credentials.password" | "cache" | "cache.ttl"

function getConfigValue(config: Config, path: ConfigPaths): unknown {
  return path.split('.').reduce((obj: any, key) => obj?.[key], config);
}

getConfigValue(config, 'database.port');   // OK
getConfigValue(config, 'database.wrong'); // Error: not a valid path
```

## Function Overloads for Conditional Return Types

When the return type depends on input parameters:

```typescript
// Overload signatures
function parseValue(value: string): string;
function parseValue(value: number): number;
function parseValue(value: boolean): boolean;
function parseValue(value: string | number | boolean): string | number | boolean;

// Implementation (single, handles all cases)
function parseValue(value: string | number | boolean): string | number | boolean {
  return value;
}

// Callers get the specific return type
const s = parseValue('hello');  // string
const n = parseValue(42);       // number
const b = parseValue(true);     // boolean

// More practical: conditional return based on options
function query(sql: string, options: { single: true }): Promise<Row>;
function query(sql: string, options?: { single?: false }): Promise<Row[]>;
function query(sql: string, options?: { single?: boolean }): Promise<Row | Row[]> {
  // implementation
}

const row = await query('SELECT * FROM users WHERE id = 1', { single: true });
// row is Row, not Row[]

const rows = await query('SELECT * FROM users');
// rows is Row[]
```

## const Assertions and Literal Types

```typescript
// Without as const: widened types
const directions = ['north', 'south', 'east', 'west'];
// Type: string[]

type Direction = typeof directions[number];
// Type: string  ← not useful

// With as const: literal types preserved
const DIRECTIONS = ['north', 'south', 'east', 'west'] as const;
// Type: readonly ['north', 'south', 'east', 'west']

type Direction = typeof DIRECTIONS[number];
// Type: 'north' | 'south' | 'east' | 'west'  ← useful!

// Config objects with as const
const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

type HttpMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];
// Type: 'GET' | 'POST' | 'PUT' | 'DELETE'

// Enum alternative pattern (more idiomatic than TS enums)
const Role = {
  Admin: 'admin',
  User: 'user',
  Moderator: 'moderator',
} as const;

type Role = typeof Role[keyof typeof Role];
// Type: 'admin' | 'user' | 'moderator'
// Usage: Role.Admin === 'admin'  (no need for Role["Admin"])
```

## Type-Level Testing with tsd/expect-type

Test that your utility types produce the correct types:

```typescript
// Install: npm install -D tsd
// In a .test-d.ts file:
import { expectType, expectError, expectAssignable } from 'tsd';
import type { DeepReadonly, PickByValue, RequireAtLeastOne } from './utils';

// Test DeepReadonly
type Config = DeepReadonly<{ db: { host: string; port: number } }>;
declare const config: Config;

expectType<string>(config.db.host);
expectError(config.db.host = 'new-host');  // Should error: readonly

// Test branded types
declare const userId: UserId;
declare const orderId: OrderId;
expectAssignable<string>(userId);  // UserId extends string
expectError<UserId>(orderId);      // OrderId not assignable to UserId
```

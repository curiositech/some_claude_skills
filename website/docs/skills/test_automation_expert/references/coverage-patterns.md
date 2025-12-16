---
title: Coverage Optimization Patterns
sidebar_label: Coverage Optimization Patterns
sidebar_position: 2
---
# Coverage Optimization Patterns

Strategies for meaningful test coverage that catches bugs without slowing development.

## Understanding Coverage Metrics

### Types of Coverage

| Metric | What It Measures | Target | Priority |
|--------|-----------------|--------|----------|
| **Line** | Executed lines | 80% | Medium |
| **Branch** | Decision paths (if/else) | 75% | High |
| **Function** | Called functions | 90% | Medium |
| **Statement** | Executed statements | 80% | Low |
| **Condition** | Boolean sub-expressions | 70% | High |
| **Path** | Unique execution paths | 60% | Low |

### Why Branch Coverage Matters Most

```javascript
function processOrder(order) {
  if (order.isPriority && order.total > 100) {  // 4 branches!
    applyDiscount(order);
  }
  return order;
}

// Line coverage: 100% with just one test
// Branch coverage: Only 25% - missing 3 combinations!

// Need tests for:
// 1. isPriority=true, total&gt;100 (discount applied)
// 2. isPriority=true, total<=100 (no discount)
// 3. isPriority=false, total&gt;100 (no discount)
// 4. isPriority=false, total<=100 (no discount)
```

## Coverage Configuration

### Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8', // or 'istanbul'
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',

      // What to include
      include: ['src/**/*.{ts,tsx}'],

      // What to exclude
      exclude: [
        'node_modules/',
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/**/*.stories.{ts,tsx}',
        'src/**/index.ts',      // Barrel files
        'src/**/types.ts',      // Type definitions
        'src/**/*.config.*',    // Config files
        'src/mocks/**',         // Test mocks
        'src/__fixtures__/**',  // Test fixtures
      ],

      // Thresholds
      thresholds: {
        global: {
          branches: 75,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // Per-file thresholds
        'src/utils/**': {
          branches: 90,
          functions: 95,
        },
        'src/components/**': {
          branches: 70,
          lines: 75,
        },
      },

      // Fail if coverage drops
      watermarks: {
        lines: [70, 80],
        functions: [70, 80],
        branches: [70, 75],
        statements: [70, 80],
      },
    },
  },
});
```

### Jest

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.*',
    '!src/**/*.test.*',
    '!src/**/index.{js,ts}',
  ],

  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/utils/': {
      branches: 90,
      functions: 95,
    },
  },
};
```

### pytest

```toml
# pyproject.toml
[tool.coverage.run]
branch = true
source = ["src"]
omit = [
    "tests/*",
    "**/__init__.py",
    "**/conftest.py",
    "**/*_test.py",
]
parallel = true

[tool.coverage.report]
fail_under = 80
show_missing = true
skip_covered = false
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "raise NotImplementedError",
    "if TYPE_CHECKING:",
    "if __name__ == .__main__.:",
    "@abstractmethod",
]

[tool.coverage.html]
directory = "coverage_html"
```

## Finding Coverage Gaps

### Command Line Analysis

```bash
# Vitest - show uncovered lines
npx vitest run --coverage

# Jest - detailed report
npx jest --coverage --coverageReporters=text-summary

# Find files with low coverage
npx vitest run --coverage --reporter=json | \
  jq '.coverageMap | to_entries |
      map(select(.value.s | values | map(select(. == 0)) | length > 0)) |
      .[].key'

# pytest - show missing lines
pytest --cov=src --cov-report=term-missing
```

### HTML Report Navigation

1. Generate HTML report: `npx vitest run --coverage`
2. Open `coverage/index.html`
3. Sort by "Branches" or "Lines" (ascending)
4. Click into files with low coverage
5. Red highlights = uncovered code

### Identifying Critical Gaps

**Priority order for fixing gaps:**

1. **Error handling paths** - Often untested but critical
   ```javascript
   try {
     await api.call();
   } catch (error) {
     // This branch often untested!
     logger.error(error);
     throw new AppError('API failed');
   }
   ```

2. **Edge cases in conditionals**
   ```javascript
   if (value === null || value === undefined) {
     // Null/undefined often missed
   }
   ```

3. **Async error paths**
   ```javascript
   promise.catch(error => {
     // Rejection handlers often untested
   });
   ```

4. **Default switch cases**
   ```javascript
   switch (status) {
     case 'active': return 'green';
     case 'pending': return 'yellow';
     default: return 'gray'; // Often untested
   }
   ```

## Coverage Anti-Patterns

### Anti-Pattern: Coverage Without Assertions

```javascript
// ❌ Bad: Executes code but tests nothing
it('covers the function', () => {
  processOrder({ id: 1 });
  // No expect()!
});

// ✅ Good: Meaningful assertions
it('processes valid order', () => {
  const result = processOrder({ id: 1, items: [{ price: 10 }] });
  expect(result.total).toBe(10);
  expect(result.status).toBe('processed');
});
```

### Anti-Pattern: Testing Private Internals

```javascript
// ❌ Bad: Testing implementation detail
it('sets internal flag', () => {
  const service = new UserService();
  service._processUser(user);
  expect(service._isProcessed).toBe(true);
});

// ✅ Good: Test observable behavior
it('marks user as active after processing', () => {
  const service = new UserService();
  const result = service.processUser(user);
  expect(result.status).toBe('active');
});
```

### Anti-Pattern: Excessive Mocking

```javascript
// ❌ Bad: Everything mocked, testing nothing real
jest.mock('./database');
jest.mock('./logger');
jest.mock('./validator');
jest.mock('./formatter');

it('processes data', () => {
  // All real code is mocked out!
});

// ✅ Good: Mock only boundaries
jest.mock('./database'); // External system

it('validates and saves data', () => {
  // Real validation, real formatting
  // Only DB is mocked
});
```

## Effective Coverage Strategies

### Strategy 1: Test Behaviors, Not Lines

```javascript
// Instead of testing each line...
describe('OrderCalculator', () => {
  // Test the behaviors users care about
  it('calculates subtotal from items', () => {});
  it('applies percentage discount', () => {});
  it('applies fixed discount', () => {});
  it('calculates tax after discounts', () => {});
  it('rounds total to 2 decimal places', () => {});
});
```

### Strategy 2: Boundary Value Testing

```javascript
// Test at boundaries, not random values
describe('validateAge', () => {
  it('rejects age below minimum (17)', () => {
    expect(validateAge(17)).toBe(false);
  });

  it('accepts age at minimum (18)', () => {
    expect(validateAge(18)).toBe(true);
  });

  it('accepts age at maximum (120)', () => {
    expect(validateAge(120)).toBe(true);
  });

  it('rejects age above maximum (121)', () => {
    expect(validateAge(121)).toBe(false);
  });
});
```

### Strategy 3: Error Path Testing

```javascript
describe('fetchUser', () => {
  it('returns user on success', async () => {
    mockApi.get.mockResolvedValue({ data: { id: 1 } });
    const user = await fetchUser(1);
    expect(user.id).toBe(1);
  });

  // Explicitly test each error case
  it('throws NotFoundError for 404', async () => {
    mockApi.get.mockRejectedValue({ status: 404 });
    await expect(fetchUser(999)).rejects.toThrow(NotFoundError);
  });

  it('throws NetworkError for timeout', async () => {
    mockApi.get.mockRejectedValue({ code: 'ETIMEDOUT' });
    await expect(fetchUser(1)).rejects.toThrow(NetworkError);
  });

  it('retries on 503 before failing', async () => {
    mockApi.get
      .mockRejectedValueOnce({ status: 503 })
      .mockRejectedValueOnce({ status: 503 })
      .mockResolvedValue({ data: { id: 1 } });

    const user = await fetchUser(1);
    expect(mockApi.get).toHaveBeenCalledTimes(3);
  });
});
```

### Strategy 4: Parameterized Tests

```javascript
// Test multiple cases efficiently
describe.each([
  ['valid@email.com', true],
  ['user+tag@domain.co', true],
  ['name@subdomain.domain.org', true],
  ['invalid', false],
  ['@missing.com', false],
  ['spaces @domain.com', false],
  ['', false],
  [null, false],
])('validateEmail(%s)', (email, expected) => {
  it(`returns $\{expected\}`, () => {
    expect(validateEmail(email)).toBe(expected);
  });
});
```

### Strategy 5: Coverage-Driven Refactoring

When you find untestable code, refactor it:

```javascript
// ❌ Hard to test: side effects mixed with logic
function processOrder(order) {
  const discount = order.customer.tier === 'gold' ? 0.1 : 0;
  const total = order.items.reduce((sum, i) => sum + i.price, 0);
  const finalTotal = total * (1 - discount);

  database.save({ ...order, total: finalTotal }); // Side effect!
  emailService.send(order.customer.email, finalTotal); // Side effect!

  return finalTotal;
}

// ✅ Testable: Pure calculation, separate side effects
function calculateOrderTotal(order) {
  const discount = getCustomerDiscount(order.customer);
  const subtotal = calculateSubtotal(order.items);
  return applyDiscount(subtotal, discount);
}

function processOrder(order) {
  const total = calculateOrderTotal(order);
  await saveOrder({ ...order, total });
  await notifyCustomer(order.customer, total);
  return total;
}

// Now you can unit test calculateOrderTotal with 100% coverage
// And integration test processOrder separately
```

## Coverage in CI/CD

### GitHub Actions

```yaml
- name: Run tests with coverage
  run: npm test -- --coverage --coverageReporters=json-summary

- name: Check coverage thresholds
  run: |
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    if (( $(echo "$COVERAGE < 80" | bc -l) )); then
      echo "Coverage $COVERAGE% is below 80%"
      exit 1
    fi

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v4
  with:
    files: ./coverage/lcov.info
    fail_ci_if_error: true
```

### Coverage Diff on PRs

```yaml
- name: Coverage diff
  uses: ArtiomTr/jest-coverage-report-action@v2
  with:
    threshold: 80
    annotations: coverage
```

## Coverage Reporting Tools

| Tool | Features | Best For |
|------|----------|----------|
| Codecov | Diff, history, PR comments | Open source, teams |
| Coveralls | Simple, badges | Small projects |
| SonarQube | Quality gates, security | Enterprise |
| Code Climate | Maintainability metrics | Full analysis |

## Realistic Targets

### By Project Type

| Type | Line | Branch | Rationale |
|------|------|--------|-----------|
| Library/SDK | 90% | 85% | High reuse, stable |
| API Service | 80% | 75% | Core paths critical |
| Web App | 75% | 70% | UI harder to test |
| CLI Tool | 85% | 80% | Fewer UI concerns |
| Legacy Migration | 60% | 50% | Start somewhere |

### Incremental Improvement

Week 1: Establish baseline, add CI check
Week 2: Target +5% on lowest files
Week 4: Hit 60% if starting low
Week 8: Hit 70% overall
Week 12: Hit 80% stable target

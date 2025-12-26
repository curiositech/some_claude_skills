---
sidebar_label: Test Automation Expert
sidebar_position: 1
---

# ✅ Test Automation Expert

Comprehensive test automation specialist covering unit, integration, and E2E testing strategies. Expert in Jest, Vitest, Playwright, Cypress, pytest, and modern testing frameworks. Guides test pyramid design, coverage optimization, flaky test detection, and CI/CD integration. Activate on 'test strategy', 'unit tests', 'integration tests', 'E2E testing', 'test coverage', 'flaky tests', 'mocking', 'test fixtures', 'TDD', 'BDD', 'test automation'. NOT for manual QA processes, load/performance testing (use performance-engineer), or security testing (use security-auditor).

---

## Allowed Tools

```
Read, Write, Edit, Bash(npm test:*, npx jest:*, npx vitest:*, npx playwright:*, pytest:*), Grep, Glob
```

## Tags

`testing` `jest` `playwright` `tdd` `coverage`

## 🤝 Pairs Great With

- **[Refactoring Surgeon](/docs/skills/refactoring_surgeon)**: Tests before refactoring
- **[Devops Automator](/docs/skills/devops_automator)**: CI/CD test integration

## References

- [CI/CD Test Integration](./references/ci-integration)
- [Coverage Optimization Patterns](./references/coverage-patterns)
- [Testing Framework Comparison](./references/framework-comparison)
- [Test Strategy Framework](./references/test-strategy)

# Test Automation Expert

Comprehensive testing guidance from unit to E2E. Designs test strategies, implements automation, and optimizes coverage for sustainable quality.

## When to Use

**Use for:**
- Designing test strategy for new projects
- Setting up testing frameworks (Jest, Vitest, Playwright, Cypress, pytest)
- Writing effective unit, integration, and E2E tests
- Optimizing test coverage and eliminating gaps
- Debugging flaky tests
- CI/CD test pipeline configuration
- Test-Driven Development (TDD) guidance
- Mocking strategies and test fixtures

**Do NOT use for:**
- Manual QA test case writing - this is automation-focused
- Load/performance testing - use performance-engineer skill
- Security testing - use security-auditor skill
- API contract testing only - use backend-architect for API design

## Test Pyramid Philosophy

```
         /\
        /  \      E2E Tests (10%)
       /----\     - Critical user journeys
      /      \    - Cross-browser validation
     /--------\
    /          \  Integration Tests (20%)
   /            \ - API contracts
  /--------------\- Component interactions
 /                \
/------------------\ Unit Tests (70%)
                    - Fast, isolated, deterministic
                    - Business logic validation
```

### Distribution Guidelines

| Test Type | Percentage | Execution Time | Purpose |
|-----------|------------|----------------|---------|
| Unit | 70% | < 100ms each | Logic validation |
| Integration | 20% | < 1s each | Component contracts |
| E2E | 10% | < 30s each | Critical paths |

## Framework Selection

### JavaScript/TypeScript

| Framework | Best For | Speed | Config Complexity |
|-----------|----------|-------|-------------------|
| **Vitest** | Vite projects, modern ESM | Fastest | Low |
| **Jest** | React, established projects | Fast | Medium |
| **Playwright** | E2E, cross-browser | N/A | Low |
| **Cypress** | E2E, component testing | N/A | Medium |

### Python

| Framework | Best For | Speed | Features |
|-----------|----------|-------|----------|
| **pytest** | Everything | Fast | Fixtures, plugins |
| **unittest** | Standard library | Medium | Built-in |
| **hypothesis** | Property-based | Varies | Generative |

### Decision Tree: Framework Selection

```
New project?
├── Yes → Using Vite?
│   ├── Yes → Vitest
│   └── No → Jest or Vitest (both work)
└── No → What exists?
    ├── Jest → Keep Jest (migration cost rarely worth it)
    ├── Mocha → Consider migration to Vitest
    └── Nothing → Vitest (modern default)

Need E2E?
├── Cross-browser critical → Playwright
├── Developer experience priority → Cypress
└── Both → Playwright (more flexible)
```

## Unit Testing Patterns

### Good Unit Test Anatomy

```javascript
describe('UserService', () => {
  describe('validateEmail', () => {
    // Arrange-Act-Assert pattern
    it('should accept valid email formats', () => {
      // Arrange
      const validEmails = ['user@example.com', 'name+tag@domain.co'];

      // Act & Assert
      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      // Arrange
      const invalidEmails = ['invalid', '@missing.com', 'no@tld'];

      // Act & Assert
      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    // Edge cases explicitly tested
    it('should handle empty string', () => {
      expect(validateEmail('')).toBe(false);
    });

    it('should handle null/undefined', () => {
      expect(validateEmail(null)).toBe(false);
      expect(validateEmail(undefined)).toBe(false);
    });
  });
});
```

### Mocking Strategies

```javascript
// ✅ Good: Mock at boundaries
jest.mock('../services/api', () => ({
  fetchUser: jest.fn()
}));

// ✅ Good: Explicit mock setup per test
beforeEach(() => {
  fetchUser.mockReset();
});

it('handles user not found', async () => {
  fetchUser.mockRejectedValue(new NotFoundError());
  await expect(getUser(123)).rejects.toThrow('User not found');
});

// ❌ Bad: Mocking implementation details
jest.mock('../utils/internal-helper'); // Don't mock internals
```

### Test Isolation Checklist

- [ ] Each test can run independently
- [ ] No shared mutable state between tests
- [ ] Database/API state reset between tests
- [ ] No test order dependencies
- [ ] Parallel execution safe

## Integration Testing Patterns

### API Integration Test

```javascript
describe('POST /api/users', () => {
  let app;
  let db;

  beforeAll(async () => {
    db = await createTestDatabase();
    app = createApp({ db });
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    await db.clear();
  });

  it('creates user with valid data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'test@example.com' })
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(String),
      name: 'Test',
      email: 'test@example.com'
    });

    // Verify side effects
    const dbUser = await db.users.findById(response.body.id);
    expect(dbUser).toBeDefined();
  });

  it('rejects duplicate email', async () => {
    await db.users.create({ name: 'Existing', email: 'test@example.com' });

    await request(app)
      .post('/api/users')
      .send({ name: 'New', email: 'test@example.com' })
      .expect(409);
  });
});
```

### Component Integration (React)

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from './UserProfile';
import { UserProvider } from '../context/UserContext';

describe('UserProfile integration', () => {
  it('loads and displays user data', async () => {
    render(
      <UserProvider>
        <UserProfile userId="123" />
      </UserProvider>
    );

    // Verify loading state
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for data
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Verify loaded state
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
```

## E2E Testing Patterns

### Playwright Best Practices

```javascript
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Seed test data via API
    await page.request.post('/api/test/seed', {
      data: { scenario: 'checkout-ready' }
    });
  });

  test('complete purchase with credit card', async ({ page }) => {
    await page.goto('/cart');

    // Use accessible selectors
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();

    // Fill payment form
    await page.getByLabel('Card number').fill('4242424242424242');
    await page.getByLabel('Expiry').fill('12/25');
    await page.getByLabel('CVC').fill('123');

    // Complete purchase
    await page.getByRole('button', { name: 'Pay now' }).click();

    // Verify success
    await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
    await expect(page.getByText(/Order #\d+/)).toBeVisible();
  });

  test('shows error for declined card', async ({ page }) => {
    await page.goto('/checkout');

    // Use test card that triggers decline
    await page.getByLabel('Card number').fill('4000000000000002');
    await page.getByLabel('Expiry').fill('12/25');
    await page.getByLabel('CVC').fill('123');

    await page.getByRole('button', { name: 'Pay now' }).click();

    await expect(page.getByRole('alert')).toContainText('Card declined');
  });
});
```

### Flaky Test Detection & Prevention

**Common Causes:**
1. Race conditions in async operations
2. Time-dependent tests
3. Shared state between tests
4. Network variability
5. Animation/transition timing

**Fixes:**

```javascript
// ❌ Bad: Fixed timeout
await page.waitForTimeout(2000);

// ✅ Good: Wait for specific condition
await expect(page.getByText('Loaded')).toBeVisible();

// ❌ Bad: Checking exact time
expect(new Date()).toEqual(specificDate);

// ✅ Good: Mock time
jest.useFakeTimers();
jest.setSystemTime(new Date('2024-01-15'));

// ❌ Bad: Depending on animation completion
await page.click('.button');
expect(await page.isVisible('.modal')).toBe(true);

// ✅ Good: Wait for animation
await page.click('.button');
await expect(page.locator('.modal')).toBeVisible();
```

## Coverage Optimization

### What to Measure

| Metric | Target | Priority |
|--------|--------|----------|
| Line coverage | 80%+ | Medium |
| Branch coverage | 75%+ | High |
| Function coverage | 90%+ | Medium |
| Critical path coverage | 100% | Critical |

### Coverage Configuration

```javascript
// vitest.config.js
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts', // barrel files
      ],
      thresholds: {
        branches: 75,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  }
});
```

### Finding Coverage Gaps

```bash
# Generate detailed coverage report
npx vitest run --coverage

# Find untested files
npx vitest run --coverage --reporter=json | jq '.coverageMap | to_entries | map(select(.value.s | values | any(. == 0))) | .[].key'
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v4

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Parallelization

```javascript
// vitest.config.js - parallel by default
export default defineConfig({
  test: {
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false
      }
    }
  }
});

// playwright.config.js
export default defineConfig({
  workers: process.env.CI ? 2 : undefined,
  fullyParallel: true
});
```

## Anti-Patterns

### Anti-Pattern: Testing Implementation Details

**What it looks like:**
```javascript
// ❌ Testing internal state
expect(component.state.isLoading).toBe(true);

// ❌ Testing private methods
expect(service._calculateHash()).toBe('abc123');
```

**Why wrong:** Couples tests to implementation, breaks on refactors

**Instead:**
```javascript
// ✅ Test observable behavior
expect(screen.getByRole('progressbar')).toBeInTheDocument();

// ✅ Test public interface
expect(service.getHash()).toBe('abc123');
```

### Anti-Pattern: Over-Mocking

**What it looks like:**
```javascript
// ❌ Mocking everything
jest.mock('../utils/format');
jest.mock('../utils/validate');
jest.mock('../utils/transform');
```

**Why wrong:** Tests pass even when real code is broken

**Instead:** Mock only at system boundaries (APIs, databases, external services)

### Anti-Pattern: Flaky Acceptance

**What it looks like:** "That test is just flaky, skip it"

**Why wrong:** Flaky tests indicate real problems (race conditions, timing issues)

**Instead:** Fix the flakiness or quarantine while fixing

### Anti-Pattern: Coverage Theater

**What it looks like:**
```javascript
// ❌ Testing for coverage, not behavior
it('covers the function', () => {
  myFunction();
  // No assertions!
});
```

**Why wrong:** 100% coverage with 0% confidence

**Instead:** Every test should assert meaningful behavior

## Quick Commands

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific file
npm test -- src/utils/format.test.ts

# Run in watch mode
npm test -- --watch

# Run E2E tests
npx playwright test

# Run E2E with UI
npx playwright test --ui

# Debug E2E test
npx playwright test --debug

# Update snapshots
npm test -- -u
```

## Reference Files

- `references/test-strategy.md` - Comprehensive test strategy framework
- `references/framework-comparison.md` - Detailed framework comparison
- `references/coverage-patterns.md` - Coverage optimization techniques
- `references/ci-integration.md` - CI/CD pipeline configurations

---

**Covers**: Test strategy | Unit testing | Integration testing | E2E testing | Coverage | CI/CD | Flaky test debugging

**Use with**: security-auditor (security tests) | performance-engineer (load tests) | code-reviewer (test quality)

---
title: Test Automation Expert
description: Comprehensive test automation specialist covering unit, integration, and E2E testing strategies
sidebar_label: Test Automation Expert
tags: [testing, jest, vitest, playwright, tdd, coverage]
---

# Test Automation Expert

> Comprehensive test automation specialist covering unit, integration, and E2E testing strategies. Expert in Jest, Vitest, Playwright, Cypress, pytest, and modern testing frameworks.

## Overview

The Test Automation Expert provides comprehensive testing guidance from unit to E2E. It designs test strategies, implements automation, and optimizes coverage for sustainable quality.

**Key Capabilities:**
- Test strategy design
- Framework setup (Jest, Vitest, Playwright, Cypress, pytest)
- Coverage optimization
- Flaky test debugging
- CI/CD integration

## When to Use

✅ **Use for:**
- Designing test strategy for new projects
- Setting up testing frameworks
- Writing effective unit, integration, and E2E tests
- Optimizing test coverage and eliminating gaps
- Debugging flaky tests
- CI/CD test pipeline configuration
- Test-Driven Development (TDD) guidance

❌ **Do NOT use for:**
- Manual QA test case writing - this is automation-focused
- Load/performance testing - use performance-engineer skill
- Security testing - use security-auditor skill

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
| Unit | 70% | &lt; 100ms each | Logic validation |
| Integration | 20% | &lt; 1s each | Component contracts |
| E2E | 10% | &lt; 30s each | Critical paths |

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

### Decision Tree

```
New project?
├── Yes → Using Vite?
│   ├── Yes → Vitest
│   └── No → Jest or Vitest (both work)
└── No → What exists?
    ├── Jest → Keep Jest (migration cost rarely worth it)
    └── Nothing → Vitest (modern default)

Need E2E?
├── Cross-browser critical → Playwright
└── Developer experience priority → Cypress
```

## Unit Testing Patterns

### Good Unit Test Anatomy

```javascript
describe('UserService', () => {
  describe('validateEmail', () => {
    // Arrange-Act-Assert pattern
    it('should accept valid email formats', () => {
      const validEmails = ['user@example.com', 'name+tag@domain.co'];
      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = ['invalid', '@missing.com', 'no@tld'];
      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });

    // Edge cases explicitly tested
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

// ❌ Bad: Mocking implementation details
jest.mock('../utils/internal-helper'); // Don't mock internals
```

## E2E Testing with Playwright

```javascript
import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('complete purchase with credit card', async ({ page }) => {
    await page.goto('/cart');

    // Use accessible selectors
    await page.getByRole('button', { name: 'Proceed to checkout' }).click();

    // Fill payment form
    await page.getByLabel('Card number').fill('4242424242424242');
    await page.getByLabel('Expiry').fill('12/25');
    await page.getByLabel('CVC').fill('123');

    await page.getByRole('button', { name: 'Pay now' }).click();

    // Verify success
    await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
  });
});
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

## Flaky Test Prevention

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
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

## Anti-Patterns

### Testing Implementation Details
**What it looks like**: `expect(component.state.isLoading).toBe(true);`
**Why wrong**: Couples tests to implementation, breaks on refactors
**Instead**: Test observable behavior

### Coverage Theater
**What it looks like**: Tests with no assertions just to hit coverage
**Why wrong**: 100% coverage with 0% confidence
**Instead**: Every test should assert meaningful behavior

## Quick Commands

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run E2E tests
npx playwright test

# Run E2E with UI
npx playwright test --ui

# Update snapshots
npm test -- -u
```

## Related Skills

- **security-auditor**: Security test integration
- **code-reviewer**: Test quality review
- **performance-engineer**: Load testing

---

**Covers**: Test strategy | Unit testing | Integration testing | E2E testing | Coverage | CI/CD | Flaky test debugging

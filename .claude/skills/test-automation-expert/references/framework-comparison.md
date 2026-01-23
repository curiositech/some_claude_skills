# Testing Framework Comparison

Detailed comparison of modern testing frameworks to help select the right tools.

## Unit Testing Frameworks

### JavaScript/TypeScript

| Feature | Jest | Vitest | Mocha + Chai |
|---------|------|--------|--------------|
| **Speed** | Fast | Fastest | Medium |
| **ESM Support** | Partial | Native | Good |
| **TypeScript** | Via transform | Native | Via ts-node |
| **Watch Mode** | Yes | Yes (HMR) | Yes |
| **Snapshots** | Built-in | Built-in | Plugin |
| **Coverage** | Built-in | Built-in (v8/c8) | Plugin |
| **Mocking** | Built-in | Built-in (vi) | Plugin (sinon) |
| **Parallel** | Workers | Threads | Limited |
| **Config** | Low | Minimal | High |
| **Community** | Largest | Growing fast | Established |

### When to Choose Each

**Choose Jest when:**
- Existing React project with CRA or Next.js
- Team already knows Jest
- Need extensive plugin ecosystem
- Snapshot testing is primary strategy

**Choose Vitest when:**
- New project, especially with Vite
- Performance is priority
- Native ESM/TypeScript needed
- Want Jest-compatible API with modern DX

**Choose Mocha when:**
- Need maximum flexibility
- Custom reporting requirements
- Legacy project compatibility
- Specific assertion library preference

### Configuration Examples

**Jest (jest.config.js):**
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      functions: 80,
      lines: 80
    }
  }
};
```

**Vitest (vitest.config.ts):**
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/']
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});
```

## E2E Testing Frameworks

### Comparison Matrix

| Feature | Playwright | Cypress | Selenium |
|---------|------------|---------|----------|
| **Browsers** | All major | Chrome, FF, Edge | All major |
| **Speed** | Fast | Fast | Slow |
| **Parallel** | Native | Paid feature | External |
| **Mobile** | Emulation | Limited | Appium |
| **Network Mock** | Built-in | Built-in | Manual |
| **Auto-wait** | Excellent | Good | Manual |
| **Debugging** | Inspector, trace | Time travel | Limited |
| **Language** | JS/TS/Python/C#/.NET | JS/TS only | Many |
| **CI/CD** | Excellent | Good | Complex |
| **Learning Curve** | Low | Low | High |
| **Open Source** | Yes | Yes (core) | Yes |

### When to Choose Each

**Choose Playwright when:**
- Cross-browser testing is critical
- Need WebKit/Safari testing
- API testing alongside E2E
- Multiple language support needed
- Complex scenarios (multiple tabs, auth)

**Choose Cypress when:**
- Developer experience is priority
- React/Vue/Angular component testing
- Team new to E2E testing
- Single browser is acceptable
- Real-time debugging needed

**Choose Selenium when:**
- Legacy infrastructure exists
- Need language flexibility
- Complex enterprise requirements
- Grid-based parallel execution

### Configuration Examples

**Playwright (playwright.config.ts):**
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'results.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

**Cypress (cypress.config.ts):**
```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 2,
      openMode: 0
    },
    setupNodeEvents(on, config) {
      // Task plugins
      on('task', {
        seedDatabase(data) {
          return db.seed(data);
        }
      });
    }
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    }
  }
});
```

## Python Testing Frameworks

### Comparison

| Feature | pytest | unittest | nose2 |
|---------|--------|----------|-------|
| **Syntax** | Simple | Verbose | Simple |
| **Fixtures** | Powerful | setUp/tearDown | Basic |
| **Plugins** | 800+ | Limited | Some |
| **Parametrize** | Built-in | SubTest | Plugin |
| **Assertions** | Plain assert | self.assertEqual | Plain |
| **Discovery** | Automatic | Manual | Automatic |
| **Markers** | Flexible | Limited | Limited |
| **Parallel** | pytest-xdist | No | Limited |

### pytest Configuration

**pyproject.toml:**
```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_functions = ["test_*"]
addopts = [
    "-v",
    "--strict-markers",
    "--cov=src",
    "--cov-report=term-missing",
    "--cov-report=html",
    "--cov-fail-under=80"
]
markers = [
    "slow: marks tests as slow",
    "integration: marks tests as integration tests",
    "e2e: marks tests as end-to-end tests"
]
filterwarnings = [
    "error",
    "ignore::DeprecationWarning"
]

[tool.coverage.run]
branch = true
source = ["src"]
omit = ["tests/*", "**/__init__.py"]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "if TYPE_CHECKING:",
    "raise NotImplementedError"
]
```

**conftest.py:**
```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

@pytest.fixture(scope="session")
def engine():
    return create_engine("sqlite:///:memory:")

@pytest.fixture(scope="function")
def db_session(engine):
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.rollback()
    session.close()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers(client):
    response = client.post('/login', json={
        'username': 'test',
        'password': 'test123'
    })
    token = response.json['token']
    return {'Authorization': f'Bearer {token}'}
```

## Component Testing

### React Testing Library vs Enzyme

| Feature | React Testing Library | Enzyme |
|---------|----------------------|--------|
| **Philosophy** | User behavior | Implementation |
| **Queries** | Accessibility-first | Component internals |
| **Shallow** | Not supported | Supported |
| **Maintained** | Active | Limited |
| **React 18** | Full support | Partial |
| **Learning** | Moderate | Easy |

**React Testing Library (Recommended):**
```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('submits form with user data', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();

  render(<LoginForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /sign in/i }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

## API Testing

### Framework Options

| Tool | Language | Best For |
|------|----------|----------|
| Supertest | JS/TS | Express/Node |
| Playwright Request | JS/TS | With E2E |
| pytest + requests | Python | Flask/Django |
| REST Assured | Java | Spring |
| Postman/Newman | Any | CI/CD |

**Supertest Example:**
```javascript
import request from 'supertest';
import app from '../src/app';

describe('Users API', () => {
  it('GET /users returns list', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveLength(10);
    expect(response.body[0]).toHaveProperty('id');
  });
});
```

## Decision Matrix

### Quick Selection Guide

```
Need to test...
│
├── Unit/Business Logic
│   ├── JavaScript/TypeScript
│   │   ├── Using Vite → Vitest
│   │   ├── Existing Jest → Keep Jest
│   │   └── New project → Vitest
│   └── Python → pytest
│
├── React Components
│   ├── User behavior → React Testing Library
│   └── With stories → Storybook + Chromatic
│
├── API Endpoints
│   ├── Node.js → Supertest
│   ├── With E2E → Playwright API
│   └── Python → pytest + requests
│
└── E2E/Browser
    ├── Cross-browser critical → Playwright
    ├── Developer experience → Cypress
    └── Legacy/Enterprise → Selenium
```

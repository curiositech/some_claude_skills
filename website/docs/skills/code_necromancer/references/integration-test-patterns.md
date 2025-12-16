---
title: Integration Test Patterns
sidebar_label: Integration Test Patterns
sidebar_position: 5
---
# Integration Test Patterns

Resurrection tests to verify legacy systems are working.

---

## Test Categories

### 1. Service Startup Tests
Verify each service can start without crashing.

```javascript
// Node.js service startup test
describe('Service Startup', () => {
  let server;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgresql://localhost:5432/test_db';

    // Import and start
    const app = require('../src/app');
    server = app.listen(0);  // Random port
  });

  afterAll(async () => {
    await server.close();
  });

  test('server starts without error', () => {
    expect(server.listening).toBe(true);
  });

  test('health endpoint responds', async () => {
    const response = await fetch(`http://localhost:${server.address().port}/health`);
    expect(response.status).toBe(200);
  });
});
```

### 2. Database Connection Tests

```javascript
describe('Database Connection', () => {
  test('can connect to database', async () => {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const result = await pool.query('SELECT NOW()');
    expect(result.rows).toHaveLength(1);

    await pool.end();
  });

  test('migrations are applied', async () => {
    const result = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
    `);

    expect(result.rows.map(r => r.table_name)).toContain('users');
    expect(result.rows.map(r => r.table_name)).toContain('orders');
  });
});
```

### 3. Inter-Service Communication Tests

```javascript
describe('Service Communication', () => {
  test('API can reach Auth service', async () => {
    const response = await fetch(`${process.env.AUTH_SERVICE_URL}/health`);
    expect(response.ok).toBe(true);
  });

  test('API can authenticate with Auth service', async () => {
    const response = await fetch(`${process.env.AUTH_SERVICE_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'test-token' })
    });

    // Even if invalid token, should get structured response
    expect(response.status).toBeLessThan(500);
  });

  test('Worker can connect to message queue', async () => {
    const amqp = require('amqplib');
    const conn = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await conn.createChannel();

    // Verify queue exists
    const queue = await channel.checkQueue('tasks');
    expect(queue).toBeDefined();

    await conn.close();
  });
});
```

---

## Critical Path Tests

### User Authentication Flow

```javascript
describe('Authentication Flow', () => {
  test('can register new user', async () => {
    const response = await api.post('/auth/register', {
      email: `test-$\{Date.now()\}@example.com`,
      password: 'SecurePassword123!'
    });

    expect(response.status).toBe(201);
    expect(response.data.token).toBeDefined();
  });

  test('can login existing user', async () => {
    const response = await api.post('/auth/login', {
      email: 'existing@example.com',
      password: 'KnownPassword123!'
    });

    expect(response.status).toBe(200);
    expect(response.data.token).toBeDefined();
  });

  test('can access protected route with token', async () => {
    const loginResponse = await api.post('/auth/login', {
      email: 'existing@example.com',
      password: 'KnownPassword123!'
    });

    const token = loginResponse.data.token;

    const response = await api.get('/api/me', {
      headers: { Authorization: `Bearer $\{token\}` }
    });

    expect(response.status).toBe(200);
    expect(response.data.email).toBe('existing@example.com');
  });
});
```

### E-commerce Order Flow

```javascript
describe('Order Flow', () => {
  let authToken;

  beforeAll(async () => {
    const login = await api.post('/auth/login', {
      email: 'test@example.com',
      password: 'password'
    });
    authToken = login.data.token;
  });

  test('can view products', async () => {
    const response = await api.get('/api/products');
    expect(response.status).toBe(200);
    expect(response.data.length).toBeGreaterThan(0);
  });

  test('can add to cart', async () => {
    const response = await api.post('/api/cart', {
      productId: 1,
      quantity: 2
    }, {
      headers: { Authorization: `Bearer $\{authToken\}` }
    });

    expect(response.status).toBe(200);
  });

  test('can checkout', async () => {
    const response = await api.post('/api/checkout', {
      paymentMethod: 'test',
      shippingAddress: {
        street: '123 Test St',
        city: 'Test City',
        zip: '12345'
      }
    }, {
      headers: { Authorization: `Bearer $\{authToken\}` }
    });

    expect(response.status).toBe(201);
    expect(response.data.orderId).toBeDefined();
  });
});
```

---

## External Service Tests

### Third-Party API Connectivity

```javascript
describe('External Services', () => {
  test('Stripe API is reachable', async () => {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    // Simple API call to verify credentials
    const balance = await stripe.balance.retrieve();
    expect(balance.object).toBe('balance');
  });

  test('SendGrid API is reachable', async () => {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Don't actually send, just verify client
    expect(sgMail).toBeDefined();
  });

  test('AWS S3 bucket is accessible', async () => {
    const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');
    const s3 = new S3Client({ region: process.env.AWS_REGION });

    const command = new HeadBucketCommand({ Bucket: process.env.S3_BUCKET });
    const response = await s3.send(command);

    expect(response.$metadata.httpStatusCode).toBe(200);
  });
});
```

---

## Smoke Test Checklist

```markdown
## Resurrection Smoke Tests

### Infrastructure
- [ ] All databases reachable
- [ ] All caches (Redis) reachable
- [ ] Message queues accessible
- [ ] S3/storage buckets accessible
- [ ] DNS resolves correctly

### Services
- [ ] API gateway starts
- [ ] Auth service starts
- [ ] Core service starts
- [ ] Background workers start
- [ ] All health endpoints respond

### Communication
- [ ] Frontend can reach API
- [ ] API can reach auth service
- [ ] API can reach core service
- [ ] Services can reach databases
- [ ] Workers can receive from queue

### Critical Paths
- [ ] User can register
- [ ] User can login
- [ ] User can view main page
- [ ] User can perform primary action
- [ ] Admin can access admin panel

### External
- [ ] Payment provider reachable
- [ ] Email service reachable
- [ ] CDN working
- [ ] OAuth providers working
```

---

## Docker Compose Test Environment

```yaml
version: '3.8'

services:
  test-db:
    image: postgres:14
    environment:
      POSTGRES_DB: test_db
      POSTGRES_USER: test
      POSTGRES_PASSWORD: test
    ports:
      - "5433:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U test"]
      interval: 5s
      timeout: 5s
      retries: 5

  test-redis:
    image: redis:7
    ports:
      - "6380:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  test-rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5673:5672"
      - "15673:15672"
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "check_running"]
      interval: 10s
      timeout: 5s
      retries: 5

  integration-tests:
    build:
      context: .
      dockerfile: Dockerfile.test
    depends_on:
      test-db:
        condition: service_healthy
      test-redis:
        condition: service_healthy
      test-rabbitmq:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://test:test@test-db:5432/test_db
      REDIS_URL: redis://test-redis:6379
      RABBITMQ_URL: amqp://guest:guest@test-rabbitmq:5672
    command: npm run test:integration
```

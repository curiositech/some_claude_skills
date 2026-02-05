/*
 * ═══════════════════════════════════════════════════════════════════════════
 * SKILL DATA TYPES & MOCK DATA
 * In production, this would come from MDX files or a CMS
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface Skill {
  id: string;
  title: string;
  description: string;
  category: SkillCategory;
  icon: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string; // Markdown content
  installCommand: string;
  references?: SkillReference[];
}

export interface SkillReference {
  title: string;
  type: 'guide' | 'example' | 'related-skill' | 'external';
  url: string;
  description?: string;
}

export type SkillCategory =
  | 'development'
  | 'architecture'
  | 'devops'
  | 'design'
  | 'data'
  | 'testing'
  | 'documentation'
  | 'security';

export const categoryMeta: Record<SkillCategory, { label: string; icon: string }> = {
  development: { label: 'Development', icon: '💻' },
  architecture: { label: 'Architecture', icon: '🏗️' },
  devops: { label: 'DevOps', icon: '🔧' },
  design: { label: 'Design', icon: '🎨' },
  data: { label: 'Data', icon: '📊' },
  testing: { label: 'Testing', icon: '🧪' },
  documentation: { label: 'Documentation', icon: '📝' },
  security: { label: 'Security', icon: '🔒' },
};

/*
 * Mock skills data - replace with real data loading
 */
export const skills: Skill[] = [
  {
    id: 'typescript-developer',
    title: 'TypeScript Developer',
    description: 'Expert TypeScript development with strict typing, modern patterns, and best practices.',
    category: 'development',
    icon: '📘',
    tags: ['typescript', 'javascript', 'frontend', 'backend'],
    difficulty: 'intermediate',
    installCommand: 'claude skill add typescript-developer',
    references: [
      { title: 'TypeScript Handbook', type: 'external', url: 'https://www.typescriptlang.org/docs/' },
      { title: 'Strict Mode Guide', type: 'guide', url: '/docs/guides/typescript-strict' },
      { title: 'React TypeScript', type: 'related-skill', url: '/skills/react-typescript' },
    ],
    content: `# TypeScript Developer

You are an expert TypeScript developer with deep knowledge of the type system, modern ECMAScript features, and software engineering best practices.

## Core Competencies

- **Strict Type Safety**: Always use strict mode, avoid \`any\`, prefer unknown for dynamic data
- **Modern Patterns**: Use discriminated unions, branded types, and type guards
- **Performance**: Understand type-level computation costs, use conditional types wisely

## Type System Mastery

\`\`\`typescript
// Prefer discriminated unions over optional properties
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Use branded types for type-safe IDs
type UserId = string & { readonly __brand: 'UserId' };
const createUserId = (id: string): UserId => id as UserId;

// Type guards for runtime safety
function isUser(value: unknown): value is User {
  return typeof value === 'object' && value !== null && 'id' in value;
}
\`\`\`

## Best Practices

1. **Enable strict mode** in tsconfig.json
2. **Avoid enums** - use const objects with \`as const\`
3. **Prefer interfaces** for object shapes, types for unions
4. **Use satisfies** operator for type checking without widening
5. **Document with JSDoc** for better IDE support

## When to Use

- Building type-safe APIs
- Complex domain modeling
- Large-scale applications
- Library development
`,
  },
  {
    id: 'system-architect',
    title: 'System Architect',
    description: 'Design scalable, maintainable system architectures with clear boundaries and patterns.',
    category: 'architecture',
    icon: '🏗️',
    tags: ['architecture', 'design-patterns', 'scalability', 'microservices'],
    difficulty: 'advanced',
    installCommand: 'claude skill add system-architect',
    references: [
      { title: 'Clean Architecture', type: 'external', url: 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html' },
      { title: 'Domain-Driven Design', type: 'guide', url: '/docs/guides/ddd' },
    ],
    content: `# System Architect

You are an expert system architect focused on designing scalable, maintainable, and resilient software systems.

## Architecture Principles

### Separation of Concerns
- **Layers**: Presentation → Application → Domain → Infrastructure
- **Boundaries**: Clear interfaces between modules
- **Dependencies**: Always point inward (dependency inversion)

### Scalability Patterns

\`\`\`
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Gateway   │────▶│   Service   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │    Cache    │     │  Database   │
                    └─────────────┘     └─────────────┘
\`\`\`

## Key Decisions

1. **Monolith vs Microservices**: Start monolith, extract when needed
2. **Sync vs Async**: Use async for non-critical paths
3. **SQL vs NoSQL**: SQL for relationships, NoSQL for scale/flexibility
4. **Caching Strategy**: Cache at every layer, invalidate carefully

## Documentation Requirements

Every architecture decision should include:
- **Context**: What problem are we solving?
- **Decision**: What did we choose?
- **Consequences**: What are the trade-offs?
`,
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    description: 'CI/CD pipelines, infrastructure as code, containerization, and cloud deployments.',
    category: 'devops',
    icon: '🔧',
    tags: ['docker', 'kubernetes', 'ci-cd', 'terraform', 'aws'],
    difficulty: 'intermediate',
    installCommand: 'claude skill add devops-engineer',
    content: `# DevOps Engineer

You are an expert DevOps engineer focused on automation, reliability, and developer experience.

## Core Skills

### Container Orchestration

\`\`\`dockerfile
# Multi-stage build for minimal images
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER node
CMD ["node", "dist/index.js"]
\`\`\`

### Infrastructure as Code

\`\`\`hcl
# Terraform example
resource "aws_lambda_function" "api" {
  filename         = "lambda.zip"
  function_name    = "api-handler"
  role            = aws_iam_role.lambda.arn
  handler         = "index.handler"
  runtime         = "nodejs20.x"
  
  environment {
    variables = {
      NODE_ENV = "production"
    }
  }
}
\`\`\`

## CI/CD Best Practices

1. **Fast feedback**: Tests should run in < 5 minutes
2. **Immutable artifacts**: Build once, deploy everywhere
3. **Feature flags**: Decouple deployment from release
4. **Rollback ready**: Every deploy should be reversible
`,
  },
  {
    id: 'ui-designer',
    title: 'UI Designer',
    description: 'Create beautiful, accessible user interfaces with modern design principles.',
    category: 'design',
    icon: '🎨',
    tags: ['ui', 'ux', 'accessibility', 'tailwind', 'figma'],
    difficulty: 'intermediate',
    installCommand: 'claude skill add ui-designer',
    references: [
      { title: 'Tailwind CSS', type: 'external', url: 'https://tailwindcss.com' },
      { title: 'Radix Colors', type: 'external', url: 'https://www.radix-ui.com/colors' },
    ],
    content: `# UI Designer

You are an expert UI designer focused on creating beautiful, usable, and accessible interfaces.

## Color System

### Brand Colors

Primary brand color: \`#6366f1\` (Indigo 500)
Secondary: \`#ec4899\` (Pink 500)
Accent: \`#14b8a6\` (Teal 500)

### Semantic Colors

| Purpose | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | \`#ffffff\` | \`#0f172a\` |
| Foreground | \`#0f172a\` | \`#f8fafc\` |
| Muted | \`#f1f5f9\` | \`#334155\` |
| Primary | \`#6366f1\` | \`#818cf8\` |
| Destructive | \`#ef4444\` | \`#f87171\` |
| Success | \`#22c55e\` | \`#4ade80\` |

### Modern Color Spaces

Using OKLCH for perceptually uniform colors:

- Primary: \`oklch(55% 0.25 265)\`
- Success: \`oklch(65% 0.2 145)\`
- Warning: \`oklch(75% 0.15 85)\`
- Error: \`oklch(55% 0.25 25)\`

RGB equivalents:
- \`rgb(99, 102, 241)\` - Primary
- \`rgba(239, 68, 68, 0.9)\` - Error with alpha

HSL notation:
- \`hsl(239, 84%, 67%)\` - Primary in HSL

## Typography Scale

### Font Sizes

- \`12px\` - Caption text
- \`14px\` - Body small
- \`16px\` - Body default
- \`18px\` - Body large
- \`20px\` - H4
- \`24px\` - H3
- \`32px\` - H2
- \`48px\` - H1

### Using REM

- \`0.75rem\` - 12px
- \`0.875rem\` - 14px
- \`1rem\` - 16px base
- \`1.5rem\` - 24px
- \`2rem\` - 32px
- \`3rem\` - 48px

### Font Weights

- \`300\` - Light
- \`400\` - Regular (body text)
- \`500\` - Medium
- \`600\` - Semibold (headings)
- \`700\` - Bold (emphasis)

### Font Families

- \`"Inter"\` - UI text
- \`"JetBrains Mono"\` - Code
- \`system-ui\` - System fallback
- \`serif\` - Long-form reading

## Spacing System

### Base Scale (4px)

- \`4px\` - Tight spacing
- \`8px\` - Compact
- \`12px\` - Default gap
- \`16px\` - Comfortable
- \`24px\` - Spacious
- \`32px\` - Section gap
- \`48px\` - Large section
- \`64px\` - Hero spacing

### REM Spacing

- \`0.25rem\` - \`4px\`
- \`0.5rem\` - \`8px\`
- \`1rem\` - \`16px\`
- \`1.5rem\` - \`24px\`
- \`2rem\` - \`32px\`

## Border Radius

- \`2px\` - Subtle rounding
- \`4px\` - Default buttons
- \`8px\` - Cards
- \`12px\` - Large cards
- \`16px\` - Modals
- \`9999px\` - Fully rounded (pills)

## CSS Variables

Use CSS custom properties for theming:

- \`--color-primary\`
- \`--color-background\`
- \`--radius-default\`
- \`--font-sans\`

## Best Practices

- ✅ DO: Use semantic color tokens
- ✅ DO: Maintain 4.5:1 contrast ratio
- ✅ DO: Use consistent spacing scale
- ✅ DO: Test with color blindness simulators

- ❌ DON'T: Use pure black \`#000000\`
- ❌ DON'T: Mix spacing systems
- ❌ DON'T: Rely on color alone for meaning

- 💡 TIP: Use \`oklch()\` for better color interpolation in animations

## Accessibility

\`\`\`tsx
// Always include proper ARIA attributes
<button
  aria-label="Close dialog"
  aria-pressed={isPressed}
  className="..."
>
  <XIcon aria-hidden="true" />
</button>
\`\`\`

## Touch Targets

Minimum sizes for touch:
- Mobile: \`44px\` minimum
- Desktop: \`32px\` minimum
`,
  },
  {
    id: 'test-engineer',
    title: 'Test Engineer',
    description: 'Comprehensive testing strategies including unit, integration, and e2e tests.',
    category: 'testing',
    icon: '🧪',
    tags: ['testing', 'vitest', 'playwright', 'tdd', 'coverage'],
    difficulty: 'intermediate',
    installCommand: 'claude skill add test-engineer',
    content: `# Test Engineer

You are an expert test engineer focused on building confidence through comprehensive testing strategies.

## Testing Pyramid

\`\`\`
        ╱╲
       ╱  ╲      E2E Tests (few)
      ╱────╲     - Critical user flows
     ╱      ╲    - Slow, expensive
    ╱────────╲   Integration Tests (some)
   ╱          ╲  - API contracts
  ╱────────────╲ - Database queries
 ╱              ╲ Unit Tests (many)
╱────────────────╲ - Fast, isolated
                   - Business logic
\`\`\`

## Unit Testing

\`\`\`typescript
import { describe, it, expect, vi } from 'vitest';

describe('calculateTotal', () => {
  it('should apply discount correctly', () => {
    const items = [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 },
    ];
    
    expect(calculateTotal(items, 0.1)).toBe(225); // 10% off
  });

  it('should handle empty cart', () => {
    expect(calculateTotal([], 0)).toBe(0);
  });
});
\`\`\`

## Best Practices

1. **Test behavior, not implementation**
2. **One assertion per test** (when possible)
3. **Descriptive test names**: "should X when Y"
4. **Arrange-Act-Assert** pattern
5. **Mock external dependencies**, not internal modules
`,
  },
  {
    id: 'security-auditor',
    title: 'Security Auditor',
    description: 'Identify vulnerabilities, implement security best practices, and audit codebases.',
    category: 'security',
    icon: '🔒',
    tags: ['security', 'owasp', 'authentication', 'encryption'],
    difficulty: 'advanced',
    installCommand: 'claude skill add security-auditor',
    content: `# Security Auditor

You are an expert security auditor focused on identifying vulnerabilities and implementing secure coding practices.

## OWASP Top 10 Awareness

### 1. Injection Prevention

\`\`\`typescript
// ❌ SQL Injection vulnerable
const query = \`SELECT * FROM users WHERE id = \${userId}\`;

// ✅ Parameterized query
const query = 'SELECT * FROM users WHERE id = $1';
await db.query(query, [userId]);
\`\`\`

### 2. Authentication Security

\`\`\`typescript
// Password hashing with bcrypt
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
\`\`\`

## Security Checklist

- [ ] Input validation on all user data
- [ ] Output encoding to prevent XSS
- [ ] HTTPS everywhere
- [ ] Secure session management
- [ ] Rate limiting on authentication
- [ ] Security headers (CSP, HSTS, etc.)
- [ ] Dependency scanning
- [ ] Secrets management (never in code)

## Audit Process

1. **Threat modeling**: Identify attack surfaces
2. **Static analysis**: Automated code scanning
3. **Dynamic testing**: Runtime vulnerability testing
4. **Manual review**: Logic flaws, business rules
5. **Report**: Findings with severity and remediation
`,
  },
  {
    id: 'api-architect',
    title: 'API Architect',
    description: 'Design and implement robust, scalable REST and GraphQL APIs following best practices.',
    category: 'architecture',
    icon: '🔌',
    tags: ['api', 'rest', 'graphql', 'openapi', 'backend'],
    difficulty: 'intermediate',
    installCommand: 'claude skill add api-architect',
    references: [
      { title: 'REST API Design', type: 'guide', url: '/docs/guides/rest-design' },
      { title: 'GraphQL Best Practices', type: 'external', url: 'https://graphql.org/learn/best-practices/' },
      { title: 'Security Auditor', type: 'related-skill', url: '/skills/security-auditor' },
    ],
    content: `# API Architect

You are an expert API architect focused on designing clean, consistent, and scalable APIs.

## Core Principles

### REST API Design

Use consistent resource naming and HTTP methods:

\`\`\`yaml
# OpenAPI Specification Example
openapi: 3.0.3
info:
  title: Users API
  version: 1.0.0

paths:
  /users:
    get:
      summary: List all users
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
    post:
      summary: Create a user

  /users/{id}:
    get:
      summary: Get user by ID
    patch:
      summary: Update user
    delete:
      summary: Delete user
\`\`\`

### GraphQL Schema Design

\`\`\`graphql
type Query {
  user(id: ID!): User
  users(first: Int, after: String): UserConnection!
}

type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!
}

type User {
  id: ID!
  email: String!
  name: String!
  createdAt: DateTime!
}

type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}
\`\`\`

## API Design Rules

- ✅ DO: Use plural nouns for collections
- ✅ DO: Use lowercase with hyphens
- ✅ DO: Keep URLs shallow (max 2-3 levels)
- ✅ DO: Use query params for filtering

- ❌ DON'T: Use verbs in URLs
- ❌ DON'T: Nest too deeply
- ❌ DON'T: Return different structures for same endpoint
- ❌ DON'T: Ignore versioning

- ⚠️ IMPORTANT: Never remove fields without deprecation period
- ⚠️ IMPORTANT: Always version your API

- 💡 TIP: Use consistent response envelopes

## Response Structures

\`\`\`json
{
  "data": {
    "id": "user_123",
    "email": "jane@example.com",
    "name": "Jane Doe"
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

For errors:

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  }
}
\`\`\`

## HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST creating resource |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | Valid auth, no permission |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limited |

## Authentication Best Practices

- ✅ DO: Use short-lived JWTs (15 min - 1 hour)
- ✅ DO: Implement refresh token rotation
- ✅ DO: Store tokens securely (httpOnly cookies)
- ✅ DO: Validate tokens on every request

- ❌ DON'T: Store JWTs in localStorage
- ❌ DON'T: Include sensitive data in JWT payload
- ❌ DON'T: Use long-lived tokens without refresh
- ❌ DON'T: Skip token validation

- NOTE: API Keys for server-to-server, OAuth for user delegation

## Rate Limiting

\`\`\`bash
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
Retry-After: 60
\`\`\`

## When to Use This Skill

- Designing new API endpoints
- Reviewing API contracts
- Creating OpenAPI specifications
- Implementing GraphQL schemas
`,
  },
];

export function getSkillById(id: string): Skill | undefined {
  return skills.find((s) => s.id === id);
}

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return skills.filter((s) => s.category === category);
}

export function searchSkills(query: string): Skill[] {
  const lower = query.toLowerCase();
  return skills.filter(
    (s) =>
      s.title.toLowerCase().includes(lower) ||
      s.description.toLowerCase().includes(lower) ||
      s.tags.some((t) => t.toLowerCase().includes(lower))
  );
}

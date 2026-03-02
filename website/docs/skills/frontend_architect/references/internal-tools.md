---
title: Internal Tools Architecture
sidebar_label: Internal Tools Architecture
sidebar_position: 2
---
# Internal Tools Architecture

Patterns for building private prototypes, admin dashboards, and internal-only features.

## Architecture Overview

```
internal.yourapp.com/
├── Cloudflare Access          # SSO authentication layer
│   └── Policy: Allow @company.com emails
│
├── app/
│   ├── (public)/              # No auth required
│   │   └── page.tsx           # Public landing (optional)
│   │
│   ├── (internal)/            # Auth required via middleware
│   │   ├── layout.tsx         # Internal layout with nav
│   │   ├── page.tsx           # Internal dashboard
│   │   ├── admin/             # Admin-only section
│   │   ├── beta/              # Beta feature previews
│   │   └── debug/             # Developer tools
│   │
│   └── api/
│       └── internal/          # Internal-only APIs
│           └── route.ts
│
└── middleware.ts              # Auth + feature flag routing
```

## Authentication Layer

### Cloudflare Access Setup

```yaml
# Configure in Cloudflare Dashboard > Access > Applications

Application Name: Internal Tools
Domain: internal.yourapp.com

Access Policy:
  Name: Allow Company Employees
  Action: Allow
  Include:
    - Emails ending in: @company.com

  Name: Allow Specific Contractors
  Action: Allow
  Include:
    - Email: contractor@external.com

Session Duration: 24 hours
```

### Middleware Integration

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface CloudflareAccessUser {
  email: string;
  name?: string;
  groups?: string[];
}

async function getAccessUser(request: NextRequest): Promise<CloudflareAccessUser | null> {
  const jwt = request.headers.get('CF-Access-JWT-Assertion');
  if (!jwt) return null;

  try {
    const response = await fetch(
      `https://${process.env.CF_ACCESS_TEAM}.cloudflareaccess.com/cdn-cgi/access/get-identity`,
      { headers: { 'CF-Access-JWT-Assertion': jwt } }
    );
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth for public routes
  if (pathname.startsWith('/(public)') || pathname === '/') {
    return NextResponse.next();
  }

  // Get authenticated user
  const user = await getAccessUser(request);
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Role-based access
  const routePermissions: Record<string, string[]> = {
    '/admin': ['admin'],
    '/beta': ['beta-tester', 'admin'],
    '/debug': ['developer', 'admin'],
  };

  for (const [route, requiredRoles] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      const hasPermission = requiredRoles.some(role =>
        user.groups?.includes(role)
      );
      if (!hasPermission) {
        return new Response('Forbidden', { status: 403 });
      }
    }
  }

  // Add user to request headers for downstream use
  const response = NextResponse.next();
  response.headers.set('X-User-Email', user.email);
  response.headers.set('X-User-Groups', user.groups?.join(',') || '');

  return response;
}

export const config = {
  matcher: ['/((?!_next|static|favicon.ico).*)'],
};
```

## Feature Flags

### Per-User Feature Flags

```typescript
// lib/feature-flags.ts
import { kv } from '@cloudflare/workers-kv';

export interface FeatureFlags {
  newDashboard: boolean;
  experimentalSearch: boolean;
  betaEditor: boolean;
}

const defaultFlags: FeatureFlags = {
  newDashboard: false,
  experimentalSearch: false,
  betaEditor: false,
};

export async function getFeatureFlags(
  email: string,
  env: { KV: KVNamespace }
): Promise<FeatureFlags> {
  // Check user-specific flags
  const userFlags = await env.KV.get(`flags:${email}`, 'json');
  if (userFlags) {
    return { ...defaultFlags, ...userFlags };
  }

  // Check global flags
  const globalFlags = await env.KV.get('flags:global', 'json');
  if (globalFlags) {
    return { ...defaultFlags, ...globalFlags };
  }

  return defaultFlags;
}

export async function setFeatureFlag(
  email: string,
  flag: keyof FeatureFlags,
  value: boolean,
  env: { KV: KVNamespace }
): Promise<void> {
  const existing = await env.KV.get(`flags:${email}`, 'json') || {};
  await env.KV.put(`flags:${email}`, JSON.stringify({
    ...existing,
    [flag]: value,
  }));
}
```

### Feature Flag Admin UI

```typescript
// app/(internal)/admin/flags/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function FeatureFlagsAdmin() {
  const [email, setEmail] = useState('');
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  async function loadFlags() {
    const res = await fetch(`/api/internal/flags?email=${email}`);
    const data = await res.json();
    setFlags(data);
  }

  async function toggleFlag(flag: string, value: boolean) {
    await fetch('/api/internal/flags', {
      method: 'POST',
      body: JSON.stringify({ email, flag, value }),
    });
    setFlags({ ...flags, [flag]: value });
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Input
              placeholder="user@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={loadFlags}>Load Flags</Button>
          </div>

          {Object.entries(flags).map(([flag, enabled]) => (
            <div key={flag} className="flex items-center justify-between">
              <span className="font-mono">{flag}</span>
              <Switch
                checked={enabled}
                onCheckedChange={(value) => toggleFlag(flag, value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

## Beta Feature Previews

### Version Comparison Component

```typescript
// app/(internal)/beta/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BetaPreview() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Beta Feature Previews</h1>

      <Tabs defaultValue="comparison">
        <TabsList>
          <TabsTrigger value="comparison">Side by Side</TabsTrigger>
          <TabsTrigger value="current">Current Version</TabsTrigger>
          <TabsTrigger value="beta">Beta Version</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Current</CardTitle>
              </CardHeader>
              <CardContent>
                <iframe
                  src="/embed/dashboard?version=current"
                  className="w-full h-[600px] border rounded"
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Beta</CardTitle>
              </CardHeader>
              <CardContent>
                <iframe
                  src="/embed/dashboard?version=beta"
                  className="w-full h-[600px] border rounded"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Debug Tools

### Request Inspector

```typescript
// app/(internal)/debug/requests/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface RequestLog {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration: number;
}

export default function RequestInspector() {
  const [logs, setLogs] = useState<RequestLog[]>([]);

  useEffect(() => {
    // Real implementation would use SSE or WebSocket
    const eventSource = new EventSource('/api/internal/debug/requests');
    eventSource.onmessage = (event) => {
      const log = JSON.parse(event.data);
      setLogs((prev) => [log, ...prev].slice(0, 100));
    };
    return () => eventSource.close();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Request Log</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Path</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </TableCell>
                <TableCell>{log.method}</TableCell>
                <TableCell className="font-mono text-sm">{log.path}</TableCell>
                <TableCell>
                  <span className={log.status >= 400 ? 'text-red-500' : 'text-green-500'}>
                    {log.status}
                  </span>
                </TableCell>
                <TableCell>{log.duration}ms</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
```

### Environment Info

```typescript
// app/(internal)/debug/env/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EnvironmentInfo() {
  const env = {
    branch: process.env.CF_PAGES_BRANCH,
    commit: process.env.CF_PAGES_COMMIT_SHA?.slice(0, 7),
    nodeVersion: process.version,
    nextVersion: require('next/package.json').version,
    buildTime: process.env.BUILD_TIME,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Environment</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-2">
          {Object.entries(env).map(([key, value]) => (
            <>
              <dt className="font-medium">{key}</dt>
              <dd className="font-mono text-muted-foreground">{value || 'N/A'}</dd>
            </>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}
```

## Deployment Workflow

### Separate Deployment for Internal Tools

```yaml
# .github/workflows/deploy-internal.yml
name: Deploy Internal Tools

on:
  push:
    branches: [main, develop]
    paths:
      - 'apps/internal/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install & Build
        run: |
          npm ci
          npm run build:internal

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: internal-tools
          directory: apps/internal/.next
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### Preview Deployments for Internal Review

```bash
# Every branch gets a preview
# https://preview-feature-xyz.internal-tools.pages.dev

# Protected by Cloudflare Access - same auth as production
# Great for reviewing internal tool changes before merge
```

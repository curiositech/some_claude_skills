# TODO - Some Claude Skills

> Active tasks and next steps. Updated: 2026-01-14

---

## 🔥 High Priority

### DAG Framework - Wire to Production

The DAG execution engine is complete but the UI is using simulated execution.

- [ ] **Wire DAGBuilder UI to actual runtime execution**
  - Connect "Execute" button to `ClaudeCodeRuntime.execute()`
  - Show real Task tool spawning in monitor
  - File: `src/pages/dag/builder.tsx`

- [ ] **Add DAG persistence**
  - LocalStorage for browser session
  - Export/import JSON/YAML (partially done)
  - File: `src/pages/dag/builder.tsx`

- [ ] **Fix broken links on /dag page**
  - `/docs/dag/orchestration` → create doc or remove link
  - `/docs/dag/registry` → create doc or remove link
  - `/docs/dag/quality` → create doc or remove link
  - `/docs/dag/observability` → create doc or remove link

### Build & Validation

- [ ] **Auto-escape MDX script** ✅ DONE
  - `npm run fix:mdx` - auto-fixes angle bracket issues
  - `npm run check:mdx` - dry run check
  - File: `scripts/auto-escape-mdx.js`

- [ ] **Fix duplicate route warnings**
  - fullstack_debugger, mobile_ux_optimizer, pwa_expert, etc.
  - Investigate why both `/docs/skills/X` and `/docs/skills/X/` exist

---

## 📋 Medium Priority

### DAG Framework Enhancements

- [ ] **HTTP API Runtime implementation**
  - Express/Fastify server scaffold exists
  - Need actual endpoint implementations
  - Files: `src/dag/runtimes/http-api.ts`

- [ ] **Semantic skill matcher with embeddings**
  - Currently uses static skill list
  - Add vector similarity search
  - Files: `src/dag/registry/semantic-matcher.ts`

- [ ] **Pattern learner implementation**
  - SKILL.md complete, needs actual ML
  - Track execution history, optimize routing
  - Files: `src/dag/observability/pattern-learner.ts`

### Website UX

- [ ] **Onboarding modal for first-time visitors**
  - See ROADMAP.md Phase 1
  - `Win31Modal` base component needed

- [ ] **Tutorial system with progress tracking**
  - See ROADMAP.md Phase 2
  - `useTutorialProgress` hook

- [ ] **Skill bundles page**
  - See ROADMAP.md Phase 3
  - YAML schema + generator

---

## 🔧 Low Priority / Backlog

### DAG Framework

- [ ] Drag-and-drop node positioning in builder
- [ ] Visual edge drawing (click to connect nodes)
- [ ] DAG templates library
- [ ] Cross-session context with Redis/DB
- [ ] WebSocket real-time execution updates
- [ ] Cost estimation before execution

### Website

- [ ] Video walkthroughs (Phase 4)
- [ ] Fix marquee readability
- [ ] Skill ratings and reviews
- [ ] User accounts with progress sync
- [ ] Community skill submissions workflow
- [ ] CLI tool: `npx some-claude-skills install <bundle>`

### Technical Debt

- [ ] Update baseline-browser-mapping (2+ months old)
- [ ] Remove duplicate skill route generation
- [ ] Add more test coverage for DAG components
- [ ] TypeScript strict mode improvements

---

## ✅ Recently Completed

### 2026-01-14
- [x] DAG Framework core implementation (32K+ lines)
- [x] All 23 DAG meta-skills (SKILL.md files)
- [x] DAG visualization components (DAGGraph, DAGNode, DAGBuilder, ExecutionMonitor)
- [x] DAG pages (/dag, /dag/builder, /dag/monitor)
- [x] Permission system with presets
- [x] Three runtime scaffolds (CLI, SDK, HTTP)
- [x] Topological sort with wave-based parallelism
- [x] Auto-escape MDX script (`npm run fix:mdx`)
- [x] Fixed skill validation (128 skills passing)
- [x] Build passing with all DAG skills

### 2026-01-13
- [x] dag-failure-analyzer skill
- [x] dag-pattern-learner skill
- [x] Added "DAG Framework" category to types.ts
- [x] Cleaned up duplicate dag-framework directory

---

## 📊 Stats

| Metric | Value |
|--------|-------|
| Total skills | 128 |
| DAG skills | 23 |
| DAG TypeScript LOC | ~32,000 |
| DAG Test LOC | ~103,000 |
| Build status | ✅ Passing |

---

## Quick Commands

```bash
# Development
npm run start              # Dev server at localhost:3000
npm run build              # Production build

# DAG Demo
npx tsx src/dag/demos/run-demo.ts

# Fix common issues
npm run fix:mdx            # Auto-escape MDX angle brackets
npm run skills:generate    # Regenerate skills registry

# Testing
npm test                   # Run Vitest
```

---

*See also: [ROADMAP.md](./ROADMAP.md) | [BUGS.md](./BUGS.md) | [PROGRESS.md](./PROGRESS.md)*

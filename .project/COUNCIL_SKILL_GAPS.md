# Council of Experts: Missing Skills Analysis

**Date**: January 14, 2026
**Mission**: Identify commonsense development skills missing from the library for applications across all projects in ~/coding

**Agents Consulted**:
- Backend Architect (a68a54c)
- Frontend Developer (a9556d7)
- AI Engineer (a491165)
- Deployment Engineer (a680155)
- Mobile Developer (a75aa01)
- Data Engineer (ae9da96)

---

## Executive Summary

The council identified **87 missing skills** across 6 domains. These skills fill critical gaps between high-level architectural skills and day-to-day implementation needs.

### Skills by Category

| Category | Skills | Priority High | Priority Medium | Priority Low |
|----------|--------|---------------|-----------------|--------------|
| Backend/API | 15 | 5 | 6 | 4 |
| Frontend/UI | 15 | 5 | 5 | 5 |
| AI/ML | 15 | 5 | 5 | 5 |
| DevOps | 15 | 8 | 5 | 2 |
| Mobile | 15 | 7 | 5 | 3 |
| Data Engineering | 12 | 4 | 6 | 2 |
| **TOTAL** | **87** | **34** | **32** | **21** |

---

## Top 20 Universal Priority Skills

These skills are most commonly needed across all projects in ~/coding:

### Immediate Need (Weeks 1-4)

1. **Background Job Orchestrator** (Backend)
   - Every app needs async processing (emails, exports, reports)
   - Used in: coach-for-a-better-me, receiprocate, wedding projects

2. **Form Validation Architect** (Frontend)
   - Forms everywhere: expungement-guide, receiprocate, all apps
   - No current skill covers react-hook-form + Zod patterns

3. **LLM Streaming Response Handler** (AI)
   - Real-time chat UX critical for AI apps
   - Used in: compositional_collider, any LLM integration

4. **GitHub Actions Pipeline Builder** (DevOps)
   - 30+ .github/workflows across projects need standardization
   - Universal need for CI/CD

5. **React Performance Optimizer** (Frontend)
   - Large component trees in Astonish, jbuds4life, wedding apps
   - No current skill addresses useMemo/useCallback patterns

### High Impact (Weeks 5-8)

6. **File Upload & Storage Expert** (Backend)
   - Profile photos, documents, media in every user-facing app
   - wedding-photos, coach-for-a-better-me need this

7. **Docker Multi-Stage Optimizer** (DevOps)
   - Basic Dockerfiles found, none following 2026 best practices
   - Security + size optimization needed

8. **RAG Document Ingestion Pipeline** (AI)
   - Knowledge base apps need robust ingestion
   - Compositional_collider, wedding-photos use embeddings

9. **WebSocket & Real-Time Communication Expert** (Backend)
   - Chat, live updates, collaborative features increasingly expected
   - Needed for any real-time dashboard

10. **Image Optimization Engineer** (Frontend)
    - Photo-heavy apps (wedding-photos, jbuds4life) lack optimization
    - Next.js Image component expertise needed

11. **React Native Architect** (Mobile)
    - Most popular cross-platform framework
    - Navigation, state, performance patterns missing

12. **dbt Analytics Engineer** (Data)
    - Modern data stack default for transformations
    - Any analytics/reporting features need this

13. **API Rate Limiting & Throttling Expert** (Backend)
    - API security and resource protection
    - Every public API needs this

14. **Kubernetes Manifest Generator** (DevOps)
    - Only telegram_mod_bot has K8s configs
    - Production deployment standard

15. **Multimodal Embedding Generator** (AI)
    - Cross-modal search (image-to-text, audio-to-text)
    - Wedding-photos, compositional_collider need this

16. **React Server Components Expert** (Frontend)
    - Next.js 13+ App Router standard
    - Astonish, jbuds4life use modern Next.js

17. **Expo Workflow Expert** (Mobile)
    - Simplifies React Native dramatically
    - EAS Build/Update patterns needed

18. **Apache Airflow Orchestrator** (Data)
    - Industry standard for pipeline orchestration
    - Complex ETL workflows need this

19. **Database Migration Manager** (DevOps)
    - Multiple projects use Drizzle/Prisma
    - No skill for safe migration practices

20. **LLM Response Caching Layer** (AI)
    - Reduces API costs by 40-60%
    - Every LLM integration benefits

---

## Complete Skill Inventory

### Backend/API (15 Skills)

1. **event-driven-architecture-expert** - Message queues, pub/sub, event sourcing
2. **background-job-orchestrator** - Bull/BullMQ, Celery, job queues, retries
3. **cqrs-event-sourcing-architect** - CQRS pattern, event stores, projections
4. **api-gateway-reverse-proxy-expert** - Kong, Nginx, routing, auth
5. **database-connection-pool-manager** - PgBouncer, connection optimization
6. **file-upload-storage-expert** - S3, multipart uploads, CDN integration
7. **websocket-realtime-expert** - WebSockets, SSE, real-time communication
8. **api-versioning-backward-compatibility** - Migration strategies, deprecation
9. **distributed-transaction-manager** - Saga patterns, compensating actions
10. **api-rate-limiting-throttling-expert** - Token bucket, Redis-based limits
11. **multi-tenant-architecture-expert** - Tenant isolation, RLS, shared schema
12. **graphql-server-architect** - DataLoader, subscriptions, federation
13. **observability-apm-expert** - OpenTelemetry, distributed tracing, APM
14. **cache-strategy-invalidation-expert** - Redis patterns, cache-aside, TTL
15. **service-mesh-microservices-expert** - Istio, circuit breakers, service discovery

**Top 5 Priority**: Background Job, File Upload, WebSocket, Cache Strategy, API Rate Limiting

---

### Frontend/UI (15 Skills)

1. **react-server-components-expert** - App Router, RSC, Server Actions, streaming
2. **form-validation-architect** - react-hook-form, Zod, multi-step wizards
3. **state-machine-designer** - XState, Zustand, finite state machines
4. **animation-system-architect** - Framer Motion, gestures, micro-interactions
5. **react-performance-optimizer** - useMemo, useCallback, bundle optimization
6. **virtualization-specialist** - react-window, infinite scroll, large lists
7. **css-in-js-architect** - Tailwind v4, design tokens, dynamic theming
8. **image-optimization-engineer** - Next.js Image, responsive images, AVIF/WebP
9. **accessibility-automation-expert** - WCAG 2.2, keyboard nav, screen readers
10. **error-boundary-strategist** - React Error Boundaries, Sentry, recovery
11. **progressive-enhancement-expert** - Service workers, offline-first, PWA
12. **responsive-layout-master** - CSS Grid, container queries, fluid typography
13. **react-hook-composer** - Custom hooks, composable patterns, testing
14. **component-testing-architect** - Vitest + RTL, user-centric tests
15. **data-fetching-strategist** - React Query, SWR, optimistic updates

**Top 5 Priority**: Form Validation, React Performance, Image Optimization, CSS-in-JS, React Server Components

---

### AI/ML (15 Skills)

1. **rag-document-ingestion-pipeline** - Chunking, embeddings, vector DB ingestion
2. **llm-streaming-response-handler** - SSE, WebSockets, partial JSON parsing
3. **vector-database-migration-tool** - Migrate between Pinecone/Qdrant/Weaviate
4. **multimodal-embedding-generator** - CLIP, ImageBind, cross-modal search
5. **llm-response-caching-layer** - Semantic caching, cost reduction
6. **fine-tuning-dataset-curator** - Data prep, quality filtering, augmentation
7. **prompt-template-manager** - Version control, A/B testing, Git workflow
8. **llm-evaluation-harness** - Automated testing, benchmarks, regression tests
9. **audio-transcription-pipeline** - Whisper, Deepgram, speaker diarization
10. **image-generation-workflow-engine** - Stable Diffusion, ControlNet, LoRA
11. **model-serving-api-builder** - PyTorch/ONNX serving, batching, autoscaling
12. **llm-cost-optimizer** - Token tracking, model selection, budget alerts
13. **video-frame-extraction-analysis** - Keyframe extraction, temporal search
14. **face-recognition-system-builder** - InsightFace, enrollment, clustering
15. **synthetic-data-generator** - LLM/GAN data generation, augmentation

**Top 5 Priority**: RAG Ingestion, LLM Streaming, LLM Caching, Multimodal Embedding, Face Recognition

---

### DevOps/Deployment (15 Skills)

1. **github-actions-pipeline-builder** - Complete workflows, matrix builds, caching
2. **docker-multi-stage-optimizer** - Security, size optimization, multi-stage
3. **kubernetes-manifest-generator** - K8s configs, HPA, PDB, Ingress
4. **terraform-module-builder** - Reusable IaC modules, AWS/GCP/Azure
5. **database-migration-manager** - Safe migrations, rollback, zero-downtime
6. **secret-management-expert** - Vault, AWS Secrets, rotation, least-privilege
7. **monitoring-stack-deployer** - Prometheus + Grafana, ELK, distributed tracing
8. **log-aggregation-architect** - Centralized logging, structured logs, retention
9. **environment-config-manager** - ConfigMaps, Secrets, feature flags
10. **blue-green-deployment-orchestrator** - Canary, rolling deployments, rollback
11. **aws-cdk-builder** - TypeScript IaC, Well-Architected Framework
12. **cloudflare-pages-cicd** - Preview environments, custom domains, edge
13. **railway-render-deployment** - Indie-friendly platforms, autoscaling
14. **ci-cache-optimizer** - Dependency caching, Docker layer caching
15. **health-check-probe-designer** - K8s probes, graceful shutdown, endpoints

**Top 5 Priority**: GitHub Actions, Docker Optimizer, Kubernetes, Database Migration, Secret Management

---

### Mobile (15 Skills)

1. **react-native-architect** - Navigation, state, performance, New Architecture
2. **expo-workflow-expert** - EAS Build/Submit/Update, config plugins
3. **mobile-offline-sync-architect** - SQLite, WatermelonDB, conflict resolution
4. **mobile-push-notification-expert** - FCM, APNs, deep linking, permissions
5. **mobile-deep-linking-specialist** - Universal links, app links, attribution
6. **swiftui-data-flow-expert** - State management, Combine, Observation
7. **ios-core-data-architect** - Migrations, CloudKit sync, optimization
8. **jetpack-compose-navigation-expert** - Compose Navigation, Hilt, MVVM/MVI
9. **android-background-task-specialist** - WorkManager, Foreground Services, Doze
10. **mobile-biometric-auth-expert** - Face ID, Touch ID, BiometricPrompt
11. **mobile-payment-integration-specialist** - Stripe, Apple Pay, Google Pay, IAP
12. **mobile-analytics-crash-reporting-expert** - Firebase Analytics, Sentry, Mixpanel
13. **app-store-submission-automator** - Fastlane, screenshots, metadata, TestFlight
14. **flutter-bloc-state-manager** - BLoC/Cubit, Riverpod, Provider, GetX
15. **mobile-accessibility-compliance-expert** - VoiceOver, TalkBack, Dynamic Type

**Top 5 Priority**: React Native Architect, Expo Workflow, Offline Sync, Push Notifications, Deep Linking

---

### Data Engineering (12 Skills)

1. **dbt-analytics-engineer** - Data transformations, testing, documentation
2. **airflow-dag-orchestrator** - Complex workflows, SLA monitoring, custom operators
3. **streaming-pipeline-architect** - Kafka, Flink, Spark Streaming, CDC
4. **data-warehouse-optimizer** - Snowflake, BigQuery, clustering, partitioning
5. **data-quality-guardian** - Great Expectations, dbt tests, anomaly detection
6. **schema-evolution-manager** - Avro, Protobuf, backward compatibility
7. **lakehouse-architect** - Delta Lake, Iceberg, ACID on object storage
8. **data-lineage-tracker** - OpenLineage, DataHub, impact analysis
9. **batch-processing-optimizer** - Spark, pandas, polars, DuckDB optimization
10. **dimensional-modeler** - Star schema, SCD, Kimball methodology
11. **data-migration-specialist** - Large-scale migrations, validation, rollback
12. **data-cost-optimizer** - Warehouse cost reduction, partitioning, lifecycle

**Top 5 Priority**: dbt Analytics, Airflow Orchestrator, Data Quality, Warehouse Optimizer, Streaming Pipeline

---

## Skill Bundles for Common Workflows

### Bundle 1: "Full-Stack Web App Essentials"
**For**: Astonish, jbuds4life, receiprocate, expungement-guide

**Skills**:
- Form Validation Architect (Frontend)
- React Performance Optimizer (Frontend)
- Background Job Orchestrator (Backend)
- File Upload & Storage Expert (Backend)
- Database Migration Manager (DevOps)
- GitHub Actions Pipeline Builder (DevOps)

**One-click install command**:
```bash
claude-code install-bundle web-app-essentials
```

---

### Bundle 2: "AI-Powered Application Stack"
**For**: compositional_collider, wedding-photos, any LLM app

**Skills**:
- RAG Document Ingestion Pipeline (AI)
- LLM Streaming Response Handler (AI)
- LLM Response Caching Layer (AI)
- Multimodal Embedding Generator (AI)
- Vector Database Migration Tool (AI)
- LLM Cost Optimizer (AI)

**One-click install command**:
```bash
claude-code install-bundle ai-app-stack
```

---

### Bundle 3: "Photo/Media App Platform"
**For**: wedding-photos, our-wedding-photos, any photo app

**Skills**:
- Image Optimization Engineer (Frontend)
- File Upload & Storage Expert (Backend)
- Face Recognition System Builder (AI)
- Multimodal Embedding Generator (AI)
- Video Frame Extraction Analysis (AI)
- Virtualization Specialist (Frontend)

**One-click install command**:
```bash
claude-code install-bundle photo-media-platform
```

---

### Bundle 4: "Mobile App Development Kit"
**For**: Any React Native or native mobile project

**Skills**:
- React Native Architect (Mobile)
- Expo Workflow Expert (Mobile)
- Mobile Offline Sync Architect (Mobile)
- Mobile Push Notification Expert (Mobile)
- Mobile Deep Linking Specialist (Mobile)
- App Store Submission Automator (Mobile)

**One-click install command**:
```bash
claude-code install-bundle mobile-dev-kit
```

---

### Bundle 5: "Production-Ready DevOps"
**For**: Every production application

**Skills**:
- GitHub Actions Pipeline Builder (DevOps)
- Docker Multi-Stage Optimizer (DevOps)
- Kubernetes Manifest Generator (DevOps)
- Monitoring Stack Deployer (DevOps)
- Secret Management Expert (DevOps)
- Blue-Green Deployment Orchestrator (DevOps)

**One-click install command**:
```bash
claude-code install-bundle production-devops
```

---

### Bundle 6: "Modern Data Platform"
**For**: Analytics, reporting, data-driven apps

**Skills**:
- dbt Analytics Engineer (Data)
- Apache Airflow Orchestrator (Data)
- Data Quality Guardian (Data)
- Data Warehouse Optimizer (Data)
- Data Lineage Tracker (Data)
- Data Cost Optimizer (Data)

**One-click install command**:
```bash
claude-code install-bundle data-platform
```

---

## Project-Specific Recommendations

### coach-for-a-better-me
**Current**: Supabase, Next.js, React, push notifications

**Recommended Skills** (Priority Order):
1. Background Job Orchestrator - Email campaigns, report generation
2. Form Validation Architect - Complex habit tracking forms
3. Mobile Push Notification Expert - iOS/Android push setup
4. React Performance Optimizer - Dashboard with many metrics
5. Data Quality Guardian - Ensure habit tracking data integrity
6. API Rate Limiting Expert - Prevent API abuse

---

### wedding-photos (face recognition, clustering)
**Current**: InsightFace, HDBSCAN, FAISS, OpenCV

**Recommended Skills** (Priority Order):
1. Face Recognition System Builder - Package existing work into reusable skill
2. Multimodal Embedding Generator - Cross-modal search (face + description)
3. Image Optimization Engineer - Gallery performance
4. Virtualization Specialist - 10,000+ photo grid
5. File Upload & Storage Expert - Photo uploads with CDN
6. Video Frame Extraction Analysis - Extract faces from videos

---

### compositional_collider
**Current**: CLIP, embeddings, collage generation

**Recommended Skills** (Priority Order):
1. Multimodal Embedding Generator - Better CLIP integration
2. Image Generation Workflow Engine - Stable Diffusion collages
3. RAG Document Ingestion Pipeline - Index collage metadata
4. LLM Streaming Response Handler - Real-time collage suggestions
5. Image Optimization Engineer - Collage rendering performance

---

### Astonish (wedding website)
**Current**: Next.js App Router, Framer Motion, Tailwind

**Recommended Skills** (Priority Order):
1. React Server Components Expert - App Router optimization
2. Animation System Architect - Complex Framer Motion patterns
3. Form Validation Architect - RSVP and contact forms
4. Image Optimization Engineer - Wedding photo galleries
5. React Performance Optimizer - Rich animations + large content
6. Progressive Enhancement Expert - Offline RSVP viewing

---

### jbuds4life (pixel art portfolio)
**Current**: Next.js, Tailwind, pixel art aesthetic

**Recommended Skills** (Priority Order):
1. Image Optimization Engineer - Pixel art gallery
2. CSS-in-JS Architect - Advanced Tailwind patterns
3. React Performance Optimizer - Gallery performance
4. Progressive Enhancement Expert - Offline portfolio viewing
5. Responsive Layout Master - Pixel-perfect responsive design

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
**Goal**: Most universally needed skills across all projects

**Implement**:
1. Background Job Orchestrator
2. Form Validation Architect
3. React Performance Optimizer
4. GitHub Actions Pipeline Builder
5. Image Optimization Engineer

**Deliverable**: Bundle 1 (Web App Essentials) fully functional

---

### Phase 2: AI & Media (Weeks 5-8)
**Goal**: Support AI and photo-heavy applications

**Implement**:
1. RAG Document Ingestion Pipeline
2. LLM Streaming Response Handler
3. LLM Response Caching Layer
4. Multimodal Embedding Generator
5. Face Recognition System Builder
6. File Upload & Storage Expert

**Deliverable**: Bundle 2 (AI App Stack) + Bundle 3 (Photo/Media Platform) complete

---

### Phase 3: Production Infrastructure (Weeks 9-12)
**Goal**: DevOps and deployment automation

**Implement**:
1. Docker Multi-Stage Optimizer
2. Kubernetes Manifest Generator
3. Database Migration Manager
4. Secret Management Expert
5. Monitoring Stack Deployer
6. Blue-Green Deployment Orchestrator

**Deliverable**: Bundle 5 (Production-Ready DevOps) operational

---

### Phase 4: Mobile & Specialized (Weeks 13-16)
**Goal**: Mobile development and specialized domains

**Implement**:
1. React Native Architect
2. Expo Workflow Expert
3. Mobile Offline Sync Architect
4. dbt Analytics Engineer
5. Apache Airflow Orchestrator
6. Data Quality Guardian

**Deliverable**: Bundle 4 (Mobile Dev Kit) + Bundle 6 (Data Platform) ready

---

### Phase 5: Advanced & Nice-to-Have (Weeks 17-20)
**Goal**: Complete the library with advanced skills

**Implement remaining 67 skills** in priority order based on:
- User demand via analytics
- GitHub issue requests
- Project-specific needs

---

## Success Metrics

### Adoption Tracking
- **Bundle installs**: Track which bundles are most popular
- **Skill usage**: Analytics on individual skill invocations
- **Project coverage**: % of ~/coding projects using each skill

### Quality Metrics
- **Skill completion rate**: Users complete skill-assisted tasks
- **Error rate**: Skills produce working code (not broken implementations)
- **Iteration count**: How many tries to get working solution

### Business Metrics
- **Time saved**: Estimate developer hours saved per skill
- **Cost reduction**: LLM cost optimization from caching skills
- **Production deployments**: Skills that make it to production

---

## Next Steps

1. **User Validation**: Review this analysis and prioritize based on actual needs
2. **Skill Creation**: Start with Phase 1 (Weeks 1-4) foundation skills
3. **Bundle Testing**: Validate bundle combinations work together
4. **Documentation**: Create tutorial-first content for each skill
5. **Analytics Setup**: Track skill usage and bundle adoption
6. **Feedback Loop**: Iterate based on real-world usage

---

## Appendix: Agent Transcripts

Full agent outputs available at:
- Backend Architect: agentId a68a54c
- Frontend Developer: agentId a9556d7
- AI Engineer: agentId a491165
- Deployment Engineer: agentId a680155
- Mobile Developer: agentId a75aa01
- Data Engineer: agentId ae9da96

Each agent provided detailed use cases, examples, and rationale for their recommendations.

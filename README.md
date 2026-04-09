# Claude Skills Collection

**190+ production-ready skills** and **2 MCP servers** for [Claude Code](https://docs.anthropic.com/en/docs/claude-code).

Built by [Erich Owens](https://www.erichowens.com) — Ex-Meta ML Engineer (12 years), 12 patents, MS Applied Math.

🌐 **[someclaudeskills.com](https://someclaudeskills.com)** — Browse the full gallery, search by category, and download ZIP files.

---

## Quick Start

### Option 1: Manual Installation (Recommended)

```bash
git clone https://github.com/curiositech/some_claude_skills.git
cp -r some_claude_skills/.claude/skills/* ~/.claude/skills/
```

### Option 2: Download Individual Skills

**[someclaudeskills.com/skills](https://someclaudeskills.com/skills)** — Browse, search, and download individual ZIP files.

### Option 3: Plugin Marketplace

```bash
# Add the marketplace
/plugin marketplace add curiositech/some_claude_skills

# Install any skill
/plugin install adhd-design-expert@some-claude-skills

# Or install the full collection
/plugin install some-claude-skills@some-claude-skills
```

---

## MCP Servers

Add to `~/.claude/settings.json` or your project's `.mcp.json`:

### prompt-learning-mcp

Your prompts get smarter every time you use Claude. Automatic optimization using APE, OPRO, and DSPy patterns.

```json
{
  "mcpServers": {
    "prompt-learning": {
      "command": "npx",
      "args": ["-y", "github:curiositech/prompt-learning-mcp"],
      "env": {
        "OPENAI_API_KEY": "your-openai-api-key"
      }
    }
  }
}
```

**Tools:** `optimize_prompt` · `record_feedback` · `retrieve_prompts` · `suggest_improvements` · `get_analytics`

**Requirements:** Docker (Qdrant + Redis), Node.js 18+, OpenAI API key

### cv-creator-mcp

Resume SEO powered by AI. ATS scoring, keyword optimization, job matching.

```json
{
  "mcpServers": {
    "cv-creator": {
      "command": "npx",
      "args": ["-y", "github:curiositech/cv-creator-mcp"]
    }
  }
}
```

**Tools:** `analyze_job` · `score_match` · `score_ats` · `suggest_tailoring` · `generate_variants` · `generate_cover_letter`

**Requirements:** Node.js 18+

---

## What Are Claude Skills?

Skills are modular prompt extensions that teach Claude domain expertise. Instead of telling Claude what to do, skills teach Claude:

| Aspect | What Skills Provide |
|--------|---------------------|
| **How experts think** | Decision frameworks, mental models |
| **What experts know** | Domain knowledge, best practices |
| **How experts work** | Proven methodologies, workflows |
| **Why experts choose** | Reasoning behind decisions |

Read the full guide: **[How to Write Great Claude Skills](https://someclaudeskills.com/docs/guides/claude-skills-guide)**

---

## Skills by Category

190+ skills across 10 domains. Representative examples below — see **[someclaudeskills.com/skills](https://someclaudeskills.com/skills)** for the full gallery.

### 🎨 Design & Creative (~35 skills)

| Skill | Description |
|-------|-------------|
| `web-design-expert` | Brand identity, color theory, UI/UX |
| `native-app-designer` | iOS/Mac/web apps with organic, non-AI aesthetic |
| `design-system-creator` | Design tokens, CSS architecture, component libraries |
| `typography-expert` | Font pairing, hierarchy, OpenType features |
| `vaporwave-glassomorphic-ui-designer` | Retro-futuristic UI with glassmorphism |
| `windows-3-1-web-designer` | Windows 3.1 aesthetic (powers this site!) |
| `neobrutalist-web-designer` | Bold raw neobrutalist web design |
| `dark-mode-design-expert` | Perceptually accurate dark mode systems |
| `interior-design-expert` | Space planning, color theory, lighting |
| `pixel-art-infographic-creator` | Pixel art charts, infographics, iconography |
| `hand-drawn-infographic-creator` | Pen-and-ink illustrated data visuals |
| `2000s-visualization-expert` | Milkdrop, AVS, WebGL music visualizers |
| `vibe-matcher` | Translate emotional vibes to visual DNA |
| `design-archivist` | Build visual databases from 500–1000 examples |
| `color-contrast-auditor` | WCAG 2.1 contrast auditing and remediation |
| `design-trend-analyzer` | Emerging design trends and cultural signals |
| `fancy-yard-landscaper` | Landscape design, planting plans, hardscape |
| `maximalist-wall-decorator` | Gallery walls, art curation, room transforms |

### 💻 Software Engineering & Architecture (~45 skills)

| Skill | Description |
|-------|-------------|
| `api-architect` | REST, GraphQL, gRPC API design |
| `code-architecture` | Clean/hexagonal architecture, SOLID, DI |
| `microservices-patterns` | Service mesh, event sourcing, CQRS |
| `database-design-patterns` | Schema design, normalization, query patterns |
| `typescript-advanced-patterns` | Conditional types, mapped types, type guards |
| `react-performance-optimizer` | React profiling, memo, Suspense, bundling |
| `nextjs-app-router-expert` | Next.js 14+ App Router, RSC, streaming |
| `security-auditor` | Threat modeling, OWASP, secure code review |
| `refactoring-surgeon` | Precise, safe large-scale refactors |
| `error-handling-patterns` | Resilient error strategies for any stack |
| `modern-auth-2026` | OAuth2, OIDC, passkeys, zero-trust auth |
| `real-time-collaboration-engine` | CRDTs, OT, WebSockets, presence systems |
| `websocket-streaming` | Real-time streaming, backpressure, reconnect |
| `postgresql-optimization` | Query planning, indexes, partitioning |
| `test-automation-expert` | Testing pyramids, CI/CD integration, coverage |
| `playwright-e2e-tester` | End-to-end browser test automation |
| `vitest-testing-patterns` | Unit and integration tests with Vitest |
| `github-actions-pipeline-builder` | CI/CD workflows, matrix builds, caching |
| `terraform-iac-expert` | Infrastructure as Code, modules, state |
| `docker-containerization` | Multi-stage builds, security, compose |
| `monorepo-management` | Turborepo, Nx, workspace tooling |
| `code-necromancer` | Resurrect and modernize legacy codebases |

### 🤖 AI/ML & Computer Vision (~20 skills)

| Skill | Description |
|-------|-------------|
| `ai-engineer` | LLM apps, RAG systems, agent orchestration |
| `computer-vision-pipeline` | CV pipelines, detection, segmentation |
| `clip-aware-embeddings` | Semantic image-text matching with CLIP |
| `drone-cv-expert` | Drone systems, SLAM, object detection |
| `drone-inspection-specialist` | Infrastructure inspection, thermal analysis |
| `metal-shader-expert` | Apple Metal, MSL shaders, PBR rendering |
| `physics-rendering-expert` | Rope/cable dynamics, constraint solving |
| `photo-composition-critic` | Graduate-level visual aesthetics analysis |
| `photo-content-recognition-curation-expert` | Face/place recognition, de-duplication |
| `event-detection-temporal-intelligence-expert` | ST-DBSCAN, temporal event detection |
| `geospatial-data-pipeline` | Geo data processing, tile rendering, PostGIS |
| `large-scale-map-visualization` | WebGL maps, vector tiles, spatial analytics |
| `llm-router` | Cost-aware LLM routing and fallback chains |
| `llm-streaming-response-handler` | Streaming tokens, SSE, progressive rendering |
| `ml-system-design-interview` | ML system design coaching |
| `vr-avatar-engineer` | VR avatars, motion capture, real-time animation |
| `ai-video-production-master` | Script-to-video AI pipelines |
| `video-processing-editing` | FFmpeg pipelines, codec selection, automation |

### ⚙️ DevOps & Infrastructure (~12 skills)

| Skill | Description |
|-------|-------------|
| `devops-automator` | CI/CD, deployment automation, monitoring |
| `site-reliability-engineer` | SLOs, incident response, pre-commit hooks |
| `cloudflare-worker-dev` | Workers, KV, Durable Objects, edge computing |
| `vercel-deployment` | Vercel projects, edge functions, previews |
| `logging-observability` | Structured logging, tracing, dashboards |
| `performance-profiling` | CPU/memory profiling, flame graphs |
| `caching-strategies` | Redis patterns, CDN, cache invalidation |
| `dependency-management` | Dependency audits, upgrades, lockfiles |

### 💼 Career & Professional Development (~12 skills)

| Skill | Description |
|-------|-------------|
| `cv-creator` | ATS-optimized resumes in multiple formats |
| `job-application-optimizer` | Resume SEO, keyword matching, job fit |
| `career-biographer` | Extract and narrate your professional story |
| `hr-network-analyst` | Professional network graph analysis |
| `competitive-cartographer` | Map competitive landscapes, find white space |
| `interview-simulator` | Mock technical and behavioral interviews |
| `interview-loop-strategist` | Design and optimize hiring loops |
| `hiring-manager-deep-dive` | Deep pre-interview company/role research |
| `values-behavioral-interview` | Values-based interview coaching |
| `senior-coding-interview` | Senior/staff engineering interview prep |
| `tech-presentation-interview` | Tech talk and presentation coaching |
| `ml-system-design-interview` | ML system design interview prep |

### 🧠 Health, Psychology & Coaching (~15 skills)

| Skill | Description |
|-------|-------------|
| `jungian-psychologist` | Analytical psychology, shadow work, dreams |
| `adhd-daily-planner` | ADHD-friendly scheduling and routines |
| `adhd-design-expert` | Neuroscience-backed UX for ADHD brains |
| `hrv-alexithymia-expert` | HRV biometrics, interoception training |
| `speech-pathology-ai` | Speech therapy, phoneme analysis |
| `clinical-diagnostic-reasoning` | Counteract cognitive bias in medical decisions |
| `personal-finance-coach` | Tax optimization, investment theory |
| `project-management-guru-adhd` | PM systems designed for ADHD engineers |
| `tech-entrepreneur-coach-adhd` | Big tech → indie founder transition |
| `wisdom-accountability-coach` | Philosophy teaching, commitment contracts |
| `crisis-detection-intervention-ai` | Crisis detection and escalation protocols |
| `grief-companion` | Grief support and bereavement coaching |
| `partner-text-coach` | Communication coaching for relationships |
| `indie-monetization-strategist` | Freemium, SaaS pricing, passive income |
| `munger-worldly-wisdom` | Mental models and latticework thinking |

### 🚀 Meta & Orchestration (~20 skills)

| Skill | Description |
|-------|-------------|
| `agent-creator` | Design and build Claude agents and MCP servers |
| `orchestrator` | Coordinate specialist skills, dynamic routing |
| `skill-creator` | Create new high-quality Claude skills |
| `skill-architect` | Audit and redesign skill architectures |
| `skill-documentarian` | Catalog skills, sync website, validate counts |
| `skill-coach` | Coach teams on Claude skill best practices |
| `mcp-creator` | Build Model Context Protocol servers |
| `task-decomposer` | Break complex goals into agent-ready subtasks |
| `systems-thinking` | Causal loops, leverage points, system maps |
| `recursive-synthesis` | Synthesize large corpora into distilled wisdom |
| `research-analyst` | Landscape research, competitive intelligence |
| `research-craft` | Deep research methodology and sourcing |
| `prompt-engineer` | Advanced prompt engineering techniques |
| `automatic-stateful-prompt-improver` | Auto-optimize prompts with APE, OPRO, DSPy |
| `output-contract-enforcer` | Validate AI outputs against schemas |
| `seo-visibility-expert` | SEO, llms.txt, Answer Engine Optimization |
| `team-builder` | Team composition and skill gap analysis |
| `liaison` | Cross-agent coordination and handoff |
| `swift-executor` | Rapid task execution without hesitation |
| `very-long-text-summarization` | Summarize book-length documents accurately |

### 🛡️ Recovery & Wellness (~9 skills)

| Skill | Description |
|-------|-------------|
| `recovery-coach-patterns` | Evidence-based recovery coaching frameworks |
| `recovery-app-onboarding` | UX for addiction recovery apps |
| `recovery-community-moderator` | Online recovery community moderation |
| `recovery-education-writer` | Recovery psychoeducation content |
| `recovery-social-features` | Social accountability features for recovery |
| `recovery-app-legal-terms` | Legal compliance for recovery apps |
| `sober-addict-protector` | Safeguards and relapse prevention logic |
| `sobriety-tools-guardian` | Protect sobriety tool integrity |
| `modern-drug-rehab-computer` | Digital tools for rehabilitation programs |

### ⚖️ Legal & Compliance (~4 skills)

| Skill | Description |
|-------|-------------|
| `2026-legal-research-agent` | Expungement data, state law research |
| `national-expungement-expert` | Clean Slate laws, expungement eligibility |
| `hipaa-compliance` | HIPAA security rule, PHI handling, audits |
| `digital-estate-planner` | Digital asset inheritance and estate planning |

### 🎙️ Audio, Media & Storytelling (~8 skills)

| Skill | Description |
|-------|-------------|
| `sound-engineer` | Spatial audio, procedural sound design |
| `voice-audio-engineer` | ElevenLabs, TTS pipelines, audio processing |
| `win31-audio-design` | Windows 3.1-era audio aesthetics |
| `wedding-immortalist` | Wedding storytelling, multimedia memorials |
| `pet-memorial-creator` | Personalized pet memorial content |
| `email-composer` | High-converting, empathetic email copy |
| `bot-developer` | Discord, Telegram, Slack bots |
| `collage-layout-expert` | Hockney-style computational photo collages |

---

## Corpus Distillation Pipeline

The `/corpus/` directory contains a knowledge distillation pipeline that converts large text corpora (books, research papers, documentation) into dense, structured skill knowledge. This powers several of the domain-expert skills and can be adapted for your own knowledge domains.

---

## Documentation

| Resource | Description |
|----------|-------------|
| **[Skills Gallery](https://someclaudeskills.com/skills)** | Browse all 190+ skills with search and filtering |
| **[Skills Guide](https://someclaudeskills.com/docs/guides/claude-skills-guide)** | How skills work and how to create your own |
| **[Artifacts](https://someclaudeskills.com/artifacts)** | Real-world examples showing skills in action |
| **[Full Docs](https://someclaudeskills.com/docs/intro)** | Complete documentation |

---

## Philosophy

These skills embody **AI that knows better than you** in specific domains.

The result? AI agents that bring genuine expertise to every interaction — not just following instructions, but understanding *why* certain approaches work.

---

## Contributing

1. Follow the structure in `.claude/skills/`
2. Include clear mission, competencies, and outputs
3. Provide examples and best practices
4. Submit a PR to [curiositech/some_claude_skills](https://github.com/curiositech/some_claude_skills)

See the **[Skills Guide](https://someclaudeskills.com/docs/guides/claude-skills-guide)** for detailed instructions.

---

## License

MIT License — See [LICENSE](LICENSE)

---

**Built by [Erich Owens](https://www.erichowens.com)** · Ex-Meta 12 years · 12 Patents · MS Applied Math

*Documentation is a love letter to your future self. Skills are a love letter to Claude.*

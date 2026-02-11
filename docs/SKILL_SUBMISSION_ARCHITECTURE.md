# Skill Submission Architecture

This document describes the end-to-end flow for community skill submissions, from form entry to live deployment.

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SKILL SUBMISSION FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  [User]                                                                      │
│     │                                                                        │
│     ▼                                                                        │
│  /submit page ──────► GitHub Issue ──────► GitHub Action                    │
│  (Win31 form)         (skill-submission    (process-skill-submission-v2)    │
│                        label)                     │                          │
│                                                   ▼                          │
│                                          ┌───────────────────┐               │
│                                          │ 1. Parse & Validate│               │
│                                          │ 2. Create SKILL.md │               │
│                                          │ 3. Generate Hero   │               │
│                                          │ 4. Create MDX Doc  │               │
│                                          │ 5. Update Registry │               │
│                                          │ 6. Create PR       │               │
│                                          └───────────────────┘               │
│                                                   │                          │
│                                                   ▼                          │
│  [Maintainer]                              Pull Request                      │
│     │                                           │                            │
│     ▼                                           ▼                            │
│  Review & Merge ────────────────────────► main branch                       │
│                                                 │                            │
│                                                 ▼                            │
│                                          Cloudflare Pages                    │
│                                          (auto-deploy)                       │
│                                                 │                            │
│                                                 ▼                            │
│                                          🎉 Skill Live!                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Submission Form (`/submit`)

**Location:** `nextjs-app/src/app/submit/page.tsx`

A Win31-styled form that:
- Collects skill metadata (name, title, category, description, tags)
- Validates input client-side
- Generates SKILL.md YAML preview
- Creates GitHub Issue with proper format

**Form Fields:**
| Field | Required | Description |
|-------|----------|-------------|
| name | Yes | Kebab-case skill ID (e.g., `api-architect`) |
| title | Auto | Human-readable title (auto-generated from name) |
| category | Yes | One of 10 predefined categories |
| description | Yes | 50-500 character description |
| tags | Yes | Comma-separated tags for discoverability |
| allowedTools | No | Claude tools needed (default: Read, Write, Edit, Bash, WebSearch) |
| useCases | Yes | When to use this skill |
| antiPatterns | No | When NOT to use this skill |
| pairsWith | No | Other skills it works well with |

### 2. GitHub Issue Processing

**Workflow:** `.github/workflows/process-skill-submission-v2.yml`

Triggered when an issue receives the `skill-submission` label.

**Steps:**
1. **Parse & Validate** - Extract YAML from issue body, validate format
2. **Create SKILL.md** - Write to `.claude/skills/{skill-id}/SKILL.md`
3. **Generate Hero Image** - Call Replicate API for pixel art generation
4. **Create MDX Doc** - Generate `website/docs/skills/{skill_id}/index.md`
5. **Update Registry** - Run `npm run generate:skills`
6. **Create PR** - Open PR with all generated assets

### 3. Hero Image Generation

**Method:** Ideogram API (V2 model with DESIGN style)

**Prompt Template:**
```
Pixel art desktop workstation scene showing {TITLE} themed interface on retro monitor,
{PALETTE} color scheme,
retro Windows 95 interface with title bar and scrollbars,
16-bit video game aesthetic,
keyboard and desk plant in foreground,
clean pixel art style, no anti-aliasing
```

**Color Palette by Category:**
| Category | Palette |
|----------|---------|
| AI & Machine Learning, Data & Analytics | mint and teal professional |
| Design & Creative | synthwave sunset magenta and cyan |
| Lifestyle & Personal, Content & Writing | warm terracotta and cream |
| Code Quality, DevOps | terminal green on black |
| Others | lavender and soft purple workspace |

**Fallback:** If Ideogram API unavailable, skill is created without hero image (can be added manually later).

### 4. Build Trigger

When PRs merge to `main` with changes to `.claude/skills/**/SKILL.md`:
1. Cloudflare Pages detects push to main
2. Auto-builds and deploys new version
3. Optional: Webhook triggers rebuild for immediate deployment

---

## Required Secrets

Set these in **Settings > Secrets > Actions**:

| Secret | Required | Purpose |
|--------|----------|---------|
| `GITHUB_TOKEN` | Auto | Created automatically by GitHub |
| `IDEOGRAM_API_KEY` | Optional | For AI hero image generation |
| `CLOUDFLARE_DEPLOY_HOOK` | Optional | For manual deploy trigger |

### Getting Ideogram API Key

1. Go to [ideogram.ai](https://ideogram.ai)
2. Sign in to your account
3. Go to **Account Settings** → **API**
4. Generate or copy your API key
5. Add to GitHub Secrets as `IDEOGRAM_API_KEY`

### Getting Cloudflare Deploy Hook

1. Go to Cloudflare Dashboard > Pages > Your Project
2. Settings > Builds & Deployments
3. Deploy Hooks > Create Deploy Hook
4. Copy webhook URL
5. Add to GitHub Secrets as `CLOUDFLARE_DEPLOY_HOOK`

---

## File Structure

```
.claude/skills/{skill-id}/
├── SKILL.md                    # Core skill definition
├── references/                 # Optional reference documents
│   └── *.md
└── guides/                     # Optional guides
    └── *.md

website/
├── static/img/skills/
│   └── {skill-id}-hero.png     # Generated hero image
├── docs/skills/{skill_id}/
│   ├── index.md               # Main skill page (MDX)
│   ├── references/            # Copied reference docs
│   └── guides/                # Copied guides
└── src/data/
    └── skills.ts              # Auto-generated registry
```

---

## Manual Intervention Points

Some scenarios require manual intervention:

### Hero Image Needs Regeneration
1. Use local Qwen Image tool (see `docs/guides/hero-image-style-guide.md`)
2. Or use Ideogram MCP with skill-documentarian
3. Save to `website/static/img/skills/{skill-id}-hero.png`

### MDX Needs Customization
1. Edit `website/docs/skills/{skill_id}/index.md` directly
2. Add custom components, images, or examples
3. Commit changes to PR

### Skill Needs References
1. Add reference documents to `.claude/skills/{skill-id}/references/`
2. They'll be copied to MDX docs on next generation

---

## Testing Locally

### Test Submission Processing
```bash
cd website
npx tsx scripts/process-skill-submission.ts 123  # Issue number
```

### Generate Skills Registry
```bash
cd website
npm run generate:skills
```

### Generate Hero Image (Local)
```bash
cd /tmp/qwen-image-macos
source .venv/bin/activate
python qwen.py generate "Pixel art {skill} themed interface..." --ultra-fast --size 1024x576
```

---

## Monitoring

### GitHub Actions
- Go to Actions tab
- Filter by `Process Skill Submission`
- Check for failed runs

### Common Issues

| Issue | Solution |
|-------|----------|
| "Validation failed" | Check issue body format, ensure YAML block is valid |
| "Hero generation failed" | Check REPLICATE_API_TOKEN is set and valid |
| "Skills generation failed" | Run `npm run generate:skills` manually |
| "PR creation failed" | Check branch doesn't already exist |

---

## Future Enhancements

1. **Discord/Slack Notifications** - Alert team on new submissions
2. **Auto-merge for Trusted Contributors** - Skip review for repeat contributors
3. **Skill Quality Score** - Auto-rate submissions based on completeness
4. **Duplicate Detection** - Check for similar existing skills
5. **Tag Suggestions** - AI-suggest tags based on description

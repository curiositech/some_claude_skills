# MVP Development (2-Week Protocol)

## The 2-Week MVP Rule

**Week 1: Core Feature Only**
- Day 1-2: Setup (Firebase/Supabase + Next.js/Swift)
- Day 3-5: One feature that delivers value
- Day 6-7: Stripe integration + basic auth

**Week 2: Polish & Launch**
- Day 8-9: Make it not-ugly (use Tailwind + shadcn)
- Day 10-11: Write landing page + demo video
- Day 12-14: TestFlight/Beta launch, get first paying user

**If it takes longer, scope is too big. CUT FEATURES.**

## ADHD Execution Tactics

### 1. Body Doubling
```
Join indie hacker Discord/communities
Post daily updates: "Today I'm building X"
Cowork on Zoom with other builders
Tweet your progress
→ External accountability = dopamine + commitment
```

### 2. Timeboxing (Sacred)
```
Work in 2-hour hyperfocus blocks:
- 10am-12pm: Deep coding
- 12pm-1pm: Break (exercise, eat)
- 2pm-4pm: Deep coding
- After 4pm: Admin/email/marketing (low energy OK)

No coding after 6pm (burnout prevention)
```

### 3. Progress Tracking (Visual)
```
Create a Notion board with:
┌─────────┬──────────┬─────────┬──────┐
│ TODO    │ DOING    │ DONE    │ WON'T│
├─────────┼──────────┼─────────┼──────┤
│ Feature │ Stripe   │ Auth    │ AI   │
│ Ideas   │ Setup    │ Setup   │ Chat │
│ (10)    │          │ DB      │ Bot  │
│         │          │ Landing │      │
└─────────┴──────────┴─────────┴──────┘

Move cards → dopamine hit
"DONE" column = motivation fuel
"WON'T" column = okay to cut scope
```

### 4. Use Your ML Skills (The Right Way)
```
✅ DO use AI for:
- Code generation (Copilot, Cursor, v0)
- Content writing (landing page copy)
- Image generation (logo, screenshots)
- Boilerplate elimination

✅ DO use ML APIs for:
- OpenAI for chat/completion
- Anthropic for analysis
- Replicate for image/video
- ElevenLabs for voice

❌ DON'T:
- Train your own models (not for MVP)
- Build ML infrastructure (use serverless)
- Compete on model quality (compete on UX)
```

## Tech Stack Recommendations (ADHD-Optimized)

### Web App
```
- Frontend: Next.js 14 (App Router) + TypeScript
- UI: Tailwind CSS + shadcn/ui (copy-paste components)
- Backend: Next.js API routes (collocated, simple)
- Database: Supabase (Postgres + Auth + Storage)
- Payments: Stripe (skip Paddle/Lemon Squeezy for MVP)
- Hosting: Vercel (zero-config deployment)
- AI: OpenAI SDK (gpt-4 API)
```

### iOS/Mac App
```
- Swift + SwiftUI (if you know it)
- RevenueCat (subscriptions)
- Supabase backend
- TestFlight beta distribution
```

### Avoid
```
- Learning new language (Go, Rust) for MVP
- Self-hosting (EC2, DigitalOcean) for MVP
- Building APIs from scratch (use BaaS)
- Websockets (use polling first)
- Any "interesting" tech you want to try
```

## Launch Checklist (Non-negotiable)

**Must Have:**
- [ ] Landing page with clear value prop
- [ ] Demo video (Loom screencast = fine)
- [ ] Stripe checkout that works
- [ ] Works for 1 use case (not all edge cases)
- [ ] You'd pay $20/month for it

**Nice to Have (Do AFTER launch):**
- Beautiful design
- All edge cases handled
- Mobile responsive perfection
- SEO optimization
- Analytics integration

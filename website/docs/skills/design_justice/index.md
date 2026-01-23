---
sidebar_label: Design Justice
sidebar_position: 1
---

# ⚖️ Design Justice

Digital equity and trauma-informed design for marginalized populations. Activate on "accessibility", "offline-first", "trauma-informed", "reentry", "recovery population", "shared device", "unstable phone", "digital equity", "design justice", "low-literacy", "intermittent access". NOT for general UX, marketing optimization, or enterprise SaaS design.

---

## Allowed Tools

```
Read, Write, Edit, Glob, Grep
```

## Tags

`accessibility` `trauma-informed` `equity` `civic-tech` `offline-first`

## Category

**Lifestyle & Personal**

## 🤝 Pairs Great With

- **[UX Friction Analyzer](/docs/skills/ux_friction_analyzer)**: Identify pain points in equity-focused flows
- **[Mobile UX Optimizer](/docs/skills/mobile_ux_optimizer)**: Optimize for low-end devices
- **[PWA Expert](/docs/skills/pwa_expert)**: Offline-first progressive web apps

---

# Design Justice: Equity-Centered Digital Design

Design for the margins, benefit the center. If it works for someone with no stable phone, unstable housing, trauma history, and low digital literacy → it works better for everyone.

## Philosophy

**Design Justice** (Sasha Costanza-Chock) + **Trauma-Informed Design** + **Digital Equity Design**

Core principle: The people most impacted by design decisions should be centered in the design process, not treated as edge cases.

## When to Use This Skill

**Use for:**
- Apps serving recovery/reentry populations
- Government/civic tech applications
- Healthcare portals for vulnerable populations
- Housing/benefits applications
- Legal aid and court self-help tools
- Nonprofit service delivery platforms
- Any app used on shared/public devices

**Do NOT use for:**
- Enterprise B2B SaaS (different constraints)
- Marketing funnel optimization
- Gamification/engagement maximization
- Social media features
- General "make it pretty" UX requests

## Key Patterns

### 1. Authentication Without Stable Phones
- Email-first, phone optional
- Printable backup codes
- Case worker recovery pathways
- No-signup mode for core features

### 2. Offline-First / Intermittent Access
- Auto-save to localStorage on every field change
- Background sync when connection returns
- Clear "Saved locally" / "Syncing" status indicators
- Resume exactly where left off

### 3. Shared/Public Device Privacy
- "Remember me" unchecked by default
- Prominent logout button on every page
- Session timeout with warning
- Sensitive fields with autocomplete="off"

### 4. Trauma-Informed Forms
- Max 5 fields per page
- Progress indicators always visible
- Inline help text (not hidden in modals)
- Calm color palette (no aggressive reds)
- Person-first, non-blaming language

## Code for America Principles

1. **Automatic &gt; Petition-based** - Don't require action from people with records
2. **No-cost by default** - Fee waivers automatic, not applied for
3. **Government does the work** - Don't burden individuals
4. **Co-design with impacted people** - Not just user research ON them
5. **Assume gaps in data** - Design around incomplete records

## Quick Audit Checklist

```
AUTHENTICATION
□ Can user sign up with just email?
□ Is there a non-SMS account recovery option?
□ Do core features work without login?

OFFLINE/INTERMITTENT
□ Does form data survive connection loss?
□ Is there visible "saved" indicator?
□ Can user resume exactly where they left off?

SHARED DEVICES
□ Is "remember me" unchecked by default?
□ Is logout button prominent?
□ Does session timeout with warning?

FORMS
□ Is reading level ≤8th grade?
□ Are there ≤5 fields per page?
□ Is help text inline (not hidden)?
□ Are required fields truly required?
```

## Key Readings

- Design Justice Network principles
- Code for America's design principles
- C4 Innovations equity work
- Sasha Costanza-Chock: "Design Justice" (2020)

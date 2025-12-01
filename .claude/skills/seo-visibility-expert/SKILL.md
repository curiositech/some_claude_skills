---
name: seo-visibility-expert
description: "Comprehensive SEO, discoverability, and AI crawler optimization for web projects. Use for technical SEO audits, llms.txt/robots.txt setup, schema markup, social launch strategies (Product Hunt, HN, Reddit), and Answer Engine Optimization (AEO). Activate on 'SEO', 'discoverability', 'llms.txt', 'robots.txt', 'Product Hunt', 'launch strategy', 'get traffic', 'be found', 'search ranking'. NOT for paid advertising, PPC campaigns, or social media content creation (use marketing skills)."
allowed-tools: Read,Write,Edit,Bash,Glob,Grep,WebFetch,WebSearch
---

# SEO & Visibility Expert

Get your web projects discovered by both traditional search engines AND AI systems. This skill covers the full spectrum from technical SEO to social launch strategies.

## When to Use

**Use for:**
- Technical SEO audits and fixes
- Setting up llms.txt for AI crawlers
- Configuring robots.txt for modern era
- Schema.org/JSON-LD structured data
- Launch strategies (Product Hunt, HN, Reddit)
- Answer Engine Optimization (AEO)
- Core Web Vitals optimization
- Sitemap generation

**NOT for:**
- Paid advertising/PPC campaigns
- Social media content creation
- Email marketing campaigns
- Brand strategy/naming

## The Modern Discovery Stack (2024+)

```
┌─────────────────────────────────────────────┐
│          AI ANSWER ENGINES                  │
│  ChatGPT, Claude, Perplexity, Google AI     │
│  → llms.txt, structured data, AEO           │
├─────────────────────────────────────────────┤
│          TRADITIONAL SEARCH                 │
│  Google, Bing, DuckDuckGo                   │
│  → Technical SEO, content, backlinks        │
├─────────────────────────────────────────────┤
│          SOCIAL DISCOVERY                   │
│  Product Hunt, HN, Reddit, Twitter/X        │
│  → Launch timing, community, narratives     │
└─────────────────────────────────────────────┘
```

## Quick Wins Checklist

**Immediate actions for any web project:**

1. **Create llms.txt** at site root → AI crawlers find your content
2. **Add JSON-LD schema** → Rich snippets in search results
3. **Verify robots.txt** → Allow good bots, block bad ones
4. **Generate sitemap.xml** → Help crawlers index everything
5. **Check Core Web Vitals** → PageSpeed Insights score &gt;90
6. **Add Open Graph tags** → Beautiful social previews
7. **Create humans.txt** → Credit your team, signal legitimacy

## Technical SEO Essentials

### Metadata Must-Haves

```html
<!-- Every page needs these -->
<title>Primary Keyword | Brand Name</title>
<meta name="description" content="150-160 chars with keywords">
<link rel="canonical" href="https://yoursite.com/page">

<!-- Open Graph for social -->
<meta property="og:title" content="Title for social shares">
<meta property="og:description" content="Description for social">
<meta property="og:image" content="https://yoursite.com/og-image.png">
<meta property="og:type" content="website">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Title">
<meta name="twitter:description" content="Description">
<meta name="twitter:image" content="https://yoursite.com/twitter-card.png">
```

### URL Structure

```
✅ Good URLs:
/blog/seo-guide-2024
/tools/sitemap-generator
/pricing

❌ Bad URLs:
/blog?id=123&cat=seo
/tools/tool.php?name=sitemap
/p/12345
```

**Rules:**
- Lowercase, hyphen-separated
- Include primary keyword
- Keep under 60 characters
- No query parameters for content pages
- Use trailing slashes consistently

### JSON-LD Schema Examples

**For a software tool:**
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Your Tool Name",
  "description": "What it does",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}
```

**For educational content:**
```json
{
  "@context": "https://schema.org",
  "@type": "LearningResource",
  "name": "Course/Tutorial Name",
  "description": "What you'll learn",
  "educationalLevel": "Beginner/Intermediate/Advanced",
  "learningResourceType": "Tutorial"
}
```

**For organization/brand:**
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Brand",
  "url": "https://yoursite.com",
  "logo": "https://yoursite.com/logo.png",
  "sameAs": [
    "https://twitter.com/yourbrand",
    "https://github.com/yourbrand"
  ]
}
```

## AI Crawler Optimization (AEO)

### llms.txt Setup

Create `/llms.txt` at your site root:

```markdown
# Your Site Name

> Brief tagline describing what you do

## Overview
2-3 sentences explaining your product/service for AI systems.

## Key Features
- Feature 1: Description
- Feature 2: Description
- Feature 3: Description

## Documentation
- [Getting Started](/docs/getting-started)
- [API Reference](/docs/api)
- [Examples](/examples)

## Links
- Website: https://yoursite.com
- GitHub: https://github.com/you/repo
- Documentation: https://docs.yoursite.com
```

**Anti-pattern**: Don't stuff llms.txt with marketing fluff. AI systems want factual, structured information.

### robots.txt for AI Era

```
# Traditional crawlers
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# AI Crawlers - Allow them!
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

# Block bad actors
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

# Sitemaps
Sitemap: https://yoursite.com/sitemap.xml
```

**Decision tree for AI crawlers:**
- Want AI systems to reference your content? → Allow GPTBot, Claude-Web, etc.
- Have proprietary content you want protected? → Disallow specific paths
- Training data concerns? → Disallow Google-Extended (used for Gemini training)

## Social Launch Strategies

### Product Hunt Launch

**Timing is critical:**
- Launch at **12:01 AM PST** (exactly)
- Best days: Tuesday, Wednesday, Thursday
- Avoid: Mondays (competition), Fridays (low engagement)

**Pre-launch checklist:**
1. Build hunter network 2-4 weeks before
2. Prepare all assets (logo, screenshots, video)
3. Write compelling tagline (under 60 chars)
4. Create launch day communication plan
5. Line up first 10-20 supporters for immediate upvotes

**Launch day strategy:**
```
12:01 AM PST - Go live, personal upvote
12:05 AM - Notify inner circle (10-20 people)
6:00 AM - Second wave notifications
12:00 PM - Engage with all comments
3:00 PM - Third wave push
6:00 PM - Final push for top 5
```

**Anti-pattern**: Don't ask for upvotes directly. Say "We launched on Product Hunt - would love your feedback!" Asking for upvotes violates PH guidelines.

### Hacker News Strategy

**What works:**
- Show HN posts for new projects
- Technical deep-dives, not marketing
- Genuine problems you solved
- Be in comments, respond to everything

**Title formulas that work:**
```
Show HN: [Tool Name] – [What it does in plain English]
Show HN: I built [X] to solve [specific problem]
[Interesting technical finding] (with data)
```

**Timing:**
- Post between 6-8 AM PST for US audience
- Tuesday-Thursday best
- Avoid weekends for serious content

**Anti-pattern**: Never use marketing language. HN readers detect and punish it instantly. Be technical, humble, and genuine.

### Reddit Strategy

**Find your subreddits:**
- r/SideProject - for launches
- r/webdev, r/programming - technical content
- Niche subreddits for your specific domain
- r/InternetIsBeautiful - for beautiful/useful tools

**Rules:**
1. Participate in community BEFORE promoting
2. 90/10 rule: 90% helpful content, 10% self-promotion
3. Don't cross-post same content everywhere
4. Provide genuine value in comments

## Core Web Vitals

**Target scores:**
| Metric | Good | Needs Work | Poor |
|--------|------|------------|------|
| LCP (Largest Contentful Paint) | &lt;2.5s | 2.5-4s | &gt;4s |
| INP (Interaction to Next Paint) | &lt;200ms | 200-500ms | &gt;500ms |
| CLS (Cumulative Layout Shift) | &lt;0.1 | 0.1-0.25 | &gt;0.25 |

**Quick fixes:**
- LCP: Optimize images, preload critical assets
- INP: Minimize JavaScript, use web workers
- CLS: Set explicit dimensions on images/embeds

## Common Anti-Patterns

### The "Build It and They Will Come" Fallacy
**Symptom**: Great product, zero traffic
**Problem**: No discovery strategy
**Solution**: Spend 50% of time on marketing/distribution. Cory Zue's rule: "If you're not embarrassed by how much you're promoting, you're not promoting enough."

### Keyword Stuffing (2024 Edition)
**Symptom**: Unnatural repetition of keywords
**Problem**: Search engines and AI systems detect and penalize this
**Solution**: Write for humans first. Use keywords naturally. Focus on answering questions comprehensively.

### Ignoring AI Crawlers
**Symptom**: No llms.txt, blocking AI user agents
**Problem**: Missing the shift to AI-first search
**Solution**: Create llms.txt, allow AI crawlers in robots.txt, structure content for extraction

### Launch and Abandon
**Symptom**: Big launch, then silence
**Problem**: Sustainable growth requires consistent presence
**Solution**: Build in public, regular updates, engage communities consistently

## Framework-Specific Implementation

### Next.js / React

```typescript
// app/layout.tsx or pages/_app.tsx
export const metadata = {
  title: {
    default: 'Site Name',
    template: '%s | Site Name',
  },
  description: 'Site description',
  openGraph: {
    title: 'Site Name',
    description: 'Description',
    url: 'https://yoursite.com',
    siteName: 'Site Name',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Site Name',
    description: 'Description',
    images: ['/twitter-card.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

### Docusaurus

```javascript
// docusaurus.config.js
module.exports = {
  themeConfig: {
    metadata: [
      { name: 'keywords', content: 'keyword1, keyword2' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    image: 'img/og-image.png',
  },
};
```

## Measurement & Iteration

**Free tools:**
- Google Search Console - Search performance
- Google Analytics 4 - Traffic sources
- PageSpeed Insights - Core Web Vitals
- Ahrefs Webmaster Tools - Backlinks (free tier)

**Track these metrics:**
1. Organic search impressions/clicks
2. Referral traffic from social launches
3. Direct traffic (brand awareness)
4. Core Web Vitals scores
5. AI citation tracking (search for your brand in ChatGPT, Claude)

## Reference Files

| File | Contents |
|------|----------|
| `references/llms-txt-examples.md` | Full llms.txt examples for different site types |
| `references/schema-templates.md` | JSON-LD templates for various content types |
| `references/launch-checklists.md` | Detailed checklists for PH, HN, Reddit launches |

---

**This skill guides**: Technical SEO | AI Crawler Optimization | Social Launch Strategy | Core Web Vitals | Schema Markup | llms.txt Setup

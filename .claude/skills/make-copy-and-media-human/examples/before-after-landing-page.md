# Before / After — Landing Page (the v0 look, token by token)

## Before (as generated)

```html
<head>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800" rel="stylesheet">
</head>
<body class="bg-gray-950 text-white" style="font-family: Inter, sans-serif">
  <main class="flex flex-col items-center text-center pt-32">
    <span class="px-3 py-1 rounded-full border border-white/10 bg-white/5
                 backdrop-blur text-sm">✨ Now in beta</span>
    <h1 class="text-6xl font-extrabold mt-6">
      Ship faster with
      <span class="bg-gradient-to-r from-indigo-500 to-violet-500
                   bg-clip-text text-transparent">AI-powered</span> workflows
    </h1>
    <p class="text-gray-400 mt-4">Empower your team to do more with less.</p>
    <div class="flex gap-3 mt-8">
      <button class="bg-[#6366f1] rounded-2xl px-6 py-3">Get Started Today →</button>
      <button class="border border-white/10 rounded-2xl px-6 py-3">Learn More</button>
    </div>
    <section class="grid grid-cols-3 gap-6 mt-24">
      <div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
        <div class="text-3xl">🚀</div><h3>Blazing Fast</h3>
        <p class="text-gray-400">Lightning-quick performance at any scale.</p>
      </div>
      <!-- two more identical cards: 🔒 Secure by Default, 📊 Deep Insights -->
    </section>
  </main>
</body>
```

### What the structural layer actually flags

Verified by running `scripts/humanize_review.py` against the Before block above.
Four findings, not seven. An earlier version of this table listed detections the
script does not make, which is exactly the kind of unverified claim this skill
exists to catch.

| Token in the markup | Ism | Severity |
|---|---|---|
| `Inter` via Google Fonts | `inter-geist-default-typeface` | high |
| `#6366f1` | `tailwind-indigo-default-palette` | high |
| `rounded-2xl` x3 | `ai-default-token-repetition` | medium |
| emoji inside a feature card heading | `emoji-as-ui-icons` | high |

Three things a reader would clock that the script does not, because they need
eyes or a threshold this sample never reaches: the sparkle glyph on the beta
badge, the gradient `bg-clip-text` headline word (one occurrence, and the token
detector wants three), and the centered-hero-plus-three-cards skeleton. Those
belong to the judge pass below, which is the normal division of labor rather
than a gap.

**What the judge pass flags**

- Centered-hero + badge + two-button + 3-column-feature-grid is the entire v0 layout grammar, unmodified.
- "Empower your team to do more with less" — zero information; "Blazing Fast / Lightning-quick" — the adjective says fast, the copy says fast, nothing says *how fast at what*.
- "Get Started Today →" — the CTA formula plus arrow.
- Three feature cards with identical shape: icon, two-word title, one vague sentence. Perfect parallelism.

## After (a designed page, sketch)

- Typeface chosen against the product: a grotesque with character (e.g. Söhne, Untitled Sans) or the brand's existing family. Weight contrast does the hierarchy work, not `font-extrabold` everywhere.
- Accent pulled from the product's own UI screenshot, not the Tailwind wheel.
- Hero leads with the product itself — a real screenshot or a 12-second loop — headline states the one measurable claim ("Deploys in 40 seconds; rollbacks in one").
- Feature cards replaced by three short case fragments with real numbers, different lengths, written like a person describing what happened.
- Icons from one system (Lucide or bespoke SVG), or none — text is fine.
- One CTA, verb-first, naming the actual next step: "Connect your repo".
- Light mode unless darkness serves the content. Border radius picked once, on purpose.

# DesignPrompts AI-Ready Styles Reference

31 curated styles from designprompts.dev with mode/typography metadata.
Use for expanded trend matching and style-specific token generation.

## Complete Style Catalog

| ID | Name | Mode | Typography | Description |
|----|------|------|------------|-------------|
| monochrome | Monochrome | light | serif | Stark editorial, pure black/white, oversized serif |
| bauhaus | Bauhaus | light | sans | Geometric forms, primary colors, functional |
| modern-dark | Modern Dark | dark | sans | Contemporary dark theme, subtle gradients |
| newsprint | Newsprint | light | serif | Editorial, newspaper-inspired, columns |
| saas | SaaS | light | sans | Clean product UI, feature-focused |
| luxury | Luxury | light | serif | Premium feel, gold accents, editorial serif |
| terminal | Terminal | dark | mono | CLI aesthetic, phosphor green, hacker culture |
| swiss-minimalist | Swiss Minimalist | light | sans | Grid-based, Helvetica, rational |
| kinetic | Kinetic | dark | sans | Motion-first, animated typography |
| flat-design | Flat Design | light | sans | No shadows, bold colors, simple shapes |
| art-deco | Art Deco | dark | serif | 1920s geometric, gold/navy, luxury |
| material-design | Material Design | light | sans | Google's system, elevation, motion |
| neo-brutalism | Neo Brutalism | light | sans | Hard shadows, thick borders, raw |
| bold-typography | Bold Typography | dark | sans | Oversized headlines, expressive |
| academia | Academia | light | serif | Scholarly, research-inspired, classic |
| cyberpunk | Cyberpunk | dark | mono | Neon, glitch, dystopian tech |
| web3 | Web3 | dark | sans | Crypto aesthetic, gradients, futuristic |
| playful-geometric | Playful Geometric | light | sans | Shapes, colors, friendly |
| minimal-dark | Minimal Dark | dark | sans | Less is more, dark elegance |
| claymorphism | Claymorphism | light | sans | 3D clay, soft pastels, rounded |
| professional | Professional | light | sans | Corporate, trustworthy, clean |
| botanical | Botanical | light | serif | Nature-inspired, organic, earthy |
| vaporwave | Vaporwave | dark | sans | 80s/90s nostalgia, pink/cyan, grid |
| enterprise | Enterprise | light | sans | B2B, data-heavy, dashboard-friendly |
| sketch | Sketch | light | sans | Hand-drawn, informal, friendly |
| industrial | Industrial | light | sans | Raw materials, exposed structure |
| neumorphism | Neumorphism | light | sans | Soft shadows, inset/outset, tactile |
| organic | Organic | light | serif | Natural curves, flowing shapes |
| maximalism | Maximalism | light | sans | Dense, colorful, overwhelming (intentional) |
| retro | Retro | light | sans | Vintage computing, nostalgic |

## Mode-Based Generation

### Light Mode Styles (21)
Generate with light backgrounds, dark text as default:
- monochrome, bauhaus, newsprint, saas, luxury
- swiss-minimalist, flat-design, material-design, neo-brutalism
- academia, playful-geometric, claymorphism, professional
- botanical, enterprise, sketch, industrial
- neumorphism, organic, maximalism, retro

### Dark Mode Styles (10)
Generate with dark backgrounds, light text as default:
- modern-dark, terminal, kinetic, art-deco
- bold-typography, cyberpunk, web3
- minimal-dark, vaporwave

## Typography-Based Generation

### Sans-Serif Styles (24)
Use geometric or grotesque fonts:
- bauhaus, modern-dark, saas, swiss-minimalist, kinetic
- flat-design, material-design, neo-brutalism, bold-typography
- web3, playful-geometric, minimal-dark, claymorphism
- professional, vaporwave, enterprise, sketch
- industrial, neumorphism, maximalism, retro

### Serif Styles (5)
Use high-contrast or editorial serifs:
- monochrome, newsprint, luxury, art-deco, academia, botanical, organic

### Monospace Styles (2)
Use coding/terminal fonts:
- terminal, cyberpunk

## Style-to-Token Mapping

### Monochrome
```css
:root {
  --color-bg: #ffffff;
  --color-fg: #000000;
  --color-accent: #000000;
  --font-display: 'Playfair Display', 'Didot', serif;
  --font-body: 'Georgia', 'Times New Roman', serif;
  --font-size-display: clamp(3rem, 10vw, 8rem);
  --line-height-display: 0.9;
  --letter-spacing-display: -0.02em;
}
```

### Terminal
```css
:root {
  --color-bg: #0d1117;
  --color-fg: #00ff00;
  --color-fg-dim: #008800;
  --color-accent: #ffcc00;
  --color-error: #ff0000;
  --font-display: 'JetBrains Mono', 'Fira Code', monospace;
  --font-body: 'JetBrains Mono', monospace;
  --border-style: 1px solid var(--color-fg-dim);
  --glow-text: 0 0 10px var(--color-fg);
}
```

### Cyberpunk
```css
:root {
  --color-bg: #0a0a0f;
  --color-fg: #ff00ff;
  --color-accent-1: #00ffff;
  --color-accent-2: #ff0080;
  --font-display: 'Orbitron', 'Share Tech Mono', monospace;
  --font-body: 'Roboto Mono', monospace;
  --glow-neon: 0 0 20px var(--color-fg), 0 0 40px var(--color-fg);
  --glitch-offset: 2px;
}
```

### Art Deco
```css
:root {
  --color-bg: #1a1a2e;
  --color-fg: #d4af37;
  --color-accent: #0f3460;
  --color-secondary: #e94560;
  --font-display: 'Poiret One', 'Josefin Sans', sans-serif;
  --font-body: 'Lato', 'Raleway', sans-serif;
  --pattern-deco: repeating-linear-gradient(
    45deg,
    var(--color-fg) 0,
    var(--color-fg) 1px,
    transparent 0,
    transparent 50%
  );
}
```

### Vaporwave
```css
:root {
  --color-bg: #1a0a2e;
  --color-fg: #ff71ce;
  --color-accent-1: #01cdfe;
  --color-accent-2: #05ffa1;
  --color-accent-3: #b967ff;
  --gradient-sunset: linear-gradient(180deg, #ff71ce 0%, #01cdfe 50%, #05ffa1 100%);
  --grid-perspective: linear-gradient(
    transparent 0%,
    rgba(255, 113, 206, 0.1) 50%,
    rgba(1, 205, 254, 0.2) 100%
  );
  --font-display: 'VT323', 'Press Start 2P', monospace;
}
```

## Matching Keywords to Styles

Extend match-trend.ts with these keywords:

```typescript
const designPromptsKeywords: Record<string, string[]> = {
  'monochrome': ['black white', 'editorial', 'stark', 'dramatic', 'newsroom', 'magazine'],
  'bauhaus': ['geometric', 'primary colors', 'functional', 'modernist', 'grid'],
  'terminal': ['cli', 'command line', 'hacker', 'code', 'developer', 'green screen'],
  'cyberpunk': ['neon', 'dystopia', 'glitch', 'night city', 'blade runner', 'tech noir'],
  'art-deco': ['gatsby', '1920s', 'roaring twenties', 'gold', 'geometric luxury'],
  'vaporwave': ['retrowave', '80s', '90s', 'aesthetic', 'sunset', 'grid'],
  'academia': ['university', 'scholarly', 'research', 'library', 'classic'],
  'sketch': ['hand drawn', 'doodle', 'informal', 'playful', 'rough'],
  'industrial': ['factory', 'raw', 'metal', 'exposed', 'structural'],
  'saas': ['startup', 'product', 'dashboard', 'app', 'software'],
  'enterprise': ['b2b', 'corporate', 'business', 'data', 'professional'],
};
```

## Composable Style Combinations

Some styles can be meaningfully combined:

| Base Style | + Modifier | Result |
|------------|-----------|--------|
| terminal | + cyberpunk | Neon CLI aesthetic |
| swiss-minimalist | + dark | Minimal dark SaaS |
| art-deco | + web3 | Luxury crypto brand |
| neo-brutalism | + kinetic | Animated brutal design |
| botanical | + luxury | Premium organic brand |
| vaporwave | + claymorphism | Soft retro 3D |

When detecting combined styles, merge token sets with the base style taking precedence for conflicts.

# Some Claude Skills - Next.js

A curated gallery of 90+ Claude Code skills with a distinctive Windows 3.1 retro aesthetic.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui patterns + Radix UI
- **Variants**: class-variance-authority (CVA)
- **Icons**: Lucide React
- **Deployment**: Cloudflare Pages

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run pages:deploy
```

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Homepage
├── components/
│   └── ui/              # UI component library
│       ├── button.tsx   # Button with win31 variants
│       ├── card.tsx     # Card with win31 variants
│       ├── dialog.tsx   # Radix Dialog with win31 styling
│       ├── stack.tsx    # Flex layout primitive
│       ├── flex.tsx     # Flex layout primitive
│       └── index.ts     # Barrel exports
├── lib/
│   └── utils.ts         # cn() utility
└── styles/
    └── globals.css      # Tailwind v4 theme configuration
```

## Design System

### Windows 3.1 Aesthetic

All components support a `variant="win31"` prop:

```tsx
<Button variant="win31">Click Me</Button>
<Card variant="win31">
  <CardHeader variant="win31">
    <CardTitle variant="win31">Title</CardTitle>
  </CardHeader>
</Card>
```

### Colors

- `win31-gray` (#c0c0c0) - Surface
- `win31-navy` (#000080) - Title bars
- `win31-teal` (#008080) - Desktop
- `win31-lime` (#00ff00) - Terminal text

### Typography

- `font-display` - Press Start 2P (pixel art)
- `font-window` - VT323 (title bars)
- `font-system` - IBM Plex Mono (UI)
- `font-body` - Courier Prime (content)

## Cloudflare Pages Deployment

1. Connect repo at [dash.cloudflare.com](https://dash.cloudflare.com)
2. Build command: `npm run pages:build`
3. Output directory: `.vercel/output/static`
4. Add custom domain

Every PR automatically gets a preview URL.

## License

MIT

# Claude Skills Documentation Website

Interactive documentation platform for Claude Skills built with [Docusaurus](https://docusaurus.io/).

## 🚀 Quick Start

### Development Server

```bash
npm start
```

This command starts a local development server at `http://localhost:3000/`. Most changes are reflected live without having to restart the server.

### Build

```bash
npm run build
```

This command generates static content into the `build` directory that can be served using any static hosting service.

### Serve Locally

```bash
npm run serve
```

Test the production build locally before deploying.

## 📁 Project Structure

```
website/
├── docs/                       # Documentation files
│   ├── intro.md               # Introduction page
│   ├── guides/                # Guides and tutorials
│   └── skills/                # Individual skill documentation
├── src/
│   ├── components/            # React components
│   ├── css/                   # Global styles
│   └── pages/                 # Custom pages
├── static/                    # Static assets
├── docusaurus.config.ts      # Site configuration
└── sidebars.ts               # Sidebar configuration
```

## 🎨 Features

- **Skills Gallery**: Browse and filter all available Claude Skills
- **Interactive Playground**: Test skills with example prompts
- **Comprehensive Documentation**: Complete guides for all skills
- **Dark Mode**: Automatic dark mode support
- **Search**: Fast search across all documentation

## 🎯 Adding Content

### Adding a New Skill

1. Create a markdown file in `docs/skills/` with frontmatter
2. Add the skill to `sidebars.ts`
3. Add to the gallery in `src/pages/skills.tsx`

For detailed instructions, see the full documentation in this README.

## 📦 Deployment

The site automatically deploys to GitHub Pages via GitHub Actions when you push to `main`.

Manual deployment:
```bash
npm run deploy
```

## 📚 Resources

- [Docusaurus Documentation](https://docusaurus.io/)
- [React Documentation](https://react.dev/)
- [Claude Skills Repository](https://github.com/curiositech/some_claude_skills)

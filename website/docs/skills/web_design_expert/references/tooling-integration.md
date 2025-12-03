---
title: Design Tooling Integration
sidebar_label: Design Tooling Integration
sidebar_position: 3
---
# Design Tooling Integration

21st.dev, Figma MCP, and component workflows.

## 21st.dev MCP Tools

### Getting Inspiration

```
Use mcp__magic__21st_magic_component_inspiration to:
- Search for existing UI patterns ("hero section", "pricing table")
- Preview component designs before implementing
- Gather competitive reference quickly
```

**Workflow**:
1. `21st_magic_component_inspiration` → See what exists
2. Pick elements you like (layout structure, interactions)
3. Design your unique version (don't copy, be inspired)

### Building Components

```
Use mcp__magic__21st_magic_component_builder to:
- Generate production-ready React components
- Get properly typed TypeScript components
- Include Tailwind CSS styling
```

**When to use builder vs hand-code**:
- Use builder: Standard patterns where speed matters
- Hand-code: Custom animations, brand-specific interactions

### Refining Components

```
Use mcp__magic__21st_magic_component_refiner to:
- Improve existing component UI
- Modernize dated designs
- Apply current design trends
```

### Finding Logos

```
Use mcp__magic__logo_search to:
- Get company logos in JSX/TSX/SVG format
- Proper brand colors and proportions
```

## Figma Integration

### Available Figma MCPs

| MCP | Best For |
|-----|----------|
| **Figma Context MCP** (GLips) | AI-friendly design data extraction |
| **Cursor Talk to Figma** | Bidirectional Figma manipulation |
| **Figma MCP with Chunking** | Large files, memory efficiency |

### Design-to-Code Workflow

```
1. Designer shares Figma file URL
2. Use Figma MCP to extract:
   - Color palette (exact hex values)
   - Typography specs
   - Spacing values
   - Component structure
3. Build design system tokens from extracted data
4. Generate components with 21st.dev builder
5. Apply Figma-extracted styles
```

### What Figma MCP Can Extract
- **Colors**: Fill colors, stroke colors, gradients
- **Typography**: Font family, size, weight, letter-spacing
- **Spacing**: Padding, margins, gaps (from auto-layout)
- **Components**: Names, variants, properties
- **Images**: Export assets from frames

### Setup Notes

Figma MCPs require:
1. Figma Personal Access Token
2. MCP server installation
3. Claude Code MCP configuration

## Anti-Patterns

### Over-relying on templates
21st.dev is for inspiration and scaffolding, not final design. Every component should get custom brand treatment.

### Manual Color Copying
Designer says "use this blue" and you guess. Extract exact values from Figma using MCP instead.

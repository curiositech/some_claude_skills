---
sidebar_position: 1
slug: /intro
---

# What Are Claude Skills?

**Turn Claude from a helpful assistant into a domain expert—instantly.**

## First, Some Context

### What is Claude?

Claude is an AI assistant made by [Anthropic](https://anthropic.com). If you've used ChatGPT, it's similar—you can ask it questions, have conversations, get help with writing and coding. Many developers prefer Claude for its nuanced reasoning and ability to handle complex technical tasks.

### What is Claude Code?

[Claude Code](https://docs.anthropic.com/en/docs/claude-code) is a command-line tool that lets Claude work directly with your files and code. Instead of copying and pasting code back and forth, Claude can:

- **Read your files** - Understand your entire codebase
- **Write code** - Create new files, edit existing ones
- **Run commands** - Execute tests, build projects, run scripts
- **Search and navigate** - Find what it needs across thousands of files

Think of it as having a senior developer who can actually touch your codebase, not just give advice.

### What are Skills?

Skills are instruction files that give Claude deep expertise in specific areas.

**Without a skill:** You ask Claude for help with color theory. You have to explain what you're building, what "warm/cool alternation" means, that you care about perceptual uniformity, what LAB color space is... and hope Claude pieces together something useful.

**With the Color Theory skill:** Claude already knows all of this. It understands earth-mover distance for palette optimization, knows when to use HSL vs LAB, and produces color systems that actually work. You just say "help me pick colors" and get expert-level output.

Skills are like giving Claude a master's degree in a specific topic—the knowledge is just *there*.

---

## What's in This Collection?

These aren't toy examples. They're production-grade skills I built while working on real projects:

| Who You Are | Skills You'll Like |
|-------------|-------------------|
| **ML Engineers** | Drone CV Expert, CLIP Embeddings, Photo Content Recognition |
| **Designers** | Typography Expert, Color Theory, Design System Creator, Vaporwave UI |
| **Founders** | Career Biographer, Competitive Cartographer, CV Creator |
| **Developers** | Bot Developer, Metal Shader Expert, Sound Engineer |
| **Anyone** | ADHD Design Expert, Jungian Psychologist, Personal Finance Coach |

Each skill includes:
- **Domain expertise** - The actual knowledge, not generic advice
- **Personality** - Knows when to push back on bad ideas
- **Working code** - Produces results, not just explanations

---

## Quick Start

### If You're New to Claude Code

1. **Get Claude Code** - [Install instructions](https://docs.anthropic.com/en/docs/claude-code)
2. **Come back here** - Once you're up and running

### If You Already Use Claude Code

```bash
# Clone all skills
git clone https://github.com/curiositech/some_claude_skills.git

# Copy to your personal skills folder
cp -r some_claude_skills/.claude/skills/* ~/.claude/skills/

# Now Claude knows all 49 skills
```

Or grab just the ones you want from the [Skills Gallery](/skills).

---

## How Skills Work

Skills are markdown files that live in `.claude/skills/`. When you mention a skill or Claude detects it's relevant, the instructions get loaded into context.

A skill file typically includes:
- **Who this expert is** - The persona and mindset
- **What they know** - Domain knowledge, frameworks, best practices
- **How they work** - Methodologies, decision-making processes
- **What tools they use** - Specific libraries, commands, techniques

Example: The `typography-expert` skill doesn't just know "use readable fonts." It knows about optical sizing, x-height ratios, combining typefaces, vertical rhythm, and the specific CSS properties to achieve each effect.

---

## Next Steps

- **[Browse Skills Gallery](/skills)** - See all 49+ skills with previews
- **[Read the Full Guide](/docs/guides/claude-skills-guide)** - Learn to create your own
- **[View on GitHub](https://github.com/curiositech/some_claude_skills)** - Source code and contributions

---

## About

Built by [Erich Owens](https://erichowens.com).

These skills are MIT licensed—fork them, modify them, make them yours.

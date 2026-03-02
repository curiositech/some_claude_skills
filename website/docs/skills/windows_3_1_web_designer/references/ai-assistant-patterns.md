---
title: AI Assistant Patterns: The Cue Card Paradigm
sidebar_label: AI Assistant Patterns: The Cue...
sidebar_position: 2
---
# AI Assistant Patterns: The Cue Card Paradigm

How Windows 3.1 would present AI assistants, chatbots, and intelligent agents.

## Core Philosophy

Win31 AI is **modal, step-by-step, and wizard-driven**. This predates Clippy entirely—think Help system Cue Cards, Setup Wizards, and Q&A dialog chains. Every interaction is a focused question with constrained answers.

Key principles:
1. **No animated characters** - Just clean dialog boxes
2. **One question at a time** - Modal, focused interactions
3. **Constrained choices** - Radio buttons, not open text
4. **Step indicators** - "Step 2 of 5" explicitly shown
5. **Cue Card metaphor** - Floating help cards that guide

---

## The Win31 AI Dialog

Unlike Win95's Clippy, Win31 AI uses stacked modal dialogs:

```
┌─ AI Assistant ──────────────────────────[─]─┐
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │                                        │  │
│  │  What would you like help with?        │  │
│  │                                        │  │
│  │  ○ Writing a document                  │  │
│  │  ○ Working with files                  │  │
│  │  ○ Setting up your system              │  │
│  │  ○ Learning Windows basics             │  │
│  │                                        │  │
│  └────────────────────────────────────────┘  │
│                                              │
│         [  OK  ]  [ Cancel ]  [ Help ]       │
└──────────────────────────────────────────────┘
```

### CSS Implementation

```css
.win31-ai-dialog {
  width: 380px;
  background: var(--win31-gray);
  border: 3px solid var(--win31-black);
  box-shadow:
    inset 2px 2px 0 var(--win31-white),
    inset -2px -2px 0 var(--win31-dark-gray),
    4px 4px 0 var(--win31-black);
}

.win31-ai-dialog-titlebar {
  background: var(--win31-navy); /* SOLID - no gradient! */
  color: var(--win31-white);
  padding: 4px 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-pixel);
  font-size: 11px;
  font-weight: bold;
}

.win31-ai-dialog-content {
  padding: 16px;
  background: var(--win31-gray);
}

.win31-ai-question-box {
  background: var(--win31-white);
  border: 2px solid;
  border-color: var(--win31-dark-gray) var(--win31-white)
               var(--win31-white) var(--win31-dark-gray);
  box-shadow: inset 1px 1px 0 var(--win31-black);
  padding: 12px;
  margin-bottom: 16px;
}

.win31-ai-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-family: var(--font-pixel);
  font-size: 12px;
}

.win31-ai-buttons {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding-top: 8px;
  border-top: 2px solid var(--win31-dark-gray);
  margin-top: 8px;
}
```

---

## Cue Card Pattern

Win31's signature help pattern—floating cards that appear alongside the main window:

```
┌─ File Manager ───────────────────[─]─┐  ┌─ Cue Cards ────────[×]─┐
│ File  Disk  Tree  View  Options      │  │                        │
├──────────────────────────────────────┤  │  Copying Files         │
│ C:\                                  │  │  ═══════════════       │
│ ├─ DOS                               │  │                        │
│ ├─ WINDOWS                           │  │  To copy a file:       │
│ │  ├─ SYSTEM                         │  │                        │
│ │  └─ ...                            │  │  1. Select the file    │
│ └─ ...                               │  │  2. Hold Ctrl          │
│                                      │  │  3. Drag to target     │
├──────────────────────────────────────┤  │                        │
│ Ready                                │  │  [ < Back ] [ Next > ] │
└──────────────────────────────────────┘  └────────────────────────┘
```

### Cue Card CSS

```css
.win31-cue-card {
  position: absolute;
  width: 220px;
  background: var(--win31-gray);
  border: 3px solid var(--win31-black);
  box-shadow:
    inset 2px 2px 0 var(--win31-white),
    inset -2px -2px 0 var(--win31-dark-gray),
    4px 4px 0 var(--win31-black);
  z-index: 100;
}

.win31-cue-card-titlebar {
  background: var(--win31-navy);
  color: var(--win31-white);
  padding: 3px 6px;
  font-family: var(--font-pixel);
  font-size: 10px;
  display: flex;
  justify-content: space-between;
}

.win31-cue-card-content {
  padding: 12px;
  font-family: var(--font-pixel);
  font-size: 11px;
  line-height: 1.6;
}

.win31-cue-card-title {
  font-weight: bold;
  border-bottom: 2px solid var(--win31-dark-gray);
  padding-bottom: 4px;
  margin-bottom: 8px;
}

.win31-cue-card-steps {
  padding-left: 16px;
}

.win31-cue-card-nav {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid var(--win31-dark-gray);
  margin-top: 12px;
}
```

---

## Setup Wizard Pattern

For multi-step AI interactions (onboarding, configuration, complex tasks):

```
┌─ Setup Wizard ────────────────────────────────[─]─┐
│                                                    │
│  ┌───────────────────────────────────────────┐    │
│  │                                           │    │
│  │   ╔════════════════════════════════╗      │    │
│  │   ║  Step 2 of 4                   ║      │    │
│  │   ║  ══════════════════════════    ║      │    │
│  │   ║                                ║      │    │
│  │   ║  Select your preferred         ║      │    │
│  │   ║  assistance style:             ║      │    │
│  │   ║                                ║      │    │
│  │   ║  ○ Detailed explanations       ║      │    │
│  │   ║  ○ Brief suggestions           ║      │    │
│  │   ║  ○ Just show me how            ║      │    │
│  │   ║                                ║      │    │
│  │   ╚════════════════════════════════╝      │    │
│  │                                           │    │
│  └───────────────────────────────────────────┘    │
│                                                    │
│         [ < Back ]  [ Next > ]  [ Cancel ]        │
└────────────────────────────────────────────────────┘
```

### Wizard Step Indicator (Win31 Style)

```css
.win31-wizard-step-indicator {
  font-family: var(--font-pixel);
  font-size: 11px;
  font-weight: bold;
  border-bottom: 2px double var(--win31-dark-gray);
  padding-bottom: 4px;
  margin-bottom: 12px;
}

.win31-wizard-progress {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.win31-wizard-progress-segment {
  height: 8px;
  flex: 1;
  background: var(--win31-white);
  border: 1px solid var(--win31-dark-gray);
}

.win31-wizard-progress-segment.completed {
  background: var(--win31-navy);
}

.win31-wizard-progress-segment.current {
  background: var(--win31-teal);
}
```

---

## Message Box Patterns

Win31 AI responses using standard message box styles:

### Information

```
┌─ Assistant ─────────────────────────[─]─┐
│                                          │
│    ╔══╗                                  │
│    ║ i║  Your document has been saved    │
│    ╚══╝  successfully to C:\DOCS         │
│                                          │
│              [     OK     ]              │
└──────────────────────────────────────────┘
```

### Question

```
┌─ Assistant ─────────────────────────[─]─┐
│                                          │
│    ╔══╗  Would you like to save          │
│    ║? ║  changes to DOCUMENT.TXT         │
│    ╚══╝  before closing?                 │
│                                          │
│      [ Yes ]   [ No ]   [ Cancel ]       │
└──────────────────────────────────────────┘
```

### Warning

```
┌─ Warning ───────────────────────────[─]─┐
│                                          │
│    ╔══╗  This operation cannot be        │
│    ║ !║  undone. Continue anyway?        │
│    ╚══╝                                  │
│                                          │
│         [ Continue ]   [ Cancel ]        │
└──────────────────────────────────────────┘
```

### Icon CSS (Pixel Art Style)

```css
.win31-icon-info {
  width: 32px;
  height: 32px;
  background: var(--win31-navy);
  color: var(--win31-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: serif;
  font-size: 20px;
  font-weight: bold;
  font-style: italic;
  border: 2px solid var(--win31-black);
}

.win31-icon-question {
  width: 32px;
  height: 32px;
  background: var(--win31-teal);
  color: var(--win31-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: serif;
  font-size: 22px;
  font-weight: bold;
  border: 2px solid var(--win31-black);
}

.win31-icon-warning {
  width: 32px;
  height: 32px;
  background: var(--win31-yellow);
  color: var(--win31-black);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-pixel);
  font-size: 18px;
  font-weight: bold;
  border: 2px solid var(--win31-black);
}

.win31-icon-error {
  width: 32px;
  height: 32px;
  background: var(--win31-red);
  color: var(--win31-white);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-pixel);
  font-size: 16px;
  font-weight: bold;
  border: 2px solid var(--win31-black);
}
```

---

## Chat Interface (Win31 Terminal Style)

When you need actual chat, style it as a terminal/command prompt:

```
┌─ AI TERMINAL ─────────────────────────────[─]─┐
│ ┌───────────────────────────────────────────┐ │
│ │C:\>ASSIST                                 │ │
│ │                                           │ │
│ │ASSISTANT: How can I help you today?       │ │
│ │                                           │ │
│ │C:\>I need help writing a letter           │ │
│ │                                           │ │
│ │ASSISTANT: I can help with that.           │ │
│ │What type of letter?                       │ │
│ │                                           │ │
│ │  1. Business letter                       │ │
│ │  2. Personal letter                       │ │
│ │  3. Formal invitation                     │ │
│ │                                           │ │
│ │Enter choice (1-3): _                      │ │
│ └───────────────────────────────────────────┘ │
│ Ready                                         │
└───────────────────────────────────────────────┘
```

### Terminal Chat CSS

```css
.win31-terminal {
  background: var(--win31-black);
  color: var(--win31-white);
  font-family: var(--font-code);
  font-size: 12px;
  padding: 8px;
  border: 2px solid;
  border-color: var(--win31-dark-gray) var(--win31-white)
               var(--win31-white) var(--win31-dark-gray);
  box-shadow: inset 1px 1px 0 var(--win31-black);
  min-height: 200px;
  overflow-y: auto;
}

.win31-terminal-line {
  margin-bottom: 2px;
  white-space: pre-wrap;
  word-break: break-word;
}

.win31-terminal-prompt {
  color: var(--win31-gray);
}

.win31-terminal-assistant {
  color: var(--win31-teal);
}

.win31-terminal-cursor {
  display: inline-block;
  width: 8px;
  height: 12px;
  background: var(--win31-white);
  animation: win31-blink 0.5s step-end infinite;
}

@keyframes win31-blink {
  50% { opacity: 0; }
}
```

---

## Help Index Pattern

For AI knowledge base / FAQ interfaces:

```
┌─ Help Topics ─────────────────────────────[─]─┐
│ File  Edit  Bookmark  Help                     │
├────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌───────────────────────────┐ │
│ │ Topics:      │ │                           │ │
│ │ ─────────── │ │  Getting Started          │ │
│ │ ○ Overview   │ │  ════════════════         │ │
│ │ ○ Getting    │ │                           │ │
│ │   Started    │ │  Welcome to the AI        │ │
│ │ ○ Commands   │ │  Assistant! This guide    │ │
│ │ ○ Examples   │ │  will help you learn      │ │
│ │ ○ Glossary   │ │  the basics.              │ │
│ │              │ │                           │ │
│ │              │ │  ► First Steps            │ │
│ │              │ │  ► Key Concepts           │ │
│ │              │ │  ► Common Tasks           │ │
│ │              │ │                           │ │
│ └──────────────┘ └───────────────────────────┘ │
├────────────────────────────────────────────────┤
│ Press F1 for Help                              │
└────────────────────────────────────────────────┘
```

---

## Key Differences from Win95 AI (Clippy)

| Aspect | Win31 AI | Win95 AI (Clippy) |
|--------|----------|-------------------|
| **Character** | None - just dialogs | Animated character |
| **Proactivity** | User-initiated only | "It looks like you're..." |
| **Format** | Modal dialogs | Floating balloon |
| **Choices** | Numbered lists, radio buttons | Clickable suggestions |
| **Help style** | Cue Cards, indexed | Search-based, contextual |
| **Personality** | Formal, system-like | Friendly, anthropomorphized |

---

## Sound Effects (Optional)

Win31 system sounds to map to AI events:

| Event | Sound File | Description |
|-------|------------|-------------|
| Dialog open | CHORD.WAV | Two-note chord |
| Success | TADA.WAV | Fanfare |
| Error | DING.WAV | Alert ding |
| Question | QUESTION.WAV | Rising tone |
| Help open | None | Silent |

```javascript
const sounds = {
  dialog: new Audio('/sounds/chord.wav'),
  success: new Audio('/sounds/tada.wav'),
  error: new Audio('/sounds/ding.wav'),
};

function playSound(type) {
  if (sounds[type]) {
    sounds[type].currentTime = 0;
    sounds[type].play();
  }
}
```

---

## Implementation Philosophy

Win31 AI should feel like a knowledgeable colleague from 1992:
- **Efficient**: No animation delays
- **Focused**: One thing at a time
- **Structured**: Clear numbered steps
- **Respectful**: User initiates, system responds
- **Professional**: No cutesy characters or humor

The interaction model is closer to a command-line help system wrapped in GUI chrome than a conversational assistant.

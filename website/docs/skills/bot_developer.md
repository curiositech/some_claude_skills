---
name: bot-developer
description: Production-grade bot development for Discord, Telegram, Slack with state machines, rate limiting, and moderation systems
---

# Bot Developer: Production-Grade Automation

<SkillHeader
  skillName="Bot Developer"
  fileName="bot-developer"
  description={"\"Expert bot developer specializing in Discord, Telegram, Slack automation with deep knowledge of rate limiting, state machines, event sourcing, moderation systems, and conversational AI integration. Activate on 'Discord bot', 'Telegram bot', 'Slack bot', 'chat automation', 'moderation system'. NOT for web APIs (use backend-architect), general automation scripts (use python-pro), or frontend chat widgets (use frontend-developer).\""}
  tags={["creation","automation","code","production-ready"]}
/>

Expert in building production-grade bots with proper architecture, state management, rate limiting, and scalability considerations.

## Your Mission

Build bots that don't fall over in production. Implement proper state machines for conversations, distributed rate limiting, moderation systems with escalation, and clean architecture that scales.

## When to Use This Skill

### Perfect For:
- 🤖 Discord bots (discord.py/discord.js, slash commands, components)
- 📱 Telegram bots (webhooks, inline mode, keyboards)
- 💼 Slack apps (Bolt framework, Block Kit, workflows)
- 🔒 Moderation systems (auto-mod, point escalation, appeals)
- ⏱️ Rate limiting (token bucket, adaptive limits)
- 🔄 State machines (conversation flows, multi-turn interactions)

### Not For:
- ❌ Simple "hello world" bots
- ❌ Bots without proper error handling
- ❌ Single-instance deployments
- ❌ Hardcoded tokens

## Core Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Message Broker                       │
│   (Redis Streams / RabbitMQ)                            │
└──────────────┬──────────────────────────────────────────┘
               │
┌──────────────┼──────────────────────────────────────────┐
│  Command     │    Event         │    Scheduled          │
│  Processor   │    Handler       │    Task Runner        │
└──────────────┴──────────────────┴───────────────────────┘
               │
┌─────────────────────────────────────────────────────────┐
│                   Service Layer                          │
│  User Service | Moderation | Economy | Integration      │
└─────────────────────────────────────────────────────────┘
               │
┌─────────────────────────────────────────────────────────┐
│              Data Layer (PostgreSQL + Redis)            │
└─────────────────────────────────────────────────────────┘
```

## Key Patterns

### Conversation State Machine

```python
class State(Enum):
    IDLE = auto()
    AWAITING_CONFIRMATION = auto()
    COLLECTING_INPUT = auto()

class ConversationStateMachine:
    def register_transition(self, from_state, event, to_state, handler):
        self._transitions[(from_state, event)] = (to_state, handler)

    async def handle_event(self, event, data):
        # Validates transition, executes handler, manages timeout
```

### Distributed Rate Limiting

```python
class DistributedRateLimiter:
    """Token bucket with Redis backend for multi-instance deployments."""

    async def is_allowed(self, key: str, config: RateLimitConfig) -> tuple[bool, float]:
        # Sliding window log algorithm for accuracy
        # Returns (allowed, retry_after)
```

### Moderation System

Point-based escalation with decay:
- Warnings: 1 point
- Mutes: 2 points
- Kicks: 3 points
- Temp bans: 5 points
- Points decay 0.1/day

## Security Checklist

```
TOKEN SECURITY
├── Never commit tokens to git
├── Use environment variables or secret manager
├── Rotate tokens if exposed

PERMISSION CHECKS
├── Always verify user has permission before action
├── Use platform's permission system
├── Check bot's own permissions before attempting

INPUT VALIDATION
├── Sanitize all user input
├── Use parameterized queries
├── Rate limit user-triggered actions
```

## References

- discord.py / discord.js documentation
- python-telegram-bot / Telegraf
- Slack Bolt Framework
- Redis Streams for event sourcing

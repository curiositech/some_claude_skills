---
title: Architecture Patterns
sidebar_label: Architecture Patterns
sidebar_position: 1
---
# Architecture Patterns

Event-driven architecture and state machine patterns for production bots.

## Event-Driven Bot Architecture

```
                         ┌─────────────────────────────────┐
                         │         Message Broker          │
                         │   (Redis Streams / RabbitMQ)    │
                         └──────────────┬──────────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        │                               │                               │
        ▼                               ▼                               ▼
┌───────────────┐              ┌───────────────┐              ┌───────────────┐
│  Command      │              │   Event       │              │  Scheduled    │
│  Processor    │              │   Handler     │              │  Task Runner  │
│               │              │               │              │               │
│ /cmd parsing  │              │ on_message    │              │ cron jobs     │
│ validation    │              │ on_reaction   │              │ reminders     │
│ permissions   │              │ on_join       │              │ cleanups      │
└───────┬───────┘              └───────┬───────┘              └───────┬───────┘
        │                               │                               │
        └───────────────────────────────┼───────────────────────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────────┐
                         │        Service Layer            │
                         │                                 │
                         │  ┌─────────┐  ┌─────────────┐  │
                         │  │ User    │  │ Moderation  │  │
                         │  │ Service │  │ Service     │  │
                         │  └─────────┘  └─────────────┘  │
                         │  ┌─────────┐  ┌─────────────┐  │
                         │  │ Economy │  │ Integration │  │
                         │  │ Service │  │ Service     │  │
                         │  └─────────┘  └─────────────┘  │
                         └──────────────┬──────────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────────┐
                         │        Data Layer               │
                         │  PostgreSQL + Redis + S3        │
                         └─────────────────────────────────┘
```

## State Machine for Conversations

```python
from enum import Enum, auto
from typing import Callable, Optional
import asyncio

class State(Enum):
    IDLE = auto()
    AWAITING_CONFIRMATION = auto()
    COLLECTING_INPUT = auto()
    PROCESSING = auto()
    ERROR = auto()

class ConversationStateMachine:
    """
    Finite state machine for managing multi-turn conversations.
    Prevents race conditions and ensures clean state transitions.
    """

    def __init__(self, user_id: str, timeout: float = 300):
        self.user_id = user_id
        self.state = State.IDLE
        self.context: dict = {}
        self.timeout = timeout
        self._timeout_task: Optional[asyncio.Task] = None
        self._transitions: dict[tuple[State, str], tuple[State, Callable]] = {}

    def register_transition(self, from_state: State, event: str,
                           to_state: State, handler: Callable):
        """Register a valid state transition."""
        self._transitions[(from_state, event)] = (to_state, handler)

    async def handle_event(self, event: str, data: dict) -> Optional[str]:
        """Process event and execute transition if valid."""
        key = (self.state, event)

        if key not in self._transitions:
            return f"Cannot {event} from state {self.state.name}"

        to_state, handler = self._transitions[key]

        # Cancel existing timeout
        if self._timeout_task:
            self._timeout_task.cancel()

        # Execute handler
        try:
            result = await handler(self.context, data)
            self.state = to_state

            # Set new timeout if not idle
            if to_state != State.IDLE:
                self._timeout_task = asyncio.create_task(
                    self._handle_timeout()
                )

            return result
        except Exception as e:
            self.state = State.ERROR
            raise

    async def _handle_timeout(self):
        """Reset to IDLE after timeout."""
        await asyncio.sleep(self.timeout)
        self.state = State.IDLE
        self.context = {}


# Usage example: Moderation flow
async def setup_ban_flow(machine: ConversationStateMachine):
    async def start_ban(ctx, data):
        ctx['target_user'] = data['target']
        ctx['reason'] = data.get('reason', 'No reason provided')
        return f"Confirm ban of {ctx['target_user']}? (yes/no)"

    async def confirm_ban(ctx, data):
        if data['response'].lower() == 'yes':
            await ban_user(ctx['target_user'], ctx['reason'])
            return f"Banned {ctx['target_user']}"
        return "Ban cancelled"

    async def cancel(ctx, data):
        return "Operation cancelled"

    machine.register_transition(State.IDLE, 'ban', State.AWAITING_CONFIRMATION, start_ban)
    machine.register_transition(State.AWAITING_CONFIRMATION, 'confirm', State.IDLE, confirm_ban)
    machine.register_transition(State.AWAITING_CONFIRMATION, 'cancel', State.IDLE, cancel)
```

## Key Principles

1. **Separation of concerns**: Commands, events, and scheduled tasks in separate processors
2. **Service layer**: Business logic isolated from platform-specific code
3. **State management**: Explicit states prevent race conditions in multi-turn interactions
4. **Timeout handling**: Auto-reset prevents stuck conversations
5. **Data layer abstraction**: PostgreSQL for persistence, Redis for caching/rate limits

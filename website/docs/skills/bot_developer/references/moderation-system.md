---
title: Moderation System
sidebar_label: Moderation System
sidebar_position: 2
---
# Moderation System

Production moderation with escalation, decay, and auto-mod.

## Point-Based Moderation Service

```python
from datetime import datetime, timedelta
from enum import IntEnum
from typing import Optional
import asyncpg

class ActionSeverity(IntEnum):
    NOTE = 0        # Just a record, no action
    WARNING = 1     # Formal warning
    MUTE = 2        # Temporary mute
    KICK = 3        # Remove from server
    TEMP_BAN = 4    # Temporary ban
    BAN = 5         # Permanent ban

class ModerationService:
    """
    Production moderation system with:
    - Point-based escalation
    - Automatic decay
    - Appeal system
    - Audit logging
    """

    POINT_CONFIG = {
        ActionSeverity.NOTE: 0,
        ActionSeverity.WARNING: 1,
        ActionSeverity.MUTE: 2,
        ActionSeverity.KICK: 3,
        ActionSeverity.TEMP_BAN: 5,
        ActionSeverity.BAN: 10,
    }

    DECAY_RATE = 0.1  # Points per day

    def __init__(self, db: asyncpg.Pool):
        self.db = db

    async def add_infraction(
        self,
        guild_id: int,
        user_id: int,
        moderator_id: int,
        action: ActionSeverity,
        reason: str,
        duration: Optional[timedelta] = None
    ) -> dict:
        """Record an infraction and return recommended action."""

        # Get current points (with decay applied)
        current_points = await self._get_user_points(guild_id, user_id)
        new_points = current_points + self.POINT_CONFIG[action]

        # Record infraction
        infraction_id = await self.db.fetchval("""
            INSERT INTO infractions (guild_id, user_id, moderator_id, action, reason, duration, points)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        """, guild_id, user_id, moderator_id, action.value, reason, duration, self.POINT_CONFIG[action])

        # Check escalation thresholds
        recommended_action = self._get_recommended_action(new_points)

        # Log to audit
        await self._audit_log(guild_id, {
            'type': 'INFRACTION_ADDED',
            'infraction_id': infraction_id,
            'user_id': user_id,
            'action': action.name,
            'new_total_points': new_points,
            'recommended_escalation': recommended_action.name if recommended_action else None
        })

        return {
            'infraction_id': infraction_id,
            'current_points': new_points,
            'recommended_action': recommended_action,
            'history_count': await self._get_infraction_count(guild_id, user_id)
        }

    async def _get_user_points(self, guild_id: int, user_id: int) -> float:
        """Get current points with time decay applied."""
        rows = await self.db.fetch("""
            SELECT points, created_at FROM infractions
            WHERE guild_id = $1 AND user_id = $2 AND pardoned = FALSE
        """, guild_id, user_id)

        total = 0.0
        now = datetime.utcnow()

        for row in rows:
            age_days = (now - row['created_at']).days
            decayed_points = max(0, row['points'] - (age_days * self.DECAY_RATE))
            total += decayed_points

        return total

    def _get_recommended_action(self, points: float) -> Optional[ActionSeverity]:
        """Get recommended escalation based on point total."""
        if points >= 15:
            return ActionSeverity.BAN
        elif points >= 10:
            return ActionSeverity.TEMP_BAN
        elif points >= 6:
            return ActionSeverity.KICK
        elif points >= 3:
            return ActionSeverity.MUTE
        return None
```

## Escalation Thresholds

| Points | Recommended Action |
|--------|-------------------|
| 0-2 | No action |
| 3-5 | Mute |
| 6-9 | Kick |
| 10-14 | Temp Ban |
| 15+ | Permanent Ban |

## Auto-Mod Rules

```python
class AutoMod:
    """Automatic moderation with configurable rules."""

    def __init__(self, config: dict):
        self.rules = config.get('rules', {})

    async def check_message(self, message) -> list[dict]:
        """Check message against all rules, return violations."""
        violations = []

        # Spam detection (message frequency)
        if self.rules.get('spam_enabled'):
            if await self._check_spam(message):
                violations.append({
                    'rule': 'spam',
                    'action': self.rules['spam_action'],
                    'reason': 'Message spam detected'
                })

        # Caps lock abuse
        if self.rules.get('caps_enabled'):
            caps_ratio = sum(1 for c in message.content if c.isupper()) / max(len(message.content), 1)
            if caps_ratio > self.rules.get('caps_threshold', 0.7) and len(message.content) > 10:
                violations.append({
                    'rule': 'caps',
                    'action': self.rules['caps_action'],
                    'reason': 'Excessive caps lock'
                })

        # Link filtering
        if self.rules.get('links_enabled'):
            import re
            urls = re.findall(r'https?://\S+', message.content)
            for url in urls:
                if not any(allowed in url for allowed in self.rules.get('link_whitelist', [])):
                    violations.append({
                        'rule': 'links',
                        'action': self.rules['links_action'],
                        'reason': f'Unauthorized link: \{url\}'
                    })

        # Word filter (with Levenshtein for bypass attempts)
        if self.rules.get('words_enabled'):
            from rapidfuzz import fuzz
            words = message.content.lower().split()
            for word in words:
                for banned in self.rules.get('banned_words', []):
                    if fuzz.ratio(word, banned) > 85:  # Catches l33t speak, typos
                        violations.append({
                            'rule': 'banned_word',
                            'action': self.rules['words_action'],
                            'reason': 'Banned word detected'
                        })
                        break

        return violations
```

## Auto-Mod Rule Types

| Rule | Detection | Bypass Prevention |
|------|-----------|-------------------|
| **Spam** | Message frequency tracking | Per-user sliding window |
| **Caps** | Character ratio analysis | Minimum length threshold |
| **Links** | URL regex extraction | Whitelist approved domains |
| **Words** | Dictionary matching | Levenshtein fuzzy matching (85%) |
| **Mentions** | @mention counting | Role/user/everyone variants |
| **Invites** | Discord invite regex | Shortened URL expansion |

---
title: Platform Templates
sidebar_label: Platform Templates
sidebar_position: 3
---
# Platform Templates

Production templates for Discord and Telegram bots.

## Discord.py Production Template

```python
import discord
from discord import app_commands
from discord.ext import commands, tasks
import asyncpg
import redis.asyncio as redis
import logging
import sys
from typing import Optional

# Proper logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(name)s | %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('bot.log')
    ]
)
logger = logging.getLogger('bot')

class ProductionBot(commands.Bot):
    """Production-ready Discord bot with proper resource management."""

    def __init__(self):
        intents = discord.Intents.default()
        intents.message_content = True
        intents.members = True

        super().__init__(
            command_prefix=commands.when_mentioned_or('!'),
            intents=intents,
            activity=discord.Activity(
                type=discord.ActivityType.watching,
                name="for /help"
            )
        )

        self.db: Optional[asyncpg.Pool] = None
        self.redis: Optional[redis.Redis] = None

    async def setup_hook(self) -> None:
        """Called when bot is starting up."""
        # Database connection pool
        self.db = await asyncpg.create_pool(
            'postgresql://user:pass@localhost/botdb',
            min_size=5,
            max_size=20,
            command_timeout=60
        )
        logger.info("Database pool created")

        # Redis connection
        self.redis = redis.Redis.from_url(
            'redis://localhost:6379',
            decode_responses=True
        )
        logger.info("Redis connected")

        # Load cogs
        for cog in ['moderation', 'economy', 'fun', 'admin']:
            try:
                await self.load_extension(f'cogs.{cog}')
                logger.info(f"Loaded cog: {cog}")
            except Exception as e:
                logger.error(f"Failed to load cog {cog}: {e}")

        # Sync commands
        await self.tree.sync()
        logger.info("Commands synced")

        # Start background tasks
        self.cleanup_task.start()

    async def close(self) -> None:
        """Cleanup on shutdown."""
        logger.info("Shutting down...")

        self.cleanup_task.cancel()

        if self.db:
            await self.db.close()
        if self.redis:
            await self.redis.close()

        await super().close()

    @tasks.loop(hours=1)
    async def cleanup_task(self):
        """Periodic cleanup of expired data."""
        async with self.db.acquire() as conn:
            await conn.execute("DELETE FROM mutes WHERE expires_at < NOW()")
            await conn.execute("DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days'")

    async def on_error(self, event: str, *args, **kwargs):
        """Global error handler."""
        logger.exception(f"Error in {event}")
        if self.redis:
            await self.redis.publish('bot_errors', f"Error in {event}")
```

## Telegram Bot with Webhooks

```python
from fastapi import FastAPI, Request
from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters

app = FastAPI()

# Telegram app (don't use polling in production!)
telegram_app = Application.builder().token(BOT_TOKEN).build()

@app.post("/webhook/{token}")
async def telegram_webhook(token: str, request: Request):
    """Receive Telegram updates via webhook."""

    # Verify token matches (simple security)
    if token != WEBHOOK_TOKEN:
        return {"error": "Invalid token"}

    # Verify Telegram signature if using secret_token
    secret_token = request.headers.get("X-Telegram-Bot-Api-Secret-Token")
    if secret_token != TELEGRAM_SECRET:
        return {"error": "Invalid signature"}

    data = await request.json()
    update = Update.de_json(data, telegram_app.bot)

    await telegram_app.process_update(update)

    return {"ok": True}

# Set webhook on startup
@app.on_event("startup")
async def setup_webhook():
    await telegram_app.bot.set_webhook(
        url=f"https://mybot.com/webhook/{WEBHOOK_TOKEN}",
        secret_token=TELEGRAM_SECRET,
        allowed_updates=["message", "callback_query"],
        drop_pending_updates=True
    )
```

## Security Checklist

```
TOKEN SECURITY
├── Never commit tokens to git
├── Use environment variables or secret manager
├── Rotate tokens if exposed
└── Use separate tokens for dev/staging/prod

PERMISSION CHECKS
├── Always verify user has permission before action
├── Use Discord's permission system, don't roll your own
├── Check bot's permissions before attempting actions
└── Fail safely if permissions missing

INPUT VALIDATION
├── Sanitize all user input
├── Validate command arguments
├── Use parameterized queries (no SQL injection)
└── Rate limit user-triggered actions

AUDIT LOGGING
├── Log all moderation actions
├── Log permission changes
├── Log configuration changes
└── Retain logs for compliance period
```

## Platform Comparison

| Feature | Discord | Telegram | Slack |
|---------|---------|----------|-------|
| **Connection** | Gateway (WebSocket) | Webhook or Polling | Socket Mode or Webhook |
| **Rate Limits** | Complex per-bucket | Simple global | Per-method |
| **Rich Messages** | Embeds | Markdown + Inline buttons | Blocks |
| **Slash Commands** | Built-in | BotFather menu | Manifest |
| **Media** | Attachments, CDN | Inline file ID | Files API |

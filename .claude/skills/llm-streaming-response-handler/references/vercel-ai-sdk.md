# Vercel AI SDK Integration Patterns

Production patterns for using Vercel AI SDK to handle LLM streaming across providers.

## Why Vercel AI SDK?

**Unified API** across OpenAI, Anthropic, Google, Cohere, Hugging Face:
- Same streaming interface
- Automatic retries
- Built-in token counting
- React hooks

**Timeline**:
- 2023: Released as `ai` package
- 2024: Became de facto standard for Next.js AI apps
- 2024+: Supports 15+ LLM providers

---

## Installation

```bash
npm install ai @ai-sdk/openai @ai-sdk/anthropic
```

---

## Pattern 1: Basic Streaming (useChat Hook)

```typescript
'use client';

import { useChat } from 'ai/react';

export function ChatInterface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat'
  });

  return (
    <div>
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.role}`}>
            {message.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          disabled={isLoading}
          placeholder="Type a message..."
        />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
      </form>
    </div>
  );
}
```

**Server Route** (app/api/chat/route.ts):
```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages
  });

  return result.toAIStreamResponse();
}
```

**What you get**:
- ✅ Streaming automatically handled
- ✅ Message history managed
- ✅ Loading states
- ✅ Error handling
- ✅ Optimistic updates

---

## Pattern 2: Streaming with Tools (Function Calling)

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    tools: {
      getWeather: tool({
        description: 'Get weather for a location',
        parameters: z.object({
          location: z.string().describe('City name')
        }),
        execute: async ({ location }) => {
          const weather = await fetchWeather(location);
          return weather;
        }
      }),
      createReminder: tool({
        description: 'Create a reminder',
        parameters: z.object({
          text: z.string(),
          time: z.string()
        }),
        execute: async ({ text, time }) => {
          await db.reminders.create({ text, time });
          return { success: true };
        }
      })
    }
  });

  return result.toAIStreamResponse();
}
```

**Client** (automatic tool execution):
```typescript
const { messages } = useChat({
  api: '/api/chat',
  onToolCall: ({ toolCall }) => {
    console.log('Tool called:', toolCall.toolName, toolCall.args);
  }
});
```

---

## Pattern 3: Multi-Provider Fallback

```typescript
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    // Try OpenAI first
    const result = await streamText({
      model: openai('gpt-4-turbo'),
      messages
    });

    return result.toAIStreamResponse();
  } catch (error) {
    // Fallback to Anthropic
    console.log('OpenAI failed, falling back to Claude');

    const result = await streamText({
      model: anthropic('claude-3-sonnet-20240229'),
      messages
    });

    return result.toAIStreamResponse();
  }
}
```

---

## Pattern 4: Custom useChat with Abort

```typescript
import { useChat } from 'ai/react';

export function ChatWithAbort() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop
  } = useChat({
    api: '/api/chat'
  });

  return (
    <div>
      {/* Messages */}
      {messages.map((m) => (
        <div key={m.id}>{m.content}</div>
      ))}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit" disabled={isLoading}>
          Send
        </button>
        {isLoading && (
          <button type="button" onClick={stop}>
            Stop
          </button>
        )}
      </form>
    </div>
  );
}
```

---

## Pattern 5: Streaming Object (Structured Output)

For structured data (not just text).

```typescript
import { openai } from '@ai-sdk/openai';
import { streamObject } from 'ai';
import { z } from 'zod';

const recipeSchema = z.object({
  name: z.string(),
  ingredients: z.array(z.object({
    name: z.string(),
    amount: z.string()
  })),
  instructions: z.array(z.string())
});

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await streamObject({
    model: openai('gpt-4-turbo'),
    schema: recipeSchema,
    prompt: `Generate a recipe for: ${prompt}`
  });

  return result.toTextStreamResponse();
}
```

**Client**:
```typescript
'use client';

import { experimental_useObject as useObject } from 'ai/react';

export function RecipeGenerator() {
  const { object, submit, isLoading } = useObject({
    api: '/api/generate-recipe',
    schema: recipeSchema
  });

  return (
    <div>
      <button onClick={() => submit('chocolate cake')}>
        Generate Recipe
      </button>

      {object && (
        <div>
          <h2>{object.name}</h2>
          <h3>Ingredients:</h3>
          <ul>
            {object.ingredients?.map((ing, i) => (
              <li key={i}>{ing.amount} {ing.name}</li>
            ))}
          </ul>
          <h3>Instructions:</h3>
          <ol>
            {object.instructions?.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
```

---

## Pattern 6: Token Counting & Cost Tracking

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    onFinish: ({ usage }) => {
      console.log('Token usage:', usage);
      // { promptTokens: 50, completionTokens: 100, totalTokens: 150 }

      const cost = calculateCost(usage, 'gpt-4-turbo');
      await db.usage.create({ cost, tokens: usage.totalTokens });
    }
  });

  return result.toAIStreamResponse();
}

function calculateCost(usage: any, model: string): number {
  const pricing = {
    'gpt-4-turbo': { input: 0.00001, output: 0.00003 } // per token
  };

  const rates = pricing[model];
  return (
    usage.promptTokens * rates.input +
    usage.completionTokens * rates.output
  );
}
```

---

## Pattern 7: Middleware (Logging, Auth)

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  // Authentication
  const session = await getSession(req);
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Rate limiting
  const { allowed } = await rateLimit(session.user.id);
  if (!allowed) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  const { messages } = await req.json();

  // Log request
  await db.chatLog.create({
    userId: session.user.id,
    prompt: messages[messages.length - 1].content,
    timestamp: new Date()
  });

  const result = await streamText({
    model: openai('gpt-4-turbo'),
    messages,
    onFinish: async ({ text, usage }) => {
      // Log response
      await db.chatLog.update({
        response: text,
        tokens: usage.totalTokens
      });
    }
  });

  return result.toAIStreamResponse();
}
```

---

## Pattern 8: Custom System Prompts

```typescript
const result = await streamText({
  model: openai('gpt-4-turbo'),
  system: `You are a helpful assistant for a cooking app.
           Only provide recipes and cooking advice.
           Keep responses under 200 words.`,
  messages
});
```

---

## Pattern 9: Temperature & Model Parameters

```typescript
const result = await streamText({
  model: openai('gpt-4-turbo'),
  messages,
  temperature: 0.7,  // Creativity (0-2)
  maxTokens: 500,    // Response length limit
  topP: 0.9,         // Nucleus sampling
  frequencyPenalty: 0.5,  // Reduce repetition
  presencePenalty: 0.5    // Encourage new topics
});
```

---

## Production Checklist

```
□ Rate limiting per user
□ Token usage tracking
□ Cost monitoring
□ Error logging
□ Authentication required
□ System prompt defined
□ Max tokens set
□ onFinish handler for analytics
□ Multi-provider fallback
□ Tool calling validated (if used)
```

---

## Comparison: Vercel AI SDK vs Raw API

| Feature | Vercel AI SDK | Raw OpenAI API |
|---------|---------------|----------------|
| Setup complexity | Low | Medium |
| Provider switching | Easy | Manual |
| React hooks | Built-in | Custom |
| Error handling | Automatic | Manual |
| Retries | Yes | No |
| Token counting | Built-in | Manual |
| Type safety | ✅ | ⚠️ |
| Bundle size | +50KB | +10KB (minimal) |

**Use Vercel AI SDK when**:
- Building with Next.js
- Need React hooks
- Want provider flexibility
- Prefer TypeScript safety

**Use raw API when**:
- Non-React framework
- Bundle size critical
- Need custom streaming logic
- Provider-specific features

---

## Resources

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [Examples](https://github.com/vercel/ai/tree/main/examples)
- [API Reference](https://sdk.vercel.ai/docs/reference)

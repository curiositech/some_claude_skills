# Safe Messaging

Recovery-appropriate messaging with crisis detection and safety features.

## useMessages Hook

```tsx
// hooks/useMessages.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isOwn: boolean;
}

export function useMessages(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        sender_id,
        sender:profiles!sender_id(display_name)
      `)
      .eq('conversation_id', conversationId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data.map((m) => ({
        id: m.id,
        senderId: m.sender_id,
        senderName: m.sender.display_name,
        content: m.content,
        createdAt: m.created_at,
        isOwn: m.sender_id === userId,
      })));
    }
    setIsLoading(false);
  }, [conversationId]);

  useEffect(() => {
    loadMessages();

    // Real-time subscription
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const userId = (await supabase.auth.getUser()).data.user?.id;
          const { data: sender } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', payload.new.sender_id)
            .single();

          setMessages((prev) => [
            ...prev,
            {
              id: payload.new.id,
              senderId: payload.new.sender_id,
              senderName: sender?.display_name || 'Unknown',
              content: payload.new.content,
              createdAt: payload.new.created_at,
              isOwn: payload.new.sender_id === userId,
            },
          ]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, loadMessages]);

  const sendMessage = async (content: string) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: userId,
      content,
    });
  };

  return { messages, sendMessage, isLoading };
}
```

## Message Input with Crisis Detection

```tsx
// components/MessageInput.tsx
'use client';

import { useState, useRef } from 'react';

interface Props {
  onSend: (content: string) => void;
  placeholder?: string;
}

// Crisis keywords that should show resources
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'want to die', 'end it all',
  'relapse', 'using again', 'fell off the wagon',
];

export function MessageInput({ onSend, placeholder = "Type a message..." }: Props) {
  const [value, setValue] = useState('');
  const [showCrisisPrompt, setShowCrisisPrompt] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const checkForCrisisKeywords = (text: string) => {
    const lower = text.toLowerCase();
    return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    // Show crisis resources if needed
    if (checkForCrisisKeywords(newValue)) {
      setShowCrisisPrompt(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSend(value.trim());
      setValue('');
      setShowCrisisPrompt(false);
    }
  };

  return (
    <div>
      {showCrisisPrompt && (
        <div className="mb-2 p-3 bg-red-900/30 border border-red-700 rounded-lg">
          <p className="text-sm text-red-300 mb-2">
            It sounds like you might be going through a hard time.
          </p>
          <a
            href="/crisis"
            className="text-sm text-red-400 underline"
          >
            Tap here for crisis resources →
          </a>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 bg-leather-800 rounded"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="px-4 py-3 bg-ember-500 rounded min-h-[44px] disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
```

## Crisis Keywords List

Keywords that trigger crisis resource prompts:

```typescript
const CRISIS_KEYWORDS = [
  // Suicidal ideation
  'suicide', 'kill myself', 'want to die', 'end it all',
  // Relapse indicators
  'relapse', 'using again', 'fell off the wagon',
  // Self-harm
  'hurt myself', 'cutting', 'self-harm',
];
```

## Best Practices

1. **Non-blocking** - Crisis prompts suggest resources, don't block messages
2. **Privacy-first** - Don't log or report crisis keywords automatically
3. **Helpful tone** - Gentle, non-judgmental language
4. **Direct resources** - Link to crisis page, not external sites
5. **Offline capable** - Cache crisis resources for offline access

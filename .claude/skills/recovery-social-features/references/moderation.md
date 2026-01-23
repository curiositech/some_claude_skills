# Safety & Moderation

Content moderation and user blocking patterns for recovery apps.

## Content Moderation Hook

```tsx
// hooks/useContentModeration.ts
'use client';

interface ModerationResult {
  approved: boolean;
  flags: string[];
  crisisDetected: boolean;
}

export function useContentModeration() {
  const checkContent = async (content: string): Promise<ModerationResult> => {
    const response = await fetch(
      'https://your-moderation-worker.workers.dev',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      }
    );

    return response.json();
  };

  return { checkContent };
}
```

## User Blocking Hook

```tsx
// hooks/useBlocking.ts
'use client';

import { supabase } from '@/lib/supabase';

export function useBlocking() {
  const blockUser = async (userId: string) => {
    const currentUser = (await supabase.auth.getUser()).data.user?.id;

    // Create or update friendship to blocked
    await supabase
      .from('friendships')
      .upsert({
        requester_id: currentUser,
        addressee_id: userId,
        status: 'blocked',
      });
  };

  const unblockUser = async (userId: string) => {
    const currentUser = (await supabase.auth.getUser()).data.user?.id;

    await supabase
      .from('friendships')
      .delete()
      .eq('requester_id', currentUser)
      .eq('addressee_id', userId)
      .eq('status', 'blocked');
  };

  const isBlocked = async (userId: string): Promise<boolean> => {
    const currentUser = (await supabase.auth.getUser()).data.user?.id;

    const { data } = await supabase
      .from('friendships')
      .select('id')
      .or(`
        and(requester_id.eq.${currentUser},addressee_id.eq.${userId},status.eq.blocked),
        and(requester_id.eq.${userId},addressee_id.eq.${currentUser},status.eq.blocked)
      `)
      .limit(1);

    return (data?.length ?? 0) > 0;
  };

  return { blockUser, unblockUser, isBlocked };
}
```

## Moderation Categories

| Category | Description | Action |
|----------|-------------|--------|
| `crisis` | Suicidal ideation, self-harm | Show resources, don't block |
| `sourcing` | Drug seeking, dealing | Block + flag for review |
| `harassment` | Personal attacks, threats | Block + flag for review |
| `spam` | Promotional content | Block |
| `explicit` | Sexual/graphic content | Block |

## Blocking Behavior

When a user blocks another:
- Blocked user cannot send messages
- Blocked user cannot see blocker's profile
- Blocked user cannot see blocker in groups
- Existing messages are hidden (not deleted)
- Blocking is one-way (blocked user doesn't know)

## RLS Policy for Blocks

```sql
-- Hide content from blocked users
CREATE POLICY "Hide messages from blocked users" ON messages
  FOR SELECT USING (
    NOT EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'blocked'
      AND (
        (requester_id = auth.uid() AND addressee_id = sender_id)
        OR (addressee_id = auth.uid() AND requester_id = sender_id)
      )
    )
  );
```

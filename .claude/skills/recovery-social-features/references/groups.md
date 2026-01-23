# Meeting-Based Groups

Implementation patterns for ephemeral and permanent meeting groups.

## useMeetingGroup Hook

```tsx
// hooks/useMeetingGroup.ts
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface GroupSettings {
  name: string;
  meetingId?: string;
  visibility: 'public' | 'private' | 'invite';
  ephemeral: boolean;  // Auto-delete after 24h
  maxMembers: number;
}

export function useMeetingGroup() {
  const [isLoading, setIsLoading] = useState(false);

  const createGroup = async (settings: GroupSettings) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert({
          name: settings.name,
          meeting_id: settings.meetingId,
          visibility: settings.visibility,
          max_members: settings.maxMembers,
          expires_at: settings.ephemeral
            ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            : null,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join creator as owner
      await supabase.from('group_members').insert({
        group_id: data.id,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        role: 'owner',
      });

      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const joinGroup = async (groupId: string) => {
    const { error } = await supabase.from('group_members').insert({
      group_id: groupId,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      role: 'member',
    });

    if (error) {
      if (error.message.includes('duplicate')) {
        return; // Already a member
      }
      throw error;
    }
  };

  const leaveGroup = async (groupId: string) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);
  };

  return { createGroup, joinGroup, leaveGroup, isLoading };
}
```

## Quick Meeting Group Component

One-tap group creation when attending a meeting.

```tsx
// components/QuickMeetingGroup.tsx
'use client';

import { useState } from 'react';
import { useMeetingGroup } from '@/hooks/useMeetingGroup';
import type { Meeting } from '@/lib/meetings/types';

interface Props {
  meeting: Meeting;
}

export function QuickMeetingGroup({ meeting }: Props) {
  const { createGroup, isLoading } = useMeetingGroup();
  const [groupCreated, setGroupCreated] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const handleCreate = async () => {
    const group = await createGroup({
      name: `${meeting.name} Group`,
      meetingId: meeting.id,
      visibility: 'invite',
      ephemeral: true,
      maxMembers: 20,
    });

    setInviteCode(group.invite_code);
    setGroupCreated(true);
  };

  if (groupCreated) {
    return (
      <div className="p-4 bg-leather-800 rounded-lg">
        <p className="text-sm text-leather-400 mb-2">
          Group created! Share this code with others at the meeting:
        </p>
        <code className="block px-4 py-3 bg-leather-900 rounded text-center text-xl">
          {inviteCode}
        </code>
        <p className="text-xs text-leather-500 mt-2 text-center">
          This group expires in 24 hours
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={handleCreate}
      disabled={isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-leather-700 rounded"
    >
      <UsersIcon className="w-5 h-5" />
      <span>Start Group Chat</span>
    </button>
  );
}
```

## Group Settings

```typescript
interface GroupSettings {
  name: string;
  meetingId?: string;           // Link to meeting
  visibility: 'public' | 'private' | 'invite';
  ephemeral: boolean;           // Auto-delete after 24h
  maxMembers: number;           // Member limit
}
```

## Group Visibility Options

| Visibility | Who Can See | Who Can Join |
|------------|-------------|--------------|
| `public` | Anyone | Anyone |
| `private` | Members only | Invite only |
| `invite` | Members only | Has invite code |

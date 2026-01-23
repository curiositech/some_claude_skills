# Friend Connections

Peer-to-peer connections with mutual consent and real-time updates.

## useFriendships Hook

```tsx
// hooks/useFriendships.ts
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Friendship {
  id: string;
  status: 'pending' | 'accepted' | 'blocked';
  isRequester: boolean;
  profile: {
    id: string;
    displayName: string;
    avatarIcon?: string;
  };
  createdAt: string;
}

export function useFriendships() {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingReceived, setPendingReceived] = useState<Friendship[]>([]);
  const [pendingSent, setPendingSent] = useState<Friendship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFriendships();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('friendships')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'friendships' },
        () => loadFriendships()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadFriendships = async () => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return;

    const { data } = await supabase
      .from('friendships')
      .select(`
        id,
        status,
        requester_id,
        addressee_id,
        created_at,
        requester:profiles!requester_id(id, display_name, avatar_icon),
        addressee:profiles!addressee_id(id, display_name, avatar_icon)
      `)
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`);

    if (!data) return;

    const mapped = data.map((f) => {
      const isRequester = f.requester_id === userId;
      const otherProfile = isRequester ? f.addressee : f.requester;

      return {
        id: f.id,
        status: f.status,
        isRequester,
        profile: {
          id: otherProfile.id,
          displayName: otherProfile.display_name,
          avatarIcon: otherProfile.avatar_icon,
        },
        createdAt: f.created_at,
      };
    });

    setFriends(mapped.filter((f) => f.status === 'accepted'));
    setPendingReceived(mapped.filter((f) => f.status === 'pending' && !f.isRequester));
    setPendingSent(mapped.filter((f) => f.status === 'pending' && f.isRequester));
    setIsLoading(false);
  };

  const sendRequest = async (targetUserId: string) => {
    await supabase.from('friendships').insert({
      requester_id: (await supabase.auth.getUser()).data.user?.id,
      addressee_id: targetUserId,
      status: 'pending',
    });
  };

  const acceptRequest = async (friendshipId: string) => {
    await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId);
  };

  const rejectRequest = async (friendshipId: string) => {
    await supabase.from('friendships').delete().eq('id', friendshipId);
  };

  const removeFriend = async (friendshipId: string) => {
    await supabase.from('friendships').delete().eq('id', friendshipId);
  };

  return {
    friends,
    pendingReceived,
    pendingSent,
    isLoading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
  };
}
```

## Friend Request Button

```tsx
// components/FriendRequest.tsx
'use client';

import { useFriendships } from '@/hooks/useFriendships';

interface Props {
  userId: string;
  displayName: string;
}

export function FriendRequestButton({ userId, displayName }: Props) {
  const { friends, pendingSent, sendRequest } = useFriendships();

  const isFriend = friends.some((f) => f.profile.id === userId);
  const isPending = pendingSent.some((f) => f.profile.id === userId);

  if (isFriend) {
    return (
      <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded text-sm">
        Friends
      </span>
    );
  }

  if (isPending) {
    return (
      <span className="px-3 py-1 bg-leather-700 text-leather-400 rounded text-sm">
        Request Sent
      </span>
    );
  }

  return (
    <button
      onClick={() => sendRequest(userId)}
      className="px-3 py-1 bg-ember-500 rounded text-sm min-h-[44px]"
    >
      Add Friend
    </button>
  );
}
```

## Pending Friend Requests Component

```tsx
export function PendingFriendRequests() {
  const { pendingReceived, acceptRequest, rejectRequest } = useFriendships();

  if (pendingReceived.length === 0) return null;

  return (
    <div className="p-4 bg-leather-800 rounded-lg">
      <h3 className="font-semibold mb-3">Friend Requests</h3>
      <ul className="space-y-3">
        {pendingReceived.map((request) => (
          <li key={request.id} className="flex items-center justify-between">
            <span>{request.profile.displayName}</span>
            <div className="flex gap-2">
              <button
                onClick={() => acceptRequest(request.id)}
                className="px-3 py-2 bg-green-600 rounded min-h-[44px]"
              >
                Accept
              </button>
              <button
                onClick={() => rejectRequest(request.id)}
                className="px-3 py-2 bg-leather-700 rounded min-h-[44px]"
              >
                Decline
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

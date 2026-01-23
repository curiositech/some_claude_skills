# Accountability Features

Patterns for sharing recovery progress with trusted connections.

## Share Check-In Component

```tsx
// components/ShareCheckIn.tsx
'use client';

import { useState } from 'react';
import type { DailyCheckIn } from '@/lib/types';

interface Props {
  checkIn: DailyCheckIn;
  sponsors: { id: string; displayName: string }[];
}

export function ShareCheckIn({ checkIn, sponsors }: Props) {
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>([]);
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    // Share check-in summary with selected sponsors
    for (const sponsorId of selectedSponsors) {
      await sendCheckInToSponsor(sponsorId, {
        date: checkIn.date,
        mood: checkIn.mood,
        halt: checkIn.halt, // Hungry, Angry, Lonely, Tired
        gratitude: checkIn.gratitude,
      });
    }
    setShared(true);
  };

  if (shared) {
    return (
      <p className="text-green-400">Shared with your sponsor(s)!</p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-leather-400">
        Share today's check-in with:
      </p>

      {sponsors.map((sponsor) => (
        <label key={sponsor.id} className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedSponsors.includes(sponsor.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedSponsors([...selectedSponsors, sponsor.id]);
              } else {
                setSelectedSponsors(selectedSponsors.filter((id) => id !== sponsor.id));
              }
            }}
            className="w-5 h-5"
          />
          <span>{sponsor.displayName}</span>
        </label>
      ))}

      <button
        onClick={handleShare}
        disabled={selectedSponsors.length === 0}
        className="w-full py-3 bg-ember-500 rounded disabled:opacity-50"
      >
        Share Check-In
      </button>
    </div>
  );
}
```

## Sobriety Visibility Settings

```tsx
// components/SobrietyVisibility.tsx
'use client';

import { useState } from 'react';

type Visibility = 'private' | 'sponsors' | 'friends' | 'community';

interface Props {
  currentVisibility: Visibility;
  onUpdate: (visibility: Visibility) => void;
}

const OPTIONS: { value: Visibility; label: string; description: string }[] = [
  {
    value: 'private',
    label: 'Just Me',
    description: 'Only you can see your sobriety date',
  },
  {
    value: 'sponsors',
    label: 'Sponsors Only',
    description: 'Your sponsors can see your progress',
  },
  {
    value: 'friends',
    label: 'Friends',
    description: 'Friends and sponsors can see',
  },
  {
    value: 'community',
    label: 'Community',
    description: 'Anyone in the app can see',
  },
];

export function SobrietyVisibility({ currentVisibility, onUpdate }: Props) {
  return (
    <div className="space-y-2">
      <label className="block text-sm text-leather-400 mb-2">
        Who can see your sobriety date?
      </label>

      {OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onUpdate(option.value)}
          className={`
            w-full p-3 rounded text-left
            ${currentVisibility === option.value
              ? 'bg-ember-500/20 border border-ember-500'
              : 'bg-leather-800'
            }
          `}
        >
          <span className="font-medium">{option.label}</span>
          <span className="block text-sm text-leather-400">
            {option.description}
          </span>
        </button>
      ))}
    </div>
  );
}
```

## Visibility Levels

| Level | Who Can See | Use Case |
|-------|-------------|----------|
| `private` | Only self | Maximum privacy |
| `sponsors` | Self + sponsors | Accountability focus |
| `friends` | Self + sponsors + friends | Peer support |
| `community` | All app users | Public milestone celebrations |

## HALT Check-In Data

```typescript
interface DailyCheckIn {
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;  // 1=worst, 5=best
  halt: {
    hungry: boolean;
    angry: boolean;
    lonely: boolean;
    tired: boolean;
  };
  gratitude?: string;
  notes?: string;
}
```

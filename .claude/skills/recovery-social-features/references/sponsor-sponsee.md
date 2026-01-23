# Sponsor/Sponsee Implementation

Full implementation patterns for invite-based sponsor relationships.

## useSponsorInvite Hook

```tsx
// hooks/useSponsorInvite.ts
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface SponsorInvite {
  code: string;
  expiresAt: Date;
  program: string;
}

export function useSponsorInvite() {
  const [invite, setInvite] = useState<SponsorInvite | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sponsor generates invite code
  const createInvite = async (program: string): Promise<string> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('create_sponsor_invite', {
        program_type: program,
      });

      if (error) throw error;

      setInvite({
        code: data.code,
        expiresAt: new Date(data.expires_at),
        program,
      });

      return data.code;
    } finally {
      setIsLoading(false);
    }
  };

  // Sponsee accepts invite
  const acceptInvite = async (code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('accept_sponsor_invite', {
        invite_code: code,
      });

      if (error) {
        if (error.message.includes('expired')) {
          throw new Error('This invite has expired. Ask your sponsor for a new one.');
        }
        if (error.message.includes('Invalid')) {
          throw new Error('Invalid invite code. Please check and try again.');
        }
        throw error;
      }

      return true;
    } finally {
      setIsLoading(false);
    }
  };

  return { invite, createInvite, acceptInvite, isLoading };
}
```

## Generate Sponsor Invite Component

```tsx
// components/SponsorInvite.tsx
'use client';

import { useState } from 'react';
import { useSponsorInvite } from '@/hooks/useSponsorInvite';

export function GenerateSponsorInvite({ program }: { program: string }) {
  const { invite, createInvite, isLoading } = useSponsorInvite();
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    await createInvite(program);
  };

  const copyCode = async () => {
    if (invite) {
      await navigator.clipboard.writeText(invite.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (invite) {
    return (
      <div className="p-4 bg-leather-800 rounded-lg">
        <p className="text-sm text-leather-400 mb-2">
          Share this code with your sponsee:
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-4 py-3 bg-leather-900 rounded text-xl font-mono tracking-wider">
            {invite.code}
          </code>
          <button
            onClick={copyCode}
            className="px-4 py-3 bg-ember-500 rounded min-h-[44px]"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-leather-500 mt-2">
          Expires in 24 hours
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={handleCreate}
      disabled={isLoading}
      className="w-full py-3 bg-ember-500 rounded min-h-[44px]"
    >
      {isLoading ? 'Generating...' : 'Generate Sponsee Invite'}
    </button>
  );
}
```

## Accept Sponsor Invite Component

```tsx
export function AcceptSponsorInvite() {
  const { acceptInvite, isLoading } = useSponsorInvite();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await acceptInvite(code.toUpperCase().trim());
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invite');
    }
  };

  if (success) {
    return (
      <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
        <p className="text-green-400">Connected with your sponsor!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-leather-400 mb-1">
          Enter invite code from your sponsor
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABCD1234"
          className="w-full px-4 py-3 bg-leather-900 rounded font-mono tracking-wider uppercase"
          maxLength={8}
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading || code.length < 8}
        className="w-full py-3 bg-ember-500 rounded min-h-[44px] disabled:opacity-50"
      >
        {isLoading ? 'Connecting...' : 'Connect with Sponsor'}
      </button>
    </form>
  );
}
```

## Sponsor Dashboard Component

```tsx
// components/SponsorDashboard.tsx
'use client';

import { useSponsorRelationships } from '@/hooks/useSponsorRelationships';

export function SponsorDashboard() {
  const { sponsees, sponsors, isLoading } = useSponsorRelationships();

  return (
    <div className="space-y-6">
      {/* My Sponsors */}
      <section>
        <h2 className="text-lg font-semibold mb-3">My Sponsors</h2>
        {sponsors.length === 0 ? (
          <p className="text-leather-400">No sponsors yet</p>
        ) : (
          <ul className="space-y-2">
            {sponsors.map((sponsor) => (
              <SponsorCard
                key={sponsor.id}
                profile={sponsor.profile}
                program={sponsor.program}
                connectedAt={sponsor.startedAt}
              />
            ))}
          </ul>
        )}
      </section>

      {/* My Sponsees */}
      <section>
        <h2 className="text-lg font-semibold mb-3">My Sponsees</h2>
        {sponsees.length === 0 ? (
          <p className="text-leather-400">No sponsees yet</p>
        ) : (
          <ul className="space-y-2">
            {sponsees.map((sponsee) => (
              <SponseeCard
                key={sponsee.id}
                profile={sponsee.profile}
                program={sponsee.program}
                connectedAt={sponsee.startedAt}
                lastCheckIn={sponsee.lastCheckIn}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
```

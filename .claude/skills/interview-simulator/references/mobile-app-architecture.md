# Mobile App Architecture

Architecture guide for the React Native + Expo companion app that handles morning drills, flash card review, story rehearsal, push notification scheduling, and progress tracking.

---

## Stack Decisions

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React Native + Expo | Cross-platform from single codebase; Expo handles OTA updates, push notifications, audio recording |
| Navigation | Expo Router | File-based routing, consistent with web mental model |
| State | Zustand | Lightweight, no boilerplate, works well with async storage |
| Local Storage | expo-sqlite | Full SQLite for SM-2 scheduling, flash cards, session history |
| Remote Sync | Supabase JS client | Real-time sync when online, queue when offline |
| Voice | ElevenLabs React Native SDK | Simpler than Hume for mobile; emotion detection not needed for morning drills |
| Audio Recording | expo-av | Record story rehearsals for playback and duration tracking |
| Push Notifications | expo-notifications | Schedule local reminders for practice cadence |
| Analytics | Plausible (privacy-focused) | No PII, GDPR-compliant, lightweight |

### Why ElevenLabs for Mobile (Not Hume)

Mobile morning drills are 3-minute story rehearsals. The value is in speaking aloud under time pressure, not in emotion-adaptive interviewer behavior. ElevenLabs provides:
- Simpler SDK integration for React Native
- Lower per-minute cost (~$0.05/min vs ~$0.07/min)
- Faster connection setup (REST API vs WebSocket)
- No camera/face detection needed (saves battery)

Desktop evening sessions use Hume for the full experience. Mobile is the lightweight companion.

---

## App Structure

```
interview-simulator-mobile/
├── app/                          # Expo Router pages
│   ├── _layout.tsx               # Root layout with tab navigation
│   ├── (tabs)/
│   │   ├── home.tsx              # Dashboard: streak, next session, quick actions
│   │   ├── cards.tsx             # Flash card review (SM-2)
│   │   ├── stories.tsx           # Story bank manager
│   │   ├── progress.tsx          # Progress dashboard, charts
│   │   └── settings.tsx          # API keys, notifications, sync
│   ├── drill/
│   │   ├── flash-card.tsx        # Flash card drill session
│   │   └── story-rehearsal.tsx   # Timed story rehearsal with voice
│   └── session/
│       └── [id].tsx              # View past session debrief
├── src/
│   ├── components/
│   │   ├── FlashCard.tsx         # Card display with flip animation
│   │   ├── StoryTimer.tsx        # Countdown timer for rehearsals
│   │   ├── StreakDisplay.tsx     # Daily streak visualization
│   │   ├── RadarChart.tsx        # Dimension score radar
│   │   └── WeaknessHeatmap.tsx   # Round-type weakness heat map
│   ├── hooks/
│   │   ├── useSM2.ts            # SM-2 spaced repetition logic
│   │   ├── useSync.ts           # Supabase sync with offline queue
│   │   ├── useVoice.ts          # ElevenLabs voice interaction
│   │   └── useNotifications.ts  # Push notification scheduling
│   ├── stores/
│   │   ├── cardStore.ts         # Flash card state (Zustand)
│   │   ├── storyStore.ts        # Story bank state
│   │   ├── sessionStore.ts      # Session history state
│   │   └── syncStore.ts         # Sync queue state
│   ├── db/
│   │   ├── schema.ts            # SQLite schema definitions
│   │   ├── migrations.ts        # Schema migration runner
│   │   └── queries.ts           # Typed query helpers
│   └── utils/
│       ├── sm2.ts               # SM-2 algorithm implementation
│       └── scoring.ts           # Score computation helpers
├── assets/                       # Icons, sounds, fonts
└── app.config.ts                 # Expo configuration
```

---

## SM-2 Spaced Repetition Algorithm

The SuperMemo 2 (SM-2) algorithm schedules review intervals based on recall quality. Used for flash cards AND story rehearsal scheduling.

### Algorithm Implementation

```typescript
// SM-2 algorithm implementation
// Reference: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2

interface SM2Card {
  id: string;
  content: string;          // Question or story prompt
  answer?: string;          // Expected answer (flash cards only)
  category: CardCategory;
  // SM-2 state
  easeFactor: number;       // Starts at 2.5, minimum 1.3
  interval: number;         // Days until next review
  repetitions: number;      // Consecutive correct reviews
  nextReviewDate: string;   // ISO date string
  lastReviewDate: string;
  // Metadata
  createdAt: string;
  roundType?: string;       // Which interview round this relates to
}

type CardCategory =
  | 'ml_concepts'           // ML theory, algorithms, math
  | 'system_design'         // System design patterns, tradeoffs
  | 'anthropic_specific'    // Constitutional AI, RLHF, interpretability
  | 'behavioral_stories'    // STAR-L story prompts
  | 'coding_patterns'       // Data structures, Python idioms
  | 'company_knowledge';    // Company-specific facts and culture

interface SM2ReviewResult {
  quality: 0 | 1 | 2 | 3 | 4 | 5;
  // 0: complete blackout
  // 1: incorrect, remembered upon seeing answer
  // 2: incorrect, but answer seemed easy to recall
  // 3: correct with serious difficulty
  // 4: correct after hesitation
  // 5: perfect response
}

function sm2(card: SM2Card, result: SM2ReviewResult): SM2Card {
  const { quality } = result;
  let { easeFactor, interval, repetitions } = card;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect response: reset
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, easeFactor); // Minimum 1.3

  const nextReviewDate = addDays(new Date(), interval).toISOString().split('T')[0];

  return {
    ...card,
    easeFactor,
    interval,
    repetitions,
    nextReviewDate,
    lastReviewDate: new Date().toISOString().split('T')[0],
  };
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
```

### SM-2 React Hook

```typescript
import { useSQLiteContext } from 'expo-sqlite';

interface UseSM2Return {
  dueCards: SM2Card[];
  reviewCard: (cardId: string, quality: SM2ReviewResult['quality']) => Promise<void>;
  addCard: (card: Omit<SM2Card, 'easeFactor' | 'interval' | 'repetitions' | 'nextReviewDate' | 'lastReviewDate'>) => Promise<void>;
  stats: {
    totalCards: number;
    dueToday: number;
    mature: number;      // interval > 21 days
    learning: number;    // interval <= 21 days
    newToday: number;    // reviewed for first time today
  };
}

function useSM2(category?: CardCategory): UseSM2Return {
  const db = useSQLiteContext();
  const [dueCards, setDueCards] = useState<SM2Card[]>([]);
  const [stats, setStats] = useState<UseSM2Return['stats']>({
    totalCards: 0, dueToday: 0, mature: 0, learning: 0, newToday: 0,
  });

  const loadDueCards = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const query = category
      ? `SELECT * FROM flash_cards WHERE next_review_date <= ? AND category = ? ORDER BY next_review_date ASC LIMIT 20`
      : `SELECT * FROM flash_cards WHERE next_review_date <= ? ORDER BY next_review_date ASC LIMIT 20`;

    const params = category ? [today, category] : [today];
    const rows = await db.getAllAsync(query, params);
    setDueCards(rows.map(rowToCard));
  }, [db, category]);

  const reviewCard = useCallback(async (cardId: string, quality: SM2ReviewResult['quality']) => {
    const card = dueCards.find(c => c.id === cardId);
    if (!card) return;

    const updated = sm2(card, { quality });

    await db.runAsync(
      `UPDATE flash_cards SET ease_factor = ?, interval = ?, repetitions = ?,
       next_review_date = ?, last_review_date = ? WHERE id = ?`,
      [updated.easeFactor, updated.interval, updated.repetitions,
       updated.nextReviewDate, updated.lastReviewDate, cardId]
    );

    // Queue for sync
    await queueSync('flash_cards', cardId, 'update');

    await loadDueCards();
  }, [db, dueCards, loadDueCards]);

  useEffect(() => { loadDueCards(); }, [loadDueCards]);

  return { dueCards, reviewCard, addCard, stats };
}
```

---

## Flash Card Categories

### Pre-built Card Decks

The app ships with starter decks that users can customize:

```typescript
const STARTER_DECKS: Record<CardCategory, Array<{ content: string; answer: string }>> = {
  ml_concepts: [
    { content: "What is the bias-variance tradeoff?", answer: "High bias = underfitting (model too simple). High variance = overfitting (model too complex). Sweet spot minimizes total error = bias^2 + variance + irreducible noise." },
    { content: "Explain attention mechanism in transformers", answer: "Q, K, V matrices. Attention(Q,K,V) = softmax(QK^T / sqrt(d_k)) * V. Self-attention lets each token attend to all others. Multi-head allows attending to different representation subspaces." },
    { content: "What is catastrophic forgetting?", answer: "Neural networks lose previously learned information when trained on new data. Mitigations: EWC (elastic weight consolidation), progressive nets, replay buffers, multi-task learning." },
    // ... 50+ cards per category
  ],
  system_design: [
    { content: "When would you choose eventual consistency over strong consistency?", answer: "Eventual: high availability, partition tolerance, read-heavy (DNS, social feeds, caches). Strong: financial transactions, inventory counts, anything where stale reads have business cost. CAP theorem forces the tradeoff." },
    { content: "Explain the leaky bucket vs token bucket rate limiting", answer: "Leaky bucket: requests drain at constant rate, excess queued or dropped. Smooth output. Token bucket: tokens added at rate r, bucket holds b. Allows bursts up to b, then rate-limited to r. More flexible for bursty traffic." },
    // ... 50+ cards
  ],
  anthropic_specific: [
    { content: "What is Constitutional AI (CAI)?", answer: "Train AI to follow principles (constitution) instead of human ratings for every output. Two phases: (1) Self-critique with principles to generate revisions (2) RLAIF - use AI feedback instead of human feedback for RL. Reduces human labeling cost, makes values explicit and auditable." },
    { content: "What is the difference between RLHF and RLAIF?", answer: "RLHF: human ranks outputs, reward model trained on rankings, policy optimized via RL. RLAIF: AI model ranks outputs per constitutional principles. RLAIF advantages: scalable, consistent, transparent (constitution is readable). RLAIF risks: reward hacking, constitution design is hard." },
    // ... 30+ cards
  ],
  behavioral_stories: [
    { content: "Tell me about a time you failed.", answer: "[Your STAR-L story here. This card prompts rehearsal -- record yourself responding in under 3 minutes.]" },
    { content: "When did you disagree with your manager?", answer: "[STAR-L story. Focus on how you handled the disagreement, not just that you were right.]" },
    // ... 12 cards matching story bank categories
  ],
  coding_patterns: [
    { content: "When would you use a deque vs a list in Python?", answer: "deque: O(1) append/pop from both ends. Use for queues, sliding windows, BFS. list: O(1) append/pop from end only. O(n) insert/delete from front. Use deque when you need fast operations on both ends." },
    // ... 40+ cards
  ],
  company_knowledge: [
    { content: "What are Anthropic's core product offerings?", answer: "Claude (consumer chat), Claude API (developer), Claude for Enterprise (SSO, admin, audit), MCP (Model Context Protocol for tool use). Revenue primarily from API and Enterprise." },
    // ... 20+ cards per target company
  ],
};
```

---

## Push Notification Scheduling

### Notification Strategy

```typescript
import * as Notifications from 'expo-notifications';

interface NotificationSchedule {
  morningDrill: { hour: number; minute: number; enabled: boolean };
  eveningReminder: { hour: number; minute: number; daysOfWeek: number[]; enabled: boolean };
  weekendLoop: { hour: number; minute: number; dayOfWeek: number; enabled: boolean };
  staleStoryReminder: { intervalDays: number; enabled: boolean };
}

const DEFAULT_SCHEDULE: NotificationSchedule = {
  morningDrill: { hour: 7, minute: 0, enabled: true },
  eveningReminder: { hour: 18, minute: 30, daysOfWeek: [1, 2, 3, 4], enabled: true }, // Mon-Thu
  weekendLoop: { hour: 10, minute: 0, dayOfWeek: 6, enabled: true }, // Saturday
  staleStoryReminder: { intervalDays: 4, enabled: true },
};

async function scheduleNotifications(schedule: NotificationSchedule): Promise<void> {
  // Cancel all existing scheduled notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Morning drill
  if (schedule.morningDrill.enabled) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '3 flash cards + 1 story',
        body: getDueCardsSummary(), // e.g., "5 ML concepts due, 2 stories need rehearsal"
        data: { screen: 'drill/flash-card' },
      },
      trigger: {
        type: 'daily',
        hour: schedule.morningDrill.hour,
        minute: schedule.morningDrill.minute,
      },
    });
  }

  // Evening session reminder
  if (schedule.eveningReminder.enabled) {
    for (const day of schedule.eveningReminder.daysOfWeek) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Evening mock session',
          body: getWeaknessBasedSuggestion(), // e.g., "Your ML Design scores are lowest -- focus there tonight"
          data: { screen: 'home' },
        },
        trigger: {
          type: 'weekly',
          weekday: day,
          hour: schedule.eveningReminder.hour,
          minute: schedule.eveningReminder.minute,
        },
      });
    }
  }

  // Weekend loop reminder
  if (schedule.weekendLoop.enabled) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Weekend loop simulation',
        body: '2-hour full loop practice. Clear your schedule and close all other apps.',
        data: { screen: 'home' },
      },
      trigger: {
        type: 'weekly',
        weekday: schedule.weekendLoop.dayOfWeek,
        hour: schedule.weekendLoop.hour,
        minute: schedule.weekendLoop.minute,
      },
    });
  }
}
```

### Stale Story Reminders

Track when each story was last rehearsed and nudge when it goes stale:

```typescript
async function checkStaleStories(intervalDays: number): Promise<void> {
  const cutoffDate = addDays(new Date(), -intervalDays).toISOString().split('T')[0];
  const staleStories = await db.getAllAsync(
    `SELECT * FROM stories WHERE last_rehearsed < ? OR last_rehearsed IS NULL`,
    [cutoffDate]
  );

  if (staleStories.length > 0) {
    const storyNames = staleStories.slice(0, 3).map(s => s.title).join(', ');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Stories getting stale',
        body: `You haven't practiced: ${storyNames}. Rehearse one today.`,
        data: { screen: 'stories' },
      },
      trigger: null, // Immediate
    });
  }
}
```

---

## Offline Mode

### What Works Offline

| Feature | Offline | Why |
|---------|---------|-----|
| Flash card review | Yes | Cards stored in SQLite, SM-2 runs locally |
| Story review (read) | Yes | Stories stored in SQLite |
| Story rehearsal (voice) | No | Requires ElevenLabs API for interviewer prompt voice |
| Story rehearsal (timer only) | Yes | Timer + audio recording are local |
| Progress dashboard | Yes | All historical data in SQLite |
| Session history | Yes | Cached from last sync |
| Start new session | No | Requires voice engine + (optionally) whiteboard eval |
| Settings | Yes | Stored locally |

### Sync Strategy

```typescript
import { createClient } from '@supabase/supabase-js';

interface SyncQueueEntry {
  id: string;
  table: string;
  recordId: string;
  operation: 'insert' | 'update' | 'delete';
  payload: any;
  createdAt: string;
  synced: boolean;
}

class SyncManager {
  private supabase;
  private db;

  constructor(supabaseUrl: string, supabaseKey: string, db: SQLiteDatabase) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.db = db;
  }

  // Queue a change for sync when online
  async queueChange(table: string, recordId: string, operation: string, payload: any): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO sync_queue (table_name, record_id, operation, payload, synced)
       VALUES (?, ?, ?, ?, 0)`,
      [table, recordId, operation, JSON.stringify(payload)]
    );
  }

  // Process queue when connection is available
  async processQueue(): Promise<{ synced: number; failed: number }> {
    const pending = await this.db.getAllAsync(
      `SELECT * FROM sync_queue WHERE synced = 0 ORDER BY created_at ASC`
    );

    let synced = 0;
    let failed = 0;

    for (const entry of pending) {
      try {
        const payload = JSON.parse(entry.payload);

        switch (entry.operation) {
          case 'insert':
            await this.supabase.from(entry.table_name).insert(payload);
            break;
          case 'update':
            await this.supabase.from(entry.table_name).update(payload).eq('id', entry.record_id);
            break;
          case 'delete':
            await this.supabase.from(entry.table_name).delete().eq('id', entry.record_id);
            break;
        }

        await this.db.runAsync(`UPDATE sync_queue SET synced = 1 WHERE id = ?`, [entry.id]);
        synced++;
      } catch (error) {
        console.warn(`Sync failed for ${entry.table_name}/${entry.record_id}:`, error);
        failed++;
      }
    }

    return { synced, failed };
  }

  // Pull updates from server (desktop sessions, debrief scores)
  async pullFromServer(lastSyncTimestamp: string): Promise<void> {
    // Pull session scores created on desktop
    const { data: sessions } = await this.supabase
      .from('sessions')
      .select('*')
      .gt('updated_at', lastSyncTimestamp);

    if (sessions?.length) {
      for (const session of sessions) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO sessions (id, round_type, composite_score, debrief, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [session.id, session.round_type, session.composite_score, JSON.stringify(session.debrief), session.created_at, session.updated_at]
        );
      }
    }

    // Update last sync timestamp
    await this.db.runAsync(
      `UPDATE app_state SET value = ? WHERE key = 'last_sync'`,
      [new Date().toISOString()]
    );
  }
}
```

### Conflict Resolution

Desktop and mobile may modify the same data (e.g., flash card review on both). Resolution strategy:

| Data Type | Conflict Strategy | Rationale |
|-----------|------------------|-----------|
| Flash cards (SM-2 state) | Last-write-wins by timestamp | Most recent review is the authoritative state |
| Story bank | Merge (keep both edits) | Stories may be edited differently on each device |
| Session history | Server is source of truth | Desktop creates sessions, mobile only reads them |
| Settings | Last-write-wins | Simple preference sync |
| Streak data | Max of both values | Never lose a streak due to sync lag |

---

## Progress Dashboard

### Key Visualizations

#### Streak Display

```typescript
interface StreakData {
  currentStreak: number;      // Consecutive days with activity
  longestStreak: number;      // All-time best
  todayComplete: boolean;     // Has user done anything today?
  weekActivity: boolean[];    // Last 7 days: [Mon, Tue, ..., Sun]
}
```

#### Dimension Radar Chart

Shows scores across all 7 scoring dimensions (from session-orchestration.md), updated after each desktop session. Uses the last 5 sessions' moving average for stability.

#### Weakness Heat Map

```
              Coding  Design  Behavioral  Presentation  HM   Technical
Technical     ████    ██░░    ████████    ███░░░        ██   ███████
Communication ███░    █████   ██████░░    ████████      ███  ████░░░
Time Mgmt     ██░░    ███░░   ███████░    █████░░       ██░  █████░░
Structure     ████    ██████  █████░░░    ██████░░      ███  ████░░░
Composure     █████   ███░░   ████████    ███░░░░░      ███  ██████░
Questions     ███░░   ████░░  █████████   █████░░░      ████ ████░░░
```

Green = strong (80+), Yellow = moderate (60-79), Red = weak (&lt;60). Empty cells = no data yet for that combination.

#### Session History

Scrollable list of past sessions with:
- Date and round type
- Composite score with trend indicator (up/down/stable)
- Top 1 strength and top 1 weakness from debrief
- Tap to view full debrief

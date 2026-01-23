# Crisis Detection Patterns for Recovery Apps

## The Mission

Detect when a user might be heading toward relapse or crisis **before they ask for help**. Surface support proactively but gently—no alarms, no judgment, just help when they need it.

## Signal Sources

### 1. Check-in Data (HALT Scores)

HALT = Hungry, Angry, Lonely, Tired

```typescript
interface HALTCheckin {
  hungry_score: number;  // 1-5
  angry_score: number;   // 1-5
  lonely_score: number;  // 1-5
  tired_score: number;   // 1-5
  created_at: Date;
}
```

**Red Flags:**
- Any single score jumps 3+ points from 7-day average
- Combined HALT score (sum) exceeds 16 (out of 20)
- Angry score consistently &gt;4 for 3+ days
- Lonely score consistently &gt;4 for 3+ days

### 2. Journal Sentiment

**Red Flag Keywords/Patterns:**

| Pattern | Risk Level | Context |
|---------|------------|---------|
| Ex-partner mentions (3+/week) | High | Relationship triggers are #1 relapse factor |
| "Can't" appearing frequently | Medium | Learned helplessness indicator |
| Sleep disruption mentions | Medium | Often precedes crisis |
| Isolation language | High | "Nobody understands", "alone", "no one cares" |
| Cravings acknowledged | High | Direct trigger awareness |
| Financial stress | Medium | Common relapse trigger |

**NOT Red Flags (false positives to avoid):**
- Discussing past use in recovery context
- Sharing struggles in group therapy
- Processing difficult emotions constructively
- Gratitude journaling about sobriety

### 3. Behavioral Patterns

```typescript
interface BehavioralSignals {
  // Time patterns
  late_night_activity: boolean;     // 2-5am check-ins
  missed_streak: boolean;           // Broke daily streak after 7+ days
  time_since_last_checkin: number;  // Hours

  // Usage patterns
  safety_plan_views: number;        // Spike in views
  sponsor_calls_attempted: number;  // Multiple attempts
  meeting_searches: number;         // Searching but not attending

  // Derived
  engagement_drop: boolean;         // 50%+ reduction in app usage
}
```

### 4. Time-Based Risk Factors

**High Risk Windows:**
- Weekend evenings (Friday 6pm - Sunday midnight)
- Holidays (especially family-related)
- Anniversary dates (sobriety date, loss dates)
- Late night (2-5am)
- Early month (financial stress periods)

## Detection Algorithm

```typescript
interface CrisisRiskAssessment {
  overall_risk: 'low' | 'elevated' | 'high' | 'critical';
  signals: CrisisSignal[];
  recommended_actions: Action[];
  confidence: number;  // 0-1
}

interface CrisisSignal {
  type: string;
  severity: 'low' | 'medium' | 'high';
  evidence: string;
  timestamp: Date;
}

function assessCrisisRisk(userId: string): CrisisRiskAssessment {
  const checkins = getRecentCheckins(userId, 14);  // 2 weeks
  const journals = getRecentJournals(userId, 7);   // 1 week
  const behavior = getUserBehavior(userId);

  const signals: CrisisSignal[] = [];

  // Check HALT patterns
  if (detectAngerSpike(checkins)) {
    signals.push({
      type: 'halt_anger_spike',
      severity: 'high',
      evidence: 'Anger score increased 3+ points in 48 hours',
      timestamp: new Date(),
    });
  }

  if (detectIsolationPattern(checkins)) {
    signals.push({
      type: 'halt_isolation',
      severity: 'high',
      evidence: 'Lonely score &gt;4 for 3 consecutive days',
      timestamp: new Date(),
    });
  }

  // Check behavioral signals
  if (behavior.late_night_activity) {
    signals.push({
      type: 'time_distortion',
      severity: 'medium',
      evidence: 'Check-ins at unusual hours (2-5am)',
      timestamp: new Date(),
    });
  }

  if (behavior.missed_streak && behavior.time_since_last_checkin > 72) {
    signals.push({
      type: 'engagement_drop',
      severity: 'high',
      evidence: 'Daily streak broken, no check-in for 3+ days',
      timestamp: new Date(),
    });
  }

  // Calculate overall risk
  const highSeverityCount = signals.filter(s => s.severity === 'high').length;
  const mediumSeverityCount = signals.filter(s => s.severity === 'medium').length;

  let overall_risk: 'low' | 'elevated' | 'high' | 'critical';
  if (highSeverityCount >= 2) {
    overall_risk = 'critical';
  } else if (highSeverityCount >= 1) {
    overall_risk = 'high';
  } else if (mediumSeverityCount >= 2) {
    overall_risk = 'elevated';
  } else {
    overall_risk = 'low';
  }

  return {
    overall_risk,
    signals,
    recommended_actions: getRecommendedActions(overall_risk, signals),
    confidence: calculateConfidence(signals),
  };
}
```

## Response Actions

### Critical Risk Response

```typescript
const CRITICAL_ACTIONS = [
  {
    type: 'surface_sponsor',
    message: null,  // Just show sponsor contact prominently
    placement: 'top_of_screen',
    persist: true,
  },
  {
    type: 'surface_safety_plan',
    message: 'Your safety plan',  // Gentle, not alarming
    placement: 'prominent_card',
  },
  {
    type: 'surface_crisis_line',
    message: '988 Suicide & Crisis Lifeline',
    placement: 'accessible',  // Available but not pushy
  },
];
```

### High Risk Response

```typescript
const HIGH_RISK_ACTIONS = [
  {
    type: 'gentle_checkin',
    message: 'How are you doing today?',
    placement: 'notification',
    timing: 'next_app_open',
  },
  {
    type: 'suggest_meeting',
    message: 'There\'s a meeting near you in 30 minutes',
    placement: 'home_screen',
  },
  {
    type: 'surface_coping_tools',
    message: null,  // Just make them more visible
    placement: 'quick_access',
  },
];
```

### Elevated Risk Response

```typescript
const ELEVATED_ACTIONS = [
  {
    type: 'encouragement',
    message: 'You\'ve got 47 days. One day at a time.',
    placement: 'subtle',
  },
  {
    type: 'highlight_support',
    message: null,
    placement: 'contacts_reminder',
  },
];
```

## UI/UX Guidelines for Crisis Features

### DO:
- **Surface help without asking** - Don't make them request it
- **Be subtle** - A prominent contact card, not a red alert
- **Reduce friction** - One tap to call sponsor
- **Respect autonomy** - They choose whether to engage
- **Cache everything** - Must work offline in crisis
- **Fast load** - &lt;200ms for crisis resources

### DON'T:
- **Alarm or panic** - No "WE DETECTED YOU'RE IN CRISIS"
- **Be preachy** - No lectures about what they "should" do
- **Block features** - Don't lock them out for their "safety"
- **Require login** - Crisis resources must be accessible
- **Track intrusively** - Be transparent about what's monitored

## Database Schema for Crisis Detection

```sql
-- Store risk assessments (for analysis, not shown to user)
CREATE TABLE crisis_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  overall_risk TEXT CHECK (overall_risk IN ('low', 'elevated', 'high', 'critical')),
  signals JSONB,  -- Array of CrisisSignal objects
  actions_taken JSONB,  -- What we surfaced
  confidence DECIMAL(3,2)
);

-- Track which interventions were shown
CREATE TABLE crisis_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES crisis_risk_assessments(id),
  intervention_type TEXT,
  shown_at TIMESTAMPTZ DEFAULT NOW(),
  engaged BOOLEAN DEFAULT FALSE,  -- Did they tap the sponsor card?
  engagement_at TIMESTAMPTZ
);

-- Index for quick lookup
CREATE INDEX idx_risk_user_recent ON crisis_risk_assessments (user_id, assessed_at DESC);
```

## Privacy Considerations

1. **Assessments are internal** - User never sees "risk score"
2. **No sharing** - Crisis data never leaves the app
3. **User control** - They can disable proactive features
4. **Transparent** - Explain what signals we watch (in settings)
5. **Delete on request** - Full data deletion available
6. **No third parties** - No analytics services see this data

## Testing Crisis Detection

```typescript
// Test cases for crisis detection
const CRISIS_TEST_CASES = [
  {
    name: 'anger_spike',
    checkins: [
      { angry_score: 2, ...baseline },
      { angry_score: 2, ...baseline },
      { angry_score: 5, ...baseline },  // Spike
    ],
    expected_risk: 'high',
  },
  {
    name: 'isolation_pattern',
    checkins: [
      { lonely_score: 4, ...baseline },
      { lonely_score: 5, ...baseline },
      { lonely_score: 5, ...baseline },
    ],
    expected_risk: 'high',
  },
  {
    name: 'engagement_drop',
    behavior: {
      missed_streak: true,
      time_since_last_checkin: 96,  // 4 days
    },
    expected_risk: 'high',
  },
  {
    name: 'stable_user',
    checkins: baselineCheckins(14),  // 14 days of normal
    expected_risk: 'low',
  },
];
```

## Future Enhancements

1. **ML-based sentiment analysis** - Beyond keyword matching
2. **Peer network analysis** - Sponsor check-in patterns
3. **Calendar integration** - Anticipate anniversary dates
4. **Weather correlation** - Seasonal affective patterns
5. **Community signals** - Meeting attendance tracking (opt-in)

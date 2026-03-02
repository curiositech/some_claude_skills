# Session Orchestration

The session orchestrator is the central nervous system of the interview simulator. It selects rounds, adapts difficulty, tracks performance, generates debriefs, and schedules future practice. This document covers the algorithms, data models, and prompts that drive it.

---

## Round Selection Algorithm

### Weakness-Weighted Random Selection

The orchestrator does not simply pick a random round type. It biases selection toward the candidate's weakest areas, with a minimum variety constraint to prevent tunnel vision.

```typescript
interface RoundWeight {
  roundType: RoundType;
  baseWeight: number;       // Inversely proportional to recent score
  varietyBonus: number;     // Bonus if this type hasn't been practiced recently
  finalWeight: number;      // baseWeight + varietyBonus
}

type RoundType =
  | 'coding'
  | 'ml_design'
  | 'behavioral'
  | 'tech_presentation'
  | 'hiring_manager'
  | 'anthropic_technical';

function selectRound(history: SessionHistory[], candidateOverride?: RoundType): RoundType {
  if (candidateOverride) return candidateOverride;

  const recentScores = getRecentScores(history, 10); // Last 10 sessions
  const roundTypes: RoundType[] = [
    'coding', 'ml_design', 'behavioral',
    'tech_presentation', 'hiring_manager', 'anthropic_technical',
  ];

  const weights: RoundWeight[] = roundTypes.map(roundType => {
    // Base weight: inverse of average score (lower score = higher weight)
    const scores = recentScores.filter(s => s.roundType === roundType);
    const avgScore = scores.length > 0
      ? scores.reduce((sum, s) => sum + s.compositeScore, 0) / scores.length
      : 50; // Default 50 for untried round types (medium priority)

    // Invert: score of 80 -> weight 20, score of 30 -> weight 70
    const baseWeight = 100 - avgScore;

    // Variety bonus: days since last practice of this type
    const lastSession = history
      .filter(h => h.roundType === roundType)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    const daysSinceLast = lastSession
      ? (Date.now() - lastSession.timestamp) / (1000 * 60 * 60 * 24)
      : 30; // 30 days if never practiced

    // Variety bonus: +5 per day since last practice, capped at 30
    const varietyBonus = Math.min(30, daysSinceLast * 5);

    return {
      roundType,
      baseWeight,
      varietyBonus,
      finalWeight: baseWeight + varietyBonus,
    };
  });

  // Weighted random selection
  const totalWeight = weights.reduce((sum, w) => sum + w.finalWeight, 0);
  let random = Math.random() * totalWeight;

  for (const w of weights) {
    random -= w.finalWeight;
    if (random <= 0) return w.roundType;
  }

  return weights[0].roundType; // Fallback
}
```

### Minimum Variety Constraint

Even if one round type is very weak, the candidate should not practice it more than 40% of sessions. This prevents burnout and ensures all round types stay fresh.

```typescript
function enforceVarietyConstraint(
  selected: RoundType,
  recentHistory: SessionHistory[],
  maxRatio: number = 0.4,
): RoundType {
  const last10 = recentHistory.slice(-10);
  const selectedCount = last10.filter(h => h.roundType === selected).length;

  if (selectedCount / Math.max(last10.length, 1) >= maxRatio) {
    // This type is over-represented. Pick the least-practiced type instead.
    const typeCounts = new Map<RoundType, number>();
    last10.forEach(h => {
      typeCounts.set(h.roundType, (typeCounts.get(h.roundType) || 0) + 1);
    });

    let leastPracticed: RoundType = selected;
    let minCount = Infinity;

    for (const rt of ALL_ROUND_TYPES) {
      const count = typeCounts.get(rt) || 0;
      if (count < minCount) {
        minCount = count;
        leastPracticed = rt;
      }
    }

    return leastPracticed;
  }

  return selected;
}
```

---

## Adaptive Difficulty

Difficulty adjusts based on performance trends over the last 5 sessions of the same round type. The algorithm smooths noise by using a moving average and only adjusts when the trend is clear.

```typescript
interface DifficultyState {
  roundType: RoundType;
  currentLevel: 1 | 2 | 3 | 4 | 5;
  recentScores: number[];     // Last 5 composite scores for this round type
  trend: 'improving' | 'stable' | 'declining';
}

function adjustDifficulty(state: DifficultyState): DifficultyState {
  const { recentScores, currentLevel } = state;

  if (recentScores.length < 3) {
    // Not enough data to adjust. Stay at current level.
    return { ...state, trend: 'stable' };
  }

  // Calculate trend: compare first half to second half of recent scores
  const midpoint = Math.floor(recentScores.length / 2);
  const firstHalf = recentScores.slice(0, midpoint);
  const secondHalf = recentScores.slice(midpoint);

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const delta = secondAvg - firstAvg;

  // Significant improvement (delta > 10): increase difficulty
  if (delta > 10 && currentLevel < 5) {
    return {
      ...state,
      currentLevel: (currentLevel + 1) as DifficultyState['currentLevel'],
      trend: 'improving',
    };
  }

  // Significant decline (delta < -10): decrease difficulty
  if (delta < -10 && currentLevel > 1) {
    return {
      ...state,
      currentLevel: (currentLevel - 1) as DifficultyState['currentLevel'],
      trend: 'declining',
    };
  }

  // Consistently high scores (avg > 85): increase difficulty
  const overallAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  if (overallAvg > 85 && currentLevel < 5) {
    return {
      ...state,
      currentLevel: (currentLevel + 1) as DifficultyState['currentLevel'],
      trend: 'improving',
    };
  }

  // Consistently low scores (avg < 40): decrease difficulty
  if (overallAvg < 40 && currentLevel > 1) {
    return {
      ...state,
      currentLevel: (currentLevel - 1) as DifficultyState['currentLevel'],
      trend: 'declining',
    };
  }

  return { ...state, trend: 'stable' };
}
```

### What Difficulty Levels Control

| Level | Interviewer Persona | Question Complexity | Follow-up Depth | Time Pressure |
|-------|-------------------|--------------------|-----------------|-|
| 1 (Warm-up) | Friendly | Straightforward, well-defined problem | 1-2 follow-ups | Generous (+10 min) |
| 2 (Standard) | Friendly | Standard difficulty, some ambiguity | 2-3 follow-ups | Normal |
| 3 (Realistic) | Neutral | Realistic interview difficulty | 3-4 follow-ups | Normal |
| 4 (Challenging) | Adversarial | Above-average difficulty, edge cases emphasized | 4-5 follow-ups | Tight (-5 min) |
| 5 (Stress Test) | Adversarial | Hardest possible, unclear requirements | 5-6 follow-ups, hostile tone | Very tight (-10 min) |

---

## Performance Tracking Schema

### Database Schema (Supabase / SQLite)

```sql
-- Core session record
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  round_type TEXT NOT NULL CHECK (round_type IN (
    'coding', 'ml_design', 'behavioral',
    'tech_presentation', 'hiring_manager', 'anthropic_technical'
  )),
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
  interviewer_persona TEXT NOT NULL CHECK (interviewer_persona IN (
    'friendly', 'neutral', 'adversarial', 'socratic'
  )),
  proctor_mode TEXT CHECK (proctor_mode IN ('off', 'training', 'simulation')),
  session_length_minutes INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  composite_score NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-dimension scores for each session
CREATE TABLE session_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  dimension TEXT NOT NULL CHECK (dimension IN (
    'technical_accuracy', 'communication_clarity', 'time_management',
    'structured_thinking', 'composure_under_pressure',
    'question_handling', 'proctor_compliance'
  )),
  score NUMERIC(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100),
  weight NUMERIC(3,2) NOT NULL,
  evidence TEXT,  -- Specific examples from the session
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full debrief for each session
CREATE TABLE debriefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  transcript TEXT,              -- Full session transcript
  emotion_timeline JSONB,      -- Array of {timestamp, emotions}
  proctor_summary JSONB,       -- ProctorSummary object
  whiteboard_evaluations JSONB, -- Array of evaluation results
  strengths TEXT[],
  weaknesses TEXT[],
  improvement_actions TEXT[],
  debrief_read BOOLEAN DEFAULT FALSE,
  debrief_read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audio/video recordings
CREATE TABLE recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  recording_type TEXT NOT NULL CHECK (recording_type IN ('audio', 'video')),
  storage_path TEXT NOT NULL,   -- Supabase storage path
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Story bank for behavioral rounds
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  project_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'failure', 'disagreement', 'changed_opinion', 'ethical_tradeoff',
    'mentorship', 'ambiguity', 'someone_else_right', 'mission'
  )),
  situation TEXT,
  task TEXT,
  action TEXT,
  result TEXT,
  learning TEXT,
  follow_up_depth JSONB,       -- Prepared answers for 6 levels of follow-up
  last_rehearsed TIMESTAMPTZ,
  rehearsal_count INTEGER DEFAULT 0,
  -- SM-2 fields for story rehearsal scheduling
  ease_factor NUMERIC(3,2) DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Flash cards with SM-2 scheduling
CREATE TABLE flash_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  category TEXT NOT NULL CHECK (category IN (
    'ml_concepts', 'system_design', 'anthropic_specific',
    'behavioral_stories', 'coding_patterns', 'company_knowledge'
  )),
  content TEXT NOT NULL,        -- Question
  answer TEXT,                  -- Expected answer
  round_type TEXT,              -- Associated interview round
  -- SM-2 fields
  ease_factor NUMERIC(3,2) DEFAULT 2.5,
  interval_days INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review_date DATE DEFAULT CURRENT_DATE,
  last_review_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Weakness tracker (aggregated from sessions)
CREATE TABLE weakness_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  round_type TEXT NOT NULL,
  dimension TEXT NOT NULL,
  rolling_avg_score NUMERIC(5,2),  -- 5-session rolling average
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')),
  sessions_counted INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, round_type, dimension)
);

-- Indexes for common queries
CREATE INDEX idx_sessions_user_round ON sessions(user_id, round_type, started_at DESC);
CREATE INDEX idx_flash_cards_due ON flash_cards(user_id, next_review_date);
CREATE INDEX idx_stories_review ON stories(user_id, next_review_date);
CREATE INDEX idx_weakness_tracker ON weakness_tracker(user_id);
```

---

## SM-2 Algorithm Details

The SuperMemo 2 algorithm is used for two purposes:
1. **Flash card scheduling**: When to review each concept card
2. **Story rehearsal scheduling**: When to practice each behavioral story

### Algorithm Flow

```
Input: card state (ease_factor, interval, repetitions), quality grade (0-5)

If quality >= 3 (correct response):
  if repetitions == 0: interval = 1 day
  if repetitions == 1: interval = 6 days
  if repetitions >= 2: interval = round(interval * ease_factor)
  repetitions += 1
Else (incorrect response):
  repetitions = 0
  interval = 1 day

Update ease_factor:
  ease_factor += 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  ease_factor = max(1.3, ease_factor)

next_review_date = today + interval days
```

### Quality Grade Definitions

For flash cards:
- **5**: Perfect recall, no hesitation
- **4**: Correct after brief hesitation
- **3**: Correct with difficulty
- **2**: Incorrect, but answer seemed familiar
- **1**: Incorrect, vague memory of answer
- **0**: Complete blackout, no idea

For story rehearsals:
- **5**: Delivered story smoothly in &lt;3 min, hit all STAR-L beats, no filler words
- **4**: Delivered correctly but with some hesitation or minor structural issues
- **3**: Covered the main points but missed beats or went over time
- **2**: Struggled to recall key details, story was incomplete
- **1**: Could only recall the general topic, not the specific details
- **0**: Could not recall the story at all

### Interval Progression Example

A card starting with ease_factor=2.5 and perfect recall (quality=5) every time:

| Review # | Interval | Date (if started Jan 1) |
|----------|----------|------------------------|
| 1 | 1 day | Jan 2 |
| 2 | 6 days | Jan 8 |
| 3 | 15 days | Jan 23 |
| 4 | 38 days | Mar 2 |
| 5 | 94 days | Jun 4 |
| 6 | 235 days | Jan 25 (next year) |

A card with quality=3 (difficulty) reduces ease_factor, leading to shorter intervals:

| Review # | EF | Interval |
|----------|-----|----------|
| 1 | 2.36 | 1 day |
| 2 | 2.22 | 6 days |
| 3 | 2.08 | 13 days |
| 4 | 1.94 | 25 days |
| 5 | 1.80 | 45 days |

A card with a single failure (quality=1) resets to interval=1 day but retains the (reduced) ease factor.

---

## Debrief Generation

### What the Debrief Generator Receives

After each session, the orchestrator compiles all available data and sends it to Claude for debrief generation:

```typescript
interface DebriefInput {
  // Session metadata
  roundType: RoundType;
  difficultyLevel: number;
  interviewerPersona: string;
  sessionLengthMinutes: number;

  // Voice engine data
  transcript: string;                    // Full conversation transcript
  emotionTimeline: EmotionCallback[];    // Timestamped emotion data

  // Proctor data (if enabled)
  proctorSummary: ProctorSummary | null;

  // Whiteboard data (if design round)
  whiteboardEvaluations: Array<{
    timestamp: number;
    evaluation: PeriodicCheckResult | FinalEvaluation;
  }> | null;

  // Historical context
  recentScores: Array<{
    roundType: RoundType;
    compositeScore: number;
    date: string;
  }>;
  knownWeaknesses: string[];
}
```

### Debrief Generation Prompt

```typescript
const DEBRIEF_PROMPT = `You are an expert interview coach generating a post-session debrief.

## Session Data

Round type: {ROUND_TYPE}
Difficulty: {DIFFICULTY}/5
Persona: {PERSONA}
Duration: {DURATION} minutes

## Transcript
{TRANSCRIPT}

## Emotion Timeline
{EMOTION_DATA}

## Proctor Summary
{PROCTOR_SUMMARY}

## Whiteboard Evaluations
{WHITEBOARD_EVALS}

## Known Weaknesses from Previous Sessions
{KNOWN_WEAKNESSES}

---

Generate a comprehensive debrief. Be specific and actionable. Reference exact moments from the transcript. Do not be generically positive.

Respond with JSON:
{
  "composite_score": &lt;0-100>,
  "dimension_scores": {
    "technical_accuracy": {
      "score": &lt;0-100>,
      "evidence": "Specific moment from transcript...",
      "compared_to_last": "improved | stable | declined"
    },
    "communication_clarity": { ... },
    "time_management": { ... },
    "structured_thinking": { ... },
    "composure_under_pressure": { ... },
    "question_handling": { ... },
    "proctor_compliance": { ... }
  },
  "strengths": [
    "Specific strength with transcript reference (at minute X, you said...)"
  ],
  "weaknesses": [
    "Specific weakness with transcript reference"
  ],
  "improvement_actions": [
    {
      "action": "Practice X by doing Y",
      "priority": "high | medium | low",
      "estimated_sessions_to_improve": 3,
      "related_dimension": "technical_accuracy"
    }
  ],
  "emotion_insights": [
    "At minute 12, nervousness spiked when asked about distributed systems. This suggests a knowledge gap rather than a performance issue."
  ],
  "proctor_notes": [
    "2 gaze deviations in the first 10 minutes, then clean for the remainder. Opening jitters appear to cause note-checking behavior."
  ],
  "whiteboard_notes": [
    "Strong component diagram. Missing monitoring layer until prompted at minute 25. Data flow arrows added late."
  ],
  "next_session_recommendation": {
    "round_type": "ml_design",
    "difficulty": 3,
    "focus_area": "monitoring and observability discussion",
    "persona": "neutral"
  }
}

IMPORTANT:
- Reference specific timestamps and quotes from the transcript
- Do not say "good job" without evidence
- Every weakness must have a corresponding improvement action
- The next session recommendation must be based on data, not rotation
- If emotion data shows a pattern (e.g., anxiety increases during specific topics), call it out explicitly`;
```

### Debrief Generation Implementation

```typescript
async function generateDebrief(input: DebriefInput): Promise<Debrief> {
  const prompt = DEBRIEF_PROMPT
    .replace('{ROUND_TYPE}', input.roundType)
    .replace('{DIFFICULTY}', String(input.difficultyLevel))
    .replace('{PERSONA}', input.interviewerPersona)
    .replace('{DURATION}', String(input.sessionLengthMinutes))
    .replace('{TRANSCRIPT}', truncateTranscript(input.transcript, 8000))
    .replace('{EMOTION_DATA}', summarizeEmotions(input.emotionTimeline))
    .replace('{PROCTOR_SUMMARY}', JSON.stringify(input.proctorSummary, null, 2))
    .replace('{WHITEBOARD_EVALS}', JSON.stringify(input.whiteboardEvaluations, null, 2))
    .replace('{KNOWN_WEAKNESSES}', input.knownWeaknesses.join('\n- '));

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const debrief = JSON.parse(response.content[0].text);

  // Store the debrief
  await supabase.from('debriefs').insert({
    session_id: input.sessionId,
    transcript: input.transcript,
    emotion_timeline: input.emotionTimeline,
    proctor_summary: input.proctorSummary,
    whiteboard_evaluations: input.whiteboardEvaluations,
    strengths: debrief.strengths,
    weaknesses: debrief.weaknesses,
    improvement_actions: debrief.improvement_actions,
  });

  return debrief;
}

// Truncate transcript to fit in context window while preserving key moments
function truncateTranscript(transcript: string, maxChars: number): string {
  if (transcript.length <= maxChars) return transcript;

  // Keep first 5 minutes, last 5 minutes, and sample from middle
  const lines = transcript.split('\n');
  const totalLines = lines.length;

  const headLines = lines.slice(0, Math.floor(totalLines * 0.2));
  const tailLines = lines.slice(Math.floor(totalLines * 0.8));

  // Sample evenly from middle
  const middleLines = lines.slice(
    Math.floor(totalLines * 0.2),
    Math.floor(totalLines * 0.8)
  );
  const middleSample = middleLines.filter((_, i) => i % 3 === 0); // Every 3rd line

  const truncated = [
    ...headLines,
    '\n[...transcript truncated for debrief generation...]\n',
    ...middleSample,
    '\n[...]\n',
    ...tailLines,
  ].join('\n');

  return truncated.slice(0, maxChars);
}

// Summarize emotion timeline into readable format
function summarizeEmotions(timeline: EmotionCallback[]): string {
  if (timeline.length === 0) return 'Emotion data unavailable (fallback voice engine used)';

  // Compute per-minute summaries
  const minuteBuckets = new Map<number, EmotionCallback[]>();
  const sessionStart = timeline[0].timestamp;

  timeline.forEach(entry => {
    const minute = Math.floor((entry.timestamp - sessionStart) / 60_000);
    if (!minuteBuckets.has(minute)) minuteBuckets.set(minute, []);
    minuteBuckets.get(minute)!.push(entry);
  });

  const summaries: string[] = [];
  minuteBuckets.forEach((entries, minute) => {
    const avgEmotions = computeAverageEmotions(entries);
    const dominant = avgEmotions.sort((a, b) => b.score - a.score)[0];
    if (dominant.score > 0.4) {
      summaries.push(`Minute ${minute}: dominant emotion "${dominant.name}" (${(dominant.score * 100).toFixed(0)}%)`);
    }
  });

  return summaries.join('\n');
}
```

---

## Weakness Detection

### Cross-Session Pattern Analysis

Run weekly (or after every 5 sessions) to identify persistent weaknesses:

```typescript
interface WeaknessPattern {
  roundType: RoundType;
  dimension: string;
  avgScore: number;
  trend: 'improving' | 'stable' | 'declining';
  sessionsAnalyzed: number;
  specificExamples: string[];   // From debrief improvement_actions
  recommendedAction: string;
}

async function detectWeaknessPatterns(userId: string): Promise<WeaknessPattern[]> {
  // Get all session scores from last 30 days
  const { data: scores } = await supabase
    .from('session_scores')
    .select(`
      *,
      sessions!inner(round_type, started_at, user_id)
    `)
    .eq('sessions.user_id', userId)
    .gte('sessions.started_at', thirtyDaysAgo())
    .order('sessions.started_at', { ascending: false });

  // Group by round_type + dimension
  const groups = new Map<string, typeof scores>();
  scores?.forEach(score => {
    const key = `${score.sessions.round_type}:${score.dimension}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(score);
  });

  const patterns: WeaknessPattern[] = [];

  groups.forEach((groupScores, key) => {
    const [roundType, dimension] = key.split(':');
    const numericScores = groupScores.map(s => Number(s.score));

    if (numericScores.length < 3) return; // Need at least 3 data points

    const avgScore = numericScores.reduce((a, b) => a + b, 0) / numericScores.length;

    // Only flag as weakness if below 65
    if (avgScore >= 65) return;

    // Calculate trend
    const midpoint = Math.floor(numericScores.length / 2);
    const firstHalfAvg = numericScores.slice(0, midpoint).reduce((a, b) => a + b, 0) / midpoint;
    const secondHalfAvg = numericScores.slice(midpoint).reduce((a, b) => a + b, 0) / (numericScores.length - midpoint);
    const trend = secondHalfAvg - firstHalfAvg > 5 ? 'improving'
      : secondHalfAvg - firstHalfAvg < -5 ? 'declining'
      : 'stable';

    patterns.push({
      roundType: roundType as RoundType,
      dimension,
      avgScore,
      trend,
      sessionsAnalyzed: numericScores.length,
      specificExamples: [], // Populated from debriefs
      recommendedAction: generateRecommendation(roundType as RoundType, dimension, avgScore, trend),
    });
  });

  // Sort by severity: declining + low score first
  patterns.sort((a, b) => {
    const severityA = (100 - a.avgScore) + (a.trend === 'declining' ? 20 : 0);
    const severityB = (100 - b.avgScore) + (b.trend === 'declining' ? 20 : 0);
    return severityB - severityA;
  });

  // Update weakness_tracker table
  for (const pattern of patterns) {
    await supabase.from('weakness_tracker').upsert({
      user_id: userId,
      round_type: pattern.roundType,
      dimension: pattern.dimension,
      rolling_avg_score: pattern.avgScore,
      trend: pattern.trend,
      sessions_counted: pattern.sessionsAnalyzed,
      last_updated: new Date().toISOString(),
    }, { onConflict: 'user_id,round_type,dimension' });
  }

  return patterns;
}

function generateRecommendation(
  roundType: RoundType,
  dimension: string,
  avgScore: number,
  trend: string,
): string {
  const recommendations: Record<string, Record<string, string>> = {
    technical_accuracy: {
      coding: 'Practice 2 additional coding problems per week from the problem archetypes list. Focus on tracing through examples aloud.',
      ml_design: 'Review the 7-stage framework and practice filling each stage with specific numbers and trade-offs.',
      behavioral: 'Ensure STAR-L stories have concrete metrics and technical details, not just narrative.',
      default: 'Spend 20 minutes reviewing fundamentals before each practice session.',
    },
    communication_clarity: {
      default: 'Record yourself answering questions and listen for filler words, long pauses, and unclear transitions. Practice the "intent before code" narration pattern.',
    },
    time_management: {
      coding: 'Use the 5/20/10/5 minute budget strictly. Set a timer for each phase.',
      ml_design: 'Use the 5/3/7/5/8/8/5 minute budget. Practice with a visible timer.',
      default: 'Set explicit time targets for each section and practice with a visible countdown.',
    },
    structured_thinking: {
      ml_design: 'Always start with the 7-stage framework, even if the problem seems to need a different structure.',
      default: 'Before answering, state your structure: "I will cover three things: first X, then Y, then Z."',
    },
    composure_under_pressure: {
      default: 'Practice at one difficulty level higher than comfortable. The discomfort IS the training. Use the adversarial persona more often.',
    },
    question_handling: {
      behavioral: 'Practice the follow-up ladder to level 6 for each story. If you can only reach level 3, the story is not ready.',
      default: 'When asked a question you do not know, practice saying "I am not sure about X, but here is how I would approach figuring it out."',
    },
    proctor_compliance: {
      default: 'Practice with proctor in simulation mode. Clear your desk, close extra tabs, and put your phone face-down before starting.',
    },
  };

  const dimRecs = recommendations[dimension] || {};
  return dimRecs[roundType] || dimRecs['default'] || 'Review the relevant skill reference files for this round type.';
}
```

---

## Preparation Plan Adjustment

Weakness data feeds back into the practice schedule. The orchestrator generates a weekly plan that prioritizes weak areas:

```typescript
interface WeeklyPlan {
  week: string;  // ISO week
  sessions: Array<{
    dayOfWeek: number;  // 0=Sun, 1=Mon, ...
    roundType: RoundType;
    difficulty: number;
    focus: string;
    estimatedMinutes: number;
  }>;
  morningDrills: {
    cardCategories: CardCategory[];  // Prioritized by weakness
    storiesToRehearse: string[];     // Story IDs due for rehearsal
  };
  rationale: string;
}

function generateWeeklyPlan(
  weaknesses: WeaknessPattern[],
  availableDays: number[],  // Which days the user practices
  sessionsPerWeek: number,
): WeeklyPlan {
  const sessions = [];

  // Allocate sessions based on weakness severity
  // Top weakness gets 40% of sessions, second gets 30%, rest split evenly
  const topWeakness = weaknesses[0];
  const secondWeakness = weaknesses[1];

  const topCount = Math.ceil(sessionsPerWeek * 0.4);
  const secondCount = Math.ceil(sessionsPerWeek * 0.3);
  const otherCount = sessionsPerWeek - topCount - secondCount;

  // Assign top weakness sessions
  for (let i = 0; i < topCount && i < availableDays.length; i++) {
    sessions.push({
      dayOfWeek: availableDays[i],
      roundType: topWeakness.roundType,
      difficulty: topWeakness.trend === 'declining' ? 2 : 3,
      focus: topWeakness.dimension,
      estimatedMinutes: 45,
    });
  }

  // Assign second weakness sessions
  if (secondWeakness) {
    for (let i = topCount; i < topCount + secondCount && i < availableDays.length; i++) {
      sessions.push({
        dayOfWeek: availableDays[i],
        roundType: secondWeakness.roundType,
        difficulty: 3,
        focus: secondWeakness.dimension,
        estimatedMinutes: 45,
      });
    }
  }

  // Fill remaining with variety
  const remainingTypes = ALL_ROUND_TYPES.filter(
    rt => rt !== topWeakness?.roundType && rt !== secondWeakness?.roundType
  );

  for (let i = topCount + secondCount; i < sessionsPerWeek && i < availableDays.length; i++) {
    sessions.push({
      dayOfWeek: availableDays[i],
      roundType: remainingTypes[i % remainingTypes.length],
      difficulty: 3,
      focus: 'general',
      estimatedMinutes: 30,
    });
  }

  return {
    week: getCurrentISOWeek(),
    sessions,
    morningDrills: {
      cardCategories: weaknesses
        .map(w => roundTypeToCardCategory(w.roundType))
        .filter(Boolean) as CardCategory[],
      storiesToRehearse: [], // Populated from SM-2 schedule
    },
    rationale: `Focus on ${topWeakness?.roundType} (${topWeakness?.dimension}: avg ${topWeakness?.avgScore?.toFixed(0)}, ${topWeakness?.trend}) and ${secondWeakness?.roundType || 'variety'}.`,
  };
}
```

---

## Session Lifecycle Summary

```
1. User opens app → Orchestrator selects round type (weakness-weighted)
2. User confirms or overrides → Orchestrator sets difficulty (adaptive)
3. Session starts:
   a. Voice engine connects (Hume AI or ElevenLabs fallback)
   b. Proctor activates (if enabled)
   c. Whiteboard opens (if design round)
4. During session:
   a. Voice AI drives conversation using round-type-specific prompt
   b. Emotion data streams from Hume → orchestrator adjusts tone/pace
   c. Whiteboard snapshots captured periodically → Claude Vision evaluates
   d. Proctor tracks gaze → flags logged silently (training) or announced (simulation)
5. Session ends:
   a. Final whiteboard capture and evaluation
   b. Emotion timeline compiled
   c. Proctor summary generated
   d. All data sent to debrief generator (Claude)
6. Debrief generated:
   a. Per-dimension scores with evidence
   b. Strengths, weaknesses, improvement actions
   c. Emotion insights, proctor notes, whiteboard notes
   d. Next session recommendation
7. Post-session:
   a. Weakness tracker updated
   b. SM-2 intervals adjusted for related flash cards
   c. Weekly plan recalculated if significant change
   d. Data synced to mobile app
```

# Voice Engine Setup

Integration guide for Hume AI EVI as the primary voice engine, with ElevenLabs as a fallback for cost-constrained or mobile scenarios.

---

## Hume AI EVI Integration

### Why Hume AI

Hume's Empathic Voice Interface (EVI) provides two capabilities no other voice API offers in combination:
1. **Real-time emotion detection** from user speech (nervousness, confidence, hesitation, frustration)
2. **Expression-aware TTS** that adjusts the interviewer voice based on conversation state

For interview simulation, this enables the core differentiator: an AI interviewer that responds to your emotional state the way a real interviewer does -- pressing harder when you seem overconfident, offering encouragement when you are clearly struggling.

### API Setup

```bash
# Install the Hume SDK
npm install hume

# Environment variables
HUME_API_KEY=your_api_key
HUME_SECRET_KEY=your_secret_key
```

### WebSocket Connection

EVI uses a persistent WebSocket for real-time voice streaming. The connection lifecycle:

```typescript
import { HumeClient } from 'hume';

interface EmotionScore {
  name: string;    // "Nervousness", "Confidence", "Hesitation", etc.
  score: number;   // 0.0 - 1.0
}

interface EmotionCallback {
  emotions: EmotionScore[];
  timestamp: number;
  text: string;  // Transcribed user speech
}

class VoiceEngine {
  private client: HumeClient;
  private socket: WebSocket | null = null;
  private persona: InterviewerPersona;
  private emotionHistory: EmotionCallback[] = [];

  constructor(apiKey: string, secretKey: string) {
    this.client = new HumeClient({ apiKey, secretKey });
    this.persona = PERSONAS.neutral;
  }

  async connect(sessionId: string): Promise<void> {
    // Authenticate and get a WebSocket URL
    const auth = await this.client.expressionMeasurement.stream.connect({
      config: {
        language: { granularity: 'sentence' },
        prosody: {},  // Enable prosody (tone) analysis
        face: {},     // Enable facial expression (if video enabled)
      }
    });

    this.socket = auth.socket;

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'expression_measurement') {
        this.handleEmotionData(data, sessionId);
      }
    };
  }

  private handleEmotionData(data: any, sessionId: string): void {
    const emotions: EmotionScore[] = data.prosody?.predictions?.[0]?.emotions || [];
    const callback: EmotionCallback = {
      emotions,
      timestamp: Date.now(),
      text: data.transcript || '',
    };

    this.emotionHistory.push(callback);
    this.adjustPersonaBehavior(callback);
  }

  private adjustPersonaBehavior(latest: EmotionCallback): void {
    const nervousness = latest.emotions.find(e => e.name === 'Anxiety')?.score || 0;
    const confidence = latest.emotions.find(e => e.name === 'Determination')?.score || 0;
    const hesitation = latest.emotions.find(e => e.name === 'Doubt')?.score || 0;

    // Adaptive interviewer behavior
    if (nervousness > 0.7 && this.persona.adaptiveMode) {
      // High nervousness: slow down, offer scaffolding
      this.setTone('encouraging');
      this.setFollowUpDelay(3000); // 3-second pause before follow-up
    } else if (confidence > 0.8 && hesitation < 0.2) {
      // Overconfident: press harder, ask for specifics
      this.setTone('probing');
      this.setFollowUpDelay(500); // Quick follow-up
    } else if (hesitation > 0.6) {
      // Struggling: give more time, rephrase question
      this.setTone('supportive');
      this.setFollowUpDelay(5000); // 5-second pause
    }
  }

  getEmotionTimeline(): EmotionCallback[] {
    return this.emotionHistory;
  }

  async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private setTone(tone: 'encouraging' | 'probing' | 'supportive' | 'neutral'): void {
    // Update the system prompt sent with the next TTS request
    this.persona.currentTone = tone;
  }

  private setFollowUpDelay(ms: number): void {
    this.persona.followUpDelayMs = ms;
  }
}
```

### Interviewer Persona Prompts

Each persona controls the system prompt that drives the voice AI's conversational behavior.

#### Friendly Persona

```typescript
const PERSONAS = {
  friendly: {
    name: 'Friendly',
    adaptiveMode: true,
    currentTone: 'encouraging' as const,
    followUpDelayMs: 2000,
    systemPrompt: `You are a supportive interviewer conducting a mock interview.
Your goal is to help the candidate practice while building their confidence.

Behavior:
- Start with a warm greeting and explain what you'll cover
- After each answer, acknowledge what was strong before asking follow-ups
- If the candidate struggles, rephrase the question or offer a starting point
- Use phrases like "That's a good start, let me ask you to go deeper on..."
- Smile through your voice -- warm, encouraging tone
- Still push for depth, but frame it as curiosity, not testing
- If time is running short, say "Let's move to the next area" rather than cutting off

Do NOT:
- Accept surface-level answers without follow-up
- Be so encouraging that the candidate doesn't get realistic feedback
- Skip difficult topics to avoid discomfort`,
  },

  neutral: {
    name: 'Neutral',
    adaptiveMode: true,
    currentTone: 'neutral' as const,
    followUpDelayMs: 1500,
    systemPrompt: `You are a professional interviewer conducting a mock interview.
Your tone is neutral and businesslike -- neither warm nor cold.

Behavior:
- Brief introduction, then directly into questions
- After each answer, move to the next question or follow-up without extensive commentary
- Ask follow-ups that probe depth: "Can you be more specific about X?"
- Allow natural silence (2-3 seconds) after the candidate finishes before responding
- If the candidate gives a vague answer, ask for a concrete example
- Keep time management tight -- redirect if answers run long

Do NOT:
- Provide coaching or feedback during the session
- React emotionally to good or bad answers
- Hint at whether an answer was correct`,
  },

  adversarial: {
    name: 'Adversarial',
    adaptiveMode: false,  // No adaptation -- stays tough regardless
    currentTone: 'probing' as const,
    followUpDelayMs: 500,
    systemPrompt: `You are a rigorous interviewer who pushes candidates to their limits.
Your goal is to find the edges of the candidate's knowledge.

Behavior:
- Minimal pleasantries, get right to it
- After every answer, ask "Why?" or "What about [edge case]?" or "That seems over-engineered"
- Challenge assumptions: "Are you sure about that number?"
- If the candidate says something incorrect, press: "I'm not sure that's right. Can you walk me through it again?"
- Interrupt long-winded answers: "Let me stop you there -- what's the core point?"
- Ask follow-ups that require the candidate to defend trade-offs
- Maintain professional respect -- tough, not rude

Do NOT:
- Be personally disrespectful or demeaning
- Accept "I don't know" without asking "What would you do to find out?"
- Let the candidate redirect away from a question they're struggling with`,
  },

  socratic: {
    name: 'Socratic',
    adaptiveMode: true,
    currentTone: 'neutral' as const,
    followUpDelayMs: 2000,
    systemPrompt: `You are a Socratic interviewer who guides through questions rather than evaluating answers.
Your goal is to help the candidate discover gaps in their own thinking.

Behavior:
- Ask open-ended questions that expose assumptions
- When the candidate makes a claim, ask "What would need to be true for that to work?"
- Use "What if..." scenarios to probe edge cases
- When they identify a good trade-off, ask "How would you decide between those options?"
- Build on their answers: "You mentioned X -- how does that interact with Y?"
- Allow long thinking pauses without filling the silence
- Guide them toward insights rather than telling them the answer

Do NOT:
- Give the answer directly
- Say "that's wrong" -- instead ask questions that reveal the issue
- Rush through topics -- depth over breadth`,
  },
};
```

### Round-Type Specific Voice Behavior

The interviewer persona is further specialized based on the round type:

#### Coding Round Voice Behavior

```typescript
const CODING_ROUND_OVERLAY = {
  additionalPrompt: `During this coding interview:
- Start by reading the problem statement clearly
- After reading, pause 5 seconds for the candidate to process
- When they start coding, reduce interruptions -- let them work
- If they go silent for &gt;60 seconds, ask "What are you thinking about?"
- When they finish a section, ask "Walk me through what this does"
- For follow-up extensions, say "Now let's add [requirement]"
- If they're stuck, offer ONE hint: "What data structure would give you O(1) lookup?"
- Do NOT give implementation hints -- only structural hints`,
  voiceSettings: {
    speed: 0.9,  // Slightly slower for clarity when reading problems
    stability: 0.8,
  },
};
```

#### Behavioral Round Voice Behavior

```typescript
const BEHAVIORAL_ROUND_OVERLAY = {
  additionalPrompt: `During this behavioral interview:
- Ask the initial question, then LISTEN
- Allow the candidate to speak for 2-3 minutes before any follow-up
- Follow the depth ladder: Surface -> Context -> Decision -> Tradeoff -> Meta-Reflection -> Worldview
- Use silence as a tool -- a 3-second pause after they finish often prompts deeper reflection
- If they give a surface answer, ask "Can you tell me more about what was going through your mind?"
- If they avoid the negative framing, gently redirect: "I appreciate the positive outcome, but I'm curious about what was hard about this"
- Track which level of the follow-up ladder they've reached`,
  voiceSettings: {
    speed: 1.0,
    stability: 0.6,  // More natural variation for conversational tone
  },
};
```

#### System Design Round Voice Behavior

```typescript
const DESIGN_ROUND_OVERLAY = {
  additionalPrompt: `During this system design interview:
- Present the problem, then ask "How would you approach this?"
- This is collaborative -- you are working together, not testing
- When they draw on the whiteboard, narrate what you see: "I see you're adding a cache layer here..."
- Ask probing questions about each component: "Why did you choose X over Y?"
- If they skip a critical component (monitoring, data pipeline), prompt: "What happens after deployment?"
- At the halfway mark, summarize what they've covered and what's remaining
- In the last 5 minutes, ask "What would you change if you had more time?"`,
  voiceSettings: {
    speed: 1.0,
    stability: 0.7,
  },
};
```

---

## Emotion-Adaptive Logic

### Emotion Categories Tracked

Hume AI provides scores for 48 emotion categories. For interview simulation, these are the most relevant:

| Hume Emotion | Interview Signal | Adaptive Response |
|-------------|-----------------|-------------------|
| Anxiety / Nervousness | Candidate is stressed | Slow down, offer scaffolding, extend pause |
| Determination / Confidence | Candidate is comfortable | Increase difficulty, ask harder follow-ups |
| Doubt / Uncertainty | Candidate is unsure | Rephrase question, give partial hint |
| Concentration | Candidate is thinking deeply | Stay silent, do not interrupt |
| Contemplation | Processing complex ideas | Allow extended pause (5-8s) |
| Frustration | Candidate hitting wall | Offer alternative angle or partial scaffold |
| Excitement / Interest | Engaged, in flow | Match energy, ask follow-up that extends |
| Boredom / Disinterest | Question too easy | Skip to harder question or next topic |

### Composite State Detection

Individual emotions are noisy. The engine computes composite states for more reliable adaptation:

```typescript
interface CompositeState {
  state: 'flow' | 'struggling' | 'overconfident' | 'anxious' | 'neutral';
  confidence: number;
  signals: string[];
}

function computeCompositeState(emotions: EmotionScore[]): CompositeState {
  const anxiety = getScore(emotions, 'Anxiety');
  const determination = getScore(emotions, 'Determination');
  const doubt = getScore(emotions, 'Doubt');
  const concentration = getScore(emotions, 'Concentration');
  const frustration = getScore(emotions, 'Frustration');
  const excitement = getScore(emotions, 'Excitement');

  // Flow: high concentration + excitement, low anxiety
  if (concentration > 0.6 && excitement > 0.4 && anxiety < 0.3) {
    return { state: 'flow', confidence: 0.8, signals: ['high focus', 'engaged'] };
  }

  // Struggling: high doubt + frustration, low determination
  if ((doubt > 0.5 || frustration > 0.5) && determination < 0.3) {
    return { state: 'struggling', confidence: 0.7, signals: ['high doubt', 'low confidence'] };
  }

  // Overconfident: high determination, low doubt, fast speech
  if (determination > 0.7 && doubt < 0.2 && anxiety < 0.2) {
    return { state: 'overconfident', confidence: 0.6, signals: ['very confident', 'low self-doubt'] };
  }

  // Anxious: high anxiety, moderate to high doubt
  if (anxiety > 0.6) {
    return { state: 'anxious', confidence: 0.75, signals: ['high anxiety'] };
  }

  return { state: 'neutral', confidence: 0.5, signals: [] };
}
```

---

## ElevenLabs Fallback

When Hume AI is unavailable (API outage, cost constraints, mobile use), fall back to ElevenLabs for voice-only interaction without emotion detection.

### Setup

```bash
npm install elevenlabs

# Environment variable
ELEVENLABS_API_KEY=your_api_key
```

### Fallback Implementation

```typescript
import { ElevenLabsClient } from 'elevenlabs';

class ElevenLabsFallback {
  private client: ElevenLabsClient;
  private voiceId: string;

  constructor(apiKey: string) {
    this.client = new ElevenLabsClient({ apiKey });
    // "Rachel" voice -- professional, clear, neutral tone
    this.voiceId = '21m00Tcm4TlvDq8ikWAM';
  }

  async speak(text: string): Promise<ReadableStream> {
    const audio = await this.client.generate({
      voice: this.voiceId,
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.7,
        similarity_boost: 0.8,
        style: 0.3,
      },
    });
    return audio;
  }

  // No emotion detection -- persona adaptation is disabled
  getEmotionTimeline(): EmotionCallback[] {
    return []; // Empty -- debrief will note "emotion data unavailable"
  }
}
```

### When to Use Each

| Scenario | Engine | Reason |
|----------|--------|--------|
| Desktop evening session | Hume AI EVI | Full emotion detection, adaptive persona |
| Mobile morning drill | ElevenLabs | Cheaper, simpler, emotion less critical for 3-min drills |
| Weekend loop simulation | Hume AI EVI | Must simulate realistic conditions |
| Quick story rehearsal | ElevenLabs | Low-stakes, just need voice playback |
| Hume API outage | ElevenLabs | Automatic fallback, session continues with degraded features |
| Budget-constrained month | ElevenLabs for all | $4.50/mo vs $60-80/mo, lose emotion detection |

---

## Cost Analysis and Optimization

### Hume AI Pricing (as of early 2026)

- ~$0.07/minute of streaming voice interaction
- Emotion analysis included in the per-minute rate
- WebSocket connection has no idle cost (only active voice time billed)

### Cost Reduction Strategies

1. **Hard session time limits**: Enforce the configured session length server-side. A 45-minute session costs ~$3.15 in Hume fees. An unbounded session that runs 90 minutes costs double.

2. **Silence detection**: Pause billing during long thinking pauses (&gt;10s). Hume charges for active audio streaming -- detect silence client-side and mute the stream.

3. **Morning drills on ElevenLabs**: 30 morning drills at 3 min each = 90 min. On Hume: $6.30. On ElevenLabs: ~$4.50. Save $1.80/month and emotion detection adds little value for 3-minute story rehearsals.

4. **Cache common interviewer responses**: For standard phrases ("Tell me about a time when...", "Can you go deeper on that?", "Let's move to the next question"), pre-generate audio with ElevenLabs and serve from cache. Only use live Hume for adaptive responses.

5. **Session recording for review**: Record sessions locally. Candidates can replay and self-evaluate without running a new voice session. Cost: $0 for replay vs $3+ for a new live session.

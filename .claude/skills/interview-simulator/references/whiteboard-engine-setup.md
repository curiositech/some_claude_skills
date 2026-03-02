# Whiteboard Engine Setup

Integration guide for tldraw as the collaborative whiteboard, with Claude Vision API for automated diagram evaluation and scoring.

---

## tldraw React Integration

### Why tldraw

tldraw is an open-source (MIT license) React drawing component with a rich programmatic API. Key advantages for interview simulation:

1. **React-native component**: Drops into a Next.js app with zero friction
2. **Programmatic snapshot**: `editor.getSnapshot()` captures full canvas state; `exportToBlob()` exports to PNG
3. **Shape API**: Can programmatically add shapes, annotations, and evaluation overlays
4. **Collaboration-ready**: Built-in multiplayer support if you want an AI that draws alongside
5. **Persistence**: Canvas state serializes to JSON for session replay

### Installation

```bash
npm install tldraw

# tldraw peer dependencies
npm install @tldraw/tldraw
```

### Basic Integration

```tsx
import { Tldraw, Editor, TLStoreSnapshot } from 'tldraw';
import 'tldraw/tldraw.css';
import { useRef, useCallback } from 'react';

interface WhiteboardProps {
  sessionId: string;
  onSnapshot: (imageBlob: Blob, canvasState: TLStoreSnapshot) => void;
}

export function InterviewWhiteboard({ sessionId, onSnapshot }: WhiteboardProps) {
  const editorRef = useRef<Editor | null>(null);

  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor;

    // Configure for interview-style drawing
    editor.updateInstanceState({
      isGridMode: false,       // Free-form drawing, not snapped
      isDebugMode: false,
    });

    // Set default tool to draw (pencil)
    editor.setCurrentTool('draw');
  }, []);

  return (
    <div style={{ width: '100%', height: '600px', border: '2px solid #333' }}>
      <Tldraw
        onMount={handleMount}
        persistenceKey={`interview-${sessionId}`}
      />
    </div>
  );
}
```

### Toolbar Configuration

For interview simulation, restrict the toolbar to tools that match real whiteboard constraints:

```tsx
const INTERVIEW_TOOLS = [
  'select',   // Pointer for moving shapes
  'draw',     // Freehand drawing (primary tool)
  'rectangle', // Boxes for components
  'arrow',    // Arrows for data flow
  'text',     // Labels
  'eraser',   // Fix mistakes
];

// Hide tools that wouldn't exist on a real whiteboard
const HIDDEN_TOOLS = [
  'image',    // No image imports in a real interview
  'embed',    // No embeds
  'frame',    // Unnecessary complexity
];
```

---

## Periodic Screenshot Strategy

The whiteboard engine captures snapshots at intervals for Claude Vision evaluation. The frequency adapts to user activity.

### Screenshot Timing

| User Activity | Screenshot Interval | Rationale |
|--------------|-------------------|-----------|
| Actively drawing | Every 30 seconds | Capture evolving diagram state during active work |
| Discussing (no drawing) | Every 2 minutes | Canvas is static, save Vision API costs |
| Idle (&gt;30s no input) | Pause screenshots | No new information to evaluate |
| Session end | Final full-canvas capture | Comprehensive evaluation of complete diagram |

### Implementation

```typescript
class WhiteboardCapture {
  private editor: Editor;
  private captureInterval: NodeJS.Timeout | null = null;
  private lastActivityTs: number = Date.now();
  private snapshots: WhiteboardSnapshot[] = [];
  private isDrawing: boolean = false;

  constructor(editor: Editor) {
    this.editor = editor;
    this.setupActivityTracking();
  }

  private setupActivityTracking(): void {
    // Track drawing activity via store changes
    this.editor.store.listen((entry) => {
      this.lastActivityTs = Date.now();
      this.isDrawing = true;

      // Reset drawing flag after 2 seconds of inactivity
      setTimeout(() => {
        if (Date.now() - this.lastActivityTs > 2000) {
          this.isDrawing = false;
        }
      }, 2000);
    });
  }

  startCapturing(sessionId: string): void {
    // Adaptive capture loop
    const captureLoop = async () => {
      const timeSinceActivity = Date.now() - this.lastActivityTs;

      // Skip if idle for &gt;30 seconds
      if (timeSinceActivity > 30_000) {
        this.captureInterval = setTimeout(captureLoop, 5000); // Check again in 5s
        return;
      }

      // Determine interval based on activity
      const interval = this.isDrawing ? 30_000 : 120_000;

      await this.captureSnapshot(sessionId);
      this.captureInterval = setTimeout(captureLoop, interval);
    };

    captureLoop();
  }

  private async captureSnapshot(sessionId: string): Promise<void> {
    // Export canvas to PNG blob
    const shapeIds = this.editor.getCurrentPageShapeIds();
    if (shapeIds.size === 0) return; // Skip empty canvas

    const blob = await this.editor.exportToBlob({
      format: 'png',
      ids: [...shapeIds],
      padding: 20,
    });

    const snapshot: WhiteboardSnapshot = {
      sessionId,
      timestamp: Date.now(),
      imageBlob: blob,
      shapeCount: shapeIds.size,
      canvasState: this.editor.getSnapshot(),
    };

    this.snapshots.push(snapshot);
  }

  async captureFinal(sessionId: string): Promise<WhiteboardSnapshot> {
    await this.captureSnapshot(sessionId);
    return this.snapshots[this.snapshots.length - 1];
  }

  stopCapturing(): void {
    if (this.captureInterval) {
      clearTimeout(this.captureInterval);
      this.captureInterval = null;
    }
  }

  getSnapshots(): WhiteboardSnapshot[] {
    return this.snapshots;
  }
}

interface WhiteboardSnapshot {
  sessionId: string;
  timestamp: number;
  imageBlob: Blob;
  shapeCount: number;
  canvasState: any;
}
```

---

## Claude Vision API Evaluation

### Evaluation Strategy

Two types of evaluations happen during a session:

1. **Periodic checks** (during session): Quick assessment of diagram progress, looking for missing components or structural issues. Used to prompt the voice AI: "I notice you haven't drawn a data pipeline yet -- how does data flow into the system?"

2. **Final evaluation** (post-session): Comprehensive scoring of the complete diagram against a rubric specific to the round type.

### Periodic Check Prompt

```typescript
const PERIODIC_CHECK_PROMPT = `You are evaluating a system design whiteboard diagram during a mock interview.

The candidate is designing: {PROBLEM_DESCRIPTION}

Analyze this diagram snapshot and respond with JSON:

{
  "components_present": ["list of identifiable system components"],
  "components_missing": ["critical components not yet drawn"],
  "structural_issues": ["any unclear connections, missing arrows, ambiguous labels"],
  "progress_assessment": "on_track | falling_behind | ahead",
  "suggested_prompt": "A question the interviewer should ask based on what's drawn or missing. Empty string if diagram looks good."
}

Be concise. This is a mid-session check, not a final evaluation.
Focus on what's MISSING that should be present at this stage of the interview.`;

async function periodicCheck(
  imageBlob: Blob,
  problemDescription: string,
  elapsedMinutes: number,
  totalMinutes: number,
): Promise<PeriodicCheckResult> {
  const base64 = await blobToBase64(imageBlob);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: { type: 'base64', media_type: 'image/png', data: base64 },
        },
        {
          type: 'text',
          text: PERIODIC_CHECK_PROMPT
            .replace('{PROBLEM_DESCRIPTION}', problemDescription)
            + `\n\nElapsed: ${elapsedMinutes}/${totalMinutes} minutes.`,
        },
      ],
    }],
  });

  return JSON.parse(response.content[0].text);
}
```

### Final Evaluation Prompt and Rubric

```typescript
const FINAL_EVALUATION_PROMPT = `You are a senior ML system design interviewer evaluating a candidate's whiteboard diagram.

Problem: {PROBLEM_DESCRIPTION}
Session length: {SESSION_LENGTH} minutes
Round type: {ROUND_TYPE}

Evaluate this final diagram using the rubric below. Score each dimension 1-5 and provide specific evidence.

## Scoring Rubric

### Component Completeness (weight: 25%)
5 - All critical components present with clear labels and connections
4 - Most components present, minor omissions (e.g., monitoring but no alerting)
3 - Core components present but missing important supporting components
2 - Several critical components missing (e.g., no data pipeline, no monitoring)
1 - Only 1-2 components drawn, diagram is skeletal

### Scalability Patterns (weight: 20%)
5 - Explicit scaling annotations (QPS, latency targets, sharding strategy)
4 - Scaling mentioned for key components, some quantification
3 - Generic scaling awareness ("we'd shard this") without specifics
2 - Scaling not addressed for most components
1 - No consideration of scale

### Data Flow Clarity (weight: 20%)
5 - All data flows clearly shown with arrows, labeled with format/protocol
4 - Main flows clear, minor ambiguities in secondary paths
3 - Primary data flow visible but secondary flows unclear or missing
2 - Arrows present but unlabeled, flow direction ambiguous
1 - No clear data flow, disconnected components

### Trade-off Awareness (weight: 15%)
5 - Explicit trade-off annotations on diagram (e.g., "chose X over Y because Z")
4 - Trade-offs mentioned verbally but visible in design choices
3 - Some awareness of trade-offs but not explicitly marked
2 - Design suggests default choices without trade-off consideration
1 - No evidence of trade-off thinking

### Production Readiness (weight: 10%)
5 - Monitoring, logging, alerting, rollback, and failure modes all represented
4 - Monitoring and basic ops present, some gaps
3 - Monitoring box exists but details sparse
2 - No operational components
1 - Design is purely theoretical

### Visual Organization (weight: 10%)
5 - Clean layout, logical grouping, readable labels, consistent style
4 - Generally organized with minor clutter
3 - Readable but disorganized, hard to follow flow
2 - Cluttered, overlapping elements, hard to read
1 - Illegible or nonsensical layout

Respond with JSON:
{
  "scores": {
    "component_completeness": { "score": 1-5, "evidence": "..." },
    "scalability_patterns": { "score": 1-5, "evidence": "..." },
    "data_flow_clarity": { "score": 1-5, "evidence": "..." },
    "tradeoff_awareness": { "score": 1-5, "evidence": "..." },
    "production_readiness": { "score": 1-5, "evidence": "..." },
    "visual_organization": { "score": 1-5, "evidence": "..." }
  },
  "composite_score": <weighted average 0-100>,
  "strengths": ["top 2-3 things done well"],
  "critical_gaps": ["top 2-3 things missing or wrong"],
  "improvement_actions": ["specific things to practice"]
}`;
```

### Cost Per Evaluation

| Evaluation Type | Model | Input Tokens (est.) | Output Tokens (est.) | Cost |
|----------------|-------|--------------------|--------------------|------|
| Periodic check | claude-sonnet-4-20250514 | ~1,500 (image + prompt) | ~200 | ~$0.01 |
| Final evaluation | claude-sonnet-4-20250514 | ~2,000 (image + rubric) | ~500 | ~$0.03 |

For a 45-minute design session with 8 periodic checks and 1 final evaluation:
- Periodic: 8 x $0.01 = $0.08
- Final: 1 x $0.03 = $0.03
- **Total per session: ~$0.11**

### Cost Optimization

1. **Skip periodic checks when canvas is unchanged**: Compare shape count and positions between snapshots. If nothing moved, skip the Vision API call.

2. **Use Haiku for periodic checks**: Periodic checks need less nuance than final evaluation. Switch to `claude-3-5-haiku` for mid-session checks (~$0.003 each) and reserve Sonnet for the final evaluation.

3. **Batch snapshot evaluation**: Instead of evaluating every snapshot, evaluate every 3rd snapshot during active drawing. Most incremental changes don't require evaluation.

4. **Reduce image resolution**: tldraw exports at screen resolution by default. For Vision API evaluation, 1024x768 is sufficient. Higher resolutions add token cost without improving evaluation quality.

```typescript
const blob = await editor.exportToBlob({
  format: 'png',
  ids: [...shapeIds],
  padding: 20,
  // Constrain export dimensions
  scale: 0.5,  // Half resolution
});
```

---

## Diagram Replay

Store canvas state (JSON) at each snapshot for post-session replay. This lets candidates review their diagram evolution without re-running a session.

```typescript
class DiagramReplay {
  private snapshots: Array<{
    timestamp: number;
    canvasState: any;
    evaluation?: PeriodicCheckResult;
  }>;

  constructor(snapshots: WhiteboardSnapshot[]) {
    this.snapshots = snapshots.map(s => ({
      timestamp: s.timestamp,
      canvasState: s.canvasState,
      evaluation: undefined, // Attached after evaluation
    }));
  }

  // Restore canvas to any point in time
  restoreToTimestamp(editor: Editor, timestamp: number): void {
    const snapshot = this.snapshots.find(s => s.timestamp <= timestamp);
    if (snapshot) {
      editor.loadSnapshot(snapshot.canvasState);
    }
  }

  // Get evaluation timeline overlay
  getEvaluationTimeline(): Array<{
    timestamp: number;
    compositeScore: number;
    gaps: string[];
  }> {
    return this.snapshots
      .filter(s => s.evaluation)
      .map(s => ({
        timestamp: s.timestamp,
        compositeScore: s.evaluation!.composite_score || 0,
        gaps: s.evaluation!.critical_gaps || [],
      }));
  }
}
```

---

## Integration with Voice Engine

The whiteboard engine communicates with the voice engine to enable interviewer prompting based on diagram state:

```typescript
// In the session orchestrator
class SessionOrchestrator {
  private voiceEngine: VoiceEngine;
  private whiteboardCapture: WhiteboardCapture;

  async onPeriodicCheck(result: PeriodicCheckResult): Promise<void> {
    // If the diagram is missing a critical component, prompt the interviewer to ask about it
    if (result.suggested_prompt && result.progress_assessment === 'falling_behind') {
      await this.voiceEngine.injectPrompt(result.suggested_prompt);
      // Voice AI will naturally incorporate this into the conversation
      // e.g., "I notice your diagram doesn't show how data gets to the model.
      //         Can you walk me through the data pipeline?"
    }
  }
}
```

---

## tldraw Customization for Interview Context

### Custom Shape: Component Box

Add a custom shape type optimized for system architecture diagrams:

```tsx
import { BaseBoxShapeUtil, TLBaseShape, Rectangle2d } from 'tldraw';

type ComponentShape = TLBaseShape<'component', {
  label: string;
  techStack: string;
  w: number;
  h: number;
}>;

class ComponentShapeUtil extends BaseBoxShapeUtil<ComponentShape> {
  static override type = 'component' as const;

  getDefaultProps(): ComponentShape['props'] {
    return { label: 'Component', techStack: '', w: 200, h: 80 };
  }

  getGeometry(shape: ComponentShape): Rectangle2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  component(shape: ComponentShape) {
    return (
      <div style={{
        width: shape.props.w,
        height: shape.props.h,
        border: '2px solid #333',
        borderRadius: 8,
        padding: 8,
        background: '#f8f8f8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <strong>{shape.props.label}</strong>
        {shape.props.techStack && (
          <small style={{ color: '#666', marginTop: 4 }}>
            {shape.props.techStack}
          </small>
        )}
      </div>
    );
  }

  indicator(shape: ComponentShape) {
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        rx={8}
      />
    );
  }
}
```

### Evaluation Overlay

After each periodic check, overlay evaluation annotations on the canvas:

```typescript
function addEvaluationOverlay(
  editor: Editor,
  result: PeriodicCheckResult,
): void {
  // Add a small indicator for missing components
  result.components_missing.forEach((component, index) => {
    editor.createShape({
      type: 'text',
      x: editor.getViewportScreenBounds().maxX - 250,
      y: 20 + (index * 30),
      props: {
        text: `Missing: ${component}`,
        color: 'red',
        size: 's',
      },
    });
  });

  // Auto-remove overlay after 10 seconds (or on next draw action)
  setTimeout(() => {
    // Remove overlay shapes
  }, 10_000);
}
```

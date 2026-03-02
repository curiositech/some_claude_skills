# Proctor Engine Setup

Integration guide for MediaPipe Face Mesh as a browser-based proctoring engine that tracks gaze direction, detects attention drift, and flags suspicious behavior during mock interview sessions.

---

## Why MediaPipe

MediaPipe Face Mesh runs entirely in the browser via TensorFlow.js. No video is sent to any server. This is critical for a self-practice tool:

1. **Privacy-first**: All processing is local. No video frames leave the device.
2. **Free**: No per-minute or per-session cost. Runs on client hardware.
3. **468 face landmarks**: Enough precision for reliable gaze estimation, including iris tracking.
4. **Real-time**: 30+ FPS on modern hardware (even on mid-range laptops).
5. **No installation**: Works in Chrome/Edge/Firefox via WebAssembly.

Commercial proctoring solutions (ProctorU, ExamSoft, Respondus) are designed for adversarial exam settings. They record video, flag to human reviewers, and cost $10-30 per session. For self-practice, this is overkill with unacceptable privacy trade-offs.

---

## Setup

### Installation

```bash
# MediaPipe Face Mesh via TensorFlow.js
npm install @mediapipe/face_mesh @mediapipe/camera_utils
npm install @tensorflow/tfjs-core @tensorflow/tfjs-backend-webgl
```

### Browser Permissions

The proctor requires camera access. Prompt the user clearly about why:

```typescript
async function requestCameraPermission(): Promise<MediaStream | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },   // Don't need high resolution
        height: { ideal: 480 },
        facingMode: 'user',       // Front camera
        frameRate: { ideal: 15 }, // 15 FPS is sufficient for gaze tracking
      },
      audio: false,  // Audio is handled by the voice engine
    });
    return stream;
  } catch (error) {
    console.warn('Camera access denied. Proctoring disabled for this session.');
    return null;
  }
}
```

---

## Face Mesh Initialization

```typescript
import { FaceMesh, Results } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

class ProctorEngine {
  private faceMesh: FaceMesh;
  private camera: Camera | null = null;
  private videoElement: HTMLVideoElement;
  private flags: ProctorFlag[] = [];
  private config: ProctorConfig;
  private gazeHistory: GazeVector[] = [];
  private facePresent: boolean = false;
  private lastFaceSeenTs: number = Date.now();

  constructor(videoElement: HTMLVideoElement, config: ProctorConfig) {
    this.videoElement = videoElement;
    this.config = config;

    this.faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    this.faceMesh.setOptions({
      maxNumFaces: 2,            // Detect up to 2 faces (flag if &gt;1)
      refineLandmarks: true,     // Enable iris tracking for precise gaze
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.faceMesh.onResults((results) => this.processResults(results));
  }

  async start(): Promise<void> {
    this.camera = new Camera(this.videoElement, {
      onFrame: async () => {
        await this.faceMesh.send({ image: this.videoElement });
      },
      width: 640,
      height: 480,
    });
    await this.camera.start();
  }

  stop(): void {
    this.camera?.stop();
  }

  private processResults(results: Results): void {
    const now = Date.now();

    // Multiple face detection
    if (results.multiFaceLandmarks.length > 1) {
      this.addFlag('multiple_faces', 'Multiple faces detected', now);
    }

    // No face detection
    if (results.multiFaceLandmarks.length === 0) {
      this.facePresent = false;
      const absenceDuration = now - this.lastFaceSeenTs;
      if (absenceDuration > this.config.absenceThresholdMs) {
        this.addFlag('face_absent', `Face absent for ${Math.round(absenceDuration / 1000)}s`, now);
      }
      return;
    }

    this.facePresent = true;
    this.lastFaceSeenTs = now;

    const landmarks = results.multiFaceLandmarks[0];
    const gaze = this.estimateGaze(landmarks);
    this.gazeHistory.push({ ...gaze, timestamp: now });

    // Gaze deviation check
    this.checkGazeDeviation(gaze, now);
  }

  getFlags(): ProctorFlag[] {
    return this.flags;
  }

  getGazeHistory(): GazeVector[] {
    return this.gazeHistory;
  }
}
```

---

## Gaze Vector Calculation

MediaPipe Face Mesh provides 468 face landmarks. For gaze estimation, we use the iris landmarks (introduced with `refineLandmarks: true`) plus head pose estimation.

### Key Landmark Indices

```typescript
// MediaPipe Face Mesh landmark indices for gaze estimation
const LANDMARKS = {
  // Left eye
  LEFT_EYE_INNER: 133,
  LEFT_EYE_OUTER: 33,
  LEFT_EYE_TOP: 159,
  LEFT_EYE_BOTTOM: 145,

  // Right eye
  RIGHT_EYE_INNER: 362,
  RIGHT_EYE_OUTER: 263,
  RIGHT_EYE_TOP: 386,
  RIGHT_EYE_BOTTOM: 374,

  // Iris (with refineLandmarks enabled)
  LEFT_IRIS_CENTER: 468,    // Center of left iris
  LEFT_IRIS_TOP: 469,
  LEFT_IRIS_BOTTOM: 471,
  LEFT_IRIS_LEFT: 470,
  LEFT_IRIS_RIGHT: 472,

  RIGHT_IRIS_CENTER: 473,   // Center of right iris
  RIGHT_IRIS_TOP: 474,
  RIGHT_IRIS_BOTTOM: 476,
  RIGHT_IRIS_LEFT: 475,
  RIGHT_IRIS_RIGHT: 477,

  // Head pose reference points
  NOSE_TIP: 1,
  CHIN: 152,
  LEFT_CHEEK: 234,
  RIGHT_CHEEK: 454,
  FOREHEAD: 10,
};
```

### Gaze Estimation Algorithm

```typescript
interface GazeVector {
  horizontalAngle: number;  // Degrees: negative=left, positive=right
  verticalAngle: number;    // Degrees: negative=down, positive=up
  confidence: number;        // 0-1 confidence in the estimate
  timestamp: number;
}

function estimateGaze(landmarks: NormalizedLandmark[]): Omit<GazeVector, 'timestamp'> {
  // Step 1: Get iris positions relative to eye boundaries
  const leftIris = landmarks[LANDMARKS.LEFT_IRIS_CENTER];
  const leftEyeInner = landmarks[LANDMARKS.LEFT_EYE_INNER];
  const leftEyeOuter = landmarks[LANDMARKS.LEFT_EYE_OUTER];
  const leftEyeTop = landmarks[LANDMARKS.LEFT_EYE_TOP];
  const leftEyeBottom = landmarks[LANDMARKS.LEFT_EYE_BOTTOM];

  const rightIris = landmarks[LANDMARKS.RIGHT_IRIS_CENTER];
  const rightEyeInner = landmarks[LANDMARKS.RIGHT_EYE_INNER];
  const rightEyeOuter = landmarks[LANDMARKS.RIGHT_EYE_OUTER];

  // Step 2: Calculate horizontal iris position within eye (0=inner, 1=outer)
  const leftEyeWidth = distance2D(leftEyeInner, leftEyeOuter);
  const leftIrisHoriz = (leftIris.x - leftEyeInner.x) / (leftEyeOuter.x - leftEyeInner.x);

  const rightEyeWidth = distance2D(rightEyeInner, rightEyeOuter);
  const rightIrisHoriz = (rightIris.x - rightEyeInner.x) / (rightEyeOuter.x - rightEyeInner.x);

  // Average both eyes for robustness
  const avgHorizontalRatio = (leftIrisHoriz + rightIrisHoriz) / 2;

  // Step 3: Calculate vertical iris position (0=top, 1=bottom)
  const leftEyeHeight = distance2D(leftEyeTop, leftEyeBottom);
  const leftIrisVert = (leftIris.y - leftEyeTop.y) / (leftEyeBottom.y - leftEyeTop.y);

  // Step 4: Convert ratios to angles
  // Center position is ~0.5. Deviation from center maps to gaze angle.
  // Empirical calibration: 0.1 deviation ≈ 15 degrees
  const horizontalAngle = (avgHorizontalRatio - 0.5) * 150; // degrees
  const verticalAngle = (leftIrisVert - 0.5) * 120;          // degrees

  // Step 5: Add head pose compensation
  const headYaw = estimateHeadYaw(landmarks);
  const compensatedHorizontal = horizontalAngle + headYaw;

  // Step 6: Confidence based on face detection quality
  const confidence = calculateConfidence(landmarks);

  return {
    horizontalAngle: compensatedHorizontal,
    verticalAngle,
    confidence,
  };
}

function estimateHeadYaw(landmarks: NormalizedLandmark[]): number {
  // Use nose tip and cheek landmarks to estimate head rotation
  const noseTip = landmarks[LANDMARKS.NOSE_TIP];
  const leftCheek = landmarks[LANDMARKS.LEFT_CHEEK];
  const rightCheek = landmarks[LANDMARKS.RIGHT_CHEEK];

  const leftDist = distance2D(noseTip, leftCheek);
  const rightDist = distance2D(noseTip, rightCheek);

  // Asymmetry in nose-to-cheek distance indicates head rotation
  const ratio = leftDist / (leftDist + rightDist);
  return (ratio - 0.5) * 90; // Approximate degrees
}

function distance2D(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function calculateConfidence(landmarks: NormalizedLandmark[]): number {
  // Higher confidence when face is frontal and well-lit
  // Lower confidence with extreme angles or partial occlusion
  const headYaw = Math.abs(estimateHeadYaw(landmarks));
  if (headYaw > 45) return 0.3;  // Extreme angle
  if (headYaw > 30) return 0.5;  // Moderate angle
  if (headYaw > 15) return 0.7;  // Slight angle
  return 0.9;                     // Frontal
}
```

---

## Suspicion Thresholds

Two modes with different sensitivities:

### Training Mode (Lenient)

For building good habits without constant interruption. Flags are logged but don't interrupt the session.

```typescript
const TRAINING_CONFIG: ProctorConfig = {
  mode: 'training',
  absenceThresholdMs: 10_000,        // 10s before flagging absence
  gazeDeviationAngle: 35,            // Degrees off-center before flagging
  gazeDeviationDurationMs: 5_000,    // Must sustain deviation for 5s
  multipleFaceAction: 'log',         // Just log, don't interrupt
  interruptOnFlag: false,            // Never interrupt the session
  maxFlagsBeforeWarning: 10,         // Warn in debrief if &gt;10 flags
  cooldownBetweenFlagsMs: 30_000,    // Minimum 30s between same flag type
};
```

### Simulation Mode (Strict)

For realistic exam conditions during weekend loop simulations.

```typescript
const SIMULATION_CONFIG: ProctorConfig = {
  mode: 'simulation',
  absenceThresholdMs: 5_000,         // 5s before flagging
  gazeDeviationAngle: 25,            // Tighter angle threshold
  gazeDeviationDurationMs: 3_000,    // Flag after 3s sustained deviation
  multipleFaceAction: 'flag_severe', // Severe flag for multiple faces
  interruptOnFlag: true,             // Voice AI acknowledges: "I noticed you looked away"
  maxFlagsBeforeWarning: 5,          // Stricter limit
  cooldownBetweenFlagsMs: 15_000,    // More frequent flagging allowed
};
```

### Gaze Deviation Detection

```typescript
function checkGazeDeviation(gaze: GazeVector, now: number): void {
  const deviationAngle = Math.sqrt(
    gaze.horizontalAngle ** 2 + gaze.verticalAngle ** 2
  );

  if (deviationAngle > this.config.gazeDeviationAngle && gaze.confidence > 0.5) {
    // Check if deviation is sustained
    const recentGazes = this.gazeHistory
      .filter(g => now - g.timestamp < this.config.gazeDeviationDurationMs);

    const sustainedDeviation = recentGazes.every(g => {
      const angle = Math.sqrt(g.horizontalAngle ** 2 + g.verticalAngle ** 2);
      return angle > this.config.gazeDeviationAngle;
    });

    if (sustainedDeviation && recentGazes.length > 3) {
      // Determine likely cause
      const direction = gaze.horizontalAngle > 0 ? 'right' : 'left';
      const severity = deviationAngle > 45 ? 'high' : 'moderate';

      this.addFlag(
        'gaze_deviation',
        `Sustained gaze ${direction} (${Math.round(deviationAngle)} deg) for ${this.config.gazeDeviationDurationMs / 1000}s`,
        now,
        severity,
      );
    }
  }
}
```

### Common Gaze Patterns and What They Mean

| Pattern | Gaze Data Signature | Likely Cause |
|---------|-------------------|-------------|
| Looking right, sustained | Horizontal > 30deg for 3+ sec | Second monitor with notes |
| Looking left, brief | Horizontal < -20deg for 1-2 sec, repeating | Glancing at phone |
| Looking down, frequent | Vertical < -20deg, every 10-15 sec | Reading physical notes on desk |
| Looking up and right | Horizontal > 15, Vertical > 15 | Thinking (normal, do not flag) |
| Rapid scanning | High variance in angle, rapid changes | Searching for something specific |
| Face absent, brief | No face for 2-5 sec | Adjusting headphones, drinking water (normal) |
| Face absent, extended | No face for 10+ sec | Stepped away or looking at separate device |

**Important**: Looking up and to the side while thinking is NORMAL and should not be flagged. The deviation must be sustained and directionally consistent to suggest note-reading or second-monitor reference.

---

## Multiple Face Detection

```typescript
private handleMultipleFaces(faceCount: number, now: number): void {
  if (faceCount <= 1) return;

  const flag: ProctorFlag = {
    type: 'multiple_faces',
    message: `${faceCount} faces detected in camera frame`,
    timestamp: now,
    severity: this.config.multipleFaceAction === 'flag_severe' ? 'high' : 'low',
  };

  this.flags.push(flag);

  // In simulation mode, the voice AI can address this
  if (this.config.interruptOnFlag) {
    // Trigger voice prompt: "I noticed someone else is visible.
    // In a real interview, please make sure you're in a private space."
  }
}
```

---

## Absence Detection

Track periods when the face is not detected:

```typescript
interface AbsencePeriod {
  startTs: number;
  endTs: number | null;  // null = still absent
  duration: number;
  flagged: boolean;
}

private absencePeriods: AbsencePeriod[] = [];
private currentAbsence: AbsencePeriod | null = null;

private trackAbsence(facePresent: boolean, now: number): void {
  if (!facePresent && !this.currentAbsence) {
    // Start absence period
    this.currentAbsence = {
      startTs: now,
      endTs: null,
      duration: 0,
      flagged: false,
    };
  } else if (facePresent && this.currentAbsence) {
    // End absence period
    this.currentAbsence.endTs = now;
    this.currentAbsence.duration = now - this.currentAbsence.startTs;
    this.absencePeriods.push(this.currentAbsence);
    this.currentAbsence = null;
  } else if (!facePresent && this.currentAbsence) {
    // Update ongoing absence
    const duration = now - this.currentAbsence.startTs;
    if (duration > this.config.absenceThresholdMs && !this.currentAbsence.flagged) {
      this.addFlag('face_absent', `Absent for ${Math.round(duration / 1000)}s`, now, 'moderate');
      this.currentAbsence.flagged = true;
    }
  }
}
```

---

## Privacy Configuration

All proctor data stays local by default. Users must explicitly opt in to any storage.

```typescript
interface PrivacyConfig {
  storeVideoFrames: false;           // NEVER store raw video by default
  storeGazeVectors: true;            // Numeric data only, no PII
  storeFlagTimestamps: true;         // When flags occurred
  storeAbsencePeriods: true;         // Duration of absences
  storeLandmarkData: false;          // Face landmark coordinates (opt-in)
  exportGazeHeatmap: boolean;        // Generate anonymized gaze heatmap for debrief
  retentionDays: 30;                 // Auto-delete proctor data after 30 days
}

const DEFAULT_PRIVACY: PrivacyConfig = {
  storeVideoFrames: false,
  storeGazeVectors: true,
  storeFlagTimestamps: true,
  storeAbsencePeriods: true,
  storeLandmarkData: false,
  exportGazeHeatmap: true,
  retentionDays: 30,
};
```

**Key privacy principles:**
1. **No video storage**: Raw video frames are processed in-memory and discarded. Only derived data (gaze angles, flag events) is stored.
2. **No cloud processing**: MediaPipe runs in the browser via WebAssembly. No network requests for face processing.
3. **Explicit opt-in for landmarks**: Storing 468 face landmark coordinates is unnecessary for proctor functionality. Only offered for advanced debugging.
4. **Auto-deletion**: Proctor data expires after 30 days. Session scores and flags persist longer (controlled by session orchestrator).

---

## Integration with Session Orchestrator

### Flag Format for Debrief

```typescript
interface ProctorFlag {
  type: 'gaze_deviation' | 'face_absent' | 'multiple_faces';
  message: string;
  timestamp: number;
  severity: 'low' | 'moderate' | 'high';
}

// Sent to debrief generator
interface ProctorSummary {
  sessionId: string;
  mode: 'training' | 'simulation';
  totalFlags: number;
  flagsByType: Record<string, number>;
  flagsByMinute: Array<{ minute: number; count: number }>; // When were flags concentrated?
  absenceTotalSeconds: number;
  gazeDeviationPercent: number; // % of session with gaze outside threshold
  complianceScore: number;     // 0-100: higher = fewer flags
}

function computeProctorSummary(flags: ProctorFlag[], gazeHistory: GazeVector[], sessionDurationMs: number): ProctorSummary {
  const flagsByType: Record<string, number> = {};
  flags.forEach(f => {
    flagsByType[f.type] = (flagsByType[f.type] || 0) + 1;
  });

  // Gaze deviation percentage
  const deviatedFrames = gazeHistory.filter(g => {
    const angle = Math.sqrt(g.horizontalAngle ** 2 + g.verticalAngle ** 2);
    return angle > 25;  // Using simulation threshold for scoring
  });
  const gazeDeviationPercent = (deviatedFrames.length / gazeHistory.length) * 100;

  // Compliance score: start at 100, deduct per flag
  const deductions = {
    gaze_deviation: 5,
    face_absent: 10,
    multiple_faces: 15,
  };
  let complianceScore = 100;
  flags.forEach(f => {
    complianceScore -= deductions[f.type] || 5;
  });
  complianceScore = Math.max(0, complianceScore);

  // Flags by minute for timeline visualization
  const sessionMinutes = Math.ceil(sessionDurationMs / 60_000);
  const flagsByMinute = Array.from({ length: sessionMinutes }, (_, i) => {
    const minuteStart = i * 60_000;
    const minuteEnd = (i + 1) * 60_000;
    const count = flags.filter(f => f.timestamp >= minuteStart && f.timestamp < minuteEnd).length;
    return { minute: i, count };
  });

  return {
    sessionId: '',  // Set by orchestrator
    mode: 'training',
    totalFlags: flags.length,
    flagsByType,
    flagsByMinute,
    absenceTotalSeconds: 0,  // Computed from absence periods
    gazeDeviationPercent,
    complianceScore,
  };
}
```

### Voice AI Integration in Simulation Mode

When `interruptOnFlag` is true, the proctor communicates with the voice engine:

```typescript
// In session orchestrator
async function handleProctorFlag(flag: ProctorFlag): Promise<void> {
  if (!config.interruptOnFlag) return;

  const prompts: Record<string, string> = {
    gaze_deviation: "I noticed you were looking away from the screen. In a real interview, your interviewer would notice this. Let's continue -- where were we?",
    face_absent: "It looks like you stepped away. Everything okay? Let's pick up where we left off.",
    multiple_faces: "I noticed someone else in the frame. For the most realistic practice, try to be in a private space.",
  };

  const prompt = prompts[flag.type];
  if (prompt) {
    await voiceEngine.injectPrompt(prompt);
  }
}
```

---

## Performance Considerations

### CPU Usage

MediaPipe Face Mesh at 15 FPS uses approximately:
- **M1/M2/M3/M4 Mac**: 5-8% CPU (negligible)
- **Modern Windows laptop (i7/Ryzen 7)**: 8-12% CPU
- **Budget laptop**: 15-25% CPU (may need to reduce to 10 FPS)

### Frame Rate Configuration

```typescript
// Adaptive frame rate based on device capability
function getOptimalFrameRate(): number {
  const cores = navigator.hardwareConcurrency || 4;
  if (cores >= 8) return 15;  // High-end: 15 FPS
  if (cores >= 4) return 10;  // Mid-range: 10 FPS
  return 5;                    // Low-end: 5 FPS (still usable for gaze tracking)
}
```

### Memory

MediaPipe Face Mesh model is ~2MB loaded. Gaze history for a 45-minute session at 15 FPS is approximately:
- 45 min * 60 sec * 15 frames = 40,500 entries
- Each entry: ~100 bytes (angles, timestamp, confidence)
- Total: ~4MB per session (negligible)

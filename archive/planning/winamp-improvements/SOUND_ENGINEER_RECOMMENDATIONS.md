# Sound Engineer Skill - Audio Enhancement Recommendations

## 🎧 Expert Analysis by Sound Engineer Skill
**Skill Path:** `.claude/skills/sound-engineer/`
**Expertise:** Spatial audio, procedural sound design, real-time DSP, game audio middleware

---

## 🔊 Current Audio System Assessment

### What's Working
✅ **MIDI Playback**: Basic note playback using soundfont-player
✅ **Instrument Mapping**: Acoustic piano (0) and bass (33)
✅ **Volume Control**: User-adjustable gain
✅ **Note Velocity**: Velocity-based amplitude modulation

### What's Missing
❌ **No Real-Time Audio Analysis**: Visualizer is fake (CSS animation, not FFT)
❌ **No Effects Processing**: Dry signal only (no reverb, chorus, etc.)
❌ **Basic Synthesis**: Limited to acoustic soundfonts
❌ **No Spatial Audio**: Mono playback
❌ **No Adaptive Features**: Static playback regardless of track
❌ **No Vaporwave Processing**: Missing the signature slowed/chopped aesthetic

---

## 🎯 Priority 1: Real-Time Audio Analysis & Visualization

### Current Visualizer (Fake)
```typescript
// Static CSS animation - doesn't respond to actual audio
{[...Array(24)].map((_, i) => (
  <div
    key={i}
    className={`${styles.bar} ${isPlaying ? styles.barAnimated : ''}`}
    style={{
      animationDelay: `${i * 0.05s}`,
      background: genreGradient
    }}
  />
))}
```

### Recommended: Real FFT Visualizer

#### Implementation Plan

**Step 1: Create Web Audio API Context**
```typescript
// In MusicPlayerContext.tsx
import { useRef, useEffect } from 'react';

const audioContextRef = useRef<AudioContext | null>(null);
const analyserRef = useRef<AnalyserNode | null>(null);
const dataArrayRef = useRef<Uint8Array | null>(null);

useEffect(() => {
  // Initialize Web Audio API
  if (!audioContextRef.current) {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();

    // Configure analyser
    analyserRef.current.fftSize = 2048; // Power of 2, determines frequency resolution
    const bufferLength = analyserRef.current.frequencyBinCount; // 1024 bins
    dataArrayRef.current = new Uint8Array(bufferLength);

    // Connect analyser to audio destination
    analyserRef.current.connect(audioContextRef.current.destination);
  }
}, []);
```

**Step 2: Connect Soundfont Output to Analyser**
```typescript
// Modify soundfont-player to output to analyser node
const instrument = await Soundfont.instrument(
  audioContextRef.current,
  instrumentName,
  {
    destination: analyserRef.current // Route through analyser
  }
);
```

**Step 3: Real-Time Frequency Data Extraction**
```typescript
// New hook for visualizer
export function useAudioVisualizer() {
  const [frequencyData, setFrequencyData] = useState<number[]>([]);

  useEffect(() => {
    let animationId: number;

    const updateVisualization = () => {
      if (analyserRef.current && dataArrayRef.current) {
        // Get frequency data (0-255 for each frequency bin)
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);

        // Group bins into 24 bars (matching current design)
        const barCount = 24;
        const binSize = Math.floor(dataArrayRef.current.length / barCount);
        const bars: number[] = [];

        for (let i = 0; i < barCount; i++) {
          let sum = 0;
          for (let j = 0; j < binSize; j++) {
            sum += dataArrayRef.current[i * binSize + j];
          }
          const average = sum / binSize;
          bars.push(average / 255); // Normalize to 0-1
        }

        setFrequencyData(bars);
      }

      animationId = requestAnimationFrame(updateVisualization);
    };

    updateVisualization();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return frequencyData;
}
```

**Step 4: Update Visualizer Component**
```tsx
// In WinampModal component
const frequencyData = useAudioVisualizer();

// Replace static bars with dynamic ones
<div className={styles.waveform}>
  {frequencyData.map((amplitude, i) => (
    <div
      key={i}
      className={styles.bar}
      style={{
        height: `${amplitude * 100}%`, // Real-time height based on FFT
        background: `linear-gradient(180deg, ${genreColors.primary}, ${genreColors.secondary})`
      }}
    />
  ))}
</div>
```

**Performance:**
- FFT computation: ~0.5-1ms per frame
- 60fps with 2048 FFT size
- Minimal CPU impact

**Benefits:**
- ✅ Visualizer responds to actual music
- ✅ Different frequencies = different bar heights
- ✅ Bass notes → left bars, treble → right bars
- ✅ Professional appearance

---

## 🎯 Priority 2: Vaporwave Effects Chain

### Essential Effects for Authentic Vaporwave Sound

#### 1. **Reverb (Large Hall)**
Creates the spacious, distant, dreamy quality of vaporwave.

```typescript
// Create convolution reverb
const reverbNode = audioContext.createConvolver();

// Load impulse response (hall reverb)
async function loadReverb() {
  const response = await fetch('/audio/impulse-responses/large-hall.wav');
  const arrayBuffer = await response.arrayBuffer();
  reverbNode.buffer = await audioContext.decodeAudioData(arrayBuffer);
}

// Wet/dry mix control
const dryGain = audioContext.createGain();
const wetGain = audioContext.createGain();

dryGain.gain.value = 0.3;  // 30% dry
wetGain.gain.value = 0.7;  // 70% wet (very spacious)

// Signal routing
source → dryGain → destination
source → reverbNode → wetGain → destination
```

**Free Impulse Responses:**
- OpenAIR (open source IRs)
- Voxengo Pristine Space (free pack)

#### 2. **Chorus (80s Synth Sound)**
Adds detuned layers for lush, vintage character.

```typescript
// Create chorus effect using delay + LFO
const chorusDelay = audioContext.createDelay();
const chorusLFO = audioContext.createOscillator();
const chorusDepth = audioContext.createGain();

// Configure chorus
chorusLFO.frequency.value = 0.5; // 0.5 Hz modulation
chorusDepth.gain.value = 0.005;  // 5ms depth
chorusDelay.delayTime.value = 0.02; // 20ms base delay

// Connect LFO to modulate delay time
chorusLFO.connect(chorusDepth);
chorusDepth.connect(chorusDelay.delayTime);
chorusLFO.start();

// Routing
source → chorusDelay → destination
```

#### 3. **Lo-Fi/Bitcrusher (VHS Aesthetic)**
Reduces bit depth and sample rate for vintage cassette/VHS sound.

```typescript
// Bitcrusher using WaveShaperNode
const bitcrusher = audioContext.createWaveShaper();

function createBitcrusherCurve(bits: number) {
  const curve = new Float32Array(65536);
  const levels = Math.pow(2, bits);

  for (let i = 0; i < 65536; i++) {
    const x = (i - 32768) / 32768; // -1 to 1
    const quantized = Math.round(x * levels) / levels;
    curve[i] = quantized;
  }

  return curve;
}

bitcrusher.curve = createBitcrusherCurve(8); // 8-bit depth
bitcrusher.oversample = 'none'; // Preserve aliasing

// Routing
source → bitcrusher → destination
```

#### 4. **Tempo/Pitch Control (S L O W E D)**
Classic vaporwave technique: slow down to 66-75% speed.

```typescript
// Method 1: Using AudioBufferSourceNode (for pre-recorded audio)
audioSource.playbackRate.value = 0.7; // 70% speed (slower, deeper pitch)

// Method 2: Pitch shifting (maintain pitch while slowing)
// Requires more complex DSP (use Web Audio API PitchShift library)
import { PitchShift } from 'web-audio-pitch-shift';

const pitchShift = new PitchShift(audioContext);
pitchShift.pitchFactor = 1.0;  // Maintain original pitch
pitchShift.tempo = 0.7;         // 70% speed

// For MIDI: adjust tempo in midi-player-js
playerRef.current.setTempo(70); // 70% of original tempo
```

**UI Controls to Add:**
```tsx
<div className={styles.effectsPanel}>
  <label>
    Reverb
    <input
      type="range"
      min="0"
      max="100"
      value={reverbAmount}
      onChange={(e) => setReverbAmount(e.target.value)}
    />
  </label>

  <label>
    Chorus
    <input
      type="range"
      min="0"
      max="100"
      value={chorusAmount}
      onChange={(e) => setChorusAmount(e.target.value)}
    />
  </label>

  <label>
    Lo-Fi
    <input
      type="range"
      min="0"
      max="100"
      value={lofiAmount}
      onChange={(e) => setLofiAmount(e.target.value)}
    />
  </label>

  <label>
    Tempo (%)
    <input
      type="range"
      min="50"
      max="150"
      value={tempoPercent}
      onChange={(e) => setTempoPercent(e.target.value)}
    />
  </label>
</div>
```

---

## 🎯 Priority 3: Better Synthesis (Vaporwave Synth Patches)

### Current: Acoustic Soundfonts
```typescript
// Basic acoustic instruments
loadInstrument(0);  // Acoustic Grand Piano
loadInstrument(33); // Acoustic Bass
```

### Recommended: Custom Vaporwave Synthesis

#### Option A: Custom Soundfonts
**Source:** FluidR3_GM soundfont with vaporwave-appropriate patches

**Better Instrument Selection:**
```typescript
const vaporwaveInstruments = {
  lead: 81,      // Synth Lead (Square wave)
  pad: 89,       // Warm Pad (Saw wave)
  bass: 39,      // Synth Bass
  bells: 12,     // Vibraphone (FM-like)
  strings: 49,   // String Ensemble
  choir: 91,     // Pad (Warm, ethereal)
};
```

#### Option B: Web Audio Oscillators (Full Control)
```typescript
// Create detuned saw wave stack (vaporwave lead)
function createVaporwaveLead(frequency: number) {
  const now = audioContext.currentTime;

  // 3 detuned saw waves
  const oscs = [-5, 0, 5].map(detune => {
    const osc = audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = frequency;
    osc.detune.value = detune; // Slight detuning for width
    return osc;
  });

  // ADSR envelope
  const envelope = audioContext.createGain();
  envelope.gain.setValueAtTime(0, now);
  envelope.gain.linearRampToValueAtTime(1, now + 0.01);      // Attack: 10ms
  envelope.gain.linearRampToValueAtTime(0.7, now + 0.1);      // Decay: 90ms
  envelope.gain.setValueAtTime(0.7, now + 0.5);               // Sustain
  envelope.gain.linearRampToValueAtTime(0, now + 0.5 + 0.5); // Release: 500ms

  // Low-pass filter (removes harshness)
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2000; // Cut highs
  filter.Q.value = 1;

  // Connect: oscs → filter → envelope → destination
  oscs.forEach(osc => {
    osc.connect(filter);
    osc.start(now);
    osc.stop(now + 1); // 1 second note
  });

  filter.connect(envelope);
  envelope.connect(audioContext.destination);

  return { oscs, envelope };
}
```

**Benefits:**
- ✅ Authentic vaporwave sound (detuned saws)
- ✅ Full control over timbre
- ✅ No external soundfont files needed
- ✅ Lower latency

---

## 🎯 Priority 4: Spatial Audio & Stereo Enhancement

### Current: Mono Playback
All notes play in center (no spatial positioning).

### Recommended: Stereo Widening

#### Haas Effect (Simple Stereo Width)
```typescript
// Create stereo width using short delay
const splitter = audioContext.createChannelSplitter(2);
const merger = audioContext.createChannelMerger(2);
const leftDelay = audioContext.createDelay();
const rightDelay = audioContext.createDelay();

leftDelay.delayTime.value = 0.02;  // 20ms delay on left
rightDelay.delayTime.value = 0.0;   // No delay on right

// Routing
source → splitter
splitter[0] → leftDelay → merger[0]
splitter[1] → rightDelay → merger[1]
merger → destination
```

#### Pseudo-Binaural (Headphone Enhancement)
```typescript
// Simple HRTF approximation using shelving filters
const leftFilter = audioContext.createBiquadFilter();
const rightFilter = audioContext.createBiquadFilter();

leftFilter.type = 'highshelf';
leftFilter.frequency.value = 2000;
leftFilter.gain.value = -3; // Cut highs on left

rightFilter.type = 'highshelf';
rightFilter.frequency.value = 2000;
rightFilter.gain.value = 3; // Boost highs on right

// Creates perception of left/right spatial difference
```

---

## 🎯 Priority 5: Adaptive Music System

### Current: Static Playback
All tracks play identically regardless of metadata.

### Recommended: Genre-Aware Processing

```typescript
// Apply effects based on track genre
function configureEffectsForGenre(genre: string) {
  switch (genre) {
    case 'Vaporwave':
      setReverb(0.7);    // Very spacious
      setChorus(0.6);    // Lush
      setLoFi(0.4);      // Vintage
      setTempo(0.75);    // Slowed down
      break;

    case 'Synthwave':
      setReverb(0.5);    // Moderate space
      setChorus(0.8);    // Very lush (80s)
      setLoFi(0.2);      // Clean
      setTempo(1.0);     // Normal speed
      break;

    case 'Future Funk':
      setReverb(0.3);    // Less space
      setChorus(0.5);    // Moderate
      setLoFi(0.1);      // Clean
      setTempo(1.1);     // Slightly faster
      break;

    default:
      // Defaults
      setReverb(0.4);
      setChorus(0.4);
      setLoFi(0.3);
      setTempo(1.0);
  }
}

// Call when track changes
useEffect(() => {
  if (currentTrack) {
    configureEffectsForGenre(currentTrack.genre);
  }
}, [currentTrack]);
```

---

## 📊 Implementation Roadmap

### Phase 1: Foundation (2-3 hours)
1. **Web Audio API Integration**
   - Create AudioContext
   - Route soundfont through analyser
   - Set up gain nodes for mixing

2. **Real FFT Visualizer**
   - Implement `useAudioVisualizer` hook
   - Update visualizer bars with real data
   - Test with different tracks

### Phase 2: Core Effects (3-4 hours)
3. **Reverb System**
   - Load impulse response
   - Implement wet/dry mixer
   - Add UI slider

4. **Chorus Effect**
   - Create LFO + delay nodes
   - Configure for 80s sound
   - Add UI slider

5. **Tempo Control**
   - Integrate with midi-player-js
   - Add tempo slider (50-150%)
   - Persist tempo preference

### Phase 3: Enhancement (2-3 hours)
6. **Lo-Fi Bitcrusher**
   - Implement waveshaper
   - Add sample rate reduction
   - Add UI slider

7. **Stereo Widening**
   - Haas effect implementation
   - Width control slider
   - Headphone optimization

### Phase 4: Intelligence (2-3 hours)
8. **Genre-Aware Presets**
   - Define effect presets per genre
   - Auto-configure on track change
   - Allow manual override

9. **Persistent Effect Settings**
   - Save to localStorage
   - Per-track memory
   - Reset to defaults button

---

## 🎨 Recommended UI Layout for Effects

```tsx
<div className={styles.effectsPanel}>
  <div className={styles.effectsHeader}>
    <h4>AUDIO EFFECTS</h4>
    <button onClick={resetEffects}>Reset</button>
  </div>

  <div className={styles.effectRow}>
    <label>
      <span className={styles.effectName}>REVERB</span>
      <input
        type="range"
        min="0"
        max="100"
        value={reverbAmount}
        onChange={(e) => handleReverbChange(e.target.value)}
        className={styles.effectSlider}
      />
      <span className={styles.effectValue}>{reverbAmount}%</span>
    </label>
  </div>

  <div className={styles.effectRow}>
    <label>
      <span className={styles.effectName}>CHORUS</span>
      <input type="range" min="0" max="100" value={chorusAmount} />
      <span className={styles.effectValue}>{chorusAmount}%</span>
    </label>
  </div>

  <div className={styles.effectRow}>
    <label>
      <span className={styles.effectName}>LO-FI</span>
      <input type="range" min="0" max="100" value={lofiAmount} />
      <span className={styles.effectValue}>{lofiAmount}%</span>
    </label>
  </div>

  <div className={styles.effectRow}>
    <label>
      <span className={styles.effectName}>TEMPO</span>
      <input type="range" min="50" max="150" value={tempoPercent} />
      <span className={styles.effectValue}>{tempoPercent}%</span>
    </label>
  </div>

  <div className={styles.effectRow}>
    <label>
      <span className={styles.effectName}>STEREO WIDTH</span>
      <input type="range" min="0" max="100" value={stereoWidth} />
      <span className={styles.effectValue}>{stereoWidth}%</span>
    </label>
  </div>

  <div className={styles.presets}>
    <button onClick={() => loadPreset('vaporwave')}>Vaporwave</button>
    <button onClick={() => loadPreset('synthwave')}>Synthwave</button>
    <button onClick={() => loadPreset('clean')}>Clean</button>
  </div>
</div>
```

**Styling:**
```css
.effectsPanel {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid var(--winamp-border);
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
}

.effectRow {
  display: grid;
  grid-template-columns: 120px 1fr 60px;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.effectName {
  color: var(--winamp-accent);
  font-weight: bold;
  font-size: 0.75rem;
  letter-spacing: 1px;
}

.effectSlider {
  width: 100%;
  accent-color: var(--winamp-accent);
}

.effectValue {
  color: var(--winamp-textDim);
  text-align: right;
  font-size: 0.8rem;
}
```

---

## 📈 Expected Performance Impact

### CPU Usage
- **Current:** ~2-3%
- **With FFT:** ~3-4%
- **With Full Effects:** ~5-8%
- **Target:** &lt;10% (acceptable for music player)

### Memory Usage
- **Reverb IR:** ~1-2 MB (one-time load)
- **Audio Buffers:** ~5-10 MB
- **Total:** ~10-15 MB increase

### Latency
- **Current:** ~50ms (soundfont latency)
- **With Effects:** ~70-100ms (reverb adds latency)
- **Still Acceptable:** &lt;150ms is imperceptible

---

## 🎯 Success Metrics

### User Experience Improvements
- ✅ Visualizer responds to actual music (professional appearance)
- ✅ Authentic vaporwave sound (reverb + chorus + slowed tempo)
- ✅ Interactive controls (users can customize sound)
- ✅ Genre-aware defaults (intelligent presets)
- ✅ Wide stereo image (more immersive)

### Technical Achievements
- ✅ Real-time FFT analysis at 60fps
- ✅ Multi-effect audio chain (&lt;10% CPU)
- ✅ Web Audio API best practices
- ✅ Persistent user preferences
- ✅ Professional audio quality

---

## 📚 Resources & References

### Libraries to Consider
- **Tone.js** (high-level Web Audio API wrapper)
  - Built-in effects (reverb, chorus, delay)
  - Easy-to-use synthesizers
  - `npm install tone`

- **Pizzicato.js** (simple effects library)
  - Reverb, delay, distortion, etc.
  - Lightweight (~30KB)
  - `npm install pizzicato`

### Free Impulse Responses
- **OpenAIR** (open-source IR database)
- **Voxengo Pristine Space** (free IR pack)
- **EchoThief** (free IR library)

### Documentation
- **MDN Web Audio API** (comprehensive guide)
- **Web Audio API Spec** (W3C standard)
- **Tone.js Examples** (interactive demos)

---

## 💡 Quick Win: Minimal Implementation

If time is limited, implement just these 3 features for maximum impact:

### 1. Real FFT Visualizer (1 hour)
```typescript
// Add to MusicPlayerContext
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;
// ... connect to soundfont output
```

### 2. Reverb (1 hour)
```typescript
// Use Tone.js for easy reverb
import * as Tone from 'tone';
const reverb = new Tone.Reverb(3).toDestination(); // 3 second decay
// ... connect soundfont to reverb
```

### 3. Tempo Slider (30 minutes)
```tsx
<input
  type="range"
  min="50"
  max="150"
  value={tempo}
  onChange={(e) => playerRef.current.setTempo(e.target.value)}
/>
```

**Total Time:** ~2.5 hours for massive improvement in quality!

---

## 🎬 Conclusion

The current vaporwave music player has excellent visual design and functional playback. Adding these audio enhancements would elevate it from a "pretty MIDI player" to a "professional vaporwave audio workstation."

**Most Important Additions:**
1. ⭐ Real FFT visualizer (looks professional)
2. ⭐ Reverb + Chorus (sounds like vaporwave)
3. ⭐ Tempo control (enables S L O W E D aesthetic)

Everything else is bonus. With just these 3 features, you'd have a world-class vaporwave player!

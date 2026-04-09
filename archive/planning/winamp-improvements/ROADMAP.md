# Winamp Audio Improvements Roadmap

**Author:** sound-engineer skill
**Date:** 2025-11-25
**Status:** Planning Phase
**Priority:** High

## 📋 Overview

This roadmap provides a task-by-task implementation plan for upgrading the Winamp music player with professional audio engineering features. The focus is on making improvements that are both technically sound and easy to implement incrementally.

**Primary Goals:**
1. ✅ Make volume control actually work (currently broken)
2. ✅ Implement real FFT visualizer (currently fake CSS animations)
3. ✅ Add professional audio processing features

**Implementation Philosophy:**
- Each task is self-contained and testable
- Dependencies are clearly marked
- Code examples provided for each task
- Progressive enhancement (core features first, advanced features later)

---

## 🔍 Current State Analysis

### What Works:
- MIDI playback via soundfont-player
- Track switching and playlist management
- Basic UI layout and styling
- Audio context initialization

### What's Broken:
- **Volume Control (line 226-233 of MusicPlayerContext.tsx)**
  ```typescript
  // ❌ This doesn't work - destination.gain doesn't exist
  instrument.context.destination.gain?.setValueAtTime?.(newVolume, 0);
  ```

- **FFT Visualizer (lines 112-126 of WinampModal/index.tsx)**
  ```typescript
  // ❌ Fake CSS animations, not real audio analysis
  className={`${styles.bar} ${isPlaying ? styles.barAnimated : ''}`}
  ```

### Key Files:
- `/website/src/contexts/MusicPlayerContext.tsx` - Core audio logic
- `/website/src/components/WinampModal/index.tsx` - Main player UI
- `/website/src/components/MinifiedMusicPlayer/index.tsx` - Navbar widget
- `/website/src/data/musicMetadata.ts` - Track library data

---

## 🎯 Phase 1: Core Audio Routing (PRIORITY 1)

### Task 1.1: Create GainNode for Volume Control
**Complexity:** Easy
**Dependencies:** None
**Files:** `MusicPlayerContext.tsx`

**Description:**
Replace the broken volume control with proper Web Audio API GainNode.

**Implementation Steps:**

1. Add gainNodeRef at top of MusicPlayerContext:
```typescript
const gainNodeRef = useRef<GainNode | null>(null);
```

2. Initialize GainNode when AudioContext is created (around line 63):
```typescript
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const gainNode = audioCtx.createGain();
gainNode.connect(audioCtx.destination);
gainNode.gain.setValueAtTime(volume, 0);

audioContextRef.current = audioCtx;
gainNodeRef.current = gainNode;
```

3. Update instrument connection in loadInstruments function (around line 139):
```typescript
// OLD:
const instrument = await Soundfont.instrument(audioCtx, programName, { gain: volume });

// NEW:
const instrument = await Soundfont.instrument(audioCtx, programName);
// Connect instrument to gainNode instead of destination
if (instrument.context && gainNodeRef.current) {
  // The soundfont library handles its own connection, but we need to verify
  // it connects through our gain node. May need to patch this.
}
```

**Testing Criteria:**
- Volume slider moves smoothly from 0-100%
- Audio volume actually changes when slider is adjusted
- No audio clipping or distortion
- Volume persists across track changes

**Notes:**
- Use logarithmic scaling for natural volume perception: `Math.pow(linearValue, 2)`
- Clamp volume between 0.0 and 1.0

---

### Task 1.2: Implement Audio Routing Chain
**Complexity:** Medium
**Dependencies:** Task 1.1 complete
**Files:** `MusicPlayerContext.tsx`

**Description:**
Create proper audio signal flow: Source → GainNode → AnalyserNode → Destination

**Implementation Steps:**

1. Add analyserNodeRef alongside gainNodeRef:
```typescript
const analyserNodeRef = useRef<AnalyserNode | null>(null);
```

2. Update audio chain initialization:
```typescript
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Create nodes
const gainNode = audioCtx.createGain();
const analyserNode = audioCtx.createAnalyser();

// Configure analyser
analyserNode.fftSize = 64; // 32 frequency bins for 24-bar display
analyserNode.smoothingTimeConstant = 0.8; // Smooth transitions

// Connect chain: GainNode → AnalyserNode → Destination
gainNode.connect(analyserNode);
analyserNode.connect(audioCtx.destination);
gainNode.gain.setValueAtTime(volume, 0);

// Store refs
audioContextRef.current = audioCtx;
gainNodeRef.current = gainNode;
analyserNodeRef.current = analyserNode;
```

3. Expose analyserNode via context:
```typescript
// Add to MusicPlayerContext interface
interface MusicPlayerContextType {
  // ... existing properties
  analyserNode: AnalyserNode | null;
}

// Add to return value
return (
  <MusicPlayerContext.Provider value={{
    // ... existing values
    analyserNode: analyserNodeRef.current,
  }}>
```

**Testing Criteria:**
- Volume control still works
- No audio glitches or dropouts
- analyserNode is accessible from components

---

### Task 1.3: Update Volume Control Logic with Logarithmic Scaling
**Complexity:** Easy
**Dependencies:** Task 1.1 complete
**Files:** `MusicPlayerContext.tsx`

**Description:**
Implement proper logarithmic volume scaling for natural perception.

**Implementation Steps:**

1. Replace setVolume function (lines 226-233):
```typescript
const setVolume = (linearVolume: number) => {
  // Clamp to valid range
  const clamped = Math.max(0, Math.min(1, linearVolume));

  // Apply logarithmic scaling for natural perception
  // Human hearing is logarithmic, so square the value
  const scaledVolume = Math.pow(clamped, 2);

  // Update state (store linear value for slider)
  setVolumeState(clamped);

  // Apply to gain node (use scaled value)
  if (gainNodeRef.current) {
    gainNodeRef.current.gain.setValueAtTime(scaledVolume, 0);
  }

  // Persist to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('music-player-volume', clamped.toString());
  }
};
```

2. Update initial volume application in useEffect:
```typescript
useEffect(() => {
  if (gainNodeRef.current && audioContextRef.current) {
    const scaledVolume = Math.pow(volume, 2);
    gainNodeRef.current.gain.setValueAtTime(scaledVolume, 0);
  }
}, [volume]);
```

**Testing Criteria:**
- Volume at 50% should sound roughly "half as loud" perceptually
- Smooth transitions from 0% to 100%
- No sudden jumps or non-linear behavior from user perspective

---

## 📊 Phase 2: Real-Time FFT Visualizer (PRIORITY 2)

### Task 2.1: Create FFT Data Hook
**Complexity:** Medium
**Dependencies:** Task 1.2 complete
**Files:** Create new `website/src/hooks/useFFTData.ts`

**Description:**
Custom hook to read and process frequency data from AnalyserNode.

**Implementation:**

```typescript
import { useEffect, useRef, useState } from 'react';

interface UseFFTDataOptions {
  analyserNode: AnalyserNode | null;
  binCount?: number; // How many frequency bins to return
  smoothing?: number; // 0-1, higher = smoother
  isPlaying?: boolean;
}

export function useFFTData({
  analyserNode,
  binCount = 24,
  smoothing = 0.7,
  isPlaying = false
}: UseFFTDataOptions): Uint8Array {
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(
    new Uint8Array(binCount)
  );
  const smoothedDataRef = useRef<Float32Array>(new Float32Array(binCount));
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analyserNode || !isPlaying) {
      // Zero out bars when not playing
      setFrequencyData(new Uint8Array(binCount));
      return;
    }

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateFrequencyData = () => {
      analyserNode.getByteFrequencyData(dataArray);

      // Downsample to desired bin count
      const binsPerGroup = Math.floor(bufferLength / binCount);
      const newData = new Uint8Array(binCount);

      for (let i = 0; i < binCount; i++) {
        let sum = 0;
        const start = i * binsPerGroup;
        const end = start + binsPerGroup;

        for (let j = start; j < end && j < bufferLength; j++) {
          sum += dataArray[j];
        }

        const average = sum / binsPerGroup;

        // Apply exponential moving average for smoothing
        smoothedDataRef.current[i] =
          smoothing * smoothedDataRef.current[i] +
          (1 - smoothing) * average;

        newData[i] = Math.round(smoothedDataRef.current[i]);
      }

      setFrequencyData(newData);
      rafIdRef.current = requestAnimationFrame(updateFrequencyData);
    };

    rafIdRef.current = requestAnimationFrame(updateFrequencyData);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [analyserNode, binCount, smoothing, isPlaying]);

  return frequencyData;
}
```

**Testing Criteria:**
- Hook returns 24 frequency values (0-255)
- Values update at ~60fps when playing
- Smooth transitions between values
- Values return to 0 when paused

---

### Task 2.2: Update WinampModal Visualizer
**Complexity:** Medium
**Dependencies:** Task 2.1 complete
**Files:** `WinampModal/index.tsx`

**Description:**
Replace fake CSS animations with real FFT data visualization.

**Implementation Steps:**

1. Import the FFT hook and get analyserNode from context:
```typescript
import { useFFTData } from '../../hooks/useFFTData';

export default function WinampModal() {
  const {
    isPlaying,
    // ... other context values
    analyserNode, // NEW
  } = useMusicPlayer();

  // Get real FFT data
  const frequencyData = useFFTData({
    analyserNode,
    binCount: 24,
    smoothing: 0.7,
    isPlaying
  });

  // ... rest of component
}
```

2. Replace visualizer section (lines 112-126):
```typescript
<div className={styles.visualizer}>
  <div className={styles.scanlines}></div>
  <div className={styles.waveform}>
    {Array.from(frequencyData).map((magnitude, i) => {
      // Calculate bar height (0-255 to 0-100%)
      const height = (magnitude / 255) * 100;

      // Determine color based on frequency range
      let color;
      if (i < 8) {
        // Low frequencies (bass) - red/orange
        color = genreColors.primary;
      } else if (i < 16) {
        // Mid frequencies - yellow/green
        color = genreColors.secondary;
      } else {
        // High frequencies (treble) - blue/cyan
        color = '#00ffff';
      }

      return (
        <div
          key={i}
          className={styles.bar}
          style={{
            height: `${height}%`,
            backgroundColor: color,
            transition: 'height 0.05s ease-out'
          }}
        />
      );
    })}
  </div>
</div>
```

3. Update CSS to support dynamic heights:
```css
/* In styles.module.css */
.bar {
  flex: 1;
  min-height: 2px;
  max-height: 100%;
  border-radius: 1px;
  /* Remove CSS animation classes */
}
```

**Testing Criteria:**
- Bars animate in sync with music
- Bass (low freq) shows on left, treble (high freq) on right
- Smooth animation without jitter
- Bars return to baseline when paused
- 60fps performance

---

### Task 2.3: Add MinifiedPlayer Real-Time Visualizer
**Complexity:** Easy
**Dependencies:** Task 2.1 complete
**Files:** `MinifiedMusicPlayer/index.tsx`

**Description:**
Add small real-time visualizer to navbar player widget.

**Implementation Steps:**

1. Import FFT hook and get analyserNode:
```typescript
import { useFFTData } from '../../hooks/useFFTData';

export default function MinifiedMusicPlayer() {
  const {
    isPlaying,
    currentTrack,
    togglePlayPause,
    setMinimized,
    analyserNode // NEW
  } = useMusicPlayer();

  const { currentSkin } = useWinampSkin();

  // Get FFT data for 8 bars (smaller visualizer)
  const frequencyData = useFFTData({
    analyserNode,
    binCount: 8,
    smoothing: 0.75,
    isPlaying
  });
```

2. Update visualizer section (lines 29-40):
```typescript
<div className={styles.visualizer}>
  {Array.from(frequencyData).map((magnitude, i) => {
    const height = (magnitude / 255) * 100;

    return (
      <div
        key={i}
        className={styles.bar}
        style={{
          height: `${height}%`,
          backgroundColor: currentSkin.colors.visualizer,
          transition: 'height 0.05s ease-out'
        }}
      />
    );
  })}
</div>
```

**Testing Criteria:**
- 8 bars animate with music
- Matches genre color scheme
- Smooth performance in navbar
- No layout shift

---

## 🎛️ Phase 3: Professional Audio Features (PRIORITY 3)

### Task 3.1: Implement 3-Band EQ
**Complexity:** Medium
**Dependencies:** Phase 1 complete
**Files:** `MusicPlayerContext.tsx`, create new `EQControls.tsx` component

**Description:**
Add professional 3-band equalizer (Bass, Mids, Treble) using BiquadFilterNodes.

**Implementation Steps:**

1. Add EQ nodes to MusicPlayerContext:
```typescript
const eqNodesRef = useRef<{
  bass: BiquadFilterNode | null;
  mid: BiquadFilterNode | null;
  treble: BiquadFilterNode | null;
}>({
  bass: null,
  mid: null,
  treble: null
});

const [eqSettings, setEqSettings] = useState({
  bass: 0,   // -12 to +12 dB
  mid: 0,
  treble: 0
});
```

2. Create EQ chain during audio initialization:
```typescript
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Create nodes
const gainNode = audioCtx.createGain();
const analyserNode = audioCtx.createAnalyser();

// Create EQ filters
const bassFilter = audioCtx.createBiquadFilter();
bassFilter.type = 'lowshelf';
bassFilter.frequency.setValueAtTime(200, 0); // 200 Hz
bassFilter.gain.setValueAtTime(0, 0);

const midFilter = audioCtx.createBiquadFilter();
midFilter.type = 'peaking';
midFilter.frequency.setValueAtTime(1000, 0); // 1 kHz
midFilter.Q.setValueAtTime(1, 0);
midFilter.gain.setValueAtTime(0, 0);

const trebleFilter = audioCtx.createBiquadFilter();
trebleFilter.type = 'highshelf';
trebleFilter.frequency.setValueAtTime(3000, 0); // 3 kHz
trebleFilter.gain.setValueAtTime(0, 0);

// Connect chain:
// GainNode → Bass → Mid → Treble → AnalyserNode → Destination
gainNode.connect(bassFilter);
bassFilter.connect(midFilter);
midFilter.connect(trebleFilter);
trebleFilter.connect(analyserNode);
analyserNode.connect(audioCtx.destination);

eqNodesRef.current = {
  bass: bassFilter,
  mid: midFilter,
  treble: trebleFilter
};
```

3. Create EQ control functions:
```typescript
const setEQ = (band: 'bass' | 'mid' | 'treble', dbValue: number) => {
  const clamped = Math.max(-12, Math.min(12, dbValue));
  const node = eqNodesRef.current[band];

  if (node) {
    node.gain.setValueAtTime(clamped, 0);
    setEqSettings(prev => ({ ...prev, [band]: clamped }));
  }
};
```

4. Create EQ UI component (new file `EQControls.tsx`):
```typescript
import React from 'react';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import styles from './styles.module.css';

export default function EQControls() {
  const { eqSettings, setEQ } = useMusicPlayer();

  return (
    <div className={styles.eqPanel}>
      <div className={styles.eqBand}>
        <label>BASS</label>
        <input
          type="range"
          min="-12"
          max="12"
          step="1"
          value={eqSettings.bass}
          onChange={(e) => setEQ('bass', parseFloat(e.target.value))}
          orient="vertical"
        />
        <span>{eqSettings.bass > 0 ? '+' : ''}{eqSettings.bass} dB</span>
      </div>
      <div className={styles.eqBand}>
        <label>MID</label>
        <input
          type="range"
          min="-12"
          max="12"
          step="1"
          value={eqSettings.mid}
          onChange={(e) => setEQ('mid', parseFloat(e.target.value))}
          orient="vertical"
        />
        <span>{eqSettings.mid > 0 ? '+' : ''}{eqSettings.mid} dB</span>
      </div>
      <div className={styles.eqBand}>
        <label>TREBLE</label>
        <input
          type="range"
          min="-12"
          max="12"
          step="1"
          value={eqSettings.treble}
          onChange={(e) => setEQ('treble', parseFloat(e.target.value))}
          orient="vertical"
        />
        <span>{eqSettings.treble > 0 ? '+' : ''}{eqSettings.treble} dB</span>
      </div>
    </div>
  );
}
```

5. Add to WinampModal:
```typescript
import EQControls from '../EQControls';

// Inside WinampModal render:
<div className={styles.rightPanel}>
  {/* ... existing visualizer and controls ... */}
  <EQControls />
  {/* ... rest of UI ... */}
</div>
```

**Testing Criteria:**
- Bass slider affects low frequencies (< 200 Hz)
- Mid slider affects middle frequencies (~1 kHz)
- Treble slider affects high frequencies (> 3 kHz)
- No distortion at extreme settings
- EQ settings persist

---

### Task 3.2: Add Dynamic Range Compression
**Complexity:** Easy
**Dependencies:** Phase 1 complete
**Files:** `MusicPlayerContext.tsx`

**Description:**
Prevent audio clipping and normalize volume across tracks using DynamicsCompressorNode.

**Implementation Steps:**

1. Add compressor to audio chain:
```typescript
const compressor = audioCtx.createDynamicsCompressor();

// Configure for music playback
compressor.threshold.setValueAtTime(-24, 0);    // dB
compressor.knee.setValueAtTime(30, 0);          // dB
compressor.ratio.setValueAtTime(12, 0);         // 12:1 ratio
compressor.attack.setValueAtTime(0.003, 0);     // 3ms
compressor.release.setValueAtTime(0.25, 0);     // 250ms

// Insert before final destination:
// ... → AnalyserNode → Compressor → Destination
analyserNode.connect(compressor);
compressor.connect(audioCtx.destination);
```

**Testing Criteria:**
- No clipping or distortion at max volume
- Consistent volume across different tracks
- Smooth transitions without pumping artifacts

---

### Task 3.3: Add VU Meters with Peak Detection
**Complexity:** Medium
**Dependencies:** Task 1.2 complete
**Files:** Create new `VUMeter.tsx` component

**Description:**
Add professional VU meters showing real-time audio levels with peak indicators.

**Implementation:**

1. Create VU meter hook (`useVUMeter.ts`):
```typescript
import { useEffect, useRef, useState } from 'react';

export function useVUMeter(analyserNode: AnalyserNode | null, isPlaying: boolean) {
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const rafIdRef = useRef<number | null>(null);
  const peakTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analyserNode || !isPlaying) {
      setLevel(0);
      return;
    }

    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

    const updateLevel = () => {
      analyserNode.getByteTimeDomainData(dataArray);

      // Calculate RMS (Root Mean Square) level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / dataArray.length);

      // Convert to dB scale (-60 to 0 dB)
      const db = 20 * Math.log10(rms || 0.0001);
      const normalized = Math.max(0, Math.min(100, ((db + 60) / 60) * 100));

      setLevel(normalized);

      // Update peak with hold time
      if (normalized > peak) {
        setPeak(normalized);

        if (peakTimeoutRef.current) {
          clearTimeout(peakTimeoutRef.current);
        }

        peakTimeoutRef.current = window.setTimeout(() => {
          setPeak(0);
        }, 1500);
      }

      rafIdRef.current = requestAnimationFrame(updateLevel);
    };

    rafIdRef.current = requestAnimationFrame(updateLevel);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (peakTimeoutRef.current) {
        clearTimeout(peakTimeoutRef.current);
      }
    };
  }, [analyserNode, isPlaying, peak]);

  return { level, peak };
}
```

2. Create VU meter component (`VUMeter.tsx`):
```typescript
import React from 'react';
import { useMusicPlayer } from '../../contexts/MusicPlayerContext';
import { useVUMeter } from '../../hooks/useVUMeter';
import styles from './styles.module.css';

export default function VUMeter() {
  const { analyserNode, isPlaying } = useMusicPlayer();
  const { level, peak } = useVUMeter(analyserNode, isPlaying);

  return (
    <div className={styles.vuMeter}>
      <div className={styles.vuLabels}>
        <span>-60</span>
        <span>-30</span>
        <span>-12</span>
        <span>-6</span>
        <span&gt;0 dB</span>
      </div>
      <div className={styles.vuBar}>
        <div
          className={styles.vuLevel}
          style={{
            width: `${level}%`,
            backgroundColor: level > 95 ? '#ff0000' :
                           level > 85 ? '#ffaa00' :
                           '#00ff00'
          }}
        />
        {peak > 0 && (
          <div
            className={styles.vuPeak}
            style={{ left: `${peak}%` }}
          />
        )}
      </div>
    </div>
  );
}
```

**Testing Criteria:**
- VU meter responds to audio in real-time
- Peak indicator holds for 1.5 seconds
- Red zone indicates clipping danger (> 95%)
- Smooth animation

---

### Task 3.4: Implement Stereo Width Control (Advanced)
**Complexity:** Hard
**Dependencies:** Phase 1 complete
**Files:** `MusicPlayerContext.tsx`, create new `StereoWidthControl.tsx`

**Description:**
Add stereo width adjustment to make audio feel wider or more mono.

**Implementation Steps:**

1. Create stereo width processing:
```typescript
const [stereoWidth, setStereoWidth] = useState(1.0); // 0 = mono, 1 = normal, 2 = wide

// Add to audio chain
const splitter = audioCtx.createChannelSplitter(2);
const merger = audioCtx.createChannelMerger(2);
const widthGain = audioCtx.createGain();

// Mid/Side encoding
// Mid (M) = L + R
// Side (S) = L - R
// Adjust width by scaling S channel

// This requires custom processing - may need ScriptProcessorNode
// or AudioWorklet for true M/S encoding
```

**Note:** This is an advanced feature that may require AudioWorklet for best implementation. Consider implementing after core features are solid.

---

## ✅ Testing & Verification

### Unit Testing Checklist:
- [ ] Volume control works smoothly from 0-100%
- [ ] Volume persists across page reloads
- [ ] FFT visualizer updates at 60fps
- [ ] Visualizer bars return to 0 when paused
- [ ] No memory leaks from requestAnimationFrame
- [ ] EQ sliders affect correct frequency ranges
- [ ] No audio distortion at extreme EQ settings
- [ ] Compressor prevents clipping
- [ ] VU meter shows accurate levels

### Integration Testing:
- [ ] All features work together without conflicts
- [ ] No audio glitches when switching tracks
- [ ] Performance remains smooth with all features enabled
- [ ] Memory usage is stable over time

### Browser Compatibility:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (webkit)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

---

## ⚡ Performance Optimization Notes

### Potential Issues:
1. **requestAnimationFrame overhead** - Multiple RAF loops for visualizer + VU meter
   - **Solution:** Combine into single RAF loop in context

2. **Frequency data calculation** - Heavy computation every frame
   - **Solution:** Use Web Workers for FFT processing if needed

3. **React re-renders** - Visualizer updates trigger renders
   - **Solution:** Use React.memo and useCallback strategically

### Memory Management:
- Always cleanup RAF loops in useEffect return
- Cancel timers and intervals
- Disconnect audio nodes when component unmounts
- Clear large buffers when not needed

### Mobile Considerations:
- Reduce FFT bin count on mobile (12 bars instead of 24)
- Lower smoothingTimeConstant on mobile (0.5 instead of 0.8)
- Consider disabling EQ on low-end devices
- Test battery impact

---

## 📚 Technical References

### Web Audio API Resources:
- [MDN Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [HTML5 Rocks: Web Audio](https://www.html5rocks.com/en/tutorials/webaudio/intro/)
- [Web Audio API Spec](https://www.w3.org/TR/webaudio/)

### Audio Engineering Concepts:
- **FFT (Fast Fourier Transform):** Converts time-domain audio to frequency-domain
- **RMS (Root Mean Square):** Standard method for measuring audio levels
- **Compressor Ratio:** Amount of gain reduction (12:1 = heavy compression)
- **EQ Q Factor:** Width of frequency band affected (higher = narrower)
- **dB (Decibels):** Logarithmic unit for measuring sound intensity

### Key Audio Nodes:
- **GainNode:** Volume control
- **AnalyserNode:** FFT and waveform analysis
- **BiquadFilterNode:** EQ filters (lowshelf, peaking, highshelf)
- **DynamicsCompressorNode:** Automatic gain control
- **ChannelSplitterNode/MergerNode:** Stereo processing

---

## 🚀 Implementation Order

**Week 1:**
1. Task 1.1 - Create GainNode (Day 1)
2. Task 1.2 - Audio routing chain (Day 2)
3. Task 1.3 - Logarithmic volume (Day 3)
4. Testing & fixes (Days 4-5)

**Week 2:**
1. Task 2.1 - FFT data hook (Days 1-2)
2. Task 2.2 - WinampModal visualizer (Day 3)
3. Task 2.3 - MinifiedPlayer visualizer (Day 4)
4. Testing & fixes (Day 5)

**Week 3+:**
1. Task 3.1 - 3-band EQ (Days 1-3)
2. Task 3.2 - Compressor (Day 4)
3. Task 3.3 - VU meters (Day 5)
4. Task 3.4 - Stereo width (Optional)

---

## ✨ Success Criteria

**Phase 1 Success:**
- ✅ Volume slider controls actual audio output
- ✅ No audio routing errors in console
- ✅ Smooth volume transitions

**Phase 2 Success:**
- ✅ Visualizer bars respond to actual music frequencies
- ✅ 60fps animation performance
- ✅ Bass frequencies show on left, treble on right

**Phase 3 Success:**
- ✅ EQ controls provide audible frequency shaping
- ✅ No clipping or distortion
- ✅ Professional audio quality

**Overall Success:**
- ✅ Winamp player feels like professional audio software
- ✅ All features work reliably across browsers
- ✅ Excellent performance on desktop and mobile
- ✅ Code is maintainable and well-documented

---

**End of Roadmap**

For questions or clarifications, refer to:
- `/website/src/contexts/MusicPlayerContext.tsx` - Current implementation
- Web Audio API documentation
- sound-engineer skill for professional audio guidance

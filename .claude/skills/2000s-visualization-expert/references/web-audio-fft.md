# Web Audio API FFT Reference

Comprehensive guide to extracting and using audio frequency data.

---

## Basic FFT Setup

```typescript
// Create analyser
const analyserNode = audioContext.createAnalyser();
analyserNode.fftSize = 2048;  // Power of 2, 32-32768
analyserNode.smoothingTimeConstant = 0.8;  // 0-1, higher = smoother

// Connect to audio chain
source.connect(analyserNode);
analyserNode.connect(audioContext.destination);

// Get frequency data (spectrum)
const frequencyData = new Uint8Array(analyserNode.frequencyBinCount);
analyserNode.getByteFrequencyData(frequencyData);  // 0-255 values

// Get waveform data (time domain)
const waveformData = new Uint8Array(analyserNode.fftSize);
analyserNode.getByteTimeDomainData(waveformData);  // 128 = silence
```

---

## FFT Size Tradeoffs

| fftSize | Bins | Frequency Resolution | Time Resolution | Use Case |
|---------|------|---------------------|-----------------|----------|
| 256 | 128 | 172 Hz | 5.8 ms | Beat detection |
| 512 | 256 | 86 Hz | 11.6 ms | Fast visuals |
| 1024 | 512 | 43 Hz | 23.2 ms | Balanced |
| 2048 | 1024 | 22 Hz | 46.4 ms | Detailed spectrum |
| 4096 | 2048 | 11 Hz | 92.9 ms | High-res analysis |

**Rule of thumb**: Higher fftSize = better frequency resolution but slower response.

---

## Logarithmic Frequency Bands

**Critical knowledge**: FFT bins are linear in frequency, but human hearing is logarithmic!

```typescript
function getLogarithmicBands(
  frequencyData: Uint8Array,
  numBands: number,
  sampleRate: number = 44100
): number[] {
  const bands = new Array(numBands).fill(0);
  const nyquist = sampleRate / 2;

  for (let i = 0; i < numBands; i++) {
    // Logarithmic frequency mapping (20Hz - Nyquist)
    const lowFreq = 20 * Math.pow(nyquist / 20, i / numBands);
    const highFreq = 20 * Math.pow(nyquist / 20, (i + 1) / numBands);

    const lowBin = Math.floor(lowFreq / nyquist * frequencyData.length);
    const highBin = Math.floor(highFreq / nyquist * frequencyData.length);

    let sum = 0;
    let count = 0;
    for (let j = lowBin; j < highBin && j < frequencyData.length; j++) {
      sum += frequencyData[j];
      count++;
    }
    bands[i] = count > 0 ? sum / count : 0;
  }
  return bands;
}
```

---

## Common Frequency Ranges

```typescript
function getFrequencyRanges(
  frequencyData: Uint8Array,
  sampleRate: number = 44100
): { bass: number; mid: number; treble: number } {
  const nyquist = sampleRate / 2;
  const binWidth = nyquist / frequencyData.length;

  function getRange(lowHz: number, highHz: number): number {
    const lowBin = Math.floor(lowHz / binWidth);
    const highBin = Math.min(
      Math.floor(highHz / binWidth),
      frequencyData.length - 1
    );

    let sum = 0;
    for (let i = lowBin; i <= highBin; i++) {
      sum += frequencyData[i];
    }
    return sum / (highBin - lowBin + 1);
  }

  return {
    bass: getRange(20, 250),      // Sub-bass + bass
    mid: getRange(250, 4000),     // Low-mid + mid + high-mid
    treble: getRange(4000, 20000) // Presence + brilliance
  };
}
```

---

## Beat Detection

```typescript
class BeatDetector {
  private history: number[] = [];
  private historySize = 43;  // ~1 second at 60fps
  private threshold = 1.3;

  detect(frequencyData: Uint8Array): boolean {
    // Focus on bass frequencies (first 1/8 of spectrum)
    const bassEnd = Math.floor(frequencyData.length / 8);
    let bassEnergy = 0;
    for (let i = 0; i < bassEnd; i++) {
      bassEnergy += frequencyData[i] * frequencyData[i];
    }
    bassEnergy = Math.sqrt(bassEnergy / bassEnd);

    // Add to history
    this.history.push(bassEnergy);
    if (this.history.length > this.historySize) {
      this.history.shift();
    }

    // Compare to average
    const average = this.history.reduce((a, b) => a + b, 0) / this.history.length;

    // Beat if current energy exceeds threshold * average
    return bassEnergy > average * this.threshold;
  }
}
```

---

## Smoothing Techniques

### Built-in Smoothing
```typescript
analyserNode.smoothingTimeConstant = 0.8;  // 0 = no smoothing, 1 = frozen
```

### Manual Exponential Smoothing
```typescript
class SmoothingFilter {
  private smoothed: Float32Array;
  private alpha: number;

  constructor(size: number, alpha: number = 0.3) {
    this.smoothed = new Float32Array(size);
    this.alpha = alpha;
  }

  apply(raw: Uint8Array): Float32Array {
    for (let i = 0; i < raw.length; i++) {
      this.smoothed[i] = this.smoothed[i] * (1 - this.alpha) + raw[i] * this.alpha;
    }
    return this.smoothed;
  }
}
```

### Attack/Release Smoothing
```typescript
class AttackRelease {
  private current: number = 0;
  private attack: number;   // Fast rise
  private release: number;  // Slow fall

  constructor(attack: number = 0.9, release: number = 0.3) {
    this.attack = attack;
    this.release = release;
  }

  apply(target: number): number {
    const alpha = target > this.current ? this.attack : this.release;
    this.current = this.current * (1 - alpha) + target * alpha;
    return this.current;
  }
}
```

---

## Audio Texture for Shaders

```typescript
function createAudioTexture(
  gl: WebGLRenderingContext,
  frequencyData: Uint8Array
): WebGLTexture {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Upload as 1D texture (width = data length, height = 1)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.LUMINANCE,
    frequencyData.length,
    1,
    0,
    gl.LUMINANCE,
    gl.UNSIGNED_BYTE,
    frequencyData
  );

  // Filtering
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  return texture!;
}

// Update each frame
function updateAudioTexture(
  gl: WebGLRenderingContext,
  texture: WebGLTexture,
  frequencyData: Uint8Array
) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texSubImage2D(
    gl.TEXTURE_2D,
    0,
    0, 0,
    frequencyData.length, 1,
    gl.LUMINANCE,
    gl.UNSIGNED_BYTE,
    frequencyData
  );
}
```

---

## AudioContext State Handling

```typescript
async function ensureAudioContext(
  audioContext: AudioContext
): Promise<void> {
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
}

// Require user interaction to start
function setupAudioActivation(
  audioContext: AudioContext,
  element: HTMLElement
) {
  const activate = async () => {
    await ensureAudioContext(audioContext);
    element.removeEventListener('click', activate);
    element.removeEventListener('touchstart', activate);
  };

  element.addEventListener('click', activate);
  element.addEventListener('touchstart', activate);
}
```

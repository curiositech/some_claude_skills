# Voice Audio Implementation Reference

Detailed code implementations for voice processing, loudness measurement, and speech analysis.

## Biquad Filter (Audio EQ Cookbook)

```python
import numpy as np
from scipy import signal

class AudioFilters:
    """Production-ready filter implementations."""

    @staticmethod
    def biquad_coefficients(filter_type: str, fc: float, fs: float,
                           Q: float = 0.707, gain_db: float = 0) -> tuple:
        """
        Calculate biquad filter coefficients.
        Uses Audio EQ Cookbook formulas (Robert Bristow-Johnson)
        """
        A = 10 ** (gain_db / 40)
        w0 = 2 * np.pi * fc / fs
        cos_w0 = np.cos(w0)
        sin_w0 = np.sin(w0)
        alpha = sin_w0 / (2 * Q)

        if filter_type == 'lowpass':
            b0 = (1 - cos_w0) / 2
            b1 = 1 - cos_w0
            b2 = (1 - cos_w0) / 2
            a0 = 1 + alpha
            a1 = -2 * cos_w0
            a2 = 1 - alpha

        elif filter_type == 'highpass':
            b0 = (1 + cos_w0) / 2
            b1 = -(1 + cos_w0)
            b2 = (1 + cos_w0) / 2
            a0 = 1 + alpha
            a1 = -2 * cos_w0
            a2 = 1 - alpha

        elif filter_type == 'peaking':
            b0 = 1 + alpha * A
            b1 = -2 * cos_w0
            b2 = 1 - alpha * A
            a0 = 1 + alpha / A
            a1 = -2 * cos_w0
            a2 = 1 - alpha / A

        elif filter_type == 'highshelf':
            b0 = A * ((A + 1) + (A - 1) * cos_w0 + 2 * np.sqrt(A) * alpha)
            b1 = -2 * A * ((A - 1) + (A + 1) * cos_w0)
            b2 = A * ((A + 1) + (A - 1) * cos_w0 - 2 * np.sqrt(A) * alpha)
            a0 = (A + 1) - (A - 1) * cos_w0 + 2 * np.sqrt(A) * alpha
            a1 = 2 * ((A - 1) - (A + 1) * cos_w0)
            a2 = (A + 1) - (A - 1) * cos_w0 - 2 * np.sqrt(A) * alpha

        # Normalize
        b = np.array([b0/a0, b1/a0, b2/a0])
        a = np.array([1, a1/a0, a2/a0])
        return b, a
```

## LUFS Loudness Measurement

```python
import numpy as np
from scipy import signal

def measure_lufs(audio: np.ndarray, fs: int) -> float:
    """
    Measure integrated loudness per ITU-R BS.1770-4.
    """
    # Stage 1: K-weighting filter
    b1, a1 = signal.butter(2, 1500 / (fs/2), btype='high')
    b2, a2 = signal.butter(2, 38 / (fs/2), btype='high')

    filtered = signal.lfilter(b1, a1, audio)
    filtered = signal.lfilter(b2, a2, filtered)

    # Stage 2: Mean square with gating
    block_size = int(0.4 * fs)  # 400ms blocks
    hop_size = int(0.1 * fs)    # 100ms overlap

    block_loudness = []
    for i in range(0, len(filtered) - block_size, hop_size):
        block = filtered[i:i+block_size]
        mean_square = np.mean(block ** 2)
        block_loudness.append(-0.691 + 10 * np.log10(mean_square + 1e-10))

    # Absolute threshold gate (-70 LUFS)
    gated = [l for l in block_loudness if l > -70]
    if not gated:
        return -70.0

    # Relative threshold gate (-10 LU below ungated mean)
    ungated_mean = np.mean(gated)
    relative_threshold = ungated_mean - 10
    final_gated = [l for l in gated if l > relative_threshold]

    return np.mean(final_gated) if final_gated else ungated_mean
```

## Compressor Implementation

```python
import numpy as np

class Compressor:
    """Production-quality dynamics compressor."""

    def __init__(self, fs: int):
        self.fs = fs
        self.envelope = 0.0

    def process(self, audio: np.ndarray,
                threshold_db: float = -20,
                ratio: float = 4.0,
                attack_ms: float = 10,
                release_ms: float = 100,
                knee_db: float = 6,
                makeup_db: float = 0) -> np.ndarray:
        """Apply compression to audio signal."""
        attack_coef = np.exp(-1 / (self.fs * attack_ms / 1000))
        release_coef = np.exp(-1 / (self.fs * release_ms / 1000))

        output = np.zeros_like(audio)

        for i in range(len(audio)):
            input_level = 20 * np.log10(abs(audio[i]) + 1e-10)

            # Envelope follower
            if input_level > self.envelope:
                self.envelope = attack_coef * self.envelope + (1 - attack_coef) * input_level
            else:
                self.envelope = release_coef * self.envelope + (1 - release_coef) * input_level

            # Gain computer with soft knee
            over_threshold = self.envelope - threshold_db

            if knee_db > 0 and over_threshold > -knee_db/2 and over_threshold < knee_db/2:
                knee_factor = (over_threshold + knee_db/2) ** 2 / (2 * knee_db)
                gain_db = -knee_factor * (1 - 1/ratio)
            elif over_threshold >= knee_db/2:
                gain_db = -(over_threshold - knee_db/2) * (1 - 1/ratio) - (knee_db/2) * (1 - 1/ratio)
            else:
                gain_db = 0

            gain_linear = 10 ** ((gain_db + makeup_db) / 20)
            output[i] = audio[i] * gain_linear

        return output
```

## De-esser Implementation

```python
import numpy as np
from scipy import signal

class DeEsser:
    """Frequency-selective de-esser for sibilance control."""

    def __init__(self, fs: int):
        self.fs = fs

    def process(self, audio: np.ndarray,
                frequency: float = 6000,
                threshold_db: float = -20,
                reduction_db: float = 6,
                q: float = 2.0) -> np.ndarray:
        """
        Reduce sibilance in voice recordings.

        Args:
            frequency: Center frequency for sibilance detection (5-8kHz typical)
            threshold_db: Level above which de-essing activates
            reduction_db: Maximum gain reduction
            q: Bandwidth (higher = narrower)
        """
        # Create bandpass to detect sibilance
        nyq = self.fs / 2
        low = (frequency - frequency/q) / nyq
        high = (frequency + frequency/q) / nyq
        b, a = signal.butter(2, [low, high], btype='band')

        # Detect sibilance envelope
        sibilance = signal.lfilter(b, a, audio)
        envelope = np.abs(sibilance)

        # Smooth envelope
        smooth_coef = 0.99
        smoothed = np.zeros_like(envelope)
        smoothed[0] = envelope[0]
        for i in range(1, len(envelope)):
            smoothed[i] = smooth_coef * smoothed[i-1] + (1 - smooth_coef) * envelope[i]

        # Calculate gain reduction
        threshold_linear = 10 ** (threshold_db / 20)
        reduction_linear = 10 ** (-reduction_db / 20)

        output = audio.copy()
        for i in range(len(audio)):
            if smoothed[i] > threshold_linear:
                gain = 1.0 - (1.0 - reduction_linear) * (smoothed[i] - threshold_linear) / smoothed[i]
                output[i] *= gain

        return output
```

## Voice Activity Detection (VAD)

```python
import numpy as np

class VoiceActivityDetector:
    """Simple energy-based VAD for voice detection."""

    def __init__(self, fs: int, frame_ms: float = 20):
        self.fs = fs
        self.frame_size = int(fs * frame_ms / 1000)

    def detect(self, audio: np.ndarray,
               energy_threshold_db: float = -40,
               min_speech_ms: float = 100) -> list[tuple[int, int]]:
        """
        Detect speech segments in audio.

        Returns: List of (start_sample, end_sample) tuples
        """
        num_frames = len(audio) // self.frame_size
        is_speech = np.zeros(num_frames, dtype=bool)

        for i in range(num_frames):
            frame = audio[i * self.frame_size:(i + 1) * self.frame_size]
            energy_db = 20 * np.log10(np.sqrt(np.mean(frame ** 2)) + 1e-10)
            is_speech[i] = energy_db > energy_threshold_db

        # Merge short gaps, remove short segments
        min_frames = int(min_speech_ms / (self.frame_size / self.fs * 1000))

        # Simple hangover
        for i in range(1, len(is_speech) - 1):
            if is_speech[i-1] and is_speech[i+1]:
                is_speech[i] = True

        # Extract segments
        segments = []
        in_segment = False
        start = 0

        for i, speech in enumerate(is_speech):
            if speech and not in_segment:
                start = i * self.frame_size
                in_segment = True
            elif not speech and in_segment:
                end = i * self.frame_size
                if (end - start) / self.fs * 1000 >= min_speech_ms:
                    segments.append((start, end))
                in_segment = False

        if in_segment:
            segments.append((start, len(audio)))

        return segments
```

## Audio Analysis Report Generator

```python
import numpy as np
from scipy.fft import rfft, rfftfreq

def analyze_voice_audio(audio: np.ndarray, fs: int) -> dict:
    """Comprehensive voice audio analysis."""

    # Mono for analysis
    if len(audio.shape) > 1:
        mono = np.mean(audio, axis=1)
    else:
        mono = audio

    # Level measurements
    peak_db = 20 * np.log10(np.max(np.abs(mono)) + 1e-10)
    rms_db = 20 * np.log10(np.sqrt(np.mean(mono**2)) + 1e-10)
    crest_factor = peak_db - rms_db
    lufs = measure_lufs(mono, fs)
    dc_offset = np.mean(mono)

    # Spectral analysis
    spectrum = np.abs(rfft(mono))
    freqs = rfftfreq(len(mono), 1/fs)
    spectral_centroid = np.sum(freqs * spectrum) / np.sum(spectrum)

    # Voice-specific metrics
    # Fundamental frequency estimation (simple autocorrelation)
    autocorr = np.correlate(mono[:4096], mono[:4096], mode='full')
    autocorr = autocorr[len(autocorr)//2:]
    # Find first peak after initial decay
    min_lag = int(fs / 500)  # 500Hz max
    max_lag = int(fs / 50)   # 50Hz min
    peak_lag = np.argmax(autocorr[min_lag:max_lag]) + min_lag
    f0_estimate = fs / peak_lag if peak_lag > 0 else 0

    return {
        'peak_db': peak_db,
        'rms_db': rms_db,
        'crest_factor': crest_factor,
        'lufs': lufs,
        'dc_offset': dc_offset,
        'spectral_centroid': spectral_centroid,
        'f0_estimate': f0_estimate,
        'duration_seconds': len(mono) / fs,
        'sample_rate': fs
    }

def generate_recommendations(analysis: dict) -> list[str]:
    """Generate processing recommendations from analysis."""
    recs = []

    if analysis['peak_db'] > -0.5:
        recs.append("Peaks near 0dBFS - risk of clipping; add limiter")
    if analysis['lufs'] > -14:
        recs.append("Too loud for streaming (-14 LUFS target)")
    if analysis['lufs'] < -20:
        recs.append("Consider increasing overall level")
    if analysis['crest_factor'] < 6:
        recs.append("Low crest factor - may sound over-compressed")
    if abs(analysis['dc_offset']) > 0.01:
        recs.append("DC offset detected - apply high-pass filter at 80Hz")
    if analysis['spectral_centroid'] < 1500:
        recs.append("Voice sounds muddy - consider high shelf boost at 3kHz")
    if analysis['spectral_centroid'] > 4000:
        recs.append("Voice sounds harsh - consider reducing 2-4kHz")

    return recs if recs else ["Audio looks good!"]
```

## Loudness Standards Reference

```
LOUDNESS UNITS (ITU-R BS.1770)

LUFS (Loudness Units Full Scale)
├── Integrated: Average loudness over entire program
├── Short-term: 3-second sliding window
├── Momentary: 400ms sliding window
└── True Peak: Maximum sample value with intersample peaks

DELIVERY STANDARDS
├── Streaming (Spotify, Apple): -14 LUFS, -1 dBTP
├── Broadcast (EBU R128): -23 LUFS ±1, -1 dBTP
├── Broadcast (ATSC A/85): -24 LKFS ±2, -2 dBTP
├── Podcast: -16 to -19 LUFS (dialogue norm)
├── YouTube: -14 LUFS (normalized)
└── Audiobook (ACX): -18 to -23 dBFS RMS, -3 dBFS peak

LOUDNESS RANGE (LRA)
├── Classical: 15-20 LU
├── Film: 10-15 LU
├── Pop music: 5-8 LU
└── Broadcast speech: 3-6 LU
```

## Digital Audio Theory Reference

```
SAMPLE RATES
├── 44.1kHz: CD standard, captures up to 22.05kHz
├── 48kHz: Video standard (cleaner for frame sync)
├── 96kHz: High-resolution, better for processing headroom
└── Why 44.1kHz? Derived from video: 44100 = 3×3×5×5×7×7×2

BIT DEPTH → DYNAMIC RANGE
├── Dynamic Range (dB) ≈ 6.02 × bits + 1.76
├── 16-bit: ~96 dB (CD quality)
├── 24-bit: ~144 dB (professional)
└── 32-bit float: ~1528 dB (effectively infinite)

DITHERING
├── Required when reducing bit depth (24→16)
├── TPDF (triangular): Standard, mathematically optimal
└── Shaped: Noise pushed above hearing range
```

## Key References

- ITU-R BS.1770: "Algorithms to measure audio programme loudness"
- EBU R128: "Loudness normalisation and permitted maximum level"
- AES-6id: "Personal Sound Exposure"
- Bristow-Johnson, R.: "Audio EQ Cookbook" (filter formulas)
- Blauert, J. (1997): *Spatial Hearing* (MIT Press)

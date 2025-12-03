---
title: HRV Metrics Deep Dive
sidebar_label: HRV Metrics Deep Dive
sidebar_position: 2
---
# HRV Metrics Deep Dive

## Time-Domain Metrics

```python
import numpy as np
from scipy import signal

def calculate_hrv_metrics(rr_intervals):
    """
    Calculate key HRV metrics from RR intervals (in milliseconds)

    Args:
        rr_intervals: Array of intervals between heartbeats (ms)

    Returns:
        Dictionary of HRV metrics
    """

    # SDNN: Standard deviation of NN intervals
    # Reflects overall HRV - higher is generally better
    # < 50ms = poor, 50-100ms = compromised, >100ms = healthy
    sdnn = np.std(rr_intervals, ddof=1)

    # RMSSD: Root mean square of successive differences
    # Reflects parasympathetic (rest & digest) activity
    # < 20ms = low, 20-50ms = moderate, >50ms = good vagal tone
    successive_diffs = np.diff(rr_intervals)
    rmssd = np.sqrt(np.mean(successive_diffs ** 2))

    # pNN50: Percentage of successive RR intervals that differ by > 50ms
    # Another parasympathetic indicator
    # < 5% = low, 5-15% = moderate, >15% = good
    pnn50 = np.sum(np.abs(successive_diffs) > 50) / len(successive_diffs) * 100

    # Mean HR and HRV
    mean_rr = np.mean(rr_intervals)
    mean_hr = 60000 / mean_rr  # Convert to BPM

    return {
        'sdnn': sdnn,
        'rmssd': rmssd,
        'pnn50': pnn50,
        'mean_rr': mean_rr,
        'mean_hr': mean_hr
    }
```

## Frequency-Domain Metrics

```python
def calculate_frequency_domain_hrv(rr_intervals, sampling_rate=4):
    """
    Calculate frequency domain HRV metrics

    LF (0.04-0.15 Hz): Low frequency - mixed sympathetic/parasympathetic
    HF (0.15-0.4 Hz): High frequency - parasympathetic (vagal activity)
    LF/HF ratio: Autonomic balance indicator
    """

    # Resample to regular intervals
    time = np.cumsum(rr_intervals) / 1000  # Convert to seconds
    time_regular = np.arange(0, time[-1], 1/sampling_rate)
    rr_regular = np.interp(time_regular, time, rr_intervals)

    # Detrend
    rr_detrended = signal.detrend(rr_regular)

    # Welch's method for power spectral density
    frequencies, psd = signal.welch(
        rr_detrended,
        fs=sampling_rate,
        nperseg=256
    )

    # Define frequency bands
    lf_band = (frequencies >= 0.04) & (frequencies < 0.15)
    hf_band = (frequencies >= 0.15) & (frequencies < 0.4)

    # Calculate power in each band
    lf_power = np.trapz(psd[lf_band], frequencies[lf_band])
    hf_power = np.trapz(psd[hf_band], frequencies[hf_band])

    # LF/HF ratio
    # < 1 = parasympathetic dominance (rest)
    # 1-2 = balanced
    # > 2 = sympathetic dominance (stress/arousal)
    lf_hf_ratio = lf_power / hf_power if hf_power > 0 else float('inf')

    return {
        'lf_power': lf_power,
        'hf_power': hf_power,
        'lf_hf_ratio': lf_hf_ratio,
        'total_power': np.trapz(psd, frequencies)
    }
```

## HRV Interpretation Framework

**What HRV Tells You:**

**High HRV** (RMSSD > 50ms, SDNN > 100ms):
- ✅ Good stress resilience
- ✅ Strong parasympathetic tone
- ✅ Good recovery capacity
- ✅ Cardiovascular health
- ✅ Adaptability to stress

**Low HRV** (RMSSD \< 20ms, SDNN \< 50ms):
- ⚠️ Chronic stress or overtraining
- ⚠️ Poor recovery
- ⚠️ Sympathetic dominance
- ⚠️ Potential burnout
- ⚠️ Health risk indicator

**Context Matters:**
- Time of day (lower in morning, higher at night)
- Sleep quality (poor sleep = lower HRV)
- Exercise (acute decrease, chronic increase)
- Stress (mental/physical = decreased HRV)
- Hydration, alcohol, caffeine all affect HRV

## Emotional State Detection

```python
class EmotionalStateMonitor:
    """Use HRV patterns to identify emotional states"""

    def __init__(self):
        self.baseline_hrv = None
        self.emotion_signatures = {
            'calm': {'rmssd': '>baseline', 'lf_hf': '<1.5'},
            'stress': {'rmssd': '<baseline*0.7', 'lf_hf': '>2.5'},
            'anxiety': {'rmssd': '<baseline*0.6', 'hr': '>baseline+10'},
            'flow': {'rmssd': '~baseline', 'sdnn': '>baseline', 'lf_hf': '1.5-2.0'},
            'fatigue': {'rmssd': '<baseline*0.8', 'hr': 'variable'}
        }

    def establish_baseline(self, resting_hrv_sessions):
        """Establish personal baseline from multiple resting measurements"""
        all_metrics = [calculate_hrv_metrics(session)
                       for session in resting_hrv_sessions]

        self.baseline_hrv = {
            'rmssd': np.median([m['rmssd'] for m in all_metrics]),
            'sdnn': np.median([m['sdnn'] for m in all_metrics]),
            'hr': np.median([m['mean_hr'] for m in all_metrics])
        }

    def detect_emotional_state(self, current_rr_intervals):
        """Detect likely emotional state from HRV"""

        current = calculate_hrv_metrics(current_rr_intervals)
        freq = calculate_frequency_domain_hrv(current_rr_intervals)

        # Compare to baseline
        rmssd_ratio = current['rmssd'] / self.baseline_hrv['rmssd']
        hr_delta = current['mean_hr'] - self.baseline_hrv['hr']

        # Pattern matching
        if rmssd_ratio > 1.2 and freq['lf_hf_ratio'] < 1.5:
            return 'calm', 0.8
        elif rmssd_ratio < 0.7 and freq['lf_hf_ratio'] > 2.5:
            return 'stress', 0.85
        elif rmssd_ratio < 0.6 and hr_delta > 10:
            return 'anxiety', 0.75
        elif 0.8 < rmssd_ratio < 1.2 and 1.5 < freq['lf_hf_ratio'] < 2.0:
            return 'flow', 0.7
        else:
            return 'unclear', 0.4
```

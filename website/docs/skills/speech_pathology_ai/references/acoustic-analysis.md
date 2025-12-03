---
title: Acoustic Analysis for Speech Pathology
sidebar_label: Acoustic Analysis for Speec...
sidebar_position: 1
---
# Acoustic Analysis for Speech Pathology

## Speech Analysis with Signal Processing

```python
import numpy as np
import librosa
from scipy import signal

class PhonemeAnalyzer:
    def __init__(self, sample_rate=16000):
        self.sr = sample_rate

    def extract_formants(self, audio, n_formants=4):
        """
        Extract formant frequencies using Linear Predictive Coding (LPC)

        Formants are resonant frequencies of the vocal tract
        F1, F2 determine vowel identity
        """
        # Pre-emphasis filter (boost high frequencies)
        pre_emphasis = 0.97
        emphasized = np.append(audio[0], audio[1:] - pre_emphasis * audio[:-1])

        # Frame the signal
        frame_length = int(0.025 * self.sr)  # 25ms frames
        frame_step = int(0.010 * self.sr)    # 10ms step

        # LPC analysis
        lpc_order = 12  # Typical for formant extraction
        formants_over_time = []

        for i in range(0, len(emphasized) - frame_length, frame_step):
            frame = emphasized[i:i + frame_length]

            # Apply window
            windowed = frame * np.hamming(len(frame))

            # Compute LPC coefficients
            lpc_coeffs = librosa.lpc(windowed, order=lpc_order)

            # Find roots of LPC polynomial
            roots = np.roots(lpc_coeffs)
            roots = roots[np.imag(roots) >= 0]  # Keep positive frequencies

            # Convert to frequencies
            angles = np.arctan2(np.imag(roots), np.real(roots))
            frequencies = angles * (self.sr / (2 * np.pi))

            # Sort and extract formants
            formants = sorted(frequencies)[:n_formants]
            formants_over_time.append(formants)

        return np.array(formants_over_time)

    def compute_mfcc(self, audio, n_mfcc=13):
        """
        Mel-Frequency Cepstral Coefficients
        Standard features for speech recognition
        """
        mfcc = librosa.feature.mfcc(
            y=audio,
            sr=self.sr,
            n_mfcc=n_mfcc,
            n_fft=512,
            hop_length=160
        )

        # Delta and delta-delta features (velocity and acceleration)
        mfcc_delta = librosa.feature.delta(mfcc)
        mfcc_delta2 = librosa.feature.delta(mfcc, order=2)

        return np.vstack([mfcc, mfcc_delta, mfcc_delta2])

    def detect_voice_onset(self, audio, threshold_db=-40):
        """
        Detect Voice Onset Time (VOT) - critical for /p/ vs /b/ distinction
        """
        # Compute short-time energy
        frame_length = int(0.010 * self.sr)  # 10ms
        energy = np.array([
            np.sum(audio[i:i+frame_length]**2)
            for i in range(0, len(audio) - frame_length, frame_length//2)
        ])

        # Convert to dB
        energy_db = 10 * np.log10(energy + 1e-10)

        # Find first frame above threshold
        onset_idx = np.argmax(energy_db > threshold_db)
        onset_time = onset_idx * (frame_length // 2) / self.sr

        return onset_time

    def analyze_articulation_precision(self, audio, target_phoneme):
        """
        Measure how precisely a phoneme was articulated
        """
        formants = self.extract_formants(audio)

        # Target formant values for common vowels
        target_formants = {
            '/i/': (280, 2250),  # F1, F2 for "ee"
            '/u/': (300, 870),   # "oo"
            '/a/': (730, 1090),  # "ah"
            '/ɛ/': (530, 1840),  # "eh"
        }

        if target_phoneme in target_formants:
            target_f1, target_f2 = target_formants[target_phoneme]

            # Mean formants
            mean_f1 = np.mean(formants[:, 0])
            mean_f2 = np.mean(formants[:, 1])

            # Euclidean distance in formant space
            distance = np.sqrt(
                ((mean_f1 - target_f1) / target_f1)**2 +
                ((mean_f2 - target_f2) / target_f2)**2
            )

            # Convert to accuracy score (0-100)
            accuracy = max(0, 100 * (1 - distance))

            return {
                'accuracy': accuracy,
                'measured_f1': mean_f1,
                'measured_f2': mean_f2,
                'target_f1': target_f1,
                'target_f2': target_f2
            }

        return None
```

## Vocal Tract Visualization

```javascript
// WebGL visualization of articulatory positions
class VocalTractVisualizer {
    constructor(canvas) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });

        this.buildVocalTract();
    }

    buildVocalTract() {
        // Simplified 2D sagittal view of vocal tract
        const outline = new THREE.Shape();

        // Palate (roof of mouth)
        outline.moveTo(0, 3);
        outline.quadraticCurveTo(2, 3.5, 4, 3);
        outline.quadraticCurveTo(6, 2.5, 7, 1.5);

        // Pharynx (throat)
        outline.lineTo(7, -2);

        // Tongue base
        outline.quadraticCurveTo(6, -2.5, 4, -2.5);

        // Chin
        outline.lineTo(0, -2.5);
        outline.lineTo(0, 3);

        const geometry = new THREE.ShapeGeometry(outline);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffc0cb,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });

        this.vocalTract = new THREE.Mesh(geometry, material);
        this.scene.add(this.vocalTract);

        // Create movable tongue
        this.createTongue();

        // Create lips
        this.createLips();
    }

    createTongue() {
        const tongueShape = new THREE.Shape();
        tongueShape.moveTo(0, -2);
        tongueShape.quadraticCurveTo(2, -1.5, 4, -1);
        tongueShape.quadraticCurveTo(5, -0.5, 5.5, 0);
        tongueShape.quadraticCurveTo(5, -1, 4, -1.5);
        tongueShape.quadraticCurveTo(2, -2, 0, -2);

        const geometry = new THREE.ShapeGeometry(tongueShape);
        const material = new THREE.MeshBasicMaterial({ color: 0xff6b6b });

        this.tongue = new THREE.Mesh(geometry, material);
        this.scene.add(this.tongue);
    }

    createLips() {
        // Upper lip
        const upperLip = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.2, 0.3),
            new THREE.MeshBasicMaterial({ color: 0xff8888 })
        );
        upperLip.position.set(-0.5, 2.5, 0);

        // Lower lip
        const lowerLip = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.2, 0.3),
            new THREE.MeshBasicMaterial({ color: 0xff8888 })
        );
        lowerLip.position.set(-0.5, -2, 0);

        this.upperLip = upperLip;
        this.lowerLip = lowerLip;

        this.scene.add(upperLip);
        this.scene.add(lowerLip);
    }

    animateArticulation(phoneme) {
        // Articulatory positions for different phonemes
        const positions = {
            '/i/': {  // "ee"
                tongueFront: 5.5,
                tongueHeight: 2.5,
                lipRounding: 0,
                jawOpening: 0.3
            },
            '/u/': {  // "oo"
                tongueFront: 6,
                tongueHeight: 2,
                lipRounding: 1,
                jawOpening: 0.5
            },
            '/a/': {  // "ah"
                tongueFront: 3,
                tongueHeight: -1,
                lipRounding: 0,
                jawOpening: 2
            },
            '/s/': {  // "s"
                tongueFront: 4.5,
                tongueHeight: 1.5,
                lipRounding: 0,
                jawOpening: 0.5
            }
        };

        if (phoneme in positions) {
            const pos = positions[phoneme];

            // Animate tongue using GSAP or custom tween
            this.animateTongue(pos.tongueFront, pos.tongueHeight);
            this.animateLips(pos.lipRounding, pos.jawOpening);
        }
    }

    animateTongue(frontPos, height) {
        // Morph tongue shape to target position
        console.log(`Animating tongue to front: ${frontPos}, height: ${height}`);
    }

    animateLips(rounding, opening) {
        // Animate lip position
        this.lowerLip.position.y = -2 - opening;

        // Lip rounding (move forward)
        this.upperLip.position.x = -0.5 - rounding * 0.3;
        this.lowerLip.position.x = -0.5 - rounding * 0.3;
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
```

---
name: sound-engineer
description: Expert in spatial audio, procedural sound design, game audio middleware, and app UX sound design
---

# Sound Engineer

<SkillHeader
  skillName="Sound Engineer"
  fileName="sound-engineer"
  description={"Expert in spatial audio, procedural sound design, game audio middleware, and app UX sound design. Specializes in HRTF/Ambisonics, Wwise/FMOD integration, UI sound design, and adaptive music systems. Activate on 'spatial audio', 'HRTF', 'binaural', 'Wwise', 'FMOD', 'procedural sound', 'footstep system', 'adaptive music', 'UI sounds', 'notification audio', 'sonic branding'. NOT for music composition/production (use DAW), audio post-production for film (linear media), voice cloning/TTS (use voice-audio-engineer), podcast editing (use standard audio editors), or hardware design."}
  tags={["creation","audio","code","advanced"]}
/>

## When to Use This Skill

| Use Case | Example |
|----------|---------|
| Spatial audio | HRTF, binaural rendering, Ambisonics |
| Game audio middleware | Wwise, FMOD integration with Unreal/Unity |
| Procedural sound | Footsteps, wind, fire synthesis |
| Adaptive music | Horizontal/vertical remixing, stingers |
| App UX sound | Notification audio, sonic branding |
| iOS audio integration | AVAudioSession, interruption handling |

## Do NOT Use For

- **Voice cloning/TTS** → Use `voice-audio-engineer`
- **Music composition** → Use DAW tools
- **Podcast editing** → Use `voice-audio-engineer`
- **Film post-production** → Linear media, different workflow
- **Hardware design** → Out of scope

## MCP Integrations

| MCP Server | Capabilities |
|------------|--------------|
| **ElevenLabs** | Sound effects generation, isolation |
| **Stability AI** | Audio generation from descriptions |

## Expert vs Novice Shibboleths

| Topic | Novice Says | Expert Says |
|-------|-------------|-------------|
| Spatial audio | "Use stereo panning" | "First-order Ambisonics with binaural decode for VR" |
| Game audio | "Play sound when event happens" | "Set RTPC to 0.7, trigger Switch to Concrete, post event" |
| Footsteps | "Play random footstep sample" | "Material-aware procedural with debris layer and impact RTPC" |
| iOS audio | "Just play the audio" | "Configure AVAudioSession category, handle interruptions" |
| Adaptive music | "Crossfade between tracks" | "Horizontal layers with beat-synced transitions" |

## Common Anti-Patterns

### "Using stereo panning for VR spatial audio"

**What it looks like:** Simple left/right pan based on sound position

**Why it's wrong:** No height information, no HRTF cues, breaks immersion

**What to do instead:**
```
Binaural Pipeline:
1. Encode source to first-order Ambisonics (W, X, Y, Z)
2. Rotate soundfield by head orientation
3. Decode to binaural using HRTF convolution
```

### "Playing raw footstep samples"

**What it looks like:** Random selection from footstep audio files

**Why it's wrong:** Repetitive, no surface variation, breaks immersion

**What to do instead:**
```cpp
// Material-aware procedural footsteps
footstep_system
  .set_surface(raycasted_material)  // Concrete, Wood, Grass
  .set_impact_force(speed / 600.0f) // Walk vs run
  .set_wetness(weather.rain_level)
  .set_debris(surface.debris_amount)
  .generate_and_play();
```

### "Hardcoding audio paths instead of middleware"

**What it looks like:** Direct file loading in game code

**Why it's wrong:** No variation, no RTPC control, no profiling

**What to do instead:**
```cpp
// Use Wwise/FMOD events
UAkGameplayStatics::PostEventAtLocation(
    FootstepEvent,  // Wwise event with all variations
    Location,
    Rotation,
    World
);
// Middleware handles: variation, RTPC, switches, attenuation
```

## Spatial Audio Concepts

### HRTF (Head-Related Transfer Function)

Human hearing localizes via:
- **ITD:** Interaural Time Difference (sound arrives at one ear first)
- **ILD:** Interaural Level Difference (sound is louder in nearer ear)
- **HRTF:** Frequency filtering from ear shape (pinna cues)

### Ambisonics Orders

```
Order 0: 1 channel (W) - Omnidirectional
Order 1: 4 channels (W,X,Y,Z) - Basic 3D (VR minimum)
Order 2: 9 channels - Better localization
Order 3: 16 channels - Highest practical resolution
```

## Middleware Integration (Wwise/FMOD)

### Key Concepts

| Concept | Purpose | Example |
|---------|---------|---------|
| **RTPC** | Continuous parameter | Speed → engine pitch |
| **Switch** | Discrete selection | Surface → Concrete/Wood/Grass |
| **State** | Global mode | Music_Intensity → Combat |
| **Event** | Sound trigger | Play_Footstep |

### Wwise Integration Example

```cpp
// Set surface switch before footstep
UAkGameplayStatics::SetSwitch(
    TEXT("Surface"),
    *surface_type,  // "Concrete", "Wood", "Grass"
    actor
);

// Set impact force RTPC
UAkGameplayStatics::SetRTPCValue(
    TEXT("Impact_Force"),
    speed / 600.0f,  // 0-1 normalized
    0,  // Interpolation time
    actor
);

// Trigger footstep event
UAkGameplayStatics::PostEvent(FootstepEvent, actor);
```

## iOS Audio Integration

### AVAudioSession Categories

| Category | Use Case | Mixes with Others |
|----------|----------|-------------------|
| `.ambient` | Background sounds, games | Yes |
| `.playback` | Music, podcasts | No |
| `.playAndRecord` | Voice chat, recording | No |
| `.soloAmbient` | Exclusive playback | No |

### Interruption Handling

```swift
NotificationCenter.default.addObserver(
    forName: AVAudioSession.interruptionNotification,
    object: nil,
    queue: .main
) { notification in
    guard let info = notification.userInfo,
          let typeValue = info[AVAudioSessionInterruptionTypeKey] as? UInt,
          let type = AVAudioSession.InterruptionType(rawValue: typeValue)
    else { return }

    switch type {
    case .began:
        audioEngine.pause()
    case .ended:
        if let optionsValue = info[AVAudioSessionInterruptionOptionKey] as? UInt {
            let options = AVAudioSession.InterruptionOptions(rawValue: optionsValue)
            if options.contains(.shouldResume) {
                try? audioEngine.start()
            }
        }
    }
}
```

## Performance Targets

| Operation | Target | Budget |
|-----------|--------|--------|
| HRTF convolution | &lt;2ms/source | CPU-intensive |
| Ambisonics encode | &lt;0.1ms/source | Efficient |
| Ambisonics decode | &lt;1ms total | Many sources OK |
| Footstep synthesis | &lt;2ms/footstep | On-demand |
| Middleware event | &lt;0.1ms | Very fast |

## Integrates With

- **voice-audio-engineer**: For TTS, voice cloning, podcast production
- **ElevenLabs MCP**: Sound effects generation
- **metal-shader-expert**: Audio-reactive visuals
- **vr-avatar-engineer**: Avatar audio sync

## References

- MIT KEMAR HRTF Database
- Audiokinetic Wwise Documentation
- FMOD Studio Documentation
- Farnell, A. "Designing Sound" (MIT Press)
- Google Resonance Audio (open source)

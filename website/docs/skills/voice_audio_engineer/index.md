---
slug: /skills/voice_audio_engineer
id: voice_audio_engineer
name: voice-audio-engineer
description: Expert in voice synthesis, TTS, voice cloning, podcast production, speech processing, and voice UI design via ElevenLabs integration
---

# Voice & Audio Engineer

<SkillHeader
  skillName="Voice Audio Engineer"
  fileName="voice-audio-engineer"
  description={"\"Expert in voice synthesis, TTS, voice cloning, podcast production, speech processing, and voice UI design via ElevenLabs integration. Specializes in vocal clarity, loudness standards (LUFS), de-essing, dialogue mixing, and voice transformation. Activate on 'TTS', 'text-to-speech', 'voice clone', 'voice synthesis', 'ElevenLabs', 'podcast', 'voice recording', 'speech-to-speech', 'voice UI', 'audiobook', 'dialogue'. NOT for spatial audio (use sound-engineer), music production (use DAW tools), game audio middleware (use sound-engineer), sound effects generation (use sound-engineer with ElevenLabs SFX), or live concert audio.\""}
  tags={["creation","audio","code","elevenlabs","production-ready"]}
/>

## When to Use This Skill

| Use Case | Example |
|----------|---------|
| Voice cloning & synthesis | Creating AI voices from samples |
| Podcast production | Loudness normalization, processing chains |
| Text-to-speech systems | Audiobooks, voice assistants |
| Speech-to-speech | Voice transformation pipelines |
| Conversational AI agents | ElevenLabs agent creation |
| Dialogue mixing | Voice clarity, de-essing, compression |

## Do NOT Use For

- **Spatial audio** → Use `sound-engineer` (Ambisonics, binaural, HRTF)
- **Game audio middleware** → Use `sound-engineer` (Wwise, FMOD)
- **Sound effects generation** → Use `sound-engineer` with ElevenLabs SFX
- **Music production** → Use dedicated DAW tools
- **Live concert audio** → Out of scope

## MCP Integrations

| MCP Server | Capabilities |
|------------|--------------|
| **ElevenLabs** | Voice cloning, TTS, speech-to-speech, agents, transcription |
| **Firecrawl** | Scrape reference audio from web |

## Expert vs Novice Shibboleths

| Topic | Novice Says | Expert Says |
|-------|-------------|-------------|
| Loudness | "Make it louder" | "-16 LUFS integrated, -1.5 dBTP for podcast spec" |
| De-essing | "Remove sibilance" | "Dynamic EQ at 6-8kHz, 4:1 ratio, fast attack" |
| Processing order | "EQ then compress" | "HPF → De-esser → Compressor → EQ → Limiter" |
| Voice cloning | "Copy the voice" | "Need 30s-3min clean samples, consistent tone" |
| Disfluencies | "Remove ums" | "Preserve natural rhythm, remove only distracting ones" |

## Common Anti-Patterns

### "Podcast processed to streaming loudness"

**What it looks like:** Mastering podcast to -14 LUFS (Spotify target)

**Why it's wrong:** Podcasts are speech, not music. -14 LUFS crushes dynamics and causes listener fatigue.

**What to do instead:**
```
Podcast: -16 to -19 LUFS integrated, -1.5 dBTP
Streaming music: -14 LUFS, -1 dBTP
Broadcast: -23 LUFS (EBU R128)
```

### "Over-processing voice recordings"

**What it looks like:** Heavy compression, aggressive de-essing, brick-wall limiting

**Why it's wrong:** Destroys natural voice character, sounds robotic and fatiguing

**What to do instead:**
```python
# Gentle processing chain
processing_chain = {
    "hpf": {"freq": 80, "slope": "12dB/oct"},
    "deesser": {"freq": "6-8kHz", "ratio": "4:1", "threshold": "-20dB"},
    "compressor": {"ratio": "3:1", "attack": "10ms", "release": "100ms"},
    "eq": {"presence": "+2dB @ 3-5kHz"},
    "limiter": {"ceiling": "-1.5dBTP"}
}
```

## Voice Processing Chain

The canonical order for voice processing:

```
Input → HPF (80Hz) → De-esser → Compressor (3:1) →
EQ (presence 3-5kHz) → Limiter → Normalization → Output
```

### Loudness Standards Reference

```
LUFS TARGETS BY PLATFORM
├── Podcast: -16 to -19 LUFS, -1.5 dBTP
├── Spotify/Apple Music: -14 LUFS, -1 dBTP
├── YouTube: -14 LUFS (normalized)
├── Broadcast (EBU R128): -23 LUFS ±1, -1 dBTP
└── Audiobook (ACX): -18 to -23 LUFS, -3 dBTP
```

## ElevenLabs Integration Examples

### Voice Cloning Requirements

```python
# Optimal sample requirements
sample_requirements = {
    "duration": "30 seconds to 3 minutes",
    "quality": "Clean, consistent tone, minimal background noise",
    "format": "WAV or MP3, 44.1kHz minimum",
    "content": "Natural speech, varied intonation"
}
```

### Creating Conversational Agents

```python
# Agent configuration best practices
agent_config = {
    "first_message": "Clear, welcoming, sets expectations",
    "system_prompt": "Personality + constraints + knowledge boundaries",
    "turn_timeout": 7,  # seconds - balance responsiveness vs interruption
    "asr_quality": "high",  # Worth the latency for accuracy
    "stability": 0.5,  # Balance consistency vs expressiveness
    "similarity_boost": 0.8  # High for cloned voices
}
```

## Disfluency Handling

Natural speech contains disfluencies. Handle them thoughtfully:

| Disfluency Type | Keep/Remove | Reasoning |
|-----------------|-------------|-----------|
| "Um", "uh" | Remove if distracting | Preserve if rhythmic |
| Repeated words | Remove stammers | Keep for emphasis |
| Self-corrections | Remove false starts | Keep if clarifying |
| Breaths | Reduce, don't eliminate | Unnatural without them |
| Pauses | Shorten, don't remove | Pacing matters |

## Integrates With

- **sound-engineer**: For spatial audio, game audio, sound effects
- **ElevenLabs MCP**: Voice synthesis, cloning, agents, transcription
- **Firecrawl MCP**: Gathering voice samples and references

## References

- ITU-R BS.1770 "Algorithms to measure audio programme loudness"
- EBU R128 "Loudness normalisation and permitted maximum level"
- ACX Audio Submission Requirements
- ElevenLabs API Documentation

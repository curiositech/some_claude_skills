---
name: sound-engineer
description: Expert audio engineer specializing in spatial audio, procedural sound design, interactive audio systems, and real-time DSP
---

# Sound Engineer: Spatial Audio & Procedural Sound Design

Expert audio engineer specializing in spatial audio, procedural sound design, interactive audio systems, and real-time DSP. Expert in game audio, immersive experiences, and adaptive soundscapes using modern middleware (Wwise, FMOD) and cutting-edge 2024-2025 techniques.

## Your Mission

Design and implement production-ready audio systems for games, VR/AR, and interactive experiences. Create immersive soundscapes using spatial audio, procedural generation, and adaptive music systems that respond to gameplay in real-time.

## When to Use This Skill

### Perfect For:
- 🎵 Spatial audio and 3D sound positioning (HRTF, binaural, ambisonic)
- 🔊 Procedural sound design (runtime generation, synthesis)
- 🎮 Game audio middleware (Wwise, FMOD integration)
- 🌊 Real-time DSP (reverb, EQ, compression, filters)
- 🎬 Adaptive music systems (vertical/horizontal remixing)
- 👣 Footstep systems (material-aware, procedural)
- 🔴 Interactive audio (parameter-driven, state-based)
- 🎤 Voice processing (ducking, dialogue systems)

### Not For:
- ❌ Music composition (different skillset)
- ❌ Audio post-production for film (linear media)
- ❌ Hardware design (focus is software)
- ❌ Mastering/mixing for music releases

## Core Competencies

### 1. Spatial Audio & HRTF

**Why Spatial Audio Matters:**

Human hearing localizes sound through:
- **Interaural Time Difference (ITD):** Sound arrives at one ear before the other
- **Interaural Level Difference (ILD):** Sound is louder in the nearer ear
- **Head-Related Transfer Function (HRTF):** Frequency filtering from ear shape

**HRTF Implementation:**

```cpp
#include <vector>
#include <complex>
#include <cmath>

class SpatialAudioEngine {
private:
    // HRTF impulse responses (measured from dummy head)
    struct HRTF_IR {
        std::vector<float> left_ear;   // 512 samples typical
        std::vector<float> right_ear;
        float azimuth;    // Horizontal angle (0-360°)
        float elevation;  // Vertical angle (-90 to +90°)
    };

    std::vector<HRTF_IR> hrtf_database;
    int sample_rate = 48000;

public:
    void load_hrtf_database(const std::string& path) {
        // Load measured HRTF data (e.g., MIT KEMAR database)
        // Typically 25 elevation angles × 72 azimuth = 1800 IRs
    }

    void process_spatial_sound(
        const std::vector<float>& mono_input,
        glm::vec3 source_position,
        glm::vec3 listener_position,
        glm::vec3 listener_forward,
        glm::vec3 listener_up,
        std::vector<float>& stereo_output_left,
        std::vector<float>& stereo_output_right)
    {
        // Step 1: Calculate direction to sound source
        glm::vec3 to_source = glm::normalize(source_position - listener_position);

        // Step 2: Convert to listener-relative coordinates
        glm::vec3 listener_right = glm::cross(listener_forward, listener_up);

        float azimuth = std::atan2(
            glm::dot(to_source, listener_right),
            glm::dot(to_source, listener_forward)
        ) * 180.0f / M_PI;

        float elevation = std::asin(glm::dot(to_source, listener_up)) * 180.0f / M_PI;

        // Step 3: Find closest HRTF in database
        HRTF_IR hrtf = find_closest_hrtf(azimuth, elevation);

        // Step 4: Convolve input with HRTF impulse responses
        convolve(mono_input, hrtf.left_ear, stereo_output_left);
        convolve(mono_input, hrtf.right_ear, stereo_output_right);

        // Step 5: Apply distance attenuation
        float distance = glm::length(source_position - listener_position);
        float attenuation = calculate_distance_attenuation(distance);

        for (auto& sample : stereo_output_left) sample *= attenuation;
        for (auto& sample : stereo_output_right) sample *= attenuation;
    }

private:
    HRTF_IR find_closest_hrtf(float azimuth, float elevation) {
        // Find nearest neighbor in HRTF database
        // Or interpolate between multiple HRTFs for smooth transitions

        float min_distance = std::numeric_limits<float>::max();
        HRTF_IR closest;

        for (const auto& hrtf : hrtf_database) {
            float dist = std::sqrt(
                std::pow(hrtf.azimuth - azimuth, 2) +
                std::pow(hrtf.elevation - elevation, 2)
            );

            if (dist < min_distance) {
                min_distance = dist;
                closest = hrtf;
            }
        }

        return closest;
    }

    void convolve(const std::vector<float>& input,
                  const std::vector<float>& impulse,
                  std::vector<float>& output)
    {
        // Fast convolution using FFT (frequency domain multiplication)
        // More efficient than time-domain convolution for long IRs

        int fft_size = 1024;  // Power of 2, larger than IR length
        output.resize(input.size() + impulse.size() - 1);

        // Perform overlap-add convolution (for real-time)
        overlap_add_convolution(input, impulse, output, fft_size);
    }

    float calculate_distance_attenuation(float distance) {
        // Inverse square law with minimum distance
        float reference_distance = 1.0f;  // 1 meter
        float rolloff_factor = 1.0f;      // Adjustable

        if (distance < reference_distance) {
            return 1.0f;  // No attenuation closer than reference
        }

        return reference_distance / (reference_distance + rolloff_factor * (distance - reference_distance));
    }
};
```

#### Ambisonic Spatial Audio (2024 Standard)

**Advantages over HRTF:**
- ✅ Rotation-invariant (works with head tracking)
- ✅ Scalable (1st, 2nd, 3rd order for more precision)
- ✅ Efficient for many sources

```cpp
class AmbisonicEncoder {
private:
    int order = 1;  // 1st order = 4 channels (W, X, Y, Z)

public:
    struct AmbisonicSignal {
        std::vector<float> W;  // Omnidirectional
        std::vector<float> X;  // Front-back
        std::vector<float> Y;  // Left-right
        std::vector<float> Z;  // Up-down
    };

    AmbisonicSignal encode(
        const std::vector<float>& mono_input,
        glm::vec3 direction)
    {
        AmbisonicSignal output;
        output.W.resize(mono_input.size());
        output.X.resize(mono_input.size());
        output.Y.resize(mono_input.size());
        output.Z.resize(mono_input.size());

        // Normalize direction
        direction = glm::normalize(direction);

        // Spherical harmonic basis functions (1st order)
        float w = 0.707f;  // √2 / 2
        float x = direction.x;
        float y = direction.y;
        float z = direction.z;

        for (size_t i = 0; i < mono_input.size(); ++i) {
            output.W[i] = mono_input[i] * w;
            output.X[i] = mono_input[i] * x;
            output.Y[i] = mono_input[i] * y;
            output.Z[i] = mono_input[i] * z;
        }

        return output;
    }

    void decode_binaural(
        const AmbisonicSignal& ambisonic,
        const glm::quat& head_rotation,
        std::vector<float>& output_left,
        std::vector<float>& output_right)
    {
        // Rotate ambisonic field to match head orientation
        AmbisonicSignal rotated = rotate_ambisonic(ambisonic, head_rotation);

        // Decode to binaural using virtual speakers + HRTF
        output_left.resize(ambisonic.W.size());
        output_right.resize(ambisonic.W.size());

        // Simplified: virtual speaker layout (8 speakers in cube)
        std::vector<glm::vec3> speaker_positions = {
            { 1, 0, 0}, {-1, 0, 0},  // Left, Right
            { 0, 1, 0}, { 0,-1, 0},  // Front, Back
            { 0, 0, 1}, { 0, 0,-1},  // Up, Down
            { 0.707, 0.707, 0}, {-0.707, 0.707, 0}  // FL, FR
        };

        for (size_t i = 0; i < output_left.size(); ++i) {
            output_left[i] = 0.0f;
            output_right[i] = 0.0f;

            // Sum contributions from all virtual speakers
            for (const auto& speaker_pos : speaker_positions) {
                float speaker_signal = decode_to_direction(rotated, speaker_pos, i);

                // Apply HRTF for this speaker
                // (Simplified: just pan based on x-coordinate)
                float pan = (speaker_pos.x + 1.0f) * 0.5f;  // 0 = left, 1 = right

                output_left[i] += speaker_signal * (1.0f - pan);
                output_right[i] += speaker_signal * pan;
            }
        }
    }

private:
    float decode_to_direction(const AmbisonicSignal& sig, glm::vec3 dir, size_t index) {
        // Spherical harmonic decoding
        float w = 0.707f;
        return sig.W[index] * w +
               sig.X[index] * dir.x +
               sig.Y[index] * dir.y +
               sig.Z[index] * dir.z;
    }

    AmbisonicSignal rotate_ambisonic(const AmbisonicSignal& sig, const glm::quat& rotation) {
        // Rotate ambisonic field using quaternion
        // (Simplified - full implementation uses Wigner D-matrices)

        AmbisonicSignal rotated = sig;

        // Apply rotation matrix to XYZ channels
        for (size_t i = 0; i < sig.X.size(); ++i) {
            glm::vec3 dir(sig.X[i], sig.Y[i], sig.Z[i]);
            glm::vec3 rotated_dir = rotation * dir;

            rotated.X[i] = rotated_dir.x;
            rotated.Y[i] = rotated_dir.y;
            rotated.Z[i] = rotated_dir.z;
        }

        return rotated;
    }
};
```

### 2. Procedural Sound Design

**Why Procedural Audio?**

- ✅ Infinite variation (no repetition)
- ✅ Tiny memory footprint (algorithms vs samples)
- ✅ Parameter-driven (wind speed → wind sound)
- ✅ Real-time adaptation

#### Footstep System (Material-Aware)

```cpp
class ProceduralFootsteps {
public:
    enum class SurfaceType {
        Concrete,
        Wood,
        Grass,
        Gravel,
        Metal,
        Water
    };

    struct FootstepParams {
        float impact_force;      // 0-1 (walk vs run)
        SurfaceType surface;
        float wetness;           // 0-1 (dry vs wet)
        float debris_amount;     // 0-1 (clean vs littered)
    };

    std::vector<float> generate_footstep(const FootstepParams& params, int sample_rate) {
        std::vector<float> output(sample_rate / 2, 0.0f);  // 0.5 second

        // Synthesize impact
        synthesize_impact(output, params, sample_rate);

        // Add surface-specific textures
        add_surface_texture(output, params, sample_rate);

        // Add debris sounds (rocks, leaves)
        if (params.debris_amount > 0.1f) {
            add_debris_sounds(output, params, sample_rate);
        }

        // Apply EQ based on surface
        apply_surface_eq(output, params.surface);

        return output;
    }

private:
    void synthesize_impact(std::vector<float>& buffer,
                          const FootstepParams& params,
                          int sample_rate)
    {
        // Impact is a short, sharp burst
        int impact_duration = static_cast<int>(0.02 * sample_rate);  // 20ms

        for (int i = 0; i < impact_duration && i < buffer.size(); ++i) {
            float t = static_cast<float>(i) / impact_duration;

            // Exponential decay envelope
            float envelope = std::exp(-10.0f * t);

            // Noise burst (filtered based on surface)
            float noise = random_float(-1.0f, 1.0f);

            // Resonant frequency (varies by surface)
            float resonance_freq = get_resonance_frequency(params.surface);
            float phase = 2.0f * M_PI * resonance_freq * t;
            float tone = std::sin(phase);

            // Mix noise and tone
            float mix = 0.7f * noise + 0.3f * tone;

            buffer[i] += mix * envelope * params.impact_force;
        }
    }

    void add_surface_texture(std::vector<float>& buffer,
                            const FootstepParams& params,
                            int sample_rate)
    {
        switch (params.surface) {
            case SurfaceType::Gravel:
                // Crunchy, granular texture
                add_granular_texture(buffer, 200.0f, 8000.0f, 0.3f);
                break;

            case SurfaceType::Grass:
                // Soft, rustling texture
                add_filtered_noise(buffer, 500.0f, 3000.0f, 0.1f);
                break;

            case SurfaceType::Water:
                // Splash + bubbles
                add_splash_sound(buffer, params.impact_force);
                break;

            case SurfaceType::Wood:
                // Creaky resonance
                add_wood_creak(buffer, params.impact_force);
                break;

            default:
                break;
        }
    }

    void add_debris_sounds(std::vector<float>& buffer,
                          const FootstepParams& params,
                          int sample_rate)
    {
        // Scatter small impacts throughout footstep duration
        int num_debris = static_cast<int>(params.debris_amount * 10);

        for (int i = 0; i < num_debris; ++i) {
            int debris_time = random_int(100, buffer.size() - 100);

            // Small impact
            for (int j = 0; j < 50; ++j) {
                int idx = debris_time + j;
                if (idx >= buffer.size()) break;

                float t = j / 50.0f;
                float envelope = std::exp(-15.0f * t);
                float noise = random_float(-0.1f, 0.1f);

                buffer[idx] += noise * envelope;
            }
        }
    }

    float get_resonance_frequency(SurfaceType surface) {
        switch (surface) {
            case SurfaceType::Concrete: return 150.0f;
            case SurfaceType::Wood:     return 250.0f;
            case SurfaceType::Grass:    return 180.0f;
            case SurfaceType::Gravel:   return 300.0f;
            case SurfaceType::Metal:    return 500.0f;
            case SurfaceType::Water:    return 100.0f;
            default:                    return 200.0f;
        }
    }

    void add_granular_texture(std::vector<float>& buffer,
                             float freq_low, float freq_high, float amount)
    {
        // Granular synthesis: many tiny grains of sound
        int grain_count = 20;
        int grain_length = 100;  // samples

        for (int g = 0; g < grain_count; ++g) {
            int grain_start = random_int(0, buffer.size() - grain_length);

            for (int i = 0; i < grain_length; ++i) {
                float t = i / static_cast<float>(grain_length);
                float envelope = std::sin(M_PI * t);  // Hann window

                float freq = random_float(freq_low, freq_high);
                float phase = 2.0f * M_PI * freq * t / sample_rate;
                float grain_signal = std::sin(phase) * envelope * amount;

                buffer[grain_start + i] += grain_signal;
            }
        }
    }

    void apply_surface_eq(std::vector<float>& buffer, SurfaceType surface) {
        // Apply EQ to shape frequency content
        // (Simplified - use biquad filters in production)

        switch (surface) {
            case SurfaceType::Grass:
                // Roll off highs (soft surface)
                apply_lowpass(buffer, 4000.0f);
                break;

            case SurfaceType::Metal:
                // Boost highs (bright, ringing)
                apply_highshelf(buffer, 2000.0f, 6.0f);
                break;

            case SurfaceType::Water:
                // Emphasize low-mids (splash)
                apply_peak(buffer, 300.0f, 1.5f, 3.0f);
                break;

            default:
                break;
        }
    }
};
```

#### Wind Synthesizer (Parameter-Driven)

```cpp
class WindSynthesizer {
private:
    float phase = 0.0f;
    std::vector<float> noise_buffer;

public:
    std::vector<float> generate_wind(
        float wind_speed,      // m/s (0-30)
        float gustiness,       // 0-1
        float duration_seconds,
        int sample_rate)
    {
        int num_samples = static_cast<int>(duration_seconds * sample_rate);
        std::vector<float> output(num_samples);

        // Generate pink noise (base layer)
        std::vector<float> pink_noise = generate_pink_noise(num_samples);

        for (int i = 0; i < num_samples; ++i) {
            float t = i / static_cast<float>(sample_rate);

            // Low-frequency modulation (wind gusts)
            float gust_freq = 0.2f + gustiness * 0.5f;  // 0.2-0.7 Hz
            float gust_phase = 2.0f * M_PI * gust_freq * t;
            float gust_envelope = 0.5f + 0.5f * std::sin(gust_phase);

            // Wind speed maps to amplitude and high-frequency content
            float amplitude = wind_speed / 30.0f;  // Normalize to 0-1
            float base_signal = pink_noise[i] * amplitude * gust_envelope;

            output[i] = base_signal;
        }

        // Apply bandpass filter (wind is mostly 100-2000 Hz)
        apply_bandpass(output, 100.0f, 2000.0f);

        // Add high-frequency "whistle" at high speeds
        if (wind_speed > 15.0f) {
            add_wind_whistle(output, wind_speed, sample_rate);
        }

        return output;
    }

private:
    std::vector<float> generate_pink_noise(int num_samples) {
        // Pink noise (1/f spectrum) - sounds more natural than white noise
        std::vector<float> output(num_samples);

        float b0 = 0.0f, b1 = 0.0f, b2 = 0.0f, b3 = 0.0f, b4 = 0.0f, b5 = 0.0f, b6 = 0.0f;

        for (int i = 0; i < num_samples; ++i) {
            float white = random_float(-1.0f, 1.0f);

            b0 = 0.99886f * b0 + white * 0.0555179f;
            b1 = 0.99332f * b1 + white * 0.0750759f;
            b2 = 0.96900f * b2 + white * 0.1538520f;
            b3 = 0.86650f * b3 + white * 0.3104856f;
            b4 = 0.55000f * b4 + white * 0.5329522f;
            b5 = -0.7616f * b5 - white * 0.0168980f;

            output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362f;
            output[i] *= 0.11f;  // Normalize

            b6 = white * 0.115926f;
        }

        return output;
    }

    void add_wind_whistle(std::vector<float>& buffer, float wind_speed, int sample_rate) {
        // High-pitched whistle at extreme speeds
        float whistle_freq = 3000.0f + (wind_speed - 15.0f) * 200.0f;  // 3-6 kHz
        float whistle_amplitude = (wind_speed - 15.0f) / 15.0f * 0.2f;

        for (size_t i = 0; i < buffer.size(); ++i) {
            float t = i / static_cast<float>(sample_rate);
            float whistle = std::sin(2.0f * M_PI * whistle_freq * t);

            // Modulate whistle slightly (vibrato)
            float vibrato = std::sin(2.0f * M_PI * 5.0f * t);  // 5 Hz vibrato
            whistle *= (1.0f + vibrato * 0.05f);

            buffer[i] += whistle * whistle_amplitude;
        }
    }
};
```

### 3. Middleware Integration (Wwise/FMOD)

#### Wwise Integration (Unreal Engine)

```cpp
// AkGameplayStatics integration for spatial audio

#include "AkGameplayStatics.h"
#include "AkComponent.h"

class SpatialSoundManager {
public:
    void play_3d_sound(
        UAkAudioEvent* sound_event,
        FVector location,
        AActor* owner = nullptr)
    {
        if (!sound_event) return;

        // Post event at world location
        UAkGameplayStatics::PostEventAtLocation(
            sound_event,
            location,
            FRotator::ZeroRotator,
            owner ? owner->GetWorld() : nullptr
        );
    }

    void play_attached_sound(
        UAkAudioEvent* sound_event,
        USceneComponent* attach_component,
        FName attach_point = NAME_None)
    {
        if (!sound_event || !attach_component) return;

        // Post event attached to component (follows movement)
        UAkGameplayStatics::PostEventAttached(
            sound_event,
            attach_component,
            attach_point
        );
    }

    void set_rtpc(
        const FString& rtpc_name,
        float value,
        AActor* owner = nullptr)
    {
        // Set Real-Time Parameter Control
        // Example: "Speed" RTPC controls engine pitch

        UAkGameplayStatics::SetRTPCValue(
            *rtpc_name,
            value,
            0,  // Interpolation time (ms)
            owner
        );
    }

    void set_switch(
        const FString& switch_group,
        const FString& switch_state,
        AActor* owner)
    {
        // Set switch (e.g., "Surface" switch to "Concrete")

        UAkGameplayStatics::SetSwitch(
            *switch_group,
            *switch_state,
            owner
        );
    }

    void trigger_stinger(UAkAudioEvent* stinger_event) {
        // Musical stinger (e.g., combat start)

        UAkGameplayStatics::PostEvent(
            stinger_event,
            nullptr,  // Game object
            0,        // Flags
            nullptr   // Callback
        );
    }
};

// Character footstep example
class ACharacterWithFootsteps : public ACharacter {
private:
    UPROPERTY() UAkComponent* AkAudioComponent;
    UPROPERTY() UAkAudioEvent* FootstepEvent;

public:
    void OnFootDown(EFoot foot) {
        // Detect surface type
        FHitResult hit;
        FVector trace_start = GetActorLocation();
        FVector trace_end = trace_start - FVector(0, 0, 100);

        if (GetWorld()->LineTraceSingleByChannel(hit, trace_start, trace_end, ECC_Visibility)) {
            // Determine surface material
            FString surface_type = DetermineSurfaceType(hit.PhysMaterial);

            // Set Wwise switch
            UAkGameplayStatics::SetSwitch(
                TEXT("Surface"),
                *surface_type,
                this
            );

            // Set impact force RTPC
            float speed = GetVelocity().Size();
            float impact_force = FMath::Clamp(speed / 600.0f, 0.0f, 1.0f);

            UAkGameplayStatics::SetRTPCValue(
                TEXT("Impact_Force"),
                impact_force,
                0,
                this
            );

            // Play footstep
            UAkGameplayStatics::PostEvent(
                FootstepEvent,
                this
            );
        }
    }

    FString DetermineSurfaceType(UPhysicalMaterial* PhysMat) {
        // Map physical material to Wwise switch
        if (!PhysMat) return TEXT("Concrete");

        // Custom mapping
        if (PhysMat->GetName().Contains(TEXT("Grass"))) return TEXT("Grass");
        if (PhysMat->GetName().Contains(TEXT("Wood"))) return TEXT("Wood");
        if (PhysMat->GetName().Contains(TEXT("Metal"))) return TEXT("Metal");

        return TEXT("Concrete");
    }
};
```

### 4. Adaptive Music Systems

**Horizontal Re-orchestration:** Switch between music layers based on intensity.

**Vertical Remixing:** Crossfade entire music tracks.

```cpp
class AdaptiveMusicManager {
public:
    enum class MusicIntensity {
        Ambient = 0,
        Low = 1,
        Medium = 2,
        High = 3,
        Combat = 4
    };

private:
    MusicIntensity current_intensity = MusicIntensity::Ambient;
    float transition_time = 2.0f;  // seconds

public:
    void set_music_intensity(MusicIntensity intensity) {
        if (intensity == current_intensity) return;

        // Fade to new intensity layer
        transition_to_intensity(intensity, transition_time);
        current_intensity = intensity;
    }

    void transition_to_intensity(MusicIntensity target, float fade_duration) {
        // Wwise implementation (using States)
        FString state_name = intensity_to_state_name(target);

        UAkGameplayStatics::SetState(
            TEXT("Music_Intensity"),
            *state_name
        );

        // Wwise handles the crossfade based on transition rules
    }

    FString intensity_to_state_name(MusicIntensity intensity) {
        switch (intensity) {
            case MusicIntensity::Ambient: return TEXT("Ambient");
            case MusicIntensity::Low:     return TEXT("Low");
            case MusicIntensity::Medium:  return TEXT("Medium");
            case MusicIntensity::High:    return TEXT("High");
            case MusicIntensity::Combat:  return TEXT("Combat");
            default:                      return TEXT("Ambient");
        }
    }

    // Dynamic music intensity based on gameplay
    void update_music_from_gameplay(
        int enemy_count,
        float player_health,
        bool in_combat)
    {
        MusicIntensity target_intensity;

        if (!in_combat) {
            target_intensity = MusicIntensity::Ambient;
        } else if (enemy_count == 0) {
            target_intensity = MusicIntensity::Low;
        } else if (enemy_count < 3 && player_health > 0.5f) {
            target_intensity = MusicIntensity::Medium;
        } else if (enemy_count < 5 || player_health > 0.25f) {
            target_intensity = MusicIntensity::High;
        } else {
            target_intensity = MusicIntensity::Combat;  // Boss/critical
        }

        set_music_intensity(target_intensity);
    }
};
```

## Performance Benchmarks

**Spatial Audio (HRTF):**
- Convolution (512-tap IR): ~2ms per source (CPU)
- Ambisonic encoding: ~0.1ms per source
- Ambisonic decoding (binaural): ~1ms (supports many sources)

**Procedural Footsteps:**
- Generation: ~1-2ms per footstep
- Memory: ~50 KB per footstep (0.5s @ 48kHz)
- vs Samples: 10-20 samples × 500 KB each = 5-10 MB saved

**Wwise/FMOD:**
- Event posting: <0.1ms
- RTPC update: <0.01ms
- State/Switch change: <0.1ms

**Wind Synthesizer:**
- Real-time generation: ~0.5ms per frame (1024 samples)
- Memory: Negligible (algorithmic)

## Integration Example

```cpp
// Complete audio system for game

class GameAudioEngine {
private:
    SpatialAudioEngine spatial;
    ProceduralFootsteps footsteps;
    WindSynthesizer wind;
    AdaptiveMusicManager music;

    std::vector<AudioSource> active_sources;

public:
    void initialize() {
        spatial.load_hrtf_database("Content/Audio/HRTF_Database");

        // Initialize Wwise
        UAkGameplayStatics::InitializeAudio();
    }

    void update(float delta_time) {
        // Update listener position/orientation
        APawn* player = GetPlayerPawn();
        if (player) {
            FVector location = player->GetActorLocation();
            FRotator rotation = player->GetControlRotation();

            UAkGameplayStatics::SetListenerPosition(location, rotation);
        }

        // Update environmental audio
        update_environmental_sounds(delta_time);

        // Update music intensity
        update_music_system();
    }

    void update_environmental_sounds(float delta_time) {
        // Wind based on weather
        float wind_speed = GetCurrentWindSpeed();
        float gustiness = GetCurrentGustiness();

        if (wind_speed > 2.0f) {  // Threshold
            // Generate wind sound procedurally
            auto wind_buffer = wind.generate_wind(
                wind_speed,
                gustiness,
                delta_time,
                48000
            );

            // Play wind sound (looping, crossfaded)
            play_environmental_loop(wind_buffer);
        }
    }

    void update_music_system() {
        // Query game state
        int enemy_count = CountNearbyEnemies();
        float player_health = GetPlayerHealth();
        bool in_combat = IsPlayerInCombat();

        music.update_music_from_gameplay(enemy_count, player_health, in_combat);
    }

    void play_footstep(FVector location, SurfaceType surface, float impact_force) {
        ProceduralFootsteps::FootstepParams params;
        params.surface = surface;
        params.impact_force = impact_force;
        params.wetness = GetSurfaceWetness(location);
        params.debris_amount = GetDebrisAmount(location);

        // Generate procedural footstep
        auto footstep_buffer = footsteps.generate_footstep(params, 48000);

        // Play at world location
        play_one_shot(footstep_buffer, location);
    }
};
```

## References

**Spatial Audio:**
- MIT KEMAR HRTF Database (public domain)
- Ambisonic Toolkit Documentation (2024)
- Google Resonance Audio (open source)

**Procedural Audio:**
- Farnell (2010): "Designing Sound" (MIT Press)
- SoundSeed Documentation (Audiokinetic, 2024)
- Nemisindo Adaptive Footsteps 2.0 (2024)

**Middleware:**
- Wwise Documentation (Audiokinetic, 2024)
- FMOD Studio Documentation (2024)
- Unreal Engine Audio Integration Guide (Epic Games, 2024)

**Recent Advances (2024-2025):**
- ElevenLabs AI-backed procedural audio (2024)
- Spatial Audio Market Report (2024): USD 0.68B by 2033
- Real-time procedural audio generation using transformers (2024)

## Best Practices

### ✅ DO:
- Use ambisonic audio for VR/AR (rotation-invariant)
- Implement procedural footsteps for large games (saves memory)
- Use middleware (Wwise/FMOD) for complex projects
- Set up proper occlusion/obstruction
- Use RTPC for continuous parameters (speed, intensity)
- Profile audio performance (CPU budget ~5-10%)
- Implement audio ducking for dialogue
- Use parameter-driven procedural audio

### ❌ DON'T:
- Hard-code audio file paths (use middleware)
- Play too many sounds simultaneously (limit to 32-64)
- Ignore distance attenuation (sounds too loud/quiet)
- Use heavy convolution for many sources (use ambisonic)
- Skip LOD for distant sounds (reduce quality/voices)
- Forget to compress audio (Vorbis/Opus for games)
- Neglect wet/dry mix for reverb (sounds muddy)
- Ignore middleware profiling tools

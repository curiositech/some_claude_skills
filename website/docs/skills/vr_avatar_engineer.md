---
name: vr-avatar-engineer
description: Expert in photorealistic and stylized VR avatar systems for Apple Vision Pro, Meta Quest, and cross-platform metaverse
---

# VR Avatar Engineer

<SkillHeader
  skillName="Vr Avatar Engineer"
  fileName="vr-avatar-engineer"
  description={"Expert in photorealistic and stylized VR avatar systems for Apple Vision Pro, Meta Quest, and cross-platform metaverse. Specializes in facial tracking (52+ blend shapes), subsurface scattering, Persona-style generation, Photon networking, and real-time LOD. Activate on 'VR avatar', 'Vision Pro Persona', 'Meta avatar', 'facial tracking', 'blend shapes', 'avatar networking', 'photorealistic avatar'. NOT for 2D profile pictures (use image generation), non-VR game characters (use game engine tools), static 3D models (use modeling tools), or motion capture hardware setup."}
  tags={["creation","3d","ml","code","advanced"]}
/>

## When to Use This Skill

| Use Case | Example |
|----------|---------|
| VR avatar systems | Apple Vision Pro Personas, Meta avatars |
| Facial tracking | 52+ ARKit blend shapes, Quest Pro tracking |
| Photorealistic skin | Subsurface scattering, thickness maps |
| Avatar networking | Photon sync, spatial voice, low-latency |
| Eye gaze & presence | Micro-saccades, natural blink, attention |
| Cross-platform | Quest ↔ Vision Pro ↔ PCVR |

## Do NOT Use For

- **2D profile pictures** → Use image generation
- **Non-VR game characters** → Use game engine tools
- **Static 3D models** → Use modeling software
- **Motion capture hardware** → Different domain

## MCP Integrations

| MCP Server | Capabilities |
|------------|--------------|
| **Stability AI** | Avatar texture generation |
| **ElevenLabs** | Voice cloning for avatar speech |

## Expert vs Novice Shibboleths

| Topic | Novice Says | Expert Says |
|-------|-------------|-------------|
| Skin rendering | "Use diffuse shader" | "SSS with thickness map, thin areas (ears, fingers) need more scatter" |
| Eye realism | "Track gaze direction" | "Micro-saccades every 200-800ms, blinks 3-17/min" |
| Facial tracking | "Map blend shapes" | "52 ARKit shapes, smooth transitions, handle occlusion gracefully" |
| Avatar sync | "Send transforms" | "Photon, compress blend shapes to 8-bit, interpolate on receive" |
| Performance | "Reduce polygons" | "Dynamic LOD, 50K tris Quest / 150K Vision Pro, foveated rendering" |

## Common Anti-Patterns

### "Dead eye stare - no micro-saccades"

**What it looks like:** Avatar eyes track targets but remain otherwise still

**Why it's wrong:** Human eyes constantly make tiny movements. Static eyes = uncanny valley

**What to do instead:**
```cpp
void update_gaze(float dt) {
    time_since_saccade += dt;
    if (time_since_saccade > next_saccade_interval) {
        // Micro-saccade: 0.5-2 degrees offset
        gaze_target += random_unit_vector() * radians(random_range(0.5f, 2.0f));
        next_saccade_interval = random_range(0.2f, 0.8f);
        time_since_saccade = 0;
    }
    // Also: blinks every 3.5-20 seconds, varies with attention
}
```

### "Uniform skin thickness for SSS"

**What it looks like:** Same subsurface scattering across entire face/body

**Why it's wrong:** Ears, fingers, lips are translucent; torso is opaque

**What to do instead:**
```cpp
// Anatomically correct thickness map
struct ThicknessMap {
    float ear = 0.8;      // Very thin, lots of SSS
    float finger = 0.6;
    float lip = 0.5;
    float eyelid = 0.9;
    float nose = 0.7;
    float torso = 0.1;    // Thick, minimal SSS
};
```

### "Sending raw transforms over network"

**What it looks like:** Full precision floats for every bone every frame

**Why it's wrong:** Wastes bandwidth, causes lag, fails at scale

**What to do instead:**
```csharp
// Compress blend shapes to 8-bit (0-255)
for (int i = 0; i < blendShapes.Length; i++) {
    stream.SendNext((byte)(blendShapes[i] * 255));
}
// On receive: interpolate to smooth movement
targetBlendShapes[i] = Mathf.Lerp(current, target, dt * 15f);
```

## Core Concepts

### Subsurface Scattering for Skin

```glsl
// Screen-space SSS
float thickness = texture(thickness_map, uv).r;
float sss_wrap = (NdotL + 0.5) / 1.5;
float sss = pow(sss_wrap, 2.0) * thickness * 0.8;
vec3 final = diffuse * (NdotL + sss_color * sss);
```

### ARKit Blend Shapes (52 shapes)

| Category | Examples |
|----------|----------|
| Eyes | eyeBlinkLeft/Right, eyeLookUp/Down/In/Out |
| Brows | browDownLeft/Right, browInnerUp |
| Jaw | jawOpen, jawForward, jawLeft/Right |
| Mouth | mouthSmileLeft/Right, mouthPucker, mouthClose |
| Cheeks | cheekPuff, cheekSquintLeft/Right |
| Nose | noseSneerLeft/Right |

### Photon Avatar Sync

```csharp
public void OnPhotonSerializeView(PhotonStream stream, PhotonMessageInfo info) {
    if (stream.IsWriting) {
        // Send head + hands (most critical)
        stream.SendNext(headTransform.position);
        stream.SendNext(headTransform.rotation);
        // Compress 52 blend shapes to bytes
        foreach (var weight in blendShapes)
            stream.SendNext((byte)(weight * 255));
    } else {
        // Receive and interpolate
        targetHeadPos = (Vector3)stream.ReceiveNext();
        // Interpolate for smooth motion
    }
}
```

## Performance Targets

| Platform | Poly Budget | Frame Rate | Notes |
|----------|-------------|------------|-------|
| Quest 2 | 50K tris | 72fps | Mobile GPU, ASTC textures |
| Quest 3 | 75K tris | 90fps | Better GPU, still mobile |
| Vision Pro | 150K tris | 90fps | M2 chip, high quality OK |
| PCVR | 200K+ tris | 90fps | Desktop GPU |

### VR-Specific Optimizations

- **Foveated rendering**: High detail only where user looks
- **Dynamic LOD**: Reduce detail at distance
- **Texture streaming**: Load high-res when close
- **Reprojection**: Maintain smooth motion

## Platform Integration

### Apple Vision Pro

```swift
// ARKit face tracking
let faceTrackingProvider = FaceTrackingProvider()
for await update in faceTrackingProvider.anchorUpdates {
    let blendShapes = update.anchor.blendShapes  // 52 shapes
    let geometry = update.anchor.geometry        // ~1,200 vertices
}
```

### Meta Quest Pro

```cpp
// OVR Face Tracking
ovrAvatar2FaceExpressions expressions;
ovrAvatar2Entity_GetFaceExpressions(handle, &expressions);
// 63 blend shapes from Quest Pro
avatar.setBlendShape("jawOpen", expressions.jawDrop);
```

## Integrates With

- **metal-shader-expert**: Avatar rendering shaders
- **physics-rendering-expert**: Hair/clothing physics
- **sound-engineer**: Spatial voice, lip sync
- **ElevenLabs MCP**: Voice cloning for avatars

## References

- Apple ARKit Face Tracking Documentation
- Meta Movement SDK Documentation
- Photon Unity Networking (PUN)
- "Real-Time Rendering" (Akenine-Möller)
- SIGGRAPH Digital Human Papers

---

*"VR avatars are how people represent themselves in virtual spaces. Create systems that feel alive, represent users authentically, and maintain presence across platforms."*

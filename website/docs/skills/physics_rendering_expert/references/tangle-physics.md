---
title: Tangle Physics
sidebar_label: Tangle Physics
sidebar_position: 4
---
# Tangle Physics

Multi-rope collision, Capstan friction, and dynamic constraint creation.

## Critical Insight

Tangle DETECTION is not tangle PHYSICS. Detecting crossings for braid words is different from simulating the physical constraint that forms when ropes interlock.

**Detection only**: Ropes pass through each other, we just record the event
**Physical tangle**: Ropes cannot pass through; crossing creates a new constraint point

## Segment-Segment Distance

```cpp
float segment_distance(vec3 p1, vec3 p2, vec3 q1, vec3 q2) {
    vec3 u = p2 - p1, v = q2 - q1, w = p1 - q1;
    float a = dot(u,u), b = dot(u,v), c = dot(v,v);
    float d = dot(u,w), e = dot(v,w);
    float denom = a*c - b*b;

    float s = clamp((b*e - c*d) / denom, 0, 1);
    float t = clamp((a*e - b*d) / denom, 0, 1);

    return length((q1 + t*v) - (p1 + s*u));
}
```

## TangleConstraint: Dynamic Constraint Creation

When a physical tangle forms, create a constraint between closest particles:

```cpp
class TangleConstraint {
    Particle* p1;           // Closest particle on rope A
    Particle* p2;           // Closest particle on rope B
    float rest_distance;    // Distance at formation (typically rope_diameter)
    float friction;         // Capstan friction coefficient
    float wrap_angle;       // Accumulated wrap (affects friction)
    bool is_locked;         // Has tightened past threshold

    void solve() {
        vec3 delta = p2->predicted - p1->predicted;
        float dist = length(delta);

        float effective_rest = is_locked ?
            rest_distance * 0.5f :  // Tightened
            rest_distance;          // Initial

        if (dist < effective_rest) return; // Don't push apart

        float error = dist - effective_rest;
        float w_sum = p1->inverse_mass + p2->inverse_mass;

        // Apply friction-scaled correction (Capstan effect)
        float friction_factor = exp(friction * wrap_angle);
        vec3 correction = (error / (dist * w_sum)) * delta;
        correction *= min(friction_factor, 3.0f); // Cap for stability

        p1->predicted += p1->inverse_mass * correction;
        p2->predicted -= p2->inverse_mass * correction;
    }
};
```

## Capstan Equation

```
T2 = T1 x e^(mu*theta)
```

Where:
- `T1` = tension on one side
- `T2` = tension on other side (amplified by wrap)
- `mu` = friction coefficient (0.3-0.8 for rope on rope)
- `theta` = wrap angle in radians

**Implication**: 90° wrap with mu=0.5 gives 2.2x amplification. 360° wrap gives 23x. This is why knots tighten!

```cpp
float capstan_friction(float tension_in, float wrap_angle, float mu = 0.5f) {
    return tension_in * exp(mu * wrap_angle);
}
```

## Tangle Formation Detection

```cpp
TangleCandidate check_tangle_formation(
    Particle& a1, Particle& a2,  // Segment A
    Particle& b1, Particle& b2,  // Segment B
    float rope_diameter
) {
    auto [closest_a, closest_b, dist] = segment_closest_points(a1, a2, b1, b2);

    if (dist > rope_diameter) return {.forms_physical_tangle = false};

    // Check if tension would tighten (not just touch and separate)
    vec3 tension_a = (a2.predicted - a1.predicted).normalized();
    vec3 tension_b = (b2.predicted - b1.predicted).normalized();
    vec3 separation = (closest_b - closest_a).normalized();

    float pull_a = dot(tension_a, separation);
    float pull_b = dot(tension_b, -separation);

    bool would_tighten = (pull_a > 0.3f) || (pull_b > 0.3f);
    float wrap_angle = acos(clamp(dot(tension_a, tension_b), -1.0f, 1.0f));

    return {
        .crossing_point = (closest_a + closest_b) * 0.5f,
        .wrap_angle = wrap_angle,
        .forms_physical_tangle = would_tighten && wrap_angle > 0.5f // ~30 degrees
    };
}
```

## Tangle Lifecycle

1. **Detection**: Segment distance &lt; threshold
2. **Formation**: Tension + geometry = physical constraint created
3. **Tightening**: Under continued tension, rest_distance decreases
4. **Locking**: Past threshold, tangle becomes "locked"
5. **Breaking**: Extreme force OR deliberate untangling action

## Tangle Decision Tree

**Should this crossing become a TangleConstraint?**
1. Distance &lt; rope_diameter? -> Continue
2. Already have a TangleConstraint for this pair? -> Skip (update existing)
3. Would tension tighten (not separate) the ropes? -> Continue
4. Wrap angle &gt; 30 degrees? -> **Create TangleConstraint**
5. Otherwise -> Ignore (transient contact)

**When to break a TangleConstraint?**
1. Distance &gt; 2x rest_distance for sustained period -> Break
2. External "untangle" action triggered -> Break
3. is_locked == true -> Much harder to break

## Anti-Patterns

### Detection Without Physics
Recording braid words but ropes pass through each other. Create TangleConstraints when crossings form.

### Treating All Crossings as Tangles
Every segment intersection creates a constraint. Check tension direction and wrap angle first.

### Capsule Collision for Tangle Physics
Causes instability and tunneling. Use point-based collision with adaptive particle placement.

### Ignoring Directional Friction
Symmetric friction feels wrong. Apply Capstan equation with wrap angle.

### Immediate Lock on Contact
Real tangles form gradually under tension. Use gradual tightening over time.

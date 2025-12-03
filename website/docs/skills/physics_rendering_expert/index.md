---
slug: /skills/physics_rendering_expert
id: physics_rendering_expert
name: physics-rendering-expert
description: Real-time rope/cable physics using Position-Based Dynamics, Verlet integration, and constraint solvers
---

# Physics Rendering Expert

<SkillHeader
  skillName="Physics Rendering Expert"
  fileName="physics-rendering-expert"
  description={"\"Real-time rope/cable physics using Position-Based Dynamics (PBD), Verlet integration, and constraint solvers. Expert in quaternion math, Gauss-Seidel/Jacobi solvers, and tangling detection. Activate on 'rope simulation', 'PBD', 'Position-Based Dynamics', 'Verlet', 'constraint solver', 'quaternion', 'cable dynamics', 'cloth simulation', 'leash physics'. NOT for fluid dynamics (SPH/MPM), fracture simulation (FEM), offline cinematic physics, molecular dynamics, or general game physics engines (use Unity/Unreal built-ins).\""}
  tags={["creation", "3d", "code", "advanced"]}
/>

## When to Use This Skill

| Use Case | Example |
|----------|---------|
| Rope/cable simulation | Leashes, climbing ropes, power cables |
| Constraint-based physics | Distance constraints, bending, collision |
| Position-Based Dynamics | Stable, controllable real-time physics |
| Quaternion mathematics | Gimbal-lock-free rotation, SLERP |
| Cloth/soft body | Character clothing, deformable objects |
| Multi-body tangles | Three-dog leash problem, cable routing |

## Do NOT Use For

- **Fluid dynamics** → Use SPH/MPM specialized solvers
- **Fracture simulation** → Use FEM or MPM
- **Offline cinematic physics** → Different performance constraints
- **Molecular dynamics** → Quantum-scale physics
- **General game physics** → Use Unity/Unreal built-ins

## Expert vs Novice Shibboleths

| Topic | Novice Says | Expert Says |
|-------|-------------|-------------|
| Rope physics | "Use spring forces" | "PBD with Gauss-Seidel, 5 iterations" |
| Integration | "Euler step" | "Verlet integration (symplectic, position-only)" |
| Rotation | "Euler angles" | "Quaternion with axis-angle construction" |
| Stiffness | "Increase spring constant" | "More solver iterations (diminishing returns after 10)" |
| Collision | "Check particle overlap" | "Segment-segment distance with CCD" |

## Common Anti-Patterns

### "Using spring forces for stiff constraints"

**What it looks like:**
```cpp
float force = k * (distance - rest_length);
p1.apply_force(force);
// Problem: High k requires tiny dt (unstable)
```

**Why it's wrong:** Force-based springs require tiny timesteps for stiff constraints, causing instability or softness.

**What to do instead:**
```cpp
// Position-Based Dynamics (stable at any stiffness)
float error = distance - rest_length;
vec3 correction = (error / (distance * (w1 + w2))) * delta;
p1.position += w1 * correction;
p2.position -= w2 * correction;
```

### "Using Euler angles for rotation"

**What it looks like:** `rotation.x += pitch; rotation.y += yaw;`

**Why it's wrong:** Gimbal lock, unstable at poles, bad for interpolation

**What to do instead:**
```cpp
// Quaternion from axis-angle
Quaternion::from_axis_angle(axis, angle);
// Smooth interpolation
Quaternion::slerp(q1, q2, t);
```

### "Skipping collision detection between rope segments"

**What it looks like:** Ropes pass through each other

**Why it's wrong:** Breaks immersion, impossible tangles

**What to do instead:**
```cpp
// Check segment-segment distance for all pairs
float dist = segment_segment_distance(p1, p2, q1, q2);
if (dist < rope_diameter) resolve_collision();
```

## Core Concepts

### Position-Based Dynamics (PBD)

PBD directly manipulates positions to satisfy constraints:

```cpp
void pbd_update(float dt) {
    // 1. Predict positions
    for (auto& p : particles) {
        p.velocity += gravity * dt;
        p.predicted = p.position + p.velocity * dt;
    }

    // 2. Solve constraints (Gauss-Seidel)
    for (int i = 0; i < iterations; ++i) {
        solve_distance_constraints();
        solve_collision_constraints();
        solve_bending_constraints();
    }

    // 3. Update velocities from position delta
    for (auto& p : particles) {
        p.velocity = (p.predicted - p.position) / dt;
        p.position = p.predicted;
    }
}
```

### Verlet Integration

Symplectic, position-only, energy-conserving:

```cpp
vec3 new_pos = 2.0f * position - prev_position + acceleration * dt * dt;
prev_position = position;
position = new_pos;
// Velocity: (position - prev_position) / dt
```

### Constraint Solvers

| Solver | Pros | Cons | Use Case |
|--------|------|------|----------|
| **Gauss-Seidel** | Fast convergence | Not parallel | Ropes/chains |
| **Jacobi** | GPU-parallelizable | Slower convergence | Cloth/many constraints |

### Quaternion Math

```cpp
// From axis-angle
float half = angle * 0.5f;
q = {axis.x * sin(half), axis.y * sin(half), axis.z * sin(half), cos(half)};

// Rotate vector: q * v * q^-1
vec3 rotated = q.rotate(v);

// Compose rotations
Quaternion combined = q1 * q2;
```

## Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| PBD rope (100 particles) | &lt;0.5ms | Single-threaded |
| Verlet integration | 0.01ms/1000 particles | Position-only |
| Gauss-Seidel solve | 0.3ms/100 constraints | Sequential |
| Jacobi solve (GPU) | 0.1ms/100 constraints | Parallel |
| Quaternion rotation | ~10ns | Very fast |

## Three-Dog Leash Example

```cpp
class ThreeDogLeashSystem {
    vector<RopeSimulation> leashes;  // 3 leashes, 20 particles each
    vector<Dog> dogs;
    vec3 handler_position;

    void update(float dt) {
        // Update dog positions
        for (auto& dog : dogs) update_dog_ai(dog, dt);

        // Pin leash starts to handler, ends to dogs
        for (int i = 0; i < 3; ++i) {
            leashes[i].pin_start(handler_position);
            leashes[i].pin_end(dogs[i].collar_position);
            leashes[i].update(dt);
        }

        // Detect tangling between leashes
        for (int i = 0; i < 3; ++i)
            for (int j = i + 1; j < 3; ++j)
                resolve_leash_collision(leashes[i], leashes[j]);
    }
};
// Total: ~0.7ms per frame (well within 60fps budget)
```

## Integrates With

- **metal-shader-expert**: GPU-accelerated constraint solving
- **vr-avatar-engineer**: Physics-based hair/clothing
- **sound-engineer**: Physics-driven audio (rope creaking)

## References

- Müller et al. (2006): "Position Based Dynamics"
- Jakobsen (2001): "Advanced Character Physics" (GDC)
- Bender et al. (2014): "Survey on Position-Based Simulation Methods"
- Shoemake (1985): "Animating Rotation with Quaternion Curves"
- ALEM Method (2024 SIGGRAPH): Cable dynamics with modal analysis

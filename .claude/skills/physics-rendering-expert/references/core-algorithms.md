# Core Physics Algorithms

Detailed implementations for PBD, Verlet, and constraint solvers.

## Position-Based Dynamics (PBD) Loop

```cpp
void pbd_update(float dt) {
    // Step 1: Predict
    for (auto& p : particles) {
        if (p.inverse_mass == 0.0f) continue;
        p.velocity += gravity * dt;
        p.predicted = p.position + p.velocity * dt;
    }

    // Step 2: Solve constraints (5-10 iterations)
    for (int i = 0; i < solver_iterations; ++i) {
        solve_distance_constraints();
        solve_bending_constraints();
        solve_collisions();
    }

    // Step 3: Update
    for (auto& p : particles) {
        p.velocity = (p.predicted - p.position) / dt;
        p.position = p.predicted;
    }
}
```

## Distance Constraint

```cpp
void solve_distance(Particle& p1, Particle& p2, float rest_length) {
    vec3 delta = p2.predicted - p1.predicted;
    float dist = length(delta);
    if (dist < 1e-6f) return;

    float error = dist - rest_length;
    float w_sum = p1.inverse_mass + p2.inverse_mass;
    if (w_sum < 1e-6f) return;

    vec3 correction = (error / (dist * w_sum)) * delta;
    p1.predicted += p1.inverse_mass * correction;
    p2.predicted -= p2.inverse_mass * correction;
}
```

## Verlet Integration

**Why Verlet > Euler:**
- Symplectic (conserves energy)
- Second-order accurate
- No explicit velocity storage needed
- Time-reversible

```cpp
void verlet_step(Particle& p, vec3 accel, float dt) {
    vec3 new_pos = 2.0f * p.position - p.prev_position + accel * dt * dt;
    p.prev_position = p.position;
    p.position = new_pos;
    // Velocity if needed: (position - prev_position) / dt
}
```

## Solver Comparison

| Solver | Parallelizable | Convergence | Use Case |
|--------|---------------|-------------|----------|
| **Gauss-Seidel** | No | Fast | Chains, ropes (sequential structure) |
| **Jacobi** | Yes (GPU) | Slower | Large meshes, cloth, GPU physics |

**Gauss-Seidel**: Updates positions immediately; next constraint sees updated values.

**Jacobi**: Accumulates corrections; applies averaged result. Requires more iterations but GPU-parallelizable.

## Quaternion Operations

**Why quaternions:**
- No gimbal lock
- Compact (4 floats vs 9 for matrix)
- Smooth SLERP interpolation
- Stable composition

**Key operations:**
- `q * q'` = compose rotations
- `q * v * q*` = rotate vector
- `normalize(q)` = after every operation
- `slerp(q1, q2, t)` = smooth interpolation

## Force-Based vs PBD

```cpp
// BAD: Force-based (requires tiny timesteps)
vec3 force = normalize(delta) * k * (distance - rest_length);

// GOOD: PBD constraint (stable at any timestep)
float error = distance - rest_length;
vec3 correction = (error / (distance * (w1 + w2))) * delta;
p1.position += w1 * correction;
p2.position -= w2 * correction;
```

## XPBD Compliance

Extended PBD adds compliance for soft constraints:

```cpp
// XPBD with compliance
float alpha = compliance / (dt * dt);
float lambda = error / (w_sum + alpha);
```

This allows controlling stiffness without changing iteration count.

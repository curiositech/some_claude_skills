# Physics Implementation Reference

Detailed code implementations for rope/cable physics simulation.

## Complete PBD Rope Implementation

```cpp
#include <vector>
#include <glm/glm.hpp>

struct Particle {
    glm::vec3 position;
    glm::vec3 predicted_position;
    glm::vec3 velocity;
    float mass;
    float inverse_mass;  // Precomputed 1/mass (or 0 for static)

    Particle(glm::vec3 pos, float m)
        : position(pos), predicted_position(pos), velocity(0.0f), mass(m)
    {
        inverse_mass = (m > 0.0f) ? 1.0f / m : 0.0f;
    }
};

class RopeSimulation {
private:
    std::vector<Particle> particles;
    std::vector<std::pair<int, int>> distance_constraints;
    std::vector<float> rest_lengths;

    float gravity = -9.81f;
    float damping = 0.99f;
    int solver_iterations = 5;

public:
    RopeSimulation(glm::vec3 start, glm::vec3 end, int num_particles) {
        for (int i = 0; i < num_particles; ++i) {
            float t = static_cast<float>(i) / (num_particles - 1);
            glm::vec3 pos = glm::mix(start, end, t);
            particles.emplace_back(pos, 1.0f);

            if (i == 0) particles[i].inverse_mass = 0.0f; // Fixed
        }

        for (int i = 0; i < num_particles - 1; ++i) {
            distance_constraints.emplace_back(i, i + 1);
            float length = glm::length(particles[i + 1].position - particles[i].position);
            rest_lengths.push_back(length);
        }
    }

    void update(float dt) {
        // Step 1: Predict positions
        for (auto& p : particles) {
            if (p.inverse_mass == 0.0f) continue;
            glm::vec3 acceleration(0.0f, gravity, 0.0f);
            p.velocity += acceleration * dt;
            p.velocity *= damping;
            p.predicted_position = p.position + p.velocity * dt;
        }

        // Step 2: Solve constraints
        for (int iter = 0; iter < solver_iterations; ++iter) {
            solve_distance_constraints();
            solve_collision_constraints();
            solve_bending_constraints();
        }

        // Step 3: Update velocities and positions
        for (auto& p : particles) {
            if (p.inverse_mass == 0.0f) continue;
            p.velocity = (p.predicted_position - p.position) / dt;
            p.position = p.predicted_position;
        }
    }

    void solve_distance_constraints() {
        for (size_t i = 0; i < distance_constraints.size(); ++i) {
            int idx1 = distance_constraints[i].first;
            int idx2 = distance_constraints[i].second;
            Particle& p1 = particles[idx1];
            Particle& p2 = particles[idx2];

            glm::vec3 delta = p2.predicted_position - p1.predicted_position;
            float distance = glm::length(delta);
            if (distance < 1e-6f) continue;

            float constraint_error = distance - rest_lengths[i];
            float w_sum = p1.inverse_mass + p2.inverse_mass;
            if (w_sum < 1e-6f) continue;

            glm::vec3 correction = (constraint_error / (distance * w_sum)) * delta;
            p1.predicted_position += p1.inverse_mass * correction;
            p2.predicted_position -= p2.inverse_mass * correction;
        }
    }

    void solve_collision_constraints() {
        float ground_y = 0.0f;
        for (auto& p : particles) {
            if (p.predicted_position.y < ground_y) {
                p.predicted_position.y = ground_y;
                p.velocity.y = 0.0f;
                p.velocity.x *= 0.8f;
                p.velocity.z *= 0.8f;
            }
        }
    }

    void solve_bending_constraints() {
        for (size_t i = 1; i < particles.size() - 1; ++i) {
            Particle& p_prev = particles[i - 1];
            Particle& p_curr = particles[i];
            Particle& p_next = particles[i + 1];

            glm::vec3 v1 = p_curr.predicted_position - p_prev.predicted_position;
            glm::vec3 v2 = p_next.predicted_position - p_curr.predicted_position;

            float len1 = glm::length(v1);
            float len2 = glm::length(v2);
            if (len1 < 1e-6f || len2 < 1e-6f) continue;

            glm::vec3 n1 = v1 / len1;
            glm::vec3 n2 = v2 / len2;
            float cos_angle = glm::dot(n1, n2);
            float desired_cos = 0.5f;  // ~60 degrees max bend

            if (cos_angle < desired_cos) {
                glm::vec3 axis = glm::cross(n1, n2);
                float axis_len = glm::length(axis);
                if (axis_len > 1e-6f) {
                    axis /= axis_len;
                    p_curr.predicted_position += axis * 0.1f;
                }
            }
        }
    }

    const std::vector<Particle>& get_particles() const { return particles; }
};
```

## Quaternion Implementation

```cpp
struct Quaternion {
    float x, y, z, w;

    static Quaternion identity() { return {0.0f, 0.0f, 0.0f, 1.0f}; }

    static Quaternion from_axis_angle(glm::vec3 axis, float angle) {
        float half_angle = angle * 0.5f;
        float s = std::sin(half_angle);
        return {axis.x * s, axis.y * s, axis.z * s, std::cos(half_angle)};
    }

    Quaternion operator*(const Quaternion& q) const {
        return {
            w * q.x + x * q.w + y * q.z - z * q.y,
            w * q.y - x * q.z + y * q.w + z * q.x,
            w * q.z + x * q.y - y * q.x + z * q.w,
            w * q.w - x * q.x - y * q.y - z * q.z
        };
    }

    glm::vec3 rotate(glm::vec3 v) const {
        Quaternion v_quat = {v.x, v.y, v.z, 0.0f};
        Quaternion result = (*this) * v_quat * conjugate();
        return {result.x, result.y, result.z};
    }

    Quaternion conjugate() const { return {-x, -y, -z, w}; }

    void normalize() {
        float len = std::sqrt(x*x + y*y + z*z + w*w);
        x /= len; y /= len; z /= len; w /= len;
    }
};
```

## Dual Quaternion (Rotation + Translation)

```cpp
struct DualQuaternion {
    Quaternion real;  // Rotation
    Quaternion dual;  // Translation (encoded)

    static DualQuaternion from_rotation_translation(Quaternion rotation, glm::vec3 translation) {
        Quaternion t_quat = {translation.x, translation.y, translation.z, 0.0f};
        Quaternion dual_part = (t_quat * rotation) * 0.5f;
        return {rotation, dual_part};
    }

    glm::vec3 transform_point(glm::vec3 p) const {
        Quaternion t_quat = (dual * 2.0f) * real.conjugate();
        glm::vec3 translation = {t_quat.x, t_quat.y, t_quat.z};
        return real.rotate(p) + translation;
    }

    static DualQuaternion blend(const std::vector<DualQuaternion>& dqs,
                                 const std::vector<float>& weights) {
        DualQuaternion result = {{0,0,0,0}, {0,0,0,0}};
        for (size_t i = 0; i < dqs.size(); ++i) {
            float sign = (i > 0 && dot(dqs[i].real, dqs[0].real) < 0) ? -1.0f : 1.0f;
            result.real.x += weights[i] * sign * dqs[i].real.x;
            result.real.y += weights[i] * sign * dqs[i].real.y;
            result.real.z += weights[i] * sign * dqs[i].real.z;
            result.real.w += weights[i] * sign * dqs[i].real.w;
            result.dual.x += weights[i] * sign * dqs[i].dual.x;
            result.dual.y += weights[i] * sign * dqs[i].dual.y;
            result.dual.z += weights[i] * sign * dqs[i].dual.z;
            result.dual.w += weights[i] * sign * dqs[i].dual.w;
        }
        result.real.normalize();
        return result;
    }
};
```

## Three-Dog Leash Tangle System

```cpp
class ThreeDogLeashSystem {
private:
    struct Dog {
        glm::vec3 position;
        glm::vec3 velocity;
        int leash_id;
    };

    std::vector<Dog> dogs;
    std::vector<RopeSimulation> leashes;
    glm::vec3 handler_position;

public:
    ThreeDogLeashSystem() {
        dogs.push_back({glm::vec3(-2, 0, 0), glm::vec3(0), 0});
        dogs.push_back({glm::vec3(0, 0, 2), glm::vec3(0), 1});
        dogs.push_back({glm::vec3(2, 0, 0), glm::vec3(0), 2});
        handler_position = glm::vec3(0, 1.5f, 0);

        for (int i = 0; i < 3; ++i) {
            leashes.emplace_back(handler_position, dogs[i].position, 20);
        }
    }

    void update(float dt) {
        // Update dog behavior
        for (auto& dog : dogs) {
            glm::vec3 random_accel = glm::vec3(
                random_range(-1.0f, 1.0f), 0.0f, random_range(-1.0f, 1.0f)
            );
            dog.velocity += random_accel * dt;
            dog.velocity *= 0.95f;
            dog.position += dog.velocity * dt;
        }

        // Update leashes
        for (size_t i = 0; i < leashes.size(); ++i) {
            leashes[i].particles[0].position = handler_position;
            leashes[i].particles[0].inverse_mass = 0.0f;
            int last_idx = leashes[i].particles.size() - 1;
            leashes[i].particles[last_idx].position = dogs[i].position;
            leashes[i].update(dt);
        }

        detect_leash_tangles();
    }

    void detect_leash_tangles() {
        for (size_t i = 0; i < leashes.size(); ++i) {
            for (size_t j = i + 1; j < leashes.size(); ++j) {
                check_leash_collision(leashes[i], leashes[j]);
            }
        }
    }

    float segment_segment_distance(glm::vec3 p1, glm::vec3 p2,
                                    glm::vec3 q1, glm::vec3 q2) {
        glm::vec3 u = p2 - p1, v = q2 - q1, w = p1 - q1;
        float a = glm::dot(u, u), b = glm::dot(u, v), c = glm::dot(v, v);
        float d = glm::dot(u, w), e = glm::dot(v, w);
        float denom = a * c - b * b;

        float s = (denom < 1e-6f) ? 0.0f : glm::clamp((b * e - c * d) / denom, 0.0f, 1.0f);
        float t = (denom < 1e-6f) ? (b > c ? d / b : e / c) : glm::clamp((a * e - b * d) / denom, 0.0f, 1.0f);

        return glm::length((q1 + t * v) - (p1 + s * u));
    }
};
```

## Jacobi Solver (GPU-Parallel)

```cpp
void jacobi_solve(std::vector<Constraint>& constraints,
                  std::vector<Particle>& particles, int iterations) {
    std::vector<glm::vec3> position_deltas(particles.size(), glm::vec3(0.0f));
    std::vector<int> constraint_counts(particles.size(), 0);

    for (int iter = 0; iter < iterations; ++iter) {
        std::fill(position_deltas.begin(), position_deltas.end(), glm::vec3(0.0f));
        std::fill(constraint_counts.begin(), constraint_counts.end(), 0);

        #pragma omp parallel for
        for (size_t i = 0; i < constraints.size(); ++i) {
            auto correction = constraints[i].compute_correction();
            #pragma omp atomic
            position_deltas[correction.particle1_idx] += correction.delta1;
            #pragma omp atomic
            constraint_counts[correction.particle1_idx]++;
            #pragma omp atomic
            position_deltas[correction.particle2_idx] += correction.delta2;
            #pragma omp atomic
            constraint_counts[correction.particle2_idx]++;
        }

        #pragma omp parallel for
        for (size_t i = 0; i < particles.size(); ++i) {
            if (constraint_counts[i] > 0) {
                particles[i].position += position_deltas[i] / float(constraint_counts[i]);
            }
        }
    }
}
```

## TangleConstraint Implementation (JavaScript)

Dynamic constraint created when rope crossings become physical tangles:

```javascript
class TangleConstraint {
    static nextId = 0;

    constructor(particleA, particleB, ropeA, ropeB, crossingPoint, options = {}) {
        this.id = TangleConstraint.nextId++;
        this.particleA = particleA;
        this.particleB = particleB;
        this.ropeA = ropeA;
        this.ropeB = ropeB;
        this.crossingPoint = crossingPoint.copy();

        // Physics parameters
        this.friction = options.friction ?? 0.5;        // Capstan friction coefficient
        this.stiffness = options.stiffness ?? 0.8;      // Constraint stiffness
        this.maxDistance = options.maxDistance ?? 15;   // Break if exceeded
        this.minDistance = options.minDistance ?? 2;    // Minimum (fully locked)

        // Current state
        this.restDistance = particleA.position.distanceTo(particleB.position);
        this.restDistance = Math.max(this.minDistance, Math.min(this.restDistance, this.maxDistance));
        this.wrapAngle = 0;                             // Accumulated wrap (radians)
        this.tension = 0;                               // Current tension at crossing
        this.age = 0;                                   // Frames since creation
        this.isLocked = false;                          // Has tightened past threshold

        // Thresholds
        this.lockThreshold = this.minDistance * 2;      // Lock when rest < this
        this.tightenRate = 0.02;                        // How fast it tightens under tension
        this.breakTension = 200;                        // Force required to break
    }

    /**
     * Solve the tangle constraint (call during PBD solver loop)
     */
    solve() {
        const delta = this.particleB.position.subtract(this.particleA.position);
        const dist = delta.length();

        if (dist < 1e-6) return;

        // Compute effective rest distance (locked tangles are tighter)
        const effectiveRest = this.isLocked
            ? this.restDistance * 0.5
            : this.restDistance;

        // Only pull together, don't push apart
        if (dist <= effectiveRest) return;

        const error = dist - effectiveRest;
        const wA = this.particleA.inverseMass;
        const wB = this.particleB.inverseMass;
        const wSum = wA + wB;

        if (wSum < 1e-6) return;

        // Apply Capstan friction effect: friction amplifies with wrap angle
        // T₂ = T₁ × e^(μθ) - but we cap it for stability
        const frictionFactor = Math.min(Math.exp(this.friction * this.wrapAngle), 3.0);

        // Compute correction with stiffness and friction
        const correctionMag = (error * this.stiffness * frictionFactor) / (dist * wSum);
        const correction = delta.scale(correctionMag);

        // Apply corrections
        this.particleA.position = this.particleA.position.add(correction.scale(wA));
        this.particleB.position = this.particleB.position.subtract(correction.scale(wB));

        // Record tension for tightening logic
        this.tension = error * frictionFactor;
    }

    /**
     * Update tangle state (call each frame after physics step)
     */
    update(dt) {
        this.age++;

        // Update wrap angle based on local rope geometry
        this.wrapAngle = this._computeLocalWrapAngle();

        // Tighten under tension (gradual, not instant)
        if (this.tension > 10 && !this.isLocked) {
            const tightenAmount = this.tightenRate * this.tension * dt;
            this.restDistance = Math.max(
                this.minDistance,
                this.restDistance - tightenAmount
            );
        }

        // Lock if tightened enough
        if (this.restDistance < this.lockThreshold) {
            this.isLocked = true;
        }

        // Update crossing point to midpoint
        this.crossingPoint = this.particleA.position.add(this.particleB.position).scale(0.5);
    }

    /**
     * Check if this tangle should break
     */
    shouldBreak() {
        const dist = this.particleA.position.distanceTo(this.particleB.position);

        // Break if stretched too far for too long
        if (dist > this.maxDistance) {
            return true;
        }

        // Locked tangles require much more force to break
        if (this.isLocked) {
            return this.tension > this.breakTension * 3;
        }

        // Young tangles break easily
        if (this.age < 30) {
            return dist > this.restDistance * 1.5;
        }

        return false;
    }

    /**
     * Get crossing sign for braid word tracking (+1 or -1)
     */
    getCrossingSign() {
        // Determine which rope is "over" based on perpendicular direction
        const delta = this.particleB.position.subtract(this.particleA.position);
        // In 2D top-down: positive cross product = ropeA over ropeB
        return delta.x * (this.particleA.position.y - this.crossingPoint.y) > 0 ? 1 : -1;
    }

    /**
     * Compute local wrap angle from rope geometry
     */
    _computeLocalWrapAngle() {
        // Get tangent directions of both ropes at crossing
        const tangentA = this._getRopeTangentAt(this.ropeA, this.particleA);
        const tangentB = this._getRopeTangentAt(this.ropeB, this.particleB);

        if (!tangentA || !tangentB) return this.wrapAngle;

        // Wrap angle is based on how perpendicular the ropes are
        // Parallel = 0°, Perpendicular = 90°
        const dot = Math.abs(tangentA.dot(tangentB));
        const angle = Math.acos(Math.min(1, Math.max(-1, dot)));

        // Smooth update (don't jump)
        return this.wrapAngle * 0.9 + angle * 0.1;
    }

    _getRopeTangentAt(rope, particle) {
        const idx = rope.particles.indexOf(particle);
        if (idx < 0) return null;

        const prev = rope.particles[Math.max(0, idx - 1)];
        const next = rope.particles[Math.min(rope.particles.length - 1, idx + 1)];

        return next.position.subtract(prev.position).normalize();
    }
}
```

### Tangle Detection and Management

```javascript
class TangleManager {
    constructor(world) {
        this.world = world;
        this.tangles = [];
        this.tanglePairs = new Set(); // Track existing pairs
    }

    /**
     * Detect and create new tangles (call after position prediction, before solving)
     */
    detectNewTangles() {
        const ropes = this.world.ropes;
        const ropeDiameter = 8; // Detection threshold

        for (let i = 0; i < ropes.length; i++) {
            for (let j = i + 1; j < ropes.length; j++) {
                this._checkRopePair(ropes[i], ropes[j], ropeDiameter);
            }
        }
    }

    _checkRopePair(ropeA, ropeB, threshold) {
        const particlesA = ropeA.particles;
        const particlesB = ropeB.particles;

        for (let ai = 0; ai < particlesA.length - 1; ai++) {
            for (let bi = 0; bi < particlesB.length - 1; bi++) {
                const result = this._checkSegmentPair(
                    particlesA[ai], particlesA[ai + 1],
                    particlesB[bi], particlesB[bi + 1],
                    threshold
                );

                if (result.shouldFormTangle) {
                    this._createTangle(
                        result.closestA, result.closestB,
                        ropeA, ropeB, result.crossingPoint
                    );
                }
            }
        }
    }

    _checkSegmentPair(a1, a2, b1, b2, threshold) {
        // Segment-segment closest points
        const result = segmentSegmentClosest(a1.position, a2.position, b1.position, b2.position);

        if (result.distance > threshold) {
            return { shouldFormTangle: false };
        }

        // Already have a tangle for these particles?
        const pairKey = this._makePairKey(result.closestParticleA, result.closestParticleB);
        if (this.tanglePairs.has(pairKey)) {
            return { shouldFormTangle: false };
        }

        // Check tension direction - would pulling tighten this?
        const tensionA = a2.position.subtract(a1.position).normalize();
        const tensionB = b2.position.subtract(b1.position).normalize();
        const separation = result.closestB.subtract(result.closestA).normalize();

        const pullA = tensionA.dot(separation);
        const pullB = tensionB.dot(separation.scale(-1));
        const wouldTighten = pullA > 0.3 || pullB > 0.3;

        // Check wrap angle
        const wrapAngle = Math.acos(Math.min(1, Math.abs(tensionA.dot(tensionB))));
        const sufficientWrap = wrapAngle > 0.5; // ~30 degrees

        return {
            shouldFormTangle: wouldTighten && sufficientWrap,
            closestA: result.closestParticleA,
            closestB: result.closestParticleB,
            crossingPoint: result.closestA.add(result.closestB).scale(0.5)
        };
    }

    _createTangle(particleA, particleB, ropeA, ropeB, crossingPoint) {
        const tangle = new TangleConstraint(
            particleA, particleB, ropeA, ropeB, crossingPoint
        );

        this.tangles.push(tangle);
        this.tanglePairs.add(this._makePairKey(particleA, particleB));

        // Emit event for braid tracking
        if (this.world.onTangleFormed) {
            this.world.onTangleFormed(tangle);
        }
    }

    _makePairKey(pA, pB) {
        const idA = pA.id ?? pA;
        const idB = pB.id ?? pB;
        return idA < idB ? `${idA}-${idB}` : `${idB}-${idA}`;
    }

    /**
     * Solve all tangle constraints (call in PBD solver loop)
     */
    solveTangles() {
        for (const tangle of this.tangles) {
            tangle.solve();
        }
    }

    /**
     * Update tangles and remove broken ones (call after physics step)
     */
    updateTangles(dt) {
        for (let i = this.tangles.length - 1; i >= 0; i--) {
            const tangle = this.tangles[i];
            tangle.update(dt);

            if (tangle.shouldBreak()) {
                this.tanglePairs.delete(
                    this._makePairKey(tangle.particleA, tangle.particleB)
                );
                this.tangles.splice(i, 1);

                if (this.world.onTangleBroken) {
                    this.world.onTangleBroken(tangle);
                }
            }
        }
    }
}
```

### Capstan Friction Utility

```javascript
/**
 * Calculate friction-amplified tension using Capstan equation
 * T₂ = T₁ × e^(μθ)
 *
 * @param tensionIn - Input tension
 * @param wrapAngle - Wrap angle in radians
 * @param mu - Friction coefficient (0.3-0.8 for rope-on-rope)
 * @returns Amplified tension
 */
function capstanFriction(tensionIn, wrapAngle, mu = 0.5) {
    return tensionIn * Math.exp(mu * wrapAngle);
}

/**
 * Example: 90° wrap with μ=0.5 gives 2.2× amplification
 * Full 360° wrap gives 23× amplification
 */
```

## Performance Benchmarks

| Operation | CPU (single) | GPU |
|-----------|-------------|-----|
| PBD Rope (100 particles, 5 iter) | ~0.5ms | ~0.1ms |
| Verlet Integration (1000 particles) | ~0.01ms | - |
| Gauss-Seidel (100 constraints) | ~0.3ms | N/A |
| Jacobi (100 constraints) | ~0.5ms | ~0.1ms |
| Three-Dog Leash (60 particles) | ~0.7ms total | - |

## References

- Müller et al. (2006): "Position Based Dynamics"
- Jakobsen (2001): "Advanced Character Physics" (GDC)
- Baraff (1996): "Linear-Time Dynamics using Lagrange Multipliers"
- Shoemake (1985): "Animating Rotation with Quaternion Curves"
- Kavan et al. (2008): "Geometric Skinning with Dual Quaternions"
- ALEM Method (2024 SIGGRAPH): "Arbitrary Lagrangian-Eulerian Modal Analysis"

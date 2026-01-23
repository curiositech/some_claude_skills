---
title: Knot Garden Physics
sidebar_label: Knot Garden Physics
sidebar_position: 3
---
# Knot Garden Physics

Physics and rendering systems for mathematical knot visualization, Reidemeister move animation, and interactive manipulation via Pin+Pull mechanics.

## Core Challenge: One-Mouse Knot Manipulation

Unlike real-world knot manipulation (requiring two hands), mouse/touch interaction provides only **one point of contact**. This document defines the physics systems that make single-pointer knot manipulation feel natural.

---

## Pin Constraint System

### The Problem
To untie or manipulate a knot, you need to:
1. Hold one part steady
2. Pull another part through/around

With one cursor, you can only do one thing at a time.

### The Solution: Virtual Anchors (Pins)

Pins create temporary infinite-mass particles that serve as "your other hand."

```javascript
/**
 * PinConstraint - A user-placed anchor point on the rope
 *
 * Unlike physical pins (which pierce rope), these are "grip" pins -
 * they hold a section of rope at a fixed world position.
 */
class PinConstraint {
    constructor(particle, worldPosition) {
        this.particle = particle;
        this.anchorPosition = worldPosition.clone();
        this.originalInverseMass = particle.inverseMass;

        // Visual state
        this.isHovered = false;
        this.pulsePhase = 0;

        // Pin immediately makes particle immovable
        particle.inverseMass = 0;
        particle.predicted.copy(worldPosition);
        particle.position.copy(worldPosition);
    }

    /**
     * Solve: Keep particle at anchor position
     * Called during constraint solving loop
     */
    solve() {
        this.particle.predicted.copy(this.anchorPosition);
    }

    /**
     * Release: Restore original mass, allow movement
     */
    release() {
        this.particle.inverseMass = this.originalInverseMass;
        // Optionally give a small velocity push away from pin point
        // to prevent instant re-pinning
    }

    /**
     * Move: Drag the pin (and attached rope section)
     */
    move(newPosition) {
        this.anchorPosition.copy(newPosition);
        this.particle.predicted.copy(newPosition);
        this.particle.position.copy(newPosition);
    }
}
```

### Pin Placement Rules

| Rule | Implementation |
|------|----------------|
| Max pins | 3-5 simultaneous (prevents "stapling" the knot flat) |
| Min distance | Pins must be 15+ pixels apart (prevents clustered pins) |
| Auto-release | Pins older than 30 seconds auto-release (prevents forgotten pins) |
| Visual feedback | Pins glow/pulse to remind user they exist |

### Pin Interaction States

```
IDLE → HOVER → GRABBED → DRAGGING → RELEASED
  │      │        │          │           │
  │      │        │          │           └─ Pin stays, particle unfrozen
  │      │        │          └─ Pin moves with cursor, particle follows
  │      │        └─ Mouse down on pin, waiting for movement
  │      └─ Cursor near existing pin
  └─ Normal rope state
```

---

## Pull Mechanics

### The Grab+Drag Cycle

```javascript
/**
 * GrabState - Tracks active user manipulation of rope
 */
class GrabState {
    constructor(particle, grabPoint) {
        this.particle = particle;
        this.grabOffset = grabPoint.sub(particle.position); // Where on particle user grabbed
        this.grabTime = performance.now();
        this.dragHistory = []; // For velocity calculation on release
        this.maxDragForce = 500; // Clamp to prevent explosion
    }

    /**
     * Update during drag - applies force toward cursor
     */
    update(cursorPosition, dt) {
        const targetPosition = cursorPosition.sub(this.grabOffset);
        const toTarget = targetPosition.sub(this.particle.position);
        const distance = toTarget.length;

        // Force scales with distance but is clamped
        // This gives a "rubbery" feel - close = responsive, far = max pull
        const forceMagnitude = Math.min(distance * 50, this.maxDragForce);
        const force = toTarget.normalize().mul(forceMagnitude);

        // Apply as acceleration (will be integrated in physics step)
        this.particle.applyForce(force);

        // Track for release velocity
        this.dragHistory.push({ pos: cursorPosition.clone(), time: performance.now() });
        if (this.dragHistory.length > 10) this.dragHistory.shift();
    }

    /**
     * Release - optionally impart velocity from drag motion
     */
    release() {
        if (this.dragHistory.length < 2) return;

        const recent = this.dragHistory.slice(-3);
        const dt = (recent[recent.length - 1].time - recent[0].time) / 1000;
        if (dt < 0.001) return;

        const displacement = recent[recent.length - 1].pos.sub(recent[0].pos);
        const releaseVelocity = displacement.div(dt).mul(0.3); // Damped

        this.particle.velocity.addMut(releaseVelocity);
    }
}
```

### Pull Behavior Near Pins

When pulling rope that has pins placed:

```
    [PIN]────────────[GRAB]
         ↖         ↗
           ROPE FLOWS AROUND PIN

Physics: Rope particles between PIN and GRAB
slide along their constraints while PIN stays fixed.
The PIN acts as a pulley/anchor point.
```

```javascript
/**
 * When pulling rope with pins, the pin creates a fulcrum effect
 * Rope slides THROUGH the pin position (pin doesn't move with rope)
 */
function updateRopeWithPins(rope, pins, grabState, dt) {
    // Standard physics step
    rope.applyGravity(gravity);
    for (const particle of rope.particles) {
        particle.integrate(dt);
    }

    // Constraint solving
    for (let iter = 0; iter < SOLVER_ITERATIONS; iter++) {
        // Distance constraints (rope stays connected)
        for (const constraint of rope.distanceConstraints) {
            constraint.solve();
        }

        // Pin constraints (anchors stay fixed)
        for (const pin of pins) {
            pin.solve();
        }

        // Grab constraint (pulled particle follows cursor)
        if (grabState) {
            grabState.particle.predicted.copy(grabState.targetPosition);
        }
    }
}
```

---

## Reidemeister Move Visualization

The three Reidemeister moves are the ONLY operations needed to transform any knot into any equivalent knot. Visualizing them clearly is the educational core of Knot Garden.

### Move Detection

Before animating a move, we need to detect when the user (or algorithm) is attempting one:

```javascript
/**
 * Reidemeister Move Detector
 * Analyzes rope configuration to identify potential moves
 */
class ReidemeisterDetector {
    /**
     * Type I: Twist/Untwist
     * Detects a loop where one strand crosses over itself
     *
     *     ╭─╮
     *     │ │   ← Self-crossing loop
     *     ╰─┼─
     *       │
     */
    detectTypeI(rope) {
        const candidates = [];

        // Look for self-crossings within a small window
        for (let i = 0; i < rope.particles.length - 4; i++) {
            for (let j = i + 3; j < Math.min(i + 10, rope.particles.length - 1); j++) {
                const seg1 = { start: rope.particles[i].position, end: rope.particles[i+1].position };
                const seg2 = { start: rope.particles[j].position, end: rope.particles[j+1].position };

                const intersection = Segment.segmentIntersection(seg1.start, seg1.end, seg2.start, seg2.end);

                if (intersection.intersects) {
                    // Calculate loop area - small area = tight twist
                    const loopArea = this.calculateLoopArea(rope.particles.slice(i, j + 2));

                    if (loopArea < TWIST_AREA_THRESHOLD) {
                        candidates.push({
                            type: 'I',
                            startIndex: i,
                            endIndex: j + 1,
                            crossingPoint: intersection.point,
                            loopArea: loopArea,
                            // Sign: +1 for right-handed twist, -1 for left-handed
                            sign: this.calculateTwistSign(rope.particles.slice(i, j + 2))
                        });
                    }
                }
            }
        }

        return candidates;
    }

    /**
     * Type II: Poke/Unpoke
     * Detects two parallel strands crossing each other twice
     *
     *    ╲    ╱
     *     ╲  ╱    ← Two crossings that can cancel
     *      ╲╱
     *      ╱╲
     *     ╱  ╲
     *    ╱    ╲
     */
    detectTypeII(rope1, rope2) {
        const candidates = [];

        // Find all crossings between the two ropes (or two sections of same rope)
        const crossings = this.findAllCrossings(rope1, rope2);

        // Look for crossing pairs that could cancel
        for (let i = 0; i < crossings.length; i++) {
            for (let j = i + 1; j < crossings.length; j++) {
                const c1 = crossings[i];
                const c2 = crossings[j];

                // Crossings must have opposite signs to cancel
                if (c1.sign === c2.sign) continue;

                // Crossings must be "adjacent" (no other crossings between them on either strand)
                if (!this.areAdjacentCrossings(c1, c2, crossings)) continue;

                // Distance between crossings - closer = easier to unpoke
                const distance = c1.point.distanceTo(c2.point);

                candidates.push({
                    type: 'II',
                    crossing1: c1,
                    crossing2: c2,
                    distance: distance,
                    midpoint: c1.point.add(c2.point).div(2)
                });
            }
        }

        return candidates;
    }

    /**
     * Type III: Slide
     * Detects a strand that can slide over/under a crossing
     *
     *      │
     *    ╲ │ ╱
     *     ╲│╱     ← Third strand can slide across
     *     ╱│╲
     *    ╱ │ ╲
     *      │
     */
    detectTypeIII(rope1, rope2, rope3) {
        const candidates = [];

        // Find the crossing between rope1 and rope2
        const baseCrossing = this.findCrossing(rope1, rope2);
        if (!baseCrossing) return candidates;

        // Check if rope3 passes near this crossing
        for (let i = 0; i < rope3.particles.length - 1; i++) {
            const seg = {
                start: rope3.particles[i].position,
                end: rope3.particles[i+1].position
            };

            const distance = this.pointToSegmentDistance(baseCrossing.point, seg.start, seg.end);

            if (distance < SLIDE_THRESHOLD) {
                candidates.push({
                    type: 'III',
                    baseCrossing: baseCrossing,
                    slidingSegment: { index: i, rope: rope3 },
                    distance: distance
                });
            }
        }

        return candidates;
    }
}
```

### Move Animation System

```javascript
/**
 * Reidemeister Move Animator
 * Smoothly transforms rope configuration to complete a move
 */
class ReidemeisterAnimator {
    constructor(rope, move) {
        this.rope = rope;
        this.move = move;
        this.progress = 0;
        this.duration = 1.0; // seconds
        this.startPositions = [];
        this.targetPositions = [];

        // Capture start state
        for (const p of rope.particles) {
            this.startPositions.push(p.position.clone());
        }

        // Calculate target state based on move type
        this.calculateTargetPositions();
    }

    calculateTargetPositions() {
        switch (this.move.type) {
            case 'I':
                this.calculateTypeITarget();
                break;
            case 'II':
                this.calculateTypeIITarget();
                break;
            case 'III':
                this.calculateTypeIIITarget();
                break;
        }
    }

    /**
     * Type I: Untwist
     * Pull the loop straight, eliminating the crossing
     */
    calculateTypeITarget() {
        const { startIndex, endIndex } = this.move;

        // Start and end points of the twisted section
        const startPos = this.startPositions[startIndex];
        const endPos = this.startPositions[endIndex];

        // Target: straight line between start and end
        for (let i = 0; i < this.startPositions.length; i++) {
            if (i < startIndex || i > endIndex) {
                // Particles outside the twist stay put
                this.targetPositions[i] = this.startPositions[i].clone();
            } else {
                // Particles inside the twist interpolate to straight line
                const t = (i - startIndex) / (endIndex - startIndex);
                this.targetPositions[i] = startPos.lerp(endPos, t);
            }
        }
    }

    /**
     * Type II: Unpoke
     * Pull the two strands apart, eliminating both crossings
     */
    calculateTypeIITarget() {
        const { crossing1, crossing2 } = this.move;

        // Calculate separation direction (perpendicular to strand direction)
        const strandDir = crossing2.point.sub(crossing1.point).normalize();
        const separationDir = new Vec2(-strandDir.y, strandDir.x);

        // Move affected particles away from each other
        // ... (complex implementation involving both ropes)
    }

    /**
     * Update animation
     * Returns true when complete
     */
    update(dt) {
        this.progress += dt / this.duration;

        if (this.progress >= 1.0) {
            // Snap to final positions
            for (let i = 0; i < this.rope.particles.length; i++) {
                this.rope.particles[i].position.copy(this.targetPositions[i]);
                this.rope.particles[i].predicted.copy(this.targetPositions[i]);
                this.rope.particles[i].prevPosition.copy(this.targetPositions[i]);
            }
            return true; // Complete
        }

        // Smooth interpolation with easing
        const easedProgress = this.easeInOutCubic(this.progress);

        for (let i = 0; i < this.rope.particles.length; i++) {
            const pos = this.startPositions[i].lerp(this.targetPositions[i], easedProgress);
            this.rope.particles[i].position.copy(pos);
            this.rope.particles[i].predicted.copy(pos);
        }

        return false; // Still animating
    }

    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
}
```

### Visual Feedback During Moves

```javascript
/**
 * Reidemeister Move Visualizer
 * Renders move in progress with educational annotations
 */
class ReidemeisterVisualizer {
    /**
     * Draw move-in-progress with highlights and labels
     */
    render(ctx, animator) {
        const move = animator.move;
        const progress = animator.progress;

        // Highlight the affected region
        this.drawAffectedRegion(ctx, move, progress);

        // Draw crossing indicators
        if (move.type === 'I') {
            this.drawTwistIndicator(ctx, move, progress);
        } else if (move.type === 'II') {
            this.drawPokeIndicator(ctx, move.crossing1, move.crossing2, progress);
        } else if (move.type === 'III') {
            this.drawSlideIndicator(ctx, move, progress);
        }

        // Label the move type
        const labelPos = this.getMoveCenter(move);
        this.drawLabel(ctx, labelPos, `Reidemeister ${move.type}`, progress);

        // Draw crossing count change
        const crossingDelta = this.getCrossingDelta(move);
        if (crossingDelta !== 0) {
            this.drawCrossingChange(ctx, labelPos, crossingDelta, progress);
        }
    }

    drawAffectedRegion(ctx, move, progress) {
        ctx.save();

        // Pulsing highlight
        const alpha = 0.2 + 0.1 * Math.sin(progress * Math.PI * 4);
        ctx.fillStyle = `rgba(255, 200, 50, ${alpha})`;

        // Draw circular region around move
        const center = this.getMoveCenter(move);
        const radius = this.getMoveRadius(move) * (1.5 - 0.5 * progress);

        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getCrossingDelta(move) {
        switch (move.type) {
            case 'I': return -1;  // Removes 1 crossing
            case 'II': return -2; // Removes 2 crossings
            case 'III': return 0; // Crossing count unchanged
        }
    }
}
```

---

## Algorithmic Simplification

The "Simplify" button runs an algorithm to reduce the knot to minimal crossing number.

### Greedy Simplification

```javascript
/**
 * Greedy Knot Simplifier
 * Repeatedly applies Reidemeister moves that reduce crossing count
 */
class GreedySimplifier {
    constructor(rope) {
        this.rope = rope;
        this.detector = new ReidemeisterDetector();
        this.animator = null;
        this.moveQueue = [];
        this.crossingCount = this.countCrossings();
    }

    /**
     * Find all simplifying moves and execute them
     */
    async simplify() {
        let improved = true;

        while (improved) {
            improved = false;

            // Find Type I moves (always reduce by 1)
            const typeI = this.detector.detectTypeI(this.rope);
            for (const move of typeI) {
                await this.executeMove(move);
                improved = true;
            }

            // Find Type II moves (always reduce by 2)
            const typeII = this.detector.detectTypeII(this.rope, this.rope);
            for (const move of typeII) {
                await this.executeMove(move);
                improved = true;
            }

            // Type III moves don't change crossing count directly
            // but may enable Type I or II moves
            if (!improved) {
                const typeIII = this.detector.detectTypeIII(this.rope, this.rope, this.rope);
                if (typeIII.length > 0) {
                    await this.executeMove(typeIII[0]);
                    improved = true; // Try again after slide
                }
            }
        }

        return this.crossingCount;
    }

    async executeMove(move) {
        return new Promise(resolve => {
            this.animator = new ReidemeisterAnimator(this.rope, move);

            const animate = () => {
                const complete = this.animator.update(1/60);
                if (complete) {
                    this.crossingCount = this.countCrossings();
                    this.animator = null;
                    resolve();
                } else {
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        });
    }
}
```

### A* Search for Optimal Simplification

For finding the *shortest* sequence of moves:

```javascript
/**
 * A* Knot Simplifier
 * Finds optimal (shortest) sequence of Reidemeister moves
 *
 * State space: Knot configurations (up to ambient isotopy)
 * Operators: Reidemeister moves (I, II, III)
 * Goal: Minimize crossing number
 * Heuristic: Current crossing count (admissible since each move removes ≤2)
 */
class AStarSimplifier {
    constructor(rope) {
        this.rope = rope;
        this.detector = new ReidemeisterDetector();
    }

    /**
     * A* search for optimal simplification
     */
    findOptimalSequence() {
        const startState = this.getKnotState();
        const startCrossings = this.countCrossings(startState);

        // Priority queue: [state, path, g-cost]
        const frontier = new PriorityQueue((a, b) =>
            (a.g + a.h) - (b.g + b.h)
        );

        frontier.push({
            state: startState,
            path: [],
            g: 0,
            h: startCrossings // Heuristic: crossing count
        });

        const visited = new Set();

        while (!frontier.isEmpty()) {
            const current = frontier.pop();

            // Check if goal (unknot = 0 crossings, or local minimum)
            const crossings = this.countCrossings(current.state);
            if (crossings === 0) {
                return current.path; // Found unknot!
            }

            // Generate canonical representation for visited check
            const canonical = this.canonicalize(current.state);
            if (visited.has(canonical)) continue;
            visited.add(canonical);

            // Expand: try all possible Reidemeister moves
            const moves = this.getAllMoves(current.state);

            for (const move of moves) {
                const newState = this.applyMove(current.state, move);
                const newCrossings = this.countCrossings(newState);

                frontier.push({
                    state: newState,
                    path: [...current.path, move],
                    g: current.g + 1,
                    h: newCrossings
                });
            }
        }

        // No path to unknot found - knot is non-trivial
        return null;
    }
}
```

---

## 3D Knot Representation

Mathematical knots live in 3D space. Even when rendered on a 2D screen, we need proper 3D handling.

### Particle Extension for 3D

```javascript
/**
 * Particle3D - Full 3D position with height/depth
 */
class Particle3D extends Particle {
    constructor(x, y, z, mass = 1.0) {
        super(x, y, mass);
        this.z = z;
        this.prevZ = z;
        this.predictedZ = z;
        this.velocityZ = 0;
    }

    integrate(dt) {
        super.integrate(dt);

        if (this.inverseMass === 0) {
            this.predictedZ = this.z;
            return;
        }

        // Z-axis velocity from position difference
        this.velocityZ = (this.z - this.prevZ) / dt;
        this.velocityZ *= (1.0 - this.damping);

        // Predict new Z
        this.predictedZ = this.z + this.velocityZ * dt + this.accelerationZ * dt * dt;
        this.accelerationZ = 0;
    }

    updatePosition(dt) {
        super.updatePosition(dt);
        this.prevZ = this.z;
        this.z = this.predictedZ;
        this.velocityZ = (this.z - this.prevZ) / dt;
    }
}
```

### Distance Constraint in 3D

```javascript
/**
 * DistanceConstraint3D - Maintains rest length in full 3D
 */
class DistanceConstraint3D {
    solve() {
        const dx = this.particleB.predictedX - this.particleA.predictedX;
        const dy = this.particleB.predictedY - this.particleA.predictedY;
        const dz = this.particleB.predictedZ - this.particleA.predictedZ;

        const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (distance < 1e-6) return;

        const error = distance - this.restLength;
        const wSum = this.particleA.inverseMass + this.particleB.inverseMass;
        if (wSum < 1e-6) return;

        const factor = (error * this.stiffness) / (distance * wSum);

        const cx = dx * factor;
        const cy = dy * factor;
        const cz = dz * factor;

        this.particleA.predictedX += this.particleA.inverseMass * cx;
        this.particleA.predictedY += this.particleA.inverseMass * cy;
        this.particleA.predictedZ += this.particleA.inverseMass * cz;

        this.particleB.predictedX -= this.particleB.inverseMass * cx;
        this.particleB.predictedY -= this.particleB.inverseMass * cy;
        this.particleB.predictedZ -= this.particleB.inverseMass * cz;
    }
}
```

---

## Crossing Detection in 3D

Determining over/under at crossings is crucial for knot identity.

```javascript
/**
 * Crossing3D - Represents a crossing with over/under information
 */
class Crossing3D {
    /**
     * Detect crossing between two 3D segments
     * Returns crossing info including which strand is "over"
     */
    static detect(seg1Start, seg1End, seg2Start, seg2End) {
        // Project to XY plane and find 2D intersection
        const intersection2D = Segment.segmentIntersection(
            new Vec2(seg1Start.x, seg1Start.y),
            new Vec2(seg1End.x, seg1End.y),
            new Vec2(seg2Start.x, seg2Start.y),
            new Vec2(seg2End.x, seg2End.y)
        );

        if (!intersection2D.intersects) return null;

        // Interpolate Z at intersection point for both segments
        const t1 = intersection2D.t1; // Parameter along segment 1
        const t2 = intersection2D.t2; // Parameter along segment 2

        const z1 = seg1Start.z + t1 * (seg1End.z - seg1Start.z);
        const z2 = seg2Start.z + t2 * (seg2End.z - seg2Start.z);

        // Positive sign = segment 1 is over segment 2
        const sign = z1 > z2 ? 1 : -1;

        return {
            point: intersection2D.point,
            t1, t2,
            z1, z2,
            sign,
            overSegment: sign > 0 ? 1 : 2
        };
    }
}
```

---

## Performance Considerations

### Spatial Hashing for Collision Detection

```javascript
/**
 * SpatialHash - O(1) average case for nearby particle queries
 */
class SpatialHash {
    constructor(cellSize = 20) {
        this.cellSize = cellSize;
        this.cells = new Map();
    }

    hash(x, y) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        return `${cx},${cy}`;
    }

    insert(particle) {
        const key = this.hash(particle.position.x, particle.position.y);
        if (!this.cells.has(key)) this.cells.set(key, []);
        this.cells.get(key).push(particle);
    }

    query(x, y, radius) {
        const results = [];
        const cellRadius = Math.ceil(radius / this.cellSize);
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);

        for (let dx = -cellRadius; dx <= cellRadius; dx++) {
            for (let dy = -cellRadius; dy <= cellRadius; dy++) {
                const key = `${cx + dx},${cy + dy}`;
                const cell = this.cells.get(key);
                if (cell) {
                    for (const p of cell) {
                        const dist = Math.sqrt((p.position.x - x)**2 + (p.position.y - y)**2);
                        if (dist <= radius) results.push(p);
                    }
                }
            }
        }

        return results;
    }

    clear() {
        this.cells.clear();
    }
}
```

### Performance Budgets

| Component | Budget (60fps) | Notes |
|-----------|----------------|-------|
| Physics step | 4ms | 8 iterations, ~100 particles |
| Reidemeister detection | 1ms | Cached, only recompute on change |
| Crossing detection | 0.5ms | Spatial hash |
| Render | 5ms | Three.js with LOD |
| **Total** | **10.5ms** | Leaves headroom for GC |

---

## Integration with Existing Codebase

The existing `physics.js` provides solid PBD foundations. Extensions needed:

| Existing | Extension for Knot Garden |
|----------|---------------------------|
| `Particle` | Add `z` coordinate for 3D |
| `DistanceConstraint` | 3D variant for full knot physics |
| `TangleConstraint` | Repurpose for mathematical knot crossings |
| `Rope` | `Knot` class with closed-loop support |
| `PhysicsWorld` | `KnotWorld` with Reidemeister detection |

### Knot vs Rope: Key Difference

```javascript
/**
 * A Knot is a closed Rope - the ends connect
 */
class Knot extends Rope {
    constructor(knotData, numParticles, options = {}) {
        // Initialize as open rope first
        super(knotData.startPos, knotData.endPos, numParticles, options);

        // Add closing constraint (connect last to first)
        this.closingConstraint = new DistanceConstraint(
            this.particles[this.particles.length - 1],
            this.particles[0],
            this.distanceConstraints[0].restLength, // Same as other segments
            1.0
        );
    }

    // Override to include closing constraint
    get distanceConstraints() {
        return [...super.distanceConstraints, this.closingConstraint];
    }
}
```

---

## Summary

| System | Purpose | Key Classes |
|--------|---------|-------------|
| **Pin Constraints** | Virtual anchors for one-hand manipulation | `PinConstraint` |
| **Pull Mechanics** | Responsive grab-and-drag | `GrabState` |
| **Reidemeister Detection** | Find simplifying moves | `ReidemeisterDetector` |
| **Move Animation** | Smooth visualization of moves | `ReidemeisterAnimator` |
| **Simplification** | Reduce to minimal crossings | `GreedySimplifier`, `AStarSimplifier` |
| **3D Representation** | True spatial knot physics | `Particle3D`, `Crossing3D` |

The physics of Knot Garden transforms abstract topology into tangible, playful interaction.

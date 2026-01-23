# Space Planning Mathematics

Deep reference for anthropometrics, circulation planning, proportion systems, and room layout generation.

## Anthropometric Standards

```
HUMAN DIMENSIONS (95th percentile male for clearances)

STANDING
├── Height: 1880mm (6'2")
├── Eye level: 1720mm (5'8")
├── Shoulder breadth: 490mm (19")
├── Reach (forward): 840mm (33")
└── Reach (overhead): 2105mm (6'11")

SITTING (desk chair)
├── Seat height: 430-530mm (17-21")
├── Eye level: 1180mm (46") from floor
├── Knee clearance: 640mm (25") minimum
└── Thigh clearance: 190mm (7.5")

WHEELCHAIR (ADA)
├── Width: 810mm (32") minimum clear
├── Turning: 1525mm (60") diameter
├── Reach (forward): 610mm (24") max
└── Reach (high): 1220mm (48") max
```

## Circulation Planning

```
MINIMUM PASSAGE WIDTHS

Primary circulation: 900-1200mm (36-48")
├── Main hallways
├── Living room paths
└── Kitchen work triangle paths

Secondary circulation: 600-900mm (24-36")
├── Between furniture
├── Bedroom around bed
└── Home office paths

Squeeze points: 450mm (18") minimum
├── Between wall and furniture
├── Tight bathroom clearances
└── Not for regular use

FURNITURE CLEARANCES
├── Sofa to coffee table: 450-500mm (18-20")
├── Dining chair push-back: 900mm (36")
├── Bed side clearance: 600mm (24") minimum
├── Desk chair area: 900×900mm (36×36")
└── Closet in front: 750mm (30") minimum
```

## Proportion Systems

```
CLASSICAL PROPORTIONS

GOLDEN RATIO (φ = 1.618...)
├── Room width : length
├── Furniture grouping proportions
├── Art placement on wall
└── Not magical, but often pleasing

ROOT RECTANGLES
├── √2 (1:1.414): A-series paper, many floor plans
├── √3 (1:1.732): Equilateral triangle derived
├── √5 (1:2.236): Contains golden ratio
└── Double square (1:2): Classic rug proportions

PRACTICAL APPLICATION
Room 4m × 6m = 1:1.5 ratio (between √2 and φ)

Furniture grouping:
├── Sofa: 2400mm
├── Coffee table: 1500mm (0.625 of sofa ≈ φ⁻¹)
└── Side tables: 600mm each (0.25 of sofa)
```

## Room Layout Generation (Constraint Solver)

```python
"""
room_layout_generator.py - Generate furniture layouts using constraint satisfaction
"""

from ortools.sat.python import cp_model
import numpy as np

class RoomLayoutSolver:
    """
    Generate optimal furniture layouts using constraint programming.
    """

    def __init__(self, room_width: int, room_length: int, grid_size: int = 10):
        """
        Initialize solver.

        Args:
            room_width: Room width in cm
            room_length: Room length in cm
            grid_size: Grid cell size in cm (smaller = more precise but slower)
        """
        self.width = room_width // grid_size
        self.length = room_length // grid_size
        self.grid_size = grid_size
        self.model = cp_model.CpModel()
        self.furniture = []

    def add_furniture(self, name: str, width: int, length: int,
                     anchor_to: str = None, min_clearance: int = 45):
        """
        Add furniture piece to layout.

        Args:
            name: Furniture identifier
            width: Width in cm
            length: Length in cm
            anchor_to: 'north', 'south', 'east', 'west' wall, or None
            min_clearance: Minimum clearance around piece in cm
        """
        w = width // self.grid_size
        l = length // self.grid_size
        clearance = min_clearance // self.grid_size

        # Position variables
        x = self.model.NewIntVar(0, self.width - w, f'{name}_x')
        y = self.model.NewIntVar(0, self.length - l, f'{name}_y')

        # Rotation (0 = original, 1 = 90° rotated)
        rotated = self.model.NewBoolVar(f'{name}_rotated')

        # Actual dimensions considering rotation
        actual_w = self.model.NewIntVar(min(w, l), max(w, l), f'{name}_actual_w')
        actual_l = self.model.NewIntVar(min(w, l), max(w, l), f'{name}_actual_l')

        # Link rotation to dimensions
        self.model.Add(actual_w == w).OnlyEnforceIf(rotated.Not())
        self.model.Add(actual_w == l).OnlyEnforceIf(rotated)
        self.model.Add(actual_l == l).OnlyEnforceIf(rotated.Not())
        self.model.Add(actual_l == w).OnlyEnforceIf(rotated)

        # Wall anchoring constraints
        if anchor_to == 'north':
            self.model.Add(y + actual_l == self.length)
        elif anchor_to == 'south':
            self.model.Add(y == 0)
        elif anchor_to == 'east':
            self.model.Add(x + actual_w == self.width)
        elif anchor_to == 'west':
            self.model.Add(x == 0)

        self.furniture.append({
            'name': name,
            'x': x, 'y': y,
            'w': actual_w, 'l': actual_l,
            'rotated': rotated,
            'clearance': clearance
        })

    def add_no_overlap_constraints(self):
        """Ensure no furniture overlaps."""
        for i, f1 in enumerate(self.furniture):
            for f2 in self.furniture[i+1:]:
                # Create boolean for each separation direction
                left = self.model.NewBoolVar(f'{f1["name"]}_left_of_{f2["name"]}')
                right = self.model.NewBoolVar(f'{f1["name"]}_right_of_{f2["name"]}')
                above = self.model.NewBoolVar(f'{f1["name"]}_above_{f2["name"]}')
                below = self.model.NewBoolVar(f'{f1["name"]}_below_{f2["name"]}')

                clearance = max(f1['clearance'], f2['clearance'])

                self.model.Add(f1['x'] + f1['w'] + clearance <= f2['x']).OnlyEnforceIf(left)
                self.model.Add(f2['x'] + f2['w'] + clearance <= f1['x']).OnlyEnforceIf(right)
                self.model.Add(f1['y'] + f1['l'] + clearance <= f2['y']).OnlyEnforceIf(above)
                self.model.Add(f2['y'] + f2['l'] + clearance <= f1['y']).OnlyEnforceIf(below)

                # At least one must be true
                self.model.Add(left + right + above + below >= 1)

    def solve(self) -> dict:
        """Solve the layout and return positions."""
        self.add_no_overlap_constraints()

        solver = cp_model.CpSolver()
        status = solver.Solve(self.model)

        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            return {
                f['name']: {
                    'x': solver.Value(f['x']) * self.grid_size,
                    'y': solver.Value(f['y']) * self.grid_size,
                    'rotated': solver.Value(f['rotated']) == 1
                }
                for f in self.furniture
            }
        return None


# Example usage
"""
solver = RoomLayoutSolver(400, 500)  # 4m x 5m room
solver.add_furniture('sofa', 220, 90, anchor_to='north')
solver.add_furniture('coffee_table', 120, 60)
solver.add_furniture('armchair', 80, 80)
solver.add_furniture('tv_console', 180, 45, anchor_to='south')

layout = solver.solve()
"""
```

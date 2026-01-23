# Lighting Design Reference (IES Standards)

Deep reference for illuminance requirements, lighting layers, and color temperature programming.

## Illuminance Requirements

```
IES RECOMMENDED LIGHT LEVELS (lux)

RESIDENTIAL
├── General living: 150-300 lux
├── Reading/detailed work: 300-500 lux
├── Kitchen counters: 300-750 lux
├── Bathroom vanity: 300-500 lux (vertical)
├── Bedroom general: 50-150 lux
├── Hallways: 50-100 lux
└── Dining (ambient): 100-200 lux

VERTICAL ILLUMINATION
├── Art on walls: 200-500 lux (often higher than ambient)
├── Bathroom mirrors: Match from front, not above
└── Video calls: 300+ lux on face, even distribution

UNIFORMITY RATIO
└── Max:Min ratio should be &lt;3:1 for comfort
    (No dark holes or blinding spots)
```

## Lighting Layer Design

```
LAYER 1: AMBIENT (General)
├── Provides overall illumination
├── 60-70% of total light
├── Sources: Recessed, chandeliers, cove lighting
└── Calculation: Lumens = Area(m²) × Lux / CU × MF
    where CU = Coefficient of Utilization (~0.5-0.8)
    MF = Maintenance Factor (~0.8)

LAYER 2: TASK (Functional)
├── Supplements ambient for specific activities
├── Should be 2-3x brighter than ambient
├── Sources: Desk lamps, pendant over island, under-cabinet
└── Direction: Avoid shadows on work surface

LAYER 3: ACCENT (Decorative)
├── Creates visual interest and drama
├── 3-5x brighter than ambient on subject
├── Sources: Track, picture lights, uplights
└── Beam angles matter:
    ├── Narrow (10-15°): Art focus
    ├── Medium (25-40°): General accent
    └── Wide (50-60°): Wall wash

LAYER 4: NATURAL (Daylight)
├── Free, healthy, variable
├── Design for worst case (cloudy winter)
├── Control glare: Shades, diffusion
└── Daylight Factor = (Interior lux / Exterior lux) × 100
    Target: 2-5% minimum
```

## Color Temperature Programming

```python
def recommend_cct(room_type: str, time_of_day: str) -> int:
    """
    Recommend Correlated Color Temperature (Kelvin).

    Tunable white systems can shift throughout day.
    """

    base_recommendations = {
        'living_room': {'day': 4000, 'evening': 2700, 'night': 2200},
        'bedroom': {'day': 3500, 'evening': 2700, 'night': 2200},
        'kitchen': {'day': 4000, 'evening': 3000, 'night': 2700},
        'bathroom': {'day': 4000, 'evening': 3000, 'night': 2400},
        'office': {'day': 5000, 'evening': 4000, 'night': 3000},
        'dining': {'day': 3000, 'evening': 2700, 'night': 2400},
    }

    return base_recommendations.get(room_type, {}).get(time_of_day, 3000)
```

## Circadian Considerations

```
Morning (6-9am): 5000-6500K - Alertness, cortisol
Midday (9am-5pm): 4000-5000K - Productivity
Evening (5-9pm): 2700-3000K - Relaxation transition
Night (9pm+): 2200-2700K - Melatonin production

Avoid blue light (&lt;3000K) in:
├── Bedrooms after 8pm
├── Bathrooms used before sleep
└── Hallways at night
```

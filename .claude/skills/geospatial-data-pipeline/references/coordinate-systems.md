# Coordinate Systems & Transformations

Complete guide to EPSG codes, coordinate systems, and transformations for geospatial data.

## The Problem

**Different coordinate systems measure the Earth differently.**

- **WGS84 (EPSG:4326)**: Latitude/longitude on spherical Earth
- **Web Mercator (EPSG:3857)**: Projected coordinates for web maps
- **UTM zones**: Localized projections with minimal distortion

**Mixing them causes**:
- Incorrect distances
- Misaligned map features
- Wrong spatial queries

---

## Common Coordinate Systems

### EPSG:4326 (WGS84)

**What it is**: Geographic coordinates (lat/lon) on an ellipsoid

**Units**: Degrees
- Longitude: -180° to 180°
- Latitude: -90° to 90°

**Used for**:
- GPS coordinates
- GeoJSON standard
- Database storage

**Characteristics**:
- Spherical/ellipsoidal model of Earth
- Not equal-area (distorts at poles)
- Not conformal (distorts shapes)
- Global coverage

**Example**:
```json
{
  "type": "Point",
  "coordinates": [-122.4194, 37.7749]  // [lon, lat] in degrees
}
```

**Distance calculation**: Use great circle distance (Haversine or Vincenty)

---

### EPSG:3857 (Web Mercator / Pseudo-Mercator)

**What it is**: Projected coordinates for web mapping

**Units**: Meters (but not true meters - see note)
- X (easting): -20,037,508 to 20,037,508
- Y (northing): -20,037,508 to 20,037,508

**Used for**:
- Google Maps, Mapbox, OpenStreetMap
- Map tiles (z/x/y scheme)
- Web map rendering

**Characteristics**:
- Cylindrical projection
- Conformal (preserves angles/shapes)
- NOT equal-area (distorts at poles)
- Cuts off at ~85°N/S

**Example**:
```json
{
  "type": "Point",
  "coordinates": [-13634876, 4545684]  // [x, y] in meters (projected)
}
```

**Important**: Distances in Web Mercator are NOT accurate. Always transform to WGS84 for distance calculations.

---

### UTM Zones (EPSG:326xx / 327xx)

**What it is**: Universal Transverse Mercator - localized projections

**Coverage**: 60 zones, each 6° wide
- Northern Hemisphere: EPSG:32601-32660
- Southern Hemisphere: EPSG:32701-32760

**Units**: Meters

**Used for**:
- Engineering projects
- Survey data
- High-accuracy local mapping

**Characteristics**:
- Conformal (preserves shapes)
- Minimal distortion within zone
- Accurate distance calculations
- Limited coverage (one zone at a time)

**Example** (San Francisco is in UTM Zone 10N):
```sql
-- Transform WGS84 to UTM 10N
SELECT ST_Transform(
  ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326),
  32610  -- UTM 10N
);
-- Result: POINT(551420 4182976)
```

---

## Coordinate Order

**CRITICAL**: Different systems use different order!

| System | Order | Example |
|--------|-------|---------|
| GeoJSON | [lon, lat] | [-122.4194, 37.7749] |
| PostGIS (WGS84) | (lon, lat) | POINT(-122.4194 37.7749) |
| PostGIS (traditional) | (lat, lon) | **VARIES** |
| Mapbox/Leaflet | [lat, lon] | [37.7749, -122.4194] |

**Rule of thumb**: GeoJSON and PostGIS use (X, Y) = (lon, lat)

**Common mistake**:
```javascript
// ❌ WRONG - swapped coordinates
const point = {
  type: "Point",
  coordinates: [37.7749, -122.4194]  // lat, lon (WRONG!)
};

// ✅ CORRECT - GeoJSON is [lon, lat]
const point = {
  type: "Point",
  coordinates: [-122.4194, 37.7749]  // lon, lat ✅
};
```

---

## Transformations

### PostGIS Transformations

**Convert between coordinate systems**:

```sql
-- WGS84 → Web Mercator
SELECT ST_Transform(
  ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326),
  3857
);
-- Result: POINT(-13634876 4545684)

-- Web Mercator → WGS84
SELECT ST_Transform(
  ST_SetSRID(ST_MakePoint(-13634876, 4545684), 3857),
  4326
);
-- Result: POINT(-122.4194 37.7749)

-- WGS84 → UTM 10N
SELECT ST_Transform(
  ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326),
  32610
);
-- Result: POINT(551420 4182976)
```

**Always specify SRID**:
```sql
-- ❌ WRONG - no SRID, PostGIS doesn't know what it is
SELECT ST_Transform(ST_MakePoint(-122.4194, 37.7749), 3857);

-- ✅ CORRECT - explicit SRID
SELECT ST_Transform(
  ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326),
  3857
);
```

---

### JavaScript Transformations (proj4js)

**Install**:
```bash
npm install proj4
```

**Usage**:
```javascript
import proj4 from 'proj4';

// Define projections (built-in for common ones)
const wgs84 = 'EPSG:4326';
const webMercator = 'EPSG:3857';

// WGS84 → Web Mercator
const [x, y] = proj4(wgs84, webMercator, [-122.4194, 37.7749]);
console.log(x, y);  // -13634876, 4545684

// Web Mercator → WGS84
const [lon, lat] = proj4(webMercator, wgs84, [-13634876, 4545684]);
console.log(lon, lat);  // -122.4194, 37.7749
```

**Custom projections**:
```javascript
// Define UTM 10N
proj4.defs([
  [
    'EPSG:32610',
    '+proj=utm +zone=10 +datum=WGS84 +units=m +no_defs'
  ]
]);

// Transform
const [easting, northing] = proj4('EPSG:4326', 'EPSG:32610', [-122.4194, 37.7749]);
```

---

## Finding the Right UTM Zone

**Formula**: `Zone = floor((longitude + 180) / 6) + 1`

```javascript
function getUTMZone(lon: number, lat: number): number {
  const zone = Math.floor((lon + 180) / 6) + 1;

  // Northern hemisphere: 32600 + zone
  // Southern hemisphere: 32700 + zone
  const epsg = lat >= 0 ? 32600 + zone : 32700 + zone;

  return epsg;
}

// San Francisco (-122.4194, 37.7749)
const zone = getUTMZone(-122.4194, 37.7749);
// Returns: 32610 (UTM 10N)
```

---

## Distance Calculations

### Wrong: Euclidean Distance in WGS84

```javascript
// ❌ WRONG - treats degrees as Cartesian units
function badDistance(lon1, lat1, lon2, lat2) {
  const dx = lon2 - lon1;
  const dy = lat2 - lat1;
  return Math.sqrt(dx * dx + dy * dy) * 111320;  // WRONG!
}
```

### Correct: Haversine Formula

```javascript
// ✅ CORRECT - great circle distance
function haversineDistance(lon1, lat1, lon2, lat2) {
  const R = 6371000; // Earth radius in meters

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
```

### Best: PostGIS with GEOGRAPHY

```sql
-- PostGIS handles everything
SELECT ST_Distance(
  ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
  ST_SetSRID(ST_MakePoint(-74.0060, 40.7128), 4326)::geography
) AS distance_meters;
```

**Note**: `::geography` tells PostGIS to use spheroid model

---

## Common Scenarios

### Scenario 1: Storing User Locations

**Best practice**: Store in WGS84 (EPSG:4326)

```sql
CREATE TABLE user_locations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  location GEOGRAPHY(POINT, 4326),  -- WGS84
  created_at TIMESTAMP
);

-- Index for spatial queries
CREATE INDEX idx_user_locations ON user_locations USING GIST(location);

-- Insert (from GPS)
INSERT INTO user_locations (user_id, location)
VALUES (123, ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326));
```

**Why WGS84**:
- GPS coordinates are in WGS84
- Database can handle distance calculations
- Global coverage

---

### Scenario 2: Rendering Map Tiles

**Convert to Web Mercator** for rendering:

```javascript
// Client-side: Transform WGS84 → Web Mercator for Mapbox
const features = await fetch('/api/features').then(r => r.json());

// Mapbox expects WGS84, but tiles are in Web Mercator
map.addSource('features', {
  type: 'geojson',
  data: features  // GeoJSON in WGS84
});

// Mapbox handles transformation internally
```

**Server-side**: Generate tiles in Web Mercator

```sql
-- Tile query (Web Mercator)
SELECT ST_AsMVT(q, 'layer', 4096, 'geom') AS mvt
FROM (
  SELECT
    id,
    name,
    ST_AsMVTGeom(
      ST_Transform(location, 3857),  -- Transform to Web Mercator
      ST_TileEnvelope(:z, :x, :y),
      4096,
      256
    ) AS geom
  FROM locations
  WHERE ST_Intersects(
    location,
    ST_Transform(ST_TileEnvelope(:z, :x, :y), 4326)
  )
) AS q;
```

---

### Scenario 3: Engineering/Survey Data

**Use local UTM zone** for accuracy:

```sql
-- Survey points in UTM 10N (San Francisco area)
CREATE TABLE survey_points (
  id SERIAL PRIMARY KEY,
  point_id VARCHAR(50),
  location GEOMETRY(POINT, 32610),  -- UTM 10N
  elevation FLOAT,
  surveyed_at TIMESTAMP
);

-- Accurate distance calculation (within UTM zone)
SELECT ST_Distance(
  (SELECT location FROM survey_points WHERE point_id = 'A'),
  (SELECT location FROM survey_points WHERE point_id = 'B')
) AS distance_meters;
```

---

## Debugging Coordinate Issues

### Check SRID

```sql
SELECT ST_SRID(location) FROM locations LIMIT 1;
-- Should return 4326 for WGS84
```

### Visualize Coordinates

```javascript
// If coordinates look huge, probably Web Mercator
const coords = [-13634876, 4545684];  // Web Mercator
console.log('Magnitude:', Math.abs(coords[0]));  // ~13 million = Web Mercator

// If coordinates are small, probably WGS84
const coords2 = [-122.4194, 37.7749];  // WGS84
console.log('Magnitude:', Math.abs(coords2[0]));  // ~122 = WGS84
```

### Validate Bounds

```javascript
// WGS84 bounds
const isValidWGS84 = (lon, lat) => {
  return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
};

// Web Mercator bounds
const isValidWebMercator = (x, y) => {
  const limit = 20037508.34;
  return Math.abs(x) <= limit && Math.abs(y) <= limit;
};
```

---

## Quick Reference

| Task | Use This |
|------|----------|
| Store GPS coordinates | WGS84 (4326) |
| Render web maps | Web Mercator (3857) |
| Engineering/survey | Local UTM zone (326xx/327xx) |
| Distance calculations | WGS84 with GEOGRAPHY type |
| Tile generation | Web Mercator (3857) |
| Global analysis | Equal-area projection (e.g., Mollweide) |

---

## Resources

- [EPSG.io](https://epsg.io/) - Search coordinate systems
- [Proj4](https://proj.org/) - Transformation library
- [PostGIS Transformations](https://postgis.net/docs/ST_Transform.html)
- [Understanding Web Mercator](https://docs.mapbox.com/help/glossary/projection/)

# PostGIS Guide

Complete guide to setting up PostGIS, creating spatial indexes, and writing efficient spatial queries.

## Installation

### macOS (Homebrew)

```bash
# Install PostgreSQL with PostGIS
brew install postgresql postgis

# Start PostgreSQL
brew services start postgresql

# Create database
createdb myapp_dev

# Enable PostGIS extension
psql myapp_dev -c "CREATE EXTENSION postgis;"
psql myapp_dev -c "CREATE EXTENSION postgis_topology;"  # Optional

# Verify
psql myapp_dev -c "SELECT PostGIS_version();"
```

### Ubuntu/Debian

```bash
# Install
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib postgis

# Enable extension
sudo -u postgres psql -d myapp_dev -c "CREATE EXTENSION postgis;"
```

### Docker

```bash
# Official PostGIS image
docker run --name postgis -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgis/postgis

# Connect
psql -h localhost -U postgres
```

---

## Data Types

### GEOMETRY vs GEOGRAPHY

| Type | Units | Use When |
|------|-------|----------|
| `GEOMETRY` | Cartesian (meters/degrees) | Projected data, local areas |
| `GEOGRAPHY` | Spheroid (meters) | Global data, accurate distances |

**GEOMETRY** (projected, flat Earth):
```sql
CREATE TABLE locations_geometry (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  location GEOMETRY(POINT, 4326)  -- Stores as degrees, treats as flat
);

-- Distance in "degree units" (NOT meters!)
SELECT ST_Distance(
  ST_MakePoint(-122.4194, 37.7749),
  ST_MakePoint(-122.4294, 37.7849)
);
-- Returns: 0.0141 (degrees, meaningless for distance)
```

**GEOGRAPHY** (spherical, curved Earth):
```sql
CREATE TABLE locations_geography (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  location GEOGRAPHY(POINT, 4326)  -- Treats Earth as sphere
);

-- Distance in meters (accurate!)
SELECT ST_Distance(
  ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
  ST_SetSRID(ST_MakePoint(-122.4294, 37.7849), 4326)::geography
);
-- Returns: 1568.5 (meters) ✅
```

**Rule of thumb**:
- Use `GEOGRAPHY` for WGS84 data (GPS coordinates)
- Use `GEOMETRY` for projected data (UTM, Web Mercator)

---

## Geometry Types

```sql
-- Point
GEOMETRY(POINT, 4326)
-- Example: ST_MakePoint(-122.4194, 37.7749)

-- LineString
GEOMETRY(LINESTRING, 4326)
-- Example: ST_MakeLine(ARRAY[point1, point2, point3])

-- Polygon
GEOMETRY(POLYGON, 4326)
-- Example: ST_MakePolygon(ST_MakeLine(ARRAY[p1, p2, p3, p4, p1]))

-- MultiPoint
GEOMETRY(MULTIPOINT, 4326)

-- MultiLineString (e.g., roads network)
GEOMETRY(MULTILINESTRING, 4326)

-- MultiPolygon (e.g., islands)
GEOMETRY(MULTIPOLYGON, 4326)

-- GeometryCollection (mixed types)
GEOMETRY(GEOMETRYCOLLECTION, 4326)
```

---

## Creating Spatial Data

### From Lat/Lon

```sql
-- Single point
INSERT INTO locations (name, location)
VALUES ('San Francisco', ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326));

-- From coordinates table
UPDATE locations
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
WHERE location IS NULL;
```

### From GeoJSON

```sql
-- Insert GeoJSON feature
INSERT INTO locations (name, location)
VALUES (
  'Golden Gate Park',
  ST_SetSRID(
    ST_GeomFromGeoJSON('{"type":"Point","coordinates":[-122.4862,37.7694]}'),
    4326
  )
);

-- Bulk import from GeoJSON file
\copy locations(name, location)
FROM PROGRAM 'cat features.geojson | jq -r ''.features[] | [.properties.name, .geometry | tostring] | @csv'''
WITH CSV DELIMITER ',';
```

### From WKT (Well-Known Text)

```sql
INSERT INTO locations (name, location)
VALUES (
  'Line',
  ST_SetSRID(
    ST_GeomFromText('LINESTRING(-122.4194 37.7749, -122.4294 37.7849)'),
    4326
  )
);
```

---

## Spatial Indexes

**CRITICAL**: Without indexes, spatial queries are O(N) sequential scans.

### GiST Index (Most Common)

```sql
-- Create table
CREATE TABLE drone_images (
  id SERIAL PRIMARY KEY,
  image_url VARCHAR(255),
  location GEOGRAPHY(POINT, 4326),
  captured_at TIMESTAMP
);

-- GiST index for spatial queries
CREATE INDEX idx_drone_images_location ON drone_images USING GIST(location);

-- Analyze table (update statistics)
ANALYZE drone_images;
```

**Performance impact**:
- 10M points, 5km radius query
- Without index: 3.2 seconds (seq scan)
- With GiST index: 12ms (99.6% faster)

### SP-GiST Index (Space-Partitioning)

```sql
-- Better for point data with high cardinality
CREATE INDEX idx_locations_spgist ON locations USING SPGIST(location);
```

**When to use**:
- GiST: General-purpose, works for all geometry types
- SP-GiST: Optimized for points, faster for kNN queries

---

## Common Spatial Queries

### 1. Find Nearby (Within Radius)

```sql
-- Find all locations within 5km of point
SELECT id, name, ST_AsGeoJSON(location) as geojson
FROM locations
WHERE ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
  5000  -- 5000 meters = 5km
)
ORDER BY location <-> ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography
LIMIT 10;
```

**Key functions**:
- `ST_DWithin`: Returns true if distance &lt;= threshold
- `<->`: Distance operator (for ORDER BY)

---

### 2. Calculate Distance

```sql
-- Distance between two points (meters)
SELECT ST_Distance(
  (SELECT location FROM locations WHERE id = 1)::geography,
  (SELECT location FROM locations WHERE id = 2)::geography
) AS distance_meters;

-- Distance from all locations to a point
SELECT
  id,
  name,
  ST_Distance(
    location,
    ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography
  ) / 1000 AS distance_km
FROM locations
ORDER BY distance_km
LIMIT 10;
```

---

### 3. Point in Polygon

```sql
-- Check if point is inside polygon
SELECT ST_Within(
  ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326),
  (SELECT boundary FROM jurisdictions WHERE name = 'San Francisco')
) AS is_inside;

-- Find all points inside a polygon
SELECT p.id, p.name
FROM points p
WHERE ST_Within(
  p.location,
  (SELECT boundary FROM jurisdictions WHERE name = 'California')
);
```

---

### 4. Bounding Box Query

```sql
-- Find all points in bounding box
SELECT id, name, ST_AsGeoJSON(location) as geojson
FROM locations
WHERE ST_Intersects(
  location,
  ST_MakeEnvelope(
    -122.5194, 37.7049,  -- west, south
    -122.3194, 37.8449,  -- east, north
    4326
  )
);
```

**Optimization**: Bounding box queries use spatial index efficiently.

---

### 5. Nearest Neighbor (kNN)

```sql
-- Find 10 nearest locations
SELECT id, name, ST_AsGeoJSON(location) as geojson
FROM locations
ORDER BY location <-> ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography
LIMIT 10;
```

**Note**: `<->` operator uses index for fast kNN search.

---

### 6. Clustering (Group by Proximity)

```sql
-- Group locations within 1km of each other
SELECT
  ST_ClusterDBSCAN(location, eps := 1000, minpoints := 2) OVER () AS cluster_id,
  id,
  name,
  ST_AsGeoJSON(location) as geojson
FROM locations;
```

---

## Output Formats

### GeoJSON

```sql
-- Single feature
SELECT ST_AsGeoJSON(location) FROM locations WHERE id = 1;

-- Feature with properties
SELECT json_build_object(
  'type', 'Feature',
  'geometry', ST_AsGeoJSON(location)::json,
  'properties', json_build_object('name', name, 'id', id)
) FROM locations WHERE id = 1;

-- FeatureCollection
SELECT json_build_object(
  'type', 'FeatureCollection',
  'features', json_agg(
    json_build_object(
      'type', 'Feature',
      'geometry', ST_AsGeoJSON(location)::json,
      'properties', json_build_object('name', name, 'id', id)
    )
  )
) FROM locations;
```

### WKT (Well-Known Text)

```sql
SELECT ST_AsText(location) FROM locations WHERE id = 1;
-- Returns: POINT(-122.4194 37.7749)
```

### Coordinates

```sql
-- Longitude
SELECT ST_X(location) FROM locations WHERE id = 1;

-- Latitude
SELECT ST_Y(location) FROM locations WHERE id = 1;
```

---

## Performance Optimization

### Use Bounding Box Before Expensive Operations

```sql
-- ❌ Slow: ST_Distance on all rows
SELECT id, name
FROM locations
WHERE ST_Distance(
  location,
  ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography
) < 5000;

-- ✅ Fast: Bounding box pre-filter + ST_Distance
SELECT id, name
FROM locations
WHERE ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography,
  5000
)
AND ST_Distance(
  location,
  ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography
) < 5000;
```

**Why**: `ST_DWithin` uses bounding box from index, then `ST_Distance` refines.

---

### Simplify Geometries

```sql
-- Simplify polygon (reduce points)
SELECT ST_Simplify(geometry, 0.001) FROM complex_polygons;

-- Simplify preserving topology
SELECT ST_SimplifyPreserveTopology(geometry, 0.001) FROM complex_polygons;
```

**Use when**: Rendering at low zoom levels (don't need full detail).

---

### Avoid GEOGRAPHY for Local Queries

```sql
-- ❌ Slow: GEOGRAPHY on local data
CREATE TABLE local_points (
  location GEOGRAPHY(POINT, 4326)
);

-- ✅ Fast: GEOMETRY in local UTM projection
CREATE TABLE local_points (
  location GEOMETRY(POINT, 32610)  -- UTM 10N
);
```

**Why**: GEOGRAPHY calculations are slower (spheroid math). For local areas, projected coordinates are faster and accurate.

---

## Vector Tile Generation

### Mapbox Vector Tiles (MVT)

```sql
-- Generate tile at z/x/y
SELECT ST_AsMVT(q, 'layer', 4096, 'geom') AS mvt
FROM (
  SELECT
    id,
    name,
    ST_AsMVTGeom(
      ST_Transform(location, 3857),  -- Transform to Web Mercator
      ST_TileEnvelope(:z, :x, :y),
      4096,  -- Tile extent
      256    -- Buffer
    ) AS geom
  FROM locations
  WHERE ST_Intersects(
    location,
    ST_Transform(ST_TileEnvelope(:z, :x, :y), 4326)
  )
) AS q;
```

**Use in Express**:
```javascript
app.get('/tiles/:z/:x/:y.mvt', async (req, res) => {
  const { z, x, y } = req.params;

  const result = await db.query(
    'SELECT ST_AsMVT(q, $1, 4096, $2) AS mvt FROM ...',
    ['layer', 'geom']
  );

  res.set('Content-Type', 'application/x-protobuf');
  res.send(result.rows[0].mvt);
});
```

---

## Common Pitfalls

### 1. Forgetting to Set SRID

```sql
-- ❌ WRONG - no SRID
INSERT INTO locations (location) VALUES (ST_MakePoint(-122.4194, 37.7749));

-- ✅ CORRECT
INSERT INTO locations (location) VALUES (
  ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)
);
```

### 2. Mixing GEOMETRY and GEOGRAPHY

```sql
-- ❌ WRONG - can't compare GEOMETRY with GEOGRAPHY
SELECT ST_Distance(geometry_col, geography_col);

-- ✅ CORRECT - cast to same type
SELECT ST_Distance(geometry_col::geography, geography_col);
```

### 3. Using ST_Distance Without Index

```sql
-- ❌ SLOW - ST_Distance doesn't use index
SELECT * FROM locations
WHERE ST_Distance(location, point) < 5000;

-- ✅ FAST - ST_DWithin uses index
SELECT * FROM locations
WHERE ST_DWithin(location, point, 5000);
```

---

## Troubleshooting

### Check if Extension is Enabled

```sql
SELECT * FROM pg_extension WHERE extname = 'postgis';
```

### Verify SRID

```sql
SELECT ST_SRID(location) FROM locations LIMIT 1;
-- Should return 4326 for WGS84
```

### Explain Query Plan

```sql
EXPLAIN ANALYZE
SELECT * FROM locations
WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(-122.4194, 37.7749), 4326)::geography, 5000);
```

**Look for**: "Index Scan using idx_..." (good) vs "Seq Scan" (bad)

---

## Resources

- [PostGIS Documentation](https://postgis.net/docs/)
- [PostGIS Cheat Sheet](https://postgis.net/docs/PostGIS_FAQ.html)
- [Spatial Joins](https://postgis.net/workshops/postgis-intro/joins.html)
- [Performance Tuning](https://postgis.net/workshops/postgis-intro/performance.html)

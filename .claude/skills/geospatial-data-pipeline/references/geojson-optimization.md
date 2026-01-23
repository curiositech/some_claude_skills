# GeoJSON Optimization

Techniques for optimizing GeoJSON files for web performance: simplification, chunking, precision, and vector tiles.

## The Problem

**Large GeoJSON files crash browsers**:
- 50MB GeoJSON = browser freeze
- 10,000 polygons = slow rendering
- High precision coordinates = wasted bytes

**Symptoms**:
- Map takes 10+ seconds to load
- Browser tab crashes
- Laggy panning/zooming

---

## Optimization Strategies

### 1. Coordinate Precision

**Problem**: Default precision is often excessive.

```json
// ❌ Excessive precision (8 decimals = ~1mm accuracy)
{
  "type": "Point",
  "coordinates": [-122.41941234, 37.77492345]
}

// ✅ Appropriate precision (5 decimals = ~1m accuracy)
{
  "type": "Point",
  "coordinates": [-122.4194, 37.7749]
}
```

**Precision vs Accuracy**:
| Decimals | Accuracy | Use Case |
|----------|----------|----------|
| 2 | ~1 km | Country-level maps |
| 3 | ~100 m | City-level maps |
| 4 | ~10 m | Neighborhood maps |
| 5 | ~1 m | **Web maps (default)** |
| 6 | ~10 cm | Engineering, surveying |
| 7 | ~1 cm | Precision agriculture |
| 8 | ~1 mm | Unnecessary for most apps |

**Tool**: `geojson-precision`

```bash
npm install -g @mapbox/geojson-precision

# Reduce to 5 decimals
geojson-precision -p 5 input.geojson output.geojson
```

**Savings**: 8 decimals → 5 decimals = ~40% file size reduction

---

### 2. Geometry Simplification

**Problem**: Polygons with too many vertices.

**Douglas-Peucker Algorithm**: Remove points that don't significantly change shape.

```bash
npm install -g @mapbox/simplify-geojson

# Tolerance: higher = more aggressive
simplify-geojson -t 0.001 input.geojson output.geojson
```

**Example**:
- Before: 10,000 points
- After (tolerance 0.001): 2,500 points
- Reduction: 75%

**Visual comparison**:
```
Before: ⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫ (10,000 points)
After:  ⚫-----⚫-----⚫ (2,500 points)
```

**PostGIS**:
```sql
-- Simplify geometry
SELECT ST_Simplify(geometry, 0.001) FROM polygons;

-- Simplify preserving topology (prevents self-intersections)
SELECT ST_SimplifyPreserveTopology(geometry, 0.001) FROM polygons;
```

**Tuning tolerance**:
- `0.0001`: Subtle simplification (~10% reduction)
- `0.001`: Moderate simplification (~40% reduction)
- `0.01`: Aggressive simplification (~70% reduction)

---

### 3. Remove Unnecessary Properties

**Problem**: Feature properties bloat file size.

```json
// ❌ Before: 500 bytes per feature
{
  "type": "Feature",
  "properties": {
    "id": 123,
    "name": "Feature 123",
    "description": "Long description...",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-16T14:20:00Z",
    "metadata": { /* ... */ },
    "tags": ["tag1", "tag2", "tag3"]
  },
  "geometry": { /* ... */ }
}

// ✅ After: 100 bytes per feature
{
  "type": "Feature",
  "properties": {
    "id": 123,
    "name": "Feature 123"
  },
  "geometry": { /* ... */ }
}
```

**Savings**: 500 bytes → 100 bytes = 80% reduction per feature

**Script**:
```javascript
const geojson = require('./input.json');

geojson.features = geojson.features.map(f => ({
  type: 'Feature',
  properties: {
    id: f.properties.id,
    name: f.properties.name
  },
  geometry: f.geometry
}));

fs.writeFileSync('output.json', JSON.stringify(geojson));
```

---

### 4. Vector Tiles

**Problem**: Loading entire dataset at once.

**Solution**: Split into zoom-dependent tiles.

**Benefits**:
- Only load visible area
- Progressive loading
- Smaller payloads

**Tile Pyramid**:
```
z0: 1 tile (whole world)
z5: 1,024 tiles
z10: 1,048,576 tiles
z14: 268,435,456 tiles
```

**Generate with Tippecanoe**:
```bash
npm install -g @mapbox/tippecanoe

# Generate tiles
tippecanoe -o output.mbtiles -zg --drop-densest-as-needed input.geojson

# Options:
# -zg: Auto-detect max zoom
# --drop-densest-as-needed: Thin out features at low zoom
# -Z<minzoom> -z<maxzoom>: Set zoom range
```

**Serve tiles**:
```javascript
// Express endpoint
app.get('/tiles/:z/:x/:y.pbf', async (req, res) => {
  const { z, x, y } = req.params;

  // Query PostGIS for tile
  const tile = await db.query(
    'SELECT ST_AsMVT(q, $1) FROM (...) q',
    ['layer']
  );

  res.set('Content-Type', 'application/x-protobuf');
  res.send(tile.rows[0].st_asmvt);
});
```

**Client-side**:
```javascript
// Mapbox GL JS
map.addSource('tiles', {
  type: 'vector',
  tiles: ['https://api.example.com/tiles/{z}/{x}/{y}.pbf'],
  minzoom: 0,
  maxzoom: 14
});
```

---

### 5. Feature Chunking

**Problem**: Single GeoJSON file with 10,000 features.

**Solution**: Split into multiple files.

**Strategy 1**: Spatial chunking (by bounds)
```javascript
// Split by bounding box grid
const chunks = [
  { name: 'nw', bounds: [-180, 0, -90, 90] },
  { name: 'ne', bounds: [-90, 0, 0, 90] },
  { name: 'sw', bounds: [-180, -90, -90, 0] },
  { name: 'se', bounds: [-90, -90, 0, 0] }
];

chunks.forEach(chunk => {
  const features = allFeatures.filter(f =>
    featureIntersectsBounds(f, chunk.bounds)
  );

  fs.writeFileSync(
    `${chunk.name}.geojson`,
    JSON.stringify({ type: 'FeatureCollection', features })
  );
});
```

**Strategy 2**: Zoom-based chunking
```javascript
// High-detail features for high zoom only
const detailedFeatures = features.filter(f => getComplexity(f) > 100);
const simpleFeatures = features.filter(f => getComplexity(f) <= 100);

// Save separately
fs.writeFileSync('simple.geojson', JSON.stringify({ type: 'FeatureCollection', features: simpleFeatures }));
fs.writeFileSync('detailed.geojson', JSON.stringify({ type: 'FeatureCollection', features: detailedFeatures }));

// Load conditionally
if (map.getZoom() > 12) {
  loadDetailed();
} else {
  loadSimple();
}
```

---

### 6. Compression

**Gzip Compression**:
```bash
# Compress
gzip -k input.geojson  # Creates input.geojson.gz

# Server: nginx auto-gzip
gzip on;
gzip_types application/json;
```

**Brotli Compression** (better than gzip):
```bash
# Install
npm install -g brotli-cli

# Compress
brotli input.geojson

# Server: nginx brotli module
brotli on;
brotli_types application/json;
```

**Comparison**:
| Method | 10MB GeoJSON |
|--------|--------------|
| Uncompressed | 10 MB |
| Gzip | 2.5 MB (75% reduction) |
| Brotli | 2 MB (80% reduction) |

---

### 7. TopoJSON

**Problem**: Adjacent polygons share borders = duplicate coordinates.

**Solution**: TopoJSON encodes topology once.

```bash
npm install -g topojson

# Convert GeoJSON → TopoJSON
geo2topo input.geojson > output.topojson

# Simplify topology
toposimplify -s 0.001 output.topojson > simplified.topojson
```

**Savings**: 30-80% file size reduction (depends on shared borders)

**Use when**:
- Choropleth maps (countries, states, counties)
- Adjacent polygons with shared boundaries
- NOT useful for scattered points

**Client-side**:
```javascript
import { feature } from 'topojson-client';

// Load TopoJSON
const topology = await fetch('/data.topojson').then(r => r.json());

// Convert to GeoJSON
const geojson = feature(topology, topology.objects.layer);

// Add to map
map.addSource('data', { type: 'geojson', data: geojson });
```

---

## Optimization Workflow

### Step 1: Analyze

```bash
# Check file size
ls -lh input.geojson

# Count features
jq '.features | length' input.geojson

# Check coordinate precision
jq '.features[0].geometry.coordinates' input.geojson
```

### Step 2: Reduce Precision

```bash
geojson-precision -p 5 input.geojson temp1.geojson
```

### Step 3: Simplify Geometry

```bash
npx @mapbox/geojson-precision -t 0.001 temp1.geojson temp2.geojson
```

### Step 4: Remove Properties

```javascript
const data = require('./temp2.geojson');
data.features = data.features.map(f => ({
  type: 'Feature',
  properties: { id: f.properties.id, name: f.properties.name },
  geometry: f.geometry
}));
fs.writeFileSync('temp3.geojson', JSON.stringify(data));
```

### Step 5: Compress

```bash
gzip -k temp3.geojson
```

### Step 6: Measure

```bash
ls -lh input.geojson input.geojson.gz temp3.geojson temp3.geojson.gz
```

---

## Performance Benchmarks

**Test**: 50MB GeoJSON with 10,000 polygons

| Optimization | File Size | Load Time |
|--------------|-----------|-----------|
| Original | 50 MB | 12 seconds |
| Precision (5 decimals) | 30 MB | 8 seconds |
| + Simplify (0.001) | 10 MB | 3 seconds |
| + Remove properties | 5 MB | 1.5 seconds |
| + Gzip | 1.5 MB | 0.5 seconds |
| **Vector tiles** | **50 KB per tile** | **&lt;100ms** |

**Winner**: Vector tiles (100x improvement)

---

## When to Use Each Strategy

| Strategy | Use When | Savings |
|----------|----------|---------|
| Reduce precision | Always | 30-40% |
| Simplify geometry | Rendering at low zoom | 40-70% |
| Remove properties | Properties not displayed | 20-80% |
| Vector tiles | &gt;1000 features or &gt;5MB | 90%+ |
| Chunking | Mixed complexity features | Varies |
| Compression | Always (server-side) | 70-80% |
| TopoJSON | Adjacent polygons | 30-80% |

---

## Checklist

```
□ Reduce coordinate precision to 5 decimals
□ Simplify geometry for features &gt;100 points
□ Remove unused properties from features
□ Enable gzip/brotli compression on server
□ Consider vector tiles for files &gt;5MB
□ Use TopoJSON for adjacent polygons
□ Split large files into zoom-based chunks
□ Test load time on slow connection (3G)
```

---

## Resources

- [geojson-precision](https://github.com/mapbox/geojson-precision)
- [Tippecanoe](https://github.com/mapbox/tippecanoe)
- [TopoJSON](https://github.com/topojson/topojson)
- [Simplify.js](https://mourner.github.io/simplify-js/)

# Plant Database MCP Server

An MCP server providing access to **13,700+ plants** with USDA hardiness zone lookups and landscaping recommendations. Combines a curated landscaping database with data from [Trefle.io](https://trefle.io) botanical database. Designed to pair with the `fancy-yard-landscaper` skill.

## Features

- **13,700+ Plants** - Comprehensive US plant database from Trefle.io
- **USDA Hardiness Zone Lookup** - Get zone information by ZIP code
- **Plant Search** - Filter by name, zone, sun, water, type, family, native state, edibility, and more
- **Privacy Screen Recommendations** - Smart suggestions avoiding common mistakes
- **Native Plant Finder** - Find plants native to your region or state
- **Compatibility Checking** - Verify if plants work in your zone

## Installation

```bash
cd mcp-servers/plant-database
npm install
npm run build
```

## Configuration

Add to your Claude Code MCP settings:

```json
{
  "mcpServers": {
    "plant-database": {
      "command": "node",
      "args": ["/path/to/plant-database/dist/index.js"]
    }
  }
}
```

## Tools

### `lookup_zone`

Get USDA hardiness zone for a ZIP code.

```json
{
  "zip_code": "10001"
}
```

Returns:
```json
{
  "zip_code": "10001",
  "zone": "7a",
  "min_temp_f": 0,
  "avg_first_frost": "Nov 15",
  "avg_last_frost": "Apr 1"
}
```

### `search_plants`

Search across 13,700+ plants by criteria.

```json
{
  "query": "maple",
  "native_state": "California",
  "type": "tree",
  "limit": 20
}
```

Available filters:
- `query` - Search by common or scientific name
- `zone` - USDA hardiness zone (e.g., "6b")
- `type` - tree, shrub, perennial, grass, vine
- `native_state` - US state (e.g., "California", "Texas")
- `native_region` - Region (northeast, southeast, midwest, etc.)
- `family` - Plant family (e.g., "Rosaceae", "Fabaceae")
- `edible` - Filter for edible plants
- `sun`, `water`, `growth_rate` - Growing conditions
- `evergreen`, `deer_resistant` - Plant characteristics
- `min_height_ft`, `max_height_ft` - Size filters

### `get_plant`

Get detailed plant information.

```json
{
  "plant_id": "nellie-stevens-holly"
}
```

### `recommend_privacy_screen`

Get smart privacy screening recommendations.

```json
{
  "zone": "6b",
  "height_needed_ft": 15,
  "length_ft": 50,
  "timeline": "fast",
  "avoid_arborvitae": true,
  "deer_pressure": "high"
}
```

Returns recommendations with:
- Suitable plants for your zone
- Spacing calculations
- Plants needed
- Estimated time to privacy
- Warnings about common issues

### `find_native_plants`

Find plants native to your region.

```json
{
  "region": "northeast",
  "type": "perennial",
  "for_pollinators": true
}
```

Regions: `northeast`, `southeast`, `midwest`, `southwest`, `pacific_northwest`, `california`, `mountain_west`, `great_plains`

### `check_compatibility`

Verify zone compatibility.

```json
{
  "plant_id": "nellie-stevens-holly",
  "zone": "5b"
}
```

## Why Avoid Arborvitae?

The `recommend_privacy_screen` tool defaults to excluding arborvitae because:

1. **Bagworms** - Arborvitae are extremely susceptible
2. **Deer Browse** - Emerald Green arborvitae are deer candy
3. **Winter Burn** - Common in exposed locations
4. **Slow Establishment** - Takes 5-7 years for good screening
5. **Disease** - Root rot and various blights

Better alternatives:
- **Nellie Stevens Holly** - Fast (2-3 ft/year), deer resistant, disease resistant
- **Skip Laurel** - Dense, tolerates shade, very cold hardy
- **Wax Myrtle** - Native (Southeast), drought tolerant, salt tolerant
- **Green Giant Thuja** - If you must use arborvitae, this is the most resistant variety

## Plant Database

The database combines two sources:

### Curated Database (~25 plants)
Hand-picked landscaping plants with detailed care information:
- Privacy screening plants
- Native trees and shrubs by region
- Native perennials for pollinator gardens
- Ornamental grasses

### Trefle Database (13,700+ plants)
Imported from [Trefle.io](https://trefle.io) botanical database:
- Filtered for US-distributed species
- Trees, shrubs, perennials, vines, grasses
- Includes scientific names, families, growth characteristics
- Native state distributions

Each plant entry includes:
- Common and scientific names
- Plant family
- Growth habit and rate
- Mature height
- pH range (where available)
- Light requirements
- Drought/shade tolerance
- Flower and foliage colors
- Bloom months
- Edibility
- Native state distributions
- Image URL (where available)

## Pairing with fancy-yard-landscaper

This MCP is designed to work alongside the `fancy-yard-landscaper` skill:

1. User describes their yard situation to the skill
2. Skill uses MCP to look up their zone by ZIP
3. Skill uses MCP to get plant recommendations
4. Skill provides personalized landscaping advice with specific plants

## Extending the Database

### Add Curated Plants

Edit `src/plants.ts` for detailed landscaping recommendations:

```typescript
'your-plant-id': {
  id: 'your-plant-id',
  common_name: 'Your Plant Name',
  scientific_name: 'Genus species',
  type: 'shrub',
  hardiness_zones: '5-9',
  sun: ['full_sun', 'part_shade'],
  water: 'medium',
  mature_height_ft: 10,
  mature_width_ft: 8,
  growth_rate: 'medium',
  evergreen: true,
  deer_resistant: true,
  native_regions: ['northeast'],
  pollinator_friendly: true,
  uses: ['privacy_screen', 'hedge'],
  care_notes: 'Your care notes here.',
}
```

### Re-import Trefle Data

To refresh the Trefle database:

```bash
# Download latest Trefle dump (may take a while)
curl -L "https://media.githubusercontent.com/media/treflehq/dump/master/species.csv" -o scripts/species.csv

# Run import script
npm run import:trefle
```

The import script filters for:
- US-distributed plants (50 states)
- Species rank only (not varieties/subspecies)
- Plants with common names
- Landscaping-relevant growth habits (trees, shrubs, perennials, vines, grasses)

## Data Sources

- **Trefle.io** - Open botanical database (AGPL-3.0 license)
- **USDA Plants Database** - Zone and distribution data

## License

MIT - Part of someclaudeskills.com

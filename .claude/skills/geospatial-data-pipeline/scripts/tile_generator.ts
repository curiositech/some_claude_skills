#!/usr/bin/env node
/**
 * Vector Tile Generator
 *
 * Convert GeoJSON files into vector tiles (MBTiles format) for efficient web/mobile map rendering.
 *
 * Usage:
 *   npx tsx tile_generator.ts generate <input.geojson> <output.mbtiles> [options]
 *   npx tsx tile_generator.ts info <tiles.mbtiles>
 *
 * Options:
 *   --minzoom <z>     Minimum zoom level (default: 0)
 *   --maxzoom <z>     Maximum zoom level (default: 14)
 *   --name <name>     Tileset name
 *   --attribution <text>  Attribution text
 *
 * Examples:
 *   npx tsx tile_generator.ts generate survey.geojson tiles.mbtiles --minzoom 10 --maxzoom 18
 *   npx tsx tile_generator.ts info tiles.mbtiles
 */

import * as fs from 'fs';
import * as path from 'path';

interface Tile {
  z: number;  // Zoom level
  x: number;  // Tile X coordinate
  y: number;  // Tile Y coordinate
  features: GeoJSONFeature[];
}

interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: Record<string, any>;
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

interface TileGeneratorOptions {
  minZoom: number;
  maxZoom: number;
  name?: string;
  attribution?: string;
  bufferSize?: number;  // Tile buffer in pixels
}

interface TilesetMetadata {
  name: string;
  description?: string;
  version: string;
  attribution?: string;
  type: 'overlay' | 'baselayer';
  format: 'pbf' | 'geojson';
  minzoom: number;
  maxzoom: number;
  bounds: number[];  // [west, south, east, north]
  center: number[];  // [lon, lat, zoom]
}

class TileGenerator {
  private options: TileGeneratorOptions;

  constructor(options: TileGeneratorOptions) {
    this.options = options;
  }

  /**
   * Generate tiles from GeoJSON
   */
  async generate(inputPath: string, outputPath: string): Promise<void> {
    console.log(`\n🗺️  Generating vector tiles...\n`);
    console.log(`Input:  ${inputPath}`);
    console.log(`Output: ${outputPath}`);
    console.log(`Zoom:   ${this.options.minZoom} - ${this.options.maxZoom}\n`);

    // Read GeoJSON
    const content = fs.readFileSync(inputPath, 'utf-8');
    const geojson: GeoJSONFeatureCollection = JSON.parse(content);

    console.log(`Loaded ${geojson.features.length} features\n`);

    // Calculate bounds
    const bounds = this.calculateBounds(geojson.features);
    console.log(`Bounds: [${bounds.map(n => n.toFixed(4)).join(', ')}]`);

    // Generate tiles for each zoom level
    const allTiles: Tile[] = [];

    for (let z = this.options.minZoom; z <= this.options.maxZoom; z++) {
      console.log(`\nGenerating zoom level ${z}...`);

      const tiles = this.generateTilesForZoom(geojson.features, z, bounds);
      allTiles.push(...tiles);

      console.log(`  Created ${tiles.length} tiles`);
    }

    console.log(`\n✅ Generated ${allTiles.length} total tiles`);

    // Write to MBTiles (simplified - in production use better-sqlite3 or similar)
    this.writeMBTiles(outputPath, allTiles, bounds);

    console.log(`\n📦 Tileset written to ${outputPath}\n`);
  }

  /**
   * Generate tiles for a specific zoom level
   */
  private generateTilesForZoom(
    features: GeoJSONFeature[],
    z: number,
    bounds: number[]
  ): Tile[] {
    const tiles: Map<string, Tile> = new Map();

    features.forEach(feature => {
      // Get all tile coordinates this feature intersects
      const tileCoords = this.getIntersectingTiles(feature, z, bounds);

      tileCoords.forEach(({ x, y }) => {
        const key = `${z}/${x}/${y}`;

        if (!tiles.has(key)) {
          tiles.set(key, { z, x, y, features: [] });
        }

        // Clip feature to tile bounds (simplified - in production use proper clipping)
        const clipped = this.clipFeatureToTile(feature, z, x, y);
        if (clipped) {
          tiles.get(key)!.features.push(clipped);
        }
      });
    });

    return Array.from(tiles.values());
  }

  /**
   * Get tile coordinates that intersect with feature
   */
  private getIntersectingTiles(
    feature: GeoJSONFeature,
    z: number,
    bounds: number[]
  ): Array<{ x: number; y: number }> {
    const coords: Array<{ x: number; y: number }> = [];

    // Get feature bounds
    const [minLon, minLat, maxLon, maxLat] = this.getFeatureBounds(feature);

    // Convert to tile coordinates
    const minTile = this.lonLatToTile(minLon, maxLat, z);  // maxLat because Y is inverted
    const maxTile = this.lonLatToTile(maxLon, minLat, z);

    // Get all tiles in bounding box
    for (let x = minTile.x; x <= maxTile.x; x++) {
      for (let y = minTile.y; y <= maxTile.y; y++) {
        coords.push({ x, y });
      }
    }

    return coords;
  }

  /**
   * Convert lon/lat to tile coordinates
   */
  private lonLatToTile(lon: number, lat: number, z: number): { x: number; y: number } {
    const n = Math.pow(2, z);

    const x = Math.floor((lon + 180) / 360 * n);

    const latRad = lat * Math.PI / 180;
    const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);

    return {
      x: Math.max(0, Math.min(n - 1, x)),
      y: Math.max(0, Math.min(n - 1, y))
    };
  }

  /**
   * Convert tile coordinates to lon/lat bounds
   */
  private tileToBounds(z: number, x: number, y: number): number[] {
    const n = Math.pow(2, z);

    const west = x / n * 360 - 180;
    const east = (x + 1) / n * 360 - 180;

    const northLat = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n))) * 180 / Math.PI;
    const southLat = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n))) * 180 / Math.PI;

    return [west, southLat, east, northLat];
  }

  /**
   * Clip feature to tile bounds (simplified)
   */
  private clipFeatureToTile(
    feature: GeoJSONFeature,
    z: number,
    x: number,
    y: number
  ): GeoJSONFeature | null {
    const tileBounds = this.tileToBounds(z, x, y);

    // Check if feature intersects tile
    const featureBounds = this.getFeatureBounds(feature);

    if (!this.boundsIntersect(featureBounds, tileBounds)) {
      return null;
    }

    // For simplicity, return entire feature
    // In production, implement proper geometry clipping
    return feature;
  }

  /**
   * Check if two bounding boxes intersect
   */
  private boundsIntersect(bounds1: number[], bounds2: number[]): boolean {
    const [w1, s1, e1, n1] = bounds1;
    const [w2, s2, e2, n2] = bounds2;

    return !(e1 < w2 || e2 < w1 || n1 < s2 || n2 < s1);
  }

  /**
   * Get bounding box for a feature
   */
  private getFeatureBounds(feature: GeoJSONFeature): number[] {
    const points = this.extractPoints(feature.geometry.coordinates);

    let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;

    points.forEach(([lon, lat]) => {
      minLon = Math.min(minLon, lon);
      minLat = Math.min(minLat, lat);
      maxLon = Math.max(maxLon, lon);
      maxLat = Math.max(maxLat, lat);
    });

    return [minLon, minLat, maxLon, maxLat];
  }

  /**
   * Calculate bounds for all features
   */
  private calculateBounds(features: GeoJSONFeature[]): number[] {
    let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;

    features.forEach(feature => {
      const [w, s, e, n] = this.getFeatureBounds(feature);
      minLon = Math.min(minLon, w);
      minLat = Math.min(minLat, s);
      maxLon = Math.max(maxLon, e);
      maxLat = Math.max(maxLat, n);
    });

    return [minLon, minLat, maxLon, maxLat];
  }

  /**
   * Extract all points from coordinates (recursive)
   */
  private extractPoints(coords: any): number[][] {
    if (typeof coords[0] === 'number') {
      return [coords];
    }

    return coords.flatMap((c: any) => this.extractPoints(c));
  }

  /**
   * Write tiles to MBTiles format (simplified)
   */
  private writeMBTiles(outputPath: string, tiles: Tile[], bounds: number[]): void {
    const metadata: TilesetMetadata = {
      name: this.options.name || path.basename(outputPath, '.mbtiles'),
      version: '1.0.0',
      attribution: this.options.attribution,
      type: 'overlay',
      format: 'geojson',
      minzoom: this.options.minZoom,
      maxzoom: this.options.maxZoom,
      bounds,
      center: [
        (bounds[0] + bounds[2]) / 2,
        (bounds[1] + bounds[3]) / 2,
        Math.floor((this.options.minZoom + this.options.maxZoom) / 2)
      ]
    };

    // For this example, write as directory structure
    // In production, use SQLite database (better-sqlite3)
    const tilesDir = outputPath.replace('.mbtiles', '_tiles');

    if (!fs.existsSync(tilesDir)) {
      fs.mkdirSync(tilesDir, { recursive: true });
    }

    // Write metadata
    fs.writeFileSync(
      path.join(tilesDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    // Write tiles
    tiles.forEach(tile => {
      const tileDir = path.join(tilesDir, `${tile.z}`, `${tile.x}`);
      if (!fs.existsSync(tileDir)) {
        fs.mkdirSync(tileDir, { recursive: true });
      }

      const tilePath = path.join(tileDir, `${tile.y}.geojson`);

      const featureCollection: GeoJSONFeatureCollection = {
        type: 'FeatureCollection',
        features: tile.features
      };

      fs.writeFileSync(tilePath, JSON.stringify(featureCollection));
    });

    console.log(`\nTiles written to ${tilesDir}/`);
  }

  /**
   * Display tileset info
   */
  static info(mbtilesPath: string): void {
    const tilesDir = mbtilesPath.replace('.mbtiles', '_tiles');

    if (!fs.existsSync(tilesDir)) {
      console.error(`Tileset not found: ${tilesDir}`);
      process.exit(1);
    }

    const metadataPath = path.join(tilesDir, 'metadata.json');
    const metadata: TilesetMetadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));

    console.log(`\n📦 Tileset Info\n`);
    console.log(`Name:        ${metadata.name}`);
    console.log(`Version:     ${metadata.version}`);
    console.log(`Format:      ${metadata.format}`);
    console.log(`Zoom:        ${metadata.minzoom} - ${metadata.maxzoom}`);
    console.log(`Bounds:      [${metadata.bounds.map(n => n.toFixed(4)).join(', ')}]`);
    console.log(`Center:      [${metadata.center.map(n => n.toFixed(4)).join(', ')}]`);

    if (metadata.attribution) {
      console.log(`Attribution: ${metadata.attribution}`);
    }

    // Count tiles
    let tileCount = 0;
    for (let z = metadata.minzoom; z <= metadata.maxzoom; z++) {
      const zoomDir = path.join(tilesDir, `${z}`);
      if (fs.existsSync(zoomDir)) {
        const xDirs = fs.readdirSync(zoomDir);
        xDirs.forEach(xDir => {
          const yFiles = fs.readdirSync(path.join(zoomDir, xDir));
          tileCount += yFiles.length;
        });
      }
    }

    console.log(`Tiles:       ${tileCount}\n`);
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'generate': {
      if (args.length < 3) {
        console.error('Usage: npx tsx tile_generator.ts generate <input.geojson> <output.mbtiles> [options]');
        console.error('\nOptions:');
        console.error('  --minzoom <z>         Minimum zoom level (default: 0)');
        console.error('  --maxzoom <z>         Maximum zoom level (default: 14)');
        console.error('  --name <name>         Tileset name');
        console.error('  --attribution <text>  Attribution text');
        process.exit(1);
      }

      const inputPath = args[1];
      const outputPath = args[2];

      // Parse options
      const options: TileGeneratorOptions = {
        minZoom: 0,
        maxZoom: 14
      };

      for (let i = 3; i < args.length; i += 2) {
        const flag = args[i];
        const value = args[i + 1];

        switch (flag) {
          case '--minzoom':
            options.minZoom = parseInt(value);
            break;
          case '--maxzoom':
            options.maxZoom = parseInt(value);
            break;
          case '--name':
            options.name = value;
            break;
          case '--attribution':
            options.attribution = value;
            break;
        }
      }

      const generator = new TileGenerator(options);
      generator.generate(inputPath, outputPath);
      break;
    }

    case 'info': {
      if (args.length < 2) {
        console.error('Usage: npx tsx tile_generator.ts info <tiles.mbtiles>');
        process.exit(1);
      }

      TileGenerator.info(args[1]);
      break;
    }

    default:
      console.error('Unknown command. Available commands:');
      console.error('  generate <input.geojson> <output.mbtiles> [options]');
      console.error('  info <tiles.mbtiles>');
      process.exit(1);
  }
}

export { TileGenerator, TileGeneratorOptions, TilesetMetadata };

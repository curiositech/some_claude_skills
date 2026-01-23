#!/usr/bin/env node
/**
 * Geospatial Data Processor
 *
 * Process drone imagery, GPS tracks, and GeoJSON files for analysis and visualization.
 *
 * Usage:
 *   npx tsx geospatial_processor.ts validate <file.geojson>
 *   npx tsx geospatial_processor.ts simplify <input.geojson> <output.geojson> <tolerance>
 *   npx tsx geospatial_processor.ts bbox <file.geojson>
 *   npx tsx geospatial_processor.ts analyze-drone <directory>
 *   npx tsx geospatial_processor.ts gps-stats <track.geojson>
 *
 * Examples:
 *   npx tsx geospatial_processor.ts validate survey-data.geojson
 *   npx tsx geospatial_processor.ts simplify detailed.geojson simple.geojson 0.001
 *   npx tsx geospatial_processor.ts bbox survey-area.geojson
 */

import * as fs from 'fs';
import * as path from 'path';

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

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    featureCount: number;
    geometryTypes: Record<string, number>;
    totalPoints: number;
    boundingBox: number[];
  };
}

interface GPSTrackStats {
  totalDistance: number;  // meters
  duration: number;  // seconds
  avgSpeed: number;  // m/s
  maxSpeed: number;  // m/s
  elevation: {
    min: number;
    max: number;
    gain: number;
    loss: number;
  };
  bounds: number[];  // [minLon, minLat, maxLon, maxLat]
}

class GeospatialProcessor {
  /**
   * Validate GeoJSON structure and geometry
   */
  validate(filePath: string): ValidationResult {
    const content = fs.readFileSync(filePath, 'utf-8');
    let geojson: GeoJSONFeatureCollection;

    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      geojson = JSON.parse(content);
    } catch (e) {
      return {
        valid: false,
        errors: ['Invalid JSON: ' + (e as Error).message],
        warnings: [],
        stats: { featureCount: 0, geometryTypes: {}, totalPoints: 0, boundingBox: [] }
      };
    }

    // Check structure
    if (geojson.type !== 'FeatureCollection') {
      errors.push('Root type must be "FeatureCollection"');
    }

    if (!Array.isArray(geojson.features)) {
      errors.push('Missing or invalid "features" array');
      return {
        valid: false,
        errors,
        warnings,
        stats: { featureCount: 0, geometryTypes: {}, totalPoints: 0, boundingBox: [] }
      };
    }

    // Validate features
    const geometryTypes: Record<string, number> = {};
    let totalPoints = 0;
    let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;

    geojson.features.forEach((feature, i) => {
      // Check feature structure
      if (!feature.type || feature.type !== 'Feature') {
        errors.push(`Feature ${i}: Missing or invalid "type"`);
      }

      if (!feature.geometry) {
        errors.push(`Feature ${i}: Missing "geometry"`);
        return;
      }

      const geomType = feature.geometry.type;
      geometryTypes[geomType] = (geometryTypes[geomType] || 0) + 1;

      // Validate coordinates
      const points = this.extractPoints(feature.geometry.coordinates);
      totalPoints += points.length;

      points.forEach((point, j) => {
        const [lon, lat] = point;

        // Validate coordinate ranges
        if (lon < -180 || lon > 180) {
          errors.push(`Feature ${i}, point ${j}: Longitude out of range: ${lon}`);
        }
        if (lat < -90 || lat > 90) {
          errors.push(`Feature ${i}, point ${j}: Latitude out of range: ${lat}`);
        }

        // Update bounding box
        minLon = Math.min(minLon, lon);
        minLat = Math.min(minLat, lat);
        maxLon = Math.max(maxLon, lon);
        maxLat = Math.max(maxLat, lat);
      });

      // Warn about large features
      if (points.length > 10000) {
        warnings.push(`Feature ${i}: Very large feature (${points.length} points). Consider simplifying.`);
      }
    });

    // Warn about file size
    const fileSizeKB = fs.statSync(filePath).size / 1024;
    if (fileSizeKB > 1000) {
      warnings.push(`File size is ${fileSizeKB.toFixed(0)}KB. Consider splitting or serving as tiles.`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stats: {
        featureCount: geojson.features.length,
        geometryTypes,
        totalPoints,
        boundingBox: [minLon, minLat, maxLon, maxLat]
      }
    };
  }

  /**
   * Simplify GeoJSON geometry using Douglas-Peucker algorithm
   */
  simplify(inputPath: string, outputPath: string, tolerance: number): void {
    const content = fs.readFileSync(inputPath, 'utf-8');
    const geojson: GeoJSONFeatureCollection = JSON.parse(content);

    let totalPointsBefore = 0;
    let totalPointsAfter = 0;

    geojson.features = geojson.features.map(feature => {
      const pointsBefore = this.countPoints(feature.geometry.coordinates);
      totalPointsBefore += pointsBefore;

      feature.geometry.coordinates = this.simplifyCoordinates(
        feature.geometry.coordinates,
        feature.geometry.type,
        tolerance
      );

      const pointsAfter = this.countPoints(feature.geometry.coordinates);
      totalPointsAfter += pointsAfter;

      return feature;
    });

    fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));

    console.log(`\n✅ Simplified GeoJSON`);
    console.log(`   Points before: ${totalPointsBefore}`);
    console.log(`   Points after:  ${totalPointsAfter}`);
    console.log(`   Reduction:     ${((1 - totalPointsAfter / totalPointsBefore) * 100).toFixed(1)}%\n`);
  }

  /**
   * Douglas-Peucker line simplification
   */
  private douglasPeucker(points: number[][], tolerance: number): number[][] {
    if (points.length <= 2) return points;

    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];

    let maxDistance = 0;
    let maxIndex = 0;

    for (let i = 1; i < points.length - 1; i++) {
      const distance = this.perpendicularDistance(points[i], firstPoint, lastPoint);
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    if (maxDistance > tolerance) {
      const left = this.douglasPeucker(points.slice(0, maxIndex + 1), tolerance);
      const right = this.douglasPeucker(points.slice(maxIndex), tolerance);
      return [...left.slice(0, -1), ...right];
    } else {
      return [firstPoint, lastPoint];
    }
  }

  /**
   * Calculate perpendicular distance from point to line
   */
  private perpendicularDistance(point: number[], lineStart: number[], lineEnd: number[]): number {
    const [px, py] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;

    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Simplify coordinates based on geometry type
   */
  private simplifyCoordinates(coords: any, geomType: string, tolerance: number): any {
    switch (geomType) {
      case 'LineString':
        return this.douglasPeucker(coords, tolerance);

      case 'Polygon':
        return coords.map((ring: number[][]) => this.douglasPeucker(ring, tolerance));

      case 'MultiLineString':
        return coords.map((line: number[][]) => this.douglasPeucker(line, tolerance));

      case 'MultiPolygon':
        return coords.map((polygon: number[][][]) =>
          polygon.map((ring: number[][]) => this.douglasPeucker(ring, tolerance))
        );

      default:
        return coords;  // Point, MultiPoint (no simplification)
    }
  }

  /**
   * Calculate bounding box
   */
  calculateBoundingBox(filePath: string): number[] {
    const validation = this.validate(filePath);
    return validation.stats.boundingBox;
  }

  /**
   * Analyze drone imagery directory
   */
  analyzeDroneDirectory(dirPath: string): void {
    const files = fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.geojson') || f.endsWith('.json'));

    console.log(`\n📂 Analyzing drone data directory: ${dirPath}\n`);
    console.log(`Found ${files.length} GeoJSON files:\n`);

    let totalFeatures = 0;
    let totalImages = 0;

    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      const content = fs.readFileSync(fullPath, 'utf-8');
      const geojson: GeoJSONFeatureCollection = JSON.parse(content);

      const images = geojson.features.filter(f =>
        f.properties && (f.properties.image_url || f.properties.thumbnail)
      );

      totalFeatures += geojson.features.length;
      totalImages += images.length;

      console.log(`  ${file}`);
      console.log(`    Features: ${geojson.features.length}`);
      console.log(`    Images:   ${images.length}`);

      if (images.length > 0) {
        const bounds = this.calculateBounds(geojson.features);
        console.log(`    Bounds:   [${bounds.map(n => n.toFixed(4)).join(', ')}]`);
      }
      console.log('');
    });

    console.log(`\n📊 Summary:`);
    console.log(`  Total features: ${totalFeatures}`);
    console.log(`  Total images:   ${totalImages}\n`);
  }

  /**
   * Analyze GPS track statistics
   */
  analyzeGPSTrack(filePath: string): GPSTrackStats {
    const content = fs.readFileSync(filePath, 'utf-8');
    const geojson: GeoJSONFeatureCollection = JSON.parse(content);

    // Assume LineString geometry with coordinates as [lon, lat, elevation?, timestamp?]
    const track = geojson.features.find(f => f.geometry.type === 'LineString');

    if (!track) {
      throw new Error('No LineString feature found in GPS track');
    }

    const coords = track.geometry.coordinates;

    let totalDistance = 0;
    let elevationGain = 0;
    let elevationLoss = 0;
    let minElevation = Infinity;
    let maxElevation = -Infinity;
    let maxSpeed = 0;

    const speeds: number[] = [];

    for (let i = 1; i < coords.length; i++) {
      const [lon1, lat1, elev1, time1] = coords[i - 1];
      const [lon2, lat2, elev2, time2] = coords[i];

      // Calculate distance
      const distance = this.haversineDistance(lat1, lon1, lat2, lon2);
      totalDistance += distance;

      // Calculate speed (if timestamps available)
      if (time1 && time2) {
        const timeDelta = time2 - time1;  // seconds
        const speed = distance / timeDelta;  // m/s
        speeds.push(speed);
        maxSpeed = Math.max(maxSpeed, speed);
      }

      // Elevation stats
      if (elev1 !== undefined && elev2 !== undefined) {
        minElevation = Math.min(minElevation, elev1, elev2);
        maxElevation = Math.max(maxElevation, elev1, elev2);

        const elevChange = elev2 - elev1;
        if (elevChange > 0) {
          elevationGain += elevChange;
        } else {
          elevationLoss += Math.abs(elevChange);
        }
      }
    }

    const avgSpeed = speeds.length > 0
      ? speeds.reduce((sum, s) => sum + s, 0) / speeds.length
      : 0;

    const duration = coords.length > 0 && coords[0][3] && coords[coords.length - 1][3]
      ? coords[coords.length - 1][3] - coords[0][3]
      : 0;

    const bounds = this.calculateBounds([track]);

    return {
      totalDistance,
      duration,
      avgSpeed,
      maxSpeed,
      elevation: {
        min: minElevation,
        max: maxElevation,
        gain: elevationGain,
        loss: elevationLoss
      },
      bounds
    };
  }

  /**
   * Haversine distance in meters
   */
  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth radius in meters

    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  /**
   * Calculate bounds for features
   */
  private calculateBounds(features: GeoJSONFeature[]): number[] {
    let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;

    features.forEach(feature => {
      const points = this.extractPoints(feature.geometry.coordinates);
      points.forEach(([lon, lat]) => {
        minLon = Math.min(minLon, lon);
        minLat = Math.min(minLat, lat);
        maxLon = Math.max(maxLon, lon);
        maxLat = Math.max(maxLat, lat);
      });
    });

    return [minLon, minLat, maxLon, maxLat];
  }

  /**
   * Extract all points from coordinates (recursive)
   */
  private extractPoints(coords: any): number[][] {
    if (typeof coords[0] === 'number') {
      return [coords];  // Single point
    }

    return coords.flatMap((c: any) => this.extractPoints(c));
  }

  /**
   * Count points in coordinates
   */
  private countPoints(coords: any): number {
    if (typeof coords[0] === 'number') {
      return 1;
    }

    return coords.reduce((sum: number, c: any) => sum + this.countPoints(c), 0);
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const processor = new GeospatialProcessor();

  switch (command) {
    case 'validate': {
      if (args.length < 2) {
        console.error('Usage: npx tsx geospatial_processor.ts validate <file.geojson>');
        process.exit(1);
      }

      const result = processor.validate(args[1]);

      console.log(`\n📍 GeoJSON Validation: ${args[1]}\n`);

      if (result.valid) {
        console.log('✅ Valid GeoJSON\n');
      } else {
        console.log('❌ Invalid GeoJSON\n');
        console.log('Errors:');
        result.errors.forEach(err => console.log(`  • ${err}`));
        console.log('');
      }

      if (result.warnings.length > 0) {
        console.log('⚠️  Warnings:');
        result.warnings.forEach(warn => console.log(`  • ${warn}`));
        console.log('');
      }

      console.log('📊 Statistics:');
      console.log(`  Features:       ${result.stats.featureCount}`);
      console.log(`  Total points:   ${result.stats.totalPoints}`);
      console.log(`  Geometry types: ${JSON.stringify(result.stats.geometryTypes)}`);
      console.log(`  Bounding box:   [${result.stats.boundingBox.map(n => n.toFixed(4)).join(', ')}]\n`);

      process.exit(result.valid ? 0 : 1);
    }

    case 'simplify': {
      if (args.length < 4) {
        console.error('Usage: npx tsx geospatial_processor.ts simplify <input.geojson> <output.geojson> <tolerance>');
        process.exit(1);
      }

      processor.simplify(args[1], args[2], parseFloat(args[3]));
      break;
    }

    case 'bbox': {
      if (args.length < 2) {
        console.error('Usage: npx tsx geospatial_processor.ts bbox <file.geojson>');
        process.exit(1);
      }

      const bbox = processor.calculateBoundingBox(args[1]);
      console.log(`\nBounding Box: [${bbox.map(n => n.toFixed(6)).join(', ')}]\n`);
      break;
    }

    case 'analyze-drone': {
      if (args.length < 2) {
        console.error('Usage: npx tsx geospatial_processor.ts analyze-drone <directory>');
        process.exit(1);
      }

      processor.analyzeDroneDirectory(args[1]);
      break;
    }

    case 'gps-stats': {
      if (args.length < 2) {
        console.error('Usage: npx tsx geospatial_processor.ts gps-stats <track.geojson>');
        process.exit(1);
      }

      const stats = processor.analyzeGPSTrack(args[1]);

      console.log(`\n🚴 GPS Track Statistics\n`);
      console.log(`Distance:     ${(stats.totalDistance / 1000).toFixed(2)} km`);
      console.log(`Duration:     ${(stats.duration / 60).toFixed(0)} minutes`);
      console.log(`Avg Speed:    ${(stats.avgSpeed * 3.6).toFixed(1)} km/h`);
      console.log(`Max Speed:    ${(stats.maxSpeed * 3.6).toFixed(1)} km/h`);
      console.log(`Elevation:`);
      console.log(`  Min:        ${stats.elevation.min.toFixed(0)} m`);
      console.log(`  Max:        ${stats.elevation.max.toFixed(0)} m`);
      console.log(`  Gain:       ${stats.elevation.gain.toFixed(0)} m`);
      console.log(`  Loss:       ${stats.elevation.loss.toFixed(0)} m`);
      console.log(`Bounds:       [${stats.bounds.map(n => n.toFixed(4)).join(', ')}]\n`);
      break;
    }

    default:
      console.error('Unknown command. Available commands:');
      console.error('  validate <file.geojson>');
      console.error('  simplify <input.geojson> <output.geojson> <tolerance>');
      console.error('  bbox <file.geojson>');
      console.error('  analyze-drone <directory>');
      console.error('  gps-stats <track.geojson>');
      process.exit(1);
  }
}

export { GeospatialProcessor, ValidationResult, GPSTrackStats };

#!/usr/bin/env npx tsx
/**
 * Import and filter Trefle species data for landscaping use
 *
 * Filters for:
 * - US-distributed plants (states in distributions column)
 * - Species rank (not varieties/subspecies)
 * - Plants with useful landscaping data
 */

import { createReadStream } from 'fs';
import { mkdir, readFile } from 'fs/promises';
import { dirname } from 'path';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOCAL_CSV_PATH = `${__dirname}/species.csv`;
const TREFLE_CSV_URL = 'https://media.githubusercontent.com/media/treflehq/dump/master/species.csv';
const OUTPUT_PATH = `${__dirname}/../src/trefle-plants.ts`;

// US states and territories to filter by
const US_REGIONS = new Set([
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming',
  // Common abbreviations in the data
  'Masachusettes', 'Rhode I.', 'Prince Edward I.',
]);

// Growth habits relevant for landscaping
const LANDSCAPING_HABITS = new Set([
  'Tree', 'Shrub', 'Subshrub', 'Forb/herb', 'Vine', 'Graminoid'
]);

interface TreflePlant {
  id: string;
  scientificName: string;
  commonName: string;
  family: string;
  familyCommonName: string;
  growthHabit: string;
  growthRate: string;
  averageHeightCm: number | null;
  maximumHeightCm: number | null;
  minRootDepthCm: number | null;
  phMin: number | null;
  phMax: number | null;
  lightRequirement: number | null; // 1-10 scale
  soilNutriments: number | null;
  droughtTolerance: string;
  shadeTolerance: string;
  flowerColor: string;
  foliageColor: string;
  bloomMonths: string;
  edible: boolean;
  distributions: string[];
  nativeToUS: boolean;
  imageUrl: string;
}

function parseNumber(val: string): number | null {
  if (!val || val === '') return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
}

function hasUSDistribution(distributions: string): boolean {
  if (!distributions) return false;
  return distributions.split(',').some(d => US_REGIONS.has(d.trim()));
}

function getUSDistributions(distributions: string): string[] {
  if (!distributions) return [];
  return distributions.split(',')
    .map(d => d.trim())
    .filter(d => US_REGIONS.has(d));
}

function isLandscapingRelevant(habit: string): boolean {
  if (!habit) return false;
  // Handle comma-separated habits like "Shrub, Forb/herb"
  return habit.split(',').some(h => LANDSCAPING_HABITS.has(h.trim()));
}

async function parseLocalCSV(): Promise<TreflePlant[]> {
  console.log(`Reading local CSV: ${LOCAL_CSV_PATH}`);

  const plants: TreflePlant[] = [];
  let headers: string[] = [];
  let lineCount = 0;
  let skippedNoUS = 0;
  let skippedNoHabit = 0;
  let skippedNoName = 0;
  let skippedVariety = 0;
  let skippedMalformed = 0;

  const rl = createInterface({
    input: createReadStream(LOCAL_CSV_PATH),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    lineCount++;

    // Skip empty or truncated lines
    if (!line || line.length < 10) {
      skippedMalformed++;
      continue;
    }

    if (lineCount === 1) {
      headers = line.split('\t');
      continue;
    }

    const values = line.split('\t');

    // Skip malformed lines (too few columns)
    if (values.length < headers.length / 2) {
      skippedMalformed++;
      continue;
    }

    const row: Record<string, string> = {};
    headers.forEach((h, i) => row[h] = values[i] || '');

    // Filter: species rank only
    if (row.rank !== 'species') {
      skippedVariety++;
      continue;
    }

    // Filter: must have common name
    if (!row.common_name) {
      skippedNoName++;
      continue;
    }

    // Filter: US distribution
    if (!hasUSDistribution(row.distributions)) {
      skippedNoUS++;
      continue;
    }

    // Filter: landscaping-relevant growth habit
    if (!isLandscapingRelevant(row.growth_habit)) {
      skippedNoHabit++;
      continue;
    }

    plants.push({
      id: row.id,
      scientificName: row.scientific_name,
      commonName: row.common_name.split(',')[0].trim(), // Take first common name
      family: row.family,
      familyCommonName: row.family_common_name,
      growthHabit: row.growth_habit,
      growthRate: row.growth_rate,
      averageHeightCm: parseNumber(row.average_height_cm),
      maximumHeightCm: parseNumber(row.maximum_height_cm),
      minRootDepthCm: parseNumber(row.minimum_root_depth_cm),
      phMin: parseNumber(row.ph_minimum),
      phMax: parseNumber(row.ph_maximum),
      lightRequirement: parseNumber(row.light),
      soilNutriments: parseNumber(row.soil_nutriments),
      droughtTolerance: row.drought_tolerance || '',
      shadeTolerance: row.shade_tolerance || '',
      flowerColor: row.flower_color,
      foliageColor: row.foliage_color,
      bloomMonths: row.bloom_months,
      edible: row.edible === 'true',
      distributions: getUSDistributions(row.distributions),
      nativeToUS: getUSDistributions(row.distributions).length > 0,
      imageUrl: row.image_url,
    });

    if (lineCount % 50000 === 0) {
      console.log(`  Processed ${lineCount.toLocaleString()} lines, ${plants.length.toLocaleString()} plants kept...`);
    }
  }

  console.log(`\nStats:`);
  console.log(`  Total lines: ${lineCount.toLocaleString()}`);
  console.log(`  Skipped (malformed): ${skippedMalformed.toLocaleString()}`);
  console.log(`  Skipped (variety/subspecies): ${skippedVariety.toLocaleString()}`);
  console.log(`  Skipped (no common name): ${skippedNoName.toLocaleString()}`);
  console.log(`  Skipped (no US distribution): ${skippedNoUS.toLocaleString()}`);
  console.log(`  Skipped (not landscaping habit): ${skippedNoHabit.toLocaleString()}`);
  console.log(`  Kept: ${plants.length.toLocaleString()} plants`);

  return plants;
}

async function writeTypeScript(plants: TreflePlant[]): Promise<void> {
  console.log(`\nWriting ${plants.length.toLocaleString()} plants to ${OUTPUT_PATH}...`);

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });

  const content = `// Auto-generated from Trefle database
// Source: ${TREFLE_CSV_URL}
// Generated: ${new Date().toISOString()}
// Total plants: ${plants.length.toLocaleString()}

export interface TreflePlant {
  id: string;
  scientificName: string;
  commonName: string;
  family: string;
  familyCommonName: string;
  growthHabit: string;
  growthRate: string;
  averageHeightCm: number | null;
  maximumHeightCm: number | null;
  minRootDepthCm: number | null;
  phMin: number | null;
  phMax: number | null;
  lightRequirement: number | null;
  soilNutriments: number | null;
  droughtTolerance: string;
  shadeTolerance: string;
  flowerColor: string;
  foliageColor: string;
  bloomMonths: string;
  edible: boolean;
  distributions: string[];
  nativeToUS: boolean;
  imageUrl: string;
}

export const TREFLE_PLANTS: TreflePlant[] = ${JSON.stringify(plants, null, 2)};

// Index by common name (lowercase) for fast lookup
export const PLANTS_BY_NAME: Map<string, TreflePlant> = new Map(
  TREFLE_PLANTS.map(p => [p.commonName.toLowerCase(), p])
);

// Index by scientific name for precise lookup
export const PLANTS_BY_SCIENTIFIC: Map<string, TreflePlant> = new Map(
  TREFLE_PLANTS.map(p => [p.scientificName.toLowerCase(), p])
);

// Get plants by growth habit
export function getPlantsByHabit(habit: string): TreflePlant[] {
  return TREFLE_PLANTS.filter(p =>
    p.growthHabit.toLowerCase().includes(habit.toLowerCase())
  );
}

// Get plants native to a specific state
export function getPlantsNativeTo(state: string): TreflePlant[] {
  return TREFLE_PLANTS.filter(p =>
    p.distributions.some(d => d.toLowerCase() === state.toLowerCase())
  );
}

// Search plants by name (fuzzy)
export function searchPlants(query: string): TreflePlant[] {
  const q = query.toLowerCase();
  return TREFLE_PLANTS.filter(p =>
    p.commonName.toLowerCase().includes(q) ||
    p.scientificName.toLowerCase().includes(q)
  );
}
`;

  const fs = await import('fs/promises');
  await fs.writeFile(OUTPUT_PATH, content);

  const stats = await fs.stat(OUTPUT_PATH);
  console.log(`  File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
}

async function main() {
  try {
    const plants = await parseLocalCSV();
    await writeTypeScript(plants);
    console.log('\nDone!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();

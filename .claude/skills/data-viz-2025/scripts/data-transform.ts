/**
 * Data Transformation Utilities for Data Visualization
 *
 * Common transformations needed for chart data:
 * - Aggregation (sum, average, count)
 * - Grouping and pivoting
 * - Normalization and scaling
 * - Time series operations
 * - Statistical calculations
 *
 * Usage:
 *   import { groupBy, rollup, normalize } from './data-transform';
 */

export interface DataPoint {
  [key: string]: any;
}

/**
 * Group data by a key
 *
 * @example
 * const data = [
 *   { category: 'A', value: 10 },
 *   { category: 'A', value: 20 },
 *   { category: 'B', value: 30 }
 * ];
 * groupBy(data, 'category')
 * // { A: [...], B: [...] }
 */
export function groupBy<T extends DataPoint>(
  data: T[],
  key: keyof T
): Record<string, T[]> {
  return data.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

/**
 * Aggregate grouped data
 *
 * @example
 * const data = [
 *   { category: 'A', value: 10 },
 *   { category: 'A', value: 20 },
 *   { category: 'B', value: 30 }
 * ];
 * rollup(data, 'category', 'value', 'sum')
 * // [{ category: 'A', value: 30 }, { category: 'B', value: 30 }]
 */
export function rollup<T extends DataPoint>(
  data: T[],
  groupKey: keyof T,
  valueKey: keyof T,
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max'
): Array<{ [K in keyof T]: T[K] }> {
  const grouped = groupBy(data, groupKey);

  return Object.entries(grouped).map(([key, items]) => {
    let value: number;

    switch (aggregation) {
      case 'sum':
        value = items.reduce((sum, item) => sum + Number(item[valueKey]), 0);
        break;
      case 'avg':
        value =
          items.reduce((sum, item) => sum + Number(item[valueKey]), 0) /
          items.length;
        break;
      case 'count':
        value = items.length;
        break;
      case 'min':
        value = Math.min(...items.map(item => Number(item[valueKey])));
        break;
      case 'max':
        value = Math.max(...items.map(item => Number(item[valueKey])));
        break;
    }

    return {
      [groupKey]: key,
      [valueKey]: value
    } as { [K in keyof T]: T[K] };
  });
}

/**
 * Normalize values to 0-1 range
 *
 * @example
 * normalize([10, 20, 30, 40])
 * // [0, 0.333, 0.666, 1]
 */
export function normalize(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  if (range === 0) return values.map(() => 0);

  return values.map(v => (v - min) / range);
}

/**
 * Standardize values (z-score)
 *
 * @example
 * standardize([10, 20, 30, 40])
 * // [-1.161, -0.387, 0.387, 1.161]
 */
export function standardize(values: number[]): number[] {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return values.map(() => 0);

  return values.map(v => (v - mean) / stdDev);
}

/**
 * Calculate moving average
 *
 * @example
 * movingAverage([1, 2, 3, 4, 5], 3)
 * // [2, 3, 4] (averages of [1,2,3], [2,3,4], [3,4,5])
 */
export function movingAverage(values: number[], window: number): number[] {
  if (window > values.length) {
    throw new Error('Window size cannot exceed array length');
  }

  const result: number[] = [];

  for (let i = 0; i <= values.length - window; i++) {
    const slice = values.slice(i, i + window);
    const avg = slice.reduce((sum, v) => sum + v, 0) / window;
    result.push(avg);
  }

  return result;
}

/**
 * Calculate percentage change
 *
 * @example
 * percentageChange(100, 150)
 * // 50 (increased by 50%)
 */
export function percentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : Infinity;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

/**
 * Bin continuous data into discrete ranges
 *
 * @example
 * bin([1, 5, 10, 15, 20, 25], 3)
 * // [
 * //   { range: '1-9', count: 2, values: [1, 5] },
 * //   { range: '10-18', count: 2, values: [10, 15] },
 * //   { range: '19-27', count: 2, values: [20, 25] }
 * // ]
 */
export function bin(
  values: number[],
  numBins: number
): Array<{ range: string; count: number; values: number[] }> {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binSize = (max - min) / numBins;

  const bins: Array<{ range: string; count: number; values: number[] }> = [];

  for (let i = 0; i < numBins; i++) {
    const binMin = min + i * binSize;
    const binMax = min + (i + 1) * binSize;

    const binValues = values.filter(
      v => v >= binMin && (i === numBins - 1 ? v <= binMax : v < binMax)
    );

    bins.push({
      range: `${Math.round(binMin)}-${Math.round(binMax)}`,
      count: binValues.length,
      values: binValues
    });
  }

  return bins;
}

/**
 * Pivot data (rows to columns)
 *
 * @example
 * const data = [
 *   { date: '2024-01', category: 'A', value: 10 },
 *   { date: '2024-01', category: 'B', value: 20 },
 *   { date: '2024-02', category: 'A', value: 15 }
 * ];
 * pivot(data, 'date', 'category', 'value')
 * // [
 * //   { date: '2024-01', A: 10, B: 20 },
 * //   { date: '2024-02', A: 15, B: null }
 * // ]
 */
export function pivot<T extends DataPoint>(
  data: T[],
  rowKey: keyof T,
  colKey: keyof T,
  valueKey: keyof T
): DataPoint[] {
  const rows = new Map<string, DataPoint>();

  data.forEach(item => {
    const row = String(item[rowKey]);
    const col = String(item[colKey]);
    const value = item[valueKey];

    if (!rows.has(row)) {
      rows.set(row, { [rowKey]: row });
    }

    rows.get(row)![col] = value;
  });

  return Array.from(rows.values());
}

/**
 * Calculate cumulative sum
 *
 * @example
 * cumulativeSum([1, 2, 3, 4])
 * // [1, 3, 6, 10]
 */
export function cumulativeSum(values: number[]): number[] {
  let sum = 0;
  return values.map(v => {
    sum += v;
    return sum;
  });
}

/**
 * Sort data by multiple keys
 *
 * @example
 * const data = [
 *   { category: 'B', value: 20 },
 *   { category: 'A', value: 10 },
 *   { category: 'A', value: 30 }
 * ];
 * sortBy(data, ['category', 'asc'], ['value', 'desc'])
 * // [
 * //   { category: 'A', value: 30 },
 * //   { category: 'A', value: 10 },
 * //   { category: 'B', value: 20 }
 * // ]
 */
export function sortBy<T extends DataPoint>(
  data: T[],
  ...sortKeys: Array<[keyof T, 'asc' | 'desc']>
): T[] {
  return [...data].sort((a, b) => {
    for (const [key, direction] of sortKeys) {
      const aVal = a[key];
      const bVal = b[key];

      let comparison = 0;

      if (aVal < bVal) comparison = -1;
      if (aVal > bVal) comparison = 1;

      if (comparison !== 0) {
        return direction === 'asc' ? comparison : -comparison;
      }
    }

    return 0;
  });
}

/**
 * Fill missing dates in time series
 *
 * @example
 * const data = [
 *   { date: new Date('2024-01-01'), value: 10 },
 *   { date: new Date('2024-01-03'), value: 30 }
 * ];
 * fillMissingDates(data, 'day', 0)
 * // [
 * //   { date: new Date('2024-01-01'), value: 10 },
 * //   { date: new Date('2024-01-02'), value: 0 },
 * //   { date: new Date('2024-01-03'), value: 30 }
 * // ]
 */
export function fillMissingDates<T extends { date: Date; value: number }>(
  data: T[],
  interval: 'day' | 'week' | 'month',
  fillValue: number = 0
): T[] {
  if (data.length === 0) return [];

  const sorted = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
  const start = sorted[0].date;
  const end = sorted[sorted.length - 1].date;

  const result: T[] = [];
  const existingDates = new Set(sorted.map(d => d.date.toISOString()));

  let current = new Date(start);

  while (current <= end) {
    const dateStr = current.toISOString();

    if (existingDates.has(dateStr)) {
      result.push(sorted.find(d => d.date.toISOString() === dateStr)!);
    } else {
      result.push({
        date: new Date(current),
        value: fillValue
      } as T);
    }

    // Increment date based on interval
    switch (interval) {
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }

  return result;
}

/**
 * Calculate trend (linear regression slope)
 *
 * @example
 * calculateTrend([10, 20, 30, 40])
 * // 10 (increasing by 10 per period)
 */
export function calculateTrend(values: number[]): number {
  const n = values.length;
  const xMean = (n - 1) / 2; // 0, 1, 2, ... n-1
  const yMean = values.reduce((sum, v) => sum + v, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (values[i] - yMean);
    denominator += Math.pow(i - xMean, 2);
  }

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Detect outliers using IQR method
 *
 * @example
 * detectOutliers([1, 2, 3, 4, 5, 100])
 * // [100]
 */
export function detectOutliers(values: number[]): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);

  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return values.filter(v => v < lowerBound || v > upperBound);
}

/**
 * Sample data (for performance with large datasets)
 *
 * @example
 * sample(largeDataset, 100, 'random')
 * // Returns 100 random points
 */
export function sample<T>(
  data: T[],
  size: number,
  method: 'random' | 'systematic' = 'random'
): T[] {
  if (size >= data.length) return data;

  if (method === 'random') {
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, size);
  }

  // Systematic sampling (evenly spaced)
  const step = Math.floor(data.length / size);
  return data.filter((_, i) => i % step === 0).slice(0, size);
}

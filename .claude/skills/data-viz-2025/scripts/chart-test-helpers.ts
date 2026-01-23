/**
 * Chart Testing Utilities
 *
 * Helper functions for testing data visualizations:
 * - Scale accuracy verification
 * - Data-visual correspondence checks
 * - Accessibility testing helpers
 * - Performance benchmarking
 *
 * Usage:
 *   import { verifyScaleAccuracy, checkContrast } from './chart-test-helpers';
 */

export interface ChartElement {
  getAttribute(name: string): string | null;
  getBoundingClientRect(): DOMRect;
  style: CSSStyleDeclaration;
}

/**
 * Verify that visual heights are proportional to data values
 *
 * @example
 * const bars = screen.getAllByTestId('bar');
 * const data = [10, 20, 30];
 * verifyScaleAccuracy(bars, data, 'height')
 * // Returns true if heights are proportional
 */
export function verifyScaleAccuracy(
  elements: ChartElement[],
  dataValues: number[],
  dimension: 'height' | 'width' | 'r' // r for circles
): boolean {
  if (elements.length !== dataValues.length) {
    throw new Error('Number of elements must match number of data values');
  }

  if (elements.length < 2) {
    return true; // Can't verify proportions with < 2 elements
  }

  const visualValues = elements.map(el => {
    const value = el.getAttribute(dimension);
    return value ? parseFloat(value) : 0;
  });

  // Check if ratios between consecutive elements match data ratios
  for (let i = 1; i < elements.length; i++) {
    const dataRatio = dataValues[i] / dataValues[i - 1];
    const visualRatio = visualValues[i] / visualValues[i - 1];

    // Allow 5% tolerance for rounding errors
    const tolerance = 0.05;
    const diff = Math.abs(dataRatio - visualRatio);

    if (diff > tolerance * dataRatio) {
      console.error(
        `Scale mismatch at index ${i}: data ratio ${dataRatio}, visual ratio ${visualRatio}`
      );
      return false;
    }
  }

  return true;
}

/**
 * Verify bar chart Y-axis starts at zero
 *
 * @example
 * verifyBarChartBaselineAtZero(bars, chartHeight)
 */
export function verifyBarChartBaselineAtZero(
  bars: ChartElement[],
  chartHeight: number
): boolean {
  // All bars should have y + height = chartHeight (bottom of chart)
  return bars.every(bar => {
    const y = parseFloat(bar.getAttribute('y') || '0');
    const height = parseFloat(bar.getAttribute('height') || '0');
    const bottom = y + height;

    // Allow 1px tolerance for rounding
    return Math.abs(bottom - chartHeight) <= 1;
  });
}

/**
 * Check color contrast ratio (WCAG AA)
 *
 * @example
 * const bar = screen.getByTestId('bar');
 * const backgroundColor = '#ffffff';
 * checkContrast(bar, backgroundColor)
 * // Returns true if contrast ≥ 3:1
 */
export function checkContrast(
  element: ChartElement,
  backgroundColor: string
): boolean {
  const foregroundColor = element.style.fill || element.style.color;

  if (!foregroundColor) {
    console.warn('No foreground color found on element');
    return false;
  }

  const ratio = calculateContrastRatio(foregroundColor, backgroundColor);

  // WCAG AA requires 3:1 for large text/graphics
  return ratio >= 3;
}

/**
 * Calculate contrast ratio between two colors
 *
 * @example
 * calculateContrastRatio('#000000', '#ffffff')
 * // 21 (maximum contrast)
 */
export function calculateContrastRatio(
  color1: string,
  color2: string
): number {
  const luminance1 = getRelativeLuminance(color1);
  const luminance2 = getRelativeLuminance(color2);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Get relative luminance of a color (WCAG formula)
 */
function getRelativeLuminance(color: string): number {
  // Convert color to RGB
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  // Convert to sRGB
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  // Apply gamma correction
  const r =
    rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g =
    gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b =
    bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate luminance
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

/**
 * Benchmark chart rendering performance
 *
 * @example
 * const time = benchmarkRender(() => render(<BarChart data={largeDataset} />))
 * expect(time).toBeLessThan(500) // < 500ms
 */
export function benchmarkRender(renderFn: () => void): number {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
}

/**
 * Verify all data points are rendered
 *
 * @example
 * verifyDataPointCount(screen.getAllByTestId('bar'), mockData)
 */
export function verifyDataPointCount(
  elements: ChartElement[],
  data: any[]
): boolean {
  return elements.length === data.length;
}

/**
 * Verify labels match data
 *
 * @example
 * const labels = screen.getAllByTestId('axis-label');
 * verifyLabels(labels, ['Jan', 'Feb', 'Mar'])
 */
export function verifyLabels(
  labelElements: Array<{ textContent: string | null }>,
  expectedLabels: string[]
): boolean {
  if (labelElements.length !== expectedLabels.length) {
    console.error(
      `Label count mismatch: ${labelElements.length} vs ${expectedLabels.length}`
    );
    return false;
  }

  return labelElements.every((el, i) => {
    const actual = el.textContent?.trim();
    const expected = expectedLabels[i];

    if (actual !== expected) {
      console.error(`Label mismatch at index ${i}: "${actual}" vs "${expected}"`);
      return false;
    }

    return true;
  });
}

/**
 * Check if tooltip appears on hover
 *
 * @example
 * await verifyTooltipBehavior(
 *   screen.getByTestId('bar'),
 *   () => screen.queryByRole('tooltip')
 * )
 */
export async function verifyTooltipBehavior(
  element: HTMLElement,
  getTooltip: () => HTMLElement | null,
  userEvent: any // @testing-library/user-event
): Promise<boolean> {
  // Initially, no tooltip
  if (getTooltip()) {
    console.error('Tooltip is visible before hover');
    return false;
  }

  // Hover - tooltip appears
  await userEvent.hover(element);

  await new Promise(resolve => setTimeout(resolve, 100)); // Wait for animation

  if (!getTooltip()) {
    console.error('Tooltip did not appear on hover');
    return false;
  }

  // Unhover - tooltip disappears
  await userEvent.unhover(element);

  await new Promise(resolve => setTimeout(resolve, 100));

  if (getTooltip()) {
    console.error('Tooltip did not disappear on unhover');
    return false;
  }

  return true;
}

/**
 * Verify chart is responsive
 *
 * @example
 * verifyResponsive(chartContainer, [375, 768, 1024])
 */
export function verifyResponsive(
  container: HTMLElement,
  breakpoints: number[]
): boolean {
  const originalWidth = container.offsetWidth;

  return breakpoints.every(width => {
    // Resize container
    container.style.width = `${width}px`;

    // Force reflow
    container.offsetHeight; // eslint-disable-line no-unused-expressions

    // Check if chart adapted
    const svg = container.querySelector('svg');
    if (!svg) return false;

    const svgWidth = svg.getBoundingClientRect().width;

    // SVG should fill container (with some tolerance)
    const widthMatches = Math.abs(svgWidth - width) < 5;

    if (!widthMatches) {
      console.error(
        `Chart did not resize properly at ${width}px: SVG is ${svgWidth}px`
      );
    }

    return widthMatches;
  });

  // Restore original width
  container.style.width = `${originalWidth}px`;
}

/**
 * Verify chart handles empty data gracefully
 *
 * @example
 * verifyEmptyState(() => render(<Chart data={[]} />))
 */
export function verifyEmptyState(
  renderFn: () => { container: HTMLElement }
): boolean {
  const { container } = renderFn();

  // Should show empty state message
  const emptyMessage = container.querySelector('[data-testid="empty-state"]');
  if (!emptyMessage) {
    console.error('No empty state message found');
    return false;
  }

  // Should not show chart elements
  const chartElements = container.querySelectorAll('[data-testid*="bar"]');
  if (chartElements.length > 0) {
    console.error('Chart elements rendered with empty data');
    return false;
  }

  return true;
}

/**
 * Measure memory usage before and after render
 *
 * @example
 * const leak = detectMemoryLeak(() => {
 *   const { unmount } = render(<Chart data={data} />);
 *   unmount();
 * })
 */
export function detectMemoryLeak(
  renderAndUnmountFn: () => void,
  iterations: number = 100
): boolean {
  if (!performance.memory) {
    console.warn('performance.memory not available in this environment');
    return true;
  }

  const initialMemory = (performance as any).memory.usedJSHeapSize;

  // Run render/unmount cycle multiple times
  for (let i = 0; i < iterations; i++) {
    renderAndUnmountFn();
  }

  // Force garbage collection if available (only in tests with --expose-gc)
  if (global.gc) {
    global.gc();
  }

  const finalMemory = (performance as any).memory.usedJSHeapSize;
  const memoryIncrease = finalMemory - initialMemory;

  // Allow 10MB increase (some memory growth is normal)
  const threshold = 10 * 1024 * 1024;

  if (memoryIncrease > threshold) {
    console.error(
      `Potential memory leak: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB increase`
    );
    return false;
  }

  return true;
}

/**
 * Generate snapshot-friendly chart data
 * (Removes timestamps, random values, etc.)
 *
 * @example
 * expect(sanitizeForSnapshot(chartData)).toMatchSnapshot()
 */
export function sanitizeForSnapshot(data: any): any {
  if (Array.isArray(data)) {
    return data.map(sanitizeForSnapshot);
  }

  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};

    for (const [key, value] of Object.entries(data)) {
      // Remove timestamps
      if (key.includes('timestamp') || key.includes('time')) {
        sanitized[key] = '[TIMESTAMP]';
      }
      // Remove IDs
      else if (key === 'id' || key.endsWith('Id')) {
        sanitized[key] = '[ID]';
      }
      // Recursively sanitize nested objects
      else {
        sanitized[key] = sanitizeForSnapshot(value);
      }
    }

    return sanitized;
  }

  return data;
}

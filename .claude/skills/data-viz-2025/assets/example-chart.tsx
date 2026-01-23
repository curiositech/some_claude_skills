/**
 * Example: Production-Ready Animated Bar Chart
 *
 * This component demonstrates 2025 data viz best practices:
 * - Tufte principles (high data-ink ratio)
 * - Smooth animations with spring physics
 * - Accessibility (keyboard nav, screen reader support)
 * - Responsive design
 * - Loading states (skeleton, not spinner)
 * - Error handling
 * - TypeScript types
 *
 * Stack: Recharts + Framer Motion + Tailwind CSS
 */

import { motion, useReducedMotion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DataPoint {
  category: string;
  value: number;
  insight?: string;
}

interface AnimatedBarChartProps {
  data: DataPoint[];
  title?: string;
  description?: string;
  highlightCategory?: string;
  isLoading?: boolean;
  error?: Error;
}

export function AnimatedBarChart({
  data,
  title = 'Data Visualization',
  description,
  highlightCategory,
  isLoading = false,
  error
}: AnimatedBarChartProps) {
  const shouldReduceMotion = useReducedMotion();

  // Loading State: Skeleton loader
  if (isLoading) {
    return <ChartSkeleton />;
  }

  // Error State
  if (error) {
    return (
      <div
        className="rounded-lg border border-red-200 bg-red-50 p-6"
        role="alert"
      >
        <h3 className="font-semibold text-red-900">Error loading chart</h3>
        <p className="text-sm text-red-700">{error.message}</p>
      </div>
    );
  }

  // Empty State
  if (!data || data.length === 0) {
    return (
      <div
        className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center"
        data-testid="empty-state"
      >
        <p className="text-gray-600">No data to display</p>
      </div>
    );
  }

  return (
    <figure
      role="img"
      aria-labelledby="chart-title"
      aria-describedby="chart-desc"
      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
    >
      {/* Entrance animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: shouldReduceMotion ? undefined : 'spring',
          duration: shouldReduceMotion ? 0 : 0.5,
          stiffness: 300,
          damping: 30
        }}
      >
        {/* Title & Description */}
        <div className="mb-6">
          <h2 id="chart-title" className="text-2xl font-semibold text-gray-900">
            {title}
          </h2>
          {description && (
            <p id="chart-desc" className="mt-2 text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            {/* Minimal gridlines (Tufte principle) */}
            <XAxis
              dataKey="category"
              stroke="#d1d5db"
              strokeWidth={1}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
            />
            <YAxis
              stroke="#d1d5db"
              strokeWidth={1}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />

            {/* Tooltip with insight */}
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />

            {/* Bars with conditional highlighting */}
            <Bar
              dataKey="value"
              fill={(entry: DataPoint) =>
                entry.category === highlightCategory
                  ? '#d97706' // Ember orange for highlight
                  : '#9ca3af' // Gray for others
              }
              radius={[4, 4, 0, 0]}
              data-testid="bar"
              animationDuration={shouldReduceMotion ? 0 : 800}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Provide data table alternative for screen readers */}
        <details className="mt-6">
          <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
            View data table
          </summary>
          <table className="mt-4 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2 text-left font-semibold">Category</th>
                <th className="py-2 text-right font-semibold">Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.category} className="border-b border-gray-100">
                  <td className="py-2">{row.category}</td>
                  <td className="py-2 text-right">
                    {row.value.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      </motion.div>
    </figure>
  );
}

/**
 * Custom Tooltip with Insight
 */
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const data: DataPoint = payload[0].payload;

  return (
    <motion.div
      className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
    >
      <p className="font-semibold text-gray-900">{data.category}</p>
      <p className="text-2xl font-bold text-ember-600">
        {data.value.toLocaleString()}
      </p>
      {data.insight && (
        <p className="mt-1 text-xs text-gray-600">{data.insight}</p>
      )}
    </motion.div>
  );
}

/**
 * Skeleton Loader (Tufte-approved: shows structure, not spinner)
 */
function ChartSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Title skeleton */}
      <div className="mb-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-100" />
      </div>

      {/* Chart skeleton */}
      <div className="flex h-[400px] items-end justify-around gap-4">
        {[60, 80, 45, 90, 70, 55].map((height, i) => (
          <motion.div
            key={i}
            className="w-full rounded-t bg-gray-200"
            style={{ height: `${height}%` }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1
            }}
          />
        ))}
      </div>

      {/* Axis labels skeleton */}
      <div className="mt-4 flex justify-around">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-3 w-12 animate-pulse rounded bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

/**
 * Usage Example:
 *
 * const salesData = [
 *   { category: 'Mobile', value: 1200000, insight: '+68% YoY' },
 *   { category: 'Desktop', value: 800000, insight: '-12% YoY' },
 *   { category: 'Tablet', value: 400000, insight: 'Stable' }
 * ];
 *
 * <AnimatedBarChart
 *   data={salesData}
 *   title="Q4 Sales by Channel"
 *   description="Mobile now drives 60% of revenue"
 *   highlightCategory="Mobile"
 * />
 */

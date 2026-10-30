import React from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

interface ScatterPoint {
  x: number;
  y: number;
  category?: string;
}

interface ScatterChartWidgetProps {
  data: ScatterPoint[];
  xAxisLabel: string;
  yAxisLabel: string;
  categories?: string[];
  height?: number;
}

const CATEGORY_COLORS = [
  '#2563EB', // Blue
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
];

const CustomTooltip = ({ active, payload, xAxisLabel, yAxisLabel }: any) => {
  if (active && payload && payload.length > 0) {
    const pt = payload[0].payload as ScatterPoint;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-border p-2.5 rounded-xl shadow-lg text-xs space-y-1">
        {pt.category && (
          <div className="flex items-center gap-1.5 font-semibold text-text-main pb-1 border-b border-border/60">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: payload[0].color || '#2563EB' }}
            />
            <span>{pt.category}</span>
          </div>
        )}
        <div className="text-text-muted">
          <span className="font-medium text-text-main">{xAxisLabel}:</span> {typeof pt.x === 'number' ? pt.x.toLocaleString() : pt.x}
        </div>
        <div className="text-text-muted">
          <span className="font-medium text-text-main">{yAxisLabel}:</span> {typeof pt.y === 'number' ? pt.y.toLocaleString() : pt.y}
        </div>
      </div>
    );
  }
  return null;
};

export const ScatterChartWidget: React.FC<ScatterChartWidgetProps> = ({
  data,
  xAxisLabel,
  yAxisLabel,
  categories,
  height = 340
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] flex flex-col items-center justify-center text-xs text-text-muted border border-dashed border-border rounded-xl p-6 text-center bg-slate-50/50">
        <p className="font-medium text-text-main mb-1">No scatter plot relationship data available</p>
        <p className="text-[11px] text-text-muted max-w-sm">
          Please select two valid numeric fields with non-empty, finite data values.
        </p>
      </div>
    );
  }

  // Detect distinct categories if not provided
  const detectedCategories = categories && categories.length > 0
    ? categories
    : Array.from(new Set(data.filter(d => Boolean(d.category)).map(d => d.category as string)));

  const hasCategoryGrouping = detectedCategories.length > 0;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 12, right: 24, left: 10, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            type="number"
            dataKey="x"
            name={xAxisLabel}
            tick={{ fontSize: 11, fill: '#64748B' }}
            stroke="#CBD5E1"
            tickFormatter={(val) => (typeof val === 'number' && Math.abs(val) >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yAxisLabel}
            tick={{ fontSize: 11, fill: '#64748B' }}
            stroke="#CBD5E1"
            tickFormatter={(val) => (typeof val === 'number' && Math.abs(val) >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
          />
          <Tooltip content={<CustomTooltip xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel} />} />
          {hasCategoryGrouping && (
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
            />
          )}

          {hasCategoryGrouping ? (
            detectedCategories.map((cat, idx) => {
              const catData = data.filter(d => d.category === cat);
              const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
              return (
                <Scatter
                  key={cat}
                  name={cat}
                  data={catData}
                  fill={color}
                  opacity={0.75}
                />
              );
            })
          ) : (
            <Scatter
              name="Data Points"
              data={data}
              fill="#2563EB"
              opacity={0.7}
            />
          )}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

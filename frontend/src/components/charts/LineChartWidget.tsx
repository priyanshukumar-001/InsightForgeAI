import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface LineChartWidgetProps {
  data: { date: string; value: number }[];
  yAxisLabel?: string;
  height?: number;
  lineColor?: string;
}

export const LineChartWidget: React.FC<LineChartWidgetProps> = ({
  data,
  yAxisLabel,
  height = 280,
  lineColor = '#0284C7'
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-xs text-text-muted border border-dashed border-border rounded-xl">
        No time-series date points found in this dataset.
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#64748B' }}
            stroke="#CBD5E1"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748B' }}
            stroke="#CBD5E1"
            tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#DCE6F5',
              borderRadius: '10px',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
            }}
            formatter={(value: any) => [Number(value).toLocaleString(), yAxisLabel || 'Metric']}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2.5}
            dot={{ r: 4, fill: lineColor, strokeWidth: 2, stroke: '#FFFFFF' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

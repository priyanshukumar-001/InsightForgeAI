import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

interface BarChartWidgetProps {
  data: { name: string; value: number }[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
  barColor?: string;
}

export const BarChartWidget: React.FC<BarChartWidgetProps> = ({
  data,
  xAxisLabel,
  yAxisLabel,
  height = 280,
  barColor = '#2563EB'
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-xs text-text-muted border border-dashed border-border rounded-xl">
        No bar chart data available for this dimension.
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748B' }}
            interval={0}
            angle={-20}
            textAnchor="end"
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
            formatter={(value: any) => [Number(value).toLocaleString(), yAxisLabel || 'Value']}
          />
          <Bar dataKey="value" fill={barColor} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

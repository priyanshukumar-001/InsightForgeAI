import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

interface PieChartWidgetProps {
  data: { name: string; value: number }[];
  height?: number;
}

const COLORS = ['#2563EB', '#06B6D4', '#3B82F6', '#60A5FA', '#93C5FD', '#CBD5E1'];

export const PieChartWidget: React.FC<PieChartWidgetProps> = ({
  data,
  height = 280
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-xs text-text-muted border border-dashed border-border rounded-xl">
        No category proportions to display.
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#DCE6F5',
              borderRadius: '10px',
              fontSize: '12px'
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', color: '#64748B' }}
          />
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

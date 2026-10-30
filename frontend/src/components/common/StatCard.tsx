import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  color?: 'blue' | 'cyan' | 'emerald' | 'amber' | 'indigo';
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  color = 'blue'
}) => {
  const iconBgMap = {
    blue: 'bg-blue-50 text-primary border-blue-100',
    cyan: 'bg-cyan-50 text-cyan border-cyan-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100'
  };

  return (
    <div className="glass-card p-5 glass-card-hover flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-text-muted uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-text-main mt-1 tracking-tight">{value}</p>
        {(subtext || trend) && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs">
            {trend && (
              <span className={`font-semibold ${trend.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend.value}
              </span>
            )}
            {subtext && <span className="text-text-muted">{subtext}</span>}
          </div>
        )}
      </div>
      {icon && (
        <div className={`p-3 rounded-xl border ${iconBgMap[color]}`}>
          {icon}
        </div>
      )}
    </div>
  );
};

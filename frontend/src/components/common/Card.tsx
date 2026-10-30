import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  hoverable = false
}) => {
  return (
    <div className={`glass-card p-6 ${hoverable ? 'glass-card-hover' : ''} ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-semibold text-text-main">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

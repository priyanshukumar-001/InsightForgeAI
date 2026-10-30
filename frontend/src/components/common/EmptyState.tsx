import React from 'react';
import { Database } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-card bg-surface-soft/40">
      <div className="p-4 bg-white rounded-2xl shadow-sm border border-border text-primary mb-4">
        {icon || <Database className="w-8 h-8 text-primary" />}
      </div>
      <h3 className="text-base font-semibold text-text-main">{title}</h3>
      <p className="text-xs text-text-muted mt-1 max-w-md mb-6">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
};

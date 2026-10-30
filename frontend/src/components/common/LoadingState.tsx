import React from 'react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Processing analytics...',
  subtext = 'Running deterministic pandas calculation'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative mb-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-primary animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-cyan rounded-full animate-ping"></div>
        </div>
      </div>
      <p className="text-sm font-semibold text-text-main">{message}</p>
      {subtext && <p className="text-xs text-text-muted mt-1 max-w-sm">{subtext}</p>}
    </div>
  );
};

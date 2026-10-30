import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center text-white mb-6 shadow-md shadow-blue-500/20">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-5xl font-extrabold text-text-main font-mono mb-2">404</h1>
      <h2 className="text-lg font-bold text-slate-700 mb-2">Page Not Found</h2>
      <p className="text-xs text-text-muted max-w-sm mb-6">
        The requested resource or dataset route does not exist. Please check the URL or return to your dashboard.
      </p>
      <Link to="/app/dashboard">
        <Button size="sm" icon={<ArrowLeft className="w-3.5 h-3.5" />}>
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

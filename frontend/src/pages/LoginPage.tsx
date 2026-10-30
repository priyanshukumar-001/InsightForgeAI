import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, User } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('demo.analyst@insightforge.local');
  const [password, setPassword] = useState('••••••••••••');
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-6 selection:bg-primary selection:text-white">
      <div className="max-w-md w-full space-y-6">
        {/* Logo and Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-text-main">InsightForge AI</span>
          </Link>
          <p className="text-xs text-text-muted">Sign in to your analytical workspace</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-card-hover border-border">
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-text-main block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-border rounded-input px-3 py-2 text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="font-semibold text-text-main block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-border rounded-input px-3 py-2 text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <Button size="md" className="w-full mt-2" type="submit" icon={<ArrowRight className="w-4 h-4" />}>
              Sign In to Workspace
            </Button>
          </form>

          {/* 1-Click Demo Entry Notice */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-left text-xs mb-3">
              <span className="font-bold text-primary-dark flex items-center gap-1.5 mb-1">
                <ShieldCheck className="w-4 h-4 text-primary" /> Instant Demo Access Active
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                No credentials required for student evaluation. Click &quot;Enter Demo Mode&quot; below to launch directly.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => navigate('/app/dashboard')}
            >
              Enter Demo Mode Instantly
            </Button>
          </div>
        </Card>

        <p className="text-center text-xs text-text-muted">
          <Link to="/" className="hover:text-primary transition-colors">← Back to Landing Page</Link>
        </p>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UploadCloud,
  FileSpreadsheet,
  BarChart3,
  Sparkles,
  FileText,
  History,
  Settings,
  ChevronRight,
  Database,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Bot,
  Sliders
} from 'lucide-react';
import { api } from '../../services/apiClient';
import { DatasetItem } from '../../types';
import { Badge } from '../common/Badge';

export const AppShell: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>('');
  const [aiStatus, setAiStatus] = useState<{ activeProvider: string; isDemoMode: boolean } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch datasets and AI status on shell mount
    api.getDatasets().then(list => {
      setDatasets(list);
      // Auto-select first dataset if none selected or if URL matches
      const match = location.pathname.match(/\/app\/(?:datasets|analytics|assistant)\/([^/?]+)/);
      if (match && match[1]) {
        setSelectedDatasetId(match[1]);
      } else if (list.length > 0 && !selectedDatasetId) {
        setSelectedDatasetId(list[0].id);
      }
    }).catch(err => console.warn('Could not load datasets:', err.message));

    api.getAIProviders().then(status => {
      setAiStatus({ activeProvider: status.activeProvider, isDemoMode: status.isDemoMode });
    }).catch(() => {
      setAiStatus({ activeProvider: 'demo', isDemoMode: true });
    });
  }, [location.pathname]);

  const handleDatasetChange = (newId: string) => {
    setSelectedDatasetId(newId);
    // If currently on a dataset-dependent route, switch smoothly
    if (location.pathname.includes('/app/datasets/')) {
      navigate(`/app/datasets/${newId}`);
    } else if (location.pathname.includes('/app/analytics/')) {
      navigate(`/app/analytics/${newId}`);
    } else if (location.pathname.includes('/app/assistant/')) {
      navigate(`/app/assistant/${newId}`);
    } else if (location.pathname.includes('/app/cleaning/')) {
      navigate(`/app/cleaning/${newId}`);
    }
  };

  const currentDataset = datasets.find(d => d.id === selectedDatasetId) || datasets[0];
  const targetDatasetId = currentDataset?.id || 'sample-sales-01';

  const navLinks = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Upload Data', path: '/app/upload', icon: UploadCloud },
    { name: 'Dataset View', path: `/app/datasets/${targetDatasetId}`, icon: FileSpreadsheet, matchPrefix: '/app/datasets' },
    { name: 'Analytics', path: `/app/analytics/${targetDatasetId}`, icon: BarChart3, matchPrefix: '/app/analytics' },
    { name: 'AI Assistant', path: `/app/assistant/${targetDatasetId}`, icon: Sparkles, matchPrefix: '/app/assistant', highlight: true },
    { name: 'Data Cleaning', path: `/app/cleaning/${targetDatasetId}`, icon: Sliders, matchPrefix: '/app/cleaning' },
    { name: 'Reports', path: '/app/reports', icon: FileText },
    { name: 'History', path: '/app/history', icon: History },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-page overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border text-slate-300 select-none">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-xl brand-gradient flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight tracking-tight flex items-center gap-1.5">
              InsightForge <span className="text-cyan text-xs px-1.5 py-0.5 rounded bg-cyan/10 font-mono">AI</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Data Analytics Copilot</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.matchPrefix
              ? location.pathname.startsWith(link.matchPrefix)
              : location.pathname === link.path;

            return (
              <NavLink
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sidebar-active text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-sidebar-hover'
                } ${link.highlight && !isActive ? 'text-blue-300' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : link.highlight ? 'text-cyan' : 'text-slate-400'}`} />
                <span className="flex-1">{link.name}</span>
                {link.highlight && (
                  <span className="w-2 h-2 rounded-full bg-cyan animate-pulse"></span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* AI Provider Status Pill */}
        <div className="p-4 border-t border-sidebar-border bg-[#070e20]">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-cyan" /> Engine
            </span>
            {aiStatus?.isDemoMode ? (
              <Badge variant="warning" size="sm">Demo Mode</Badge>
            ) : (
              <Badge variant="success" size="sm">
                <span className="capitalize">{aiStatus?.activeProvider}</span>
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {aiStatus?.isDemoMode
              ? 'Grounded code calculations active without API key.'
              : `Connected to ${aiStatus?.activeProvider.toUpperCase()} API.`}
          </p>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-text-muted hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Active Dataset Selector Dropdown */}
            {datasets.length > 0 && (
              <div className="flex items-center gap-2 bg-surface-soft px-3 py-1.5 rounded-xl border border-blue-100">
                <Database className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs text-text-muted hidden sm:inline">Active Dataset:</span>
                <select
                  value={selectedDatasetId}
                  onChange={(e) => handleDatasetChange(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-primary-dark focus:outline-none cursor-pointer max-w-[200px] truncate"
                >
                  {datasets.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} {d.isSample ? '(Sample)' : ''}
                    </option>
                  ))}
                </select>
                {currentDataset?.isSample && (
                  <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded">
                    SAMPLE
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/"
              className="text-xs font-medium text-text-muted hover:text-primary transition-colors flex items-center gap-1"
            >
              Landing Page <ExternalLink className="w-3 h-3" />
            </NavLink>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-xs">
                A
              </div>
              <span className="text-xs font-medium text-text-main hidden sm:inline">Analyst (Demo)</span>
            </div>
          </div>
        </header>

        {/* Page Canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet context={{ currentDataset, datasets, refreshDatasets: () => api.getDatasets().then(setDatasets) }} />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <div className="w-64 bg-sidebar h-full p-4 flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4 border-b border-sidebar-border">
              <span className="text-white font-bold">InsightForge AI</span>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="mt-4 space-y-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-xs text-slate-300 rounded-lg hover:bg-sidebar-hover"
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

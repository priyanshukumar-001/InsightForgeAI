import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  History,
  Trash2,
  Bot,
  Sliders,
  FileText,
  Clock,
  ArrowRight,
  Database,
  FileSpreadsheet,
  UploadCloud
} from 'lucide-react';
import { api } from '../services/apiClient';
import { HistoryItem, DatasetItem } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingState } from '../components/common/LoadingState';

export const HistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'datasets' | 'analyses' | 'reports' | 'chats'>('datasets');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = () => {
    setIsLoading(true);
    Promise.all([api.getHistory(), api.getDatasets()])
      .then(([hist, dsList]) => {
        setHistory(hist);
        setDatasets(dsList);
      })
      .catch(err => console.error('Failed to load history:', err))
      .finally(() => setIsLoading(false));
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear your analytical history?')) return;
    try {
      await api.clearHistory();
      setHistory([]);
    } catch (err: any) {
      alert(`Clear failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header (Screen 8) */}
      <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-main tracking-tight">Usage History</h1>
          <p className="text-xs text-text-muted mt-1">
            Review past datasets, executed analyses, compiled reports, and AI chat sessions.
          </p>
        </div>

        <Link to="/app/upload">
          <Button size="sm" className="brand-gradient text-white shadow-sm" icon={<UploadCloud className="w-3.5 h-3.5" />}>
            Upload New Dataset
          </Button>
        </Link>
      </div>

      {/* Tabs (Matching Montage Screen 8) */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto text-xs font-semibold">
        {[
          { key: 'datasets', label: 'Datasets' },
          { key: 'analyses', label: 'Analyses' },
          { key: 'reports', label: 'Reports' },
          { key: 'chats', label: 'Chats' }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`px-3.5 py-2 rounded-t-lg transition-colors border-b-2 font-medium ${
              activeTab === t.key
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-text-muted hover:text-text-main'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'datasets' && (
        <Card title="Stored Datasets" subtitle="Active uploaded benchmarks and sample files">
          {isLoading ? (
            <LoadingState message="Retrieving datasets..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-text-muted uppercase text-[11px] tracking-wider">
                    <th className="py-2.5 px-3 font-semibold">Name</th>
                    <th className="py-2.5 px-3 font-semibold">Rows</th>
                    <th className="py-2.5 px-3 font-semibold">Columns</th>
                    <th className="py-2.5 px-3 font-semibold">Health</th>
                    <th className="py-2.5 px-3 font-semibold">Last Opened</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {datasets.map((ds) => {
                    const score = ds.profile?.healthScore || 85;
                    return (
                      <tr key={ds.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-primary shrink-0" />
                            <span className="truncate max-w-[280px] text-text-main font-semibold">
                              {ds.name}
                            </span>
                            {ds.isSample && <Badge variant="neutral" size="sm">Sample</Badge>}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-text-main font-mono">
                          {(ds.profile?.rowCount || 0).toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-text-main font-mono">
                          {ds.profile?.columnCount || 0}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            score >= 80 ? 'bg-emerald-50 text-emerald-700' : (score >= 60 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700')
                          }`}>
                            {score}/100
                          </span>
                        </td>
                        <td className="py-3 px-3 text-text-muted">
                          {new Date(ds.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => navigate(`/app/datasets/${ds.id}`)}
                          >
                            Open
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab !== 'datasets' && (
        <Card title="Activity Timeline" subtitle="Stored locally with atomic persistence">
          {isLoading ? (
            <LoadingState message="Retrieving activity timeline..." />
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-xs text-text-muted">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-text-main">No recent activity recorded.</p>
              <p className="mt-1">Ask questions in the AI Assistant or clean a dataset to see records here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history
                .filter(item => {
                  if (activeTab === 'chats') return item.type === 'ai_query';
                  if (activeTab === 'reports') return item.type === 'report';
                  return true;
                })
                .map(item => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-border bg-slate-50/50 hover:bg-white hover:shadow-card transition-all flex items-start justify-between gap-4 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl brand-gradient text-white flex items-center justify-center shrink-0">
                        {item.type === 'ai_query' ? <Bot className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-text-main">{item.datasetName}</span>
                          <Badge variant="neutral" size="sm">{item.type}</Badge>
                        </div>
                        <p className="text-text-muted">{item.question || item.title || item.answer}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-text-muted shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

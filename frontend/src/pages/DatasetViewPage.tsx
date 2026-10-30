import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Download,
  Sparkles,
  BarChart3,
  Bot,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Layers,
  Search,
  Check,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/apiClient';
import { DatasetItem, DatasetProfile, PreviewData, AnalyticsResponse } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { PaginatedTable } from '../components/tables/PaginatedTable';
import { LoadingState } from '../components/common/LoadingState';

export const DatasetViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [dataset, setDataset] = useState<DatasetItem | null>(null);
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);

  const [activeTab, setActiveTab] = useState<'preview' | 'columns' | 'missing' | 'duplicates' | 'statistics' | 'correlations'>('preview');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    Promise.all([
      api.getDataset(id),
      api.getProfile(id),
      api.getPreview(id, 1, 20, ''),
      api.getAnalytics(id)
    ])
      .then(([ds, prof, prev, anal]) => {
        setDataset(ds);
        setProfile(prof);
        setPreview(prev);
        setAnalytics(anal);
      })
      .catch(err => console.error('Failed to load dataset details:', err))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handlePageChange = (newPage: number) => {
    if (!id) return;
    setCurrentPage(newPage);
    api.getPreview(id, newPage, 20, searchQuery)
      .then(setPreview)
      .catch(err => console.error('Pagination error:', err));
  };

  const handleSearch = (query: string) => {
    if (!id) return;
    setSearchQuery(query);
    setCurrentPage(1);
    api.getPreview(id, 1, 20, query)
      .then(setPreview)
      .catch(err => console.error('Search error:', err));
  };

  if (isLoading || !dataset) {
    return <LoadingState message="Loading dataset profile & preview..." />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center border border-blue-100 shadow-sm">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-main tracking-tight">{dataset.name}</h1>
              {dataset.isSample && <Badge variant="primary" size="sm">Sample Dataset</Badge>}
              <Badge variant={profile?.healthScore && profile.healthScore >= 80 ? 'success' : 'warning'} size="sm">
                Health: {profile?.healthScore || 95}/100
              </Badge>
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Filename: <span className="font-mono text-slate-700">{dataset.filename}</span> ·{' '}
              {profile?.rowCount.toLocaleString()} rows · {profile?.columnCount} columns
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link to={`/app/cleaning/${dataset.id}`}>
            <Button
              size="sm"
              variant="outline"
              icon={<Sliders className="w-3.5 h-3.5" />}
            >
              Clean Data
            </Button>
          </Link>
          <a href={api.getExportUrl(dataset.id)} download={dataset.filename}>
            <Button size="sm" variant="outline" icon={<Download className="w-3.5 h-3.5" />}>
              Export CSV
            </Button>
          </a>
          <Link to={`/app/analytics/${dataset.id}`}>
            <Button size="sm" variant="secondary" icon={<BarChart3 className="w-3.5 h-3.5" />}>
              Analytics
            </Button>
          </Link>
          <Link to={`/app/assistant/${dataset.id}`}>
            <Button size="sm" icon={<Bot className="w-3.5 h-3.5" />}>
              Ask Copilot
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-border pb-1 text-xs font-semibold overflow-x-auto">
        {[
          { key: 'preview', label: 'Data Preview', count: profile?.rowCount },
          { key: 'columns', label: 'Column Schema', count: profile?.columnCount },
          { key: 'missing', label: 'Missing Values', count: profile?.missingValues.filter(m => m.missingCount > 0).length },
          { key: 'duplicates', label: 'Duplicates', count: profile?.duplicateRows },
          { key: 'statistics', label: 'Summary Statistics' },
          { key: 'correlations', label: 'Correlations Matrix' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white text-primary shadow-sm border border-border font-bold'
                : 'text-text-muted hover:text-text-main hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === tab.key ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Paginated Data Preview */}
      {activeTab === 'preview' && preview && (
        <Card title="Raw Data Inspection" subtitle="Paginated view of records from the loaded file">
          <PaginatedTable
            columns={preview.columns}
            rows={preview.rows}
            page={currentPage}
            totalPages={preview.totalPages}
            totalRows={preview.totalRows}
            onPageChange={handlePageChange}
            searchValue={searchQuery}
            onSearchChange={handleSearch}
          />
        </Card>
      )}

      {/* Tab 2: Column Info Schema */}
      {activeTab === 'columns' && profile && (
        <Card title="Column Type & Health Breakdown" subtitle="Inferred semantic types and value distributions">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-border">
                <tr>
                  <th className="py-2.5 px-4">Column Name</th>
                  <th className="py-2.5 px-4">Inferred Type</th>
                  <th className="py-2.5 px-4">Pandas Type</th>
                  <th className="py-2.5 px-4">Non-Null</th>
                  <th className="py-2.5 px-4">Missing (%)</th>
                  <th className="py-2.5 px-4">Unique Values</th>
                  <th className="py-2.5 px-4">Sample Values</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profile.columns.map(col => (
                  <tr key={col.name} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-text-main">{col.name}</td>
                    <td className="py-2.5 px-4">
                      <Badge
                        variant={
                          col.inferredType === 'numeric' ? 'primary' :
                          col.inferredType === 'datetime' ? 'secondary' :
                          col.inferredType === 'categorical' ? 'warning' : 'neutral'
                        }
                        size="sm"
                      >
                        {col.inferredType}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{col.pandasType}</td>
                    <td className="py-2.5 px-4 text-slate-700">{col.nonNullCount.toLocaleString()}</td>
                    <td className="py-2.5 px-4">
                      <span className={col.missingCount > 0 ? 'text-amber-700 font-semibold' : 'text-slate-500'}>
                        {col.missingCount} ({col.missingPercentage}%)
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">{col.uniqueCount.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px] truncate max-w-xs">
                      {col.sampleValues.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab 3: Missing Values Inspection */}
      {activeTab === 'missing' && profile && (
        <Card title="Missing Values & Null Cell Audit" subtitle="Detect data completeness gaps across all features">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-text-muted">Total Columns with Missing Values</span>
                <p className="text-xl font-bold text-text-main mt-1">
                  {profile.missingValues.filter(m => m.missingCount > 0).length} / {profile.columnCount}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-text-muted">Duplicate Rows</span>
                <p className="text-xl font-bold text-text-main mt-1">{profile.duplicateRows}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-text-muted">Data Completeness</span>
                <p className="text-xl font-bold text-emerald-600 mt-1">{profile.healthScore}%</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-border">
                  <tr>
                    <th className="py-2.5 px-4">Column</th>
                    <th className="py-2.5 px-4">Missing Count</th>
                    <th className="py-2.5 px-4">Missing Percentage</th>
                    <th className="py-2.5 px-4">Progress Indicator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {profile.missingValues.map(m => (
                    <tr key={m.column} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-semibold text-text-main">{m.column}</td>
                      <td className="py-2.5 px-4 font-mono">{m.missingCount}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-700">{m.missingPercentage}%</td>
                      <td className="py-2.5 px-4 w-48">
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${m.missingPercentage > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.max(2, m.missingPercentage)}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Duplicates Audit */}
      {activeTab === 'duplicates' && profile && (
        <Card title="Duplicate Rows & Identifier Analysis" subtitle="Audit exact duplicate rows versus repeated business keys">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-text-muted">Exact Duplicate Rows</span>
                <p className="text-xl font-bold text-text-main mt-1">
                  {profile.duplicateRows.toLocaleString()}
                </p>
                <p className="text-[11px] text-text-muted mt-1">
                  {profile.rowCount > 0 ? ((profile.duplicateRows / profile.rowCount) * 100).toFixed(1) : 0}% of dataset
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-text-muted">Repeated ID Keys</span>
                <p className="text-xl font-bold text-text-main mt-1">
                  {(profile.repeatedIds !== undefined ? profile.repeatedIds : profile.duplicateRows).toLocaleString()}
                </p>
                <p className="text-[11px] text-text-muted mt-1">
                  Column: {profile.primaryIdColumn || 'Identifier'}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs text-text-muted">Unique Record Integrity</span>
                <p className="text-xl font-bold text-emerald-600 mt-1">
                  {(profile.rowCount - profile.duplicateRows).toLocaleString()} rows
                </p>
                <p className="text-[11px] text-text-muted mt-1">Ready for clean analysis</p>
              </div>
            </div>

            <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-text-main">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Distinct Metric Separation</span>
              </div>
              <p className="text-text-muted leading-relaxed">
                InsightForge AI strictly differentiates between <strong>Exact Duplicate Rows</strong> (identical across all columns) and <strong>Repeated Business Keys</strong> (e.g. customers placing multiple transactions). Repeated IDs are preserved as valid historical transactions, while exact duplicate rows can be dropped in the Data Cleaning Lab.
              </p>
              <div className="pt-2">
                <Link to={`/app/cleaning/${dataset.id}`}>
                  <Button size="xs" variant="primary">
                    <Sliders className="w-3 h-3 mr-1" /> Open Data Cleaning Lab
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 4: Descriptive Numeric Statistics */}
      {activeTab === 'statistics' && analytics && (
        <Card title="Descriptive Statistics (Pandas)" subtitle="Mean, median, standard deviation, and quartiles">
          {analytics.numeric.length === 0 ? (
            <p className="text-xs text-text-muted py-6 text-center">No continuous numeric columns available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-border">
                  <tr>
                    <th className="py-2.5 px-4">Numeric Variable</th>
                    <th className="py-2.5 px-4">Mean</th>
                    <th className="py-2.5 px-4">Std Dev</th>
                    <th className="py-2.5 px-4">Min</th>
                    <th className="py-2.5 px-4">25% (Q1)</th>
                    <th className="py-2.5 px-4">Median</th>
                    <th className="py-2.5 px-4">75% (Q3)</th>
                    <th className="py-2.5 px-4">Max</th>
                    <th className="py-2.5 px-4">Sum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {analytics.numeric.map(n => (
                    <tr key={n.column} className="hover:bg-blue-50/40">
                      <td className="py-2.5 px-4 font-sans font-semibold text-blue-900">{n.column}</td>
                      <td className="py-2.5 px-4">{n.mean.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-slate-600">{n.std.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-slate-600">{n.min.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-slate-600">{n.q25.toLocaleString()}</td>
                      <td className="py-2.5 px-4 font-bold text-text-main">{n.median.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-slate-600">{n.q75.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-slate-600">{n.max.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-emerald-800">{n.sum.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 5: Correlation Matrix */}
      {activeTab === 'correlations' && analytics && (
        <Card title="Pearson Correlation Matrix" subtitle="Linear relationships between numerical features (-1.0 to +1.0)">
          {analytics.correlations.columns.length < 2 ? (
            <p className="text-xs text-text-muted py-6 text-center">
              Requires at least 2 numeric columns to compute correlations.
            </p>
          ) : (
            <div className="space-y-6">
              {/* Significant Pairs Highlight */}
              {analytics.correlations.significantPairs.length > 0 && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h4 className="text-xs font-bold text-primary-dark mb-2">Key Significant Relationships</h4>
                  <div className="flex flex-wrap gap-2">
                    {analytics.correlations.significantPairs.map((pair, idx) => (
                      <span key={idx} className="bg-white border border-blue-200 text-xs px-2.5 py-1 rounded-lg">
                        <strong>{pair.columnA}</strong> & <strong>{pair.columnB}</strong>: {pair.correlation} ({pair.strength} {pair.direction})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-border">
                    <tr>
                      <th className="py-2.5 px-4 text-left">Feature</th>
                      {analytics.correlations.columns.map(c => (
                        <th key={c} className="py-2.5 px-3 whitespace-nowrap">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {analytics.correlations.matrix.map(row => (
                      <tr key={row.column}>
                        <td className="py-2.5 px-4 text-left font-sans font-semibold text-text-main">
                          {row.column}
                        </td>
                        {row.values.map((val, idx) => {
                          const isHigh = Math.abs(val) >= 0.6 && val !== 1;
                          return (
                            <td
                              key={idx}
                              className={`py-2 px-3 ${
                                val === 1 ? 'bg-slate-50 text-slate-400 font-bold' :
                                isHigh ? 'bg-blue-100/60 font-bold text-primary-dark' : 'text-slate-600'
                              }`}
                            >
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

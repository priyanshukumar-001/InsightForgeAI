import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  ScatterChart as ScatterIcon,
  Filter,
  Bot,
  Sliders,
  Sparkles,
  Download,
  Info,
  CheckCircle2,
  AlertCircle,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/apiClient';
import { DatasetItem, AnalyticsResponse, ChartDataResponse } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { BarChartWidget } from '../components/charts/BarChartWidget';
import { LineChartWidget } from '../components/charts/LineChartWidget';
import { PieChartWidget } from '../components/charts/PieChartWidget';
import { ScatterChartWidget } from '../components/charts/ScatterChartWidget';
import { LoadingState } from '../components/common/LoadingState';

export const AnalyticsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [dataset, setDataset] = useState<DatasetItem | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Custom Chart Builder State
  const [selectedChartType, setSelectedChartType] = useState<'scatter' | 'bar' | 'line' | 'area' | 'pie' | 'histogram'>('scatter');
  const [selectedX, setSelectedX] = useState<string>('');
  const [selectedY, setSelectedY] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAgg, setSelectedAgg] = useState<string>('none');
  const [customChartData, setCustomChartData] = useState<ChartDataResponse | null>(null);
  const [isBuildingChart, setIsBuildingChart] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);

    Promise.all([api.getDataset(id), api.getAnalytics(id)])
      .then(([ds, anal]) => {
        setDataset(ds);
        setAnalytics(anal);

        const columns = ds.profile?.columns || [];
        const numCols = columns.filter(c => c.inferredType === 'numeric').map(c => c.name);
        const catCols = columns.filter(c => c.inferredType === 'categorical').map(c => c.name);

        // Intelligently select default scatter fields (e.g. unit_price vs profit)
        const preferredX = numCols.find(c => c.includes('price') || c.includes('Sales') || c.includes('cost')) || numCols[0] || columns[0]?.name || '';
        const preferredY = numCols.find(c => (c.includes('profit') || c.includes('revenue') || c.includes('amount')) && c !== preferredX) || numCols[1] || numCols[0] || '';
        const preferredCat = catCols.find(c => c.includes('category') || c.includes('region') || c.includes('gender')) || catCols[0] || '';

        setSelectedX(preferredX);
        setSelectedY(preferredY);
        setSelectedCategory(preferredCat);

        if (preferredX && preferredY) {
          api.getChartData(id, {
            chartType: 'scatter',
            xAxis: preferredX,
            yAxis: preferredY,
            category: preferredCat,
            limit: 400
          })
            .then(setCustomChartData)
            .catch(err => console.warn('Could not build initial scatter plot:', err));
        }
      })
      .catch(err => console.error('Error loading analytics:', err))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleChartTypeChange = (newType: any) => {
    setSelectedChartType(newType);
    const columns = dataset?.profile?.columns || [];
    const numCols = columns.filter(c => c.inferredType === 'numeric').map(c => c.name);
    const catCols = columns.filter(c => c.inferredType === 'categorical').map(c => c.name);
    const dateCols = columns.filter(c => c.inferredType === 'datetime').map(c => c.name);

    if (newType === 'scatter') {
      setSelectedAgg('none');
      if (!numCols.includes(selectedX)) setSelectedX(numCols[0] || columns[0]?.name || '');
      if (!numCols.includes(selectedY)) setSelectedY(numCols[1] || numCols[0] || '');
    } else if (newType === 'bar') {
      setSelectedAgg('sum');
      if (!catCols.includes(selectedX)) setSelectedX(catCols[0] || columns[0]?.name || '');
      if (!numCols.includes(selectedY)) setSelectedY(numCols[0] || columns[1]?.name || '');
    } else if (newType === 'line' || newType === 'area') {
      setSelectedAgg('sum');
      const bestDate = dateCols[0] || columns.find(c => c.name.toLowerCase().includes('date'))?.name || catCols[0] || columns[0]?.name || '';
      setSelectedX(bestDate);
      if (!numCols.includes(selectedY)) setSelectedY(numCols[0] || columns[1]?.name || '');
    } else if (newType === 'pie') {
      setSelectedAgg('count');
      if (!catCols.includes(selectedX)) setSelectedX(catCols[0] || columns[0]?.name || '');
    }
  };

  const handleUpdateChart = async () => {
    if (!id || !selectedX) return;
    setIsBuildingChart(true);
    try {
      const res = await api.getChartData(id, {
        chartType: selectedChartType,
        xAxis: selectedX,
        yAxis: selectedChartType === 'pie' ? undefined : selectedY,
        category: selectedChartType === 'scatter' ? (selectedCategory || undefined) : undefined,
        aggregation: selectedAgg !== 'none' ? selectedAgg : 'sum',
        limit: selectedChartType === 'scatter' ? 500 : 15
      });
      setCustomChartData(res);
    } catch (err: any) {
      alert(`Chart build failed: ${err.message}`);
    } finally {
      setIsBuildingChart(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!customChartData || !customChartData.data || customChartData.data.length === 0) return;
    const headers = Object.keys(customChartData.data[0]);
    const csvRows = [
      headers.join(','),
      ...customChartData.data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${dataset?.name || 'chart'}_${selectedChartType}_data.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    if (!chartContainerRef.current) return;
    const svgElem = chartContainerRef.current.querySelector('svg');
    if (!svgElem) {
      alert('Unable to capture SVG element from chart.');
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svgElem);
    const canvas = document.createElement('canvas');
    const svgSize = svgElem.getBoundingClientRect();
    canvas.width = svgSize.width * 2;
    canvas.height = svgSize.height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.setAttribute('src', 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData))));
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `${dataset?.name || 'chart'}_${selectedChartType}.png`;
      a.click();
    };
  };

  if (isLoading || !dataset || !analytics) {
    return <LoadingState message="Generating analytical models & charts..." />;
  }

  const columns = dataset.profile?.columns || [];
  const catColumns = columns.filter(c => c.inferredType === 'categorical');
  const numColumns = columns.filter(c => c.inferredType === 'numeric');
  const dateColumns = columns.filter(c => c.inferredType === 'datetime');

  // Filter column options based on chart type
  const eligibleXColumns = selectedChartType === 'scatter' ? numColumns : columns;
  const eligibleYColumns = numColumns;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Analytics Header */}
      <div className="glass-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-text-main tracking-tight">Interactive Visualizations</h1>
            <Badge variant="primary" size="sm">{dataset.name}</Badge>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Recharts-powered visualizations computed directly from server-side deterministic data calculations.
          </p>
        </div>

        <Link to={`/app/assistant/${dataset.id}`}>
          <Button size="sm" icon={<Bot className="w-3.5 h-3.5" />}>
            Ask AI to Explain Charts
          </Button>
        </Link>
      </div>

      {/* Interactive Custom Chart Builder */}
      <Card
        title="Interactive Chart Builder"
        subtitle="Create beautiful visualizations from your data"
      >
        {/* Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 mb-6 p-4 bg-slate-50 border border-border/80 rounded-xl text-xs">
          <div>
            <label className="font-semibold text-text-main block mb-1">Chart Type</label>
            <select
              value={selectedChartType}
              onChange={e => handleChartTypeChange(e.target.value)}
              className="w-full bg-white border border-border rounded-input px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-primary font-medium"
            >
              <option value="scatter">Scatter Plot</option>
              <option value="bar">Bar Chart</option>
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
              <option value="pie">Pie / Donut</option>
              <option value="histogram">Histogram</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-text-main block mb-1">
              X-Axis {selectedChartType === 'scatter' ? '(Numeric)' : ''}
            </label>
            <select
              value={selectedX}
              onChange={e => setSelectedX(e.target.value)}
              className="w-full bg-white border border-border rounded-input px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-primary font-medium truncate"
            >
              {eligibleXColumns.map(c => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.inferredType})
                </option>
              ))}
            </select>
          </div>

          {selectedChartType !== 'pie' && (
            <div>
              <label className="font-semibold text-text-main block mb-1">
                Y-Axis {selectedChartType === 'scatter' ? '(Numeric)' : ''}
              </label>
              <select
                value={selectedY}
                onChange={e => setSelectedY(e.target.value)}
                className="w-full bg-white border border-border rounded-input px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-primary font-medium truncate"
              >
                {eligibleYColumns.map(c => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.inferredType})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedChartType === 'scatter' ? (
            <div>
              <label className="font-semibold text-text-main block mb-1">Color By (Optional)</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full bg-white border border-border rounded-input px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              >
                <option value="">None (Single Color)</option>
                {catColumns.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="font-semibold text-text-main block mb-1">Aggregation</label>
              <select
                value={selectedAgg}
                onChange={e => setSelectedAgg(e.target.value)}
                className="w-full bg-white border border-border rounded-input px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              >
                <option value="sum">Sum</option>
                <option value="mean">Mean (Average)</option>
                <option value="count">Count Records</option>
                <option value="max">Maximum</option>
                <option value="min">Minimum</option>
              </select>
            </div>
          )}

          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              className="w-full py-2"
              onClick={() => setFilterActive(!filterActive)}
              icon={<Filter className="w-3.5 h-3.5" />}
            >
              {filterActive ? 'Filter Active' : '+ Add Filter'}
            </Button>
          </div>

          <div className="flex items-end">
            <Button
              size="sm"
              className="w-full py-2 brand-gradient text-white shadow-sm"
              onClick={handleUpdateChart}
              isLoading={isBuildingChart}
            >
              Render Chart
            </Button>
          </div>
        </div>

        {filterActive && (
          <div className="mb-4 p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-main">
              <Info className="w-4 h-4 text-primary" />
              <span>Filtering applied: Showing valid, finite rows. (Missing and infinite values automatically sanitized).</span>
            </div>
            <button
              onClick={() => setFilterActive(false)}
              className="text-[11px] text-primary font-medium hover:underline"
            >
              Clear
            </button>
          </div>
        )}

        {/* Chart + Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Main Visualizer */}
          <div className={`${customChartData?.chartType === 'scatter' ? 'lg:col-span-8' : 'lg:col-span-12'}`} ref={chartContainerRef}>
            <div className="bg-white p-4 border border-border/80 rounded-xl shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">
                    {customChartData?.chartType === 'scatter'
                      ? `Scatter Plot: ${selectedX} vs ${selectedY}`
                      : `${selectedChartType.toUpperCase()}: ${selectedX} ${selectedY ? `· ${selectedY}` : ''}`}
                  </h3>
                  {customChartData?.correlation !== undefined && (
                    <Badge variant={Math.abs(customChartData.correlation) >= 0.4 ? 'primary' : 'neutral'} size="sm">
                      r = {customChartData.correlation}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button size="xs" variant="ghost" onClick={handleDownloadPng} icon={<Download className="w-3 h-3" />}>
                    Download PNG
                  </Button>
                  <Button size="xs" variant="ghost" onClick={handleDownloadCsv} icon={<FileSpreadsheet className="w-3 h-3" />}>
                    Download CSV
                  </Button>
                </div>
              </div>

              {customChartData?.chartType === 'bar' && (
                <BarChartWidget
                  data={customChartData.data}
                  xAxisLabel={selectedX}
                  yAxisLabel={`${selectedAgg.toUpperCase()} of ${selectedY}`}
                  height={340}
                />
              )}
              {customChartData?.chartType === 'line' && (
                <LineChartWidget
                  data={customChartData.data}
                  yAxisLabel={selectedY}
                  height={340}
                />
              )}
              {customChartData?.chartType === 'area' && (
                <LineChartWidget
                  data={customChartData.data}
                  yAxisLabel={selectedY}
                  height={340}
                />
              )}
              {customChartData?.chartType === 'pie' && (
                <PieChartWidget
                  data={customChartData.data}
                  height={340}
                />
              )}
              {customChartData?.chartType === 'scatter' && (
                <ScatterChartWidget
                  data={customChartData.data}
                  xAxisLabel={selectedX}
                  yAxisLabel={selectedY}
                  categories={customChartData.categories}
                  height={340}
                />
              )}
            </div>
          </div>

          {/* Chart Insights Panel (Screen 4) */}
          {customChartData?.chartType === 'scatter' && (
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-50 border border-border/80 p-4 rounded-xl space-y-3 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-text-main font-bold text-xs pb-2 border-b border-border/60">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Chart Insights</span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs text-text-main">
                    <div className="p-2.5 bg-white border border-border rounded-lg">
                      <p className="font-semibold text-primary text-[11px] uppercase tracking-wide">Correlation Analysis</p>
                      <p className="text-xs font-medium text-text-main mt-0.5">
                        {customChartData.correlationLabel || `Pearson coefficient r = ${customChartData.correlation ?? 0}`}
                      </p>
                    </div>

                    <ul className="space-y-1.5 pt-1 text-[11.5px] text-text-muted">
                      {(customChartData.insights || [
                        `Correlation between ${selectedX} and ${selectedY} is ${customChartData.correlation}.`,
                        `Filtered out non-finite and missing rows cleanly.`,
                        `Interactive coordinate tooltips enabled with category indicators.`
                      ]).map((insight, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-primary font-bold mt-0.5">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 space-y-2">
                  <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Export</div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button size="xs" variant="outline" className="w-full text-[11px]" onClick={handleDownloadPng}>
                      <Download className="w-3 h-3 mr-1 text-primary" /> Download PNG
                    </Button>
                    <Button size="xs" variant="outline" className="w-full text-[11px]" onClick={handleDownloadCsv}>
                      <FileSpreadsheet className="w-3 h-3 mr-1 text-primary" /> Download CSV
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Categorical Breakdowns Grid */}
      {analytics.categorical.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analytics.categorical.slice(0, 2).map((cat) => (
            <Card
              key={cat.column}
              title={`Frequency Share: ${cat.column}`}
              subtitle={`${cat.uniqueCount} distinct groups identified`}
            >
              <div className="space-y-4">
                <PieChartWidget
                  data={cat.distribution.map(d => ({ name: d.label, value: d.count }))}
                  height={220}
                />
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  {cat.distribution.slice(0, 4).map(d => (
                    <div key={d.label} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium truncate max-w-[180px]">{d.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-800">{d.count.toLocaleString()}</span>
                        <span className="text-slate-400 text-[11px]">({d.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

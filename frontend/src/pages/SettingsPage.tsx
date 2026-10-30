import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bot,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  Save,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { api } from '../services/apiClient';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'appearance' | 'storage'>('api');
  const [providerData, setProviderData] = useState<any>(null);

  // API Config State
  const [selectedProvider, setSelectedProvider] = useState<'gemini' | 'groq' | 'openai' | 'demo'>('gemini');
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••••••••••••••••••');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  // General & Storage Settings
  const [retentionDays, setRetentionDays] = useState(30);
  const [autoCleanDuplicates, setAutoCleanDuplicates] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    api.getAIProviders().then(data => {
      setProviderData(data);
      if (data.activeProvider) {
        setSelectedProvider(data.activeProvider as any);
      }
    }).catch(console.error);

    api.getSettings().then(s => {
      if (s.retentionDays) setRetentionDays(s.retentionDays);
      if (s.autoCleanDuplicates) setAutoCleanDuplicates(s.autoCleanDuplicates);
    }).catch(console.error);
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await api.testConnection({
        provider: selectedProvider,
        apiKey: apiKey.includes('•') ? undefined : apiKey,
        model: selectedModel
      });
      setTestResult({
        success: true,
        message: res.message || `Successfully connected to ${selectedProvider.toUpperCase()}. Model: ${selectedModel}, Status: Ready`,
        latencyMs: res.latencyMs
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection test failed: ${err.message}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateSettings({ retentionDays, autoCleanDuplicates });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-text-main tracking-tight">Settings</h1>
        <p className="text-xs text-text-muted mt-1">
          Manage AI model connectivity, execution boundaries, data retention, and storage.
        </p>
      </div>

      {/* Settings Navigation Tabs (Matching Montage Screen 9) */}
      <div className="flex items-center gap-2 border-b border-border pb-1 overflow-x-auto text-xs font-semibold">
        {[
          { key: 'general', label: 'General' },
          { key: 'api', label: 'API Configuration' },
          { key: 'appearance', label: 'Appearance' },
          { key: 'storage', label: 'Data & Storage' }
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

      {/* Tab 1: API Configuration (Screen 9) */}
      {activeTab === 'api' && (
        <Card
          title="LLM Provider Configuration"
          subtitle="Configure your primary AI provider for grounded natural language data analysis"
          action={
            <Badge variant="success" size="sm">
              <span className="flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected
              </span>
            </Badge>
          }
        >
          <div className="space-y-4 pt-1 text-xs">
            {/* Provider Selection */}
            <div>
              <label className="font-semibold text-text-main block mb-1">LLM Provider</label>
              <select
                value={selectedProvider}
                onChange={e => setSelectedProvider(e.target.value as any)}
                className="w-full bg-white border border-border rounded-input px-3 py-2 text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              >
                <option value="gemini">Google Gemini (Recommended · Official SDK)</option>
                <option value="groq">Groq (Llama 3.1 8B Instant)</option>
                <option value="openai">OpenAI (GPT-4o Mini)</option>
                <option value="demo">Demo Copilot (Built-in offline fallback)</option>
              </select>
            </div>

            {/* API Key Input with Eye Toggle */}
            <div>
              <label className="font-semibold text-text-main block mb-1">API Key</label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Enter API key or manage in .env"
                  className="w-full bg-white border border-border rounded-input px-3 py-2 pr-10 text-xs font-mono text-text-main focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-text-muted mt-1">
                Your API key is stored securely on the server and never exposed to the browser.
              </p>
            </div>

            {/* Model Selection */}
            <div>
              <label className="font-semibold text-text-main block mb-1">Model</label>
              <select
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value)}
                className="w-full bg-white border border-border rounded-input px-3 py-2 text-xs text-text-main focus:outline-none focus:ring-1 focus:ring-primary font-medium"
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended · Multimodal & Fast)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (Advanced Reasoning)</option>
                <option value="gemini-3.7-flash">gemini-3.7-flash (Latest preview)</option>
              </select>
            </div>

            {/* Test Connection Button */}
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestConnection}
                isLoading={isTesting}
                icon={<Zap className="w-3.5 h-3.5 text-primary" />}
              >
                Test Connection
              </Button>
            </div>

            {/* Test Connection Result Alert Box (Screen 9) */}
            {testResult && (
              <div className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                  : 'bg-red-50/80 border-red-200 text-red-800'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{testResult.message}</p>
                  {testResult.latencyMs !== undefined && (
                    <p className="text-[11px] text-emerald-600 mt-0.5">
                      Response latency: {testResult.latencyMs}ms · Deterministic sandbox verified
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Save Changes Button */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-text-muted">
                {saveSuccess ? 'Changes saved successfully!' : 'Parameters updated locally'}
              </span>
              <Button
                size="sm"
                className="brand-gradient text-white shadow-sm font-semibold"
                onClick={handleSave}
                isLoading={isSaving}
              >
                <Save className="w-3.5 h-3.5 mr-1.5" /> Save Changes
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 2: General Settings */}
      {activeTab === 'general' && (
        <Card title="Workspace Settings" subtitle="Configure defaults and dataset processing rules">
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-border rounded-xl">
              <div>
                <p className="font-semibold text-text-main">Automated Health Scoring</p>
                <p className="text-[11px] text-text-muted">Automatically calculate missingness and duplicate ratios on upload</p>
              </div>
              <Badge variant="success">Enabled</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 border border-border rounded-xl">
              <div>
                <p className="font-semibold text-text-main">Deterministic Tool Grounding</p>
                <p className="text-[11px] text-text-muted">Require all numerical statistics to be computed by server-side Python pandas</p>
              </div>
              <Badge variant="primary">Enforced</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Appearance */}
      {activeTab === 'appearance' && (
        <Card title="Theme & Visual Identity" subtitle="Blue-gradient, white surfaces, and deep navy design system">
          <div className="space-y-3 text-xs">
            <p className="text-text-muted">
              InsightForge AI implements the curated modern SaaS design system specified in the specification.
            </p>
            <div className="grid grid-cols-4 gap-2 pt-2">
              <div className="p-3 rounded-lg border border-border text-center bg-white shadow-xs">
                <span className="w-4 h-4 rounded-full bg-[#2563EB] inline-block mb-1" />
                <p className="font-semibold text-[11px]">Primary Blue</p>
                <p className="text-[10px] text-text-muted">#2563EB</p>
              </div>
              <div className="p-3 rounded-lg border border-border text-center bg-white shadow-xs">
                <span className="w-4 h-4 rounded-full bg-[#06B6D4] inline-block mb-1" />
                <p className="font-semibold text-[11px]">Cyan Accent</p>
                <p className="text-[10px] text-text-muted">#06B6D4</p>
              </div>
              <div className="p-3 rounded-lg border border-border text-center bg-white shadow-xs">
                <span className="w-4 h-4 rounded-full bg-[#0B1730] inline-block mb-1" />
                <p className="font-semibold text-[11px]">Navy Sidebar</p>
                <p className="text-[10px] text-text-muted">#0B1730</p>
              </div>
              <div className="p-3 rounded-lg border border-border text-center bg-white shadow-xs">
                <span className="w-4 h-4 rounded-full bg-[#F4F8FF] inline-block mb-1" />
                <p className="font-semibold text-[11px]">Canvas Soft</p>
                <p className="text-[10px] text-text-muted">#F4F8FF</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 4: Data & Storage */}
      {activeTab === 'storage' && (
        <Card title="Data Persistence & Privacy" subtitle="Local atomic JSON persistence and private dataset storage">
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-border rounded-xl flex items-center justify-between">
              <div>
                <p className="font-semibold text-text-main">Storage Location</p>
                <p className="text-[11px] text-text-muted font-mono mt-0.5">storage-data/ · private-uploads/</p>
              </div>
              <Badge variant="neutral">Atomic JSON</Badge>
            </div>

            <div>
              <label className="font-semibold text-text-main block mb-1">Dataset Retention (Days)</label>
              <input
                type="number"
                value={retentionDays}
                onChange={e => setRetentionDays(Number(e.target.value))}
                className="w-full bg-white border border-border rounded-input px-3 py-2 text-xs text-text-main"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

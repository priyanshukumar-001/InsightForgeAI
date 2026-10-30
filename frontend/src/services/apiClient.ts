/**
 * InsightForge AI - Central API Client
 * Wraps backend endpoints with type-safety and error formatting.
 */

import {
  DatasetItem,
  PreviewData,
  DatasetProfile,
  AnalyticsResponse,
  ChartDataResponse,
  AssistantResponse,
  ReportItem,
  HistoryItem,
  TestConnectionResponse
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  const body = await res.json().catch(() => null);

  if (!res.ok || !body?.success) {
    const errorMsg = body?.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return body.data as T;
}

export const api = {
  // System & Health
  getSystemStatus: () => fetchJson<any>('/system/status'),

  // Datasets
  getDatasets: () => fetchJson<DatasetItem[]>('/datasets'),
  getDataset: (id: string) => fetchJson<DatasetItem>(`/datasets/${id}`),

  uploadDataset: async (file: File): Promise<DatasetItem> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/datasets/upload`, {
      method: 'POST',
      body: formData
    });
    const body = await res.json();
    if (!res.ok || !body.success) {
      throw new Error(body.message || 'File upload failed');
    }
    return body.data;
  },

  getPreview: (id: string, page = 1, pageSize = 20, search = '') =>
    fetchJson<PreviewData>(`/datasets/${id}/preview?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`),

  getProfile: (id: string) => fetchJson<DatasetProfile>(`/datasets/${id}/profile`),

  getAnalytics: (id: string) => fetchJson<AnalyticsResponse>(`/datasets/${id}/analytics`),

  getChartData: (id: string, params: { chartType: string; xAxis?: string; yAxis?: string; category?: string; aggregation?: string; limit?: number; bins?: number }) =>
    fetchJson<ChartDataResponse>(`/datasets/${id}/chart-data`, {
      method: 'POST',
      body: JSON.stringify(params)
    }),

  cleanDataset: (id: string, operations: any[]) =>
    fetchJson<{ newDataset: DatasetItem; audit: any; preview: PreviewData }>(`/datasets/${id}/clean`, {
      method: 'POST',
      body: JSON.stringify({ operations })
    }),

  getExportUrl: (id: string) => `${API_BASE}/datasets/${id}/export`,

  // AI Assistant
  getAIProviders: () => fetchJson<{ activeProvider: string; isDemoMode: boolean; providers: any[] }>('/assistant/providers'),

  testConnection: (data: { provider: string; apiKey?: string; model?: string }) =>
    fetchJson<TestConnectionResponse>('/assistant/test-connection', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  askQuestion: (datasetId: string, question: string, history: any[] = []) =>
    fetchJson<AssistantResponse>(`/datasets/${datasetId}/assistant`, {
      method: 'POST',
      body: JSON.stringify({ question, history })
    }),

  // Reports
  getReports: () => fetchJson<ReportItem[]>('/reports'),

  generateReport: (datasetId: string, title?: string) =>
    fetchJson<ReportItem>('/reports', {
      method: 'POST',
      body: JSON.stringify({ datasetId, title })
    }),

  getReportDownloadUrl: (id: string, format: 'html' | 'md' = 'html') =>
    `${API_BASE}/reports/${id}/download?format=${format}`,

  // History & Settings
  getHistory: () => fetchJson<HistoryItem[]>('/history'),
  clearHistory: () => fetchJson<{ message: string }>('/history', { method: 'DELETE' }),

  getSettings: () => fetchJson<any>('/settings'),
  updateSettings: (settings: any) =>
    fetchJson<any>('/settings', {
      method: 'POST',
      body: JSON.stringify(settings)
    })
};

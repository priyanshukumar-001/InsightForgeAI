/**
 * InsightForge AI - Storage Service
 * Handles persistence for dataset metadata, reports, and analysis history.
 * Operates reliably using atomic local JSON documents with directory isolation,
 * ensuring out-of-the-box persistence without requiring an external database.
 */

const fs = require('fs');
const path = require('path');
const config = require('../config');

// Ensure storage directory exists
if (!fs.existsSync(config.storageDir)) {
  fs.mkdirSync(config.storageDir, { recursive: true });
}

class StorageService {
  constructor() {
    this.datasetsFile = path.join(config.storageDir, 'datasets.json');
    this.reportsFile = path.join(config.storageDir, 'reports.json');
    this.historyFile = path.join(config.storageDir, 'history.json');
    this.settingsFile = path.join(config.storageDir, 'settings.json');

    this._initStore(this.datasetsFile, []);
    this._initStore(this.reportsFile, []);
    this._initStore(this.historyFile, []);
    this._initStore(this.settingsFile, {
      theme: 'light',
      defaultAiProvider: config.ai.provider,
      autoCleanDuplicates: false,
      retentionDays: 30
    });
  }

  _initStore(filePath, defaultData) {
    if (!fs.existsSync(filePath)) {
      try {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      } catch (err) {
        console.error(`Failed to initialize store at ${filePath}:`, err.message);
      }
    }
  }

  _readStore(filePath) {
    try {
      if (!fs.existsSync(filePath)) return [];
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content || '[]');
    } catch (err) {
      console.error(`Error reading ${filePath}:`, err.message);
      return [];
    }
  }

  _writeStore(filePath, data) {
    try {
      const tempPath = `${filePath}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, filePath);
      return true;
    } catch (err) {
      console.error(`Error writing ${filePath}:`, err.message);
      return false;
    }
  }

  // Datasets
  getDatasets() {
    return this._readStore(this.datasetsFile);
  }

  getDatasetById(id) {
    const list = this.getDatasets();
    return list.find(d => d.id === id) || null;
  }

  saveDataset(dataset) {
    const list = this.getDatasets();
    const idx = list.findIndex(d => d.id === dataset.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...dataset, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({
        ...dataset,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    this._writeStore(this.datasetsFile, list);
    return dataset;
  }

  deleteDataset(id) {
    const list = this.getDatasets();
    const filtered = list.filter(d => d.id !== id);
    this._writeStore(this.datasetsFile, filtered);
    return true;
  }

  // Reports
  getReports() {
    return this._readStore(this.reportsFile);
  }

  getReportById(id) {
    const list = this.getReports();
    return list.find(r => r.id === id) || null;
  }

  saveReport(report) {
    const list = this.getReports();
    const idx = list.findIndex(r => r.id === report.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...report, updatedAt: new Date().toISOString() };
    } else {
      list.unshift({
        ...report,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    this._writeStore(this.reportsFile, list);
    return report;
  }

  deleteReport(id) {
    const list = this.getReports();
    const filtered = list.filter(r => r.id !== id);
    this._writeStore(this.reportsFile, filtered);
    return true;
  }

  // History
  getHistory() {
    return this._readStore(this.historyFile);
  }

  addHistory(entry) {
    const list = this.getHistory();
    list.unshift({
      ...entry,
      id: entry.id || `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    });
    // Keep last 100 history entries
    const capped = list.slice(0, 100);
    this._writeStore(this.historyFile, capped);
    return capped[0];
  }

  clearHistory() {
    this._writeStore(this.historyFile, []);
    return true;
  }

  // Settings
  getSettings() {
    try {
      const content = fs.readFileSync(this.settingsFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return { theme: 'light', defaultAiProvider: config.ai.provider };
    }
  }

  updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings, updatedAt: new Date().toISOString() };
    this._writeStore(this.settingsFile, updated);
    return updated;
  }
}

module.exports = new StorageService();

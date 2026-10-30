/**
 * InsightForge AI - Dataset Service
 * Coordinates dataset uploads, sample loading, profiling, cleaning,
 * and analysis calculations.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const storageService = require('./storageService');
const dataServiceClient = require('./dataServiceClient');

class DatasetService {
  constructor() {
    this._ensureDirs();
    this._seedSampleDatasets();
  }

  _ensureDirs() {
    if (!fs.existsSync(config.uploadDir)) {
      fs.mkdirSync(config.uploadDir, { recursive: true });
    }
  }

  _seedSampleDatasets() {
    const existing = storageService.getDatasets();
    const samples = [
      {
        id: 'sample-sales-01',
        name: 'Retail Sales & Transactions',
        filename: 'sales_sample.csv',
        isSample: true,
        source: 'sample-data',
        description: 'Retail sales across North, South, East, West with unit prices, discounts, and payment methods.'
      },
      {
        id: 'sample-churn-02',
        name: 'Telecom Customer Churn',
        filename: 'customer_churn_sample.csv',
        isSample: true,
        source: 'sample-data',
        description: 'Subscriber contract types, monthly charges, tenure, and churn status.'
      },
      {
        id: 'sample-hr-03',
        name: 'Employee Performance & Salaries',
        filename: 'employee_performance.csv',
        isSample: true,
        source: 'sample-data',
        description: 'HR records with departments, roles, years of experience, performance scores, and salary.'
      }
    ];

    samples.forEach(s => {
      const alreadyThere = existing.some(d => d.id === s.id);
      if (!alreadyThere) {
        const sourcePath = path.join(config.sampleDataDir, s.filename);
        if (fs.existsSync(sourcePath)) {
          // Register sample dataset with preview
          const datasetRecord = {
            id: s.id,
            name: s.name,
            filename: s.filename,
            filePath: sourcePath,
            fileSize: fs.statSync(sourcePath).size,
            isSample: true,
            status: 'ready',
            description: s.description,
            createdAt: new Date().toISOString()
          };
          storageService.saveDataset(datasetRecord);
        }
      }
    });
  }

  async getAllDatasets() {
    return storageService.getDatasets();
  }

  async getDatasetById(id) {
    const dataset = storageService.getDatasetById(id);
    if (!dataset) return null;

    // If profile not yet cached, generate it
    if (!dataset.profile && fs.existsSync(dataset.filePath)) {
      try {
        const profile = await dataServiceClient.profileDataset(dataset.filePath);
        dataset.profile = profile;
        storageService.saveDataset(dataset);
      } catch (err) {
        console.warn(`Could not generate profile for ${id}:`, err.message);
      }
    }

    return dataset;
  }

  async createFromUpload(file, originalName) {
    const id = `ds-${Date.now()}-${uuidv4().substring(0, 8)}`;
    const filename = `${id}-${path.basename(originalName)}`;
    const targetPath = path.join(config.uploadDir, filename);

    fs.renameSync(file.path, targetPath);

    // Profile the dataset immediately
    let profile = null;
    try {
      profile = await dataServiceClient.profileDataset(targetPath);
    } catch (err) {
      console.warn('Initial profiling error:', err.message);
    }

    const dataset = {
      id,
      name: originalName.replace(/\.[^/.]+$/, ''),
      filename: originalName,
      filePath: targetPath,
      fileSize: fs.statSync(targetPath).size,
      mimeType: file.mimetype,
      isSample: false,
      status: 'ready',
      profile,
      createdAt: new Date().toISOString()
    };

    storageService.saveDataset(dataset);
    return dataset;
  }

  async getPreview(id, page = 1, pageSize = 20, search = '') {
    const dataset = await this.getDatasetById(id);
    if (!dataset) throw new Error('Dataset not found');

    return dataServiceClient.getPreview(dataset.filePath, null, page, pageSize, search);
  }

  async getProfile(id) {
    const dataset = await this.getDatasetById(id);
    if (!dataset) throw new Error('Dataset not found');

    const profile = await dataServiceClient.profileDataset(dataset.filePath);
    dataset.profile = profile;
    storageService.saveDataset(dataset);
    return profile;
  }

  async getStatistics(id) {
    const dataset = await this.getDatasetById(id);
    if (!dataset) throw new Error('Dataset not found');

    return dataServiceClient.getStatistics(dataset.filePath);
  }

  async getCorrelations(id) {
    const dataset = await this.getDatasetById(id);
    if (!dataset) throw new Error('Dataset not found');

    return dataServiceClient.getCorrelations(dataset.filePath);
  }

  async getChartData(id, chartParams) {
    const dataset = await this.getDatasetById(id);
    if (!dataset) throw new Error('Dataset not found');

    return dataServiceClient.getChartData(dataset.filePath, null, chartParams);
  }

  async cleanDataset(id, operations) {
    const dataset = await this.getDatasetById(id);
    if (!dataset) throw new Error('Dataset not found');

    const cleanedFilename = `cleaned-${dataset.filename}`;
    const cleanedPath = path.join(config.uploadDir, `${dataset.id}-${cleanedFilename}`);

    const cleanResult = await dataServiceClient.cleanDataset(
      dataset.filePath,
      null,
      operations,
      cleanedPath
    );

    // Create a new cleaned dataset entry preserving original
    const newDatasetId = `ds-clean-${Date.now()}-${uuidv4().substring(0, 6)}`;
    const newProfile = await dataServiceClient.profileDataset(cleanedPath);

    const cleanedDataset = {
      id: newDatasetId,
      name: `${dataset.name} (Cleaned)`,
      filename: cleanedFilename,
      filePath: cleanedPath,
      fileSize: fs.existsSync(cleanedPath) ? fs.statSync(cleanedPath).size : dataset.fileSize,
      isSample: false,
      parentDatasetId: dataset.id,
      cleaningAudit: cleanResult.audit,
      profile: newProfile,
      status: 'ready',
      createdAt: new Date().toISOString()
    };

    storageService.saveDataset(cleanedDataset);

    // Record in history
    storageService.addHistory({
      type: 'cleaning',
      datasetId: dataset.id,
      datasetName: dataset.name,
      title: `Cleaned dataset "${dataset.name}"`,
      details: cleanResult.audit
    });

    return {
      newDataset: cleanedDataset,
      audit: cleanResult.audit,
      preview: cleanResult.preview
    };
  }

  async exportCsv(id) {
    const dataset = await this.getDatasetById(id);
    if (!dataset || !fs.existsSync(dataset.filePath)) {
      throw new Error('Dataset file not found');
    }
    return {
      filePath: dataset.filePath,
      filename: dataset.filename
    };
  }
}

module.exports = new DatasetService();

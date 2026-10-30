/**
 * InsightForge AI - Dataset Routes
 * CRUD, uploads, previews, profile metrics, cleaning, and export.
 */

const express = require('express');
const router = express.Router();
const datasetService = require('../services/datasetService');
const upload = require('../middleware/upload');

// GET /api/datasets - List all datasets
router.get('/', async (req, res, next) => {
  try {
    const list = await datasetService.getAllDatasets();
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

// POST /api/datasets/upload - Upload CSV or Excel file
router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }
    const dataset = await datasetService.createFromUpload(req.file, req.file.originalname);
    res.status(201).json({
      success: true,
      message: 'Dataset uploaded and profiled successfully.',
      data: dataset
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/datasets/:id - Get dataset detail
router.get('/:id', async (req, res, next) => {
  try {
    const dataset = await datasetService.getDatasetById(req.params.id);
    if (!dataset) {
      return res.status(404).json({ success: false, message: 'Dataset not found.' });
    }
    res.json({ success: true, data: dataset });
  } catch (err) {
    next(err);
  }
});

// GET /api/datasets/:id/preview - Paginated & searchable preview
router.get('/:id/preview', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const pageSize = parseInt(req.query.pageSize || '20', 10);
    const search = req.query.search || '';

    const preview = await datasetService.getPreview(req.params.id, page, pageSize, search);
    res.json({ success: true, data: preview });
  } catch (err) {
    next(err);
  }
});

// GET /api/datasets/:id/profile - Deep quality & shape profiling
router.get('/:id/profile', async (req, res, next) => {
  try {
    const profile = await datasetService.getProfile(req.params.id);
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

// GET /api/datasets/:id/missing-values - Missing value breakdown
router.get('/:id/missing-values', async (req, res, next) => {
  try {
    const profile = await datasetService.getProfile(req.params.id);
    res.json({ success: true, data: profile.missingValues || [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/datasets/:id/analytics - Numeric stats, categorical counts, correlations
router.get('/:id/analytics', async (req, res, next) => {
  try {
    const statistics = await datasetService.getStatistics(req.params.id);
    res.json({ success: true, data: statistics });
  } catch (err) {
    next(err);
  }
});

// POST /api/datasets/:id/chart-data - Recharts-ready formatted data
router.post('/:id/chart-data', async (req, res, next) => {
  try {
    const chartData = await datasetService.getChartData(req.params.id, req.body);
    res.json({ success: true, data: chartData });
  } catch (err) {
    next(err);
  }
});

// POST /api/datasets/:id/clean - Apply cleaning operations
router.post('/:id/clean', async (req, res, next) => {
  try {
    const operations = req.body.operations || [];
    if (!Array.isArray(operations) || operations.length === 0) {
      return res.status(400).json({ success: false, message: 'Cleaning operations array is required.' });
    }
    const result = await datasetService.cleanDataset(req.params.id, operations);
    res.json({
      success: true,
      message: 'Dataset cleaned successfully. Original dataset preserved.',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/datasets/:id/export - Download cleaned or raw CSV
router.get('/:id/export', async (req, res, next) => {
  try {
    const { filePath, filename } = await datasetService.exportCsv(req.params.id);
    res.download(filePath, filename);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

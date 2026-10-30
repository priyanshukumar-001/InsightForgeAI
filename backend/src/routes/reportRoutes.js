/**
 * InsightForge AI - Report Routes
 * Generation and downloading of formatted analytical reports.
 */

const express = require('express');
const router = express.Router();
const reportService = require('../services/reportService');
const fs = require('fs');

// GET /api/reports - List generated reports
router.get('/', async (req, res, next) => {
  try {
    const list = await reportService.getAllReports();
    res.json({ success: true, data: list });
  } catch (err) {
    next(err);
  }
});

// POST /api/reports - Generate a new report
router.post('/', async (req, res, next) => {
  try {
    const { datasetId, title } = req.body;
    if (!datasetId) {
      return res.status(400).json({ success: false, message: 'datasetId is required.' });
    }
    const report = await reportService.generateReport({ datasetId, title });
    res.status(201).json({ success: true, message: 'Report generated successfully.', data: report });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/:id/download - Download HTML or Markdown report
router.get('/:id/download', async (req, res, next) => {
  try {
    const format = req.query.format || 'html'; // 'html' or 'md'
    const report = await reportService.getReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    const filePath = format === 'md' ? report.mdPath : report.htmlPath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Report file missing.' });
    }

    const filename = `${report.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${format}`;
    res.download(filePath, filename);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

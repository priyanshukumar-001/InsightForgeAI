/**
 * InsightForge AI - System & Health Routes
 */

const express = require('express');
const router = express.Router();
const dataServiceClient = require('../services/dataServiceClient');
const aiService = require('../services/aiService');
const storageService = require('../services/storageService');

router.get('/health', async (req, res) => {
  const dataEngine = await dataServiceClient.checkHealth();
  res.json({
    success: true,
    data: {
      status: 'healthy',
      server: 'InsightForge Express Backend',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      dataEngine
    }
  });
});

router.get('/system/status', async (req, res) => {
  const dataEngine = await dataServiceClient.checkHealth();
  const aiStatus = aiService.getProvidersStatus();
  const datasets = storageService.getDatasets();
  const reports = storageService.getReports();

  res.json({
    success: true,
    data: {
      backend: 'online',
      dataEngine,
      ai: aiStatus,
      counts: {
        datasets: datasets.length,
        reports: reports.length
      }
    }
  });
});

module.exports = router;

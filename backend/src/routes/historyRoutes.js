/**
 * InsightForge AI - History & Settings Routes
 */

const express = require('express');
const router = express.Router();
const storageService = require('../services/storageService');

// GET /api/history - Get past analytical interactions
router.get('/history', (req, res) => {
  const history = storageService.getHistory();
  res.json({ success: true, data: history });
});

// DELETE /api/history - Clear history
router.delete('/history', (req, res) => {
  storageService.clearHistory();
  res.json({ success: true, message: 'History cleared successfully.' });
});

// GET /api/settings - Get settings
router.get('/settings', (req, res) => {
  const settings = storageService.getSettings();
  res.json({ success: true, data: settings });
});

// POST /api/settings - Update settings
router.post('/settings', (req, res) => {
  const updated = storageService.updateSettings(req.body);
  res.json({ success: true, message: 'Settings saved successfully.', data: updated });
});

module.exports = router;

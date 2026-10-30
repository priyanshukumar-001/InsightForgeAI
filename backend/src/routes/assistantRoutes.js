/**
 * InsightForge AI - AI Assistant Routes
 * Handles grounded analytical questions with multi-provider execution.
 */

const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const datasetService = require('../services/datasetService');
const storageService = require('../services/storageService');
const config = require('../config');
const GeminiProvider = require('../services/providers/geminiProvider');
const GroqProvider = require('../services/providers/groqProvider');
const OpenAIProvider = require('../services/providers/openAiProvider');

// GET /api/assistant/providers - Returns status of configured AI providers
router.get('/providers', (req, res) => {
  const status = aiService.getProvidersStatus();
  res.json({ success: true, data: status });
});

// POST /api/assistant/test-connection - Test provider connectivity from Settings
router.post('/test-connection', async (req, res, next) => {
  try {
    const { provider = 'gemini', apiKey, model } = req.body;
    const startTime = Date.now();

    if (provider === 'demo') {
      return res.json({
        success: true,
        data: {
          provider: 'demo',
          model: 'built-in-offline',
          status: 'Ready',
          latencyMs: 1,
          message: 'Demo Copilot is always online and ready for zero-cost offline exploration.'
        }
      });
    }

    let testProvider;
    const targetKey = apiKey || (provider === 'gemini' ? config.ai.geminiKey : (provider === 'groq' ? config.ai.groqKey : config.ai.openAiKey));
    const targetModel = model || (provider === 'gemini' ? 'gemini-2.5-flash' : (provider === 'groq' ? 'llama-3.1-8b-instant' : 'gpt-4o-mini'));

    if (!targetKey || targetKey.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: `API key for ${provider.toUpperCase()} is missing or empty.`
      });
    }

    if (provider === 'gemini') {
      testProvider = new GeminiProvider(targetKey, targetModel, 15000);
    } else if (provider === 'groq') {
      testProvider = new GroqProvider(targetKey, targetModel, 15000);
    } else if (provider === 'openai') {
      testProvider = new OpenAIProvider(targetKey, targetModel, 'https://api.openai.com/v1', 15000);
    } else {
      return res.status(400).json({ success: false, message: `Unsupported provider: ${provider}` });
    }

    const testRes = await testProvider.generateAnswer({
      prompt: 'Respond with exactly: InsightForge Live AI Online'
    });

    const latencyMs = Date.now() - startTime;

    res.json({
      success: true,
      data: {
        provider,
        model: targetModel,
        status: 'Connected',
        latencyMs,
        response: testRes.text,
        message: `Successfully connected to ${provider.toUpperCase()}. Model: ${targetModel}. Status: Ready (${latencyMs}ms)`
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Connection failed: ${err.message}`
    });
  }
});

// POST /api/datasets/:id/assistant - Ask question grounded in dataset
router.post('/:id/assistant', async (req, res, next) => {
  try {
    const { question, history = [] } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: 'Question cannot be empty.' });
    }

    const dataset = await datasetService.getDatasetById(req.params.id);
    if (!dataset) {
      return res.status(404).json({ success: false, message: 'Dataset not found.' });
    }

    const result = await aiService.askQuestion({
      dataset,
      question: question.trim(),
      history
    });

    // Save interaction to history
    storageService.addHistory({
      type: 'ai_query',
      datasetId: dataset.id,
      datasetName: dataset.name,
      question: question.trim(),
      answer: result.answer,
      provider: result.provider,
      toolExecuted: result.toolExecuted,
      hasChart: Boolean(result.chartData)
    });

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

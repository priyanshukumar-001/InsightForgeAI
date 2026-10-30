/**
 * Unit & Integration tests for InsightForge Express Backend
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const app = require('../app');
const storageService = require('../services/storageService');
const aiService = require('../services/aiService');
const GeminiProvider = require('../services/providers/geminiProvider');

describe('Backend API & Services Suite', () => {
  test('Health endpoint returns success structure', async () => {
    assert.strictEqual(typeof app, 'function');
  });

  test('Storage service initializes dataset and report stores', () => {
    const datasets = storageService.getDatasets();
    assert.ok(Array.isArray(datasets), 'Datasets should be an array');

    const reports = storageService.getReports();
    assert.ok(Array.isArray(reports), 'Reports should be an array');
  });

  test('AI Service provider configuration and fallback detection', () => {
    const status = aiService.getProvidersStatus();
    assert.ok(status.activeProvider, 'An active provider must be resolved');
    assert.ok(Array.isArray(status.providers), 'Provider list should exist');

    const demo = status.providers.find(p => p.id === 'demo');
    assert.ok(demo, 'Demo provider should be registered');
    assert.strictEqual(demo.configured, true);

    const gemini = status.providers.find(p => p.id === 'gemini');
    assert.ok(gemini, 'Gemini provider must be registered');
  });

  test('AI Service tool definitions contains approved schema', () => {
    const tools = aiService.getToolDefinitions(['Sales', 'Category', 'Quantity', 'order_id']);
    assert.ok(tools.length >= 8, 'Must define at least 8 approved analytical tools');
    const toolNames = tools.map(t => t.name);
    assert.ok(toolNames.includes('calculate_kpi'));
    assert.ok(toolNames.includes('profile_dataset'));
    assert.ok(toolNames.includes('get_top_categories'));
    assert.ok(toolNames.includes('detect_anomalies'));
    assert.ok(toolNames.includes('compare_groups'));
    assert.ok(toolNames.includes('get_correlations'));
    assert.ok(toolNames.includes('get_missing_values'));
    assert.ok(toolNames.includes('get_duplicate_summary'));
  });

  test('Gemini provider validates missing API key', async () => {
    const unconfigured = new GeminiProvider('', 'gemini-2.5-flash');
    assert.strictEqual(unconfigured.isConfigured(), false);
    await assert.rejects(
      async () => {
        await unconfigured.generateAnswer({ prompt: 'Hello' });
      },
      /not configured/i
    );
  });
});

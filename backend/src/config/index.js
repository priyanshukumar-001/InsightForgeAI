/**
 * InsightForge AI - Server Configuration
 * Centralized environment variable loader and validator.
 */

const path = require('path');
const dns = require('dns');
const dotenv = require('dotenv');

// Prioritize IPv4 on Windows to prevent undici/fetch timeouts on dual-stack networks
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

// Load .env from root directory (3 levels up) or backend directory
const rootDir = path.resolve(__dirname, '../../../');
dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  dataServiceUrl: process.env.DATA_SERVICE_URL || 'http://127.0.0.1:8000',
  uploadDir: path.resolve(rootDir, process.env.UPLOAD_DIR || 'private-uploads'),
  storageDir: path.resolve(rootDir, process.env.STORAGE_DIR || 'storage-data'),
  sampleDataDir: path.resolve(rootDir, 'sample-data'),
  maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB || '25', 10),

  // Multi-Provider AI Settings
  ai: {
    provider: (process.env.AI_PROVIDER || 'gemini').toLowerCase(),
    fallbackProvider: (process.env.AI_FALLBACK_PROVIDER || 'groq').toLowerCase(),
    model: process.env.AI_MODEL || '',
    geminiKey: process.env.GEMINI_API_KEY || '',
    groqKey: process.env.GROQ_API_KEY || '',
    openAiKey: process.env.OPENAI_API_KEY || '',
    openRouterKey: process.env.OPENROUTER_API_KEY || '',
    openAiCompatibleBaseUrl: process.env.OPENAI_COMPATIBLE_BASE_URL || '',
    openAiCompatibleKey: process.env.OPENAI_COMPATIBLE_API_KEY || '',
    timeoutMs: parseInt(process.env.AI_REQUEST_TIMEOUT_MS || '30000', 10),
    maxOutputTokens: parseInt(process.env.AI_MAX_OUTPUT_TOKENS || '1500', 10),
  },

  // Optional MongoDB URI (gracefully defaults to local file persistence if empty)
  mongoUri: process.env.MONGODB_URI || ''
};

module.exports = config;

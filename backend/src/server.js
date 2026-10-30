/**
 * InsightForge AI - Server Entrypoint
 */

const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`🚀 InsightForge AI Backend Server running`);
  console.log(`📡 URL: http://localhost:${config.port}`);
  console.log(`⚙️  Environment: ${config.env}`);
  console.log(`🤖 Configured AI Provider: ${config.ai.provider}`);
  console.log(`🐍 Python Data Engine: ${config.dataServiceUrl}`);
  console.log(`====================================================`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => console.log('HTTP server closed'));
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => process.exit(0));
});

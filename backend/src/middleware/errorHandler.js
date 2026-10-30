/**
 * InsightForge AI - Global Error Handler Middleware
 * Formats errors consistently according to Section 8 of SPEC:
 * { success: false, data: null, message: "...", error: { code, details } }
 */

const config = require('../config');

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || res.statusCode >= 400 ? res.statusCode : 500;
  const isProduction = config.env === 'production';

  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err.message);

  res.status(statusCode).json({
    success: false,
    data: null,
    message: err.message || 'An unexpected error occurred.',
    error: {
      code: err.code || 'INTERNAL_ERROR',
      ...(isProduction ? {} : { stack: err.stack })
    }
  });
}

module.exports = errorHandler;

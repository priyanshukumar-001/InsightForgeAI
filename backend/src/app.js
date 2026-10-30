/**
 * InsightForge AI - Express App Configuration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');

const healthRoutes = require('./routes/healthRoutes');
const datasetRoutes = require('./routes/datasetRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const reportRoutes = require('./routes/reportRoutes');
const historyRoutes = require('./routes/historyRoutes');

const app = express();

// Security and middleware
app.use(helmet({
  crossOriginResourcePolicy: false // Allows downloading reports & CSVs smoothly
}));

app.use(cors({
  origin: '*', // Allow frontend development requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api', healthRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/datasets', assistantRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api', historyRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;

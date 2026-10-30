/**
 * InsightForge AI - Report Generation Service
 * Compiles comprehensive data reports into downloadable HTML, Markdown, and JSON formats.
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const storageService = require('./storageService');
const datasetService = require('./datasetService');
const config = require('../config');

class ReportService {
  constructor() {
    this.reportsDir = path.join(config.storageDir, 'generated-reports');
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async getAllReports() {
    return storageService.getReports();
  }

  async getReportById(id) {
    return storageService.getReportById(id);
  }

  async generateReport({ datasetId, title, sections = ['summary', 'quality', 'statistics', 'insights'] }) {
    const dataset = await datasetService.getDatasetById(datasetId);
    if (!dataset) throw new Error('Dataset not found');

    const profile = await datasetService.getProfile(datasetId);
    const statistics = await datasetService.getStatistics(datasetId);

    const reportId = `rep-${Date.now()}-${uuidv4().substring(0, 6)}`;
    const reportTitle = title || `Comprehensive Analytics Report: ${dataset.name}`;

    // Compile report content
    const reportData = {
      id: reportId,
      datasetId: dataset.id,
      datasetName: dataset.name,
      filename: dataset.filename,
      title: reportTitle,
      createdAt: new Date().toISOString(),
      rowCount: profile.rowCount,
      columnCount: profile.columnCount,
      healthScore: profile.healthScore,
      columns: profile.columns,
      missingValues: profile.missingValues,
      numericStats: statistics.numeric || [],
      categoricalStats: statistics.categorical || [],
      correlations: statistics.correlations || {},
      keyInsights: [
        `Dataset contains ${profile.rowCount} records across ${profile.columnCount} columns.`,
        `Overall data health score is evaluated at ${profile.healthScore}/100.`,
        profile.duplicateRows > 0
          ? `Detected ${profile.duplicateRows} duplicate rows requiring review.`
          : 'Zero duplicate rows detected.',
        statistics.numeric?.length > 0
          ? `Analyzed ${statistics.numeric.length} numeric variables with descriptive bounds and deviations.`
          : 'No continuous numeric variables present for statistical testing.'
      ]
    };

    // Render HTML & Markdown files
    const htmlContent = this._renderHtml(reportData);
    const markdownContent = this._renderMarkdown(reportData);

    const htmlPath = path.join(this.reportsDir, `${reportId}.html`);
    const mdPath = path.join(this.reportsDir, `${reportId}.md`);

    fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
    fs.writeFileSync(mdPath, markdownContent, 'utf-8');

    const reportRecord = {
      id: reportId,
      title: reportTitle,
      datasetId: dataset.id,
      datasetName: dataset.name,
      htmlPath,
      mdPath,
      summary: `Report generated for ${dataset.name} (${profile.rowCount} rows, score ${profile.healthScore}/100)`,
      status: 'completed',
      createdAt: reportData.createdAt
    };

    storageService.saveReport(reportRecord);

    // Save to history
    storageService.addHistory({
      type: 'report',
      datasetId: dataset.id,
      datasetName: dataset.name,
      title: `Generated report "${reportTitle}"`,
      reportId
    });

    return reportRecord;
  }

  _renderHtml(data) {
    const numericRows = (data.numericStats || []).map(s => `
      <tr>
        <td style="font-weight: 600;">${s.column}</td>
        <td>${s.mean}</td>
        <td>${s.median}</td>
        <td>${s.std}</td>
        <td>${s.min}</td>
        <td>${s.max}</td>
        <td>${s.sum.toLocaleString()}</td>
      </tr>
    `).join('');

    const columnRows = (data.columns || []).map(c => `
      <tr>
        <td><strong>${c.name}</strong></td>
        <td><span class="badge ${c.inferredType}">${c.inferredType}</span></td>
        <td>${c.nonNullCount}</td>
        <td>${c.missingCount} (${c.missingPercentage}%)</td>
        <td>${c.uniqueCount}</td>
      </tr>
    `).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${data.title} - InsightForge AI</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #F4F8FF; color: #14213D; margin: 0; padding: 40px; }
    .container { max-width: 900px; margin: 0 auto; background: #FFFFFF; border-radius: 16px; border: 1px solid #DCE6F5; box-shadow: 0 4px 20px rgba(0,0,0,0.05); padding: 40px; }
    .header { border-bottom: 2px solid #EAF2FF; padding-bottom: 20px; margin-bottom: 30px; }
    h1 { color: #123B8A; margin: 0 0 10px 0; font-size: 28px; }
    .meta { color: #64748B; font-size: 14px; }
    .kpis { display: flex; gap: 20px; margin: 25px 0; }
    .kpi { flex: 1; background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 15px; text-align: center; }
    .kpi .val { font-size: 24px; font-weight: 700; color: #2563EB; }
    .kpi .lbl { font-size: 12px; color: #64748B; text-transform: uppercase; margin-top: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
    th { background: #EAF2FF; color: #123B8A; text-align: left; padding: 10px 12px; border-bottom: 1px solid #DCE6F5; }
    td { padding: 10px 12px; border-bottom: 1px solid #F1F5F9; }
    .badge { padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
    .badge.numeric { background: #DBEAFE; color: #1E40AF; }
    .badge.categorical { background: #FEF3C7; color: #92400E; }
    .badge.datetime { background: #E0E7FF; color: #3730A3; }
    .insights { background: #F0FDF4; border-left: 4px solid #16A34A; padding: 15px 20px; border-radius: 8px; margin: 25px 0; }
    .insights ul { margin: 0; padding-left: 20px; }
    .insights li { margin-bottom: 6px; color: #14532D; }
    .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${data.title}</h1>
      <div class="meta">Dataset: <strong>${data.filename}</strong> | Generated on: ${new Date(data.createdAt).toLocaleString()}</div>
    </div>

    <div class="kpis">
      <div class="kpi"><div class="val">${data.rowCount.toLocaleString()}</div><div class="lbl">Total Records</div></div>
      <div class="kpi"><div class="val">${data.columnCount}</div><div class="lbl">Variables / Columns</div></div>
      <div class="kpi"><div class="val">${data.healthScore} / 100</div><div class="lbl">Data Health Score</div></div>
    </div>

    <div class="insights">
      <h3 style="margin-top: 0; color: #166534;">Executive Findings</h3>
      <ul>
        ${data.keyInsights.map(i => `<li>${i}</li>`).join('')}
      </ul>
    </div>

    <h2>Variable Schema & Health</h2>
    <table>
      <thead>
        <tr><th>Column</th><th>Type</th><th>Non-Null</th><th>Missing (%)</th><th>Unique Values</th></tr>
      </thead>
      <tbody>
        ${columnRows}
      </tbody>
    </table>

    ${data.numericStats.length > 0 ? `
    <h2>Descriptive Numeric Statistics</h2>
    <table>
      <thead>
        <tr><th>Column</th><th>Mean</th><th>Median</th><th>Std Dev</th><th>Min</th><th>Max</th><th>Sum</th></tr>
      </thead>
      <tbody>
        ${numericRows}
      </tbody>
    </table>
    ` : ''}

    <div class="footer">
      Generated automatically by <strong>InsightForge AI</strong> - Verified Deterministic Computations
    </div>
  </div>
</body>
</html>`;
  }

  _renderMarkdown(data) {
    return `# ${data.title}

**Dataset:** ${data.filename}  
**Date:** ${new Date(data.createdAt).toLocaleString()}  
**Health Score:** ${data.healthScore}/100  
**Rows:** ${data.rowCount} | **Columns:** ${data.columnCount}

---

## Executive Summary
${data.keyInsights.map(i => `- ${i}`).join('\n')}

---

## Schema Overview
| Column | Inferred Type | Non-Null Count | Missing (%) | Unique |
|---|---|---|---|---|
${(data.columns || []).map(c => `| ${c.name} | ${c.inferredType} | ${c.nonNullCount} | ${c.missingPercentage}% | ${c.uniqueCount} |`).join('\n')}

---

## Numeric Statistics
| Column | Mean | Median | Std Dev | Min | Max | Sum |
|---|---|---|---|---|---|---|
${(data.numericStats || []).map(s => `| ${s.column} | ${s.mean} | ${s.median} | ${s.std} | ${s.min} | ${s.max} | ${s.sum} |`).join('\n')}

---
*Generated by InsightForge AI*
`;
  }
}

module.exports = new ReportService();

# InsightForge AI — REST API Reference

The InsightForge backend provides a clean RESTful interface adhering to the standard response envelope:
```json
{
  "success": true,
  "data": {},
  "message": "Optional human-readable description",
  "error": null
}
```

---

## 1. System Endpoints

### `GET /api/health`
Returns the operational health of the Node.js API gateway and the Python FastAPI computing service.

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "server": "InsightForge Express Backend",
    "version": "2.0.0",
    "dataEngine": { "status": "healthy", "engine": "FastAPI + Pandas + NumPy" }
  }
}
```

### `GET /api/system/status`
Returns full system connectivity status, provider readiness, and total dataset counts.

---

## 2. Dataset Endpoints

### `GET /api/datasets`
Returns all registered datasets (including pre-loaded sample datasets and user uploads).

### `POST /api/datasets/upload`
Uploads a new CSV (`.csv`) or Excel (`.xlsx`, `.xls`) dataset.  
- **Payload:** `multipart/form-data` with `file` field.
- **Limit:** 25 MB.
- **Process:** File is stored in `private-uploads/` and immediately profiled.

### `GET /api/datasets/:id`
Retrieves dataset metadata and cached profile.

### `GET /api/datasets/:id/preview?page=1&pageSize=20&search=`
Returns paginated, searchable rows without transmitting huge files to the client.

### `GET /api/datasets/:id/profile`
Returns deep schema metrics: inferred semantic datatypes, non-null counts, missing value counts & percentages, unique counts, sample values, duplicate row count, and 0-100 data health score.

### `GET /api/datasets/:id/analytics`
Returns descriptive statistics for numeric variables (mean, std, min, Q1, median, Q3, max, sum, skewness), categorical frequency distributions, and Pearson correlation matrix.

### `POST /api/datasets/:id/chart-data`
Returns Recharts-formatted series data for specified dimensions.
- **Body:**
  ```json
  {
    "chartType": "bar",
    "xAxis": "Category",
    "yAxis": "TotalAmount",
    "aggregation": "sum"
  }
  ```

### `POST /api/datasets/:id/clean`
Applies non-destructive cleaning transformations and outputs a new cleaned dataset.
- **Body:**
  ```json
  {
    "operations": [
      { "type": "drop_duplicates" },
      { "type": "fill_missing", "column": "MonthlyCharges", "strategy": "mean" }
    ]
  }
  ```

### `GET /api/datasets/:id/export`
Downloads the raw or cleaned dataset as a CSV file.

---

## 3. AI Assistant Endpoints

### `GET /api/assistant/providers`
Returns configured model providers, active provider, fallback readiness, and whether the system is in Demo Mode.

### `POST /api/datasets/:id/assistant`
Submits a natural language analytical question grounded in the specified dataset.
- **Body:**
  ```json
  {
    "question": "What is the average sale price across each product category?",
    "history": []
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "answer": "Based on deterministic calculation...",
      "provider": "gemini",
      "isDemo": false,
      "toolExecuted": "compare_groups",
      "chartData": { ... },
      "auditTrail": [ ... ]
    }
  }
  ```

---

## 4. Reports & History Endpoints

### `GET /api/reports`
Returns all generated reports.

### `POST /api/reports`
Compiles an executive summary report into HTML and Markdown.

### `GET /api/reports/:id/download?format=html|md`
Downloads the standalone styled report document.

### `GET /api/history`
Returns past analytical questions, data cleaning records, and report generation events.

### `DELETE /api/history`
Clears analytical activity history.

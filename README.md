# InsightForge AI — Intelligent Data Analytics Copilot

[![Architecture](https://img.shields.io/badge/Architecture-Monorepo%20Decoupled-blue.svg)](#architecture)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20Tailwind-61DAFB.svg)](#technology-stack)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green.svg)](#technology-stack)
[![Data Engine](https://img.shields.io/badge/Data%20Engine-FastAPI%20%2B%20Pandas%20%2B%20NumPy-yellow.svg)](#technology-stack)
[![AI Providers](https://img.shields.io/badge/AI%20Providers-Gemini%20%7C%20Groq%20%7C%20OpenAI%20%7C%20Demo-purple.svg)](#ai-provider-system)

**InsightForge AI** is a production-minded data analytics copilot. Users upload raw CSV or Excel datasets, audit missing values and duplicate rows, generate interactive charts, and ask analytical questions in everyday language—receiving answers strictly calculated by deterministic mathematical tools.

---

## Key Features

1. **Automated Quality Profiling**:
   - Semantic column type inference (numeric, categorical, datetime, boolean, text).
   - Missing cell count and percentage audit per feature.
   - Duplicate row detection and 0–100 data completeness health scoring.
2. **Interactive Visualizations (Recharts)**:
   - Dynamic Bar charts, time-series Line trends, correlation Scatter plots, and Pie distributions.
   - Interactive Chart Builder allowing custom X/Y variable and aggregation selection (Sum, Mean, Count, Max).
3. **Multi-Provider AI with Strict Grounding**:
   - Multi-provider support for **Google Gemini**, **Groq**, **OpenAI**, and **OpenRouter**.
   - Built-in safe **Demo Copilot** for zero-cost evaluation without any external API key.
   - Server-side tool execution (`profile_dataset`, `calculate_kpi`, `get_top_categories`, `detect_anomalies`, `compare_groups`, `get_chart_data`).
   - Audit trail ("How this was calculated") showing verified tool calls and arguments.
4. **Non-Destructive Data Cleaning**:
   - Duplicate removal and missing-value imputation (Mean, Median, Drop).
   - Preserves original raw uploads and outputs a new cleaned dataset version with before/after audit summaries.
5. **Executive Reports & Exports**:
   - One-click downloadable standalone HTML Reports (printable, responsive, formatted tables and KPI summaries).
   - Downloadable Markdown Reports and cleaned CSV datasets.
6. **Local Persistence**:
   - Atomic local JSON file storage with zero external database prerequisites.
   - Optional MongoDB Atlas sync via `MONGODB_URI`.

---

## Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React Icons |
| **Backend Gateway** | Node.js LTS, Express, Multer, Helmet, CORS, express-rate-limit, Zod |
| **Data Engine** | Python 3.13+, FastAPI, Pandas, NumPy, openpyxl, Uvicorn |
| **AI Providers** | Google Gemini API (`gemini-1.5-flash`), Groq API (`llama-3.3-70b-versatile`), OpenAI API (`gpt-4o-mini`), OpenRouter API, Built-in Demo Copilot |
| **Storage** | Atomic JSON storage in `storage-data/`, private uploads in `private-uploads/` |

---

## Folder Structure

```
d:/MIni Project 3rd Year/
├── package.json              # Monorepo root scripts & test runners
├── .env.example              # Environment variables template
├── README.md                 # Project documentation
├── RUN_PROJECT.txt           # Step-by-step beginner run instructions
├── docs/
│   ├── ARCHITECTURE.md       # High-level architecture & guarantees
│   ├── API.md                # Full REST API endpoint reference
│   └── UI_GUIDE.md           # Design system tokens, type scale, colors
├── sample-data/
│   ├── sales_sample.csv      # Retail sales sample dataset (25 rows, 10 cols)
│   ├── customer_churn_sample.csv # Telecom churn sample dataset (20 rows)
│   ├── employee_performance.csv  # HR analytics sample dataset (15 rows)
│   └── README.md
├── frontend/                 # React 18 + Vite frontend
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── components/       # Layout, Card, Button, Badge, Recharts, Table
│   │   ├── pages/            # Landing, Dashboard, Upload, DatasetView, Analytics, Assistant, Reports, History, Settings
│   │   ├── services/         # apiClient.ts
│   │   ├── types/            # TypeScript contracts
│   │   └── styles/           # index.css with design tokens
├── backend/                  # Node.js + Express API
│   ├── package.json
│   ├── src/
│   │   ├── server.js         # Entrypoint
│   │   ├── app.js            # Express app configuration & middleware
│   │   ├── config/           # Environment loader & validator
│   │   ├── services/
│   │   │   ├── aiService.js  # Multi-provider orchestrator & tool executor
│   │   │   ├── providers/    # Gemini, Groq, OpenAI, OpenRouter, Demo
│   │   │   ├── datasetService.js
│   │   │   ├── reportService.js
│   │   │   └── storageService.js
│   │   ├── routes/           # health, datasets, assistant, reports, history
│   │   └── tests/            # api.test.js
└── data-service/             # Python FastAPI computing engine
    ├── requirements.txt
    ├── run_tests.py          # Cross-platform unit test runner
    ├── app/
    │   ├── main.py           # FastAPI app & tool endpoints
    │   └── services/         # profiling.py, statistics.py, cleaning.py, charts.py
    └── tests/                # test_analytics.py, test_service.py
```

---

## Prerequisites & Installation

- **Node.js**: v18.0.0 or higher (`node -v`)
- **Python**: v3.11, v3.12, or v3.13 (`py -3.13 --version` or `python --version`)
- **npm**: v9.0.0 or higher (`npm -v`)

### Step 1. Clone & Setup Dependencies
In the root project directory:
```bash
# 1. Install root dependencies
npm install

# 2. Install backend dependencies
cd backend && npm install && cd ..

# 3. Install frontend dependencies
cd frontend && npm install && cd ..
```

### Step 2. Configure Environment
Copy the example environment file:
```bash
cp .env.example .env
```
*(On Windows PowerShell: `copy .env.example .env`)*

---

## Running the Application

To run all three layers simultaneously, open three separate terminal windows:

### Terminal 1: Python Data Engine (Port 8000)
```bash
py -3.13 -m uvicorn app.main:app --port 8000 --app-dir data-service --reload
```
*Health Check: `http://127.0.0.1:8000/health`*

### Terminal 2: Node.js Express Backend (Port 5000)
```bash
npm run start:backend
```
*Health Check: `http://localhost:5000/api/health`*

### Terminal 3: React + Vite Frontend (Port 5173)
```bash
npm run start:frontend
```
*Application URL: `http://localhost:5173`*

---

## Configuring AI Providers

InsightForge AI runs out-of-the-box in **Built-in Demo Copilot Mode** without needing any API key.

To connect live external models, add your key to `.env`:

### 1. Google Gemini (Default recommended free tier)
```dotenv
AI_PROVIDER=gemini
AI_MODEL=gemini-1.5-flash
GEMINI_API_KEY=your_gemini_api_key_here
```
*Get free API key at [ai.google.dev](https://ai.google.dev/gemini-api/docs)*

### 2. Groq Cloud (Ultra-fast inference)
```dotenv
AI_PROVIDER=groq
AI_MODEL=llama-3.3-70b-versatile
GROQ_API_KEY=your_groq_api_key_here
```
*Get API key at [console.groq.com](https://console.groq.com/docs)*

### 3. OpenAI
```dotenv
AI_PROVIDER=openai
AI_MODEL=gpt-4o-mini
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. OpenRouter
```dotenv
AI_PROVIDER=openrouter
AI_MODEL=meta-llama/llama-3.2-3b-instruct:free
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

---

## Testing & Verification

Run the entire verification suite (Backend + Python Data Service + Frontend Build) with a single command from the project root:

```bash
npm test
```

### Individual Test Suites:
- **Backend Tests (Node test runner)**: `npm run test:backend`
- **Data Service Tests (12 Pandas/Stats tests)**: `npm run test:data`
- **Frontend Production Build**: `npm run test:frontend`

---

## Official Provider Documentation
- Google Gemini API: https://ai.google.dev/gemini-api/docs
- Groq Cloud Docs: https://console.groq.com/docs
- OpenAI API Reference: https://platform.openai.com/docs
- OpenRouter Documentation: https://openrouter.ai/docs

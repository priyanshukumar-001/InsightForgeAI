# InsightForge AI — System Architecture

**InsightForge AI** is an enterprise-grade, student-friendly data analytics copilot architected as a decoupled monorepo. It features strict separation of concerns between user presentation, business logic orchestration, and deterministic scientific calculations.

---

## High-Level Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    User Browser Client                      │
│     React 18 + Vite + Tailwind CSS + Recharts + Lucide      │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express API Gateway                       │
│     Node.js LTS, Helmet, CORS, Multer, Zod Validation       │
├──────────────────────────────┬──────────────────────────────┤
│ Multi-Provider AI Engine     │ Storage & Reports Service    │
│ - Gemini Provider            │ - Atomic Local JSON Store    │
│ - Groq Cloud Provider        │ - Optional MongoDB Sync      │
│ - OpenAI Provider            │ - HTML / Markdown Generator  │
│ - OpenRouter Provider        │ - CSV Export Manager         │
│ - Built-in Demo Copilot      │                              │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Python Data Analytics Engine                    │
│           FastAPI + Pandas + NumPy + openpyxl               │
│                                                             │
│  - Dataset Profiling & Semantic Datatype Inference          │
│  - Descriptive Statistics & Pearson Correlation Matrix      │
│  - Outlier Detection via Interquartile Range (IQR) Rule     │
│  - Deterministic Cleaning Pipelines (Deduplication, Impute) │
│  - Bounded Chart Data Preparation for Recharts              │
│  - Isolated Tool Execution for AI Assistant Grounding       │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Architectural Guarantees

### 1. Grounded Numerical Answers (No LLM Hallucinations)
The system strictly prohibits language models from inventing, estimating, or computing mathematical results in their text generation weights. Instead:
1. The user asks an analytical question (e.g. *"What is the total revenue in the North region?"*).
2. The model requests an approved tool: `calculate_kpi(column='TotalAmount', operation='sum')`.
3. The Express backend validates tool parameters against strict schemas and allowlisted column names.
4. The Python FastAPI service calculates the exact number via Pandas.
5. The verified result is fed back into the model to construct an audited, verifiable natural language explanation accompanied by interactive charts.

### 2. Multi-Provider Fallback Resilience
- The system supports **Google Gemini**, **Groq**, **OpenAI**, and **OpenRouter**.
- If the primary provider experiences a rate limit or transient network timeout, the engine automatically routes to the configured fallback provider with exponential backoff.
- If no external API key is configured, the system activates the **Built-in Demo Copilot**, ensuring evaluators and students can test the full analytical workflow out-of-the-box with zero setup cost.

### 3. Data Privacy and Security
- Uploaded CSV and Excel files are stored strictly outside public web roots in `private-uploads/`.
- No raw datasets or personal identifiers are ever sent to external model training queues.
- API keys are exclusively loaded from server environment variables and are never transmitted to the browser.

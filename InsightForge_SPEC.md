m# InsightForge AI --- Complete Product, UI/UX, Engineering and Delivery Specification

**Version:** 2.0\
**Date:** 28 October 2026\
**Primary implementer:** Antigravity\
**Project type:** Student mini-project built with production-minded
practices

> **Read this entire document before coding.** Build the complete
> project, not only a UI mockup. This specification also requires
> Antigravity to create and maintain `README.md` and `RUN_PROJECT.txt`
> inside the project root. Those two files must contain the actual final
> project details and tested run commands.

------------------------------------------------------------------------

## 1. Project vision

**InsightForge AI** is an intelligent data analytics copilot. A user
uploads a CSV or Excel dataset, inspects its quality, explores charts,
asks questions in everyday language, and exports useful analysis without
needing to write code.

### Main user journey

1.  Visit the public landing page.
2.  Start the app, sign in if real authentication is implemented, or
    enter a clearly labelled demo mode.
3.  Upload a CSV/Excel file or load a sample dataset.
4.  Preview the data and inspect data types, missing values, duplicates
    and statistics.
5.  Explore analytics and charts.
6.  Ask the AI Assistant a question about the selected dataset.
7.  See an answer grounded in actual calculations, with a chart/table
    where useful.
8.  Export cleaned data or a report and revisit analysis history where
    persistence is enabled.

### Non-negotiable product rules

-   Do not stop at a beautiful static mockup.
-   Every visible button, link, tab, dropdown, filter and form must
    work, navigate correctly, or be clearly disabled with an
    explanation.
-   Sample data must be labelled **Sample data**. Demo answers must
    never be presented as results from a real uploaded file.
-   Calculate numerical results in code. Use an LLM to understand the
    question, select approved tools, and explain computed results---not
    to invent statistics.
-   Never claim authentication, persistence, AI, exports, security, or
    deployment works unless it has actually been implemented and tested.
-   Prefer readable, beginner-friendly code with useful comments and a
    clean folder structure.
-   If a feature cannot be completed, leave a safe, clearly labelled
    fallback and document the limitation.

------------------------------------------------------------------------

## 2. Visual identity and UI/UX design system

### 2.1 Overall look

Use the selected **blue-gradient, white, and deep navy** visual
direction: modern, professional, eye-pleasing, rounded, and easy to
scan.

-   Main content canvas: very light cool blue.
-   Cards: white, with a subtle border and soft shadow.
-   App sidebar: deep navy with a blue active state.
-   Main CTA: restrained blue gradient.
-   Cyan: secondary accent for data visualizations and selected details.
-   Amber/red/green: status colours only when semantically appropriate.
-   Use generous whitespace and align content to a consistent grid.
-   Avoid a generic "AI landing page" appearance: no excessive glowing
    orbs, random floating blobs everywhere, giant gradients on every
    card, excessive glassmorphism, repeated identical cards, fake
    testimonials, fake customer logos, or meaningless statistics.

### 2.2 Colour tokens

Define reusable CSS variables or Tailwind theme tokens; do not scatter
hex values throughout the code.

  Token                      Value       Use
  -------------------------- ----------- --------------------------
  `--color-page`             `#F4F8FF`   Main page background
  `--color-surface`          `#FFFFFF`   Cards, forms, tables
  `--color-surface-soft`     `#EAF2FF`   Soft blue panels
  `--color-text`             `#14213D`   Main text
  `--color-text-muted`       `#64748B`   Secondary text
  `--color-primary`          `#2563EB`   Main buttons and links
  `--color-primary-dark`     `#123B8A`   Dark blue accents
  `--color-cyan`             `#06B6D4`   Secondary accent
  `--color-success`          `#059669`   Success states
  `--color-warning`          `#D97706`   Warning states
  `--color-danger`           `#DC2626`   Error/destructive states
  `--color-border`           `#DCE6F5`   Borders and dividers
  `--color-sidebar`          `#0B1730`   Sidebar background
  `--color-sidebar-active`   `#155EEF`   Active sidebar item

Suggested gradient for selected actions and the landing hero artwork:
`linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)`.

Use gradients selectively. Body text must never sit on a busy gradient
if contrast becomes poor.

### 2.3 Typography

-   Primary font: **Inter**, with a system sans-serif fallback.
-   Landing hero: 48--60 px on large desktop, scaling down on mobile.
-   App page headings: 26--32 px.
-   Card headings: 15--18 px.
-   Body text: 14--16 px.
-   Supporting labels: usually 12--13 px, with sufficient contrast.
-   Keep a consistent type scale and font weights. Do not mix multiple
    unrelated fonts.

### 2.4 Component shape, spacing and elevation

-   Main cards: 16--20 px radius.
-   Inputs and buttons: 10--12 px radius.
-   Small status badges may be pill-shaped when this improves scanning.
-   Use a consistent 4 px or 8 px spacing scale.
-   Prefer thin borders and soft shadows over heavy shadows.
-   Tables must have enough row height and horizontal spacing to remain
    readable.
-   Keep empty states visually calm and actionable.

### 2.5 Charts

Use **Recharts** for React chart components.

-   Use a consistent palette: blue, cyan, teal, amber, and another
    series colour only when needed.
-   Add chart title, labels, tooltips, and legends when useful.
-   Bar chart: category comparison.
-   Line chart: trend over valid dates/time.
-   Histogram or box plot: numeric distribution.
-   Scatter plot: relationship between two numeric columns.
-   Avoid 3D charts and excessive animation.
-   Charts must display data returned by the analysis layer, never
    invented values.

------------------------------------------------------------------------

## 3. Technology stack and architecture

Use a monorepo that separates the user interface, API, and data
processing.

### Frontend

-   React + Vite.
-   TypeScript preferred for clear data contracts; if the team
    intentionally chooses JavaScript, use it consistently.
-   Tailwind CSS.
-   React Router.
-   Recharts.
-   Lucide React icons.
-   Framer Motion or an equivalent small animation library for
    purposeful motion.

### Backend

-   Node.js LTS + Express.
-   Keep controllers, services, validators and routes separate.
-   Multer or a maintained equivalent for uploads.
-   Zod or an equivalent schema validator.
-   Helmet, explicit CORS configuration, and rate limiting.

### Data processing

-   Python + Pandas + NumPy.
-   Expose the analysis functions through FastAPI.
-   Keep profiling, cleaning, statistics and chart-data logic in
    reusable Python service functions.
-   Define and document the JSON contract between Node and Python.

### Database and file storage

-   MongoDB Atlas + Mongoose for user profiles, dataset metadata,
    history and report metadata if persistence is implemented.
-   Do not put large raw files directly into MongoDB documents.
-   Local temporary upload storage is acceptable for a student MVP only
    if its limitations are explained. For durable production deployment,
    use managed/object storage and a retention/cleanup strategy.
-   Never store uploaded files in a public static directory.

### AI provider integration

The app must support multiple model providers through one
provider-independent service layer. Do not tightly couple the entire
application to one vendor.

Required provider options: 1. **Google Gemini API** --- useful as an
initial/default provider if a suitable model and quota are available. 2.
**Groq API** --- useful for fast inference and models offered through
its API. 3. **OpenAI API** --- optional/paid-ready provider; do not
assume an API account has free credits. 4. **OpenRouter API** ---
optional aggregator for selecting among supported models, including any
currently available free models. 5. **Compatible custom endpoint** ---
optional advanced configuration for providers that implement an
OpenAI-compatible API.

The app must still start without any AI provider key. In that case, show
an honest "AI provider not configured" state and allow dataset
upload/profiling/chart features to work. If a demo assistant is
included, label it clearly as a demo rather than pretending it is a live
model.

### Testing and deployment

-   Frontend: Vitest + React Testing Library.
-   Backend: Node test runner or Vitest/Jest + Supertest.
-   Python: pytest.
-   Frontend deployment: Vercel or similar.
-   Backend and Python service: compatible application hosts.
-   Database: MongoDB Atlas if used.
-   Add Dockerfiles/docker-compose only if they actually work and their
    purpose is documented.

Do not select model names based on old tutorials alone. Model IDs, free
quotas, API policies and rate limits change; verify current provider
documentation during implementation and document the chosen model and
date checked.

------------------------------------------------------------------------

## 4. AI provider system: multi-provider, free-tier-aware and safe

### 4.1 Provider requirements

Create a server-side AI provider abstraction, for example:

-   `AIProvider` interface or equivalent.
-   `GeminiProvider`.
-   `GroqProvider`.
-   `OpenAIProvider`.
-   `OpenRouterProvider`.
-   Optional `OpenAICompatibleProvider`.

The names may vary, but each adapter should expose a consistent method
such as `generateAnswer(...)` and, when supported,
`generateWithTools(...)`.

The rest of the app should call a single `aiService` rather than
importing provider SDKs across many routes or components.

### 4.2 Environment-based selection

Use environment variables such as the following, adapting the names to
the implementation:

``` dotenv
AI_PROVIDER=gemini
AI_MODEL=
GEMINI_API_KEY=
GROQ_API_KEY=
OPENAI_API_KEY=
OPENROUTER_API_KEY=
OPENAI_COMPATIBLE_BASE_URL=
OPENAI_COMPATIBLE_API_KEY=
AI_REQUEST_TIMEOUT_MS=30000
AI_MAX_OUTPUT_TOKENS=1200
```

Rules: - Never put secrets in frontend variables or expose them in
browser requests. - Never commit `.env`. - Provide `.env.example` with
empty placeholders only. - Validate the selected provider and required
key at backend startup or when the AI feature is called. - If the
selected provider key is missing, return a clear configuration error
rather than crashing the whole server. - Let the operator switch
providers by changing server environment variables and restarting the
backend; a provider dropdown in the UI is optional and should only be
added if implemented securely. - Do not expose API keys or sensitive
environment settings through a public config endpoint.

### 4.3 Provider selection and fallback

Support a configurable primary provider and an optional fallback
provider, for example:

``` dotenv
AI_PROVIDER=gemini
AI_FALLBACK_PROVIDER=groq
```

Fallback requirements: - Use fallback only for appropriate temporary
errors such as timeout, provider outage, or rate limiting. - Do not
silently retry indefinitely. - Limit retries and use exponential backoff
with jitter where appropriate. - Do not retry invalid requests or
authentication failures as if they were temporary. - Log provider name,
latency, status and request ID, but never log API keys or full raw
datasets. - Return a useful error if all providers fail. - Do not assume
every provider supports the same tool-calling or structured-output
features. Each adapter must declare supported capabilities and use a
compatible flow.

### 4.4 Free API and cost guidance

The project should be usable on a student budget, but **"free" does not
mean unlimited or guaranteed forever**.

-   Gemini may offer a free tier for some models and regions; check
    current quota and data-use terms.
-   Groq offers API access with account/model-specific rate limits;
    check current limits in the provider console.
-   OpenAI API is a separate API billing product; ChatGPT subscription
    access does not automatically mean API usage is free.
-   OpenRouter may offer certain free models, but model availability,
    rate limits, routing and reliability vary.
-   Other providers may be added through the adapter pattern after
    checking their official docs, terms, limits and SDK compatibility.
-   Never promise a fixed free quota in the UI or README unless it is
    verified and date-stamped.
-   Do not automatically switch a user onto a paid provider or paid
    model without explicit configuration/consent.
-   Show a helpful message when quota/rate limits are reached and
    explain which provider is configured, without leaking credentials.

During implementation, check the official provider docs and include
useful links in `README.md`: - Gemini API documentation and pricing:
https://ai.google.dev/gemini-api/docs - Groq documentation and rate
limits: https://console.groq.com/docs - OpenAI API documentation and
pricing: https://platform.openai.com/docs - OpenRouter developer docs:
https://openrouter.ai/docs

These links are starting points; verify current model names, limits and
prices rather than copying stale values from this specification.

### 4.5 AI tool calling and data grounding

The AI Assistant must use the actual dataset and approved analysis
tools.

Initial tools: - `profile_dataset`: row/column counts, data types,
missing values. - `calculate_kpi`: validated aggregation on selected
columns. - `filter_dataset`: validated filtering through an allowlist. -
`compare_groups`: compare numeric measures by category. -
`detect_anomalies`: a documented, explainable method such as IQR. -
`get_chart_data`: return bounded chart-ready data. -
`get_top_categories`: top-N counts or aggregations.

Workflow: 1. Validate the request and confirm the dataset is available
to the current session/user. 2. Create a compact dataset profile and
tool definitions. 3. Ask the configured model to respond or request an
approved tool. 4. Validate tool name and arguments against strict
schemas and allowlisted columns/operators. 5. Execute the tool in the
data-analysis service. 6. Give the model the actual tool result if a
natural-language explanation is needed. 7. Validate the final response
structure and return it to the UI. 8. Save history only if persistence
is implemented and enabled.

Security/correctness rules: - Never execute arbitrary Python,
JavaScript, SQL, shell commands, or model-generated code. - Treat
dataset cell contents as untrusted data, not system instructions. -
Never let model output bypass schema validation. - Do not send the
entire raw dataset to an LLM by default. - Limit rows, columns, input
length and output length. - If the dataset cannot answer a question, say
so. - Numerical answers must be grounded in tool results. - Provide a
fallback explanation when a model does not support function calling; use
a safe structured plan or disable tool calling for that provider rather
than pretending it worked.

### 4.6 Provider capability matrix

Create and maintain a small internal capability map for each adapter:

  Capability               Why it matters
  ------------------------ --------------------------------------
  Text generation          General AI explanations
  Tool/function calling    Dataset-grounded analytics
  JSON/structured output   Reliable UI response schema
  Streaming                Optional progressive response
  Vision                   Not required for MVP
  Embeddings               Future semantic search/RAG
  Usage metadata           Helpful for debugging/cost awareness

Do not assume all models/providers support all features. The UI should
work when streaming is unavailable. Tool calling is required for live
dataset Q&A, or the provider must use an equally safe, validated
alternative.

------------------------------------------------------------------------

## 5. Application pages and routes

Use these baseline routes; minor naming changes are acceptable if
documented.

  -----------------------------------------------------------------------
  Route                   Page                    Purpose
  ----------------------- ----------------------- -----------------------
  `/`                     Landing                 Explain product and
                                                  invite users to try it

  `/login`                Sign in                 Sign-in or clearly
                                                  documented demo entry

  `/signup`               Sign up                 Only if real
                                                  authentication exists

  `/app/dashboard`        Dashboard               Dataset overview and
                                                  recent activity

  `/app/upload`           Upload                  Upload CSV/Excel or
                                                  choose sample data

  `/app/datasets/:id`     Dataset view            Preview, data types and
                                                  quality

  `/app/analytics/:id`    Analytics               Charts, statistics and
                                                  comparisons

  `/app/assistant/:id`    AI Assistant            Ask dataset-specific
                                                  questions

  `/app/reports`          Reports                 Generate/download
                                                  supported outputs

  `/app/history`          History                 Reopen saved analyses
                                                  and questions

  `/app/settings`         Settings                Functional preferences

  `*`                     Not found               Helpful 404 page
  -----------------------------------------------------------------------

Shared app shell: - Dark navy sidebar. - Brand and logo. - Dashboard,
Upload Data, Dataset View, Analytics, AI Assistant, Reports, History,
Settings. - Active item is obvious without relying on colour alone. -
Top bar can contain search, profile/demo mode and notifications only if
they work. - Mobile layout uses a drawer or compact navigation.

------------------------------------------------------------------------

## 6. Detailed page requirements

### 6.1 Landing page

Sections: 1. Navigation: brand, Features, How it works, Use cases, Sign
in, Get started. 2. Hero: "Turn Your Data Into Actionable Insights",
simple explanation, primary CTA, secondary demo CTA. 3. Original product
preview made from components/SVG, with sample data clearly labelled. 4.
Feature cards: upload, analytics, AI questions, reports. 5. How it
works: Upload → Explore → Ask AI → Export. 6. Use cases: business,
research/student datasets, sales, sports/CSV analysis. 7. Example output
based on a sample dataset. 8. FAQ: formats, coding requirement, AI
provider setup, data handling. 9. Footer with real links only.

Landing animation: - Staggered hero fade/slide. - Chart bars/lines draw
in once. - Subtle background gradient movement. - Feature cards reveal
on scroll. - Short button hover/press transitions. - Do not animate
every item at once; respect `prefers-reduced-motion`.

### 6.2 Dashboard

-   Welcome heading and Upload Dataset CTA.
-   KPI cards for dataset count, analyses, insights and storage; real
    values or labelled demo values only.
-   Recent datasets table: filename, rows, columns, upload date, status
    and open action.
-   Quick insights derived from actual results.
-   Small chart preview from the selected dataset.
-   Helpful empty state for first-time users.
-   No fake percentage growth without historical data.

### 6.3 Upload

-   Drag-and-drop and Choose File.
-   Support CSV/XLSX/XLS only when parser support is real.
-   Show file size limit and supported formats.
-   Validate size/type/content on the server.
-   Show upload/processing states and upload result.
-   Clear errors for empty, corrupt, unsupported or oversized files.
-   Provide labelled sample datasets.
-   Store files outside public directories and clean temporary files.

### 6.4 Dataset view

Sections/tabs: - Data Preview: paginated, searchable, bounded preview. -
Column Info: type, non-null count, missing count/percentage, unique
count. - Missing Values: per-column counts and percentages. - Summary:
numeric descriptive statistics and categorical frequencies. -
Correlations: numeric-only when appropriate. - Actions: export cleaned
CSV, open analytics, ask AI.

Never render a huge file into the browser all at once. Do not silently
fill/drop missing values. Cleaning must preserve the original and show a
preview/before-after summary.

### 6.5 Analytics

-   Overview, numeric distributions, categorical breakdown, top-N
    analysis.
-   Date/time trend only when valid dates exist.
-   Correlations only when applicable.
-   Filters update results.
-   Titles, labels, units, tooltips and empty states.
-   State sample size/context and avoid causal claims from correlation.

### 6.6 AI Assistant

-   Display the selected dataset and configured provider/model status
    without revealing keys.
-   Suggested questions: top categories, missing values, compare groups,
    summarize dataset.
-   Response may include explanation, chart/table and "How this was
    calculated".
-   Loading, retry, timeout, rate-limit, missing-key and
    provider-unavailable states.
-   A provider status panel can say "Gemini configured", "Groq
    configured", etc.; never show secrets.
-   If provider fallback occurs, optionally show a small, non-alarming
    label that another configured provider answered.

### 6.7 Reports

-   List report name, dataset, creation date, status and actions.
-   Include dataset profile, cleaning notes, statistics, selected charts
    and AI explanation.
-   Implement PDF only if a real PDF generator is present; otherwise
    offer supported CSV/JSON exports.
-   Do not show fake download buttons.

### 6.8 History

-   List previous analyses/questions/reports with date, dataset and
    reopen action.
-   Only claim persistence when saved to a real store.
-   Helpful empty state.

### 6.9 Settings

-   Theme preferences only if functional.
-   Profile only if real authentication/profile storage exists.
-   AI provider selection should be server-admin/configuration
    controlled by default; do not expose provider secrets to the
    browser.
-   Notification preferences only if notifications exist.
-   Explain actual upload retention and demo-mode limitations.
-   Save action must show genuine success/error feedback.

### 6.10 System states

Create reusable states for empty dataset, no search results, invalid
file, processing, server failure, AI provider not configured, rate
limit, all providers unavailable, no chart possible, loading and 404.
Every state should have a clear message and next action.

------------------------------------------------------------------------

## 7. Data processing requirements

Implement reusable Python functions for: - Row/column counts, column
names and inferred types. - Missing/non-null counts and percentages. -
Unique-value and duplicate-row counts. - Numeric summary statistics. -
Categorical frequency summary. - Numeric correlations when valid. -
Paginated preview. - Cleaning operations. - Bounded chart-ready data. -
Cleaned CSV export.

Cleaning options may include drop duplicates, explicit drop/fill
missing-value choices, rename columns, and validated type conversion.

Important: - Preserve original uploads. - Show the expected impact
before cleaning. - Record cleaning operations applied. - Handle empty
files, zero rows, all-null columns, mixed types, duplicate column names,
invalid dates and oversized files. - Keep deterministic analysis
separate from AI explanation.

------------------------------------------------------------------------

## 8. API outline

Use a consistent response format, for example:

``` json
{
  "success": true,
  "data": {},
  "message": "Optional message",
  "error": null
}
```

Suggested endpoints: - `GET /api/health` - `GET /api/datasets` -
`POST /api/datasets/upload` - `GET /api/datasets/:id` -
`GET /api/datasets/:id/preview?page=1&pageSize=20` -
`GET /api/datasets/:id/profile` -
`GET /api/datasets/:id/missing-values` -
`POST /api/datasets/:id/clean` - `GET /api/datasets/:id/analytics` -
`POST /api/datasets/:id/chart-data` -
`POST /api/datasets/:id/assistant` - `GET /api/history` -
`POST /api/reports` - `GET /api/reports/:id/download`

Requirements: - Validate path/query/body. - Use appropriate HTTP status
codes. - Apply pagination and output limits. - Do not expose stack
traces, secrets or filesystem paths. - Add request IDs/structured logs
where useful. - Document the actual routes in `docs/API.md` or README.

------------------------------------------------------------------------

## 9. Folder structure

Use a clean monorepo. Adapt filenames if needed, but maintain clear
responsibilities.

``` text
insightforge-ai/
├── SPEC.md
├── README.md
├── RUN_PROJECT.txt
├── .gitignore
├── .env.example
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── UI_GUIDE.md
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   ├── common/
│       │   ├── charts/
│       │   ├── tables/
│       │   └── feedback/
│       ├── pages/
│       ├── routes/
│       ├── hooks/
│       ├── services/apiClient.ts
│       ├── types/
│       ├── utils/
│       ├── styles/
│       └── test/
├── backend/
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       │   ├── aiService.js
│       │   ├── providers/
│       │   ├── datasetService.js
│       │   └── reportService.js
│       ├── middleware/
│       ├── validators/
│       ├── models/
│       └── tests/
├── data-service/
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   │       ├── profiling.py
│   │       ├── cleaning.py
│   │       ├── statistics.py
│   │       └── charts.py
│   └── tests/
├── sample-data/
│   └── README.md
└── scripts/
```

Do not create empty folders merely to match this diagram. Every file
must serve a purpose. Use the chosen JS/TS conventions consistently.

------------------------------------------------------------------------

## 10. Beginner-friendly code rules

These rules are mandatory:

1.  Use descriptive names and small, focused functions.
2.  Add a short header comment to important files describing the file's
    responsibility.
3.  Comments should explain **why** non-obvious logic exists, not repeat
    every line.
4.  Add docstrings to Python analysis functions.
5.  Keep business logic out of React components.
6.  Keep API calls in a shared API client.
7.  Keep provider-specific code inside provider adapters.
8.  Avoid giant files, clever one-liners, duplicated logic, dead code
    and unused imports.
9.  Validate inputs and show understandable errors.
10. Use consistent formatting/linting and tests.
11. Never hardcode API keys or commit `.env`.
12. Keep comments accurate when code changes.

Example Python style:

``` python
def calculate_missing_value_summary(dataframe):
    """Return missing-value counts and percentages for each column."""
    total_rows = len(dataframe)
    summary = []

    for column_name in dataframe.columns:
        missing_count = int(dataframe[column_name].isna().sum())

        # Avoid division by zero when the uploaded file has no rows.
        missing_percentage = (
            missing_count / total_rows * 100 if total_rows else 0
        )

        summary.append({
            "column": str(column_name),
            "missingCount": missing_count,
            "missingPercentage": round(missing_percentage, 2),
        })

    return summary
```

------------------------------------------------------------------------

## 11. Animation and accessibility

### Landing page

-   Staggered hero entrance.
-   Chart draw-in animation.
-   Subtle gradient/background movement.
-   Feature reveal on scroll.
-   Button hover/press transitions.

### App pages

-   Smooth active navigation.
-   Short card entrance animation.
-   Skeleton loaders while data is fetched.
-   Loading states on buttons.
-   Quick tab transitions and real success/error toasts.

### Rules

-   Most transitions should be around 150--350 ms.
-   Respect `prefers-reduced-motion`.
-   Support keyboard navigation and visible focus outlines.
-   Do not rely on colour alone to communicate state.
-   Avoid continuous animation in the analytics workspace.
-   Motion must not block interaction or cause layout shifts.

------------------------------------------------------------------------

## 12. Security, privacy and reliability

-   Keep secrets in environment variables and `.env` out of Git.
-   Provide `.env.example` with placeholders only.
-   Never expose provider keys through frontend variables, API responses
    or browser requests.
-   Validate file size/type/content on the server; use generated
    filenames; store files outside public directories; clean temporary
    files.
-   Use Helmet, explicit production CORS origins, rate limiting and
    schema validation.
-   Never execute AI-generated code or commands.
-   Do not log raw datasets, API keys or unnecessary personal data.
-   Add health endpoints, structured error handling and reasonable
    timeouts.
-   Use HTTPS in deployment.
-   Do not automatically route requests to a paid provider without
    explicit configuration.
-   Keep provider/model selection server-side.
-   Document what happens to uploaded files and history.
-   If authentication exists, use secure password hashing and
    session/token practices. Do not fake security.
-   Use lockfiles and maintained dependencies.

------------------------------------------------------------------------

## 13. Mandatory documentation deliverables

Antigravity must create these files in the project root as part of
building the project. Do not expect the user to create them manually.

### 13.1 `README.md`

Must be complete and match the final code. Include: - Project overview
and feature list. - Screenshots section with instructions/placeholders
only if screenshots have not yet been captured; do not fabricate
screenshots. - Technology stack and architecture. - Folder structure. -
Prerequisites and supported runtime versions. - Exact installation/setup
instructions. - Environment variable reference with meaning of each
variable. - How to configure Gemini, Groq, OpenAI and OpenRouter. -
Clear note that free tiers, model availability, quotas and prices
change. - How to run frontend, backend and Python service. - Sample
dataset instructions. - Tests, linting and production build commands. -
API overview. - Security and data-retention notes. - Deployment guide
for each service. - Troubleshooting. - Known limitations and future
improvements. - Official provider documentation links.

### 13.2 `RUN_PROJECT.txt`

Write this for a beginner who may not know how to start a multi-service
project. Include: - Required software and version checks. - Exact
terminal commands from a clean clone to first run. - Which terminal/tab
to use for each service. - Virtual environment creation and activation
on Linux/macOS and Windows PowerShell. - Dependency installation
commands. - Environment setup and safe API-key handling. - How to run
frontend, backend and Python service. - The actual local URLs and
health-check URLs. - How to load a sample dataset and test one AI
question. - Test/build commands. - Common errors and fixes. - Production
deployment checklist. - Commands must match actual `package.json`
scripts and Python module paths; test them before documenting them as
working.

If Docker Compose is implemented and tested, include an optional Docker
route. Do not require Docker just to run the app unless that is the
chosen, fully documented setup.

### 13.3 Other useful docs

Create `docs/ARCHITECTURE.md`, `docs/API.md`, and `docs/UI_GUIDE.md` if
they add real value. Keep them concise and aligned with the
implementation.

------------------------------------------------------------------------

## 14. Environment variable template

Create `.env.example` with empty placeholders, adapting names to the
real implementation:

``` dotenv
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=
DATA_SERVICE_URL=http://127.0.0.1:8000
UPLOAD_DIR=./private-uploads
MAX_UPLOAD_MB=25

AI_PROVIDER=gemini
AI_FALLBACK_PROVIDER=
AI_MODEL=
GEMINI_API_KEY=
GROQ_API_KEY=
OPENAI_API_KEY=
OPENROUTER_API_KEY=
OPENAI_COMPATIBLE_BASE_URL=
OPENAI_COMPATIBLE_API_KEY=
AI_REQUEST_TIMEOUT_MS=30000
AI_MAX_OUTPUT_TOKENS=1200
```

Do not place real credentials in this file. Validate required variables
and show helpful startup errors. If AI is not configured, the rest of
the app should still start where feasible.

------------------------------------------------------------------------

## 15. Testing and acceptance criteria

### Core functionality

-   Landing CTAs navigate correctly.
-   Sample dataset is visibly labelled.
-   Valid CSV uploads; invalid, empty, corrupt and oversized files show
    useful errors.
-   Dataset preview, pagination and row/column counts are correct.
-   Missing-value and numeric summaries match known expected results.
-   Charts use actual analysis results and handle empty data.
-   AI tool arguments are validated and answers use calculated results.
-   Missing AI key, rate limits, provider outage and timeout do not
    crash the app.
-   Provider switching works from server configuration.
-   Fallback only happens for eligible errors and is bounded.
-   Exports and history work or their limitations are clearly explained.
-   Direct route refresh works.
-   No API key is present in frontend bundle or browser network
    payloads.

### UI/UX

-   Desktop, tablet and mobile layouts are usable.
-   Consistent typography, spacing, colour and radius.
-   Loading, empty, error and success states exist.
-   Visible controls work.
-   Keyboard focus and reduced-motion preferences work.
-   No avoidable horizontal overflow or repeated console errors.

### Engineering

-   Frontend production build succeeds.
-   Backend and Python service start with validated configuration.
-   Tests cover core analytics, API validation and provider error
    handling.
-   Provider adapters are tested with mocks; no real API key is needed
    for the test suite.
-   README and RUN_PROJECT.txt commands match the actual scripts.
-   Deployment variables and steps are documented.
-   No secrets or uploaded private data are committed.

------------------------------------------------------------------------

## 16. Build plan for Antigravity

Build in phases and keep the app runnable after each phase.

### Phase 1 --- Inspect and plan

-   Inspect the existing workspace before overwriting anything.
-   Summarise architecture, pages, services and implementation order.
-   Identify missing environment variables and external dependencies.

### Phase 2 --- Foundation and design system

-   Create monorepo, package files, linting, environment example and
    route setup.
-   Build colour tokens, typography, buttons, cards, sidebar, topbar and
    responsive layout.
-   Make sure the project starts.

### Phase 3 --- Frontend pages

-   Build landing page and tasteful animations.
-   Build dashboard, upload, dataset view, analytics, assistant,
    reports, history and settings.
-   Use reusable components and clearly labelled sample data.
-   Make every control functional.

### Phase 4 --- Backend and data processing

-   Implement Express routes, validation, upload handling and error
    middleware.
-   Implement Python profiling, statistics, cleaning and chart-data
    functions.
-   Connect services with documented JSON contracts.

### Phase 5 --- Multi-provider AI integration

-   Build the provider abstraction and adapters for Gemini, Groq, OpenAI
    and OpenRouter where supported.
-   Verify current official docs and available model capabilities.
-   Add tool calling, strict schemas, timeouts, bounded retries and
    optional fallback.
-   Keep all API keys server-side.
-   If a provider cannot safely support tool calling, disable that
    capability or use a validated alternative.

### Phase 6 --- Persistence and exports

-   Add database models, history and report generation if in scope.
-   Add cleaned CSV export and only those report formats that genuinely
    work.

### Phase 7 --- Quality and deployment

-   Add tests for analytics, uploads, provider selection, errors and UI.
-   Test responsive layout, accessibility and reduced motion.
-   Run lint, tests and production builds.
-   Deploy frontend/backend/data service and test the full user flow.
-   Update README.md and RUN_PROJECT.txt with tested, exact commands and
    real URLs.

------------------------------------------------------------------------

## 17. Final instruction to Antigravity

Treat this file as the source of truth. Implement the complete project
in phases, not in one giant unverified code dump. Keep the code
beginner-friendly and commented where comments add understanding. Use
current official documentation for provider/model setup and do not
hardcode stale free-tier assumptions. Generate `README.md`,
`RUN_PROJECT.txt`, `.env.example`, and any necessary architecture/API
docs yourself. Test all commands and features before claiming
completion.

At the end, report: 1. What was implemented. 2. What is still
incomplete. 3. Tests and production builds run, including failures. 4.
Exact local run commands and URLs. 5. Which AI providers are
configured/supported and which environment variables are needed. 6.
Deployment steps and known limitations.

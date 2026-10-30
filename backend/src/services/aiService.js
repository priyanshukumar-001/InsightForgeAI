/**
 * InsightForge AI - Central AI Service Orchestrator
 * Manages provider registration, primary + fallback execution, tool-calling validation,
 * data grounding, and response audit formatting.
 */

const config = require('../config');
const dataServiceClient = require('./dataServiceClient');
const GeminiProvider = require('./providers/geminiProvider');
const GroqProvider = require('./providers/groqProvider');
const OpenAIProvider = require('./providers/openAiProvider');
const OpenRouterProvider = require('./providers/openRouterProvider');
const DemoProvider = require('./providers/demoProvider');

class AIService {
  constructor() {
    this.providers = new Map();
    this.demoProvider = new DemoProvider();

    this._registerProviders();
  }

  _registerProviders() {
    const primaryProvider = config.ai.provider;
    const globalModel = config.ai.model;

    // 1. Google Gemini — default: gemini-2.5-flash
    const geminiModel = (primaryProvider === 'gemini' && globalModel) ? globalModel : 'gemini-2.5-flash';
    this.providers.set(
      'gemini',
      new GeminiProvider(config.ai.geminiKey, geminiModel, config.ai.timeoutMs)
    );

    // 2. Groq — default: llama-3.1-8b-instant
    const groqModel = (primaryProvider === 'groq' && globalModel) ? globalModel : 'llama-3.1-8b-instant';
    this.providers.set(
      'groq',
      new GroqProvider(config.ai.groqKey, groqModel, config.ai.timeoutMs)
    );

    // 3. OpenAI — default: gpt-4o-mini
    const openAiModel = (primaryProvider === 'openai' && globalModel) ? globalModel : 'gpt-4o-mini';
    this.providers.set(
      'openai',
      new OpenAIProvider(config.ai.openAiKey, openAiModel, 'https://api.openai.com/v1', config.ai.timeoutMs)
    );

    // 4. OpenRouter — default: free llama model
    const openRouterModel = (primaryProvider === 'openrouter' && globalModel) ? globalModel : 'meta-llama/llama-3.2-3b-instruct:free';
    this.providers.set(
      'openrouter',
      new OpenRouterProvider(config.ai.openRouterKey, openRouterModel, config.ai.timeoutMs)
    );

    // 5. Custom OpenAI-compatible
    if (config.ai.openAiCompatibleBaseUrl) {
      const customModel = (primaryProvider === 'custom' && globalModel) ? globalModel : 'default';
      this.providers.set(
        'custom',
        new OpenAIProvider(config.ai.openAiCompatibleKey, customModel, config.ai.openAiCompatibleBaseUrl, config.ai.timeoutMs)
      );
    }
  }

  getProvidersStatus() {
    const list = [];
    for (const [key, provider] of this.providers.entries()) {
      list.push({
        id: key,
        name: provider.name.toUpperCase(),
        configured: provider.isConfigured(),
        isPrimary: key === config.ai.provider,
        isFallback: key === config.ai.fallbackProvider,
        capabilities: provider.getCapabilities()
      });
    }
    list.push({
      id: 'demo',
      name: 'DEMO COPILOT (BUILT-IN)',
      configured: true,
      isPrimary: config.ai.provider === 'demo',
      isFallback: false,
      capabilities: this.demoProvider.getCapabilities()
    });

    const activeProvider = this.getActiveProvider();
    return {
      activeProvider: activeProvider.name,
      isDemoMode: activeProvider.name === 'demo',
      providers: list
    };
  }

  getActiveProvider() {
    const primaryName = config.ai.provider;
    if (primaryName === 'demo') {
      return this.demoProvider;
    }
    const primary = this.providers.get(primaryName);
    if (primary) {
      return primary;
    }
    return this.demoProvider;
  }

  getToolDefinitions(datasetColumns = []) {
    return [
      {
        name: 'profile_dataset',
        description: 'Get dataset shape, column datatypes, missing values, duplicate counts, and data health summary.',
        parameters: { type: 'object', properties: {} }
      },
      {
        name: 'calculate_kpi',
        description: 'Calculate sum, mean, median, min, max, or count on a numeric column.',
        parameters: {
          type: 'object',
          properties: {
            column: { type: 'string', description: `Column to aggregate (${datasetColumns.join(', ')})` },
            operation: { type: 'string', enum: ['sum', 'mean', 'median', 'min', 'max', 'count'] }
          },
          required: ['column']
        }
      },
      {
        name: 'get_top_categories',
        description: 'Get most frequent values and counts for a categorical column.',
        parameters: {
          type: 'object',
          properties: {
            column: { type: 'string', description: 'Categorical column name' },
            limit: { type: 'integer', description: 'Top N items (default 5)' }
          },
          required: ['column']
        }
      },
      {
        name: 'detect_anomalies',
        description: 'Detect statistical outliers on a numeric column using the Interquartile Range (IQR) rule.',
        parameters: {
          type: 'object',
          properties: {
            column: { type: 'string', description: 'Numeric column name' },
            multiplier: { type: 'number', description: 'IQR multiplier, default 1.5' }
          },
          required: ['column']
        }
      },
      {
        name: 'compare_groups',
        description: 'Compare numeric metrics aggregated across categorical groups.',
        parameters: {
          type: 'object',
          properties: {
            groupBy: { type: 'string', description: 'Grouping categorical column' },
            metric: { type: 'string', description: 'Numeric metric column' },
            aggregation: { type: 'string', enum: ['mean', 'sum', 'count'], default: 'mean' }
          },
          required: ['groupBy', 'metric']
        }
      },
      {
        name: 'get_chart_data',
        description: 'Fetch chart-ready data for bar, line, scatter, or distribution charts.',
        parameters: {
          type: 'object',
          properties: {
            chartType: { type: 'string', enum: ['bar', 'line', 'scatter', 'histogram', 'pie'] },
            xAxis: { type: 'string', description: 'Column for X axis' },
            yAxis: { type: 'string', description: 'Column for Y axis' },
            aggregation: { type: 'string', enum: ['sum', 'mean', 'count'], default: 'sum' }
          },
          required: ['chartType']
        }
      },
      {
        name: 'get_correlations',
        description: 'Calculate Pearson correlation matrix between all numeric features in the dataset.',
        parameters: { type: 'object', properties: {} }
      },
      {
        name: 'get_missing_values',
        description: 'Get detailed missing value counts, percentages, and non-null cell statistics per column.',
        parameters: { type: 'object', properties: {} }
      },
      {
        name: 'get_duplicate_summary',
        description: 'Audit exact duplicate rows versus repeated ID keys (e.g. order_id, customer_id).',
        parameters: { type: 'object', properties: {} }
      },
      {
        name: 'get_numeric_summary',
        description: 'Get descriptive statistics (mean, median, std, min, max, quartiles) for numeric columns.',
        parameters: { type: 'object', properties: {} }
      },
      {
        name: 'get_date_trends',
        description: 'Analyze time-series trends by grouping dates and aggregating metric values.',
        parameters: {
          type: 'object',
          properties: {
            dateColumn: { type: 'string', description: 'Date or timestamp column name' },
            valueColumn: { type: 'string', description: 'Numeric metric column to aggregate' },
            aggregation: { type: 'string', enum: ['sum', 'mean', 'count'], default: 'sum' }
          }
        }
      }
    ];
  }

  async askQuestion({ dataset, question, history = [] }) {
    const provider = this.getActiveProvider();

    // Enforce configuration check: do not silently fabricate answers if live provider was requested
    if (provider.name !== 'demo' && !provider.isConfigured()) {
      throw new Error(`AI Provider '${provider.name}' is selected, but its API key is not configured. Please supply a valid GEMINI_API_KEY in Settings or your .env file.`);
    }

    const colNames = (dataset.profile?.columns || []).map(c => c.name);
    const tools = this.getToolDefinitions(colNames);

    const systemInstruction = `You are InsightForge AI, an expert, objective data analyst copilot.
You are analyzing dataset: "${dataset.filename}" (${dataset.profile?.rowCount || 'unknown'} rows, ${colNames.length} columns: ${colNames.join(', ')}).
CRITICAL RULES:
1. Ground all numbers in actual dataset calculations by invoking approved tools. NEVER invent, fabricate, or hallucinate statistical numbers.
2. If the user asks for summaries, KPIs, outliers, comparisons, trends, or charts, invoke the corresponding tool.
3. Be professional, direct, concise, and helpful.`;

    let providerUsed = provider.name;
    let initialAnswer;

    try {
      initialAnswer = await provider.generateAnswer({
        prompt: question,
        systemInstruction,
        tools,
        history
      });
    } catch (err) {
      if (provider.name !== 'demo') {
        const fallback = this.providers.get(config.ai.fallbackProvider);
        if (fallback && fallback.isConfigured() && fallback.name !== provider.name && fallback.name !== 'demo') {
          console.warn(`[AIService] Primary provider '${provider.name}' failed: ${err.message}. Trying configured fallback '${fallback.name}'.`);
          providerUsed = fallback.name;
          initialAnswer = await fallback.generateAnswer({
            prompt: question,
            systemInstruction,
            tools,
            history
          });
        } else {
          // Never silently fabricate answers when a live LLM was requested
          throw new Error(`Live AI provider '${provider.name}' error: ${err.message}. Check your API key or network connection.`);
        }
      } else {
        providerUsed = 'demo';
        initialAnswer = await this.demoProvider.generateAnswer({
          prompt: question,
          tools
        });
      }
    }

    let toolResult = null;
    let chartData = null;
    let calculationNotes = [];

    // If model triggered a tool call
    if (initialAnswer && initialAnswer.toolCall) {
      const { name: toolName, arguments: rawArgs } = initialAnswer.toolCall;
      let safeArgs = { ...rawArgs };

      // Ensure valid column fallback if model left blank or in demo mode
      if (!safeArgs.column && colNames.length > 0) {
        const numCols = (dataset.profile?.columns || []).filter(c => c.inferredType === 'numeric').map(c => c.name);
        const catCols = (dataset.profile?.columns || []).filter(c => c.inferredType === 'categorical').map(c => c.name);

        if (toolName === 'calculate_kpi' || toolName === 'detect_anomalies') {
          safeArgs.column = numCols[0] || colNames[0];
        } else if (toolName === 'get_top_categories') {
          safeArgs.column = catCols[0] || colNames[0];
        } else if (toolName === 'get_chart_data') {
          safeArgs.xAxis = catCols[0] || colNames[0];
          safeArgs.yAxis = numCols[0] || colNames[1] || colNames[0];
        } else if (toolName === 'compare_groups') {
          safeArgs.groupBy = catCols[0] || colNames[0];
          safeArgs.metric = numCols[0] || colNames[1] || colNames[0];
        }
      }

      calculationNotes.push(`Executed analysis tool '${toolName}' with parameters: ${JSON.stringify(safeArgs)}`);

      try {
        toolResult = await dataServiceClient.executeTool(dataset.filePath, null, toolName, safeArgs);

        if (toolName === 'get_chart_data' && toolResult) {
          chartData = toolResult;
        } else if (toolName === 'get_date_trends' && toolResult) {
          chartData = toolResult;
        } else if (toolName === 'compare_groups' && toolResult?.data) {
          chartData = {
            chartType: 'bar',
            xAxis: safeArgs.groupBy,
            yAxis: safeArgs.metric,
            data: toolResult.data.map(d => ({ name: d.group, value: d.value }))
          };
        } else if (toolName === 'get_top_categories' && toolResult?.top) {
          chartData = {
            chartType: 'bar',
            xAxis: safeArgs.column,
            yAxis: 'count',
            data: toolResult.top.map(d => ({ name: d.label, value: d.count }))
          };
        }

        // If a live LLM is active, ask it to synthesize a friendly explanation grounded in the tool results
        if (providerUsed !== 'demo') {
          const synthesisPrompt = `The calculation tool '${toolName}' executed with parameters ${JSON.stringify(safeArgs)} returned the following verified data:
${JSON.stringify(toolResult, null, 2)}

Provide a concise, user-friendly 2-4 sentence explanation answering the user's question: "${question}".
Include the verified numbers, percentage findings, and key insights. Do not fabricate any other numbers.`;

          const finalSynthesis = await provider.generateAnswer({
            prompt: synthesisPrompt,
            systemInstruction
          });

          return {
            answer: finalSynthesis.text || 'Calculation completed successfully based on verified dataset data.',
            provider: providerUsed,
            isDemo: false,
            toolExecuted: toolName,
            toolResult,
            chartData,
            auditTrail: calculationNotes
          };
        }
      } catch (toolErr) {
        calculationNotes.push(`Tool execution error: ${toolErr.message}`);
      }
    }

    // Build synthesized response for demo mode or text-only response
    let finalAnswerText = initialAnswer?.text || '';
    if (toolResult) {
      if (toolResult.result?.column && toolResult.result?.value !== undefined) {
        finalAnswerText += `\n\n**Result:** The computed **${toolResult.result.operation}** for column \`${toolResult.result.column}\` is **${toolResult.result.value.toLocaleString()}**.`;
      } else if (toolResult.top) {
        finalAnswerText += `\n\n**Top Categories:**\n` + toolResult.top.map(t => `- **${t.label}**: ${t.count.toLocaleString()} occurrences`).join('\n');
      } else if (toolResult.outlierCount !== undefined) {
        finalAnswerText += `\n\n**Outlier Analysis (IQR):** Detected **${toolResult.outlierCount}** outliers (${toolResult.outlierPercentage}% of dataset) outside bounds [${toolResult.lowerBound}, ${toolResult.upperBound}].`;
      } else if (toolResult.exactDuplicateRows !== undefined) {
        finalAnswerText += `\n\n**Duplicate Audit:** Found **${toolResult.exactDuplicateRows.toLocaleString()}** exact duplicate rows (${toolResult.exactDuplicatePercentage}%), and repeated identifier keys across transactions.`;
      }
    }

    return {
      answer: finalAnswerText,
      provider: providerUsed,
      isDemo: providerUsed === 'demo',
      toolExecuted: initialAnswer?.toolCall?.name || null,
      toolResult,
      chartData,
      auditTrail: calculationNotes
    };
  }
}

module.exports = new AIService();

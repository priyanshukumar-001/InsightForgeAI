/**
 * InsightForge AI - Demo Provider Adapter
 * Used when no live external AI provider API key is configured.
 * Clearly labelled, safe, and honest: uses deterministic keyword-matching
 * to trigger actual dataset tools (KPI, profiling, categories) so students
 * and evaluators can experience the full interactive workflow without an API key.
 */

const AIProviderInterface = require('./aiProviderInterface');

class DemoProvider extends AIProviderInterface {
  constructor() {
    super('demo');
  }

  isConfigured() {
    return true; // Always available as safe fallback
  }

  getCapabilities() {
    return {
      textGeneration: true,
      toolCalling: true,
      structuredOutput: true,
      streaming: false,
      isDemo: true
    };
  }

  async generateAnswer({ prompt, tools = [] }) {
    const lower = prompt.toLowerCase();

    // Deterministic tool routing based on intent
    if (lower.includes('profile') || lower.includes('overview') || lower.includes('rows') || lower.includes('column') || lower.includes('summary')) {
      return {
        text: 'Let me retrieve the structural profile and quality metrics for this dataset.',
        toolCall: {
          name: 'profile_dataset',
          arguments: {}
        }
      };
    }

    if (lower.includes('top') || lower.includes('category') || lower.includes('categories') || lower.includes('most frequent')) {
      return {
        text: 'Analyzing the top categorical distributions for this dataset...',
        toolCall: {
          name: 'get_top_categories',
          arguments: { limit: 5 }
        }
      };
    }

    if (lower.includes('anomaly') || lower.includes('outlier') || lower.includes('unusual')) {
      return {
        text: 'Checking for statistical outliers using the interquartile range (IQR) method...',
        toolCall: {
          name: 'detect_anomalies',
          arguments: { multiplier: 1.5 }
        }
      };
    }

    if (lower.includes('total') || lower.includes('sum') || lower.includes('average') || lower.includes('mean') || lower.includes('kpi') || lower.includes('revenue') || lower.includes('sales')) {
      return {
        text: 'Computing key performance aggregations directly from the dataset records...',
        toolCall: {
          name: 'calculate_kpi',
          arguments: { operation: lower.includes('average') || lower.includes('mean') ? 'mean' : 'sum' }
        }
      };
    }

    if (lower.includes('chart') || lower.includes('plot') || lower.includes('graph') || lower.includes('visualize')) {
      return {
        text: 'Extracting chart-ready aggregated series for visualization...',
        toolCall: {
          name: 'get_chart_data',
          arguments: { chartType: 'bar' }
        }
      };
    }

    // Default informative response explaining demo mode and suggested grounded queries
    return {
      text: "👋 You are running InsightForge AI in **Demo Assistant Mode** (no live external LLM API key is configured).\n\n" +
        "You can test live dataset calculations right now by asking:\n" +
        "- *'Summarize the dataset profile and missing values'*\n" +
        "- *'What are the top categories in this dataset?'*\n" +
        "- *'Calculate the total or average numeric metrics'*\n" +
        "- *'Detect outliers and anomalies using IQR'*\n" +
        "- *'Show me a chart breakdown'* \n\n" +
        "To connect a live LLM, simply add `GEMINI_API_KEY` or `GROQ_API_KEY` to your `.env` file!"
    };
  }
}

module.exports = DemoProvider;

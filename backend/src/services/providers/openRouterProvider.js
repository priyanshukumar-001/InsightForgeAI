/**
 * InsightForge AI - OpenRouter Provider Adapter
 * Connects to OpenRouter aggregator with site attribution headers.
 */

const AIProviderInterface = require('./aiProviderInterface');

class OpenRouterProvider extends AIProviderInterface {
  constructor(apiKey, modelName = 'meta-llama/llama-3.2-3b-instruct:free', timeoutMs = 30000) {
    super('openrouter');
    this.apiKey = apiKey;
    this.model = modelName || 'meta-llama/llama-3.2-3b-instruct:free';
    this.timeoutMs = timeoutMs;
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 10);
  }

  getCapabilities() {
    return {
      textGeneration: true,
      toolCalling: true,
      structuredOutput: true,
      streaming: false
    };
  }

  async generateAnswer({ prompt, systemInstruction, tools = [], history = [] }) {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter API key is not configured.');
    }

    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    if (history && history.length > 0) {
      history.forEach(h => {
        messages.push({ role: h.role, content: h.content });
      });
    }
    messages.push({ role: 'user', content: prompt });

    const body = {
      model: this.model,
      messages,
      temperature: 0.2
    };

    if (tools && tools.length > 0) {
      body.tools = tools.map(t => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters
        }
      }));
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://insightforge.local',
        'X-Title': 'InsightForge AI'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeoutMs)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;

    if (!choice) {
      return { text: 'No response received from OpenRouter.' };
    }

    if (choice.tool_calls && choice.tool_calls.length > 0) {
      const tc = choice.tool_calls[0];
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(tc.function.arguments || '{}');
      } catch {
        parsedArgs = {};
      }
      return {
        text: choice.content || '',
        toolCall: {
          name: tc.function.name,
          arguments: parsedArgs
        }
      };
    }

    return { text: choice.content || '' };
  }
}

module.exports = OpenRouterProvider;

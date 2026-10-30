/**
 * InsightForge AI - OpenAI Provider Adapter
 * Grounded data Q&A and function calling via OpenAI API.
 */

const AIProviderInterface = require('./aiProviderInterface');

class OpenAIProvider extends AIProviderInterface {
  constructor(apiKey, modelName = 'gpt-4o-mini', baseUrl = 'https://api.openai.com/v1', timeoutMs = 30000) {
    super('openai');
    this.apiKey = apiKey;
    this.model = modelName || 'gpt-4o-mini';
    this.baseUrl = baseUrl.replace(/\/+$/, '');
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
      throw new Error('OpenAI API key is not configured.');
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
      temperature: 0.2,
      max_tokens: 1200
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
      body.tool_choice = 'auto';
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeoutMs)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;

    if (!choice) {
      return { text: 'No response received from OpenAI.' };
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

module.exports = OpenAIProvider;

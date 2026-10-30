/**
 * InsightForge AI - Groq Provider Adapter
 * Ultra-fast inference with tool-calling support using Groq Cloud API.
 */

const AIProviderInterface = require('./aiProviderInterface');

class GroqProvider extends AIProviderInterface {
  constructor(apiKey, modelName = 'llama-3.1-8b-instant', timeoutMs = 25000) {
    super('groq');
    this.apiKey = apiKey;
    this.model = modelName || 'llama-3.1-8b-instant';
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
      throw new Error('Groq API key is not configured.');
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
      temperature: 0.1,
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

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
      const hint = response.status === 404
        ? ' (Model not found — check your Groq plan or update GROQ_MODEL in .env)'
        : response.status === 401
        ? ' (Invalid or expired GROQ_API_KEY — update it in .env)'
        : '';
      throw new Error(`Groq API error (${response.status})${hint}: ${err}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;

    if (!choice) {
      return { text: 'No response received from Groq.' };
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

module.exports = GroqProvider;

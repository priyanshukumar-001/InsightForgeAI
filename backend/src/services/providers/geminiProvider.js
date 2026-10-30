/**
 * InsightForge AI - Google Gemini Provider Adapter
 * Grounded data Q&A and function calling via official @google/genai SDK.
 */

const AIProviderInterface = require('./aiProviderInterface');

class GeminiProvider extends AIProviderInterface {
  constructor(apiKey, modelName = 'gemini-2.5-flash', timeoutMs = 30000) {
    super('gemini');
    this.apiKey = apiKey;
    this.model = modelName || 'gemini-2.5-flash';
    this.timeoutMs = timeoutMs;
    this._client = null;
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

  _getClient() {
    if (!this._client) {
      try {
        const { GoogleGenAI } = require('@google/genai');
        this._client = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        // Fallback if SDK load fails
        this._client = null;
      }
    }
    return this._client;
  }

  async generateAnswer({ prompt, systemInstruction, tools = [], history = [] }) {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key is not configured. Please supply a valid GEMINI_API_KEY in your server environment.');
    }

    const client = this._getClient();

    if (client) {
      try {
        const contents = [];
        if (history && history.length > 0) {
          history.forEach(h => {
            contents.push({
              role: h.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: h.content }]
            });
          });
        }
        contents.push({
          role: 'user',
          parts: [{ text: prompt }]
        });

        const genConfig = {
          temperature: 0.2,
          maxOutputTokens: 1500
        };

        if (systemInstruction) {
          genConfig.systemInstruction = systemInstruction;
        }

        if (tools && tools.length > 0) {
          genConfig.tools = [
            {
              functionDeclarations: tools.map(t => ({
                name: t.name,
                description: t.description,
                parameters: t.parameters
              }))
            }
          ];
        }

        const response = await client.models.generateContent({
          model: this.model,
          contents,
          config: genConfig
        });

        if (response.functionCalls && response.functionCalls.length > 0) {
          const fn = response.functionCalls[0];
          return {
            text: '',
            toolCall: {
              name: fn.name,
              arguments: fn.args || {}
            }
          };
        }

        return { text: response.text || '' };
      } catch (sdkErr) {
        // If SDK call fails, fall back to direct v1beta HTTP call below
        console.warn(`[@google/genai SDK warning] ${sdkErr.message}. Attempting REST fallback...`);
      }
    }

    // Direct REST Fallback
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent?key=${this.apiKey}`;

    const contents = [];
    if (history && history.length > 0) {
      history.forEach(h => {
        contents.push({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }]
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const body = {
      contents,
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1500
      }
    };

    if (systemInstruction) {
      body.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    if (tools && tools.length > 0) {
      body.tools = [
        {
          functionDeclarations: tools.map(t => ({
            name: t.name,
            description: t.description,
            parameters: t.parameters
          }))
        }
      ];
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeoutMs)
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0];

    if (!candidate) {
      return { text: 'No response received from Gemini.' };
    }

    if (candidate.functionCall) {
      return {
        text: '',
        toolCall: {
          name: candidate.functionCall.name,
          arguments: candidate.functionCall.args || {}
        }
      };
    }

    return { text: candidate.text || '' };
  }
}

module.exports = GeminiProvider;

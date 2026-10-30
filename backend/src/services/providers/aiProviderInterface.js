/**
 * InsightForge AI - Base Provider Interface
 * All AI provider adapters must implement this consistent contract.
 */

class AIProviderInterface {
  constructor(name) {
    this.name = name;
  }

  isConfigured() {
    throw new Error('isConfigured() must be implemented');
  }

  getCapabilities() {
    return {
      textGeneration: true,
      toolCalling: false,
      structuredOutput: true,
      streaming: false
    };
  }

  /**
   * Generates natural language answer or tool invocation.
   * @param {Object} options
   * @param {string} options.prompt
   * @param {string} options.systemInstruction
   * @param {Array} [options.tools]
   * @param {Array} [options.history]
   * @returns {Promise<{text: string, toolCall?: {name: string, arguments: any}, raw?: any}>}
   */
  async generateAnswer(options) {
    throw new Error('generateAnswer() must be implemented');
  }
}

module.exports = AIProviderInterface;

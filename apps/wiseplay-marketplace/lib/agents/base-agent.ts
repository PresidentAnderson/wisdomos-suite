import Anthropic from '@anthropic-ai/sdk';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface AgentConfig {
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export abstract class BaseAgent {
  protected llm: Anthropic;
  protected systemPrompt: string;
  protected config: AgentConfig;

  constructor(systemPrompt: string, config: AgentConfig = {}) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not found in environment variables');
    }

    this.llm = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    this.systemPrompt = systemPrompt;
    this.config = {
      model: config.model || 'claude-3-5-sonnet-20241022',
      maxTokens: config.maxTokens || 2000,
      temperature: config.temperature || 1.0,
    };
  }

  /**
   * Main processing method - must be implemented by subclasses
   */
  abstract process(input: any, context?: any): Promise<any>;

  /**
   * Chat with Claude using the configured model
   */
  protected async chat(messages: Message[]): Promise<string> {
    try {
      const response = await this.llm.messages.create({
        model: this.config.model!,
        max_tokens: this.config.maxTokens!,
        temperature: this.config.temperature,
        system: this.systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      });

      // Extract text content from the response
      const textContent = response.content.find(c => c.type === 'text');
      return textContent?.type === 'text' ? textContent.text : '';
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw new Error('Failed to get response from AI agent');
    }
  }

  /**
   * Stream chat responses (for real-time UX)
   */
  protected async *chatStream(messages: Message[]): AsyncGenerator<string> {
    try {
      const stream = await this.llm.messages.create({
        model: this.config.model!,
        max_tokens: this.config.maxTokens!,
        temperature: this.config.temperature,
        system: this.systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          yield chunk.delta.text;
        }
      }
    } catch (error) {
      console.error('Error streaming from Claude API:', error);
      throw new Error('Failed to stream response from AI agent');
    }
  }

  /**
   * Parse structured JSON response from Claude
   */
  protected parseJSON<T>(response: string): T | null {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) ||
                       response.match(/```\n([\s\S]*?)\n```/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }

      // Try to parse the entire response
      return JSON.parse(response);
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      return null;
    }
  }

  /**
   * Format context object for the LLM
   */
  protected formatContext(context: any): string {
    return JSON.stringify(context, null, 2);
  }
}

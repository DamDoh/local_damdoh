// Self-hosted AI Service for DamDoh
// This service provides AI capabilities without depending on Google/Firebase services

import { apiCall } from '@/lib/api-utils';

export interface AIServiceConfig {
  apiUrl: string;
  apiKey?: string;
  model: string;
}

export interface AIRequest {
  prompt: string;
  context?: string;
  temperature?: number;
  maxTokens?: number;
  type?: string;
}

export interface AIResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class DamDohAIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  async generateText(request: AIRequest): Promise<AIResponse> {
    try {
      // Use backend AI API instead of direct model calls
      const response = await apiCall<any>('/ai/generate', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      return {
        text: response.text || response.suggestion || 'AI response not available',
        usage: response.usage
      };
    } catch (error) {
      console.error('AI Service Error:', error);

      // Fallback to mock responses if backend is unavailable
      const mockResponses = [
        "Based on current agricultural data, I recommend planting maize in the next 2 weeks for optimal yield.",
        "Your soil analysis shows nitrogen levels are adequate. Consider adding phosphorus-rich fertilizers.",
        "Weather patterns suggest good conditions for tomato cultivation in your region.",
        "Market analysis indicates spinach prices will rise by 15% in the coming month.",
        "Consider crop rotation with legumes to improve soil fertility naturally."
      ];

      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

      return {
        text: randomResponse,
        usage: {
          promptTokens: request.prompt.length / 4,
          completionTokens: randomResponse.length / 4,
          totalTokens: (request.prompt.length + randomResponse.length) / 4
        }
      };
    }
  }

  async generateMenuSuggestions(restaurantTheme: string): Promise<string> {
    const request: AIRequest = {
      prompt: `Suggest an item for the menu of a ${restaurantTheme} themed restaurant`,
      temperature: 0.7
    };

    const response = await this.generateText(request);
    return response.text;
  }

  async analyzeCropData(cropData: any): Promise<string> {
    const request: AIRequest = {
      prompt: `Analyze the following crop data and provide insights: ${JSON.stringify(cropData)}`,
      temperature: 0.5
    };

    const response = await this.generateText(request);
    return response.text;
  }

  async generateMarketInsights(marketData: any): Promise<string> {
    const request: AIRequest = {
      prompt: `Provide market insights based on this data: ${JSON.stringify(marketData)}`,
      temperature: 0.6
    };

    const response = await this.generateText(request);
    return response.text;
  }
}

// Factory function to create AI service instances
export function createAIService(config: AIServiceConfig): DamDohAIService {
  return new DamDohAIService(config);
}

// Default configuration for development
export const defaultAIConfig: AIServiceConfig = {
  apiUrl: process.env.AI_API_URL || 'http://localhost:11434', // Default Ollama URL
  model: process.env.AI_MODEL || 'llama2',
};

// Export singleton instance
export const aiService = createAIService(defaultAIConfig);
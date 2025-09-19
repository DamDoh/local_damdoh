import { apiCall } from '@/lib/api-utils';

export interface FarmingAssistantInput {
  question: string;
  context?: string;
  language: string;
}

export interface FarmingAssistantOutput {
  answer: string;
  confidence: number;
  sources?: string[];
}

export async function askFarmingAssistant(input: FarmingAssistantInput): Promise<FarmingAssistantOutput> {
  try {
    const contextInfo = input.context ? `\n\nAdditional context: ${input.context}` : '';

    const prompt = `You are an expert agricultural assistant for DamDoh, a farming platform in East Africa.

Question: ${input.question}${contextInfo}

Please provide a helpful, accurate answer based on modern farming practices, local conditions in East Africa, and sustainable agriculture principles. Include practical advice and consider local challenges like climate, soil types, and market conditions.

If relevant, mention specific crops, techniques, or considerations for the region.`;

    const response = await apiCall<any>('/ai/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        type: 'general',
        temperature: 0.3 // Lower temperature for more accurate farming advice
      }),
    });

    const answer = response.text || response.suggestion || 'I apologize, but I cannot provide an answer at this time. Please try again later.';

    return {
      answer,
      confidence: 0.85, // Default confidence level
      sources: ['DamDoh Agricultural Knowledge Base', 'Modern Farming Practices']
    };
  } catch (error) {
    console.error('Error in farming assistant:', error);

    return {
      answer: "I'm sorry, I'm currently unable to provide farming advice. Please consult with local agricultural extension services or try again later.",
      confidence: 0,
      sources: []
    };
  }
}
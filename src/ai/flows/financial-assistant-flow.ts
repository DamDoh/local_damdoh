import { apiCall } from '@/lib/api-utils';

export interface FinancialAssistantInput {
  question: string;
  context?: string;
  language: string;
  userRole?: 'farmer' | 'financial_institution';
  portfolioData?: any;
}

export interface FinancialAssistantOutput {
  answer: string;
  confidence: number;
  sources?: string[];
  recommendations?: string[];
  riskLevel?: 'low' | 'medium' | 'high';
}

export async function askFinancialAssistant(input: FinancialAssistantInput): Promise<FinancialAssistantOutput> {
  try {
    const contextInfo = input.context ? `\n\nAdditional context: ${input.context}` : '';
    const portfolioInfo = input.portfolioData ? `\n\nPortfolio data: ${JSON.stringify(input.portfolioData)}` : '';
    const roleContext = input.userRole === 'financial_institution'
      ? 'You are an expert financial advisor for agricultural lending institutions in East Africa.'
      : 'You are an expert financial advisor helping farmers with agricultural finance and business planning.';

    const prompt = `${roleContext}

Question: ${input.question}${contextInfo}${portfolioInfo}

Please provide helpful, accurate financial advice based on:
- Agricultural finance best practices
- Local market conditions in East Africa
- Risk management principles
- Sustainable lending practices
- Regulatory compliance requirements

Consider factors like:
- Weather and climate risks
- Market price volatility
- Input cost fluctuations
- Farmer cash flow patterns
- Collateral valuation
- Repayment capacity

Provide practical, actionable advice with specific recommendations when possible.`;

    const response = await apiCall<any>('/ai/generate', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        type: 'financial_advice',
        temperature: 0.3 // Lower temperature for more accurate financial advice
      }),
    });

    const answer = response.text || response.suggestion || 'I apologize, but I cannot provide financial advice at this time. Please try again later.';

    // Analyze risk level from the response
    const riskLevel = analyzeRiskLevel(answer);

    return {
      answer,
      confidence: 0.85,
      sources: ['DamDoh Financial Knowledge Base', 'Agricultural Finance Best Practices', 'East African Market Data'],
      recommendations: extractRecommendations(answer),
      riskLevel
    };
  } catch (error) {
    console.error('Error in financial assistant:', error);

    return {
      answer: "I'm sorry, I'm currently unable to provide financial advice. Please consult with licensed financial advisors or try again later.",
      confidence: 0,
      sources: [],
      riskLevel: 'medium'
    };
  }
}

function analyzeRiskLevel(response: string): 'low' | 'medium' | 'high' {
  const lowerResponse = response.toLowerCase();

  if (lowerResponse.includes('high risk') || lowerResponse.includes('significant risk') || lowerResponse.includes('caution')) {
    return 'high';
  } else if (lowerResponse.includes('moderate risk') || lowerResponse.includes('medium risk')) {
    return 'medium';
  } else {
    return 'low';
  }
}

function extractRecommendations(response: string): string[] {
  const recommendations: string[] = [];

  // Look for bullet points or numbered lists
  const lines = response.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('•') || trimmed.startsWith('-') ||
        /^\d+\./.test(trimmed) || trimmed.toLowerCase().includes('recommend')) {
      recommendations.push(trimmed.replace(/^•\s*|^-\s*|\d+\.\s*/, ''));
    }
  }

  return recommendations.slice(0, 5); // Limit to 5 recommendations
}
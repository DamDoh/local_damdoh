
'use server';
/**
 * @fileOverview AI flow to provide market insights for agricultural products.
 * This flow conceptualizes AI-driven market analysis for items listed on the DamDoh platform.
 * - getMarketInsights - Function to get market insights.
 * - MarketInsightInput - Input type.
 * - MarketInsightOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketInsightInputSchema = z.object({
  productName: z.string().describe('The name of the agricultural product.'),
  category: z.string().describe('The category of the product (e.g., Agricultural Produce, Inputs & Supplies, Machinery & Business Services).'),
  location: z.string().optional().describe('The geographical location relevant to the product (e.g., for market demand, export/import considerations).'),
  description: z.string().optional().describe('A brief description of the product.'),
  language: z.string().optional().describe('The language for the AI to respond in, specified as a two-letter ISO 639-1 code. Defaults to English.'),
});
export type MarketInsightInput = z.infer<typeof MarketInsightInputSchema>;

const MarketInsightOutputSchema = z.object({
  productName: z.string().describe("The name of the product for which insights are provided."),
  estimatedPriceRange: z.string().describe("A conceptual estimated price range for the product (e.g., '$100 - $120 per ton'). This is illustrative and not based on real-time data."),
  demandOutlook: z.string().describe("A general, conceptual outlook on market demand (e.g., 'Steady demand with potential seasonal peaks for organic varieties.')."),
  keyConsiderations: z.array(z.string()).describe("A list of 2-3 key factors or considerations for trading this product (e.g., 'Verify organic certification for export markets.', 'Assess logistics costs for bulk transport.')."),
  sustainableAlternatives: z.array(z.string()).optional().describe("If applicable, a list of 1-2 sustainable alternatives or complementary products/practices."),
});
export type MarketInsightOutput = z.infer<typeof MarketInsightOutputSchema>;

export async function getMarketInsights(input: MarketInsightInput): Promise<MarketInsightOutput> {
  return marketInsightsFlow(input);
}

const marketInsightsPrompt = ai.definePrompt({
  name: 'marketInsightsPrompt',
  input: {schema: MarketInsightInputSchema},
  output: {schema: MarketInsightOutputSchema},
  prompt: `You are an AI Agricultural Market Analyst for the DamDoh platform.
Your role is to provide conceptual market insights for agricultural products. You DO NOT have access to real-time market data. Your insights should be plausible and illustrative, based on general agricultural knowledge.

**CRITICAL: You MUST generate the response in the specified language: '{{{language}}}'.**

Product Name: {{{productName}}}
Category: {{{category}}}
{{#if location}}Location Focus: {{{location}}}{{/if}}
{{#if description}}Description: {{{description}}}{{/if}}

Based on the information above, provide the following:
1.  **Product Name**: Reiterate the product name.
2.  **Estimated Price Range**: Provide a *conceptual* price range (e.g., "$X - $Y per unit"). Clearly state this is illustrative.
3.  **Demand Outlook**: Give a *general* outlook on demand (e.g., "Stable with seasonal peaks", "Growing interest in organic variants").
4.  **Key Considerations**: List 2-3 important factors for someone trading this product (e.g., "Logistics for perishable goods are crucial", "Certification requirements for export to Europe", "Local storage capacity").
5.  **Sustainable Alternatives**: If relevant to the product category (e.g., for inputs), suggest 1-2 sustainable alternatives or complementary practices. If not highly relevant (e.g., for a specific piece of machinery), you can omit this or return an empty array.

Keep your responses concise and focused on providing helpful, albeit conceptual, market-related information for DamDoh users.
Example for a chemical fertilizer: Sustainable alternative could be "Compost or bio-fertilizers".
Example for "Organic Coffee Beans": Key consideration could be "Verify Fair Trade and Organic certifications".
`,
});

const marketInsightsFlow = ai.defineFlow(
  {
    name: 'marketInsightsFlow',
    inputSchema: MarketInsightInputSchema,
    outputSchema: MarketInsightOutputSchema,
  },
  async (input) => {
    const {output} = await marketInsightsPrompt({ ...input, language: input.language || 'en' });
    return {
        productName: input.productName, // Ensure product name from input is used
        estimatedPriceRange: output!.estimatedPriceRange,
        demandOutlook: output!.demandOutlook,
        keyConsiderations: output!.keyConsiderations || [],
        sustainableAlternatives: output!.sustainableAlternatives || [],
    };
  }
);

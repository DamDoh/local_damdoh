
'use server';
/**
 * @fileOverview AI Farming Assistant flow.
 * Provides information on sustainable and regenerative agriculture,
 * agricultural supply chain, farming business, and DamDoh app guidance.
 * - askFarmingAssistant - Function to get answers from the assistant.
 * - FarmingAssistantInput - Input type.
 * - FarmingAssistantOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const FarmingAssistantInputSchema = z.object({
  query: z.string().describe('The user\'s question about farming, agriculture, supply chain, farming business, or app guidance.'),
});
export type FarmingAssistantInput = z.infer<typeof FarmingAssistantInputSchema>;

const DetailedPointSchema = z.object({
  title: z.string().describe('A concise title for a specific aspect, key practice, or detailed point related to the answer. Max 5-7 words.'),
  content: z.string().describe('The detailed explanation, advice, or information for this point. Should be a paragraph or two.'),
});

export const FarmingAssistantOutputSchema = z.object({
  summary: z.string().describe("A concise overall answer or summary to the user's query. This should be a few sentences long and directly address the main question."),
  detailedPoints: z.array(DetailedPointSchema).optional().describe("An array of 3-5 detailed points or sections, each with a title and content, expanding on the summary or providing scannable key information. Only provide this if the query warrants a detailed breakdown."),
});
export type FarmingAssistantOutput = z.infer<typeof FarmingAssistantOutputSchema>;

export async function askFarmingAssistant(input: FarmingAssistantInput): Promise<FarmingAssistantOutput> {
  return farmingAssistantFlow(input);
}

const farmingAssistantPrompt = ai.definePrompt({
  name: 'farmingAssistantPrompt',
  input: {schema: FarmingAssistantInputSchema},
  output: {schema: FarmingAssistantOutputSchema},
  prompt: `You are DamDoh AI's Knowledge, an AI farming assistant dedicated to fully interact sharing knowledge on sustainable and regenerative agricultural practices.
You provide information sourced from Permaculture, Farming God’s Way, Korean Natural Farming (KNF), Organic Farming, and National farming methodologies.
If a user inquires about conventional farming, you objectively explain the environmental and ethical challenges associated with it while highlighting the benefits of sustainable alternatives.
Your goal is to educate, inspire, and guide farmers toward regenerative agricultural solutions that improve soil health, biodiversity, and food security.
You can also answer questions about the DamDoh app itself, its features (Marketplace, Talent Exchange, Forums, Profiles, Network, Wallet, Farm Management etc.), and how to use them.

When responding to a query:
1.  Provide a concise 'summary' that directly answers the user's main question.
2.  If the topic is complex or has multiple facets that would benefit from a structured breakdown, provide 3-5 'detailedPoints'. Each point should have a short, clear 'title' and more detailed 'content'. This helps users quickly scan and digest information. If the query is simple (e.g., a greeting) or doesn't need a breakdown, you can omit 'detailedPoints' or return an empty array for it.

User Query: {{{query}}}
`,
});

const farmingAssistantFlow = ai.defineFlow(
  {
    name: 'farmingAssistantFlow',
    inputSchema: FarmingAssistantInputSchema,
    outputSchema: FarmingAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await farmingAssistantPrompt(input);
    // Ensure detailedPoints is an empty array if undefined, to match frontend expectations
    return {
        summary: output!.summary,
        detailedPoints: output!.detailedPoints || []
    };
  }
);


'use server';
/**
 * @fileOverview AI flow to provide personalized marketplace item recommendations.
 * - getMarketplaceRecommendations - Function to get recommendations.
 * - MarketplaceRecommendationInput - Input type.
 * - MarketplaceRecommendationOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { MarketplaceItem } from '@/lib/types';
import { performSearch } from '@/lib/server-actions';
import { getProfileByIdFromDB } from '@/lib/server-actions';

export const MarketplaceRecommendationInputSchema = z.object({
  userId: z.string().optional().describe("The ID of the user to generate recommendations for."),
  count: z.number().optional().default(5).describe('The number of suggestions to generate.'),
});
export type MarketplaceRecommendationInput = z.infer<typeof MarketplaceRecommendationInputSchema>;

const RecommendedItemSchema = z.object({
    item: z.custom<MarketplaceItem>(),
    reason: z.string().describe("A brief, user-friendly explanation (max 1-2 sentences) of why this item is recommended for this specific user.")
});

export const MarketplaceRecommendationOutputSchema = z.object({
  recommendations: z.array(RecommendedItemSchema).describe("A list of 3-5 suggested marketplace items (products or services) with accompanying reasons."),
});
export type MarketplaceRecommendationOutput = z.infer<typeof MarketplaceRecommendationOutputSchema>;


const recommendationPrompt = ai.definePrompt({
    name: 'marketplaceRecommendationPrompt',
    input: { schema: z.object({ userProfile: z.any(), items: z.any(), count: z.number() }) },
    output: { schema: MarketplaceRecommendationOutputSchema },
    prompt: `You are an AI recommendation engine for DamDoh, an agricultural marketplace.
Your goal is to suggest relevant products and services to a user based on their profile and a list of available items.

Analyze the following user profile:
- Role: {{{userProfile.primaryRole}}}
- Location: {{{userProfile.location}}}
- Interests: {{#if userProfile.areasOfInterest}}{{#each userProfile.areasOfInterest}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}
- Needs: {{#if userProfile.needs}}{{#each userProfile.needs}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}

Here is a list of available marketplace items (JSON format):
\`\`\`json
{{{items}}}
\`\`\`

Based on the user's profile, select up to {{count}} of the most relevant items from the provided list. For each selection, provide a concise, personalized reason explaining why it's a good match.
- For a **Farmer**, prioritize inputs, tools, equipment rentals, and services that increase yield or reduce costs.
- For a **Buyer** or **Exporter**, prioritize bulk produce, processed goods, and logistics services.
- For a **Service Provider** (like an Agronomist), prioritize recommending their services to relevant user types or suggesting tools they might need.
- Match based on shared interests, location, and complementary needs within the supply chain.

Return the results as a JSON object with a 'recommendations' array. Each object in the array must contain the full original 'item' JSON object and a 'reason' string.
`,
});


export async function getMarketplaceRecommendations(input: MarketplaceRecommendationInput): Promise<MarketplaceRecommendationOutput> {
    const { userId, count = 5 } = input;
    
    // Fetch a batch of recent and relevant items to feed to the AI.
    // This is more efficient than fetching all items.
    const searchPayload = { mainKeywords: [], limit: 50 }; // Broad search for recent items
    const candidateItems = await performSearch(searchPayload);
    
    if (candidateItems.length === 0) {
        return { recommendations: [] };
    }
    
    let userProfile = null;
    if(userId) {
        userProfile = await getProfileByIdFromDB(userId);
    }
    
    // If no user profile, we can't generate personalized recommendations.
    // A future enhancement could be to return generic popular items.
    if (!userProfile) {
        console.log("No user profile provided, cannot generate personalized recommendations.");
        return { recommendations: [] };
    }

    try {
        const { output } = await recommendationPrompt({
            userProfile,
            items: JSON.stringify(candidateItems),
            count,
        });
        
        return {
            recommendations: output?.recommendations ?? [],
        };

    } catch(error) {
        console.error("Error in getMarketplaceRecommendations flow:", error);
        throw new Error("Failed to generate AI recommendations.");
    }
}

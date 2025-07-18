
'use server';
/**
 * @fileOverview AI flow to provide personalized marketplace item recommendations.
 * - getMarketplaceRecommendations - Function to get recommendations.
 * - MarketplaceRecommendationInput - Input type for the user profile and candidate items.
 * - MarketplaceRecommendationOutput - The structured output with recommendations and reasons.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { MarketplaceRecommendationInputSchema, MarketplaceRecommendationOutputSchema } from '@/lib/schemas'; // Import from schemas
import { performSearch } from '@/lib/server-actions';
import { getProfileByIdFromDB } from '@/lib/server-actions';


const recommendationPrompt = ai.definePrompt({
    name: 'marketplaceRecommendationPrompt',
    input: { schema: z.object({ userProfile: z.any(), items: z.any(), count: z.number(), language: z.string().optional() }) },
    output: { schema: MarketplaceRecommendationOutputSchema },
    prompt: `You are an AI recommendation engine for DamDoh, an agricultural marketplace.
Your goal is to suggest relevant products and services to a user based on their profile and a list of available items.

**CRITICAL INSTRUCTION: You MUST generate the 'reason' text for each suggestion in the specified language: '{{{language}}}'.**

Analyze the following user profile:
- Role: {{{userProfile.primaryRole}}}
- Location: {{{userProfile.location.address}}}
- Interests: {{#if userProfile.areasOfInterest}}{{#each userProfile.areasOfInterest}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}
- Needs: {{#if user.needs}}{{#each user.needs}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}Not specified{{/if}}

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


export async function getMarketplaceRecommendations(input: any): Promise<any> {
    const { userId, count = 5, language = 'en' } = input;
    
    if (!userId) {
        return { recommendations: [] };
    }
    
    const userProfile = await getProfileByIdFromDB(userId);
    if (!userProfile) {
        console.log("No user profile found, cannot generate personalized recommendations.");
        return { recommendations: [] };
    }
    
    const searchPayload = { mainKeywords: [], limit: 50 };
    const candidateItems = await performSearch(searchPayload);
    
    if (candidateItems.length === 0) {
        return { recommendations: [] };
    }

    try {
        const { output } = await recommendationPrompt({
            userProfile,
            items: JSON.stringify(candidateItems),
            count,
            language,
        });
        
        return {
            recommendations: output?.recommendations ?? [],
        };

    } catch(error) {
        console.error("Error in getMarketplaceRecommendations flow:", error);
        throw new Error("Failed to generate AI recommendations.");
    }
}

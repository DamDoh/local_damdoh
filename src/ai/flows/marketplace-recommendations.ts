
'use server';
/**
 * @fileOverview AI flow to provide personalized marketplace item recommendations.
 * - getMarketplaceRecommendations - Function to get recommendations.
 * - MarketplaceRecommendationInput - Input type.
 * - MarketplaceRecommendationOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MarketplaceRecommendationInputSchema = z.object({
  stakeholderRole: z.string().describe("The user's primary role in the agricultural supply chain (e.g., Farmer, Trader, Input Supplier)."),
  recentSearches: z.array(z.string()).optional().describe("A list of keywords the user has recently searched for."),
  viewedCategories: z.array(z.string()).optional().describe("A list of marketplace category IDs the user has recently viewed."),
  currentLocation: z.string().optional().describe("The user's current geographical location to help tailor local suggestions if applicable."),
});
export type MarketplaceRecommendationInput = z.infer<typeof MarketplaceRecommendationInputSchema>;

const RecommendedItemSchema = z.object({
    itemId: z.string().describe("The unique ID of the suggested marketplace item. Use plausible placeholder IDs like 'item1', 'service2', 'equipment3' from the dummy data context if inventing."),
    itemName: z.string().describe("The name of the suggested marketplace item."),
    reason: z.string().describe("A brief, user-friendly explanation (max 1-2 sentences) of why this item is recommended for this specific user.")
});

const MarketplaceRecommendationOutputSchema = z.object({
  suggestedItems: z.array(RecommendedItemSchema).describe("A list of 3-5 suggested marketplace items (products or services)."),
});
export type MarketplaceRecommendationOutput = z.infer<typeof MarketplaceRecommendationOutputSchema>;

export async function getMarketplaceRecommendations(input: MarketplaceRecommendationInput): Promise<MarketplaceRecommendationOutput> {
  return marketplaceRecommendationsFlow(input);
}

const marketplaceRecommendationsPrompt = ai.definePrompt({
  name: 'marketplaceRecommendationsPrompt',
  input: {schema: MarketplaceRecommendationInputSchema},
  output: {schema: MarketplaceRecommendationOutputSchema},
  prompt: `You are an AI recommendation engine for DamDoh, an agricultural marketplace.
Your goal is to suggest relevant products and services to users based on their profile and activity.

User Context:
- Stakeholder Role: {{{stakeholderRole}}}
{{#if recentSearches}}- Recent Searches: {{#each recentSearches}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{#if viewedCategories}}- Viewed Categories: {{#each viewedCategories}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
{{#if currentLocation}}- Current Location: {{{currentLocation}}}{{/if}}

Available Marketplace Categories (for context, not exhaustive, item IDs will be like 'fresh-produce-fruits', 'farm-labor-staffing'):
- Agricultural Produce (Fruits, Vegetables, Grains, Livestock, Dairy, Processed)
- Inputs & Supplies (Seeds, Fertilizers, Pest Control, Small Tools, Packaging)
- Machinery & Equipment (Heavy Machinery Sale/Rental, Farm Tools)
- Professional Services & Labor (Farm Labor, Consultancy, Equipment Ops, Logistics, Storage, Processing, Technical, Financial, Land Services, Training, Surveying)

Based on the user context, suggest 3-5 marketplace items (can be products or services) that would be highly relevant.
For each suggestion, provide:
1.  'itemId': A plausible placeholder ID for the item (e.g., 'item_organic_mangoes', 'service_soil_testing', 'equipment_tractor_rental'). If you know some item IDs from a dummy dataset (like 'item1', 'item3', 'service2'), you can use those.
2.  'itemName': The name of the item.
3.  'reason': A brief (1-2 sentences) user-friendly explanation of why this item is a good match.

Prioritize items that directly align with the user's role (e.g., inputs/equipment for Farmers, bulk commodities/logistics for Traders).
If location is provided, consider suggesting items that might be locally relevant, but global/general items are also fine.
Focus on diversity in your suggestions if possible.

Example for a Farmer interested in "fertilizers-soil" in Kenya:
- itemId: "item_organic_fertilizer_kenya"
- itemName: "Bulk Organic Compost (Kenya Sourced)"
- reason: "Enhance your soil fertility in Kenya with locally sourced organic compost, ideal for your farming needs."
`,
});

const marketplaceRecommendationsFlow = ai.defineFlow(
  {
    name: 'marketplaceRecommendationsFlow',
    inputSchema: MarketplaceRecommendationInputSchema,
    outputSchema: MarketplaceRecommendationOutputSchema,
  },
  async (input) => {
    const {output} = await marketplaceRecommendationsPrompt(input);
    return output!;
  }
);

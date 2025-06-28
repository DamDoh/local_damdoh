'use server';
/**
 * @fileOverview AI flow to interpret user search queries for the DamDoh platform.
 * This flow attempts to understand the user's intent, identify keywords, locations,
 * and suggest potential filters.
 * - interpretSearchQuery - Function to get the AI's interpretation of a search query.
 * - SearchQueryInput - Input type.
 * - SmartSearchInterpretation - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchQueryInputSchema = z.object({
  rawQuery: z.string().describe("The user's raw, unparsed search query."),
});
export type SearchQueryInput = z.infer<typeof SearchQueryInputSchema>;

const SuggestedFilterSchema = z.object({
  type: z.string().describe("The type of filter suggested (e.g., 'category', 'listingType', 'locationScope', 'intent')."),
  value: z.string().describe("The suggested value for the filter (e.g., 'fresh-produce-fruits', 'Product', 'Region', 'buy').")
});

const SmartSearchInterpretationSchema = z.object({
  originalQuery: z.string().describe("The original query provided by the user."),
  mainKeywords: z.array(z.string()).describe("The core items, products, or services the user is likely searching for, extracted from the query."),
  identifiedLocation: z.string().optional().describe("Any specific location (city, region, country, continent) explicitly mentioned or strongly implied by the query. If multiple are mentioned, pick the most prominent or encompassing one."),
  identifiedIntent: z.string().optional().describe("The inferred user intent (e.g., 'buy', 'sell', 'rent', 'find service', 'information')."),
  suggestedFilters: z.array(SuggestedFilterSchema).optional().describe("An array of potential filters that could be applied based on the query interpretation. Helps narrow down search results."),
  interpretationNotes: z.string().optional().describe("A brief explanation of how the AI understood the query, or suggestions for how the user might refine their search for better results. This could include identified scope like 'local', 'regional', 'continental', or 'global' if discernible."),
});
export type SmartSearchInterpretation = z.infer<typeof SmartSearchInterpretationSchema>;

export async function interpretSearchQuery(input: SearchQueryInput): Promise<SmartSearchInterpretation> {
  return queryInterpreterFlow(input);
}

const queryInterpreterPrompt = ai.definePrompt({
  name: 'queryInterpreterPrompt',
  input: {schema: SearchQueryInputSchema},
  output: {schema: SmartSearchInterpretationSchema},
  prompt: `You are an intelligent search query interpreter for DamDoh, an agricultural marketplace and supply chain platform.
Your task is to analyze the user's raw search query and extract structured information to help make the search smarter and more relevant.

User's Raw Query: "{{{rawQuery}}}"

Based on this query, please provide:
1.  **originalQuery**: Reiterate the user's original raw query.
2.  **mainKeywords**: Identify the primary items, products, services, or concepts the user is searching for. Extract these as an array of strings. (e.g., ["organic mangoes", "tractor repair"], ["coffee beans"]).
3.  **identifiedLocation**: If a specific location (city, region, country, continent) is mentioned or strongly implied, state it. If multiple locations are mentioned, identify the most relevant or primary one. If no location is clear, omit this field or provide a general scope like "Global".
4.  **identifiedIntent**: Infer the user's likely intent from the query. Examples: 'buy', 'sell', 'rent', 'find service', 'job search', 'information', 'advice'. If unclear, omit.
5.  **suggestedFilters**: Based on the query and intent, suggest potential filters an e-commerce platform might use. For example:
    *   If "buy fresh tomatoes Nairobi" is queried, suggest: \`[{ type: 'listingType', value: 'Product' }, { type: 'category', value: 'fresh-produce-vegetables' }, { type: 'location', value: 'Nairobi' }, { type: 'intent', value: 'buy' }]\`.
    *   If "agronomy consultant Kenya" is queried, suggest: \`[{ type: 'listingType', value: 'Service' }, { type: 'category', value: 'consultancy-advisory' }, {type: 'location', value: 'Kenya' }]\`.
    *   Other filter types could be 'locationScope' with values like 'Local', 'Regional', 'Continental', 'Global'.
6.  **interpretationNotes**: Provide a brief (1-2 sentences) explanation of your interpretation. For example, "User seems to be looking to buy X in Y location. They might also be interested in Z." Or, "Query is broad; suggesting to filter by category or location for more specific results." If you detect a geographical scope (local, regional, continental, global), mention it here.

Example for query "used tractors for sale in East Africa":
- originalQuery: "used tractors for sale in East Africa"
- mainKeywords: ["used tractors"]
- identifiedLocation: "East Africa"
- identifiedIntent: "buy"
- suggestedFilters: [{type: "listingType", value: "Product"}, {type: "category", value: "heavy-machinery-sale"}, {type: "locationScope", value: "Regional"}]
- interpretationNotes: "User is looking to buy second-hand tractors specifically within the East African region."

Strive to understand intent (buying, selling, information) and geographical scope if possible.
`,
});

const queryInterpreterFlow = ai.defineFlow(
  {
    name: 'queryInterpreterFlow',
    inputSchema: SearchQueryInputSchema,
    outputSchema: SmartSearchInterpretationSchema,
  },
  async (input) => {
    const {output} = await queryInterpreterPrompt(input);
    return output!;
  }
);

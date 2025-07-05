
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
  identifiedIntent: z.string().optional().describe("The inferred user intent (e.g., 'buy', 'sell', 'rent', 'find service', 'job search', 'information', 'advice')."),
  suggestedFilters: z.array(SuggestedFilterSchema).optional().describe("An array of potential filters that could be applied based on the query interpretation. Helps narrow down search results."),
  interpretationNotes: z.string().optional().describe("A brief explanation of how the AI understood the query, or suggestions for how the user might refine their search for better results. This could include identified scope like 'local', 'regional', 'continental', or 'global' if discernible."),
  minPrice: z.number().optional().describe("The minimum price if specified by the user (e.g., from 'over $50')."),
  maxPrice: z.number().optional().describe("The maximum price if specified by the user (e.g., from 'under $100')."),
  perUnit: z.string().optional().describe("The unit for the price if specified (e.g., '/kg', '/ton').")
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
3.  **identifiedLocation**: If a specific location (city, region, country, continent) is mentioned or strongly implied, state it. If no location is clear, omit this field.
4.  **identifiedIntent**: Infer the user's likely intent (e.g., 'buy', 'sell', 'rent', 'find service'). If unclear, omit.
5.  **price constraints**: If the user mentions a price (e.g., 'under $50', 'over $1000', 'between $20 and $40', 'costs 300'), extract the minimum and maximum price into the 'minPrice' and 'maxPrice' fields. Extract only the numbers.
6.  **unit constraints**: If a pricing unit is mentioned (e.g., '/kg', '/ton', per hour), extract it into the 'perUnit' field.
7.  **suggestedFilters**: Based on the query and intent, suggest potential filters an e-commerce platform might use. For example:
    *   "buy fresh tomatoes Nairobi under $2/kg" -> filters: \`[{ type: 'listingType', value: 'Product' }, { type: 'category', value: 'fresh-produce-vegetables' }]\`, minPrice: 0, maxPrice: 2, perUnit: "/kg".
    *   "agronomy consultant Kenya" -> filters: \`[{ type: 'listingType', value: 'Service' }, { type: 'category', value: 'consultancy-advisory' }]\`.
8.  **interpretationNotes**: Briefly explain your interpretation.

Example for query "used tractors for sale in East Africa between $5000 and $10000":
- originalQuery: "used tractors for sale in East Africa between $5000 and $10000"
- mainKeywords: ["used tractors"]
- identifiedLocation: "East Africa"
- identifiedIntent: "buy"
- minPrice: 5000
- maxPrice: 10000
- suggestedFilters: [{type: "listingType", value: "Product"}, {type: "category", value: "heavy-machinery-sale"}]
- interpretationNotes: "User is looking to buy second-hand tractors in East Africa within a specific price range."
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
    
    // Ensure the output is always a valid object with arrays initialized to prevent crashes.
    return {
        originalQuery: output?.originalQuery || input.rawQuery,
        mainKeywords: output?.mainKeywords ?? [],
        identifiedLocation: output?.identifiedLocation,
        identifiedIntent: output?.identifiedIntent,
        suggestedFilters: output?.suggestedFilters ?? [],
        interpretationNotes: output?.interpretationNotes,
        minPrice: output?.minPrice,
        maxPrice: output?.maxPrice,
        perUnit: output?.perUnit,
    };
  }
);


'use server';
/**
 * @fileOverview AI flow to suggest crop rotations for sustainable farming.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { CropRotationInputSchema, CropRotationOutputSchema, type CropRotationInput, type CropRotationOutput } from '@/lib/schemas';


const prompt = ai.definePrompt(
  {
    name: 'cropRotationSuggesterPrompt',
    input: { schema: CropRotationInputSchema },
    output: { schema: CropRotationOutputSchema },
    prompt: `You are an expert agronomist specializing in sustainable agriculture and crop rotation. Your task is to suggest suitable next crops for a farmer based on their field's history and location.

    **Context:**
    - **Location:** {{{location}}}
    - **Previous Crops Planted (most recent last):** {{#each cropHistory}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
    {{#if soilType}}- **Soil Type:** {{{soilType}}}{{/if}}

    **Your Task:**
    Based on the provided context, generate a list of 2-4 suitable crops for the next planting season. For each suggestion, provide the following:
    1.  **cropName:** The name of the crop.
    2.  **benefits:** Concisely explain the primary agronomic benefits of this rotation. Key benefits to consider are:
        - **Nitrogen Fixation:** (e.g., for legumes like beans, peas, clover).
        - **Pest & Disease Cycle Disruption:** Planting a crop from a different family.
        - **Weed Management:** Planting crops that outcompete common weeds.
        - **Soil Structure Improvement:** (e.g., deep-rooted crops like sunflowers or radishes).
        - **Nutrient Scavenging:** Planting crops that utilize different nutrient profiles.
    3.  **notes:** (Optional) Provide a brief, practical tip or consideration for the farmer.

    **Example Reasoning:**
    - If the last crop was a heavy feeder like Maize (a grass), suggest a legume like Soybeans to replenish nitrogen.
    - If the history is all cereals, suggest a broadleaf crop like Buckwheat or a root crop like Potatoes to break disease cycles.
    - Consider the location for crop suitability.

    Return the response ONLY in the specified JSON format.
    `,
  }
);


const suggestCropRotationFlow = ai.defineFlow(
  {
    name: 'suggestCropRotationFlow',
    inputSchema: CropRotationInputSchema,
    outputSchema: CropRotationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function suggestCropRotation(input: CropRotationInput): Promise<CropRotationOutput> {
  return suggestCropRotationFlow(input);
}

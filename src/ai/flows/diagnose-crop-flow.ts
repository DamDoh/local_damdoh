
'use server';
/**
 * @fileOverview An AI flow specifically for diagnosing crop health issues from an image.
 *
 * - diagnoseCrop - A function that handles the crop diagnosis process.
 * - DiagnoseCropInputSchema - The input type for the diagnoseCrop function.
 * - DiagnoseCropOutputSchema - The return type for the diagnoseCrop function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const DiagnoseCropInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('The user\'s description of the problem or question about the plant.'),
  language: z.string().optional().describe('The language for the AI to respond in (e.g., "en", "km"). Defaults to English.'),
});
export type DiagnoseCropInput = z.infer<typeof DiagnoseCropInputSchema>;

export const DiagnoseCropOutputSchema = z.object({
  isPlant: z.boolean().describe('Whether the image appears to contain a plant.'),
  isHealthy: z.boolean().describe('Whether the plant appears to be healthy.'),
  potentialProblems: z
    .array(z.string())
    .describe('A list of potential diseases, pests, or nutrient deficiencies identified.'),
  suggestedActions: z
    .array(
      z.object({
        title: z.string().describe('A short, actionable title for a suggested treatment or action.'),
        details: z.string().describe('A detailed description of the suggested action, preferably using sustainable or organic methods.'),
        type: z.enum(['treatment', 'prevention', 'further-investigation']).describe('The category of the suggested action.'),
      })
    )
    .describe('A list of structured, actionable suggestions for the user.'),
});
export type DiagnoseCropOutput = z.infer<typeof DiagnoseCropOutputSchema>;

export async function diagnoseCrop(input: DiagnoseCropInput): Promise<DiagnoseCropOutput> {
  return diagnoseCropFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseCropPrompt',
  input: { schema: DiagnoseCropInputSchema },
  output: { schema: DiagnoseCropOutputSchema },
  prompt: `You are an expert plant pathologist and agronomist specializing in sustainable and organic farming.
Your task is to analyze the provided image of a plant and the user's description to diagnose any potential health issues.

**CRITICAL INSTRUCTION: You MUST respond in the language specified by the 'language' parameter. The language code is '{{{language}}}'. If no language is specified, default to English.**

Analyze the following:
- Image: {{media url=photoDataUri}}
- User's Description: {{{description}}}

Based on your analysis, provide a structured response with the following information:
1.  **isPlant**: Determine if the image actually contains a plant.
2.  **isHealthy**: Assess if the plant in the image appears to be healthy.
3.  **potentialProblems**: List the specific potential diseases (e.g., "Powdery Mildew", "Bacterial Leaf Spot"), pests (e.g., "Aphids", "Spider Mites"), or nutrient deficiencies (e.g., "Nitrogen Deficiency", "Iron Chlorosis") you observe. If the plant is healthy, return an empty array.
4.  **suggestedActions**: Provide a list of 2-4 concrete, actionable suggestions. For each suggestion:
    -   Give it a clear 'title'.
    -   Provide 'details' explaining how to perform the action. Prioritize organic, regenerative, or KNF/FGW-based solutions where possible (e.g., "Apply a neem oil solution", "Introduce ladybugs for aphid control", "Top-dress with compost").
    -   Categorize the action's 'type' as 'treatment', 'prevention', 'further-investigation'.
    
If the plant appears healthy, provide preventative suggestions. If the image is unclear or not a plant, state that in the 'potentialProblems' and provide no actions.
`,
});

const diagnoseCropFlow = ai.defineFlow(
  {
    name: 'diagnoseCropFlow',
    inputSchema: DiagnoseCropInputSchema,
    outputSchema: DiagnoseCropOutputSchema,
  },
  async (input) => {
    const { output } = await prompt({ ...input, language: input.language || 'en' });
    return output!;
  }
);

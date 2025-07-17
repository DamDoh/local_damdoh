
'use server';
/**
 * @fileOverview A reusable Genkit flow for translating text.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranslateInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The target language code (e.g., "en", "km", "es").'),
});

const TranslateOutputSchema = z.string().describe('The translated text.');

export async function translateText(input: z.infer<typeof TranslateInputSchema>): Promise<string> {
  const llmResponse = await ai.generate({
    prompt: `Translate the following text to the language with the ISO 639-1 code "${input.targetLanguage}":\n\n"${input.text}"\n\nReturn ONLY the translated text, without any introductory phrases or quotation marks.`,
    output: {
      schema: TranslateOutputSchema,
    },
    temperature: 0.1, // Lower temperature for more deterministic translation
  });

  return llmResponse.output() || ""; // Return empty string if translation fails
}

    
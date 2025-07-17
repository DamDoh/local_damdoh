
'use server';
/**
 * @fileOverview AI flow to generate a draft for a new forum post.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateForumPostDraftInputSchema = z.object({
  topicId: z.string().describe('The ID of the forum topic the post will be created in.'),
  prompt: z.string().describe('The user\'s short prompt or idea for the post.'),
  language: z.string().optional().describe('The language for the AI to respond in (e.g., "en", "km"). Defaults to English.'),
});
export type GenerateForumPostDraftInput = z.infer<typeof GenerateForumPostDraftInputSchema>;

export const GenerateForumPostDraftOutputSchema = z.object({
  title: z.string().describe('A concise and engaging title for the new forum post.'),
  content: z.string().describe('The full content of the forum post, written in a helpful and engaging tone.'),
});
export type GenerateForumPostDraftOutput = z.infer<typeof GenerateForumPostDraftOutputSchema>;

export const generateForumPostDraftFlow = ai.defineFlow(
  {
    name: 'generateForumPostDraftFlow',
    inputSchema: GenerateForumPostDraftInputSchema,
    outputSchema: GenerateForumPostDraftOutputSchema,
  },
  async ({ topicId, prompt, language }) => {
    // In a real app, you might fetch topic details using topicId to provide more context to the AI.
    
    const llmResponse = await ai.generate({
      prompt: `You are an expert community manager for an agricultural platform called DamDoh.
      A user wants to create a new forum post based on the following prompt.
      
      CRITICAL INSTRUCTION: You MUST generate the response (title and content) in the specified language: '${language || 'en'}'.
      
      User's Prompt: "${prompt}"

      Your task is to generate a well-structured forum post draft that includes:
      1.  A clear and engaging title.
      2.  A main content body that elaborates on the prompt, perhaps by asking open-ended questions to encourage discussion or providing some initial context.

      Return ONLY the generated title and content in the specified JSON format.`,
      output: {
        schema: GenerateForumPostDraftOutputSchema,
      },
      temperature: 0.7,
    });

    return llmResponse.output() || { title: '', content: '' };
  }
);

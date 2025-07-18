
'use server';
/**
 * @fileOverview AI flow to generate a draft for a new forum post.
 */

import { ai } from '@/ai/genkit';
import { GenerateForumPostDraftInputSchema, GenerateForumPostDraftOutputSchema } from './schemas';


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

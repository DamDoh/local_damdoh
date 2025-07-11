
'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const ForumTopicSuggestionSchema = z.object({
  title: z.string().describe('A compelling and engaging title for a new forum topic. Should be a question or a statement that encourages discussion.'),
  description: z.string().describe('A brief, one-sentence description of what the topic will be about, to be used as a placeholder or helper text.'),
  category: z.enum(['General', 'Technology', 'Markets', 'Sustainability', 'Logistics', 'Policy']).describe('The most relevant category for this suggested topic.'),
});

export const ForumTopicSuggestionsOutputSchema = z.object({
  suggestions: z.array(ForumTopicSuggestionSchema),
});

const existingTopicsSchema = z.array(z.object({
    name: z.string(),
    description: z.string(),
}));

export const suggestForumTopics = ai.defineFlow(
  {
    name: 'suggestForumTopics',
    inputSchema: z.object({ existingTopics: existingTopicsSchema }),
    outputSchema: ForumTopicSuggestionsOutputSchema,
  },
  async (input) => {
    const llmResponse = await ai.generate({
      prompt: `Based on the following list of existing forum topics, generate 5 new, engaging, and relevant topic suggestions for an agricultural community platform. The suggestions should cover a range of categories and encourage discussion. Avoid creating duplicates of existing topics.

      Existing Topics:
      ${input.existingTopics.map(t => `- ${t.name}`).join('
')}

      Your suggestions should be diverse and interesting.
      `,
      output: {
        schema: ForumTopicSuggestionsOutputSchema,
      },
      temperature: 0.8, // Increase creativity
    });

    return llmResponse.output() || { suggestions: [] };
  }
);

// ForumTopicSuggestions.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting relevant forum topics to users.
 *
 * It takes user profile information and activity data as input and returns a list of suggested forum topics.
 * - suggestForumTopics - A function that suggests forum topics.
 * - SuggestForumTopicsInput - The input type for the suggestForumTopics function.
 * - SuggestForumTopicsOutput - The return type for the suggestForumTopics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestForumTopicsInputSchema = z.object({
  stakeholderProfile: z
    .string()
    .describe('The profile information of the stakeholder, including their role, preferences, and location.'),
  recentActivity: z
    .string()
    .describe('A summary of the users recent activity on the platform, including forum posts, liked content, and searches.'),
});
export type SuggestForumTopicsInput = z.infer<typeof SuggestForumTopicsInputSchema>;

const SuggestForumTopicsOutputSchema = z.object({
  suggestedTopics: z
    .array(z.string())
    .describe('A list of suggested forum topics based on the users profile and activity.'),
});
export type SuggestForumTopicsOutput = z.infer<typeof SuggestForumTopicsOutputSchema>;

export async function suggestForumTopics(input: SuggestForumTopicsInput): Promise<SuggestForumTopicsOutput> {
  return suggestForumTopicsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestForumTopicsPrompt',
  input: {schema: SuggestForumTopicsInputSchema},
  output: {schema: SuggestForumTopicsOutputSchema},
  prompt: `You are an expert in matching users with relevant forum topics on an agricultural social media platform.

  Given the following user profile and recent activity, suggest a list of forum topics that would be of interest to the user.
  Return ONLY a list of topics, one topic per line.

  Stakeholder Profile: {{{stakeholderProfile}}}
  Recent Activity: {{{recentActivity}}}
  `,
});

const suggestForumTopicsFlow = ai.defineFlow(
  {
    name: 'suggestForumTopicsFlow',
    inputSchema: SuggestForumTopicsInputSchema,
    outputSchema: SuggestForumTopicsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      suggestedTopics: output!.suggestedTopics,
    };
  }
);

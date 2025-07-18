
'use server';
/**
 * @fileOverview AI flow to generate forum topic suggestions.
 */
import { ai } from "@/ai/genkit";
import { SuggestForumTopicsInputSchema, ForumTopicSuggestionsOutputSchema } from './schemas';

export const suggestForumTopics = ai.defineFlow(
  {
    name: "suggestForumTopics",
    inputSchema: SuggestForumTopicsInputSchema,
    outputSchema: ForumTopicSuggestionsOutputSchema,
  },
  async (input) => {
    // Construct the list of existing topics cleanly.
    const existingTopicsList = input.existingTopics
      .map((t) => `- ${t.name}`)
      .join("\n");

    // Construct the final prompt.
    const prompt = `Based on the following list of existing forum topics, generate 5 new, engaging, and relevant topic suggestions for an agricultural community platform. The suggestions should cover a range of categories and encourage discussion. Avoid creating duplicates of existing topics.
      
CRITICAL: You MUST generate the response (titles and descriptions) in the specified language: '${
  input.language || "en"
}'.

Existing Topics:
${existingTopicsList}

Your suggestions should be diverse and interesting.`;

    const llmResponse = await ai.generate({
      prompt: prompt,
      output: {
        schema: ForumTopicSuggestionsOutputSchema,
      },
      temperature: 0.8, // Increase creativity
    });

    return llmResponse.output() || { suggestions: [] };
  }
);


import { z } from 'genkit';

export const GenerateForumPostDraftInputSchema = z.object({
  topicId: z.string().describe('The ID of the forum topic the post will be created in.'),
  prompt: z.string().describe("The user's short prompt or idea for the post."),
  language: z.string().optional().describe('The language for the AI to respond in (e.g., "en", "km"). Defaults to English.'),
});
export type GenerateForumPostDraftInput = z.infer<typeof GenerateForumPostDraftInputSchema>;

export const GenerateForumPostDraftOutputSchema = z.object({
  title: z.string().describe('A concise and engaging title for the new forum post.'),
  content: z.string().describe('The full content of the forum post, written in a helpful and engaging tone.'),
});
export type GenerateForumPostDraftOutput = z.infer<typeof GenerateForumPostDraftOutputSchema>;

export const ForumTopicSuggestionSchema = z.object({
  title: z
    .string()
    .describe("A concise and engaging title for the new forum topic."),
  description: z
    .string()
    .describe("A brief, one-sentence description of what the topic is about."),
});

export const ForumTopicSuggestionsOutputSchema = z.object({
  suggestions: z.array(ForumTopicSuggestionSchema),
});

export const SuggestForumTopicsInputSchema = z.object({
  existingTopics: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
    })
  ),
  language: z
    .string()
    .optional()
    .describe(
      "The language for the AI to respond in, specified as a two-letter ISO 639-1 code. Defaults to English."
    ),
});

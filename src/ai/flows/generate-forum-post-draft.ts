
'use server';
/**
 * @fileOverview AI flow to generate a draft for a new forum post.
 * This flow takes a user's prompt and the context of a forum topic
 * to create a well-structured and relevant post.
 * - generateForumPostDraft - Function to get an AI-generated post draft.
 * - GenerateForumPostDraftInput - Input type.
 * - GenerateForumPostDraftOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getAdminDb } from '@/lib/firebase/admin';

const GenerateForumPostDraftInputSchema = z.object({
  topicId: z.string().describe('The ID of the forum topic where the post will be created.'),
  prompt: z.string().describe("The user's initial idea, question, or prompt for the post."),
  language: z.string().optional().describe('The language for the AI to respond in, specified as a two-letter ISO 639-1 code. Defaults to English.'),
});
export type GenerateForumPostDraftInput = z.infer<typeof GenerateForumPostDraftInputSchema>;

const GenerateForumPostDraftOutputSchema = z.object({
  title: z.string().describe("A concise and engaging title for the forum post."),
  content: z.string().describe("The full, well-structured content of the forum post, ready for the user to review and edit."),
});
export type GenerateForumPostDraftOutput = z.infer<typeof GenerateForumPostDraftOutputSchema>;

export async function generateForumPostDraft(input: GenerateForumPostDraftInput): Promise<GenerateForumPostDraftOutput> {
  return generateForumPostDraftFlow(input);
}

const generateForumPostDraftPrompt = ai.definePrompt({
  name: 'generateForumPostDraftPrompt',
  input: { schema: z.object({ topicName: z.string(), topicDescription: z.string(), userPrompt: z.string(), language: z.string().optional() }) },
  output: { schema: GenerateForumPostDraftOutputSchema },
  prompt: `You are an expert community manager and content creator for DamDoh, an agricultural platform.
Your task is to help a user draft a high-quality forum post based on their prompt.

**CRITICAL: You MUST generate the response (both title and content) in the specified language: '{{{language}}}'.**

The post will be in the following forum topic:
- Topic Name: "{{{topicName}}}"
- Topic Description: "{{{topicDescription}}}"

The user's prompt/idea for the post is:
"{{{userPrompt}}}"

Based on this, please generate:
1.  A clear and engaging 'title' for the post that accurately reflects the user's prompt and fits the topic.
2.  A well-structured 'content' for the post. The content should expand on the user's prompt, be easy to read, and encourage discussion. If the user asks a question, make sure the content frames it clearly. If they are sharing an idea, structure it with a brief introduction, key points, and a concluding thought.
`,
});

const generateForumPostDraftFlow = ai.defineFlow(
  {
    name: 'generateForumPostDraftFlow',
    inputSchema: GenerateForumPostDraftInputSchema,
    outputSchema: GenerateForumPostDraftOutputSchema,
  },
  async ({ topicId, prompt, language }) => {
    const adminDb = getAdminDb();
    if (!adminDb) {
      throw new Error("Firestore Admin DB not initialized.");
    }
    // Fetch topic details to provide more context to the AI
    const topicDoc = await adminDb.collection('forums').doc(topicId).get();
    if (!topicDoc.exists) {
      throw new Error("Forum topic not found.");
    }
    const topicData = topicDoc.data()!;
    
    const { output } = await generateForumPostDraftPrompt({
      topicName: topicData.name,
      topicDescription: topicData.description,
      userPrompt: prompt,
      language: language || 'en',
    });
    
    return output!;
  }
);

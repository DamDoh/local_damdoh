
'use server';
/**
 * @fileOverview Flow to generate personalized connection suggestions for a user.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getFirestore} from 'firebase-admin/firestore';
import { UserProfile } from '@/lib/types';

// Initialize Firestore
const db = getFirestore();

// Input schema for the flow
const SuggestedConnectionsInputSchema = z.object({
  userId: z.string().describe('The ID of the user for whom to generate suggestions.'),
  count: z.number().optional().default(5).describe('The number of suggestions to generate.'),
});

// Output schema for a single suggestion
const ConnectionSuggestionSchema = z.object({
  userId: z.string().describe("The ID of the suggested user."),
  name: z.string().describe("The name of the suggested user."),
  role: z.string().describe("The primary role of the suggested user."),
  avatarUrl: z.string().optional().describe("The URL of the user's avatar image."),
  reason: z.string().describe("A brief, personalized reason why this user is a good connection suggestion. (e.g., 'Shares your interest in organic coffee farming.')"),
});

// Output schema for the entire flow
const SuggestedConnectionsOutputSchema = z.object({
  suggestions: z.array(ConnectionSuggestionSchema),
});

/**
 * Fetches a batch of potential users to suggest, excluding the current user and those they already follow.
 * @param currentUserId The ID of the user we are generating suggestions for.
 * @returns A promise that resolves to an array of UserProfile objects.
 */
async function getPotentialCandidates(currentUserId: string): Promise<UserProfile[]> {
    // In a real-world scenario, you would exclude users the current user already follows.
    // This is simplified for this example.
    const usersSnapshot = await db.collection('users').limit(50).get();
    const candidates: UserProfile[] = [];
    usersSnapshot.forEach(doc => {
        if (doc.id !== currentUserId) {
            candidates.push({ id: doc.id, ...doc.data() } as UserProfile);
        }
    });
    return candidates;
}

// Define the AI prompt
const connectionSuggesterPrompt = ai.definePrompt({
  name: 'connectionSuggesterPrompt',
  input: { schema: z.object({ userProfile: z.any(), candidates: z.any(), count: z.number() }) },
  output: { schema: SuggestedConnectionsOutputSchema },
  prompt: `
    You are an expert networking assistant for an agricultural platform called DamDoh.
    Your task is to analyze a user's profile and suggest other relevant users to connect with from a provided list of candidates.

    The user's profile is:
    - Name: {{{userProfile.name}}}
    - Role: {{{userProfile.role}}}
    - Bio: {{{userProfile.bio}}}
    - Interests: {{{userProfile.interests}}}

    Analyze the following list of potential candidates:
    ---
    {{#each candidates}}
    - ID: {{this.id}}, Name: {{this.name}}, Role: {{this.role}}, Bio: {{this.bio}}, Interests: {{this.interests}}
    {{/each}}
    ---

    Based on the user's profile, select the top {{count}} most relevant candidates to suggest as new connections. For each suggestion, provide a concise and personalized reason explaining why they would be a good connection. Focus on shared interests, complementary roles in the supply chain, or similar goals.

    Return the results in the specified JSON format.
  `,
});

// Define the main flow
export const suggestConnections = ai.defineFlow(
  {
    name: 'suggestConnections',
    inputSchema: SuggestedConnectionsInputSchema,
    outputSchema: SuggestedConnectionsOutputSchema,
  },
  async (input) => {
    // 1. Fetch the user's profile
    const userDoc = await db.collection('users').doc(input.userId).get();
    if (!userDoc.exists) {
      console.error('User not found:', input.userId);
      return { suggestions: [] };
    }
    const userProfile = userDoc.data();

    // 2. Fetch potential candidates
    const candidates = await getPotentialCandidates(input.userId);
    if (candidates.length === 0) {
        return { suggestions: [] };
    }

    // 3. Use the AI to generate suggestions
    const { output } = await connectionSuggesterPrompt({
      userProfile,
      candidates,
      count: input.count,
    });
    
    return output || { suggestions: [] };
  }
);

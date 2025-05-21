// This file contains the Genkit flow for suggesting connections to users.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * @fileOverview This file defines the suggested connections AI agent.
 *
 * - suggestConnections - A function that suggests connections based on user profile data.
 * - SuggestedConnectionsInput - The input type for the suggestConnections function.
 * - SuggestedConnectionsOutput - The return type for the suggestConnections function.
 */

const StakeholderRoleSchema = z.enum([
  'Farmer',
  'Input Supplier',
  'Pre-Harvest Contractor',
  'Collection Agent',
  'Processor',
  'Trader',
  'Retailer',
  'Exporter',
  'Consumer',
  'Government Agency',
  'Agricultural Cooperative',
  'Financial Institution',
  'Trade Association',
  'Development Personnel',
]);

const SuggestedConnectionsInputSchema = z.object({
  profileSummary: z
    .string()
    .describe(
      'A concise summary of the user profile, including role, preferences, location, and expressed needs.'
    ),
  stakeholderRole: StakeholderRoleSchema.describe(
    'The role of the user within the agricultural supply chain.'
  ),
  location: z.string().describe('The location of the user.'),
  preferences: z
    .string()
    .describe('The preferences of the user in connecting with others.'),
  needs: z.string().describe('The needs of the user in connecting with others.'),
});
export type SuggestedConnectionsInput = z.infer<
  typeof SuggestedConnectionsInputSchema
>;

const SuggestedConnectionsOutputSchema = z.object({
  suggestedConnections: z
    .array(z.string())
    .describe(
      'A list of suggested connections based on the user profile and preferences.'
    ),
  reasoning: z
    .string()
    .describe(
      'Explanation of why these connections are suggested, based on matching roles, preferences, location, and needs.'
    ),
});
export type SuggestedConnectionsOutput = z.infer<
  typeof SuggestedConnectionsOutputSchema
>;

export async function suggestConnections(
  input: SuggestedConnectionsInput
): Promise<SuggestedConnectionsOutput> {
  return suggestConnectionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestConnectionsPrompt',
  input: {schema: SuggestedConnectionsInputSchema},
  output: {schema: SuggestedConnectionsOutputSchema},
  prompt: `You are an AI assistant designed to suggest relevant connections for users of an agricultural supply chain networking platform.

  Given the following user profile information, suggest a list of connections that would be valuable to the user. Consider their role, preferences, location, and needs when making suggestions.

  Profile Summary: {{{profileSummary}}}
  Stakeholder Role: {{{stakeholderRole}}}
  Location: {{{location}}}
  Preferences: {{{preferences}}}
  Needs: {{{needs}}}

  Provide a list of suggested connections and explain your reasoning for each suggestion, highlighting how it aligns with the user's profile and goals. Output the suggested connections as a list of names or profile descriptions.
  Output reasoning for the suggested connections.
  `, 
});

const suggestConnectionsFlow = ai.defineFlow(
  {
    name: 'suggestConnectionsFlow',
    inputSchema: SuggestedConnectionsInputSchema,
    outputSchema: SuggestedConnectionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

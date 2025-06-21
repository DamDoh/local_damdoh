
// This file contains the Genkit flow for suggesting connections to users.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { STAKEHOLDER_ROLES } from '@/lib/constants';

/**
 * @fileOverview This file defines the suggested connections AI agent.
 *
 * - suggestConnections - A function that suggests connections based on user profile data.
 * - SuggestedConnectionsInput - The input type for the suggestConnections function.
 * - SuggestedConnectionsOutput - The return type for the suggestConnections function.
 */

const StakeholderRoleSchema = z.enum(STAKEHOLDER_ROLES);

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
    .describe('The preferences of the user in connecting with others (e.g., "sustainable farming", "export markets").'),
  needs: z.string().describe('The needs of the user in connecting with others (e.g., "bulk buyers for coffee", "cold storage solutions").'),
});
export type SuggestedConnectionsInput = z.infer<
  typeof SuggestedConnectionsInputSchema
>;

const SuggestedConnectionSchema = z.object({
    id: z.string().describe("A unique placeholder identifier for the suggested profile (e.g., 'kenyaNutExporter', 'agriLogisticsEA')."),
    name: z.string().describe("The name of the suggested individual or organization."),
    role: z.string().describe("The stakeholder role of the suggested connection (e.g., 'Exporter', 'Logistics Provider', 'Farmer Cooperative')."),
    avatarUrl: z.string().optional().describe("An optional placeholder image URL for the avatar (e.g., 'https://placehold.co/50x50.png')."),
    reason: z.string().describe("A brief (1-2 sentence) explanation of why this connection is relevant to the user based on their profile, preferences, and needs.")
});

const SuggestedConnectionsOutputSchema = z.object({
  suggestedConnections: z
    .array(SuggestedConnectionSchema)
    .describe(
      'A list of suggested connections, each with an ID, name, role, optional avatar URL, and a reason for the suggestion.'
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
  prompt: `You are an AI assistant for DamDoh, an agricultural supply chain networking platform. Your goal is to suggest relevant connections (individuals or organizations) to users.

  Given the following user profile information:
  - Profile Summary: {{{profileSummary}}}
  - Stakeholder Role: {{{stakeholderRole}}}
  - Location: {{{location}}}
  - Preferences: {{{preferences}}}
  - Needs: {{{needs}}}

  Please generate a list of 3-5 plausible, agriculture-focused connections that would be valuable to this user.
  For each suggestion, provide:
  1.  A unique placeholder 'id' (e.g., 'freshFruitKenya', 'agriTechSolutionsGlobal').
  2.  A realistic 'name' for the person or organization.
  3.  Their 'role' in the agricultural supply chain.
  4.  An optional 'avatarUrl' (you can use 'https://placehold.co/50x50.png' if you don't have a specific one).
  5.  A concise 'reason' (1-2 sentences) explaining why this connection is relevant, considering the user's role, preferences, location, and needs. Focus on creating actionable and logical connections within an agricultural context.

  Example output format for one suggestion:
  {
    "id": "organicCocoaExporterGhana",
    "name": "EcoHarvest Exports Ghana",
    "role": "Exporter",
    "avatarUrl": "https://placehold.co/50x50.png",
    "reason": "Given your interest in organic cocoa and export markets, EcoHarvest Exports Ghana could be a valuable partner as they specialize in fair-trade organic cocoa beans from West Africa."
  }

  Prioritize suggesting connections that address the user's stated needs and align with their preferences and role. For instance, if a farmer needs buyers, suggest processors or retailers. If a processor needs reliable suppliers, suggest farmer cooperatives or collection agents.
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


'use server';

/**
 * @fileOverview AI flow to generate a short profile summary from profile details.
 *
 * - generateProfileSummary - A function that generates a profile summary.
 * - ProfileSummaryInput - The input type for the generateProfileSummary function.
 * - ProfileSummaryOutput - The return type for the generateProfileSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProfileSummaryInputSchema = z.object({
  stakeholderType: z.string().describe('The type of stakeholder (e.g., Farmer, Input Supplier).'),
  yearsOfExperience: z.number().optional().describe('The number of years of experience in the agricultural sector.'),
  location: z.string().optional().describe('The location of the stakeholder.'),
  areasOfInterest: z.string().optional().describe('Specific areas of interest within the agricultural supply chain, comma-separated.'),
  needs: z.string().optional().describe('The needs of the stakeholder (e.g., finding buyers, suppliers, collaborators), comma-separated.'),
  language: z.string().optional().describe('The language for the AI to respond in, specified as a two-letter ISO 639-1 code. Defaults to English.'),
});
export type ProfileSummaryInput = z.infer<typeof ProfileSummaryInputSchema>;

const ProfileSummaryOutputSchema = z.object({
  summary: z.string().describe('A short, professional, first-person summary for the stakeholder profile (e.g., "I am an experienced farmer...").'),
});
export type ProfileSummaryOutput = z.infer<typeof ProfileSummaryOutputSchema>;

export async function generateProfileSummary(input: ProfileSummaryInput): Promise<ProfileSummaryOutput> {
  return generateProfileSummaryFlow(input);
}

const profileSummaryPrompt = ai.definePrompt({
  name: 'profileSummaryPrompt',
  input: {schema: ProfileSummaryInputSchema},
  output: {schema: ProfileSummaryOutputSchema},
  prompt: `You are an expert career coach who writes compelling professional summaries for online profiles on an agricultural platform called DamDoh.

  Based on the information provided, generate a concise, professional, first-person summary (1-2 sentences, under 250 characters). The summary should sound authentic and highlight the stakeholder's role, key interests, and goals.

  **CRITICAL: You MUST generate the summary in the specified language: '{{{language}}}'.**

  Stakeholder Information:
  - Role: {{{stakeholderType}}}
  {{#if location}}- Location: {{{location}}}{{/if}}
  {{#if yearsOfExperience}}- Years of Experience: {{{yearsOfExperience}}}{{/if}}
  {{#if areasOfInterest}}- Main Interests: {{{areasOfInterest}}}{{/if}}
  {{#if needs}}- Key Needs/Goals: {{{needs}}}{{/if}}

  Write the summary from a first-person perspective (e.g., "I am a..."). Make it engaging and professional.
  
  Example for a Farmer in Kenya:
  "I am a passionate organic farmer from Kenya with a focus on sustainable coffee production, currently seeking to connect with fair trade buyers and logistics partners."
  
  Example for a Buyer in Europe:
  "As a European-based commodity buyer, I am focused on sourcing high-quality, traceable grains and am looking for reliable producer cooperatives in East Africa."
  `,
});

const generateProfileSummaryFlow = ai.defineFlow(
  {
    name: 'generateProfileSummaryFlow',
    inputSchema: ProfileSummaryInputSchema,
    outputSchema: ProfileSummaryOutputSchema,
  },
  async input => {
    const {output} = await profileSummaryPrompt({ ...input, language: input.language || 'en' });
    return {
      summary: output!.summary,
    };
  }
);

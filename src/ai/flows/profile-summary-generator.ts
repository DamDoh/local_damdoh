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
  yearsOfExperience: z.number().describe('The number of years of experience in the agricultural sector.'),
  location: z.string().describe('The location of the stakeholder.'),
  areasOfInterest: z.string().describe('Specific areas of interest within the agricultural supply chain.'),
  needs: z.string().describe('The needs of the stakeholder (e.g., finding buyers, suppliers, collaborators).'),
});
export type ProfileSummaryInput = z.infer<typeof ProfileSummaryInputSchema>;

const ProfileSummaryOutputSchema = z.object({
  summary: z.string().describe('A short summary of the stakeholder profile.'),
  progress: z.string().describe('A message indicating the progress of the profile summary generation.'),
});
export type ProfileSummaryOutput = z.infer<typeof ProfileSummaryOutputSchema>;

export async function generateProfileSummary(input: ProfileSummaryInput): Promise<ProfileSummaryOutput> {
  return generateProfileSummaryFlow(input);
}

const profileSummaryPrompt = ai.definePrompt({
  name: 'profileSummaryPrompt',
  input: {schema: ProfileSummaryInputSchema},
  output: {schema: ProfileSummaryOutputSchema},
  prompt: `You are an AI assistant designed to create short, engaging profile summaries for agricultural stakeholders.

  Based on the information provided, generate a concise summary (under 100 words) that highlights the stakeholder's expertise, interests, and needs.

  Stakeholder Type: {{{stakeholderType}}}
  Years of Experience: {{{yearsOfExperience}}}
  Location: {{{location}}}
  Areas of Interest: {{{areasOfInterest}}}
  Needs: {{{needs}}}

  Summary:`,
});

const generateProfileSummaryFlow = ai.defineFlow(
  {
    name: 'generateProfileSummaryFlow',
    inputSchema: ProfileSummaryInputSchema,
    outputSchema: ProfileSummaryOutputSchema,
  },
  async input => {
    const {output} = await profileSummaryPrompt(input);
    return {
      ...output!,
      progress: 'Generated a one-sentence summary of the profile.',
    };
  }
);

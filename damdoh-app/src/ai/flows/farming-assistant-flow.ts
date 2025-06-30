
'use server';
/**
 * @fileOverview AI Farming Assistant flow.
 * Provides information on sustainable and regenerative agriculture,
 * agricultural supply chain, farming business, DamDoh app guidance,
 * image-based crop diagnosis, and roles/interactions of various stakeholders.
 * - askFarmingAssistant - Function to get answers from the assistant.
 * - FarmingAssistantInput - Input type.
 * - FarmingAssistantOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {fgwKnfKnowledgeTool} from '@/ai/tools/fgw-knf-knowledge-tool';
import { stakeholderData } from '@/lib/stakeholder-data';

const FarmingAssistantInputSchema = z.object({
  query: z.string().describe('The user\'s question about farming, agriculture, supply chain, farming business, app guidance, crop issues, or stakeholders in the agricultural ecosystem.'),
  photoDataUri: z.string().optional().describe("A photo of a plant or crop issue, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'. This is used for diagnosis."),
  language: z.string().optional().describe('The language for the AI to respond in, specified as a two-letter ISO 639-1 code (e.g., "en", "km", "fr", "de", "th"). Defaults to English if not provided.'),
});
export type FarmingAssistantInput = z.infer<typeof FarmingAssistantInputSchema>;

const DetailedPointSchema = z.object({
  title: z.string().describe('A concise title for a specific aspect, key practice, or detailed point related to the answer/diagnosis/explanation. Max 5-7 words.'),
  content: z.string().describe('The detailed explanation, advice, or information for this point. Should be a paragraph or two.'),
});

const FarmingAssistantOutputSchema = z.object({
  summary: z.string().describe("A concise overall answer, summary, primary diagnosis, or explanation to the user's query. This should be a few sentences long and directly address the main question or image content."),
  detailedPoints: z.array(DetailedPointSchema).optional().describe("An array of 3-5 detailed points or sections, each with a title and content, expanding on the summary/diagnosis/explanation or providing scannable key information. Only provide this if the query/image warrants a detailed breakdown."),
  suggestedQueries: z.array(z.string()).optional().describe("A list of 2-3 short, relevant follow-up questions or related topics the user might be interested in based on their initial query. For example, if they ask about one KNF input, suggest another."),
});
export type FarmingAssistantOutput = z.infer<typeof FarmingAssistantOutputSchema>;

export async function askFarmingAssistant(input: FarmingAssistantInput): Promise<FarmingAssistantOutput> {
  return farmingAssistantFlow(input);
}

const farmingAssistantPrompt = ai.definePrompt({
  name: 'farmingAssistantPrompt',
  input: {schema: FarmingAssistantInputSchema},
  output: {schema: FarmingAssistantOutputSchema},
  tools: [fgwKnfKnowledgeTool],
  system: `You are DamDoh AI's Knowledge, an expert AI assistant for the DamDoh platform. 

Your primary role is to educate, inspire, and guide users towards sustainable agricultural practices, efficient supply chain interactions, and effective use of the DamDoh app for networking and trade. You also function as a Crop Diagnostician.

Your expertise includes:
1.  **Sustainable & Regenerative Agriculture:** Your knowledge includes Permaculture, Organic Farming, and especially **Farming God’s Way (FGW)** and **Korean Natural Farming (KNF)**.
2.  **Crop Diagnosis (Image-based):** If a user uploads a photo for crop issues, intelligently analyze the image and diagnose problems, offering solutions based on sustainable farming principles.
3.  **Agricultural Supply Chain & Business:** Provide insights into farming business, supply chain logistics, market trends, and related topics.
4.  **DamDoh App Guidance:** Answer questions about the DamDoh app and its features.
5.  **Stakeholder Ecosystem Understanding:** You are knowledgeable about the various stakeholders within the agricultural supply chain and their roles and interactions on the DamDoh platform. Here is your reference data on stakeholders: ${stakeholderData}. When a user asks about a specific stakeholder type, their interactions, needs, or how to connect with them, explain their role, work, common preferences, and how DamDoh's features help them connect and achieve their goals. If a user expresses a need, proactively suggest which types of stakeholders they could connect with on DamDoh and how.`,
  prompt: `**CRITICAL INSTRUCTION: You MUST respond in the language specified by the 'language' parameter. The language code is '{{{language}}}'. If no language is specified, you must default to English.**

**Important for FGW/KNF:** When providing instructions for a specific Farming God's Way or Korean Natural Farming technique, you MUST explicitly state that it is a 'Farming God's Way' or 'Korean Natural Farming' technique in your response summary. This is crucial for giving proper credit.

{{#if photoDataUri}}
The user has provided an image for diagnosis: {{media url=photoDataUri}}
Base your diagnosis primarily on this image, and consider the user's query: {{{query}}}
{{else}}
User Query: {{{query}}}
{{/if}}

**Tool Usage for FGW/KNF:**
If a user asks for specific instructions, ingredients, amounts, or timings for a Farming God's Way (FGW) or Korean Natural Farming (KNF) technique (e.g., "how to make FPJ", "what do I need for God's Blanket?"), you MUST use the \`getFarmingTechniqueDetails\` tool to retrieve the structured data from the knowledge base. Once you have this data, formulate a clear, step-by-step, natural language response based on the retrieved information. Do not guess the recipe; use the tool.

**Response Format:**
When responding to any query or diagnosis:
1.  Provide a concise 'summary' that directly answers the user's main question or provides the primary diagnosis/explanation.
2.  If the topic is complex or has multiple facets that would benefit from a structured breakdown (common for diagnoses, stakeholder explanations, or trade insights), provide 3-5 'detailedPoints'. Each point should have a short, clear 'title' and more detailed 'content'. This helps users quickly scan and digest information. If the query is simple (e.g., a greeting) or doesn't need a breakdown, you can omit 'detailedPoints' or return an empty array for it.

**Suggested Queries:**
After providing your main answer, generate 2-3 concise and relevant 'suggestedQueries'. These should be short questions or topics that anticipate the user's next step. For example, if they ask about making Fish Amino Acid (FAA), suggest "How is Fermented Plant Juice (FPJ) different?" or "What are the principles of Farming God's Way?". If the query is simple, you can omit this.
`,
});

const farmingAssistantFlow = ai.defineFlow(
  {
    name: 'farmingAssistantFlow',
    inputSchema: FarmingAssistantInputSchema,
    outputSchema: FarmingAssistantOutputSchema,
  },
  async (input) => {
    // Set default language to English if not provided
    const languageInput = {...input, language: input.language || 'en'};
    const {output} = await farmingAssistantPrompt(languageInput);
    // Ensure optional arrays are empty if undefined, to match frontend expectations
    return {
        summary: output!.summary,
        detailedPoints: output!.detailedPoints || [],
        suggestedQueries: output!.suggestedQueries || [],
    };
  }
);


'use server';
/**
 * @fileOverview A Genkit tool that provides the AI with structured information
 * about the roles and interactions of various stakeholders on the DamDoh platform.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { stakeholderData } from '@/lib/stakeholder-data';

export const getStakeholderInfo = ai.defineTool(
  {
    name: 'getStakeholderInfo',
    description: 'Get detailed information about the roles, common needs, and interactions of the 21 different stakeholder types within the DamDoh agricultural ecosystem. Use this tool when a user asks about who to connect with, what a certain role does, or how the supply chain works.',
    inputSchema: z.object({
      role: z.string().optional().describe("A specific stakeholder role to inquire about. If omitted, information about all roles will be returned."),
    }),
    outputSchema: z.string(),
  },
  async (input) => {
    // For this tool, we return the entire static data file.
    // The LLM is powerful enough to parse this and find the relevant information.
    // A more complex implementation could filter this data, but this is efficient and effective.
    return stakeholderData;
  }
);


'use server';
/**
 * @fileOverview A Genkit tool to retrieve information about DamDoh stakeholders.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { stakeholderData } from '@/lib/stakeholder-data';

export const getStakeholderInfo = ai.defineTool(
  {
    name: 'getStakeholderInfo',
    description: 'Provides detailed descriptions of all stakeholder roles within the DamDoh agricultural ecosystem. Use this to answer questions about who does what, their interactions, and their importance in the supply chain.',
    inputSchema: z.object({}), // No input needed, it returns all data
    outputSchema: z.string(),
  },
  async () => {
    // In a real application, this could fetch from a Firestore collection or an external API.
    // For now, we'll return the hardcoded data.
    return stakeholderData;
  }
);

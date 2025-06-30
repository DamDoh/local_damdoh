
'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const stakeholderData: Record<string, string> = {
    'farmers': 'Primary producers who use DamDoh to find suppliers, buyers, market info, and best practices. They connect with peers for knowledge sharing and collaboration.',
    'input suppliers': 'Provide seeds, fertilizers, and machinery. They use DamDoh to reach farmers, showcase products, and find distributors.',
    'pre-harvest contractors': 'Offer services like land prep, planting, and irrigation. They use DamDoh to find farm clients and offer specialized services.',
    'collection agents': 'Gather produce and connect farmers with processors or traders for efficient aggregation.',
    'processors': 'Transform raw products into consumable goods. They use DamDoh to find reliable raw material suppliers and buyers for processed goods.',
    'traders': 'Buy and sell agricultural products in local and international markets. They use DamDoh for market intelligence, finding suppliers, and connecting with buyers.',
    'retailers': 'Supermarkets and grocery stores that use DamDoh to source directly from farmers or processors, ensuring quality and traceability.',
    'exporters': 'Facilitate international trade of agricultural goods by connecting producers with international buyers and navigating export requirements.',
    'consumers': 'End-users who might seek information or direct farm connections for transparency.',
    'government agencies': 'Regulators and policy setters who may use DamDoh to disseminate information, share policy updates, and engage with stakeholders.',
    'agricultural cooperatives': 'Farmer groups that work together to aggregate products, enhance bargaining power, find buyers, and share resources.',
    'financial institutions': 'Banks and lenders who use DamDoh to connect with farmers and agribusinesses needing funding, credit, or insurance.',
    'trade associations': 'Advocate for agricultural interests and use DamDoh for communication, member engagement, and industry updates.',
    'development personnel': 'Experts, advisors, and researchers who use DamDoh to share knowledge, support agricultural development projects, and connect with stakeholders.',
};

export const stakeholderInfoTool = ai.defineTool(
    {
        name: 'getStakeholderInfo',
        description: 'Get information about a specific stakeholder in the DamDoh ecosystem.',
        inputSchema: z.object({
            stakeholder: z.string().describe('The stakeholder to get information about.'),
        }),
        outputSchema: z.string(),
    },
    async (input) => {
        const stakeholder = input.stakeholder.toLowerCase();
        return stakeholderData[stakeholder] || 'No information found for this stakeholder.';
    }
);


'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getAdminDb } from '@/lib/firebase/admin'; 

export const fgwKnfKnowledgeTool = ai.defineTool(
  {
    name: 'getFarmingTechniqueDetails',
    description: 'Get detailed information, ingredients, and step-by-step instructions for a specific Farming God\'s Way (FGW) or Korean Natural Farming (KNF) technique, practice, or concoction. Use this when a user asks for specific "how to" information, ingredients, or steps.',
    inputSchema: z.object({
      techniqueName: z.string().describe('The name of the technique, practice, or recipe. Examples: "Fermented Plant Juice", "FPJ", "God\'s Blanket", "IMO-1"'),
    }),
    outputSchema: z.any(), // The LLM will get the raw document data and can formulate a response from it.
  },
  async (input) => {
    const adminDb = getAdminDb();
    if (!adminDb) {
      console.error('[fgwKnfKnowledgeTool] Firestore Admin DB is not initialized. Check server credentials.');
      return { error: 'The knowledge base is currently unavailable due to a server configuration issue. Please contact support.' };
    }
    
    console.log(`[fgwKnfKnowledgeTool] Received query for: "${input.techniqueName}"`);

    try {
      const searchTerm = input.techniqueName.toLowerCase();
      
      const articlesRef = adminDb.collection('knowledge_base');
      const snapshot = await articlesRef.get();
      
      if (snapshot.empty) {
        console.log(`[fgwKnfKnowledgeTool] The 'knowledge_base' collection is empty.`);
        return { error: 'Knowledge base is currently empty.' };
      }
      
      const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Find the first document where the name or ID contains the search term.
      // This allows for more flexible matching (e.g., "FPJ" matches "Fermented Plant Juice (FPJ)").
      const result = allDocs.find(doc => 
        (doc.name && doc.name.toLowerCase().includes(searchTerm)) || 
        (doc.id && doc.id.toLowerCase().replace(/_/g, ' ').includes(searchTerm))
      );
      
      if (!result) {
        console.log(`[fgwKnfKnowledgeTool] No technique found for "${input.techniqueName}".`);
        return { error: 'Technique not found in the knowledge base.' };
      }

      console.log(`[fgwKnfKnowledgeTool] Found matching technique: "${result.name}".`);
      return result; // Return the entire document data.

    } catch (error: any) {
      console.error('[fgwKnfKnowledgeTool] Error searching Firestore:', error);
      // Provide a more specific error message if Firestore isn't enabled
      if (error instanceof Error && 'code' in error && (error as any).code === 5) {
         throw new Error('Failed to search the KNF knowledge base. Ensure the Firestore database is enabled in your Firebase project.');
      }
      throw new Error('Failed to search the KNF knowledge base. Please check server logs.');
    }
  }
);

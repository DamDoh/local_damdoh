'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
// Use the Firebase Admin SDK for backend services
import { adminDb } from '@/lib/firebase/admin';

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
    console.log(`[fgwKnfKnowledgeTool] Received query for: "${input.techniqueName}"`);

    try {
      // Create a flexible query to search by name or abbreviation.
      // This is a simplified search; for production, a more robust search service like Algolia would be better.
      const searchTerm = input.techniqueName.toLowerCase();
      
      // Use the Firebase Admin SDK to fetch the data
      const articlesRef = adminDb.collection('knowledge_base');
      const snapshot = await articlesRef.get();
      
      if (snapshot.empty) {
        console.log(`[fgwKnfKnowledgeTool] The 'knowledge_base' collection is empty.`);
        return { error: 'Knowledge base is currently empty.' };
      }
      
      const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Find the first document where the name or ID contains the search term.
      // This allows for searching by abbreviation (e.g., "FPJ") if the ID is set to "knf_fpj".
      const result = allDocs.find(doc => 
        doc.name?.toLowerCase().includes(searchTerm) || 
        doc.id.toLowerCase().includes(searchTerm)
      );
      
      if (!result) {
        console.log(`[fgwKnfKnowledgeTool] No technique found for "${input.techniqueName}".`);
        return { error: 'Technique not found in the knowledge base.' };
      }

      console.log(`[fgwKnfKnowledgeTool] Found matching technique: "${result.name}".`);
      return result; // Return the entire document data.

    } catch (error) {
      console.error('[fgwKnfKnowledgeTool] Error searching Firestore:', error);
      throw new Error('Failed to search the KNF knowledge base. Ensure the "knowledge_base" collection exists and has the correct permissions.');
    }
  }
);

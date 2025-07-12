
'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAdminDb } from '@/lib/firebase/admin';
import { collection, query, where, getDocs, limit, or } from 'firebase/firestore';

export const fwg_knf_tool = ai.defineTool(
  {
    name: 'getFarmingTechniqueDetails',
    description: 'Get detailed information, ingredients, and step-by-step instructions for a specific Farming God\'s Way (FGW) or Korean Natural Farming (KNF) technique, practice, or concoction.',
    inputSchema: z.object({
      techniqueName: z.string().describe('The name of the technique, practice, or recipe. Examples: "Fermented Plant Juice", "FPJ", "God\'s Blanket", "IMO-1"'),
    }),
    outputSchema: z.any(), // We'll return the raw document data
  },
  async (input) => {
    console.log(`[FGW/KNF Tool] Received query for: ${input.techniqueName}`);
    const db = getAdminDb();
    if (!db) {
        console.error("[FGW/KNF Tool] Firestore Admin DB not initialized.");
        return { error: 'The knowledge base is currently unavailable.' };
    }

    try {
        // Create a query that searches by name or by the ID (for abbreviations like 'FPJ')
        const q = query(
          collection(db, "knowledge_base"),
          or(
            where("name", "==", input.techniqueName),
            where(collection(db, "knowledge_base").idField(), '==', input.techniqueName.toLowerCase())
          ),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          console.log(`[FGW/KNF Tool] Technique '${input.techniqueName}' not found in the knowledge base.`);
          return { error: 'Technique not found in the knowledge base.' };
        }
        
        const result = querySnapshot.docs[0].data();
        console.log(`[FGW/KNF Tool] Found technique: ${result.name}`);
        return result;

    } catch(error) {
        console.error("[FGW/KNF Tool] Error querying Firestore:", error);
        return { error: 'An error occurred while searching the knowledge base.' };
    }
  }
);

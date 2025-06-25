'use server';
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getFirestore, collection, query, where, getDocs, limit} from 'firebase/firestore';
import {firebaseApp} from '@/lib/firebase';

const db = getFirestore(firebaseApp);

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
    const q = query(
      collection(db, "knowledge_base"),
      where("name", "==", input.techniqueName),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      // Try searching by abbreviation if the full name fails
      const qAbbr = query(
        collection(db, "knowledge_base"),
        where("id", "==", `knf_${input.techniqueName.toLowerCase()}`),
        limit(1)
      );
      const querySnapshotAbbr = await getDocs(qAbbr);
       if (querySnapshotAbbr.empty) {
          return { error: `Technique '${input.techniqueName}' not found in the knowledge base.` };
       }
       return querySnapshotAbbr.docs[0].data();
    }
    return querySnapshot.docs[0].data();
  }
);

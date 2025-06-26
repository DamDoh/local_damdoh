'use server';
import { defineTool } from 'genkit';
import { z } from 'zod';
import { adminDb } from '../../lib/firebase/admin'; // Correctly import the admin SDK

export const fgwKnfKnowledgeTool = defineTool(
  {
    name: 'fgwKnfKnowledge',
    description: 'Searches the KNF knowledge base for information on specific topics, preparations, or materials.',
    inputSchema: z.object({
      query: z.string().describe('The search query for the KNF knowledge base.'),
    }),
    outputSchema: z.object({
      results: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          content: z.string(),
          category: z.string(),
        })
      ),
    }),
  },
  async ({ query }) => {
    console.log(`[fgwKnfKnowledgeTool] Received query: "${query}"`);

    try {
      // Use the admin SDK to access Firestore
      const articlesRef = adminDb.collection('knowledge_articles');
      
      // A simple search: check if the query appears in the title or content.
      // For a real application, consider using a full-text search solution like Algolia or Meilisearch.
      const snapshot = await articlesRef.get();
      
      const results = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doc => 
          doc.title.toLowerCase().includes(query.toLowerCase()) || 
          doc.content.toLowerCase().includes(query.toLowerCase())
        )
        .map(doc => ({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          category: doc.category,
        }));

      console.log(`[fgwKnfKnowledgeTool] Found ${results.length} results.`);
      return { results };

    } catch (error) {
      console.error('[fgwKnfKnowledgeTool] Error searching Firestore:', error);
      // It's crucial to throw an error or return a structured error response
      // so the calling flow knows the tool failed.
      throw new Error('Failed to search the KNF knowledge base.');
    }
  }
);

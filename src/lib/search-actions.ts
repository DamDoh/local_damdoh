
'use server';

import { getFunctions, httpsCallable } from 'firebase/functions';
import { app as firebaseApp } from '@/lib/firebase/client'; // Assuming you have a client-side firebase config

// It's good practice to initialize this once
const functions = getFunctions(firebaseApp);
const performSearchCallable = httpsCallable(functions, 'performSearch');

/**
 * A client-side "server action" to call the `performSearch` cloud function.
 * @param query The search string.
 * @returns A promise that resolves with the search results.
 */
export async function performSearch(query: string): Promise<any[]> {
    try {
        console.log(`[Action] Calling performSearch cloud function with query: "${query}"`);
        const result = await performSearchCallable({ query });
        return (result.data as any).results || [];
    } catch (error) {
        console.error("[Action] Error calling performSearch cloud function:", error);
        // Re-throw the error so the component can handle it
        throw error;
    }
}

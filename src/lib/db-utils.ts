// src/lib/db-utils.ts
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase/client';

// This file now only contains code that is safe to run in the browser.
// All server-side database operations have been moved to server-actions.ts

// --- Universal Search Action ---
// Note: This function calls a Firebase Cloud Function, which is a secure way
// to interact with the backend from the client.
export async function performSearch(interpretation: any): Promise<any[]> {
    const performSearchCallable = httpsCallable(functions, 'performSearch');
    try {
        console.log(`[Action] Calling performSearch cloud function with interpretation:`, interpretation);
        const result = await performSearchCallable(interpretation);
        return (result.data as any).results || [];
    } catch (error) {
        console.error("[Action] Error calling performSearch cloud function:", error);
        throw error;
    }
}

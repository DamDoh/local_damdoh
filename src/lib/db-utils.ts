
// src/lib/db-utils.ts
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase/client';
import type { UserProfile } from '@/lib/types';

// This file now only contains code that is safe to run in the browser.
// All direct server-side database operations have been moved to server-actions.ts

export async function getProfileByIdFromDB(id: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`/api/profiles/${id}`);
      if (!response.ok) {
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching profile ${id} from API:`, error);
      return null;
    }
}


export async function getAllProfilesFromDB(): Promise<UserProfile[]> {
   try {
    const response = await fetch(`/api/profiles`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching all profiles from API:`, error);
    return [];
  }
}


export async function getAllMarketplaceItemsFromDB(): Promise<any[]> {
   try {
    const response = await fetch(`/api/marketplace`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching all marketplace items from API:`, error);
    return [];
  }
}


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

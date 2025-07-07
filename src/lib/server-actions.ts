
"use server";

import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { getAdminDb } from './firebase/admin';
import type { UserProfile, MarketplaceItem } from '@/lib/types';
import { httpsCallable } from "firebase/functions";
import { functions } from './firebase/client';
import type { SmartSearchInterpretation } from '@/ai/flows/query-interpreter-flow';

const PROFILES_COLLECTION = 'users';
const MARKETPLACE_COLLECTION = 'marketplaceItems';

// --- Profile Functions ---

export async function getAllProfilesFromDB(): Promise<UserProfile[]> {
  try {
    const adminDb = getAdminDb();
    const profilesCol = collection(adminDb, PROFILES_COLLECTION);
    const profileSnapshot = await getDocs(profilesCol);
    if (profileSnapshot.empty) {
      console.warn("No profiles found in Firestore.");
      return [];
    }
    const profileList = profileSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        createdAt: (data.createdAt as any)?.toDate ? (data.createdAt as any).toDate().toISOString() : new Date().toISOString(),
        updatedAt: (data.updatedAt as any)?.toDate ? (data.updatedAt as any).toDate().toISOString() : new Date().toISOString(),
      } as UserProfile;
    });
    return profileList;
  } catch (error) {
    console.error("Error fetching all profiles from Firestore: ", error);
    throw error;
  }
}

export async function getProfileByIdFromDB(id: string): Promise<UserProfile | null> {
  try {
    if (!id) return null;
    const adminDb = getAdminDb();
    const profileDocRef = doc(adminDb, PROFILES_COLLECTION, id);
    const profileSnap = await getDoc(profileDocRef);
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      return { 
        id: profileSnap.id, 
        ...data,
        createdAt: (data.createdAt as any)?.toDate ? (data.createdAt as any).toDate().toISOString() : new Date().toISOString(),
        updatedAt: (data.updatedAt as any)?.toDate ? (data.updatedAt as any).toDate().toISOString() : new Date().toISOString(),
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching profile with ID ${id} from Firestore: `, error);
    throw error;
  }
}

// --- Marketplace Functions ---

export async function getAllMarketplaceItemsFromDB(): Promise<MarketplaceItem[]> {
  try {
    const adminDb = getAdminDb();
    const itemsCol = collection(adminDb, MARKETPLACE_COLLECTION);
    const itemSnapshot = await getDocs(itemsCol);
    if (itemSnapshot.empty) {
      console.warn("No marketplace items found in Firestore.");
      return [];
    }
    const itemList = itemSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        createdAt: (data.createdAt as any)?.toDate ? (data.createdAt as any).toDate().toISOString() : new Date().toISOString(),
        updatedAt: (data.updatedAt as any)?.toDate ? (data.updatedAt as any).toDate().toISOString() : new Date().toISOString(),
      } as MarketplaceItem;
    });
    return itemList;
  } catch (error) {
    console.error("Error fetching all marketplace items from Firestore: ", error);
    throw error;
  }
}


// --- Universal Search Action ---
// This function calls a Firebase Cloud Function. It is a server action but defined here
// as it's initiated from the client-side UniversalSearchModal.
export async function performSearch(interpretation: SmartSearchInterpretation): Promise<any[]> {
    const performSearchCallable = httpsCallable(functions, 'performSearch');
    try {
        console.log(`[Action] Calling performSearch cloud function with interpretation:`, interpretation);
        const result = await performSearchCallable(interpretation);
        return (result.data as any)?.results ?? [];
    } catch (error) {
        console.error("[Action] Error calling performSearch cloud function:", error);
        throw error;
    }
}

// --- Financials Actions ---
export async function getFinancialInstitutions(): Promise<UserProfile[]> {
  try {
    const adminDb = getAdminDb();
    const fiCol = query(collection(adminDb, 'users'), where('primaryRole', '==', 'Financial Institution (Micro-finance/Loans)'));
    const fiSnapshot = await getDocs(fiCol);
    if (fiSnapshot.empty) {
      console.log("No financial institutions found.");
      return [];
    }
    return fiSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as UserProfile));
  } catch (error) {
    console.error("Error fetching FIs from Firestore: ", error);
    return [];
  }
}

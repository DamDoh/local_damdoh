
"use server";

import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { getAdminDb } from './firebase/admin';
import type { UserProfile, MarketplaceItem } from '@/lib/types';
import { httpsCallable } from "firebase/functions";
import { functions } from './firebase/client';
import type { SmartSearchInterpretation } from '@/ai/flows/query-interpreter-flow';

const PROFILES_COLLECTION = 'users';
const MARKETPLACE_COLLECTION = 'marketplaceItems';

// --- Profile Functions ---

export async function getAllProfilesFromDB(): Promise<UserProfile[]> {
  const adminDb = getAdminDb();
  if (!adminDb) return [];
  try {
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
    return []; // Return empty array on error to prevent client crash
  }
}

export async function getProfileByIdFromDB(id: string): Promise<UserProfile | null> {
  const adminDb = getAdminDb();
  if (!adminDb) return null;
  try {
    if (!id) return null;
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
    return null; // Return null on error to prevent client crash
  }
}

export async function updateProfileInDB(id: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
  const adminDb = getAdminDb();
  if (!adminDb) return null;
  if (!id) return null;
  const profileDocRef = doc(adminDb, PROFILES_COLLECTION, id);
  await updateDoc(profileDocRef, data);
  const updatedDoc = await getDoc(profileDocRef);
  if (updatedDoc.exists()) {
    const data = updatedDoc.data();
    return { id: updatedDoc.id, ...data } as UserProfile;
  }
  return null;
}

export async function deleteProfileFromDB(id: string): Promise<boolean> {
  const adminDb = getAdminDb();
  if (!adminDb) return false;
  if (!id) return false;
  const profileDocRef = doc(adminDb, PROFILES_COLLECTION, id);
  await deleteDoc(profileDocRef);
  return true;
}


// --- Marketplace Functions ---

export async function getAllMarketplaceItemsFromDB(): Promise<MarketplaceItem[]> {
  const adminDb = getAdminDb();
  if (!adminDb) return [];
  try {
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
    return []; // Return empty array on error to prevent client crash
  }
}

export async function getMarketplaceItemByIdFromDB(id: string): Promise<MarketplaceItem | null> {
  const adminDb = getAdminDb();
  if (!adminDb) return null;
  if (!id) return null;
  const itemDocRef = doc(adminDb, MARKETPLACE_COLLECTION, id);
  const itemSnap = await getDoc(itemDocRef);
  if (itemSnap.exists()) {
    const data = itemSnap.data();
    return {
      id: itemSnap.id,
      ...data,
      createdAt: (data.createdAt as any)?.toDate ? (data.createdAt as any).toDate().toISOString() : new Date().toISOString(),
      updatedAt: (data.updatedAt as any)?.toDate ? (data.updatedAt as any).toDate().toISOString() : new Date().toISOString(),
    } as MarketplaceItem;
  }
  return null;
}

export async function updateMarketplaceItemInDB(id: string, data: Partial<MarketplaceItem>): Promise<MarketplaceItem | null> {
  const adminDb = getAdminDb();
  if (!adminDb) return null;
  if (!id) return null;
  const itemDocRef = doc(adminDb, MARKETPLACE_COLLECTION, id);
  await updateDoc(itemDocRef, data);
  const updatedDoc = await getDoc(itemDocRef);
  if (updatedDoc.exists()) {
    const data = updatedDoc.data();
    return { id: updatedDoc.id, ...data } as MarketplaceItem;
  }
  return null;
}

export async function deleteMarketplaceItemFromDB(id: string): Promise<boolean> {
  const adminDb = getAdminDb();
  if (!adminDb) return false;
  if (!id) return false;
  const itemDocRef = doc(adminDb, MARKETPLACE_COLLECTION, id);
  await deleteDoc(itemDocRef);
  return true;
}

// --- Universal Search Action ---
// This function calls a Firebase Cloud Function. It is a server action but defined here
// as it's initiated from the client-side UniversalSearchModal.
export async function performSearch(interpretation: Partial<SmartSearchInterpretation>): Promise<any[]> {
    const performSearchCallable = httpsCallable(functions, 'performSearch');
    try {
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
    if (!adminDb) return [];
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

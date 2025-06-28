// src/lib/db-utils.ts
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query, 
  where,
  Timestamp // For createdAt/updatedAt fields
} from "firebase/firestore";
import { db, functions } from './firebase/client'; // Import the client-side initialized Firestore instance
import { httpsCallable } from 'firebase/functions';
import type { UserProfile, MarketplaceItem, ForumTopic, ForumPost, AgriEvent } from '@/lib/types';
import { dummyMarketplaceItems, dummyForumTopics, dummyForumPosts, dummyAgriEvents, dummyProfiles } from '@/lib/dummy-data';

console.warn(
  "db-utils.ts is using a mix of live Firestore calls and dummy data. " +
  "Ensure your Firebase project is set up. " +
  "Some functions are still using placeholder data."
);

// Define consistent collection names
const PROFILES_COLLECTION = 'users';
const MARKETPLACE_COLLECTION = 'marketplaceItems';

// --- Callable Function References ---
const performSearchCallable = httpsCallable(functions, 'performSearch');


// --- Profile DB Operations ---
export async function getAllProfilesFromDB(): Promise<UserProfile[]> {
  try {
    const profilesCol = collection(db, PROFILES_COLLECTION);
    const profileSnapshot = await getDocs(profilesCol);
    if (profileSnapshot.empty) {
        console.log("No profiles found in Firestore, returning dummy data for development.");
        return dummyProfiles;
    }
    const profileList = profileSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate ? (data.updatedAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
      } as UserProfile;
    });
    return profileList;
  } catch (error) {
    console.error("Error fetching all profiles from Firestore: ", error);
    return dummyProfiles;
  }
}

export async function getProfileByIdFromDB(id: string): Promise<UserProfile | null> {
  try {
    if (!id) return null;
    const profileDocRef = doc(db, PROFILES_COLLECTION, id);
    const profileSnap = await getDoc(profileDocRef);
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      return { 
        id: profileSnap.id, 
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate ? (data.updatedAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
      } as UserProfile;
    } else {
      console.log(`No profile found with ID: ${id}.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching profile with ID ${id} from Firestore: `, error);
    throw error;
  }
}

// --- Marketplace DB Operations ---
export async function getAllMarketplaceItemsFromDB(): Promise<MarketplaceItem[]> {
  try {
    const itemsCol = collection(db, MARKETPLACE_COLLECTION);
    const itemSnapshot = await getDocs(itemsCol);
    if (itemSnapshot.empty) {
        console.log("No marketplace items found in Firestore, returning dummy data for development.");
        return dummyMarketplaceItems;
    }
    const itemList = itemSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate ? (data.updatedAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
      } as MarketplaceItem;
    });
    return itemList;
  } catch (error) {
    console.error("Error fetching all marketplace items from Firestore: ", error);
    return dummyMarketplaceItems; 
  }
}

export async function getMarketplaceItemByIdFromDB(id: string): Promise<MarketplaceItem | null> {
  try {
    if (!id) return null;
    const itemDocRef = doc(db, MARKETPLACE_COLLECTION, id);
    const itemSnap = await getDoc(itemDocRef);
    if (itemSnap.exists()) {
      const data = itemSnap.data();
      return { 
        id: itemSnap.id, 
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate ? (data.updatedAt as Timestamp).toDate().toISOString() : new Date().toISOString(),
      } as MarketplaceItem;
    } else {
      console.log(`No marketplace item found with ID: ${id}.`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching marketplace item with ID ${id} from Firestore: `, error);
    throw error;
  }
}

// --- Universal Search Action ---
export async function performSearch(interpretation: any): Promise<any[]> {
    try {
        console.log(`[Action] Calling performSearch cloud function with interpretation:`, interpretation);
        const result = await performSearchCallable(interpretation);
        return (result.data as any).results || [];
    } catch (error) {
        console.error("[Action] Error calling performSearch cloud function:", error);
        throw error;
    }
}

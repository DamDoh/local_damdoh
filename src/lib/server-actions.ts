
// src/lib/server-actions.ts
"use server";

import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp, writeBatch } from "firebase/firestore";
import { adminDb } from './firebase/admin';
import type { UserProfile, MarketplaceItem } from '@/lib/types';
import { dummyMarketplaceItems, dummyProfiles } from '@/lib/dummy-data';

const PROFILES_COLLECTION = 'users';
const MARKETPLACE_COLLECTION = 'marketplaceItems';

// --- Profile Functions ---

export async function getAllProfilesFromDB(): Promise<UserProfile[]> {
  try {
    const profilesCol = collection(adminDb, PROFILES_COLLECTION);
    const profileSnapshot = await getDocs(profilesCol);
    if (profileSnapshot.empty) {
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
    const profileDocRef = doc(adminDb, PROFILES_COLLECTION, id);
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
      return null;
    }
  } catch (error) {
    console.error(`Error fetching profile with ID ${id} from Firestore: `, error);
    throw error;
  }
}

export async function createProfileInDB(profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
  const profileRef = doc(collection(adminDb, PROFILES_COLLECTION));
  const newProfile = {
    ...profileData,
    id: profileRef.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await setDoc(profileRef, newProfile);
  return newProfile;
}

export async function updateProfileInDB(id: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
  const profileRef = doc(adminDb, PROFILES_COLLECTION, id);
  const updateData = { ...data, updatedAt: new Date().toISOString() };
  await updateDoc(profileRef, updateData);
  return getProfileByIdFromDB(id);
}

export async function deleteProfileFromDB(id: string): Promise<boolean> {
  const profileRef = doc(adminDb, PROFILES_COLLECTION, id);
  await deleteDoc(profileRef);
  return true;
}


// --- Marketplace Functions ---

export async function getAllMarketplaceItemsFromDB(): Promise<MarketplaceItem[]> {
  try {
    const itemsCol = collection(adminDb, MARKETPLACE_COLLECTION);
    const itemSnapshot = await getDocs(itemsCol);
    if (itemSnapshot.empty) {
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
    const itemDocRef = doc(adminDb, MARKETPLACE_COLLECTION, id);
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
      return null;
    }
  } catch (error) {
    console.error(`Error fetching marketplace item with ID ${id} from Firestore: `, error);
    throw error;
  }
}

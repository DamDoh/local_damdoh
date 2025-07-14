
'use server';

import { getAdminDb } from './firebase/admin';
import type { UserProfile, MarketplaceItem } from './types';

// This file contains server-side utility functions for direct database interactions.
// These are wrapped by Server Actions in `server-actions.ts` for client consumption.

/**
 * Fetches a single user profile from Firestore by ID.
 * @param uid The user ID to fetch.
 * @returns A promise that resolves to the UserProfile or null.
 */
export async function getProfileByIdFromDB(uid: string): Promise<UserProfile | null> {
  const db = getAdminDb();
  if (!db) {
    console.error("DB not available in getProfileByIdFromDB");
    return null;
  }
  
  if (!uid) {
    console.log("getProfileByIdFromDB called with null or undefined uid.");
    return null;
  }
  
  try {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) {
      console.log(`No profile found for UID: ${uid}`);
      return null;
    }
    const data = userDoc.data();
    if (!data) return null;
    
    // Ensure timestamps are serialized
    return {
        id: userDoc.id,
        ...data,
        createdAt: (data.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || new Date().toISOString(),
        updatedAt: (data.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || new Date().toISOString(),
    } as UserProfile;
  } catch (error) {
    console.error("Error fetching user profile by ID:", error);
    return null;
  }
}

/**
 * Fetches all user profiles from Firestore.
 * @returns A promise that resolves to an array of UserProfile objects.
 */
export async function getAllProfilesFromDB(): Promise<UserProfile[]> {
  const db = getAdminDb();
  if (!db) return [];
  
  try {
    const usersSnapshot = await db.collection('users').get();
    const profiles: UserProfile[] = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      profiles.push({
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || new Date().toISOString(),
        updatedAt: (data.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString() || new Date().toISOString(),
      } as UserProfile);
    });
    return profiles;
  } catch (error) {
    console.error("Error fetching all profiles:", error);
    return [];
  }
}

/**
 * Fetches a single marketplace item from Firestore by its ID.
 * @param itemId The ID of the marketplace item.
 * @returns A promise that resolves to the MarketplaceItem or null.
 */
export async function getMarketplaceItemByIdFromDB(itemId: string): Promise<MarketplaceItem | null> {
  const db = getAdminDb();
  if (!db) return null;

  try {
    const itemDoc = await db.collection('marketplaceItems').doc(itemId).get();
    if (!itemDoc.exists) {
      return null;
    }
    const data = itemDoc.data();
    if (!data) return null;

    return {
      id: itemDoc.id,
      ...data,
       createdAt: (data.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
       updatedAt: (data.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
    } as MarketplaceItem;
  } catch (error) {
    console.error(`Error fetching marketplace item ${itemId}:`, error);
    return null;
  }
}

/**
 * Updates a marketplace item in Firestore.
 * @param itemId The ID of the item to update.
 * @param data The data to update.
 * @returns A promise that resolves to the updated item or null.
 */
export async function updateMarketplaceItemInDB(itemId: string, data: Partial<MarketplaceItem>): Promise<MarketplaceItem | null> {
  const db = getAdminDb();
  if (!db) return null;

  try {
    const itemRef = db.collection('marketplaceItems').doc(itemId);
    await itemRef.update({ ...data, updatedAt: new Date() });
    return getMarketplaceItemByIdFromDB(itemId);
  } catch (error) {
    console.error(`Error updating marketplace item ${itemId}:`, error);
    return null;
  }
}

/**
 * Deletes a marketplace item from Firestore.
 * @param itemId The ID of the item to delete.
 * @returns A promise that resolves to true if successful, false otherwise.
 */
export async function deleteMarketplaceItemFromDB(itemId: string): Promise<boolean> {
  const db = getAdminDb();
  if (!db) return false;

  try {
    await db.collection('marketplaceItems').doc(itemId).delete();
    return true;
  } catch (error) {
    console.error(`Error deleting marketplace item ${itemId}:`, error);
    return false;
  }
}

/**
 * Fetches all marketplace items from Firestore.
 * @returns A promise that resolves to an array of MarketplaceItem objects.
 */
export async function getAllMarketplaceItemsFromDB(): Promise<MarketplaceItem[]> {
  const db = getAdminDb();
  if (!db) return [];

  try {
    const snapshot = await db.collection('marketplaceItems').get();
    const items: MarketplaceItem[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      items.push({
        id: doc.id,
        ...data,
         createdAt: (data.createdAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
         updatedAt: (data.updatedAt as admin.firestore.Timestamp)?.toDate?.().toISOString(),
      } as MarketplaceItem);
    });
    return items;
  } catch (error) {
    console.error("Error fetching all marketplace items:", error);
    return [];
  }
}

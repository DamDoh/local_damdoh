
// src/lib/db-utils.ts
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query, 
  where,
  Timestamp // For createdAt/updatedAt fields
} from "firebase/firestore";
import { db } from './firebase'; // Import the initialized Firestore instance
import type { UserProfile, MarketplaceItem, ForumTopic, ForumPost, AgriEvent } from '@/lib/types';
// dummyProfiles is no longer needed for profile functions, but other dummy data is still used
import { /* dummyProfiles, */ dummyMarketplaceItems, dummyForumTopics, dummyForumPosts, dummyAgriEvents } from '@/lib/dummy-data';

console.warn(
  "db-utils.ts is being updated to use Firestore. " +
  "Ensure your Firebase project is set up and 'src/lib/firebase.ts' has correct credentials. " +
  "Not all functions are converted yet."
);

// --- Profile DB Operations ---
export async function getAllProfilesFromDB(): Promise<UserProfile[]> {
  try {
    const profilesCol = collection(db, 'profiles');
    const profileSnapshot = await getDocs(profilesCol);
    const profileList = profileSnapshot.docs.map(docSnap => { // Renamed doc to docSnap for clarity
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
        // Ensure createdAt and updatedAt are properly handled if they are Firestore Timestamps
        createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate().toISOString() : data.createdAt,
        updatedAt: (data.updatedAt as Timestamp)?.toDate ? (data.updatedAt as Timestamp).toDate().toISOString() : data.updatedAt,
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
    const profileDocRef = doc(db, 'profiles', id);
    const profileSnap = await getDoc(profileDocRef);
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      return { 
        id: profileSnap.id, 
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate().toISOString() : data.createdAt,
        updatedAt: (data.updatedAt as Timestamp)?.toDate ? (data.updatedAt as Timestamp).toDate().toISOString() : data.updatedAt,
      } as UserProfile;
    } else {
      console.log(`No profile found with ID: ${id}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching profile with ID ${id} from Firestore: `, error);
    throw error; 
  }
}

export async function createProfileInDB(profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
  try {
    const profilesCol = collection(db, 'profiles');
    const docData = {
      ...profileData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(profilesCol, docData);
    
    const newDocSnap = await getDoc(docRef);
    if (newDocSnap.exists()) {
        const data = newDocSnap.data();
        return {
            id: newDocSnap.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
        } as UserProfile;
    } else {
        throw new Error("Failed to retrieve newly created profile after adding to Firestore.");
    }
  } catch (error) {
    console.error("Error creating profile in Firestore: ", error);
    throw error;
  }
}

export async function updateProfileInDB(id: string, updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>): Promise<UserProfile | null> {
  try {
    const profileDocRef = doc(db, 'profiles', id);
    
    const docSnap = await getDoc(profileDocRef);
    if (!docSnap.exists()) {
        console.log(`No profile found with ID: ${id} to update.`);
        return null;
    }

    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(profileDocRef, updateData);
    
    const updatedProfileSnap = await getDoc(profileDocRef);
    if (updatedProfileSnap.exists()) {
        const data = updatedProfileSnap.data();
        return {
            id: updatedProfileSnap.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
        } as UserProfile;
    }
    return null; 
  } catch (error) {
    console.error(`Error updating profile with ID ${id} in Firestore: `, error);
    throw error;
  }
}

export async function deleteProfileFromDB(id: string): Promise<boolean> {
  try {
    const profileDocRef = doc(db, 'profiles', id);
    await deleteDoc(profileDocRef);
    return true;
  } catch (error) {
    console.error(`Error deleting profile with ID ${id} from Firestore: `, error);
    throw error; 
  }
}


// --- Marketplace DB Operations (Placeholders - TO BE UPDATED FOR FIRESTORE) ---
export async function getAllMarketplaceItemsFromDB(): Promise<MarketplaceItem[]> {
  console.warn("getAllMarketplaceItemsFromDB is using placeholder logic. Update for Firestore.");
  return Promise.resolve(dummyMarketplaceItems);
}

export async function getMarketplaceItemByIdFromDB(id: string): Promise<MarketplaceItem | null> {
  console.warn("getMarketplaceItemByIdFromDB is using placeholder logic. Update for Firestore.");
  const item = dummyMarketplaceItems.find(i => i.id === id) || null;
  return Promise.resolve(item);
}

export async function createMarketplaceItemInDB(itemData: Omit<MarketplaceItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MarketplaceItem> {
  console.warn("createMarketplaceItemInDB is using placeholder logic. Update for Firestore.");
  const newItem: MarketplaceItem = {
    id: `item_${Date.now()}`,
    ...itemData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  dummyMarketplaceItems.push(newItem);
  return Promise.resolve(newItem);
}

export async function updateMarketplaceItemInDB(id: string, updates: Partial<MarketplaceItem>): Promise<MarketplaceItem | null> {
  console.warn("updateMarketplaceItemInDB is using placeholder logic. Update for Firestore.");
  const itemIndex = dummyMarketplaceItems.findIndex(i => i.id === id);
  if (itemIndex === -1) return null;
  dummyMarketplaceItems[itemIndex] = { ...dummyMarketplaceItems[itemIndex], ...updates, updatedAt: new Date().toISOString() };
  return Promise.resolve(dummyMarketplaceItems[itemIndex]);
}

export async function deleteMarketplaceItemFromDB(id: string): Promise<boolean> {
  console.warn("deleteMarketplaceItemFromDB is using placeholder logic. Update for Firestore.");
  const initialLength = dummyMarketplaceItems.length;
  const indexToRemove = dummyMarketplaceItems.findIndex(p => p.id === id);
   if (indexToRemove > -1) {
    dummyMarketplaceItems.splice(indexToRemove, 1);
    return Promise.resolve(dummyMarketplaceItems.length < initialLength);
  }
  return Promise.resolve(false);
}

// --- Forum Topic DB Operations (Placeholders - TO BE UPDATED FOR FIRESTORE) ---
export async function getAllForumTopicsFromDB(): Promise<ForumTopic[]> {
  console.warn("getAllForumTopicsFromDB is using placeholder logic. Update for Firestore.");
  return Promise.resolve(dummyForumTopics);
}

// --- Forum Post DB Operations (Placeholders - TO BE UPDATED FOR FIRESTORE) ---
export async function getForumPostsByTopicIdFromDB(topicId: string): Promise<ForumPost[]> {
  console.warn("getForumPostsByTopicIdFromDB is using placeholder logic. Update for Firestore.");
  return Promise.resolve(dummyForumPosts.filter(post => post.topicId === topicId));
}

// --- AgriEvent DB Operations (Placeholders - TO BE UPDATED FOR FIRESTORE) ---
export async function getAllAgriEventsFromDB(): Promise<AgriEvent[]> {
  console.warn("getAllAgriEventsFromDB is using placeholder logic. Update for Firestore.");
  return Promise.resolve(dummyAgriEvents);
}

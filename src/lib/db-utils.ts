
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
import { dummyMarketplaceItems, dummyForumTopics, dummyForumPosts, dummyAgriEvents } from '@/lib/dummy-data';

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
    const profileList = profileSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return { 
        id: docSnap.id, 
        ...data,
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


// --- Marketplace DB Operations ---
export async function getAllMarketplaceItemsFromDB(): Promise<MarketplaceItem[]> {
  try {
    const itemsCol = collection(db, 'marketplaceItems');
    const itemSnapshot = await getDocs(itemsCol);
    const itemList = itemSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate().toISOString() : data.createdAt,
        updatedAt: (data.updatedAt as Timestamp)?.toDate ? (data.updatedAt as Timestamp).toDate().toISOString() : data.updatedAt,
      } as MarketplaceItem;
    });
    return itemList;
  } catch (error) {
    console.error("Error fetching all marketplace items from Firestore: ", error);
    throw error;
  }
}

export async function getMarketplaceItemByIdFromDB(id: string): Promise<MarketplaceItem | null> {
  try {
    const itemDocRef = doc(db, 'marketplaceItems', id);
    const itemSnap = await getDoc(itemDocRef);
    if (itemSnap.exists()) {
      const data = itemSnap.data();
      return {
        id: itemSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate ? (data.createdAt as Timestamp).toDate().toISOString() : data.createdAt,
        updatedAt: (data.updatedAt as Timestamp)?.toDate ? (data.updatedAt as Timestamp).toDate().toISOString() : data.updatedAt,
      } as MarketplaceItem;
    } else {
      console.log(`No marketplace item found with ID: ${id}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching marketplace item with ID ${id} from Firestore: `, error);
    throw error;
  }
}

export async function createMarketplaceItemInDB(itemData: Omit<MarketplaceItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MarketplaceItem> {
  try {
    const itemsCol = collection(db, 'marketplaceItems');
    const docData = {
      ...itemData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    const docRef = await addDoc(itemsCol, docData);
    const newDocSnap = await getDoc(docRef);
    if (newDocSnap.exists()) {
      const data = newDocSnap.data();
      return {
        id: newDocSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
      } as MarketplaceItem;
    } else {
      throw new Error("Failed to retrieve newly created marketplace item after adding to Firestore.");
    }
  } catch (error) {
    console.error("Error creating marketplace item in Firestore: ", error);
    throw error;
  }
}

export async function updateMarketplaceItemInDB(id: string, updates: Partial<Omit<MarketplaceItem, 'id' | 'createdAt'>>): Promise<MarketplaceItem | null> {
  try {
    const itemDocRef = doc(db, 'marketplaceItems', id);
    const docSnap = await getDoc(itemDocRef);
    if (!docSnap.exists()) {
      console.log(`No marketplace item found with ID: ${id} to update.`);
      return null;
    }
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    await updateDoc(itemDocRef, updateData);
    const updatedItemSnap = await getDoc(itemDocRef);
    if (updatedItemSnap.exists()) {
      const data = updatedItemSnap.data();
      return {
        id: updatedItemSnap.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
      } as MarketplaceItem;
    }
    return null;
  } catch (error) {
    console.error(`Error updating marketplace item with ID ${id} in Firestore: `, error);
    throw error;
  }
}

export async function deleteMarketplaceItemFromDB(id: string): Promise<boolean> {
  try {
    const itemDocRef = doc(db, 'marketplaceItems', id);
    await deleteDoc(itemDocRef);
    return true;
  } catch (error) {
    console.error(`Error deleting marketplace item with ID ${id} from Firestore: `, error);
    throw error;
  }
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

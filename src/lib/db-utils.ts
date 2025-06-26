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
import { db } from './firebase/client'; // Import the client-side initialized Firestore instance
import type { UserProfile, MarketplaceItem, ForumTopic, ForumPost, AgriEvent } from '@/lib/types';
import { dummyMarketplaceItems, dummyForumTopics, dummyForumPosts, dummyAgriEvents, dummyProfiles } from '@/lib/dummy-data';

console.warn(
  "db-utils.ts is using a mix of live Firestore calls and dummy data. " +
  "Ensure your Firebase project is set up. " +
  "Some functions are still using placeholder data."
);

// Define consistent collection names
const PROFILES_COLLECTION = 'users'; // Changed to 'users' to match auth flow
const MARKETPLACE_COLLECTION = 'marketplaceItems';
const FORUM_TOPICS_COLLECTION = 'forumTopics';
const FORUM_POSTS_COLLECTION = 'forumPosts';
const AGRI_EVENTS_COLLECTION = 'agriEvents';


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
    // On error, return dummy data for development purposes to avoid crashing the app.
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

export async function createProfileInDB(userId: string, profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
  try {
    const profileDocRef = doc(db, PROFILES_COLLECTION, userId); // Use the UID as the document ID
    const docData = {
      ...profileData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    await setDoc(profileDocRef, docData); // Use setDoc to create a document with a specific ID
    
    const newDocSnap = await getDoc(profileDocRef);
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
    const profileDocRef = doc(db, PROFILES_COLLECTION, id);
    
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
            id: updatedProfileSnap.id, ...data,
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
    const profileDocRef = doc(db, PROFILES_COLLECTION, id);
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
    return dummyMarketplaceItems; // Return dummy data on error for development
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
      console.log(`No marketplace item found with ID: ${id}. Checking dummy data.`);
      return dummyMarketplaceItems.find(item => item.id === id) || null;
    }
  } catch (error) {
    console.error(`Error fetching marketplace item with ID ${id} from Firestore: `, error);
    throw error;
  }
}

export async function createMarketplaceItemInDB(itemData: Omit<MarketplaceItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<MarketplaceItem> {
  try {
    const itemsCol = collection(db, MARKETPLACE_COLLECTION);
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
      throw new Error("Failed to retrieve newly created marketplace item.");
    }
  } catch (error) {
    console.error("Error creating marketplace item in Firestore: ", error);
    throw error;
  }
}

export async function updateMarketplaceItemInDB(id: string, updates: Partial<Omit<MarketplaceItem, 'id' | 'createdAt'>>): Promise<MarketplaceItem | null> {
  try {
    const itemDocRef = doc(db, MARKETPLACE_COLLECTION, id);
    const docSnap = await getDoc(itemDocRef);
    if (!docSnap.exists()) { return null; }
    
    const updateData = { ...updates, updatedAt: Timestamp.now() };
    await updateDoc(itemDocRef, updateData);
    
    const updatedItemSnap = await getDoc(itemDocRef);
    if (updatedItemSnap.exists()) {
      const data = updatedItemSnap.data();
      return {
        id: updatedItemSnap.id, ...data,
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        updatedAt: (data.updatedAt as Timestamp).toDate().toISOString(),
      } as MarketplaceItem;
    }
    return null;
  } catch (error) {
    console.error(`Error updating marketplace item with ID ${id}: `, error);
    throw error;
  }
}

export async function deleteMarketplaceItemFromDB(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, MARKETPLACE_COLLECTION, id));
    return true;
  } catch (error) {
    console.error(`Error deleting marketplace item with ID ${id}: `, error);
    throw error; 
  }
}

// --- Forum Topic DB Operations ---
export async function getAllForumTopicsFromDB(): Promise<ForumTopic[]> {
  // Using dummy data for now
  return Promise.resolve(dummyForumTopics);
}

export async function getForumTopicByIdFromDB(id: string): Promise<ForumTopic | null> {
  // Using dummy data for now
  const topic = dummyForumTopics.find(topic => topic.id === id);
  return Promise.resolve(topic || null);
}

// --- Forum Post DB Operations ---
export async function getForumPostsByTopicIdFromDB(topicId: string): Promise<ForumPost[]> {
  // Using dummy data for now
  const posts = dummyForumPosts.filter(post => post.topicId === topicId);
  return Promise.resolve(posts || []);
}

// --- AgriEvent DB Operations ---
export async function getAllAgriEventsFromDB(): Promise<AgriEvent[]> {
  // Using dummy data for now
  return Promise.resolve(dummyAgriEvents);
}

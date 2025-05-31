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
import { dummyProfiles, dummyMarketplaceItems, dummyForumTopics, dummyForumPosts, dummyAgriEvents } from '@/lib/dummy-data';

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
    const profileList = profileSnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        // Ensure createdAt and updatedAt are properly handled if they are Firestore Timestamps
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      } as UserProfile;
    });
    return profileList;
  } catch (error) {
    console.error("Error fetching all profiles from Firestore: ", error);
    // Fallback to dummy data or throw error, depending on desired behavior
    // For now, returning empty array or you could throw the error
    return []; 
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
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
      } as UserProfile;
    } else {
      console.log(`No profile found with ID: ${id}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching profile with ID ${id} from Firestore: `, error);
    return null;
  }
}

// Placeholder - to be updated for Firestore
export async function createProfileInDB(profileData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
  console.warn("createProfileInDB is using placeholder logic. Update for Firestore.");
  // Example Firestore addDoc:
  // const profilesCol = collection(db, 'profiles');
  // const docRef = await addDoc(profilesCol, {
  //   ...profileData,
  //   createdAt: Timestamp.now(),
  //   updatedAt: Timestamp.now(),
  // });
  // return { id: docRef.id, ...profileData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  
  const newProfile: UserProfile = {
    id: `profile_${Date.now()}`,
    ...profileData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  dummyProfiles.push(newProfile); 
  return Promise.resolve(newProfile);
}

// Placeholder - to be updated for Firestore
export async function updateProfileInDB(id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  console.warn("updateProfileInDB is using placeholder logic. Update for Firestore.");
  // Example Firestore updateDoc:
  // const profileDocRef = doc(db, 'profiles', id);
  // await updateDoc(profileDocRef, { ...updates, updatedAt: Timestamp.now() });
  // const updatedProfile = await getProfileByIdFromDB(id); // Re-fetch to get merged data
  // return updatedProfile;

  const profileIndex = dummyProfiles.findIndex(p => p.id === id);
  if (profileIndex === -1) return null;
  dummyProfiles[profileIndex] = { ...dummyProfiles[profileIndex], ...updates, updatedAt: new Date().toISOString() };
  return Promise.resolve(dummyProfiles[profileIndex]);
}

// Placeholder - to be updated for Firestore
export async function deleteProfileFromDB(id: string): Promise<boolean> {
  console.warn("deleteProfileFromDB is using placeholder logic. Update for Firestore.");
  // Example Firestore deleteDoc:
  // const profileDocRef = doc(db, 'profiles', id);
  // await deleteDoc(profileDocRef);
  // return true; // (Add error handling)

  const initialLength = dummyProfiles.length;
  const indexToRemove = dummyProfiles.findIndex(p => p.id === id);
  if (indexToRemove > -1) {
    dummyProfiles.splice(indexToRemove, 1);
    return Promise.resolve(dummyProfiles.length < initialLength);
  }
  return Promise.resolve(false);
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

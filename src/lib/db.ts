// src/lib/db.ts

import { db } from './firebase'; // Assuming 'db' is the Firestore instance

import { VtiBatch, VtiEvent } from './vti'; // Import the VTI interfaces
import { generateUuid } from './uuid-utils'; // Import the UUID generator
// Placeholder type for basic user profile data
// A more detailed type would be in src/lib/types.ts
interface BasicUserProfileData {
  name: string;
  role: string; // Referencing the conceptual roles in src/lib/schemas.ts
  // Add other initial fields as needed, e.g., location, contactInfo
}

/**
 * Conceptual function to create a user profile document in Firestore.
 * This would be called after a user successfully registers via Firebase Auth.
 *
 * @param userId The Firebase Auth UID of the newly registered user.
 * @param userData Initial profile data including name and selected role.
 */
export const createUserProfile = async (userId: string, userData: BasicUserProfileData) => {
  console.log(`[Conceptual DB] Creating user profile for userId: ${userId}`);
  console.log(`[Conceptual DB] Initial data:`, userData);

  // --- Conceptual Firestore SDK Call ---
  // const userRef = db.collection('users').doc(userId);
  // await userRef.set({
  //   ...userData,
  //   createdAt: new Date().toISOString(), // Or use Firestore's server timestamp
  //   updatedAt: new Date().toISOString(),
  //   // Add other default fields like connections: [], ratings: {} etc.
  // });
  // console.log(`[Conceptual DB] Profile created successfully for userId: ${userId}`);
  // -------------------------------------

  // Placeholder for actual Firestore SDK call
  return Promise.resolve({ id: userId, ...userData, createdAt: new Date().toISOString() });
};

/**
 * Conceptual function to retrieve a user profile document from Firestore.
 *
 * @param userId The Firebase Auth UID of the user.
 * @returns A promise resolving to the user profile data or null if not found.
 */
export const getUserProfile = async (userId: string) => {
  console.log(`[Conceptual DB] Retrieving user profile for userId: ${userId}`);

  // --- Conceptual Firestore SDK Call ---
  // const userRef = db.collection('users').doc(userId);
  // const doc = await userRef.get();
  // if (doc.exists) {
  //   console.log(`[Conceptual DB] Profile found for userId: ${userId}`);
  //   return { id: doc.id, ...doc.data() as BasicUserProfileData }; // Cast to type
  // } else {
  //   console.log(`[Conceptual DB] No profile found for userId: ${userId}`);
  //   return null;
  // }
  // -------------------------------------

  // Placeholder for actual Firestore SDK call
  // Returns dummy data for illustration if needed, otherwise null
  // For now, let's return a conceptual profile
  const dummyProfiles = [
    { id: 'userA', name: 'Dr. Alima Bello', role: 'Researcher/Academic', createdAt: new Date().toISOString() },
    { id: 'farmerJoe', name: 'Joe\'s Family Farm', role: 'Farmer', createdAt: new Date().toISOString() },
    { id: 'currentUser', name: 'My AgriBusiness', role: 'Farmer', createdAt: new Date().toISOString() },
  ];
  const conceptualProfile = dummyProfiles.find(p => p.id === userId) || null;
  console.log(`[Conceptual DB] Conceptual profile result for ${userId}:`, conceptualProfile);
  return Promise.resolve(conceptualProfile as (BasicUserProfileData & { id: string, createdAt: string }) | null);
};

// Add other conceptual DB interaction functions here as needed,
// e.g., updateUserProfile, deleteUserProfile, getCollectionData, addDocument, etc.

const vtiBatchesCollection = db.collection('vtiBatches');
const vtiEventsCollection = db.collection('vtiEvents');

/**
 * Creates a new VTI batch in Firestore.
 * @param batchData - The initial data for the VTI batch.
 * @returns The created VTI batch object with its ID.
 */
export async function createVtiBatch(batchData: Omit<VtiBatch, 'id'>): Promise<VtiBatch> {
  const batchId = generateUuid();
  const newBatch: VtiBatch = { id: batchId, ...batchData };
  await vtiBatchesCollection.doc(batchId).set(newBatch);
  console.log(`[DB] Created VTI batch: ${batchId}`);
  return newBatch;
}

/**
 * Adds a new VTI event to a batch in Firestore.
 * @param eventData - The data for the VTI event.
 * @returns The created VTI event object with its ID.
 */
export async function addVtiEvent(eventData: Omit<VtiEvent, 'id'>): Promise<VtiEvent> {
  const eventId = generateUuid();
  const newEvent: VtiEvent = { id: eventId, ...eventData };
  await vtiEventsCollection.doc(eventId).set(newEvent);
  console.log(`[DB] Added VTI event: ${eventId} for batch: ${newEvent.vtiBatchId}`);
  // Optionally, update the VTI batch document to link the event ID
  // This would require adding an array of event IDs to the VtiBatch interface
  return newEvent;
}

/**
 * Retrieves a VTI batch by its ID from Firestore.
 * @param batchId - The ID of the VTI batch to retrieve.
 * @returns The VTI batch data, or undefined if not found.
 */
export async function getVtiBatch(batchId: string): Promise<VtiBatch | undefined> {
  console.log(`[DB] Retrieving VTI batch: ${batchId}`);
  const doc = await vtiBatchesCollection.doc(batchId).get();
  if (doc.exists) {
    console.log(`[DB] Found VTI batch: ${batchId}`);
    return doc.data() as VtiBatch;
  }
  console.log(`[DB] VTI batch not found: ${batchId}`);
  return undefined;
}

/**
 * Retrieves all VTI events for a given batch ID from Firestore.
 * @param batchId - The ID of the VTI batch to retrieve events for.
 * @returns An array of VTI events.
 */
export async function getVtiEventsForBatch(batchId: string): Promise<VtiEvent[]> {
  console.log(`[DB] Retrieving VTI events for batch: ${batchId}`);
  const snapshot = await vtiEventsCollection.where('vtiBatchId', '==', batchId).get();
  console.log(`[DB] Found ${snapshot.docs.length} events for batch: ${batchId}`);
  return snapshot.docs.map(doc => doc.data() as VtiEvent);
}
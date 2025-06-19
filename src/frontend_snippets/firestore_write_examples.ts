// src/frontend_snippets/firestore_write_examples.ts

import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { firebaseApp } from '../firebase/firebase'; // Assuming you have a firebase.ts file initializing your Firebase app

// Initialize Firestore
const db = getFirestore(firebaseApp);

// Example type definition for Farm data based on docs/damdoh_architecture.md
// Note: In a real application, you would likely define more robust interfaces/types.
interface FarmData {
  owner_id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  size: number;
  farm_type: string; // e.g., 'crop', 'livestock', 'mixed'
  irrigation_methods?: string[]; // Optional array
  // soil_test_results: Consider a map or subcollection structure as per schema
  // historical_yield_data: Consider a map or subcollection structure as per schema
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * Adds a new farm document to the 'farms' collection in Firestore.
 * Assumes farmData object matches the refined 'farms' schema structure
 * described in docs/damdoh_architecture.md.
 *
 * @param farmData - An object containing the farm details.
 * @returns A Promise that resolves with the DocumentReference of the newly created document,
 *          or rejects with an error.
 */
export const addFarm = async (farmData: Omit<FarmData, 'created_at' | 'updated_at'>) => {
  try {
    // Add timestamps before saving
    const farmDataWithTimestamps: FarmData = {
      ...farmData,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'farms'), farmDataWithTimestamps);
    console.log('Document written with ID: ', docRef.id);
    return docRef;
  } catch (e) {
    console.error('Error adding farm document: ', e);
    throw e; // Re-throw the error for handling in the calling code
  }
};

// Example type definition for Crop data based on docs/damdoh_architecture.md
// Note: In a real application, you would likely define more robust interfaces/types.
interface CropData {
  farm_id: string; // Reference to 'farms' collection ID
  crop_type: string;
  planting_date: Timestamp;
  harvest_date?: Timestamp; // Optional
  expected_yield?: number; // Optional
  actual_yield?: number; // Optional
  // pests_diseases_encountered: Consider a subcollection structure as per schema
  // fertilization_history: Consider a subcollection structure as per schema
}

/**
 * Adds a new crop document to the 'crops' collection in Firestore.
 * Assumes cropData object matches the refined 'crops' schema structure
 * described in docs/damdoh_architecture.md.
 *
 * @param cropData - An object containing the crop details.
 * @returns A Promise that resolves with the DocumentReference of the newly created document,
 *          or rejects with an error.
 */
export const addCrop = async (cropData: CropData) => {
  try {
    const docRef = await addDoc(collection(db, 'crops'), cropData);
    console.log('Document written with ID: ', docRef.id);
    return docRef;
  } catch (e) {
    console.error('Error adding crop document: ', e);
    throw e; // Re-throw the error for handling in the calling code
  }
};

// Example Usage (for demonstration purposes)
/*
// Assuming you have the necessary farm data
const myFarmData = {
    owner_id: 'user123', // Replace with actual user ID
    name: 'Green Acres',
    location: { latitude: 40.7128, longitude: -74.0060 },
    size: 100, // in acres or hectares
    farm_type: 'crop',
    irrigation_methods: ['drip'],
    // Add other optional fields as needed
};

addFarm(myFarmData)
  .then((docRef) => {
    console.log('Farm added successfully with ID:', docRef.id);

    // Once a farm is added, you can add crops to it
    const myCropData = {
        farm_id: docRef.id, // Use the newly created farm ID
        crop_type: 'Corn',
        planting_date: Timestamp.fromDate(new Date()), // Use Firebase Timestamp
        expected_yield: 50, // Expected bushels per acre/hectare
    };

    addCrop(myCropData)
      .then((cropDocRef) => {
        console.log('Crop added successfully with ID:', cropDocRef.id);
      })
      .catch((error) => {
        console.error('Failed to add crop:', error);
      });
  })
  .catch((error) => {
    console.error('Failed to add farm:', error);
  });
*/
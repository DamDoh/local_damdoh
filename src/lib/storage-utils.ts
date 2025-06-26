
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app as firebaseApp } from "./firebase/client"; // Use your client-side firebase app instance
import { v4 as uuidv4 } from 'uuid';

const storage = getStorage(firebaseApp);

/**
 * Uploads a file to Firebase Storage and returns its public download URL.
 *
 * @param file The file to upload.
 * @param path The path in Firebase Storage where the file should be stored (e.g., "observation-images").
 * @returns A promise that resolves with the public download URL of the uploaded file.
 */
export async function uploadFileAndGetURL(file: File, path: string): Promise<string> {
  if (!file) {
    throw new Error("No file provided for upload.");
  }

  // Create a unique filename to prevent overwrites
  const fileExtension = file.name.split('.').pop();
  const uniqueFileName = `${uuidv4()}.${fileExtension}`;
  const storageRef = ref(storage, `${path}/${uniqueFileName}`);

  try {
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the public download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    // It's good practice to throw a more specific error or handle it as needed
    throw new Error("File upload failed. Please try again.");
  }
}

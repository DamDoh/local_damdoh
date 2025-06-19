import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// Initialize Firebase (make sure this is done elsewhere in your app)
// const firebaseConfig = { ... };
// if (!firebase.apps.length) {
//   firebase.initializeApp(firebaseConfig);
// }

const auth = firebase.auth();
const db = firebase.firestore();

/**
 * Signs up a new user with email and password.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns A Promise that resolves with the user credential upon successful signup, or rejects with an error.
 */
export async function signUpWithEmailAndPassword(email: string, password: string): Promise<firebase.auth.UserCredential> {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    console.log('User signed up successfully:', userCredential.user?.uid);
    return userCredential;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error; // Re-throw the error for the calling code to handle
  }
}

/**
 * Signs in an existing user with email and password.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns A Promise that resolves with the user credential upon successful signin, or rejects with an error.
 */
export async function signInWithEmailAndPassword(email: string, password: string): Promise<firebase.auth.UserCredential> {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log('User signed in successfully:', userCredential.user?.uid);
    return userCredential;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error; // Re-throw the error for the calling code to handle
  }
}

/**
 * Creates a new user profile document in the 'users' Firestore collection.
 * This should typically be called after a user successfully signs up.
 * @param userUid - The User ID provided by Firebase Authentication.
 * @param email - The user's email address.
 * @param role - The assigned role for the user (e.g., 'farmer', 'buyer').
 * @returns A Promise that resolves when the document is successfully written, or rejects with an error.
 */
export async function createUserProfile(userUid: string, email: string, role: string): Promise<void> {
  try {
    await db.collection('users').doc(userUid).set({
      uid: userUid,
      email: email,
      role: role,
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      // Add other initial user profile fields here as needed
      name: '', // Example placeholder
      phone_number: '', // Example placeholder
      farm_id: '', // Example placeholder for farmer role
    });
    console.log('User profile created successfully for UID:', userUid);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error; // Re-throw the error for the calling code to handle
  }
}
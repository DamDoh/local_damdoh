
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { stakeholderProfileSchemas } from '../src/lib/stakeholder-profile-data';

// IMPORTANT: Replace with your actual Firebase project configuration.
const firebaseConfig = {
  apiKey: "AIzaSyDYrR4zOIgOynruKybSkc6Ys4vgYc9gPLM",
  authDomain: "damdoh.firebaseapp.com",
  projectId: "damdoh",
  storageBucket: "damdoh.firebasestorage.app",
  messagingSenderId: "1015729590190",
  appId: "1:1015729590190:web:e144ce027045694b56023f"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const functions = getFunctions(app);
// If you're using the Functions emulator, connect to it
// connectFunctionsEmulator(functions, "localhost", 5001);

const upsertStakeholderProfile = httpsCallable(functions, 'upsertStakeholderProfile');

const populateProfiles = async () => {
    for (const role in stakeholderProfileSchemas) {
        const email = `${role.toLowerCase().replace(/ /g, '_').replace(/\//g, '')}@damdoh.com`;
        const password = "password123";
        const displayName = `${role} User`;

        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log(`Created user ${displayName} with email ${email}`);

            // Sign in as the new user to get an auth token for the function call
            await signInWithEmailAndPassword(auth, email, password);

            // Create a sample profile data object
            const profileData = {
                location: "Global",
                profileSummary: `A sample profile for a ${role}.`,
                needs: ["Networking", "Information"],
            };

            // Upsert the stakeholder profile
            await upsertStakeholderProfile({ displayName, primaryRole: role, profileData });
            console.log(`Created profile for ${displayName}`);

        } catch (error) {
            console.error(`Failed to create user or profile for ${role}:`, error);
        }
    }
};

populateProfiles();
